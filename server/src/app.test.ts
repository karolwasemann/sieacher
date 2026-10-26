import { describe, expect, it, vi } from 'vite-plus/test';
import { createApp } from './app.ts';
import { createInMemoryStore } from './conversation-store.ts';
import { createFakeModel } from './fake-model.ts';
import { KICKOFF_MESSAGE } from './system-prompt.ts';

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
const openingReply = JSON.stringify({ reply: 'Hallo! Wohin fährst du gern?', corrections: [] });
const request = { appLanguage: 'pl', targetLanguage: 'de', level: 'A2', topic: 'Urlaub' };

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
  // Uses up the first fake response for the Opening.
  const startConversation = async () => {
    const response = await post('/api/conversations', request);
    const { id } = (await response.json()) as { id: string };
    return id;
  };
  return { ...fake, store, post, startConversation };
};

describe('POST /api/conversations', () => {
  it("creates a Conversation with Lulu's Opening", async () => {
    const { post, store } = setup([openingReply]);

    const response = await post('/api/conversations', request);

    expect(response.status).toBe(201);
    const { id, opening } = (await response.json()) as { id: string; opening: string };
    expect(opening).toBe('Hallo! Wohin fährst du gern?');
    expect(await store.get(id)).toMatchObject({
      ...request,
      messages: [{ role: 'tutor', content: opening }],
    });
  });

  it('returns 502 and creates nothing when the Opening fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const { post, store } = setup(['not json', 'still not json']);
    const create = vi.spyOn(store, 'create');

    const response = await post('/api/conversations', request);

    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({ error: 'invalid-tutor-reply' });
    expect(create).not.toHaveBeenCalled();
  });

  it('rejects a missing Topic', async () => {
    const { post } = setup([]);

    const response = await post('/api/conversations', { ...request, topic: undefined });

    expect(response.status).toBe(400);
  });

  it('rejects an unknown Level', async () => {
    const { post } = setup([]);

    const response = await post('/api/conversations', { ...request, level: 'D1' });

    expect(response.status).toBe(400);
  });

  it('rejects a Target language equal to the App language', async () => {
    const { post } = setup([]);

    const response = await post('/api/conversations', { ...request, appLanguage: 'de' });

    expect(response.status).toBe(400);
  });
});

describe('POST /api/conversations/:id/messages', () => {
  it("returns Lulu's reply and sends the Opening and earlier turns to the model", async () => {
    const { post, calls, startConversation } = setup([openingReply, validReply, validReply]);
    const id = await startConversation();

    const first = await post(`/api/conversations/${id}/messages`, { content: 'Hallo!' });
    await post(`/api/conversations/${id}/messages`, { content: 'Ich war mit der Hund im Park.' });

    expect(first.status).toBe(200);
    expect(await first.json()).toEqual(tutorReply);
    expect(calls[2]?.messages).toEqual([
      { role: 'user', content: KICKOFF_MESSAGE },
      { role: 'assistant', content: openingReply },
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
    const { post, startConversation } = setup([openingReply]);
    const id = await startConversation();

    const response = await post(`/api/conversations/${id}/messages`, { content: '   ' });

    expect(response.status).toBe(400);
  });

  it('returns 502 after two invalid answers and saves nothing', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const { post, store, startConversation } = setup([openingReply, 'not json', 'still not json']);
    const id = await startConversation();

    const response = await post(`/api/conversations/${id}/messages`, { content: 'Hallo!' });

    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({ error: 'invalid-tutor-reply' });
    expect((await store.get(id))?.messages).toHaveLength(1); // only the Opening
  });
});
