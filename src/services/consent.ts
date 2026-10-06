import type { ConsentPreferences } from '../types';

/**
 * Lightweight consent store (Accept / Reject / Manage preferences).
 * Nothing is blocked while consent is undecided — the audit tool always works;
 * only analytics and ad scripts wait for an explicit choice.
 */
const STORAGE_KEY = 'wap.consent.v1';

export function readConsent(): ConsentPreferences | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ConsentPreferences;
    if (typeof parsed.analytics !== 'boolean' || typeof parsed.ads !== 'boolean') return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeConsent(input: { analytics: boolean; ads: boolean }): ConsentPreferences {
  const prefs: ConsentPreferences = {
    necessary: true,
    analytics: input.analytics,
    ads: input.ads,
    updatedAt: new Date().toISOString(),
  };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    /* storage unavailable — treat as session-only */
  }
  return prefs;
}

export function hasStoredConsent(): boolean {
  return readConsent() !== null;
}
