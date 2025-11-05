export type ReceiptStatus = 'processing' | 'needs_review' | 'done' | 'error';

export type CurrencyCode = 'BGN';

export interface ReceiptAnalysisItem {
  name: string;
  qty?: number;
  unit?: 'x' | 'kg' | 'g' | 'l' | 'ml' | 'other';
  unitPrice?: number;
  total: number;
}

export interface ReceiptAnalysis {
  merchantName: string;
  date: string;
  currency: CurrencyCode;
  items: ReceiptAnalysisItem[];
  subtotal?: number;
  total: number;
  model?: string;
}

export interface LineItem {
  id: string;
  receiptId: string;
  description: string;
  quantity: number | null;
  unit: ReceiptAnalysisItem['unit'] | null;
  unitPrice: number | null;
  total: number | null;
}

export interface Receipt {
  id: string;
  status: ReceiptStatus;
  merchant: string | null;
  receiptDate: string | null;
  subtotal: number | null;
  tax: number | null;
  total: number | null;
  currency: CurrencyCode;
  imageUri: string;
  providerMeta: Record<string, unknown> | null;
  analysis: ReceiptAnalysis | null;
  createdAt: string;
  updatedAt: string;
}

export type ReceiptWithItems = Receipt & {
  lineItems: LineItem[];
};

export type PipelineStepId = 'preprocess' | 'analyze' | 'categorize' | 'persist';

export interface PipelineStep {
  id: PipelineStepId;
  label: string;
  progress: number;
}

export type PipelineStatus = 'idle' | 'running' | 'completed' | 'failed';

export interface PipelineProgress {
  step: PipelineStepId;
  progress: number;
  message?: string;
}

export interface ReceiptJobResult {
  receipt: ReceiptWithItems;
  warnings?: string[];
}

export interface ReceiptJobError {
  step: PipelineStepId;
  message: string;
  code?: 'network_error' | 'analysis_failed' | 'categorization_failed' | 'save_failed' | 'unknown';
}

export interface ReceiptJob {
  id: string;
  imageUri: string;
  status: PipelineStatus;
  progress: PipelineProgress[];
  result?: ReceiptJobResult;
  error?: ReceiptJobError;
  createdAt: string;
  updatedAt: string;
}
