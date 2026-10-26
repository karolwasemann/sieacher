import { AppLanguage } from '@sieacher/shared';
import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { createConversation, type Conversation } from './api.ts';
import { Choice } from './Choice.tsx';
import type { ConversationSettings } from './Picker.tsx';
import { pickTopics } from './topics.ts';

export const TopicScreen = ({
  settings,
  onStart,
}: {
  settings: ConversationSettings;
  onStart: (conversation: Conversation) => void;
}) => {
  const { t, i18n } = useTranslation();
  // The App language is whatever i18n is showing, so UI and Lulu always agree.
  const appLanguage = AppLanguage.parse(i18n.language);
  // Lazy initializer: pick once on mount, not on every render.
  const [suggestions, setSuggestions] = useState(() => pickTopics(6));
  const [topic, setTopic] = useState('');
  const [status, setStatus] = useState<'idle' | 'starting' | 'failed'>('idle');

  const start = async (event: FormEvent) => {
    event.preventDefault();
    setStatus('starting');
    try {
      onStart(await createConversation({ appLanguage, ...settings, topic: topic.trim() }));
    } catch (error) {
      console.error(error);
      setStatus('failed');
    }
  };

  return (
    <main className="mx-auto flex max-w-xl flex-col gap-8 p-6">
      <h1 className="text-2xl font-semibold">{t('topic.title')}</h1>

      <section className="flex flex-col gap-3">
        <h2 className="font-medium text-subtle">{t('topic.suggestions')}</h2>
        <div className="grid grid-cols-2 gap-2">
          {suggestions.map((suggestion) => (
            <Choice
              key={suggestion.en}
              selected={suggestion[appLanguage] === topic}
              onClick={() => setTopic(suggestion[appLanguage])}
            >
              {suggestion[appLanguage]}
            </Choice>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setSuggestions(pickTopics(6))}
          className="self-start text-pine hover:underline"
        >
          ↻ {t('topic.suggestOthers')}
        </button>
      </section>

      <form onSubmit={start} className="flex flex-col gap-3">
        <label htmlFor="topic" className="font-medium text-subtle">
          {t('topic.own')}
        </label>
        <input
          id="topic"
          value={topic}
          onChange={(event) => setTopic(event.target.value)}
          maxLength={120}
          className="rounded-lg border border-highlight-med bg-surface px-3 py-2 focus-visible:outline-2 focus-visible:outline-iris"
        />
        <button
          type="submit"
          disabled={!topic.trim() || status === 'starting'}
          className="rounded-lg bg-pine px-4 py-3 font-medium text-surface hover:bg-foam focus-visible:outline-2 focus-visible:outline-iris disabled:bg-highlight-high disabled:text-muted"
        >
          {status === 'starting' ? t('topic.starting') : t('topic.start')}
        </button>
      </form>
      {status === 'failed' && <p className="text-love">{t('topic.failed')}</p>}
    </main>
  );
};
