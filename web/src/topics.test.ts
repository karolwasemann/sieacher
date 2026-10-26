import { describe, expect, it } from 'vite-plus/test';
import { pickTopics, TOPICS } from './topics.ts';

describe('pickTopics', () => {
  it('picks 5 different Topics from the list', () => {
    const picked = pickTopics(5);

    expect(picked).toHaveLength(5);
    expect(new Set(picked).size).toBe(5);
    for (const topic of picked) expect(TOPICS).toContain(topic);
  });

  it('is deterministic for a given random source', () => {
    expect(pickTopics(5, () => 0)).toEqual(TOPICS.slice(0, 5));
  });

  it('can reach the last Topic', () => {
    // 0.999… always swaps with the last remaining slot.
    expect(pickTopics(1, () => 0.999)).toEqual([TOPICS.at(-1)]);
  });

  it('leaves TOPICS untouched', () => {
    const before = [...TOPICS];

    pickTopics(5, () => 0.5);

    expect(TOPICS).toEqual(before);
  });
});
