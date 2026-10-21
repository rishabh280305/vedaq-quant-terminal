import { z } from "zod";
import { database } from "@/lib/db";
import { getDemoUser } from "@/lib/session";

const inputSchema = z.object({
  symbol: z.string().trim().toUpperCase().regex(/^[A-Z][A-Z0-9.-]{0,11}$/),
  note: z.string().trim().max(120).default(""),
});

export async function GET() {
  const userId = await getDemoUser();
  if (!userId) return Response.json({ error: "Authentication required." }, { status: 401 });
  const sql = await database();
  const items = await sql`SELECT id, symbol, note, created_at FROM vedaq.watchlist WHERE user_id = ${userId} ORDER BY created_at DESC`;
  return Response.json({ items, provenance: "User-entered symbols; no live price data is implied." });
}

export async function POST(request: Request) {
  const userId = await getDemoUser();
  if (!userId) return Response.json({ error: "Authentication required." }, { status: 401 });
  const parsed = inputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Enter a valid ticker symbol and an optional note under 120 characters." }, { status: 400 });
  const sql = await database();
  const [item] = await sql`INSERT INTO vedaq.watchlist (user_id, symbol, note)
    VALUES (${userId}, ${parsed.data.symbol}, ${parsed.data.note})
    ON CONFLICT (user_id, symbol) DO UPDATE SET note = EXCLUDED.note
    RETURNING id, symbol, note, created_at`;
  return Response.json({ item }, { status: 201 });
}

export async function DELETE(request: Request) {
  const userId = await getDemoUser();
  if (!userId) return Response.json({ error: "Authentication required." }, { status: 401 });
  const symbol = new URL(request.url).searchParams.get("symbol")?.toUpperCase();
  if (!symbol || !/^[A-Z][A-Z0-9.-]{0,11}$/.test(symbol)) return Response.json({ error: "A valid symbol is required." }, { status: 400 });
  const sql = await database();
  await sql`DELETE FROM vedaq.watchlist WHERE user_id = ${userId} AND symbol = ${symbol}`;
  return Response.json({ deleted: true });
}
