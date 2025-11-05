import type { PipelineStep } from '@/src/types';

export const PIPELINE_STEPS: PipelineStep[] = [
  { id: 'preprocess', label: 'Preparing image', progress: 20 },
  { id: 'analyze', label: 'Analyzing receipt (AI)', progress: 75 },
  { id: 'categorize', label: 'Categorizing items', progress: 90 },
  { id: 'persist', label: 'Saving receipt', progress: 100 },
];
