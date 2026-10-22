CREATE TABLE IF NOT EXISTS vedaq.portfolio_transactions (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id text NOT NULL,
  symbol text NOT NULL,
  side text NOT NULL CHECK (side IN ('buy', 'sell')),
  quantity numeric(18, 6) NOT NULL CHECK (quantity > 0),
  price numeric(18, 6) NOT NULL CHECK (price > 0),
  traded_at date NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS portfolio_transactions_owner_date_idx
  ON vedaq.portfolio_transactions (user_id, traded_at DESC);
