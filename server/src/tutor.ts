import {
  tutorReplySchema,
  type Level,
  type TargetLanguage,
  type TutorReply,
} from '@sieacher/shared';
import { z } from 'zod';
import type { ChatMessage, ChatModel } from './chat-model.ts';
import { buildSystemPrompt } from './system-prompt.ts';

export class InvalidTutorReplyError extends Error {}

const parseTutorReply = (
  raw: string,
  targetLanguage: TargetLanguage,
): { ok: true; reply: TutorReply } | { ok: false; error: string } => {
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch (error) {
    return { ok: false, error: `Not valid JSON. ${String(error)}` };
  }

  const result = tutorReplySchema(targetLanguage).safeParse(json);
  if (!result.success) return { ok: false, error: z.prettifyError(result.error) };

  // The model sometimes "corrects" a sentence that is already right; that is noise, not worth a retry.
  const corrections = result.data.corrections.filter(
    (c) => c.original.trim() !== c.corrected.trim(),
  );
  return { ok: true, reply: { ...result.data, corrections } };
};

export const getTutorReply = async ({
  model,
  targetLanguage,
  level,
  messages,
}: {
  model: ChatModel;
  targetLanguage: TargetLanguage;
  level: Level;
  messages: ChatMessage[];
}): Promise<TutorReply> => {
  const system = buildSystemPrompt({ targetLanguage, level });

  const answer = await model.complete(system, messages);
  const first = parseTutorReply(answer, targetLanguage);
  if (first.ok) return first.reply;

  const retryAnswer = await model.complete(system, [
    ...messages,
    { role: 'assistant', content: answer },
    {
      role: 'user',
      content: `Your last response was invalid:\n${first.error}\nRespond again with valid JSON only.`,
    },
  ]);
  const retry = parseTutorReply(retryAnswer, targetLanguage);
  if (retry.ok) return retry.reply;

  throw new InvalidTutorReplyError(retry.error);
};
