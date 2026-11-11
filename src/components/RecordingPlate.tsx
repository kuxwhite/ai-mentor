import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import type { DictationMode, DictationStatus } from '@/voice/useDictation';
import { colors, radius, spacing } from '@/theme';

import { AnimatedWords } from './AnimatedWords';
import { AppText } from './AppText';

type Props = {
  text: string;
  status: DictationStatus;
  mode: DictationMode;
};

const labels: Record<DictationStatus, string> = {
  idle: 'СЛУШАЮ',
  starting: 'ВКЛЮЧАЮ МИКРОФОН',
  listening: 'СЛУШАЮ',
  stopping: 'ДОСЛУШИВАЮ',
};

/** Мигающая точка «идёт запись». */
function LiveDot() {
  const reduceMotion = useReducedMotion();
  const pulse = useSharedValue(1);

  useEffect(() => {
    if (!reduceMotion) pulse.value = withRepeat(withTiming(0.3, { duration: 700 }), -1, true);
  }, [pulse, reduceMotion]);

  const style = useAnimatedStyle(() => ({ opacity: pulse.value }));
  return <Animated.View style={[styles.dot, style]} />;
}

/** Плашка записи в ленте диалога: текст появляется в ней по мере диктовки. */
export function RecordingPlate({ text, status, mode }: Props) {
  const reduceMotion = useReducedMotion();

  return (
    <Animated.View entering={reduceMotion ? undefined : FadeIn.duration(250)} style={styles.plate}>
      <View style={styles.header}>
        <LiveDot />
        <AppText variant="overline" color={colors.accent}>
          {labels[status]}
        </AppText>
      </View>

      {text ? (
        <AnimatedWords text={text} variant="dictation" />
      ) : (
        <AppText variant="dictation" color={colors.textSecondary}>
          Говори — текст появится здесь
        </AppText>
      )}

      {mode === 'demo' && (
        <AppText variant="caption" color={colors.textSecondary}>
          Демо: в Expo Go нет распознавания речи, поэтому показан пример. В сборке приложения здесь будет твой голос.
        </AppText>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  plate: {
    backgroundColor: colors.surface,
    borderColor: colors.accentLine,
    borderWidth: 1,
    borderRadius: radius.card,
    paddingHorizontal: 19,
    paddingVertical: 17,
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: radius.full,
    backgroundColor: colors.accent,
  },
});
