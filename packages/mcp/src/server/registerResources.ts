import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { SaltRegistry } from "../types.js";
import {
  getSaltMcpRuntimeMetadata,
  SALT_MCP_CAPABILITY_MANIFEST_URI,
} from "./serverMetadata.js";

export function registerSaltResources(
  server: McpServer,
  registry: SaltRegistry,
) {
  const runtimeMetadata = getSaltMcpRuntimeMetadata(registry);
  const manifestText = JSON.stringify(
    runtimeMetadata.capability_manifest,
    null,
    2,
  );

  server.registerResource(
    "salt_capability_manifest",
    SALT_MCP_CAPABILITY_MANIFEST_URI,
    {
      title: "Salt Capability Manifest",
      description:
        "Machine-readable Salt MCP capability and contract manifest.",
      mimeType: "application/json",
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.toString(),
          mimeType: "application/json",
          text: manifestText,
        },
      ],
    }),
  );
}
