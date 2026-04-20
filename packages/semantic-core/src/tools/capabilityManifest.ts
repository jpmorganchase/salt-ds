import type { PublicWorkflowId } from "./publicContract.js";

export const SALT_CAPABILITY_MANIFEST_VERSION =
  "salt_capability_manifest_v1" as const;
export const SALT_COMPACT_WORKFLOW_CONTRACT_VERSION = "v3" as const;

export const SALT_PUBLIC_WORKFLOW_VOCABULARY = [
  { id: "init", label: "init" },
  { id: "create", label: "create" },
  { id: "review", label: "review" },
  { id: "migrate", label: "migrate" },
  { id: "upgrade", label: "upgrade" },
  { id: "review_url", label: "review --url" },
] as const;

export const SALT_COMPACT_WORKFLOW_IDS = [
  "create",
  "review",
  "migrate",
  "upgrade",
] as const satisfies readonly Exclude<PublicWorkflowId, "init">[];

export const SALT_SUPPORT_TOOL_IDS = [
  "discover_salt",
  "get_salt_entity",
  "get_salt_examples",
] as const;

export interface SaltCapabilityManifest {
  manifest_version: typeof SALT_CAPABILITY_MANIFEST_VERSION;
  transport: "cli" | "mcp";
  runtime: {
    package_name: string;
    package_version: string;
    server_name: string | null;
    command_name: string | null;
  };
  registry: {
    available: boolean;
    version: string | null;
    generated_at: string | null;
  };
  contracts: {
    compact_workflow_contract_version: typeof SALT_COMPACT_WORKFLOW_CONTRACT_VERSION;
    compact_workflow_ids: Array<(typeof SALT_COMPACT_WORKFLOW_IDS)[number]>;
    setup_contract_ids: string[];
  };
  workflow_vocabulary: Array<{
    id: (typeof SALT_PUBLIC_WORKFLOW_VOCABULARY)[number]["id"];
    label: (typeof SALT_PUBLIC_WORKFLOW_VOCABULARY)[number]["label"];
  }>;
  public_surface: {
    story: "workflow_first";
    default_response_mode: "compact";
    full_response_mode: "explicit_only";
    default_surface_ids: string[];
    advanced_output_ids: string[];
  };
  support_tools: {
    policy: "optional_advanced_host_surface";
    default_exposed: boolean;
    tool_ids: Array<(typeof SALT_SUPPORT_TOOL_IDS)[number]>;
    workflow_contract_meaning_changes_when_absent: false;
  };
  capabilities: {
    repo_context: boolean;
    repo_bootstrap: boolean;
    starter_code: boolean;
    exact_request_safety: boolean;
    deterministic_next_step: boolean;
    review_runtime_url: boolean;
    starter_only_create_artifact: boolean;
    visual_input: {
      source_outline: boolean;
      runtime_capture: boolean;
      image_or_mockup_inputs: boolean;
      normalized_adapter_contract: string | null;
    };
    handoff: {
      portable_bundle: boolean;
    };
  };
  resources: {
    capability_manifest_uri: string | null;
  };
}

export interface BuildSaltCapabilityManifestOptions {
  transport: SaltCapabilityManifest["transport"];
  runtime: SaltCapabilityManifest["runtime"];
  registry: SaltCapabilityManifest["registry"];
  contracts: {
    setup_contract_ids: string[];
  };
  public_surface: {
    default_surface_ids: string[];
    advanced_output_ids: string[];
  };
  capabilities: SaltCapabilityManifest["capabilities"];
  resources?: Partial<SaltCapabilityManifest["resources"]>;
  support_tools?: Partial<
    Omit<SaltCapabilityManifest["support_tools"], "tool_ids">
  >;
}

export function buildSaltCapabilityManifest(
  options: BuildSaltCapabilityManifestOptions,
): SaltCapabilityManifest {
  return {
    manifest_version: SALT_CAPABILITY_MANIFEST_VERSION,
    transport: options.transport,
    runtime: options.runtime,
    registry: options.registry,
    contracts: {
      compact_workflow_contract_version:
        SALT_COMPACT_WORKFLOW_CONTRACT_VERSION,
      compact_workflow_ids: [...SALT_COMPACT_WORKFLOW_IDS],
      setup_contract_ids: [...options.contracts.setup_contract_ids],
    },
    workflow_vocabulary: [...SALT_PUBLIC_WORKFLOW_VOCABULARY],
    public_surface: {
      story: "workflow_first",
      default_response_mode: "compact",
      full_response_mode: "explicit_only",
      default_surface_ids: [...options.public_surface.default_surface_ids],
      advanced_output_ids: [...options.public_surface.advanced_output_ids],
    },
    support_tools: {
      policy:
        options.support_tools?.policy ?? "optional_advanced_host_surface",
      default_exposed: options.support_tools?.default_exposed ?? false,
      tool_ids: [...SALT_SUPPORT_TOOL_IDS],
      workflow_contract_meaning_changes_when_absent: false,
    },
    capabilities: options.capabilities,
    resources: {
      capability_manifest_uri:
        options.resources?.capability_manifest_uri ?? null,
    },
  };
}
