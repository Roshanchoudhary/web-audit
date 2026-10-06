import type { AuditReport } from '../../types';
import { urlSlug } from '../../utils/url';
import { renderReportPages, type PdfOptions, type PdfTextSource } from './render';

export type { PdfOptions, PdfTextSource };
export { scoreHex as scoreColor } from '../../utils/format';

/**
 * Generate the full PDF report as a Blob, entirely on the client.
 * jsPDF is loaded lazily so it never blocks first paint.
 * Swap this module for a server-side generator without changing callers.
 */
export async function generatePdfReport(options: PdfOptions): Promise<Blob> {
  const pages = renderReportPages(options);
  const { jsPDF } = await import('jspdf');

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4',
    compress: true,
  });
  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();

  pages.forEach((dataUrl, index) => {
    if (index > 0) doc.addPage();
    doc.addImage(dataUrl, 'JPEG', 0, 0, width, height, undefined, 'FAST');
  });

  return doc.output('blob');
}

export function downloadBlob(blob: Blob, filename: string): void {
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = objectUrl;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 5000);
}

export function reportFileName(report: AuditReport): string {
  const date = report.auditedAt.slice(0, 10);
  return `webaudit-pro-${urlSlug(report.url)}-${date}.pdf`;
}
