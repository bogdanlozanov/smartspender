import { APP_CURRENCY } from '@/src/constants/app';
import { PIPELINE_STEPS } from '@/src/constants/pipeline';
import { analyzeReceipt } from '@/src/services/analyzeReceipt';
import { deleteImage, saveImage } from '@/src/storage';
import type { ReceiptAnalysis, ReceiptJobError, ReceiptJobResult, ReceiptStatus, ReceiptWithItems } from '@/src/types';
import { generateId } from '@/src/utils/id';

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
    currency: APP_CURRENCY,
    imageUri,
    providerMeta: null,
    analysis: null,
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
    workingUri = savedImageUri;
    hasPersistedImage = true;

    emitProgress('analyze', onProgress);
    const analysis: ReceiptAnalysis = await analyzeReceipt(workingUri);

    const lineItems = analysis.items.map((item) => ({
      id: generateId(),
      receiptId: jobId,
      description: item.name,
      quantity: item.qty ?? null,
      unit: item.unit ?? null,
      unitPrice: item.unitPrice ?? null,
      total: item.total ?? null,
    }));

    emitProgress('categorize', onProgress);

    const items = lineItems;
    const subtotal = analysis.subtotal ?? items.reduce((acc, item) => acc + (item.total ?? 0), 0);
    const total = analysis.total ?? subtotal;
    const parsedDate = analysis.date ? new Date(analysis.date) : null;
    const receiptDate = parsedDate && Number.isFinite(parsedDate.getTime()) ? parsedDate.toISOString() : null;
    const warnings: string[] = [];
    if (!items.length) {
      warnings.push('AI could not identify line items.');
    }
    const status: ReceiptStatus = warnings.length ? 'needs_review' : 'done';

    const normalizedAnalysis: ReceiptAnalysis = {
      ...analysis,
      date: receiptDate ?? analysis.date,
    };

    const base = createReceiptSkeleton(jobId, savedImageUri);
    const receipt: ReceiptWithItems = {
      ...base,
      merchant: analysis.merchantName ?? null,
      receiptDate,
      subtotal,
      tax: null,
      total,
      status,
      lineItems: items,
      providerMeta: {
        provider: 'openai',
        model: analysis.model ?? process.env.EXPO_PUBLIC_OPENAI_MODEL ?? 'gpt-4o-mini',
      },
      analysis: normalizedAnalysis,
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
      warnings,
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
      'analyze',
      error instanceof Error ? error.message : 'Failed to process receipt.',
      'analysis_failed',
    );
  }
};
