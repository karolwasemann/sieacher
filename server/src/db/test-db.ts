import { PGlite } from '@electric-sql/pglite';
import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/pglite';
import { migrate } from 'drizzle-orm/pglite/migrator';
import { beforeAll } from 'vite-plus/test';
import { dbOptions, migrationsFolder } from './client.ts';

// PGlite takes seconds to start, so one in-memory Postgres serves a whole test file:
// shaped once by the committed migrations, emptied before each test.
export const useTestDb = () => {
  const db = drizzle(new PGlite(), dbOptions);
  beforeAll(() => migrate(db, { migrationsFolder }), 30_000);

  const resetTestDb = async () => {
    await db.execute(sql`truncate conversations, messages, corrections restart identity`);
    return db;
  };
  return resetTestDb;
};
