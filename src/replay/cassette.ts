import { mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { Config } from "../config.js";
import type { Proof, StockTokenQuote, Verdict } from "../types.js";
import { digest } from "./canonical.js";

export const CASSETTE_SCHEMA = 1;
export const CASSETTE_DIR = ".bastion/cassettes";

// One model call, captured verbatim. The council's reasoning is the only
// non-deterministic step in the pipeline, so replay reproduces it from the
// transcript rather than pretending sampling is repeatable.
export interface Exchange {
  agent: string;
  system: string;
  user: string;
  response: string;
}

export interface Cassette {
  schema: number;
  version: string;
  recordedAt: number;
  config: Config;
  input: { ticker: string; quotes: StockTokenQuote[] };
  exchanges: Exchange[];
  verdict: Verdict;
  proof: Proof;
  inputHash: `0x${string}`;
}

// The input hash covers exactly what a replay is *handed*: config, market
// window and model transcript. It deliberately excludes the verdict — replay
// recomputes that, so a cassette whose verdict was edited after the fact
// still hashes fine here and then fails the verdict check. Tampering has to
// show up somewhere, and this is where we choose to catch it.
export function inputHashOf(
  c: Pick<Cassette, "config" | "input" | "exchanges">,
): `0x${string}` {
  return digest({ config: c.config, input: c.input, exchanges: c.exchanges });
}

// Agents opine concurrently, so the transcript arrives in whatever order the
// event loop settles. Sort before hashing or the same run yields a different
// digest each time.
export function orderExchanges(exchanges: Exchange[]): Exchange[] {
  return [...exchanges].sort((a, b) =>
    a.agent < b.agent ? -1 : a.agent > b.agent ? 1 : 0,
  );
}

export function buildCassette(args: {
  version: string;
  config: Config;
  ticker: string;
  quotes: StockTokenQuote[];
  exchanges: Exchange[];
  verdict: Verdict;
  proof: Proof;
  recordedAt: number;
}): Cassette {
  const body = {
    config: args.config,
    input: { ticker: args.ticker, quotes: args.quotes },
    exchanges: orderExchanges(args.exchanges),
  };
  return {
    schema: CASSETTE_SCHEMA,
    version: args.version,
    recordedAt: args.recordedAt,
    ...body,
    verdict: args.verdict,
    proof: args.proof,
    inputHash: inputHashOf(body),
  };
}

export function saveCassette(c: Cassette, dir = CASSETTE_DIR): string {
  mkdirSync(dir, { recursive: true });
  const path = join(dir, `${c.proof.verdictHash.slice(2, 18)}.json`);
  writeFileSync(path, JSON.stringify(c, null, 2) + "\n", "utf8");
  return path;
}

export function loadCassette(path: string): Cassette {
  const parsed = JSON.parse(readFileSync(path, "utf8")) as Cassette;
  if (parsed.schema !== CASSETTE_SCHEMA) {
    throw new Error(
      `cassette schema ${parsed.schema} is not supported by this build (expected ${CASSETTE_SCHEMA})`,
    );
  }
  return parsed;
}

// Accept either a path or a verdict-hash prefix, so `bastion replay 4f2a` is
// enough once you have the hash from a run.
export function resolveCassette(ref: string, dir = CASSETTE_DIR): Cassette {
  if (ref.endsWith(".json") && exists(ref)) return loadCassette(ref);

  const needle = ref.replace(/^0x/, "").toLowerCase();
  const hits = exists(dir)
    ? readdirSync(dir).filter(
        (f) => f.endsWith(".json") && f.toLowerCase().startsWith(needle),
      )
    : [];

  if (hits.length === 1) return loadCassette(join(dir, hits[0]!));
  if (hits.length > 1) {
    throw new Error(`"${ref}" matches ${hits.length} cassettes — use a longer prefix`);
  }
  throw new Error(`no cassette for "${ref}" (looked in ${dir})`);
}

function exists(p: string): boolean {
  try {
    statSync(p);
    return true;
  } catch {
    return false;
  }
}
