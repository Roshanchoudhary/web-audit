import { Link } from 'react-router-dom';
import { useI18n } from '../../i18n';
import { localizePath } from '../../i18n/paths';
import { siteConfig } from '../../config/site';
import { LanguageSwitcher } from '../LanguageSwitcher';

export function Footer() {
  const { t, lang } = useI18n();
  const p = (path: string) => localizePath(path, lang, siteConfig.defaultLanguage);

  const product = [
    { to: '/free-seo-audit', label: t('tools.freeSeoAudit.title') },
    { to: '/website-seo-audit', label: t('tools.seoAudit.title') },
    { to: '/website-performance-test', label: t('tools.performanceTest.title') },
    { to: '/website-accessibility-checker', label: t('tools.accessibilityChecker.title') },
    { to: '/technical-seo-audit', label: t('tools.technicalSeoAudit.title') },
    { to: '/website-security-check', label: t('tools.securityCheck.title') },
  ];
  const resources = [
    { to: '/privacy-policy', label: t('pages.privacy.title') },
    { to: '/terms', label: t('pages.terms.title') },
    { to: '/disclaimer', label: t('pages.disclaimer.title') },
    { to: '/contact', label: t('pages.contact.title') },
  ];
  const company = [
    { to: '/about', label: t('pages.about.title') },
    { to: '/contact', label: t('pages.contact.title') },
  ];

  const Column = ({
    title,
    links,
  }: {
    title: string;
    links: Array<{ to: string; label: string }>;
  }) => (
    <div>
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">{title}</h2>
      <ul className="mt-3 space-y-2">
        {links.map((link) => (
          <li key={`${title}-${link.to}-${link.label}`}>
            <Link
              to={p(link.to)}
              className="text-sm text-slate-300 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 rounded"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <footer className="border-t border-white/10 bg-ink-950 text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5">
              <span
                aria-hidden="true"
                className="grid size-9 place-items-center rounded-xl bg-brand-600 text-white"
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
              <span className="text-lg font-extrabold tracking-tight text-white">
                {siteConfig.name}
              </span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">
              {t('footer.tagline')}
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              {siteConfig.social.map((link) => (
                <a
                  key={link.platform}
                  href={link.url}
                  rel="noopener noreferrer nofollow"
                  target="_blank"
                  className="rounded-lg border border-white/15 px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:border-brand-400 hover:text-white"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          <Column title={t('footer.product')} links={product.slice(0, 4)} />
          <Column title={t('footer.resources')} links={resources} />
          <div>
            <Column title={t('footer.company')} links={company} />
            <div className="mt-6">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
                {t('footer.language')}
              </h2>
              <LanguageSwitcher className="mt-3 w-44" />
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-6">
          <p className="text-xs leading-relaxed text-slate-500">{t('footer.disclaimer')}</p>
          <p className="mt-3 text-xs text-slate-500">
            © {siteConfig.foundingYear}–{new Date().getFullYear()} {siteConfig.name}.{' '}
            {t('footer.rights')}
          </p>
        </div>
      </div>
    </footer>
  );
}
