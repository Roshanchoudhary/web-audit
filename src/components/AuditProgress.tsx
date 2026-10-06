import type { AuditStage } from '../types';
import { useI18n } from '../i18n';
import { cn } from '../utils/cn';

interface AuditProgressProps {
  stage: AuditStage;
  progress: number;
  url: string;
}

const STAGE_ORDER: AuditStage[] = [
  'validate',
  'fetch',
  'aux',
  'seo',
  'performance',
  'accessibility',
  'security',
  'technical',
  'content',
  'social',
  'generate',
];

/**
 * Live audit progress: deterministic (driven by real pipeline stages, never a
 * fake timer) and accessible via aria-live announcements.
 */
export function AuditProgress({ stage, progress, url }: AuditProgressProps) {
  const { t } = useI18n();
  const currentIndex = STAGE_ORDER.indexOf(stage);
  const stageLabel = t(`progress.stages.${stage}`);
  const percent = Math.max(0, Math.min(100, Math.round(progress)));

  return (
    <section
      aria-labelledby="audit-progress-title"
      className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lift sm:p-8"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="audit-progress-title" className="text-lg font-bold text-ink-950">
            {t('progress.title')}
          </h2>
          <p className="mt-1 text-sm text-ink-700/70">{t('progress.subtitle')}</p>
        </div>
        <span className="rounded-full bg-brand-50 px-3 py-1 font-mono text-sm font-semibold text-brand-800">
          {t('progress.percent', { percent })}
        </span>
      </div>

      <div className="mt-5">
        <div
          className="h-3 w-full overflow-hidden rounded-full bg-slate-100"
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={t('progress.title')}
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-700 transition-[width] duration-500 ease-out"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      <p
        className="mt-4 flex items-center gap-2 text-sm font-semibold text-brand-800"
        aria-live="polite"
        aria-atomic="true"
      >
        <span className="size-2 animate-pulse rounded-full bg-brand-500" aria-hidden="true" />
        {stageLabel}
        <span className="font-normal text-slate-500">— {url}</span>
      </p>

      <ol className="mt-5 grid gap-2 text-xs sm:grid-cols-2">
        {STAGE_ORDER.map((item, index) => {
          const state =
            index < currentIndex ? 'done' : index === currentIndex ? 'current' : 'pending';
          return (
            <li
              key={item}
              className={cn(
                'flex items-center gap-2 rounded-lg px-2.5 py-1.5',
                state === 'current' && 'bg-brand-50 font-semibold text-brand-800',
                state === 'done' && 'text-emerald-700',
                state === 'pending' && 'text-slate-400',
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  'grid size-4 place-items-center rounded-full text-[9px] font-bold',
                  state === 'done' && 'bg-emerald-100 text-emerald-700',
                  state === 'current' && 'bg-brand-600 text-white',
                  state === 'pending' && 'bg-slate-100 text-slate-400',
                )}
              >
                {state === 'done' ? '✓' : index + 1}
              </span>
              {t(`progress.stages.${item}`)}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
