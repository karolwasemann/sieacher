import type { AppLanguage, Level, TargetLanguage, TutorReply } from '@sieacher/shared';

type Correction = TutorReply['corrections'][number];

export type Message =
  | { role: 'learner'; content: string; corrections: Correction[] }
  | { role: 'tutor'; content: string };

export type Turn = { learnerMessage: string; tutorReply: TutorReply };

export type Conversation = {
  id: string;
  appLanguage: AppLanguage;
  targetLanguage: TargetLanguage;
  level: Level;
  topic: string;
  messages: Message[];
};

export type NewConversation = Omit<Conversation, 'id' | 'messages'> & { opening: string };

export interface ConversationStore {
  create(conversation: NewConversation): Promise<Conversation>;
  get(id: string): Promise<Conversation | undefined>;
  addTurn(id: string, turn: Turn): Promise<void>;
}

export const createInMemoryStore = (): ConversationStore => {
  const conversations = new Map<string, Conversation>();

  return {
    async create({ opening, ...settings }) {
      const conversation: Conversation = {
        id: crypto.randomUUID(),
        ...settings,
        messages: [{ role: 'tutor', content: opening }],
      };
      conversations.set(conversation.id, conversation);
      return conversation;
    },
    async get(id) {
      return conversations.get(id);
    },
    async addTurn(id, { learnerMessage, tutorReply }) {
      const conversation = conversations.get(id);
      if (!conversation) throw new Error(`Unknown Conversation ${id}`);
      conversation.messages.push(
        { role: 'learner', content: learnerMessage, corrections: tutorReply.corrections },
        { role: 'tutor', content: tutorReply.reply },
      );
    },
  };
};
