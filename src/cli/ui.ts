import pc from "picocolors";
import type { Proof, Verdict } from "../types.js";

const G = (s: string) => pc.green(s);

export function banner(): void {
  console.log(G("bastion") + pc.dim(" · autonomous verifiable fund · robinhood chain"));
}

export function printVerdict(v: Verdict, p: Proof): void {
  const head = v.side === "flat" ? pc.dim("flat") : G(`${v.side} ${v.ticker}`);
  console.log(`\n${head}  ${pc.dim(`quorum ${v.quorum}/5 · ${v.regime}`)}`);
  for (const o of v.opinions) {
    console.log(pc.dim(`  ${o.agent.padEnd(10)} ${o.side.padEnd(6)} ${o.confidence.toFixed(2)}`));
  }
  if (v.size > 0) console.log(G(`  size ${(v.size * 100).toFixed(1)}% equity`));
  console.log(pc.dim(`  proof ${p.verdictHash.slice(0, 18)}… ${p.txHash ? "anchored" : "pending"}`));
}
