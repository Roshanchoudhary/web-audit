import { useEffect, useState } from 'react';
import { useI18n } from '../i18n';
import { readConsent, writeConsent } from '../services/consent';
import { applyAnalyticsConsent } from '../services/analytics';
import { siteConfig } from '../config/site';
import { Button } from './ui/Button';

/**
 * Lightweight cookie consent (Accept / Reject / Manage preferences).
 * The audit tool itself never waits on consent — only analytics and ads do.
 */
export function ConsentBanner() {
  const { t } = useI18n();
  const [visible, setVisible] = useState(false);
  const [managing, setManaging] = useState(false);
  const [analytics, setAnalytics] = useState(true);
  const [ads, setAds] = useState(true);

  useEffect(() => {
    const existing = readConsent();
    applyAnalyticsConsent(Boolean(existing?.analytics));
    if (!existing) setVisible(true);
  }, []);

  if (!siteConfig.features.consentBanner) return null;

  const decide = (next: { analytics: boolean; ads: boolean }) => {
    writeConsent(next);
    applyAnalyticsConsent(next.analytics);
    setVisible(false);
    setManaging(false);
  };

  if (!visible) return null;

  return (
    <div
      role="region"
      aria-label={t('consent.title')}
      className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 p-4 shadow-lift backdrop-blur animate-fade-up"
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="text-sm">
          <p className="font-semibold text-ink-950">{t('consent.title')}</p>
          <p className="mt-1 text-ink-700/80">{t('consent.text')}</p>
          {managing && (
            <div className="mt-3 space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
              <label className="flex items-center gap-2 text-sm font-medium text-ink-800">
                <input type="checkbox" checked disabled className="size-4 accent-brand-600" />
                {t('consent.necessary')} — {t('consent.necessaryDesc')}
              </label>
              <label className="flex items-center gap-2 text-sm text-ink-800">
                <input
                  type="checkbox"
                  checked={analytics}
                  onChange={(event) => setAnalytics(event.target.checked)}
                  className="size-4 accent-brand-600"
                />
                {t('consent.analytics')} — {t('consent.analyticsDesc')}
              </label>
              <label className="flex items-center gap-2 text-sm text-ink-800">
                <input
                  type="checkbox"
                  checked={ads}
                  onChange={(event) => setAds(event.target.checked)}
                  className="size-4 accent-brand-600"
                />
                {t('consent.ads')} — {t('consent.adsDesc')}
              </label>
            </div>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {managing ? (
            <Button size="sm" onClick={() => decide({ analytics, ads })}>
              {t('consent.save')}
            </Button>
          ) : (
            <>
              <Button size="sm" onClick={() => decide({ analytics: true, ads: true })}>
                {t('consent.accept')}
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => decide({ analytics: false, ads: false })}
              >
                {t('consent.reject')}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setManaging(true)}>
                {t('consent.manage')}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
