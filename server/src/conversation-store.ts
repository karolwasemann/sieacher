import type { ConversationDetail, ConversationSummary, TutorReply } from '@sieacher/shared';

export type Turn = { learnerMessage: string; tutorReply: TutorReply };

export type Conversation = ConversationDetail;

export type NewConversation = Omit<Conversation, 'id' | 'messages'> & { opening: string };

export interface ConversationStore {
  create(conversation: NewConversation): Promise<Conversation>;
  list(): Promise<ConversationSummary[]>;
  get(id: string): Promise<Conversation | undefined>;
  addTurn(id: string, turn: Turn): Promise<void>;
}
