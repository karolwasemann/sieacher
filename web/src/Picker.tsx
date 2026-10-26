import { Level, TargetLanguage } from '@sieacher/shared';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Conversation } from './api.ts';
import { Choice } from './Choice.tsx';

export type ConversationSettings = Pick<Conversation, 'targetLanguage' | 'level'>;

export const Picker = ({ onNext }: { onNext: (settings: ConversationSettings) => void }) => {
  const { t, i18n } = useTranslation();
  const [targetLanguage, setTargetLanguage] = useState<TargetLanguage>();
  const [level, setLevel] = useState<Level>();

  return (
    <main className="mx-auto flex max-w-xl flex-col gap-8 p-6">
      <h1 className="text-2xl font-semibold">{t('picker.title')}</h1>

      <section className="flex flex-col gap-3">
        <h2 className="font-medium text-subtle">{t('picker.targetLanguage')}</h2>
        <div className="grid grid-cols-2 gap-2">
          {TargetLanguage.options
            .filter((option) => option !== i18n.language)
            .map((option) => (
              <Choice
                key={option}
                selected={option === targetLanguage}
                onClick={() => setTargetLanguage(option)}
              >
                {t(`targetLanguage.${option}`)}
              </Choice>
            ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-medium text-subtle">{t('picker.level')}</h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {Level.options.map((option) => (
            <Choice key={option} selected={option === level} onClick={() => setLevel(option)}>
              <span className="font-semibold">{option}</span> — {t(`level.${option}`)}
            </Choice>
          ))}
        </div>
      </section>

      <button
        type="button"
        disabled={!targetLanguage || !level}
        onClick={() => targetLanguage && level && onNext({ targetLanguage, level })}
        className="rounded-lg bg-pine px-4 py-3 font-medium text-surface hover:bg-foam focus-visible:outline-2 focus-visible:outline-iris disabled:bg-highlight-high disabled:text-muted"
      >
        {t('picker.next')}
      </button>
    </main>
  );
};
