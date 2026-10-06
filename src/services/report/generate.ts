import type { AuditIssue, AuditMetrics, AuditReport, ReportMeta } from '../../types';
import { countIssues, scoreAll, scoreOverall } from '../../audit/scoring';

export interface BuildReportInput {
  id: string;
  url: string;
  finalUrl: string;
  auditedAt: string;
  engine: AuditReport['engine'];
  issues: AuditIssue[];
  metrics: AuditMetrics;
  limitations: string[];
  meta: ReportMeta;
  previousScore: number | null;
}

/**
 * Report generator: turns raw check results into the persisted AuditReport
 * (scores, grades, counts). Kept separate from the audit engine so a future
 * version can serialize to an API instead of (or next to) local storage.
 */
export function buildReport(input: BuildReportInput): AuditReport {
  const scores = scoreAll(input.issues);
  const overall = scoreOverall(scores, input.previousScore);
  const counts = countIssues(input.issues);

  return {
    id: input.id,
    url: input.url,
    finalUrl: input.finalUrl,
    auditedAt: input.auditedAt,
    engine: input.engine,
    overall,
    scores,
    counts,
    issues: input.issues,
    metrics: input.metrics,
    limitations: input.limitations,
    meta: input.meta,
  };
}
