import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Conversation } from './api.ts';
import { Picker } from './Picker.tsx';

export const App = () => {
  const { t } = useTranslation();
  const [conversation, setConversation] = useState<Conversation>();

  if (!conversation) return <Picker onStart={setConversation} />;

  return (
    <main className="mx-auto max-w-xl p-6">
      <p>
        {t('conversation.placeholder', {
          targetLanguage: t(`targetLanguage.${conversation.targetLanguage}`),
          level: conversation.level,
        })}
      </p>
    </main>
  );
};
