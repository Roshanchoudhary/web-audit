import type { AuditReport, ReportStore } from '../../types';

/**
 * Persistence abstraction.
 *
 * The static version stores reports in localStorage (same-device share links,
 * previous-score deltas, report history). Swap this class for an API-backed
 * implementation without touching the UI — see README “Report persistence”.
 */
const STORAGE_KEY = 'wap.reports.v1';
const MAX_REPORTS = 12;

export class LocalStorageReportStore implements ReportStore {
  private readAll(): AuditReport[] {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed: unknown = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.filter(
        (item): item is AuditReport =>
          typeof item === 'object' && item !== null && typeof (item as AuditReport).id === 'string',
      );
    } catch {
      return [];
    }
  }

  private writeAll(reports: AuditReport[]): void {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(reports.slice(0, MAX_REPORTS)));
    } catch {
      /* quota exceeded — reports simply stop persisting, UI still works */
    }
  }

  async save(report: AuditReport): Promise<void> {
    const existing = this.readAll();
    // Keep only the newest report per URL to stay inside the storage budget.
    const others = existing.filter((r) => r.id !== report.id && r.url !== report.url);
    this.writeAll([report, ...others]);
  }

  async get(id: string): Promise<AuditReport | null> {
    return this.readAll().find((r) => r.id === id) ?? null;
  }

  async findLatestForUrl(url: string, excludeId?: string): Promise<AuditReport | null> {
    return this.readAll().find((r) => r.url === url && r.id !== excludeId) ?? null;
  }

  async list(limit = MAX_REPORTS): Promise<AuditReport[]> {
    return this.readAll().slice(0, limit);
  }

  async clear(): Promise<void> {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }
}

export const reportStore: ReportStore = new LocalStorageReportStore();
