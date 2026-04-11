import type { PublicClient } from "viem";
import type { StockTokenQuote, Ticker } from "../types.js";

// Reads live NAV for a tokenized stock from the Chainlink price feed that
// Robinhood Chain uses as its canonical oracle.
const AGGREGATOR_ABI = [
  {
    name: "latestRoundData",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [
      { name: "roundId", type: "uint80" },
      { name: "answer", type: "int256" },
      { name: "startedAt", type: "uint256" },
      { name: "updatedAt", type: "uint256" },
      { name: "answeredInRound", type: "uint80" },
    ],
  },
] as const;

export async function readQuote(
  client: PublicClient,
  ticker: Ticker,
  feed: `0x${string}`,
  token: `0x${string}`,
): Promise<StockTokenQuote> {
  const data = (await client.readContract({
    address: feed,
    abi: AGGREGATOR_ABI,
    functionName: "latestRoundData",
  })) as readonly [bigint, bigint, bigint, bigint, bigint];
  return {
    ticker,
    address: token,
    price: Number(data[1]) / 1e8,
    ts: Number(data[3]) * 1000,
  };
}
