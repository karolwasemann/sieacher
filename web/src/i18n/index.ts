import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { pl } from './pl.ts';

// Teaches i18next our keys, so a typo in t('...') is a type error.
declare module 'i18next' {
  interface CustomTypeOptions {
    resources: { translation: typeof pl };
  }
}

void i18n.use(initReactI18next).init({
  lng: 'pl',
  resources: { pl: { translation: pl } },
  interpolation: { escapeValue: false },
});
