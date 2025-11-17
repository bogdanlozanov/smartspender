import { Pressable, StyleSheet, Text } from 'react-native';
import type { ReactNode } from 'react';

import { colors, spacing, typography } from '@/src/theme';

interface Props {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  icon?: ReactNode;
  disabled?: boolean;
}

export const AppButton = ({ label, onPress, variant = 'primary', icon, disabled }: Props) => {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        variant === 'primary' && styles.primary,
        variant === 'secondary' && styles.secondary,
        variant === 'ghost' && styles.ghost,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
      ]}
    >
      {icon}
      <Text style={[styles.label, variant === 'secondary' && styles.labelSecondary]}>{label}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    columnGap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: spacing.lg,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.surface,
    borderColor: colors.primaryMuted,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderColor: colors.surfaceAlt,
  },
  label: {
    fontSize: typography.body,
    fontWeight: '600',
    color: colors.text,
  },
  labelSecondary: {
    color: colors.text,
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.5,
  },
});
