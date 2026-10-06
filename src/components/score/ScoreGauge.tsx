import { useEffect, useState } from 'react';
import { cn } from '../../utils/cn';
import { scoreHex } from '../../utils/format';

interface ScoreGaugeProps {
  score: number | null;
  size?: number;
  /** Grade label rendered under the number (localized by the caller). */
  gradeLabel: string;
  /** Screen-reader label, e.g. “Overall score: 87”. */
  ariaLabel: string;
  caption?: string;
  className?: string;
}

/** Premium circular score indicator (0–100) with a one-shot sweep animation. */
export function ScoreGauge({
  score,
  size = 210,
  gradeLabel,
  ariaLabel,
  caption,
  className,
}: ScoreGaugeProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, [score]);

  const stroke = Math.max(10, Math.round(size * 0.075));
  const radius = size / 2 - stroke / 2 - 2;
  const circumference = 2 * Math.PI * radius;
  const ratio = score === null ? 0 : Math.max(0, Math.min(100, score)) / 100;
  const offset = mounted ? circumference * (1 - ratio) : circumference;
  const numberSize = Math.round(size * 0.3);

  return (
    <div
      className={cn('relative inline-flex flex-col items-center', className)}
      style={{ width: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label={ariaLabel}
        className="-rotate-90"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={scoreHex(score)}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.22, 1, 0.36, 1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center pt-1">
        <span
          className="font-extrabold tabular-nums tracking-tight text-ink-950"
          style={{ fontSize: numberSize, lineHeight: 1 }}
        >
          {score === null ? '—' : score}
        </span>
        <span className="mt-1.5 max-w-[85%] text-center text-xs font-bold uppercase tracking-wide text-slate-500">
          {gradeLabel}
        </span>
      </div>
      {caption && (
        <span className="mt-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
          {caption}
        </span>
      )}
    </div>
  );
}
