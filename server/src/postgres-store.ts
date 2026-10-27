import { asc, eq } from 'drizzle-orm';
import type { PgDatabase, PgQueryResultHKT } from 'drizzle-orm/pg-core';
import type { ConversationStore, Message } from './conversation-store.ts';
import { conversations, corrections, messages } from './db/schema.ts';

// Any Drizzle Postgres database: PGlite in tests, node-postgres in the app.
export type Db = PgDatabase<PgQueryResultHKT>;

export const createPostgresStore = (db: Db): ConversationStore => ({
  // Each write is a transaction: all rows are saved, or none.
  async create({ opening, ...settings }) {
    return db.transaction(async (tx) => {
      const [row] = await tx
        .insert(conversations)
        .values(settings)
        .returning({ id: conversations.id });
      // An insert of one row returns one row; the type just can't know it.
      const id = row!.id;
      await tx.insert(messages).values({ conversationId: id, role: 'tutor', content: opening });
      return { id, ...settings, messages: [{ role: 'tutor', content: opening }] };
    });
  },

  async get(id) {
    const [conversation] = await db
      .select({
        id: conversations.id,
        appLanguage: conversations.appLanguage,
        targetLanguage: conversations.targetLanguage,
        level: conversations.level,
        topic: conversations.topic,
      })
      .from(conversations)
      .where(eq(conversations.id, id));
    if (!conversation) return undefined;

    // One row per Correction, or one row with null Correction columns for a Message without any.
    const rows = await db
      .select({ message: messages, correction: corrections })
      .from(messages)
      .leftJoin(corrections, eq(corrections.messageId, messages.id))
      .where(eq(messages.conversationId, id))
      .orderBy(asc(messages.id), asc(corrections.id));

    const byId = new Map<number, Message>();
    for (const { message, correction } of rows) {
      let entry = byId.get(message.id);
      if (!entry) {
        entry =
          message.role === 'learner'
            ? { role: 'learner', content: message.content, corrections: [] }
            : { role: 'tutor', content: message.content };
        byId.set(message.id, entry);
      }
      if (correction && entry.role === 'learner') {
        const { original, corrected, explanation, category } = correction;
        entry.corrections.push({ original, corrected, explanation, category });
      }
    }
    // A Map keeps insertion order, which is the id order from the query.
    return { ...conversation, messages: [...byId.values()] };
  },

  async addTurn(id, { learnerMessage, tutorReply }) {
    await db.transaction(async (tx) => {
      const [found] = await tx
        .select({ id: conversations.id })
        .from(conversations)
        .where(eq(conversations.id, id));
      if (!found) throw new Error(`Unknown Conversation ${id}`);

      const [learner] = await tx
        .insert(messages)
        .values({ conversationId: id, role: 'learner', content: learnerMessage })
        .returning({ id: messages.id });
      if (tutorReply.corrections.length > 0) {
        await tx
          .insert(corrections)
          .values(tutorReply.corrections.map((c) => ({ ...c, messageId: learner!.id })));
      }
      await tx
        .insert(messages)
        .values({ conversationId: id, role: 'tutor', content: tutorReply.reply });
    });
  },
});
