import { describe, expect, it } from 'vite-plus/test';
import { buildSystemPrompt, KICKOFF_MESSAGE } from './system-prompt.ts';

const topic = 'Urlaub am Meer';

describe('buildSystemPrompt', () => {
  it('names Lulu, the Target language and the Level', () => {
    const prompt = buildSystemPrompt({
      appLanguage: 'pl',
      targetLanguage: 'de',
      level: 'B1',
      topic,
    });

    expect(prompt).toContain('Lulu');
    expect(prompt).toContain('German');
    expect(prompt).toContain('B1');
  });

  it('lists only the Mistake categories of the Target language', () => {
    const german = buildSystemPrompt({
      appLanguage: 'pl',
      targetLanguage: 'de',
      level: 'B1',
      topic,
    });
    const english = buildSystemPrompt({
      appLanguage: 'pl',
      targetLanguage: 'en',
      level: 'B1',
      topic,
    });

    expect(german).toContain('verb-position');
    expect(german).not.toContain('articles');
    expect(english).toContain('articles');
    expect(english).not.toContain('verb-position');
  });

  it('asks for explanations and help in the App language', () => {
    const prompt = buildSystemPrompt({
      appLanguage: 'en',
      targetLanguage: 'de',
      level: 'B1',
      topic,
    });

    expect(prompt).toContain('explanation": always in English');
    expect(prompt).toContain('help in English');
    expect(prompt).not.toContain('Polish');
  });

  it('puts the Topic between tags and explains the kickoff Message', () => {
    const prompt = buildSystemPrompt({
      appLanguage: 'pl',
      targetLanguage: 'de',
      level: 'B1',
      topic,
    });

    expect(prompt).toContain('<topic>Urlaub am Meer</topic>');
    expect(prompt).toContain(KICKOFF_MESSAGE);
  });

  it('gives different guidance for different Levels', () => {
    expect(
      buildSystemPrompt({ appLanguage: 'pl', targetLanguage: 'en', level: 'A1', topic }),
    ).not.toBe(buildSystemPrompt({ appLanguage: 'pl', targetLanguage: 'en', level: 'C2', topic }));
  });
});
