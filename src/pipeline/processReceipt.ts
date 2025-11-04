import { PIPELINE_STEPS } from '@/src/constants/pipeline';
import { deleteImage, saveImage } from '@/src/storage';
import type { ReceiptJobError, ReceiptJobResult, ReceiptWithItems } from '@/src/types';
import { generateId } from '@/src/utils/id';
import { categorizeReceipt } from '@/src/services/categorizer';
import { detectReceipt } from '@/src/services/detector';
import type { ReceiptDetectionResult } from '@/src/services/detector';
import { parseReceipt } from '@/src/services/parser';
import type { ParsedReceipt } from '@/src/services/parser';
import { runOCR } from '@/src/services/ocr';
import type { OCRResult } from '@/src/services/ocr';

import { preprocessImage } from './preprocessImage';

interface ProcessReceiptParams {
  imageUri: string;
  deleteOriginal?: boolean;
  onProgress?: (payload: { step: (typeof PIPELINE_STEPS)[number]['id']; progress: number }) => void;
}

const emitProgress = (
  stepId: (typeof PIPELINE_STEPS)[number]['id'],
  onProgress?: ProcessReceiptParams['onProgress'],
) => {
  const step = PIPELINE_STEPS.find((item) => item.id === stepId);
  if (step && onProgress) {
    onProgress({ step: step.id, progress: step.progress });
  }
};

const createReceiptSkeleton = (id: string, imageUri: string): ReceiptWithItems => {
  const timestamp = new Date().toISOString();
  return {
    id,
    status: 'processing',
    merchant: null,
    receiptDate: null,
    subtotal: null,
    tax: null,
    total: null,
    currency: 'BGN',
    categoryGuess: null,
    confidence: null,
    imageUri,
    rawText: null,
    providerMeta: null,
    createdAt: timestamp,
    updatedAt: timestamp,
    lineItems: [],
  };
};

const buildError = (
  step: ReceiptJobError['step'],
  message: string,
  code: ReceiptJobError['code'],
): ReceiptJobError => ({
  step,
  message,
  code,
});

export const processReceipt = async ({
  imageUri,
  deleteOriginal = false,
  onProgress,
}: ProcessReceiptParams): Promise<ReceiptJobResult> => {
  const jobId = generateId();
  let workingUri = imageUri;
  let savedImageUri = imageUri;
  let hasPersistedImage = false;

  try {
    emitProgress('preprocess', onProgress);
    workingUri = await preprocessImage(imageUri);
    savedImageUri = await saveImage(workingUri);
    hasPersistedImage = true;

    emitProgress('ocr', onProgress);
    const ocr: OCRResult = await runOCR(workingUri);

    emitProgress('receipt_check', onProgress);
    const detection: ReceiptDetectionResult = detectReceipt(ocr);
    if (!detection.isReceipt) {
      throw buildError('receipt_check', detection.reason ?? 'Not a receipt', 'not_receipt');
    }

    emitProgress('parse', onProgress);
    const parsed: ParsedReceipt = parseReceipt({ ocr, receiptId: jobId });

    emitProgress('categorize', onProgress);
    const { items, receiptCategory } = categorizeReceipt(parsed.lineItems);

    const base = createReceiptSkeleton(jobId, savedImageUri);
    const receipt: ReceiptWithItems = {
      ...base,
      ...parsed.receipt,
      status: parsed.warnings.length > 0 ? 'needs_review' : 'done',
      categoryGuess: receiptCategory,
      confidence: parsed.confidence,
      lineItems: items,
      updatedAt: new Date().toISOString(),
    };

    emitProgress('persist', onProgress);

    if (deleteOriginal && hasPersistedImage && imageUri !== savedImageUri) {
      await deleteImage(imageUri);
    }

    return {
      receipt: {
        ...receipt,
        lineItems: items,
      },
      warnings: parsed.warnings,
    };
  } catch (error) {
    if (hasPersistedImage) {
      await deleteImage(savedImageUri);
    }

    if (typeof error === 'object' && error && 'code' in (error as Record<string, unknown>)) {
      throw error;
    }

    console.error('Receipt processing failed', error);
    throw buildError(
      'persist',
      error instanceof Error ? error.message : 'Failed to process receipt.',
      'unknown',
    );
  }
};
