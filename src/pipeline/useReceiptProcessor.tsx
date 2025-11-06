import { useCallback } from 'react';

import { PIPELINE_STEPS } from '@/src/constants/pipeline';
import type { ReceiptJob, ReceiptJobError } from '@/src/types';
import { generateId } from '@/src/utils/id';

import { useReceiptActions } from '@/src/state/useReceiptActions';

import { processReceipt } from './processReceipt';

export const useReceiptProcessor = () => {
  const { upsertReceipt, upsertJob } = useReceiptActions();

  const startProcessing = useCallback(
    (imageUri: string) => {
      const jobId = generateId();
      const timestamp = new Date().toISOString();
      let job: ReceiptJob = {
        id: jobId,
        imageUri,
        status: 'running',
        progress: [],
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      const pushProgress = (step: (typeof PIPELINE_STEPS)[number]['id'], progress: number) => {
        const existing = job.progress.filter((item) => item.step !== step);
        job = {
          ...job,
          progress: [...existing, { step, progress }],
          updatedAt: new Date().toISOString(),
        };
        upsertJob(job);
      };

      upsertJob(job);

      const run = async () => {
        try {
          const result = await processReceipt({
            imageUri,
            deleteOriginal: true,
            onProgress: ({ step, progress }) => {
              pushProgress(step, progress);
            },
          });

          await upsertReceipt(result.receipt);

          job = {
            ...job,
            imageUri: result.receipt.imageUri,
            status: 'completed',
            progress: PIPELINE_STEPS.map((step) => ({ step: step.id, progress: step.progress })),
            result,
            updatedAt: new Date().toISOString(),
          };

          upsertJob(job);
        } catch (error) {
          const jobError = (error as ReceiptJobError) ?? {
            step: 'persist',
            message: error instanceof Error ? error.message : 'Unknown error',
            code: 'unknown',
          };

          job = {
            ...job,
            status: 'failed',
            error: jobError,
            updatedAt: new Date().toISOString(),
          };

          upsertJob(job);
        }
      };

      void run();

      return jobId;
    },
    [upsertJob, upsertReceipt],
  );

  return {
    startProcessing,
  };
};
