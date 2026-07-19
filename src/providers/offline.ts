import type { LLM } from "./hermes.js";

// Deterministic, model-free provider.
//
// Every opinion is a pure function of the price window and the agent's own
// system prompt, so `bastion run --offline` works on a fresh machine with no
// key, no endpoint and no network — and a pass recorded this way replays
// byte-for-byte on anyone else's machine.
//
// This is a heuristic, not the council reasoning. It exists so the pipeline,
// the risk kernel and the proof/replay path can be exercised and audited
// end-to-end without trusting anyone's API. Every rationale it emits says so.
export class OfflineProvider implements LLM {
  async reason(system: string, user: string): Promise<string> {
    const frame = parseFrame(user);
    const { drift, vol } = stats(frame.window);
    const lens = LENSES[fnv1a(system) % LENSES.length]!;
    const score = lens.score(drift, vol);

    const side = score > 0.15 ? "long" : score < -0.15 ? "short" : "flat";
    const confidence = Math.min(0.99, 0.5 + Math.min(Math.abs(score), 1) * 0.4);

    // Nothing below may contain the words "long" or "short" — the agent
    // parser scans the whole string for them.
    return [
      side,
      `confidence: ${confidence.toFixed(2)}`,
      `offline heuristic · lens ${lens.name} · drift ${(drift * 100).toFixed(2)}% · vol ${(vol * 100).toFixed(2)}% · regime ${frame.regime}`,
    ].join(" | ");
  }
}

interface Lens {
  name: string;
  score: (drift: number, vol: number) => number;
}

// Five deliberately different readings of the same window, so the council
// actually disagrees instead of voting as one block.
const LENSES: Lens[] = [
  { name: "momentum", score: (d) => d * 40 },
  { name: "flow", score: (d, v) => d * 25 + (v < 0.01 ? 0.1 : -0.1) },
  { name: "tail", score: (d, v) => d * 10 - v * 20 },
  { name: "fade", score: (d) => -d * 30 },
  { name: "fill", score: (d) => d * 15 },
];

function parseFrame(user: string): { regime: string; window: number[] } {
  try {
    const raw = JSON.parse(user) as { regime?: unknown; window?: unknown };
    const window = Array.isArray(raw.window)
      ? raw.window.filter((n): n is number => typeof n === "number" && n > 0)
      : [];
    return { regime: typeof raw.regime === "string" ? raw.regime : "unknown", window };
  } catch {
    return { regime: "unknown", window: [] };
  }
}

function stats(window: number[]): { drift: number; vol: number } {
  if (window.length < 2) return { drift: 0, vol: 0 };
  const first = window[0]!;
  const last = window[window.length - 1]!;
  const drift = first > 0 ? (last - first) / first : 0;

  const rets: number[] = [];
  for (let i = 1; i < window.length; i++) {
    const p0 = window[i - 1]!;
    if (p0 > 0) rets.push(Math.log(window[i]! / p0));
  }
  if (rets.length === 0) return { drift, vol: 0 };
  const mean = rets.reduce((s, r) => s + r, 0) / rets.length;
  const variance = rets.reduce((s, r) => s + (r - mean) ** 2, 0) / rets.length;
  return { drift, vol: Math.sqrt(variance) };
}

// FNV-1a, so each agent's lens is stable across runs and machines.
function fnv1a(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h;
}
