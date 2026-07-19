import { Agent } from "./base.js";
export declare class ExecutorAgent extends Agent {
    readonly name = "Executor";
    protected system(): string;
}
