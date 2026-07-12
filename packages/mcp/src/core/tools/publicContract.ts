import {
  type SerializedGeneratedSaltArtifactSurfaceGate,
  serializeGeneratedSaltArtifactSurfaceGate,
} from "../generatedArtifactSurface.js";
import {
  buildReviewReportEvidenceGate,
  type ReviewReportEvidenceGate,
} from "../reviewReportArtifacts.js";
import type { SaltRegistry } from "../types.js";
import type { WorkflowCompositionContract } from "./compositionContract.js";
import {
  type CreateRequestMatch,
  deriveCreateRequestMatch,
} from "./createResolve.js";
import type { CreateSaltUiResult } from "./createSaltUi.js";
import { appendProjectConventionsCheckNextStep } from "./guidanceBoundary.js";
import type { MigrateToSaltResult } from "./migrateToSalt.js";
import type { ReviewSaltUiResult } from "./reviewSaltUi.js";
import type { StarterCodeSnippet } from "./starterCode.js";
import { componentMatchesLookupName } from "./utils.js";
import type { ValidationIssue } from "./validation/shared.js";
import type {
  CreateSaltUiWorkflowContract,
  FollowThroughItem,
  MigrateToSaltWorkflowContract,
  ReviewSaltUiWorkflowContract,
  WorkflowFixCandidate,
  WorkflowStarterValidation,
} from "./workflowContracts.js";

export type PublicWorkflowId = "create" | "review" | "migrate";

export type PublicWorkflowStatus = "success" | "partial" | "blocked" | "failed";

export type PublicMatchStatus =
  | "exact"
  | "alias"
  | "broadened"
  | "misrouted"
  | "no_match";

export type PublicNextStepMode = "exact_name";

export const PUBLIC_REFERENCE_ENTITY_TYPES = [
  "component",
  "pattern",
  "foundation",
  "token",
  "guide",
  "page",
  "package",
  "icon",
  "country_symbol",
] as const;

export type PublicReferenceEntityType =
  (typeof PUBLIC_REFERENCE_ENTITY_TYPES)[number];

export type PublicToolCallStep = {
  kind: "tool_call";
  tool: "create_salt_ui";
  mode: "exact_name";
  args: {
    query: string;
  };
};

export type PublicRetrieveReferenceStep = {
  kind: "retrieve_reference";
  tool: "get_salt_reference";
  args: {
    names: string[];
    entity_type?: PublicReferenceEntityType;
    include?: ["examples"];
    include_starter_code?: true;
  };
};

export type PublicAskUserStep = {
  kind: "ask_user";
  question: string;
};

export type PublicImplementStep = {
  kind: "implement";
  scope: "exact_request";
};

export type PublicCompleteStep = {
  kind: "complete";
  outcome: "no_changes_required";
};

export type PublicApplyFixesStep = {
  kind: "apply_fixes";
  scope: "grounded_findings";
  authorization: "host_or_user_required";
};

export type PublicFixContextStep = {
  kind: "fix_context";
  tool: "get_salt_project_context";
  mode: "stop_and_fix_context";
  args?: { root_dir: string };
};

export type PublicNextStep =
  | PublicToolCallStep
  | PublicRetrieveReferenceStep
  | PublicAskUserStep
  | PublicImplementStep
  | PublicCompleteStep
  | PublicApplyFixesStep
  | PublicFixContextStep;

export const PUBLIC_WORKFLOW_CONTRACT_VERSION = "salt_workflow_v1";

/** SemVer for the current public salt_workflow_v1 payload shape. */
export const SALT_WORKFLOW_CONTRACT_SEMVER = "1.0.0" as const;

export type PublicActionKind = PublicNextStep["kind"];

/**
 * Top-level block recording validator/registry coverage gaps that are
 * independent of workflow status. Always present so hosts can branch on
 * the fields without runtime nullish checks.
 *
 * - unsupported_claim_count - number of generated-artifact claims the
 *   registry could not validate (e.g. components/patterns not yet covered).
 * - unsupported_rule_kinds - unique, sorted list of SaltEvidenceClaimKind
 *   values that contributed to the unsupported claim count.
 *
 * These come from the review evidence gate only. Create and migrate
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

export interface PublicContractRequest {
  entity?: string;
  resolved_entity?: string | null;
  match_status?: PublicMatchStatus;
  exact_match_required?: boolean;
  full_request_evidence_complete?: boolean;
}

export interface PublicContractSafety {
  canonical_complete: boolean;
  exact_request_safe: boolean;
  blocking_reasons: string[];
}

export interface PublicReviewPostAction {
  kind: "review";
  tool: "review_salt_ui";
  required_input: ["complete_updated_file"];
}

export interface PublicCreateRerunPostAction {
  kind: "rerun_workflow";
  tool: "create_salt_ui";
  args: {
    query: string;
    package?: string;
    root_dir?: string;
    resolved_entities?: string[];
  };
}

export type PublicPostAction =
  | PublicReviewPostAction
  | PublicCreateRerunPostAction;

export type PublicAction = PublicNextStep & {
  rule_ids: string[];
  post_action: PublicPostAction | null;
};

export interface PublicStarterSnippet {
  label: string;
  language: StarterCodeSnippet["language"];
  code: string;
  notes: string[];
  source_urls: string[];
}

export interface PublicStarterGuidance {
  plan: string[];
  snippets: PublicStarterSnippet[];
}

export interface PublicReviewTargets {
  components: string[];
  patterns: string[];
  composition_contract: WorkflowCompositionContract | null;
  source: "create_report" | "workflow_context";
}

export interface PublicCreateGuidance {
  kind: "create";
  decision: {
    name: string | null;
    why: string;
    solution_type: CreateSaltUiResult["solution_type"];
  };
  starter_guidance: PublicStarterGuidance;
  review_targets: PublicReviewTargets;
}

export interface PublicReviewFinding {
  title: string;
  message: string;
  severity: string | null;
  rule: string | null;
  source_urls: string[];
}

export interface PublicReviewFix {
  title: string;
  recommendation: string;
  safety: WorkflowFixCandidate["safety"];
  source_urls: string[];
}

export interface PublicReviewGuidance {
  kind: "review";
  findings: PublicReviewFinding[];
  fixes: PublicReviewFix[];
}

export interface PublicMigrationTranslation {
  source_model_ref: string;
  label: string;
  implementation: {
    readiness: "high" | "medium" | "review";
    next_action: string;
    validation_step: string;
  };
  salt_target: {
    name: string | null;
    solution_type: "component" | "pattern" | "foundation" | null;
    why: string;
    docs: string[];
  };
}

export interface PublicPostMigrationVerification {
  source_checks: string[];
  runtime_checks: string[];
  preserve_checks: string[];
  confirmation_checks: string[];
  suggested_workflow: "review_salt_ui";
  suggested_command: string;
}

export interface PublicMigrateGuidance {
  kind: "migrate";
  translations: PublicMigrationTranslation[];
  migration_plan: string[];
  starter_guidance: PublicStarterGuidance;
  post_migration_verification: PublicPostMigrationVerification;
  review_targets: PublicReviewTargets;
}

export type PublicWorkflowGuidance =
  | PublicCreateGuidance
  | PublicReviewGuidance
  | PublicMigrateGuidance;

export interface PublicContract {
  contract: typeof PUBLIC_WORKFLOW_CONTRACT_VERSION;
  workflow: PublicWorkflowId;
  status: PublicWorkflowStatus;
  request: PublicContractRequest;
  safety: PublicContractSafety;
  action: PublicAction;
  guidance: PublicWorkflowGuidance;
  questions: string[];
  evidence: PublicEvidenceSummary;
  /**
   * Validator/registry coverage gaps that do not change the workflow status.
   * Always present (default = EMPTY_PUBLIC_INTERNAL_LIMITATIONS) so hosts
   * can branch on the fields without runtime nullish checks.
   */
  internal_limitations: PublicInternalLimitations;
  summary: string;
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
  guidance: PublicWorkflowGuidance;
  questions?: string[];
  evidence?: PublicEvidenceSummary;
  post_action?: PublicPostAction | null;
  rule_ids?: string[];
  blocking_reasons?: string[];
}

export interface PublicContractBuildOptions {
  exact_request?: PublicContractExactRequest;
  blocking_reasons?: string[];
  next_step?: PublicNextStep;
  registry?: SaltRegistry;
  query?: string;
  package?: string;
  resolved_entities?: string[];
  root_dir?: string;
  context_checked?: boolean;
  starter_code?: StarterCodeSnippet[];
}

function uniqueNonEmptyStrings(
  values: Array<string | null | undefined>,
): string[] {
  return [
    ...new Set(
      values
        .filter((value): value is string => typeof value === "string")
        .map((value) => value.trim())
        .filter((value) => value.length > 0),
    ),
  ];
}

function buildAskUserBlockerStep(
  candidates: Array<string | null | undefined>,
  fallback: string,
): PublicAskUserStep {
  return {
    kind: "ask_user",
    question: uniqueNonEmptyStrings([...candidates, fallback])[0] ?? fallback,
  };
}

function normalizeInternalLimitations(
  value: PublicInternalLimitations | undefined,
): PublicInternalLimitations {
  if (!value) {
    return {
      unsupported_claim_count: 0,
      unsupported_rule_kinds: [],
    };
  }

  const count = Number.isFinite(value.unsupported_claim_count)
    ? Math.max(0, Math.trunc(value.unsupported_claim_count))
    : 0;
  const kinds = uniqueNonEmptyStrings(value.unsupported_rule_kinds).sort();

  return {
    unsupported_claim_count: count,
    unsupported_rule_kinds: kinds,
  };
}

function hasNonEmptyPublicString(value: unknown): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

function hasActionablePublicStarterSnippet(value: unknown): boolean {
  const snippet = readRecord(value);
  return Boolean(
    snippet &&
      hasNonEmptyPublicString(snippet.label) &&
      (snippet.language === "tsx" || snippet.language === "css") &&
      hasNonEmptyPublicString(snippet.code),
  );
}

function hasActionablePublicStarterGuidance(value: unknown): boolean {
  const guidance = readRecord(value);
  if (!guidance) {
    return false;
  }

  const plan = Array.isArray(guidance.plan) ? guidance.plan : [];
  const snippets = Array.isArray(guidance.snippets) ? guidance.snippets : [];
  return (
    plan.some(hasNonEmptyPublicString) ||
    snippets.some(hasActionablePublicStarterSnippet)
  );
}

function hasActionablePublicReviewFinding(value: unknown): boolean {
  const finding = readRecord(value);
  return Boolean(
    finding &&
      hasNonEmptyPublicString(finding.title) &&
      hasNonEmptyPublicString(finding.message),
  );
}

function hasActionablePublicReviewFix(value: unknown): boolean {
  const fix = readRecord(value);
  return Boolean(
    fix &&
      hasNonEmptyPublicString(fix.title) &&
      hasNonEmptyPublicString(fix.recommendation),
  );
}

function hasActionablePublicMigrationTranslation(value: unknown): boolean {
  const translation = readRecord(value);
  const implementation = readRecord(translation?.implementation);
  const saltTarget = readRecord(translation?.salt_target);
  return Boolean(
    translation &&
      hasNonEmptyPublicString(translation.source_model_ref) &&
      hasNonEmptyPublicString(translation.label) &&
      implementation &&
      hasNonEmptyPublicString(implementation.next_action) &&
      saltTarget &&
      hasNonEmptyPublicString(saltTarget.name) &&
      hasNonEmptyPublicString(saltTarget.why),
  );
}

function normalizeEvidenceKey(value: string): string {
  return value.trim().toLowerCase();
}

function hasExactRequest(
  exactRequest: PublicContractExactRequest | undefined,
): exactRequest is PublicContractExactRequest & { requested_entity: string } {
  return Boolean(exactRequest?.requested_entity?.trim());
}

function isMatchSafe(matchStatus: PublicMatchStatus | undefined): boolean {
  return (
    matchStatus === undefined ||
    matchStatus === "exact" ||
    matchStatus === "alias"
  );
}

function isExactRequestSafe(
  exactRequest: PublicContractExactRequest | undefined,
): boolean {
  if (!exactRequest?.match_status) {
    return true;
  }

  if (exactRequest.match_status === "broadened") {
    return (
      exactRequest.exact_match_required !== true &&
      exactRequest.full_request_evidence_complete === true
    );
  }

  return isMatchSafe(exactRequest.match_status);
}

function shouldBlockOnSemanticMismatch(
  exactRequest: PublicContractExactRequest | undefined,
): boolean {
  const matchStatus = exactRequest?.match_status;
  if (!matchStatus) {
    return false;
  }

  if (matchStatus === "misrouted" || matchStatus === "no_match") {
    return true;
  }

  return (
    exactRequest?.exact_match_required === true && matchStatus === "broadened"
  );
}

function deriveBlockingReasons(input: PublicContractInput): string[] {
  const state = input.state;
  const exactRequest = input.exact_request;
  const requiredFollowThrough =
    state.required_follow_through.length > 0
      ? `required follow-through remains: ${state.required_follow_through.map((item) => item.entity).join(", ")}`
      : null;
  const blockingQuestions =
    state.blocking_questions.length > 0 ? "blocking questions remain" : null;
  const contextReason = !state.context_ready
    ? "required project context is missing"
    : null;
  const transportReason =
    state.transport_failed && !state.usable_guidance_present
      ? "transport or workflow failed and no usable guidance was returned"
      : null;
  const semanticReason =
    exactRequest?.match_status === "misrouted"
      ? "requested entity resolved to a different Salt entity"
      : exactRequest?.match_status === "no_match"
        ? "Salt could not resolve the requested entity"
        : exactRequest?.match_status === "broadened" &&
            exactRequest.exact_match_required
          ? "requested entity broadened beyond the exact requested scope"
          : null;

  return uniqueNonEmptyStrings([
    ...(input.blocking_reasons ?? []),
    input.next_step.kind === "ask_user" ? input.next_step.question : null,
    transportReason,
    contextReason,
    semanticReason,
    requiredFollowThrough,
    blockingQuestions,
    state.starter_blockers[0],
    state.project_policy_blockers[0],
  ]);
}

export function derivePublicCanonicalComplete(
  input: PublicContractInput,
): boolean {
  const state = input.state;
  const exactRequest = input.exact_request;

  if (!state.usable_guidance_present) {
    return false;
  }

  if (state.transport_failed || !state.context_ready) {
    return false;
  }

  if (
    state.required_follow_through.length > 0 ||
    state.blocking_questions.length > 0 ||
    state.starter_blockers.length > 0 ||
    state.project_policy_blockers.length > 0
  ) {
    return false;
  }

  if (hasExactRequest(exactRequest) && !isExactRequestSafe(exactRequest)) {
    return false;
  }

  if (input.evidence && input.evidence.status !== "complete") {
    return false;
  }

  return true;
}

export function derivePublicSafeToImplementExactRequest(
  input: PublicContractInput,
): boolean {
  const state = input.state;
  const exactRequest = input.exact_request;

  if (
    !state.implementation_ready ||
    state.transport_failed ||
    !state.context_ready ||
    state.required_follow_through.length > 0 ||
    state.blocking_questions.length > 0 ||
    state.starter_blockers.length > 0 ||
    state.project_policy_blockers.length > 0
  ) {
    return false;
  }

  if (hasExactRequest(exactRequest) && !isExactRequestSafe(exactRequest)) {
    return false;
  }

  if (input.evidence && input.evidence.status !== "complete") {
    return false;
  }

  return state.usable_guidance_present;
}

function shouldBlock(input: PublicContractInput): boolean {
  const state = input.state;

  return (
    state.hard_blocked ||
    !state.context_ready ||
    state.blocking_questions.length > 0 ||
    state.starter_blockers.length > 0 ||
    state.project_policy_blockers.length > 0 ||
    input.next_step.kind === "ask_user" ||
    shouldBlockOnSemanticMismatch(input.exact_request)
  );
}

function buildFallbackEvidence(): PublicEvidenceSummary {
  return {
    status: "missing",
    items: [],
    source_urls: [],
    missing: ["source-backed Salt evidence is incomplete"],
    heuristic_fallback: false,
  };
}

function hasSourceBackedEvidence(evidence: PublicEvidenceSummary): boolean {
  return evidence.items.some(
    (item) =>
      item.kind !== "heuristic_fallback" &&
      item.source !== "heuristic_fallback" &&
      item.source_urls.length > 0,
  );
}

export function derivePublicWorkflowStatus(
  input: PublicContractInput,
): PublicWorkflowStatus {
  const safeToImplementExactRequest =
    derivePublicSafeToImplementExactRequest(input);

  if (input.state.transport_failed && !input.state.usable_guidance_present) {
    return "failed";
  }

  if (shouldBlock(input)) {
    return "blocked";
  }

  if (safeToImplementExactRequest) {
    return "success";
  }

  if (input.state.usable_guidance_present) {
    return "partial";
  }

  return "failed";
}

export function getPublicContractValidationErrors(
  contract: PublicContract,
): string[] {
  const errors: string[] = [];
  const request = contract.request;
  const safety = contract.safety;
  const action = contract.action;
  const hasRequestedEntity = Boolean(request.entity?.trim());
  const hasResolvedEntity =
    request.resolved_entity === null ||
    typeof request.resolved_entity === "string";

  if (contract.summary.trim().length === 0) {
    errors.push("summary must be non-empty");
  }

  if (contract.contract !== PUBLIC_WORKFLOW_CONTRACT_VERSION) {
    errors.push(
      `contract must be ${PUBLIC_WORKFLOW_CONTRACT_VERSION} for workflow payloads`,
    );
  }

  if (safety.exact_request_safe && contract.status !== "success") {
    errors.push("safety.exact_request_safe=true requires status=success");
  }

  if (contract.status === "success" && !safety.exact_request_safe) {
    errors.push("status=success requires safety.exact_request_safe=true");
  }

  if (
    contract.status === "success" &&
    contract.evidence.status !== "complete"
  ) {
    errors.push("status=success requires evidence.status=complete");
  }

  if (safety.exact_request_safe && contract.evidence.status !== "complete") {
    errors.push("safety.exact_request_safe=true requires complete evidence");
  }

  if (
    contract.status === "success" &&
    !hasSourceBackedEvidence(contract.evidence)
  ) {
    errors.push("status=success requires source-backed evidence");
  }

  if (
    safety.exact_request_safe &&
    !hasSourceBackedEvidence(contract.evidence)
  ) {
    errors.push(
      "safety.exact_request_safe=true requires source-backed evidence",
    );
  }

  if (contract.status === "blocked" && safety.blocking_reasons.length === 0) {
    errors.push("status=blocked requires at least one blocking reason");
  }

  if (
    (contract.status === "partial" || contract.status === "blocked") &&
    !action
  ) {
    errors.push("non-success contract requires action");
  }

  if (request.match_status === "misrouted" && safety.exact_request_safe) {
    errors.push("misrouted request.match_status cannot be implementation-safe");
  }

  if (request.match_status === "no_match" && safety.exact_request_safe) {
    errors.push("no_match request.match_status cannot be implementation-safe");
  }

  if (request.match_status === "no_match" && safety.canonical_complete) {
    errors.push("no_match request.match_status cannot be canonically complete");
  }

  if (action.kind === "tool_call") {
    const tool = (action as { tool?: unknown }).tool;
    const mode = (action as { mode?: unknown }).mode;
    const query = (action as { args?: { query?: unknown } }).args?.query;
    if (tool !== "create_salt_ui" || mode !== "exact_name") {
      errors.push(
        "action.kind=tool_call only supports create_salt_ui exact-name retries",
      );
    }
    if (typeof query !== "string" || query.trim().length === 0) {
      errors.push("action.kind=tool_call requires args.query");
    }
  }

  if (action.kind === "retrieve_reference") {
    const referenceAction = action as PublicRetrieveReferenceStep;
    if (
      !Array.isArray(referenceAction.args?.names) ||
      referenceAction.args.names.length === 0 ||
      referenceAction.args.names.some(
        (name) => typeof name !== "string" || name.trim().length === 0,
      )
    ) {
      errors.push("action.kind=retrieve_reference requires args.names");
    }
    if (
      referenceAction.args?.entity_type !== undefined &&
      !PUBLIC_REFERENCE_ENTITY_TYPES.includes(
        referenceAction.args.entity_type as PublicReferenceEntityType,
      )
    ) {
      errors.push(
        "action.kind=retrieve_reference requires a public args.entity_type",
      );
    }
  }

  if (
    (hasRequestedEntity || hasResolvedEntity) &&
    request.match_status === undefined
  ) {
    errors.push(
      "request.entity or request.resolved_entity requires request.match_status",
    );
  }

  if (action.kind === "implement" && !safety.exact_request_safe) {
    errors.push(
      "action.kind=implement requires safety.exact_request_safe=true",
    );
  }

  if (
    action.kind === "implement" &&
    contract.workflow !== "review" &&
    action.post_action?.kind !== "review"
  ) {
    errors.push(
      "action.kind=implement requires action.post_action.kind=review when workflow is not review",
    );
  }

  if (
    action.post_action?.kind === "review" &&
    action.kind !== "implement" &&
    action.kind !== "apply_fixes"
  ) {
    errors.push(
      "action.post_action.kind=review must only appear when action.kind=implement or apply_fixes",
    );
  }

  if (action.kind === "apply_fixes") {
    if (contract.workflow !== "review") {
      errors.push("action.kind=apply_fixes is only valid for review workflows");
    }
    if (
      contract.guidance?.kind !== "review" ||
      contract.guidance.fixes.length === 0
    ) {
      errors.push("action.kind=apply_fixes requires grounded review fixes");
    }
    if (action.post_action?.kind !== "review") {
      errors.push(
        "action.kind=apply_fixes requires action.post_action.kind=review",
      );
    }
    if (
      (action as { authorization?: unknown }).authorization !==
      "host_or_user_required"
    ) {
      errors.push(
        "action.kind=apply_fixes requires authorization=host_or_user_required",
      );
    }
  }

  const postAction = action.post_action;
  if (postAction?.kind === "review") {
    if ((postAction as { tool?: unknown }).tool !== "review_salt_ui") {
      errors.push(
        "action.post_action.kind=review requires tool=review_salt_ui",
      );
    }
    const requiredInput = (postAction as { required_input?: unknown })
      .required_input;
    if (
      !Array.isArray(requiredInput) ||
      requiredInput.length !== 1 ||
      requiredInput[0] !== "complete_updated_file"
    ) {
      errors.push(
        "action.post_action.kind=review requires complete updated file input",
      );
    }
  }

  if (postAction?.kind === "rerun_workflow") {
    if ((postAction as { tool?: unknown }).tool !== "create_salt_ui") {
      errors.push(
        "action.post_action.kind=rerun_workflow requires tool=create_salt_ui",
      );
    }
    const continuationKinds: PublicActionKind[] = ["retrieve_reference"];
    if (
      contract.workflow !== "create" ||
      !continuationKinds.includes(action.kind)
    ) {
      errors.push(
        "action.post_action.kind=rerun_workflow is only valid for create follow-up actions",
      );
    }
    if (
      typeof postAction.args?.query !== "string" ||
      postAction.args.query.trim().length === 0
    ) {
      errors.push("action.post_action.kind=rerun_workflow requires args.query");
    }
  }

  if (
    contract.workflow === "create" &&
    action.kind === "retrieve_reference" &&
    postAction?.kind !== "rerun_workflow"
  ) {
    errors.push(
      "create deterministic follow-up actions require action.post_action.kind=rerun_workflow",
    );
  }

  if (action.kind === "ask_user" && postAction !== null) {
    errors.push("action.kind=ask_user requires action.post_action=null");
  }

  if (!contract.guidance || contract.guidance.kind !== contract.workflow) {
    errors.push("guidance.kind must match workflow");
  }

  if (
    contract.workflow === "create" &&
    contract.guidance?.kind === "create" &&
    action.kind === "implement"
  ) {
    if (!contract.guidance.decision.name?.trim()) {
      errors.push("create implement action requires guidance.decision.name");
    }
    if (
      !hasActionablePublicStarterGuidance(contract.guidance.starter_guidance)
    ) {
      errors.push(
        "create implement action requires actionable starter guidance",
      );
    }
  }

  if (contract.guidance?.kind === "review") {
    if (
      contract.guidance.findings.some(
        (finding) => !hasActionablePublicReviewFinding(finding),
      )
    ) {
      errors.push("review guidance findings must be actionable");
    }
    if (
      contract.guidance.fixes.some((fix) => !hasActionablePublicReviewFix(fix))
    ) {
      errors.push("review guidance fixes must be actionable");
    }
  }

  if (
    contract.workflow === "migrate" &&
    contract.guidance?.kind === "migrate" &&
    action.kind === "implement"
  ) {
    if (
      contract.guidance.translations.length === 0 ||
      contract.guidance.translations.some(
        (translation) => !hasActionablePublicMigrationTranslation(translation),
      )
    ) {
      errors.push("migrate implement action requires translations");
    }
    if (!contract.guidance.migration_plan.some(hasNonEmptyPublicString)) {
      errors.push("migrate implement action requires a migration plan");
    }
    if (
      !hasActionablePublicStarterGuidance(contract.guidance.starter_guidance)
    ) {
      errors.push(
        "migrate implement action requires actionable starter guidance",
      );
    }
  }

  if (
    contract.questions.length > 0 &&
    !["ask_user", "fix_context"].includes(action.kind) &&
    contract.status === "blocked"
  ) {
    errors.push(
      "blocked contracts with questions must use action.kind=ask_user",
    );
  }

  if (
    action.kind === "ask_user" &&
    contract.questions.length === 0 &&
    !action.question
  ) {
    errors.push("action.kind=ask_user requires a question");
  }

  if (
    contract.evidence.items.some((item) => item.kind === "heuristic_fallback")
  ) {
    if (contract.evidence.status === "complete") {
      errors.push("heuristic fallback evidence cannot be complete");
    }
    if (contract.status === "success") {
      errors.push("heuristic fallback evidence cannot produce success");
    }
  }

  return uniqueNonEmptyStrings(errors);
}

export function assertValidPublicContract(
  contract: PublicContract,
): asserts contract is PublicContract {
  const errors = getPublicContractValidationErrors(contract);
  if (errors.length === 0) {
    return;
  }

  throw new Error(`Invalid PublicContract: ${errors.join("; ")}`);
}

export function buildPublicContract(
  input: PublicContractInput,
): PublicContract {
  const canonicalComplete = derivePublicCanonicalComplete(input);
  const safeToImplementExactRequest =
    derivePublicSafeToImplementExactRequest(input);
  const workflowStatus = derivePublicWorkflowStatus(input);
  const blockingReasons = deriveBlockingReasons(input);
  const evidence = input.evidence ?? buildFallbackEvidence();
  const nextStep = input.next_step;
  const questions = uniqueNonEmptyStrings([
    ...(input.questions ?? []),
    ...input.state.blocking_questions,
    input.next_step.kind === "ask_user" ? input.next_step.question : null,
  ]);
  const requestedEntity = input.exact_request?.requested_entity?.trim();
  const resolvedEntity =
    input.exact_request?.resolved_entity === null
      ? null
      : input.exact_request?.resolved_entity?.trim();
  const postAction: PublicPostAction | null =
    input.post_action !== undefined
      ? input.post_action
      : nextStep.kind === "apply_fixes" ||
          (nextStep.kind === "implement" && input.workflow !== "review")
        ? {
            kind: "review",
            tool: "review_salt_ui",
            required_input: ["complete_updated_file"],
          }
        : null;

  const contract: PublicContract = {
    contract: PUBLIC_WORKFLOW_CONTRACT_VERSION,
    workflow: input.workflow,
    status: workflowStatus,
    request: {
      ...(requestedEntity ? { entity: requestedEntity } : {}),
      ...(resolvedEntity !== undefined
        ? { resolved_entity: resolvedEntity }
        : {}),
      ...(input.exact_request?.match_status
        ? { match_status: input.exact_request.match_status }
        : {}),
      ...(typeof input.exact_request?.exact_match_required === "boolean"
        ? { exact_match_required: input.exact_request.exact_match_required }
        : {}),
      ...(typeof input.exact_request?.full_request_evidence_complete ===
      "boolean"
        ? {
            full_request_evidence_complete:
              input.exact_request.full_request_evidence_complete,
          }
        : {}),
    },
    safety: {
      canonical_complete: canonicalComplete,
      exact_request_safe: safeToImplementExactRequest,
      blocking_reasons: blockingReasons,
    },
    action: {
      ...nextStep,
      rule_ids: uniqueNonEmptyStrings(input.rule_ids ?? []),
      post_action: postAction,
    },
    guidance: input.guidance,
    questions,
    evidence,
    internal_limitations: normalizeInternalLimitations(
      input.internal_limitations,
    ),
    summary: input.summary.trim(),
  };

  assertValidPublicContract(contract);
  return contract;
}

function buildStarterBlockers(
  starterValidation: WorkflowStarterValidation | null | undefined,
): string[] {
  if (starterValidation?.status !== "needs_attention") {
    return [];
  }

  return uniqueNonEmptyStrings([
    starterValidation.top_issue,
    starterValidation.next_step,
  ]);
}

function buildProjectPolicyBlockers(args: {
  implementation_ready: boolean;
  readiness_reason?: string;
  starter_blockers: string[];
}): string[] {
  if (
    args.implementation_ready ||
    args.starter_blockers.length > 0 ||
    !args.readiness_reason
  ) {
    return [];
  }

  return [args.readiness_reason];
}

function toFixContextStep(
  tool: PublicFixContextStep["tool"],
  rootDir?: string | null,
): PublicFixContextStep {
  return {
    kind: "fix_context",
    tool,
    mode: "stop_and_fix_context",
    ...(rootDir
      ? {
          args: {
            root_dir: rootDir,
          },
        }
      : {}),
  };
}

function deriveCreateExactRequest(
  result: CreateSaltUiResult,
  options: PublicContractBuildOptions,
): PublicContractExactRequest | undefined {
  if (options.exact_request) {
    return options.exact_request;
  }

  if (!options.registry) {
    return undefined;
  }

  const requestMatch = deriveCreateRequestMatch(options.registry, {
    query: options.query,
    package: options.package,
    result_mode: result.mode,
    result_decision_name: result.decision.name,
    result_solution_type: result.solution_type,
  });

  if (!requestMatch) {
    return undefined;
  }

  return {
    requested_entity: requestMatch.requested_entity,
    resolved_entity: requestMatch.resolved_entity,
    match_status: requestMatch.match_status,
    exact_match_required: requestMatch.exact_match_required,
  };
}

function buildCreateRetrieveReferenceArgs(
  result: CreateSaltUiResult,
  reference: CreateRequestMatch["reference"] | undefined,
  name: string,
  includes: Pick<
    PublicRetrieveReferenceStep["args"],
    "include" | "include_starter_code"
  > = {},
): PublicRetrieveReferenceStep["args"] {
  const normalizedName = normalizeEvidenceKey(name);
  const referenceEntityType =
    reference &&
    normalizeEvidenceKey(reference.requested_target.name) === normalizedName
      ? reference.requested_target.entity_type
      : undefined;
  const decisionEntityType =
    result.decision.name &&
    normalizeEvidenceKey(result.decision.name) === normalizedName &&
    PUBLIC_REFERENCE_ENTITY_TYPES.includes(
      result.solution_type as PublicReferenceEntityType,
    )
      ? (result.solution_type as PublicReferenceEntityType)
      : undefined;
  const entityType = referenceEntityType ?? decisionEntityType;

  return {
    names: [name],
    ...(entityType ? { entity_type: entityType } : {}),
    ...includes,
  };
}

function buildCreateNextStep(
  result: CreateSaltUiResult,
  contract: CreateSaltUiWorkflowContract,
  exactRequest?: PublicContractExactRequest,
  reference?: CreateRequestMatch["reference"],
  evidence?: PublicEvidenceSummary,
  requiredFollowThrough: FollowThroughItem[] = contract.implementation_gate
    .required_follow_through,
  resolvedEntities: string[] = [],
): PublicNextStep {
  if (!contract.context_requirement.repo_specific_edits_ready) {
    return toFixContextStep(
      "get_salt_project_context",
      contract.context_requirement.retry_with.root_dir,
    );
  }

  if (contract.implementation_gate.blocking_questions.length > 0) {
    return {
      kind: "ask_user",
      question: contract.implementation_gate.blocking_questions[0],
    };
  }

  if (
    exactRequest?.requested_entity &&
    exactRequest.exact_match_required &&
    (exactRequest.match_status === "misrouted" ||
      exactRequest.match_status === "no_match" ||
      exactRequest.match_status === "broadened")
  ) {
    return {
      kind: "tool_call",
      tool: "create_salt_ui",
      mode: "exact_name",
      args: {
        query: exactRequest.requested_entity,
      },
    };
  }

  if (requiredFollowThrough.length > 0) {
    const name = requiredFollowThrough[0].entity;
    return {
      kind: "retrieve_reference",
      tool: "get_salt_reference",
      args: buildCreateRetrieveReferenceArgs(result, reference, name),
    };
  }

  if (
    reference?.requested_target.name &&
    exactRequest?.match_status &&
    !isExactRequestSafe(exactRequest)
  ) {
    return {
      kind: "retrieve_reference",
      tool: "get_salt_reference",
      args: buildCreateRetrieveReferenceArgs(
        result,
        reference,
        reference.requested_target.name,
      ),
    };
  }

  if (evidence && evidence.status !== "complete") {
    const resolvedEntityKeys = new Set(
      resolvedEntities.map(normalizeEvidenceKey),
    );
    if (
      exactRequest?.resolved_entity &&
      !resolvedEntityKeys.has(
        normalizeEvidenceKey(exactRequest.resolved_entity),
      )
    ) {
      return {
        kind: "retrieve_reference",
        tool: "get_salt_reference",
        args: buildCreateRetrieveReferenceArgs(
          result,
          reference,
          exactRequest.resolved_entity,
        ),
      };
    }

    if (exactRequest?.resolved_entity) {
      return {
        kind: "ask_user",
        question:
          "Which additional canonical Salt component or pattern should be grounded for the unresolved parts of this request?",
      };
    }

    const exampleTarget = contract.intent.canonical_choice?.trim();
    if (!exampleTarget) {
      return {
        kind: "ask_user",
        question:
          "Which canonical Salt component or pattern should the example lookup target?",
      };
    }

    return {
      kind: "retrieve_reference",
      tool: "get_salt_reference",
      args: buildCreateRetrieveReferenceArgs(result, reference, exampleTarget, {
        include: ["examples"],
        include_starter_code: true,
      }),
    };
  }

  if (
    contract.readiness.implementation_ready &&
    (!exactRequest || isExactRequestSafe(exactRequest))
  ) {
    return {
      kind: "implement",
      scope: "exact_request",
    };
  }

  return buildAskUserBlockerStep(
    [
      contract.starter_validation?.next_step,
      contract.starter_validation?.top_issue,
      contract.readiness.implementation_ready
        ? null
        : contract.readiness.reason,
      result.next_step,
      evidence?.missing[0],
    ],
    "What additional information is needed before this Salt UI direction can be implemented safely?",
  );
}

function isGroundedReviewFixCandidate(
  candidate: WorkflowFixCandidate,
): boolean {
  return (
    Boolean(candidate.recommendation?.trim()) &&
    candidate.source_urls.some((sourceUrl) => sourceUrl.trim().length > 0)
  );
}

function buildReviewNextStep(
  result: ReviewSaltUiResult,
  contract: ReviewSaltUiWorkflowContract,
  evidence: PublicEvidenceSummary,
  options?: { can_complete: boolean },
): PublicNextStep {
  if (options?.can_complete) {
    return {
      kind: "complete",
      outcome: "no_changes_required",
    };
  }

  const topFixCandidate = contract.fix_candidates.candidates.find(
    isGroundedReviewFixCandidate,
  );
  if (
    topFixCandidate &&
    evidence.status === "complete" &&
    hasSourceBackedEvidence(evidence)
  ) {
    return {
      kind: "apply_fixes",
      scope: "grounded_findings",
      authorization: "host_or_user_required",
    };
  }

  const nextStep = appendProjectConventionsCheckNextStep(
    result.next_step ?? contract.ide_summary.safest_next_fix ?? undefined,
    contract.project_conventions_check,
  );

  return buildAskUserBlockerStep(
    [
      nextStep,
      result.missing_data[0],
      evidence.missing[0],
      contract.decision.why,
    ],
    "What additional source or decision is needed to resolve the remaining Salt review blocker?",
  );
}

function buildReviewSourceResubmissionStep(): PublicAskUserStep {
  return {
    kind: "ask_user",
    question:
      "Can you provide the complete current contents of one changed Salt source file so review can rerun?",
  };
}

function buildMigrateNextStep(
  result: MigrateToSaltResult,
  contract: MigrateToSaltWorkflowContract,
  blockingQuestions: string[] = result.clarifying_questions ?? [],
  evidence?: PublicEvidenceSummary,
): PublicNextStep {
  if (!contract.context_requirement.repo_specific_edits_ready) {
    return toFixContextStep(
      "get_salt_project_context",
      contract.context_requirement.retry_with.root_dir,
    );
  }

  if (blockingQuestions.length > 0) {
    return {
      kind: "ask_user",
      question: blockingQuestions[0] ?? "Clarify the migration scope.",
    };
  }

  if (
    contract.readiness.implementation_ready &&
    evidence?.status === "complete" &&
    hasSourceBackedEvidence(evidence)
  ) {
    return {
      kind: "implement",
      scope: "exact_request",
    };
  }

  return buildAskUserBlockerStep(
    [
      contract.starter_validation?.next_step,
      contract.starter_validation?.top_issue,
      result.next_step,
      contract.readiness.implementation_ready
        ? null
        : contract.readiness.reason,
      evidence?.missing[0],
    ],
    "What source UI scope or implementation decision is still needed before this migration can proceed safely?",
  );
}

function buildCreateSummary(
  result: CreateSaltUiResult,
  exactRequest: PublicContractExactRequest | undefined,
): string {
  if (exactRequest?.requested_entity && exactRequest.match_status) {
    if (
      (exactRequest.match_status === "exact" ||
        exactRequest.match_status === "alias") &&
      exactRequest.resolved_entity
    ) {
      return exactRequest.match_status === "exact"
        ? `Salt grounded the exact requested entity ${exactRequest.resolved_entity}.`
        : `Salt grounded ${exactRequest.requested_entity} to the canonical entity ${exactRequest.resolved_entity}.`;
    }

    if (
      exactRequest.match_status === "broadened" &&
      exactRequest.resolved_entity
    ) {
      return exactRequest.exact_match_required
        ? `Salt broadened ${exactRequest.requested_entity} to the nearby Salt entity ${exactRequest.resolved_entity}.`
        : `Salt interpreted ${exactRequest.requested_entity} as the broader Salt entity ${exactRequest.resolved_entity}.`;
    }

    if (
      exactRequest.match_status === "misrouted" &&
      exactRequest.resolved_entity
    ) {
      return exactRequest.exact_match_required
        ? `Salt resolved ${exactRequest.resolved_entity} instead of the exact requested ${exactRequest.requested_entity}.`
        : `Salt resolved ${exactRequest.resolved_entity} instead of the requested ${exactRequest.requested_entity}.`;
    }

    if (exactRequest.match_status === "no_match") {
      return exactRequest.exact_match_required
        ? `Salt could not resolve the exact requested entity ${exactRequest.requested_entity}.`
        : `Salt could not resolve the requested ${exactRequest.requested_entity}.`;
    }
  }

  return result.decision.name != null
    ? `Salt resolved ${result.decision.name} as the current create direction.`
    : result.decision.why;
}

function buildReviewBlockingReasons(
  contract: ReviewSaltUiWorkflowContract,
  result: ReviewSaltUiResult,
): string[] {
  if (contract.decision.status === "clean") {
    return [];
  }

  const topActionableCandidate = contract.fix_candidates.candidates.find(
    (candidate) =>
      Boolean(candidate.recommendation ?? candidate.reason ?? candidate.title),
  );
  const projectPolicyReasons = contract.fix_candidates.candidates
    .filter((candidate) => candidate.category === "project-policy")
    .map((candidate) => candidate.reason ?? candidate.title);

  return uniqueNonEmptyStrings([
    topActionableCandidate?.recommendation ??
      topActionableCandidate?.reason ??
      topActionableCandidate?.title ??
      null,
    !topActionableCandidate && contract.decision.status === "needs_attention"
      ? contract.decision.why
      : null,
    result.missing_data[0] ?? null,
    ...projectPolicyReasons.slice(0, 2),
  ]);
}

function collectReviewSourceCompletenessGaps(
  result: ReviewSaltUiResult,
): string[] {
  const reportedGaps = result.missing_data.filter((entry) => {
    const value = entry.trim();
    return (
      /^No code was provided\.?$/i.test(value) ||
      /Code could not be parsed as JSX\/TSX/i.test(value) ||
      /\b(?:source|code|file|input)\b.*\b(?:incomplete|truncated)\b/i.test(
        value,
      ) ||
      /\b(?:incomplete|truncated)\b.*\b(?:source|code|file|input)\b/i.test(
        value,
      )
    );
  });

  if (reportedGaps.length === 0) {
    return [];
  }

  return uniqueNonEmptyStrings([
    "Complete parseable source input is required: submit the complete current contents of every changed Salt source file and rerun review_salt_ui.",
    ...reportedGaps,
  ]);
}

function applyReviewSourceCompletenessGaps(
  evidence: PublicEvidenceSummary,
  gaps: string[],
): PublicEvidenceSummary {
  if (gaps.length === 0) {
    return evidence;
  }

  return {
    ...evidence,
    status: evidence.items.length > 0 ? "partial" : "missing",
    missing: uniqueNonEmptyStrings([...evidence.missing, ...gaps]),
  };
}

function buildMigrateBlockingReasons(
  contract: MigrateToSaltWorkflowContract,
  result: MigrateToSaltResult,
  starterBlockers: string[],
  projectPolicyBlockers: string[],
  blockingQuestions: string[] = result.clarifying_questions ?? [],
): string[] {
  return uniqueNonEmptyStrings([
    blockingQuestions[0] ?? null,
    starterBlockers[0],
    projectPolicyBlockers[0],
    contract.context_requirement.repo_specific_edits_ready
      ? null
      : contract.context_requirement.reason,
  ]);
}

function isProjectConventionClarifyingQuestion(question: string): boolean {
  return (
    /\b(repo|approved)\b/i.test(question) &&
    /\b(wrapper|shell|page pattern|layout)\b/i.test(question)
  );
}

function shouldKeepProjectConventionClarification(
  contract: MigrateToSaltWorkflowContract,
): boolean {
  return (
    contract.project_conventions_check.declared_policy_status !==
      "none-declared" ||
    contract.project_conventions_check.check_recommended === false
  );
}

function filterMigrateBlockingQuestions(
  questions: string[] | undefined,
  contract: MigrateToSaltWorkflowContract,
): string[] {
  const entries = uniqueNonEmptyStrings(questions ?? []);
  if (shouldKeepProjectConventionClarification(contract)) {
    return entries;
  }

  return entries.filter(
    (question) => !isProjectConventionClarifyingQuestion(question),
  );
}

function countProjectPolicyFixCandidates(
  candidates: WorkflowFixCandidate[],
): number {
  return candidates.filter(
    (candidate) => candidate.category === "project-policy",
  ).length;
}

function readRecord(value: unknown): Record<string, unknown> | null {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function readRecordString(value: unknown, key: string): string | null {
  const record = readRecord(value);
  const entry = record?.[key];
  return typeof entry === "string" && entry.trim().length > 0
    ? entry.trim()
    : null;
}

function readRecordStringArray(value: unknown, key: string): string[] {
  const record = readRecord(value);
  const entry = record?.[key];
  return Array.isArray(entry)
    ? entry.filter(
        (item): item is string =>
          typeof item === "string" && item.trim().length > 0,
      )
    : [];
}

function readRelatedDocUrls(value: unknown): string[] {
  const relatedDocs = readRecord(readRecord(value)?.related_docs);
  if (!relatedDocs) {
    return [];
  }

  return Object.values(relatedDocs).filter(
    (entry): entry is string =>
      typeof entry === "string" && entry.trim().length > 0,
  );
}

function readExampleSourceUrls(value: unknown): string[] {
  const examples = readRecord(value)?.examples;
  if (!Array.isArray(examples)) {
    return [];
  }

  return examples
    .map((example) => readRecordString(example, "source_url"))
    .filter((entry): entry is string => Boolean(entry));
}

function readEntityName(value: unknown): string | undefined {
  return readRecordString(value, "name") ?? undefined;
}

function findCreateEvidenceRecord(
  registry: SaltRegistry | undefined,
  entity: string | null,
): Record<string, unknown> | null {
  if (!registry || !entity) {
    return null;
  }

  const normalizedEntity = entity.trim().toLowerCase();
  const componentRecord = registry.components.find((component) =>
    componentMatchesLookupName(component, entity),
  );
  if (componentRecord) {
    return componentRecord as unknown as Record<string, unknown>;
  }

  const collections: unknown[][] = [
    registry.patterns,
    registry.pages,
    registry.guides,
    registry.tokens,
  ];

  for (const collection of collections) {
    const record = collection
      .map((entry) => readRecord(entry))
      .find(
        (entry) =>
          readEntityName(entry)?.toLowerCase() === normalizedEntity ||
          readRecordStringArray(entry, "aliases").some(
            (alias) => alias.toLowerCase() === normalizedEntity,
          ),
      );
    if (record) {
      return record;
    }
  }

  return null;
}

function buildEvidenceItem(input: {
  kind: PublicEvidenceKind;
  source?: PublicEvidenceItem["source"];
  entity?: string;
  field?: string;
  source_urls?: string[];
  summary?: string;
}): PublicEvidenceItem {
  return {
    kind: input.kind,
    source: input.source ?? "canonical_salt",
    ...(input.entity ? { entity: input.entity } : {}),
    ...(input.field ? { field: input.field } : {}),
    source_urls: uniqueNonEmptyStrings(input.source_urls ?? []),
    ...(input.summary ? { summary: input.summary } : {}),
  };
}

function buildWorkflowEvidenceFromProvenance(input: {
  provenance?: { source_urls?: string[]; canonical_source_urls?: string[] };
  entity?: string | null;
  extra_items?: PublicEvidenceItem[];
  missing?: string[];
  input_context?: PublicEvidenceInputContext;
}): PublicEvidenceSummary {
  const sourceUrls = uniqueNonEmptyStrings([
    ...(input.provenance?.canonical_source_urls ?? []),
    ...(input.provenance?.source_urls ?? []),
    ...(input.extra_items ?? []).flatMap((item) => item.source_urls),
  ]);
  const items = [
    ...(sourceUrls.length > 0
      ? [
          buildEvidenceItem({
            kind: "docs",
            entity: input.entity ?? undefined,
            field: "source_urls",
            source_urls: sourceUrls,
            summary:
              "Canonical Salt documentation or registry sources support this workflow decision.",
          }),
        ]
      : []),
    ...(input.extra_items ?? []),
  ];
  const missing = uniqueNonEmptyStrings(input.missing ?? []);

  return {
    status:
      items.length > 0 && missing.length === 0
        ? "complete"
        : items.length > 0
          ? "partial"
          : "missing",
    items,
    source_urls: sourceUrls,
    missing:
      items.length > 0
        ? missing
        : ["canonical Salt source evidence is missing"],
    heuristic_fallback: items.some(
      (item) => item.kind === "heuristic_fallback",
    ),
    ...(input.input_context ? { input_context: input.input_context } : {}),
  };
}

function buildReviewEvidenceGate(
  result: ReviewSaltUiResult,
  registry: SaltRegistry | undefined,
): ReviewReportEvidenceGate | null {
  if (!registry) {
    return null;
  }

  return buildReviewReportEvidenceGate({
    registry,
    issues: (result.issues ?? []) as unknown as ValidationIssue[],
    missing_data: result.missing_data,
    generated_at: registry.generated_at,
    generator: {
      name: "salt-mcp.review-public-contract",
    },
  });
}

function applyReviewEvidenceGate(
  evidence: PublicEvidenceSummary,
  gate: ReviewReportEvidenceGate | null,
): PublicEvidenceSummary {
  if (!gate) {
    return evidence;
  }

  const surfaceGate = serializeGeneratedSaltArtifactSurfaceGate(gate);
  const evidenceWithGate = {
    ...evidence,
    surface_gate: surfaceGate,
    unsupported_claim_count: surfaceGate.unsupported_claim_count,
    validation_issue_count: surfaceGate.validation_issues.length,
  };

  // Only true validator failures degrade the workflow status. Registry
  // coverage gaps are surfaced via the top-level internal_limitations block so
  // hosts can branch on them without misreading them as "the user request
  // is only partly addressed."
  if (surfaceGate.validation_issues.length === 0) {
    return evidenceWithGate;
  }

  const validationLabel = gate.artifact.artifact_kind;
  const validationOnlyMissing = surfaceGate.validation_issues.map(
    (issue) =>
      `${validationLabel} evidence validation failed: ${issue.code} at ${issue.path}`,
  );
  const missing = uniqueNonEmptyStrings([
    ...evidence.missing,
    ...validationOnlyMissing,
  ]);

  return {
    ...evidenceWithGate,
    status: evidence.items.length > 0 ? "partial" : "missing",
    missing:
      missing.length > 0 ? missing : ["review report evidence is incomplete"],
  };
}

function deriveReviewInternalLimitations(
  gate: ReviewReportEvidenceGate | null,
  unsupportedRuleKinds: string[] = [],
): PublicInternalLimitations {
  if (!gate) {
    return {
      unsupported_claim_count: unsupportedRuleKinds.length,
      unsupported_rule_kinds:
        uniqueNonEmptyStrings(unsupportedRuleKinds).sort(),
    };
  }

  const unsupportedClaims = gate.artifact.unsupported_claims ?? [];
  const ruleKinds = uniqueNonEmptyStrings([
    ...unsupportedClaims.map((claim) => claim.kind as string),
    ...unsupportedRuleKinds,
  ]).sort();

  return {
    unsupported_claim_count:
      gate.unsupported_claim_count +
      uniqueNonEmptyStrings(unsupportedRuleKinds).length,
    unsupported_rule_kinds: ruleKinds,
  };
}

function summarizeOutlineCounts(
  counts:
    | PublicEvidenceInputContext["source_outline_signal_counts"]
    | undefined,
): string | undefined {
  if (!counts) {
    return undefined;
  }

  const parts = [
    counts.regions > 0
      ? `${counts.regions} region${counts.regions === 1 ? "" : "s"}`
      : null,
    counts.actions > 0
      ? `${counts.actions} action${counts.actions === 1 ? "" : "s"}`
      : null,
    counts.states > 0
      ? `${counts.states} state${counts.states === 1 ? "" : "s"}`
      : null,
    counts.notes > 0
      ? `${counts.notes} note${counts.notes === 1 ? "" : "s"}`
      : null,
  ].filter((part): part is string => Boolean(part));

  return parts.length > 0
    ? `Structured source outline contributed ${parts.join(", ")}.`
    : undefined;
}

function buildMigrateEvidenceInputContext(
  contract: MigrateToSaltWorkflowContract,
): PublicEvidenceInputContext {
  const visualEvidence = contract.visual_evidence_contract;

  return {
    source_outline_provided: visualEvidence.source_outline_provided,
    source_outline_signal_counts: visualEvidence.source_outline_signal_counts,
    derived_outline_available: visualEvidence.derived_outline_available,
    derived_outline_signal_counts: visualEvidence.derived_outline_signal_counts,
    visual_input_count: visualEvidence.visual_input_count,
    visual_input_kinds: visualEvidence.visual_input_kinds,
    ...(visualEvidence.source_outline_provided
      ? {
          source_outline_summary: summarizeOutlineCounts(
            visualEvidence.source_outline_signal_counts,
          ),
        }
      : {}),
  };
}

function buildCreateEvidence(
  result: CreateSaltUiResult,
  contract: CreateSaltUiWorkflowContract,
  exactRequest: PublicContractExactRequest | undefined,
  registry?: SaltRegistry,
  options: {
    remaining_follow_through?: FollowThroughItem[];
    resolved_follow_through_evidence?: PublicEvidenceItem[];
  } = {},
): PublicEvidenceSummary {
  const recommended = readRecord(result.recommended);
  const entity = readEntityName(recommended) ?? result.decision.name ?? null;
  const registryRecord = findCreateEvidenceRecord(registry, entity);
  const relatedDocs = uniqueNonEmptyStrings([
    ...readRelatedDocUrls(recommended),
    ...readRelatedDocUrls(registryRecord),
  ]);
  const exampleSourceUrls = uniqueNonEmptyStrings([
    ...readExampleSourceUrls(recommended),
    ...readExampleSourceUrls(registryRecord),
  ]);
  const explicitSourceUrls = uniqueNonEmptyStrings([
    ...readRecordStringArray(recommended, "source_urls"),
    ...readRecordStringArray(registryRecord, "source_urls"),
  ]);
  const registrySourceUrls = uniqueNonEmptyStrings([
    ...contract.provenance.canonical_source_urls,
    ...contract.provenance.source_urls,
    ...relatedDocs,
    ...explicitSourceUrls,
  ]);
  const whenToUse = uniqueNonEmptyStrings([
    ...readRecordStringArray(recommended, "when_to_use"),
    ...readRecordStringArray(registryRecord, "when_to_use"),
  ]);
  const whenNotToUse = uniqueNonEmptyStrings([
    ...readRecordStringArray(recommended, "when_not_to_use"),
    ...readRecordStringArray(registryRecord, "when_not_to_use"),
  ]);
  const sourceUrls = uniqueNonEmptyStrings([
    ...contract.provenance.canonical_source_urls,
    ...contract.provenance.related_guide_urls,
    ...contract.provenance.starter_source_urls,
    ...contract.provenance.source_urls,
    ...(options.resolved_follow_through_evidence ?? []).flatMap(
      (item) => item.source_urls,
    ),
    ...relatedDocs,
    ...exampleSourceUrls,
    ...explicitSourceUrls,
  ]);
  const docsEvidenceSourceUrls = sourceUrls.slice(0, 6);
  const registryEvidenceSourceUrls = (
    registrySourceUrls.length > 0 ? registrySourceUrls : sourceUrls
  ).slice(0, 4);
  const items: PublicEvidenceItem[] = [
    ...(sourceUrls.length > 0
      ? [
          buildEvidenceItem({
            kind: "docs",
            entity: entity ?? undefined,
            field: "source_urls",
            source_urls: docsEvidenceSourceUrls,
            summary:
              "Canonical Salt docs or registry sources support the create decision.",
          }),
        ]
      : []),
    ...(whenToUse.length > 0
      ? [
          buildEvidenceItem({
            kind: "registry",
            entity: entity ?? undefined,
            field: "when_to_use",
            source_urls: registryEvidenceSourceUrls,
            summary: whenToUse[0],
          }),
        ]
      : []),
    ...(whenNotToUse.length > 0
      ? [
          buildEvidenceItem({
            kind: "registry",
            entity: entity ?? undefined,
            field: "when_not_to_use",
            source_urls: registryEvidenceSourceUrls,
            summary: whenNotToUse[0],
          }),
        ]
      : []),
    ...(exampleSourceUrls.length > 0
      ? [
          buildEvidenceItem({
            kind: "examples",
            entity: entity ?? undefined,
            field: "examples",
            source_urls: exampleSourceUrls,
            summary:
              "Canonical examples are available for implementation grounding.",
          }),
        ]
      : []),
    ...(options.resolved_follow_through_evidence ?? []),
  ];
  const remainingFollowThrough =
    options.remaining_follow_through ??
    contract.implementation_gate.required_follow_through;
  const missing = uniqueNonEmptyStrings([
    sourceUrls.length === 0 ? "canonical source URLs" : null,
    exactRequest?.match_status === "broadened" &&
    exactRequest.full_request_evidence_complete !== true
      ? "full-request evidence beyond broadened owner"
      : null,
    ...remainingFollowThrough.map(
      (item) => `follow-through evidence for ${item.entity}`,
    ),
    ...contract.implementation_gate.blocking_questions.map(
      () => "answered clarification",
    ),
  ]);

  return {
    status:
      items.length > 0 && missing.length === 0
        ? "complete"
        : items.length > 0
          ? "partial"
          : "missing",
    items,
    source_urls: sourceUrls,
    missing:
      items.length > 0
        ? missing
        : ["canonical Salt source evidence is missing"],
    heuristic_fallback: false,
  };
}

function buildResolvedFollowThroughEvidence(input: {
  registry?: SaltRegistry;
  required_follow_through: FollowThroughItem[];
  resolved_entities?: string[];
}): {
  remaining_follow_through: FollowThroughItem[];
  evidence_items: PublicEvidenceItem[];
  full_request_evidence_complete: boolean;
} {
  const resolvedEntities = uniqueNonEmptyStrings(input.resolved_entities ?? []);
  const resolvedEntityKeys = new Set(
    resolvedEntities.map(normalizeEvidenceKey),
  );
  const requiredEntityKeys = new Set(
    input.required_follow_through.map((item) =>
      normalizeEvidenceKey(item.entity),
    ),
  );
  const remaining: FollowThroughItem[] = [];
  const evidenceItems: PublicEvidenceItem[] = [];
  let resolvedRequiredCount = 0;

  for (const followThrough of input.required_follow_through) {
    if (!resolvedEntityKeys.has(normalizeEvidenceKey(followThrough.entity))) {
      remaining.push(followThrough);
      continue;
    }

    const record = findCreateEvidenceRecord(
      input.registry,
      followThrough.entity,
    );
    const sourceUrls = uniqueNonEmptyStrings([
      ...readRecordStringArray(record, "source_urls"),
      ...readRelatedDocUrls(record),
      ...readExampleSourceUrls(record),
    ]);

    if (sourceUrls.length === 0) {
      remaining.push(followThrough);
      continue;
    }

    evidenceItems.push(
      buildEvidenceItem({
        kind: "docs",
        entity: followThrough.entity,
        field: "resolved_follow_through",
        source_urls: sourceUrls.slice(0, 4),
        summary: `Retrieved canonical Salt evidence for ${followThrough.entity} before implementing the ${followThrough.region} region.`,
      }),
    );
    resolvedRequiredCount += 1;
  }

  for (const entity of resolvedEntities) {
    const entityKey = normalizeEvidenceKey(entity);
    if (requiredEntityKeys.has(entityKey)) {
      continue;
    }

    const record = findCreateEvidenceRecord(input.registry, entity);
    const sourceUrls = uniqueNonEmptyStrings([
      ...readRecordStringArray(record, "source_urls"),
      ...readRelatedDocUrls(record),
      ...readExampleSourceUrls(record),
    ]);

    if (sourceUrls.length === 0) {
      remaining.push({
        region: "resolved_entities",
        entity,
      });
      continue;
    }

    evidenceItems.push(
      buildEvidenceItem({
        kind: "docs",
        entity,
        field: "resolved_entities",
        source_urls: sourceUrls.slice(0, 4),
        summary: `Verified source-backed Salt evidence for supplied resolved entity ${entity}.`,
      }),
    );
  }

  return {
    remaining_follow_through: remaining,
    evidence_items: evidenceItems,
    full_request_evidence_complete:
      input.required_follow_through.length > 0 &&
      remaining.length === 0 &&
      resolvedRequiredCount === input.required_follow_through.length,
  };
}

const PUBLIC_GUIDANCE_LIMITS = {
  plan_steps: 12,
  starter_snippets: 3,
  snippet_notes: 6,
  source_urls: 6,
  review_findings: 12,
  review_fixes: 12,
  translations: 12,
  verification_checks: 8,
} as const;

function takePublicStrings(values: string[], limit: number): string[] {
  return uniqueNonEmptyStrings(values).slice(0, limit);
}

function buildPublicStarterGuidance(input: {
  plan: string[];
  snippets?: StarterCodeSnippet[];
}): PublicStarterGuidance {
  return {
    plan: takePublicStrings(input.plan, PUBLIC_GUIDANCE_LIMITS.plan_steps),
    snippets: (input.snippets ?? [])
      .filter(
        (snippet) =>
          snippet.label.trim().length > 0 && snippet.code.trim().length > 0,
      )
      .slice(0, PUBLIC_GUIDANCE_LIMITS.starter_snippets)
      .map((snippet) => ({
        label: snippet.label.trim(),
        language: snippet.language,
        code: snippet.code,
        notes: takePublicStrings(
          snippet.notes ?? [],
          PUBLIC_GUIDANCE_LIMITS.snippet_notes,
        ),
        source_urls: takePublicStrings(
          snippet.source_urls ?? [],
          PUBLIC_GUIDANCE_LIMITS.source_urls,
        ),
      })),
  };
}

function buildCreateReviewTargets(
  result: CreateSaltUiResult,
  contract: CreateSaltUiWorkflowContract,
): PublicReviewTargets {
  const composition = result.composition_contract ?? null;
  const finalName =
    contract.repo_refinement?.final_name ?? result.decision.name;
  const primaryName = composition?.primary_target.name ?? finalName;

  return {
    components: uniqueNonEmptyStrings([
      result.solution_type === "component" ? finalName : null,
      composition?.primary_target.solution_type === "component"
        ? primaryName
        : null,
      ...(composition?.expected_components ?? []),
    ]),
    patterns: uniqueNonEmptyStrings([
      result.solution_type === "pattern" ? finalName : null,
      composition?.primary_target.solution_type === "pattern"
        ? primaryName
        : null,
      ...(composition?.expected_patterns ?? []),
    ]),
    composition_contract: composition,
    source: "create_report",
  };
}

function buildCreateGuidance(
  result: CreateSaltUiResult,
  contract: CreateSaltUiWorkflowContract,
  options: PublicContractBuildOptions,
  verifiedResolvedEntities: string[] = [],
): PublicCreateGuidance {
  const composition = result.composition_contract;
  const coveredCompositionEntities = new Set<string>();
  const implementationChecklist = uniqueNonEmptyStrings([
    ...verifiedResolvedEntities.map(
      (entity) =>
        `Binding check (resolved entity): the final reviewed artifact imports and uses ${entity}.`,
    ),
    composition?.primary_target.name
      ? `Binding check (primary target): the final reviewed artifact implements ${composition.primary_target.name}.`
      : null,
    ...(composition?.slots ?? [])
      .filter((slot) => slot.certainty !== "optional")
      .map((slot) => {
        const alternatives = uniqueNonEmptyStrings([
          ...slot.preferred_patterns,
          ...slot.preferred_components,
        ]);
        for (const name of alternatives) {
          coveredCompositionEntities.add(normalizeEvidenceKey(name));
        }
        return alternatives.length > 0
          ? `Binding check (composition ${slot.label}): the final reviewed artifact includes ${alternatives.join(" or ")}.`
          : null;
      }),
    ...(composition?.expected_patterns ?? [])
      .filter(
        (name) =>
          !coveredCompositionEntities.has(normalizeEvidenceKey(name)) &&
          normalizeEvidenceKey(name) !==
            normalizeEvidenceKey(composition?.primary_target.name ?? ""),
      )
      .map(
        (name) =>
          `Binding check (expected pattern): the final reviewed artifact implements ${name}.`,
      ),
    ...(composition?.expected_components ?? [])
      .filter(
        (name) =>
          !coveredCompositionEntities.has(normalizeEvidenceKey(name)) &&
          normalizeEvidenceKey(name) !==
            normalizeEvidenceKey(composition?.primary_target.name ?? ""),
      )
      .map(
        (name) =>
          `Binding check (expected component): the final reviewed artifact imports and uses ${name}.`,
      ),
  ]);

  return {
    kind: "create",
    decision: {
      name: contract.repo_refinement?.final_name ?? result.decision.name,
      why: result.decision.why,
      solution_type: result.solution_type,
    },
    starter_guidance: buildPublicStarterGuidance({
      plan: [...implementationChecklist, ...contract.ide_summary.starter_plan],
      snippets: options.starter_code ?? result.starter_code,
    }),
    review_targets: buildCreateReviewTargets(result, contract),
  };
}

function buildReviewGuidance(
  result: ReviewSaltUiResult,
  contract: ReviewSaltUiWorkflowContract,
): PublicReviewGuidance {
  const findings = (result.issues ?? [])
    .slice(0, PUBLIC_GUIDANCE_LIMITS.review_findings)
    .map((issue, index) => {
      const title =
        readRecordString(issue, "title") ??
        readRecordString(issue, "rule") ??
        `Review finding ${index + 1}`;
      return {
        title,
        message: readRecordString(issue, "message") ?? title,
        severity: readRecordString(issue, "severity"),
        rule: readRecordString(issue, "rule"),
        source_urls: takePublicStrings(
          [
            ...readRecordStringArray(issue, "source_urls"),
            readRecordString(issue, "canonical_source") ?? "",
          ],
          PUBLIC_GUIDANCE_LIMITS.source_urls,
        ),
      };
    });
  const fixes = contract.fix_candidates.candidates
    .slice(0, PUBLIC_GUIDANCE_LIMITS.review_fixes)
    .map((candidate) => ({
      title: candidate.title,
      recommendation:
        candidate.recommendation ?? candidate.reason ?? candidate.title,
      safety: candidate.safety,
      source_urls: takePublicStrings(
        candidate.source_urls,
        PUBLIC_GUIDANCE_LIMITS.source_urls,
      ),
    }));

  return {
    kind: "review",
    findings,
    fixes,
  };
}

function buildMigrateReviewTargets(
  result: MigrateToSaltResult,
): PublicReviewTargets {
  return {
    components: uniqueNonEmptyStrings(
      result.translations.map((translation) =>
        translation.salt_target?.solution_type === "component"
          ? translation.salt_target.name
          : null,
      ),
    ),
    patterns: uniqueNonEmptyStrings(
      result.translations.map((translation) =>
        translation.salt_target?.solution_type === "pattern"
          ? translation.salt_target.name
          : null,
      ),
    ),
    composition_contract: null,
    source: "workflow_context",
  };
}

function buildMigrateGuidance(
  result: MigrateToSaltResult,
  contract: MigrateToSaltWorkflowContract,
  options: PublicContractBuildOptions,
): PublicMigrateGuidance {
  const verification = contract.post_migration_verification;
  const fallbackStarterCode =
    result.combined_scaffold && result.combined_scaffold.length > 0
      ? result.combined_scaffold
      : result.starter_code;

  return {
    kind: "migrate",
    translations: result.translations
      .filter(
        (translation) =>
          typeof translation.source_model_ref === "string" &&
          translation.source_model_ref.trim().length > 0 &&
          typeof translation.label === "string" &&
          translation.label.trim().length > 0 &&
          Boolean(translation.implementation) &&
          Boolean(translation.salt_target),
      )
      .slice(0, PUBLIC_GUIDANCE_LIMITS.translations)
      .map((translation) => ({
        source_model_ref: translation.source_model_ref,
        label: translation.label,
        implementation: {
          readiness: translation.implementation.readiness,
          next_action: translation.implementation.next_action,
          validation_step: translation.implementation.validation_step,
        },
        salt_target: {
          name: translation.salt_target.name,
          solution_type: translation.salt_target.solution_type,
          why: translation.salt_target.why,
          docs: takePublicStrings(
            translation.salt_target.docs,
            PUBLIC_GUIDANCE_LIMITS.source_urls,
          ),
        },
      })),
    migration_plan: takePublicStrings(
      result.migration_plan,
      PUBLIC_GUIDANCE_LIMITS.plan_steps,
    ),
    starter_guidance: buildPublicStarterGuidance({
      plan: contract.ide_summary.first_scaffold,
      snippets: options.starter_code ?? fallbackStarterCode,
    }),
    post_migration_verification: {
      source_checks: takePublicStrings(
        verification.source_checks,
        PUBLIC_GUIDANCE_LIMITS.verification_checks,
      ),
      runtime_checks: takePublicStrings(
        verification.runtime_checks,
        PUBLIC_GUIDANCE_LIMITS.verification_checks,
      ),
      preserve_checks: takePublicStrings(
        verification.preserve_checks,
        PUBLIC_GUIDANCE_LIMITS.verification_checks,
      ),
      confirmation_checks: takePublicStrings(
        verification.confirmation_checks,
        PUBLIC_GUIDANCE_LIMITS.verification_checks,
      ),
      suggested_workflow: verification.suggested_workflow,
      suggested_command: verification.suggested_command,
    },
    review_targets: buildMigrateReviewTargets(result),
  };
}

function buildCreateContinuationPostAction(input: {
  next_step: PublicNextStep;
  contract: CreateSaltUiWorkflowContract;
  options: PublicContractBuildOptions;
}): PublicCreateRerunPostAction | null {
  if (input.next_step.kind !== "retrieve_reference") {
    return null;
  }

  const query =
    input.options.query?.trim() || input.contract.intent.user_task.trim();
  if (!query) {
    return null;
  }

  const retrievedEntities = uniqueNonEmptyStrings([
    ...(input.options.resolved_entities ?? []),
    ...(input.next_step.kind === "retrieve_reference"
      ? input.next_step.args.names
      : []),
  ]);
  const args: PublicCreateRerunPostAction["args"] = {
    query,
    ...(input.options.package ? { package: input.options.package } : {}),
    ...(input.options.root_dir ? { root_dir: input.options.root_dir } : {}),
    ...(retrievedEntities.length > 0
      ? { resolved_entities: retrievedEntities }
      : {}),
  };

  return {
    kind: "rerun_workflow",
    tool: "create_salt_ui",
    args,
  };
}

export function buildCreatePublicContract(
  result: CreateSaltUiResult,
  contract: CreateSaltUiWorkflowContract,
  options: PublicContractBuildOptions,
): PublicContract {
  const requestMatch = options.registry
    ? deriveCreateRequestMatch(options.registry, {
        query: options.query,
        package: options.package,
        result_mode: result.mode,
        result_decision_name: result.decision.name,
        result_solution_type: result.solution_type,
      })
    : undefined;
  const exactRequest = deriveCreateExactRequest(result, options);
  const starterBlockers = buildStarterBlockers(contract.starter_validation);
  const followThroughEvidence = buildResolvedFollowThroughEvidence({
    registry: options.registry,
    required_follow_through:
      contract.implementation_gate.required_follow_through,
    resolved_entities: options.resolved_entities,
  });
  if (exactRequest && followThroughEvidence.full_request_evidence_complete) {
    exactRequest.full_request_evidence_complete = true;
  }
  const evidence = buildCreateEvidence(
    result,
    contract,
    exactRequest,
    options.registry,
    {
      remaining_follow_through: followThroughEvidence.remaining_follow_through,
      resolved_follow_through_evidence: followThroughEvidence.evidence_items,
    },
  );
  const nextStep =
    options.next_step ??
    buildCreateNextStep(
      result,
      contract,
      exactRequest,
      requestMatch?.reference,
      evidence,
      followThroughEvidence.remaining_follow_through,
      options.resolved_entities,
    );
  const projectPolicyBlockers = buildProjectPolicyBlockers({
    implementation_ready: contract.readiness.implementation_ready,
    readiness_reason: contract.readiness.reason,
    starter_blockers: starterBlockers,
  });
  const continuationPostAction = buildCreateContinuationPostAction({
    next_step: nextStep,
    contract,
    options,
  });
  const createBlockingReasons = uniqueNonEmptyStrings([
    ...(options.blocking_reasons ?? []),
    nextStep.kind === "ask_user" &&
    contract.implementation_gate.blocking_questions.length === 0
      ? nextStep.question
      : null,
  ]);

  return buildPublicContract({
    workflow: "create",
    exact_request: exactRequest,
    state: {
      implementation_ready: contract.readiness.implementation_ready,
      required_follow_through: followThroughEvidence.remaining_follow_through,
      blocking_questions: contract.implementation_gate.blocking_questions,
      starter_blockers: starterBlockers,
      project_policy_blockers: [...projectPolicyBlockers],
      hard_blocked: false,
      context_ready: contract.context_requirement.repo_specific_edits_ready,
      usable_guidance_present:
        Boolean(result.decision.name) ||
        Boolean(contract.ide_summary.recommended_direction),
      transport_failed: false,
    },
    summary: buildCreateSummary(result, exactRequest),
    next_step: nextStep,
    guidance: buildCreateGuidance(
      result,
      contract,
      options,
      followThroughEvidence.evidence_items.flatMap((item) =>
        item.entity ? [item.entity] : [],
      ),
    ),
    questions: contract.implementation_gate.blocking_questions,
    evidence,
    ...(continuationPostAction ? { post_action: continuationPostAction } : {}),
    rule_ids: contract.implementation_gate.rule_ids,
    blocking_reasons: createBlockingReasons,
  });
}

export function buildReviewPublicContract(
  result: ReviewSaltUiResult,
  contract: ReviewSaltUiWorkflowContract,
  options: PublicContractBuildOptions,
): PublicContract {
  const contextReady = options.context_checked !== false;
  const evidenceGate = buildReviewEvidenceGate(result, options.registry);
  const sourceCompletenessGaps = collectReviewSourceCompletenessGaps(result);
  const artifactImports = result.artifact_verification?.component_imports ?? [];
  const artifactEvidenceItems = artifactImports
    .filter(
      (entry) => entry.status === "verified" && entry.source_urls.length > 0,
    )
    .map((entry) =>
      buildEvidenceItem({
        kind: "registry",
        entity: entry.resolved_entity ?? entry.imported,
        field: `reviewed_artifact.imports.${entry.package}.${entry.imported}`,
        source_urls: entry.source_urls,
        summary: `The full reviewed artifact imports the source-backed Salt component ${entry.imported}.`,
      }),
    );
  const evidence = applyReviewSourceCompletenessGaps(
    applyReviewEvidenceGate(
      buildWorkflowEvidenceFromProvenance({
        provenance: contract.provenance,
        extra_items: artifactEvidenceItems,
        missing: artifactImports
          .filter((entry) => entry.status === "unsupported")
          .map(
            (entry) =>
              `registry evidence for reviewed Salt import ${entry.imported} from ${entry.package}`,
          ),
      }),
      evidenceGate,
    ),
    sourceCompletenessGaps,
  );
  const implementationReady =
    contextReady &&
    contract.decision.status === "clean" &&
    countProjectPolicyFixCandidates(contract.fix_candidates.candidates) === 0 &&
    sourceCompletenessGaps.length === 0;
  const nextStep = !contextReady
    ? toFixContextStep("get_salt_project_context", options.root_dir)
    : (options.next_step ??
      (sourceCompletenessGaps.length > 0
        ? buildReviewSourceResubmissionStep()
        : buildReviewNextStep(result, contract, evidence, {
            can_complete:
              implementationReady &&
              evidence.status === "complete" &&
              hasSourceBackedEvidence(evidence),
          })));

  return buildPublicContract({
    workflow: "review",
    exact_request: options.exact_request,
    state: {
      implementation_ready: implementationReady,
      required_follow_through: [],
      blocking_questions: [],
      starter_blockers: [],
      project_policy_blockers: [],
      hard_blocked:
        nextStep.kind !== "apply_fixes" &&
        (contract.decision.status === "needs_attention" ||
          sourceCompletenessGaps.length > 0),
      context_ready: contextReady,
      usable_guidance_present: true,
      transport_failed: false,
    },
    summary: !contextReady
      ? "Salt review requires loaded project context before repo-specific guidance can be trusted."
      : sourceCompletenessGaps.length > 0
        ? "Salt review could not verify the complete source; submit full parseable changed-file contents and rerun."
        : contract.decision.status === "clean"
          ? "Salt semantic review found no issues blocking the reviewed scope. This is not a TypeScript compile; run the repo typecheck and verification commands before completion."
          : "Salt review found issues that still need attention.",
    next_step: nextStep,
    guidance: buildReviewGuidance(result, contract),
    evidence,
    internal_limitations: deriveReviewInternalLimitations(
      evidenceGate,
      result.unsupported_rule_kinds,
    ),
    rule_ids:
      nextStep.kind === "apply_fixes"
        ? [
            ...contract.rule_ids,
            ...contract.fix_candidates.candidates
              .filter(isGroundedReviewFixCandidate)
              .map((candidate) => candidate.rule_id)
              .filter((ruleId): ruleId is string => Boolean(ruleId?.trim())),
          ]
        : contract.rule_ids,
    blocking_reasons: uniqueNonEmptyStrings([
      ...(options.blocking_reasons ??
        buildReviewBlockingReasons(contract, result)),
      ...sourceCompletenessGaps,
    ]),
  });
}

export function buildMigratePublicContract(
  result: MigrateToSaltResult,
  contract: MigrateToSaltWorkflowContract,
  options: PublicContractBuildOptions,
): PublicContract {
  const starterBlockers = buildStarterBlockers(contract.starter_validation);
  const projectPolicyBlockers = buildProjectPolicyBlockers({
    implementation_ready: contract.readiness.implementation_ready,
    readiness_reason: contract.readiness.reason,
    starter_blockers: starterBlockers,
  });
  const evidence = buildWorkflowEvidenceFromProvenance({
    provenance: contract.provenance,
    input_context: buildMigrateEvidenceInputContext(contract),
  });
  const blockingQuestions = filterMigrateBlockingQuestions(
    result.clarifying_questions,
    contract,
  );
  const nextStep =
    options.next_step ??
    buildMigrateNextStep(result, contract, blockingQuestions, evidence);

  return buildPublicContract({
    workflow: "migrate",
    exact_request: options.exact_request,
    state: {
      implementation_ready: contract.readiness.implementation_ready,
      required_follow_through: [],
      blocking_questions: blockingQuestions,
      starter_blockers: starterBlockers,
      project_policy_blockers: projectPolicyBlockers,
      hard_blocked: false,
      context_ready: contract.context_requirement.repo_specific_edits_ready,
      usable_guidance_present:
        result.translations.length > 0 || result.migration_plan.length > 0,
      transport_failed: false,
    },
    summary:
      result.translations.length > 0
        ? "Salt produced a migration direction for the requested source UI."
        : "Salt produced migration guidance, but more clarification is still needed.",
    next_step: nextStep,
    guidance: buildMigrateGuidance(result, contract, options),
    questions: blockingQuestions,
    evidence,
    rule_ids: contract.rule_ids,
    blocking_reasons:
      options.blocking_reasons ??
      buildMigrateBlockingReasons(
        contract,
        result,
        starterBlockers,
        projectPolicyBlockers,
        blockingQuestions,
      ),
  });
}
