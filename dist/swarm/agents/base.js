export class Agent {
    llm;
    constructor(llm) {
        this.llm = llm;
    }
    async opine(frame) {
        const user = JSON.stringify({
            ticker: frame.ticker,
            regime: frame.regime,
            window: frame.quotes.slice(-16).map((q) => q.price),
        });
        const raw = await this.llm.reason(this.system(), user);
        return this.parse(raw);
    }
    parse(raw) {
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
