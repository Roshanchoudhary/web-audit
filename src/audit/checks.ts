import type { AuditCategory, AuditCategoryId, AuditSeverity, MeasurementKind } from '../types';

/**
 * Check catalog — the English source of truth for every audit check.
 *
 * Other locales can override any field through `checks.<id>.<field>` keys in
 * `src/i18n/locales/<code>.json` (see `useI18n().tCheck`).
 *
 * Fields:
 *  - title       short label shown on the issue card
 *  - description what the check verifies and what is wrong when it fails
 *  - why         why it matters (SEO / a11y / security impact)
 *  - fix         how to fix it, including the technical recommendation
 */
export interface CheckDef {
  id: string;
  category: AuditCategoryId;
  /** Score weight inside its category (1 = minor … 5 = critical). */
  weight: number;
  severity: AuditSeverity;
  /** Default measurement badge; an evaluator may downgrade it per result. */
  measurement: MeasurementKind;
  title: string;
  description: string;
  why: string;
  fix: string;
}

export const CATEGORIES: AuditCategory[] = [
  {
    id: 'seo',
    nameKey: 'report.categories.seo.name',
    descriptionKey: 'report.categories.seo.desc',
  },
  {
    id: 'performance',
    nameKey: 'report.categories.performance.name',
    descriptionKey: 'report.categories.performance.desc',
  },
  {
    id: 'accessibility',
    nameKey: 'report.categories.accessibility.name',
    descriptionKey: 'report.categories.accessibility.desc',
  },
  {
    id: 'security',
    nameKey: 'report.categories.security.name',
    descriptionKey: 'report.categories.security.desc',
  },
  {
    id: 'technical',
    nameKey: 'report.categories.technical.name',
    descriptionKey: 'report.categories.technical.desc',
  },
  {
    id: 'content',
    nameKey: 'report.categories.content.name',
    descriptionKey: 'report.categories.content.desc',
  },
  {
    id: 'social',
    nameKey: 'report.categories.social.name',
    descriptionKey: 'report.categories.social.desc',
  },
];

const def = (d: CheckDef): CheckDef => d;

export const CHECKS: CheckDef[] = [
  /* ---------------------------------- SEO ---------------------------------- */
  def({
    id: 'seo.title',
    category: 'seo',
    weight: 5,
    severity: 'critical',
    measurement: 'measured',
    title: 'Page title (title tag)',
    description:
      'Every indexable page needs one clear, unique <title> in the document head. A missing or empty title leaves search engines without a reliable label for the page.',
    why: 'The title is the strongest on-page relevance signal and the headline people read in search results.',
    fix: 'Add <title>Primary keyword — Brand</title> inside <head>, make it unique per page and keep it around 30–60 characters.',
  }),
  def({
    id: 'seo.title_length',
    category: 'seo',
    weight: 3,
    severity: 'medium',
    measurement: 'measured',
    title: 'Title length',
    description:
      'Titles should stay roughly between 30 and 60 characters so search engines display them without mid-sentence truncation.',
    why: 'A truncated title loses its keyword and its click appeal in the results page.',
    fix: 'Front-load the main keyword, place the brand at the end and cut filler words to land in the 30–60 character window.',
  }),
  def({
    id: 'seo.description',
    category: 'seo',
    weight: 4,
    severity: 'high',
    measurement: 'measured',
    title: 'Meta description',
    description:
      'The page should provide a meta description summarising its content. Without one, search engines invent a snippet from random body text.',
    why: 'The description is your pitch in search results — it strongly influences click-through rate even though it is not a direct ranking factor.',
    fix: 'Add <meta name="description" content="…"> with a specific 120–160 character summary including the primary keyword.',
  }),
  def({
    id: 'seo.description_length',
    category: 'seo',
    weight: 2,
    severity: 'low',
    measurement: 'measured',
    title: 'Meta description length',
    description:
      'Descriptions should stay around 120–160 characters so the full snippet is shown instead of being cut off.',
    why: 'A cut-off snippet hides the call to action that earns the click.',
    fix: 'Rewrite the description to 120–160 characters: outcome first, keyword naturally included, no copied sentence from the body.',
  }),
  def({
    id: 'seo.canonical',
    category: 'seo',
    weight: 3,
    severity: 'high',
    measurement: 'measured',
    title: 'Canonical URL',
    description:
      'The page should declare a rel=canonical pointing at its preferred URL so duplicate variants consolidate into one ranking signal.',
    why: 'Without a canonical, parameterised or trailing-slash variants compete with each other and split link equity.',
    fix: 'Add <link rel="canonical" href="https://example.com/page"> in <head>, self-referencing on normal pages.',
  }),
  def({
    id: 'seo.robots_meta',
    category: 'seo',
    weight: 3,
    severity: 'high',
    measurement: 'measured',
    title: 'Robots meta directive',
    description:
      'The page should declare how crawlers may treat it (index/follow) rather than leaving robots directives absent or contradictory.',
    why: 'A stray noindex or a conflicting robots value can remove an entire page from search results without any visible error.',
    fix: 'Add <meta name="robots" content="index, follow"> on public pages and audit every noindex before release.',
  }),
  def({
    id: 'seo.h1',
    category: 'seo',
    weight: 4,
    severity: 'high',
    measurement: 'measured',
    title: 'H1 heading',
    description:
      'The page should have exactly one H1 that states the main topic in plain language.',
    why: 'The H1 anchors the heading hierarchy for crawlers and screen readers; without it the page has no top-level topic.',
    fix: 'Use a single <h1> containing the page’s primary phrase, then nest <h2>/<h3> sections beneath it.',
  }),
  def({
    id: 'seo.h1_multiple',
    category: 'seo',
    weight: 2,
    severity: 'medium',
    measurement: 'measured',
    title: 'Multiple H1 headings',
    description: 'More than one H1 on a page blurs which heading represents the main topic.',
    why: 'Competing H1s weaken the topical signal and confuse the outline that search engines and assistive technology build.',
    fix: 'Demote secondary H1s to <h2> so exactly one H1 remains at the top of the outline.',
  }),
  def({
    id: 'seo.heading_structure',
    category: 'seo',
    weight: 2,
    severity: 'medium',
    measurement: 'measured',
    title: 'Heading structure (H2/H3)',
    description:
      'Content pages should organise sections with H2 and H3 headings instead of jumping straight from a title to plain paragraphs.',
    why: 'Structured headings let crawlers parse subtopics and let readers scan the page.',
    fix: 'Break long sections into <h2> topics and <h3> subtopics that follow the order they appear on the page.',
  }),
  def({
    id: 'seo.images_alt',
    category: 'seo',
    weight: 4,
    severity: 'high',
    measurement: 'measured',
    title: 'Image alt attributes',
    description:
      'Images should carry descriptive alt text so their content is indexable and understandable outside the pixels.',
    why: 'Alt text feeds image search, image sitemaps and any context where the picture cannot be rendered.',
    fix: 'Add meaningful alt="…" to informative images (describe the content, not “image of”), and alt="" only for decorative ones.',
  }),
  def({
    id: 'seo.links_internal',
    category: 'seo',
    weight: 2,
    severity: 'medium',
    measurement: 'measured',
    title: 'Internal links',
    description:
      'Pages should link to other pages on the same domain so crawlers can discover the rest of the site.',
    why: 'Internal links distribute authority and expose new or deep pages to indexing.',
    fix: 'Add 3–10 contextual links to related pages on your site using descriptive anchor text.',
  }),
  def({
    id: 'seo.links_external',
    category: 'seo',
    weight: 1,
    severity: 'low',
    measurement: 'measured',
    title: 'Outbound references',
    description:
      'Linking out to authoritative sources helps crawlers place the page in context (when justified by the content).',
    why: 'Pages that cite sources read as researched and useful; an isolated page rarely earns citations itself.',
    fix: 'Reference one or two genuinely useful external resources where they add value — do not add links just for the count.',
  }),
  def({
    id: 'seo.anchor_text',
    category: 'seo',
    weight: 3,
    severity: 'medium',
    measurement: 'measured',
    title: 'Anchor text quality',
    description:
      'Links should use descriptive anchor text. Phrases like “click here” or “read more” carry no topical information.',
    why: 'Anchor text is one of the strongest relevance cues for the destination page.',
    fix: 'Replace generic anchors with the destination page’s topic (“read our technical SEO checklist” instead of “read more”).',
  }),
  def({
    id: 'seo.structured_data',
    category: 'seo',
    weight: 3,
    severity: 'medium',
    measurement: 'measured',
    title: 'Structured data (JSON-LD)',
    description:
      'The page exposes no JSON-LD structured data, so search engines get no explicit entities (Organization, Product, Article, FAQ…).',
    why: 'Structured data enables rich results — breadcrumbs, FAQs, ratings — that increase visibility and click-through.',
    fix: 'Add a <script type="application/ld+json"> block describing the page’s primary entity and validate it with Google’s Rich Results Test.',
  }),
  def({
    id: 'seo.og',
    category: 'seo',
    weight: 2,
    severity: 'medium',
    measurement: 'measured',
    title: 'Open Graph tags',
    description:
      'The document head should publish og:title, og:description and og:image for link unfurling.',
    why: 'Open Graph metadata controls how the page appears when shared — a broken preview costs referrals.',
    fix: 'Add the og:* properties in <head>; they also serve as fallbacks for many crawlers and messaging apps.',
  }),
  def({
    id: 'seo.lang',
    category: 'seo',
    weight: 3,
    severity: 'high',
    measurement: 'measured',
    title: 'HTML language declaration',
    description:
      'The <html> element should declare its language with a lang attribute (e.g. lang="en").',
    why: 'Language hints drive correct rendering, hyphenation, voice output and geo-targeting of the page.',
    fix: 'Set <html lang="xx"> using the correct BCP-47 code, e.g. lang="mai" for Maithili or lang="ar" for Arabic.',
  }),
  def({
    id: 'seo.viewport',
    category: 'seo',
    weight: 3,
    severity: 'high',
    measurement: 'measured',
    title: 'Mobile viewport meta tag',
    description:
      'The page must declare a responsive viewport so mobile devices render it at device width instead of a zoomed-out desktop.',
    why: 'Mobile-first indexing evaluates the mobile rendering; missing viewport metadata tanks mobile rankings.',
    fix: 'Add <meta name="viewport" content="width=device-width, initial-scale=1"> to <head> and use responsive CSS.',
  }),

  /* ------------------------------- PERFORMANCE ------------------------------ */
  def({
    id: 'perf.fetch_time',
    category: 'performance',
    weight: 3,
    severity: 'medium',
    measurement: 'measured',
    title: 'HTML fetch time',
    description:
      'Time your browser needed to download this page’s HTML during the audit run. It reflects server response speed for this request only — not full page-load performance.',
    why: 'Time-to-first-byte strongly influences how fast everything else can start.',
    fix: 'Reduce server work per request, enable edge caching or a CDN, and keep the initial HTML document small.',
  }),
  def({
    id: 'perf.resource_count',
    category: 'performance',
    weight: 2,
    severity: 'low',
    measurement: 'measured',
    title: 'Total resource count',
    description:
      'The number of scripts, stylesheets, images, fonts and iframes the document references. Heavy pages schedule more downloads and more main-thread work.',
    why: 'Every extra request adds connection overhead and competes for bandwidth on mobile networks.',
    fix: 'Audit the list: remove unused libraries, inline critical CSS, and lazy-load everything below the fold.',
  }),
  def({
    id: 'perf.js_count',
    category: 'performance',
    weight: 3,
    severity: 'medium',
    measurement: 'measured',
    title: 'JavaScript payload',
    description:
      'The count of script files the page loads. Each one is parsed, compiled and executed before the page feels responsive.',
    why: 'Excessive JavaScript is the most common cause of long tasks, input delay and layout thrash.',
    fix: 'Ship less JS: split routes, tree-shake, defer non-critical scripts and delete unused dependencies.',
  }),
  def({
    id: 'perf.css_count',
    category: 'performance',
    weight: 1,
    severity: 'low',
    measurement: 'measured',
    title: 'Stylesheets',
    description:
      'The number of external stylesheets. Each blocking stylesheet delays first paint until it downloads and parses.',
    why: 'Render-blocking CSS directly pushes back Largest Contentful Paint.',
    fix: 'Consolidate CSS into one bundle, inline the critical above-the-fold rules and load the rest asynchronously.',
  }),
  def({
    id: 'perf.render_blocking',
    category: 'performance',
    weight: 4,
    severity: 'high',
    measurement: 'measured',
    title: 'Render-blocking scripts',
    description:
      'Scripts placed in <head> without async/defer block HTML parsing, so nothing renders until they finish downloading.',
    why: 'Render-blocking resources are the classic cause of white-screen time on slow connections.',
    fix: 'Add defer (or async for independent scripts) to head scripts, or move them to the end of <body>.',
  }),
  def({
    id: 'perf.images_modern',
    category: 'performance',
    weight: 3,
    severity: 'medium',
    measurement: 'measured',
    title: 'Modern image formats',
    description:
      'Images referenced with legacy formats (JPEG/PNG) are typically 30–70% heavier than WebP or AVIF at the same quality.',
    why: 'Images dominate page weight on most websites and drive LCP on image-led pages.',
    fix: 'Serve WebP/AVIF with <picture> fallbacks, and size each image to its rendered dimensions (no 4000px assets in 400px slots).',
  }),
  def({
    id: 'perf.image_dimensions',
    category: 'performance',
    weight: 2,
    severity: 'medium',
    measurement: 'measured',
    title: 'Image dimensions (layout shifts)',
    description:
      'Images without explicit width/height attributes let the browser reserve unknown space, causing content to jump while loading.',
    why: 'Layout shifts accumulate in Cumulative Layout Shift, a Core Web Vital that affects both rankings and users.',
    fix: 'Set width and height attributes (or an aspect-ratio CSS rule) on every <img>, plus object-fit where cropping is needed.',
  }),
  def({
    id: 'perf.lazy_loading',
    category: 'performance',
    weight: 2,
    severity: 'low',
    measurement: 'measured',
    title: 'Lazy loading for below-the-fold images',
    description:
      'Image-heavy pages that load everything up-front waste bandwidth on content the visitor may never reach.',
    why: 'Eager loading delays the initial viewport and burns mobile data.',
    fix: 'Add loading="lazy" to images below the fold (keep the LCP image eager and fetchpriority="high").',
  }),
  def({
    id: 'perf.caching',
    category: 'performance',
    weight: 2,
    severity: 'medium',
    measurement: 'requires_api',
    title: 'Caching headers',
    description:
      'Cache-Control, ETag and Expires headers decide whether repeat visits reuse bytes. Browsers cannot read response headers of another origin, so this run could not verify them.',
    why: 'Missing caching means every visit re-downloads unchanged assets.',
    fix: 'Set long-lived Cache-Control for hashed static assets and revalidation for HTML; verify in your CDN or with a server-side header check.',
  }),
  def({
    id: 'perf.compression',
    category: 'performance',
    weight: 3,
    severity: 'medium',
    measurement: 'requires_api',
    title: 'Content compression',
    description:
      'gzip or Brotli compression of HTML/JS/CSS is a transport-level feature reported in response headers, which a browser cannot observe cross-origin.',
    why: 'Uncompressed payloads can be 3–5× larger, slowing first load on mobile networks.',
    fix: 'Enable Brotli (fallback gzip) at the origin or CDN for text assets; verify with a server-side or curl-based header check.',
  }),
  def({
    id: 'perf.core_web_vitals',
    category: 'performance',
    weight: 5,
    severity: 'critical',
    measurement: 'requires_api',
    title: 'Core Web Vitals (LCP, INP, CLS)',
    description:
      'Real Core Web Vitals come from lab runs (Lighthouse) or field data (CrUX / PageSpeed Insights). A static browser audit cannot measure them honestly.',
    why: 'LCP, INP and CLS are confirmed Google ranking signals and describe real user experience.',
    fix: 'Connect the PageSpeed Insights adapter (see README “Audit APIs”) or run Lighthouse in CI, then merge the scores into this report.',
  }),
  def({
    id: 'perf.page_timing',
    category: 'performance',
    weight: 4,
    severity: 'high',
    measurement: 'requires_api',
    title: 'Full page-load timing',
    description:
      'DOMContentLoaded and load timings of the audited page are not observable from another origin — only this run’s HTML download was timed.',
    why: 'Load milestones reveal slow third parties and long main-thread work that block interaction.',
    fix: 'Measure with the Performance API on your own site, or integrate a server/lab API (PageSpeed, Lighthouse) through the audit provider adapter.',
  }),

  /* ------------------------------- ACCESSIBILITY ---------------------------- */
  def({
    id: 'a11y.images_alt',
    category: 'accessibility',
    weight: 5,
    severity: 'critical',
    measurement: 'measured',
    title: 'Images without alt text',
    description:
      'Every content image needs an alt attribute. Without it, screen readers announce file names and users get no equivalent information.',
    why: 'WCAG 2.2 SC 1.1.1 (Non-text Content) is a Level A requirement — a single missing alt fails the whole criterion.',
    fix: 'Add alt="…" describing the image’s purpose; use alt="" only for purely decorative images so they are skipped.',
  }),
  def({
    id: 'a11y.form_labels',
    category: 'accessibility',
    weight: 5,
    severity: 'critical',
    measurement: 'measured',
    title: 'Form fields without labels',
    description:
      'Input, select and textarea elements must have an associated label — by <label for>, wrapping label, aria-label or aria-labelledby.',
    why: 'Unlabelled fields are unusable with screen readers and error-prone for everyone (WCAG 3.3.2).',
    fix: 'Give each control a unique id and a <label for="…"> with the visible prompt, or an aria-label when the design has no visible label.',
  }),
  def({
    id: 'a11y.buttons',
    category: 'accessibility',
    weight: 4,
    severity: 'high',
    measurement: 'measured',
    title: 'Buttons without an accessible name',
    description:
      'Icon-only buttons or ARIA button roles must expose a name (text, aria-label or aria-labelledby).',
    why: 'Screen-reader users hear “button” with no clue what it does (WCAG 4.1.2 Name, Role, Value).',
    fix: 'Add aria-label="Close menu" (or visible text) to every icon-only control and keep it specific to the action.',
  }),
  def({
    id: 'a11y.links',
    category: 'accessibility',
    weight: 4,
    severity: 'high',
    measurement: 'measured',
    title: 'Links without an accessible name',
    description:
      'Anchor tags must contain discernible text — an image with alt, a label, or readable inner text.',
    why: 'Screen-reader users navigate by link list; unnamed links are indistinguishable (WCAG 2.4.4).',
    fix: 'Put meaningful text inside the <a>, or supply aria-label when the visible content is an icon.',
  }),
  def({
    id: 'a11y.heading_order',
    category: 'accessibility',
    weight: 3,
    severity: 'medium',
    measurement: 'measured',
    title: 'Heading hierarchy',
    description:
      'Heading levels should descend one step at a time (h2 → h3), never skipping levels for visual styling.',
    why: 'Assistive technology uses heading order to navigate; skipped levels break the outline (WCAG 1.3.1).',
    fix: 'Choose headings by document structure, not font size — style them with CSS instead of skipping <h2> for <h4>.',
  }),
  def({
    id: 'a11y.lang',
    category: 'accessibility',
    weight: 4,
    severity: 'high',
    measurement: 'measured',
    title: 'Document language attribute',
    description:
      'The root <html> element must declare the page language so assistive tech picks the right pronunciation.',
    why: 'A screen reader reading Maithili text with an English voice is unintelligible (WCAG 3.1.1).',
    fix: 'Set <html lang="mai"> (or the correct code) and use lang="…" on passages that switch language inline.',
  }),
  def({
    id: 'a11y.viewport',
    category: 'accessibility',
    weight: 3,
    severity: 'high',
    measurement: 'measured',
    title: 'Zooming is allowed',
    description:
      'The viewport directive must not disable pinch-zoom (user-scalable=no or maximum-scale below 2).',
    why: 'Users with low vision must be able to zoom to 200% (WCAG 1.4.4 Resize Text).',
    fix: 'Use content="width=device-width, initial-scale=1" with no user-scalable or maximum-scale restrictions.',
  }),
  def({
    id: 'a11y.contrast',
    category: 'accessibility',
    weight: 5,
    severity: 'high',
    measurement: 'requires_api',
    title: 'Colour contrast ratios',
    description:
      'Contrast must be computed from rendered styles and computed colours; fetched HTML alone cannot reveal real text/background pairs.',
    why: 'Insufficient contrast is one of the most common WCAG 1.4.3 (AA) failures.',
    fix: 'Run the page through an axe/Lighthouse integration (see README “Audit APIs”) and enforce 4.5:1 for body text, 3:1 for large text.',
  }),
  def({
    id: 'a11y.landmarks',
    category: 'accessibility',
    weight: 3,
    severity: 'medium',
    measurement: 'measured',
    title: 'Landmark structure (main)',
    description:
      'A page should expose a <main> landmark (or role="main") so users can jump straight to primary content.',
    why: 'Landmarks are the keyboard/screen-reader equivalent of a visible page structure (WCAG 1.3.1).',
    fix: 'Wrap the primary content in <main id="main"> and use <header>, <nav> and <footer> for the other regions.',
  }),
  def({
    id: 'a11y.skip_link',
    category: 'accessibility',
    weight: 2,
    severity: 'low',
    measurement: 'measured',
    title: 'Skip-to-content link',
    description:
      'Pages with repeated navigation should offer a first-focusable link that jumps to the main content.',
    why: 'Keyboard users otherwise tab through the whole menu on every page (WCAG 2.4.1 Bypass Blocks).',
    fix: 'Add <a class="skip-link" href="#main">Skip to content</a> as the first element in <body> and give <main> id="main".',
  }),
  def({
    id: 'a11y.aria',
    category: 'accessibility',
    weight: 3,
    severity: 'medium',
    measurement: 'measured',
    title: 'ARIA references',
    description:
      'aria-labelledby, aria-describedby and aria-controls must point to IDs that exist; aria-hidden regions must not contain focusable elements.',
    why: 'Broken ARIA silently removes labels and traps focus, often worse than no ARIA at all (WCAG 4.1.2).',
    fix: 'Fix the referenced ids or remove the attribute; prefer native HTML elements over ARIA role patches.',
  }),
  def({
    id: 'a11y.keyboard_patterns',
    category: 'accessibility',
    weight: 4,
    severity: 'high',
    measurement: 'measured',
    title: 'Keyboard blockers',
    description:
      'Positive tabindex values and javascript: links break natural keyboard order and often leave controls unreachable.',
    why: 'If a control cannot be reached and operated by keyboard, it fails WCAG 2.1.1 for a share of your users.',
    fix: 'Remove tabindex > 0, replace javascript: anchors with <button>, and verify the whole flow with a single keyboard pass.',
  }),

  /* --------------------------------- SECURITY ------------------------------- */
  def({
    id: 'sec.https',
    category: 'security',
    weight: 5,
    severity: 'critical',
    measurement: 'measured',
    title: 'Served over HTTPS',
    description:
      'The audited URL must resolve over https:// — encrypted transport is the baseline for any site.',
    why: 'HTTP exposes visitors to interception and is flagged as “Not secure” by browsers; HTTPS is also a ranking signal.',
    fix: 'Issue a TLS certificate (e.g. via your host or Cloudflare) and 301-redirect every http:// request to https://.',
  }),
  def({
    id: 'sec.mixed_content',
    category: 'security',
    weight: 5,
    severity: 'critical',
    measurement: 'measured',
    title: 'Mixed content',
    description:
      'On an HTTPS page, subresources requested over http:// (images, scripts, styles, iframes) are blocked or downgraded.',
    why: 'Browsers block active mixed content entirely, which breaks features; passive mixed content triggers security warnings.',
    fix: 'Change every subresource to https:// or protocol-relative paths, and set a strict Content-Security-Policy to prevent regressions.',
  }),
  def({
    id: 'sec.csp',
    category: 'security',
    weight: 3,
    severity: 'high',
    measurement: 'measured',
    title: 'Content Security Policy',
    description:
      'No Content-Security-Policy meta tag was found in the document. The HTTP header form exists too, but headers are not readable from this browser run.',
    why: 'CSP is the main defence against injected scripts, XSS and unwanted third-party calls.',
    fix: 'Ship a CSP — start with a reporting-only header (Content-Security-Policy-Report-Only), then enforce; keep it out of <meta> if you need frame-ancestors.',
  }),
  def({
    id: 'sec.hsts',
    category: 'security',
    weight: 4,
    severity: 'high',
    measurement: 'requires_api',
    title: 'HTTP Strict Transport Security',
    description:
      'HSTS is a response header (Strict-Transport-Security); browsers cannot read another origin’s headers, so this could not be verified.',
    why: 'HSTS prevents protocol-downgrade and cookie-hijacking attacks for the lifetime of the header.',
    fix: 'Add Strict-Transport-Security: max-age=31536000; includeSubDomains on your HTTPS responses (server or CDN setting).',
  }),
  def({
    id: 'sec.x_content_type',
    category: 'security',
    weight: 3,
    severity: 'medium',
    measurement: 'requires_api',
    title: 'X-Content-Type-Options',
    description:
      'The nosniff header is only visible in HTTP responses, so a browser-only audit cannot confirm it is set.',
    why: 'Without nosniff, browsers may MIME-sniff and execute content as script.',
    fix: 'Send X-Content-Type-Options: nosniff on all responses; verify with a server-side header check.',
  }),
  def({
    id: 'sec.referrer_policy',
    category: 'security',
    weight: 2,
    severity: 'medium',
    measurement: 'measured',
    title: 'Referrer policy',
    description:
      'A referrer policy (meta tag or header) should limit how much URL detail leaks to third parties. Only the meta form is observable from this run.',
    why: 'Leaking full URLs — with tokens or paths — to external sites is a privacy and security issue.',
    fix: 'Add <meta name="referrer" content="strict-origin-when-cross-origin"> or send the equivalent header.',
  }),
  def({
    id: 'sec.permissions_policy',
    category: 'security',
    weight: 2,
    severity: 'medium',
    measurement: 'requires_api',
    title: 'Permissions-Policy',
    description:
      'Permissions-Policy is delivered as an HTTP header; browser-side audits cannot inspect it, so it is reported as unverified.',
    why: 'It stops unwanted feature access (camera, microphone, geolocation) by third-party scripts.',
    fix: 'Send Permissions-Policy: camera=(), microphone=(), geolocation=() (allow what you actually use) from your server or CDN.',
  }),
  def({
    id: 'sec.form_action',
    category: 'security',
    weight: 3,
    severity: 'high',
    measurement: 'measured',
    title: 'Secure form actions',
    description:
      'Forms must submit to HTTPS endpoints (or same-page relative actions) on an HTTPS page.',
    why: 'Credentials posted over http:// travel in clear text and are trivial to capture on hostile networks.',
    fix: 'Use relative form actions or absolute https:// URLs, and set autocomplete attributes plus CSRF protection server-side.',
  }),

  /* ------------------------------ TECHNICAL SEO ----------------------------- */
  def({
    id: 'tech.robots_txt',
    category: 'technical',
    weight: 4,
    severity: 'high',
    measurement: 'measured',
    title: 'robots.txt availability',
    description:
      'The site should expose a valid /robots.txt so crawlers know the crawl budget rules and where the sitemap lives.',
    why: 'A missing robots.txt is allowed but leaves crawling rules — and sitemap discovery — to chance.',
    fix: 'Publish /robots.txt with a User-agent: section and a Sitemap: line; keep critical pages disallow-free.',
  }),
  def({
    id: 'tech.sitemap',
    category: 'technical',
    weight: 4,
    severity: 'high',
    measurement: 'measured',
    title: 'XML sitemap',
    description:
      'An XML sitemap (linked from robots.txt or available at /sitemap.xml) should list the site’s indexable URLs.',
    why: 'Sitemaps speed up discovery of new and deep pages and carry lastmod hints for recrawling.',
    fix: 'Generate /sitemap.xml automatically, reference it from robots.txt, and keep only 200-status, canonical URLs inside.',
  }),
  def({
    id: 'tech.redirects',
    category: 'technical',
    weight: 3,
    severity: 'medium',
    measurement: 'estimated',
    title: 'Redirect behaviour',
    description:
      'The final URL differs from the address that was requested, so at least one redirect sits between them (www, trailing slash, http→https or path change).',
    why: 'Redirect chains add latency and split signals; the canonical version should be reachable without hops.',
    fix: 'Link directly to the final URL everywhere and collapse chains to a single 301 to the canonical host.',
  }),
  def({
    id: 'tech.url_structure',
    category: 'technical',
    weight: 3,
    severity: 'medium',
    measurement: 'measured',
    title: 'URL structure',
    description:
      'URLs should be short, lowercase, stable and free of unnecessary parameters, underscores or session noise.',
    why: 'Clean URLs are easier to crawl, share, remember and rank; messy parameters create infinite duplicates.',
    fix: 'Use lowercase hyphenated paths, limit query parameters, and canonicalise every variant to one URL.',
  }),
  def({
    id: 'tech.https_redirect',
    category: 'technical',
    weight: 3,
    severity: 'high',
    measurement: 'requires_api',
    title: 'HTTP → HTTPS redirect',
    description:
      'Verifying that http:// redirects to https:// requires a separate server-side request that a browser-only run cannot make safely.',
    why: 'If HTTP stays reachable, users and crawlers split between two versions of the site.',
    fix: 'Force a 301 from http:// to https:// (host/CDN rule) and preload your domain in HSTS; verify with curl or a server-side check.',
  }),
  def({
    id: 'tech.hreflang',
    category: 'technical',
    weight: 3,
    severity: 'medium',
    measurement: 'measured',
    title: 'Hreflang annotations',
    description:
      'For multilingual sites, every language version should declare hreflang alternates (including a self-reference or x-default).',
    why: 'Without reciprocal hreflang, search engines guess language targeting and may serve the wrong locale.',
    fix: 'Add <link rel="alternate" hreflang="xx" href="…"> for each version on every version, plus x-default, and keep them reciprocal.',
  }),
  def({
    id: 'tech.favicon',
    category: 'technical',
    weight: 2,
    severity: 'low',
    measurement: 'measured',
    title: 'Favicon',
    description:
      'The site should publish a favicon (link rel="icon" declaration or a valid /favicon.ico).',
    why: 'Icons appear in bookmarks, tabs and search enhancements; a missing icon reads as unmaintained.',
    fix: 'Add <link rel="icon" href="/favicon.svg"> plus apple-touch-icon and confirm /favicon.ico resolves.',
  }),
  def({
    id: 'tech.charset',
    category: 'technical',
    weight: 2,
    severity: 'medium',
    measurement: 'measured',
    title: 'Character encoding',
    description:
      'The document should declare a charset (UTF-8 recommended) inside the first kilobytes of the head.',
    why: 'Late or missing charset declarations can garble non-Latin text — exactly the scripts this tool serves.',
    fix: 'Put <meta charset="utf-8"> as the first child of <head> and serve text/html; charset=utf-8.',
  }),
  def({
    id: 'tech.pagination',
    category: 'technical',
    weight: 2,
    severity: 'low',
    measurement: 'measured',
    title: 'Pagination indicators',
    description:
      'Paginated series should expose rel=next/prev or clearly crawlable page links so crawlers traverse the sequence.',
    why: 'Hidden pagination traps content behind client-only interactions that crawlers never trigger.',
    fix: 'Add <link rel="next/prev"> annotations and standard <a href> links (not JS-only handlers) between pages.',
  }),
  def({
    id: 'tech.html_size',
    category: 'technical',
    weight: 2,
    severity: 'low',
    measurement: 'measured',
    title: 'HTML document size',
    description:
      'The raw HTML response should stay lean; oversized documents delay parsing and inflate every subsequent render step.',
    why: 'A heavy DOM means longer parse times, more memory and slower interaction on low-end devices.',
    fix: 'Paginate or stream heavy markup, remove dormant DOM, and avoid inlining huge data blobs into the HTML.',
  }),
  def({
    id: 'tech.x_robots_tag',
    category: 'technical',
    weight: 3,
    severity: 'medium',
    measurement: 'requires_api',
    title: 'X-Robots-Tag header',
    description:
      'The X-Robots-Tag response header can noindex files site-wide; it is server-side and not observable from this browser run.',
    why: 'A stray X-Robots-Tag: noindex silently deindexes entire sections without any on-page signal.',
    fix: 'Inspect response headers server-side (or with curl) and remove unintended noindex directives.',
  }),

  /* --------------------------------- CONTENT -------------------------------- */
  def({
    id: 'content.word_count',
    category: 'content',
    weight: 4,
    severity: 'high',
    measurement: 'measured',
    title: 'Content depth (word count)',
    description:
      'Thin pages rarely satisfy intent. Most competitive pages carry a few hundred words of unique, relevant text.',
    why: 'Search engines need enough context to match the page to queries; readers need enough detail to act.',
    fix: 'Expand the page with genuinely useful detail — answer follow-up questions, add examples and data — never filler text.',
  }),
  def({
    id: 'content.headings',
    category: 'content',
    weight: 2,
    severity: 'medium',
    measurement: 'measured',
    title: 'Heading coverage',
    description: 'Content pages should break the text into at least a couple of headed sections.',
    why: 'Headings make long text scannable and give crawlers a section-level map of the topic.',
    fix: 'Split the copy into 2+ <h2> sections that mirror the questions the page answers.',
  }),
  def({
    id: 'content.paragraphs',
    category: 'content',
    weight: 1,
    severity: 'low',
    measurement: 'measured',
    title: 'Paragraph structure',
    description:
      'The page should use real <paragraph> blocks rather than unstructured runs of text.',
    why: 'Short paragraphs improve readability and keep mobile readers from bouncing.',
    fix: 'Wrap text in <p> tags and keep paragraphs to 2–4 sentences on mobile widths.',
  }),
  def({
    id: 'content.images',
    category: 'content',
    weight: 1,
    severity: 'low',
    measurement: 'measured',
    title: 'Visual content',
    description:
      'Pages benefit from relevant images, diagrams or screenshots that support the text.',
    why: 'Visuals increase time-on-page and provide additional image-search entry points.',
    fix: 'Add original visuals where they clarify the topic, each with descriptive alt text and compressed files.',
  }),
  def({
    id: 'content.links',
    category: 'content',
    weight: 2,
    severity: 'medium',
    measurement: 'measured',
    title: 'Links inside content',
    description:
      'The body copy should link to related internal (and occasionally external) resources.',
    why: 'Contextual links help both readers and crawlers move through your topic cluster.',
    fix: 'Add 3–10 contextual links to related pages using descriptive anchors.',
  }),
  def({
    id: 'content.text_ratio',
    category: 'content',
    weight: 3,
    severity: 'medium',
    measurement: 'estimated',
    title: 'Text-to-HTML ratio',
    description:
      'The share of visible text versus raw HTML. A very low ratio means heavy markup, wrappers and scripts outweigh the actual content.',
    why: 'Extremely low ratios often flag boilerplate-heavy or dynamically assembled pages that are hard to index.',
    fix: 'Trim redundant wrappers, move data out of the HTML into APIs, and server-render the actual content.',
  }),
  def({
    id: 'content.keywords',
    category: 'content',
    weight: 2,
    severity: 'low',
    measurement: 'estimated',
    title: 'Term frequency profile',
    description:
      'Frequent meaningful terms indicate topical focus. This is a frequency snapshot of the page text — not a ranking-keyword analysis.',
    why: 'A scattered term profile suggests the page tries to cover too much or too little.',
    fix: 'Align the top terms with the one topic you want to rank for; remove off-topic sections or split them into separate pages.',
  }),
  def({
    id: 'content.readability',
    category: 'content',
    weight: 2,
    severity: 'low',
    measurement: 'estimated',
    title: 'Readability grade',
    description:
      'A Flesch-style grade level estimated from word and sentence length (English-like text only). Higher grades mean denser sentences.',
    why: 'Content above roughly grade 12 loses less-specialised readers and performs worse in featured snippets.',
    fix: 'Shorten sentences, prefer active voice and replace jargon — aim for a grade level close to 8–10.',
  }),

  /* ---------------------------------- SOCIAL -------------------------------- */
  def({
    id: 'social.og_title',
    category: 'social',
    weight: 4,
    severity: 'high',
    measurement: 'measured',
    title: 'og:title',
    description:
      'Open Graph needs a title to show when the page is shared on social platforms and messengers.',
    why: 'The share title is the only chance to earn the click in a crowded feed.',
    fix: 'Add <meta property="og:title" content="…"> (≈ 60 characters) mirroring the page’s most compelling angle.',
  }),
  def({
    id: 'social.og_description',
    category: 'social',
    weight: 4,
    severity: 'high',
    measurement: 'measured',
    title: 'og:description',
    description: 'The sharing card needs a short description beneath the title.',
    why: 'A tailored description converts far better than a truncated generic meta description.',
    fix: 'Add <meta property="og:description" content="…"> with 100–160 characters of benefit-led copy.',
  }),
  def({
    id: 'social.og_image',
    category: 'social',
    weight: 4,
    severity: 'high',
    measurement: 'measured',
    title: 'og:image preview image',
    description:
      'A share image makes links visually dominant in feeds. Its absence reduces posts to plain text links.',
    why: 'Image-led link previews significantly raise click-through on LinkedIn, X, WhatsApp and Facebook.',
    fix: 'Add <meta property="og:image" content="https://…/cover.png"> with a 1200×630 absolute HTTPS URL.',
  }),
  def({
    id: 'social.og_url',
    category: 'social',
    weight: 2,
    severity: 'low',
    measurement: 'measured',
    title: 'og:url canonical',
    description: 'og:url should point at the canonical address of the shared page.',
    why: 'Consistent og:url keeps share counts attached to one URL instead of spreading across variants.',
    fix: 'Set og:url to the same canonical URL declared in rel=canonical, always absolute and HTTPS.',
  }),
  def({
    id: 'social.og_basics',
    category: 'social',
    weight: 2,
    severity: 'low',
    measurement: 'measured',
    title: 'Open Graph site metadata',
    description:
      'og:site_name and og:type complete the card and tell platforms how to interpret the object.',
    why: 'Incomplete cards fall back to scraped content that often looks broken.',
    fix: 'Add og:site_name, og:type (website or article) and optionally article:published_time.',
  }),
  def({
    id: 'social.twitter_card',
    category: 'social',
    weight: 4,
    severity: 'medium',
    measurement: 'measured',
    title: 'Twitter/X card markup',
    description:
      'A twitter:card value (summary, summary_large_image…) tells X how to render the link, with og:* as fallback.',
    why: 'Without a card declaration, X falls back to a bare URL — much weaker in the timeline.',
    fix: 'Add <meta name="twitter:card" content="summary_large_image"> plus twitter:title and twitter:description.',
  }),
  def({
    id: 'social.twitter_details',
    category: 'social',
    weight: 2,
    severity: 'low',
    measurement: 'measured',
    title: 'Twitter/X card details',
    description:
      'Explicit twitter:title and twitter:description (and ideally twitter:image) fine-tune the X preview.',
    why: 'X truncates differently than other platforms; explicit values avoid awkward cuts.',
    fix: 'Provide twitter:title (≤ 70 chars), twitter:description (≤ 200 chars) and twitter:image.',
  }),
];

export const CHECK_MAP: Map<string, CheckDef> = new Map(CHECKS.map((c) => [c.id, c]));

export function getCheck(id: string): CheckDef | undefined {
  return CHECK_MAP.get(id);
}

export function checksForCategory(category: AuditCategoryId): CheckDef[] {
  return CHECKS.filter((c) => c.category === category);
}
