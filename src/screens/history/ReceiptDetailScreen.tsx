import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { AppButton } from '@/src/components/AppButton';
import { Card } from '@/src/components/Card';
import { ReceiptAnalysisCard } from '@/src/components/ReceiptAnalysisCard';
import { ReceiptSummaryCard } from '@/src/components/ReceiptSummaryCard';
import { useReceipts } from '@/src/hooks/useReceipts';
import { useReceiptActions } from '@/src/state/useReceiptActions';
import { colors, spacing, typography } from '@/src/theme';
import { formatCurrency } from '@/src/utils/format';
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
      <Text style={styles.heading}>Receipt overview</Text>
      <Text style={styles.subheading}>Review the scanned totals and captured items.</Text>

      <ReceiptSummaryCard receipt={receipt} showImage style={styles.summaryCard} />

      <ReceiptAnalysisCard analysis={receipt.analysis} style={styles.card} />

      <Card padding="lg" style={styles.card}>
        <Text style={styles.sectionTitle}>Receipt items</Text>
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
              </View>
              <Text style={styles.itemAmount}>{formatCurrency(item.total)}</Text>
            </View>
          ))
        )}
      </Card>

      <Card padding="lg" style={styles.card}>
        <Text style={styles.sectionTitle}>Receipt total</Text>
        <View style={[styles.summaryRow, styles.summaryFooter]}>
          <Text style={styles.summaryLabel}>Amount</Text>
          <Text style={styles.summaryValue}>{formatCurrency(receipt.total)}</Text>
        </View>
      </Card>

      <View style={styles.actions}>
        <View style={styles.actionItem}>
          <AppButton
            label="Edit"
            onPress={() => router.push({ pathname: '/review/[id]', params: { id: receipt.id } })}
          />
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
  heading: {
    fontSize: typography.heading,
    fontWeight: '700',
    color: colors.text,
  },
  subheading: {
    color: colors.textMuted,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  summaryCard: {
    marginBottom: spacing.xl,
  },
  card: {
    marginTop: spacing.xl,
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
  summaryFooter: {
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  actions: {
    marginTop: spacing.xl,
  },
  actionItem: {
    marginBottom: spacing.md,
  },
});
