import type { AppLanguage, Level, TargetLanguage, TutorReply } from '@sieacher/shared';

export type Turn = { learnerMessage: string; tutorReply: TutorReply };

export type Conversation = {
  id: string;
  appLanguage: AppLanguage;
  targetLanguage: TargetLanguage;
  level: Level;
  turns: Turn[];
};

export interface ConversationStore {
  create(settings: {
    appLanguage: AppLanguage;
    targetLanguage: TargetLanguage;
    level: Level;
  }): Conversation;
  get(id: string): Conversation | undefined;
  addTurn(id: string, turn: Turn): void;
}

export const createInMemoryStore = (): ConversationStore => {
  const conversations = new Map<string, Conversation>();

  return {
    create(settings) {
      const conversation: Conversation = { id: crypto.randomUUID(), ...settings, turns: [] };
      conversations.set(conversation.id, conversation);
      return conversation;
    },
    get(id) {
      return conversations.get(id);
    },
    addTurn(id, turn) {
      const conversation = conversations.get(id);
      if (!conversation) throw new Error(`Unknown Conversation ${id}`);
      conversation.turns.push(turn);
    },
  };
};
