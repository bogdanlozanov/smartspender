import { Platform } from 'react-native';

import { OCR_SPACE_API_ENDPOINT } from '@/src/constants/app';
import type { OCRResult } from './types';

interface OCRSpaceResponse {
  ParsedResults?: {
    ParsedText: string;
    TextOverlay?: {
      Lines?: {
        LineText: string;
        Words?: {
          WordText: string;
          WordConf: number;
        }[];
      }[];
    };
    FileParseExitCode: number;
    ErrorMessage?: string | string[];
    ErrorDetails?: string;
    Confidence?: number;
  }[];
  OCRExitCode: number;
  ErrorMessage?: string | string[];
  ErrorDetails?: string;
  IsErroredOnProcessing: boolean;
}

const API_KEY = process.env.EXPO_PUBLIC_OCR_SPACE_API_KEY;
const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK_OCR === 'true';

const toSingleErrorMessage = (error: string | string[] | undefined) => {
  if (!error) {
    return undefined;
  }
  return Array.isArray(error) ? error.join(' ') : error;
};

const parseResponse = (payload: OCRSpaceResponse): OCRResult => {
  const parsed = payload.ParsedResults?.[0];
  const rawText = parsed?.ParsedText ?? '';
  const lines =
    parsed?.TextOverlay?.Lines?.map((line) => ({
      text: line.LineText,
      words:
        line.Words?.map((word) => ({
          text: word.WordText,
          confidence: Number(word.WordConf ?? 0) / 100,
        })) ?? [],
    })) ?? [];

  return {
    rawText,
    lines,
    confidence: Number(parsed?.Confidence ?? 0) / 100,
    provider: 'ocrspace',
    meta: {
      OCRExitCode: payload.OCRExitCode,
      FileParseExitCode: parsed?.FileParseExitCode,
      ErrorMessage: parsed?.ErrorMessage,
      ErrorDetails: parsed?.ErrorDetails,
    },
  };
};

const mockResponse: OCRResult = {
  provider: 'ocrspace',
  rawText: `Store: Example Market
Date: 12/01/2025
Milk 1L 2.50
Bread 1.80
Total 4.30 BGN`,
  confidence: 0.65,
  lines: [
    { text: 'Store: Example Market', words: [] },
    { text: 'Date: 12/01/2025', words: [] },
    { text: 'Milk 1L 2.50', words: [] },
    { text: 'Bread 1.80', words: [] },
    { text: 'Total 4.30 BGN', words: [] },
  ],
};

export const runOCR = async (imageUri: string): Promise<OCRResult> => {
  if (USE_MOCK || !API_KEY) {
    if (!API_KEY) {
      console.warn('EXPO_PUBLIC_OCR_SPACE_API_KEY not set. Falling back to mock OCR.');
    }
    return mockResponse;
  }

  const formData = new FormData();

  formData.append('language', 'eng');
  formData.append('isOverlayRequired', 'true');
  formData.append('isTable', 'true');
  formData.append('OCREngine', '2');
  formData.append('scale', 'true');
  formData.append('apikey', API_KEY);
  formData.append(
    'file',
    {
      uri: imageUri,
      name: `receipt.${Platform.OS === 'ios' ? 'heic' : 'jpg'}`,
      type: 'image/jpeg',
    } as never,
  );

  const response = await fetch(OCR_SPACE_API_ENDPOINT, {
    method: 'POST',
    body: formData,
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`OCR request failed with status ${response.status}: ${message}`);
  }

  const payload = (await response.json()) as OCRSpaceResponse;

  if (payload.IsErroredOnProcessing) {
    throw new Error(
      toSingleErrorMessage(payload.ErrorMessage) ??
        toSingleErrorMessage(payload.ErrorDetails) ??
        'OCR provider returned an error',
    );
  }

  return parseResponse(payload);
};
