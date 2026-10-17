import Anthropic from '@anthropic-ai/sdk';
import type { ChatModel } from './chat-model.ts';

export const createAnthropicModel = (model: string): ChatModel => {
  const client = new Anthropic();

  return {
    async complete(system, messages) {
      const response = await client.messages.create({
        model,
        max_tokens: 16000,
        system,
        messages,
      });

      if (response.stop_reason === 'refusal' || response.stop_reason === 'max_tokens') {
        throw new Error(`Model stopped early: ${response.stop_reason}`);
      }

      return response.content
        .flatMap((block) => (block.type === 'text' ? [block.text] : []))
        .join('');
    },
  };
};
