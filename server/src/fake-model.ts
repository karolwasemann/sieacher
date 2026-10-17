import type { ChatMessage, ChatModel } from './chat-model.ts';

// Answers with the given responses in order and records every call.
export const createFakeModel = (responses: string[]) => {
  const calls: { system: string; messages: ChatMessage[] }[] = [];
  const model: ChatModel = {
    async complete(system, messages) {
      calls.push({ system, messages });
      const response = responses[calls.length - 1];
      if (response === undefined) throw new Error('Fake model has no more responses');
      return response;
    },
  };
  return { model, calls };
};
