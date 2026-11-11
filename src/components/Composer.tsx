import * as Haptics from 'expo-haptics';
import { Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';

import CheckIcon from '@assets/icons/check.svg';
import CloseIcon from '@assets/icons/close.svg';
import MicIcon from '@assets/icons/mic.svg';
import SendIcon from '@assets/icons/send.svg';
import type { Dictation } from '@/voice/useDictation';
import { colors, layout, radius, spacing, typography } from '@/theme';

import { AppText } from './AppText';
import { VoiceArcs } from './VoiceArcs';

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  /** Запись закончена: передаём распознанный текст. */
  onVoiceDone: () => void;
  dictation: Dictation;
};

const haptic = (style: Haptics.ImpactFeedbackStyle) => {
  if (Platform.OS !== 'web') Haptics.impactAsync(style).catch(() => {});
};

/**
 * Нижняя панель диалога. В покое — поле для текста и кнопка микрофона
 * (или отправки, если что-то написано). Во время записи — «Отмена» и «Готово» с дугами громкости.
 */
export function Composer({ value, onChangeText, onSend, onVoiceDone, dictation }: Props) {
  const recording = dictation.status !== 'idle';
  const hasText = value.trim().length > 0;
  const voiceAvailable = dictation.mode !== 'none';

  if (recording) {
    return (
      <View style={styles.recordingBox}>
        <View style={styles.recording}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Отменить запись"
            style={({ pressed }) => [
              styles.roundButton,
              styles.secondary,
              styles.besideRecord,
              pressed && styles.pressed,
            ]}
            onPress={() => {
              haptic(Haptics.ImpactFeedbackStyle.Light);
              dictation.cancel();
            }}
          >
            <CloseIcon width={22} height={22} color={colors.textSecondary} />
          </Pressable>

          <VoiceArcs level={dictation.level} size={layout.recordButton}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Готово, отправить сказанное"
              disabled={dictation.status === 'stopping'}
              style={({ pressed }) => [styles.recordButton, pressed && styles.pressed]}
              onPress={() => {
                haptic(Haptics.ImpactFeedbackStyle.Medium);
                onVoiceDone();
              }}
            >
              <CheckIcon width={28} height={28} color={colors.onAccent} />
            </Pressable>
          </VoiceArcs>

          {/* Пустое место справа, чтобы кнопка «Готово» стояла ровно по центру. */}
          <View style={[styles.roundButton, styles.besideRecord]} />
        </View>
        <AppText variant="caption" color={colors.textSecondary}>
          {dictation.status === 'stopping' ? 'Дослушиваю…' : 'Нажми ✓, когда закончишь'}
        </AppText>
      </View>
    );
  }

  const showSend = hasText || !voiceAvailable;

  return (
    <View style={styles.idle}>
      <TextInput
        value={value}
        onChangeText={(text) => {
          if (dictation.error) dictation.clearError();
          onChangeText(text);
        }}
        placeholder="Ответь своими словами…"
        placeholderTextColor={colors.textSecondary}
        selectionColor={colors.accent}
        cursorColor={colors.accent}
        multiline
        style={styles.input}
        accessibilityLabel="Ответ ментору"
      />
      {showSend ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Отправить"
          disabled={!hasText}
          style={({ pressed }) => [
            styles.roundButton,
            styles.primary,
            !hasText && styles.disabled,
            pressed && styles.pressed,
          ]}
          onPress={() => {
            haptic(Haptics.ImpactFeedbackStyle.Light);
            onSend();
          }}
        >
          <SendIcon width={22} height={22} color={colors.onAccent} />
        </Pressable>
      ) : (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Ответить голосом"
          style={({ pressed }) => [styles.roundButton, styles.primary, pressed && styles.pressed]}
          onPress={() => {
            haptic(Haptics.ImpactFeedbackStyle.Medium);
            dictation.start();
          }}
        >
          <MicIcon width={22} height={22} color={colors.onAccent} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  idle: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    minHeight: layout.composerButton,
    maxHeight: 140,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.card,
    paddingHorizontal: 18,
    paddingTop: 13,
    paddingBottom: 13,
    color: colors.text,
    fontFamily: typography.body.fontFamily,
    fontSize: typography.body.fontSize,
  },
  roundButton: {
    width: layout.composerButton,
    height: layout.composerButton,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: colors.accent,
  },
  secondary: {
    backgroundColor: colors.surfaceRaised,
    borderColor: colors.border,
    borderWidth: 1,
  },
  disabled: {
    opacity: 0.4,
  },
  pressed: {
    transform: [{ scale: 0.95 }],
    opacity: 0.9,
  },
  recordingBox: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  recording: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  /** Опускает боковые кнопки так, чтобы их центр совпал с центром кнопки «Готово». */
  besideRecord: {
    marginBottom: (layout.recordButton - layout.composerButton) / 2,
  },
  recordButton: {
    width: layout.recordButton,
    height: layout.recordButton,
    borderRadius: radius.full,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: `0 8px 24px ${colors.accentShadow}`,
  },
});
