import type { AuditIssue } from '../../types';
import type { AuditFacts } from '../facts';
import { issue, na } from './helpers';

export function evaluateTechnical(f: AuditFacts): AuditIssue[] {
  const out: AuditIssue[] = [];

  /* robots.txt */
  const robots = f.robots;
  if (!robots || robots.status === null) {
    out.push(na('tech.robots_txt', 'robots.txt could not be fetched from this browser'));
  } else if (robots.ok) {
    const body = (robots.text ?? '').toLowerCase();
    const blocksAll = /user-agent:\s*\*[\s\S]*?disallow:\s*\/\s*(\n|$)/.test(body);
    if (blocksAll) {
      out.push(
        issue('tech.robots_txt', 'fail', {
          value: robots.text?.length ?? 0,
          evidence: 'robots.txt disallows all crawlers for User-agent: *',
        }),
      );
    } else {
      out.push(
        issue('tech.robots_txt', 'pass', {
          value: robots.text?.length ?? 0,
          evidence: `200 OK — ${robots.text?.length ?? 0} bytes`,
        }),
      );
    }
  } else if (robots.status === 404) {
    out.push(
      issue('tech.robots_txt', 'warning', {
        value: 404,
        evidence: '404 — no robots.txt at origin root',
      }),
    );
  } else {
    out.push(na('tech.robots_txt', `HTTP ${robots.status}`));
  }

  /* sitemap */
  const sitemap = f.sitemap;
  if (sitemap && sitemap.ok) {
    out.push(
      issue('tech.sitemap', 'pass', {
        value: sitemap.text?.length ?? 0,
        evidence: `${sitemap.finalUrl ?? 'sitemap'} — 200 OK`,
      }),
    );
  } else if (sitemap && sitemap.status === 404) {
    out.push(
      issue('tech.sitemap', 'warning', {
        value: 404,
        evidence: '404 — no sitemap found or declared',
      }),
    );
  } else {
    out.push(na('tech.sitemap', 'sitemap could not be fetched from this browser'));
  }

  /* redirects */
  if (!f.redirected) {
    out.push(issue('tech.redirects', 'pass', { evidence: 'final URL matches the requested URL' }));
  } else {
    const measurement = f.viaProxy ? 'estimated' : 'measured';
    let canonicalUpgrade = false;
    try {
      const a = new URL(f.requestedUrl);
      const b = new URL(f.finalUrl);
      canonicalUpgrade =
        a.protocol === 'http:' &&
        b.protocol === 'https:' &&
        a.host === b.host &&
        a.pathname.replace(/\/$/, '') === b.pathname.replace(/\/$/, '');
    } catch {
      canonicalUpgrade = false;
    }
    if (canonicalUpgrade) {
      out.push(
        issue('tech.redirects', 'pass', {
          evidence: 'http → https upgrade (expected canonical redirect)',
          measurement,
        }),
      );
    } else {
      out.push(
        issue('tech.redirects', 'warning', {
          evidence: `${f.requestedUrl} → ${f.finalUrl}`,
          measurement,
        }),
      );
    }
  }

  /* URL structure */
  const urlIssues: string[] = [];
  if (f.url.length > 100) urlIssues.push(`long URL (${f.url.length} chars)`);
  if (f.url.params > 3) urlIssues.push(`${f.url.params} query parameters`);
  if (f.url.hasUnderscores) urlIssues.push('underscores in path');
  if (f.url.hasUppercasePath) urlIssues.push('uppercase characters in path');
  if (f.url.hasHashbang) urlIssues.push('hashbang in URL');
  if (urlIssues.length === 0) {
    out.push(
      issue('tech.url_structure', 'pass', {
        evidence: `${f.url.length} chars, ${f.url.params} params`,
      }),
    );
  } else if (urlIssues.length <= 2) {
    out.push(issue('tech.url_structure', 'warning', { evidence: urlIssues.join(', ') }));
  } else {
    out.push(issue('tech.url_structure', 'fail', { evidence: urlIssues.join(', ') }));
  }

  /* HTTP→HTTPS redirect needs a second request to the http:// origin */
  out.push(na('tech.https_redirect', 'requires a separate http:// request', 'requires_api'));

  /* hreflang */
  if (f.head.hreflangCount === 0) {
    out.push(
      na('tech.hreflang', 'no hreflang annotations — alternates not declared for this page'),
    );
  } else if (f.head.hreflangSelf) {
    out.push(
      issue('tech.hreflang', 'pass', {
        value: f.head.hreflangCount,
        evidence: `${f.head.hreflangCount} alternates with self/x-default reference`,
      }),
    );
  } else {
    out.push(
      issue('tech.hreflang', 'warning', {
        value: f.head.hreflangCount,
        evidence: `${f.head.hreflangCount} alternates but no self-reference or x-default`,
      }),
    );
  }

  /* favicon */
  const favicon = f.favicon;
  if (favicon && favicon.ok) {
    out.push(
      issue('tech.favicon', 'pass', {
        evidence: `${favicon.finalUrl ?? '/favicon.ico'} — 200 OK`,
      }),
    );
  } else if (f.head.iconHref) {
    out.push(
      issue('tech.favicon', 'pass', {
        value: f.head.iconHref,
        evidence: `link icon declared: ${f.head.iconHref}`,
      }),
    );
  } else if (favicon && favicon.status === 404) {
    out.push(
      issue('tech.favicon', 'warning', {
        value: 404,
        evidence: 'no icon link and /favicon.ico returned 404',
      }),
    );
  } else {
    out.push(na('tech.favicon', 'favicon could not be verified'));
  }

  /* charset */
  if (f.head.charset && /utf-?8/i.test(f.head.charset)) {
    out.push(issue('tech.charset', 'pass', { value: f.head.charset, evidence: f.head.charset }));
  } else if (f.head.charset) {
    out.push(issue('tech.charset', 'warning', { value: f.head.charset, evidence: f.head.charset }));
  } else {
    out.push(
      issue('tech.charset', 'fail', {
        evidence: 'no <meta charset> found in the first 2 KB of the head',
      }),
    );
  }

  /* pagination */
  if (f.paginationLinks > 0) {
    out.push(
      issue('tech.pagination', 'pass', {
        value: f.paginationLinks,
        evidence: `${f.paginationLinks} rel="next/prev" links`,
      }),
    );
  } else {
    out.push(na('tech.pagination', 'no rel=next/prev indicators — page appears standalone'));
  }

  /* HTML size */
  const kb = Math.round(f.htmlBytes / 1024);
  const sizeStatus = kb <= 150 ? 'pass' : kb <= 300 ? 'warning' : 'fail';
  out.push(issue('tech.html_size', sizeStatus, { value: kb, evidence: `${kb} KB of HTML` }));

  /* X-Robots-Tag is header-only */
  out.push(na('tech.x_robots_tag', 'X-Robots-Tag is a response header', 'requires_api'));

  return out;
}
