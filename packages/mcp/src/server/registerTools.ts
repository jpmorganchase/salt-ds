import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { SaltRegistry } from "../types.js";
import {
  buildStructuredToolContent,
  type SourceAttributionOptions,
} from "./sourceAttribution.js";
import {
  createToolExecutionRuntime,
  TOOL_DEFINITIONS,
  type ToolDefinition,
  type ToolExecutionRuntime,
} from "./toolDefinitions.js";

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
  runtime: ToolExecutionRuntime,
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
      toToolResult(await definition.execute(registry, args, runtime), options),
  );
}

export function registerSaltTools(
  server: McpServer,
  registry: SaltRegistry,
  options: SourceAttributionOptions = {},
) {
  const runtime = createToolExecutionRuntime();

  for (const definition of TOOL_DEFINITIONS) {
    registerTool(server, registry, definition, runtime, options);
  }
}
