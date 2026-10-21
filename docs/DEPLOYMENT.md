# Deployment

Vercel installs dependencies and runs `npm run build` after each push to `main`. Required production and preview variables are `DATABASE_URL` (managed Neon connection) and a high-entropy `AUTH_SECRET`. `MARKET_DATA_API_KEY` is intentionally unset until a legitimate provider is selected.

Run the manual **Production E2E** GitHub workflow after a production deployment. It installs Chromium on a cloud runner and exercises the real options interface at `https://vedaq-quant-terminal.vercel.app`.
