import { describe, expect, it } from 'vite-plus/test';
import { chatReducer, initialChatState, type ChatState } from './chat-state.ts';

const correction = {
  original: 'mit der Hund',
  corrected: 'mit dem Hund',
  explanation: 'Po „mit” zawsze celownik.',
  category: 'case' as const,
};

const sending: ChatState = {
  messages: [{ role: 'learner', content: 'Ich war mit der Hund im Park.' }],
  status: 'sending',
};

describe('chatReducer', () => {
  it('starts empty and idle', () => {
    expect(initialChatState).toEqual({ messages: [], status: 'idle' });
  });

  it('shows a sent Message right away and waits for Lulu', () => {
    const state = chatReducer(initialChatState, { type: 'sent', content: 'Hallo!' });

    expect(state).toEqual({
      messages: [{ role: 'learner', content: 'Hallo!' }],
      status: 'sending',
    });
  });

  it("puts Lulu's Corrections on the Learner Message and appends her reply", () => {
    const state = chatReducer(sending, {
      type: 'replied',
      tutorReply: { reply: 'Wie war es im Park?', corrections: [correction] },
    });

    expect(state).toEqual({
      messages: [
        { role: 'learner', content: 'Ich war mit der Hund im Park.', corrections: [correction] },
        { role: 'tutor', reply: 'Wie war es im Park?' },
      ],
      status: 'idle',
    });
  });

  it('marks a Message without mistakes with an empty list', () => {
    const state = chatReducer(sending, {
      type: 'replied',
      tutorReply: { reply: 'Super!', corrections: [] },
    });

    expect(state.messages[0]).toEqual({
      role: 'learner',
      content: 'Ich war mit der Hund im Park.',
      corrections: [],
    });
  });

  it('only touches the last Learner Message', () => {
    const earlier: ChatState = {
      messages: [
        { role: 'learner', content: 'Hallo!', corrections: [] },
        { role: 'tutor', reply: 'Hallo! Wie geht es dir?' },
        { role: 'learner', content: 'Ich war mit der Hund im Park.' },
      ],
      status: 'sending',
    };

    const state = chatReducer(earlier, {
      type: 'replied',
      tutorReply: { reply: 'Wie war es?', corrections: [correction] },
    });

    expect(state.messages[0]).toEqual({ role: 'learner', content: 'Hallo!', corrections: [] });
    expect(state.messages[2]).toMatchObject({ corrections: [correction] });
  });

  it('keeps the Learner Message when sending fails', () => {
    const state = chatReducer(sending, { type: 'failed', error: 'invalid-tutor-reply' });

    expect(state).toEqual({
      messages: sending.messages,
      status: { error: 'invalid-tutor-reply' },
    });
  });

  it('resends without adding the Message again', () => {
    const failed = chatReducer(sending, { type: 'failed', error: 'network' });

    const state = chatReducer(failed, { type: 'resent' });

    expect(state).toEqual({ messages: sending.messages, status: 'sending' });
  });

  it('never changes the state it was given', () => {
    const before = structuredClone(sending);

    chatReducer(sending, {
      type: 'replied',
      tutorReply: { reply: 'Wie war es im Park?', corrections: [correction] },
    });

    expect(sending).toEqual(before);
  });
});
