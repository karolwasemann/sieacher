import { PGlite } from '@electric-sql/pglite';
import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/pglite';
import { migrate } from 'drizzle-orm/pglite/migrator';
import { beforeAll, describe, expect, it } from 'vite-plus/test';
import { type ConversationStore, createInMemoryStore } from './conversation-store.ts';
import { createPostgresStore } from './postgres-store.ts';

const settings = { appLanguage: 'pl', targetLanguage: 'de', level: 'A2', topic: 'Urlaub' } as const;
const correction = {
  original: 'mit der Hund',
  corrected: 'mit dem Hund',
  explanation: 'Po „mit” zawsze celownik.',
  category: 'case',
} as const;

// PGlite takes seconds to start, so one in-memory Postgres serves the whole file:
// shaped once by the committed migrations, emptied before each test.
const db = drizzle(new PGlite(), { casing: 'snake_case' });
beforeAll(async () => {
  await migrate(db, { migrationsFolder: new URL('../drizzle', import.meta.url).pathname });
}, 30_000);

const createTestPostgresStore = async () => {
  await db.execute(sql`truncate conversations, messages, corrections restart identity`);
  return createPostgresStore(db);
};

describe.each<[string, () => Promise<ConversationStore> | ConversationStore]>([
  ['in-memory', createInMemoryStore],
  ['Postgres', createTestPostgresStore],
])('%s ConversationStore', (_name, createStore) => {
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
