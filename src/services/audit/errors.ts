import type { AuditErrorCode } from '../../types';

/** Error with a stable code so the UI can show localized, human messages. */
export class AuditError extends Error {
  readonly code: AuditErrorCode;
  /** HTTP status when the error came from a real response. */
  readonly status: number | null;

  constructor(code: AuditErrorCode, message?: string, status: number | null = null) {
    super(message ?? code);
    this.name = 'AuditError';
    this.code = code;
    this.status = status;
  }
}

export function isAuditError(error: unknown): error is AuditError {
  return error instanceof AuditError;
}

/** i18n key for an error (`audit.errors.<code>`). */
export function auditErrorKey(error: unknown): string {
  return isAuditError(error) ? `audit.errors.${error.code}` : 'audit.errors.unknown';
}
