import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import en from './locales/en.json';
import { LANGUAGES, SUPPORTED_LANGUAGE_CODES, siteConfig } from '../config/site';
import type { Language, LanguageDirection } from '../types';

type Dict = Record<string, unknown>;

export interface TranslateVars {
  [name: string]: string | number;
}

export interface I18nContextValue {
  /** Active language code. */
  lang: string;
  dir: LanguageDirection;
  /** False while the active locale file is still being downloaded. */
  ready: boolean;
  languages: Language[];
  /**
   * Translate a dotted key. Falls back to English, then to `fallback`,
   * then to the key itself (so missing copy is visible, never silent).
   */
  t: (key: string, vars?: TranslateVars, fallback?: string) => string;
  /** True when the active (non-fallback) dictionary provides the key. */
  has: (key: string) => boolean;
  /**
   * Check-catalog text: localized when a translation exists, otherwise the
   * English source of truth from `src/audit/checks.ts`.
   */
  tCheck: (checkId: string, field: 'title' | 'description' | 'fix', fallback: string) => string;
  setLang: (code: string) => void;
}

const STORAGE_KEY = 'wap.lang';
const enDict = en as unknown as Dict;

/** Lazily loaded locale files — one network chunk per language. */
const localeLoaders = import.meta.glob('./locales/*.json');

const I18nContext = createContext<I18nContextValue | null>(null);

function lookup(dict: Dict | undefined, key: string): string | undefined {
  if (!dict) return undefined;
  let node: unknown = dict;
  for (const part of key.split('.')) {
    if (typeof node !== 'object' || node === null) return undefined;
    node = (node as Dict)[part];
  }
  return typeof node === 'string' ? node : undefined;
}

function interpolate(template: string, vars?: TranslateVars): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    Object.prototype.hasOwnProperty.call(vars, name) ? String(vars[name]) : match,
  );
}

function detectInitialLang(): string {
  if (typeof window === 'undefined') return siteConfig.defaultLanguage;
  const segment = window.location.pathname.split('/').filter(Boolean)[0];
  if (segment && SUPPORTED_LANGUAGE_CODES.has(segment)) return segment;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored && SUPPORTED_LANGUAGE_CODES.has(stored)) return stored;
  } catch {
    /* storage unavailable — fall through */
  }
  const nav = window.navigator.language?.slice(0, 2);
  if (nav && SUPPORTED_LANGUAGE_CODES.has(nav)) return nav;
  return siteConfig.defaultLanguage;
}

async function loadLocale(code: string): Promise<Dict | null> {
  const loader = localeLoaders[`./locales/${code}.json`];
  if (!loader) return null;
  const mod = (await loader()) as { default?: Dict };
  return (mod.default ?? (mod as Dict)) as Dict;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<string>(detectInitialLang);
  const [dicts, setDicts] = useState<Record<string, Dict>>({ en: enDict });

  useEffect(() => {
    if (lang === 'en' || dicts[lang]) return;
    let alive = true;
    void loadLocale(lang).then((dict) => {
      if (alive && dict) setDicts((prev) => ({ ...prev, [lang]: dict }));
    });
    return () => {
      alive = false;
    };
  }, [lang, dicts]);

  const active = dicts[lang] ?? enDict;
  const ready = lang === 'en' || Boolean(dicts[lang]);
  const dir: LanguageDirection = LANGUAGES.find((l) => l.code === lang)?.dir ?? 'ltr';

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang, dir]);

  const t = useCallback(
    (key: string, vars?: TranslateVars, fallback?: string): string => {
      const value = lookup(active, key) ?? lookup(enDict, key) ?? fallback ?? key;
      return interpolate(value, vars);
    },
    [active],
  );

  const has = useCallback((key: string) => lookup(active, key) !== undefined, [active]);

  const tCheck = useCallback(
    (checkId: string, field: 'title' | 'description' | 'fix', fallback: string): string =>
      lookup(active, `checks.${checkId}.${field}`) ?? fallback,
    [active],
  );

  const setLang = useCallback((code: string) => {
    if (!SUPPORTED_LANGUAGE_CODES.has(code)) return;
    setLangState(code);
    try {
      window.localStorage.setItem(STORAGE_KEY, code);
    } catch {
      /* storage unavailable */
    }
  }, []);

  const value = useMemo<I18nContextValue>(
    () => ({ lang, dir, ready, languages: LANGUAGES, t, has, tCheck, setLang }),
    [lang, dir, ready, t, has, tCheck, setLang],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used inside <I18nProvider>');
  return ctx;
}
