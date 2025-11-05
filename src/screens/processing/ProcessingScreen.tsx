import { useMemo } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { AppButton } from '@/src/components/AppButton';
import { Card } from '@/src/components/Card';
import { ProgressStepper } from '@/src/components/ProgressStepper';
import { useReceipts } from '@/src/hooks/useReceipts';
import { colors, spacing, typography } from '@/src/theme';

export const ProcessingScreen = () => {
  const { jobId } = useLocalSearchParams<{ jobId: string }>();
  const router = useRouter();
  const { state } = useReceipts();

  const job = jobId ? state.jobs[jobId] : undefined;
  const progress = job?.progress ?? [];

  const header = useMemo(() => {
    switch (job?.status) {
      case 'completed':
        return 'Receipt processed!';
      case 'failed':
        return 'We hit a snag';
      default:
        return 'Processing your receipt';
    }
  }, [job?.status]);

  const description = useMemo(() => {
    switch (job?.status) {
      case 'completed':
        return 'Review the extracted details to make sure everything looks correct.';
      case 'failed':
        return job?.error?.message ?? 'Something went wrong while processing this receipt.';
      default:
        return 'Hang tight while we analyse the receipt, extract the totals, and categorise everything.';
    }
  }, [job]);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>{header}</Text>
      <Text style={styles.description}>{description}</Text>

      {job?.status === 'running' && (
        <View style={styles.indicator}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}

      <Card padding="lg">
        <ProgressStepper progress={progress} />
      </Card>

      <View style={styles.actions}>
        {job?.status === 'completed' && job.result && (
          <View style={styles.actionItem}>
            <AppButton
              label="Review receipt"
              onPress={() => router.replace({ pathname: `/review/${job.result.receipt.id}` })}
            />
          </View>
        )}
        {job?.status === 'failed' && (
          <View style={styles.actionItem}>
            <AppButton label="Try again" onPress={() => router.push('/')} variant="secondary" />
          </View>
        )}
        {!job && (
          <View style={styles.actionItem}>
            <AppButton label="Back home" onPress={() => router.replace('/')} variant="secondary" />
          </View>
        )}
      </View>
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
    lineHeight: 20,
  },
  indicator: {
    marginBottom: spacing.xl,
  },
  actions: {
    marginTop: spacing.xl,
  },
  actionItem: {
    marginBottom: spacing.md,
  },
});
