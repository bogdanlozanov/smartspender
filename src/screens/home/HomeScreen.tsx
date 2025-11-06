import { useState, useCallback } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';

import { AppButton } from '@/src/components/AppButton';
import { Card } from '@/src/components/Card';
import { ReceiptListItem } from '@/src/components/ReceiptListItem';
import { useReceipts } from '@/src/hooks/useReceipts';
import { useReceiptProcessor } from '@/src/pipeline/useReceiptProcessor';
import { colors, spacing, typography } from '@/src/theme';
import { formatCurrency } from '@/src/utils/format';

const MAX_RECENT = 5;

const sumReceipts = (total: number, receipt: { total: number | null }) =>
  total + (receipt.total ?? 0);

export const HomeScreen = () => {
  const router = useRouter();
  const { receipts, state } = useReceipts();
  const { startProcessing } = useReceiptProcessor();
  const [busy, setBusy] = useState(false);

  const handleImagePicked = useCallback(
    (uri: string) => {
      setBusy(false);
      const jobId = startProcessing(uri);
      router.push({ pathname: '/processing', params: { jobId } });
    },
    [router, startProcessing],
  );

  const handlePick = useCallback(
    async (mode: 'camera' | 'library') => {
      try {
        setBusy(true);
        if (mode === 'camera') {
          const permission = await ImagePicker.requestCameraPermissionsAsync();
          if (!permission.granted) {
            Alert.alert('Camera access denied', 'Enable camera access to scan receipts.');
            setBusy(false);
            return;
          }
          // TODO: add an optional cropping step before starting the pipeline.
          const result = await ImagePicker.launchCameraAsync({
            quality: 0.7,
            allowsEditing: false,
          });
          if (!result.canceled && result.assets?.[0]?.uri) {
            handleImagePicked(result.assets[0].uri);
          } else {
            setBusy(false);
          }
        } else {
          const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (!permission.granted) {
            Alert.alert('Library access denied', 'Enable photo library access to import receipts.');
            setBusy(false);
            return;
          }
          const result = await ImagePicker.launchImageLibraryAsync({
            quality: 0.9,
          });
          if (!result.canceled && result.assets?.[0]?.uri) {
            handleImagePicked(result.assets[0].uri);
          } else {
            setBusy(false);
          }
        }
      } catch (error) {
        console.error('Image pick failed', error);
        Alert.alert('Something went wrong', 'Could not access the camera or photo library.');
        setBusy(false);
      }
    },
    [handleImagePicked],
  );

  const totalSpent = receipts.reduce(sumReceipts, 0);
  const monthlySpent = receipts
    .filter((receipt) => {
      if (!receipt.receiptDate) return false;
      const date = new Date(receipt.receiptDate);
      const now = new Date();
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    })
    .reduce(sumReceipts, 0);

  const recentReceipts = receipts.slice(0, MAX_RECENT);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>SmartSpender</Text>
      <Text style={styles.subtitle}>
        Scan cash receipts, extract the details automatically, and stay on top of your expenses.
      </Text>

      {state.loading && (
        <View style={styles.loadingRow}>
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.loadingLabel}>Loading receipts…</Text>
        </View>
      )}

      {state.error && <Text style={styles.error}>{state.error}</Text>}

      <View style={styles.actions}>
        <View style={styles.actionItem}>
          <AppButton label="Scan receipt" onPress={() => handlePick('camera')} disabled={busy} />
        </View>
        <View style={styles.actionItem}>
          <AppButton
            label="Import from gallery"
            onPress={() => handlePick('library')}
            disabled={busy}
            variant="secondary"
          />
        </View>
      </View>

      <Card padding="lg" style={styles.card}>
        <Text style={styles.sectionTitle}>Spending overview</Text>
        <View style={styles.metricsRow}>
          <View>
            <Text style={styles.metricLabel}>This month</Text>
            <Text style={styles.metricValue}>{formatCurrency(monthlySpent)}</Text>
          </View>
          <View>
            <Text style={styles.metricLabel}>Overall</Text>
            <Text style={styles.metricValue}>{formatCurrency(totalSpent)}</Text>
          </View>
        </View>
      </Card>

      <Card padding="lg" style={styles.card}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent receipts</Text>
          <AppButton label="View all" variant="ghost" onPress={() => router.push('/history')} />
        </View>
        {recentReceipts.length === 0 ? (
          <Text style={styles.emptyState}>No receipts yet. Start by scanning one!</Text>
        ) : (
          recentReceipts.map((receipt) => (
            <View key={receipt.id} style={styles.listItem}>
              <ReceiptListItem
                receipt={receipt}
                onPress={() => router.push({ pathname: '/history/[id]', params: { id: receipt.id } })}
              />
            </View>
          ))
        )}
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.xl,
    paddingBottom: spacing.xxl * 2,
    backgroundColor: colors.background,
  },
  card: {
    marginTop: spacing.xl,
  },
  heading: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.body,
    color: colors.textMuted,
    lineHeight: 22,
  },
  error: {
    backgroundColor: colors.danger,
    color: colors.text,
    padding: spacing.md,
    borderRadius: spacing.md,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  loadingLabel: {
    marginLeft: spacing.sm,
    color: colors.textMuted,
  },
  actions: {
    flexDirection: 'column',
  },
  actionItem: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.subheading,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  metricLabel: {
    color: colors.textMuted,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
  },
  emptyState: {
    color: colors.textMuted,
  },
  listItem: {
    marginBottom: spacing.md,
  },
});
