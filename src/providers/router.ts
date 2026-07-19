import { HermesProvider, type LLM } from "./hermes.js";
import { OfflineProvider } from "./offline.js";

// Provider registry. Keys stay local; the newest models are fetched live from
// each endpoint. Hermes is the default runtime for every agent in the swarm.
// `offline` is the model-free heuristic used by `bastion run --offline`.
const REGISTRY: Record<string, () => LLM> = {
  hermes: () => new HermesProvider(),
  offline: () => new OfflineProvider(),
};

export function resolveProvider(name: string): LLM {
  const factory = REGISTRY[name] ?? REGISTRY.hermes!;
  return factory();
}
