import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import type { ReceiptWithItems } from '@/src/types';
import { formatDate } from '@/src/utils/format';

const CSV_HEADERS = [
  'Receipt ID',
  'Merchant',
  'Date',
  'Subtotal',
  'Tax',
  'Total',
  'Category',
  'Item Description',
  'Item Quantity',
  'Item Unit Price',
  'Item Total',
];

const sanitize = (value: string | number | null | undefined) => {
  if (value === null || value === undefined) {
    return '';
  }
  const stringValue = typeof value === 'number' ? value.toString() : value;
  const escaped = stringValue.replace(/"/g, '""');
  return `"${escaped}"`;
};

export const buildCsvContent = (receipts: ReceiptWithItems[]) => {
  const rows = receipts.flatMap((receipt) => {
    if (receipt.lineItems.length === 0) {
      return [
        [
          sanitize(receipt.id),
          sanitize(receipt.merchant),
          sanitize(formatDate(receipt.receiptDate)),
          sanitize(receipt.subtotal),
          sanitize(receipt.tax),
          sanitize(receipt.total),
          sanitize(receipt.categoryGuess),
          sanitize(''),
          sanitize(''),
          sanitize(''),
          sanitize(''),
        ].join(','),
      ];
    }

    return receipt.lineItems.map((item) =>
      [
        sanitize(receipt.id),
        sanitize(receipt.merchant),
        sanitize(formatDate(receipt.receiptDate)),
        sanitize(receipt.subtotal),
        sanitize(receipt.tax),
        sanitize(receipt.total),
        sanitize(receipt.categoryGuess),
        sanitize(item.description),
        sanitize(item.quantity),
        sanitize(item.unitPrice),
        sanitize(item.total),
      ].join(','),
    );
  });

  return [CSV_HEADERS.map(sanitize).join(','), ...rows].join('\n');
};

export const exportReceiptsToCsv = async (receipts: ReceiptWithItems[]) => {
  const content = buildCsvContent(receipts);
  const fileUri = `${FileSystem.cacheDirectory}smartspender-receipts-${Date.now()}.csv`;
  await FileSystem.writeAsStringAsync(fileUri, content, { encoding: FileSystem.EncodingType.UTF8 });
  return fileUri;
};

export const shareCsv = async (fileUri: string) => {
  if (!(await Sharing.isAvailableAsync())) {
    throw new Error('Sharing is not available on this device.');
  }
  await Sharing.shareAsync(fileUri, {
    mimeType: 'text/csv',
    dialogTitle: 'Export receipts CSV',
  });
};
