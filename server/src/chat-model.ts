export type ChatMessage = { role: 'user' | 'assistant'; content: string };

export interface ChatModel {
  complete(system: string, messages: ChatMessage[]): Promise<string>;
}
