import { createAnthropicModel } from './anthropic-model.ts';

const env = (name: string) => {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name} in server/.env (see .env.example)`);
  return value;
};

env('ANTHROPIC_API_KEY');
const model = createAnthropicModel(env('ANTHROPIC_MODEL'));

// shortcut: one smoke call to prove the adapter works, replaced by Hono routes in step 6
const reply = await model.complete('You are a friendly German tutor. Answer in one sentence.', [
  { role: 'user', content: 'Say hi in German.' },
]);
console.log(reply);
