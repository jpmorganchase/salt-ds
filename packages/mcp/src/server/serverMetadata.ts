import fs from "node:fs";
import path from "node:path";
import { getPackageRoot } from "@salt-ds/semantic-core/registry/paths";
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
    fs.readFileSync(
      path.join(getPackageRoot(import.meta.url), "package.json"),
      "utf8",
    ),
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
    "Repo-local wrappers, approved custom patterns, and team-specific conventions stay in declared project policy, not in the core Salt registry.",
    "When a repo-aware workflow says project conventions matter, make sure the repo has declared policy through .salt/team.json or .salt/stack.json and let the workflow artifacts carry the resulting refinement and provenance.",
    "Workflow follow-ups use stable public tool IDs, even when a support helper is not part of the default six-tool surface.",
    "For repo-aware work, start with get_salt_project_context by default before choosing the main workflow tool.",
    "If repo bootstrap is still required, use bootstrap_salt_repo before relying on repo-specific Salt refinement.",
    "Primary workflow tools now return workflow-level confidence and escalation guidance alongside their canonical Salt payloads.",
    "migrate_to_salt returns post_migration_verification so the agent can carry a deterministic follow-up loop back into local review work.",
    "review_salt_ui returns fix_candidates as agent-applied remediation guidance rather than as direct file mutation.",
    "Keep the visible MCP front door workflow-first: get_salt_project_context first, bootstrap via bootstrap_salt_repo when required, then create via create_salt_ui, review via review_salt_ui, migrate via migrate_to_salt, and upgrade via upgrade_salt_ui.",
    "The default beta MCP surface is intentionally limited to the six repo-aware workflow tools.",
    "Keep the product workflows stable across transports: create maps to create_salt_ui, review maps to review_salt_ui, migrate maps to migrate_to_salt, upgrade maps to upgrade_salt_ui and then review_salt_ui on changed code, and review --url combines source analysis with local runtime evidence outside MCP when needed.",
    "For non-Salt UI adoption, foreign-library conversion, or mockup-to-Salt planning, prefer migrate_to_salt before review_salt_ui.",
    "Only call tools that are actually present in the current session tool list.",
  ].join(" ");
}
