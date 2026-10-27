import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

// The schema names fields in camelCase; columns in the database are snake_case.
// Every Drizzle database we create (app and tests) must use these options.
export const dbOptions = { casing: 'snake_case' } as const;

// Committed SQL files from `pnpm db:generate`.
export const migrationsFolder = new URL('../../drizzle', import.meta.url).pathname;

// A Pool keeps a few connections open and lends one to each query.
// pg waits forever for a connection by default; in WSL a stopped database never answers, so give up after 5 s.
export const createDb = (url: string) =>
  drizzle(new Pool({ connectionString: url, connectionTimeoutMillis: 5_000 }), dbOptions);
