import { z } from "zod";
import { blackScholes, impliedVolatility } from "@/lib/quant";

const inputSchema = z.object({
  kind: z.enum(["call", "put"]),
  spot: z.coerce.number().positive().max(10_000_000),
  strike: z.coerce.number().positive().max(10_000_000),
  days: z.coerce.number().positive().max(3650),
  volatilityPercent: z.coerce.number().positive().max(500),
  riskFreePercent: z.coerce.number().min(-20).max(100),
  dividendPercent: z.coerce.number().min(0).max(100).default(0),
  marketPrice: z.coerce.number().nonnegative().max(10_000_000).optional(),
});

function rounded(value: number) {
  return Number(value.toFixed(8));
}

export async function POST(request: Request) {
  const parsed = inputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Provide valid option inputs within the documented bounds." }, { status: 400 });
  const input = {
    kind: parsed.data.kind,
    spot: parsed.data.spot,
    strike: parsed.data.strike,
    years: parsed.data.days / 365,
    volatility: parsed.data.volatilityPercent / 100,
    riskFreeRate: parsed.data.riskFreePercent / 100,
    dividendYield: parsed.data.dividendPercent / 100,
  };
  try {
    const result = blackScholes(input);
    const implied = parsed.data.marketPrice === undefined ? null : impliedVolatility({ ...input, marketPrice: parsed.data.marketPrice });
    return Response.json({
      result: Object.fromEntries(Object.entries(result).map(([key, value]) => [key, rounded(value)])),
      impliedVolatilityPercent: implied === null ? null : rounded(implied * 100),
      assumptions: { model: "Black–Scholes–Merton", calendar: "365-day year", europeanExercise: true, continuousCompounding: true, continuousDividendYield: true },
      disclaimer: "Educational analytics only; not investment advice.",
    });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Calculation failed." }, { status: 400 });
  }
}
