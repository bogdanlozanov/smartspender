import { View, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { colors, spacing } from '@/src/theme';

interface Props {
  children: React.ReactNode;
  padding?: 'sm' | 'md' | 'lg';
  style?: StyleProp<ViewStyle>;
}

export const Card = ({ children, padding = 'md', style }: Props) => {
  return <View style={[styles.base, styles[padding], style]}>{children}</View>;
};

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.surface,
    borderRadius: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sm: {
    padding: spacing.sm,
  },
  md: {
    padding: spacing.lg,
  },
  lg: {
    padding: spacing.xl,
  },
});
