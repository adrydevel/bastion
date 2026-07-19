import type { Config } from "../config.js";
export declare class CircuitBreaker {
    private readonly cfg;
    private peak;
    constructor(cfg: Config);
    update(equity: number): {
        tripped: boolean;
        drawdown: number;
    };
}
