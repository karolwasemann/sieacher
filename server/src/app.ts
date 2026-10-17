import { zValidator } from '@hono/zod-validator';
import { createConversationRequest, sendMessageRequest } from '@sieacher/shared';
import { Hono } from 'hono';
import type { ChatMessage, ChatModel } from './chat-model.ts';
import type { ConversationStore, Turn } from './conversation-store.ts';
import { getTutorReply, InvalidTutorReplyError, type TutorReply } from './tutor.ts';

// Lulu's past turns go back as full JSON, so the history matches the format the prompt asks for.
const toModelMessages = (turns: Turn[]): ChatMessage[] =>
  turns.flatMap(({ learnerMessage, tutorReply }): ChatMessage[] => [
    { role: 'user', content: learnerMessage },
    { role: 'assistant', content: JSON.stringify(tutorReply) },
  ]);

export const createApp = ({ model, store }: { model: ChatModel; store: ConversationStore }) =>
  new Hono()
    .post('/api/conversations', zValidator('json', createConversationRequest), (c) => {
      const { id } = store.create(c.req.valid('json'));
      return c.json({ id }, 201);
    })
    .post('/api/conversations/:id/messages', zValidator('json', sendMessageRequest), async (c) => {
      const conversation = store.get(c.req.param('id'));
      if (!conversation) return c.json({ error: 'conversation-not-found' }, 404);

      const { content } = c.req.valid('json');
      let tutorReply: TutorReply;
      try {
        tutorReply = await getTutorReply({
          model,
          targetLanguage: conversation.targetLanguage,
          level: conversation.level,
          messages: [...toModelMessages(conversation.turns), { role: 'user', content }],
        });
      } catch (error) {
        console.error(error);
        const code =
          error instanceof InvalidTutorReplyError ? 'invalid-tutor-reply' : 'model-unavailable';
        return c.json({ error: code }, 502);
      }

      // Saved only after a valid reply, so the Learner can resend without duplicating a Message.
      store.addTurn(conversation.id, { learnerMessage: content, tutorReply });
      return c.json(tutorReply);
    });
