# VEDAQ Quantitative Finance Terminal

VEDAQ is a transparent quantitative-research terminal for US and Indian equities and derivatives. The deployed Phase 0 shell is honest about its development state and exposes a live health endpoint.

## Current scope

- Distinct responsive trading-workstation landing page
- `GET /api/health` with a non-cached server timestamp
- No fabricated live prices; provider-backed data and dated demo datasets arrive in later phases

## Development

Requires Node.js 22+. Run `npm install`, then `npm run dev`. Production builds use `npm run build`.

## Safety

Financial analytics are research tools, not investment advice. Never commit `.env` files; copy `.env.example` locally when integrations are added.
