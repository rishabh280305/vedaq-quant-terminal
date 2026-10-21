import { WatchlistDemo } from "@/components/watchlist-demo";

const metrics = [["NIFTY 50", "Demo dataset"], ["S&P 500", "Demo dataset"], ["Options engine", "Black–Scholes"], ["Backtester", "Time-aware"]];

export default function Home() {
  return <main className="min-h-screen bg-[#070b0d] text-[#e7f5ee]">
    <nav className="border-b border-emerald-400/20 px-6 py-4"><div className="mx-auto flex max-w-7xl items-center justify-between"><div className="font-mono text-xl font-bold tracking-[.25em] text-emerald-300">VEDAQ</div><span className="rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1 font-mono text-xs text-amber-200">DEVELOPMENT IN PROGRESS</span></div></nav>
    <section className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-[1.1fr_.9fr] lg:py-28">
      <div><p className="mb-5 font-mono text-sm tracking-[.2em] text-emerald-400">QUANTITATIVE RESEARCH / INDIA + US</p><h1 className="max-w-3xl text-5xl font-semibold leading-[1.05] tracking-tight md:text-7xl">Markets, models and risk—without the black box.</h1><p className="mt-7 max-w-2xl text-lg leading-8 text-slate-400">A research terminal for reproducible signals, options analytics, backtests and portfolio risk. Provider provenance and timestamps stay visible by design.</p><a className="mt-9 inline-flex bg-emerald-300 px-5 py-3 font-mono text-sm font-bold text-[#07100b]" href="/api/health">CHECK SYSTEM HEALTH →</a></div>
      <div className="border border-emerald-400/20 bg-[#0b1213] p-5 shadow-2xl shadow-emerald-950/40"><div className="mb-5 flex items-center justify-between border-b border-white/10 pb-4 font-mono text-xs text-slate-500"><span>VEDAQ // SYSTEM OVERVIEW</span><span className="text-emerald-400">● ONLINE</span></div><div className="grid gap-px bg-white/10 sm:grid-cols-2">{metrics.map(([name, value]) => <div className="bg-[#0b1213] p-5" key={name}><p className="font-mono text-xs text-slate-500">{name}</p><p className="mt-2 text-lg text-slate-100">{value}</p></div>)}</div><div className="mt-5 border-l-2 border-amber-300 bg-amber-300/5 p-4 text-sm leading-6 text-amber-100/80">No live prices are shown until a legitimate data provider is connected. Demo datasets will be labeled with source and date. Not investment advice.</div></div>
    </section>
    <WatchlistDemo />
  </main>;
}
