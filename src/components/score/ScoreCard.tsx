import type { AuditReport } from '../../types';
import { useI18n } from '../../i18n';
import { GRADE_BADGE } from '../../utils/format';
import { cn } from '../../utils/cn';
import { ScoreGauge } from './ScoreGauge';

interface ScoreCardProps {
  report: AuditReport;
}

/** Premium overall-score card: gauge, grade, delta, coverage and statistics. */
export function ScoreCard({ report }: ScoreCardProps) {
  const { t } = useI18n();
  const { overall, counts } = report;
  const measured = counts.total - counts.notAvailable;
  const gradeLabel = t(`report.grades.${overall.grade}`);

  const stats: Array<{ key: string; label: string; value: number; className: string }> = [
    {
      key: 'total',
      label: t('report.summary.issues'),
      value: counts.total,
      className: 'text-ink-950',
    },
    {
      key: 'critical',
      label: t('report.summary.critical'),
      value: counts.critical,
      className: 'text-rose-600',
    },
    {
      key: 'errors',
      label: t('report.summary.errors'),
      value: counts.errors,
      className: 'text-rose-500',
    },
    {
      key: 'warnings',
      label: t('report.summary.warnings'),
      value: counts.warnings,
      className: 'text-amber-600',
    },
    {
      key: 'passed',
      label: t('report.summary.passed'),
      value: counts.passed,
      className: 'text-emerald-600',
    },
    {
      key: 'na',
      label: t('report.summary.notAvailable'),
      value: counts.notAvailable,
      className: 'text-slate-500',
    },
  ];

  return (
    <section
      aria-label={t('report.overall')}
      className="rounded-3xl border border-slate-200 bg-white p-6 shadow-card sm:p-8"
    >
      <div className="grid items-center gap-8 lg:grid-cols-[auto_1fr]">
        <div className="flex justify-center">
          <ScoreGauge
            score={overall.score}
            gradeLabel={gradeLabel}
            ariaLabel={`${t('report.overall')}: ${overall.score ?? t('common.notAvailable')}`}
            caption={t('report.overall')}
          />
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-xl font-extrabold tracking-tight text-ink-950">
              {t('report.title')}
            </h2>
            <span
              className={cn(
                'rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wide',
                GRADE_BADGE[overall.grade],
              )}
            >
              {gradeLabel}
            </span>
            {overall.delta !== null && overall.delta !== 0 && (
              <span
                className={cn(
                  'rounded-full px-3 py-1 text-xs font-semibold',
                  overall.delta > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700',
                )}
              >
                {overall.delta > 0 ? '▲' : '▼'}{' '}
                {t('report.delta', { delta: Math.abs(overall.delta) })}
              </span>
            )}
          </div>

          <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-slate-500">
            <div className="flex gap-2">
              <dt className="font-medium">{t('report.auditedUrl')}:</dt>
              <dd className="truncate font-mono text-ink-800">{report.finalUrl}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="font-medium">{t('report.auditedOn')}:</dt>
              <dd>{new Date(report.auditedAt).toLocaleString()}</dd>
            </div>
          </dl>

          <p className="mt-3 text-sm text-slate-500">
            {overall.previousScore !== null
              ? `${t('report.previousScore')}: ${overall.previousScore}`
              : t('report.firstAudit')}
            {' · '}
            <span className="font-medium text-slate-600">
              {t('report.summary.coverage', { measured, total: counts.total })}
            </span>
          </p>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
            {stats.map((stat) => (
              <div key={stat.key} className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                <div className={cn('text-2xl font-extrabold tabular-nums', stat.className)}>
                  {stat.value}
                </div>
                <div className="mt-0.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
