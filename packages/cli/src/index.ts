/// <reference types="node" preserve="true" />

import { runCli as runCliImplementation } from "./cli.js";

/** Run the public Salt CLI with explicit arguments. */
export const runCli: (argv?: string[]) => Promise<number> = runCliImplementation;
