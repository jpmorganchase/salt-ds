export { createSaltMcpServer } from "./createServer.js";
export {
  getSaltProjectContext,
  type SaltProjectContextResult,
} from "./projectContext.js";
export { registerSaltTools } from "./registerTools.js";
export {
  buildSaltMcpInstructions,
  buildSaltMcpServerInfo,
  getSaltMcpRuntimeMetadata,
  type SaltMcpRuntimeMetadata,
} from "./serverMetadata.js";
export {
  buildStructuredToolContent,
  collectToolSources,
  normalizeToolSource,
  type SourceAttributionOptions,
  type ToolSource,
  type ToolSourceKind,
} from "./sourceAttribution.js";
export {
  TOOL_DEFINITIONS,
  type ToolDefinition,
} from "./toolDefinitions.js";
