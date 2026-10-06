import { useEffect, useRef } from 'react';
import { siteConfig } from '../config/site';
import { useI18n } from '../i18n';
import { readConsent } from '../services/consent';

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

export type AdVariant = 'header' | 'report' | 'sidebar' | 'footer';

interface AdSlotProps {
  variant: AdVariant;
  className?: string;
}

const SLOT_KEYS: Record<AdVariant, keyof typeof siteConfig.ads.slots> = {
  header: 'header',
  report: 'report',
  sidebar: 'sidebar',
  footer: 'footer',
};

const HEIGHTS: Record<AdVariant, string> = {
  header: 'min-h-[90px]',
  report: 'min-h-[110px]',
  sidebar: 'min-h-[250px]',
  footer: 'min-h-[90px]',
};

const isPlaceholder = (value: string): boolean =>
  !value.startsWith('ca-pub-') || value.includes('YOUR_');

let adsenseLoaded = false;

function ensureAdsenseScript(clientId: string): void {
  if (adsenseLoaded || typeof document === 'undefined') return;
  adsenseLoaded = true;
  const script = document.createElement('script');
  script.async = true;
  script.crossOrigin = 'anonymous';
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(clientId)}`;
  document.head.appendChild(script);
}

/**
 * Google AdSense integration point.
 *
 * Until a real publisher id is configured (site config / VITE_ADSENSE_CLIENT_ID)
 * this renders a clearly labelled neutral placeholder — never a fake ad unit.
 * Real ad units only load after the visitor accepts advertising consent.
 */
export function AdSlot({ variant, className }: AdSlotProps) {
  const { t } = useI18n();
  const insRef = useRef<HTMLModElement>(null);
  const clientId = siteConfig.ads.clientId;
  const slotId = siteConfig.ads.slots[SLOT_KEYS[variant]];
  const configured = siteConfig.features.ads && !isPlaceholder(clientId) && !isPlaceholder(slotId);
  const consent = readConsent();
  const active = configured && Boolean(consent?.ads);

  useEffect(() => {
    if (!active || !insRef.current) return;
    ensureAdsenseScript(clientId);
    try {
      (window.adsbygoogle = window.adsbygoogle ?? []).push({});
    } catch {
      /* AdSense not reachable — placeholder stays visible */
    }
  }, [active, clientId]);

  if (!siteConfig.features.ads) return null;

  if (!active) {
    return (
      <aside
        aria-label={t('ads.label')}
        className={`grid place-items-center rounded-xl border border-dashed border-slate-300 bg-slate-50/70 text-center ${HEIGHTS[variant]} ${className ?? ''}`}
      >
        <div className="px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            {t('ads.label')}
          </p>
          <p className="mt-1 text-sm text-slate-500">{t('ads.placeholder')}</p>
        </div>
      </aside>
    );
  }

  return (
    <aside
      aria-label={t('ads.label')}
      className={`overflow-hidden rounded-xl text-center ${HEIGHTS[variant]} ${className ?? ''}`}
    >
      <ins
        ref={insRef}
        className="adsbygoogle block w-full"
        data-ad-client={clientId}
        data-ad-slot={slotId}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </aside>
  );
}
