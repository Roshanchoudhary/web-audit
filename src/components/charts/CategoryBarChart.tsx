import type { AuditScore } from '../../types';
import { useI18n } from '../../i18n';
import { scoreHex } from '../../utils/format';

interface CategoryBarChartProps {
  scores: AuditScore[];
}

/** Responsive horizontal bar chart of category scores (0–100). */
export function CategoryBarChart({ scores }: CategoryBarChartProps) {
  const { t } = useI18n();

  return (
    <ul className="space-y-4">
      {scores.map((score) => {
        const name = t(`report.categories.${score.category}.name`);
        const value = score.score;
        return (
          <li
            key={score.category}
            className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-3"
          >
            <span className="w-36 shrink-0 truncate text-sm font-semibold text-ink-800">
              {name}
            </span>
            <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full transition-[width] duration-700 ease-out"
                style={{
                  width: `${value ?? 0}%`,
                  backgroundColor: scoreHex(value),
                }}
              />
            </div>
            <span
              className="w-14 shrink-0 text-end text-sm font-bold tabular-nums"
              style={{ color: scoreHex(value) }}
            >
              {value === null ? '—' : value}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
