import { describe, expect, it } from 'vite-plus/test';
import { tutorReplySchema } from './index.ts';

const tutorReplyWith = (category: string) => ({
  reply: 'Wie war dein Wochenende?',
  corrections: [
    {
      original: 'mit der Hund',
      corrected: 'mit dem Hund',
      explanation: 'Po „mit” zawsze celownik.',
      category,
    },
  ],
});

describe('tutorReplySchema', () => {
  it('accepts a category from the Target language list', () => {
    expect(tutorReplySchema('de').safeParse(tutorReplyWith('case')).success).toBe(true);
  });

  it('accepts an English category for English', () => {
    expect(tutorReplySchema('en').safeParse(tutorReplyWith('articles')).success).toBe(true);
  });

  it('rejects a category from the other language', () => {
    expect(tutorReplySchema('de').safeParse(tutorReplyWith('articles')).success).toBe(false);
  });
});
