export interface ReceiptDetectionResult {
  isReceipt: boolean;
  score: number;
  reason?: string;
}
