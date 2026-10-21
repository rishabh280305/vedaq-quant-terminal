const baseUrl = process.env.BASE_URL ?? "https://vedaq-quant-terminal.vercel.app";
const auth = await fetch(`${baseUrl}/api/auth/demo`, { method: "POST" });
if (!auth.ok) throw new Error(`Demo authentication failed: HTTP ${auth.status}`);
const cookie = auth.headers.get("set-cookie")?.split(";")[0];
if (!cookie) throw new Error("Demo session cookie was not returned");
const response = await fetch(`${baseUrl}/api/watchlist`, { method: "POST", headers: { "Content-Type": "application/json", Cookie: cookie }, body: JSON.stringify({ symbol: "DEMO", note: "Clearly labeled synthetic seed entry" }) });
if (!response.ok) throw new Error(`Seed failed: HTTP ${response.status} ${await response.text()}`);
console.log("Seeded the labeled DEMO watchlist entry through the authenticated production API.");
