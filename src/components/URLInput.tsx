import { useId } from 'react';
import { normalizeUrlInput, validateUrlInput, displayHost } from '../utils/url';

interface URLInputProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder: string;
  error?: string | null;
  disabled?: boolean;
}

/** URL input that accepts a bare domain and normalizes it to HTTPS. */
export function URLInput({ value, onChange, label, placeholder, error, disabled }: URLInputProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const candidate = normalizeUrlInput(value);
  const validation = validateUrlInput(value);
  const normalizedUrl = validation.ok ? validation.url : null;
  const hostLabel = normalizedUrl ? displayHost(normalizedUrl) : null;
  const faviconUrl = normalizedUrl
    ? `https://www.google.com/s2/favicons?domain_url=${encodeURIComponent(new URL(normalizedUrl).origin)}&sz=64`
    : null;

  const normalizeOnBlur = () => {
    if (candidate && validation.ok) onChange(validation.url);
  };

  return (
    <div className="flex-1 min-w-0">
      <label htmlFor={id} className="mb-2 block text-sm font-semibold text-ink-800">
        {label}
      </label>
      <div className="relative">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 start-4 flex items-center text-slate-400"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
            <path
              d="M3 12h18M12 3c2.5 2.6 3.8 5.7 3.8 9S14.5 18.4 12 21c-2.5-2.6-3.8-5.7-3.8-9S9.5 5.6 12 3Z"
              stroke="currentColor"
              strokeWidth="1.8"
            />
          </svg>
        </span>
        <input
          id={id}
          type="text"
          inputMode="url"
          enterKeyHint="go"
          autoComplete="url"
          autoCapitalize="none"
          spellCheck={false}
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          onBlur={normalizeOnBlur}
          placeholder={placeholder || 'example.com'}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className={[
            'h-14 w-full rounded-2xl border bg-white ps-12 pe-4 text-base text-ink-950 shadow-sm transition',
            'placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-brand-600',
            error ? 'border-rose-400' : 'border-slate-200',
          ].join(' ')}
        />
      </div>
      {normalizedUrl && hostLabel && faviconUrl && (
        <div className="mt-2 flex min-w-0 items-center gap-2 text-xs text-slate-500" aria-live="polite">
          <img
            key={faviconUrl}
            src={faviconUrl}
            alt=""
            width="20"
            height="20"
            loading="lazy"
            onError={(event) => { event.currentTarget.style.visibility = 'hidden'; }}
            className="size-5 shrink-0 rounded-sm object-contain"
          />
          <span className="truncate font-medium text-slate-700">{hostLabel}</span>
          <span className="shrink-0">· HTTPS added automatically when needed</span>
        </div>
      )}
      {error && (
        <p id={errorId} className="mt-2 text-sm font-medium text-rose-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
