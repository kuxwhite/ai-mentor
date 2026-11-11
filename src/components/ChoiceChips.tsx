import * as Haptics from 'expo-haptics';
import { Platform, Pressable, StyleSheet } from 'react-native';
import Animated, { FadeIn, useReducedMotion } from 'react-native-reanimated';

import { colors, radius, spacing } from '@/theme';

import { AppText } from './AppText';

type Props = {
  options: string[];
  onSelect: (option: string) => void;
  onSkip: () => void;
  /** Задержка появления, мс: чипы показываются, когда ментор договорил. */
  delay?: number;
};

const tap = () => {
  if (Platform.OS !== 'web') Haptics.selectionAsync().catch(() => {});
};

/** Варианты ответа под вопросом ментора и кнопка «Пропустить». */
export function ChoiceChips({ options, onSelect, onSkip, delay = 0 }: Props) {
  const reduceMotion = useReducedMotion();

  return (
    <Animated.View
      entering={reduceMotion ? undefined : FadeIn.duration(300).delay(delay)}
      style={styles.row}
    >
      {options.map((option) => (
        <Pressable
          key={option}
          accessibilityRole="button"
          style={({ pressed }) => [styles.chip, pressed && styles.chipPressed]}
          onPress={() => {
            tap();
            onSelect(option);
          }}
        >
          <AppText variant="chip">{option}</AppText>
        </Pressable>
      ))}
      <Pressable
        accessibilityRole="button"
        accessibilityHint="Ментор перейдёт к следующему вопросу"
        hitSlop={8}
        style={({ pressed }) => [styles.skip, pressed && styles.skipPressed]}
        onPress={() => {
          tap();
          onSkip();
        }}
      >
        <AppText variant="chip" color={colors.textSecondary}>
          Пропустить
        </AppText>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    borderWidth: 1,
    borderColor: colors.accentLine,
    borderRadius: radius.full,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  chipPressed: {
    backgroundColor: colors.accentSoft,
  },
  skip: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: radius.full,
  },
  skipPressed: {
    backgroundColor: colors.surface,
  },
});
