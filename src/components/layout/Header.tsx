import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useI18n } from '../../i18n';
import { localizePath } from '../../i18n/paths';
import { siteConfig } from '../../config/site';
import { TOOL_PAGES } from '../../config/pages';
import { LanguageSwitcher } from '../LanguageSwitcher';
import { trackEvent } from '../../services/analytics';
import { cn } from '../../utils/cn';

export function Header() {
  const { t, lang } = useI18n();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [location.pathname]);

  const home = localizePath('/', lang, siteConfig.defaultLanguage);
  const audit = `${home === '/' ? '/' : home}#audit`;
  const about = localizePath('/about', lang, siteConfig.defaultLanguage);
  const contact = localizePath('/contact', lang, siteConfig.defaultLanguage);
  const features = `${home === '/' ? '/' : home}#features`;

  const toolLinks = TOOL_PAGES.map((page) => ({
    to: localizePath(`/${page.path}`, lang, siteConfig.defaultLanguage),
    label: t(`tools.${page.contentKey}.title`),
  }));

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
      isActive ? 'text-brand-700' : 'text-ink-700 hover:bg-slate-100 hover:text-ink-950',
    );

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          to={home}
          className="flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 rounded-lg"
          aria-label={`${siteConfig.name} — ${t('nav.home')}`}
        >
          <span
            aria-hidden="true"
            className="grid size-9 place-items-center rounded-xl bg-brand-700 text-white shadow-sm"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" strokeWidth="2" />
              <path
                d="m15.5 15.5 4 4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M7.5 11.2l2 2 3.5-4.4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span className="text-[17px] font-extrabold tracking-tight text-ink-950">
            {siteConfig.name}
          </span>
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          <NavLink to={home} className={navLinkClass} end>
            {t('nav.home')}
          </NavLink>

          <details className="group relative">
            <summary className="flex cursor-pointer list-none items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-ink-700 transition-colors hover:bg-slate-100 hover:text-ink-950 [&::-webkit-details-marker]:hidden">
              {t('nav.tools')}
              <svg
                aria-hidden="true"
                width="10"
                height="10"
                viewBox="0 0 12 12"
                fill="none"
                className="transition-transform group-open:rotate-180"
              >
                <path
                  d="M2.5 4.5 6 8l3.5-3.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </summary>
            <div className="absolute start-0 top-full z-50 mt-1 w-72 rounded-xl border border-slate-200 bg-white p-2 shadow-lift animate-fade-in">
              {toolLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-ink-700 hover:bg-brand-50 hover:text-brand-800"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </details>

          <a
            href={features}
            className="rounded-lg px-3 py-2 text-sm font-medium text-ink-700 transition-colors hover:bg-slate-100 hover:text-ink-950"
          >
            {t('nav.product')}
          </a>
          <NavLink to={about} className={navLinkClass}>
            {t('nav.about')}
          </NavLink>
          <NavLink to={contact} className={navLinkClass}>
            {t('nav.contact')}
          </NavLink>
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSwitcher compact className="hidden sm:block w-32" />
          <Link
            to={audit}
            onClick={() => trackEvent('CTA_clicked', { location: 'header' })}
            className="hidden h-10 items-center rounded-xl bg-brand-600 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 sm:inline-flex"
          >
            {t('nav.cta')}
          </Link>
          <button
            type="button"
            className="grid size-10 place-items-center rounded-lg border border-slate-200 text-ink-800 hover:bg-slate-50 lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? t('nav.menuClose') : t('nav.menuOpen')}
            onClick={() => setOpen((value) => !value)}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              {open ? (
                <path
                  d="M4 4l10 10M14 4 4 14"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              ) : (
                <path
                  d="M3 5h12M3 9h12M3 13h12"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <div
          id="mobile-menu"
          className="border-t border-slate-200 bg-white px-4 pb-5 pt-3 lg:hidden animate-fade-in"
        >
          <nav aria-label="Mobile" className="flex flex-col gap-1">
            <NavLink to={home} className={navLinkClass} end>
              {t('nav.home')}
            </NavLink>
            <span className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              {t('nav.tools')}
            </span>
            {toolLinks.map((link) => (
              <NavLink key={link.to} to={link.to} className={navLinkClass}>
                {link.label}
              </NavLink>
            ))}
            <NavLink to={about} className={navLinkClass}>
              {t('nav.about')}
            </NavLink>
            <NavLink to={contact} className={navLinkClass}>
              {t('nav.contact')}
            </NavLink>
          </nav>
          <div className="mt-4 flex items-center gap-3">
            <LanguageSwitcher className="w-40" />
            <Link
              to={audit}
              onClick={() => trackEvent('CTA_clicked', { location: 'mobile-menu' })}
              className="inline-flex h-10 flex-1 items-center justify-center rounded-xl bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700"
            >
              {t('nav.cta')}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
