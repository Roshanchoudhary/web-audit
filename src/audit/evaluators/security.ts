import type { AuditIssue } from '../../types';
import type { AuditFacts } from '../facts';
import { issue, na } from './helpers';

const STRONG_REFERRER_POLICIES = new Set([
  'no-referrer',
  'same-origin',
  'strict-origin',
  'strict-origin-when-cross-origin',
  'origin',
  'origin-when-cross-origin',
]);

const WEAK_REFERRER_POLICIES = new Set([
  'no-referrer-when-downgrade',
  'unsafe-url',
]);

/** Parse the observable meta CSP without claiming to validate an HTTP header. */
function assessMetaCsp(policy: string): { status: 'pass' | 'warning'; evidence: string } {
  const directives = new Map<string, string[]>();
  for (const part of policy.split(';')) {
    const tokens = part.trim().toLowerCase().split(/\s+/).filter(Boolean);
    if (tokens.length > 0 && !directives.has(tokens[0])) {
      directives.set(tokens[0], tokens.slice(1));
    }
  }

  const problems: string[] = [];
  if (!directives.has('default-src') && !directives.has('script-src')) {
    problems.push('missing default-src/script-src');
  }
  if (!directives.has('object-src') || !directives.get('object-src')?.includes("'none'")) {
    problems.push("object-src is not 'none'");
  }
  if (!directives.has('base-uri')) problems.push('missing base-uri');
  for (const directive of ['script-src', 'style-src', 'default-src']) {
    const values = directives.get(directive) ?? [];
    if (values.includes("'unsafe-inline'")) problems.push(`${directive} allows unsafe-inline`);
    if (values.includes("'unsafe-eval'")) problems.push(`${directive} allows unsafe-eval`);
  }

  if (problems.length > 0) {
    return {
      status: 'warning',
      evidence: `CSP meta tag found, but review is recommended: ${problems.join('; ')}. This checks only the visible meta policy, not response headers or the full deployment.`,
    };
  }
  return {
    status: 'pass',
    evidence:
      'Visible CSP meta policy includes baseline directives without unsafe-inline/unsafe-eval. HTTP response headers and full enforcement were not verified.',
  };
}

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

  /* CSP: browser audit can inspect meta policy, but cannot observe response headers. */
  if (f.head.csp !== null) {
    const assessment = assessMetaCsp(f.head.csp);
    out.push(
      issue('sec.csp', assessment.status, {
        value: f.head.csp.length,
        evidence: assessment.evidence,
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

  /* Referrer policy: distinguish recognized safe policies from weak or invalid values. */
  if (f.head.referrerPolicy) {
    const policy = f.head.referrerPolicy.trim().toLowerCase();
    const status = STRONG_REFERRER_POLICIES.has(policy)
      ? 'pass'
      : WEAK_REFERRER_POLICIES.has(policy)
        ? 'warning'
        : 'fail';
    const explanation = WEAK_REFERRER_POLICIES.has(policy)
      ? 'recognized policy may disclose more referrer information than necessary'
      : STRONG_REFERRER_POLICIES.has(policy)
        ? 'recognized referrer policy'
        : 'unrecognized referrer policy value';
    out.push(
      issue('sec.referrer_policy', status, {
        value: f.head.referrerPolicy,
        evidence: `meta referrer = ${f.head.referrerPolicy}; ${explanation}. HTTP response headers are not observable cross-origin.`,
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
