import type { AuditIssue } from '../../types';
import type { AuditFacts } from '../facts';
import { issue, na } from './helpers';

export function evaluateContent(f: AuditFacts): AuditIssue[] {
  const out: AuditIssue[] = [];
  const { content, headings, images, links } = f;

  /* word count */
  const words = content.words;
  const wordStatus = words >= 300 ? 'pass' : words >= 150 ? 'warning' : 'fail';
  out.push(
    issue('content.word_count', wordStatus, {
      value: words,
      evidence: `${words} words, ${content.paragraphs} paragraphs`,
    }),
  );

  /* headings coverage */
  const headingStatus = headings.total >= 2 ? 'pass' : headings.total === 1 ? 'warning' : 'fail';
  out.push(
    issue('content.headings', headingStatus, {
      value: headings.total,
      evidence: `${headings.total} headings (h1:${headings.h1.length} h2:${headings.h2} h3:${headings.h3})`,
    }),
  );

  /* paragraphs */
  const paraStatus =
    content.paragraphs >= 3 ? 'pass' : content.paragraphs >= 1 ? 'warning' : 'fail';
  out.push(
    issue('content.paragraphs', paraStatus, {
      value: content.paragraphs,
      evidence: `${content.paragraphs} <p> elements`,
    }),
  );

  /* visual content */
  if (images.total > 0) {
    out.push(
      issue('content.images', 'pass', { value: images.total, evidence: `${images.total} images` }),
    );
  } else {
    out.push(issue('content.images', 'warning', { value: 0, evidence: 'no images found' }));
  }

  /* links in content */
  if (links.total > 0) {
    out.push(
      issue('content.links', 'pass', {
        value: links.total,
        evidence: `${links.total} links (${links.internal} internal, ${links.external} external)`,
      }),
    );
  } else {
    out.push(
      issue('content.links', 'warning', { value: 0, evidence: 'no links found in the document' }),
    );
  }

  /* text-to-HTML ratio */
  const ratio = content.textToHtmlRatio;
  const ratioStatus = ratio >= 10 ? 'pass' : ratio >= 5 ? 'warning' : 'fail';
  out.push(
    issue('content.text_ratio', ratioStatus, {
      value: ratio,
      evidence: `${ratio}% visible text vs ${(content.htmlBytes / 1024).toFixed(1)} KB HTML`,
    }),
  );

  /* term frequency — frequency snapshot, not ranking analysis */
  if (words < 60) {
    out.push(na('content.keywords', 'too little text for a meaningful term profile'));
  } else {
    const top = content.topTerms[0];
    const density = top ? top.count / words : 0;
    const status = density > 0.06 ? 'warning' : 'pass';
    out.push(
      issue('content.keywords', status, {
        value: content.topTerms.length,
        evidence: content.topTerms
          .slice(0, 6)
          .map((t) => `${t.term}×${t.count}`)
          .join(', '),
      }),
    );
  }

  /* readability */
  if (content.readabilityGrade === null) {
    out.push(
      na('content.readability', 'readability estimation is only available for Latin-script text'),
    );
  } else {
    const grade = content.readabilityGrade;
    const status = grade <= 12 ? 'pass' : grade <= 14 ? 'warning' : 'fail';
    out.push(
      issue('content.readability', status, {
        value: grade,
        evidence: `Flesch–Kincaid grade ≈ ${grade}`,
      }),
    );
  }

  return out;
}
