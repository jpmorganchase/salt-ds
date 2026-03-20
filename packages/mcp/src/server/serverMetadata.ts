import fs from "node:fs";
import type { SaltRegistry } from "../types.js";

const SALT_MCP_SERVER_NAME = "salt-mcp";

interface SaltMcpPackageManifest {
  name: string;
  version: string;
}

let cachedPackageManifest: SaltMcpPackageManifest | null = null;

function getSaltMcpPackageManifest(): SaltMcpPackageManifest {
  if (cachedPackageManifest) {
    return cachedPackageManifest;
  }

  const manifest = JSON.parse(
    fs.readFileSync(new URL("../../package.json", import.meta.url), "utf8"),
  ) as Partial<SaltMcpPackageManifest>;

  if (
    typeof manifest.name !== "string" ||
    manifest.name.length === 0 ||
    typeof manifest.version !== "string" ||
    manifest.version.length === 0
  ) {
    throw new Error(
      "packages/mcp/package.json is missing a valid name or version.",
    );
  }

  cachedPackageManifest = {
    name: manifest.name,
    version: manifest.version,
  };

  return cachedPackageManifest;
}

export interface SaltMcpRuntimeMetadata {
  server_name: string;
  package_name: string;
  mcp_version: string;
  registry_version: string;
  registry_generated_at: string;
}

export function getSaltMcpRuntimeMetadata(
  registry: SaltRegistry,
): SaltMcpRuntimeMetadata {
  const packageManifest = getSaltMcpPackageManifest();

  return {
    server_name: SALT_MCP_SERVER_NAME,
    package_name: packageManifest.name,
    mcp_version: packageManifest.version,
    registry_version: registry.version,
    registry_generated_at: registry.generated_at,
  };
}

export function buildSaltMcpServerInfo(registry: SaltRegistry) {
  const metadata = getSaltMcpRuntimeMetadata(registry);

  return {
    name: metadata.server_name,
    version: metadata.mcp_version,
  };
}

export function buildSaltMcpInstructions(registry: SaltRegistry): string {
  const metadata = getSaltMcpRuntimeMetadata(registry);

  return [
    `Salt MCP runtime: ${metadata.package_name} v${metadata.mcp_version}.`,
    `Serving Salt registry v${metadata.registry_version}.`,
    `Registry generated at ${metadata.registry_generated_at}.`,
    "When asked for the MCP version, use the runtime version.",
    "When asked about the Salt content version, use the registry version.",
    "This MCP only provides canonical Salt guidance from official Salt sources.",
    "Repo-local wrappers, approved custom patterns, and team-specific conventions belong in separate project conventions, not in the core Salt registry.",
    "When a tool response includes project_conventions.check_recommended = true, confirm project-specific conventions through those separate project conventions or a targeted clarification before finalizing implementation advice.",
    "Routing decisions and suggested follow-ups use logical workflow labels, not guaranteed callable tool IDs.",
    "For non-Salt UI adoption, foreign-library conversion, or mockup-to-Salt planning, prefer translate_ui_to_salt before analyze_salt_code.",
    "Only call tools that are actually present in the current session tool list.",
  ].join(" ");
}
