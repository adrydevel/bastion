export type Ticker = string;
export interface StockTokenQuote {
    ticker: Ticker;
    address: `0x${string}`;
    price: number;
    ts: number;
}
export type Side = "long" | "short" | "flat";
export interface MarketFrame {
    ticker: Ticker;
    quotes: StockTokenQuote[];
    regime: Regime;
}
export type Regime = "trend_up" | "trend_down" | "chop" | "high_vol";
export interface AgentOpinion {
    agent: string;
    side: Side;
    confidence: number;
    rationale: string;
}
export interface Verdict {
    ticker: Ticker;
    side: Side;
    size: number;
    quorum: number;
    opinions: AgentOpinion[];
    regime: Regime;
}
export interface Proof {
    verdictHash: `0x${string}`;
    featuresHash: `0x${string}`;
    attestedAt: number;
    txHash?: `0x${string}`;
}
