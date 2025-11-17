import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import type { DimensionValue } from 'react-native';

import { PIPELINE_STEPS } from '@/src/constants/pipeline';
import { colors, spacing, typography } from '@/src/theme';
import type { PipelineProgress, PipelineStatus } from '@/src/types';

interface Props {
  progress: PipelineProgress[];
  status?: PipelineStatus;
}

type StepState = 'pending' | 'active' | 'completed' | 'failed';

const STEP_FILL: Record<StepState, DimensionValue> = {
  completed: '100%',
  active: '65%',
  failed: '35%',
  pending: '0%',
};

const STEP_COLORS: Record<StepState, string> = {
  pending: colors.border,
  active: colors.primary,
  completed: colors.success,
  failed: colors.danger,
};

const LABEL_COLORS: Record<StepState, string> = {
  pending: colors.textMuted,
  active: colors.text,
  completed: colors.success,
  failed: colors.danger,
};

export const ProgressStepper = ({ progress, status = 'running' }: Props) => {
  const stepOrder = new Map(PIPELINE_STEPS.map((step, index) => [step.id, index]));
  const orderedProgress = progress.filter((item) => stepOrder.has(item.step));
  const currentStepId =
    status === 'completed'
      ? null
      : orderedProgress.length > 0
        ? orderedProgress[orderedProgress.length - 1].step
        : null;
  const currentIndex = currentStepId != null ? stepOrder.get(currentStepId) ?? -1 : -1;

  const resolveState = (index: number): StepState => {
    if (status === 'completed') {
      return 'completed';
    }
    if (status === 'failed') {
      if (index < currentIndex) {
        return 'completed';
      }
      if (index === currentIndex) {
        return 'failed';
      }
      return 'pending';
    }
    if (currentIndex === -1) {
      return index === 0 ? 'active' : 'pending';
    }
    if (index < currentIndex) {
      return 'completed';
    }
    if (index === currentIndex) {
      return 'active';
    }
    return 'pending';
  };

  return (
    <View style={styles.container}>
      {PIPELINE_STEPS.map((step, index) => {
        const state = resolveState(index);
        const accentColor = STEP_COLORS[state];
        const labelColor = LABEL_COLORS[state];

        return (
          <View key={step.id} style={[styles.step, index > 0 && styles.stepSpacing]}>
            <View
              style={[
                styles.dot,
                state === 'active' && styles.dotActive,
                { backgroundColor: accentColor },
              ]}
            />
            <View style={styles.info}>
              <View style={styles.labelRow}>
                <Text
                  style={[
                    styles.label,
                    (state === 'active' || state === 'failed') && styles.labelStrong,
                    { color: labelColor },
                  ]}
                >
                  {step.label}
                </Text>
              </View>
              <View style={styles.progressRow}>
                <View style={styles.bar}>
                  <View
                    style={[
                      styles.fill,
                      { width: STEP_FILL[state], backgroundColor: accentColor },
                    ]}
                  />
                </View>
                {state === 'active' && status === 'running' && (
                  <ActivityIndicator size="small" color={accentColor} style={styles.spinner} />
                )}
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
    marginTop: spacing.md,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  info: {
    flex: 1,
    marginLeft: spacing.md,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontSize: typography.caption,
    marginBottom: spacing.xs,
  },
  labelStrong: {
    fontWeight: '600',
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bar: {
    flex: 1,
    height: 6,
    backgroundColor: colors.surfaceAlt,
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
  },
  dotActive: {
    transform: [{ scale: 1.2 }],
  },
  spinner: {
    marginLeft: spacing.sm,
  },
});
