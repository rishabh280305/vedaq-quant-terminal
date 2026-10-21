import "server-only";
import { neon } from "@neondatabase/serverless";

function client() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not configured");
  return neon(connectionString);
}

let initialized: Promise<void> | null = null;

export async function database() {
  const sql = client();
  initialized ??= (async () => {
    await sql`CREATE SCHEMA IF NOT EXISTS vedaq`;
    await sql`CREATE TABLE IF NOT EXISTS vedaq.watchlist (
      id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      user_id text NOT NULL,
      symbol text NOT NULL,
      note text NOT NULL DEFAULT '',
      created_at timestamptz NOT NULL DEFAULT now(),
      UNIQUE (user_id, symbol)
    )`;
  })();
  await initialized;
  return sql;
}
