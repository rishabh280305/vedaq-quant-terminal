export type OptionKind = "call" | "put";

export type BlackScholesInput = {
  kind: OptionKind;
  spot: number;
  strike: number;
  years: number;
  volatility: number;
  riskFreeRate: number;
  dividendYield?: number;
};

const SQRT_TWO_PI = Math.sqrt(2 * Math.PI);

export function normalPdf(value: number) {
  return Math.exp(-0.5 * value * value) / SQRT_TWO_PI;
}

export function normalCdf(value: number) {
  const sign = value < 0 ? -1 : 1;
  const x = Math.abs(value) / Math.sqrt(2);
  const t = 1 / (1 + 0.3275911 * x);
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const erf = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
  return 0.5 * (1 + sign * erf);
}

function assertInput(input: BlackScholesInput) {
  if (![input.spot, input.strike, input.years, input.volatility].every(Number.isFinite)) throw new Error("Inputs must be finite numbers.");
  if (input.spot <= 0 || input.strike <= 0 || input.years <= 0 || input.volatility <= 0) throw new Error("Spot, strike, time, and volatility must be positive.");
}

export function blackScholes(input: BlackScholesInput) {
  assertInput(input);
  const { kind, spot, strike, years, volatility, riskFreeRate } = input;
  const dividendYield = input.dividendYield ?? 0;
  const sqrtTime = Math.sqrt(years);
  const discountedSpot = spot * Math.exp(-dividendYield * years);
  const discountedStrike = strike * Math.exp(-riskFreeRate * years);
  const d1 = (Math.log(spot / strike) + (riskFreeRate - dividendYield + 0.5 * volatility ** 2) * years) / (volatility * sqrtTime);
  const d2 = d1 - volatility * sqrtTime;
  const call = discountedSpot * normalCdf(d1) - discountedStrike * normalCdf(d2);
  const put = discountedStrike * normalCdf(-d2) - discountedSpot * normalCdf(-d1);
  const commonTheta = -(discountedSpot * normalPdf(d1) * volatility) / (2 * sqrtTime);

  return {
    price: kind === "call" ? call : put,
    delta: kind === "call" ? Math.exp(-dividendYield * years) * normalCdf(d1) : Math.exp(-dividendYield * years) * (normalCdf(d1) - 1),
    gamma: (Math.exp(-dividendYield * years) * normalPdf(d1)) / (spot * volatility * sqrtTime),
    theta: kind === "call"
      ? commonTheta - riskFreeRate * discountedStrike * normalCdf(d2) + dividendYield * discountedSpot * normalCdf(d1)
      : commonTheta + riskFreeRate * discountedStrike * normalCdf(-d2) - dividendYield * discountedSpot * normalCdf(-d1),
    vega: discountedSpot * normalPdf(d1) * sqrtTime,
    rho: kind === "call" ? years * discountedStrike * normalCdf(d2) : -years * discountedStrike * normalCdf(-d2),
    d1,
    d2,
  };
}

export function impliedVolatility(input: Omit<BlackScholesInput, "volatility"> & { marketPrice: number }) {
  const dividendYield = input.dividendYield ?? 0;
  const discountedSpot = input.spot * Math.exp(-dividendYield * input.years);
  const discountedStrike = input.strike * Math.exp(-input.riskFreeRate * input.years);
  const lowerBound = input.kind === "call" ? Math.max(0, discountedSpot - discountedStrike) : Math.max(0, discountedStrike - discountedSpot);
  const upperBound = input.kind === "call" ? discountedSpot : discountedStrike;
  if (!Number.isFinite(input.marketPrice) || input.marketPrice < lowerBound || input.marketPrice > upperBound) {
    throw new Error(`Market price violates no-arbitrage bounds (${lowerBound.toFixed(4)}–${upperBound.toFixed(4)}).`);
  }

  let low = 0.000001;
  let high = 5;
  for (let iteration = 0; iteration < 160; iteration += 1) {
    const mid = (low + high) / 2;
    const price = blackScholes({ ...input, volatility: mid }).price;
    if (Math.abs(price - input.marketPrice) < 1e-8) return mid;
    if (price > input.marketPrice) high = mid;
    else low = mid;
  }
  return (low + high) / 2;
}
