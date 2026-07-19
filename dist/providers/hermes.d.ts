export interface LLM {
    reason(system: string, user: string): Promise<string>;
}
export declare class HermesProvider implements LLM {
    private readonly model;
    private client;
    constructor(model?: string, baseURL?: string);
    reason(system: string, user: string): Promise<string>;
}
