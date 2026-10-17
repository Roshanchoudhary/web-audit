import type { AuditRecommendation } from '../types';
import { Link } from 'react-router-dom';
import { useI18n } from '../i18n';
import { getCheck } from '../audit/checks';

interface RecommendationCardProps {
  recommendations: AuditRecommendation[];
}

/** Fix-first list of the highest-impact issues found by the audit. */
export function RecommendationCard({ recommendations }: RecommendationCardProps) {
  const { t, tCheck } = useI18n();

  if (recommendations.length === 0) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5 text-sm text-emerald-800">
        {t('report.recommendations.empty')}
      </div>
    );
  }

  return (
    <ol className="space-y-3">
      {recommendations.map((rec) => {
        const check = getCheck(rec.issue.checkId);
        if (!check) return null;
        const title = tCheck(check.id, 'title', check.title);
        const fix = tCheck(check.id, 'fix', check.fix);
        return (
          <li
            key={`${rec.issue.checkId}-${rec.priority}`}
            className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-card sm:p-5"
          >
            <span
              aria-hidden="true"
              className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-50 text-sm font-extrabold text-brand-700"
            >
              {rec.priority}
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="text-sm font-bold text-ink-950">{title}</h4>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                  {t(`report.categories.${rec.issue.category}.name`)}
                </span>
                <span
                  className={
                    rec.issue.severity === 'critical' || rec.issue.severity === 'high'
                      ? 'rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-rose-600'
                      : 'rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700'
                  }
                >
                  {t(`report.severity.${rec.issue.severity}`)}
                </span>
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-700/85">{fix}</p>
              <p className="mt-2 text-xs leading-relaxed text-slate-500">{check.why}</p>
              <Link
                to={`#issue-${rec.issue.checkId}`}
                className="mt-3 inline-flex min-h-9 items-center gap-1 rounded-lg text-sm font-bold text-brand-700 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
                aria-label={`View finding: ${title}`}
              >
                View finding <span aria-hidden="true">→</span>
              </Link>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
