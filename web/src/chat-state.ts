import type { TutorReply } from '@sieacher/shared';
import type { ErrorCode } from './api.ts';

type Correction = TutorReply['corrections'][number];

export type ChatMessage =
  // corrections: undefined until Lulu has replied to this Message, [] when it had no mistakes
  | { role: 'learner'; content: string; corrections?: Correction[] }
  | { role: 'tutor'; reply: string };

export type ChatState = {
  messages: ChatMessage[];
  status: 'idle' | 'sending' | { error: ErrorCode };
};

export type ChatAction =
  | { type: 'sent'; content: string } // the Learner sent a new Message
  | { type: 'replied'; tutorReply: TutorReply } // Lulu replied to the last Learner Message
  | { type: 'failed'; error: ErrorCode } // sending failed; the Learner Message stays
  | { type: 'resent' }; // the Learner retries the last Message after a failure

export const createInitialChatState = (opening: string): ChatState => ({
  messages: [{ role: 'tutor', reply: opening }],
  status: 'idle',
});

export const chatReducer = (state: ChatState, action: ChatAction): ChatState => {
  switch (action.type) {
    case 'sent':
      return {
        messages: [...state.messages, { role: 'learner', content: action.content }],
        status: 'sending',
      };
    case 'failed':
      return { ...state, status: { error: action.error } };
    case 'resent':
      return { ...state, status: 'sending' };
    case 'replied': {
      const { reply, corrections } = action.tutorReply;
      const last = state.messages.findLastIndex((message) => message.role === 'learner');
      return {
        messages: [
          ...state.messages.map((message, i) =>
            i === last && message.role === 'learner' ? { ...message, corrections } : message,
          ),
          { role: 'tutor', reply },
        ],
        status: 'idle',
      };
    }
  }
};
