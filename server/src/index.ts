import { serve } from '@hono/node-server';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { createAnthropicModel } from './anthropic-model.ts';
import { createApp } from './app.ts';
import { createDb, migrationsFolder } from './db/client.ts';
import { createPostgresStore } from './postgres-store.ts';

const env = (name: string) => {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name} in server/.env (see .env.example)`);
  return value;
};

env('ANTHROPIC_API_KEY');
const db = createDb(env('DATABASE_URL'));
// Runs only the migrations this database has not seen yet; fails fast if Postgres is down.
await migrate(db, { migrationsFolder });

const app = createApp({
  model: createAnthropicModel(env('ANTHROPIC_MODEL')),
  store: createPostgresStore(db),
});

serve({ fetch: app.fetch, hostname: '127.0.0.1', port: 3000 }, ({ port }) => {
  console.log(`Server listening on http://127.0.0.1:${port}`);
});
