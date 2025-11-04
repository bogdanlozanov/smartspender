import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';

import { AppButton } from '@/src/components/AppButton';
import { useReceipts } from '@/src/hooks/useReceipts';
import { exportReceiptsToCsv, shareCsv } from '@/src/services/csv';
import { colors, spacing, typography } from '@/src/theme';
import { toISODate } from '@/src/utils/format';

const today = new Date();
const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

const toInputDate = (date: Date) => date.toISOString().slice(0, 10);

export const ExportScreen = () => {
  const { receipts } = useReceipts();
  const [from, setFrom] = useState(toInputDate(startOfMonth));
  const [to, setTo] = useState(toInputDate(today));
  const [busy, setBusy] = useState(false);

  const handleExport = async () => {
    const fromISO = toISODate(from);
    const toISO = toISODate(to);

    if (!fromISO || !toISO) {
      Alert.alert('Invalid dates', 'Please provide valid from/to dates (YYYY-MM-DD).');
      return;
    }

    const fromDate = new Date(fromISO);
    const toDate = new Date(toISO);

    const rangeReceipts = receipts.filter((receipt) => {
      if (!receipt.receiptDate) return false;
      const date = new Date(receipt.receiptDate);
      return date >= fromDate && date <= toDate;
    });

    if (rangeReceipts.length === 0) {
      Alert.alert('No receipts', 'No receipts were found in the selected range.');
      return;
    }

    try {
      setBusy(true);
      const fileUri = await exportReceiptsToCsv(rangeReceipts);
      await shareCsv(fileUri);
    } catch (error) {
      console.error('CSV export failed', error);
      Alert.alert('Export failed', 'Could not export receipts to CSV.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Export receipts</Text>
      <Text style={styles.description}>
        Choose a date range and we will generate a CSV file with your receipts and line items.
      </Text>

      <View style={styles.field}>
        <Text style={styles.label}>From</Text>
        <TextInput
          style={styles.input}
          value={from}
          onChangeText={setFrom}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={colors.textMuted}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>To</Text>
        <TextInput
          style={styles.input}
          value={to}
          onChangeText={setTo}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={colors.textMuted}
        />
      </View>

      <AppButton label="Export CSV" onPress={handleExport} disabled={busy} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  heading: {
    fontSize: typography.subheading,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  description: {
    color: colors.textMuted,
    marginBottom: spacing.xl,
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
    borderRadius: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
  },
});
