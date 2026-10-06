import { useCallback, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { AuditStage } from '../types';
import { runAudit } from '../audit/engine';
import { createAuditProvider } from '../services/audit';
import { auditErrorKey } from '../services/audit/errors';
import { reportStore } from '../services/report/store';
import { validateUrlInput } from '../utils/url';
import { useI18n } from '../i18n';
import { localizePath } from '../i18n/paths';
import { siteConfig } from '../config/site';
import { trackEvent } from '../services/analytics';

export interface AuditRunnerState {
  phase: 'idle' | 'running' | 'error';
  stage: AuditStage;
  progress: number;
  /** i18n key of a user-friendly error message. */
  errorKey: string | null;
  /** Validated, normalized URL of the run (shown in the progress UI). */
  url: string;
}

const INITIAL: AuditRunnerState = {
  phase: 'idle',
  stage: 'validate',
  progress: 0,
  errorKey: null,
  url: '',
};

/**
 * Shared “start an audit” flow used by the homepage and every tool landing
 * page: validate → previous score lookup → run engine → persist → navigate.
 */
export function useAuditRunner() {
  const [state, setState] = useState<AuditRunnerState>(INITIAL);
  const navigate = useNavigate();
  const { lang } = useI18n();
  const runningRef = useRef(false);

  const start = useCallback(
    async (rawUrl: string) => {
      if (runningRef.current) return;
      setState({ ...INITIAL, phase: 'running' });

      const validation = validateUrlInput(rawUrl);
      if (!validation.ok) {
        const key =
          validation.reason === 'empty'
            ? 'empty_url'
            : validation.reason === 'protocol'
              ? 'unsupported_protocol'
              : 'invalid_url';
        setState({ ...INITIAL, phase: 'error', errorKey: `audit.errors.${key}` });
        return;
      }

      runningRef.current = true;
      trackEvent('audit_started', { url: validation.normalized });
      try {
        const previous = await reportStore.findLatestForUrl(validation.normalized);
        const report = await runAudit(validation.normalized, createAuditProvider(), {
          onStage: (stage, progress) =>
            setState((prev) => ({ ...prev, phase: 'running', stage, progress })),
          previousScore: previous?.overall.score ?? null,
        });
        await reportStore.save(report);
        trackEvent('audit_completed', {
          score: report.overall.score ?? -1,
          url: report.url,
        });
        navigate(localizePath(`/report/${report.id}`, lang, siteConfig.defaultLanguage));
      } catch (error) {
        setState({
          ...INITIAL,
          phase: 'error',
          errorKey: auditErrorKey(error),
          url: validation.normalized,
        });
      } finally {
        runningRef.current = false;
      }
    },
    [lang, navigate],
  );

  const reset = useCallback(() => setState(INITIAL), []);

  return { state, start, reset };
}
