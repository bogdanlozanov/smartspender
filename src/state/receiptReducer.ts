import type { ReceiptsAction, ReceiptsState } from './types';
import type { ReceiptWithItems } from '@/src/types';

const indexReceipts = (receipts: ReceiptWithItems[]) =>
  receipts.reduce<Record<string, ReceiptWithItems>>((acc, receipt) => {
    acc[receipt.id] = receipt;
    return acc;
  }, {});

export const initialState: ReceiptsState = {
  receipts: {},
  jobs: {},
  categories: [],
  initialized: false,
  loading: false,
};

export const receiptsReducer = (
  state: ReceiptsState = initialState,
  action: ReceiptsAction,
): ReceiptsState => {
  switch (action.type) {
    case 'INITIALIZE': {
      const receiptsIndex = indexReceipts(action.payload.receipts);
      return {
        ...state,
        receipts: receiptsIndex,
        initialized: true,
        loading: false,
        error: undefined,
      };
    }
    case 'SET_CATEGORIES': {
      return {
        ...state,
        categories: action.payload.categories,
      };
    }
    case 'ADD_RECEIPT': {
      const { receipt } = action.payload;
      return {
        ...state,
        receipts: {
          ...state.receipts,
          [receipt.id]: receipt,
        },
      };
    }
    case 'UPDATE_RECEIPT': {
      const { id, updates } = action.payload;
      const current = state.receipts[id];
      if (!current) {
        return state;
      }
      return {
        ...state,
        receipts: {
          ...state.receipts,
          [id]: {
            ...current,
            ...updates,
            lineItems: updates.lineItems ?? current.lineItems,
          },
        },
      };
    }
    case 'DELETE_RECEIPT': {
      const { id } = action.payload;
      const nextReceipts = { ...state.receipts };
      delete nextReceipts[id];
      const nextJobs = { ...state.jobs };
      delete nextJobs[id];
      return {
        ...state,
        receipts: nextReceipts,
        jobs: nextJobs,
      };
    }
    case 'UPSERT_JOB': {
      const { job } = action.payload;
      return {
        ...state,
        jobs: {
          ...state.jobs,
          [job.id]: job,
        },
      };
    }
    case 'REMOVE_JOB': {
      const { id } = action.payload;
      const nextJobs = { ...state.jobs };
      delete nextJobs[id];
      return {
        ...state,
        jobs: nextJobs,
      };
    }
    case 'SET_LOADING': {
      return {
        ...state,
        loading: action.payload.loading,
      };
    }
    case 'SET_ERROR': {
      return {
        ...state,
        error: action.payload.error,
      };
    }
    default:
      return state;
  }
};
