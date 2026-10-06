import { AuditError } from './errors';
import type { AuditProvider, PageFetchResult, TextFetchResult } from './types';

interface ApiPageResponse {
  html: string;
  finalUrl?: string;
  status?: number;
}

interface ApiTextResponse {
  text: string;
  status?: number;
  finalUrl?: string;
}

/**
 * Optional server-side audit API adapter.
 *
 * Expected contract (see README “Configuring future audit APIs”):
 *   GET {baseUrl}/page?url=<encoded>
 *     -> { html: string, finalUrl?: string, status?: number }
 *   GET {baseUrl}/text?url=<encoded>
 *     -> { text: string, status?: number, finalUrl?: string }
 *
 * Any API failure transparently falls back to the browser provider, so the
 * product keeps working while a backend is being built.
 */
export class ApiAuditProvider implements AuditProvider {
  readonly id = 'api';
  readonly label = 'API audit engine';
  mode: 'browser' | 'api' = 'api';

  constructor(
    private readonly baseUrl: string,
    private readonly fallback: AuditProvider,
  ) {}

  private endpoint(path: string, url: string): string {
    return `${this.baseUrl.replace(/\/$/, '')}${path}?url=${encodeURIComponent(url)}`;
  }

  private async getJson<T>(endpoint: string, signal?: AbortSignal): Promise<T> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20000);
    const onAbort = () => controller.abort();
    signal?.addEventListener('abort', onAbort);
    try {
      const response = await fetch(endpoint, { signal: controller.signal });
      if (!response.ok) throw new AuditError('api_failed', `HTTP ${response.status}`);
      return (await response.json()) as T;
    } finally {
      clearTimeout(timer);
      signal?.removeEventListener('abort', onAbort);
    }
  }

  async fetchPage(url: string, signal?: AbortSignal): Promise<PageFetchResult> {
    try {
      const started = performance.now();
      const data = await this.getJson<ApiPageResponse>(this.endpoint('/page', url), signal);
      if (typeof data.html !== 'string' || !data.html.trim()) {
        throw new AuditError('api_failed', 'API returned an empty document');
      }
      const finalUrl = data.finalUrl ?? url;
      this.mode = 'api';
      return {
        requestedUrl: url,
        finalUrl,
        html: data.html,
        status: data.status ?? null,
        durationMs: performance.now() - started,
        redirected: finalUrl !== url,
        viaProxy: false,
      };
    } catch (error) {
      if (signal?.aborted) throw new AuditError('unknown', 'aborted');
      if (error instanceof AuditError && error.code === 'unknown') throw error;
      this.mode = 'browser';
      return this.fallback.fetchPage(url, signal);
    }
  }

  async fetchText(url: string, signal?: AbortSignal): Promise<TextFetchResult> {
    try {
      const data = await this.getJson<ApiTextResponse>(this.endpoint('/text', url), signal);
      const status = data.status ?? 200;
      return {
        ok: status >= 200 && status < 300,
        text: data.text ?? null,
        status,
        finalUrl: data.finalUrl ?? url,
        viaProxy: false,
      };
    } catch (_error) {
      if (signal?.aborted) throw new AuditError('unknown', 'aborted');
      this.mode = 'browser';
      return this.fallback.fetchText(url, signal);
    }
  }
}
