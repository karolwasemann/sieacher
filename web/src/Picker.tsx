import { Level, TargetLanguage } from '@sieacher/shared';
import { useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { createConversation, type Conversation } from './api.ts';

const Choice = ({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
}) => (
  <button
    type="button"
    aria-pressed={selected}
    onClick={onClick}
    className={`rounded-lg border px-4 py-2 text-left focus-visible:outline-2 focus-visible:outline-iris ${
      selected
        ? 'border-pine bg-overlay text-pine'
        : 'border-highlight-med bg-surface hover:bg-highlight-low'
    }`}
  >
    {children}
  </button>
);

export const Picker = ({ onStart }: { onStart: (conversation: Conversation) => void }) => {
  const { t } = useTranslation();
  const [targetLanguage, setTargetLanguage] = useState<TargetLanguage>();
  const [level, setLevel] = useState<Level>();
  const [status, setStatus] = useState<'idle' | 'starting' | 'failed'>('idle');

  const start = async () => {
    if (!targetLanguage || !level) return;
    setStatus('starting');
    try {
      // shortcut: always Polish, until the App language screen in M2 step 4.
      onStart(await createConversation({ appLanguage: 'pl', targetLanguage, level }));
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
          {TargetLanguage.options.map((option) => (
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
