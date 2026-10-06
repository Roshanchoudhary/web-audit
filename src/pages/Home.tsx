import { useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../i18n';
import { localizePath } from '../i18n/paths';
import { siteConfig } from '../config/site';
import { useAuditRunner } from '../hooks/useAuditRunner';
import { validateUrlInput } from '../utils/url';
import { URLInput } from '../components/URLInput';
import { AuditButton } from '../components/AuditButton';
import { AuditProgress } from '../components/AuditProgress';
import { ErrorState } from '../components/ErrorState';
import { FAQ } from '../components/FAQ';
import { SEOHead } from '../components/SEOHead';
import { AdSlot } from '../components/AdSlot';
import { ScoreGauge } from '../components/score/ScoreGauge';
import { CategoryBarChart } from '../components/charts/CategoryBarChart';
import { StatusDonut } from '../components/charts/StatusDonut';
import { ChartCard } from '../components/charts/ChartCard';
import { Button } from '../components/ui/Button';
import type { AuditScore, IssueCounts } from '../types';

/* Clearly-labelled sample data used by the on-page product preview. */
const SAMPLE_SCORES: AuditScore[] = [
  {
    category: 'seo',
    score: 87,
    coverage: 1,
    weights: { total: 0, measurable: 0, earned: 0 },
    counts: { pass: 0, warning: 0, fail: 0, not_available: 0 },
  },
  {
    category: 'performance',
    score: 72,
    coverage: 0.7,
    weights: { total: 0, measurable: 0, earned: 0 },
    counts: { pass: 0, warning: 0, fail: 0, not_available: 0 },
  },
  {
    category: 'accessibility',
    score: 91,
    coverage: 0.8,
    weights: { total: 0, measurable: 0, earned: 0 },
    counts: { pass: 0, warning: 0, fail: 0, not_available: 0 },
  },
  {
    category: 'security',
    score: 78,
    coverage: 0.5,
    weights: { total: 0, measurable: 0, earned: 0 },
    counts: { pass: 0, warning: 0, fail: 0, not_available: 0 },
  },
  {
    category: 'technical',
    score: 80,
    coverage: 0.7,
    weights: { total: 0, measurable: 0, earned: 0 },
    counts: { pass: 0, warning: 0, fail: 0, not_available: 0 },
  },
  {
    category: 'content',
    score: 84,
    coverage: 1,
    weights: { total: 0, measurable: 0, earned: 0 },
    counts: { pass: 0, warning: 0, fail: 0, not_available: 0 },
  },
  {
    category: 'social',
    score: 69,
    coverage: 1,
    weights: { total: 0, measurable: 0, earned: 0 },
    counts: { pass: 0, warning: 0, fail: 0, not_available: 0 },
  },
];

const SAMPLE_COUNTS: IssueCounts = {
  pass: 46,
  warning: 12,
  fail: 8,
  not_available: 9,
  total: 75,
  critical: 5,
  errors: 8,
  warnings: 12,
  passed: 46,
  notAvailable: 9,
};

const FEATURE_ICONS: ReactNode[] = [
  <path
    key="1"
    d="M4 19V9m5 10V5m5 14v-7m5 7V8"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
  />,
  <path
    key="2"
    d="M12 3l7 3v5c0 4.4-3 8.3-7 9.5C8 19.3 5 15.4 5 11V6l7-3Z"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinejoin="round"
  />,
  <path
    key="3"
    d="M14.7 6.3a4 4 0 0 0-5.4 5.4L4 17v3h3l5.3-5.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2-2 2.5-2.5Z"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinejoin="round"
  />,
  <path
    key="4"
    d="M7 3h7l4 4v14H7V3Zm7 0v4h4M9.5 12h5M9.5 15.5h5"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  />,
  <path
    key="5"
    d="M5 16a7 7 0 1 1 14 0M12 16l3.5-4.5"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
  />,
  <path
    key="6"
    d="M7 11V8a5 5 0 0 1 10 0v3m-11 0h12v9H6v-9Z"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  />,
];

export default function Home() {
  const { t, lang } = useI18n();
  const [url, setUrl] = useState('');
  const [touched, setTouched] = useState(false);
  const runner = useAuditRunner();

  const validation = validateUrlInput(url);
  const fieldError =
    touched && !validation.ok
      ? t(
          `audit.errors.${validation.reason === 'empty' ? 'empty_url' : validation.reason === 'protocol' ? 'unsupported_protocol' : 'invalid_url'}`,
        )
      : null;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setTouched(true);
    if (!validateUrlInput(url).ok) return;
    void runner.start(url);
  };

  const faqItems = useMemo(
    () =>
      Array.from({ length: 6 }, (_, index) => ({
        q: t(`faq.items.${index}.q`),
        a: t(`faq.items.${index}.a`),
      })),
    [t],
  );

  const jsonLd = useMemo(
    () => [
      {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: siteConfig.name,
        url: `${siteConfig.url}/`,
        logo: `${siteConfig.url}${siteConfig.logo}`,
        sameAs: siteConfig.social.map((s) => s.url),
      },
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqItems.map((item) => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: { '@type': 'Answer', text: item.a },
        })),
      },
    ],
    [faqItems],
  );

  const homePath = lang === siteConfig.defaultLanguage ? '/' : `/${lang}`;
  const toolPath = (slug: string) => localizePath(`/${slug}`, lang, siteConfig.defaultLanguage);

  return (
    <>
      <SEOHead
        title={`${t('hero.title')} — ${siteConfig.name}`}
        description={t('hero.subtitle')}
        path={homePath}
        jsonLd={jsonLd}
      />

      {/* ----------------------------------------------------------- hero */}
      <section id="audit" className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(900px 460px at 88% -8%, rgba(7,143,129,0.14), transparent 60%), radial-gradient(700px 380px at -5% 5%, rgba(13,74,69,0.10), transparent 55%)',
          }}
        />
        <div className="relative mx-auto max-w-7xl px-4 pb-14 pt-12 sm:px-6 lg:px-8 lg:pt-16">
          <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wide text-brand-800">
                <span aria-hidden="true" className="size-1.5 rounded-full bg-brand-500" />
                {t('hero.badge')}
              </span>
              <h1 className="mt-5 text-4xl font-extrabold leading-[1.05] tracking-tight text-ink-950 sm:text-5xl lg:text-6xl">
                {t('hero.title')}{' '}
                <span className="bg-gradient-to-r from-brand-600 to-emerald-500 bg-clip-text text-transparent">
                  {t('hero.accent')}
                </span>
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-700/85">
                {t('hero.subtitle')}
              </p>

              <div className="mt-8 surface p-5 sm:p-6">
                <form
                  onSubmit={handleSubmit}
                  noValidate
                  className="flex flex-col gap-4 sm:flex-row sm:items-end"
                >
                  <URLInput
                    value={url}
                    onChange={(value) => {
                      setUrl(value);
                      if (touched) setTouched(true);
                    }}
                    label={t('hero.urlLabel')}
                    placeholder={t('hero.placeholder')}
                    error={fieldError}
                    disabled={runner.state.phase === 'running'}
                  />
                  <AuditButton
                    label={t('hero.cta')}
                    busyLabel={t('hero.auditing')}
                    busy={runner.state.phase === 'running'}
                    className="shrink-0"
                  />
                </form>

                <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
                  {Array.from({ length: 5 }, (_, index) => (
                    <li
                      key={index}
                      className="flex items-center gap-1.5 text-xs font-medium text-slate-500"
                    >
                      <svg
                        aria-hidden="true"
                        width="13"
                        height="13"
                        viewBox="0 0 16 16"
                        fill="none"
                        className="text-emerald-500"
                      >
                        <path
                          d="m3.5 8.5 3 3 6-7"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      {t(`hero.trust.${index}`)}
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-xs text-slate-400">{t('hero.microcopy')}</p>
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

            {/* sample report preview */}
            <aside
              aria-label={t('sample.title')}
              className="relative surface overflow-hidden p-6 sm:p-7"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                    {t('report.title')}
                  </p>
                  <p className="mt-0.5 font-mono text-sm font-semibold text-ink-800">
                    https://example.com
                  </p>
                </div>
                <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-700">
                  {t('sample.disclaimer')}
                </span>
              </div>

              <div className="mt-5 flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-between">
                <ScoreGauge
                  score={87}
                  size={168}
                  gradeLabel={t('report.grades.very_good')}
                  ariaLabel={`${t('report.overall')}: 87`}
                  caption={t('report.overall')}
                />
                <div className="w-full min-w-0 flex-1">
                  <CategoryBarChart scores={SAMPLE_SCORES.slice(0, 5)} />
                </div>
              </div>

              <div className="mt-6 rounded-2xl bg-slate-50 p-4">
                <StatusDonut counts={SAMPLE_COUNTS} />
              </div>
              <p className="mt-4 text-xs leading-relaxed text-slate-500">{t('sample.subtitle')}</p>
            </aside>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AdSlot variant="header" className="mt-2" />
      </div>

      {/* -------------------------------------------------------- features */}
      <section id="features" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-ink-950 sm:text-4xl">
            {t('home.featuresTitle')}
          </h2>
          <p className="mt-3 text-lg text-ink-700/80">{t('home.featuresSubtitle')}</p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <article
              key={index}
              className="surface group p-6 transition hover:-translate-y-0.5 hover:shadow-lift"
            >
              <span className="grid size-11 place-items-center rounded-xl bg-brand-50 text-brand-700 transition group-hover:bg-brand-600 group-hover:text-white">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  {FEATURE_ICONS[index]}
                </svg>
              </span>
              <h3 className="mt-4 text-base font-bold text-ink-950">
                {t(`home.features.${index}.title`)}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-700/80">
                {t(`home.features.${index}.desc`)}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-14 grid gap-6 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <h2 className="text-2xl font-extrabold tracking-tight text-ink-950">
              {t('home.howTitle')}
            </h2>
            <p className="mt-2 text-sm text-ink-700/80">{t('home.howSubtitle')}</p>
            <Link to={`${homePath === '/' ? '/' : homePath}#audit`} className="mt-5 inline-flex">
              <Button>{t('home.cta')}</Button>
            </Link>
          </div>
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="flex gap-4">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-ink-950 text-sm font-extrabold text-white">
                {index + 1}
              </span>
              <div>
                <h3 className="text-sm font-bold text-ink-950">{t(`home.steps.${index}.title`)}</h3>
                <p className="mt-1 text-sm leading-relaxed text-ink-700/80">
                  {t(`home.steps.${index}.desc`)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------- sample dashboard */}
      <section className="border-y border-slate-200 bg-white/60">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-ink-950 sm:text-4xl">
              {t('sample.title')}
            </h2>
            <p className="mt-3 text-lg text-ink-700/80">{t('sample.subtitle')}</p>
          </div>
          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            <ChartCard
              title={t('report.charts.categoryTitle')}
              note={t('sample.disclaimer')}
              summary={t('report.charts.categorySummary', {
                items: SAMPLE_SCORES.map((s) => `${s.category}: ${s.score}`).join(', '),
              })}
            >
              <CategoryBarChart scores={SAMPLE_SCORES} />
            </ChartCard>
            <ChartCard
              title={t('report.charts.distributionTitle')}
              note={t('sample.disclaimer')}
              summary={t('report.charts.distributionSummary', {
                passed: SAMPLE_COUNTS.passed,
                warnings: SAMPLE_COUNTS.warnings,
                errors: SAMPLE_COUNTS.errors,
                na: SAMPLE_COUNTS.notAvailable,
                total: SAMPLE_COUNTS.total,
              })}
            >
              <StatusDonut counts={SAMPLE_COUNTS} />
            </ChartCard>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- FAQ */}
      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-ink-950">{t('faq.title')}</h2>
          <p className="mt-3 text-ink-700/80">{t('faq.subtitle')}</p>
        </div>
        <div className="mt-8">
          <FAQ items={faqItems} />
        </div>
      </section>

      {/* -------------------------------------------------------- SEO copy */}
      <section className="border-t border-slate-200 bg-white/60">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <article className="prose-sm max-w-none space-y-6 text-[15px] leading-relaxed text-ink-700/90">
            <h2 className="text-2xl font-bold text-ink-950">{t('seoCopy.h2a')}</h2>
            <p>{t('seoCopy.p1')}</p>
            <h2 className="text-2xl font-bold text-ink-950">{t('seoCopy.h2b')}</h2>
            <p>{t('seoCopy.p2')}</p>
            <h2 className="text-2xl font-bold text-ink-950">{t('seoCopy.h2c')}</h2>
            <p>{t('seoCopy.p3')}</p>
            <p>{t('seoCopy.p4')}</p>
            <ul className="grid gap-2 pt-2 sm:grid-cols-2">
              {TOOL_LINKS.map((link) => (
                <li key={link.slug}>
                  <Link
                    to={toolPath(link.slug)}
                    className="inline-flex items-center gap-1.5 font-semibold text-brand-700 hover:text-brand-800 hover:underline"
                  >
                    <span aria-hidden="true">→</span>
                    {t(link.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      {/* ------------------------------------------------------------- CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-4 pt-10 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-3xl bg-ink-950 px-6 py-12 text-center sm:px-10">
          <h2 className="text-3xl font-extrabold tracking-tight text-white">
            {t('home.ctaTitle')}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-300">{t('home.ctaSubtitle')}</p>
          <Link
            to={`${homePath === '/' ? '/' : homePath}#audit`}
            className="mt-7 inline-flex"
            onClick={() => undefined}
          >
            <Button size="lg" className="bg-brand-500 hover:bg-brand-400">
              {t('home.cta')}
            </Button>
          </Link>
        </div>
        <AdSlot variant="footer" className="mt-6" />
      </section>
    </>
  );
}

const TOOL_LINKS = [
  { slug: 'website-seo-audit', labelKey: 'tools.seoAudit.title' },
  { slug: 'website-performance-test', labelKey: 'tools.performanceTest.title' },
  { slug: 'website-accessibility-checker', labelKey: 'tools.accessibilityChecker.title' },
  { slug: 'technical-seo-audit', labelKey: 'tools.technicalSeoAudit.title' },
  { slug: 'website-security-check', labelKey: 'tools.securityCheck.title' },
  { slug: 'free-seo-audit', labelKey: 'tools.freeSeoAudit.title' },
];
