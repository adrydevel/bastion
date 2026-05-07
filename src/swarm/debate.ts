import type { Config } from "../config.js";
import type { MarketFrame, Proof, Verdict } from "../types.js";
import { Council } from "./council.js";
import { resolveProvider } from "../providers/router.js";
import { AnalystAgent } from "./agents/analyst.js";
import { SentimentAgent } from "./agents/sentiment.js";
import { RiskAgent } from "./agents/risk.js";
import { ContrarianAgent } from "./agents/contrarian.js";
import { ExecutorAgent } from "./agents/executor.js";
import { attest } from "../proof/attest.js";

// Wires the five agents onto the configured provider and runs one full
// research -> debate -> verdict -> proof pass for a market frame.
export function assembleCouncil(cfg: Config): Council {
  const llm = resolveProvider(cfg.provider);
  return new Council(
    [
      new AnalystAgent(llm),
      new SentimentAgent(llm),
      new RiskAgent(llm),
      new ContrarianAgent(llm),
      new ExecutorAgent(llm),
    ],
    cfg,
  );
}

export async function step(
  council: Council,
  frame: MarketFrame,
): Promise<{ verdict: Verdict; proof: Proof }> {
  const verdict = await council.decide(frame);
  const proof = attest(verdict, { window: frame.quotes.map((q) => q.price) });
  return { verdict, proof };
}
