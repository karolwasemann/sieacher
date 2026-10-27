import { describe, expect, it } from 'vite-plus/test';
import { useTestDb } from './db/test-db.ts';
import { createPostgresStore } from './postgres-store.ts';

const settings = { appLanguage: 'pl', targetLanguage: 'de', level: 'A2', topic: 'Urlaub' } as const;
const correction = {
  original: 'mit der Hund',
  corrected: 'mit dem Hund',
  explanation: 'Po „mit” zawsze celownik.',
  category: 'case',
} as const;

const resetTestDb = useTestDb();
const createStore = async () => createPostgresStore(await resetTestDb());

describe('Postgres ConversationStore', () => {
  it('creates a Conversation whose first Message is the Opening', async () => {
    const store = await createStore();

    const created = await store.create({ ...settings, opening: 'Hallo! Wohin fährst du gern?' });

    expect(await store.get(created.id)).toEqual({
      id: created.id,
      ...settings,
      messages: [{ role: 'tutor', content: 'Hallo! Wohin fährst du gern?' }],
    });
  });

  it("adds a turn as two Messages, with the Corrections on the Learner's one", async () => {
    const store = await createStore();
    const { id } = await store.create({ ...settings, opening: 'Hallo!' });

    await store.addTurn(id, {
      learnerMessage: 'Ich war mit der Hund im Park.',
      tutorReply: { reply: 'Schön! Was habt ihr gemacht?', corrections: [correction] },
    });

    expect((await store.get(id))?.messages).toEqual([
      { role: 'tutor', content: 'Hallo!' },
      { role: 'learner', content: 'Ich war mit der Hund im Park.', corrections: [correction] },
      { role: 'tutor', content: 'Schön! Was habt ihr gemacht?' },
    ]);
  });

  it('rejects a turn for an unknown Conversation', async () => {
    const store = await createStore();
    const unknownId = crypto.randomUUID();

    await expect(
      store.addTurn(unknownId, {
        learnerMessage: 'Hallo!',
        tutorReply: { reply: 'Hi', corrections: [] },
      }),
    ).rejects.toThrow(`Unknown Conversation ${unknownId}`);
  });
});
