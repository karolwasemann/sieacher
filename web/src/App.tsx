import type { AppLanguage } from '@sieacher/shared';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Conversation } from './api.ts';
import { Chat } from './Chat.tsx';
import { LanguageScreen } from './LanguageScreen.tsx';
import { Picker, type ConversationSettings } from './Picker.tsx';
import { TopicScreen } from './TopicScreen.tsx';

export const App = () => {
  const { i18n } = useTranslation();
  // The language itself lives in i18n; this only says the Learner has picked it.
  const [languagePicked, setLanguagePicked] = useState(false);
  const [settings, setSettings] = useState<ConversationSettings>();
  const [conversation, setConversation] = useState<Conversation>();

  const pickLanguage = (language: AppLanguage) => {
    void i18n.changeLanguage(language);
    setLanguagePicked(true);
  };

  const end = () => {
    setConversation(undefined);
    setSettings(undefined);
  };

  if (!languagePicked) return <LanguageScreen onPick={pickLanguage} />;
  if (!settings) return <Picker onNext={setSettings} />;
  if (!conversation) return <TopicScreen settings={settings} onStart={setConversation} />;

  return <Chat key={conversation.id} conversation={conversation} onEnd={end} />;
};
