import type { Config } from "../config.js";
import type { Proof, StockTokenQuote, Verdict } from "../types.js";
export declare const CASSETTE_SCHEMA = 1;
export declare const CASSETTE_DIR = ".bastion/cassettes";
export interface Exchange {
    agent: string;
    system: string;
    user: string;
    response: string;
}
export interface Cassette {
    schema: number;
    version: string;
    recordedAt: number;
    config: Config;
    input: {
        ticker: string;
        quotes: StockTokenQuote[];
    };
    exchanges: Exchange[];
    verdict: Verdict;
    proof: Proof;
    inputHash: `0x${string}`;
}
export declare function inputHashOf(c: Pick<Cassette, "config" | "input" | "exchanges">): `0x${string}`;
export declare function orderExchanges(exchanges: Exchange[]): Exchange[];
export declare function buildCassette(args: {
    version: string;
    config: Config;
    ticker: string;
    quotes: StockTokenQuote[];
    exchanges: Exchange[];
    verdict: Verdict;
    proof: Proof;
    recordedAt: number;
}): Cassette;
export declare function saveCassette(c: Cassette, dir?: string): string;
export declare function loadCassette(path: string): Cassette;
export declare function resolveCassette(ref: string, dir?: string): Cassette;
