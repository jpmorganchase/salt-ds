import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { loadRegistry } from "../registry/loadRegistry.js";
import { registerSaltTools } from "./registerTools.js";
import {
  buildSaltMcpInstructions,
  buildSaltMcpServerInfo,
} from "./serverMetadata.js";
import type { SourceAttributionOptions } from "./sourceAttribution.js";

interface CreateServerOptions extends SourceAttributionOptions {
  registryDir?: string;
}

export async function createSaltMcpServer(options: CreateServerOptions = {}) {
  const registry = await loadRegistry({ registryDir: options.registryDir });

  const server = new McpServer(buildSaltMcpServerInfo(registry), {
    instructions: buildSaltMcpInstructions(registry),
  });

  registerSaltTools(server, registry, {
    siteBaseUrl: options.siteBaseUrl,
  });

  return server;
}
