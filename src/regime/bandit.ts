// Thompson-sampling bandit that reallocates capital across strategies as
// their live edge changes with the regime.
interface Arm { alpha: number; beta: number; }

export class ThompsonBandit {
  private arms = new Map<string, Arm>();

  private arm(id: string): Arm {
    let a = this.arms.get(id);
    if (!a) { a = { alpha: 1, beta: 1 }; this.arms.set(id, a); }
    return a;
  }

  // Draw from Beta(alpha, beta) via a gamma-ratio approximation.
  private sample(a: Arm, rand: () => number): number {
    const g = (k: number) => {
      let s = 0;
      for (let i = 0; i < k; i++) s += -Math.log(rand() || 1e-9);
      return s;
    };
    const x = g(Math.max(1, Math.round(a.alpha)));
    const y = g(Math.max(1, Math.round(a.beta)));
    return x / (x + y);
  }

  pick(ids: string[], rand: () => number = Math.random): string {
    let best = ids[0]!;
    let bestScore = -1;
    for (const id of ids) {
      const s = this.sample(this.arm(id), rand);
      if (s > bestScore) { bestScore = s; best = id; }
    }
    return best;
  }

  reward(id: string, win: boolean): void {
    const a = this.arm(id);
    if (win) a.alpha += 1; else a.beta += 1;
  }
}
