/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Canonical origin of the deployed site (no trailing slash). */
  readonly VITE_SITE_URL?: string;
  /** Google Analytics 4 measurement id, e.g. G-XXXXXXXXXX. */
  readonly VITE_GA_MEASUREMENT_ID?: string;
  /** Google AdSense client id, e.g. ca-pub-XXXXXXXXXXXXXXXX. */
  readonly VITE_ADSENSE_CLIENT_ID?: string;
  /** Google Search Console verification token. */
  readonly VITE_GOOGLE_SITE_VERIFICATION?: string;
  /** Optional future server-side audit API base URL. */
  readonly VITE_AUDIT_API_URL?: string;
  /** Optional CORS proxy template containing `{url}`. `off` disables it. */
  readonly VITE_AUDIT_PROXY_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
