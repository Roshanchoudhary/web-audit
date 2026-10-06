import type { PageFetchResult } from '../services/audit/types';
import { resolveHref } from '../utils/url';

/** Result of a best-effort auxiliary fetch (robots.txt, sitemap, favicon). */
export interface AuxFetch {
  ok: boolean;
  status: number | null;
  text: string | null;
  finalUrl: string | null;
}

export interface HeadFacts {
  title: string | null;
  metaDescription: string | null;
  canonical: string | null;
  robots: string | null;
  viewport: string | null;
  charset: string | null;
  lang: string | null;
  generator: string | null;
  iconHref: string | null;
  hreflangCount: number;
  hreflangSelf: boolean;
  referrerPolicy: string | null;
  csp: string | null;
}

export interface HeadingFacts {
  h1: string[];
  h2: number;
  h3: number;
  h4: number;
  total: number;
  /** Number of illegal level jumps (e.g. h1 → h3). */
  orderViolations: number;
  sequence: number[];
}

export interface ImageFacts {
  total: number;
  missingAlt: number;
  emptyAlt: number;
  lazy: number;
  modernFormat: number;
  withDimensions: number;
  insecure: string[];
}

export interface LinkFacts {
  total: number;
  internal: number;
  external: number;
  nofollow: number;
  genericAnchor: number;
  emptyName: number;
  javascript: number;
  insecure: number;
}

export interface ScriptFacts {
  total: number;
  headBlocking: number;
  external: number;
  inline: number;
  async: number;
  defer: number;
}

export interface StyleFacts {
  total: number;
  head: number;
  inline: number;
}

export interface SocialFacts {
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
  ogUrl: string | null;
  ogSiteName: string | null;
  ogType: string | null;
  twitterCard: string | null;
  twitterTitle: string | null;
  twitterDescription: string | null;
  twitterImage: string | null;
}

export interface StructuredFacts {
  jsonLd: number;
  jsonLdParsed: number;
  jsonLdTypes: string[];
  microdata: number;
}

export interface ContentFacts {
  text: string;
  words: number;
  characters: number;
  paragraphs: number;
  sentences: number;
  textToHtmlRatio: number;
  htmlBytes: number;
  topTerms: { term: string; count: number }[];
  /** Flesch–Kincaid grade, only for Latin-script text; null otherwise. */
  readabilityGrade: number | null;
}

export interface SemanticFacts {
  header: boolean;
  nav: boolean;
  main: boolean;
  footer: boolean;
  skipLink: boolean;
  positiveTabindex: number;
}

export interface FormFacts {
  total: number;
  labelled: number;
  unlabeledSample: string[];
  buttons: number;
  unnamedButtons: number;
}

export interface AriaFacts {
  idRefIssues: number;
  idRefSample: string[];
  ariaHiddenFocusable: number;
}

export interface SecurityFacts {
  https: boolean;
  insecureSubresources: number;
  insecureSample: string[];
  insecureFormActions: number;
}

export interface UrlFacts {
  length: number;
  params: number;
  hasUnderscores: boolean;
  hasUppercasePath: boolean;
  hasHashbang: boolean;
}

export interface AuditFacts {
  requestedUrl: string;
  finalUrl: string;
  html: string;
  httpStatus: number | null;
  fetchMs: number;
  redirected: boolean;
  viaProxy: boolean;
  htmlBytes: number;
  /** Inert DOMParser document — never inserted into the live DOM. */
  doc: Document;
  base: string | null;
  head: HeadFacts;
  headings: HeadingFacts;
  images: ImageFacts;
  links: LinkFacts;
  scripts: ScriptFacts;
  styles: StyleFacts;
  fonts: number;
  iframes: number;
  social: SocialFacts;
  structured: StructuredFacts;
  content: ContentFacts;
  semantic: SemanticFacts;
  forms: FormFacts;
  aria: AriaFacts;
  security: SecurityFacts;
  url: UrlFacts;
  paginationLinks: number;
  robots: AuxFetch | null;
  sitemap: AuxFetch | null;
  favicon: AuxFetch | null;
}

const GENERIC_ANCHORS = new Set([
  'click here',
  'here',
  'read more',
  'more',
  'learn more',
  'link',
  'this',
  'continue',
  'details',
  'more info',
  'download',
]);

const ENGLISH_STOPWORDS = new Set([
  'the',
  'and',
  'for',
  'that',
  'with',
  'this',
  'from',
  'are',
  'was',
  'were',
  'have',
  'has',
  'had',
  'you',
  'your',
  'not',
  'but',
  'they',
  'them',
  'their',
  'his',
  'her',
  'its',
  'our',
  'will',
  'can',
  'all',
  'any',
  'one',
  'out',
  'get',
  'how',
  'why',
  'what',
  'when',
  'who',
  'about',
  'into',
  'than',
  'then',
  'them',
  'such',
  'only',
  'over',
  'also',
  'after',
  'before',
  'which',
  'there',
  'these',
  'those',
  'been',
  'being',
  'does',
  'did',
  'very',
  'just',
  'like',
  'page',
  'home',
  'site',
  'web',
  'website',
  'https',
  'http',
  'www',
  'com',
  'and',
  'you',
]);

function metaContent(doc: Document, key: string): string | null {
  const lower = key.toLowerCase();
  for (const el of Array.from(doc.querySelectorAll('meta'))) {
    const name = (el.getAttribute('name') || el.getAttribute('property') || '').toLowerCase();
    if (name === lower) {
      const content = el.getAttribute('content');
      if (content !== null) return content.trim();
    }
  }
  return null;
}

function accessibleName(el: Element, doc: Document): string {
  const text = (el.textContent ?? '').replace(/\s+/g, ' ').trim();
  if (text) return text;
  const ariaLabel = el.getAttribute('aria-label');
  if (ariaLabel?.trim()) return ariaLabel.trim();
  const labelledBy = el.getAttribute('aria-labelledby');
  if (labelledBy) {
    for (const id of labelledBy.split(/\s+/)) {
      const target = doc.getElementById(id);
      const targetText = target?.textContent?.replace(/\s+/g, ' ').trim();
      if (targetText) return targetText;
    }
  }
  if (el.tagName === 'INPUT') {
    const value = (el as HTMLInputElement).value;
    if (value) return value;
    const img = el.querySelector('img[alt]');
    if (img?.getAttribute('alt')) return img.getAttribute('alt') as string;
  }
  const img = el.querySelector('img[alt]');
  if (img?.getAttribute('alt')) return img.getAttribute('alt') as string;
  const title = el.getAttribute('title');
  return title?.trim() ?? '';
}

function isLabelledInput(
  input: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
): boolean {
  if (input.getAttribute('aria-label')?.trim()) return true;
  const labelledBy = input.getAttribute('aria-labelledby');
  if (labelledBy?.trim()) return true;
  if (input.closest('label')) return true;
  const id = input.id;
  if (id) {
    for (const label of Array.from(input.ownerDocument.querySelectorAll('label'))) {
      if (label.getAttribute('for') === id) return true;
    }
  }
  return Boolean(input.getAttribute('title')?.trim());
}

function countSyllables(word: string): number {
  const vowels = 'aeiouy';
  const w = word.toLowerCase().replace(/[^a-z]/g, '');
  if (!w) return 0;
  if (w.length <= 3) return 1;
  let count = 0;
  let prev = false;
  for (const ch of w) {
    const isVowel = vowels.includes(ch);
    if (isVowel && !prev) count += 1;
    prev = isVowel;
  }
  if (w.endsWith('e') && count > 1) count -= 1;
  return Math.max(1, count);
}

const STOPWORDS = ENGLISH_STOPWORDS;

function topTerms(text: string, limit = 8): { term: string; count: number }[] {
  const counts = new Map<string, number>();
  const tokens = text
    .toLowerCase()
    .split(/[^\p{L}\p{N}']+/u)
    .filter((t) => t.length >= 3 && !STOPWORDS.has(t) && !/^\d+$/.test(t));
  for (const token of tokens) counts.set(token, (counts.get(token) ?? 0) + 1);
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([term, count]) => ({ term, count }));
}

function readabilityGrade(text: string, words: number, sentences: number): number | null {
  if (words < 50 || sentences < 3) return null;
  const letters = text.replace(/[^a-zA-Z]/g, '');
  if (letters.length < 100) return null;
  const nonAsciiLetters = (text.match(/[^\p{ASCII}]/gu) ?? []).length;
  if (nonAsciiLetters > letters.length * 0.25) return null; // English-centric metric only
  const wordList = text
    .toLowerCase()
    .split(/[^\p{L}']+/u)
    .filter(Boolean)
    .slice(0, 5000);
  const syllables = wordList.reduce((sum, w) => sum + countSyllables(w), 0) || words;
  const asl = words / sentences;
  const asw = syllables / Math.max(1, wordList.length);
  const grade = 0.39 * asl + 11.8 * asw - 15.59;
  return Math.round(Math.max(0, Math.min(18, grade)) * 10) / 10;
}

export function extractFacts(
  page: PageFetchResult,
  aux: { robots: AuxFetch | null; sitemap: AuxFetch | null; favicon: AuxFetch | null },
): AuditFacts {
  const html = page.html;
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const finalUrl = page.finalUrl;
  const isHttps = finalUrl.startsWith('https:');

  /* ---------------- head ---------------- */
  const headMeta: Record<string, string | null> = {
    description: metaContent(doc, 'description'),
    viewport: metaContent(doc, 'viewport'),
    robots: metaContent(doc, 'robots'),
    generator: metaContent(doc, 'generator'),
    referrer: metaContent(doc, 'referrer'),
    ogTitle: metaContent(doc, 'og:title'),
    ogDescription: metaContent(doc, 'og:description'),
    ogImage: metaContent(doc, 'og:image'),
    ogUrl: metaContent(doc, 'og:url'),
    ogSiteName: metaContent(doc, 'og:site_name'),
    ogType: metaContent(doc, 'og:type'),
    twitterCard: metaContent(doc, 'twitter:card'),
    twitterTitle: metaContent(doc, 'twitter:title'),
    twitterDescription: metaContent(doc, 'twitter:description'),
    twitterImage: metaContent(doc, 'twitter:image'),
    csp: null,
    referrerPolicy: metaContent(doc, 'referrer'),
  };
  for (const el of Array.from(doc.querySelectorAll('meta'))) {
    if ((el.getAttribute('http-equiv') || '').toLowerCase() === 'content-security-policy') {
      headMeta.csp = el.getAttribute('content') ?? '';
      break;
    }
  }

  let canonical: string | null = null;
  let iconHref: string | null = null;
  let hreflangCount = 0;
  let hreflangSelf = false;
  let paginationLinks = 0;
  const pageLang = doc.documentElement.getAttribute('lang')?.trim() ?? null;
  for (const link of Array.from(doc.querySelectorAll('link'))) {
    const rel = (link.getAttribute('rel') || '').toLowerCase();
    const href = link.getAttribute('href');
    if (rel.split(/\s+/).includes('canonical') && href) canonical = href.trim();
    if (rel.split(/\s+/).includes('icon') && href && !iconHref) iconHref = href.trim();
    if (rel.split(/\s+/).includes('alternate') && link.hasAttribute('hreflang')) {
      hreflangCount += 1;
      const hl = (link.getAttribute('hreflang') || '').toLowerCase();
      if (pageLang && (hl === pageLang.toLowerCase() || hl === 'x-default')) hreflangSelf = true;
    }
    if (rel.split(/\s+/).includes('next') || rel.split(/\s+/).includes('prev'))
      paginationLinks += 1;
  }

  const headStart = html.slice(0, 2048).toLowerCase();
  const charsetMatch = headStart.match(/<meta[^>]+charset\s*=\s*["']?([\w-]+)/);
  const headFacts: HeadFacts = {
    title: doc.querySelector('title')?.textContent?.trim() || null,
    metaDescription: headMeta.description,
    canonical,
    robots: headMeta.robots,
    viewport: headMeta.viewport,
    charset: charsetMatch ? charsetMatch[1] : null,
    lang: pageLang,
    generator: headMeta.generator,
    iconHref,
    hreflangCount,
    hreflangSelf,
    referrerPolicy: headMeta.referrerPolicy,
    csp: headMeta.csp,
  };

  /* ---------------- headings ---------------- */
  const headingEls = Array.from(doc.querySelectorAll('h1,h2,h3,h4,h5,h6'));
  const sequence = headingEls.map((el) => Number(el.tagName.slice(1)));
  let orderViolations = 0;
  let previous = 0;
  for (const level of sequence) {
    if (previous > 0 && level > previous + 1) orderViolations += 1;
    previous = level;
  }
  const headings: HeadingFacts = {
    h1: Array.from(doc.querySelectorAll('h1'))
      .map((el) => (el.textContent ?? '').replace(/\s+/g, ' ').trim())
      .filter(Boolean),
    h2: doc.querySelectorAll('h2').length,
    h3: doc.querySelectorAll('h3').length,
    h4: doc.querySelectorAll('h4').length,
    total: headingEls.length,
    orderViolations,
    sequence,
  };

  /* ---------------- images ---------------- */
  const insecureSample: string[] = [];
  let insecureSubresources = 0;
  const considerUrl = (value: string | null) => {
    if (value && isHttps && /^http:\/\//i.test(value.trim())) {
      insecureSubresources += 1;
      if (insecureSample.length < 5) insecureSample.push(value.trim());
    }
  };
  for (const srcset of Array.from(doc.querySelectorAll('[srcset]'))) {
    for (const part of (srcset.getAttribute('srcset') || '').split(',')) {
      considerUrl(part.trim().split(/\s+/)[0] ?? null);
    }
  }

  const imgEls = Array.from(doc.querySelectorAll('img'));
  let missingAlt = 0;
  let emptyAlt = 0;
  let lazy = 0;
  let modernFormat = 0;
  let withDimensions = 0;
  const insecureImages: string[] = [];
  for (const img of imgEls) {
    if (!img.hasAttribute('alt')) missingAlt += 1;
    else if ((img.getAttribute('alt') ?? '').trim() === '') emptyAlt += 1;
    if ((img.getAttribute('loading') || '').toLowerCase() === 'lazy') lazy += 1;
    if (img.hasAttribute('width') && img.hasAttribute('height')) withDimensions += 1;
    const src = img.getAttribute('src') || '';
    if (/\.(webp|avif)(\?|#|$)/i.test(src)) modernFormat += 1;
    if (isHttps && /^http:\/\//i.test(src)) {
      if (insecureImages.length < 5) insecureImages.push(src);
    }
  }
  const images: ImageFacts = {
    total: imgEls.length,
    missingAlt,
    emptyAlt,
    lazy,
    modernFormat,
    withDimensions,
    insecure: insecureImages,
  };

  /* ---------------- links ---------------- */
  const anchorEls = Array.from(doc.querySelectorAll('a[href]'));
  let internal = 0;
  let external = 0;
  let nofollow = 0;
  let genericAnchor = 0;
  let emptyName = 0;
  let javascript = 0;
  let insecureLinks = 0;
  let finalHost = '';
  try {
    finalHost = new URL(finalUrl).host;
  } catch {
    finalHost = '';
  }
  for (const a of anchorEls) {
    const href = (a.getAttribute('href') || '').trim();
    if (!href) continue;
    if (href.startsWith('javascript:')) {
      javascript += 1;
      continue;
    }
    if (href.startsWith('http://') && isHttps) insecureLinks += 1;
    const resolved = resolveHref(href, finalUrl);
    if (resolved) {
      try {
        const u = new URL(resolved);
        if (u.host === finalHost) internal += 1;
        else external += 1;
      } catch {
        /* ignore unresolvable */
      }
    }
    const rel = (a.getAttribute('rel') || '').toLowerCase();
    if (rel.includes('nofollow')) nofollow += 1;
    const name = accessibleName(a, doc).toLowerCase();
    if (!name) emptyName += 1;
    else if (GENERIC_ANCHORS.has(name)) genericAnchor += 1;
  }
  const links: LinkFacts = {
    total: anchorEls.length,
    internal,
    external,
    nofollow,
    genericAnchor,
    emptyName,
    javascript,
    insecure: insecureLinks,
  };

  /* ---------------- scripts & styles ---------------- */
  const allScripts = Array.from(doc.querySelectorAll('script'));
  let scriptTotal = 0;
  let headBlocking = 0;
  let scriptExternal = 0;
  let scriptInline = 0;
  let scriptAsync = 0;
  let scriptDefer = 0;
  for (const script of allScripts) {
    const type = (script.getAttribute('type') || '').toLowerCase();
    if (type === 'application/ld+json' || type === 'application/json') continue;
    scriptTotal += 1;
    const src = script.getAttribute('src');
    if (src) {
      scriptExternal += 1;
      considerUrl(src);
    } else {
      scriptInline += 1;
    }
    const isAsync = script.hasAttribute('async');
    const isDefer = script.hasAttribute('defer') || type === 'module';
    if (isAsync) scriptAsync += 1;
    if (isDefer) scriptDefer += 1;
    if (!isAsync && !isDefer && script.parentElement?.tagName === 'HEAD') headBlocking += 1;
  }

  const styleLinks = Array.from(doc.querySelectorAll('link[rel~="stylesheet"]'));
  const styleEls = Array.from(doc.querySelectorAll('style'));
  for (const link of styleLinks) considerUrl(link.getAttribute('href'));
  const styles: StyleFacts = {
    total: styleLinks.length + styleEls.length,
    head: styleLinks.filter((l) => l.parentElement?.tagName === 'HEAD').length,
    inline: styleEls.length,
  };

  const fontLinks = doc.querySelectorAll('link[as="font"]').length;
  const inlineFontFaces = styleEls.filter((s) =>
    (s.textContent ?? '').includes('@font-face'),
  ).length;
  const fonts = fontLinks + inlineFontFaces;
  const iframes = doc.querySelectorAll('iframe').length;

  /* ---------------- structured data ---------------- */
  let jsonLd = 0;
  let jsonLdParsed = 0;
  const jsonLdTypes: string[] = [];
  for (const script of Array.from(doc.querySelectorAll('script[type="application/ld+json"]'))) {
    jsonLd += 1;
    try {
      const data: unknown = JSON.parse(script.textContent ?? '{}');
      jsonLdParsed += 1;
      const items = Array.isArray(data) ? data : [data];
      for (const item of items) {
        const type = (item as { '@type'?: string | string[] })['@type'];
        if (Array.isArray(type)) jsonLdTypes.push(...type);
        else if (type) jsonLdTypes.push(type);
      }
    } catch {
      /* invalid JSON-LD counted but not parsed */
    }
  }
  const structured: StructuredFacts = {
    jsonLd,
    jsonLdParsed,
    jsonLdTypes,
    microdata: doc.querySelectorAll('[itemscope]').length,
  };

  /* ---------------- content ---------------- */
  const bodyClone = doc.body ? (doc.body.cloneNode(true) as HTMLElement) : null;
  bodyClone?.querySelectorAll('script,style,noscript,template,svg').forEach((n) => n.remove());
  const rawText = (bodyClone?.textContent ?? '').replace(/\s+/g, ' ').trim();
  const spaceTokens = rawText.split(/\s+/).filter(Boolean);
  const cjkChars = (rawText.match(/[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uac00-\ud7af]/g) ?? [])
    .length;
  const words =
    cjkChars > 20 && cjkChars > spaceTokens.length * 0.5
      ? Math.ceil(cjkChars / 2)
      : spaceTokens.length;
  const sentences = Math.max(
    1,
    (rawText.match(/[.!?。！？]+(\s|$)/g) ?? []).length || Math.ceil(words / 15),
  );
  const htmlBytes = new TextEncoder().encode(html).length;
  const content: ContentFacts = {
    text: rawText.slice(0, 200000),
    words,
    characters: rawText.length,
    paragraphs: doc.querySelectorAll('p').length,
    sentences,
    textToHtmlRatio: htmlBytes > 0 ? Math.round((rawText.length / htmlBytes) * 1000) / 10 : 0,
    htmlBytes,
    topTerms: topTerms(rawText),
    readabilityGrade: readabilityGrade(rawText, words, sentences),
  };

  /* ---------------- semantics & forms ---------------- */
  const focusableSelector =
    'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])';
  let ariaHiddenFocusable = 0;
  let idRefIssues = 0;
  const idRefSample: string[] = [];
  for (const el of Array.from(
    doc.querySelectorAll('[aria-labelledby], [aria-describedby], [aria-controls]'),
  )) {
    for (const attr of ['aria-labelledby', 'aria-describedby', 'aria-controls']) {
      const value = el.getAttribute(attr);
      if (!value) continue;
      for (const id of value.split(/\s+/)) {
        if (id && !doc.getElementById(id)) {
          idRefIssues += 1;
          if (idRefSample.length < 5) idRefSample.push(`${attr}="${id}"`);
        }
      }
    }
  }
  for (const el of Array.from(doc.querySelectorAll('[aria-hidden="true"]'))) {
    if (el.querySelector(focusableSelector)) ariaHiddenFocusable += 1;
  }

  let positiveTabindex = 0;
  for (const el of Array.from(doc.querySelectorAll('[tabindex]'))) {
    const value = Number(el.getAttribute('tabindex'));
    if (Number.isFinite(value) && value > 0) positiveTabindex += 1;
  }

  const skipLink = Array.from(doc.querySelectorAll('a[href^="#"]')).some((a) =>
    /skip|content|main/i.test((a.textContent ?? '').trim()),
  );

  const formControls = Array.from(
    doc.querySelectorAll<HTMLInputElement>('input, select, textarea'),
  ).filter((el) => {
    const type = (el.getAttribute('type') || 'text').toLowerCase();
    return !['hidden', 'submit', 'button', 'image', 'reset'].includes(type);
  });
  let labelled = 0;
  const unlabeledSample: string[] = [];
  for (const control of formControls) {
    if (isLabelledInput(control)) labelled += 1;
    else if (unlabeledSample.length < 5)
      unlabeledSample.push(control.name || control.id || control.type);
  }

  const semantic: SemanticFacts = {
    header: Boolean(doc.querySelector('header, [role="banner"]')),
    nav: Boolean(doc.querySelector('nav, [role="navigation"]')),
    main: Boolean(doc.querySelector('main, [role="main"]')),
    footer: Boolean(doc.querySelector('footer, [role="contentinfo"]')),
    skipLink,
    positiveTabindex,
  };
  const buttonEls = Array.from(doc.querySelectorAll('button, [role="button"]'));
  const unnamedButtons = buttonEls.filter((b) => !accessibleName(b, doc)).length;
  const forms: FormFacts = {
    total: formControls.length,
    labelled,
    unlabeledSample,
    buttons: buttonEls.length,
    unnamedButtons,
  };
  const aria: AriaFacts = { idRefIssues, idRefSample, ariaHiddenFocusable };

  let insecureFormActions = 0;
  for (const form of Array.from(doc.querySelectorAll('form[action]'))) {
    const action = form.getAttribute('action') || '';
    if (isHttps && /^http:\/\//i.test(action.trim())) insecureFormActions += 1;
  }
  const security: SecurityFacts = {
    https: isHttps,
    insecureSubresources: insecureSubresources + images.insecure.length,
    insecureSample: [...new Set([...insecureSample, ...insecureImages])].slice(0, 5),
    insecureFormActions,
  };

  let params = 0;
  let hasUnderscores = false;
  let hasUppercasePath = false;
  let hasHashbang = false;
  try {
    const u = new URL(finalUrl);
    params = u.searchParams.toString() ? Array.from(u.searchParams.keys()).length : 0;
    hasUnderscores = /_/.test(u.pathname);
    hasUppercasePath = /[A-Z]/.test(u.pathname.replace(/^\/+/, ''));
    hasHashbang = u.hash.startsWith('#!');
  } catch {
    /* keep defaults */
  }
  const urlFacts: UrlFacts = {
    length: finalUrl.length,
    params,
    hasUnderscores,
    hasUppercasePath,
    hasHashbang,
  };

  return {
    requestedUrl: page.requestedUrl,
    finalUrl,
    html,
    httpStatus: page.status,
    fetchMs: page.durationMs,
    redirected: page.redirected,
    viaProxy: page.viaProxy,
    htmlBytes,
    doc,
    base: doc.querySelector('base')?.href ?? null,
    head: headFacts,
    headings,
    images,
    links,
    scripts: {
      total: scriptTotal,
      headBlocking,
      external: scriptExternal,
      inline: scriptInline,
      async: scriptAsync,
      defer: scriptDefer,
    },
    styles,
    fonts,
    iframes,
    social: {
      ogTitle: headMeta.ogTitle,
      ogDescription: headMeta.ogDescription,
      ogImage: headMeta.ogImage,
      ogUrl: headMeta.ogUrl,
      ogSiteName: headMeta.ogSiteName,
      ogType: headMeta.ogType,
      twitterCard: headMeta.twitterCard,
      twitterTitle: headMeta.twitterTitle,
      twitterDescription: headMeta.twitterDescription,
      twitterImage: headMeta.twitterImage,
    },
    structured,
    content,
    semantic,
    forms,
    aria,
    security,
    url: urlFacts,
    paginationLinks,
    robots: aux.robots,
    sitemap: aux.sitemap,
    favicon: aux.favicon,
  };
}
