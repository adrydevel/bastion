import type { LLM } from "../providers/hermes.js";
import { frameFromQuotes } from "../regime/detector.js";
import { attest } from "../proof/attest.js";
import { assembleCouncil } from "../swarm/debate.js";
import { canonical } from "./canonical.js";
import { inputHashOf, type Cassette } from "./cassette.js";
import { ReplayDeck } from "./recorder.js";

export interface Check {
  name: string;
  ok: boolean;
  expected?: string;
  actual?: string;
}

export interface ReplayResult {
  ok: boolean;
  checks: Check[];
  /** True when the run re-queried the model instead of using the transcript. */
  live: boolean;
}

// Re-derive a recorded decision from its cassette and compare every stage.
//
// What this proves: given these inputs and these model outputs, the pipeline
// in *this* build produces exactly the published verdict and hash. Nothing
// was tuned after the fact, and no step was quietly rewritten between the
// decision and the receipt.
//
// What it does not prove: that the model would say the same thing twice.
// Sampling is not reproducible, and claiming otherwise would be the exact
// kind of unfalsifiable assertion this command exists to replace. Pass a live
// provider to measure that drift instead of asserting it away.
export async function replayCassette(
  cassette: Cassette,
  opts: { llmFor?: (agent: string) => LLM } = {},
): Promise<ReplayResult> {
  const checks: Check[] = [];
  const live = Boolean(opts.llmFor);

  const recomputedInput = inputHashOf(cassette);
  checks.push({
    name: "cassette integrity",
    ok: recomputedInput === cassette.inputHash,
    expected: cassette.inputHash,
    actual: recomputedInput,
  });

  const frame = frameFromQuotes(cassette.input.quotes);
  checks.push({
    name: "regime",
    ok: frame.regime === cassette.verdict.regime,
    expected: cassette.verdict.regime,
    actual: frame.regime,
  });

  const llmFor = opts.llmFor ?? ((agent: string) => new ReplayDeck(cassette.exchanges).for(agent));
  const council = assembleCouncil(cassette.config, llmFor);

  let verdict;
  try {
    verdict = await council.decide(frame);
  } catch (err) {
    // A transcript miss means the recorded inputs no longer produce the calls
    // that were recorded — editing the market window does this. That is a
    // failed replay, not a crash, so it reports like every other check.
    checks.push({
      name: "verdict",
      ok: false,
      expected: `${cassette.verdict.side} ${cassette.verdict.size.toFixed(4)} q${cassette.verdict.quorum}`,
      actual: err instanceof Error ? err.message : String(err),
    });
    return { ok: false, checks, live };
  }

  checks.push({
    name: "verdict",
    ok: canonical(verdict) === canonical(cassette.verdict),
    expected: `${cassette.verdict.side} ${cassette.verdict.size.toFixed(4)} q${cassette.verdict.quorum}`,
    actual: `${verdict.side} ${verdict.size.toFixed(4)} q${verdict.quorum}`,
  });

  const proof = attest(verdict, { window: frame.quotes.map((q) => q.price) });
  checks.push({
    name: "features hash",
    ok: proof.featuresHash === cassette.proof.featuresHash,
    expected: cassette.proof.featuresHash,
    actual: proof.featuresHash,
  });
  checks.push({
    name: "verdict hash",
    ok: proof.verdictHash === cassette.proof.verdictHash,
    expected: cassette.proof.verdictHash,
    actual: proof.verdictHash,
  });

  return { ok: checks.every((c) => c.ok), checks, live };
}
