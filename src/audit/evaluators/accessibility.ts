import type { AuditIssue } from '../../types';
import type { AuditFacts } from '../facts';
import { issue, na } from './helpers';

function zoomAllowed(viewport: string | null): boolean | null {
  if (!viewport) return null;
  if (/user-scalable\s*=\s*(no|0)/i.test(viewport)) return false;
  const max = viewport.match(/maximum-scale\s*=\s*([0-9.]+)/i);
  if (max && Number(max[1]) < 2) return false;
  return true;
}

export function evaluateAccessibility(f: AuditFacts): AuditIssue[] {
  const out: AuditIssue[] = [];

  /* images */
  if (f.images.total === 0) {
    out.push(issue('a11y.images_alt', 'pass', { value: 0, evidence: '0 images on page' }));
  } else if (f.images.missingAlt > 0) {
    out.push(
      issue('a11y.images_alt', 'fail', {
        value: f.images.missingAlt,
        evidence: `${f.images.missingAlt} of ${f.images.total} images have no alt attribute`,
      }),
    );
  } else if (f.images.emptyAlt === f.images.total && f.images.total > 2) {
    out.push(
      issue('a11y.images_alt', 'warning', {
        value: 0,
        evidence: `all ${f.images.total} images use empty alt — verify each is decorative`,
      }),
    );
  } else {
    out.push(
      issue('a11y.images_alt', 'pass', {
        value: 0,
        evidence: `${f.images.total} images, all with alt (${f.images.emptyAlt} intentionally empty)`,
      }),
    );
  }

  /* forms */
  if (f.forms.total === 0) {
    out.push(na('a11y.form_labels', 'page has no form controls'));
  } else if (f.forms.labelled === f.forms.total) {
    out.push(
      issue('a11y.form_labels', 'pass', {
        value: 0,
        evidence: `${f.forms.total} controls, all labelled`,
      }),
    );
  } else {
    const missing = f.forms.total - f.forms.labelled;
    out.push(
      issue('a11y.form_labels', 'fail', {
        value: missing,
        evidence: `${missing} of ${f.forms.total} controls without label: ${f.forms.unlabeledSample.join(', ')}`,
      }),
    );
  }

  /* buttons */
  if (f.forms.buttons === 0) {
    out.push(na('a11y.buttons', 'page has no buttons or role="button" elements'));
  } else if (f.forms.unnamedButtons === 0) {
    out.push(
      issue('a11y.buttons', 'pass', {
        value: 0,
        evidence: `${f.forms.buttons} buttons, all named`,
      }),
    );
  } else {
    out.push(
      issue('a11y.buttons', 'fail', {
        value: f.forms.unnamedButtons,
        evidence: `${f.forms.unnamedButtons} of ${f.forms.buttons} buttons without accessible name`,
      }),
    );
  }

  /* links */
  if (f.links.total === 0) {
    out.push(na('a11y.links', 'page has no links'));
  } else if (f.links.emptyName === 0) {
    out.push(
      issue('a11y.links', 'pass', { value: 0, evidence: `${f.links.total} links, all named` }),
    );
  } else {
    out.push(
      issue('a11y.links', 'fail', {
        value: f.links.emptyName,
        evidence: `${f.links.emptyName} of ${f.links.total} links without discernible text`,
      }),
    );
  }

  /* heading order */
  if (f.headings.total === 0) {
    out.push(issue('a11y.heading_order', 'fail', { value: 0, evidence: 'no headings found' }));
  } else if (f.headings.orderViolations > 0) {
    out.push(
      issue('a11y.heading_order', 'warning', {
        value: f.headings.orderViolations,
        evidence: `${f.headings.orderViolations} level skip(s): ${f.headings.sequence.join(' → ').slice(0, 80)}`,
      }),
    );
  } else {
    out.push(
      issue('a11y.heading_order', 'pass', {
        value: 0,
        evidence: `${f.headings.total} headings in valid order`,
      }),
    );
  }

  /* language */
  if (f.head.lang) {
    out.push(issue('a11y.lang', 'pass', { value: f.head.lang, evidence: `lang="${f.head.lang}"` }));
  } else {
    out.push(issue('a11y.lang', 'fail', { evidence: 'no lang attribute on <html>' }));
  }

  /* zoom */
  const canZoom = zoomAllowed(f.head.viewport);
  if (canZoom === null) {
    out.push(
      issue('a11y.viewport', 'warning', {
        evidence: 'no viewport meta — mobile zoom behaviour undefined',
      }),
    );
  } else if (canZoom) {
    out.push(issue('a11y.viewport', 'pass', { evidence: f.head.viewport ?? '' }));
  } else {
    out.push(issue('a11y.viewport', 'fail', { evidence: f.head.viewport ?? '' }));
  }

  /* contrast needs rendered styles — honestly unavailable */
  out.push(
    na('a11y.contrast', 'contrast requires computed styles from the rendered page', 'requires_api'),
  );

  /* landmarks */
  if (f.semantic.main) {
    out.push(issue('a11y.landmarks', 'pass', { evidence: 'main landmark present' }));
  } else {
    out.push(issue('a11y.landmarks', 'fail', { evidence: 'no <main> / role="main" landmark' }));
  }

  /* skip link */
  if (f.semantic.skipLink) {
    out.push(issue('a11y.skip_link', 'pass', { evidence: 'skip link found' }));
  } else {
    out.push(issue('a11y.skip_link', 'warning', { evidence: 'no skip-to-content link found' }));
  }

  /* aria references */
  if (f.aria.idRefIssues === 0 && f.aria.ariaHiddenFocusable === 0) {
    out.push(
      issue('a11y.aria', 'pass', { value: 0, evidence: 'no broken ARIA references detected' }),
    );
  } else {
    out.push(
      issue('a11y.aria', 'fail', {
        value: f.aria.idRefIssues + f.aria.ariaHiddenFocusable,
        evidence: [
          f.aria.idRefIssues > 0
            ? `${f.aria.idRefIssues} broken idref(s): ${f.aria.idRefSample.join(', ')}`
            : '',
          f.aria.ariaHiddenFocusable > 0
            ? `${f.aria.ariaHiddenFocusable} aria-hidden region(s) contain focusable elements`
            : '',
        ]
          .filter(Boolean)
          .join(' · '),
      }),
    );
  }

  /* keyboard blockers */
  const keyboardIssues = f.semantic.positiveTabindex + f.links.javascript;
  if (keyboardIssues === 0) {
    out.push(
      issue('a11y.keyboard_patterns', 'pass', {
        value: 0,
        evidence: 'no positive tabindex or javascript: links',
      }),
    );
  } else {
    out.push(
      issue('a11y.keyboard_patterns', 'fail', {
        value: keyboardIssues,
        evidence: `${f.semantic.positiveTabindex} positive tabindex, ${f.links.javascript} javascript: links`,
      }),
    );
  }

  return out;
}
