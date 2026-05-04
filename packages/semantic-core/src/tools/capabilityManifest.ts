import { SALT_CREATE_CATALOG_CONTRACT_VERSION } from "./createCatalogSupport.js";
import type {
  PublicActionKind,
  PublicEvidenceKind,
  PublicWorkflowId,
  PublicWorkflowStatus,
} from "./publicContract.js";

export const SALT_CAPABILITY_MANIFEST_VERSION =
  "salt_capability_manifest_v1" as const;
export const SALT_COMPACT_WORKFLOW_CONTRACT_VERSION = "v1" as const;

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
  "validate_salt_review_report",
  "resume_salt_review",
  "persist_salt_context_pack",
  "persist_salt_generated_artifact",
] as const;

export const SALT_PUBLIC_ACTION_KINDS = [
  "tool_call",
  "retrieve_entity",
  "retrieve_examples",
  "ask_user",
  "install_dependencies",
  "bootstrap_repo",
  "implement",
  "complete",
  "review",
  "rerun_workflow",
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
        heuristic_fallback_policy: "heuristic_fallback_must_not_be_sole_evidence_for_success";
      };
      action_semantics: Array<{
        kind: (typeof SALT_PUBLIC_ACTION_KINDS)[number];
        host_obligation:
          | "call_requested_tool"
          | "retrieve_entity_evidence"
          | "retrieve_example_evidence"
          | "ask_user_and_stop"
          | "install_packages_then_rerun"
          | "bootstrap_repo_first"
          | "implement_exact_request"
          | "finish_without_changes"
          | "run_review"
          | "rerun_originating_workflow"
          | "repair_context_first";
        implementation_allowed: boolean;
        blocks_implementation_until_complete: boolean;
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
      recipe_contract: {
        composite_requests_use_recipe: true;
        recipe_steps_are_authoritative: true;
        unresolved_regions_surface_as_required_actions: true;
        questions_block_implementation: true;
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
    full_response_mode: "explicit_only";
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
  resources: {
    capability_manifest_uri: string | null;
    catalog_manifest_uri: string | null;
    catalog_entity_template_uri: string | null;
    catalog_candidates_template_uri: string | null;
    catalog_family_template_uri: string | null;
    context_manifest_uri: string | null;
    context_health_uri: string | null;
    context_coverage_uri: string | null;
    context_pack_uri: string | null;
    context_release_gate_uri: string | null;
    ai_setup_uri: string | null;
    ai_evidence_closure_uri: string | null;
    context_component_template_uri: string | null;
    context_component_markdown_template_uri: string | null;
    context_pattern_template_uri: string | null;
    context_foundation_template_uri: string | null;
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
  support_surface: {
    retrieval_catalog: {
      available: boolean;
      access: Array<"info" | "resource" | "command">;
    };
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
      compact_workflow_contract_version: SALT_COMPACT_WORKFLOW_CONTRACT_VERSION,
      compact_workflow_ids: [...SALT_COMPACT_WORKFLOW_IDS],
      setup_contract_ids: [...options.contracts.setup_contract_ids],
      workflow_action_contract: {
        authoritative_fields: [
          "status",
          "safety.exact_request_safe",
          "safety.blocking_reasons",
          "action.kind",
          "action.post_action",
          "next_required_action",
          "next_required_action.cli",
          "next_required_action.mcp",
          "allowed_next_actions",
          "recipe.steps",
          "recipe.steps.action.cli",
          "recipe.steps.action.mcp",
          "questions",
          "evidence.status",
          "evidence.items",
          "evidence.source_urls",
          "evidence.input_context",
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
            kind: "retrieve_entity",
            host_obligation: "retrieve_entity_evidence",
            implementation_allowed: false,
            blocks_implementation_until_complete: true,
            follow_up_required: "rerun_originating_workflow",
          },
          {
            kind: "retrieve_examples",
            host_obligation: "retrieve_example_evidence",
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
            kind: "install_dependencies",
            host_obligation: "install_packages_then_rerun",
            implementation_allowed: false,
            blocks_implementation_until_complete: true,
            follow_up_required: "rerun_originating_workflow",
          },
          {
            kind: "bootstrap_repo",
            host_obligation: "bootstrap_repo_first",
            implementation_allowed: false,
            blocks_implementation_until_complete: true,
            follow_up_required: "rerun_originating_workflow",
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
            kind: "review",
            host_obligation: "run_review",
            implementation_allowed: false,
            blocks_implementation_until_complete: true,
          },
          {
            kind: "rerun_workflow",
            host_obligation: "rerun_originating_workflow",
            implementation_allowed: false,
            blocks_implementation_until_complete: true,
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
        recipe_contract: {
          composite_requests_use_recipe: true,
          recipe_steps_are_authoritative: true,
          unresolved_regions_surface_as_required_actions: true,
          questions_block_implementation: true,
        },
      },
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
    resources: {
      capability_manifest_uri:
        options.resources?.capability_manifest_uri ?? null,
      catalog_manifest_uri: options.resources?.catalog_manifest_uri ?? null,
      catalog_entity_template_uri:
        options.resources?.catalog_entity_template_uri ?? null,
      catalog_candidates_template_uri:
        options.resources?.catalog_candidates_template_uri ?? null,
      catalog_family_template_uri:
        options.resources?.catalog_family_template_uri ?? null,
      context_manifest_uri: options.resources?.context_manifest_uri ?? null,
      context_health_uri: options.resources?.context_health_uri ?? null,
      context_coverage_uri: options.resources?.context_coverage_uri ?? null,
      context_pack_uri: options.resources?.context_pack_uri ?? null,
      context_release_gate_uri:
        options.resources?.context_release_gate_uri ?? null,
      ai_setup_uri: options.resources?.ai_setup_uri ?? null,
      ai_evidence_closure_uri:
        options.resources?.ai_evidence_closure_uri ?? null,
      context_component_template_uri:
        options.resources?.context_component_template_uri ?? null,
      context_component_markdown_template_uri:
        options.resources?.context_component_markdown_template_uri ?? null,
      context_pattern_template_uri:
        options.resources?.context_pattern_template_uri ?? null,
      context_foundation_template_uri:
        options.resources?.context_foundation_template_uri ?? null,
    },
  };
}
