import type { AuditIssue } from '../../types';
import type { AuditFacts } from '../facts';
import { issue, na } from './helpers';

export function evaluatePerformance(f: AuditFacts): AuditIssue[] {
  const out: AuditIssue[] = [];
  const totalResources = f.scripts.total + f.styles.total + f.images.total + f.fonts + f.iframes;

  /* HTML fetch time (this run only — labelled honestly) */
  const ms = Math.round(f.fetchMs);
  const timeStatus = ms < 1500 ? 'pass' : ms < 3000 ? 'warning' : 'fail';
  out.push(
    issue('perf.fetch_time', timeStatus, {
      value: ms,
      evidence: `${ms} ms to download ${Math.round(f.htmlBytes / 1024)} KB of HTML in this run`,
    }),
  );

  /* resource counts */
  const resStatus = totalResources <= 60 ? 'pass' : totalResources <= 120 ? 'warning' : 'fail';
  out.push(
    issue('perf.resource_count', resStatus, {
      value: totalResources,
      evidence: `scripts ${f.scripts.total} · styles ${f.styles.total} · images ${f.images.total} · fonts ${f.fonts} · iframes ${f.iframes}`,
    }),
  );

  const jsStatus = f.scripts.total <= 15 ? 'pass' : f.scripts.total <= 30 ? 'warning' : 'fail';
  out.push(
    issue('perf.js_count', jsStatus, {
      value: f.scripts.total,
      evidence: `${f.scripts.total} scripts (${f.scripts.external} external, ${f.scripts.inline} inline)`,
    }),
  );

  const cssStatus = f.styles.total <= 6 ? 'pass' : f.styles.total <= 12 ? 'warning' : 'fail';
  out.push(
    issue('perf.css_count', cssStatus, {
      value: f.styles.total,
      evidence: `${f.styles.total} stylesheets/style blocks`,
    }),
  );

  const blockStatus =
    f.scripts.headBlocking === 0 ? 'pass' : f.scripts.headBlocking <= 2 ? 'warning' : 'fail';
  out.push(
    issue('perf.render_blocking', blockStatus, {
      value: f.scripts.headBlocking,
      evidence: `${f.scripts.headBlocking} blocking script(s) in <head>`,
    }),
  );

  /* images */
  if (f.images.total === 0) {
    out.push(na('perf.images_modern', 'page has no images'));
    out.push(na('perf.image_dimensions', 'page has no images'));
    out.push(na('perf.lazy_loading', 'page has no images'));
  } else {
    const ratio = f.images.modernFormat / f.images.total;
    const modernStatus =
      ratio >= 0.5 ? 'pass' : ratio > 0 ? 'warning' : f.images.total >= 4 ? 'fail' : 'warning';
    out.push(
      issue('perf.images_modern', modernStatus, {
        value: f.images.modernFormat,
        evidence: `${f.images.modernFormat} of ${f.images.total} images use WebP/AVIF`,
      }),
    );

    const dimRatio = f.images.withDimensions / f.images.total;
    const dimStatus = dimRatio === 1 ? 'pass' : dimRatio >= 0.5 ? 'warning' : 'fail';
    out.push(
      issue('perf.image_dimensions', dimStatus, {
        value: f.images.withDimensions,
        evidence: `${f.images.withDimensions} of ${f.images.total} images declare width/height`,
      }),
    );

    const lazyStatus = f.images.lazy > 0 ? 'pass' : f.images.total <= 4 ? 'pass' : 'warning';
    out.push(
      issue('perf.lazy_loading', lazyStatus, {
        value: f.images.lazy,
        evidence: `${f.images.lazy} of ${f.images.total} images use loading="lazy"`,
      }),
    );
  }

  /* Requires API / server-side checks — never faked. */
  out.push(na('perf.caching', 'Cache-Control is a response header (cross-origin)', 'requires_api'));
  out.push(
    na('perf.compression', 'Content-Encoding is a response header (cross-origin)', 'requires_api'),
  );
  out.push(
    na(
      'perf.core_web_vitals',
      'needs PageSpeed Insights / Lighthouse field or lab data',
      'requires_api',
    ),
  );
  out.push(
    na(
      'perf.page_timing',
      'DOMContentLoaded/load of another origin are not observable via the Navigation Timing API',
      'requires_api',
    ),
  );

  return out;
}
