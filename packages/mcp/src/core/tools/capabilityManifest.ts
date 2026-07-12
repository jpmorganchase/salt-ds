import { SALT_CREATE_CATALOG_CONTRACT_VERSION } from "./createCatalogSupport.js";
import type {
  PublicActionKind,
  PublicEvidenceKind,
  PublicWorkflowId,
  PublicWorkflowStatus,
} from "./publicContract.js";
import {
  PUBLIC_WORKFLOW_CONTRACT_VERSION,
  SALT_WORKFLOW_CONTRACT_SEMVER,
} from "./publicContract.js";

export const SALT_CAPABILITY_MANIFEST_VERSION =
  "salt_capability_manifest_v1" as const;
export const SALT_COMPACT_WORKFLOW_CONTRACT_VERSION = "v1" as const;

export const SALT_PUBLIC_WORKFLOW_VOCABULARY = [
  { id: "create", label: "create" },
  { id: "review", label: "review" },
  { id: "migrate", label: "migrate" },
] as const;

export const SALT_COMPACT_WORKFLOW_IDS = [
  "create",
  "review",
  "migrate",
] as const satisfies readonly PublicWorkflowId[];

export const SALT_SUPPORT_TOOL_IDS = ["get_salt_reference"] as const;

export const SALT_PUBLIC_ACTION_KINDS = [
  "tool_call",
  "retrieve_reference",
  "ask_user",
  "implement",
  "complete",
  "apply_fixes",
  "fix_context",
] as const satisfies readonly PublicActionKind[];

export const SALT_NON_IMPLEMENTABLE_WORKFLOW_STATUSES = [
  "partial",
  "blocked",
  "failed",
] as const satisfies readonly Exclude<PublicWorkflowStatus, "success">[];

export const SALT_SOURCE_BACKED_EVIDENCE_KINDS = [
  "docs",
  "examples",
  "registry",
  "project_policy",
] as const satisfies readonly Exclude<
  PublicEvidenceKind,
  "heuristic_fallback"
>[];

export const SALT_FALLBACK_EVIDENCE_KIND =
  "heuristic_fallback" as const satisfies PublicEvidenceKind;

export type SaltCapabilityResourceKey =
  | "capability_manifest_uri"
  | "catalog_manifest_uri"
  | "catalog_entity_template_uri";

export type SaltCapabilityResources = Partial<
  Record<SaltCapabilityResourceKey, string>
>;

export interface SaltCapabilityManifest {
  manifest_version: typeof SALT_CAPABILITY_MANIFEST_VERSION;
  transport: "mcp";
  runtime: {
    package_name: string;
    package_version: string;
    server_name: string | null;
    command_name: string | null;
  };
  offline_catalog: {
    available: boolean;
    version: string | null;
    generated_at: string | null;
  };
  contracts: {
    compact_workflow_contract_version: typeof SALT_COMPACT_WORKFLOW_CONTRACT_VERSION;
    compact_workflow_ids: Array<(typeof SALT_COMPACT_WORKFLOW_IDS)[number]>;
    setup_contract_ids: string[];
    /** Machine-readable lifecycle for the public workflow contract. */
    contract_lifecycle: {
      contract: typeof PUBLIC_WORKFLOW_CONTRACT_VERSION;
      semver: typeof SALT_WORKFLOW_CONTRACT_SEMVER;
      changelog: Array<{ semver: string; summary: string }>;
    };
    workflow_action_contract: {
      authoritative_fields: string[];
      implementation_gate: {
        required: {
          status: "success";
          "safety.exact_request_safe": true;
          "action.kind": "implement";
          "evidence.status": "complete";
          "action.post_action.kind": "review";
        };
        non_implementable_statuses: Array<
          (typeof SALT_NON_IMPLEMENTABLE_WORKFLOW_STATUSES)[number]
        >;
        review_fix_exception: {
          status: "partial";
          "action.kind": "apply_fixes";
          "evidence.status": "complete";
          mutation_authorization: "host_or_user_required";
          "action.post_action.kind": "review";
        };
        heuristic_fallback_policy: "heuristic_fallback_must_not_be_sole_evidence_for_success";
      };
      action_semantics: Array<{
        kind: (typeof SALT_PUBLIC_ACTION_KINDS)[number];
        host_obligation:
          | "call_requested_tool"
          | "retrieve_reference_evidence"
          | "ask_user_and_stop"
          | "implement_exact_request"
          | "finish_without_changes"
          | "apply_grounded_fixes"
          | "rerun_originating_workflow"
          | "repair_context_first";
        implementation_allowed: boolean;
        blocks_implementation_until_complete: boolean;
        mutation_authorization?: "host_or_user_required";
        follow_up_required?:
          | "review"
          | "rerun_originating_workflow"
          | "updated_user_input";
      }>;
      evidence_contract: {
        source_backed_kinds: Array<
          (typeof SALT_SOURCE_BACKED_EVIDENCE_KINDS)[number]
        >;
        fallback_kind: typeof SALT_FALLBACK_EVIDENCE_KIND;
        source_url_required_for_source_backed_evidence: true;
        success_requires_complete_evidence: true;
        success_requires_source_backed_evidence: true;
      };
      continuation_contract: {
        field: "action.post_action";
        max_depth: 1;
        create_rerun_kind: "rerun_workflow";
        create_rerun_action_kinds: Array<"retrieve_reference">;
        review_required_input: "complete_updated_file";
        ask_user_post_action: null;
      };
    };
  };
  workflow_vocabulary: Array<{
    id: (typeof SALT_PUBLIC_WORKFLOW_VOCABULARY)[number]["id"];
    label: (typeof SALT_PUBLIC_WORKFLOW_VOCABULARY)[number]["label"];
  }>;
  public_surface: {
    story: "workflow_first";
    default_response_mode: "compact";
    full_response_mode: "explicit_only" | "unavailable";
    default_surface_ids: string[];
    advanced_output_ids: string[];
  };
  support_tools: {
    policy: "optional_advanced_host_surface" | "default_read_only_host_surface";
    default_exposed: boolean;
    tool_ids: Array<(typeof SALT_SUPPORT_TOOL_IDS)[number]>;
    workflow_contract_meaning_changes_when_absent: false;
  };
  support_surface: {
    retrieval_catalog: {
      available: boolean;
      contract_version: typeof SALT_CREATE_CATALOG_CONTRACT_VERSION | null;
      access: Array<"info" | "resource" | "command">;
    };
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
  resources: SaltCapabilityResources;
}

export interface BuildSaltCapabilityManifestOptions {
  transport: SaltCapabilityManifest["transport"];
  runtime: SaltCapabilityManifest["runtime"];
  registry: SaltCapabilityManifest["offline_catalog"];
  contracts: {
    setup_contract_ids: string[];
  };
  public_surface: {
    default_surface_ids: string[];
    advanced_output_ids: string[];
  };
  support_surface: {
    retrieval_catalog: {
      available: boolean;
      access: Array<"info" | "resource" | "command">;
    };
  };
  capabilities: SaltCapabilityManifest["capabilities"];
  resources?: Partial<
    Record<SaltCapabilityResourceKey, string | null | undefined>
  >;
  support_tools?: Partial<
    Omit<SaltCapabilityManifest["support_tools"], "tool_ids">
  >;
}

function compactResourceUris(
  resources: BuildSaltCapabilityManifestOptions["resources"],
): SaltCapabilityResources {
  const presentEntries = Object.entries(resources ?? {}).filter(
    (entry): entry is [SaltCapabilityResourceKey, string] =>
      typeof entry[1] === "string" && entry[1].trim().length > 0,
  );

  return Object.fromEntries(presentEntries) as SaltCapabilityResources;
}

export function buildSaltCapabilityManifest(
  options: BuildSaltCapabilityManifestOptions,
): SaltCapabilityManifest {
  return {
    manifest_version: SALT_CAPABILITY_MANIFEST_VERSION,
    transport: options.transport,
    runtime: options.runtime,
    offline_catalog: options.registry,
    contracts: {
      compact_workflow_contract_version: SALT_COMPACT_WORKFLOW_CONTRACT_VERSION,
      compact_workflow_ids: [...SALT_COMPACT_WORKFLOW_IDS],
      setup_contract_ids: [...options.contracts.setup_contract_ids],
      contract_lifecycle: {
        contract: PUBLIC_WORKFLOW_CONTRACT_VERSION,
        semver: SALT_WORKFLOW_CONTRACT_SEMVER,
        changelog: [
          {
            semver: "1.0.0",
            summary: "Initial public salt_workflow_v1 contract.",
          },
        ],
      },
      workflow_action_contract: {
        authoritative_fields: [
          "status",
          "safety.exact_request_safe",
          "safety.blocking_reasons",
          "action.kind",
          "action.tool",
          "action.args",
          "action.post_action",
          "action.post_action.kind",
          "action.post_action.tool",
          "action.post_action.args",
          "action.post_action.required_input",
          "guidance",
          "guidance.kind",
          "guidance.decision",
          "guidance.starter_guidance",
          "guidance.findings",
          "guidance.fixes",
          "guidance.translations",
          "guidance.migration_plan",
          "guidance.post_migration_verification",
          "questions",
          "evidence.status",
          "evidence.items",
          "evidence.source_urls",
          "evidence.input_context",
          "internal_limitations",
          "internal_limitations.unsupported_claim_count",
          "internal_limitations.unsupported_rule_kinds",
          "summary",
        ],
        implementation_gate: {
          required: {
            status: "success",
            "safety.exact_request_safe": true,
            "action.kind": "implement",
            "evidence.status": "complete",
            "action.post_action.kind": "review",
          },
          non_implementable_statuses: [
            ...SALT_NON_IMPLEMENTABLE_WORKFLOW_STATUSES,
          ],
          review_fix_exception: {
            status: "partial",
            "action.kind": "apply_fixes",
            "evidence.status": "complete",
            mutation_authorization: "host_or_user_required",
            "action.post_action.kind": "review",
          },
          heuristic_fallback_policy:
            "heuristic_fallback_must_not_be_sole_evidence_for_success",
        },
        action_semantics: [
          {
            kind: "tool_call",
            host_obligation: "call_requested_tool",
            implementation_allowed: false,
            blocks_implementation_until_complete: true,
            follow_up_required: "rerun_originating_workflow",
          },
          {
            kind: "retrieve_reference",
            host_obligation: "retrieve_reference_evidence",
            implementation_allowed: false,
            blocks_implementation_until_complete: true,
            follow_up_required: "rerun_originating_workflow",
          },
          {
            kind: "ask_user",
            host_obligation: "ask_user_and_stop",
            implementation_allowed: false,
            blocks_implementation_until_complete: true,
            follow_up_required: "updated_user_input",
          },
          {
            kind: "implement",
            host_obligation: "implement_exact_request",
            implementation_allowed: true,
            blocks_implementation_until_complete: false,
            follow_up_required: "review",
          },
          {
            kind: "complete",
            host_obligation: "finish_without_changes",
            implementation_allowed: false,
            blocks_implementation_until_complete: false,
          },
          {
            kind: "apply_fixes",
            host_obligation: "apply_grounded_fixes",
            implementation_allowed: true,
            blocks_implementation_until_complete: false,
            mutation_authorization: "host_or_user_required",
            follow_up_required: "review",
          },
          {
            kind: "fix_context",
            host_obligation: "repair_context_first",
            implementation_allowed: false,
            blocks_implementation_until_complete: true,
            follow_up_required: "rerun_originating_workflow",
          },
        ],
        evidence_contract: {
          source_backed_kinds: [...SALT_SOURCE_BACKED_EVIDENCE_KINDS],
          fallback_kind: SALT_FALLBACK_EVIDENCE_KIND,
          source_url_required_for_source_backed_evidence: true,
          success_requires_complete_evidence: true,
          success_requires_source_backed_evidence: true,
        },
        continuation_contract: {
          field: "action.post_action",
          max_depth: 1,
          create_rerun_kind: "rerun_workflow",
          create_rerun_action_kinds: ["retrieve_reference"],
          review_required_input: "complete_updated_file",
          ask_user_post_action: null,
        },
      },
    },
    workflow_vocabulary: [...SALT_PUBLIC_WORKFLOW_VOCABULARY],
    public_surface: {
      story: "workflow_first",
      default_response_mode: "compact",
      full_response_mode:
        options.public_surface.advanced_output_ids.length > 0
          ? "explicit_only"
          : "unavailable",
      default_surface_ids: [...options.public_surface.default_surface_ids],
      advanced_output_ids: [...options.public_surface.advanced_output_ids],
    },
    support_tools: {
      policy: options.support_tools?.policy ?? "optional_advanced_host_surface",
      default_exposed: options.support_tools?.default_exposed ?? false,
      tool_ids: [...SALT_SUPPORT_TOOL_IDS],
      workflow_contract_meaning_changes_when_absent: false,
    },
    support_surface: {
      retrieval_catalog: {
        available: options.support_surface.retrieval_catalog.available,
        contract_version: options.support_surface.retrieval_catalog.available
          ? SALT_CREATE_CATALOG_CONTRACT_VERSION
          : null,
        access: [...options.support_surface.retrieval_catalog.access],
      },
    },
    capabilities: options.capabilities,
    resources: compactResourceUris(options.resources),
  };
}
