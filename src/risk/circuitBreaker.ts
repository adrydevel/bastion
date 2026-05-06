import type { Config } from "../config.js";

// Halts the fund when realised drawdown breaches the configured limit.
export class CircuitBreaker {
  private peak = 0;
  constructor(private readonly cfg: Config) {}

  update(equity: number): { tripped: boolean; drawdown: number } {
    this.peak = Math.max(this.peak, equity);
    const drawdown = this.peak > 0 ? (this.peak - equity) / this.peak : 0;
    return { tripped: drawdown >= this.cfg.maxDrawdown, drawdown };
  }
}
