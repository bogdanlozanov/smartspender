import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import type { ReceiptAnalysis } from '@/src/types';
import { Card } from '@/src/components/Card';
import { colors, spacing, typography } from '@/src/theme';
import { formatCurrency, formatDate } from '@/src/utils/format';

interface Props {
  analysis: ReceiptAnalysis | null | undefined;
  style?: StyleProp<ViewStyle>;
}

/**
 * Presents the raw AI analysis so the user can quickly verify what was extracted.
 */
export const ReceiptAnalysisCard = ({ analysis, style }: Props) => {
  if (!analysis) {
    return null;
  }

  return (
    <Card padding="lg" style={[styles.card, style]}>
      <Text style={styles.heading}>AI summary</Text>
      {analysis.model && <Text style={styles.model}>Model · {analysis.model}</Text>}
      <View style={styles.row}>
        <View style={styles.metaBlock}>
          <Text style={styles.label}>Merchant</Text>
          <Text style={styles.value}>{analysis.merchantName || 'Unknown'}</Text>
        </View>
        <View style={styles.metaBlock}>
          <Text style={styles.label}>Date</Text>
          <Text style={styles.value}>{formatDate(analysis.date)}</Text>
        </View>
        <View style={styles.metaBlock}>
          <Text style={styles.label}>Total</Text>
          <Text style={styles.value}>{formatCurrency(analysis.total, analysis.currency)}</Text>
        </View>
      </View>

      <View style={styles.listHeader}>
        <Text style={[styles.label, styles.itemsLabel]}>Detected items</Text>
      </View>
      {analysis.items.length === 0 ? (
        <Text style={styles.empty}>No line items detected.</Text>
      ) : (
        analysis.items.map((item, index) => (
          <View key={`${item.name}-${index}`} style={styles.itemRow}>
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.name}</Text>
              {(item.qty || item.unitPrice) && (
                <Text style={styles.itemMeta}>
                  {item.qty ? `${item.qty}${item.unit ? ` ${item.unit}` : ''}` : ''}
                  {item.qty && item.unitPrice ? ' × ' : ''}
                  {item.unitPrice !== undefined
                    ? formatCurrency(item.unitPrice ?? null, analysis.currency)
                    : ''}
                </Text>
              )}
            </View>
            <Text style={styles.itemTotal}>{formatCurrency(item.total, analysis.currency)}</Text>
          </View>
        ))
      )}

      <View style={[styles.summaryRow, styles.summaryFooter]}>
        <Text style={styles.summaryLabel}>Total</Text>
        <Text style={styles.summaryTotal}>{formatCurrency(analysis.total, analysis.currency)}</Text>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginTop: spacing.xl,
  },
  heading: {
    fontSize: typography.subheading,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.lg,
  },
  model: {
    color: colors.textMuted,
    fontSize: typography.caption,
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  metaBlock: {
    flex: 1,
  },
  label: {
    color: colors.textMuted,
    fontSize: typography.caption,
    marginBottom: spacing.xs,
  },
  value: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: '600',
  },
  listHeader: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
    marginBottom: spacing.sm,
  },
  itemsLabel: {
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  empty: {
    color: colors.textMuted,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.surfaceAlt,
  },
  itemInfo: {
    flex: 1,
    paddingRight: spacing.md,
  },
  itemName: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: '600',
  },
  itemMeta: {
    color: colors.textMuted,
    fontSize: typography.caption,
    marginTop: spacing.xs,
  },
  itemTotal: {
    color: colors.text,
    fontWeight: '700',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    color: colors.textMuted,
    fontSize: typography.caption,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  summaryFooter: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  summaryTotal: {
    color: colors.text,
    fontSize: typography.subheading,
    fontWeight: '700',
  },
});
