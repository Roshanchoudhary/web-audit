import type { AuditMetrics } from '../types';
import type { AuditFacts } from './facts';

/** Build the measured-metrics payload shown in the report. */
export function buildMetrics(f: AuditFacts): AuditMetrics {
  return {
    performance: {
      fetchMs: Math.round(f.fetchMs),
      resourceCount: f.scripts.total + f.styles.total + f.images.total + f.fonts + f.iframes,
      scripts: f.scripts.total,
      stylesheets: f.styles.total,
      images: f.images.total,
      fonts: f.fonts,
      iframes: f.iframes,
      blockingScripts: f.scripts.headBlocking,
      imagesWithLazyLoad: f.images.lazy,
      modernFormatImages: f.images.modernFormat,
      // Byte sizes are not observable cross-origin — stay honest with null.
      totalBytes: null,
      coreWebVitals: null,
    },
    content: {
      words: f.content.words,
      characters: f.content.characters,
      headings: f.headings.total,
      h1: f.headings.h1.length,
      h2: f.headings.h2,
      h3: f.headings.h3,
      paragraphs: f.content.paragraphs,
      images: f.images.total,
      links: f.links.total,
      internalLinks: f.links.internal,
      externalLinks: f.links.external,
      textToHtmlRatio: f.content.textToHtmlRatio,
      topTerms: f.content.topTerms,
      readabilityGrade: f.content.readabilityGrade,
    },
    social: {
      ogTitle: f.social.ogTitle,
      ogDescription: f.social.ogDescription,
      ogImage: f.social.ogImage,
      ogUrl: f.social.ogUrl,
      ogSiteName: f.social.ogSiteName,
      twitterCard: f.social.twitterCard,
      twitterTitle: f.social.twitterTitle,
      twitterDescription: f.social.twitterDescription,
      twitterImage: f.social.twitterImage,
    },
  };
}
