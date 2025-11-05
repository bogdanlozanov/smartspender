import AsyncStorage from '@react-native-async-storage/async-storage';

import type { ReceiptWithItems } from '@/src/types';

const RECEIPTS_KEY = '@smartspender/receipts-v2';

const readStore = async (): Promise<ReceiptWithItems[]> => {
  const raw = await AsyncStorage.getItem(RECEIPTS_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed as ReceiptWithItems[];
    }
  } catch (error) {
    console.warn('Failed to parse receipts store', error);
  }

  return [];
};

const writeStore = async (receipts: ReceiptWithItems[]) => {
  await AsyncStorage.setItem(RECEIPTS_KEY, JSON.stringify(receipts));
};

export const loadAllReceipts = async (): Promise<ReceiptWithItems[]> => readStore();

export const persistReceipt = async (receipt: ReceiptWithItems) => {
  const receipts = await readStore();
  const others = receipts.filter((entry) => entry.id !== receipt.id);
  await writeStore([receipt, ...others]);
};

export const deleteReceipt = async (id: string) => {
  const receipts = await readStore();
  const next = receipts.filter((entry) => entry.id !== id);
  await writeStore(next);
};
