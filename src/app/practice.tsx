import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/AppText';
import { practiceForNow, practices, type Practice } from '@/data/today';
import { colors, radius, spacing } from '@/theme';

/**
 * Экран практики. Пока заглушка: показывает практику по времени суток
 * или список всех практик, если пришли по долгому нажатию.
 */
export default function PracticeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { pick } = useLocalSearchParams<{ pick?: string }>();
  const [chosen, setChosen] = useState<Practice | null>(pick ? null : practiceForNow());

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16 }]}>
      <View style={styles.top}>
        <AppText variant="overline" color={colors.accent}>
          {chosen ? chosen.title.toUpperCase() : 'ВЫБОР ПРАКТИКИ'}
        </AppText>
        <Pressable accessibilityRole="button" hitSlop={12} onPress={() => router.back()}>
          <AppText variant="caption" color={colors.textSecondary}>
            Закрыть
          </AppText>
        </Pressable>
      </View>

      {chosen ? (
        <View style={styles.body}>
          <AppText variant="mentor">С чего начнём? Расскажи, что сейчас занимает голову больше всего.</AppText>
          <AppText variant="caption" color={colors.textSecondary}>
            {chosen.duration} · диалог с голосом появится на следующем шаге
          </AppText>
        </View>
      ) : (
        <View style={styles.list}>
          {practices.map((practice) => (
            <Pressable
              key={practice.key}
              accessibilityRole="button"
              style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
              onPress={() => setChosen(practice)}
            >
              <AppText variant="body">{practice.title}</AppText>
              <AppText variant="caption" color={colors.textSecondary}>
                {practice.duration}
              </AppText>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: spacing.screen,
    gap: spacing.lg,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  body: {
    gap: spacing.md,
  },
  list: {
    gap: spacing.md,
  },
  row: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.card,
    paddingVertical: 18,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  rowPressed: {
    backgroundColor: colors.surfaceRaised,
  },
});
