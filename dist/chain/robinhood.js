import { createPublicClient, http } from "viem";
// Thin adapter over Robinhood Chain (Arbitrum Orbit L2). Reads go through the
// public client; writes (swaps + proof anchoring) are stubbed here and wired
// to a signer in the hosted runtime.
export class RobinhoodChain {
    cfg;
    client;
    constructor(cfg) {
        this.cfg = cfg;
        this.client = createPublicClient({ transport: http(cfg.rpcUrl) });
    }
    async writeProof(verdictHash, featuresHash) {
        // Placeholder: the signer-backed implementation lives in @bastion/runtime.
        return verdictHash;
    }
    async execute(ticker, side, size) {
        if (side === "flat" || size <= 0)
            return;
        // Routed through the on-chain DEX aggregator in the hosted runtime.
    }
}
