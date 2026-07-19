import type { PublicClient } from "viem";
import type { StockTokenQuote, Ticker } from "../types.js";
export declare function readQuote(client: PublicClient, ticker: Ticker, feed: `0x${string}`, token: `0x${string}`): Promise<StockTokenQuote>;
