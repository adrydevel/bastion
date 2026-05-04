// Fractional Kelly position sizing.
//
// f* = edge / odds, clamped to a conservative fraction so a single
// mis-estimated edge cannot blow up the book.

export function kellyFraction(winProb: number, payoff: number): number {
  if (payoff <= 0) return 0;
  const loseProb = 1 - winProb;
  const f = (winProb * payoff - loseProb) / payoff;
  return Number.isFinite(f) ? Math.max(0, f) : 0;
}

export function sizePosition(
  winProb: number,
  payoff: number,
  maxFraction: number,
): number {
  const raw = kellyFraction(winProb, payoff);
  // Half-Kelly by default — smoother equity curve, smaller variance.
  return Math.min(raw * 0.5, maxFraction);
}
