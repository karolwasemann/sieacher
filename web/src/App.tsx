import type { AppLanguage } from '@sieacher/shared';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Conversation } from './api.ts';
import { Chat } from './Chat.tsx';
import { LanguageScreen } from './LanguageScreen.tsx';
import { Picker } from './Picker.tsx';

export const App = () => {
  const { i18n } = useTranslation();
  // The language itself lives in i18n; this only says the Learner has picked it.
  const [languagePicked, setLanguagePicked] = useState(false);
  const [conversation, setConversation] = useState<Conversation>();

  const pickLanguage = (language: AppLanguage) => {
    void i18n.changeLanguage(language);
    setLanguagePicked(true);
  };

  if (!languagePicked) return <LanguageScreen onPick={pickLanguage} />;
  if (!conversation) return <Picker onStart={setConversation} />;

  return (
    <Chat
      key={conversation.id}
      conversation={conversation}
      onEnd={() => setConversation(undefined)}
    />
  );
};
