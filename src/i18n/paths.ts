import { LANGUAGES } from '../config/site';

const codes = new Set(LANGUAGES.map((l) => l.code));

/** `/mai/free-seo-audit` → { lang: 'mai', rest: '/free-seo-audit' } */
export function splitLangFromPath(pathname: string): { lang: string | null; rest: string } {
  const parts = pathname.split('/').filter(Boolean);
  if (parts.length > 0 && codes.has(parts[0])) {
    const rest = '/' + parts.slice(1).join('/');
    return { lang: parts[0], rest: rest === '/' ? '/' : rest.replace(/\/$/, '') };
  }
  return { lang: null, rest: pathname };
}

/**
 * Localize a path for a language. The default language stays unprefixed so
 * canonical URLs never collide (`/free-seo-audit` vs `/en/free-seo-audit`).
 */
export function localizePath(path: string, lang: string, defaultLang: string): string {
  const clean = path.startsWith('/') ? path : `/${path}`;
  const { rest } = splitLangFromPath(clean);
  if (lang === defaultLang) return rest === '' ? '/' : rest;
  return `/${lang}${rest === '/' ? '' : rest}`;
}

/** First path segment, or null. */
export function pathLang(pathname: string): string | null {
  const parts = pathname.split('/').filter(Boolean);
  return parts.length > 0 && codes.has(parts[0]) ? parts[0] : null;
}
