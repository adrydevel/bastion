import type { Proof, Verdict } from "../types.js";
import type { Cassette } from "../replay/cassette.js";
import type { ReplayResult } from "../replay/verify.js";
export declare function banner(): void;
export declare function note(s: string): void;
export declare function warn(s: string): void;
export declare function printVerdict(v: Verdict, p: Proof): void;
export declare function printReplay(c: Cassette, r: ReplayResult): void;
