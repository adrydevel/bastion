# Deterministic Replay

> A decision you cannot re-derive is a screenshot.

Bastion hashes every verdict and anchors it on-chain. That proves a decision
*existed* at a point in time — it does not prove the decision follows from the
evidence the desk claims it had. Replay closes that gap.

## The idea

`bastion run --record` writes a **cassette**: the config, the market window,
the verbatim model transcript, the verdict and its proof. `bastion replay`
takes that cassette and re-derives the verdict from scratch using the current
build, then compares every stage.

```bash
bastion run --ticker NVDA --record
#   proof 0x4e968bb0adab9250… anchored
#   recorded .bastion/cassettes/4e968bb0adab9250.json

bastion replay 4e968bb0
#   ok   cassette integrity
#   ok   regime
#   ok   verdict
#   ok   features hash
#   ok   verdict hash
#   verified — this decision follows from its recorded inputs
```

Exit code is `0` on a clean replay and `1` on any mismatch, so it drops
straight into CI.

## What each check covers

| Check | Fails when |
|-------|-----------|
| **cassette integrity** | The config, market window or model transcript was edited after recording. |
| **regime** | The classifier no longer labels this window the way the record claims. |
| **verdict** | Side, size, quorum or any agent opinion differs from the published one. |
| **features hash** | The oracle window behind the proof is not the one that was hashed. |
| **verdict hash** | The recomputed decision does not digest to the anchored hash. |

## What this proves — and what it does not

**It proves:** given these inputs and these model outputs, the pipeline in this
build produces exactly the published verdict and hash. Nobody tuned the
strategy after seeing the outcome, nobody edited a size upward in the receipt,
and no step was rewritten between the decision and the proof.

**It does not prove the model is deterministic.** Sampling is not repeatable,
and asserting otherwise would be exactly the sort of unfalsifiable claim this
command exists to replace. Replay serves the *recorded* responses back to the
council; a transcript miss is a hard error, never a silent fall-through to the
live model.

If you want to measure model drift, ask for it explicitly:

```bash
bastion replay 4e968bb0 --live
```

That re-queries the provider instead of the transcript. A mismatch there is
drift, not tampering, and it is labelled as such.

## Canonical hashing

Digests are taken over canonical JSON — keys sorted at every depth, no
insignificant whitespace, `undefined` members dropped. Plain `JSON.stringify`
leaks key *insertion order* into the digest, which means an innocent refactor
that reorders a struct literal would silently invalidate every historical
proof. Sorting is what lets a hash recorded today still verify on someone
else's machine next year.

The transcript is sorted by agent name before hashing for the same reason: the
council fans out concurrently, so arrival order is not stable across runs.

## Cassette format

```jsonc
{
  "schema": 1,
  "version": "0.5.0",
  "recordedAt": 1752883462000,
  "config":   { /* the exact Config the decision ran under */ },
  "input":    { "ticker": "NVDA", "quotes": [ /* oracle window */ ] },
  "exchanges": [ { "agent": "Analyst", "system": "…", "user": "…", "response": "…" } ],
  "verdict":  { /* side, size, quorum, per-agent opinions, regime */ },
  "proof":    { "verdictHash": "0x…", "featuresHash": "0x…", "attestedAt": 0 },
  "inputHash": "0x…"
}
```

`inputHash` covers the config, market input and transcript — everything replay
is *handed*. It deliberately excludes the verdict, because replay recomputes
that: a cassette whose verdict was edited still passes the integrity check and
then fails the verdict check. Tampering has to surface somewhere, and that is
where we choose to catch it.

Cassettes are plain JSON and contain no keys or credentials. Publish them.

## Try it without running anything

`examples/demo-cassette.json` is a cassette recorded against a **stub
provider** — synthetic model responses, a synthetic price window, not a real
position. It exists so you can exercise the verifier before wiring up an
endpoint:

```bash
bastion replay examples/demo-cassette.json     # verifies
```

Then break it and watch it fail:

```bash
# claim the desk sized 95% instead of 20.6%
jq '.verdict.size = 0.95' examples/demo-cassette.json > /tmp/edited.json
bastion replay /tmp/edited.json                # FAIL verdict, exit 1
```
