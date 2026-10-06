import { useMemo } from 'react';
import { useI18n } from '../i18n';
import { localizePath } from '../i18n/paths';
import { siteConfig } from '../config/site';
import { SEOHead } from '../components/SEOHead';

export default function Contact() {
  const { t, lang } = useI18n();
  const path = localizePath('/contact', lang, siteConfig.defaultLanguage);

  const jsonLd = useMemo(
    () => ({
      '@context': 'https://schema.org',
      '@type': 'ContactPage',
      name: `${siteConfig.name} — ${t('pages.contact.title')}`,
      description: t('pages.contact.description'),
      url: `${siteConfig.url}${path}`,
    }),
    [t, path],
  );

  return (
    <>
      <SEOHead
        title={`${t('pages.contact.title')} — ${siteConfig.name}`}
        description={t('pages.contact.description')}
        path={path}
        jsonLd={jsonLd}
      />
      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-ink-950 sm:text-4xl">
          {t('pages.contact.h1')}
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-ink-700/85">{t('pages.contact.intro')}</p>

        <div className="mt-8 surface p-6 sm:p-8">
          <h2 className="text-base font-bold text-ink-950">{t('pages.contact.emailLabel')}</h2>
          <a
            href={siteConfig.contact.supportUrl ?? `mailto:${siteConfig.contact.email}`}
            className="mt-2 inline-block text-xl font-bold text-brand-700 underline-offset-4 hover:underline"
          >
            {siteConfig.contact.email}
          </a>
          <p className="mt-2 text-sm text-slate-500">{t('pages.contact.responseNote')}</p>

          <h2 className="mt-8 text-base font-bold text-ink-950">
            {t('pages.contact.topicsTitle')}
          </h2>
          <ul className="mt-3 grid gap-2.5 sm:grid-cols-2">
            {Array.from({ length: 4 }, (_, index) => (
              <li
                key={index}
                className="flex gap-3 rounded-xl bg-slate-50 p-3.5 text-sm text-ink-800"
              >
                <span
                  aria-hidden="true"
                  className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand-500"
                />
                {t(`pages.contact.topics.${index}`)}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
