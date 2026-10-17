import { describe, expect, it } from 'vite-plus/test';
import { buildSystemPrompt } from './system-prompt.ts';

describe('buildSystemPrompt', () => {
  it('names Lulu, the Target language and the Level', () => {
    const prompt = buildSystemPrompt({ targetLanguage: 'de', level: 'B1' });

    expect(prompt).toContain('Lulu');
    expect(prompt).toContain('German');
    expect(prompt).toContain('B1');
  });

  it('lists only the Mistake categories of the Target language', () => {
    const german = buildSystemPrompt({ targetLanguage: 'de', level: 'B1' });
    const english = buildSystemPrompt({ targetLanguage: 'en', level: 'B1' });

    expect(german).toContain('verb-position');
    expect(german).not.toContain('articles');
    expect(english).toContain('articles');
    expect(english).not.toContain('verb-position');
  });

  it('gives different guidance for different Levels', () => {
    expect(buildSystemPrompt({ targetLanguage: 'en', level: 'A1' })).not.toBe(
      buildSystemPrompt({ targetLanguage: 'en', level: 'C2' }),
    );
  });
});
