import type { LineItem, Receipt } from '@/src/types';

export const sumLineItems = (items: LineItem[]) =>
  items.reduce((acc, item) => acc + (item.total ?? 0), 0);

export const updateReceiptTotals = (receipt: Receipt, items: LineItem[]): Receipt => {
  const itemsTotal = sumLineItems(items);

  return {
    ...receipt,
    total: receipt.total ?? itemsTotal,
  };
};

export const mergeReceipt = (current: Receipt, updates: Partial<Receipt>): Receipt => ({
  ...current,
  ...updates,
  updatedAt: new Date().toISOString(),
});
