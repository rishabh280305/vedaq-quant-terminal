import { describe, expect, it } from "vitest";
import { backtest, demoCandles, indicators } from "../src/lib/market";

describe("market research", () => {
  it("produces deterministic dated scenario data and indicators", () => { const candles=demoCandles(40); expect(candles).toHaveLength(40); expect(candles[0].date).toBe("2024-01-02"); expect(indicators(candles).rsi14[14]).not.toBeNull(); });
  it("executes signals one bar later and returns bounded metrics", () => { const output=backtest(demoCandles(),{shortWindow:12,longWindow:35,feeBps:5,slippageBps:8,initialCapital:100000}); expect(output.equity.length).toBe(259); expect(Number.isFinite(output.metrics.sharpe)).toBe(true); expect(output.metrics.maxDrawdownPct).toBeGreaterThanOrEqual(0); output.trades.forEach(trade=>expect(trade.date).toMatch(/^2024-/)); });
  it("rejects inverted windows", () => expect(()=>backtest(demoCandles(),{shortWindow:35,longWindow:12,feeBps:0,slippageBps:0,initialCapital:1000})).toThrow());
});
