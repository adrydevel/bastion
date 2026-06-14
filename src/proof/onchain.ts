import type { Proof } from "../types.js";
import type { RobinhoodChain } from "../chain/robinhood.js";

// Anchor the decision hash on Robinhood Chain. The proof itself is tiny — a
// pair of hashes and a timestamp — so anchoring is cheap and every trade
// carries an auditable, tamper-evident trail.
export async function anchor(chain: RobinhoodChain, proof: Proof): Promise<Proof> {
  const txHash = await chain.writeProof(proof.verdictHash, proof.featuresHash);
  return { ...proof, txHash };
}
