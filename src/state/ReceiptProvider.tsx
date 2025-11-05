import { createContext, useContext, useEffect, useMemo, useReducer } from 'react';

import { loadAllReceipts } from '@/src/storage/receiptsStorage';

import { receiptsReducer, initialState } from './receiptReducer';
import type { ReceiptsAction, ReceiptsState } from './types';

interface ReceiptsContextValue {
  state: ReceiptsState;
  dispatch: React.Dispatch<ReceiptsAction>;
}

const ReceiptsContext = createContext<ReceiptsContextValue | undefined>(undefined);

interface Props {
  children: React.ReactNode;
}

export const ReceiptsProvider = ({ children }: Props) => {
  const [state, dispatch] = useReducer(receiptsReducer, initialState);

  useEffect(() => {
    const load = async () => {
      dispatch({ type: 'SET_LOADING', payload: { loading: true } });
      try {
        const receipts = await loadAllReceipts();
        dispatch({ type: 'INITIALIZE', payload: { receipts } });
      } catch (error) {
        console.error('Failed to load receipts', error);
        dispatch({
          type: 'SET_ERROR',
          payload: { error: 'Could not load saved receipts. Try again later.' },
        });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: { loading: false } });
      }
    };

    void load();
  }, []);

  const value = useMemo(() => ({ state, dispatch }), [state, dispatch]);

  return <ReceiptsContext.Provider value={value}>{children}</ReceiptsContext.Provider>;
};

export const useReceiptsContext = () => {
  const context = useContext(ReceiptsContext);
  if (!context) {
    throw new Error('useReceiptsContext must be used within ReceiptsProvider');
  }
  return context;
};
