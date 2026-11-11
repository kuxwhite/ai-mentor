import type { TextStyle } from 'react-native';

/**
 * Токены дизайн-системы. Значения цветов совпадают с переменными в Figma
 * (color/bg, color/surface и т. д.). Менять цвета нужно здесь, а не в компонентах.
 */
export const colors = {
  bg: '#14120f',
  surface: '#201d19',
  surfaceRaised: '#2b2721',
  border: 'rgba(255,255,255,0.07)',
  text: '#f2ede4',
  textSecondary: '#9c948a',
  accent: '#e8995f',
  onAccent: '#19120c',
  /** Прозрачный вариант фона, нужен для градиента под таб-баром. */
  bgTransparent: 'rgba(20,18,15,0)',
  accentGlow: 'rgba(232,153,94,0.4)',
  accentShadow: 'rgba(232,153,94,0.35)',
  /** Обводка и фон чипов-вариантов ответа, дуги записи голоса. */
  accentLine: 'rgba(232,153,94,0.45)',
  accentSoft: 'rgba(232,153,94,0.12)',
  /** Ошибки: нет доступа к микрофону, не удалось распознать речь. */
  danger: '#e07a6a',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 20,
  /** Боковые поля экрана. */
  screen: 24,
} as const;

export const radius = {
  bar: 2,
  card: 22,
  /** Ответ пользователя в диалоге. */
  bubble: 18,
  full: 999,
} as const;

/** Семейства шрифтов. Onest отвечает за интерфейс, Literata за голос ментора. */
export const fonts = {
  ui: 'Onest_400Regular',
  uiMedium: 'Onest_500Medium',
  uiSemiBold: 'Onest_600SemiBold',
  mentor: 'Literata_400Regular',
} as const;

export const typography = {
  /** Число индекса состояния в кольце. */
  display: { fontFamily: fonts.uiSemiBold, fontSize: 58 },
  /** Приветствие в шапке. */
  title: { fontFamily: fonts.uiSemiBold, fontSize: 22 },
  /** Слова ментора: тезис дня, реплики в диалоге. */
  mentor: { fontFamily: fonts.mentor, fontSize: 23, lineHeight: 23 * 1.32 },
  body: { fontFamily: fonts.ui, fontSize: 16, lineHeight: 16 * 1.4 },
  caption: { fontFamily: fonts.ui, fontSize: 13 },
  /** Текст, который появляется по мере диктовки. */
  dictation: { fontFamily: fonts.ui, fontSize: 18, lineHeight: 18 * 1.45 },
  /** Подписи чипов и кнопок в диалоге. */
  chip: { fontFamily: fonts.uiMedium, fontSize: 14 },
  micro: { fontFamily: fonts.ui, fontSize: 11 },
  tab: { fontFamily: fonts.uiMedium, fontSize: 11 },
  /** Надзаголовок секции: «ТЕЗИС ДНЯ». */
  overline: { fontFamily: fonts.uiSemiBold, fontSize: 11, letterSpacing: 1.1 },
  /** Заголовок карточки: «ФОКУС ДНЯ». */
  cardLabel: { fontFamily: fonts.uiSemiBold, fontSize: 11, letterSpacing: 0.88 },
} as const satisfies Record<string, TextStyle>;

export type TypographyVariant = keyof typeof typography;

export const layout = {
  /** Высота таб-бара без учёта нижнего отступа под индикатор «домой». */
  tabBarContent: 70,
  tabBarBottomPadding: 30,
  practiceButton: 64,
  /** Круглые кнопки в поле ввода диалога: микрофон, отправка, отмена записи. */
  composerButton: 48,
  /** Кнопка «Готово» во время записи голоса, вокруг неё расходятся дуги. */
  recordButton: 64,
} as const;
