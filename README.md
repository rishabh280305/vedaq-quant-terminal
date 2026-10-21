# VEDAQ Quantitative Finance Terminal

VEDAQ is a transparent quantitative-research terminal for US and Indian markets. The live application currently ships a persistent research watchlist and a server-side Black–Scholes–Merton engine with Greeks and bisection-based implied volatility.

## Verified capabilities

- Signed, HttpOnly one-day demo session and owner-filtered Neon Postgres watchlist
- Validated watchlist create, read, update, and delete operations
- European call/put pricing with delta, gamma, annual theta, vega, rho, and implied volatility
- No-arbitrage checks, documented model assumptions, and unit benchmarks
- Production Playwright workflow plus cloud lint, unit-test, type-check, and build gates
- No fabricated market prices; the app remains explicitly educational and not investment advice

## Commands

`npm run dev`, `npm run lint`, `npm test`, `npm run build`, `npm run test:e2e`, and `npm run seed` are supported. Set `BASE_URL` to override the production target used by Playwright or the safe API seed script.

See [architecture](docs/ARCHITECTURE.md), [API](docs/API.md), and [deployment](docs/DEPLOYMENT.md) documentation.
