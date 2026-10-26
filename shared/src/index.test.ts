import { describe, expect, it } from 'vite-plus/test';
import { createConversationRequest, tutorReplySchema } from './index.ts';

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

describe('createConversationRequest', () => {
  const request = { appLanguage: 'pl', targetLanguage: 'de', level: 'A2', topic: 'Urlaub' };

  it('accepts a Target language different from the App language', () => {
    expect(createConversationRequest.safeParse(request).success).toBe(true);
  });

  it('rejects a Target language equal to the App language', () => {
    expect(createConversationRequest.safeParse({ ...request, appLanguage: 'de' }).success).toBe(
      false,
    );
  });

  it('trims the Topic', () => {
    expect(createConversationRequest.parse({ ...request, topic: '  Urlaub  ' }).topic).toBe(
      'Urlaub',
    );
  });

  it('rejects a blank or too long Topic', () => {
    expect(createConversationRequest.safeParse({ ...request, topic: '   ' }).success).toBe(false);
    expect(
      createConversationRequest.safeParse({ ...request, topic: 'x'.repeat(121) }).success,
    ).toBe(false);
  });
});
