import type { LLM } from "./hermes.js";
export declare class OfflineProvider implements LLM {
    reason(system: string, user: string): Promise<string>;
}
