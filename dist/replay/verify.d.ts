import type { LLM } from "../providers/hermes.js";
import { type Cassette } from "./cassette.js";
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
export declare function replayCassette(cassette: Cassette, opts?: {
    llmFor?: (agent: string) => LLM;
}): Promise<ReplayResult>;
