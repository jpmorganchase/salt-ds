import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { runCli as runCliImplementation } from "./cli.js";
import { createSaltMcpServer as createSaltMcpServerImplementation } from "./server/createServer.js";

export interface CreateSaltMcpServerOptions {
  registryDir?: string;
  siteBaseUrl?: string;
}

export const runCli: (argv?: string[]) => Promise<void> = runCliImplementation;

export const createSaltMcpServer: (
  options?: CreateSaltMcpServerOptions,
) => Promise<McpServer> = createSaltMcpServerImplementation;
