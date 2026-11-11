import { requireOptionalNativeModule } from 'expo';
import { Platform } from 'react-native';

type SpeechModule = typeof import('expo-speech-recognition').ExpoSpeechRecognitionModule;

let cached: SpeechModule | null | undefined;

/**
 * Модуль распознавания речи или `null`, если его нет в сборке.
 *
 * Пакет `expo-speech-recognition` содержит нативный код, которого нет в Expo Go:
 * его прямой импорт роняет приложение. Поэтому сначала проверяем, что нативная
 * часть есть, и только потом подключаем пакет. В вебе используется Web Speech API.
 */
export function getSpeechModule(): SpeechModule | null {
  if (cached !== undefined) return cached;

  const hasNative = Platform.OS === 'web' || requireOptionalNativeModule('ExpoSpeechRecognition') != null;
  if (!hasNative) {
    cached = null;
    return cached;
  }

  try {
    cached = (require('expo-speech-recognition') as typeof import('expo-speech-recognition'))
      .ExpoSpeechRecognitionModule;
  } catch {
    cached = null;
  }
  return cached;
}
