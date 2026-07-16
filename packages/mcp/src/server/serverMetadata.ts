import fs from "node:fs";
import path from "node:path";
import {
  buildSaltCapabilityManifest,
  getPackageRoot,
  type SaltCapabilityManifest,
  type SaltRegistry,
} from "../core/runtime.js";

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
    "Workflow follow-ups use stable server-local semantic tool IDs; a host-visible function may be bare or qualified. Resolve an action ID only within the configured Salt server to one unique exact bare name or qualified name whose final semantic segment equals the ID, preserve action.args exactly, and never suffix-match across unrelated or unidentified servers. If no unique Salt match exists, refresh that server's live surface once, then report the ambiguity and stop. The top-level action is the single authoritative next step. For an exact-name create retry, execute the complete action.args object unchanged; it preserves canonical root_dir and every intent-bearing create option while replacing only query. Never add unrelated entities to resolved_entities as helpful evidence. A create reference action may request one to three names. Execute its one-level action.post_action only when the immediately preceding get_salt_reference result has decision.status = results, requested_count and found_count equal the action's requested-name count, not_found_count = 0, ambiguous_count = 0, unresolved_names empty, and every nested result decision is found. On any partial, ambiguous, or missing result, stop or retry with only names proven found; never treat the post-action's requested names as evidence. Dependency installation stays outside the semantic workflow contract. ask_user stops with action.post_action set to null and requires updated user input.",
    "An apply_fixes action identifies grounded review fixes but does not authorize file mutation; obtain host or user authorization before applying fixes, then run its review post-action.",
    "For repo-aware work, call the matching workflow directly with root_dir when the host knows the active workspace. Without root_dir, the workflow inspects the MCP process working directory. Use get_salt_project_context only for explicit diagnostics or disputed roots.",
    "If a context result reports resolution.status = needs_explicit_root or mismatch, stop and retry the workflow with artifacts.summary.retry_with.root_dir before relying on repo-specific guidance.",
    "Workflow context is resolved from root_dir or the MCP working directory. Never rely on process-local context identifiers or a previously inspected repo.",
    "Primary workflow tools return one compact contract. Treat top-level status, safety, action, guidance, evidence, and summary as the authoritative branching surface.",
    "A partial or blocked workflow result is not complete. Follow the returned action or report the incomplete state explicitly.",
    "Compact guidance is workflow-specific and bounded: create returns a decision plus starter guidance; review returns findings and fixes; migrate returns translations, a migration plan, starter guidance, and post-migration verification.",
    "Keep the visible MCP front door workflow-first: call create_salt_ui, review_salt_ui, or migrate_to_salt directly, and use get_salt_reference only for exact reference follow-ups. Use get_salt_project_context when context diagnostics are the task.",
    "The v1 MCP surface is read-only: it does not bootstrap repos, persist artifacts, run browser evidence, or expose public CLI workflow fallbacks.",
    "For non-Salt UI adoption, foreign-library conversion, or mockup-to-Salt planning, prefer migrate_to_salt before review_salt_ui.",
    "Only call tools that are actually present in the current session tool list.",
  ].join(" ");
}
