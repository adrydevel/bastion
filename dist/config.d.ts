import { z } from "zod";
export declare const ConfigSchema: z.ZodObject<{
    rpcUrl: z.ZodDefault<z.ZodString>;
    chainId: z.ZodDefault<z.ZodNumber>;
    universe: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    maxKelly: z.ZodDefault<z.ZodNumber>;
    cvarLimit: z.ZodDefault<z.ZodNumber>;
    maxDrawdown: z.ZodDefault<z.ZodNumber>;
    quorum: z.ZodDefault<z.ZodNumber>;
    provider: z.ZodDefault<z.ZodString>;
    attestOnchain: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    rpcUrl: string;
    chainId: number;
    universe: string[];
    maxKelly: number;
    cvarLimit: number;
    maxDrawdown: number;
    quorum: number;
    provider: string;
    attestOnchain: boolean;
}, {
    rpcUrl?: string | undefined;
    chainId?: number | undefined;
    universe?: string[] | undefined;
    maxKelly?: number | undefined;
    cvarLimit?: number | undefined;
    maxDrawdown?: number | undefined;
    quorum?: number | undefined;
    provider?: string | undefined;
    attestOnchain?: boolean | undefined;
}>;
export type Config = z.infer<typeof ConfigSchema>;
export declare function loadConfig(partial?: Partial<Config>): Config;
