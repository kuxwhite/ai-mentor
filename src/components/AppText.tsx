import { Text, type TextProps } from 'react-native';

import { colors, typography, type TypographyVariant } from '@/theme';

type Props = TextProps & {
  variant?: TypographyVariant;
  color?: string;
};

/** Единственный текстовый компонент приложения. Стиль задаётся вариантом из токенов. */
export function AppText({ variant = 'body', color = colors.text, style, ...rest }: Props) {
  return <Text {...rest} style={[typography[variant], { color }, style]} />;
}
