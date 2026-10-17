import { serve } from '@hono/node-server';
import { createAnthropicModel } from './anthropic-model.ts';
import { createApp } from './app.ts';
import { createInMemoryStore } from './conversation-store.ts';

const env = (name: string) => {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name} in server/.env (see .env.example)`);
  return value;
};

env('ANTHROPIC_API_KEY');
const app = createApp({
  model: createAnthropicModel(env('ANTHROPIC_MODEL')),
  store: createInMemoryStore(),
});

serve({ fetch: app.fetch, hostname: '127.0.0.1', port: 3000 }, ({ port }) => {
  console.log(`Server listening on http://127.0.0.1:${port}`);
});
