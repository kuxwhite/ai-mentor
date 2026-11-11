import { useCallback, useEffect, useRef, useState } from 'react';
import { useSharedValue, withTiming, type SharedValue } from 'react-native-reanimated';

import { getSpeechModule } from './speech';

export type DictationStatus = 'idle' | 'starting' | 'listening' | 'stopping';

/**
 * Откуда берётся текст:
 * - `native` — настоящее распознавание (сборка разработки, приложение из стора, веб);
 * - `demo` — в Expo Go при разработке проигрывается пример фразы, чтобы был виден интерфейс;
 * - `none` — голосового ввода нет, остаётся ручной.
 */
export type DictationMode = 'native' | 'demo' | 'none';

export type Dictation = {
  mode: DictationMode;
  status: DictationStatus;
  /** Весь распознанный текст: подтверждённые куски и последний промежуточный. */
  text: string;
  error: string | null;
  /** Громкость голоса от 0 до 1, для анимации дуг. */
  level: SharedValue<number>;
  start: () => Promise<void>;
  /** Останавливает запись и возвращает итоговый текст. */
  stop: () => Promise<string>;
  /** Останавливает запись и выбрасывает текст. */
  cancel: () => void;
  clearError: () => void;
};

const LANG = 'ru-RU';
const FINISH_TIMEOUT_MS = 2000;

const DEMO_PHRASE =
  'Последние недели я много работаю и почти не вижу близких. Хочу понять, как вернуть себе выходные и не чувствовать вину.';

const errorMessages: Record<string, string> = {
  'not-allowed': 'Нет доступа к микрофону. Его можно включить в настройках телефона.',
  'service-not-allowed': 'Распознавание речи выключено в настройках телефона.',
  'language-not-supported': 'На устройстве не установлено распознавание русского языка.',
  'no-speech': 'Не получилось расслышать. Попробуй ещё раз, чуть ближе к телефону.',
  'speech-timeout': 'Не получилось расслышать. Попробуй ещё раз, чуть ближе к телефону.',
  network: 'Для распознавания нужен интернет.',
  busy: 'Микрофон занят другим приложением.',
};

const joinText = (committed: string, interim: string) => `${committed} ${interim}`.replace(/\s+/g, ' ').trim();

/** Громкость от распознавателя приходит в диапазоне от -2 до 10, переводим в 0…1. */
const normalizeVolume = (value: number) => Math.min(1, Math.max(0, value / 10));

/** Голосовой ввод: запуск и остановка записи, текст по мере диктовки, громкость. */
export function useDictation(): Dictation {
  const speech = getSpeechModule();
  const mode: DictationMode = speech ? 'native' : __DEV__ ? 'demo' : 'none';

  const [status, setStatus] = useState<DictationStatus>('idle');
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const level = useSharedValue(0);

  const committedRef = useRef('');
  const interimRef = useRef('');
  const finishRef = useRef<((value: string) => void) | null>(null);
  const cancelledRef = useRef(false);
  const demoTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const publish = useCallback(() => {
    setText(joinText(committedRef.current, interimRef.current));
  }, []);

  const reset = useCallback(() => {
    committedRef.current = '';
    interimRef.current = '';
    setText('');
  }, []);

  const finish = useCallback(() => {
    const result = cancelledRef.current ? '' : joinText(committedRef.current, interimRef.current);
    setStatus('idle');
    level.value = withTiming(0, { duration: 200 });
    finishRef.current?.(result);
    finishRef.current = null;
  }, [level]);

  // Подписка на события распознавателя.
  useEffect(() => {
    if (!speech) return;

    const subscriptions = [
      speech.addListener('start', () => setStatus('listening')),
      speech.addListener('result', (event) => {
        const transcript = event.results[0]?.transcript ?? '';
        if (event.isFinal) {
          // На Android в непрерывном режиме каждый законченный кусок приходит отдельно,
          // поэтому подтверждённые куски склеиваем, а промежуточный показываем в конце.
          committedRef.current = joinText(committedRef.current, transcript);
          interimRef.current = '';
        } else {
          interimRef.current = transcript;
        }
        publish();
      }),
      speech.addListener('volumechange', (event) => {
        level.value = withTiming(normalizeVolume(event.value), { duration: 120 });
      }),
      speech.addListener('error', (event) => {
        if (event.error === 'aborted') return;
        setError(errorMessages[event.error] ?? 'Не получилось распознать речь. Попробуй ещё раз.');
      }),
      speech.addListener('end', finish),
    ];

    return () => subscriptions.forEach((subscription) => subscription.remove());
  }, [speech, publish, finish, level]);

  const stopDemo = useCallback(() => {
    if (demoTimerRef.current) clearInterval(demoTimerRef.current);
    demoTimerRef.current = null;
  }, []);

  // Если экран закрыли во время записи, останавливаем распознавание.
  useEffect(
    () => () => {
      stopDemo();
      speech?.abort();
    },
    [speech, stopDemo],
  );

  const startDemo = useCallback(() => {
    const words = DEMO_PHRASE.split(' ');
    let index = 0;
    setStatus('listening');
    demoTimerRef.current = setInterval(() => {
      if (index >= words.length) {
        level.value = withTiming(0.05, { duration: 200 });
        return;
      }
      index += 1;
      interimRef.current = words.slice(0, index).join(' ');
      publish();
      level.value = withTiming(0.35 + Math.random() * 0.6, { duration: 120 });
    }, 210);
  }, [level, publish]);

  const start = useCallback(async () => {
    if (status !== 'idle') return;
    setError(null);
    cancelledRef.current = false;
    reset();

    if (mode === 'none') {
      setError('Голосовой ввод недоступен в этой версии приложения. Можно написать текстом.');
      return;
    }
    if (mode === 'demo') {
      startDemo();
      return;
    }
    if (!speech) return;

    setStatus('starting');
    try {
      const permission = await speech.requestPermissionsAsync();
      if (!permission.granted) {
        setStatus('idle');
        setError(errorMessages['not-allowed']);
        return;
      }
      if (!speech.isRecognitionAvailable()) {
        setStatus('idle');
        setError('На этом устройстве нет распознавания речи. Можно написать текстом.');
        return;
      }
      speech.start({
        lang: LANG,
        interimResults: true,
        continuous: true,
        addsPunctuation: true,
        volumeChangeEventOptions: { enabled: true, intervalMillis: 100 },
      });
    } catch {
      setStatus('idle');
      setError('Не получилось включить микрофон. Попробуй ещё раз.');
    }
  }, [status, mode, speech, reset, startDemo]);

  const stop = useCallback(() => {
    if (status === 'idle') return Promise.resolve('');

    if (mode === 'demo') {
      stopDemo();
      const result = joinText(committedRef.current, interimRef.current);
      setStatus('idle');
      level.value = withTiming(0, { duration: 200 });
      return Promise.resolve(result);
    }

    setStatus('stopping');
    return new Promise<string>((resolve) => {
      finishRef.current = resolve;
      speech?.stop();
      // Если распознаватель не прислал «end», отдаём то, что успели услышать.
      setTimeout(() => {
        if (finishRef.current === resolve) finish();
      }, FINISH_TIMEOUT_MS);
    });
  }, [status, mode, speech, stopDemo, finish, level]);

  const cancel = useCallback(() => {
    cancelledRef.current = true;
    stopDemo();
    if (mode === 'native') speech?.abort();
    setStatus('idle');
    level.value = withTiming(0, { duration: 200 });
    reset();
  }, [mode, speech, stopDemo, reset, level]);

  const clearError = useCallback(() => setError(null), []);

  return { mode, status, text, error, level, start, stop, cancel, clearError };
}
