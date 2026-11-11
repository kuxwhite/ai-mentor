import { StyleSheet, View, type ViewProps } from 'react-native';

import { colors, radius } from '@/theme';

import { AppText } from './AppText';

type Props = ViewProps & {
  label: string;
  body: string;
};

/** Карточка с заголовком и текстом: «Фокус дня», «Что заметил ментор». */
export function Card({ label, body, style, ...rest }: Props) {
  return (
    <View {...rest} style={[styles.card, style]}>
      <AppText variant="cardLabel" color={colors.textSecondary}>
        {label.toUpperCase()}
      </AppText>
      <AppText variant="body">{body}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.card,
    // В Figma обводка внутренняя, поэтому отступы уменьшены на толщину рамки.
    paddingTop: 17,
    paddingBottom: 19,
    paddingHorizontal: 19,
    gap: 8,
  },
});
