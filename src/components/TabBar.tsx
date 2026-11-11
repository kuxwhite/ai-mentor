import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import type { FC } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { SvgProps } from 'react-native-svg';

import MicIcon from '@assets/icons/mic.svg';
import PathIcon from '@assets/icons/path.svg';
import TodayIcon from '@assets/icons/today.svg';
import { colors, layout, radius } from '@/theme';

import { AppText } from './AppText';

const icons: Record<string, FC<SvgProps>> = {
  index: TodayIcon,
  path: PathIcon,
};

/**
 * Таб-бар из трёх пунктов: «Сегодня», акцентная кнопка практики, «Путь».
 * Короткое нажатие на кнопку открывает практику по времени суток, долгое открывает выбор.
 */
export function TabBar({ state, descriptors, emitter, navigateToTab }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const paddingBottom = Math.max(layout.tabBarBottomPadding, insets.bottom);

  const haptic = (style: Haptics.ImpactFeedbackStyle) => {
    if (Platform.OS !== 'web') Haptics.impactAsync(style).catch(() => {});
  };

  const renderTab = (index: number) => {
    const route = state.routes[index];
    if (!route) return null;
    const focused = state.index === index;
    const color = focused ? colors.text : colors.textSecondary;
    const Icon = icons[route.name] ?? TodayIcon;
    const title = descriptors[route.key]?.options.title ?? route.name;

    return (
      <Pressable
        key={route.key}
        accessibilityRole="tab"
        accessibilityState={{ selected: focused }}
        accessibilityLabel={title}
        hitSlop={12}
        style={styles.tab}
        onPress={() => {
          const event = emitter.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) navigateToTab(route.key);
        }}
      >
        <Icon width={24} height={24} color={color} />
        <AppText variant="tab" color={color}>
          {title}
        </AppText>
      </Pressable>
    );
  };

  return (
    <LinearGradient
      colors={[colors.bgTransparent, colors.bg]}
      locations={[0, 0.45]}
      style={[styles.bar, { paddingBottom, height: layout.tabBarContent + paddingBottom }]}
      pointerEvents="box-none"
    >
      {renderTab(0)}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Начать практику"
        accessibilityHint="Долгое нажатие открывает выбор практики"
        style={({ pressed }) => [styles.practice, pressed && styles.practicePressed]}
        onPress={() => {
          haptic(Haptics.ImpactFeedbackStyle.Medium);
          router.push('/practice');
        }}
        onLongPress={() => {
          haptic(Haptics.ImpactFeedbackStyle.Heavy);
          router.push({ pathname: '/practice', params: { pick: '1' } });
        }}
      >
        <MicIcon width={26} height={26} color={colors.onAccent} />
      </Pressable>
      {renderTab(1)}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    paddingHorizontal: 48,
  },
  tab: {
    alignItems: 'center',
    gap: 4,
    minWidth: 48,
  },
  practice: {
    width: layout.practiceButton,
    height: layout.practiceButton,
    borderRadius: radius.full,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: `0 8px 24px ${colors.accentShadow}`,
  },
  practicePressed: {
    transform: [{ scale: 0.96 }],
    opacity: 0.92,
  },
});
