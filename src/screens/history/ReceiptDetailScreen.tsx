import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { AppButton } from '@/src/components/AppButton';
import { Card } from '@/src/components/Card';
import { ReceiptAnalysisCard } from '@/src/components/ReceiptAnalysisCard';
import { StatusBadge } from '@/src/components/StatusBadge';
import { DEFAULT_CATEGORIES } from '@/src/constants/categories';
import { useReceipts } from '@/src/hooks/useReceipts';
import { useReceiptActions } from '@/src/state/useReceiptActions';
import { colors, spacing, typography } from '@/src/theme';
import { formatCurrency, formatDate } from '@/src/utils/format';
import { deleteImage } from '@/src/storage';

export const ReceiptDetailScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { getReceipt } = useReceipts();
  const { deleteReceipt } = useReceiptActions();

  const receipt = id ? getReceipt(id) : undefined;

  if (!receipt) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Receipt not found.</Text>
        <AppButton label="Back to history" onPress={() => router.replace('/history')} />
      </View>
    );
  }

  const category = DEFAULT_CATEGORIES.find((item) => item.id === receipt.categoryGuess);

  const handleDelete = () => {
    Alert.alert('Delete receipt', 'Are you sure you want to remove this receipt?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteReceipt(receipt.id);
          await deleteImage(receipt.imageUri);
          router.replace('/history');
        },
      },
    ]);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card padding="lg">
        <Image source={{ uri: receipt.imageUri }} style={styles.image} />
        <View style={styles.header}>
          <View>
            <Text style={styles.merchant}>{receipt.merchant ?? 'Unknown merchant'}</Text>
            <Text style={styles.date}>{formatDate(receipt.receiptDate)}</Text>
          </View>
          <StatusBadge status={receipt.status} />
        </View>
        <Text style={styles.total}>{formatCurrency(receipt.total)}</Text>
        {category && <Text style={styles.category}>Category: {category.name}</Text>}
      </Card>

      <ReceiptAnalysisCard analysis={receipt.analysis} />

      <Card padding="lg">
        <Text style={styles.sectionTitle}>Items</Text>
        {receipt.lineItems.length === 0 ? (
          <Text style={styles.emptyText}>No items captured.</Text>
        ) : (
          receipt.lineItems.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemDescription}>{item.description}</Text>
                {(item.quantity || item.unitPrice) && (
                  <Text style={styles.itemMeta}>
                    {item.quantity ? `${item.quantity}${item.unit ? ` ${item.unit}` : ''}` : ''}
                    {item.quantity && item.unitPrice ? ' × ' : ''}
                    {item.unitPrice ? formatCurrency(item.unitPrice) : ''}
                  </Text>
                )}
                {typeof item.discount === 'number' && item.discount !== 0 && (
                  <Text style={styles.itemDiscount}>Discount {formatCurrency(item.discount)}</Text>
                )}
                {item.categoryGuess && (
                  <Text style={styles.itemCategory}>
                    Category:{' '}
                    {DEFAULT_CATEGORIES.find((cat) => cat.id === item.categoryGuess)?.name ??
                      item.categoryGuess}
                  </Text>
                )}
              </View>
              <Text style={styles.itemAmount}>{formatCurrency(item.total)}</Text>
            </View>
          ))
        )}
      </Card>

      <Card padding="lg">
        <Text style={styles.sectionTitle}>Summary</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal</Text>
          <Text style={styles.summaryValue}>{formatCurrency(receipt.subtotal)}</Text>
        </View>
        {receipt.analysis?.discountsTotal !== undefined && (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Discounts</Text>
            <Text style={[styles.summaryValue, styles.summaryDiscount]}>
              {formatCurrency(receipt.analysis.discountsTotal)}
            </Text>
          </View>
        )}
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Total</Text>
          <Text style={styles.summaryValue}>{formatCurrency(receipt.total)}</Text>
        </View>
      </Card>

      <View style={styles.actions}>
        <View style={styles.actionItem}>
          <AppButton label="Edit" onPress={() => router.push({ pathname: `/review/${receipt.id}` })} />
        </View>
        <View style={styles.actionItem}>
          <AppButton label="Delete" onPress={handleDelete} variant="secondary" />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.xl,
    paddingBottom: spacing.xxl * 2,
  },
  image: {
    width: '100%',
    height: 220,
    borderRadius: spacing.md,
    marginBottom: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  merchant: {
    fontSize: typography.subheading,
    fontWeight: '700',
    color: colors.text,
  },
  date: {
    color: colors.textMuted,
  },
  total: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.primary,
  },
  category: {
    marginTop: spacing.sm,
    color: colors.textMuted,
  },
  sectionTitle: {
    fontSize: typography.subheading,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  itemInfo: {
    flex: 1,
    paddingRight: spacing.md,
  },
  itemDescription: {
    color: colors.text,
    fontSize: typography.body,
  },
  itemMeta: {
    color: colors.textMuted,
    fontSize: typography.caption,
    marginTop: spacing.xs,
  },
  itemDiscount: {
    color: colors.accent,
    fontSize: typography.caption,
    marginTop: spacing.xs,
  },
  itemCategory: {
    color: colors.textMuted,
    fontSize: typography.caption,
  },
  itemAmount: {
    color: colors.text,
    fontWeight: '600',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  summaryLabel: {
    color: colors.textMuted,
  },
  summaryValue: {
    color: colors.text,
    fontWeight: '600',
  },
  summaryDiscount: {
    color: colors.accent,
  },
  actions: {
    marginTop: spacing.xl,
  },
  actionItem: {
    marginBottom: spacing.md,
  },
});
