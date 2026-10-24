import { describe, expect, it, vi } from 'vite-plus/test';
import { createApp } from './app.ts';
import { createInMemoryStore } from './conversation-store.ts';
import { createFakeModel } from './fake-model.ts';

const tutorReply = {
  reply: 'Wie war dein Wochenende?',
  corrections: [
    {
      original: 'mit der Hund',
      corrected: 'mit dem Hund',
      explanation: 'Po „mit” zawsze celownik.',
      category: 'case',
    },
  ],
};
const validReply = JSON.stringify(tutorReply);

const setup = (responses: string[]) => {
  const fake = createFakeModel(responses);
  const store = createInMemoryStore();
  const app = createApp({ model: fake.model, store });
  const post = (path: string, body: unknown) =>
    app.request(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  const startConversation = async () => {
    const response = await post('/api/conversations', {
      appLanguage: 'pl',
      targetLanguage: 'de',
      level: 'A2',
    });
    const { id } = (await response.json()) as { id: string };
    return id;
  };
  return { ...fake, store, post, startConversation };
};

describe('POST /api/conversations', () => {
  it('creates a Conversation', async () => {
    const { post, store } = setup([]);

    const response = await post('/api/conversations', {
      appLanguage: 'pl',
      targetLanguage: 'de',
      level: 'A2',
    });

    expect(response.status).toBe(201);
    const { id } = (await response.json()) as { id: string };
    expect(store.get(id)).toMatchObject({ targetLanguage: 'de', level: 'A2', turns: [] });
  });

  it('rejects an unknown Level', async () => {
    const { post } = setup([]);

    const response = await post('/api/conversations', {
      appLanguage: 'pl',
      targetLanguage: 'de',
      level: 'D1',
    });

    expect(response.status).toBe(400);
  });

  it('rejects a Target language equal to the App language', async () => {
    const { post } = setup([]);

    const response = await post('/api/conversations', {
      appLanguage: 'de',
      targetLanguage: 'de',
      level: 'A2',
    });

    expect(response.status).toBe(400);
  });
});

describe('POST /api/conversations/:id/messages', () => {
  it("returns Lulu's reply and sends the earlier turns to the model", async () => {
    const { post, calls, startConversation } = setup([validReply, validReply]);
    const id = await startConversation();

    const first = await post(`/api/conversations/${id}/messages`, { content: 'Hallo!' });
    await post(`/api/conversations/${id}/messages`, { content: 'Ich war mit der Hund im Park.' });

    expect(first.status).toBe(200);
    expect(await first.json()).toEqual(tutorReply);
    expect(calls[1]?.messages).toEqual([
      { role: 'user', content: 'Hallo!' },
      { role: 'assistant', content: validReply },
      { role: 'user', content: 'Ich war mit der Hund im Park.' },
    ]);
  });

  it('returns 404 for an unknown Conversation', async () => {
    const { post } = setup([]);

    const response = await post('/api/conversations/nope/messages', { content: 'Hallo!' });

    expect(response.status).toBe(404);
  });

  it('rejects an empty Message', async () => {
    const { post, startConversation } = setup([]);
    const id = await startConversation();

    const response = await post(`/api/conversations/${id}/messages`, { content: '   ' });

    expect(response.status).toBe(400);
  });

  it('returns 502 after two invalid answers and saves nothing', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const { post, store, startConversation } = setup(['not json', 'still not json']);
    const id = await startConversation();

    const response = await post(`/api/conversations/${id}/messages`, { content: 'Hallo!' });

    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({ error: 'invalid-tutor-reply' });
    expect(store.get(id)?.turns).toEqual([]);
  });
});
