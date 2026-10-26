import { AppLanguage, Level, TargetLanguage } from '@sieacher/shared';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { createConversation, type Conversation } from './api.ts';
import { Choice } from './Choice.tsx';

export const Picker = ({ onStart }: { onStart: (conversation: Conversation) => void }) => {
  const { t, i18n } = useTranslation();
  const [targetLanguage, setTargetLanguage] = useState<TargetLanguage>();
  const [level, setLevel] = useState<Level>();
  const [status, setStatus] = useState<'idle' | 'starting' | 'failed'>('idle');

  const start = async () => {
    if (!targetLanguage || !level) return;
    setStatus('starting');
    try {
      // The App language is whatever i18n is showing, so UI and Lulu always agree.
      const appLanguage = AppLanguage.parse(i18n.language);
      // shortcut: a fixed Topic until the Topic screen
      const topic = 'everyday life';
      onStart(await createConversation({ appLanguage, targetLanguage, level, topic }));
    } catch (error) {
      console.error(error);
      setStatus('failed');
    }
  };

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
        disabled={!targetLanguage || !level || status === 'starting'}
        onClick={start}
        className="rounded-lg bg-pine px-4 py-3 font-medium text-surface hover:bg-foam focus-visible:outline-2 focus-visible:outline-iris disabled:bg-highlight-high disabled:text-muted"
      >
        {status === 'starting' ? t('picker.starting') : t('picker.start')}
      </button>
      {status === 'failed' && <p className="text-love">{t('picker.failed')}</p>}
    </main>
  );
};
