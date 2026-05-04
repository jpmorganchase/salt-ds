import fs from "node:fs";
import path from "node:path";
import { getPackageRoot } from "@salt-ds/semantic-core/registry/paths";
import {
  buildSaltCapabilityManifest,
  type SaltCapabilityManifest,
} from "@salt-ds/semantic-core/tools/capabilityManifest";
import type { SaltRegistry } from "../types.js";

const SALT_MCP_SERVER_NAME = "salt-mcp";
export const SALT_MCP_CAPABILITY_MANIFEST_URI = "salt://capabilities/manifest";
export const SALT_MCP_CATALOG_MANIFEST_URI = "salt://catalog/manifest";
export const SALT_MCP_CATALOG_ENTITY_TEMPLATE_URI =
  "salt://catalog/entity/{name}";
export const SALT_MCP_CATALOG_CANDIDATES_TEMPLATE_URI =
  "salt://catalog/candidates/{query}";
export const SALT_MCP_CATALOG_FAMILY_TEMPLATE_URI =
  "salt://catalog/family/{family}";
export const SALT_MCP_CONTEXT_MANIFEST_URI = "salt://context/manifest";
export const SALT_MCP_CONTEXT_HEALTH_URI = "salt://context/health";
export const SALT_MCP_CONTEXT_COVERAGE_URI = "salt://context/coverage";
export const SALT_MCP_CONTEXT_PACK_URI = "salt://context/pack";
export const SALT_MCP_CONTEXT_RELEASE_GATE_URI =
  "salt://context/release-gate";
export const SALT_MCP_AI_SETUP_URI = "salt://setup/ai";
export const SALT_MCP_AI_EVIDENCE_CLOSURE_URI =
  "salt://setup/ai/evidence-closure";
export const SALT_MCP_CONTEXT_COMPONENT_TEMPLATE_URI =
  "salt://context/component/{name}";
export const SALT_MCP_CONTEXT_COMPONENT_MARKDOWN_TEMPLATE_URI =
  "salt://context/component/{name}.context.md";
export const SALT_MCP_CONTEXT_PATTERN_TEMPLATE_URI =
  "salt://context/pattern/{name}";
export const SALT_MCP_CONTEXT_FOUNDATION_TEMPLATE_URI =
  "salt://context/foundation/tokens/{category}";

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
      setup_contract_ids: ["get_salt_project_context", "bootstrap_salt_repo"],
    },
    public_surface: {
      default_surface_ids: [
        "get_salt_project_context",
        "bootstrap_salt_repo",
        "create_salt_ui",
        "review_salt_ui",
        "migrate_to_salt",
        "upgrade_salt_ui",
        "get_salt_entity",
        "get_salt_examples",
        "discover_salt",
        "validate_salt_review_report",
        "resume_salt_review",
      ],
      advanced_output_ids: ["view:full"],
    },
    support_tools: {
      policy: "optional_advanced_host_surface",
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
      repo_bootstrap: true,
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
        portable_bundle: true,
      },
    },
    resources: {
      capability_manifest_uri: SALT_MCP_CAPABILITY_MANIFEST_URI,
      catalog_manifest_uri: SALT_MCP_CATALOG_MANIFEST_URI,
      catalog_entity_template_uri: SALT_MCP_CATALOG_ENTITY_TEMPLATE_URI,
      catalog_candidates_template_uri: SALT_MCP_CATALOG_CANDIDATES_TEMPLATE_URI,
      catalog_family_template_uri: SALT_MCP_CATALOG_FAMILY_TEMPLATE_URI,
      context_manifest_uri: SALT_MCP_CONTEXT_MANIFEST_URI,
      context_health_uri: SALT_MCP_CONTEXT_HEALTH_URI,
      context_coverage_uri: SALT_MCP_CONTEXT_COVERAGE_URI,
      context_pack_uri: SALT_MCP_CONTEXT_PACK_URI,
      context_release_gate_uri: SALT_MCP_CONTEXT_RELEASE_GATE_URI,
      ai_setup_uri: SALT_MCP_AI_SETUP_URI,
      ai_evidence_closure_uri: SALT_MCP_AI_EVIDENCE_CLOSURE_URI,
      context_component_template_uri: SALT_MCP_CONTEXT_COMPONENT_TEMPLATE_URI,
      context_component_markdown_template_uri:
        SALT_MCP_CONTEXT_COMPONENT_MARKDOWN_TEMPLATE_URI,
      context_pattern_template_uri: SALT_MCP_CONTEXT_PATTERN_TEMPLATE_URI,
      context_foundation_template_uri:
        SALT_MCP_CONTEXT_FOUNDATION_TEMPLATE_URI,
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
    `Serving Salt registry v${metadata.registry_version}.`,
    `Registry generated at ${metadata.registry_generated_at}.`,
    `Machine-readable capability manifest resource: ${metadata.capability_manifest_uri}.`,
    `Machine-readable retrieval catalog resources: ${SALT_MCP_CATALOG_MANIFEST_URI}, ${SALT_MCP_CATALOG_ENTITY_TEMPLATE_URI}, ${SALT_MCP_CATALOG_CANDIDATES_TEMPLATE_URI}.`,
    `Catalog family browsing is available through ${SALT_MCP_CATALOG_FAMILY_TEMPLATE_URI}.`,
    `Generated context resources are available through ${SALT_MCP_CONTEXT_MANIFEST_URI}, ${SALT_MCP_CONTEXT_HEALTH_URI}, ${SALT_MCP_CONTEXT_COVERAGE_URI}, ${SALT_MCP_CONTEXT_PACK_URI}, ${SALT_MCP_CONTEXT_RELEASE_GATE_URI}, ${SALT_MCP_CONTEXT_COMPONENT_TEMPLATE_URI}, ${SALT_MCP_CONTEXT_COMPONENT_MARKDOWN_TEMPLATE_URI}, ${SALT_MCP_CONTEXT_PATTERN_TEMPLATE_URI}, and ${SALT_MCP_CONTEXT_FOUNDATION_TEMPLATE_URI}.`,
    `AI setup state is available through ${SALT_MCP_AI_SETUP_URI}; final-pass evidence closure state is available through ${SALT_MCP_AI_EVIDENCE_CLOSURE_URI}.`,
    "When asked for the MCP version, use the runtime version.",
    "When asked about the Salt content version, use the registry version.",
    "This MCP only provides canonical Salt guidance from official Salt sources.",
    "Repo-local wrappers, approved custom patterns, and team-specific conventions stay in declared project policy, not in the core Salt registry.",
    "When a repo-aware workflow says project conventions matter, make sure the repo has declared policy through .salt/team.json or .salt/stack.json and let the workflow artifacts carry the resulting refinement and provenance.",
    "Workflow follow-ups use stable public tool IDs. retrieve_entity and retrieve_examples actions name registered read-only support tools.",
    "For repo-aware work, start with get_salt_project_context by default before choosing the main workflow tool, and pass an explicit root_dir whenever the host already knows the active workspace path.",
    "If a context result reports resolution.status = needs_explicit_root or mismatch, stop and retry with explicit root_dir or a known context_id before relying on repo-specific guidance.",
    "Only reuse get_salt_project_context.result.context_id when it is non-null. When context_health.trusted is false, use artifacts.summary.retry_with.root_dir for the next context call instead of guessing.",
    "If repo bootstrap is still required, use bootstrap_salt_repo before relying on repo-specific Salt refinement.",
    "Primary workflow tools return a compact top-level contract by default. Treat top-level status, safety, and action as the authoritative branching surface.",
    `When compact create remains broad or mixed-surface, inspect retrieval catalog support through ${SALT_MCP_CATALOG_CANDIDATES_TEMPLATE_URI}, ${SALT_MCP_CATALOG_ENTITY_TEMPLATE_URI}, and ${SALT_MCP_CATALOG_FAMILY_TEMPLATE_URI} before escalating to full output.`,
    "A partial or blocked workflow result is not complete. Follow the returned action or report the incomplete state explicitly.",
    "migrate_to_salt returns post_migration_verification so the agent can carry a deterministic follow-up loop back into local review work.",
    "review_salt_ui returns fix_candidates as agent-applied remediation guidance rather than as direct file mutation.",
    "Use persist_salt_context_pack or persist_salt_generated_artifact only when the host needs durable files; both write inside the requested root_dir after semantic-core release-gate validation.",
    "Keep the visible MCP front door workflow-first: get_salt_project_context first, bootstrap via bootstrap_salt_repo when required, then create via create_salt_ui, review via review_salt_ui, migrate via migrate_to_salt, and upgrade via upgrade_salt_ui.",
    "The default beta MCP surface exposes repo-aware workflow tools, Salt support tools for entity/example/discovery grounding, and explicit persistence tools; use the capability manifest and current tool list for exact availability.",
    "Keep the product workflows stable across transports: create maps to create_salt_ui, review maps to review_salt_ui, migrate maps to migrate_to_salt, upgrade maps to upgrade_salt_ui and then review_salt_ui on changed code, and review --url combines source analysis with local runtime evidence outside MCP when needed.",
    "For non-Salt UI adoption, foreign-library conversion, or mockup-to-Salt planning, prefer migrate_to_salt before review_salt_ui.",
    "Only call tools that are actually present in the current session tool list.",
  ].join(" ");
}
