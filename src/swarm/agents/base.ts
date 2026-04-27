import type { LLM } from "../../providers/hermes.js";
import type { AgentOpinion, MarketFrame } from "../../types.js";

export abstract class Agent {
  abstract readonly name: string;
  protected abstract system(): string;

  constructor(protected readonly llm: LLM) {}

  async opine(frame: MarketFrame): Promise<AgentOpinion> {
    const user = JSON.stringify({
      ticker: frame.ticker,
      regime: frame.regime,
      window: frame.quotes.slice(-16).map((q) => q.price),
    });
    const raw = await this.llm.reason(this.system(), user);
    return this.parse(raw);
  }

  protected parse(raw: string): AgentOpinion {
    const side = /short/i.test(raw) ? "short" : /long/i.test(raw) ? "long" : "flat";
    const conf = Number((raw.match(/conf(?:idence)?[:=\s]+([01]?\.?\d+)/i) ?? [])[1] ?? 0.5);
    return {
      agent: this.name,
      side,
      confidence: Math.max(0, Math.min(1, conf)),
      rationale: raw.slice(0, 280),
    };
  }
}
