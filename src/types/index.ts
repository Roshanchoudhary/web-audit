/* -----------------------------------------------------------------------------
 * WebAudit Pro — central data model.
 * Every shared interface of the product lives here (see README “Architecture”).
 * ---------------------------------------------------------------------------*/

/* ---------- i18n / localization ---------- */

export type LanguageDirection = 'ltr' | 'rtl';

export interface Language {
  /** BCP-47 style code used in the URL and translations file name. */
  code: string;
  /** Native display name shown in the language selector. */
  name: string;
  /** English name (fallback label). */
  englishName: string;
  dir: LanguageDirection;
  region?: string;
}

/* ---------- Configuration ---------- */

export interface SocialLink {
  platform: string;
  label: string;
  url: string;
}

export interface ContactInfo {
  email: string;
  supportUrl?: string;
}

export interface AdConfig {
  /** Obvious placeholder until a real AdSense publisher id is configured. */
  clientId: string;
  slots: {
    header: string;
    report: string;
    sidebar: string;
    footer: string;
  };
}

export interface AnalyticsConfig {
  /** Empty string disables analytics. */
  measurementId: string;
}

export interface FeatureFlags {
  pdfDownload: boolean;
  printReport: boolean;
  shareReport: boolean;
  ads: boolean;
  analytics: boolean;
  consentBanner: boolean;
  browserAudit: boolean;
  apiAudit: boolean;
  samplePreview: boolean;
}

export interface AuditEngineConfig {
  /** Per-request timeout in ms. */
  timeoutMs: number;
  /** Refuse documents larger than this (bytes) to protect the browser. */
  maxHtmlBytes: number;
  /** Template with `{url}` placeholder used when a site blocks CORS. */
  proxyTemplate: string;
  /** Extra proxy templates tried in order when the primary one fails. */
  proxyFallbacks: string[];
  /** Future server-side audit API base URL ("" = disabled). */
  apiUrl: string;
}

export interface SiteConfig {
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  /** Origin without trailing slash, used for canonical/OG URLs. */
  url: string;
  domain: string;
  logo: string;
  favicon: string;
  defaultLanguage: string;
  languages: Language[];
  social: SocialLink[];
  contact: ContactInfo;
  ads: AdConfig;
  analytics: AnalyticsConfig;
  /** Google Search Console token ("" = disabled). */
  searchConsole: string;
  features: FeatureFlags;
  audit: AuditEngineConfig;
  /** Year used in the footer. */
  foundingYear: number;
}

/* ---------- Audit core ---------- */

export type AuditStatus = 'pass' | 'warning' | 'fail' | 'not_available';
export type AuditSeverity = 'critical' | 'high' | 'medium' | 'low';

/**
 * Honesty marker for every finding:
 *  - measured     : observed directly in the browser for this run
 *  - estimated    : derived/proxy value, close but not authoritative
 *  - unavailable  : cannot be observed from the browser
 *  - requires_api : needs a server-side/API integration to be measured
 */
export type MeasurementKind = 'measured' | 'estimated' | 'unavailable' | 'requires_api';

export type AuditCategoryId =
  'seo' | 'performance' | 'accessibility' | 'security' | 'technical' | 'content' | 'social';

export interface AuditCategory {
  id: AuditCategoryId;
  nameKey: string;
  descriptionKey: string;
}

export type ScoreGrade =
  'poor' | 'needs_improvement' | 'good' | 'very_good' | 'excellent' | 'unavailable';

export interface StatusCounts {
  pass: number;
  warning: number;
  fail: number;
  not_available: number;
}

export interface IssueCounts extends StatusCounts {
  total: number;
  /** Failing checks with critical/high severity. */
  critical: number;
  errors: number;
  warnings: number;
  passed: number;
  notAvailable: number;
}

export interface AuditIssue {
  /** References a CheckDefinition in the check catalog. */
  checkId: string;
  category: AuditCategoryId;
  status: AuditStatus;
  severity: AuditSeverity;
  weight: number;
  measurement: MeasurementKind;
  /** Raw observed value (count, string, boolean). */
  value?: string | number | boolean | null;
  /** Technical evidence, shown as-is (language neutral). */
  evidence?: string;
}

export interface AuditScore {
  category: AuditCategoryId;
  /** null when nothing in the category could be measured. */
  score: number | null;
  /** Share of the category weight that was measurable (0–1). */
  coverage: number;
  weights: {
    total: number;
    measurable: number;
    earned: number;
  };
  counts: StatusCounts;
}

export interface OverallScore {
  score: number | null;
  grade: ScoreGrade;
  coverage: number;
  previousScore: number | null;
  delta: number | null;
}

export interface AuditRecommendation {
  issue: AuditIssue;
  /** Lower number = fix first. */
  priority: number;
}

export interface TermFrequency {
  term: string;
  count: number;
}

export interface PerformanceMetrics {
  /** Browser-measured duration of the HTML fetch (not full page load). */
  fetchMs: number | null;
  resourceCount: number;
  scripts: number;
  stylesheets: number;
  images: number;
  fonts: number;
  iframes: number;
  blockingScripts: number;
  imagesWithLazyLoad: number;
  modernFormatImages: number;
  /** Only populated when byte sizes are actually observable. */
  totalBytes: number | null;
  /** Placeholder slot for a future PageSpeed/Lighthouse integration. */
  coreWebVitals: null;
}

export interface ContentMetrics {
  words: number;
  characters: number;
  headings: number;
  h1: number;
  h2: number;
  h3: number;
  paragraphs: number;
  images: number;
  links: number;
  internalLinks: number;
  externalLinks: number;
  textToHtmlRatio: number;
  topTerms: TermFrequency[];
  /** Flesch-style approximation; null when not computable for the language. */
  readabilityGrade: number | null;
}

export interface SocialMetrics {
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
  ogUrl: string | null;
  ogSiteName: string | null;
  twitterCard: string | null;
  twitterTitle: string | null;
  twitterDescription: string | null;
  twitterImage: string | null;
}

export interface AuditMetrics {
  performance: PerformanceMetrics;
  content: ContentMetrics;
  social: SocialMetrics;
}

export interface ReportMeta {
  fetchMs: number | null;
  htmlBytes: number;
  viaProxy: boolean;
  redirected: boolean;
  httpStatus: number | null;
}

export interface AuditReport {
  id: string;
  url: string;
  finalUrl: string;
  auditedAt: string;
  engine: {
    provider: string;
    version: string;
    mode: 'browser' | 'api';
  };
  overall: OverallScore;
  scores: AuditScore[];
  counts: IssueCounts;
  issues: AuditIssue[];
  metrics: AuditMetrics;
  /** i18n keys of things this run could not measure (shown in the report). */
  limitations: string[];
  meta: ReportMeta;
}

/** Raw output of the analysis stage before scoring. */
export interface AuditResult {
  issues: AuditIssue[];
  metrics: AuditMetrics;
  limitations: string[];
}

/* ---------- Run-time flow ---------- */

export type AuditStage =
  | 'validate'
  | 'fetch'
  | 'aux'
  | 'seo'
  | 'performance'
  | 'accessibility'
  | 'security'
  | 'technical'
  | 'content'
  | 'social'
  | 'generate'
  | 'done';

export type AuditStageListener = (stage: AuditStage, progress: number) => void;

export type AuditErrorCode =
  | 'empty_url'
  | 'invalid_url'
  | 'unsupported_protocol'
  | 'timeout'
  | 'network'
  | 'cors'
  | 'not_found'
  | 'too_large'
  | 'blocked'
  | 'api_failed'
  | 'unknown';

/* ---------- Consent / analytics ---------- */

export interface ConsentPreferences {
  necessary: boolean;
  analytics: boolean;
  ads: boolean;
  updatedAt: string;
}

export type AnalyticsEventName =
  | 'audit_started'
  | 'audit_completed'
  | 'pdf_downloaded'
  | 'language_changed'
  | 'report_shared'
  | 'CTA_clicked';

/* ---------- Persistence abstraction ---------- */

export interface ReportStore {
  save(report: AuditReport): Promise<void>;
  get(id: string): Promise<AuditReport | null>;
  /** Previous report for the same normalized URL (for score deltas). */
  findLatestForUrl(url: string, excludeId?: string): Promise<AuditReport | null>;
  list(limit?: number): Promise<AuditReport[]>;
  clear(): Promise<void>;
}
