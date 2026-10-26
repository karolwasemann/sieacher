import type { AppLanguage, Level, TargetLanguage } from '@sieacher/shared';
import { integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

// Values are plain text, not Postgres enums: zod checks them at the API, and enums are hard to change.

export const conversations = pgTable('conversations', {
  id: uuid().primaryKey().defaultRandom(),
  appLanguage: text().$type<AppLanguage>().notNull(),
  targetLanguage: text().$type<TargetLanguage>().notNull(),
  level: text().$type<Level>().notNull(),
  topic: text().notNull(),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

// Messages are read in id order, which is the order they were written.
export const messages = pgTable('messages', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  conversationId: uuid()
    .notNull()
    .references(() => conversations.id),
  role: text().$type<'learner' | 'tutor'>().notNull(),
  content: text().notNull(),
});

// A Correction belongs to the Learner's Message it fixes.
export const corrections = pgTable('corrections', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  messageId: integer()
    .notNull()
    .references(() => messages.id),
  original: text().notNull(),
  corrected: text().notNull(),
  explanation: text().notNull(),
  category: text().notNull(),
});
