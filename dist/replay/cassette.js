import { mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { digest } from "./canonical.js";
export const CASSETTE_SCHEMA = 1;
export const CASSETTE_DIR = ".bastion/cassettes";
// The input hash covers exactly what a replay is *handed*: config, market
// window and model transcript. It deliberately excludes the verdict — replay
// recomputes that, so a cassette whose verdict was edited after the fact
// still hashes fine here and then fails the verdict check. Tampering has to
// show up somewhere, and this is where we choose to catch it.
export function inputHashOf(c) {
    return digest({ config: c.config, input: c.input, exchanges: c.exchanges });
}
// Agents opine concurrently, so the transcript arrives in whatever order the
// event loop settles. Sort before hashing or the same run yields a different
// digest each time.
export function orderExchanges(exchanges) {
    return [...exchanges].sort((a, b) => a.agent < b.agent ? -1 : a.agent > b.agent ? 1 : 0);
}
export function buildCassette(args) {
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
export function saveCassette(c, dir = CASSETTE_DIR) {
    mkdirSync(dir, { recursive: true });
    const path = join(dir, `${c.proof.verdictHash.slice(2, 18)}.json`);
    writeFileSync(path, JSON.stringify(c, null, 2) + "\n", "utf8");
    return path;
}
export function loadCassette(path) {
    const parsed = JSON.parse(readFileSync(path, "utf8"));
    if (parsed.schema !== CASSETTE_SCHEMA) {
        throw new Error(`cassette schema ${parsed.schema} is not supported by this build (expected ${CASSETTE_SCHEMA})`);
    }
    return parsed;
}
// Accept either a path or a verdict-hash prefix, so `bastion replay 4f2a` is
// enough once you have the hash from a run.
export function resolveCassette(ref, dir = CASSETTE_DIR) {
    if (ref.endsWith(".json") && exists(ref))
        return loadCassette(ref);
    const needle = ref.replace(/^0x/, "").toLowerCase();
    const hits = exists(dir)
        ? readdirSync(dir).filter((f) => f.endsWith(".json") && f.toLowerCase().startsWith(needle))
        : [];
    if (hits.length === 1)
        return loadCassette(join(dir, hits[0]));
    if (hits.length > 1) {
        throw new Error(`"${ref}" matches ${hits.length} cassettes — use a longer prefix`);
    }
    throw new Error(`no cassette for "${ref}" (looked in ${dir})`);
}
function exists(p) {
    try {
        statSync(p);
        return true;
    }
    catch {
        return false;
    }
}
