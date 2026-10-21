import { describe, expect, it } from "vitest";
import { blackScholes, impliedVolatility } from "../src/lib/quant";

describe("Black–Scholes", () => {
  it("matches the canonical at-the-money benchmark", () => {
    const base = { spot: 100, strike: 100, years: 1, volatility: 0.2, riskFreeRate: 0.05 };
    expect(blackScholes({ ...base, kind: "call" }).price).toBeCloseTo(10.4506, 3);
    expect(blackScholes({ ...base, kind: "put" }).price).toBeCloseTo(5.5735, 3);
  });

  it("respects put-call parity", () => {
    const base = { spot: 120, strike: 100, years: 0.75, volatility: 0.3, riskFreeRate: 0.04, dividendYield: 0.01 };
    const call = blackScholes({ ...base, kind: "call" }).price;
    const put = blackScholes({ ...base, kind: "put" }).price;
    expect(call - put).toBeCloseTo(base.spot * Math.exp(-base.dividendYield * base.years) - base.strike * Math.exp(-base.riskFreeRate * base.years), 7);
  });

  it("recovers volatility through bisection", () => {
    const base = { kind: "call" as const, spot: 100, strike: 105, years: 0.5, riskFreeRate: 0.03 };
    const marketPrice = blackScholes({ ...base, volatility: 0.27 }).price;
    expect(impliedVolatility({ ...base, marketPrice })).toBeCloseTo(0.27, 6);
  });
});
