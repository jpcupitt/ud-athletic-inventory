import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
// Vite bundles the worker as its own asset and gives us the final URL to point at.
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import type { OrderLine } from '../data/types';

GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

export interface ParsedOrder {
  vendor: string;
  /** PO number specifically — distinct from the vendor's own order number. */
  refNumber: string;
  /** The vendor's own order/sales-order/invoice number — what you'd look the
   *  order up by with the vendor, separate from our PO. */
  orderNumber: string;
  orderDate: string; // YYYY-MM-DD, or '' if not found
  lines: OrderLine[];
}

interface TextItem {
  x: number;
  str: string;
}

/**
 * Reconstructs each page as an array of visual text lines. PDF text items carry
 * no row/column structure on their own — group items by baseline Y (rounded,
 * with a small tolerance for sub-pixel jitter) and sort left-to-right within
 * each line, which approximates how the page reads visually.
 */
async function extractLines(file: File): Promise<string[]> {
  const buf = await file.arrayBuffer();
  const pdf = await getDocument({ data: buf }).promise;
  const lines: string[] = [];

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();
    const rows = new Map<number, TextItem[]>();

    for (const raw of content.items) {
      const item = raw as { str: string; transform: number[] };
      if (!item.str || !item.str.trim()) continue;
      const y = Math.round(item.transform[5]);
      const bucketKey = [...rows.keys()].find((k) => Math.abs(k - y) <= 2) ?? y;
      if (!rows.has(bucketKey)) rows.set(bucketKey, []);
      rows.get(bucketKey)!.push({ x: item.transform[4], str: item.str });
    }

    // PDF y-coordinates increase upward, so sort descending for top-to-bottom reading order.
    const orderedY = [...rows.keys()].sort((a, b) => b - a);
    for (const y of orderedY) {
      const text = rows.get(y)!
        .sort((a, b) => a.x - b.x)
        .map((r) => r.str)
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();
      if (text) lines.push(text);
    }
  }
  return lines;
}

function findLabeled(lines: string[], pattern: RegExp): string {
  for (const line of lines) {
    const m = line.match(pattern);
    if (m?.[1]) return m[1].trim();
  }
  return '';
}

function toIsoDate(raw: string): string {
  if (!raw) return '';
  const d = new Date(raw);
  return isNaN(d.getTime()) ? '' : d.toISOString().split('T')[0];
}

const SKIP_LINE_WORDS = /subtotal|^total\b|grand total|\btax\b|shipping|handling charge|^page \d+\s*(of|\/)\s*\d+|^phone\b|^fax\b|balance due|^bill to|^ship to/i;

/**
 * Best-effort "scan and analyze" of an order confirmation PDF: pulls out
 * vendor, PO/order number, order date, and line items via pattern matching
 * on the reconstructed text. Order confirmations vary a lot in layout, so
 * this is a prefill — same as the existing spreadsheet import, the manager
 * reviews and corrects the result before submitting.
 */
export async function parsePdfOrder(file: File): Promise<ParsedOrder> {
  const lines = await extractLines(file);

  const vendor = findLabeled(lines, /\b(?:vendor|supplier|sold\s*by|remit\s*to|from)\s*[:\-]\s*(.+)/i);
  const refNumber = findLabeled(
    lines,
    /\b(?:po|p\.o\.|purchase\s*order)\s*(?:#|no\.?|number)?\s*[:\-]\s*([A-Za-z0-9][A-Za-z0-9-]{2,})/i
  );
  const orderNumber = findLabeled(
    lines,
    /\b(?:sales\s*order|order|invoice|confirmation)\s*(?:#|no\.?|number)?\s*[:\-]\s*([A-Za-z0-9][A-Za-z0-9-]{2,})/i
  );
  const dateRaw = findLabeled(
    lines,
    /\b(?:order\s*date|date\s*ordered|date)\s*[:\-]\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|[A-Za-z]+\s+\d{1,2},?\s+\d{4})/i
  );
  const orderDate = toIsoDate(dateRaw);

  // Line-item rows: a leading quantity followed by a description. A trailing
  // price is common but NOT required — some confirmations put price in a
  // column that doesn't land on the same reconstructed line, and requiring
  // one meant real line items were getting dropped entirely.
  const lineWithPriceRe = /^(\d{1,4})\s+(.+?)\s+\$?\d{1,6}(?:\.\d{2})?\s*$/;
  const lineBareRe = /^(\d{1,4})\s+(.{3,})$/;
  const orderLines: OrderLine[] = [];
  for (const line of lines) {
    const m = line.match(lineWithPriceRe) ?? line.match(lineBareRe);
    if (!m) continue;
    const qty = parseInt(m[1], 10);
    const description = m[2].trim();
    if (qty <= 0 || qty > 5000) continue;
    if (description.length < 2 || SKIP_LINE_WORDS.test(description)) continue;
    orderLines.push({ description, qtyOrdered: qty, qtyReceived: 0 });
  }

  return { vendor, refNumber, orderNumber, orderDate, lines: orderLines };
}
