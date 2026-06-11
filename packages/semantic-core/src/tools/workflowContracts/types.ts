import type { ReviewSaltUiResult } from "../reviewSaltUi.js";
import type { NormalizedVisualEvidenceInput, VisualEvidenceInputType } from "../translation/sourceUiTypes.js";
import type { WorkflowRepoRefinementArtifact } from "../workflowRepoRefinement.js";
import type { WorkflowIssueClass as WorkflowRuleIssueClass } from "../workflowRuleIds.js";

export interface WorkflowConfidence {
  level: "high" | "medium" | "low";
  reasons: string[];
  ask_before_proceeding: boolean;
  raise_confidence: string[];
}

export interface WorkflowReadiness {
  status: "guidance_only" | "starter_validated" | "starter_needs_attention";
  implementation_ready: boolean;
  reason: string;
}

export type WorkflowContextResolutionStatus =
  | "resolved"
  | "fallback"
  | "needs_explicit_root"
  | "mismatch";

export type WorkflowContextRequirement =
  | {
      status: "context_required";
      repo_specific_edits_ready: false;
      reason: string;
      suggested_follow_up_tool: "get_salt_project_context";
      suggested_follow_up_cli: "salt-ds info --json";
      resolution_status: Exclude<WorkflowContextResolutionStatus, "resolved">;
      retry_with: {
        root_dir: string | null;
        context_id: null;
      };
    }
  | {
      status: "context_checked";
      repo_specific_edits_ready: true;
      reason: string;
      satisfied_by: "salt-ds info";
      resolution_status: "resolved";
      retry_with: {
        root_dir: string | null;
        context_id: string | null;
      };
    };

export interface WorkflowIntent {
  user_task: string;
  key_interaction: string;
  composition_direction: string;
  canonical_choice: string | null;
  rule_ids: string[];
}

export interface WorkflowStarterValidation {
  status: "clean" | "needs_attention";
  snippets_checked: number;
  errors: number;
  warnings: number;
  infos: number;
  fix_count: number;
  migration_count: number;
  top_issue: string | null;
  next_step: string | null;
  source_urls: string[];
  missing_data?: string[];
}

export interface WorkflowIssueClass {
  rule_id: WorkflowRuleIssueClass["ruleId"];
  label: string;
  description: string;
  count: number;
  semantic_categories: string[];
  semantic_rules: string[];
}

export interface WorkflowFixCandidate {
  candidate_type: "migration" | "guided_fix";
  safety: "deterministic" | "manual_review";
  kind: string | null;
  title: string;
  recommendation: string | null;
  from: string | null;
  to: string | null;
  reason: string | null;
  category: string | null;
  rule: string | null;
  rule_id: string | null;
  source_urls: string[];
}

export interface WorkflowFixCandidates {
  total_count: number;
  deterministic_count: number;
  manual_review_count: number;
  candidates: WorkflowFixCandidate[];
  notes: string[];
}

export interface WorkflowProjectConventionsCheck {
  supported: boolean;
  contract: "project_conventions_v1";
  check_recommended: boolean;
  topics: string[];
  reason: string;
  canonical_only: true;
  declared_policy_status:
    | "unknown-until-project-context"
    | "none-declared"
    | "team-declared"
    | "stack-declared";
  policy_paths: [".salt/team.json", ".salt/stack.json"];
  suggested_follow_up_tool: "get_salt_project_context";
  suggested_follow_up_cli: "salt-ds info --json";
  next_step: string;
}

export interface WorkflowPostMigrationVerification {
  source_checks: string[];
  runtime_checks: string[];
  preserve_checks: string[];
  confirmation_checks: string[];
  suggested_workflow: "review_salt_ui";
  suggested_command: string;
}

export interface WorkflowVisualEvidenceContract {
  role: "supporting-evidence";
  not_canonical_source_of_truth: true;
  supported_inputs: VisualEvidenceInputType[];
  interpretation_owner: "agent-or-adapter";
  normalization_required: true;
  normalization_contract: "migrate_visual_evidence_v1";
  structured_outputs: Array<
    | "landmarks"
    | "action-hierarchy"
    | "layout-signals"
    | "familiarity-anchors"
    | "confidence-impact"
  >;
  source_outline_provided: boolean;
  source_outline_signal_counts: {
    regions: number;
    actions: number;
    states: number;
    notes: number;
  };
  derived_outline_available: boolean;
  derived_outline_signal_counts: {
    regions: number;
    actions: number;
    states: number;
    notes: number;
  };
  visual_input_count: number;
  visual_input_kinds: Array<NormalizedVisualEvidenceInput["kind"]>;
  visual_input_sources: Array<NormalizedVisualEvidenceInput["source_type"]>;
  runtime_capture: {
    supported_via_cli: true;
    command: "salt-ds migrate --url <url>";
    purpose: string;
  };
  confidence_impact: {
    level: "none" | "supporting";
    reasons: string[];
  };
}

export interface WorkflowProvenance {
  canonical_source_urls: string[];
  related_guide_urls: string[];
  starter_source_urls: string[];
  source_urls: string[];
  guidance_signals: string[];
  project_conventions_contract: "project_conventions_v1";
}

export interface WorkflowReviewIdeSummary {
  verdict: {
    level: "clean" | "medium_risk" | "high_risk";
    summary: string;
  };
  top_findings: string[];
  safest_next_fix: string | null;
  verify: string[];
  top_source_urls: string[];
}

export interface WorkflowUpgradeIdeSummary {
  target: string | null;
  from_version: string | null;
  to_version: string | null;
  required_changes: string[];
  optional_cleanup: string[];
  suggested_order: string[];
  verify: string[];
  top_source_urls: string[];
}

export interface WorkflowCreateIdeSummary {
  recommended_direction: string;
  bounded_scope: string[];
  open_question: string | null;
  starter_plan: string[];
  verify: string[];
  top_source_urls: string[];
}

export interface FollowThroughItem {
  /** Semantic region ID from the scaffold slot (e.g. "data-table", "allocation-bars"). */
  region: string;
  /** Salt entity that must be resolved for this region (e.g. "Table", "LinearProgress"). */
  entity: string;
}

export type WorkflowCreateImplementationGateRuleId =
  | "create-follow-through-required"
  | "create-blocking-question";

export interface WorkflowNextCall {
  workflow: "create_salt_ui" | "get_salt_project_context";
  follow_up_mode:
    | "exact_name"
    | "compare_named"
    | "broad_query"
    | "stop_and_fix_context";
  args: Record<string, unknown>;
}

export interface WorkflowCreateImplementationGate {
  status: "clear" | "follow_through_required";
  reason: string;
  required_follow_through: FollowThroughItem[];
  blocking_questions: string[];
  next_call: WorkflowNextCall | null;
  rule_ids: WorkflowCreateImplementationGateRuleId[];
  next_step: string | null;
}

export interface WorkflowMigrateIdeSummary {
  screen_map: string[];
  preserve: string[];
  needs_confirmation: string[];
  recommended_direction: string[];
  first_scaffold: string[];
  verify: string[];
  top_source_urls: string[];
}

export interface CreateSaltUiWorkflowContract {
  confidence: WorkflowConfidence;
  ide_summary: WorkflowCreateIdeSummary;
  implementation_gate: WorkflowCreateImplementationGate;
  intent: WorkflowIntent;
  readiness: WorkflowReadiness;
  context_requirement: WorkflowContextRequirement;
  starter_validation: WorkflowStarterValidation | null;
  repo_refinement: WorkflowRepoRefinementArtifact | null;
  project_conventions_check: WorkflowProjectConventionsCheck;
  provenance: WorkflowProvenance;
}

export interface ReviewSaltUiWorkflowContract {
  confidence: WorkflowConfidence;
  ide_summary: WorkflowReviewIdeSummary;
  decision: ReviewSaltUiResult["decision"];
  fix_candidates: WorkflowFixCandidates;
  issue_classes: WorkflowIssueClass[];
  project_conventions_check: WorkflowProjectConventionsCheck;
  rule_ids: string[];
  provenance: WorkflowProvenance;
}

export interface RepoAwareReviewMigrationVerification {
  manual_review_count: number;
  not_checked_count: number;
  next_step: string;
}

export interface RepoAwareReviewWorkflowInput {
  canonical_source_urls: string[];
  manual_review_fix_count: number;
  project_conventions_check_recommended: boolean;
  project_conventions_declared: boolean;
  project_conventions_warnings: string[];
  runtime_target_detected: boolean;
  runtime_requested: boolean;
  runtime_issue_count: number;
  migration_verification?: RepoAwareReviewMigrationVerification | null;
  guidance_signals?: string[];
  project_conventions_contract?: "project_conventions_v1";
}

export interface RepoAwareReviewWorkflowMetadata {
  confidence: WorkflowConfidence;
  provenance: WorkflowProvenance;
}

export interface MigrateToSaltWorkflowContract {
  confidence: WorkflowConfidence;
  ide_summary: WorkflowMigrateIdeSummary;
  readiness: WorkflowReadiness;
  context_requirement: WorkflowContextRequirement;
  starter_validation: WorkflowStarterValidation | null;
  project_conventions_check: WorkflowProjectConventionsCheck;
  rule_ids: string[];
  post_migration_verification: WorkflowPostMigrationVerification;
  visual_evidence_contract: WorkflowVisualEvidenceContract;
  provenance: WorkflowProvenance;
}

export interface UpgradeSaltUiWorkflowContract {
  confidence: WorkflowConfidence;
  ide_summary: WorkflowUpgradeIdeSummary;
  project_conventions_check: WorkflowProjectConventionsCheck;
  rule_ids: string[];
  provenance: WorkflowProvenance;
}
