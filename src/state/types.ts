import type { ReceiptJob, ReceiptWithItems } from '@/src/types';

export interface ReceiptsState {
  receipts: Record<string, ReceiptWithItems>;
  jobs: Record<string, ReceiptJob>;
  initialized: boolean;
  loading: boolean;
  error?: string;
}

export type ReceiptsAction =
  | { type: 'INITIALIZE'; payload: { receipts: ReceiptWithItems[] } }
  | { type: 'ADD_RECEIPT'; payload: { receipt: ReceiptWithItems } }
  | {
      type: 'UPDATE_RECEIPT';
      payload: { id: string; updates: Partial<ReceiptWithItems> };
    }
  | { type: 'DELETE_RECEIPT'; payload: { id: string } }
  | { type: 'UPSERT_JOB'; payload: { job: ReceiptJob } }
  | { type: 'REMOVE_JOB'; payload: { id: string } }
  | { type: 'SET_LOADING'; payload: { loading: boolean } }
  | { type: 'SET_ERROR'; payload: { error?: string } };
