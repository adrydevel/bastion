// Shared domain types for the Bastion trading agent.

export type Ticker = string; // e.g. "NVDA", "AAPL"

export interface StockTokenQuote {
  ticker: Ticker;
  address: `0x${string}`;
  price: number;      // NAV from the on-chain oracle
  ts: number;         // unix ms
}

export type Side = "long" | "short" | "flat";

export interface MarketFrame {
  ticker: Ticker;
  quotes: StockTokenQuote[]; // recent window, oldest -> newest
  regime: Regime;
}

export type Regime = "trend_up" | "trend_down" | "chop" | "high_vol";

export interface AgentOpinion {
  agent: string;
  side: Side;
  confidence: number; // 0..1
  rationale: string;
}

export interface Verdict {
  ticker: Ticker;
  side: Side;
  size: number;        // fraction of equity, post risk-kernel
  quorum: number;      // votes in favour
  opinions: AgentOpinion[];
  regime: Regime;
}

export interface Proof {
  verdictHash: `0x${string}`;
  featuresHash: `0x${string}`;
  attestedAt: number;
  txHash?: `0x${string}`;
}
