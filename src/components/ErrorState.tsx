import { Button } from './ui/Button';

interface ErrorStateProps {
  title: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
}

/** Friendly failure state — never exposes raw technical errors to users. */
export function ErrorState({ title, message, onRetry, retryLabel }: ErrorStateProps) {
  return (
    <section
      role="alert"
      className="rounded-3xl border border-rose-200 bg-rose-50/70 p-6 text-center shadow-card sm:p-8"
    >
      <span
        aria-hidden="true"
        className="mx-auto grid size-12 place-items-center rounded-full bg-rose-100 text-rose-600"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 8v5m0 3h.01M10.3 3.9 2.6 17.1A2 2 0 0 0 4.3 20h15.4a2 2 0 0 0 1.7-2.9L13.7 3.9a2 2 0 0 0-3.4 0Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <h2 className="mt-4 text-lg font-bold text-ink-950">{title}</h2>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-ink-700/80">{message}</p>
      {onRetry && retryLabel && (
        <div className="mt-5">
          <Button variant="secondary" onClick={onRetry}>
            {retryLabel}
          </Button>
        </div>
      )}
    </section>
  );
}
