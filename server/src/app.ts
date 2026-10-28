import { zValidator } from '@hono/zod-validator';
import { createConversationRequest, sendMessageRequest, type TutorReply } from '@sieacher/shared';
import { Hono } from 'hono';
import { z } from 'zod';
import type { ChatMessage, ChatModel } from './chat-model.ts';
import type { Conversation, ConversationStore } from './conversation-store.ts';
import { KICKOFF_MESSAGE } from './system-prompt.ts';
import { getOpening, getTutorReply, InvalidTutorReplyError } from './tutor.ts';

// Lulu's past replies go back as full JSON, so the history matches the format the prompt asks for.
// A reply's Corrections are stored on the Learner's Message before it, so they are put back together here.
// It starts with the kickoff, so Lulu knows what she opened with.
const toModelMessages = ({ messages }: Conversation): ChatMessage[] => [
  { role: 'user', content: KICKOFF_MESSAGE },
  ...messages.map((message, i): ChatMessage => {
    if (message.role === 'learner') return { role: 'user', content: message.content };
    const before = messages[i - 1];
    const corrections = before?.role === 'learner' ? before.corrections : [];
    return { role: 'assistant', content: JSON.stringify({ reply: message.content, corrections }) };
  }),
];

// Postgres throws on a broken uuid like `abc`, so a bad id is turned into a 404 before it gets there.
const conversationIdParam = zValidator('param', z.object({ id: z.uuid() }), (result, c) => {
  if (!result.success) return c.json({ error: 'conversation-not-found' }, 404);
});

const modelErrorCode = (error: unknown) =>
  error instanceof InvalidTutorReplyError ? 'invalid-tutor-reply' : 'model-unavailable';

export const createApp = ({ model, store }: { model: ChatModel; store: ConversationStore }) =>
  new Hono()
    .get('/api/conversations', async (c) => c.json(await store.list()))
    .get('/api/conversations/:id', conversationIdParam, async (c) => {
      const conversation = await store.get(c.req.valid('param').id);
      if (!conversation) return c.json({ error: 'conversation-not-found' }, 404);
      return c.json(conversation);
    })
    .post('/api/conversations', zValidator('json', createConversationRequest), async (c) => {
      const settings = c.req.valid('json');
      let opening: string;
      try {
        opening = await getOpening({ model, ...settings });
      } catch (error) {
        console.error(error);
        return c.json({ error: modelErrorCode(error) }, 502);
      }

      // Created only after a valid Opening, so a failed start leaves nothing behind.
      const { id } = await store.create({ ...settings, opening });
      return c.json({ id, opening }, 201);
    })
    .post(
      '/api/conversations/:id/messages',
      conversationIdParam,
      zValidator('json', sendMessageRequest),
      async (c) => {
        const conversation = await store.get(c.req.valid('param').id);
        if (!conversation) return c.json({ error: 'conversation-not-found' }, 404);

        const { content } = c.req.valid('json');
        let tutorReply: TutorReply;
        try {
          tutorReply = await getTutorReply({
            model,
            appLanguage: conversation.appLanguage,
            targetLanguage: conversation.targetLanguage,
            level: conversation.level,
            topic: conversation.topic,
            messages: [...toModelMessages(conversation), { role: 'user', content }],
          });
        } catch (error) {
          console.error(error);
          return c.json({ error: modelErrorCode(error) }, 502);
        }

        // Saved only after a valid reply, so the Learner can resend without duplicating a Message.
        await store.addTurn(conversation.id, { learnerMessage: content, tutorReply });
        return c.json(tutorReply);
      },
    );
