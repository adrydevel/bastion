import type { LLM } from "../providers/hermes.js";
import type { Exchange } from "./cassette.js";
export declare class Recorder {
    private readonly inner;
    readonly exchanges: Exchange[];
    constructor(inner: LLM);
    for(agent: string): LLM;
}
export declare class ReplayDeck {
    private readonly exchanges;
    constructor(exchanges: Exchange[]);
    for(agent: string): LLM;
}
