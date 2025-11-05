import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { ReceiptWithItems } from '@/src/types';
import { formatCurrency, formatDate } from '@/src/utils/format';
import { colors, spacing, typography } from '@/src/theme';
import { StatusBadge } from '@/src/components/StatusBadge';

interface Props {
  receipt: ReceiptWithItems;
  onPress: () => void;
}

export const ReceiptListItem = ({ receipt, onPress }: Props) => {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.container, pressed && styles.pressed]}>
      <View style={styles.header}>
        <Text style={styles.merchant}>{receipt.merchant ?? 'Unknown merchant'}</Text>
        <Text style={styles.amount}>{formatCurrency(receipt.total)}</Text>
      </View>
      <View style={styles.meta}>
        <View>
          <Text style={styles.metaText}>{formatDate(receipt.receiptDate)}</Text>
        </View>
        <StatusBadge status={receipt.status} />
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.surfaceAlt,
    borderRadius: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  pressed: {
    opacity: 0.85,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  merchant: {
    fontSize: typography.subheading,
    fontWeight: '600',
    color: colors.text,
    flexShrink: 1,
  },
  amount: {
    fontSize: typography.subheading,
    fontWeight: '700',
    color: colors.primary,
  },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaText: {
    color: colors.textMuted,
    fontSize: typography.caption,
  },
});
