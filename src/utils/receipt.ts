import type { LineItem, ReceiptWithItems } from '@/src/types';

const normalize = (value: number) => Number(value.toFixed(2));

export const sumLineItems = (items: LineItem[]): number => {
  return items.reduce((acc, item) => acc + (item.total ?? 0), 0);
};

export const getTotalsMismatch = (
  receipt: ReceiptWithItems,
  tolerance: number = 0.05,
): { mismatch: boolean; reported: number | null; itemsSum: number; diff: number | null } => {
  const itemsTotal = sumLineItems(receipt.lineItems);
  const normalizedItemsTotal = normalize(itemsTotal);
  const reported = typeof receipt.total === 'number' ? normalize(receipt.total) : null;
  const diff = reported != null ? normalize(reported - normalizedItemsTotal) : null;
  const mismatch = diff != null ? Math.abs(diff) > tolerance : false;

  return { mismatch, reported, itemsSum: normalizedItemsTotal, diff };
};

export const getTotalsMismatchMessage = (receipt: ReceiptWithItems): string | null => {
  const { mismatch, reported, itemsSum, diff } = getTotalsMismatch(receipt);
  if (!mismatch || reported == null || diff == null) return null;
  return `Receipt analysis totals mismatch. Reported: ${reported.toFixed(2)}, items sum: ${itemsSum.toFixed(2)}, diff: ${diff.toFixed(2)}`;
};

