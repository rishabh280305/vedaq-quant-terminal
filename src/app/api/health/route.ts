export const dynamic = "force-dynamic";

export function GET() {
  return Response.json({ service: "vedaq-quant-terminal", status: "ok", stage: "development", timestamp: new Date().toISOString() }, { headers: { "Cache-Control": "no-store" } });
}
