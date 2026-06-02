import type { Verdict } from "../types.js";

// Reflexive memory: after each closed position the swarm writes a short
// post-mortem. Similar past states are retrieved by a cheap cosine match on
// a bag-of-features embedding and fed back into the next decision.
export interface Episode {
  verdict: Verdict;
  pnl: number;
  postMortem: string;
  vector: number[];
}

export class ReflexiveMemory {
  private episodes: Episode[] = [];

  remember(ep: Episode): void {
    this.episodes.push(ep);
    if (this.episodes.length > 5000) this.episodes.shift();
  }

  recall(vector: number[], k = 5): Episode[] {
    return [...this.episodes]
      .map((e) => ({ e, s: cosine(e.vector, vector) }))
      .sort((a, b) => b.s - a.s)
      .slice(0, k)
      .map((x) => x.e);
  }
}

function cosine(a: number[], b: number[]): number {
  let dot = 0, na = 0, nb = 0;
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) {
    dot += a[i]! * b[i]!;
    na += a[i]! ** 2;
    nb += b[i]! ** 2;
  }
  const d = Math.sqrt(na) * Math.sqrt(nb);
  return d === 0 ? 0 : dot / d;
}
