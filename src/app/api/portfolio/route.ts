import { z } from "zod";
import { database } from "@/lib/db";
import { getDemoUser } from "@/lib/session";

const schema = z.object({ symbol: z.string().trim().toUpperCase().regex(/^[A-Z][A-Z0-9.-]{0,11}$/), side: z.enum(["buy", "sell"]), quantity: z.number().positive().max(1_000_000), price: z.number().positive().max(100_000_000), tradedAt: z.iso.date() });

export async function GET() {
  const userId = await getDemoUser(); if (!userId) return Response.json({ error: "Authentication required." }, { status: 401 });
  const sql = await database();
  const transactions = await sql`SELECT id, symbol, side, quantity::float8, price::float8, traded_at, created_at FROM vedaq.portfolio_transactions WHERE user_id = ${userId} ORDER BY traded_at DESC, id DESC`;
  const positions = await sql`SELECT symbol, SUM(CASE WHEN side='buy' THEN quantity ELSE -quantity END)::float8 AS quantity, SUM(CASE WHEN side='buy' THEN quantity * price ELSE -quantity * price END)::float8 AS net_cash_invested FROM vedaq.portfolio_transactions WHERE user_id = ${userId} GROUP BY symbol ORDER BY symbol`;
  return Response.json({ transactions, positions, valuation: "Cost-ledger only; no live mark-to-market provider is configured." });
}

export async function POST(request: Request) {
  const userId = await getDemoUser(); if (!userId) return Response.json({ error: "Authentication required." }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => null)); if (!parsed.success) return Response.json({ error: "Enter a valid symbol, side, quantity, price, and ISO trade date." }, { status: 400 });
  const sql = await database(); const data = parsed.data;
  if (data.side === "sell") { const [position] = await sql`SELECT COALESCE(SUM(CASE WHEN side='buy' THEN quantity ELSE -quantity END),0)::float8 quantity FROM vedaq.portfolio_transactions WHERE user_id=${userId} AND symbol=${data.symbol}`; if (Number(position.quantity) < data.quantity) return Response.json({ error: "Sell quantity exceeds the recorded position." }, { status: 409 }); }
  const [transaction] = await sql`INSERT INTO vedaq.portfolio_transactions (user_id,symbol,side,quantity,price,traded_at) VALUES (${userId},${data.symbol},${data.side},${data.quantity},${data.price},${data.tradedAt}) RETURNING id,symbol,side,quantity::float8,price::float8,traded_at,created_at`;
  return Response.json({ transaction }, { status: 201 });
}
