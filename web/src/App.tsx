import { useState } from 'react';
import type { Conversation } from './api.ts';
import { Chat } from './Chat.tsx';
import { Picker } from './Picker.tsx';

export const App = () => {
  const [conversation, setConversation] = useState<Conversation>();

  if (!conversation) return <Picker onStart={setConversation} />;

  return (
    <Chat
      key={conversation.id}
      conversation={conversation}
      onEnd={() => setConversation(undefined)}
    />
  );
};
