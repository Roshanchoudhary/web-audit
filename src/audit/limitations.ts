import type { AuditIssue } from '../types';

/**
 * Limitations of a browser-only audit run. Every id maps to an i18n string in
 * `report.limitations.items.*` and is printed in the report so readers always
 * know what was NOT measured.
 */
const LIMITATION_BY_CHECK: Record<string, string> = {
  'sec.hsts': 'report.limitations.items.security_headers',
  'sec.x_content_type': 'report.limitations.items.security_headers',
  'sec.permissions_policy': 'report.limitations.items.security_headers',
  'sec.csp': 'report.limitations.items.security_headers',
  'sec.referrer_policy': 'report.limitations.items.security_headers',
  'perf.core_web_vitals': 'report.limitations.items.core_web_vitals',
  'perf.page_timing': 'report.limitations.items.page_timing',
  'perf.caching': 'report.limitations.items.caching',
  'perf.compression': 'report.limitations.items.caching',
  'a11y.contrast': 'report.limitations.items.contrast',
  'tech.https_redirect': 'report.limitations.items.server',
  'tech.x_robots_tag': 'report.limitations.items.server',
  'tech.robots_txt': 'report.limitations.items.crawling',
  'tech.sitemap': 'report.limitations.items.crawling',
  'tech.hreflang': 'report.limitations.items.crawling',
  'tech.pagination': 'report.limitations.items.crawling',
};

export function collectLimitations(issues: AuditIssue[]): string[] {
  const set = new Set<string>([
    'report.limitations.items.crawling',
    'report.limitations.items.backlinks',
  ]);
  for (const item of issues) {
    if (item.status === 'not_available') {
      const key = LIMITATION_BY_CHECK[item.checkId];
      if (key) set.add(key);
    }
  }
  return Array.from(set);
}
