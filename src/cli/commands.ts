import { Command } from "commander";
import { loadConfig } from "../config.js";
import { assembleCouncil, step } from "../swarm/debate.js";
import { RobinhoodChain } from "../chain/robinhood.js";
import { anchor } from "../proof/onchain.js";
import { frameFromQuotes } from "../regime/detector.js";
import { banner, printVerdict } from "./ui.js";
import type { StockTokenQuote } from "../types.js";

export function buildProgram(): Command {
  const program = new Command();
  program
    .name("bastion")
    .description("Autonomous, verifiable AI fund on Robinhood Chain")
    .version("0.4.2");

  program
    .command("run")
    .description("run one research -> debate -> verdict -> proof pass")
    .option("-t, --ticker <ticker>", "tokenized stock to evaluate", "NVDA")
    .action(async (opts) => {
      banner();
      const cfg = loadConfig();
      const council = assembleCouncil(cfg);
      const chain = new RobinhoodChain(cfg);
      const quotes = demoWindow(opts.ticker);
      const frame = frameFromQuotes(quotes);
      const { verdict, proof } = await step(council, frame);
      const anchored = cfg.attestOnchain ? await anchor(chain, proof) : proof;
      printVerdict(verdict, anchored);
    });

  return program;
}

// Deterministic demo series so `bastion run` works without keys.
function demoWindow(ticker: string): StockTokenQuote[] {
  const out: StockTokenQuote[] = [];
  let p = 100;
  for (let i = 0; i < 24; i++) {
    p *= 1 + Math.sin(i / 3) * 0.006;
    out.push({ ticker, address: "0x0000000000000000000000000000000000000000", price: p, ts: Date.now() - (24 - i) * 60000 });
  }
  return out;
}
