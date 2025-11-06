import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { AppButton } from '@/src/components/AppButton';
import { Card } from '@/src/components/Card';
import { ReceiptAnalysisCard } from '@/src/components/ReceiptAnalysisCard';
import { NeedsReviewCard } from '@/src/components/NeedsReviewCard';
import { useReceipts } from '@/src/hooks/useReceipts';
import { useReceiptActions } from '@/src/state/useReceiptActions';
import { colors, spacing, typography } from '@/src/theme';
import type { LineItem, ReceiptWithItems } from '@/src/types';
import { formatDate, parseCurrency, toISODate } from '@/src/utils/format';

const toEditableDate = (iso: string | null) => {
  if (!iso) return '';
  return iso.slice(0, 10);
};

export const ReviewScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { getReceipt } = useReceipts();
  const { upsertReceipt } = useReceiptActions();
  const [saving, setSaving] = useState(false);

  const receipt = useMemo(() => (id ? getReceipt(id) : undefined), [getReceipt, id]);

  const [merchant, setMerchant] = useState(receipt?.merchant ?? '');
  const [date, setDate] = useState(toEditableDate(receipt?.receiptDate ?? null));
  const [total, setTotal] = useState(receipt?.total ? String(receipt.total) : '');
  const [lineItems, setLineItems] = useState<LineItem[]>(
    receipt?.lineItems.map((item) => ({ ...item })) ?? [],
  );

  useEffect(() => {
    if (receipt) {
      setMerchant(receipt.merchant ?? '');
      setDate(toEditableDate(receipt.receiptDate));
      setTotal(receipt.total ? receipt.total.toString() : '');
      setLineItems(receipt.lineItems.map((item) => ({ ...item })));
    }
  }, [receipt]);

  const modelName = useMemo(() => {
    const meta = receipt?.providerMeta as { model?: string } | null;
    return meta?.model ?? 'gpt-4o-mini';
  }, [receipt?.providerMeta]);

  if (!receipt) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Receipt not found.</Text>
        <AppButton label="Back to home" onPress={() => router.replace('/')} />
      </View>
    );
  }

  const handleSave = async () => {
    try {
      setSaving(true);
      const updated: ReceiptWithItems = {
        ...receipt,
        merchant: merchant.trim() || null,
        receiptDate: toISODate(date) ?? receipt.receiptDate,
        total: parseCurrency(total) ?? receipt.total,
        status: 'done',
        updatedAt: new Date().toISOString(),
        lineItems: lineItems.map((item) => ({
          ...item,
          description: item.description.trim(),
          quantity: item.quantity ?? null,
          unit: item.unit ?? null,
          unitPrice: item.unitPrice ?? null,
          total: item.total,
        })),
      };

      await upsertReceipt(updated);
      Alert.alert('Saved', 'Receipt details updated.');
      router.replace({ pathname: '/history/[id]', params: { id: receipt.id } });
    } catch (error) {
      console.error('Failed to save receipt', error);
      Alert.alert('Save failed', 'Could not save receipt changes.');
    } finally {
      setSaving(false);
    }
  };

  const updateItem = (id: string, updates: Partial<LineItem>) => {
    setLineItems((current) =>
      current.map((item) => (item.id === id ? { ...item, ...updates } : item)),
    );
  };

  const { mismatch, reported, itemsSum, diff } = useMemo(() => {
    // Compute mismatch based on current editable values
    const currentTotal = total ? Number.parseFloat(total.replace(',', '.')) : null;
    const normalizedTotal = currentTotal != null && Number.isFinite(currentTotal)
      ? Number(currentTotal.toFixed(2))
      : null;
    const itemsTotal = lineItems.reduce((acc, item) => acc + (item.total ?? 0), 0);
    const normalizedItemsTotal = Number(itemsTotal.toFixed(2));
    const d = normalizedTotal != null ? Number((normalizedTotal - normalizedItemsTotal).toFixed(2)) : null;
    const m = d != null ? Math.abs(d) > 0.05 : false;
    return { mismatch: m, reported: normalizedTotal, itemsSum: normalizedItemsTotal, diff: d };
  }, [total, lineItems]);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.heading}>Review receipt</Text>
        <Text style={styles.subheading}>Confirm the AI summary and tweak any details.</Text>

        <Card padding="lg" style={styles.card}>
          <Image source={{ uri: receipt.imageUri }} style={styles.image} />
          <Text style={styles.caption}>
            Captured {formatDate(receipt.createdAt)} • AI model {modelName}
          </Text>
        </Card>

        {receipt.status === 'needs_review' && mismatch && reported != null && diff != null ? (
          <NeedsReviewCard
            style={styles.card}
            message={`Receipt analysis totals mismatch. Reported: ${reported.toFixed(2)}, items sum: ${itemsSum.toFixed(2)}, diff: ${diff.toFixed(2)}`}
          />
        ) : null}

        <ReceiptAnalysisCard analysis={receipt.analysis} style={styles.card} />

        <Card padding="lg" style={styles.card}>
          <Text style={styles.sectionTitle}>Receipt details</Text>
          <View style={styles.field}>
            <Text style={styles.label}>Merchant</Text>
            <TextInput
              style={styles.input}
              placeholder="Merchant name"
              placeholderTextColor={colors.textMuted}
              value={merchant}
              onChangeText={setMerchant}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Date</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.textMuted}
              value={date}
              onChangeText={setDate}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Total</Text>
            <TextInput
              style={styles.input}
              keyboardType="decimal-pad"
              value={total}
              onChangeText={setTotal}
            />
          </View>
        </Card>

        <Card padding="lg" style={styles.card}>
          <Text style={styles.sectionTitle}>Receipt items</Text>
          {lineItems.length === 0 ? (
            <Text style={styles.emptyText}>No items detected.</Text>
          ) : (
            lineItems.map((item) => (
              <View key={item.id} style={styles.itemRow}>
                <TextInput
                  style={[styles.input, styles.itemDescription]}
                  value={item.description}
                  onChangeText={(text) => updateItem(item.id, { description: text })}
                  placeholder="Item description"
                  placeholderTextColor={colors.textMuted}
                />
                <View style={styles.itemMetaRow}>
                  <TextInput
                    style={[styles.input, styles.itemMetaInput]}
                    value={item.quantity != null ? String(item.quantity) : ''}
                    placeholder="Qty"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="decimal-pad"
                    onChangeText={(value) => {
                      const parsed = value ? Number.parseFloat(value.replace(',', '.')) : null;
                      updateItem(item.id, {
                        quantity: parsed !== null && Number.isFinite(parsed) ? parsed : null,
                      });
                    }}
                  />
                  <TextInput
                    style={[styles.input, styles.itemMetaInput]}
                    value={item.unit ?? ''}
                    placeholder="Unit"
                    placeholderTextColor={colors.textMuted}
                    onChangeText={(value) => updateItem(item.id, { unit: value || null })}
                  />
                  <TextInput
                    style={[styles.input, styles.itemMetaInput]}
                    value={item.unitPrice != null ? String(item.unitPrice) : ''}
                    placeholder="Unit price"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="decimal-pad"
                    onChangeText={(value) => updateItem(item.id, { unitPrice: parseCurrency(value) })}
                  />
                  <TextInput
                    style={[styles.input, styles.itemMetaInput, styles.itemMetaInputEnd]}
                    value={item.total != null ? String(item.total) : ''}
                    placeholder="Line total"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="decimal-pad"
                    onChangeText={(value) => updateItem(item.id, { total: parseCurrency(value) })}
                  />
                </View>
              </View>
            ))
          )}
        </Card>

        <View style={styles.actions}>
          <View style={styles.actionItem}>
            <AppButton label="Save changes" onPress={handleSave} disabled={saving} />
          </View>
          <View style={styles.actionItem}>
            <AppButton label="Back to receipt" onPress={() => router.back()} variant="secondary" />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
  card: {
    marginBottom: spacing.xl,
  },
  image: {
    width: '100%',
    height: 220,
    borderRadius: spacing.md,
    marginBottom: spacing.md,
  },
  caption: {
    color: colors.textMuted,
    fontSize: typography.caption,
  },
  sectionTitle: {
    fontSize: typography.subheading,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  field: {
    marginBottom: spacing.lg,
  },
  label: {
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.surfaceAlt,
    color: colors.text,
    borderRadius: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
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
    marginBottom: spacing.md,
  },
  itemDescription: {
    marginBottom: spacing.sm,
  },
  itemMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  itemMetaInput: {
    flex: 1,
    marginRight: spacing.sm,
  },
  itemMetaInputEnd: {
    marginRight: 0,
  },
  actions: {
    marginTop: spacing.xl,
  },
  actionItem: {
    marginBottom: spacing.md,
  },
});
