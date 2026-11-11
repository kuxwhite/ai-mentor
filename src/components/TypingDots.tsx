import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { colors, radius } from '@/theme';

function Dot({ index }: { index: number }) {
  const reduceMotion = useReducedMotion();
  const value = useSharedValue(0.3);

  useEffect(() => {
    if (reduceMotion) return;
    value.value = withDelay(index * 160, withRepeat(withTiming(1, { duration: 480 }), -1, true));
  }, [index, value, reduceMotion]);

  const style = useAnimatedStyle(() => ({ opacity: value.value }));
  return <Animated.View style={[styles.dot, style]} />;
}

/** Три точки, пока ментор «думает» над следующим вопросом. */
export function TypingDots() {
  return (
    <View style={styles.row} accessibilityLabel="Ментор печатает">
      <Dot index={0} />
      <Dot index={1} />
      <Dot index={2} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 6,
    paddingVertical: 10,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: radius.full,
    backgroundColor: colors.textSecondary,
  },
});
