import { keccak256, toHex } from "viem";
// Canonical JSON: keys sorted at every depth, no insignificant whitespace,
// `undefined` members dropped. Two structurally equal values always serialise
// to identical bytes — which is the whole reason a decision hash still
// verifies on someone else's machine months later. Plain JSON.stringify leaks
// key *insertion* order into the digest, so a refactor that reorders a struct
// literal would silently invalidate every historical proof.
export function canonical(value) {
    if (value === undefined)
        return "null";
    if (value === null || typeof value !== "object") {
        return JSON.stringify(value) ?? "null";
    }
    if (Array.isArray(value)) {
        return "[" + value.map(canonical).join(",") + "]";
    }
    const entries = Object.entries(value)
        .filter(([, v]) => v !== undefined)
        .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
    return ("{" +
        entries.map(([k, v]) => JSON.stringify(k) + ":" + canonical(v)).join(",") +
        "}");
}
export function digest(value) {
    return keccak256(toHex(canonical(value)));
}
