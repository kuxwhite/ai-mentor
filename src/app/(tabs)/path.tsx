import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/AppText';
import { colors, spacing } from '@/theme';

/** Вкладка «Путь»: история и аналитика. Пока заглушка, экран ещё не нарисован. */
export default function PathScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 8 }]}>
      <AppText variant="title">Путь</AppText>
      <AppText variant="mentor" style={styles.note}>
        Здесь появятся твои недели, сферы, паттерны и все прошлые разговоры.
      </AppText>
      <AppText variant="caption" color={colors.textSecondary}>
        Экран в работе
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: spacing.screen,
    gap: spacing.md,
  },
  note: {
    marginTop: spacing.lg,
  },
});
