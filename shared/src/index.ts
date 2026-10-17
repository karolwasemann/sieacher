import { z } from 'zod';

export const TargetLanguage = z.enum(['en', 'de']);
export type TargetLanguage = z.infer<typeof TargetLanguage>;

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
