import type { LLM } from "../providers/hermes.js";
import type { Exchange } from "./cassette.js";

// Sits between the council and the live provider and keeps a verbatim
// transcript. One wrapper per agent, so every exchange is attributable.
export class Recorder {
  readonly exchanges: Exchange[] = [];

  constructor(private readonly inner: LLM) {}

  for(agent: string): LLM {
    return {
      reason: async (system: string, user: string) => {
        const response = await this.inner.reason(system, user);
        this.exchanges.push({ agent, system, user, response });
        return response;
      },
    };
  }
}

// The other direction: serve the recorded answers instead of calling out.
// Lookup is keyed on (agent, system, user) rather than call order, because
// the council fans out concurrently and order is not stable.
//
// A miss is a hard error, never a silent fallthrough to the live model — a
// replay that quietly re-queried the network would prove nothing at all.
export class ReplayDeck {
  constructor(private readonly exchanges: Exchange[]) {}

  for(agent: string): LLM {
    return {
      reason: async (system: string, user: string) => {
        const hit = this.exchanges.find(
          (e) => e.agent === agent && e.system === system && e.user === user,
        );
        if (!hit) {
          throw new Error(
            `no recorded exchange for "${agent}" — this cassette was produced by a different pipeline`,
          );
        }
        return hit.response;
      },
    };
  }
}
