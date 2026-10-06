export interface FAQItem {
  q: string;
  a: string;
}

interface FAQProps {
  items: FAQItem[];
}

/** Accessible accordion built on native <details> — keyboard support for free. */
export function FAQ({ items }: FAQProps) {
  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <details
          key={item.q}
          className="group rounded-xl border border-slate-200 bg-white p-4 transition-shadow open:shadow-card hover:shadow-card sm:p-5"
        >
          <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-base font-semibold text-ink-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 rounded">
            <span>{item.q}</span>
            <span
              aria-hidden="true"
              className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-700 transition-transform group-open:rotate-45"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path
                  d="M6 2v8M2 6h8"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </summary>
          <p id={`faq-answer-${index}`} className="mt-3 text-sm leading-relaxed text-ink-700/85">
            {item.a}
          </p>
        </details>
      ))}
    </div>
  );
}
