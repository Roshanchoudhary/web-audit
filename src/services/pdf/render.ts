import type { AuditReport } from '../../types';
import { getCheck } from '../../audit/checks';
import { scoreHex as scoreColor } from '../../utils/format';

/**
 * Client-side PDF report renderer.
 *
 * Strategy: paint each PDF page on an offscreen canvas (full Unicode + RTL via
 * the browser's own text engine), then assemble the pages with jsPDF. This
 * keeps the report generation free of external services and makes the
 * generator trivial to replace with a server-side implementation later.
 */

export const PAGE_W = 1240;
export const PAGE_H = 1754;
const MARGIN = 80;
const FOOTER_SPACE = 90;

const COLORS = {
  brand: '#078f81',
  brandDark: '#0d4a45',
  ink: '#0f211e',
  muted: '#64748b',
  line: '#e2e8f0',
  soft: '#f8fafc',
  pass: '#059669',
  warn: '#d97706',
  fail: '#e11d48',
  na: '#94a3b8',
  white: '#ffffff',
};

export interface PdfTextSource {
  t: (key: string, vars?: Record<string, string | number>) => string;
  tCheck: (checkId: string, field: 'title' | 'description' | 'fix', fallback: string) => string;
}

export interface PdfOptions {
  report: AuditReport;
  lang: string;
  dir: 'ltr' | 'rtl';
  text: PdfTextSource;
  brand: { name: string; domain: string; tagline: string };
}

const FONT_STACK =
  'system-ui, -apple-system, "Segoe UI", Roboto, "Noto Sans", "Noto Sans Devanagari", "Nirmala UI", "Noto Sans Arabic", "Segoe UI Emoji", Arial, sans-serif';

const font = (size: number, weight = 400): string => `${weight} ${size}px ${FONT_STACK}`;

class ReportRenderer {
  private pages: HTMLCanvasElement[] = [];
  private ctx!: CanvasRenderingContext2D;
  private y = 0;
  private readonly rtl: boolean;

  constructor(private readonly opts: PdfOptions) {
    this.rtl = opts.dir === 'rtl';
  }

  /* ----------------------------- page helpers ---------------------------- */

  private newPage(): CanvasRenderingContext2D {
    const canvas = document.createElement('canvas');
    canvas.width = PAGE_W;
    canvas.height = PAGE_H;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D unavailable');
    ctx.fillStyle = COLORS.white;
    ctx.fillRect(0, 0, PAGE_W, PAGE_H);
    ctx.direction = this.rtl ? 'rtl' : 'ltr';
    ctx.textBaseline = 'alphabetic';
    this.pages.push(canvas);
    this.ctx = ctx;
    this.y = MARGIN;
    return ctx;
  }

  private get contentWidth(): number {
    return PAGE_W - MARGIN * 2;
  }

  private ensureSpace(height: number): void {
    if (this.y + height > PAGE_H - FOOTER_SPACE) this.newPage();
  }

  /** x coordinate for text alignment in the current direction. */
  private get left(): number {
    return this.rtl ? PAGE_W - MARGIN : MARGIN;
  }

  private get right(): number {
    return this.rtl ? MARGIN : PAGE_W - MARGIN;
  }

  private line(x1: number, x2: number, y: number, color = COLORS.line, width = 1): void {
    const ctx = this.ctx;
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(x1, y);
    ctx.lineTo(x2, y);
    ctx.stroke();
  }

  private wrap(str: string, maxWidth: number, fontString: string): string[] {
    const ctx = this.ctx;
    ctx.font = fontString;
    const lines: string[] = [];
    for (const paragraph of str.split('\n')) {
      const words = paragraph.split(/\s+/).filter(Boolean);
      let line = '';
      for (const word of words) {
        const candidate = line ? `${line} ${word}` : word;
        if (ctx.measureText(candidate).width <= maxWidth) {
          line = candidate;
          continue;
        }
        if (line) lines.push(line);
        if (ctx.measureText(word).width > maxWidth) {
          let chunk = '';
          for (const ch of word) {
            if (chunk && ctx.measureText(chunk + ch).width > maxWidth) {
              lines.push(chunk);
              chunk = ch;
            } else {
              chunk += ch;
            }
          }
          line = chunk;
        } else {
          line = word;
        }
      }
      if (line) lines.push(line);
    }
    return lines.length > 0 ? lines : [''];
  }

  private paragraph(
    str: string,
    opts: {
      size?: number;
      weight?: number;
      color?: string;
      x?: number;
      maxWidth?: number;
      lineHeight?: number;
    } = {},
  ): number {
    const size = opts.size ?? 20;
    const lineHeight = opts.lineHeight ?? Math.round(size * 1.5);
    const fontString = font(size, opts.weight ?? 400);
    const x = opts.x ?? this.left;
    const maxWidth = opts.maxWidth ?? this.contentWidth;
    const lines = this.wrap(str, maxWidth, fontString);
    const ctx = this.ctx;
    ctx.font = fontString;
    ctx.fillStyle = opts.color ?? COLORS.ink;
    for (const lineText of lines) {
      ctx.fillText(lineText, x, this.y + size, maxWidth);
      this.y += lineHeight;
    }
    return lines.length * lineHeight;
  }

  /* ------------------------------ chrome --------------------------------- */

  private bandTitle(title: string, subtitle?: string): void {
    const ctx = this.ctx;
    ctx.fillStyle = COLORS.brandDark;
    ctx.fillRect(0, 0, PAGE_W, 120);
    // logo mark
    ctx.fillStyle = COLORS.brand;
    const bx = this.rtl ? PAGE_W - MARGIN - 52 : MARGIN;
    ctx.beginPath();
    ctx.roundRect(bx, 34, 52, 52, 14);
    ctx.fill();
    ctx.strokeStyle = COLORS.white;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(bx + 24, 24 + 30, 11, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = COLORS.white;
    ctx.font = font(28, 700);
    ctx.textAlign = this.rtl ? 'right' : 'left';
    ctx.fillText(this.opts.brand.name, bx + (this.rtl ? -66 : 66), 70);

    ctx.textAlign = this.rtl ? 'left' : 'right';
    ctx.font = font(24, 600);
    ctx.fillStyle = '#a7f3d0';
    ctx.fillText(title, this.rtl ? MARGIN : PAGE_W - MARGIN, 70);
    ctx.textAlign = 'start';

    this.y = 160;
    if (subtitle) {
      this.paragraph(subtitle, { size: 20, color: COLORS.muted });
      this.y += 8;
    }
  }

  private stampFooters(): void {
    const { t } = this.opts.text;
    const total = this.pages.length;
    this.pages.forEach((canvas, index) => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.direction = this.rtl ? 'rtl' : 'ltr';
      const y = PAGE_H - 56;
      ctx.strokeStyle = COLORS.line;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(MARGIN, y - 24);
      ctx.lineTo(PAGE_W - MARGIN, y - 24);
      ctx.stroke();

      ctx.font = font(17, 500);
      ctx.fillStyle = COLORS.muted;
      ctx.textAlign = 'left';
      ctx.fillText(this.opts.brand.domain, MARGIN, y + 4);
      ctx.textAlign = 'right';
      ctx.fillText(`${t('pdf.page')} ${index + 1} ${t('pdf.of')} ${total}`, PAGE_W - MARGIN, y + 4);
      ctx.textAlign = 'start';
    });
  }

  /* ------------------------------ sections -------------------------------- */

  private scoreGauge(score: number | null, gradeLabel: string): void {
    const ctx = this.ctx;
    const cx = PAGE_W / 2;
    const cy = this.y + 150;
    const radius = 128;
    const start = -Math.PI / 2;

    ctx.lineWidth = 30;
    ctx.strokeStyle = COLORS.line;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.stroke();

    if (score !== null) {
      const pct = Math.max(0, Math.min(100, score)) / 100;
      ctx.strokeStyle = scoreColor(score);
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(cx, cy, radius, start, start + Math.PI * 2 * pct);
      ctx.stroke();
      ctx.lineCap = 'butt';
    }

    ctx.textAlign = 'center';
    ctx.fillStyle = scoreColor(score);
    ctx.font = font(96, 800);
    ctx.fillText(score === null ? '—' : String(score), cx, cy + 22);
    ctx.fillStyle = COLORS.muted;
    ctx.font = font(24, 600);
    ctx.fillText(gradeLabel, cx, cy + 62);
    ctx.textAlign = this.rtl ? 'right' : 'left';
    this.y = cy + radius + 34;
  }

  private statTiles(): void {
    const { report, text } = this.opts;
    const counts = report.counts;
    const tiles: Array<{ label: string; value: number; color: string }> = [
      { label: text.t('report.summary.critical'), value: counts.critical, color: COLORS.fail },
      { label: text.t('report.summary.errors'), value: counts.errors, color: '#f43f5e' },
      { label: text.t('report.summary.warnings'), value: counts.warnings, color: COLORS.warn },
      { label: text.t('report.summary.passed'), value: counts.passed, color: COLORS.pass },
    ];
    const gap = 20;
    const tileW = (this.contentWidth - gap * (tiles.length - 1)) / tiles.length;
    const tileH = 116;
    this.ensureSpace(tileH + 30);
    const ctx = this.ctx;

    tiles.forEach((tile, index) => {
      const offset = index * (tileW + gap);
      const x = this.rtl ? this.right - offset - tileW : this.left + offset;
      ctx.fillStyle = COLORS.soft;
      ctx.beginPath();
      ctx.roundRect(x, this.y, tileW, tileH, 16);
      ctx.fill();
      ctx.fillStyle = tile.color;
      ctx.fillRect(x, this.y, tileW, 6);
      ctx.fillStyle = tile.color;
      ctx.font = font(44, 800);
      ctx.textAlign = 'center';
      ctx.fillText(String(tile.value), x + tileW / 2, this.y + 62);
      ctx.fillStyle = COLORS.muted;
      ctx.font = font(18, 600);
      ctx.fillText(tile.label, x + tileW / 2, this.y + 94);
      ctx.textAlign = this.rtl ? 'right' : 'left';
    });
    this.y += tileH + 34;
  }

  private categoryBars(): void {
    const ctx = this.ctx;
    for (const score of this.opts.report.scores) {
      this.ensureSpace(52);
      const label = this.opts.text.t(`report.categories.${score.category}.name`);
      const value =
        score.score === null ? this.opts.text.t('common.notAvailable') : String(score.score);
      const barX = this.rtl ? this.right - 420 - 160 : this.left + 420;
      const barW = 420;

      ctx.font = font(21, 600);
      ctx.fillStyle = COLORS.ink;
      ctx.textAlign = this.rtl ? 'right' : 'left';
      ctx.fillText(label, this.rtl ? this.right : this.left, this.y + 24);

      ctx.fillStyle = '#eef2f7';
      ctx.beginPath();
      ctx.roundRect(barX, this.y + 8, barW, 22, 11);
      ctx.fill();
      if (score.score !== null) {
        ctx.fillStyle = scoreColor(score.score);
        const filled = Math.max(8, (score.score / 100) * barW);
        ctx.beginPath();
        ctx.roundRect(this.rtl ? barX + barW - filled : barX, this.y + 8, filled, 22, 11);
        ctx.fill();
      }
      ctx.font = font(21, 700);
      ctx.fillStyle = scoreColor(score.score);
      ctx.textAlign = this.rtl ? 'left' : 'right';
      ctx.fillText(value, this.rtl ? this.left : this.right, this.y + 26);
      ctx.textAlign = this.rtl ? 'right' : 'left';
      this.y += 50;
    }
    this.y += 10;
  }

  private distributionBar(): void {
    const { report, text } = this.opts;
    const total = Math.max(1, report.counts.total);
    const segments = [
      { value: report.counts.pass, color: COLORS.pass, label: text.t('report.summary.passed') },
      {
        value: report.counts.warning,
        color: COLORS.warn,
        label: text.t('report.summary.warnings'),
      },
      { value: report.counts.fail, color: COLORS.fail, label: text.t('report.summary.errors') },
      {
        value: report.counts.notAvailable,
        color: COLORS.na,
        label: text.t('report.summary.notAvailable'),
      },
    ];
    const ctx = this.ctx;
    const barH = 34;
    this.ensureSpace(barH + 70);
    let x = this.left;
    ctx.fillStyle = '#eef2f7';
    ctx.beginPath();
    ctx.roundRect(this.left, this.y, this.contentWidth, barH, 10);
    ctx.fill();
    for (const segment of segments) {
      const w = (segment.value / total) * this.contentWidth;
      if (w <= 0) continue;
      ctx.fillStyle = segment.color;
      ctx.fillRect(x, this.y, w, barH);
      x += w;
    }
    this.y += barH + 18;
    ctx.font = font(18, 500);
    ctx.fillStyle = COLORS.muted;
    const summary = segments
      .map((s) => `${s.label}: ${s.value}`)
      .join(this.rtl ? '  ·  ' : '  ·  ');
    ctx.fillText(summary, this.left, this.y + 14, this.contentWidth);
    this.y += 44;
  }

  private sectionTitle(title: string, note?: string): void {
    this.ensureSpace(note ? 90 : 60);
    this.y += 14;
    this.paragraph(title, { size: 30, weight: 700, color: COLORS.brandDark });
    this.y += 6;
    if (note) {
      this.paragraph(note, { size: 18, color: COLORS.muted });
      this.y += 6;
    }
  }

  private metricsGrid(): void {
    const { report, text } = this.opts;
    const perf = report.metrics.performance;
    const content = report.metrics.content;
    const items: Array<{ label: string; value: string; note?: string }> = [
      {
        label: text.t('report.metrics.fetchTime'),
        value: `${perf.fetchMs ?? '—'} ms`,
        note: text.t('report.metrics.fetchTimeHint'),
      },
      { label: text.t('report.metrics.resources'), value: String(perf.resourceCount) },
      { label: text.t('report.metrics.scripts'), value: String(perf.scripts) },
      { label: text.t('report.metrics.images'), value: String(perf.images) },
      { label: text.t('report.metrics.words'), value: String(content.words) },
      { label: text.t('report.metrics.links'), value: String(content.links) },
      { label: text.t('report.metrics.ratio'), value: `${content.textToHtmlRatio}%` },
      {
        label: text.t('report.metrics.readability'),
        value:
          content.readabilityGrade === null
            ? text.t('common.notAvailable')
            : String(content.readabilityGrade),
      },
    ];
    const columns = 4;
    const gap = 18;
    const tileW = (this.contentWidth - gap * (columns - 1)) / columns;
    const tileH = 110;
    const rows = Math.ceil(items.length / columns);
    this.ensureSpace(rows * (tileH + gap) + 20);
    const ctx = this.ctx;

    items.forEach((item, index) => {
      const row = Math.floor(index / columns);
      const col = index % columns;
      const offset = col * (tileW + gap);
      const x = this.rtl ? this.right - offset - tileW : this.left + offset;
      const y = this.y + row * (tileH + gap);
      ctx.fillStyle = COLORS.soft;
      ctx.beginPath();
      ctx.roundRect(x, y, tileW, tileH, 14);
      ctx.fill();
      ctx.fillStyle = COLORS.ink;
      ctx.font = font(32, 700);
      ctx.textAlign = 'center';
      ctx.fillText(item.value, x + tileW / 2, y + 48);
      ctx.fillStyle = COLORS.muted;
      ctx.font = font(17, 600);
      const lines = this.wrap(item.label, tileW - 20, font(17, 600)).slice(0, 2);
      lines.forEach((lineText, i) => {
        ctx.fillText(lineText, x + tileW / 2, y + 76 + i * 20);
      });
      ctx.textAlign = this.rtl ? 'right' : 'left';
    });
    this.y += rows * (tileH + gap) + 16;
  }

  private limitationsList(): void {
    const { report, text } = this.opts;
    if (report.limitations.length === 0) return;
    this.sectionTitle(text.t('report.limitations.title'), text.t('report.limitations.note'));
    for (const key of report.limitations) {
      this.ensureSpace(46);
      const ctx = this.ctx;
      ctx.fillStyle = COLORS.na;
      ctx.beginPath();
      ctx.arc(this.rtl ? this.right - 7 : this.left + 7, this.y + 12, 6, 0, Math.PI * 2);
      ctx.fill();
      const startX = this.rtl ? this.left : this.left + 26;
      const savedY = this.y;
      this.y = savedY;
      const used = this.paragraph(text.t(key), {
        size: 18,
        color: COLORS.ink,
        x: startX,
        maxWidth: this.contentWidth - 26,
        lineHeight: 26,
      });
      this.y = savedY + Math.max(34, used + 8);
    }
    this.y += 6;
  }

  private recommendations(): void {
    const { report, text } = this.opts;
    const recs = report.issues
      .filter((i) => i.status === 'fail' || i.status === 'warning')
      .slice(0, 5);
    if (recs.length === 0) return;
    this.sectionTitle(
      text.t('report.sections.recommendations'),
      text.t('report.sections.recommendationsSub'),
    );
    recs.forEach((issueItem, index) => {
      const check = getCheck(issueItem.checkId);
      if (!check) return;
      const title = text.tCheck(check.id, 'title', check.title);
      const fix = text.tCheck(check.id, 'fix', check.fix);
      this.ensureSpace(120);
      const ctx = this.ctx;
      const badgeColor = issueItem.status === 'fail' ? COLORS.fail : COLORS.warn;
      ctx.fillStyle = badgeColor;
      ctx.beginPath();
      ctx.roundRect(this.left, this.y, 36, 36, 10);
      ctx.fill();
      ctx.fillStyle = COLORS.white;
      ctx.font = font(20, 700);
      ctx.textAlign = 'center';
      ctx.fillText(String(index + 1), this.left + 18, this.y + 25);
      ctx.textAlign = this.rtl ? 'right' : 'left';

      const savedY = this.y;
      const titleX = this.rtl ? this.left : this.left + 52;
      this.y = savedY;
      const used = this.paragraph(`${title} — ${fix}`, {
        size: 19,
        color: COLORS.ink,
        x: titleX,
        maxWidth: this.contentWidth - 52,
        lineHeight: 27,
      });
      this.y = savedY + Math.max(52, used + 14);
    });
    this.y += 4;
  }

  private issueBlock(issueItem: AuditReport['issues'][number]): void {
    const { text } = this.opts;
    const check = getCheck(issueItem.checkId);
    if (!check) return;
    const title = text.tCheck(check.id, 'title', check.title);
    const description = text.tCheck(check.id, 'description', check.description);
    const fix = text.tCheck(check.id, 'fix', check.fix);

    const dotColor =
      issueItem.status === 'pass'
        ? COLORS.pass
        : issueItem.status === 'warning'
          ? COLORS.warn
          : issueItem.status === 'fail'
            ? COLORS.fail
            : COLORS.na;

    const titleFont = font(21, 700);
    const bodyFont = font(18, 400);
    const titleLines = this.wrap(title, this.contentWidth - 32, titleFont);
    const descLines = this.wrap(
      `${text.t('report.fields.what')}: ${description}`,
      this.contentWidth - 32,
      bodyFont,
    );
    const fixLines = this.wrap(
      `${text.t('report.fields.fix')}: ${fix}`,
      this.contentWidth - 32,
      bodyFont,
    );
    const metaLine = [
      text.t(`report.status.${issueItem.status}`),
      text.t(`report.severity.${issueItem.severity}`),
      text.t(`report.measurement.${issueItem.measurement}`),
      issueItem.evidence ? issueItem.evidence : '',
    ]
      .filter(Boolean)
      .join('  ·  ');

    const metaLines = this.wrap(metaLine, this.contentWidth - 32, font(16, 500));
    const height =
      26 +
      titleLines.length * 28 +
      descLines.length * 26 +
      fixLines.length * 26 +
      metaLines.length * 22 +
      30;
    this.ensureSpace(Math.min(height, PAGE_H - MARGIN * 2 - FOOTER_SPACE));

    const ctx = this.ctx;
    ctx.fillStyle = dotColor;
    ctx.beginPath();
    ctx.arc(this.rtl ? this.right - 9 : this.left + 9, this.y + 14, 9, 0, Math.PI * 2);
    ctx.fill();

    const textX = this.rtl ? this.left : this.left + 32;
    const startY = this.y;
    this.y = startY;
    this.paragraph(titleLines.join('\n'), {
      size: 21,
      weight: 700,
      x: textX,
      maxWidth: this.contentWidth - 32,
      lineHeight: 28,
    });
    this.y += 6;
    this.paragraph(descLines.join('\n'), {
      size: 18,
      color: COLORS.ink,
      x: textX,
      maxWidth: this.contentWidth - 32,
      lineHeight: 26,
    });
    this.y += 4;
    this.paragraph(fixLines.join('\n'), {
      size: 18,
      color: COLORS.brandDark,
      x: textX,
      maxWidth: this.contentWidth - 32,
      lineHeight: 26,
    });
    this.y += 6;
    this.paragraph(metaLines.join('\n'), {
      size: 16,
      weight: 500,
      color: COLORS.muted,
      x: textX,
      maxWidth: this.contentWidth - 32,
      lineHeight: 22,
    });
    this.y += 18;
    this.line(this.left, this.right, this.y, COLORS.line);
    this.y += 18;
  }

  private issuesSection(): void {
    const { report, text } = this.opts;
    const order = [
      'seo',
      'performance',
      'accessibility',
      'security',
      'technical',
      'content',
      'social',
    ];

    this.sectionTitle(text.t('pdf.issues'));
    for (const category of order) {
      const categoryIssues = report.issues.filter((i) => i.category === category);
      const active = categoryIssues.filter((i) => i.status !== 'pass');
      const score = report.scores.find((s) => s.category === category);
      if (active.length === 0) continue;
      this.ensureSpace(70);
      this.y += 10;
      const label = text.t(`report.categories.${category}.name`);
      const value =
        score && score.score !== null ? `${score.score}/100` : text.t('common.notAvailable');
      const ctx = this.ctx;
      ctx.font = font(23, 700);
      ctx.fillStyle = COLORS.brandDark;
      ctx.textAlign = this.rtl ? 'right' : 'left';
      ctx.fillText(`${label}  (${value})`, this.rtl ? this.right : this.left, this.y + 24);
      ctx.textAlign = 'start';
      this.y += 40;
      for (const item of active) this.issueBlock(item);
    }

    const passed = report.issues.filter((i) => i.status === 'pass');
    if (passed.length > 0) {
      this.ensureSpace(80);
      this.y += 8;
      this.sectionTitle(
        `${text.t('report.summary.passed')} (${passed.length})`,
        text.t('report.charts.coverageNote'),
      );
      const ctx = this.ctx;
      for (const item of passed) {
        const check = getCheck(item.checkId);
        if (!check) continue;
        const title = text.tCheck(check.id, 'title', check.title);
        this.ensureSpace(34);
        ctx.fillStyle = COLORS.pass;
        ctx.beginPath();
        ctx.arc(this.rtl ? this.right - 6 : this.left + 6, this.y + 11, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.font = font(18, 500);
        ctx.fillStyle = COLORS.ink;
        ctx.fillText(
          title,
          this.rtl ? this.left : this.left + 24,
          this.y + 17,
          this.contentWidth - 24,
        );
        this.y += 30;
      }
    }
  }

  /* ------------------------------- assembly ------------------------------- */

  private renderPages(): HTMLCanvasElement[] {
    const { report, text, brand } = this.opts;
    const gradeLabel = text.t(`report.grades.${report.overall.grade}` as string);

    /* ---- page 1: cover ---- */
    this.newPage();
    this.bandTitle(text.t('pdf.reportTitle'));
    this.paragraph(text.t('report.auditedUrl'), { size: 18, weight: 600, color: COLORS.muted });
    this.y += 6;
    this.paragraph(report.url, { size: 34, weight: 700, color: COLORS.ink });
    this.y += 10;
    this.paragraph(
      `${text.t('report.auditedOn')}: ${report.auditedAt.slice(0, 10)}  ·  ${text.t('report.engine')}: ${report.engine.mode}`,
      { size: 19, color: COLORS.muted },
    );
    this.y += 26;

    this.paragraph(text.t('report.overall'), {
      size: 22,
      weight: 700,
      color: COLORS.brandDark,
    });
    this.y += 8;
    this.scoreGauge(report.overall.score, gradeLabel);
    this.statTiles();
    this.sectionTitle(text.t('report.sections.scores'), text.t('report.charts.coverageNote'));
    this.categoryBars();

    /* ---- page 2: metrics, limitations, recommendations ---- */
    this.newPage();
    this.bandTitle(text.t('report.sections.metrics'));
    this.metricsGrid();
    this.y += 10;
    this.sectionTitle(text.t('report.charts.distributionTitle'));
    this.distributionBar();
    this.limitationsList();
    this.sectionTitle(text.t('scoring.title'));
    this.paragraph(text.t('scoring.text'), { size: 18, color: COLORS.ink, lineHeight: 27 });
    this.y += 12;
    this.recommendations();

    /* ---- findings ---- */
    this.newPage();
    this.bandTitle(text.t('pdf.issues'));
    this.issuesSection();

    /* ---- disclaimer + footer ---- */
    this.ensureSpace(70);
    this.y += 16;
    this.paragraph(`${text.t('pdf.note')}  —  ${brand.name} (${brand.domain})`, {
      size: 16,
      color: COLORS.muted,
      lineHeight: 24,
    });

    this.stampFooters();
    return this.pages;
  }

  render(): HTMLCanvasElement[] {
    return this.renderPages();
  }
}

/** Render every report page as a JPEG data URL (one per PDF page). */
export function renderReportPages(options: PdfOptions): string[] {
  const renderer = new ReportRenderer(options);
  return renderer.render().map((canvas) => canvas.toDataURL('image/jpeg', 0.94));
}
