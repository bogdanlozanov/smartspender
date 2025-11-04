import type { PipelineStep } from '@/src/types';

export const PIPELINE_STEPS: PipelineStep[] = [
  { id: 'preprocess', label: 'Preparing image', progress: 10 },
  { id: 'ocr', label: 'Running OCR', progress: 40 },
  { id: 'receipt_check', label: 'Checking receipt', progress: 55 },
  { id: 'parse', label: 'Extracting details', progress: 75 },
  { id: 'categorize', label: 'Categorizing items', progress: 90 },
  { id: 'persist', label: 'Saving receipt', progress: 100 },
];
