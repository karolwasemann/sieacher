import type { Level, TargetLanguage } from '@sieacher/shared';

export type Conversation = { id: string; targetLanguage: TargetLanguage; level: Level };

export const createConversation = async (settings: Omit<Conversation, 'id'>) => {
  const response = await fetch('/api/conversations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
  });
  if (!response.ok) throw new Error(`POST /api/conversations failed: ${response.status}`);

  const { id } = (await response.json()) as { id: string };
  return { id, ...settings };
};
