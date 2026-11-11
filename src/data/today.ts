/**
 * Данные экрана «Сегодня». Пока это заглушка с примером из макета.
 * Позже их будет отдавать ментор на основе онбординга и записей.
 */

export type SphereKey = 'work' | 'relationships' | 'energy' | 'habits' | 'inner';

export type Sphere = {
  key: SphereKey;
  /** Полное название сферы. */
  name: string;
  /** Короткая подпись под шкалой на главной. */
  short: string;
  /** Оценка от 0 до 100. */
  value: number;
};

export type Today = {
  userName: string;
  /** Индекс состояния от 0 до 100. */
  index: number;
  spheres: Sphere[];
  /** Тезис дня: персональная мысль ментора. */
  thesis: string;
  /** Фокус дня словами пользователя. */
  focus: string;
  /** Наблюдение ментора. */
  noticed: string;
};

export const todayMock: Today = {
  userName: 'Алексей',
  index: 64,
  spheres: [
    { key: 'work', name: 'Дело', short: 'Дело', value: 80 },
    { key: 'relationships', name: 'Отношения', short: 'Отнош.', value: 45 },
    { key: 'energy', name: 'Тело и энергия', short: 'Энергия', value: 55 },
    { key: 'habits', name: 'Привычки', short: 'Привычки', value: 35 },
    { key: 'inner', name: 'Внутреннее состояние', short: 'Внутри', value: 70 },
  ],
  thesis:
    'Ты третий раз откладываешь разговор с партнёром. Сегодня не нужно всё решать — просто назначь время.',
  focus: 'Закрыть договор с поставщиком до обеда',
  noticed:
    'Вчера энергия упала после двух часов в телефоне перед сном. Это уже третий раз за неделю.',
};

export type Practice = {
  key: 'morning' | 'evening' | 'situation' | 'decision' | 'weekly';
  title: string;
  duration: string;
};

export const practices: Practice[] = [
  { key: 'morning', title: 'Утренний фокус', duration: '2 мин' },
  { key: 'evening', title: 'Вечерний разбор', duration: '5 мин' },
  { key: 'situation', title: 'Разбор ситуации', duration: 'диалог' },
  { key: 'decision', title: 'Дневник решений', duration: 'сверка через месяц' },
  { key: 'weekly', title: 'Еженедельный обзор', duration: '10 мин' },
];

/** Практика по времени суток: до 15:00 утренний фокус, позже вечерний разбор. */
export function practiceForNow(now = new Date()): Practice {
  return now.getHours() < 15 ? practices[0] : practices[1];
}

export function greetingForNow(now = new Date()): string {
  const hour = now.getHours();
  if (hour >= 5 && hour < 12) return 'Доброе утро';
  if (hour >= 12 && hour < 18) return 'Добрый день';
  if (hour >= 18 && hour < 23) return 'Добрый вечер';
  return 'Доброй ночи';
}

/** «Суббота, 24 октября». */
export function formatToday(now = new Date()): string {
  const text = now.toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' });
  return text.charAt(0).toUpperCase() + text.slice(1);
}
