import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';

import { ReceiptListItem } from '@/src/components/ReceiptListItem';
import { useReceipts } from '@/src/hooks/useReceipts';
import { colors, spacing, typography } from '@/src/theme';

export const HistoryScreen = () => {
  const { receipts } = useReceipts();
  const router = useRouter();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    return receipts.filter((receipt) => {
      const matchesSearch =
        !search ||
        (receipt.merchant ?? '').toLowerCase().includes(search.toLowerCase()) ||
        receipt.lineItems.some((item) => item.description.toLowerCase().includes(search.toLowerCase()));

      return matchesSearch;
    });
  }, [receipts, search]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>History</Text>
      <Text style={styles.subheading}>Browse your processed receipts, filter, and review.</Text>

      <TextInput
        style={styles.input}
        placeholder="Search receipts"
        placeholderTextColor={colors.textMuted}
        value={search}
        onChangeText={setSearch}
      />

      <View style={styles.list}>
        {filtered.length === 0 ? (
          <Text style={styles.empty}>No receipts match your filters.</Text>
        ) : (
          filtered.map((receipt) => (
            <View key={receipt.id} style={styles.listItem}>
              <ReceiptListItem
                receipt={receipt}
                onPress={() =>
                  router.push({ pathname: '/history/[id]', params: { id: receipt.id } })
                }
              />
            </View>
          ))
        )}
      </View>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.xl,
    paddingBottom: spacing.xxl * 2,
    backgroundColor: colors.background,
  },
  heading: {
    fontSize: typography.subheading,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subheading: {
    color: colors.textMuted,
    marginBottom: spacing.xl,
  },
  input: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  list: {
    marginBottom: spacing.xl,
  },
  listItem: {
    marginBottom: spacing.md,
  },
  empty: {
    color: colors.textMuted,
  },
});
