import { useEffect } from 'react';
import { Keyboard, Platform } from 'react-native';
import { Easing, useSharedValue, withTiming, type SharedValue } from 'react-native-reanimated';

/**
 * Высота клавиатуры для отступа снизу, с плавной анимацией.
 *
 * Не используем `KeyboardAvoidingView`: в модальном листе iOS он ошибается
 * на высоту отступа листа сверху. Лист и клавиатура оба прижаты к низу экрана,
 * поэтому отступ ровно равен высоте клавиатуры.
 */
export function useKeyboardInset(): SharedValue<number> {
  const inset = useSharedValue(0);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const timing = (duration?: number) => ({
      duration: duration && duration > 0 ? duration : 250,
      easing: Easing.out(Easing.cubic),
    });

    const show = Keyboard.addListener(showEvent, (event) => {
      inset.value = withTiming(event.endCoordinates.height, timing(event.duration));
    });
    const hide = Keyboard.addListener(hideEvent, (event) => {
      inset.value = withTiming(0, timing(event.duration));
    });

    return () => {
      show.remove();
      hide.remove();
    };
  }, [inset]);

  return inset;
}
