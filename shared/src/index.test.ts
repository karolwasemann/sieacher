import { describe, expect, it } from 'vite-plus/test';
import { LEVELS } from './index.ts';

describe('LEVELS', () => {
  it('lists the six CEFR levels from lowest to highest', () => {
    expect(LEVELS).toEqual(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']);
  });
});
