import { siteConfig } from '../../config/site';
import { ApiAuditProvider } from './apiProvider';
import { browserAuditProvider } from './browserProvider';
import type { AuditProvider } from './types';

export type { AuditProvider, PageFetchResult, TextFetchResult } from './types';
export { AuditError, auditErrorKey, isAuditError } from './errors';
export { BrowserAuditProvider, browserAuditProvider } from './browserProvider';
export { ApiAuditProvider } from './apiProvider';

/**
 * Resolve the provider for this deployment:
 *  - VITE_AUDIT_API_URL configured → API adapter (falls back to browser)
 *  - otherwise → pure browser engine
 */
export function createAuditProvider(): AuditProvider {
  const apiUrl = siteConfig.audit.apiUrl;
  if (siteConfig.features.apiAudit && apiUrl) {
    return new ApiAuditProvider(apiUrl, browserAuditProvider);
  }
  return browserAuditProvider;
}
