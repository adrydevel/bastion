import type { Config } from "../config.js";
import type { MarketFrame, Verdict } from "../types.js";
import type { Agent } from "./agents/base.js";
export declare class Council {
    private readonly agents;
    private readonly cfg;
    constructor(agents: Agent[], cfg: Config);
    decide(frame: MarketFrame): Promise<Verdict>;
}
