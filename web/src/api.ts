import type { AppLanguage, Level, TargetLanguage, TutorReply } from '@sieacher/shared';

// What can go wrong when sending a Message. The first two are the server's 502 codes.
export type ErrorCode =
  | 'invalid-tutor-reply'
  | 'model-unavailable'
  | 'conversation-not-found'
  | 'network'
  | 'unexpected';

export class ApiError extends Error {
  code: ErrorCode;

  constructor(code: ErrorCode) {
    super(code);
    this.code = code;
  }
}

export type Conversation = {
  id: string;
  appLanguage: AppLanguage;
  targetLanguage: TargetLanguage;
  level: Level;
  topic: string;
  opening: string;
};

export const createConversation = async (settings: Omit<Conversation, 'id' | 'opening'>) => {
  const response = await fetch('/api/conversations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
  });
  if (!response.ok) throw new Error(`POST /api/conversations failed: ${response.status}`);

  const { id, opening } = (await response.json()) as { id: string; opening: string };
  return { id, opening, ...settings };
};

export const sendMessage = async (conversationId: string, content: string) => {
  let response: Response;
  try {
    response = await fetch(`/api/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });
  } catch {
    throw new ApiError('network');
  }

  if (response.status === 404) throw new ApiError('conversation-not-found');
  if (response.status === 502) {
    const { error } = (await response.json()) as { error: ErrorCode };
    throw new ApiError(error);
  }
  if (!response.ok) throw new ApiError('unexpected');

  // Already validated by the server, so the type is trusted here.
  return (await response.json()) as TutorReply;
};
