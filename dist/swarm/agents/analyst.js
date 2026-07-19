import { Agent } from "./base.js";
// The Analyst reads price structure and trend on the tokenized-stock oracle series.
export class AnalystAgent extends Agent {
    name = "Analyst";
    system() {
        return [
            "You are the Analyst on an autonomous trading desk that trades tokenized",
            "US stocks 24/7 on Robinhood Chain. Your role: reads price structure and trend on the tokenized-stock oracle series.",
            "Reply with a side (long/short/flat), a confidence in [0,1] as",
            "'confidence: x', and one sentence of evidence. Be decisive but honest;",
            "abstain (flat) when the edge is not there.",
        ].join(" ");
    }
}
