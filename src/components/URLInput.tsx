import { useId } from 'react';

interface URLInputProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder: string;
  error?: string | null;
  disabled?: boolean;
}

/** Audited-URL input with visible label, icon and inline error messaging. */
export function URLInput({ value, onChange, label, placeholder, error, disabled }: URLInputProps) {
  const id = useId();
  const errorId = `${id}-error`;

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
          autoComplete="url"
          autoCapitalize="none"
          spellCheck={false}
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className={[
            'h-14 w-full rounded-2xl border bg-white ps-12 pe-4 text-base text-ink-950 shadow-sm transition',
            'placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-brand-600',
            error ? 'border-rose-400' : 'border-slate-200',
          ].join(' ')}
        />
      </div>
      {error && (
        <p id={errorId} className="mt-2 text-sm font-medium text-rose-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
