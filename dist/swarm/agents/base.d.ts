import type { LLM } from "../../providers/hermes.js";
import type { AgentOpinion, MarketFrame } from "../../types.js";
export declare abstract class Agent {
    protected readonly llm: LLM;
    abstract readonly name: string;
    protected abstract system(): string;
    constructor(llm: LLM);
    opine(frame: MarketFrame): Promise<AgentOpinion>;
    protected parse(raw: string): AgentOpinion;
}
