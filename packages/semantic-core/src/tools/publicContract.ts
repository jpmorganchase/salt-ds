import {
  type SerializedGeneratedSaltArtifactSurfaceGate,
  serializeGeneratedSaltArtifactSurfaceGate,
} from "../generatedArtifactSurface.js";
import {
  buildReviewReportEvidenceGate,
  type ReviewReportEvidenceGate,
} from "../reviewReportArtifacts.js";
import type { SaltRegistry } from "../types.js";
import {
  type CreateRequestMatch,
  deriveCreateRequestMatch,
} from "./createResolve.js";
import type { CreateSaltUiResult } from "./createSaltUi.js";
import { appendProjectConventionsCheckNextStep } from "./guidanceBoundary.js";
import type { MigrateToSaltResult } from "./migrateToSalt.js";
import type { ReviewSaltUiResult } from "./reviewSaltUi.js";
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
    | "migrate_to_salt";
  mode: PublicNextStepMode;
  args: Record<string, unknown>;
};

export type PublicRetrieveEntityStep = PublicActionHints & {
  kind: "retrieve_entity";
  tool: "get_salt_reference" | "create_salt_ui";
  args: Record<string, unknown>;
};

export type PublicRetrieveExamplesStep = PublicActionHints & {
  kind: "retrieve_examples";
  tool: "get_salt_reference" | "create_salt_ui";
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
  tool: "create_salt_ui" | "review_salt_ui" | "migrate_to_salt";
  args: Record<string, unknown>;
};

export type PublicFixContextStep = PublicActionHints & {
  kind: "fix_context";
  tool: "get_salt_project_context";
  mode: "stop_and_fix_context";
  args?: Record<string, unknown>;
};

export type PublicNextStep =
  | PublicToolCallStep
  | PublicRetrieveEntityStep
  | PublicRetrieveExamplesStep
  | PublicAskUserStep
  | PublicInstallDependenciesStep
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

function readStringValue(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

function normalizeEvidenceKey(value: string): string {
  return value.trim().toLowerCase();
}

function quoteCliArgument(value: string): string {
  return /^[A-Za-z0-9@._/:-]+$/.test(value) ? value : JSON.stringify(value);
}

function appendJsonFlag(command: string): string {
  return /\s--json(\s|$)/.test(command) ? command : `${command} --json`;
}

function buildPackageInstallCommand(
  packageManager: string,
  packages: string[],
): string {
  const quotedPackages = packages.map(quoteCliArgument).join(" ");
  if (/^yarn\b/i.test(packageManager)) {
    return `yarn add ${quotedPackages}`;
  }
  if (/^pnpm\b/i.test(packageManager)) {
    return `pnpm add ${quotedPackages}`;
  }
  return `npm install ${quotedPackages}`;
}

function buildToolCallCliHint(step: PublicToolCallStep): string | null {
  // Salt public v1 is MCP-first. Action hints surface the `mcp` shape only.
  switch (step.tool) {
    case "get_salt_project_context":
    case "create_salt_ui":
    case "review_salt_ui":
    case "migrate_to_salt":
      return null;
  }
}

function buildRetrieveEntityCliHint(
  _step: PublicRetrieveEntityStep,
): string | null {
  // Reference lookup and the upstream `create_salt_ui` fall-back are both
  // MCP-only after the workflow CLI removal; no CLI hint is emitted.
  return null;
}

function buildRetrieveExamplesCliHint(
  _step: PublicRetrieveExamplesStep,
): string | null {
  // Reference examples and the upstream `create_salt_ui` fall-back are both
  // MCP-only after the workflow CLI removal; no CLI hint is emitted.
  return null;
}

function buildReviewCliHint(_step: PublicReviewStep): string | null {
  // Review-after-implementation guidance flows through the
  // `review_salt_ui` MCP tool surfaced in action.mcp.
  return null;
}

function buildRerunWorkflowCliHint(
  _step: PublicRerunWorkflowStep,
): string | null {
  // The workflow CLI commands were removed; reruns are always MCP-side
  // and surfaced through action.mcp on the returned PublicNextStep.
  return null;
}

function buildPublicActionHints(step: PublicNextStep): PublicActionHints {
  switch (step.kind) {
    case "tool_call": {
      const cli = buildToolCallCliHint(step);
      return {
        ...(cli ? { cli } : {}),
        mcp: {
          tool: step.tool,
          args: step.args,
        },
      };
    }
    case "retrieve_entity": {
      const cli = buildRetrieveEntityCliHint(step);
      return {
        ...(cli ? { cli } : {}),
        mcp: {
          tool: step.tool,
          args: step.args,
        },
      };
    }
    case "retrieve_examples": {
      const cli = buildRetrieveExamplesCliHint(step);
      return {
        ...(cli ? { cli } : {}),
        mcp: {
          tool: step.tool,
          args: step.args,
        },
      };
    }
    case "install_dependencies":
      return {
        cli: buildPackageInstallCommand(step.package_manager, step.packages),
      };
    case "review": {
      const cli = buildReviewCliHint(step);
      return {
        ...(cli ? { cli } : {}),
        mcp: {
          tool: "review_salt_ui",
          args: step.args ?? {},
        },
      };
    }
    case "rerun_workflow": {
      const cli = buildRerunWorkflowCliHint(step);
      return {
        ...(cli ? { cli } : {}),
        mcp: {
          tool: step.tool,
          args: step.args,
        },
      };
    }
    case "fix_context":
      return {
        mcp: {
          tool: "get_salt_project_context",
          args: step.args ?? {},
        },
      };
    case "ask_user":
    case "implement":
    case "complete":
      return {};
  }
}

function addPublicActionHints(step: PublicNextStep): PublicNextStep {
  const hints = buildPublicActionHints(step);
  return {
    ...step,
    ...(hints.cli ? { cli: hints.cli } : {}),
    ...(hints.mcp ? { mcp: hints.mcp } : {}),
  } as PublicNextStep;
}

function addPublicRecipeHints(recipe: PublicRecipe): PublicRecipe {
  return {
    steps: recipe.steps.map((step) => ({
      ...step,
      action: addPublicActionHints(step.action),
    })),
  };
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
    input.next_step.kind === "install_dependencies" ||
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

function deriveAllowedNextActions(
  input: PublicContractInput,
): PublicActionKind[] {
  return [
    input.next_step.kind,
    ...input.state.required_follow_through.map(
      () => "retrieve_entity" as const,
    ),
    ...(input.state.blocking_questions.length > 0
      ? (["ask_user"] as const)
      : []),
    ...(input.workflow === "create" &&
    input.next_step.kind !== "implement" &&
    input.next_step.kind !== "ask_user"
      ? (["rerun_workflow"] as const)
      : []),
    ...(input.next_step.kind === "implement" ? (["review"] as const) : []),
  ].filter(
    (kind, index, all): kind is PublicActionKind => all.indexOf(kind) === index,
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
  const nextRequiredAction = contract.next_required_action;
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

  if (action.kind !== "implement" && action.post_action) {
    errors.push(
      "action.post_action must only appear when action.kind=implement",
    );
  }

  if (nextRequiredAction.kind !== action.kind) {
    errors.push("next_required_action.kind must match action.kind");
  }

  if (!contract.allowed_next_actions.includes(action.kind)) {
    errors.push("allowed_next_actions must include action.kind");
  }

  if (
    contract.questions.length > 0 &&
    !["ask_user", "fix_context", "install_dependencies"].includes(
      action.kind,
    ) &&
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

  if (contract.recipe.steps.length === 0) {
    errors.push("recipe.steps must include at least the next required action");
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
  const nextStep = addPublicActionHints(input.next_step);
  const allowedNextActions =
    input.allowed_next_actions ?? deriveAllowedNextActions(input);
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
    nextStep.kind === "implement" && input.workflow !== "review"
      ? ({
          kind: "review",
          tool: "review_salt_ui",
          ...buildPublicActionHints({
            kind: "review",
            tool: "review_salt_ui",
          }),
        } satisfies PublicPostAction)
      : null;

  const contract: PublicContract = {
    contract: PUBLIC_WORKFLOW_CONTRACT_VERSION,
    workflow: input.workflow,
    transport: input.transport_used,
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
    next_required_action: nextStep,
    allowed_next_actions: allowedNextActions,
    recipe: addPublicRecipeHints(
      input.recipe ?? {
        steps: [
          {
            id: "next-required-action",
            action: input.next_step,
            status: "required",
          },
        ],
      },
    ),
    questions,
    evidence,
    internal_limitations: normalizeInternalLimitations(
      input.internal_limitations,
    ),
    summary: input.summary.trim(),
    ...(input.truncated ? { truncated: true } : {}),
    ...(input.available_expansions?.length
      ? { available_expansions: [...input.available_expansions] }
      : {}),
    ...(typeof input.full_output_bytes === "number"
      ? { full_output_bytes: input.full_output_bytes }
      : {}),
  };

  assertValidPublicContract(contract);
  return contract;
}

export function attachPublicContractDetails<TDetails>(
  contract: PublicContract,
  details: TDetails,
): PublicWorkflowDetailsEnvelope<TDetails> {
  return {
    ...contract,
    details,
  };
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

function buildCreateNextStep(
  contract: CreateSaltUiWorkflowContract,
  exactRequest?: PublicContractExactRequest,
  reference?: CreateRequestMatch["reference"],
  dependencyStep?: PublicInstallDependenciesStep | null,
  evidence?: PublicEvidenceSummary,
  requiredFollowThrough: FollowThroughItem[] = contract.implementation_gate
    .required_follow_through,
): PublicNextStep {
  if (dependencyStep) {
    return dependencyStep;
  }

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
    return {
      kind: "retrieve_entity",
      tool: "get_salt_reference",
      args: {
        kind: "entity",
        names: [requiredFollowThrough[0].entity],
      },
    };
  }

  if (
    reference?.requested_target.name &&
    exactRequest?.match_status &&
    !isExactRequestSafe(exactRequest)
  ) {
    return {
      kind: "retrieve_entity",
      tool: "get_salt_reference",
      args: {
        kind: "entity",
        names: [reference.requested_target.name],
      },
    };
  }

  if (evidence && evidence.status !== "complete") {
    if (exactRequest?.resolved_entity) {
      return {
        kind: "retrieve_entity",
        tool: "get_salt_reference",
        args: {
          kind: "entity",
          names: [exactRequest.resolved_entity],
        },
      };
    }

    return {
      kind: "retrieve_examples",
      tool: "get_salt_reference",
      args: { kind: "examples" },
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

  return {
    kind: "tool_call",
    tool: "review_salt_ui",
    mode: "broad_query",
    args: {},
  };
}

function buildReviewNextStep(
  result: ReviewSaltUiResult,
  contract: ReviewSaltUiWorkflowContract,
  options?: { can_complete: boolean },
): PublicNextStep {
  if (options?.can_complete) {
    return {
      kind: "complete",
      outcome: "no_changes_required",
    };
  }

  const topFixCandidate = contract.fix_candidates.candidates[0];
  if (topFixCandidate?.recommendation) {
    return {
      kind: "ask_user",
      question: topFixCandidate.recommendation,
    };
  }

  const nextStep = appendProjectConventionsCheckNextStep(
    result.next_step ?? contract.ide_summary.safest_next_fix ?? undefined,
    contract.project_conventions_check,
  );

  return {
    kind: "review",
    tool: "review_salt_ui",
    args: {
      next_step: nextStep ?? null,
    },
  };
}

function buildMigrateNextStep(
  result: MigrateToSaltResult,
  contract: MigrateToSaltWorkflowContract,
  blockingQuestions: string[] = result.clarifying_questions ?? [],
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

  if (contract.readiness.implementation_ready) {
    return {
      kind: "review",
      tool: "review_salt_ui",
      args: {
        suggested_command:
          contract.post_migration_verification.suggested_command,
      },
    };
  }

  return {
    kind: "tool_call",
    tool: "migrate_to_salt",
    mode: "broad_query",
    args: {},
  };
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
  const collections: unknown[][] = [
    registry.components,
    registry.patterns,
    registry.pages,
    registry.guides,
    registry.tokens,
  ];

  for (const collection of collections) {
    const record = collection
      .map((entry) => readRecord(entry))
      .find(
        (entry) => readEntityName(entry)?.toLowerCase() === normalizedEntity,
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
      name: "semantic-core.review-public-contract",
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

  // Task 2.9 / root cause #2: only true validator failures degrade the
  // workflow status. Registry coverage gaps (unsupported_claim_count > 0)
  // are surfaced via the top-level internal_limitations block instead so
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
): PublicInternalLimitations {
  if (!gate) {
    return {
      unsupported_claim_count: 0,
      unsupported_rule_kinds: [],
    };
  }

  const unsupportedClaims = gate.artifact.unsupported_claims ?? [];
  const ruleKinds = [
    ...new Set(unsupportedClaims.map((claim) => claim.kind as string)),
  ].sort();

  return {
    unsupported_claim_count: gate.unsupported_claim_count,
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

function buildCreateDependencyStep(input: {
  salt_packages?: string[];
  package_manager?: string;
  result: CreateSaltUiResult;
}): PublicInstallDependenciesStep | null {
  if (!input.salt_packages || input.salt_packages.length > 0) {
    return null;
  }

  const recommendedPackage = readRecord(input.result.recommended)?.package;
  const packageName = readRecordString(recommendedPackage, "name");

  return {
    kind: "install_dependencies",
    package_manager: input.package_manager ?? "npm",
    packages: uniqueNonEmptyStrings([
      "@salt-ds/core",
      packageName,
      "@salt-ds/theme",
    ]),
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
  const resolvedEntityKeys = new Set(
    (input.resolved_entities ?? []).map(normalizeEvidenceKey),
  );
  const remaining: FollowThroughItem[] = [];
  const evidenceItems: PublicEvidenceItem[] = [];

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
  }

  return {
    remaining_follow_through: remaining,
    evidence_items: evidenceItems,
    full_request_evidence_complete:
      input.required_follow_through.length > 0 &&
      remaining.length === 0 &&
      evidenceItems.length === input.required_follow_through.length,
  };
}

function buildCreateRerunWorkflowStep(input: {
  query?: string;
  result: CreateSaltUiResult;
  resolved_entities: string[];
}): PublicRerunWorkflowStep {
  const query = input.query?.trim() || input.result.decision.name;
  const args: Record<string, unknown> = {
    query,
  };
  const resolvedEntities = uniqueNonEmptyStrings(input.resolved_entities);

  if (resolvedEntities.length > 0) {
    args.resolved_entities = resolvedEntities;
  }

  return {
    kind: "rerun_workflow",
    tool: "create_salt_ui",
    args,
  };
}

function buildCreateRecipe(input: {
  next_step: PublicNextStep;
  contract: CreateSaltUiWorkflowContract;
  rerun_step: PublicRerunWorkflowStep;
  evidence: PublicEvidenceSummary;
  dependency_step: PublicInstallDependenciesStep | null;
  remaining_follow_through: FollowThroughItem[];
  resolved_follow_through: FollowThroughItem[];
}): PublicRecipe {
  const steps: PublicRecipeStep[] = [];
  const rerunCreateAfterAction =
    "After completing this action, rerun the original create workflow and wait for status=success with action.kind=implement before editing.";
  const pushStep = (
    id: string,
    action: PublicNextStep,
    reason?: string,
    status?: PublicRecipeStep["status"],
  ) => {
    if (steps.some((step) => step.id === id)) {
      return;
    }

    steps.push({
      id,
      action,
      status:
        status ??
        (action.kind === input.next_step.kind ? "required" : "available"),
      evidence_required:
        action.kind === "implement" ? input.evidence.missing : undefined,
      ...(reason ? { reason } : {}),
    });
  };

  if (input.dependency_step) {
    pushStep(
      "install-salt-dependencies",
      input.dependency_step,
      `Salt packages are not installed in the target repo yet. ${rerunCreateAfterAction}`,
    );
  }

  for (const followThrough of input.remaining_follow_through) {
    const resolvedEntityRerun = `After retrieving ${followThrough.entity}, rerun the original create workflow with resolved_entities including ${followThrough.entity} (CLI: add --resolved-entity ${quoteCliArgument(followThrough.entity)}) and wait for status=success with action.kind=implement before editing.`;
    pushStep(
      `retrieve-${followThrough.entity.toLowerCase().replace(/\s+/g, "-")}`,
      {
        kind: "retrieve_entity",
        tool: "get_salt_reference",
        args: {
          kind: "entity",
          names: [followThrough.entity],
        },
      },
      `Ground ${followThrough.entity} before implementing the ${followThrough.region} region. ${resolvedEntityRerun}`,
    );
  }

  for (const followThrough of input.resolved_follow_through) {
    pushStep(
      `resolved-${followThrough.entity.toLowerCase().replace(/\s+/g, "-")}`,
      {
        kind: "retrieve_entity",
        tool: "get_salt_reference",
        args: {
          kind: "entity",
          names: [followThrough.entity],
        },
      },
      `Canonical evidence for ${followThrough.entity} has been supplied for the ${followThrough.region} region.`,
      "complete",
    );
  }

  for (const [
    index,
    question,
  ] of input.contract.implementation_gate.blocking_questions.entries()) {
    pushStep(
      `ask-user-${index + 1}`,
      { kind: "ask_user", question },
      "Ask this blocking question and stop. Treat the user's answer as new or updated workflow input before calling create again; do not rerun the original workflow unchanged.",
    );
  }

  pushStep(
    "next-required-action",
    input.next_step,
    input.next_step.kind === "implement" ? undefined : rerunCreateAfterAction,
  );

  if (
    input.next_step.kind === "install_dependencies" ||
    input.next_step.kind === "retrieve_entity" ||
    input.next_step.kind === "retrieve_examples" ||
    input.next_step.kind === "fix_context" ||
    input.next_step.kind === "tool_call"
  ) {
    pushStep(
      "rerun-originating-create-workflow",
      input.rerun_step,
      "After the required follow-up actions are complete, rerun this original create workflow with the returned evidence bridge. Do not edit until the rerun returns status=success, action.kind=implement, and evidence.status=complete.",
      "required",
    );
  }

  if (input.next_step.kind === "implement") {
    pushStep("review-after-implementation", {
      kind: "review",
      tool: "review_salt_ui",
    });
  }

  return { steps };
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
  const dependencyStep = buildCreateDependencyStep({
    salt_packages: options.salt_packages,
    package_manager: options.package_manager,
    result,
  });
  const followThroughEvidence = buildResolvedFollowThroughEvidence({
    registry: options.registry,
    required_follow_through:
      contract.implementation_gate.required_follow_through,
    resolved_entities: options.resolved_entities,
  });
  const resolvedFollowThrough =
    contract.implementation_gate.required_follow_through.filter(
      (followThrough) =>
        !followThroughEvidence.remaining_follow_through.some(
          (remaining) =>
            normalizeEvidenceKey(remaining.entity) ===
            normalizeEvidenceKey(followThrough.entity),
        ),
    );
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
      contract,
      exactRequest,
      requestMatch?.reference,
      dependencyStep,
      evidence,
      followThroughEvidence.remaining_follow_through,
    );
  const rerunStep = buildCreateRerunWorkflowStep({
    query: options.query,
    result,
    resolved_entities: [
      ...(options.resolved_entities ?? []),
      ...followThroughEvidence.remaining_follow_through.map(
        (followThrough) => followThrough.entity,
      ),
    ],
  });
  const projectPolicyBlockers = buildProjectPolicyBlockers({
    implementation_ready: contract.readiness.implementation_ready,
    readiness_reason: contract.readiness.reason,
    starter_blockers: starterBlockers,
  });
  const dependencyBlockers = dependencyStep
    ? [
        `Salt packages are not installed; install ${dependencyStep.packages.join(", ")} before implementing Salt UI.`,
      ]
    : [];

  return buildPublicContract({
    workflow: "create",
    transport_used: options.transport_used,
    exact_request: exactRequest,
    state: {
      implementation_ready: contract.readiness.implementation_ready,
      required_follow_through: followThroughEvidence.remaining_follow_through,
      blocking_questions: contract.implementation_gate.blocking_questions,
      starter_blockers: starterBlockers,
      project_policy_blockers: [
        ...projectPolicyBlockers,
        ...dependencyBlockers,
      ],
      hard_blocked: false,
      context_ready: contract.context_requirement.repo_specific_edits_ready,
      usable_guidance_present:
        Boolean(result.decision.name) ||
        Boolean(contract.ide_summary.recommended_direction),
      transport_failed: false,
    },
    summary: buildCreateSummary(result, exactRequest),
    next_step: nextStep,
    questions: contract.implementation_gate.blocking_questions,
    evidence,
    recipe: buildCreateRecipe({
      next_step: nextStep,
      contract,
      rerun_step: rerunStep,
      evidence,
      dependency_step: dependencyStep,
      remaining_follow_through: followThroughEvidence.remaining_follow_through,
      resolved_follow_through: resolvedFollowThrough,
    }),
    rule_ids: contract.implementation_gate.rule_ids,
    blocking_reasons: options.blocking_reasons,
  });
}

export function buildReviewPublicContract(
  result: ReviewSaltUiResult,
  contract: ReviewSaltUiWorkflowContract,
  options: PublicContractBuildOptions,
): PublicContract {
  const evidenceGate = buildReviewEvidenceGate(result, options.registry);
  const evidence = applyReviewEvidenceGate(
    buildWorkflowEvidenceFromProvenance({
      provenance: contract.provenance,
    }),
    evidenceGate,
  );
  const implementationReady =
    contract.decision.status === "clean" &&
    countProjectPolicyFixCandidates(contract.fix_candidates.candidates) === 0;
  const nextStep =
    options.next_step ??
    buildReviewNextStep(result, contract, {
      can_complete:
        implementationReady &&
        evidence.status === "complete" &&
        hasSourceBackedEvidence(evidence),
    });

  return buildPublicContract({
    workflow: "review",
    transport_used: options.transport_used,
    exact_request: options.exact_request,
    state: {
      implementation_ready: implementationReady,
      required_follow_through: [],
      blocking_questions: [],
      starter_blockers: [],
      project_policy_blockers: [],
      hard_blocked: contract.decision.status === "needs_attention",
      context_ready: true,
      usable_guidance_present: true,
      transport_failed: false,
    },
    summary:
      contract.decision.status === "clean"
        ? "Salt review found no issues blocking the reviewed scope."
        : "Salt review found issues that still need attention.",
    next_step: nextStep,
    evidence,
    internal_limitations: deriveReviewInternalLimitations(evidenceGate),
    rule_ids: contract.rule_ids,
    blocking_reasons:
      options.blocking_reasons ?? buildReviewBlockingReasons(contract, result),
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
    buildMigrateNextStep(result, contract, blockingQuestions);

  return buildPublicContract({
    workflow: "migrate",
    transport_used: options.transport_used,
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
