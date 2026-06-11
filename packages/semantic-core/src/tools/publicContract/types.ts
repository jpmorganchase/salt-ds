import type { SerializedGeneratedSaltArtifactSurfaceGate } from "../../generatedArtifactSurface.js";
import type { SaltRegistry } from "../../types.js";
import type { FollowThroughItem } from "../workflowContracts.js";

export type PublicWorkflowId =
  | "init"
  | "create"
  | "review"
  | "migrate"
  | "upgrade";

export type PublicTransportUsed = "cli" | "mcp";

export type PublicWorkflowStatus = "success" | "partial" | "blocked" | "failed";

export type PublicMatchStatus =
  | "exact"
  | "alias"
  | "broadened"
  | "misrouted"
  | "no_match";

export type PublicNextStepMode =
  | "exact_name"
  | "compare_named"
  | "broad_query"
  | "stop_and_fix_context";

export interface PublicMcpActionHint {
  tool: string;
  args: Record<string, unknown>;
}

export interface PublicActionHints {
  cli?: string;
  mcp?: PublicMcpActionHint;
}

export type PublicToolCallStep = PublicActionHints & {
  kind: "tool_call";
  tool:
    | "get_salt_project_context"
    | "create_salt_ui"
    | "review_salt_ui"
    | "migrate_to_salt"
    | "upgrade_salt_ui";
  mode: PublicNextStepMode;
  args: Record<string, unknown>;
};

export type PublicRetrieveEntityStep = PublicActionHints & {
  kind: "retrieve_entity";
  tool: "get_salt_entity" | "create_salt_ui";
  args: Record<string, unknown>;
};

export type PublicRetrieveExamplesStep = PublicActionHints & {
  kind: "retrieve_examples";
  tool: "get_salt_examples" | "create_salt_ui";
  args: Record<string, unknown>;
};

export type PublicAskUserStep = PublicActionHints & {
  kind: "ask_user";
  question: string;
};

export type PublicInstallDependenciesStep = PublicActionHints & {
  kind: "install_dependencies";
  package_manager: string;
  packages: string[];
};

export type PublicBootstrapRepoStep = PublicActionHints & {
  kind: "bootstrap_repo";
  tool: "bootstrap_salt_repo" | "salt-ds init";
  args?: Record<string, unknown>;
};

export type PublicImplementStep = PublicActionHints & {
  kind: "implement";
  scope: "exact_request";
};

export type PublicCompleteStep = PublicActionHints & {
  kind: "complete";
  outcome: "no_changes_required";
};

export type PublicReviewStep = PublicActionHints & {
  kind: "review";
  tool: "review_salt_ui";
  args?: Record<string, unknown>;
};

export type PublicRerunWorkflowStep = PublicActionHints & {
  kind: "rerun_workflow";
  tool:
    | "create_salt_ui"
    | "review_salt_ui"
    | "migrate_to_salt"
    | "upgrade_salt_ui";
  args: Record<string, unknown>;
};

export type PublicFixContextStep = PublicActionHints & {
  kind: "fix_context";
  tool: "get_salt_project_context" | "salt-ds info";
  mode: "stop_and_fix_context";
  args?: Record<string, unknown>;
};

export type PublicNextStep =
  | PublicToolCallStep
  | PublicRetrieveEntityStep
  | PublicRetrieveExamplesStep
  | PublicAskUserStep
  | PublicInstallDependenciesStep
  | PublicBootstrapRepoStep
  | PublicImplementStep
  | PublicCompleteStep
  | PublicReviewStep
  | PublicRerunWorkflowStep
  | PublicFixContextStep;

export const PUBLIC_WORKFLOW_CONTRACT_VERSION = "salt_workflow_v1";

/**
 * SemVer string for the salt_workflow_v1 contract surface. Bumped per the
 * SemVer policy whenever the contract shape changes within the v1 major.
 *
 * - 1.0.0 - Initial salt_workflow_v1.
 * - 1.1.0 - Split status:partial into partial (legitimate user-facing
 *   remaining work) + new top-level internal_limitations block (registry
 *   coverage gaps). Additive top-level field + narrowed partial semantics:
 *   MINOR per SemVer.
 */
export const SALT_WORKFLOW_CONTRACT_SEMVER = "1.1.0" as const;

export type PublicActionKind = PublicNextStep["kind"];

/**
 * Top-level block recording validator/registry coverage gaps that are
 * independent of workflow status. Always present so hosts can branch on
 * the fields without runtime nullish checks. See
 * packages/mcp/docs/salt-workflow-v1-host-contract.md for the semantics.
 *
 * - unsupported_claim_count - number of generated-artifact claims the
 *   registry could not validate (e.g. components/patterns not yet covered).
 * - unsupported_rule_kinds - unique, sorted list of SaltEvidenceClaimKind
 *   values that contributed to the unsupported claim count.
 *
 * These come from the review evidence gate only. Create / migrate / upgrade
 * leave both fields at the default empty values.
 */
export interface PublicInternalLimitations {
  unsupported_claim_count: number;
  unsupported_rule_kinds: string[];
}

export const EMPTY_PUBLIC_INTERNAL_LIMITATIONS: PublicInternalLimitations = {
  unsupported_claim_count: 0,
  unsupported_rule_kinds: [],
};

export type PublicEvidenceKind =
  | "docs"
  | "examples"
  | "registry"
  | "project_policy"
  | "heuristic_fallback";

export interface PublicEvidenceItem {
  kind: PublicEvidenceKind;
  source: "canonical_salt" | "project_policy" | "heuristic_fallback";
  entity?: string;
  field?: string;
  source_urls: string[];
  summary?: string;
}

export interface PublicEvidenceSummary {
  status: "complete" | "partial" | "missing";
  items: PublicEvidenceItem[];
  source_urls: string[];
  missing: string[];
  heuristic_fallback: boolean;
  input_context?: PublicEvidenceInputContext;
  surface_gate?: SerializedGeneratedSaltArtifactSurfaceGate;
  unsupported_claim_count?: number;
  validation_issue_count?: number;
}

export interface PublicEvidenceInputContext {
  source_outline_provided?: boolean;
  source_outline_signal_counts?: {
    regions: number;
    actions: number;
    states: number;
    notes: number;
  };
  derived_outline_available?: boolean;
  derived_outline_signal_counts?: {
    regions: number;
    actions: number;
    states: number;
    notes: number;
  };
  visual_input_count?: number;
  visual_input_kinds?: string[];
  source_outline_summary?: string;
}

export interface PublicRecipeStep {
  id: string;
  action: PublicNextStep;
  status: "required" | "available" | "complete";
  evidence_required?: string[];
  reason?: string;
}

export interface PublicRecipe {
  steps: PublicRecipeStep[];
}

export interface PublicContractRequest {
  entity?: string;
  resolved_entity?: string | null;
  match_status?: PublicMatchStatus;
  exact_match_required?: boolean;
}

export interface PublicContractSafety {
  canonical_complete: boolean;
  exact_request_safe: boolean;
  blocking_reasons: string[];
}

export interface PublicPostAction extends PublicActionHints {
  kind: "review";
  tool: "review_salt_ui";
  args?: Record<string, unknown>;
}

export type PublicAction = PublicNextStep & {
  rule_ids: string[];
  post_action: PublicPostAction | null;
};

export interface PublicContract {
  contract: typeof PUBLIC_WORKFLOW_CONTRACT_VERSION;
  workflow: PublicWorkflowId;
  transport: PublicTransportUsed;
  status: PublicWorkflowStatus;
  request: PublicContractRequest;
  safety: PublicContractSafety;
  action: PublicAction;
  next_required_action: PublicNextStep;
  allowed_next_actions: PublicActionKind[];
  recipe: PublicRecipe;
  questions: string[];
  evidence: PublicEvidenceSummary;
  /**
   * Validator/registry coverage gaps that do not change the workflow status.
   * Always present (default = EMPTY_PUBLIC_INTERNAL_LIMITATIONS) so hosts
   * can branch on the fields without runtime nullish checks. Added in
   * salt_workflow_v1 semver 1.1.0 (task 2.9 / root cause #2).
   */
  internal_limitations: PublicInternalLimitations;
  summary: string;
  truncated?: boolean;
  available_expansions?: string[];
  full_output_bytes?: number;
}

export interface PublicWorkflowDetailsEnvelope<TDetails>
  extends PublicContract {
  details: TDetails;
}

export interface PublicContractExactRequest {
  requested_entity?: string;
  resolved_entity?: string | null;
  match_status?: PublicMatchStatus;
  exact_match_required?: boolean;
  full_request_evidence_complete?: boolean;
}

export interface PublicContractState {
  implementation_ready: boolean;
  required_follow_through: FollowThroughItem[];
  blocking_questions: string[];
  starter_blockers: string[];
  project_policy_blockers: string[];
  hard_blocked: boolean;
  context_ready: boolean;
  usable_guidance_present: boolean;
  transport_failed: boolean;
}

export interface PublicContractInput {
  workflow: PublicWorkflowId;
  transport_used: PublicTransportUsed;
  exact_request?: PublicContractExactRequest;
  state: PublicContractState;
  /**
   * Optional override. When omitted, buildPublicContract emits
   * EMPTY_PUBLIC_INTERNAL_LIMITATIONS. Builders for workflows that surface
   * registry/validator coverage gaps (today: review) populate this
   * explicitly. See PublicInternalLimitations.
   */
  internal_limitations?: PublicInternalLimitations;
  summary: string;
  next_step: PublicNextStep;
  questions?: string[];
  evidence?: PublicEvidenceSummary;
  recipe?: PublicRecipe;
  allowed_next_actions?: PublicActionKind[];
  rule_ids?: string[];
  blocking_reasons?: string[];
  truncated?: boolean;
  available_expansions?: string[];
  full_output_bytes?: number;
}

export interface PublicContractBuildOptions {
  transport_used: PublicTransportUsed;
  exact_request?: PublicContractExactRequest;
  blocking_reasons?: string[];
  next_step?: PublicNextStep;
  registry?: SaltRegistry;
  query?: string;
  package?: string;
  salt_packages?: string[];
  package_manager?: string;
  resolved_entities?: string[];
}
