import { z } from 'zod';

export const TargetLanguage = z.enum(['en', 'de']);
export type TargetLanguage = z.infer<typeof TargetLanguage>;

export const AppLanguage = z.enum(['pl', 'en', 'de']);
export type AppLanguage = z.infer<typeof AppLanguage>;

export const Level = z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']);
export type Level = z.infer<typeof Level>;

export const MISTAKE_CATEGORIES = {
  en: [
    'tense',
    'articles',
    'prepositions',
    'word-order',
    'agreement',
    'word-choice',
    'spelling',
    'other',
  ],
  de: [
    'case',
    'gender',
    'verb-position',
    'conjugation',
    'prepositions',
    'word-choice',
    'spelling',
    'other',
  ],
} as const satisfies Record<TargetLanguage, readonly string[]>;

const correctionSchema = <L extends TargetLanguage>(targetLanguage: L) =>
  z.object({
    original: z.string().min(1), // the wrong fragment, as the Learner wrote it
    corrected: z.string().min(1),
    explanation: z.string().min(1), // in the App language
    category: z.enum(MISTAKE_CATEGORIES[targetLanguage]),
  });

export const tutorReplySchema = <L extends TargetLanguage>(targetLanguage: L) =>
  z.object({
    reply: z.string().min(1),
    corrections: z.array(correctionSchema(targetLanguage)),
  });
export type TutorReply = z.infer<ReturnType<typeof tutorReplySchema<TargetLanguage>>>;

export const createConversationRequest = z
  .object({
    appLanguage: AppLanguage,
    targetLanguage: TargetLanguage,
    level: Level,
    // Typed by the Learner and put into Lulu's prompt, so it is capped.
    topic: z.string().trim().min(1).max(120),
  })
  .refine((request) => request.targetLanguage !== request.appLanguage, {
    message: 'Target language must differ from the App language',
    path: ['targetLanguage'],
  });

export const sendMessageRequest = z.object({
  content: z.string().trim().min(1),
});
