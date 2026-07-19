import { Command } from "commander";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadConfig } from "../config.js";
import { assembleCouncil } from "../swarm/debate.js";
import { RobinhoodChain } from "../chain/robinhood.js";
import { anchor } from "../proof/onchain.js";
import { attest } from "../proof/attest.js";
import { frameFromQuotes } from "../regime/detector.js";
import { resolveProvider } from "../providers/router.js";
import { Recorder } from "../replay/recorder.js";
import { buildCassette, loadCassette, resolveCassette, saveCassette, CASSETTE_DIR } from "../replay/cassette.js";
import { replayCassette } from "../replay/verify.js";
import { banner, printVerdict, printReplay, note, warn } from "./ui.js";
import type { StockTokenQuote } from "../types.js";

const VERSION = "0.5.1";

// Ships inside the package, so `bastion replay --demo` needs no files, no
// network and no key.
const DEMO_CASSETTE = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  "examples",
  "demo-cassette.json",
);

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
    .option("--offline", "use the deterministic heuristic instead of a model (no key needed)")
    .option("--record", "write a replayable cassette of this decision")
    .option("--dir <dir>", "cassette directory", CASSETTE_DIR)
    .action(async (opts) => {
      banner();
      const cfg = loadConfig(opts.offline ? { provider: "offline" } : {});
      if (opts.offline) {
        warn("offline mode — deterministic heuristic over a synthetic window; no model, no market data");
      }

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
    .argument("[ref]", "verdict hash prefix, or a path to a cassette")
    .option("--demo", "replay the cassette bundled with this install")
    .option("--dir <dir>", "cassette directory", CASSETTE_DIR)
    .option("--live", "re-query the model instead of the transcript, to measure drift")
    .action(async (ref: string | undefined, opts) => {
      banner();

      if (!opts.demo && !ref) {
        throw new Error("pass a cassette reference, or --demo to use the bundled one");
      }
      const cassette = opts.demo ? loadCassette(DEMO_CASSETTE) : resolveCassette(ref!, opts.dir);

      const result = await replayCassette(
        cassette,
        opts.live ? { llmFor: () => resolveProvider(cassette.config.provider) } : {},
      );

      printReplay(cassette, result);
      if (!result.ok) process.exitCode = 1;
    });

  return program;
}

// Synthetic price window so `bastion run` works without keys or an RPC.
//
// This is NOT market data. It is seeded from the ticker so each symbol gets
// its own distinct series — a demo that printed the same verdict for every
// ticker would be worse than no demo at all. Deterministic by construction,
// so a pass recorded against it replays exactly.
function demoWindow(ticker: string): StockTokenQuote[] {
  const seed = fnv1a(ticker);
  const base = 40 + (seed % 26000) / 100;
  const phase = (seed % 628) / 100;
  const amp = 0.003 + ((seed >>> 8) % 60) / 10000;
  const drift = (((seed >>> 16) % 200) - 100) / 200000;

  const out: StockTokenQuote[] = [];
  let p = base;
  for (let i = 0; i < 24; i++) {
    p *= 1 + Math.sin(i / 3 + phase) * amp + drift;
    out.push({
      ticker,
      address: "0x0000000000000000000000000000000000000000",
      price: p,
      ts: Date.now() - (24 - i) * 60000,
    });
  }
  return out;
}

function fnv1a(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h;
}
