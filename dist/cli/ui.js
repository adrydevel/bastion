import pc from "picocolors";
const G = (s) => pc.green(s);
export function banner() {
    console.log(G("bastion") + pc.dim(" · autonomous verifiable fund · robinhood chain"));
}
export function note(s) {
    console.log(pc.dim(`  ${s}`));
}
export function warn(s) {
    console.log(pc.yellow(`  ${s}`));
}
export function printVerdict(v, p) {
    const head = v.side === "flat" ? pc.dim("flat") : G(`${v.side} ${v.ticker}`);
    console.log(`\n${head}  ${pc.dim(`quorum ${v.quorum}/5 · ${v.regime}`)}`);
    for (const o of v.opinions) {
        console.log(pc.dim(`  ${o.agent.padEnd(10)} ${o.side.padEnd(6)} ${o.confidence.toFixed(2)}`));
    }
    if (v.size > 0)
        console.log(G(`  size ${(v.size * 100).toFixed(1)}% equity`));
    console.log(pc.dim(`  proof ${p.verdictHash.slice(0, 18)}… ${p.txHash ? "anchored" : "pending"}`));
}
export function printReplay(c, r) {
    const when = new Date(c.recordedAt).toISOString().replace("T", " ").slice(0, 19);
    console.log(`\n${pc.dim("replaying")} ${c.proof.verdictHash.slice(0, 18)}…  ${pc.dim(`${c.input.ticker} · recorded ${when} · bastion ${c.version}`)}`);
    if (r.live)
        console.log(pc.yellow("  live mode — model re-queried, divergence is drift, not tampering"));
    for (const check of r.checks) {
        const mark = check.ok ? G("ok  ") : pc.red("FAIL");
        console.log(`  ${mark} ${check.name}`);
        if (!check.ok) {
            console.log(pc.dim(`       expected ${check.expected}`));
            console.log(pc.dim(`       actual   ${check.actual}`));
        }
    }
    console.log(r.ok
        ? G("\n  verified — this decision follows from its recorded inputs\n")
        : pc.red("\n  MISMATCH — this cassette does not reproduce\n"));
}
