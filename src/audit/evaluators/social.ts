import type { AuditIssue } from '../../types';
import type { AuditFacts } from '../facts';
import { issue, na } from './helpers';

const VALID_TWITTER_CARDS = new Set(['summary', 'summary_large_image', 'player', 'app']);

export function evaluateSocial(f: AuditFacts): AuditIssue[] {
  const out: AuditIssue[] = [];
  const s = f.social;

  if (s.ogTitle) {
    out.push(
      issue('social.og_title', 'pass', { value: s.ogTitle, evidence: s.ogTitle.slice(0, 160) }),
    );
  } else {
    out.push(issue('social.og_title', 'fail', { evidence: 'og:title not found' }));
  }

  if (s.ogDescription) {
    out.push(
      issue('social.og_description', 'pass', {
        value: s.ogDescription,
        evidence: s.ogDescription.slice(0, 160),
      }),
    );
  } else {
    out.push(issue('social.og_description', 'fail', { evidence: 'og:description not found' }));
  }

  if (!s.ogImage) {
    out.push(issue('social.og_image', 'fail', { evidence: 'og:image not found' }));
  } else if (/^https:\/\//i.test(s.ogImage)) {
    out.push(
      issue('social.og_image', 'pass', { value: s.ogImage, evidence: s.ogImage.slice(0, 200) }),
    );
  } else {
    out.push(
      issue('social.og_image', 'warning', {
        value: s.ogImage,
        evidence: `non-HTTPS or relative preview image: ${s.ogImage.slice(0, 160)}`,
      }),
    );
  }

  if (!s.ogUrl) {
    out.push(issue('social.og_url', 'warning', { evidence: 'og:url not found' }));
  } else {
    const normalized = (u: string) =>
      u
        .replace(/^https?:\/\//, '')
        .replace(/\/$/, '')
        .toLowerCase();
    const matches =
      normalized(s.ogUrl) === normalized(f.finalUrl) ||
      normalized(s.ogUrl) === normalized(f.requestedUrl);
    if (matches) {
      out.push(issue('social.og_url', 'pass', { value: s.ogUrl, evidence: s.ogUrl }));
    } else {
      out.push(
        issue('social.og_url', 'warning', {
          value: s.ogUrl,
          evidence: `og:url (${s.ogUrl}) differs from audited URL (${f.finalUrl})`,
        }),
      );
    }
  }

  const basics = [s.ogSiteName, s.ogType].filter(Boolean).length;
  if (basics === 2) {
    out.push(
      issue('social.og_basics', 'pass', {
        evidence: `site_name: ${s.ogSiteName}, type: ${s.ogType}`,
      }),
    );
  } else if (basics === 1) {
    out.push(
      issue('social.og_basics', 'warning', { evidence: 'og:site_name / og:type partially set' }),
    );
  } else {
    out.push(issue('social.og_basics', 'fail', { evidence: 'og:site_name and og:type not found' }));
  }

  if (!s.twitterCard) {
    out.push(issue('social.twitter_card', 'fail', { evidence: 'twitter:card not found' }));
  } else if (VALID_TWITTER_CARDS.has(s.twitterCard.toLowerCase())) {
    out.push(
      issue('social.twitter_card', 'pass', { value: s.twitterCard, evidence: s.twitterCard }),
    );
  } else {
    out.push(
      issue('social.twitter_card', 'warning', {
        value: s.twitterCard,
        evidence: `unexpected card type: ${s.twitterCard}`,
      }),
    );
  }

  if (s.twitterTitle && s.twitterDescription) {
    out.push(
      issue('social.twitter_details', 'pass', {
        evidence: 'twitter:title and twitter:description present',
      }),
    );
  } else if (s.twitterTitle || s.twitterDescription) {
    const missing = s.twitterTitle ? 'twitter:description' : 'twitter:title';
    out.push(issue('social.twitter_details', 'warning', { evidence: `${missing} missing` }));
  } else if (s.ogTitle && s.ogDescription) {
    out.push(
      issue('social.twitter_details', 'warning', {
        evidence: 'no explicit twitter:* tags — X falls back to og:* values',
      }),
    );
  } else {
    out.push(na('social.twitter_details', 'neither twitter:* nor og:* fallback values available'));
  }

  return out;
}
