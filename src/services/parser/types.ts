import type { LineItem, Receipt } from '@/src/types';
import type { OCRResult } from '@/src/services/ocr';

export interface ParseReceiptParams {
  ocr: OCRResult;
  receiptId: string;
}

export interface ParsedReceipt {
  receipt: Partial<Receipt>;
  lineItems: LineItem[];
  warnings: string[];
  confidence: number;
}
