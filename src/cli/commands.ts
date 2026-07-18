import { Command } from "commander";
import { loadConfig } from "../config.js";
import { assembleCouncil } from "../swarm/debate.js";
import { RobinhoodChain } from "../chain/robinhood.js";
import { anchor } from "../proof/onchain.js";
import { attest } from "../proof/attest.js";
import { frameFromQuotes } from "../regime/detector.js";
import { resolveProvider } from "../providers/router.js";
import { Recorder } from "../replay/recorder.js";
import { buildCassette, resolveCassette, saveCassette, CASSETTE_DIR } from "../replay/cassette.js";
import { replayCassette } from "../replay/verify.js";
import { banner, printVerdict, printReplay, note } from "./ui.js";
import type { StockTokenQuote } from "../types.js";

const VERSION = "0.5.0";

export function buildProgram(): Command {
  const program = new Command();
  program
    .name("bastion")
    .description("Autonomous, verifiable AI fund on Robinhood Chain")
    .version(VERSION);

  program
    .command("run")
    .description("run one research -> debate -> verdict -> proof pass")
    .option("-t, --ticker <ticker>", "tokenized stock to evaluate", "NVDA")
    .option("--record", "write a replayable cassette of this decision")
    .option("--dir <dir>", "cassette directory", CASSETTE_DIR)
    .action(async (opts) => {
      banner();
      const cfg = loadConfig();
      const chain = new RobinhoodChain(cfg);
      const quotes = demoWindow(opts.ticker);
      const frame = frameFromQuotes(quotes);

      const recorder = opts.record ? new Recorder(resolveProvider(cfg.provider)) : undefined;
      const council = assembleCouncil(cfg, recorder ? (a) => recorder.for(a) : undefined);

      const verdict = await council.decide(frame);
      const proof = attest(verdict, { window: frame.quotes.map((q) => q.price) });
      const anchored = cfg.attestOnchain ? await anchor(chain, proof) : proof;
      printVerdict(verdict, anchored);

      if (recorder) {
        const cassette = buildCassette({
          version: VERSION,
          config: cfg,
          ticker: frame.ticker,
          quotes,
          exchanges: recorder.exchanges,
          verdict,
          proof,
          recordedAt: Date.now(),
        });
        const path = saveCassette(cassette, opts.dir);
        note(`recorded ${path}`);
        note(`replay with  bastion replay ${proof.verdictHash.slice(2, 10)}`);
      }
    });

  program
    .command("replay")
    .description("re-derive a recorded decision and verify it byte-for-byte")
    .argument("<ref>", "verdict hash prefix, or a path to a cassette")
    .option("--dir <dir>", "cassette directory", CASSETTE_DIR)
    .option("--live", "re-query the model instead of the transcript, to measure drift")
    .action(async (ref: string, opts) => {
      banner();
      const cassette = resolveCassette(ref, opts.dir);
      const cfg = cassette.config;

      const result = await replayCassette(
        cassette,
        opts.live ? { llmFor: () => resolveProvider(cfg.provider) } : {},
      );

      printReplay(cassette, result);
      if (!result.ok) process.exitCode = 1;
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
