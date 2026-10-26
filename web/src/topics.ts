import type { AppLanguage } from '@sieacher/shared';

// Content, not UI strings, so they live here and not in i18n.
export const TOPICS = [
  { en: 'Your family', de: 'Deine Familie', pl: 'Twoja rodzina' },
  { en: 'Your favourite food', de: 'Dein Lieblingsessen', pl: 'Twoje ulubione jedzenie' },
  { en: 'Travelling', de: 'Reisen', pl: 'Podróże' },
  { en: 'Hobbies', de: 'Hobbys', pl: 'Hobby' },
  { en: 'Work or school', de: 'Arbeit oder Schule', pl: 'Praca lub szkoła' },
  { en: 'Weekend plans', de: 'Pläne fürs Wochenende', pl: 'Plany na weekend' },
  { en: 'Films and series', de: 'Filme und Serien', pl: 'Filmy i seriale' },
  { en: 'Music', de: 'Musik', pl: 'Muzyka' },
  { en: 'Sport', de: 'Sport', pl: 'Sport' },
  { en: 'Your home', de: 'Dein Zuhause', pl: 'Twój dom' },
  { en: 'Shopping', de: 'Einkaufen', pl: 'Zakupy' },
  { en: 'Weather and seasons', de: 'Wetter und Jahreszeiten', pl: 'Pogoda i pory roku' },
  { en: 'Holidays and celebrations', de: 'Feiertage und Feste', pl: 'Święta i uroczystości' },
  { en: 'Childhood memories', de: 'Kindheitserinnerungen', pl: 'Wspomnienia z dzieciństwa' },
  { en: 'Technology', de: 'Technik', pl: 'Technologia' },
  { en: 'Health', de: 'Gesundheit', pl: 'Zdrowie' },
  { en: 'Animals and nature', de: 'Tiere und Natur', pl: 'Zwierzęta i przyroda' },
  { en: 'City or countryside', de: 'Stadt oder Land', pl: 'Miasto czy wieś' },
  { en: 'Books', de: 'Bücher', pl: 'Książki' },
  { en: 'Your dream job', de: 'Dein Traumberuf', pl: 'Twoja wymarzona praca' },
] as const satisfies readonly Record<AppLanguage, string>[];

export type Topic = (typeof TOPICS)[number];

export const pickTopics = (count: number, random = Math.random): Topic[] => {
  const topics = [...TOPICS];
  for (let i = 0; i < count; i++) {
    const j = i + Math.floor(random() * (topics.length - i));
    [topics[i], topics[j]] = [topics[j]!, topics[i]!];
  }
  return topics.slice(0, count);
};
