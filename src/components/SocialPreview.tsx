import { useState } from 'react';
import type { AuditReport } from '../types';
import { useI18n } from '../i18n';
import { displayHost } from '../utils/url';

interface SocialPreviewProps {
  report: AuditReport;
}

/** Visual Open Graph preview card — shows exactly how shares will render. */
export function SocialPreview({ report }: SocialPreviewProps) {
  const { t } = useI18n();
  const social = report.metrics.social;
  const [imageFailed, setImageFailed] = useState(false);
  const host = displayHost(social.ogUrl ?? report.finalUrl);
  const title = social.ogTitle ?? social.twitterTitle ?? t('report.social.missing');
  const description =
    social.ogDescription ?? social.twitterDescription ?? t('report.social.missing');
  const showImage = Boolean(social.ogImage) && !imageFailed;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
      <div className="relative flex h-44 items-center justify-center bg-gradient-to-br from-ink-900 to-ink-700">
        {showImage ? (
          <img
            src={social.ogImage ?? ''}
            alt=""
            className="h-full w-full object-cover"
            loading="lazy"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <span className="flex flex-col items-center gap-2 text-slate-400">
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect
                x="3"
                y="5"
                width="18"
                height="14"
                rx="2"
                stroke="currentColor"
                strokeWidth="1.6"
              />
              <path
                d="m5 16 4.5-4.5 3 3L16 10l3 3.5"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-xs font-medium">{t('report.social.missingImage')}</span>
          </span>
        )}
        {!social.ogImage && (
          <span className="absolute end-2 top-2 rounded bg-rose-600/90 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
            og:image
          </span>
        )}
      </div>
      <div className="border-t border-slate-200 bg-slate-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{host}</p>
        <p className="mt-1 line-clamp-1 font-bold text-ink-950">{title}</p>
        <p className="mt-1 line-clamp-2 text-sm text-slate-600">{description}</p>
      </div>
      <ul className="flex flex-wrap gap-2 border-t border-slate-100 bg-white px-4 py-3">
        {[
          { key: 'og:title', ok: Boolean(social.ogTitle) },
          { key: 'og:description', ok: Boolean(social.ogDescription) },
          { key: 'og:image', ok: Boolean(social.ogImage) },
          { key: 'twitter:card', ok: Boolean(social.twitterCard) },
        ].map((tag) => (
          <li
            key={tag.key}
            className={
              tag.ok
                ? 'rounded-full bg-emerald-50 px-2.5 py-1 font-mono text-[11px] font-semibold text-emerald-700'
                : 'rounded-full bg-rose-50 px-2.5 py-1 font-mono text-[11px] font-semibold text-rose-600'
            }
          >
            {tag.ok ? '✓' : '✕'} {tag.key}
          </li>
        ))}
      </ul>
    </div>
  );
}
