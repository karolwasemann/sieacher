import { tutorReplySchema, type Level, type TargetLanguage } from '@sieacher/shared';
import { z } from 'zod';
import type { ChatMessage, ChatModel } from './chat-model.ts';
import { buildSystemPrompt } from './system-prompt.ts';

type TutorReply = z.infer<ReturnType<typeof tutorReplySchema<TargetLanguage>>>;

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
  return result.success
    ? { ok: true, reply: result.data }
    : { ok: false, error: z.prettifyError(result.error) };
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
