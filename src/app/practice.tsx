import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View, type ScrollViewInstance } from 'react-native';
import Animated, { FadeIn, useAnimatedStyle, useReducedMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AnimatedWords, revealDuration } from '@/components/AnimatedWords';
import { AppText } from '@/components/AppText';
import { ChoiceChips } from '@/components/ChoiceChips';
import { Composer } from '@/components/Composer';
import { RecordingPlate } from '@/components/RecordingPlate';
import { TypingDots } from '@/components/TypingDots';
import { scriptFor } from '@/data/dialog';
import { practiceForNow, practices, type Practice } from '@/data/today';
import { useKeyboardInset } from '@/hooks/useKeyboardInset';
import { useDictation } from '@/voice/useDictation';
import { colors, radius, spacing } from '@/theme';

/** Пауза между словами, когда «печатает» ментор, мс. */
const MENTOR_STAGGER = 45;
/** Сколько ментор «думает» перед следующим вопросом, мс. */
const THINK_MS = 900;

type Message =
  | { id: string; kind: 'mentor'; text: string; delay: number; createdAt: number; step?: number }
  | { id: string; kind: 'hint'; text: string; delay: number }
  | { id: string; kind: 'user'; text: string }
  | { id: string; kind: 'skip' };

type Phase = 'talk' | 'thinking' | 'done';

/**
 * Экран практики. Ментор здоровается, объясняет, как отвечать, и задаёт вопросы.
 * Ответить можно голосом (текст появляется по мере речи), текстом или вариантом-чипом.
 * Если пришли долгим нажатием, сначала показывается выбор практики.
 */
export default function PracticeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { pick } = useLocalSearchParams<{ pick?: string }>();
  const [chosen, setChosen] = useState<Practice | null>(pick ? null : practiceForNow());

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 16 }]}>
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
        <Dialog key={chosen.key} practice={chosen} onFinish={() => router.back()} />
      ) : (
        <View style={[styles.list, { paddingBottom: insets.bottom + 16 }]}>
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

function Dialog({ practice, onFinish }: { practice: Practice; onFinish: () => void }) {
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const script = useMemo(() => scriptFor(practice), [practice]);
  const dictation = useDictation();
  const keyboard = useKeyboardInset();
  const scrollRef = useRef<ScrollViewInstance>(null);

  // Приветствие, подсказка новичку и первый вопрос появляются друг за другом.
  const [messages, setMessages] = useState<Message[]>(() => {
    const now = Date.now();
    const greetingTime = revealDuration(script.greeting, MENTOR_STAGGER);
    return [
      { id: 'greeting', kind: 'mentor', text: script.greeting, delay: 0, createdAt: now },
      { id: 'hint', kind: 'hint', text: script.hint, delay: greetingTime },
      { id: 'step-0', kind: 'mentor', text: script.steps[0].text, delay: greetingTime + 600, createdAt: now, step: 0 },
    ];
  });
  const [step, setStep] = useState(0);
  const [phase, setPhase] = useState<Phase>('talk');
  const [draft, setDraft] = useState('');

  const phaseRef = useRef(phase);
  phaseRef.current = phase;
  const idRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  const nextId = (prefix: string) => `${prefix}-${++idRef.current}`;

  /** Ментор «думает» и задаёт следующий вопрос, а после последнего прощается. */
  const advance = useCallback(() => {
    setPhase('thinking');
    timerRef.current = setTimeout(() => {
      const next = step + 1;
      const createdAt = Date.now();
      if (next < script.steps.length) {
        setMessages((list) => [
          ...list,
          { id: nextId('mentor'), kind: 'mentor', text: script.steps[next].text, delay: 0, createdAt, step: next },
        ]);
        setStep(next);
        setPhase('talk');
      } else {
        setMessages((list) => [...list, { id: nextId('mentor'), kind: 'mentor', text: script.closing, delay: 0, createdAt }]);
        setPhase('done');
      }
    }, THINK_MS);
  }, [step, script]);

  const answer = (text: string) => {
    const value = text.trim();
    if (!value || phaseRef.current !== 'talk') return false;
    setMessages((list) => [...list, { id: nextId('user'), kind: 'user', text: value }]);
    advance();
    return true;
  };

  const skip = () => {
    if (phaseRef.current !== 'talk') return;
    setMessages((list) => [...list, { id: nextId('skip'), kind: 'skip' }]);
    advance();
  };

  const send = () => {
    if (answer(draft)) setDraft('');
  };

  const finishVoice = async () => {
    const text = await dictation.stop();
    // Если ментор ещё не задал вопрос, сказанное не теряется, а остаётся в поле ввода.
    if (text && !answer(text)) setDraft(text);
  };

  const current = script.steps[step];
  const lastMessage = messages[messages.length - 1];
  const showChoices =
    phase === 'talk' && dictation.status === 'idle' && lastMessage?.kind === 'mentor' && lastMessage.step === step;
  // Чипы появляются, когда ментор договорил вопрос. Если они уже показывались (например,
  // после отменённой записи), задержки нет.
  const choicesDelay =
    lastMessage?.kind === 'mentor'
      ? Math.max(0, lastMessage.createdAt + lastMessage.delay + revealDuration(lastMessage.text, MENTOR_STAGGER) - Date.now())
      : 0;

  const bottomStyle = useAnimatedStyle(() => ({
    paddingBottom: Math.max(insets.bottom + 12, keyboard.value + 12),
  }));

  return (
    <View style={styles.dialog}>
      <ScrollView
        ref={scrollRef}
        style={styles.feed}
        contentContainerStyle={styles.feedContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map((message) => {
          switch (message.kind) {
            case 'mentor':
              return (
                <AnimatedWords
                  key={message.id}
                  text={message.text}
                  variant="mentor"
                  stagger={MENTOR_STAGGER}
                  delay={message.delay}
                />
              );
            case 'hint':
              return (
                <Animated.View
                  key={message.id}
                  entering={reduceMotion ? undefined : FadeIn.duration(400).delay(message.delay)}
                >
                  <AppText variant="body" color={colors.textSecondary}>
                    {message.text}
                  </AppText>
                </Animated.View>
              );
            case 'user':
              return (
                <Animated.View
                  key={message.id}
                  entering={reduceMotion ? undefined : FadeIn.duration(250)}
                  style={styles.userBubble}
                >
                  <AppText variant="body">{message.text}</AppText>
                </Animated.View>
              );
            case 'skip':
              return (
                <AppText key={message.id} variant="caption" color={colors.textSecondary} style={styles.skipped}>
                  Пропущено
                </AppText>
              );
          }
        })}

        {showChoices && (
          <ChoiceChips options={current.options ?? []} onSelect={answer} onSkip={skip} delay={choicesDelay} />
        )}
        {phase === 'thinking' && <TypingDots />}
        {dictation.status !== 'idle' && (
          <RecordingPlate text={dictation.text} status={dictation.status} mode={dictation.mode} />
        )}
      </ScrollView>

      <Animated.View style={[styles.bottom, bottomStyle]}>
        {dictation.error && (
          <Pressable accessibilityRole="button" accessibilityHint="Скрыть сообщение" onPress={dictation.clearError}>
            <AppText variant="caption" color={colors.danger} style={styles.error}>
              {dictation.error}
            </AppText>
          </Pressable>
        )}
        {phase === 'done' ? (
          <Pressable
            accessibilityRole="button"
            style={({ pressed }) => [styles.finish, pressed && styles.finishPressed]}
            onPress={onFinish}
          >
            <AppText variant="chip" color={colors.onAccent}>
              Завершить
            </AppText>
          </Pressable>
        ) : (
          <Composer
            value={draft}
            onChangeText={setDraft}
            onSend={send}
            onVoiceDone={finishVoice}
            dictation={dictation}
          />
        )}
      </Animated.View>
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
  dialog: {
    flex: 1,
  },
  feed: {
    flex: 1,
  },
  feedContent: {
    paddingBottom: spacing.lg,
    gap: spacing.lg,
  },
  userBubble: {
    alignSelf: 'flex-end',
    maxWidth: '85%',
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.bubble,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  skipped: {
    alignSelf: 'flex-end',
  },
  bottom: {
    paddingTop: spacing.sm,
    gap: spacing.sm,
  },
  error: {
    textAlign: 'center',
  },
  finish: {
    height: 52,
    borderRadius: radius.full,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  finishPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
});
