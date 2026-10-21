"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";

type WatchlistItem = { id: string; symbol: string; note: string; created_at: string };

export function WatchlistDemo() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [symbol, setSymbol] = useState("");
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const response = await fetch("/api/watchlist", { cache: "no-store" });
    if (response.status === 401) return setAuthenticated(false);
    if (!response.ok) throw new Error("Could not load the watchlist.");
    const data = await response.json();
    setItems(data.items);
    setAuthenticated(true);
  }, []);

  useEffect(() => {
    const task = window.setTimeout(() => { void load().catch(() => { setAuthenticated(false); setMessage("The workspace is temporarily unavailable."); }); }, 0);
    return () => window.clearTimeout(task);
  }, [load]);

  async function enterWorkspace() {
    setBusy(true); setMessage("");
    const response = await fetch("/api/auth/demo", { method: "POST" });
    if (response.ok) await load(); else setMessage("Demo sign-in is unavailable.");
    setBusy(false);
  }

  async function save(event: FormEvent) {
    event.preventDefault(); setBusy(true); setMessage("");
    const response = await fetch("/api/watchlist", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ symbol, note }) });
    const data = await response.json();
    if (response.ok) { setSymbol(""); setNote(""); setMessage(`${data.item.symbol} saved.`); await load(); }
    else setMessage(data.error ?? "Could not save the symbol.");
    setBusy(false);
  }

  async function remove(symbolToDelete: string) {
    setBusy(true); setMessage("");
    const response = await fetch(`/api/watchlist?symbol=${encodeURIComponent(symbolToDelete)}`, { method: "DELETE" });
    if (response.ok) { setMessage(`${symbolToDelete} removed.`); await load(); } else setMessage("Could not remove the symbol.");
    setBusy(false);
  }

  return <section className="mx-auto max-w-7xl px-6 pb-24" aria-labelledby="watchlist-title">
    <div className="border border-emerald-400/20 bg-[#0b1213] p-6 md:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-5"><div><p className="font-mono text-xs tracking-[.2em] text-emerald-400">PERSISTENT CORE WORKFLOW</p><h2 id="watchlist-title" className="mt-2 text-3xl font-semibold">Research watchlist</h2></div><span className="font-mono text-xs text-slate-500">Neon Postgres · signed demo session</span></div>
      {authenticated === null ? <p className="py-10 text-slate-400">Opening workspace…</p> : !authenticated ? <div className="py-10"><p className="max-w-xl text-slate-400">Use the isolated demo account to save ticker ideas. Symbols are user-entered metadata—no market price or recommendation is implied.</p><button onClick={enterWorkspace} disabled={busy} className="mt-5 bg-emerald-300 px-5 py-3 font-mono text-sm font-bold text-[#07100b] disabled:opacity-50">{busy ? "OPENING…" : "ENTER DEMO WORKSPACE"}</button></div> : <div className="grid gap-8 pt-6 lg:grid-cols-[.8fr_1.2fr]">
        <form onSubmit={save} className="space-y-4"><label className="block font-mono text-xs text-slate-400">TICKER<input required value={symbol} onChange={e=>setSymbol(e.target.value.toUpperCase())} placeholder="RELIANCE" className="mt-2 w-full border border-white/15 bg-[#070b0d] px-4 py-3 text-base text-white outline-none focus:border-emerald-300" /></label><label className="block font-mono text-xs text-slate-400">RESEARCH NOTE<input value={note} maxLength={120} onChange={e=>setNote(e.target.value)} placeholder="Optional thesis note" className="mt-2 w-full border border-white/15 bg-[#070b0d] px-4 py-3 text-base text-white outline-none focus:border-emerald-300" /></label><button disabled={busy} className="bg-emerald-300 px-5 py-3 font-mono text-sm font-bold text-[#07100b] disabled:opacity-50">{busy ? "SAVING…" : "SAVE SYMBOL"}</button>{message && <p role="status" className="text-sm text-amber-200">{message}</p>}</form>
        <div><p className="mb-3 font-mono text-xs text-slate-500">SAVED SYMBOLS</p>{items.length === 0 ? <p className="border border-dashed border-white/15 p-5 text-slate-500">No symbols yet. Add the first research idea.</p> : <div className="space-y-2">{items.map(item=><div key={item.id} className="flex items-center justify-between gap-4 border border-white/10 bg-[#070b0d] p-4"><div><p className="font-mono font-bold text-emerald-300">{item.symbol}</p><p className="mt-1 text-sm text-slate-400">{item.note || "No note"}</p></div><button disabled={busy} onClick={()=>remove(item.symbol)} className="font-mono text-xs text-slate-500 hover:text-red-300">REMOVE</button></div>)}</div>}</div>
      </div>}
      {!authenticated && message && <p role="status" className="pb-5 text-sm text-amber-200">{message}</p>}
    </div>
  </section>;
}
