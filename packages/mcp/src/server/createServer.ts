import { McpServer } from "@modelcontextprotocol/server";
import { loadKnowledgeRuntimeContext } from "../core/runtime.js";
import {
  createProjectAccessPolicy,
  type ProjectAccessOptions,
} from "./projectAccess.js";
import { ProjectPolicySnapshotCache } from "./projectPolicySnapshot.js";
import { registerSaltResources } from "./registerResources.js";
import { registerSaltTools } from "./registerTools.js";
import {
  buildSaltMcpInstructions,
  buildSaltMcpServerInfo,
  SALT_MCP_SUPPORTED_LEGACY_PROTOCOL_VERSIONS,
} from "./serverMetadata.js";

interface CreateServerOptions {
  registryDir?: string;
  projectAccess?: ProjectAccessOptions;
}

export async function createSaltMcpServer(options: CreateServerOptions = {}) {
  const context = await loadKnowledgeRuntimeContext({
    bundleDir: options.registryDir,
  });
  const projectAccess = await createProjectAccessPolicy(options.projectAccess);
  const projectPolicySnapshots = new ProjectPolicySnapshotCache();
  const serverInfo = buildSaltMcpServerInfo(context);

  const server = new McpServer(serverInfo, {
    instructions: buildSaltMcpInstructions(context),
    supportedProtocolVersions: [...SALT_MCP_SUPPORTED_LEGACY_PROTOCOL_VERSIONS],
    capabilities: {
      resources: { listChanged: false, subscribe: false },
    },
  });

  registerSaltResources(server, {
    ...context,
    projectAccess,
    projectPolicySnapshots,
  });
  registerSaltTools(server, {
    ...context,
    projectAccess,
    projectPolicySnapshots,
  }, serverInfo);

  return server;
}
