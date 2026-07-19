import { HermesProvider } from "./hermes.js";
import { OfflineProvider } from "./offline.js";
// Provider registry. Keys stay local; the newest models are fetched live from
// each endpoint. Hermes is the default runtime for every agent in the swarm.
// `offline` is the model-free heuristic used by `bastion run --offline`.
const REGISTRY = {
    hermes: () => new HermesProvider(),
    offline: () => new OfflineProvider(),
};
export function resolveProvider(name) {
    const factory = REGISTRY[name] ?? REGISTRY.hermes;
    return factory();
}
