import budgets from "../public-surface-budgets.json";

// Discovery metadata must remain comfortably bounded for generic MCP hosts,
// while leaving room for descriptions that make tools usable without a skill.
export const MAX_TOOL_DISCOVERY_UTF8_BYTES = budgets.toolDiscoveryUtf8Bytes;
