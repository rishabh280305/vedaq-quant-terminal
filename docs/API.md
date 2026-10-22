# API

| Method | Route | Authentication | Behavior |
| --- | --- | --- | --- |
| GET | `/api/health` | Public | Service status and server timestamp |
| GET/POST/DELETE | `/api/auth/demo` | Public/cookie | Inspect, create, or expire the signed demo session |
| GET/POST/DELETE | `/api/watchlist` | Demo session | List, upsert, or remove user-owned symbols |
| POST | `/api/options/calculate` | Public | Calculate theoretical price, Greeks, and optional implied volatility |
| GET | `/api/market/demo` | Demo session | Dated deterministic scenario candles and calculated indicators |
| POST | `/api/market/ingest` | Demo session | Idempotently persist the built-in provider series with provenance |
| GET | `/api/market/candles` | Demo session | Persisted candles, indicators, rule anomalies, and freshness |
| POST | `/api/options/chain` | Demo session | Generate and analyze a clearly synthetic 30-day chain |
| POST | `/api/backtest` | Demo session | Time-aware strategy execution with costs and risk metrics |
| GET/POST | `/api/portfolio` | Demo session | Read positions/transactions or record a validated trade |
| POST | `/api/research` | Demo session | Citation-bearing retrieval-only methodology search |

All write inputs are validated. `/api/options/calculate` accepts rates and volatility as percentages and time as calendar days; the response states model assumptions and the investment disclaimer.

The demo market endpoint is explicitly synthetic and not historical provider data. Backtest signals use completed prior bars and execute at the following open. Portfolio valuation is cost-ledger-only until a legitimate provider is configured.

Option-chain output states the simplified dealer-position convention used for estimated gamma exposure. Token exchange data, live prices, and provider history are never implied. Market anomaly rows identify rolling z-score rule matches, not ML predictions.
