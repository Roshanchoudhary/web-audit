import type { AuditIssue, AuditStatus, MeasurementKind } from '../../types';
import { getCheck } from '../checks';

export interface IssueOptions {
  value?: string | number | boolean | null;
  evidence?: string;
  /** Override the catalog's default measurement badge (e.g. downgrade to NA). */
  measurement?: MeasurementKind;
}

/** Build an AuditIssue from the catalog; throws loudly on unknown check ids. */
export function issue(checkId: string, status: AuditStatus, opts: IssueOptions = {}): AuditIssue {
  const check = getCheck(checkId);
  if (!check) throw new Error(`Unknown check id: ${checkId}`);
  const result: AuditIssue = {
    checkId,
    category: check.category,
    status,
    severity: check.severity,
    weight: check.weight,
    measurement: opts.measurement ?? check.measurement,
  };
  if (opts.value !== undefined) result.value = opts.value;
  if (opts.evidence !== undefined) result.evidence = opts.evidence;
  return result;
}

/** not_available shorthand (measurement defaults to the catalog badge). */
export function na(checkId: string, evidence: string, measurement?: MeasurementKind): AuditIssue {
  return issue(checkId, 'not_available', { evidence, measurement });
}
