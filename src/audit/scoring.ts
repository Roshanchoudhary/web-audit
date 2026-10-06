import type {
  AuditCategoryId,
  AuditIssue,
  AuditRecommendation,
  AuditScore,
  AuditStatus,
  IssueCounts,
  OverallScore,
} from '../types';
import { CATEGORIES } from './checks';
import { gradeForScore } from '../utils/format';

/**
 * Scoring methodology (also documented in README “Scoring methodology”):
 *  - pass = full weight, warning = half weight, fail = 0, not_available = 0
 *  - not_available checks are EXCLUDED from the denominator — they never add
 *    points and never punish the audited site for our tool's limits
 *  - the raw score is then confidence-adjusted:
 *        score = raw × (0.85 + 0.15 × coverage)
 *    so a category with unmeasured checks can never display a perfect 100,
 *    while a fully measured category can
 *  - a category with nothing measurable returns `null` → “Not available”
 */
const CREDIT: Record<AuditStatus, number> = {
  pass: 1,
  warning: 0.5,
  fail: 0,
  not_available: 0,
};

const round2 = (n: number): number => Math.round(n * 100) / 100;

export function scoreCategory(category: AuditCategoryId, issues: AuditIssue[]): AuditScore {
  const categoryIssues = issues.filter((i) => i.category === category);
  let total = 0;
  let measurable = 0;
  let earned = 0;
  const counts = { pass: 0, warning: 0, fail: 0, not_available: 0 };

  for (const item of categoryIssues) {
    total += item.weight;
    counts[item.status] += 1;
    if (item.status !== 'not_available') {
      measurable += item.weight;
      earned += item.weight * CREDIT[item.status];
    }
  }

  const coverage = total > 0 ? round2(measurable / total) : 0;
  const raw = measurable > 0 ? (earned / measurable) * 100 : null;
  const score = raw === null ? null : Math.round(raw * (0.85 + 0.15 * coverage));

  return {
    category,
    score,
    coverage,
    weights: { total, measurable, earned: round2(earned) },
    counts,
  };
}

/** Score every category in canonical order. */
export function scoreAll(issues: AuditIssue[]): AuditScore[] {
  return CATEGORIES.map((c) => scoreCategory(c.id, issues));
}

export function scoreOverall(scores: AuditScore[], previousScore: number | null): OverallScore {
  let numerator = 0;
  let denominator = 0;
  let measurableTotal = 0;
  let weightTotal = 0;

  for (const s of scores) {
    weightTotal += s.weights.total;
    measurableTotal += s.weights.measurable;
    if (s.score !== null && s.weights.measurable > 0) {
      numerator += s.score * s.weights.measurable;
      denominator += s.weights.measurable;
    }
  }

  const score = denominator > 0 ? Math.round(numerator / denominator) : null;
  const coverage = weightTotal > 0 ? round2(measurableTotal / weightTotal) : 0;
  const delta = score !== null && previousScore !== null ? score - previousScore : null;

  return {
    score,
    grade: gradeForScore(score),
    coverage,
    previousScore,
    delta,
  };
}

export function countIssues(issues: AuditIssue[]): IssueCounts {
  const counts: IssueCounts = {
    pass: 0,
    warning: 0,
    fail: 0,
    not_available: 0,
    total: issues.length,
    critical: 0,
    errors: 0,
    warnings: 0,
    passed: 0,
    notAvailable: 0,
  };
  for (const item of issues) {
    counts[item.status] += 1;
    if (
      (item.status === 'fail' || item.status === 'warning') &&
      (item.severity === 'critical' || item.severity === 'high')
    ) {
      counts.critical += 1;
    }
  }
  counts.errors = counts.fail;
  counts.warnings = counts.warning;
  counts.passed = counts.pass;
  counts.notAvailable = counts.not_available;
  return counts;
}

const SEVERITY_RANK: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };

/**
 * Prioritised fix list: failures first, then warnings, ordered by severity
 * and weight. Resolved to display text at render time via the check catalog.
 */
export function topRecommendations(issues: AuditIssue[], limit = 5): AuditRecommendation[] {
  return issues
    .filter((i) => i.status === 'fail' || i.status === 'warning')
    .sort((a, b) => {
      const statusRank = (s: AuditStatus) => (s === 'fail' ? 0 : 1);
      return (
        statusRank(a.status) - statusRank(b.status) ||
        SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity] ||
        b.weight - a.weight
      );
    })
    .slice(0, limit)
    .map((issueItem, index) => ({ issue: issueItem, priority: index + 1 }));
}
