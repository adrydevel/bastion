// Conditional Value at Risk (expected shortfall) on a return sample.
export function valueAtRisk(returns, alpha = 0.95) {
    if (returns.length === 0)
        return 0;
    const sorted = [...returns].sort((a, b) => a - b);
    const idx = Math.floor((1 - alpha) * sorted.length);
    return -(sorted[idx] ?? sorted[0] ?? 0);
}
export function cvar(returns, alpha = 0.95) {
    if (returns.length === 0)
        return 0;
    const sorted = [...returns].sort((a, b) => a - b);
    const cutoff = Math.max(1, Math.floor((1 - alpha) * sorted.length));
    const tail = sorted.slice(0, cutoff);
    const mean = tail.reduce((s, r) => s + r, 0) / tail.length;
    return -mean;
}
