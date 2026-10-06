import type { ReactNode } from 'react';
import type { AuditIssue as AuditIssueType } from '../types';
import { useI18n } from '../i18n';
import { getCheck } from '../audit/checks';
import { STATUS_COLORS } from '../utils/format';
import { cn } from '../utils/cn';

interface AuditIssueProps {
  issue: AuditIssueType;
}

const STATUS_ICON: Record<string, ReactNode> = {
  pass: <path d="m5 10 3.5 3.5L15 6.5" strokeLinecap="round" strokeLinejoin="round" />,
  warning: (
    <>
      <path d="M10 4v7" strokeLinecap="round" />
      <circle cx="10" cy="15" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  fail: <path d="m6 6 8 8m0-8-8 8" strokeLinecap="round" />,
  not_available: (
    <>
      <path d="M10 9v5" strokeLinecap="round" />
      <circle cx="10" cy="6.2" r="1" fill="currentColor" stroke="none" />
    </>
  ),
};

/** Single audit finding: icon, status, severity, expandable what/why/fix. */
export function AuditIssue({ issue }: AuditIssueProps) {
  const { t, tCheck } = useI18n();
  const check = getCheck(issue.checkId);
  if (!check) return null;

  const title = tCheck(check.id, 'title', check.title);
  const description = tCheck(check.id, 'description', check.description);
  const why = t('report.fields.why');
  const fix = tCheck(check.id, 'fix', check.fix);
  const colors = STATUS_COLORS[issue.status];
  const isFail = issue.status === 'fail';
  const isWarning = issue.status === 'warning';

  return (
    <details className="group rounded-2xl border border-slate-200 bg-white transition-shadow open:shadow-card hover:shadow-card">
      <summary className="flex cursor-pointer list-none items-start gap-3 p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-inset sm:p-5 [&::-webkit-details-marker]:hidden">
        <span
          aria-hidden="true"
          className={cn(
            'mt-0.5 grid size-7 shrink-0 place-items-center rounded-full border',
            colors.bg,
            colors.border,
            colors.text,
          )}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            {STATUS_ICON[issue.status]}
          </svg>
        </span>

        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-ink-950 sm:text-[15px]">{title}</span>
            <span
              className={cn(
                'rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide',
                colors.bg,
                colors.border,
                colors.text,
              )}
            >
              {t(`report.status.${issue.status}`)}
            </span>
            {(isFail || isWarning) && (
              <span
                className={cn(
                  'rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide',
                  issue.severity === 'critical' || issue.severity === 'high'
                    ? 'bg-rose-50 text-rose-700'
                    : 'bg-slate-100 text-slate-600',
                )}
              >
                {t(`report.severity.${issue.severity}`)}
              </span>
            )}
            <span className="rounded-full bg-slate-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              {t(`report.measurement.${issue.measurement}`)}
            </span>
          </span>
          <span className="mt-1 block text-xs text-slate-500">{description}</span>
        </span>

        <span
          aria-hidden="true"
          className="mt-1 hidden shrink-0 text-xs font-semibold text-brand-700 transition group-open:opacity-0 sm:block"
        >
          {t('common.expand')}
        </span>
        <span
          aria-hidden="true"
          className="mt-1 hidden shrink-0 text-xs font-semibold text-brand-700 transition group-open:block sm:hidden"
        >
          {t('common.collapse')}
        </span>
      </summary>

      <div className="border-t border-slate-100 px-4 pb-5 pt-4 sm:px-5">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wide text-slate-400">
              {t('report.fields.what')}
            </h4>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-800">{description}</p>
            <h4 className="mt-4 text-xs font-bold uppercase tracking-wide text-slate-400">{why}</h4>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-800">{check.why}</p>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wide text-brand-700">
              {t('report.fields.fix')}
            </h4>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-800">{fix}</p>

            <h4 className="mt-4 text-xs font-bold uppercase tracking-wide text-slate-400">
              {t('report.fields.technical')}
            </h4>
            <dl className="mt-1.5 space-y-1 text-xs text-slate-600">
              <div className="flex gap-2">
                <dt className="font-semibold">{t('report.fields.evidence')}:</dt>
                <dd className="min-w-0 break-words font-mono">{issue.evidence ?? '—'}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="font-semibold">{t('report.fields.weight')}:</dt>
                <dd>
                  {issue.weight}/5 · {t('report.fields.category')}:{' '}
                  {t(`report.categories.${issue.category}.name`)}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </details>
  );
}
