import { useLocation, useNavigate } from 'react-router-dom';
import { useI18n } from '../i18n';
import { localizePath } from '../i18n/paths';
import { siteConfig } from '../config/site';
import { trackEvent } from '../services/analytics';

interface LanguageSwitcherProps {
  className?: string;
  /** Rendered inside header/footer with different visual density. */
  compact?: boolean;
}

/**
 * Native <select> based language picker: fully keyboard and screen-reader
 * accessible on every platform, and it shows each language's native name.
 */
export function LanguageSwitcher({ className, compact = false }: LanguageSwitcherProps) {
  const { lang, languages, setLang, t } = useI18n();
  const location = useLocation();
  const navigate = useNavigate();

  const handleChange = (code: string) => {
    if (code === lang) return;
    setLang(code);
    trackEvent('language_changed', { language: code });
    const target = localizePath(location.pathname, code, siteConfig.defaultLanguage);
    navigate(`${target}${location.search}${location.hash}`);
  };

  return (
    <div className={className}>
      <label htmlFor="language-switcher" className="sr-only">
        {t('common.selectLanguage')}
      </label>
      <div className="relative">
        <select
          id="language-switcher"
          value={lang}
          onChange={(event) => handleChange(event.target.value)}
          className={[
            'w-full cursor-pointer appearance-none rounded-lg border border-slate-200 bg-white font-medium text-ink-800',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-1',
            compact ? 'h-9 ps-8 pe-7 text-xs' : 'h-10 ps-3 pe-8 text-sm',
            className ?? '',
          ].join(' ')}
        >
          {languages.map((language) => (
            <option key={language.code} value={language.code}>
              {language.name}
            </option>
          ))}
        </select>
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 end-2.5 flex items-center text-slate-400"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d="M2.5 4.5 6 8l3.5-3.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </div>
    </div>
  );
}
