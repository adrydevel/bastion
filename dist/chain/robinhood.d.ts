import { type PublicClient } from "viem";
import type { Config } from "../config.js";
import type { Side } from "../types.js";
export declare class RobinhoodChain {
    private readonly cfg;
    readonly client: PublicClient;
    constructor(cfg: Config);
    writeProof(verdictHash: `0x${string}`, featuresHash: `0x${string}`): Promise<`0x${string}`>;
    execute(ticker: string, side: Side, size: number): Promise<void>;
}
