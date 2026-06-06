import { keccak256, toHex } from "viem";
import type { Proof, Verdict } from "../types.js";

// Verifiable reasoning: hash the full decision (votes, features, rationale)
// so any observer can later check the desk acted as it claimed. In the hosted
// tier this runs inside a TEE and the attestation is signed by the enclave.
export function attest(verdict: Verdict, features: unknown): Proof {
  const verdictHash = keccak256(toHex(JSON.stringify(verdict)));
  const featuresHash = keccak256(toHex(JSON.stringify(features)));
  return { verdictHash, featuresHash, attestedAt: Date.now() };
}
