import { useEffect, useState } from 'react';
import { Platform, StyleSheet, View, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

import { colors } from '@/theme';

import { AppText } from './AppText';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const SIZE = 196;
const STROKE = 12;
const R = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * R;
const DURATION = 1200;

type Props = {
  /** Индекс состояния от 0 до 100. */
  value: number;
  label?: string;
};

/** Кольцо индекса состояния. При появлении дуга заполняется, а число досчитывается до значения. */
export function StateRing({ value, label = 'состояние' }: Props) {
  const clamped = Math.max(0, Math.min(100, value));
  const progress = useSharedValue(0);
  const shown = useCountUp(clamped, DURATION);

  useEffect(() => {
    progress.value = withTiming(clamped / 100, {
      duration: DURATION,
      easing: Easing.out(Easing.cubic),
    });
  }, [clamped, progress]);

  const arcProps = useAnimatedProps(() => ({
    strokeDashoffset: CIRCUMFERENCE * (1 - progress.value),
  }));

  return (
    <View
      style={styles.root}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={`Индекс состояния ${clamped} из 100`}
      accessibilityValue={{ min: 0, max: 100, now: clamped }}
    >
      <Svg width={SIZE} height={SIZE} style={StyleSheet.absoluteFill}>
        <Circle cx={SIZE / 2} cy={SIZE / 2} r={R} stroke={colors.surfaceRaised} strokeWidth={STROKE} fill="none" />
      </Svg>
      <View style={[StyleSheet.absoluteFill, glow]}>
        <Svg width={SIZE} height={SIZE}>
          <AnimatedCircle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={R}
            stroke={colors.accent}
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
            fill="none"
            rotation={-90}
            origin={`${SIZE / 2}, ${SIZE / 2}`}
            animatedProps={arcProps}
          />
        </Svg>
      </View>
      <AppText variant="display">{shown}</AppText>
      <AppText variant="caption" color={colors.textSecondary}>
        {label}
      </AppText>
    </View>
  );
}

/** Плавно досчитывает число от нуля до целевого значения. */
function useCountUp(target: number, duration: number) {
  const [shown, setShown] = useState(0);

  useEffect(() => {
    let frame = 0;
    const startedAt = Date.now();
    const tick = () => {
      const t = Math.min(1, (Date.now() - startedAt) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setShown(Math.round(target * eased));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);

  return shown;
}

/**
 * Свечение дуги. В макете это тень с размытием 18 и цветом акцента.
 * На iOS тень повторяет форму дуги, на Android и в вебе используется фильтр.
 */
const glow: ViewStyle =
  Platform.OS === 'ios'
    ? {
        shadowColor: colors.accent,
        shadowOpacity: 0.4,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 0 },
      }
    : { filter: `drop-shadow(0 0 18px ${colors.accentGlow})` };

const styles = StyleSheet.create({
  root: {
    width: SIZE,
    height: SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
