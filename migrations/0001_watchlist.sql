CREATE SCHEMA IF NOT EXISTS vedaq;
CREATE TABLE IF NOT EXISTS vedaq.watchlist (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id text NOT NULL,
  symbol text NOT NULL,
  note text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, symbol)
);
