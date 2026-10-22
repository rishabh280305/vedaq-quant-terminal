# Architecture

The Next.js App Router renders the workstation shell and client interaction panels. Route handlers validate input with Zod. Demo sessions are HMAC-signed and stored in a Secure, HttpOnly cookie; watchlist queries always filter by the verified session user. Neon Postgres stores data in the isolated `vedaq` schema and initializes idempotently from the same DDL checked into `migrations/`.

The quantitative engine is a pure TypeScript server module. It calculates Black–Scholes–Merton prices and analytical Greeks, then solves implied volatility with bounded bisection after checking discounted no-arbitrage bounds. It does not depend on browser calculations or claim access to market data.

`src/lib/market.ts` owns deterministic scenario generation, indicators, and the backtest. Strategy decisions only see completed prior bars; fills happen at the next open. Portfolio transactions are owner-filtered Postgres rows, while valuation remains a cost ledger until a licensed market-data source is configured. `ml/train.py` stays outside request handlers and is intended for cloud jobs against a user-supplied, lawfully obtained OHLCV file.

The market-provider interface distinguishes `live` from scenario sources. Ingestion persists provider id, source date, and ingestion timestamp through an idempotent key. Option-chain analytics consume row-level OI/IV/Greeks and document the simplified gamma-exposure assumption. Rolling anomaly rules return their observable z-scores; the separate Python training pipeline is the only path allowed to create model artifacts.

The optional Alpha Vantage adapter keeps its key in the server environment, requests compact raw daily data, validates the response shape, and reports provider throttling/errors without falling back to fabricated rows. Portfolio CSV parsing occurs in the browser, but every row is revalidated and persisted by the server.
