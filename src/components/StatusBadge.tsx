import { Text, View, StyleSheet } from 'react-native';

import type { ReceiptStatus } from '@/src/types';
import { colors, spacing, typography } from '@/src/theme';

const STATUS_STYLES: Record<
  ReceiptStatus,
  { bg: string; color: string; label: string }
> = {
  uploaded: { bg: colors.surfaceAlt, color: colors.text, label: 'Uploaded' },
  queued: { bg: colors.surfaceAlt, color: colors.text, label: 'Queued' },
  processing: { bg: colors.surfaceAlt, color: colors.text, label: 'Processing' },
  needs_review: { bg: colors.warning, color: '#0F1A2A', label: 'Needs review' },
  done: { bg: colors.success, color: '#0F1A2A', label: 'Ready' },
  error: { bg: colors.danger, color: colors.text, label: 'Error' },
};

interface Props {
  status: ReceiptStatus;
}

export const StatusBadge = ({ status }: Props) => {
  const style = STATUS_STYLES[status];

  return (
    <View style={[styles.badge, { backgroundColor: style.bg }]}>
      <Text style={[styles.text, { color: style.color }]}>{style.label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: spacing.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  text: {
    fontSize: typography.caption,
    fontWeight: '600',
  },
});
