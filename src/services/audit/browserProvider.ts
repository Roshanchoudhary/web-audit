import { AuditError } from './errors';
import { fetchDocument } from './http';
import type { AuditProvider, PageFetchResult, TextFetchResult } from './types';

/**
 * Default provider: everything runs in the visitor's browser.
 * Direct fetch first, then the configured read-only proxy fallbacks.
 */
export class BrowserAuditProvider implements AuditProvider {
  readonly id = 'browser';
  readonly label = 'Browser audit engine';
  mode: 'browser' | 'api' = 'browser';

  async fetchPage(url: string, signal?: AbortSignal): Promise<PageFetchResult> {
    const outcome = await fetchDocument(url, { signal, expectHtml: true });
    return {
      requestedUrl: url,
      finalUrl: outcome.finalUrl,
      html: outcome.text,
      status: outcome.status,
      durationMs: outcome.durationMs,
      redirected: outcome.redirected,
      viaProxy: outcome.viaProxy,
    };
  }

  async fetchText(url: string, signal?: AbortSignal): Promise<TextFetchResult> {
    try {
      const outcome = await fetchDocument(url, { signal, budgetMs: 12000 });
      return {
        ok: outcome.status >= 200 && outcome.status < 300,
        text: outcome.text,
        status: outcome.status,
        finalUrl: outcome.finalUrl,
        viaProxy: outcome.viaProxy,
      };
    } catch (error) {
      // Missing/blocked files are real answers; network failures are not.
      if (error instanceof AuditError && error.status !== null) {
        return {
          ok: false,
          text: null,
          status: error.status,
          finalUrl: url,
          viaProxy: false,
        };
      }
      throw error;
    }
  }
}

export const browserAuditProvider = new BrowserAuditProvider();
