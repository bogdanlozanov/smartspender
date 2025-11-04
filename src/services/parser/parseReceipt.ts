import type { LineItem } from '@/src/types';
import { APP_CURRENCY } from '@/src/constants/app';
import { parseCurrency, toISODate } from '@/src/utils/format';
import { generateId } from '@/src/utils/id';

import type { ParseReceiptParams, ParsedReceipt } from './types';

const MERCHANT_BLACKLIST = ['total', 'subtotal', 'cash', 'change', 'receipt', 'invoice'];
const VAT_PATTERNS = [/vat/i, /tax/i, /dds/i];
const TOTAL_PATTERNS = [/grand total/i, /^total/i, /amount due/i];

const detectMerchant = (lines: string[]) => {
  const candidate = lines.find((line) => {
    const normalized = line.toLowerCase();
    if (normalized.length < 3 || normalized.length > 60) {
      return false;
    }
    return !MERCHANT_BLACKLIST.some((keyword) => normalized.includes(keyword));
  });
  return candidate ?? null;
};

const detectDate = (text: string) => {
  const match =
    text.match(
      /(\d{2}[./-]\d{2}[./-]\d{2,4})|(\d{4}[./-]\d{2}[./-]\d{2})|(\d{2}\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4})/i,
    ) ?? [];
  for (const candidate of match) {
    const iso = toISODate(candidate);
    if (iso) {
      return iso;
    }
  }
  return null;
};

const detectTotal = (lines: string[]) => {
  for (const line of lines) {
    if (TOTAL_PATTERNS.some((pattern) => pattern.test(line))) {
      const amount = parseCurrency(line);
      if (amount !== null) {
        return amount;
      }
    }
  }

  const reversed = [...lines].reverse();
  for (const line of reversed) {
    const amount = parseCurrency(line);
    if (amount !== null) {
      return amount;
    }
  }

  return null;
};

const detectSubtotal = (lines: string[]) => {
  for (const line of lines) {
    if (/subtotal/i.test(line)) {
      const amount = parseCurrency(line);
      if (amount !== null) {
        return amount;
      }
    }
  }
  return null;
};

const detectTax = (lines: string[]) => {
  for (const line of lines) {
    if (VAT_PATTERNS.some((pattern) => pattern.test(line))) {
      const amount = parseCurrency(line);
      if (amount !== null) {
        return amount;
      }
    }
  }
  return null;
};

const parseLineItems = (receiptId: string, lines: string[]): LineItem[] => {
  const items: LineItem[] = [];

  const itemPattern =
    /^(?<name>[\p{L}\d\s\-\.,]+?)\s+(?<qty>\d+)?\s*(x|×|\*)?\s*(?<price>\d+[,.]\d{2})\s*(?<total>\d+[,.]\d{2})?$/u;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.length < 3) {
      continue;
    }

    const match = trimmed.match(itemPattern);
    if (!match || !match.groups) {
      continue;
    }

    const quantity = match.groups.qty ? Number.parseFloat(match.groups.qty) : 1;
    const unitPrice = match.groups.price ? parseCurrency(match.groups.price) : null;
    const total = match.groups.total ? parseCurrency(match.groups.total) : unitPrice;
    const description = match.groups.name?.trim();

    if (!description || !unitPrice) {
      continue;
    }

    items.push({
      id: generateId(),
      receiptId,
      description,
      quantity: quantity || 1,
      unitPrice,
      total: total ?? unitPrice,
      categoryGuess: null,
      confidence: null,
    });
  }

  return items;
};

export const parseReceipt = ({ ocr, receiptId }: ParseReceiptParams): ParsedReceipt => {
  const lines = ocr.rawText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const merchant = detectMerchant(lines);
  const receiptDate = detectDate(ocr.rawText);
  const total = detectTotal(lines);
  const subtotal = detectSubtotal(lines);
  const tax = detectTax(lines);
  const lineItems = parseLineItems(receiptId, lines);

  const warnings: string[] = [];

  if (!merchant) {
    warnings.push('Merchant not detected. Please fill it in manually.');
  }
  if (!receiptDate) {
    warnings.push('Date not detected.');
  }
  if (!total) {
    warnings.push('Total amount not detected.');
  }
  if (!lineItems.length) {
    warnings.push('Line items not detected.');
  }

  const confidence =
    (ocr.confidence ?? 0) * 0.4 +
    (total ? 0.2 : 0) +
    (lineItems.length ? Math.min(lineItems.length * 0.05, 0.2) : 0) +
    (merchant ? 0.1 : 0) +
    (receiptDate ? 0.1 : 0);

  return {
    receipt: {
      merchant,
      receiptDate,
      total,
      subtotal,
      tax,
      currency: APP_CURRENCY,
      rawText: ocr.rawText,
      providerMeta: ocr.meta ?? null,
      confidence,
    },
    lineItems,
    warnings,
    confidence,
  };
};
