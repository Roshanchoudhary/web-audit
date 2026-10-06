import type { AuditIssue, AuditReport, AuditStage, AuditStageListener } from '../types';
import { AuditError } from '../services/audit/errors';
import type { AuditProvider } from '../services/audit/types';
import { buildReport } from '../services/report/generate';
import { validateUrlInput } from '../utils/url';
import { EVALUATOR_PIPELINE } from './evaluators';
import { extractFacts, type AuxFetch } from './facts';
import { collectLimitations } from './limitations';
import { buildMetrics } from './metrics';

export const ENGINE_VERSION = '1.0.0';

export interface RunAuditOptions {
  onStage?: AuditStageListener;
  signal?: AbortSignal;
  /** Score of the previous run of the same URL (for the delta badge). */
  previousScore?: number | null;
}

const STAGE_PROGRESS: Record<string, number> = {
  validate: 5,
  fetch: 15,
  aux: 30,
  seo: 45,
  performance: 56,
  accessibility: 66,
  security: 75,
  technical: 84,
  content: 91,
  social: 96,
  generate: 100,
  done: 100,
};

function pause(ms = 60): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function looksLikeHtml(text: string | null): boolean {
  return Boolean(text && /^\s*<(!doctype\s+html|html[\s>])/i.test(text));
}

function newReportId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `r-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

async function fetchAux(
  provider: AuditProvider,
  url: string,
  signal: AbortSignal | undefined,
  maxBytes: number,
): Promise<AuxFetch | null> {
  try {
    const result = await provider.fetchText(url, signal);
    if (!result.ok) {
      return { ok: false, status: result.status, text: null, finalUrl: result.finalUrl };
    }
    // A proxy may return 200 + an HTML error page — treat it as missing.
    if (looksLikeHtml(result.text)) {
      return { ok: false, status: 404, text: null, finalUrl: result.finalUrl };
    }
    return {
      ok: true,
      status: result.status,
      text: (result.text ?? '').slice(0, maxBytes),
      finalUrl: result.finalUrl,
    };
  } catch {
    return null; // network/CORS failure → check reports “not available”
  }
}

function declaredSitemap(robots: AuxFetch | null): string | null {
  if (!robots?.text) return null;
  const match = robots.text.match(/^sitemap:\s*(\S+)/im);
  return match ? match[1] : null;
}

function newId(): string {
  return newReportId();
}

/**
 * Run the full audit pipeline:
 * validate → fetch → robots/sitemap/favicon → extract facts → 7 evaluators
 * → scoring → report assembly. Every stage reports honest progress; nothing
 * waits on a fake timer.
 */
export async function runAudit(
  rawUrl: string,
  provider: AuditProvider,
  options: RunAuditOptions = {},
): Promise<AuditReport> {
  const { onStage, signal } = options;
  const emit = (stage: AuditStage) => onStage?.(stage, STAGE_PROGRESS[stage] ?? 0);

  emit('validate');
  const validation = validateUrlInput(rawUrl);
  if (!validation.ok) {
    const code =
      validation.reason === 'empty'
        ? 'empty_url'
        : validation.reason === 'protocol'
          ? 'unsupported_protocol'
          : 'invalid_url';
    throw new AuditError(code);
  }
  const url = validation.normalized;

  emit('fetch');
  const page = await provider.fetchPage(url, signal);

  emit('aux');
  let origin = '';
  try {
    origin = new URL(page.finalUrl).origin;
  } catch {
    throw new AuditError('invalid_url');
  }
  const robots = await fetchAux(provider, `${origin}/robots.txt`, signal, 16 * 1024);
  const sitemapUrl = declaredSitemap(robots) ?? `${origin}/sitemap.xml`;
  const sitemap = await fetchAux(provider, sitemapUrl, signal, 64 * 1024);
  const favicon = await fetchAux(provider, `${origin}/favicon.ico`, signal, 256 * 1024);

  const facts = extractFacts(page, { robots, sitemap, favicon });

  const issues: AuditIssue[] = [];
  for (const step of EVALUATOR_PIPELINE) {
    emit(step.stage);
    await pause();
    issues.push(...step.run(facts));
  }

  emit('generate');
  await pause(40);
  const previousScore = options.previousScore ?? null;

  const report = buildReport({
    id: newId(),
    url,
    finalUrl: page.finalUrl,
    auditedAt: new Date().toISOString(),
    engine: { provider: provider.id, version: ENGINE_VERSION, mode: provider.mode },
    issues,
    metrics: buildMetrics(facts),
    limitations: collectLimitations(issues),
    meta: {
      fetchMs: Math.round(page.durationMs),
      htmlBytes: facts.htmlBytes,
      viaProxy: page.viaProxy,
      redirected: page.redirected,
      httpStatus: page.status,
    },
    previousScore,
  });

  emit('done');
  return report;
}
