import type { IssueCounts } from '../../types';
import { useI18n } from '../../i18n';

interface StatusDonutProps {
  counts: IssueCounts;
}

const SEGMENT_COLORS = {
  pass: '#10b981',
  warning: '#f59e0b',
  fail: '#e11d48',
  not_available: '#94a3b8',
};

/** Donut chart of check outcomes with a legend and screen-reader summary. */
export function StatusDonut({ counts }: StatusDonutProps) {
  const { t } = useI18n();
  const total = Math.max(1, counts.total);

  const segments = [
    {
      key: 'pass',
      label: t('report.summary.passed'),
      value: counts.pass,
      color: SEGMENT_COLORS.pass,
    },
    {
      key: 'warning',
      label: t('report.summary.warnings'),
      value: counts.warning,
      color: SEGMENT_COLORS.warning,
    },
    {
      key: 'fail',
      label: t('report.summary.errors'),
      value: counts.fail,
      color: SEGMENT_COLORS.fail,
    },
    {
      key: 'na',
      label: t('report.summary.notAvailable'),
      value: counts.notAvailable,
      color: SEGMENT_COLORS.not_available,
    },
  ];

  const size = 168;
  const stroke = 26;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  let accumulated = 0;

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:justify-around">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          role="img"
          aria-label={t('report.charts.distributionSummary', {
            passed: counts.passed,
            warnings: counts.warnings,
            errors: counts.errors,
            na: counts.notAvailable,
            total: counts.total,
          })}
          className="-rotate-90"
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#f1f5f9"
            strokeWidth={stroke}
          />
          {segments.map((segment) => {
            const length = (segment.value / total) * circumference;
            const offset = accumulated;
            accumulated += length;
            if (segment.value === 0) return null;
            return (
              <circle
                key={segment.key}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={segment.color}
                strokeWidth={stroke}
                strokeDasharray={`${length} ${circumference - length}`}
                strokeDashoffset={-offset}
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-extrabold tabular-nums text-ink-950">{counts.total}</span>
          <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            {t('report.summary.issues')}
          </span>
        </div>
      </div>

      <ul className="grid grid-cols-2 gap-x-6 gap-y-2.5">
        {segments.map((segment) => (
          <li key={segment.key} className="flex items-center gap-2 text-sm">
            <span
              aria-hidden="true"
              className="size-3 rounded-sm"
              style={{ backgroundColor: segment.color }}
            />
            <span className="text-slate-600">{segment.label}</span>
            <span className="font-bold tabular-nums text-ink-950">{segment.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
