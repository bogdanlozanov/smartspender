import { useMemo } from 'react';

import type { ReceiptWithItems } from '@/src/types';

import { useReceiptsContext } from '@/src/state/ReceiptProvider';

export const useReceipts = () => {
  const { state, dispatch } = useReceiptsContext();

  const receiptsList = useMemo(
    () => Object.values(state.receipts).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)),
    [state.receipts],
  );

  const getReceipt = (id: string): ReceiptWithItems | undefined => state.receipts[id];

  return {
    state,
    dispatch,
    receipts: receiptsList,
    getReceipt,
  };
};
