import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

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
  const receiptId = job?.result?.receipt.id;

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
        return 'Edit the extracted details to make sure everything looks correct.';
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

      {job?.imageUri && (
        <Card padding="lg" style={styles.previewCard}>
          <Image source={{ uri: job.imageUri }} style={styles.previewImage} />
        </Card>
      )}

      <Card padding="lg" style={styles.progressCard}>
        <Text style={styles.progressHeading}>Pipeline status</Text>
        <ProgressStepper progress={progress} status={job?.status ?? 'running'} />
      </Card>

      <View style={styles.actions}>
        {job?.status === 'completed' && receiptId && (
          <View style={styles.actionItem}>
            <AppButton
              label="Edit receipt"
              onPress={() =>
                router.replace({
                  pathname: '/review/[id]',
                  params: { id: receiptId },
                })
              }
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
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  previewCard: {
    marginBottom: spacing.lg,
  },
  previewImage: {
    width: '100%',
    height: 220,
    borderRadius: spacing.md,
  },
  indicator: {
    marginBottom: spacing.lg,
  },
  progressCard: {
    marginBottom: spacing.xl,
  },
  progressHeading: {
    fontSize: typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  actions: {
    marginTop: spacing.xl,
  },
  actionItem: {
    marginBottom: spacing.md,
  },
});
