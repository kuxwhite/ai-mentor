import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ProfileIcon from '@assets/icons/profile.svg';
import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { SphereBars } from '@/components/SphereBars';
import { StateRing } from '@/components/StateRing';
import { formatToday, greetingForNow, todayMock } from '@/data/today';
import { colors, layout, radius, spacing } from '@/theme';

/** Главная: индекс состояния, сферы, тезис дня, фокус и наблюдение ментора. */
export default function TodayScreen() {
  const insets = useSafeAreaInsets();
  const today = todayMock;
  const bottomSpace = layout.tabBarContent + Math.max(layout.tabBarBottomPadding, insets.bottom) + 16;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ paddingTop: insets.top, paddingBottom: bottomSpace }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View style={styles.greeting}>
          <AppText variant="caption" color={colors.textSecondary}>
            {formatToday()}
          </AppText>
          <AppText variant="title" numberOfLines={1}>
            {greetingForNow()}, {today.userName}
          </AppText>
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel="Профиль" hitSlop={8} style={styles.profile}>
          <ProfileIcon width={20} height={20} color={colors.text} />
        </Pressable>
      </View>

      <View style={styles.hero}>
        <StateRing value={today.index} />
        <SphereBars spheres={today.spheres} />
      </View>

      <View style={styles.thesis}>
        <AppText variant="overline" color={colors.accent}>
          ТЕЗИС ДНЯ
        </AppText>
        <AppText variant="mentor">{today.thesis}</AppText>
      </View>

      <View style={styles.cards}>
        <Card label="Фокус дня" body={today.focus} />
        <Card label="Что заметил ментор" body={today.noticed} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.screen,
    paddingTop: 8,
    paddingBottom: 4,
    gap: spacing.md,
  },
  greeting: {
    flexShrink: 1,
    gap: 2,
  },
  profile: {
    width: 42,
    height: 42,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceRaised,
    borderColor: colors.border,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hero: {
    alignItems: 'center',
    paddingTop: 14,
    paddingBottom: 10,
    gap: 18,
  },
  thesis: {
    paddingHorizontal: spacing.screen,
    paddingTop: 4,
    paddingBottom: 22,
    gap: 10,
  },
  cards: {
    paddingHorizontal: spacing.screen,
    gap: spacing.md,
  },
});
