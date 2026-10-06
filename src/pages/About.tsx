import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../i18n';
import { localizePath } from '../i18n/paths';
import { siteConfig } from '../config/site';
import { SEOHead } from '../components/SEOHead';
import { Button } from '../components/ui/Button';

export default function About() {
  const { t, lang } = useI18n();
  const path = localizePath('/about', lang, siteConfig.defaultLanguage);

  const jsonLd = useMemo(
    () => ({
      '@context': 'https://schema.org',
      '@type': 'AboutPage',
      name: `${siteConfig.name} — ${t('pages.about.title')}`,
      description: t('pages.about.description'),
      url: `${siteConfig.url}${path}`,
    }),
    [t, path],
  );

  return (
    <>
      <SEOHead
        title={`${t('pages.about.title')} — ${siteConfig.name}`}
        description={t('pages.about.description')}
        path={path}
        jsonLd={jsonLd}
      />
      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-ink-950 sm:text-4xl">
          {t('pages.about.h1')}
        </h1>
        <div className="mt-6 space-y-5 text-[16px] leading-relaxed text-ink-700/90">
          <p>{t('pages.about.p1')}</p>
          <p>{t('pages.about.p2')}</p>
          <p>{t('pages.about.p3')}</p>
        </div>

        <h2 className="mt-10 text-xl font-bold text-ink-950">{t('pages.about.valuesTitle')}</h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 4 }, (_, index) => (
            <li
              key={index}
              className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-sm font-medium text-ink-800 shadow-card"
            >
              <span
                aria-hidden="true"
                className="mt-0.5 size-2 shrink-0 rounded-full bg-brand-500"
              />
              {t(`pages.about.values.${index}`)}
            </li>
          ))}
        </ul>

        <div className="mt-10 rounded-3xl bg-ink-950 px-6 py-9 text-center">
          <Link
            to={`${localizePath('/', lang, siteConfig.defaultLanguage)}#audit`}
            className="inline-flex"
          >
            <Button className="bg-brand-500 hover:bg-brand-400">{t('home.cta')}</Button>
          </Link>
        </div>
      </div>
    </>
  );
}
