import { z } from "zod";

export const ConfigSchema = z.object({
  // Robinhood Chain (Arbitrum Orbit L2) RPC.
  rpcUrl: z.string().url().default("https://rpc.robinhood-chain.xyz"),
  chainId: z.number().default(64288),
  // Universe of tokenized stocks the swarm is allowed to trade.
  universe: z.array(z.string()).default(["NVDA", "AAPL", "GOOG", "MSFT", "AMZN", "META", "TSLA"]),
  // Risk kernel.
  maxKelly: z.number().min(0).max(1).default(0.25),
  cvarLimit: z.number().min(0).max(1).default(0.08),
  maxDrawdown: z.number().min(0).max(1).default(0.15),
  // Swarm.
  quorum: z.number().int().min(1).default(3),
  // LLM provider (OpenAI-compatible endpoint; defaults to Nous Research Hermes).
  provider: z.string().default("hermes"),
  attestOnchain: z.boolean().default(true),
});

export type Config = z.infer<typeof ConfigSchema>;

export function loadConfig(partial: Partial<Config> = {}): Config {
  return ConfigSchema.parse({ ...partial });
}
