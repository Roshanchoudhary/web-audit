import { siteConfig } from '../../config/site';
import { AuditError } from './errors';

/**
 * Fetch layer with a layered strategy:
 *   1. direct browser fetch (works for CORS-enabled origins)
 *   2. configured proxy template + configured fallbacks, in order
 *   3. a friendly AuditError — raw technical errors never reach the UI
 */

export interface FetchOutcome {
  text: string;
  status: number;
  finalUrl: string;
  redirected: boolean;
  viaProxy: boolean;
  durationMs: number;
}

const MAX_TEXT_BYTES = siteConfig.audit.maxHtmlBytes;

/** A hung proxy must not eat the whole audit budget — cap each hop. */
const PROXY_ATTEMPT_CAP_MS = 12_000;

/**
 * Extra request headers some proxies need. Jina Reader answers with Markdown
 * by default; audits must get the raw HTML (and plain text stays plain for
 * robots.txt). Its CORS preflight allows this header — verified manually.
 */
function headersFor(template: string): Record<string, string> | undefined {
  if (template.includes('r.jina.ai')) return { 'x-return-format': 'html' };
  return undefined;
}

/** Minimal HTML shape test — rejects Markdown/JSON error bodies from proxies. */
function looksLikeHtml(text: string): boolean {
  return /<(!doctype\s+html|html[\s>])/i.test(text);
}

function proxyTemplates(): string[] {
  const { proxyTemplate, proxyFallbacks } = siteConfig.audit;
  return [proxyTemplate, ...proxyFallbacks].filter(Boolean);
}

function buildProxyUrl(template: string, target: string): string {
  const encoded = encodeURIComponent(target);
  if (template.includes('{url}')) return template.replace('{url}', encoded);
  const joiner = template.includes('?') ? '&' : '?';
  return `${template}${joiner}url=${encoded}`;
}

function mapStatusToError(status: number): AuditError {
  if (status === 404) return new AuditError('not_found', `HTTP ${status}`, status);
  if (status === 401 || status === 403 || status === 429) {
    return new AuditError('blocked', `HTTP ${status}`, status);
  }
  return new AuditError('network', `HTTP ${status}`, status);
}

async function attempt(
  fetchUrl: string,
  pageUrl: string,
  viaProxy: boolean,
  deadline: number,
  externalSignal?: AbortSignal,
  extra: { headers?: Record<string, string>; expectHtml?: boolean } = {},
): Promise<FetchOutcome> {
  const attemptDeadline = viaProxy
    ? Math.min(deadline, Date.now() + PROXY_ATTEMPT_CAP_MS)
    : deadline;
  const remaining = attemptDeadline - Date.now();
  if (remaining <= 500) throw new AuditError('timeout');

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), remaining);
  const onExternalAbort = () => controller.abort();
  externalSignal?.addEventListener('abort', onExternalAbort);

  try {
    const started = performance.now();
    const response = await fetch(fetchUrl, {
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        accept: 'text/html,application/xhtml+xml,text/plain,*/*;q=0.8',
        ...extra.headers,
      },
    });
    const durationMs = performance.now() - started;
    // Through a proxy the browser only sees the proxy's own final URL, so
    // redirect detection and base-URL resolution must keep the requested URL.
    const finalUrl = viaProxy ? pageUrl : response.url || pageUrl;

    if (!response.ok) throw mapStatusToError(response.status);

    const contentLength = Number(response.headers.get('content-length') ?? '0');
    if (contentLength > MAX_TEXT_BYTES) throw new AuditError('too_large');

    const text = await response.text();
    if (text.length > MAX_TEXT_BYTES) throw new AuditError('too_large');
    if (extra.expectHtml && !looksLikeHtml(text)) {
      // A proxy answered, but with Markdown/JSON instead of the page — treat
      // it as a failed hop so the next fallback gets a chance.
      throw new AuditError('network', 'non-HTML response');
    }

    return {
      text,
      status: response.status,
      finalUrl,
      redirected: finalUrl !== pageUrl,
      viaProxy,
      durationMs,
    };
  } catch (error) {
    if (error instanceof AuditError) throw error;
    if (controller.signal.aborted) {
      throw new AuditError(
        externalSignal?.aborted ? 'unknown' : 'timeout',
        'request aborted or timed out',
      );
    }
    // TypeError("Failed to fetch") — CORS rejection or network failure.
    throw new AuditError(viaProxy ? 'network' : 'cors', 'fetch failed');
  } finally {
    clearTimeout(timer);
    externalSignal?.removeEventListener('abort', onExternalAbort);
  }
}

/**
 * Fetch a URL: direct first, then every configured proxy. Throws AuditError.
 * `budgetMs` bounds the total time across all candidates.
 */
export async function fetchDocument(
  target: string,
  options: { signal?: AbortSignal; budgetMs?: number; expectHtml?: boolean } = {},
): Promise<FetchOutcome> {
  const budget = options.budgetMs ?? siteConfig.audit.timeoutMs * 2;
  const deadline = Date.now() + budget;
  let lastError: AuditError | null = null;

  const candidates: Array<{ url: string; proxy: boolean; headers?: Record<string, string> }> = [
    { url: target, proxy: false },
    ...proxyTemplates().map((template) => ({
      url: buildProxyUrl(template, target),
      proxy: true,
      headers: headersFor(template),
    })),
  ];

  for (const candidate of candidates) {
    try {
      return await attempt(candidate.url, target, candidate.proxy, deadline, options.signal, {
        headers: candidate.headers,
        expectHtml: options.expectHtml,
      });
    } catch (error) {
      lastError = error instanceof AuditError ? error : new AuditError('unknown');
      if (options.signal?.aborted) break;
      // not_found is a real answer — stop trying proxies for missing files.
      if (lastError.code === 'not_found') break;
    }
  }

  throw lastError ?? new AuditError('unknown');
}
