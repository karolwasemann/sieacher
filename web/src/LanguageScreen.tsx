import { AppLanguage } from '@sieacher/shared';
import { Choice } from './Choice.tsx';

// Each language in its own name: no App language is picked yet, so no i18n here.
const NAMES = {
  pl: 'Polski',
  en: 'English',
  de: 'Deutsch',
} satisfies Record<AppLanguage, string>;

const PROMPTS = {
  pl: 'Wybierz swój język',
  en: 'Choose your language',
  de: 'Wähle deine Sprache',
} satisfies Record<AppLanguage, string>;

export const LanguageScreen = ({ onPick }: { onPick: (language: AppLanguage) => void }) => (
  <main className="mx-auto flex max-w-xl flex-col gap-8 p-6">
    <div className="flex flex-col gap-1">
      <h1 className="text-2xl font-semibold">Sieacher</h1>
      <p className="text-subtle">
        {AppLanguage.options.map((language, i) => (
          <span key={language}>
            {i > 0 && ' · '}
            <span lang={language}>{PROMPTS[language]}</span>
          </span>
        ))}
      </p>
    </div>
    <div className="grid grid-cols-3 gap-2">
      {AppLanguage.options.map((language) => (
        <Choice key={language} onClick={() => onPick(language)}>
          <span lang={language}>{NAMES[language]}</span>
        </Choice>
      ))}
    </div>
  </main>
);
