export type ReceiptStatus =
  | 'uploaded'
  | 'queued'
  | 'processing'
  | 'needs_review'
  | 'done'
  | 'error';

export type CurrencyCode = 'BGN';

export interface LineItem {
  id: string;
  receiptId: string;
  description: string;
  quantity: number;
  unitPrice: number | null;
  total: number | null;
  categoryGuess: ExpenseCategoryKey | null;
  confidence: number | null;
}

export type ExpenseCategoryKey =
  | 'groceries'
  | 'dining'
  | 'transport'
  | 'utilities'
  | 'health'
  | 'entertainment'
  | 'shopping'
  | 'travel'
  | 'education'
  | 'home'
  | 'other';

export interface ExpenseCategory {
  id: ExpenseCategoryKey;
  name: string;
  icon: string;
  parentId?: ExpenseCategoryKey | null;
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
  categoryGuess: ExpenseCategoryKey | null;
  confidence: number | null;
  imageUri: string;
  rawText: string | null;
  providerMeta: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export type ReceiptWithItems = Receipt & {
  lineItems: LineItem[];
};

export type PipelineStepId =
  | 'preprocess'
  | 'ocr'
  | 'receipt_check'
  | 'parse'
  | 'categorize'
  | 'persist';

export interface PipelineStep {
  id: PipelineStepId;
  label: string;
  progress: number;
}

export type PipelineStatus =
  | 'idle'
  | 'running'
  | 'completed'
  | 'failed'
  | 'not_receipt';

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
  code?:
    | 'not_receipt'
    | 'network_error'
    | 'ocr_failed'
    | 'parse_failed'
    | 'categorization_failed'
    | 'save_failed'
    | 'unknown';
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
