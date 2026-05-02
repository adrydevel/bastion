import type { Config } from "../config.js";
import type { AgentOpinion, MarketFrame, Side, Verdict } from "../types.js";
import type { Agent } from "./agents/base.js";
import { sizePosition } from "../risk/kelly.js";

// The council: every agent opines independently, then a quorum vote decides.
// No single agent can move capital — consensus does, or the desk stays flat.
export class Council {
  constructor(
    private readonly agents: Agent[],
    private readonly cfg: Config,
  ) {}

  async decide(frame: MarketFrame): Promise<Verdict> {
    const opinions = await Promise.all(this.agents.map((a) => a.opine(frame)));
    const { side, votes } = tally(opinions);

    let size = 0;
    if (votes >= this.cfg.quorum && side !== "flat") {
      const conf = avgConfidence(opinions, side);
      // Map consensus confidence to a win probability and a modest payoff.
      size = sizePosition(0.5 + conf * 0.25, 1.4, this.cfg.maxKelly);
    }

    return {
      ticker: frame.ticker,
      side: votes >= this.cfg.quorum ? side : "flat",
      size,
      quorum: votes,
      opinions,
      regime: frame.regime,
    };
  }
}

function tally(opinions: AgentOpinion[]): { side: Side; votes: number } {
  const buckets: Record<Side, number> = { long: 0, short: 0, flat: 0 };
  for (const o of opinions) buckets[o.side] += o.confidence;
  const side = (Object.keys(buckets) as Side[]).reduce((a, b) =>
    buckets[a] >= buckets[b] ? a : b,
  );
  const votes = opinions.filter((o) => o.side === side).length;
  return { side, votes };
}

function avgConfidence(opinions: AgentOpinion[], side: Side): number {
  const inFavour = opinions.filter((o) => o.side === side);
  if (inFavour.length === 0) return 0;
  return inFavour.reduce((s, o) => s + o.confidence, 0) / inFavour.length;
}
