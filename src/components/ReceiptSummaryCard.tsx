import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { Image } from 'expo-image';

import type { ReceiptWithItems } from '@/src/types';
import { colors, spacing, typography } from '@/src/theme';
import { formatCurrency, formatDate } from '@/src/utils/format';
import { StatusBadge } from '@/src/components/StatusBadge';

interface Props {
  receipt: ReceiptWithItems;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  showImage?: boolean;
}

export const ReceiptSummaryCard = ({ receipt, onPress, style, showImage = false }: Props) => {
  const content = (
    <>
      {showImage && receipt.imageUri ? (
        <Image source={{ uri: receipt.imageUri }} style={styles.image} />
      ) : null}

      <View style={[styles.body, showImage && styles.bodyWithImage]}>
        <View style={styles.header}>
          <Text style={styles.merchant} numberOfLines={2}>
            {receipt.merchant ?? 'Unknown merchant'}
          </Text>
          <Text style={styles.amount}>{formatCurrency(receipt.total)}</Text>
        </View>

        <View style={styles.meta}>
          <Text style={styles.metaText}>{formatDate(receipt.receiptDate)}</Text>
          <StatusBadge status={receipt.status} />
        </View>
      </View>
    </>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [styles.container, pressed && styles.pressed, style]}>
        {content}
      </Pressable>
    );
  }

  return <View style={[styles.container, style]}>{content}</View>;
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.surfaceAlt,
    borderRadius: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: {
    opacity: 0.85,
  },
  image: {
    width: '100%',
    height: 220,
    borderRadius: spacing.md,
  },
  body: {
    marginTop: 0,
  },
  bodyWithImage: {
    marginTop: spacing.lg,
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
    marginRight: spacing.md,
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

