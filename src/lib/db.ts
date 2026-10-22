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
    await sql`CREATE TABLE IF NOT EXISTS vedaq.portfolio_transactions (
      id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      user_id text NOT NULL,
      symbol text NOT NULL,
      side text NOT NULL CHECK (side IN ('buy', 'sell')),
      quantity numeric(18, 6) NOT NULL CHECK (quantity > 0),
      price numeric(18, 6) NOT NULL CHECK (price > 0),
      traded_at date NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now()
    )`;
    await sql`CREATE TABLE IF NOT EXISTS vedaq.market_candles (symbol text NOT NULL, observed_on date NOT NULL, open numeric NOT NULL, high numeric NOT NULL, low numeric NOT NULL, close numeric NOT NULL, volume bigint NOT NULL, provider text NOT NULL, ingested_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY(symbol,observed_on,provider))`;
  })();
  await initialized;
  return sql;
}
