import { useState } from 'react';
import type { AuditReport } from '../types';
import { useI18n } from '../i18n';
import { localizePath } from '../i18n/paths';
import { siteConfig } from '../config/site';
import { generatePdfReport, downloadBlob, reportFileName } from '../services/pdf';
import { trackEvent } from '../services/analytics';
import { Button } from './ui/Button';

/** Client-side PDF export (canvas-rendered pages assembled with jsPDF). */
export function PdfButton({ report, className }: { report: AuditReport; className?: string }) {
  const { t, tCheck, lang, dir } = useI18n();
  const [state, setState] = useState<'idle' | 'working' | 'error'>('idle');

  const handleClick = async () => {
    setState('working');
    try {
      const blob = await generatePdfReport({
        report,
        lang,
        dir,
        text: { t, tCheck },
        brand: {
          name: siteConfig.name,
          domain: siteConfig.domain,
          tagline: siteConfig.tagline,
        },
      });
      downloadBlob(blob, reportFileName(report));
      trackEvent('pdf_downloaded', { url: report.url });
      setState('idle');
    } catch {
      setState('error');
      window.setTimeout(() => setState('idle'), 5000);
    }
  };

  return (
    <div className={className}>
      <Button
        size="lg"
        onClick={handleClick}
        disabled={state === 'working'}
        aria-busy={state === 'working'}
        className="w-full justify-center sm:w-auto"
      >
        {state === 'working' && (
          <span
            aria-hidden="true"
            className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
          />
        )}
        {state === 'working' ? t('report.pdf.generating') : t('report.pdf.download')}
      </Button>
      {state === 'error' && (
        <p role="alert" className="mt-2 text-xs font-medium text-rose-600">
          {t('report.pdf.failed')}
        </p>
      )}
    </div>
  );
}

/** Print-friendly report (uses the dedicated @media print stylesheet). */
export function PrintButton({ className }: { className?: string }) {
  const { t } = useI18n();
  return (
    <Button variant="secondary" size="lg" onClick={() => window.print()} className={className}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M7 8V4h10v4M7 17H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2m-10-3h10v6H7v-6Z"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {t('report.pdf.print')}
    </Button>
  );
}

/** Copy a same-device share link for the stored report. */
export function ShareButton({ reportId, className }: { reportId: string; className?: string }) {
  const { t, lang } = useI18n();
  const [status, setStatus] = useState<'idle' | 'copied' | 'failed'>('idle');

  const handleClick = async () => {
    const path = localizePath(`/report/${reportId}`, lang, siteConfig.defaultLanguage);
    const url = `${window.location.origin}${path}`;
    try {
      await navigator.clipboard.writeText(url);
      setStatus('copied');
      trackEvent('report_shared', { report_id: reportId });
      window.setTimeout(() => setStatus('idle'), 3000);
    } catch {
      setStatus('failed');
      window.setTimeout(() => setStatus('idle'), 4000);
    }
  };

  return (
    <div className={className}>
      <Button
        variant="secondary"
        size="lg"
        onClick={handleClick}
        className="w-full justify-center sm:w-auto"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M10 13a4 4 0 0 0 5.7.4l3-3a4 4 0 0 0-5.7-5.7l-1.5 1.5M14 11a4 4 0 0 0-5.7-.4l-3 3a4 4 0 0 0 5.7 5.7l1.5-1.5"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {status === 'copied' ? t('common.copied') : t('report.share.copy')}
      </Button>
      <span role="status" aria-live="polite" className="sr-only">
        {status === 'copied'
          ? t('report.share.copied')
          : status === 'failed'
            ? t('report.share.failed')
            : ''}
      </span>
    </div>
  );
}
