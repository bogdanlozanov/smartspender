import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { Card } from '@/src/components/Card';
import { colors, spacing, typography } from '@/src/theme';
import type { ReceiptWithItems } from '@/src/types';
import { getTotalsMismatchMessage } from '@/src/utils/receipt';

interface Props {
  style?: StyleProp<ViewStyle>;
  receipt?: ReceiptWithItems | null;
  message?: string | null;
  heading?: string;
}

export const NeedsReviewCard = ({ style, receipt, message, heading = 'Needs review' }: Props) => {
  const resolvedMessage = message ?? (receipt ? getTotalsMismatchMessage(receipt) : null);
  if (!resolvedMessage) return null;

  return (
    <Card padding="lg" style={[styles.card, style]}>
      <Text style={styles.heading}>{heading}</Text>
      <View style={styles.box}>
        <Text style={styles.text}>{resolvedMessage}</Text>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.xl,
  },
  heading: {
    fontSize: typography.caption,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
  },
  box: {
    backgroundColor: colors.warning,
    borderRadius: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  text: {
    color: '#0F1A2A',
    fontSize: typography.caption,
    fontWeight: '600',
  },
});

