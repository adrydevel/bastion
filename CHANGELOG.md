# Changelog

All notable changes are documented here. Format based on Keep a Changelog.

## [0.5.0] - 2026-07-19
### Added
- `bastion run --record` writes a replayable cassette: config, market window,
  verbatim model transcript, verdict and proof.
- `bastion replay <hash>` re-derives a recorded decision and verifies every
  stage — integrity, regime, verdict, both hashes. Non-zero exit on mismatch.
- `bastion replay --live` re-queries the model instead of the transcript, to
  measure drift rather than assert determinism.
- `docs/replay.md`.

### Changed
- Decision digests are now taken over **canonical JSON** (keys sorted at every
  depth). Hashes no longer depend on struct key order, so a refactor cannot
  silently invalidate historical proofs.
- `assembleCouncil()` accepts an optional per-agent provider factory; this is
  the seam recording and replay hang off.

### Fixed
- `tsc` could not resolve `process` — `types: ["node"]` was missing from
  tsconfig, which broke `npm run build` from a clean checkout.

### Breaking
- Canonical hashing changes the digest of any decision made before 0.5.0.
  Proofs anchored by earlier builds do not verify against this one.

## [0.4.2] - 2026-07-03
### Fixed
- Guard against zero-length oracle windows in the regime detector.

## [0.4.0] - 2026-06-20
### Added
- On-chain proof anchoring on Robinhood Chain.
- Reflexive memory recall feeding back into agent context.

## [0.3.0] - 2026-05-28
### Added
- Thompson-sampling bandit for strategy allocation.
- CVaR tail-risk cap in the risk kernel.

## [0.2.0] - 2026-05-08
### Added
- Five-agent council with quorum voting.
- Kelly position sizing and drawdown circuit-breaker.

## [0.1.0] - 2026-04-18
### Added
- CLI scaffold, config, and Robinhood Chain oracle reads.
