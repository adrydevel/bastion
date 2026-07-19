// Halts the fund when realised drawdown breaches the configured limit.
export class CircuitBreaker {
    cfg;
    peak = 0;
    constructor(cfg) {
        this.cfg = cfg;
    }
    update(equity) {
        this.peak = Math.max(this.peak, equity);
        const drawdown = this.peak > 0 ? (this.peak - equity) / this.peak : 0;
        return { tripped: drawdown >= this.cfg.maxDrawdown, drawdown };
    }
}
