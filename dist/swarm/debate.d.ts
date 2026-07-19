import type { Config } from "../config.js";
import type { MarketFrame, Proof, Verdict } from "../types.js";
import type { LLM } from "../providers/hermes.js";
import { Council } from "./council.js";
export declare function assembleCouncil(cfg: Config, llmFor?: (agent: string) => LLM): Council;
export declare function step(council: Council, frame: MarketFrame): Promise<{
    verdict: Verdict;
    proof: Proof;
}>;
