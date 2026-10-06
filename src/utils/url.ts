export type UrlValidation =
  | { ok: true; url: string; normalized: string }
  | { ok: false; reason: 'empty' | 'invalid' | 'protocol' };

const SUPPORTED_PROTOCOLS = new Set(['http:', 'https:']);

/**
 * Add a scheme when the user typed `example.com` and trim noise.
 * Returns `null` when nothing usable remains.
 */
export function normalizeUrlInput(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed)) return trimmed;
  if (/^localhost(:\d+)?(\/|$)/i.test(trimmed)) return `http://${trimmed}`;
  if (/^[\w-]+(\.[\w-]+)+(:\d+)?(\/|$)/.test(trimmed)) return `https://${trimmed}`;
  return null;
}

/** Validate user input and return a normalized, fetchable URL. */
export function validateUrlInput(raw: string): UrlValidation {
  if (!raw.trim()) return { ok: false, reason: 'empty' };
  const candidate = normalizeUrlInput(raw);
  if (!candidate) return { ok: false, reason: 'invalid' };
  let parsed: URL;
  try {
    parsed = new URL(candidate);
  } catch {
    return { ok: false, reason: 'invalid' };
  }
  if (!SUPPORTED_PROTOCOLS.has(parsed.protocol)) return { ok: false, reason: 'protocol' };
  if (!parsed.hostname || !parsed.hostname.includes('.')) {
    if (parsed.hostname !== 'localhost') return { ok: false, reason: 'invalid' };
  }
  return { ok: true, url: parsed.href, normalized: parsed.href };
}

/** `https://example.com/page/` → `https://example.com` (used for cache keys). */
export function canonicalOrigin(url: string): string {
  try {
    const u = new URL(url);
    return `${u.protocol}//${u.host}`;
  } catch {
    return url;
  }
}

/** Resolve a possibly relative href against a base URL. Returns null when unusable. */
export function resolveHref(href: string | null | undefined, base: string): string | null {
  if (!href) return null;
  try {
    return new URL(href, base).href;
  } catch {
    return null;
  }
}

export function isInternalHref(href: string, baseUrl: string): boolean {
  try {
    return new URL(href).host === new URL(baseUrl).host;
  } catch {
    return false;
  }
}

/** Short host label for cards: `www.example.com` → `example.com`. */
export function displayHost(url: string): string {
  try {
    const u = new URL(url);
    return u.hostname.replace(/^www\./, '') + (u.pathname !== '/' ? u.pathname : '');
  } catch {
    return url;
  }
}

/** Filesystem-safe slug used for PDF file names. */
export function urlSlug(url: string): string {
  try {
    const u = new URL(url);
    return (u.hostname.replace(/^www\./, '') || 'report').replace(/[^\w.-]+/g, '-');
  } catch {
    return 'report';
  }
}
