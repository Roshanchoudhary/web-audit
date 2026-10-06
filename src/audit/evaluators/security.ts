import type { AuditIssue } from '../../types';
import type { AuditFacts } from '../facts';
import { issue, na } from './helpers';

export function evaluateSecurity(f: AuditFacts): AuditIssue[] {
  const out: AuditIssue[] = [];

  /* HTTPS */
  if (f.security.https) {
    out.push(issue('sec.https', 'pass', { evidence: f.finalUrl }));
  } else {
    out.push(issue('sec.https', 'fail', { evidence: `insecure origin: ${f.finalUrl}` }));
  }

  /* mixed content */
  if (!f.security.https) {
    out.push(na('sec.mixed_content', 'mixed content only applies to HTTPS pages'));
  } else if (f.security.insecureSubresources === 0) {
    out.push(
      issue('sec.mixed_content', 'pass', { value: 0, evidence: 'no http:// subresources found' }),
    );
  } else {
    out.push(
      issue('sec.mixed_content', 'fail', {
        value: f.security.insecureSubresources,
        evidence: `${f.security.insecureSubresources} insecure subresource(s): ${f.security.insecureSample.join(', ')}`,
      }),
    );
  }

  /* CSP: only the <meta> form is observable from the browser. */
  if (f.head.csp !== null) {
    out.push(
      issue('sec.csp', 'pass', {
        value: f.head.csp.length,
        evidence: `Content-Security-Policy meta tag (${f.head.csp.length} chars)`,
      }),
    );
  } else {
    out.push(
      na('sec.csp', 'no CSP meta tag; HTTP header not observable cross-origin', 'requires_api'),
    );
  }

  /* Header-only checks — reported as unverified, never guessed. */
  out.push(na('sec.hsts', 'Strict-Transport-Security is a response header', 'requires_api'));
  out.push(na('sec.x_content_type', 'X-Content-Type-Options is a response header', 'requires_api'));

  /* referrer policy: meta observable, header not */
  if (f.head.referrerPolicy) {
    out.push(
      issue('sec.referrer_policy', 'pass', {
        value: f.head.referrerPolicy,
        evidence: `meta referrer = ${f.head.referrerPolicy}`,
      }),
    );
  } else {
    out.push(
      na(
        'sec.referrer_policy',
        'no referrer meta tag; header value not observable cross-origin',
        'requires_api',
      ),
    );
  }

  out.push(na('sec.permissions_policy', 'Permissions-Policy is a response header', 'requires_api'));

  /* form actions */
  if (!f.security.https) {
    out.push(na('sec.form_action', 'page is not served over HTTPS'));
  } else if (f.security.insecureFormActions === 0) {
    out.push(issue('sec.form_action', 'pass', { value: 0, evidence: 'no insecure form actions' }));
  } else {
    out.push(
      issue('sec.form_action', 'fail', {
        value: f.security.insecureFormActions,
        evidence: `${f.security.insecureFormActions} form(s) submit over http://`,
      }),
    );
  }

  return out;
}
