import {
  tutorReplySchema,
  type AppLanguage,
  type Level,
  type TargetLanguage,
  type TutorReply,
} from '@sieacher/shared';
import { z } from 'zod';
import type { ChatMessage, ChatModel } from './chat-model.ts';
import { buildSystemPrompt, KICKOFF_MESSAGE } from './system-prompt.ts';

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

type Settings = {
  appLanguage: AppLanguage;
  targetLanguage: TargetLanguage;
  level: Level;
  topic: string;
};

export const getTutorReply = async ({
  model,
  messages,
  ...settings
}: Settings & { model: ChatModel; messages: ChatMessage[] }): Promise<TutorReply> => {
  const { targetLanguage } = settings;
  const system = buildSystemPrompt(settings);

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

// Same call → parse → validate → retry flow; the kickoff has nothing to correct, so only the reply is kept.
export const getOpening = async (settings: Settings & { model: ChatModel }) => {
  const { reply } = await getTutorReply({
    ...settings,
    messages: [{ role: 'user', content: KICKOFF_MESSAGE }],
  });
  return reply;
};
