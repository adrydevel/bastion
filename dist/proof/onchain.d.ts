import type { Proof } from "../types.js";
import type { RobinhoodChain } from "../chain/robinhood.js";
export declare function anchor(chain: RobinhoodChain, proof: Proof): Promise<Proof>;
