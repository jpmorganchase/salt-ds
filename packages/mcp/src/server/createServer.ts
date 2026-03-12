import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { loadRegistry } from "../registry/loadRegistry.js";
import { TOOL_DEFINITIONS, type ToolDefinition } from "../tools/index.js";
import type { SaltRegistry } from "../types.js";
import {
  buildStructuredToolContent,
  type SourceAttributionOptions,
} from "./sourceAttribution.js";

interface CreateServerOptions extends SourceAttributionOptions {
  registryDir?: string;
}

function toToolResult(
  payload: unknown,
  options: SourceAttributionOptions = {},
) {
  const structuredContent = buildStructuredToolContent(payload, options);
  const serialized = JSON.stringify(structuredContent);

  return {
    content: [
      {
        type: "text" as const,
        text: serialized,
      },
    ],
    structuredContent,
  };
}

function registerTool(
  server: McpServer,
  registry: SaltRegistry,
  definition: ToolDefinition,
  options: SourceAttributionOptions = {},
) {
  server.registerTool(
    definition.name,
    {
      description: definition.description,
      inputSchema: definition.inputSchema,
    },
    async (args) =>
      toToolResult(await definition.execute(registry, args), options),
  );
}

export async function createSaltMcpServer(options: CreateServerOptions = {}) {
  const registry = await loadRegistry({ registryDir: options.registryDir });

  const server = new McpServer({
    name: "salt-mcp",
    version: registry.version,
  });

  for (const definition of TOOL_DEFINITIONS) {
    registerTool(server, registry, definition, {
      siteBaseUrl: options.siteBaseUrl,
    });
  }

  return server;
}
