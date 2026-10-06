import type { AuditIssue } from '../../types';
import type { AuditFacts } from '../facts';
import { issue, na } from './helpers';

export function evaluateSeo(f: AuditFacts): AuditIssue[] {
  const out: AuditIssue[] = [];
  const { head, headings, images, links, structured } = f;

  /* title */
  if (head.title) {
    out.push(issue('seo.title', 'pass', { value: head.title, evidence: head.title.slice(0, 160) }));
  } else {
    out.push(issue('seo.title', 'fail', { evidence: 'no <title> element found' }));
  }

  if (!head.title) {
    out.push(na('seo.title_length', 'title missing — length not measurable'));
  } else {
    const len = head.title.length;
    const status = len >= 30 && len <= 60 ? 'pass' : len >= 20 && len <= 70 ? 'warning' : 'fail';
    out.push(
      issue('seo.title_length', status, { value: len, evidence: `length: ${len} characters` }),
    );
  }

  /* description */
  if (head.metaDescription) {
    out.push(
      issue('seo.description', 'pass', {
        value: head.metaDescription,
        evidence: head.metaDescription.slice(0, 160),
      }),
    );
    const len = head.metaDescription.length;
    const status = len >= 120 && len <= 160 ? 'pass' : len >= 70 && len <= 200 ? 'warning' : 'fail';
    out.push(
      issue('seo.description_length', status, {
        value: len,
        evidence: `length: ${len} characters`,
      }),
    );
  } else {
    out.push(issue('seo.description', 'fail', { evidence: 'meta[name="description"] not found' }));
    out.push(na('seo.description_length', 'description missing — length not measurable'));
  }

  /* canonical */
  if (!head.canonical) {
    out.push(issue('seo.canonical', 'warning', { evidence: 'no rel="canonical" link found' }));
  } else if (!/^https?:\/\//i.test(head.canonical) && !head.canonical.startsWith('/')) {
    out.push(issue('seo.canonical', 'fail', { value: head.canonical, evidence: head.canonical }));
  } else {
    out.push(issue('seo.canonical', 'pass', { value: head.canonical, evidence: head.canonical }));
  }

  /* robots meta */
  const robots = (head.robots ?? '').toLowerCase();
  if (!head.robots) {
    out.push(
      issue('seo.robots_meta', 'warning', {
        evidence: 'no robots meta — defaults to index,follow',
      }),
    );
  } else if (/(^|[, ])(noindex|none)([, ]|$)/.test(robots)) {
    out.push(issue('seo.robots_meta', 'fail', { value: head.robots, evidence: head.robots }));
  } else {
    out.push(issue('seo.robots_meta', 'pass', { value: head.robots, evidence: head.robots }));
  }

  /* headings */
  if (headings.h1.length === 1) {
    out.push(issue('seo.h1', 'pass', { value: 1, evidence: headings.h1[0].slice(0, 120) }));
  } else if (headings.h1.length === 0) {
    out.push(issue('seo.h1', 'fail', { value: 0, evidence: 'no h1 element found' }));
  } else {
    out.push(
      issue('seo.h1', 'fail', {
        value: headings.h1.length,
        evidence: headings.h1
          .map((h) => h.slice(0, 60))
          .join(' | ')
          .slice(0, 200),
      }),
    );
  }

  if (headings.h1.length > 1) {
    out.push(
      issue('seo.h1_multiple', 'warning', {
        value: headings.h1.length,
        evidence: `${headings.h1.length} h1 elements`,
      }),
    );
  } else {
    out.push(
      issue('seo.h1_multiple', 'pass', {
        value: headings.h1.length,
        evidence: `${headings.h1.length} h1 element(s)`,
      }),
    );
  }

  if (f.content.words < 60 && headings.total === 0) {
    out.push(na('seo.heading_structure', 'page too sparse to evaluate heading structure'));
  } else if (headings.h2 >= 1) {
    out.push(
      issue('seo.heading_structure', 'pass', {
        value: headings.h2,
        evidence: `h1:${headings.h1.length} h2:${headings.h2} h3:${headings.h3}`,
      }),
    );
  } else {
    out.push(
      issue('seo.heading_structure', 'warning', {
        value: 0,
        evidence: `h1:${headings.h1.length} h2:${headings.h2} h3:${headings.h3}`,
      }),
    );
  }

  /* images alt (SEO framing) */
  if (images.missingAlt === 0) {
    out.push(
      issue('seo.images_alt', 'pass', {
        value: images.total,
        evidence: `${images.total} images, 0 missing alt`,
      }),
    );
  } else {
    out.push(
      issue('seo.images_alt', 'fail', {
        value: images.missingAlt,
        evidence: `${images.missingAlt} of ${images.total} images without alt attribute`,
      }),
    );
  }

  /* links */
  if (links.internal > 0) {
    out.push(
      issue('seo.links_internal', 'pass', {
        value: links.internal,
        evidence: `${links.internal} internal links`,
      }),
    );
  } else {
    out.push(
      issue('seo.links_internal', 'warning', { value: 0, evidence: '0 internal links found' }),
    );
  }

  if (links.external > 0) {
    out.push(
      issue('seo.links_external', 'pass', {
        value: links.external,
        evidence: `${links.external} external links`,
      }),
    );
  } else {
    out.push(
      issue('seo.links_external', 'warning', { value: 0, evidence: '0 outbound references found' }),
    );
  }

  if (links.total === 0) {
    out.push(na('seo.anchor_text', 'page contains no links'));
  } else if (links.genericAnchor === 0) {
    out.push(
      issue('seo.anchor_text', 'pass', { value: 0, evidence: 'no generic anchors detected' }),
    );
  } else {
    const ratio = links.genericAnchor / links.total;
    const status = ratio >= 0.1 ? 'fail' : 'warning';
    out.push(
      issue('seo.anchor_text', status, {
        value: links.genericAnchor,
        evidence: `${links.genericAnchor} of ${links.total} anchors are generic (“click here” family)`,
      }),
    );
  }

  /* structured data */
  if (structured.jsonLd > 0 && structured.jsonLdParsed > 0) {
    out.push(
      issue('seo.structured_data', 'pass', {
        value: structured.jsonLd,
        evidence: `JSON-LD blocks: ${structured.jsonLd} — types: ${[...new Set(structured.jsonLdTypes)].slice(0, 6).join(', ') || 'n/a'}`,
      }),
    );
  } else if (structured.jsonLd > 0) {
    out.push(
      issue('seo.structured_data', 'fail', {
        value: structured.jsonLd,
        evidence: `${structured.jsonLd} JSON-LD block(s) failed to parse`,
      }),
    );
  } else if (structured.microdata > 0) {
    out.push(
      issue('seo.structured_data', 'warning', {
        value: structured.microdata,
        evidence: `microdata only (${structured.microdata} itemscope attributes)`,
      }),
    );
  } else {
    out.push(
      issue('seo.structured_data', 'fail', { value: 0, evidence: 'no JSON-LD or microdata found' }),
    );
  }

  /* open graph summary */
  if (f.social.ogTitle && f.social.ogDescription) {
    out.push(issue('seo.og', 'pass', { evidence: 'og:title and og:description present' }));
  } else if (f.social.ogTitle || f.social.ogDescription) {
    out.push(issue('seo.og', 'warning', { evidence: 'partial Open Graph coverage' }));
  } else {
    out.push(issue('seo.og', 'fail', { evidence: 'no og:* meta tags found' }));
  }

  /* language + viewport */
  if (head.lang) {
    out.push(
      issue('seo.lang', 'pass', { value: head.lang, evidence: `<html lang="${head.lang}">` }),
    );
  } else {
    out.push(issue('seo.lang', 'fail', { evidence: 'html element has no lang attribute' }));
  }

  if (!head.viewport) {
    out.push(issue('seo.viewport', 'fail', { evidence: 'meta[name="viewport"] not found' }));
  } else if (/width\s*=\s*device-width/i.test(head.viewport)) {
    out.push(issue('seo.viewport', 'pass', { value: head.viewport, evidence: head.viewport }));
  } else {
    out.push(issue('seo.viewport', 'warning', { value: head.viewport, evidence: head.viewport }));
  }

  return out;
}
