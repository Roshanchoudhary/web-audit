import type { AuditScore } from '../../types';
import { useI18n } from '../../i18n';
import { scoreHex } from '../../utils/format';
import { cn } from '../../utils/cn';

interface CategoryScoreProps {
  score: AuditScore;
}

/** Compact category tile: name, score, progress bar, coverage and counts. */
export function CategoryScore({ score }: CategoryScoreProps) {
  const { t } = useI18n();
  const name = t(`report.categories.${score.category}.name`);
  const description = t(`report.categories.${score.category}.desc`);
  const measured = score.counts.pass + score.counts.warning + score.counts.fail;

  const chips: Array<{ key: string; label: string; value: number; dot: string }> = [
    {
      key: 'pass',
      label: t('report.summary.passed'),
      value: score.counts.pass,
      dot: 'bg-emerald-500',
    },
    {
      key: 'warning',
      label: t('report.summary.warnings'),
      value: score.counts.warning,
      dot: 'bg-amber-500',
    },
    {
      key: 'fail',
      label: t('report.summary.errors'),
      value: score.counts.fail,
      dot: 'bg-rose-500',
    },
    {
      key: 'na',
      label: t('report.summary.notAvailable'),
      value: score.counts.not_available,
      dot: 'bg-slate-400',
    },
  ];

  return (
    <article className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-card transition hover:shadow-lift">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-bold uppercase tracking-wide text-ink-800">
            {name}
          </h3>
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500">{description}</p>
        </div>
        <span
          className="shrink-0 rounded-lg px-2.5 py-1 text-lg font-extrabold tabular-nums"
          style={{
            color: score.score === null ? '#64748b' : scoreHex(score.score),
            backgroundColor: score.score === null ? '#f1f5f9' : `${scoreHex(score.score)}1a`,
          }}
        >
          {score.score === null ? '—' : score.score}
        </span>
      </div>

      <div
        className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-100"
        role="progressbar"
        aria-valuenow={score.score ?? 0}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={name}
        aria-valuetext={score.score === null ? t('common.notAvailable') : `${score.score}/100`}
      >
        <div
          className="h-full rounded-full transition-[width] duration-700"
          style={{
            width: `${score.score ?? 0}%`,
            backgroundColor: scoreHex(score.score),
          }}
        />
      </div>

      <p className="mt-2 text-[11px] font-medium text-slate-400">
        {t('report.summary.coverage', { measured, total: measured + score.counts.not_available })}
      </p>

      <ul className="mt-3 flex flex-wrap gap-x-3 gap-y-1.5">
        {chips.map((chip) => (
          <li
            key={chip.key}
            className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500"
          >
            <span aria-hidden="true" className={cn('size-2 rounded-full', chip.dot)} />
            {chip.label}: <span className="font-bold text-ink-800">{chip.value}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}
