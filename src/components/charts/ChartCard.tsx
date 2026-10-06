import type { ReactNode } from 'react';

interface ChartCardProps {
  title: string;
  note?: string;
  /** Visible text summary — keeps charts accessible to screen readers. */
  summary?: string;
  children: ReactNode;
  className?: string;
}

export function ChartCard({ title, note, summary, children, className }: ChartCardProps) {
  return (
    <section
      className={`rounded-3xl border border-slate-200 bg-white p-5 shadow-card sm:p-6 ${className ?? ''}`}
    >
      <h3 className="text-base font-bold text-ink-950">{title}</h3>
      {note && <p className="mt-1 text-xs text-slate-500">{note}</p>}
      <div className="mt-5">{children}</div>
      {summary && <p className="mt-4 text-xs leading-relaxed text-slate-500">{summary}</p>}
    </section>
  );
}
