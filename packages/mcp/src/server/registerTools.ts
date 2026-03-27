import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { SaltRegistry } from "../types.js";
import {
  buildStructuredToolContent,
  type SourceAttributionOptions,
} from "./sourceAttribution.js";
import { TOOL_DEFINITIONS, type ToolDefinition } from "./toolDefinitions.js";

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
      outputSchema: definition.outputSchema,
      annotations: definition.annotations,
    },
    async (args: object) =>
      toToolResult(await definition.execute(registry, args), options),
  );
}

export function registerSaltTools(
  server: McpServer,
  registry: SaltRegistry,
  options: SourceAttributionOptions = {},
) {
  for (const definition of TOOL_DEFINITIONS) {
    registerTool(server, registry, definition, options);
  }
}
