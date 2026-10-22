import { demoCandles, indicators } from "@/lib/market";
import { getDemoUser } from "@/lib/session";

export async function GET() {
  if (!await getDemoUser()) return Response.json({ error: "Authentication required." }, { status: 401 });
  const candles = demoCandles();
  return Response.json({
    symbol: "VEDAQ-DEMO",
    candles,
    indicators: indicators(candles),
    provenance: { kind: "deterministic-synthetic-scenario", generatedBy: "src/lib/market.ts", dateRange: [candles[0].date, candles.at(-1)?.date], live: false },
    disclaimer: "Research demonstration only. Not investment advice and not historical market data.",
  });
}
