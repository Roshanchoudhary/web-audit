import type { AnalyticsEventName } from '../../types';
import { siteConfig } from '../../config/site';

/**
 * Analytics abstraction.
 *
 * - Supports Google Analytics 4 via gtag.js.
 * - The measurement id comes from VITE_GA_MEASUREMENT_ID / site config only.
 * - Nothing loads before the visitor accepts analytics in the consent banner.
 * - Swap this module for a privacy-friendly provider without touching callers.
 */

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const GA_ID = siteConfig.analytics.measurementId;
const VALID_ID = /^G-[A-Z0-9]{6,}$/i.test(GA_ID);

let consented = false;
let injected = false;
let pageViewed = false;

function injectScript(): void {
  if (injected || typeof document === 'undefined') return;
  injected = true;
  window.dataLayer = window.dataLayer ?? [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer?.push(args);
  };
  window.gtag('js', new Date());
  window.gtag('config', GA_ID, { anonymize_ip: true, send_page_view: false });

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_ID)}`;
  document.head.appendChild(script);
}

/** Called once the consent state is known (on boot and on every change). */
export function applyAnalyticsConsent(allowed: boolean): void {
  consented = allowed && VALID_ID && siteConfig.features.analytics;
  if (consented) {
    injectScript();
    if (!pageViewed) {
      pageViewed = true;
      window.gtag?.('event', 'page_view', {
        page_path: window.location.pathname + window.location.search,
        page_title: document.title,
      });
    }
  }
}

export function trackEvent(
  name: AnalyticsEventName,
  params?: Record<string, string | number>,
): void {
  if (!consented || !window.gtag) return;
  window.gtag('event', name, params ?? {});
}

export function trackPageView(path: string): void {
  if (!consented || !window.gtag) return;
  window.gtag('event', 'page_view', { page_path: path });
}
