import type { AuditIssue, AuditStage } from '../../types';
import type { AuditFacts } from '../facts';
import { evaluateSeo } from './seo';
import { evaluatePerformance } from './performance';
import { evaluateAccessibility } from './accessibility';
import { evaluateSecurity } from './security';
import { evaluateTechnical } from './technical';
import { evaluateContent } from './content';
import { evaluateSocial } from './social';

export interface EvaluatorStep {
  stage: AuditStage;
  run: (facts: AuditFacts) => AuditIssue[];
}

/** Ordered evaluation pipeline — drives both scoring and progress UI. */
export const EVALUATOR_PIPELINE: EvaluatorStep[] = [
  { stage: 'seo', run: evaluateSeo },
  { stage: 'performance', run: evaluatePerformance },
  { stage: 'accessibility', run: evaluateAccessibility },
  { stage: 'security', run: evaluateSecurity },
  { stage: 'technical', run: evaluateTechnical },
  { stage: 'content', run: evaluateContent },
  { stage: 'social', run: evaluateSocial },
];
