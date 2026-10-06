import { useEffect } from 'react';
import { siteConfig } from '../config/site';

export interface SEOHeadProps {
  title: string;
  description: string;
  /** Path used for canonical/OG URL, e.g. `/free-seo-audit` or `/mai/free-seo-audit`. */
  path: string;
  /** Object or list of schema.org objects injected as JSON-LD. */
  jsonLd?: Record<string, unknown> | Array<Record<string, unknown>>;
  noindex?: boolean;
}

function upsertMeta(selector: string, content: string): void {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement('meta');
    const [attr, value] = selector.replace(/^meta\[|\]$/g, '').split('=');
    el.setAttribute(attr, value.replace(/["']/g, ''));
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertLink(rel: string, href: string): void {
  let el = document.head.querySelector<HTMLLinkElement>(linkSelector(rel));
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

function linkSelector(rel: string): string {
  return `link[rel="${rel}"]`;
}

/**
 * Declarative <head> management for the SPA: title, description, canonical,
 * Open Graph, Twitter card, robots and Search Console verification plus
 * JSON-LD structured data. Renders nothing.
 */
export function SEOHead({ title, description, path, jsonLd, noindex }: SEOHeadProps) {
  useEffect(() => {
    const url = `${siteConfig.url}${path === '/' ? '/' : path}`;
    document.title = title;

    upsertMeta('meta[name="description"]', description);
    upsertMeta(
      'meta[name="robots"]',
      noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large',
    );
    upsertLink('canonical', url);

    upsertMeta('meta[property="og:type"]', 'website');
    upsertMeta('meta[property="og:site_name"]', siteConfig.name);
    upsertMeta('meta[property="og:title"]', title);
    upsertMeta('meta[property="og:description"]', description);
    upsertMeta('meta[property="og:url"]', url);
    upsertMeta('meta[name="twitter:card"]', 'summary');
    upsertMeta('meta[name="twitter:title"]', title);
    upsertMeta('meta[name="twitter:description"]', description);

    if (siteConfig.searchConsole) {
      upsertMeta('meta[name="google-site-verification"]', siteConfig.searchConsole);
    }

    let script: HTMLScriptElement | null = null;
    if (jsonLd) {
      script = document.createElement('script');
      script.type = 'application/ld+json';
      script.id = 'seo-jsonld';
      const payload = Array.isArray(jsonLd)
        ? { '@context': 'https://schema.org', '@graph': jsonLd }
        : jsonLd;
      script.textContent = JSON.stringify(payload);
      document.head.appendChild(script);
    }

    return () => {
      script?.remove();
    };
  }, [title, description, path, jsonLd, noindex]);

  return null;
}
