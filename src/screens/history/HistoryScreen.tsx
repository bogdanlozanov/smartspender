import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';

import { AppButton } from '@/src/components/AppButton';
import { ReceiptListItem } from '@/src/components/ReceiptListItem';
import { DEFAULT_CATEGORIES } from '@/src/constants/categories';
import { useReceipts } from '@/src/hooks/useReceipts';
import { colors, spacing, typography } from '@/src/theme';

export const HistoryScreen = () => {
  const { receipts } = useReceipts();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return receipts.filter((receipt) => {
      const matchesSearch =
        !search ||
        (receipt.merchant ?? '').toLowerCase().includes(search.toLowerCase()) ||
        receipt.lineItems.some((item) => item.description.toLowerCase().includes(search.toLowerCase()));

      const matchesCategory = !category || receipt.categoryGuess === category;

      return matchesSearch && matchesCategory;
    });
  }, [receipts, search, category]);

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

      <View style={styles.categoryRow}>
        <Text
          style={[styles.categoryChip, category === null && styles.categoryChipActive]}
          onPress={() => setCategory(null)}
        >
          All
        </Text>
        {DEFAULT_CATEGORIES.map((option) => (
          <Text
            key={option.id}
            style={[styles.categoryChip, category === option.id && styles.categoryChipActive]}
            onPress={() => setCategory(option.id)}
          >
            {option.name}
          </Text>
        ))}
      </View>

      <View style={styles.list}>
        {filtered.length === 0 ? (
          <Text style={styles.empty}>No receipts match your filters.</Text>
        ) : (
          filtered.map((receipt) => (
            <View key={receipt.id} style={styles.listItem}>
              <ReceiptListItem
                receipt={receipt}
                onPress={() => router.push({ pathname: `/history/${receipt.id}` })}
              />
            </View>
          ))
        )}
      </View>

      <AppButton label="Export CSV" onPress={() => router.push('/export')} />
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
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.xl,
  },
  categoryChip: {
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: spacing.lg,
    backgroundColor: colors.surfaceAlt,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.surfaceAlt,
  },
  categoryChipActive: {
    backgroundColor: colors.primary,
    color: '#0F1A2A',
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
