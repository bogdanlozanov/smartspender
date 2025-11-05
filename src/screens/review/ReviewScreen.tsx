import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { AppButton } from '@/src/components/AppButton';
import { Card } from '@/src/components/Card';
import { ReceiptAnalysisCard } from '@/src/components/ReceiptAnalysisCard';
import { useReceipts } from '@/src/hooks/useReceipts';
import { useReceiptActions } from '@/src/state/useReceiptActions';
import { colors, spacing, typography } from '@/src/theme';
import { formatDate, parseCurrency, toISODate } from '@/src/utils/format';
import type { LineItem, ReceiptWithItems } from '@/src/types';

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
  const [subtotal, setSubtotal] = useState(receipt?.subtotal ? String(receipt.subtotal) : '');
  const [tax, setTax] = useState(receipt?.tax ? String(receipt.tax) : '');
  const [total, setTotal] = useState(receipt?.total ? String(receipt.total) : '');
  const [lineItems, setLineItems] = useState<LineItem[]>(
    receipt?.lineItems.map((item) => ({ ...item })) ?? [],
  );

  useEffect(() => {
    if (receipt) {
      setMerchant(receipt.merchant ?? '');
      setDate(toEditableDate(receipt.receiptDate));
      setSubtotal(receipt.subtotal ? receipt.subtotal.toString() : '');
      setTax(receipt.tax ? receipt.tax.toString() : '');
      setTotal(receipt.total ? receipt.total.toString() : '');
      setLineItems(receipt.lineItems.map((item) => ({ ...item })));
    }
  }, [receipt]);

  if (!receipt) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Receipt not found.</Text>
        <AppButton label="Back to home" onPress={() => router.replace('/')} />
      </View>
    );
  }

  const modelName = useMemo(() => {
    const meta = receipt.providerMeta as { model?: string } | null;
    return meta?.model ?? 'gpt-4o-mini';
  }, [receipt.providerMeta]);

  const handleSave = async () => {
    try {
      setSaving(true);
      const updated: ReceiptWithItems = {
        ...receipt,
        merchant: merchant.trim() || null,
        receiptDate: toISODate(date) ?? receipt.receiptDate,
        subtotal: parseCurrency(subtotal),
        tax: parseCurrency(tax),
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
      router.replace({ pathname: `/history/${receipt.id}` });
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

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Card padding="lg">
          <Image source={{ uri: receipt.imageUri }} style={styles.image} />
          <Text style={styles.caption}>
            Captured {formatDate(receipt.createdAt)} • AI model {modelName}
          </Text>
        </Card>

        <ReceiptAnalysisCard analysis={receipt.analysis} />

        <Card padding="lg">
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

          <View style={styles.row}>
            <View style={[styles.rowField, styles.rowFieldSpacing]}>
              <Text style={styles.label}>Subtotal</Text>
              <TextInput
                style={styles.input}
                keyboardType="decimal-pad"
                value={subtotal}
                onChangeText={setSubtotal}
              />
            </View>
            <View style={[styles.rowField, styles.rowFieldSpacing]}>
              <Text style={styles.label}>Tax</Text>
              <TextInput
                style={styles.input}
                keyboardType="decimal-pad"
                value={tax}
                onChangeText={setTax}
              />
            </View>
            <View style={styles.rowField}>
              <Text style={styles.label}>Total</Text>
              <TextInput
                style={styles.input}
                keyboardType="decimal-pad"
                value={total}
                onChangeText={setTotal}
              />
            </View>
          </View>
        </Card>

        <Card padding="lg">
          <Text style={styles.sectionTitle}>Line items</Text>
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
            <AppButton label="Back" onPress={() => router.back()} variant="secondary" />
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rowField: {
    flex: 1,
    marginBottom: spacing.xl,
  },
  rowFieldSpacing: {
    marginRight: spacing.md,
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
