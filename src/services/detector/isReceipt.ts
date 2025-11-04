import type { OCRResult } from '@/src/services/ocr';
import { toISODate } from '@/src/utils/format';

import type { ReceiptDetectionResult } from './types';

const RECEIPT_KEYWORDS = ['total', 'subtotal', 'cash', 'receipt', 'merchant', 'invoice', 'qty'];
const NON_RECEIPT_KEYWORDS = ['passport', 'ticket', 'boarding pass', 'license', 'id card'];

const hasCurrency = (text: string) => /(\d+[,.]\d{2})\s?(bgn|лв|lv)/i.test(text);
const hasDate = (text: string) => {
  const match = text.match(
    /(\d{2}[./-]\d{2}[./-]\d{2,4})|(\d{4}[./-]\d{2}[./-]\d{2})|(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i,
  );
  if (!match) {
    return false;
  }
  return Boolean(toISODate(match[0]));
};

export const detectReceipt = (ocr: OCRResult): ReceiptDetectionResult => {
  const text = ocr.rawText.toLowerCase();
  if (!text.trim()) {
    return {
      isReceipt: false,
      score: 0,
      reason: 'Could not read any text from the image.',
    };
  }

  const keywordHits = RECEIPT_KEYWORDS.filter((keyword) => text.includes(keyword)).length;
  const nonReceiptHits = NON_RECEIPT_KEYWORDS.filter((keyword) => text.includes(keyword)).length;

  const scoreComponents = [
    Math.min(keywordHits / RECEIPT_KEYWORDS.length, 1),
    hasCurrency(text) ? 0.3 : 0,
    hasDate(text) ? 0.3 : 0,
    Math.max(ocr.confidence, 0.3),
  ];

  const score = Math.max(
    0,
    Math.min(
      scoreComponents.reduce((acc, component) => acc + component, 0) - nonReceiptHits * 0.3,
      1,
    ),
  );

  return {
    isReceipt: score >= 0.45,
    score,
    reason:
      score >= 0.45
        ? undefined
        : 'The image does not appear to contain a receipt. Try capturing a clearer photo.',
  };
};
