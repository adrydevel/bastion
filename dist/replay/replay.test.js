import { describe, expect, it } from "vitest";
import { loadConfig } from "../config.js";
import { frameFromQuotes } from "../regime/detector.js";
import { attest } from "../proof/attest.js";
import { assembleCouncil } from "../swarm/debate.js";
import { canonical, digest } from "./canonical.js";
import { buildCassette, inputHashOf } from "./cassette.js";
import { Recorder, ReplayDeck } from "./recorder.js";
import { replayCassette } from "./verify.js";
// A stand-in for the council's provider: no network, but deliberately
// *unstable* — every call returns a different confidence. If replay ever
// silently fell through to the live model instead of the transcript, these
// tests would fail, which is the point.
function driftingProvider() {
    let n = 0;
    return {
        reason: async () => {
            n += 1;
            return `long, confidence: 0.${70 + n}`;
        },
    };
}
function fixedWindow(ticker = "NVDA") {
    const out = [];
    let p = 100;
    for (let i = 0; i < 24; i++) {
        p *= 1 + Math.sin(i / 3) * 0.006;
        out.push({
            ticker,
            address: "0x0000000000000000000000000000000000000000",
            price: p,
            ts: 1_750_000_000_000 + i * 60_000,
        });
    }
    return out;
}
async function record() {
    const cfg = loadConfig();
    const quotes = fixedWindow();
    const frame = frameFromQuotes(quotes);
    const recorder = new Recorder(driftingProvider());
    const council = assembleCouncil(cfg, (a) => recorder.for(a));
    const verdict = await council.decide(frame);
    const proof = attest(verdict, { window: frame.quotes.map((q) => q.price) });
    return buildCassette({
        version: "test",
        config: cfg,
        ticker: frame.ticker,
        quotes,
        exchanges: recorder.exchanges,
        verdict,
        proof,
        recordedAt: 1_750_000_000_000,
    });
}
describe("canonical serialisation", () => {
    it("is independent of key insertion order", () => {
        expect(canonical({ b: 1, a: 2 })).toBe(canonical({ a: 2, b: 1 }));
        expect(digest({ b: 1, a: 2 })).toBe(digest({ a: 2, b: 1 }));
    });
    it("sorts nested keys and preserves array order", () => {
        expect(canonical({ x: [{ b: 1, a: 2 }] })).toBe('{"x":[{"a":2,"b":1}]}');
        expect(canonical([3, 1, 2])).toBe("[3,1,2]");
    });
    it("drops undefined members rather than emitting them", () => {
        expect(canonical({ a: 1, b: undefined })).toBe('{"a":1}');
    });
});
describe("replay", () => {
    it("reproduces a recorded decision exactly", async () => {
        const cassette = await record();
        const result = await replayCassette(cassette);
        expect(result.checks.filter((c) => !c.ok)).toEqual([]);
        expect(result.ok).toBe(true);
    });
    it("is stable across repeated replays despite a non-deterministic model", async () => {
        const cassette = await record();
        const a = await replayCassette(cassette);
        const b = await replayCassette(cassette);
        expect(a.ok && b.ok).toBe(true);
    });
    it("fails when the published verdict was edited after the fact", async () => {
        const cassette = await record();
        const tampered = {
            ...cassette,
            verdict: { ...cassette.verdict, size: cassette.verdict.size + 0.05 },
        };
        const result = await replayCassette(tampered);
        expect(result.ok).toBe(false);
        expect(result.checks.find((c) => c.name === "verdict")?.ok).toBe(false);
    });
    it("fails when a model response was rewritten", async () => {
        const cassette = await record();
        const exchanges = cassette.exchanges.map((e, i) => i === 0 ? { ...e, response: "short, confidence: 0.99" } : e);
        const result = await replayCassette({ ...cassette, exchanges });
        expect(result.ok).toBe(false);
        // The rewrite breaks the integrity hash before it can change the outcome.
        expect(result.checks.find((c) => c.name === "cassette integrity")?.ok).toBe(false);
    });
    it("fails when the market window was swapped underneath the proof", async () => {
        const cassette = await record();
        const quotes = cassette.input.quotes.map((q, i) => i === 0 ? { ...q, price: q.price * 1.5 } : q);
        const result = await replayCassette({
            ...cassette,
            input: { ...cassette.input, quotes },
        });
        expect(result.ok).toBe(false);
    });
    it("recomputes the same input hash it stored", async () => {
        const cassette = await record();
        expect(inputHashOf(cassette)).toBe(cassette.inputHash);
    });
    it("orders the transcript deterministically", async () => {
        const a = await record();
        const b = await record();
        expect(a.exchanges.map((e) => e.agent)).toEqual(b.exchanges.map((e) => e.agent));
    });
});
describe("ReplayDeck", () => {
    it("refuses to answer an exchange it never recorded", async () => {
        const deck = new ReplayDeck([
            { agent: "Analyst", system: "s", user: "u", response: "long" },
        ]);
        await expect(deck.for("Risk").reason("s", "u")).rejects.toThrow(/no recorded exchange/);
    });
});
