import type { MarketFrame, Regime, StockTokenQuote } from "../types.js";
export declare function detectRegime(quotes: StockTokenQuote[]): Regime;
export declare function frameFromQuotes(quotes: StockTokenQuote[]): MarketFrame;
