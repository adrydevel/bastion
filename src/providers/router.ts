import { HermesProvider, type LLM } from "./hermes.js";

// Provider registry. Keys stay local; the newest models are fetched live from
// each endpoint. Hermes is the default runtime for every agent in the swarm.
const REGISTRY: Record<string, () => LLM> = {
  hermes: () => new HermesProvider(),
};

export function resolveProvider(name: string): LLM {
  const factory = REGISTRY[name] ?? REGISTRY.hermes!;
  return factory();
}
