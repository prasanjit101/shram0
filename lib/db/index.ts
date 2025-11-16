import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema';
import { sql } from 'drizzle-orm';

/**
 * Turso database client
 * Configured with connection URL and auth token from environment variables
 */
const client = createClient({
  url: process.env.TURSO_CONNECTION_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

/**
 * Drizzle ORM instance
 * Use this to interact with the database
 */
export const db = drizzle(client, { schema });
