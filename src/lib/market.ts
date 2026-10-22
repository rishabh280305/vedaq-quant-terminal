export type Candle = { date: string; open: number; high: number; low: number; close: number; volume: number };

export type BacktestConfig = {
  shortWindow: number;
  longWindow: number;
  feeBps: number;
  slippageBps: number;
  initialCapital: number;
};

export function demoCandles(days = 260): Candle[] {
  const start = Date.UTC(2024, 0, 2);
  let previous = 100;
  return Array.from({ length: days }, (_, index) => {
    const trend = 0.00032;
    const cycle = Math.sin(index / 13) * 0.006 + Math.cos(index / 29) * 0.003;
    const shock = (((index * 37) % 17) - 8) / 4200;
    const open = previous;
    const close = open * (1 + trend + cycle + shock);
    const spread = 0.004 + Math.abs(Math.sin(index / 7)) * 0.006;
    previous = close;
    return {
      date: new Date(start + index * 86_400_000).toISOString().slice(0, 10),
      open: round(open), high: round(Math.max(open, close) * (1 + spread)),
      low: round(Math.min(open, close) * (1 - spread)), close: round(close),
      volume: 750_000 + ((index * 97_531) % 900_000),
    };
  });
}

function round(value: number, digits = 4) { return Number(value.toFixed(digits)); }

export function sma(values: number[], window: number) {
  return values.map((_, index) => index + 1 < window ? null : round(values.slice(index + 1 - window, index + 1).reduce((a, b) => a + b, 0) / window));
}

export function ema(values: number[], window: number) {
  const alpha = 2 / (window + 1);
  const output: number[] = [];
  values.forEach((value, index) => output.push(round(index === 0 ? value : value * alpha + output[index - 1] * (1 - alpha))));
  return output;
}

export function rsi(values: number[], window = 14) {
  return values.map((_, index) => {
    if (index < window) return null;
    const changes = values.slice(index + 1 - window, index + 1).map((value, offset) => value - values[index - window + offset]);
    const gain = changes.reduce((sum, change) => sum + Math.max(change, 0), 0) / window;
    const loss = changes.reduce((sum, change) => sum + Math.max(-change, 0), 0) / window;
    return loss === 0 ? 100 : round(100 - 100 / (1 + gain / loss), 2);
  });
}

export function indicators(candles: Candle[]) {
  const closes = candles.map(candle => candle.close);
  const fast = ema(closes, 12);
  const slow = ema(closes, 26);
  const macd = fast.map((value, index) => round(value - slow[index]));
  const signal = ema(macd, 9);
  const middle = sma(closes, 20);
  const bands = closes.map((_, index) => {
    if (index < 19) return { upper: null, lower: null };
    const slice = closes.slice(index - 19, index + 1);
    const mean = middle[index] as number;
    const deviation = Math.sqrt(slice.reduce((sum, value) => sum + (value - mean) ** 2, 0) / slice.length);
    return { upper: round(mean + deviation * 2), lower: round(mean - deviation * 2) };
  });
  const returns = closes.slice(1).map((value, index) => Math.log(value / closes[index]));
  const annualizedVolatility = returns.length < 2 ? 0 : Math.sqrt(252) * Math.sqrt(returns.reduce((sum, value) => sum + (value - returns.reduce((a, b) => a + b, 0) / returns.length) ** 2, 0) / (returns.length - 1));
  return { sma20: middle, ema12: fast, rsi14: rsi(closes), macd, signal, bands, annualizedVolatility: round(annualizedVolatility * 100, 2) };
}

export function backtest(candles: Candle[], config: BacktestConfig) {
  if (config.shortWindow >= config.longWindow) throw new Error("Short window must be smaller than long window.");
  const closes = candles.map(candle => candle.close);
  const short = sma(closes, config.shortWindow);
  const long = sma(closes, config.longWindow);
  let cash = config.initialCapital;
  let shares = 0;
  const trades: Array<{ date: string; side: "buy" | "sell"; price: number; quantity: number }> = [];
  const equity: Array<{ date: string; value: number }> = [];
  const costRate = (config.feeBps + config.slippageBps) / 10_000;
  for (let index = 1; index < candles.length; index += 1) {
    const executionPrice = candles[index].open;
    const crossedUp = short[index - 1] !== null && long[index - 1] !== null && short[index - 2] !== null && long[index - 2] !== null && short[index - 2]! <= long[index - 2]! && short[index - 1]! > long[index - 1]!;
    const crossedDown = short[index - 1] !== null && long[index - 1] !== null && short[index - 2] !== null && long[index - 2] !== null && short[index - 2]! >= long[index - 2]! && short[index - 1]! < long[index - 1]!;
    if (crossedUp && shares === 0) {
      const quantity = cash / (executionPrice * (1 + costRate));
      cash -= quantity * executionPrice * (1 + costRate); shares = quantity;
      trades.push({ date: candles[index].date, side: "buy", price: round(executionPrice), quantity: round(quantity, 6) });
    } else if (crossedDown && shares > 0) {
      cash += shares * executionPrice * (1 - costRate);
      trades.push({ date: candles[index].date, side: "sell", price: round(executionPrice), quantity: round(shares, 6) }); shares = 0;
    }
    equity.push({ date: candles[index].date, value: round(cash + shares * candles[index].close, 2) });
  }
  const values = equity.map(point => point.value);
  const returns = values.slice(1).map((value, index) => value / values[index] - 1);
  const mean = returns.length ? returns.reduce((a, b) => a + b, 0) / returns.length : 0;
  const deviation = returns.length > 1 ? Math.sqrt(returns.reduce((sum, value) => sum + (value - mean) ** 2, 0) / (returns.length - 1)) : 0;
  let peak = config.initialCapital; let maxDrawdown = 0;
  values.forEach(value => { peak = Math.max(peak, value); maxDrawdown = Math.max(maxDrawdown, (peak - value) / peak); });
  const finalEquity = values.at(-1) ?? config.initialCapital;
  return { equity, trades, metrics: { finalEquity, totalReturnPct: round((finalEquity / config.initialCapital - 1) * 100, 2), maxDrawdownPct: round(maxDrawdown * 100, 2), sharpe: deviation ? round(mean / deviation * Math.sqrt(252), 2) : 0, tradeCount: trades.length }, execution: "Signals use prior-close data; orders execute at the next open. Fees and slippage are applied per side." };
}
