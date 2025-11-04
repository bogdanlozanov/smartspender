import { View, Text, StyleSheet } from 'react-native';

import { PIPELINE_STEPS } from '@/src/constants/pipeline';
import type { PipelineProgress } from '@/src/types';
import { colors, spacing, typography } from '@/src/theme';

interface Props {
  progress: PipelineProgress[];
}

export const ProgressStepper = ({ progress }: Props) => {
  const progressMap = Object.fromEntries(progress.map((item) => [item.step, item.progress]));

  return (
    <View style={styles.container}>
      {PIPELINE_STEPS.map((step, index) => {
        const value = progressMap[step.id] ?? 0;
        const completed = value >= step.progress;
        return (
          <View key={step.id} style={[styles.step, index > 0 && styles.stepSpacing]}>
            <View style={[styles.dot, completed && styles.dotCompleted]} />
            <View style={styles.info}>
              <Text style={styles.label}>{step.label}</Text>
              <View style={styles.bar}>
                <View style={[styles.fill, { width: `${completed ? 100 : value}%` }]} />
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepSpacing: {
    marginTop: spacing.lg,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.border,
  },
  dotCompleted: {
    backgroundColor: colors.primary,
  },
  info: {
    flex: 1,
  },
  label: {
    color: colors.text,
    fontSize: typography.caption,
    marginBottom: spacing.xs,
  },
  bar: {
    height: 6,
    backgroundColor: colors.surfaceAlt,
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
});
