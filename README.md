# WebAudit Pro

Free, multilingual website audit tool. Paste any URL and get a 7-category report — **SEO, Performance, Accessibility, Security, Technical SEO, Content, Social** — with ~75 checks, honest scoring, charts, actionable fixes and a client-side PDF download. No account, no server, no tracking by default.

- **30 languages**, including मैथिली (Maithili), with RTL support for Arabic, Urdu and Persian.
- **Runs entirely in the browser**: the page is fetched and analysed locally; an API adapter is available for checks that need server-side access.
- **Honest scoring**: every check is labelled _measured_, _estimated_, _unavailable_ or _requires_api_ — unmeasurable checks never inflate or deflate a score.
- **Client-side PDF reports** rendered on canvas → jsPDF, with print and same-device share links.
- **SEO-ready**: tool landing pages, legal pages, localized routes, generated `sitemap.xml` with hreflang alternates, robots.txt, manifest, JSON-LD.

## Tech stack

React 19 · TypeScript · Vite 6 · Tailwind CSS 3 · React Router 7 · jsPDF · ESLint (flat) + Prettier. Static SPA — deployable to Cloudflare Pages or any static host.

## Getting started

```bash
bun install        # or: npm install
bun run dev        # dev server on 0.0.0.0:5173
bun run build      # typecheck (tsc -b) + vite build → dist/
bun run typecheck  # tsc -b --noEmit
bun run lint       # eslint .
bun run format     # prettier --write .
bun run sitemap    # regenerate public/sitemap.xml from the page registry
```

## Configuration (env)

Copy `env.example` to `.env` (or `.env.local`) and fill in what you need. All variables are `VITE_`-prefixed, i.e. **public build-time config**, not secrets:

| Variable                        | Purpose                                                                                                                                                                                                                                                                                                |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `VITE_SITE_URL`                 | Canonical origin used for canonical/OG URLs, robots.txt and sitemap (default `https://webauditpro.example.com`). Set this to your real domain after deploying.                                                                                                                                         |
| `VITE_ADSENSE_CLIENT_ID`        | AdSense publisher id (`ca-pub-…`). Until set, ad slots render a labelled placeholder.                                                                                                                                                                                                                  |
| `VITE_GA_MEASUREMENT_ID`        | GA4 measurement id (`G-…`). Analytics loads only after cookie consent.                                                                                                                                                                                                                                 |
| `VITE_GOOGLE_SITE_VERIFICATION` | Google Search Console meta verification token.                                                                                                                                                                                                                                                         |
| `VITE_AUDIT_PROXY_URL`          | Override the primary CORS proxy template (use `{url}` for the encoded target), or set `off` to disable proxy fallbacks entirely. Defaults to Jina Reader, with allorigins/codetabs/cors.lol as fallbacks — some sites (e.g. behind Cloudflare without CORS headers) can only be audited through these. |

Alternatively edit `src/config/site.ts` — branding, languages, ad slots and social links live only there. Note: `.env*` filenames are blocked in this workspace, hence the `env.example` (no leading dot) template.

## How the audit works

```
src/audit/
  facts.ts        # fetches HTML (via src/services/audit) + parses facts with DOMParser
  checks.ts       # the 75-check catalog: id, category, weight, severity, measurement
  evaluators/     # one module per category, pure functions over the facts
  scoring.ts      # status → points, coverage adjustment, category roll-up
  metrics.ts      # measured/estimated metrics surfaced in the report
  limitations.ts  # honest "what we could not measure" notes
  engine.ts       # runAudit() orchestration + stage progress
src/services/audit/
  browserProvider.ts  # default: fetch in the user's browser (CORS fallback proxies)
  apiProvider.ts      # adapter for a future server-side audit API
  index.ts            # provider selection — swap implementations, not callers
```

Checks are never hard-coded into components: UI reads the catalog, translations override via `checks.<id>.{title,description,fix}` (see `tCheck()` in `src/i18n`).

### Scoring methodology

- `pass` = full weight · `warning` = half weight · `fail` = 0 · `not_available` is excluded from the denominator entirely.
- Raw score is adjusted by coverage: `score = raw × (0.85 + 0.15 × coverage)` — a page where fewer checks could run is never punished with a falsely perfect score.
- A category with nothing measurable scores `null` and displays **Not available** instead of a number.
- Grades: `<40` poor · `<60` needs improvement · `<80` good · `<90` very good · `≥90` excellent.

### Adding a language

1. Add the code to `LANGUAGES` in `src/config/site.ts` (set `dir: 'rtl'` for right-to-left scripts).
2. Create `src/i18n/locales/<code>.json` — start from `en.json`; any missing key falls back to English. Optionally add `checks.<id>.*` overrides.
3. Run `bun run sitemap` to refresh hreflang alternates.

Localized routes are automatic: `/{lang}/…` for every non-default language, unprefixed for the default.

## Reports & PDF

Reports persist in `localStorage` (`wap.reports.v1`, max 12, one per URL) — share links open on the same device by design. PDF export renders pages to a 1240×1754 canvas (RTL-aware via `ctx.direction`) and packs the images into an A4 jsPDF document; the PDF library is lazy-loaded so it never blocks first paint.

## SEO pages

`src/config/pages.ts` is the single registry for tool landing pages and static/legal pages. Each renders at `/{path}` and `/{lang}/{path}`. `bun run sitemap` regenerates `public/sitemap.xml` (12 pages × 30 languages with `xhtml:link` hreflang sets) — rerun it whenever you add a page or language.

## Deployment

**Cloudflare Pages** (connect the GitHub repo: Workers & Pages → Create → Pages → Connect to Git):

- Build command `bun run build`, output directory `dist` (Vite is auto-detected).
- No build variables are required for the install: the committed `bun.lock` uses `lockfileVersion: 1`, which Cloudflare's default bun (1.2.15) parses as-is, so its automatic `bun install --frozen-lockfile` succeeds. (A _freshly generated_ lockfile under bun ≥ 1.4 gets `lockfileVersion: 2`, which bun 1.2.15 cannot read; if that ever happens, restore the committed lockfile or set build variable `BUN_VERSION` to your local `bun --version`.)
- Set `VITE_SITE_URL` to your production domain so canonicals, robots.txt and the sitemap point at the real origin.
- SPA routing ships in the repo: `public/_redirects` serves `index.html` for client-side routes (`/*  /index.html  200`) while existing static files such as `robots.txt` and `sitemap.xml` keep serving directly.

**Any static host**: run `bun install && bun run build` and serve the `dist/` directory.

## Adding a real audit API later

Implement `AuditProvider` in `src/services/audit/apiProvider.ts` (fetch facts server-side, return the same `Facts` shape) and switch the provider in `src/services/audit/index.ts`. Checks marked `requires_api` light up automatically — no UI or scoring changes needed.

## License

MIT — see [LICENSE](./LICENSE).
