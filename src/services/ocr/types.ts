export interface OCRLineWord {
  text: string;
  confidence: number;
}

export interface OCRLine {
  text: string;
  words: OCRLineWord[];
}

export interface OCRResult {
  rawText: string;
  lines: OCRLine[];
  confidence: number;
  provider: 'ocrspace';
  meta?: Record<string, unknown>;
}
