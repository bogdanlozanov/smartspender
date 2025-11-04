import AsyncStorage from '@react-native-async-storage/async-storage';

import type { LineItem, ReceiptWithItems } from '@/src/types';

const RECEIPTS_INDEX_KEY = '@smartspender/receipts';
const RECEIPT_KEY_PREFIX = '@smartspender/receipt/';
const LINE_ITEMS_KEY_PREFIX = '@smartspender/receipt-line-items/';

const buildReceiptKey = (id: string) => `${RECEIPT_KEY_PREFIX}${id}`;
const buildLineItemsKey = (id: string) => `${LINE_ITEMS_KEY_PREFIX}${id}`;

export const loadReceiptIds = async (): Promise<string[]> => {
  const raw = await AsyncStorage.getItem(RECEIPTS_INDEX_KEY);
  if (!raw) {
    return [];
  }
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const saveReceiptIds = async (ids: string[]) => {
  await AsyncStorage.setItem(RECEIPTS_INDEX_KEY, JSON.stringify(ids));
};

export const loadReceipt = async (id: string): Promise<ReceiptWithItems | null> => {
  const [receiptRaw, itemsRaw] = await Promise.all([
    AsyncStorage.getItem(buildReceiptKey(id)),
    AsyncStorage.getItem(buildLineItemsKey(id)),
  ]);

  if (!receiptRaw) {
    return null;
  }

  try {
    const receipt = JSON.parse(receiptRaw);
    const items: LineItem[] = itemsRaw ? JSON.parse(itemsRaw) : [];
    return { ...receipt, lineItems: items };
  } catch {
    return null;
  }
};

export const loadAllReceipts = async (): Promise<ReceiptWithItems[]> => {
  const ids = await loadReceiptIds();
  if (!ids.length) {
    return [];
  }

  const receipts = await Promise.all(ids.map((id) => loadReceipt(id)));
  return receipts.filter((receipt): receipt is ReceiptWithItems => Boolean(receipt));
};

export const persistReceipt = async (receipt: ReceiptWithItems) => {
  const { lineItems, ...receiptWithoutItems } = receipt;
  const ids = await loadReceiptIds();
  const nextIds = new Set(ids);
  nextIds.add(receipt.id);
  await AsyncStorage.multiSet([
    [buildReceiptKey(receipt.id), JSON.stringify(receiptWithoutItems)],
    [buildLineItemsKey(receipt.id), JSON.stringify(lineItems)],
    [RECEIPTS_INDEX_KEY, JSON.stringify(Array.from(nextIds))],
  ]);
};

export const deleteReceipt = async (id: string) => {
  const ids = await loadReceiptIds();
  const nextIds = ids.filter((item) => item !== id);
  await AsyncStorage.multiRemove([
    buildReceiptKey(id),
    buildLineItemsKey(id),
    RECEIPTS_INDEX_KEY,
  ]);
  await saveReceiptIds(nextIds);
};
