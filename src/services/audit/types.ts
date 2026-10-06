/** Result of fetching the audited page's HTML. */
export interface PageFetchResult {
  requestedUrl: string;
  finalUrl: string;
  html: string;
  status: number | null;
  durationMs: number;
  redirected: boolean;
  viaProxy: boolean;
}

/** Result of fetching a small auxiliary text resource (robots, sitemap…). */
export interface TextFetchResult {
  ok: boolean;
  text: string | null;
  status: number | null;
  finalUrl: string | null;
  viaProxy: boolean;
}

/**
 * Adapter contract of the audit engine.
 *
 * Implementations:
 *  - BrowserAuditProvider  (default) fetches from the visitor's browser
 *  - ApiAuditProvider      (optional) talks to a future server-side API and
 *                          transparently falls back to the browser provider
 *
 * New integrations (PageSpeed, Lighthouse, security-header APIs, DNS/WHOIS,
 * backlink indexes…) should implement this interface or wrap it.
 */
export interface AuditProvider {
  readonly id: string;
  /** Reported in `report.engine.mode`; may change after an API fallback. */
  mode: 'browser' | 'api';
  readonly label: string;
  /** Full HTML of the audited page (throws AuditError on failure). */
  fetchPage(url: string, signal?: AbortSignal): Promise<PageFetchResult>;
  /** Small text resource; never throws for 4xx/5xx, only for network failure. */
  fetchText(url: string, signal?: AbortSignal): Promise<TextFetchResult>;
}
