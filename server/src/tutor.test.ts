import { describe, expect, it } from 'vite-plus/test';
import type { ChatMessage, ChatModel } from './chat-model.ts';
import { createFakeModel } from './fake-model.ts';
import { getTutorReply, InvalidTutorReplyError } from './tutor.ts';

const validReply = JSON.stringify({
  reply: 'Wie war dein Wochenende?',
  corrections: [
    {
      original: 'mit der Hund',
      corrected: 'mit dem Hund',
      explanation: 'Po „mit” zawsze celownik.',
      category: 'case',
    },
  ],
});

const messages: ChatMessage[] = [{ role: 'user', content: 'Ich war mit der Hund im Park.' }];

const ask = (model: ChatModel) =>
  getTutorReply({ model, targetLanguage: 'de', level: 'A2', messages });

describe('getTutorReply', () => {
  it('returns a valid reply after one call', async () => {
    const { model, calls } = createFakeModel([validReply]);

    expect(await ask(model)).toEqual(JSON.parse(validReply));
    expect(calls).toHaveLength(1);
    expect(calls[0]?.system).toContain('Lulu');
    expect(calls[0]?.messages).toEqual(messages);
  });

  it('retries once with the bad answer and the error after invalid JSON', async () => {
    const { model, calls } = createFakeModel(['not json', validReply]);

    expect(await ask(model)).toEqual(JSON.parse(validReply));
    expect(calls).toHaveLength(2);
    expect(calls[1]?.messages).toEqual([
      ...messages,
      { role: 'assistant', content: 'not json' },
      { role: 'user', content: expect.stringContaining('JSON') },
    ]);
  });

  it('retries once after a reply that breaks the schema', async () => {
    const wrongCategory = validReply.replace('"case"', '"articles"');
    const { model, calls } = createFakeModel([wrongCategory, validReply]);

    expect(await ask(model)).toEqual(JSON.parse(validReply));
    expect(calls[1]?.messages.at(-1)?.content).toContain('category');
  });

  it('throws after a second invalid answer, without a third call', async () => {
    const { model, calls } = createFakeModel(['not json', 'still not json', validReply]);

    await expect(ask(model)).rejects.toBeInstanceOf(InvalidTutorReplyError);
    expect(calls).toHaveLength(2);
  });

  it('drops a Correction that changes nothing, without a retry', async () => {
    const noOp = {
      original: 'Sie braucht manchmal länger.',
      corrected: 'Sie braucht manchmal länger.',
      explanation: 'Dieser Satz ist richtig.',
      category: 'other',
    };
    const { model, calls } = createFakeModel([
      JSON.stringify({ reply: 'Wie war dein Tag?', corrections: [noOp] }),
    ]);

    expect((await ask(model)).corrections).toEqual([]);
    expect(calls).toHaveLength(1);
  });
});
