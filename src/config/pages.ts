/**
 * SEO-oriented page registry.
 * Feature pages double as programmatic-SEO landing pages: each one is served
 * at `/{path}` and at `/{lang}/{path}` with translated copy from `src/i18n`.
 */
export interface ToolPageDef {
  path: string;
  /** i18n namespace inside `tools.*`. */
  contentKey: string;
}

export const TOOL_PAGES: ToolPageDef[] = [
  { path: 'website-seo-audit', contentKey: 'seoAudit' },
  { path: 'free-seo-audit', contentKey: 'freeSeoAudit' },
  { path: 'website-performance-test', contentKey: 'performanceTest' },
  { path: 'website-accessibility-checker', contentKey: 'accessibilityChecker' },
  { path: 'technical-seo-audit', contentKey: 'technicalSeoAudit' },
  { path: 'website-security-check', contentKey: 'securityCheck' },
];

export interface StaticPageDef {
  path: string;
  /** i18n namespace inside `pages.*` (title/description/h1). */
  contentKey: string;
}

export const STATIC_PAGES: StaticPageDef[] = [
  { path: 'about', contentKey: 'about' },
  { path: 'contact', contentKey: 'contact' },
  { path: 'privacy-policy', contentKey: 'privacy' },
  { path: 'terms', contentKey: 'terms' },
  { path: 'disclaimer', contentKey: 'disclaimer' },
];

/** Every indexable path (used to build sitemap.xml). */
export const ALL_PUBLIC_PATHS: string[] = [
  '',
  ...TOOL_PAGES.map((p) => p.path),
  ...STATIC_PAGES.map((p) => p.path),
];
