import type { Verdict } from "../types.js";
export interface Episode {
    verdict: Verdict;
    pnl: number;
    postMortem: string;
    vector: number[];
}
export declare class ReflexiveMemory {
    private episodes;
    remember(ep: Episode): void;
    recall(vector: number[], k?: number): Episode[];
}
