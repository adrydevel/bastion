import type { MarketFrame, Regime, StockTokenQuote } from "../types.js";

// Lightweight regime classifier: trend via log-return drift, volatility via
// rolling stdev, chop when neither dominates. A full HMM lives behind the
// same interface in the research branch.
export function detectRegime(quotes: StockTokenQuote[]): Regime {
  if (quotes.length < 8) return "chop";
  const rets: number[] = [];
  for (let i = 1; i < quotes.length; i++) {
    const p0 = quotes[i - 1]!.price;
    const p1 = quotes[i]!.price;
    if (p0 > 0) rets.push(Math.log(p1 / p0));
  }
  const mean = rets.reduce((s, r) => s + r, 0) / rets.length;
  const variance = rets.reduce((s, r) => s + (r - mean) ** 2, 0) / rets.length;
  const vol = Math.sqrt(variance);

  if (vol > 0.02) return "high_vol";
  if (mean > vol * 0.5) return "trend_up";
  if (mean < -vol * 0.5) return "trend_down";
  return "chop";
}

export function frameFromQuotes(quotes: StockTokenQuote[]): MarketFrame {
  return {
    ticker: quotes[quotes.length - 1]?.ticker ?? "",
    quotes,
    regime: detectRegime(quotes),
  };
}
