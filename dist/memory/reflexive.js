export class ReflexiveMemory {
    episodes = [];
    remember(ep) {
        this.episodes.push(ep);
        if (this.episodes.length > 5000)
            this.episodes.shift();
    }
    recall(vector, k = 5) {
        return [...this.episodes]
            .map((e) => ({ e, s: cosine(e.vector, vector) }))
            .sort((a, b) => b.s - a.s)
            .slice(0, k)
            .map((x) => x.e);
    }
}
function cosine(a, b) {
    let dot = 0, na = 0, nb = 0;
    const n = Math.min(a.length, b.length);
    for (let i = 0; i < n; i++) {
        dot += a[i] * b[i];
        na += a[i] ** 2;
        nb += b[i] ** 2;
    }
    const d = Math.sqrt(na) * Math.sqrt(nb);
    return d === 0 ? 0 : dot / d;
}
