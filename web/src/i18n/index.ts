import { AppLanguage } from '@sieacher/shared';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { de } from './de.ts';
import { en } from './en.ts';
import { pl, type Translation } from './pl.ts';

// Teaches i18next our keys, so a typo in t('...') is a type error.
declare module 'i18next' {
  interface CustomTypeOptions {
    resources: { translation: Translation };
  }
}

const resources = {
  pl: { translation: pl },
  en: { translation: en },
  de: { translation: de },
} satisfies Record<AppLanguage, { translation: Translation }>;

// Screen readers and the browser's spell check read <html lang>.
i18n.on('languageChanged', (language) => {
  document.documentElement.lang = language;
});

void i18n.use(initReactI18next).init({
  // Replaced on the App language screen, before any translated text is shown.
  lng: 'pl',
  supportedLngs: AppLanguage.options,
  resources,
  interpolation: { escapeValue: false },
});
