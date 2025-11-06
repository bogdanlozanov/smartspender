import { Buffer } from 'buffer';
import { File } from 'expo-file-system';
import { z } from 'zod';

import { APP_CURRENCY } from '@/src/constants/app';
import type { ReceiptAnalysis } from '@/src/types';

const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
const DEFAULT_MODEL = process.env.EXPO_PUBLIC_OPENAI_MODEL ?? 'gpt-4o-mini';

const PROMPT = `
You are a receipt extraction AI. Return ONLY valid JSON that exactly matches the provided JSON schema.
Rules:
- Language may be Bulgarian (Cyrillic). Normalize decimals with a dot (e.g., 3.39).
- Include ALL items, including weighed items (e.g., 0.412 kg x 19.00) and multi-qty lines (e.g., 4 x 0.99).
  - If a price looks like "59" in item context and all other prices have two decimals, interpret it as "0.59" ONLY if that helps reconcile totals.
  - Ensure sum(items.total) equals the printed total within 0.02. If mismatch, reconcile using the printed total.
  - Output only JSON, no extra text.`;

const unitSchema = z.enum(['x', 'kg', 'g', 'l', 'ml', 'other']);

const itemSchema = z.object({
  name: z.string().min(1),
  qty: z.number().positive().optional(),
  unit: unitSchema.optional(),
  unitPrice: z.number().nonnegative().optional(),
  total: z.number().nonnegative(),
});

const receiptSchema = z.object({
  merchantName: z.string().min(1),
  currency: z.literal(APP_CURRENCY),
  items: z.array(itemSchema).min(1),
  total: z.number().nonnegative(),
});

export type ReceiptData = z.infer<typeof receiptSchema>;

const receiptJsonSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['merchantName', 'currency', 'items', 'total'],
  properties: {
    merchantName: { type: 'string' },
    currency: { type: 'string', enum: [APP_CURRENCY] },
    items: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['name', 'total'],
        properties: {
          name: { type: 'string' },
          qty: { type: 'number' },
          unit: { type: 'string', enum: ['x', 'kg', 'g', 'l', 'ml', 'other'] },
          unitPrice: { type: 'number' },
          total: { type: 'number' },
        },
      },
    },
    total: { type: 'number' },
  },
};

const normalize = (value: number) => +Number(value).toFixed(2);

const reconcileTotals = (receipt: ReceiptData): ReceiptData => {
  const sum = normalize(receipt.items.reduce((acc, item) => acc + (item.total ?? 0), 0));
  const diff = normalize(receipt.total - sum);

  if (Math.abs(diff) <= 0.02 && receipt.items.length > 0) {
    const indexToAdjust = receipt.items.reduce((bestIndex, item, index, array) => {
      const best = array[bestIndex];
      return Math.abs(best?.total ?? 0) < Math.abs(item.total) ? index : bestIndex;
    }, 0);

    receipt.items[indexToAdjust].total = normalize((receipt.items[indexToAdjust].total ?? 0) + diff);
    return { ...receipt, items: [...receipt.items] };
  }

  return receipt;
};

const toBase64Image = async (uri: string): Promise<string> => {
  const file = new File(uri);
  const buffer = Buffer.from(await file.arrayBuffer());
  return `data:image/jpeg;base64,${buffer.toString('base64')}`;
};

const callOpenAI = async (imageDataUrl: string): Promise<ReceiptData> => {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key is not configured. Set EXPO_PUBLIC_OPENAI_API_KEY.');
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      temperature: 0,
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'receipt_schema',
          schema: receiptJsonSchema,
        },
      },
      messages: [
        { role: 'system', content: PROMPT },
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Analyze this receipt image.' },
            { type: 'image_url', image_url: { url: imageDataUrl } },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`OpenAI response failed with status ${response.status}: ${message}`);
  }

  const payload = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };

  const content = payload.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('OpenAI response did not include any content.');
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch (error) {
    throw new Error('OpenAI response was not valid JSON.', error ?? "");
  }

  return receiptSchema.parse(parsed);
};

export const analyzeReceipt = async (imageUri: string): Promise<ReceiptAnalysis> => {
  const imageDataUrl = await toBase64Image(imageUri);

  const raw = await callOpenAI(imageDataUrl);

  const normalized: ReceiptData = {
    ...raw,
    total: normalize(raw.total),
    items: raw.items.map((item) => ({
      ...item,
      total: normalize(item.total),
      unitPrice: typeof item.unitPrice === 'number' ? normalize(item.unitPrice) : item.unitPrice,
    })),
  };

  const reconciled = reconcileTotals(normalized);
  const itemsTotal = reconciled.items.reduce((acc, item) => acc + (item.total ?? 0), 0);
  const normalizedItemsTotal = normalize(itemsTotal);
  const difference = normalize(reconciled.total - normalizedItemsTotal);
  const mismatch = Math.abs(difference) > 0.05;
  if (mismatch) {
    console.warn(
      `Receipt analysis totals mismatch. Reported: ${reconciled.total}, items sum: ${normalizedItemsTotal}, diff: ${difference}`,
    );
  }

  const capturedAt = new Date().toISOString();

  return {
    merchantName: reconciled.merchantName,
    date: capturedAt,
    currency: reconciled.currency,
    items: reconciled.items,
    total: reconciled.total,
    model: DEFAULT_MODEL,
  };
};
