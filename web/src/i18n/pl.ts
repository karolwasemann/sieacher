import type { Level, TargetLanguage } from '@sieacher/shared';

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
  // shortcut: placeholder screen, replaced by the chat in step 8
  conversation: {
    placeholder: 'Język: {{targetLanguage}}, poziom: {{level}}. Czat pojawi się w kroku 8.',
  },
};
