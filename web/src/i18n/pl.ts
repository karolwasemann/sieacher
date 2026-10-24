import type { Level, MISTAKE_CATEGORIES, TargetLanguage } from '@sieacher/shared';
import type { ErrorCode } from '../api.ts';

type MistakeCategory = (typeof MISTAKE_CATEGORIES)[TargetLanguage][number];

export const pl = {
  picker: {
    title: 'Porozmawiaj z Lulu',
    targetLanguage: 'Język',
    level: 'Poziom',
    start: 'Zacznij rozmowę',
    starting: 'Zaczynam…',
    failed: 'Nie udało się zacząć rozmowy. Czy serwer działa?',
  },
  targetLanguage: {
    en: 'angielski',
    de: 'niemiecki',
  } satisfies Record<TargetLanguage, string>,
  level: {
    A1: 'początkujący',
    A2: 'podstawowy',
    B1: 'średnio zaawansowany',
    B2: 'wyższy średnio zaawansowany',
    C1: 'zaawansowany',
    C2: 'biegły',
  } satisfies Record<Level, string>,
  // One flat list: categories both languages share (e.g. prepositions) get the same label.
  category: {
    tense: 'czas',
    articles: 'przedimki',
    prepositions: 'przyimki',
    'word-order': 'szyk zdania',
    agreement: 'zgodność',
    'word-choice': 'dobór słów',
    spelling: 'pisownia',
    case: 'przypadek',
    gender: 'rodzaj',
    'verb-position': 'pozycja czasownika',
    conjugation: 'odmiana czasownika',
    other: 'inne',
  } satisfies Record<MistakeCategory, string>,
  chat: {
    newConversation: 'Nowa rozmowa',
    placeholder: 'Napisz wiadomość… (Enter wysyła, Shift+Enter nowa linia)',
    send: 'Wyślij',
    typing: 'Lulu pisze…',
    resend: 'Wyślij ponownie',
    noMistakes: 'Bez błędów',
  },
  error: {
    'invalid-tutor-reply': 'Lulu odpowiedziała w złym formacie. Spróbuj ponownie.',
    'model-unavailable': 'Nie udało się połączyć z Lulu. Spróbuj ponownie.',
    'conversation-not-found':
      'Ta rozmowa już nie istnieje, bo serwer został uruchomiony ponownie. Zacznij nową.',
    network: 'Brak połączenia z serwerem.',
    unexpected: 'Coś poszło nie tak. Spróbuj ponownie.',
  } satisfies Record<ErrorCode, string>,
};

// The shape every other App language must match, key for key.
export type Translation = typeof pl;
