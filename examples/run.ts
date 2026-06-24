import { assembleCouncil, step, loadConfig } from "../src/index.js";
import { frameFromQuotes } from "../src/regime/detector.js";

// Minimal embedding example: drive the council from your own data feed.
const cfg = loadConfig({ quorum: 3 });
const council = assembleCouncil(cfg);

const quotes = Array.from({ length: 20 }, (_, i) => ({
  ticker: "AAPL",
  address: "0x0000000000000000000000000000000000000000" as const,
  price: 220 + Math.sin(i / 4) * 3,
  ts: Date.now() - (20 - i) * 60000,
}));

const { verdict, proof } = await step(council, frameFromQuotes(quotes));
console.log(verdict.side, verdict.size, proof.verdictHash);
