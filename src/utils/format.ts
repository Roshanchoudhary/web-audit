import type { ScoreGrade } from '../types';

/** Locale-aware integer/decimal formatting. */
export function formatNumber(value: number, locale: string, digits = 0): string {
  return new Intl.NumberFormat(locale, { maximumFractionDigits: digits }).format(value);
}

export function formatDate(iso: string, locale: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

/** Score → grade band (documented in README “Scoring methodology”). */
export function gradeForScore(score: number | null): ScoreGrade {
  if (score === null || Number.isNaN(score)) return 'unavailable';
  if (score < 40) return 'poor';
  if (score < 60) return 'needs_improvement';
  if (score < 80) return 'good';
  if (score < 90) return 'very_good';
  return 'excellent';
}

/** i18n key for a grade label. */
export function gradeKey(grade: ScoreGrade): string {
  return `report.grades.${grade}`;
}

/** Status → color classes used across cards, chips and charts. */
export const STATUS_COLORS: Record<
  string,
  { dot: string; text: string; bg: string; border: string }
> = {
  pass: {
    dot: 'bg-emerald-500',
    text: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
  },
  warning: {
    dot: 'bg-amber-500',
    text: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
  },
  fail: {
    dot: 'bg-rose-600',
    text: 'text-rose-700',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
  },
  not_available: {
    dot: 'bg-slate-400',
    text: 'text-slate-600',
    bg: 'bg-slate-100',
    border: 'border-slate-200',
  },
};

/** 0–100 score → ring/donut stroke dash offset (circumference units). */
export function scoreToDash(score: number, circumference: number): number {
  const clamped = Math.max(0, Math.min(100, score));
  return circumference - (clamped / 100) * circumference;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Score → colour hex (used by SVG gauges and the PDF canvas renderer). */
export function scoreHex(score: number | null): string {
  if (score === null) return '#94a3b8';
  if (score < 40) return '#e11d48';
  if (score < 60) return '#d97706';
  if (score < 80) return '#078f81';
  if (score < 90) return '#059669';
  return '#047857';
}

/** Tailwind text/bg colour helpers per score grade. */
export const GRADE_TEXT: Record<ScoreGrade, string> = {
  poor: 'text-rose-600',
  needs_improvement: 'text-amber-600',
  good: 'text-brand-700',
  very_good: 'text-emerald-600',
  excellent: 'text-emerald-700',
  unavailable: 'text-slate-500',
};

export const GRADE_BADGE: Record<ScoreGrade, string> = {
  poor: 'bg-rose-50 text-rose-700 border-rose-200',
  needs_improvement: 'bg-amber-50 text-amber-700 border-amber-200',
  good: 'bg-brand-50 text-brand-800 border-brand-200',
  very_good: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  excellent: 'bg-emerald-50 text-emerald-800 border-emerald-300',
  unavailable: 'bg-slate-100 text-slate-600 border-slate-200',
};
