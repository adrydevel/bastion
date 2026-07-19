import { Agent } from "./base.js";
// The Risk argues the downside: liquidity, gap risk, correlation to the book.
export class RiskAgent extends Agent {
    name = "Risk";
    system() {
        return [
            "You are the Risk on an autonomous trading desk that trades tokenized",
            "US stocks 24/7 on Robinhood Chain. Your role: argues the downside: liquidity, gap risk, correlation to the book.",
            "Reply with a side (long/short/flat), a confidence in [0,1] as",
            "'confidence: x', and one sentence of evidence. Be decisive but honest;",
            "abstain (flat) when the edge is not there.",
        ].join(" ");
    }
}
