import { digest } from "../replay/canonical.js";
// Verifiable reasoning: hash the full decision (votes, features, rationale)
// so any observer can later check the desk acted as it claimed. In the hosted
// tier this runs inside a TEE and the attestation is signed by the enclave.
//
// Hashing is canonical (sorted keys) so the digest survives refactors and
// reproduces on any machine — see `bastion replay`.
export function attest(verdict, features) {
    return {
        verdictHash: digest(verdict),
        featuresHash: digest(features),
        attestedAt: Date.now(),
    };
}
