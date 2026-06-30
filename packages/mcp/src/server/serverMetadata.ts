import fs from "node:fs";
import path from "node:path";
import { getPackageRoot } from "@salt-ds/semantic-core/registry/paths";
import {
  buildSaltCapabilityManifest,
  type SaltCapabilityManifest,
} from "@salt-ds/semantic-core/tools/capabilityManifest";
import type { SaltRegistry } from "@salt-ds/semantic-core/types";

const SALT_MCP_SERVER_NAME = "salt-mcp";
export const SALT_MCP_CAPABILITY_MANIFEST_URI = "salt://capabilities/manifest";
export const SALT_MCP_CATALOG_MANIFEST_URI = "salt://catalog/manifest";
export const SALT_MCP_CATALOG_ENTITY_TEMPLATE_URI =
  "salt://catalog/entity/{name}";

interface SaltMcpPackageManifest {
  name: string;
  version: string;
}

let cachedPackageManifest: SaltMcpPackageManifest | null = null;

export function getSaltMcpPackageManifest(): SaltMcpPackageManifest {
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
  capability_manifest_uri: typeof SALT_MCP_CAPABILITY_MANIFEST_URI;
  capability_manifest: SaltCapabilityManifest;
}

export function getSaltMcpRuntimeMetadata(
  registry: SaltRegistry,
): SaltMcpRuntimeMetadata {
  const packageManifest = getSaltMcpPackageManifest();
  const capabilityManifest = buildSaltCapabilityManifest({
    transport: "mcp",
    runtime: {
      package_name: packageManifest.name,
      package_version: packageManifest.version,
      server_name: SALT_MCP_SERVER_NAME,
      command_name: "salt-mcp",
    },
    registry: {
      available: true,
      version: registry.version,
      generated_at: registry.generated_at,
    },
    contracts: {
      setup_contract_ids: ["get_salt_project_context"],
    },
    public_surface: {
      default_surface_ids: [
        "get_salt_project_context",
        "get_salt_reference",
        "review_salt_ui",
        "create_salt_ui",
        "migrate_to_salt",
      ],
      advanced_output_ids: [],
    },
    support_tools: {
      policy: "default_read_only_host_surface",
      default_exposed: true,
    },
    support_surface: {
      retrieval_catalog: {
        available: true,
        access: ["resource"],
      },
    },
    capabilities: {
      repo_context: true,
      repo_bootstrap: false,
      starter_code: true,
      exact_request_safety: true,
      deterministic_next_step: true,
      review_runtime_url: false,
      starter_only_create_artifact: false,
      visual_input: {
        source_outline: true,
        runtime_capture: false,
        image_or_mockup_inputs: false,
        normalized_adapter_contract: null,
      },
      handoff: {
        portable_bundle: false,
      },
    },
    resources: {
      capability_manifest_uri: SALT_MCP_CAPABILITY_MANIFEST_URI,
      catalog_manifest_uri: SALT_MCP_CATALOG_MANIFEST_URI,
      catalog_entity_template_uri: SALT_MCP_CATALOG_ENTITY_TEMPLATE_URI,
    },
  });

  return {
    server_name: SALT_MCP_SERVER_NAME,
    package_name: packageManifest.name,
    mcp_version: packageManifest.version,
    registry_version: registry.version,
    registry_generated_at: registry.generated_at,
    capability_manifest_uri: SALT_MCP_CAPABILITY_MANIFEST_URI,
    capability_manifest: capabilityManifest,
  };
}

export function buildSaltMcpServerInfo(registry: SaltRegistry) {
  const metadata = getSaltMcpRuntimeMetadata(registry);

  return {
    name: metadata.server_name,
    version: metadata.mcp_version,
    description: `Workflow-first Salt MCP for canonical Salt guidance. Capability manifest: ${metadata.capability_manifest_uri}.`,
  };
}

export function buildSaltMcpInstructions(registry: SaltRegistry): string {
  const metadata = getSaltMcpRuntimeMetadata(registry);

  return [
    `Salt MCP runtime: ${metadata.package_name} v${metadata.mcp_version}.`,
    `Serving offline Salt catalog v${metadata.registry_version}.`,
    `Offline Salt catalog generated at ${metadata.registry_generated_at}.`,
    `Machine-readable capability manifest resource: ${metadata.capability_manifest_uri}.`,
    `Machine-readable retrieval catalog resources: ${SALT_MCP_CATALOG_MANIFEST_URI}, ${SALT_MCP_CATALOG_ENTITY_TEMPLATE_URI}.`,
    "When asked for the MCP version, use the runtime version.",
    "When asked about the Salt content version, use the offline Salt catalog version.",
    "This MCP only provides canonical Salt guidance from official Salt sources.",
    "Repo-local wrappers, approved custom patterns, and team-specific conventions stay in declared project policy, not in the offline Salt catalog bundled with the MCP server.",
    "When a repo-aware workflow says project conventions matter, make sure the repo has declared policy through .salt/team.json or .salt/stack.json and let the workflow artifacts carry the resulting refinement and provenance.",
    "Workflow follow-ups use stable public tool IDs. retrieve_entity and retrieve_examples actions name registered read-only support tools.",
    "For repo-aware work, start with get_salt_project_context by default before choosing the main workflow tool, and pass an explicit root_dir whenever the host already knows the active workspace path.",
    "If a context result reports resolution.status = needs_explicit_root or mismatch, stop and retry with explicit root_dir or a known context_id before relying on repo-specific guidance.",
    "Only reuse get_salt_project_context.result.context_id when it is non-null. When context_health.trusted is false, use artifacts.summary.retry_with.root_dir for the next context call instead of guessing.",
    "Primary workflow tools return a compact top-level contract by default. Treat top-level status, safety, and action as the authoritative branching surface.",
    `When compact create requests exact entity evidence, inspect retrieval catalog support through ${SALT_MCP_CATALOG_ENTITY_TEMPLATE_URI}.`,
    "A partial or blocked workflow result is not complete. Follow the returned action or report the incomplete state explicitly.",
    "migrate_to_salt returns post_migration_verification so the agent can carry a deterministic follow-up loop back into local review work.",
    "review_salt_ui returns fix_candidates as agent-applied remediation guidance rather than as direct file mutation.",
    "Keep the visible MCP front door workflow-first: get_salt_project_context first, then create via create_salt_ui, review via review_salt_ui, or migrate via migrate_to_salt. Use get_salt_reference for exact reference follow-ups.",
    "The v1 MCP surface is read-only: it does not bootstrap repos, persist artifacts, run browser evidence, or expose public CLI workflow fallbacks.",
    "For non-Salt UI adoption, foreign-library conversion, or mockup-to-Salt planning, prefer migrate_to_salt before review_salt_ui.",
    "Only call tools that are actually present in the current session tool list.",
  ].join(" ");
}
