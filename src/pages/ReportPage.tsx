import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import type { AuditReport } from '../types';
import { useI18n } from '../i18n';
import { localizePath } from '../i18n/paths';
import { siteConfig } from '../config/site';
import { reportStore } from '../services/report/store';
import { topRecommendations } from '../audit/scoring';
import { SEOHead } from '../components/SEOHead';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { ErrorState } from '../components/ErrorState';
import { AdSlot } from '../components/AdSlot';
import { ScoreCard } from '../components/score/ScoreCard';
import { CategoryScore } from '../components/score/CategoryScore';
import { ChartCard } from '../components/charts/ChartCard';
import { CategoryBarChart } from '../components/charts/CategoryBarChart';
import { StatusDonut } from '../components/charts/StatusDonut';
import { RecommendationCard } from '../components/RecommendationCard';
import { IssueFilter, type IssueFilterValue } from '../components/IssueFilter';
import { AuditIssue } from '../components/AuditIssue';
import { SocialPreview } from '../components/SocialPreview';
import { PdfButton, PrintButton, ShareButton } from '../components/PdfButton';
import { Button } from '../components/ui/Button';

export default function ReportPage() {
  const { id } = useParams<{ id: string }>();
  const { t, lang } = useI18n();
  const location = useLocation();
  const [report, setReport] = useState<AuditReport | null | undefined>(undefined);
  const [filter, setFilter] = useState<IssueFilterValue>('all');

  useEffect(() => {
    let alive = true;
    if (!id) {
      setReport(null);
      return;
    }
    void reportStore.get(id).then((stored) => {
      if (alive) setReport(stored);
    });
    return () => {
      alive = false;
    };
  }, [id]);

  // Expand every finding while printing, then restore the reader's state.
  useEffect(() => {
    const beforePrint = () => {
      document.querySelectorAll<HTMLDetailsElement>('details').forEach((el) => {
        el.dataset.wasOpen = String(el.open);
        el.open = true;
      });
    };
    const afterPrint = () => {
      document.querySelectorAll<HTMLDetailsElement>('details').forEach((el) => {
        el.open = el.dataset.wasOpen === 'true';
      });
    };
    window.addEventListener('beforeprint', beforePrint);
    window.addEventListener('afterprint', afterPrint);
    return () => {
      window.removeEventListener('beforeprint', beforePrint);
      window.removeEventListener('afterprint', afterPrint);
    };
  }, [report]);

  const filterCounts = useMemo<Record<IssueFilterValue, number>>(() => {
    if (!report) {
      return { all: 0, critical: 0, errors: 0, warnings: 0, passed: 0, na: 0 };
    }
    return {
      all: report.counts.total,
      critical: report.issues.filter(
        (i) => i.status !== 'pass' && (i.severity === 'critical' || i.severity === 'high'),
      ).length,
      errors: report.counts.errors,
      warnings: report.counts.warnings,
      passed: report.counts.passed,
      na: report.counts.notAvailable,
    };
  }, [report]);

  const filteredIssues = useMemo(() => {
    if (!report) return [];
    return report.issues.filter((issue) => {
      switch (filter) {
        case 'all':
          return true;
        case 'critical':
          return (
            issue.status !== 'pass' && (issue.severity === 'critical' || issue.severity === 'high')
          );
        case 'errors':
          return issue.status === 'fail';
        case 'warnings':
          return issue.status === 'warning';
        case 'passed':
          return issue.status === 'pass';
        case 'na':
          return issue.status === 'not_available';
      }
    });
  }, [report, filter]);

  const homePath = localizePath('/', lang, siteConfig.defaultLanguage);

  if (report === undefined) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8" aria-busy="true">
        <span className="sr-only">{t('common.loading')}</span>
        <LoadingSkeleton rows={5} />
      </div>
    );
  }

  if (report === null) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 sm:px-6">
        <SEOHead
          title={`${t('report.notFound.title')} — ${siteConfig.name}`}
          description={t('report.notFound.text')}
          path="/"
          noindex
        />
        <ErrorState title={t('report.notFound.title')} message={t('report.notFound.text')} />
        <div className="mt-6 text-center">
          <Link to={`${homePath === '/' ? '/' : homePath}#audit`}>
            <Button>{t('report.notFound.cta')}</Button>
          </Link>
        </div>
      </div>
    );
  }

  const recommendations = topRecommendations(report.issues, 5);
  const perf = report.metrics.performance;
  const content = report.metrics.content;

  const metricTiles: Array<{ label: string; value: string; note?: string; muted?: boolean }> = [
    {
      label: t('report.metrics.fetchTime'),
      value: `${perf.fetchMs ?? '—'} ms`,
      note: t('report.metrics.fetchTimeHint'),
    },
    { label: t('report.metrics.resources'), value: String(perf.resourceCount) },
    { label: t('report.metrics.scripts'), value: String(perf.scripts) },
    { label: t('report.metrics.images'), value: String(perf.images) },
    { label: t('report.metrics.words'), value: String(content.words) },
    { label: t('report.metrics.links'), value: String(content.links) },
    { label: t('report.metrics.ratio'), value: `${content.textToHtmlRatio}%` },
    {
      label: t('report.metrics.readability'),
      value:
        content.readabilityGrade === null
          ? t('common.notAvailable')
          : String(content.readabilityGrade),
      note: content.readabilityGrade === null ? undefined : t('report.metrics.readabilityHint'),
    },
    {
      label: t('report.metrics.coreWebVitals'),
      value: t('common.notAvailable'),
      note: t('report.metrics.requiresApi'),
      muted: true,
    },
  ];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Report',
    name: `${siteConfig.name} — ${t('report.title')}`,
    url: `${siteConfig.url}/report/${report.id}`,
    datePublished: report.auditedAt,
    about: report.url,
  };

  return (
    <>
      <SEOHead
        title={`${t('report.title')} — ${report.url} — ${siteConfig.name}`}
        description={t('hero.subtitle')}
        path={location.pathname}
        jsonLd={jsonLd}
        noindex
      />

      {/* print-only letterhead */}
      <div className="print-only mb-6 border-b-2 border-black pb-3">
        <p className="text-lg font-extrabold">{siteConfig.name}</p>
        <p className="text-sm">
          {t('report.title')}: {report.url} — {new Date(report.auditedAt).toLocaleString()}
        </p>
      </div>

      <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        {/* ---------------------------------------------------- header card */}
        <section className="surface p-6 sm:p-7">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wide text-brand-700">
                {t('report.title')}
              </p>
              <h1 className="mt-1 break-all text-2xl font-extrabold tracking-tight text-ink-950 sm:text-3xl">
                {report.finalUrl}
              </h1>
              <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-slate-500">
                <div className="flex gap-2">
                  <dt className="font-medium">{t('report.auditedOn')}:</dt>
                  <dd>{new Date(report.auditedAt).toLocaleString()}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="font-medium">{t('report.engine')}:</dt>
                  <dd className="capitalize">{report.engine.mode}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="font-medium">{t('report.summary.issues')}:</dt>
                  <dd>{report.counts.total}</dd>
                </div>
              </dl>
            </div>

            <div className="no-print shrink-0 space-y-3">
              <div className="flex flex-wrap gap-3">
                {siteConfig.features.pdfDownload && <PdfButton report={report} />}
                {siteConfig.features.printReport && <PrintButton />}
                {siteConfig.features.shareReport && <ShareButton reportId={report.id} />}
              </div>
              <p className="max-w-xs text-xs text-slate-400">{t('report.share.note')}</p>
            </div>
          </div>
        </section>

        <AdSlot variant="report" className="no-print" />

        {/* ------------------------------------------------------- scores */}
        <ScoreCard report={report} />

        <section aria-label={t('report.sections.scores')} className="space-y-4">
          <h2 className="text-lg font-extrabold tracking-tight text-ink-950">
            {t('report.sections.scores')}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {report.scores.map((score) => (
              <CategoryScore key={score.category} score={score} />
            ))}
          </div>
        </section>

        {/* ------------------------------------------------------- charts */}
        <div className="grid gap-5 lg:grid-cols-5">
          <ChartCard
            title={t('report.charts.categoryTitle')}
            note={t('report.charts.coverageNote')}
            summary={t('report.charts.categorySummary', {
              items: report.scores
                .map(
                  (s) =>
                    `${t(`report.categories.${s.category}.name`)}: ${s.score ?? t('common.notAvailable')}`,
                )
                .join(', '),
            })}
            className="lg:col-span-3"
          >
            <CategoryBarChart scores={report.scores} />
          </ChartCard>

          <ChartCard
            title={t('report.charts.distributionTitle')}
            summary={t('report.charts.distributionSummary', {
              passed: report.counts.passed,
              warnings: report.counts.warnings,
              errors: report.counts.errors,
              na: report.counts.notAvailable,
              total: report.counts.total,
            })}
            className="lg:col-span-2"
          >
            <StatusDonut counts={report.counts} />
          </ChartCard>
        </div>

        {/* ----------------------------------------------- recommendations */}
        <section aria-labelledby="recommendations-title" className="space-y-4">
          <div>
            <h2
              id="recommendations-title"
              className="text-lg font-extrabold tracking-tight text-ink-950"
            >
              {t('report.sections.recommendations')}
            </h2>
            <p className="text-sm text-slate-500">{t('report.sections.recommendationsSub')}</p>
          </div>
          <RecommendationCard recommendations={recommendations} />
        </section>

        {/* --------------------------------------------------- limitations */}
        <section
          aria-labelledby="limitations-title"
          className="rounded-3xl border border-slate-200 bg-slate-50 p-6"
        >
          <h2 id="limitations-title" className="text-base font-bold text-ink-950">
            {t('report.limitations.title')}
          </h2>
          <p className="mt-1 text-sm text-slate-500">{t('report.limitations.note')}</p>
          <ul className="mt-4 grid gap-3 md:grid-cols-2">
            {report.limitations.map((key) => (
              <li key={key} className="flex gap-2.5 text-sm leading-relaxed text-ink-700/85">
                <span
                  aria-hidden="true"
                  className="mt-1.5 size-1.5 shrink-0 rounded-full bg-slate-400"
                />
                {t(key)}
              </li>
            ))}
          </ul>
        </section>

        {/* ------------------------------------------------ metrics + social */}
        <div className="grid gap-5 lg:grid-cols-2">
          <section aria-labelledby="metrics-title" className="surface p-6">
            <h2 id="metrics-title" className="text-base font-bold text-ink-950">
              {t('report.sections.metrics')}
            </h2>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {metricTiles.map((tile) => (
                <div
                  key={tile.label}
                  className={`rounded-xl border p-3 ${
                    tile.muted
                      ? 'border-dashed border-slate-300 bg-slate-50'
                      : 'border-slate-100 bg-slate-50/70'
                  }`}
                >
                  <div
                    className={`text-lg font-extrabold tabular-nums ${
                      tile.muted ? 'text-slate-400' : 'text-ink-950'
                    }`}
                  >
                    {tile.value}
                  </div>
                  <div className="mt-0.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    {tile.label}
                  </div>
                  {tile.note && <div className="mt-1 text-[10px] text-slate-400">{tile.note}</div>}
                </div>
              ))}
            </div>
          </section>

          <section aria-labelledby="social-title" className="surface p-6">
            <h2 id="social-title" className="mb-4 text-base font-bold text-ink-950">
              {t('report.social.title')}
            </h2>
            <SocialPreview report={report} />
          </section>
        </div>

        {/* -------------------------------------------------------- issues */}
        <section aria-labelledby="issues-title" className="space-y-4">
          <div>
            <h2 id="issues-title" className="text-lg font-extrabold tracking-tight text-ink-950">
              {t('report.sections.issues')}
            </h2>
            <p className="text-sm text-slate-500">{t('report.sections.issuesSub')}</p>
          </div>

          <div className="no-print flex flex-wrap items-center justify-between gap-3">
            <IssueFilter value={filter} onChange={setFilter} counts={filterCounts} />
            <span className="text-xs font-medium text-slate-400" aria-live="polite">
              {t('report.filters.resultCount', { count: filteredIssues.length })}
            </span>
          </div>

          {filteredIssues.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
              <p className="text-sm font-semibold text-ink-800">{t('report.empty.title')}</p>
              <p className="mt-1 text-sm text-slate-500">{t('report.empty.text')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredIssues.map((issue) => (
                <AuditIssue key={issue.checkId} issue={issue} />
              ))}
            </div>
          )}
        </section>

        {/* ----------------------------------------------------------- CTA */}
        <section className="no-print rounded-3xl bg-ink-950 px-6 py-10 text-center sm:px-10">
          <h2 className="text-2xl font-extrabold tracking-tight text-white">
            {t('report.new.title')}
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-sm text-slate-300">{t('report.new.subtitle')}</p>
          <Link to={`${homePath === '/' ? '/' : homePath}#audit`} className="mt-6 inline-flex">
            <Button size="lg" className="bg-brand-500 hover:bg-brand-400">
              {t('report.new.cta')}
            </Button>
          </Link>
        </section>
      </div>
    </>
  );
}
