export interface LegalSection {
  heading: string;
  paragraphs: string[];
}

export interface LegalDocument {
  updated: string;
  sections: LegalSection[];
}

/**
 * Legal copy is authored in English (the source language). To localize a
 * document, add translated sections under `pages.<key>.*` in a locale file
 * and prefer them in `LegalPage` — the page chrome is already translated.
 */

export const privacyContent: LegalDocument = {
  updated: '2026-10-06',
  sections: [
    {
      heading: 'Overview',
      paragraphs: [
        'WebAudit Pro is a static website that audits publicly accessible web pages from your browser. We do not require an account and we do not ask for personal information.',
        'This policy explains what happens when you use the tool, which optional services load, and what you can control.',
      ],
    },
    {
      heading: 'Data stored on your device',
      paragraphs: [
        'Audit reports are saved in your browser’s local storage so you can reopen them, compare scores and use share links on the same device. Reports contain the audited URL, check results and the audit timestamp — no personal data.',
        'Your language preference and cookie-consent choice are also stored locally. You can clear them at any time through your browser settings, which also deletes stored reports.',
      ],
    },
    {
      heading: 'Requests we make',
      paragraphs: [
        'To audit a page, your browser downloads that page’s HTML directly from the website you entered. If the target site blocks cross-origin reads, the request may be routed through a public read-only CORS proxy (or, when configured, through our own audit API). Only the audited URL is transmitted; you never submit credentials or private data.',
        'The tool additionally requests /robots.txt, an XML sitemap and /favicon.ico from the audited origin to verify technical SEO signals.',
      ],
    },
    {
      heading: 'Optional cookies and third parties',
      paragraphs: [
        'Nothing optional loads until you choose to accept it in the consent banner.',
        'Google Analytics: if enabled and accepted, an anonymous usage measurement (Google Analytics 4) records page views and product events such as audit_started or pdf_downloaded. Google processes this data under its own privacy policy.',
        'Google AdSense: if enabled and accepted, Google may use cookies to serve and measure advertisements. You can opt out of personalised advertising through Google’s Ads Settings.',
      ],
    },
    {
      heading: 'Legal bases and your rights',
      paragraphs: [
        'Where GDPR or similar rules apply, optional processing relies on your consent, which you may withdraw at any time by rejecting it in the consent banner or clearing site data. Essential local storage is used to deliver the feature you explicitly requested.',
        'Because reports never leave your device by default, there is no account database to request deletion from. Clearing this site’s data removes everything we store.',
      ],
    },
    {
      heading: 'Contact',
      paragraphs: ['Questions about this policy: hello@webauditpro.example.com.'],
    },
  ],
};

export const termsContent: LegalDocument = {
  updated: '2026-10-06',
  sections: [
    {
      heading: 'Acceptance',
      paragraphs: [
        'By using WebAudit Pro you agree to these terms. If you do not agree, please do not use the service.',
      ],
    },
    {
      heading: 'Permitted use',
      paragraphs: [
        'You may audit pages you own or pages you are authorised to test, for personal, educational or commercial evaluation. Automated bulk auditing, scraping of the service, attempts to disrupt the service or using the tool to probe systems without authorisation are prohibited.',
        'You are responsible for the URLs you submit and for complying with the laws of your jurisdiction and the terms of the audited websites.',
      ],
    },
    {
      heading: 'The service is provided “as is”',
      paragraphs: [
        'WebAudit Pro performs browser-observable checks and clearly marks anything it cannot measure. Results may be incomplete, outdated or different from a full server-side audit. No warranty of any kind is given, including fitness for a particular purpose.',
      ],
    },
    {
      heading: 'Intellectual property',
      paragraphs: [
        'The site’s branding, design, documentation and source code are owned by the contributors and licensed under the license included in the repository. Audit reports you generate belong to you.',
      ],
    },
    {
      heading: 'Limitation of liability',
      paragraphs: [
        'To the maximum extent permitted by law, the operators of WebAudit Pro shall not be liable for any indirect, incidental or consequential damage arising from the use of the service, including lost rankings, lost revenue or security incidents on audited sites.',
      ],
    },
    {
      heading: 'Changes',
      paragraphs: [
        'These terms may be updated periodically. The “Last updated” date at the top of this page reflects the latest revision.',
      ],
    },
  ],
};

export const disclaimerContent: LegalDocument = {
  updated: '2026-10-06',
  sections: [
    {
      heading: 'Audit results are informational',
      paragraphs: [
        'WebAudit Pro reports what a browser can observe about a single public page. Scores, grades and recommendations are informational guidance — not a guarantee of search-engine rankings, traffic, security, compliance or performance.',
        'Search engines use hundreds of signals far beyond on-page markup, and they change those signals regularly. A high score does not imply a page will rank; a low score does not imply it will not.',
      ],
    },
    {
      heading: 'What this tool cannot verify',
      paragraphs: [
        'Response headers (including HSTS, Content-Security-Policy headers, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, caching and compression), full page-load timing, Core Web Vitals field data, site-wide crawling, DNS/WHOIS records, backlink profiles and uptime are examples of checks that require server-side or third-party API analysis.',
        'Every report lists the checks that could not be measured instead of estimating them. Connect the API adapter described in the documentation if you need those checks.',
      ],
    },
    {
      heading: 'Not professional advice',
      paragraphs: [
        'Nothing in the reports constitutes legal, security or compliance advice (for example GDPR, ADA or WCAG conformance). Automated checks catch common issues; they cannot certify conformance or replace a manual audit by a qualified specialist.',
      ],
    },
    {
      heading: 'Third-party content',
      paragraphs: [
        'The tool fetches third-party pages for analysis. We do not control that content and are not responsible for it. Reports may include third-party marks or trademarks solely for identification.',
      ],
    },
  ],
};

export const LEGAL_DOCUMENTS: Record<'privacy' | 'terms' | 'disclaimer', LegalDocument> = {
  privacy: privacyContent,
  terms: termsContent,
  disclaimer: disclaimerContent,
};
