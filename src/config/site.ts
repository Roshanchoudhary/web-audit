import type { Language, SiteConfig } from '../types';

/**
 * Central product configuration.
 * Branding, languages, integrations and feature flags live ONLY here —
 * never hard-code these values inside components.
 */

export const LANGUAGES: Language[] = [
  { code: 'en', name: 'English', englishName: 'English', dir: 'ltr' },
  { code: 'hi', name: 'हिन्दी', englishName: 'Hindi', dir: 'ltr' },
  { code: 'bn', name: 'বাংলা', englishName: 'Bengali', dir: 'ltr' },
  { code: 'mai', name: 'मैथिली', englishName: 'Maithili', dir: 'ltr' },
  { code: 'ne', name: 'नेपाली', englishName: 'Nepali', dir: 'ltr' },
  { code: 'ur', name: 'اردو', englishName: 'Urdu', dir: 'rtl' },
  { code: 'ar', name: 'العربية', englishName: 'Arabic', dir: 'rtl' },
  { code: 'fr', name: 'Français', englishName: 'French', dir: 'ltr' },
  { code: 'de', name: 'Deutsch', englishName: 'German', dir: 'ltr' },
  { code: 'es', name: 'Español', englishName: 'Spanish', dir: 'ltr' },
  { code: 'pt', name: 'Português', englishName: 'Portuguese', dir: 'ltr' },
  { code: 'ru', name: 'Русский', englishName: 'Russian', dir: 'ltr' },
  { code: 'zh', name: '中文', englishName: 'Chinese', dir: 'ltr' },
  { code: 'ja', name: '日本語', englishName: 'Japanese', dir: 'ltr' },
  { code: 'ko', name: '한국어', englishName: 'Korean', dir: 'ltr' },
  { code: 'it', name: 'Italiano', englishName: 'Italian', dir: 'ltr' },
  { code: 'tr', name: 'Türkçe', englishName: 'Turkish', dir: 'ltr' },
  { code: 'id', name: 'Bahasa Indonesia', englishName: 'Indonesian', dir: 'ltr' },
  { code: 'vi', name: 'Tiếng Việt', englishName: 'Vietnamese', dir: 'ltr' },
  { code: 'th', name: 'ไทย', englishName: 'Thai', dir: 'ltr' },
  { code: 'fa', name: 'فارسی', englishName: 'Persian', dir: 'rtl' },
  { code: 'pa', name: 'ਪੰਜਾਬੀ', englishName: 'Punjabi', dir: 'ltr' },
  { code: 'mr', name: 'मराठी', englishName: 'Marathi', dir: 'ltr' },
  { code: 'gu', name: 'ગુજરાતી', englishName: 'Gujarati', dir: 'ltr' },
  { code: 'ta', name: 'தமிழ்', englishName: 'Tamil', dir: 'ltr' },
  { code: 'te', name: 'తెలుగు', englishName: 'Telugu', dir: 'ltr' },
  { code: 'kn', name: 'ಕನ್ನಡ', englishName: 'Kannada', dir: 'ltr' },
  { code: 'ml', name: 'മലയാളം', englishName: 'Malayalam', dir: 'ltr' },
  { code: 'or', name: 'ଓଡ଼ିଆ', englishName: 'Odia', dir: 'ltr' },
  { code: 'as', name: 'অসমীয়া', englishName: 'Assamese', dir: 'ltr' },
];

const env = import.meta.env;

export const siteConfig: SiteConfig = {
  name: 'WebAudit Pro',
  shortName: 'WebAudit',
  tagline: 'Premium website audits, free for everyone.',
  description:
    'Run a free comprehensive website audit: SEO, performance, accessibility, security, technical SEO, content and social checks with scores, charts, actionable fixes and PDF reports.',
  url: (env.VITE_SITE_URL ?? '').replace(/\/$/, '') || 'https://webauditpro.example.com',
  domain:
    (env.VITE_SITE_URL ?? '').replace(/^https?:\/\//, '').replace(/\/$/, '') ||
    'webauditpro.example.com',
  logo: '/favicon.svg',
  favicon: '/favicon.svg',
  defaultLanguage: 'en',
  languages: LANGUAGES,
  social: [
    // Replace with your real profiles — labels are i18n-neutral.
    { platform: 'x', label: 'X / Twitter', url: 'https://x.com/webauditpro' },
    {
      platform: 'linkedin',
      label: 'LinkedIn',
      url: 'https://www.linkedin.com/company/webauditpro',
    },
    { platform: 'github', label: 'GitHub', url: 'https://github.com/webauditpro/webaudit-pro' },
  ],
  contact: {
    email: 'hello@webauditpro.example.com',
    supportUrl: 'mailto:hello@webauditpro.example.com',
  },
  ads: {
    // Replace YOUR_ADSENSE_CLIENT_ID (or set VITE_ADSENSE_CLIENT_ID) with the
    // real publisher id, e.g. ca-pub-1234567890123456. Until then the AdSlot
    // component renders a neutral, clearly-labelled placeholder.
    clientId: env.VITE_ADSENSE_CLIENT_ID || 'YOUR_ADSENSE_CLIENT_ID',
    slots: {
      header: 'YOUR_ADSENSE_SLOT_HEADER',
      report: 'YOUR_ADSENSE_SLOT_REPORT',
      sidebar: 'YOUR_ADSENSE_SLOT_SIDEBAR',
      footer: 'YOUR_ADSENSE_SLOT_FOOTER',
    },
  },
  analytics: {
    // Replace with your GA4 id (or set VITE_GA_MEASUREMENT_ID), e.g. G-ABC123XYZ.
    measurementId: env.VITE_GA_MEASUREMENT_ID || 'YOUR_GA_MEASUREMENT_ID',
  },
  searchConsole: env.VITE_GOOGLE_SITE_VERIFICATION || '',
  features: {
    pdfDownload: true,
    printReport: true,
    shareReport: true,
    ads: true,
    analytics: true,
    consentBanner: true,
    browserAudit: true,
    apiAudit: Boolean(env.VITE_AUDIT_API_URL),
    samplePreview: true,
  },
  audit: {
    timeoutMs: 20000,
    maxHtmlBytes: 5 * 1024 * 1024,
    // Public CORS proxies are only a fallback for origins that do not send
    // Access-Control-Allow-Origin; set VITE_AUDIT_PROXY_URL (or "off") to
    // override. Order matters: r.jina.ai is tried first because it reliably
    // returns raw HTML with permissive CORS, while the classic free proxies
    // are frequently rate-limited or offline (Cloudflare 522). See README.
    proxyTemplate:
      env.VITE_AUDIT_PROXY_URL === 'off'
        ? ''
        : env.VITE_AUDIT_PROXY_URL || 'https://r.jina.ai/{url}',
    proxyFallbacks:
      env.VITE_AUDIT_PROXY_URL === 'off'
        ? []
        : [
            'https://api.allorigins.win/raw?url={url}',
            'https://api.codetabs.com/v1/proxy?quest={url}',
            'https://api.cors.lol/?url={url}',
          ],
    apiUrl: env.VITE_AUDIT_API_URL || '',
  },
  foundingYear: 2026,
};

export const SUPPORTED_LANGUAGE_CODES = new Set(LANGUAGES.map((l) => l.code));

export function getLanguage(code: string): Language | undefined {
  return LANGUAGES.find((l) => l.code === code);
}

export function isRtlLanguage(code: string): boolean {
  return getLanguage(code)?.dir === 'rtl';
}
