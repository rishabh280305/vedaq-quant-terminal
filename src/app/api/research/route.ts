import { z } from "zod";
import { getDemoUser } from "@/lib/session";

const schema = z.object({ query: z.string().trim().min(2).max(120) });
const documents = [
  { id: "methodology", title: "Backtest methodology", source: "/docs/ARCHITECTURE.md", text: "Signals use completed prior bars and execute at the next open. Trading fees and slippage are charged on each side to prevent look-ahead bias." },
  { id: "options", title: "Options assumptions", source: "/docs/API.md", text: "Black-Scholes-Merton assumes lognormal prices, constant volatility and interest rates, European exercise, and continuous markets." },
  { id: "provenance", title: "Data provenance", source: "/api/market/demo", text: "The built-in VEDAQ-DEMO series is deterministic synthetic scenario data and is never described as live or historical provider data." },
];
export async function POST(request: Request) {
  if (!await getDemoUser()) return Response.json({ error: "Authentication required." }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => null)); if (!parsed.success) return Response.json({ error: "Enter a research query." }, { status: 400 });
  const tokens = parsed.data.query.toLowerCase().split(/\W+/).filter(Boolean);
  const results = documents.map(document => ({ ...document, score: tokens.reduce((score, token) => score + (document.title.toLowerCase().includes(token) ? 2 : 0) + (document.text.toLowerCase().includes(token) ? 1 : 0), 0) })).filter(item => item.score > 0).sort((a,b) => b.score-a.score);
  return Response.json({ mode: "retrieval-only", results, notice: "No LLM is configured. These are cited source excerpts, not generated advice." });
}
