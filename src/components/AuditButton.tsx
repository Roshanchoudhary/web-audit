import type { ButtonHTMLAttributes } from 'react';
import { cn } from '../utils/cn';

interface AuditButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  busyLabel: string;
  busy?: boolean;
}

/** Primary “Start Free Audit” submit button with a busy state. */
export function AuditButton({
  label,
  busyLabel,
  busy = false,
  className,
  ...rest
}: AuditButtonProps) {
  return (
    <button
      type="submit"
      disabled={busy || rest.disabled}
      className={cn(
        'inline-flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-brand-600 px-8 text-base font-bold text-white shadow-lg shadow-brand-600/25 transition hover:bg-brand-700',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto',
        className,
      )}
      {...rest}
    >
      {busy && (
        <span
          aria-hidden="true"
          className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
        />
      )}
      {busy ? busyLabel : label}
    </button>
  );
}
