#!/usr/bin/env node
import { buildProgram } from "./cli/commands.js";
buildProgram()
    .parseAsync(process.argv)
    .catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
});
export * from "./types.js";
export { assembleCouncil, step } from "./swarm/debate.js";
export { loadConfig } from "./config.js";
