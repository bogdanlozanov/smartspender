import { ActivityIndicator, View, Text, StyleSheet } from 'react-native';

import { PIPELINE_STEPS } from '@/src/constants/pipeline';
import type { PipelineProgress, PipelineStatus } from '@/src/types';
import { colors, spacing, typography } from '@/src/theme';

interface Props {
  progress: PipelineProgress[];
  status?: PipelineStatus;
}

type StepState = 'pending' | 'active' | 'completed' | 'failed';

const STEP_FILL: Record<StepState, string> = {
  completed: '100%',
  active: '55%',
  failed: '35%',
  pending: '0%',
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
        return (
          <View key={step.id} style={[styles.step, index > 0 && styles.stepSpacing]}>
            <View
              style={[
                styles.dot,
                state === 'completed' && styles.dotCompleted,
                state === 'active' && styles.dotActive,
                state === 'failed' && styles.dotFailed,
              ]}
            />
            <View style={styles.info}>
              <View style={styles.labelRow}>
                <Text
                  style={[
                    styles.label,
                    state === 'completed' && styles.labelCompleted,
                    state === 'active' && styles.labelActive,
                    state === 'pending' && styles.labelPending,
                    state === 'failed' && styles.labelFailed,
                  ]}
                >
                  {step.label}
                </Text>
                {state === 'active' && status === 'running' && (
                  <ActivityIndicator size="small" color={colors.primary} style={styles.spinner} />
                )}
              </View>
              <View style={styles.bar}>
                <View
                  style={[
                    styles.fill,
                    state === 'completed' && styles.fillCompleted,
                    state === 'active' && styles.fillActive,
                    state === 'failed' && styles.fillFailed,
                    { width: STEP_FILL[state] },
                  ]}
                />
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
    backgroundColor: colors.border,
  },
  dotCompleted: {
    backgroundColor: colors.primary,
  },
  info: {
    flex: 1,
    marginLeft: spacing.md,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    color: colors.text,
    fontSize: typography.caption,
    marginBottom: spacing.xs,
  },
  labelPending: {
    color: colors.textMuted,
  },
  labelActive: {
    color: colors.text,
    fontWeight: '600',
  },
  labelCompleted: {
    color: colors.text,
  },
  labelFailed: {
    color: colors.danger,
    fontWeight: '600',
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
  fillCompleted: {
    backgroundColor: colors.primary,
  },
  fillActive: {
    backgroundColor: colors.primary,
  },
  fillFailed: {
    backgroundColor: colors.danger,
  },
  dotActive: {
    backgroundColor: colors.primary,
    transform: [{ scale: 1.2 }],
  },
  dotFailed: {
    backgroundColor: colors.danger,
  },
  spinner: {
    marginLeft: spacing.sm,
  },
});
