import { useMemo, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../i18n';
import { localizePath } from '../i18n/paths';
import { siteConfig } from '../config/site';
import { TOOL_PAGES } from '../config/pages';
import { useAuditRunner } from '../hooks/useAuditRunner';
import { validateUrlInput } from '../utils/url';
import { URLInput } from '../components/URLInput';
import { AuditButton } from '../components/AuditButton';
import { AuditProgress } from '../components/AuditProgress';
import { ErrorState } from '../components/ErrorState';
import { SEOHead } from '../components/SEOHead';
import { AdSlot } from '../components/AdSlot';
import { Button } from '../components/ui/Button';

interface ToolLandingProps {
  contentKey: string;
}

const LIMITATION_KEYS = [
  'report.limitations.items.core_web_vitals',
  'report.limitations.items.security_headers',
  'report.limitations.items.crawling',
];

/**
 * Programmatic-SEO landing page for each audit tool (also served under
 * `/{lang}/{path}` with translated copy). One component, six content sets —
 * avoids duplicate/thin pages while keeping unique metadata per route.
 */
export default function ToolLanding({ contentKey }: ToolLandingProps) {
  const { t, lang } = useI18n();
  const [url, setUrl] = useState('');
  const [touched, setTouched] = useState(false);
  const runner = useAuditRunner();

  const validation = validateUrlInput(url);
  const fieldError =
    touched && !validation.ok
      ? t(
          `audit.errors.${
            validation.reason === 'empty'
              ? 'empty_url'
              : validation.reason === 'protocol'
                ? 'unsupported_protocol'
                : 'invalid_url'
          }`,
        )
      : null;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setTouched(true);
    if (!validateUrlInput(url).ok) return;
    void runner.start(url);
  };

  const basePath = `/${contentKeyPath(contentKey)}`;
  const path = localizePath(basePath, lang, siteConfig.defaultLanguage);

  const jsonLd = useMemo(
    () => [
      {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: `${siteConfig.name} — ${t(`tools.${contentKey}.title`)}`,
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Any',
        description: t(`tools.${contentKey}.description`),
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: t('nav.home'), item: `${siteConfig.url}/` },
          {
            '@type': 'ListItem',
            position: 2,
            name: t(`tools.${contentKey}.title`),
            item: `${siteConfig.url}${path}`,
          },
        ],
      },
    ],
    [t, contentKey, path],
  );

  const otherTools = TOOL_PAGES.filter((page) => page.contentKey !== contentKey);

  return (
    <>
      <SEOHead
        title={t(`tools.${contentKey}.title`)}
        description={t(`tools.${contentKey}.description`)}
        path={path}
        jsonLd={jsonLd}
      />

      <section id="audit" className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(800px 420px at 80% -20%, rgba(7,143,129,0.12), transparent 60%)',
          }}
        />
        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="mb-6 text-xs font-medium text-slate-500">
            <Link
              to={localizePath('/', lang, siteConfig.defaultLanguage)}
              className="hover:text-brand-700"
            >
              {t('nav.home')}
            </Link>
            <span aria-hidden="true" className="mx-2">
              /
            </span>
            <span className="text-ink-800">{t(`tools.${contentKey}.title`)}</span>
          </nav>

          <div className="grid items-start gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-ink-950 sm:text-4xl lg:text-[2.75rem]">
                {t(`tools.${contentKey}.h1`)}
              </h1>
              <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink-700/85">
                {t(`tools.${contentKey}.intro`)}
              </p>

              <div className="mt-7 surface p-5 sm:p-6">
                <form
                  onSubmit={handleSubmit}
                  noValidate
                  className="flex flex-col gap-4 sm:flex-row sm:items-end"
                >
                  <URLInput
                    value={url}
                    onChange={setUrl}
                    label={t('hero.urlLabel')}
                    placeholder={t('hero.placeholder')}
                    error={fieldError}
                    disabled={runner.state.phase === 'running'}
                  />
                  <AuditButton
                    label={t('tools.shared.runCta')}
                    busyLabel={t('hero.auditing')}
                    busy={runner.state.phase === 'running'}
                    className="shrink-0"
                  />
                </form>
                <p className="mt-3 text-xs text-slate-400">{t('tools.shared.note')}</p>
              </div>

              {runner.state.phase === 'running' && (
                <div className="mt-6 animate-fade-up">
                  <AuditProgress
                    stage={runner.state.stage}
                    progress={runner.state.progress}
                    url={runner.state.url || url}
                  />
                </div>
              )}
              {runner.state.phase === 'error' && (
                <div className="mt-6 animate-fade-up">
                  <ErrorState
                    title={t('audit.errorTitle')}
                    message={t(runner.state.errorKey ?? 'audit.errors.unknown')}
                    onRetry={runner.reset}
                    retryLabel={t('common.retry')}
                  />
                </div>
              )}
            </div>

            <div className="space-y-5">
              <section className="surface p-6">
                <h2 className="text-base font-bold text-ink-950">
                  {t('tools.shared.checklistTitle')}
                </h2>
                <ul className="mt-4 space-y-3">
                  {Array.from({ length: 4 }, (_, index) => (
                    <li key={index} className="flex gap-3 text-sm leading-relaxed text-ink-700/85">
                      <span
                        aria-hidden="true"
                        className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-700"
                      >
                        <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                          <path
                            d="m3.5 8.5 3 3 6-7"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                      {t(`tools.${contentKey}.bullets.${index}`)}
                    </li>
                  ))}
                </ul>
              </section>

              <section className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6">
                <h2 className="text-base font-bold text-ink-950">
                  {t('tools.shared.limitationsTitle')}
                </h2>
                <ul className="mt-3 space-y-2.5">
                  {LIMITATION_KEYS.map((key) => (
                    <li key={key} className="flex gap-2.5 text-sm leading-relaxed text-slate-600">
                      <span
                        aria-hidden="true"
                        className="mt-1.5 size-1.5 shrink-0 rounded-full bg-slate-400"
                      />
                      {t(key)}
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AdSlot variant="sidebar" className="lg:max-w-xl" />
      </div>

      <section className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8">
        <article className="space-y-5 text-[15px] leading-relaxed text-ink-700/90">
          <h2 className="text-2xl font-bold text-ink-950">{t('seoCopy.h2a')}</h2>
          <p>{t('seoCopy.p1')}</p>
          <h2 className="text-2xl font-bold text-ink-950">{t('seoCopy.h2c')}</h2>
          <p>{t('seoCopy.p3')}</p>
        </article>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {otherTools.map((page) => (
            <Link
              key={page.path}
              to={localizePath(`/${page.path}`, lang, siteConfig.defaultLanguage)}
              className="surface group p-5 transition hover:-translate-y-0.5 hover:shadow-lift"
            >
              <h2 className="text-sm font-bold text-ink-950 group-hover:text-brand-700">
                {t(`tools.${page.contentKey}.title`)}
              </h2>
              <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-slate-500">
                {t(`tools.${page.contentKey}.description`)}
              </p>
            </Link>
          ))}
        </div>

        <div className="mt-8 rounded-3xl bg-ink-950 px-6 py-10 text-center sm:px-10">
          <h2 className="text-2xl font-extrabold tracking-tight text-white">
            {t('tools.shared.ctaTitle')}
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-sm text-slate-300">
            {t('tools.shared.ctaSubtitle')}
          </p>
          <Link to={`${path}#audit`} className="mt-6 inline-flex">
            <Button size="lg" className="bg-brand-500 hover:bg-brand-400">
              {t('tools.shared.runCta')}
            </Button>
          </Link>
        </div>
      </section>
    </>
  );
}

function contentKeyPath(contentKey: string): string {
  const match = TOOL_PAGES.find((page) => page.contentKey === contentKey);
  return match ? match.path : 'website-seo-audit';
}
