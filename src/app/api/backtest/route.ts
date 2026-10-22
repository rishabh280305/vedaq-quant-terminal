import { z } from "zod";
import { backtest, demoCandles } from "@/lib/market";
import { getDemoUser } from "@/lib/session";

const schema = z.object({ shortWindow: z.number().int().min(2).max(50), longWindow: z.number().int().min(5).max(120), feeBps: z.number().min(0).max(100), slippageBps: z.number().min(0).max(100), initialCapital: z.number().min(100).max(10_000_000) });

export async function POST(request: Request) {
  if (!await getDemoUser()) return Response.json({ error: "Authentication required." }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success || parsed.data.shortWindow >= parsed.data.longWindow) return Response.json({ error: "Use valid windows with short < long, bounded costs, and positive capital." }, { status: 400 });
  return Response.json({ result: backtest(demoCandles(), parsed.data), provenance: "Deterministic synthetic VEDAQ-DEMO scenario; not market history." });
}
