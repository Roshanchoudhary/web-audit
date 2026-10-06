import { useMemo } from 'react';
import { useI18n } from '../i18n';
import { localizePath } from '../i18n/paths';
import { siteConfig } from '../config/site';
import { SEOHead } from '../components/SEOHead';
import { LEGAL_DOCUMENTS } from '../content/legal';

type LegalKind = 'privacy' | 'terms' | 'disclaimer';

interface LegalPageProps {
  kind: LegalKind;
}

const ROUTES: Record<LegalKind, string> = {
  privacy: '/privacy-policy',
  terms: '/terms',
  disclaimer: '/disclaimer',
};

export default function LegalPage({ kind }: LegalPageProps) {
  const { t, lang } = useI18n();
  const document = LEGAL_DOCUMENTS[kind];
  const path = localizePath(ROUTES[kind], lang, siteConfig.defaultLanguage);

  const jsonLd = useMemo(
    () => ({
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: t(`pages.${kind}.title`),
      description: t(`pages.${kind}.description`),
      url: `${siteConfig.url}${path}`,
      dateModified: document.updated,
    }),
    [t, kind, path, document.updated],
  );

  return (
    <>
      <SEOHead
        title={`${t(`pages.${kind}.title`)} — ${siteConfig.name}`}
        description={t(`pages.${kind}.description`)}
        path={path}
        jsonLd={jsonLd}
      />
      <article className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-ink-950 sm:text-4xl">
          {t(`pages.${kind}.h1`)}
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          {t(`pages.${kind}.updated`)} {document.updated}
        </p>

        <div className="mt-8 space-y-9">
          {document.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="text-lg font-bold text-ink-950">{section.heading}</h2>
              <div className="mt-3 space-y-3 text-[15px] leading-relaxed text-ink-700/90">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph.slice(0, 40)}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </article>
    </>
  );
}
