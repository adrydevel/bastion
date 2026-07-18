import type { Config } from "../config.js";
import type { MarketFrame, Proof, Verdict } from "../types.js";
import type { LLM } from "../providers/hermes.js";
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
//
// `llmFor` overrides the provider per agent. Recording and replay both hang
// off this seam, which is why it takes an agent name rather than a single
// shared client.
export function assembleCouncil(
  cfg: Config,
  llmFor?: (agent: string) => LLM,
): Council {
  const pick = (agent: string): LLM =>
    llmFor ? llmFor(agent) : resolveProvider(cfg.provider);
  return new Council(
    [
      new AnalystAgent(pick("Analyst")),
      new SentimentAgent(pick("Sentiment")),
      new RiskAgent(pick("Risk")),
      new ContrarianAgent(pick("Contrarian")),
      new ExecutorAgent(pick("Executor")),
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
