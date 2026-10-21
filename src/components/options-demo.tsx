"use client";

import { FormEvent, useState } from "react";

type Result = { result: Record<string, number>; impliedVolatilityPercent: number | null; assumptions: Record<string, string | boolean>; disclaimer: string };

export function OptionsDemo() {
  const [form, setForm] = useState({ kind: "call", spot: "100", strike: "100", days: "365", volatilityPercent: "20", riskFreePercent: "5", dividendPercent: "0", marketPrice: "" });
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const update = (field: string, value: string) => setForm(current => ({ ...current, [field]: value }));

  async function calculate(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError("");
    const payload = { ...form, marketPrice: form.marketPrice === "" ? undefined : form.marketPrice };
    const response = await fetch("/api/options/calculate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const data = await response.json();
    if (response.ok) setResult(data); else { setResult(null); setError(data.error ?? "Calculation failed."); }
    setBusy(false);
  }

  const fields: [string, string, string][] = [["spot","Spot","100"],["strike","Strike","100"],["days","Days","365"],["volatilityPercent","Volatility %","20"],["riskFreePercent","Risk-free %","5"],["dividendPercent","Dividend %","0"],["marketPrice","Observed price (optional)","10.45"]];
  return <section className="mx-auto max-w-7xl px-6 pb-24" aria-labelledby="options-title"><div className="border border-emerald-400/20 bg-[#0b1213] p-6 md:p-8"><div className="border-b border-white/10 pb-5"><p className="font-mono text-xs tracking-[.2em] text-emerald-400">SERVER-SIDE QUANT ENGINE</p><h2 id="options-title" className="mt-2 text-3xl font-semibold">Black–Scholes laboratory</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">Real pricing, Greeks, and bisection-based implied volatility. European exercise, continuous rates, 365-day year. Educational only.</p></div><div className="grid gap-8 pt-6 lg:grid-cols-[1fr_1fr]"><form onSubmit={calculate} className="grid grid-cols-2 gap-4"><label className="col-span-2 block font-mono text-xs text-slate-400">OPTION TYPE<select value={form.kind} onChange={e=>update("kind",e.target.value)} className="mt-2 w-full border border-white/15 bg-[#070b0d] px-4 py-3 text-white"><option value="call">Call</option><option value="put">Put</option></select></label>{fields.map(([name,label,placeholder])=><label key={name} className={`${name==="marketPrice"?"col-span-2":""} block font-mono text-xs text-slate-400`}>{label.toUpperCase()}<input required={name!=="marketPrice"} type="number" step="any" value={form[name as keyof typeof form]} onChange={e=>update(name,e.target.value)} placeholder={placeholder} className="mt-2 w-full border border-white/15 bg-[#070b0d] px-4 py-3 text-white outline-none focus:border-emerald-300" /></label>)}<button disabled={busy} className="col-span-2 bg-emerald-300 px-5 py-3 font-mono text-sm font-bold text-[#07100b] disabled:opacity-50">{busy?"CALCULATING…":"CALCULATE"}</button>{error&&<p role="alert" className="col-span-2 text-sm text-red-300">{error}</p>}</form><div>{!result?<p className="border border-dashed border-white/15 p-5 text-slate-500">Run the model to inspect theoretical price and sensitivities.</p>:<div><div className="grid grid-cols-2 gap-px bg-white/10 sm:grid-cols-3">{[["Price",result.result.price],["Delta",result.result.delta],["Gamma",result.result.gamma],["Theta / year",result.result.theta],["Vega / 1.0 σ",result.result.vega],["Rho / 1.0 rate",result.result.rho]].map(([label,value])=><div key={String(label)} className="bg-[#070b0d] p-4"><p className="font-mono text-[10px] text-slate-500">{label}</p><p className="mt-2 font-mono text-lg text-emerald-200">{Number(value).toFixed(4)}</p></div>)}</div>{result.impliedVolatilityPercent!==null&&<p className="mt-4 border-l-2 border-emerald-300 bg-emerald-300/5 p-4 text-sm">Implied volatility: <strong>{result.impliedVolatilityPercent.toFixed(4)}%</strong></p>}<p className="mt-4 text-xs leading-5 text-slate-500">{result.disclaimer}</p></div>}</div></div></div></section>;
}
