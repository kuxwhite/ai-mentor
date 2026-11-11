import { useEffect, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

import { colors } from '@/theme';

const ARCS = [0, 1, 2];
/** Насколько каждая следующая дуга шире предыдущей (по радиусу), пт. */
const STEP = 13;

type ArcProps = {
  index: number;
  size: number;
  level: SharedValue<number>;
  breath: SharedValue<number>;
};

function Arc({ index, size, level, breath }: ArcProps) {
  const diameter = size + STEP * 2 * (index + 1);
  const top = STEP * ARCS.length + size / 2 - diameter / 2;

  const style = useAnimatedStyle(() => {
    // Внешние дуги откликаются на голос сильнее и тусклее внутренних.
    const voice = level.value * (0.1 + index * 0.06);
    return {
      opacity: Math.min(1, 0.18 + level.value * (0.9 - index * 0.22) + breath.value * 0.08),
      transform: [{ rotate: '-45deg' }, { scale: 1 + voice + breath.value * 0.025 }],
    };
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.arc,
        { width: diameter, height: diameter, borderRadius: diameter / 2, top, marginLeft: -diameter / 2 },
        style,
      ]}
    />
  );
}

type Props = {
  /** Громкость голоса от 0 до 1. */
  level: SharedValue<number>;
  /** Диаметр кнопки в центре. */
  size: number;
  children: ReactNode;
};

/** Дуги над кнопкой записи: «дышат» в тишине и расходятся, когда человек говорит. */
export function VoiceArcs({ level, size, children }: Props) {
  const reduceMotion = useReducedMotion();
  const breath = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) return;
    breath.value = withRepeat(withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, [breath, reduceMotion]);

  return (
    <View style={[styles.box, { width: size + STEP * 2 * ARCS.length, paddingTop: STEP * ARCS.length }]}>
      {ARCS.map((index) => (
        <Arc key={index} index={index} size={size} level={level} breath={breath} />
      ))}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    alignItems: 'center',
  },
  arc: {
    position: 'absolute',
    left: '50%',
    borderWidth: 2,
    // Видны только верхняя и правая четверти; поворот на −45° делает из них верхнюю полуокружность.
    borderTopColor: colors.accentLine,
    borderRightColor: colors.accentLine,
    borderBottomColor: 'transparent',
    borderLeftColor: 'transparent',
  },
});
