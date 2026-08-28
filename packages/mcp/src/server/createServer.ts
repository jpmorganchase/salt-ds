import { McpServer } from "@modelcontextprotocol/server";
import {
  type KnowledgeRuntimeContext,
} from "@salt-ds/knowledge";
import { configureProjectRoots } from "./projectAccess.js";
import { registerSaltResources } from "./registerResources.js";
import { registerSaltTools } from "./registerTools.js";
import { getSaltMcpPackageManifest } from "./serverMetadata.js";

/** Repository-test seam; deliberately absent from the package-root export. */
export async function createSaltMcpServerWithContext(
  options: { projectRoots?: string[] },
  knowledge: KnowledgeRuntimeContext,
): Promise<McpServer> {
  const projectRoots = await configureProjectRoots(options.projectRoots ?? []);
  const packageManifest = getSaltMcpPackageManifest();
  const server = new McpServer(
    { name: packageManifest.name, version: packageManifest.version },
    {
      instructions:
        "Read-only, offline Salt Design System knowledge. Static knowledge needs no project root; project inspection uses only roots configured at startup.",
      supportedProtocolVersions: ["2026-07-28"],
      cacheHints: {
        "tools/list": { ttlMs: 86_400_000, cacheScope: "public" },
        "resources/list": { ttlMs: 86_400_000, cacheScope: "public" },
        "resources/templates/list": {
          ttlMs: 86_400_000,
          cacheScope: "public",
        },
        "resources/read": { ttlMs: 86_400_000, cacheScope: "public" },
      },
    },
  );

  registerSaltResources(server, knowledge.store);
  registerSaltTools(server, { ...knowledge, projectRoots });
  return server;
}
