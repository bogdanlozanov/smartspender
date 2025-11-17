import type { PipelineStep } from '@/src/types';

export const PIPELINE_STEPS: PipelineStep[] = [
  { id: 'preprocess', label: 'Preparing image', progress: 25 },
  { id: 'analyze', label: 'Analyzing receipt (AI)', progress: 70 },
  { id: 'persist', label: 'Saving receipt', progress: 100 },
];
