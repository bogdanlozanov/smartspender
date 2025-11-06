import type { ReceiptWithItems } from '@/src/types';
import { ReceiptSummaryCard } from '@/src/components/ReceiptSummaryCard';

interface Props {
  receipt: ReceiptWithItems;
  onPress: () => void;
}

export const ReceiptListItem = ({ receipt, onPress }: Props) => {
  return <ReceiptSummaryCard receipt={receipt} onPress={onPress} />;
};
