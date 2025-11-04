import { useCallback } from 'react';

import type { ReceiptJob, ReceiptWithItems } from '@/src/types';
import {
  deleteReceipt as deleteReceiptFromStorage,
  persistReceipt,
} from '@/src/storage/receiptsStorage';

import { useReceiptsContext } from './ReceiptProvider';

export const useReceiptActions = () => {
  const { dispatch } = useReceiptsContext();

  const upsertReceipt = useCallback(
    async (receipt: ReceiptWithItems) => {
      dispatch({ type: 'ADD_RECEIPT', payload: { receipt } });
      try {
        await persistReceipt(receipt);
      } catch (error) {
        console.error('Failed to persist receipt', error);
        dispatch({
          type: 'SET_ERROR',
          payload: { error: 'Could not save receipt locally.' },
        });
      }
    },
    [dispatch],
  );

  const deleteReceipt = useCallback(
    async (id: string) => {
      dispatch({ type: 'DELETE_RECEIPT', payload: { id } });
      try {
        await deleteReceiptFromStorage(id);
      } catch (error) {
        console.error('Failed to delete receipt', error);
        dispatch({
          type: 'SET_ERROR',
          payload: { error: 'Could not delete receipt locally.' },
        });
      }
    },
    [dispatch],
  );

  const upsertJob = useCallback(
    (job: ReceiptJob) => {
      dispatch({ type: 'UPSERT_JOB', payload: { job } });
    },
    [dispatch],
  );

  const removeJob = useCallback(
    (id: string) => {
      dispatch({ type: 'REMOVE_JOB', payload: { id } });
    },
    [dispatch],
  );

  return {
    upsertReceipt,
    deleteReceipt,
    upsertJob,
    removeJob,
  };
};
