/// <reference types="node" preserve="true" />

import type { McpServer } from "@modelcontextprotocol/server";
import { runCli as runCliImplementation } from "./cli.js";
import { createSaltMcpServer as createSaltMcpServerImplementation } from "./server/createServer.js";

export type ProjectAccessOptions =
  | {
      mode: "restricted";
      allowedRoots: string[];
      defaultRoot?: string;
    }
  | {
      mode: "unrestricted_local_stdio";
      defaultRoot?: string;
    };

export interface CreateSaltMcpServerOptions {
  registryDir?: string;
  projectAccess?: ProjectAccessOptions;
}

export const runCli: (argv?: string[]) => Promise<void> = runCliImplementation;

export const createSaltMcpServer: (
  options?: CreateSaltMcpServerOptions,
) => Promise<McpServer> = createSaltMcpServerImplementation;
