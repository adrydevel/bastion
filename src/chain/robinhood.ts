import { createPublicClient, http, type PublicClient } from "viem";
import type { Config } from "../config.js";
import type { Side } from "../types.js";

// Thin adapter over Robinhood Chain (Arbitrum Orbit L2). Reads go through the
// public client; writes (swaps + proof anchoring) are stubbed here and wired
// to a signer in the hosted runtime.
export class RobinhoodChain {
  readonly client: PublicClient;
  constructor(private readonly cfg: Config) {
    this.client = createPublicClient({ transport: http(cfg.rpcUrl) });
  }

  async writeProof(
    verdictHash: `0x${string}`,
    featuresHash: `0x${string}`,
  ): Promise<`0x${string}`> {
    // Placeholder: the signer-backed implementation lives in @bastion/runtime.
    return verdictHash;
  }

  async execute(ticker: string, side: Side, size: number): Promise<void> {
    if (side === "flat" || size <= 0) return;
    // Routed through the on-chain DEX aggregator in the hosted runtime.
  }
}
