import { useMemo } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useReducedMotion, withDelay, withTiming } from 'react-native-reanimated';

import { colors, typography, type TypographyVariant } from '@/theme';

import { AppText } from './AppText';

const WORD_DURATION = 320;

/** Слово проявляется из прозрачности и чуть поднимается снизу. */
function wordEntering(delay: number) {
  return () => {
    'worklet';
    return {
      initialValues: { opacity: 0, transform: [{ translateY: 6 }] },
      animations: {
        opacity: withDelay(delay, withTiming(1, { duration: WORD_DURATION })),
        transform: [{ translateY: withDelay(delay, withTiming(0, { duration: WORD_DURATION })) }],
      },
    };
  };
}

const splitWords = (text: string) => text.split(/\s+/).filter(Boolean);

/** Сколько длится появление текста целиком: чтобы показать следующий элемент после него. */
export function revealDuration(text: string, stagger: number) {
  return splitWords(text).length * stagger + WORD_DURATION;
}

type Props = {
  text: string;
  variant?: TypographyVariant;
  color?: string;
  /** Задержка между словами, мс. При 0 каждое новое слово появляется сразу, как пришло. */
  stagger?: number;
  /** Задержка перед первым словом, мс. */
  delay?: number;
  style?: StyleProp<ViewStyle>;
};

/**
 * Текст, в котором слова проявляются по одному. Используется для реплик ментора
 * и для текста, который появляется по мере диктовки: уже показанные слова
 * не анимируются заново, плавно появляются только новые.
 */
export function AnimatedWords({ text, variant = 'body', color = colors.text, stagger = 0, delay = 0, style }: Props) {
  const reduceMotion = useReducedMotion();
  const words = useMemo(() => splitWords(text), [text]);
  const gap = typography[variant].fontSize * 0.26;

  return (
    <View style={[styles.row, style]} accessible accessibilityRole="text" accessibilityLabel={text}>
      {words.map((word, index) => (
        <Animated.View
          // Ключ по позиции: если распознаватель поправил слово, оно меняется на месте без повторной анимации.
          key={index}
          entering={reduceMotion ? undefined : wordEntering(delay + index * stagger)}
          style={{ marginRight: gap }}
        >
          <AppText variant={variant} color={color}>
            {word}
          </AppText>
        </Animated.View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
