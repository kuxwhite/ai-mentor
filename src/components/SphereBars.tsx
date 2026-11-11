import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import type { Sphere } from '@/data/today';
import { colors, radius } from '@/theme';

import { AppText } from './AppText';

const BAR_WIDTH = 44;

/** Пять шкал сфер жизни под кольцом. */
export function SphereBars({ spheres }: { spheres: Sphere[] }) {
  return (
    <View style={styles.row}>
      {spheres.map((sphere, index) => (
        <SphereBar key={sphere.key} sphere={sphere} index={index} />
      ))}
    </View>
  );
}

function SphereBar({ sphere, index }: { sphere: Sphere; index: number }) {
  const fill = useSharedValue(0);

  useEffect(() => {
    fill.value = withDelay(
      300 + index * 80,
      withTiming(sphere.value / 100, { duration: 700, easing: Easing.out(Easing.cubic) }),
    );
  }, [fill, index, sphere.value]);

  const fillStyle = useAnimatedStyle(() => ({ width: BAR_WIDTH * fill.value }));

  return (
    <View
      style={styles.item}
      accessible
      accessibilityLabel={`${sphere.name}: ${sphere.value} из 100`}
    >
      <View style={styles.track}>
        <Animated.View style={[styles.fill, fillStyle]} />
      </View>
      <AppText variant="micro" color={colors.textSecondary} numberOfLines={1}>
        {sphere.short}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 14,
  },
  item: {
    alignItems: 'center',
    gap: 6,
  },
  track: {
    width: BAR_WIDTH,
    height: 4,
    borderRadius: radius.bar,
    backgroundColor: colors.surfaceRaised,
    overflow: 'hidden',
  },
  fill: {
    height: 4,
    borderRadius: radius.bar,
    backgroundColor: colors.accent,
  },
});
