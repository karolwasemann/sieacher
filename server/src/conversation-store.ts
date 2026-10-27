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
