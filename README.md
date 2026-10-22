# VEDAQ Quantitative Finance Terminal

VEDAQ is a transparent quantitative-research terminal for US and Indian markets. The live application currently ships a persistent research watchlist and a server-side Black–Scholes–Merton engine with Greeks and bisection-based implied volatility.

## Verified capabilities

- Signed, HttpOnly one-day demo session and owner-filtered Neon Postgres watchlist
- Validated watchlist create, read, update, and delete operations
- European call/put pricing with delta, gamma, annual theta, vega, rho, and implied volatility
- No-arbitrage checks, documented model assumptions, and unit benchmarks
- Dated deterministic scenario candles with SMA, EMA, RSI, MACD, Bollinger Bands, and annualized volatility
- Provider abstraction plus idempotent, provenance-bearing Postgres candle ingestion and a visible scenario chart
- No-look-ahead backtest with next-open execution, fees, slippage, drawdown, Sharpe ratio, equity curve, and CSV export
- Synthetic 30-day option-chain analytics covering OI walls, put-call ratio, IV skew, simplified gamma exposure, max pain, ATM straddle, filters, and CSV
- Explainable rolling z-score price/volume anomaly flags that are never labeled model output
- Persistent portfolio transaction ledger with oversell protection and cost-ledger positions
- Retrieval-only research with citations and an explicit no-LLM mode
- Walk-forward Random Forest/XGBoost Python training entry point that exports run artifacts rather than checked-in claims
- Production Playwright workflow plus cloud lint, unit-test, type-check, and build gates
- No fabricated market prices; the app remains explicitly educational and not investment advice

## Commands

`npm run dev`, `npm run lint`, `npm test`, `npm run build`, `npm run test:e2e`, and `npm run seed` are supported. Set `BASE_URL` to override the production target used by Playwright or the safe API seed script.

See [architecture](docs/ARCHITECTURE.md), [API](docs/API.md), and [deployment](docs/DEPLOYMENT.md) documentation.
