import { useI18n } from '../i18n';
import { cn } from '../utils/cn';

export type IssueFilterValue = 'all' | 'critical' | 'errors' | 'warnings' | 'passed' | 'na';

interface IssueFilterProps {
  value: IssueFilterValue;
  onChange: (value: IssueFilterValue) => void;
  counts: Record<IssueFilterValue, number>;
}

const FILTERS: Array<{ key: IssueFilterValue; labelKey: string; tone: string }> = [
  { key: 'all', labelKey: 'report.filters.all', tone: 'text-slate-700' },
  { key: 'critical', labelKey: 'report.filters.critical', tone: 'text-rose-700' },
  { key: 'errors', labelKey: 'report.filters.errors', tone: 'text-rose-600' },
  { key: 'warnings', labelKey: 'report.filters.warnings', tone: 'text-amber-600' },
  { key: 'passed', labelKey: 'report.filters.passed', tone: 'text-emerald-700' },
  { key: 'na', labelKey: 'report.filters.notAvailable', tone: 'text-slate-500' },
];

/** Chip-style filter for the issue list (ARIA toggle buttons with counts). */
export function IssueFilter({ value, onChange, counts }: IssueFilterProps) {
  const { t } = useI18n();

  return (
    <div role="group" aria-label={t('report.filters.title')} className="flex flex-wrap gap-2">
      {FILTERS.map((filter) => {
        const active = value === filter.key;
        return (
          <button
            key={filter.key}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(filter.key)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-1',
              active
                ? 'border-brand-600 bg-brand-600 text-white shadow-sm'
                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50',
              active ? '' : filter.tone,
            )}
          >
            {t(filter.labelKey)}
            <span
              className={cn(
                'rounded-full px-1.5 text-[10px] font-bold tabular-nums',
                active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500',
              )}
            >
              {counts[filter.key]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
