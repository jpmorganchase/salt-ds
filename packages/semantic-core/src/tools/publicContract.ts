import {
  ENGLISH_FUNCTION_WORDS,
  REGISTRY_META_WORDS,
} from "../search/englishFunctionWords.js";
import type { ComponentRecord, PatternRecord, SaltRegistry } from "../types.js";
import { resolveComponentTarget } from "./componentLookup.js";
import type { CreateSaltUiResult } from "./createSaltUi.js";
import type { MigrateToSaltResult } from "./migrateToSalt.js";
import { resolvePatternTarget } from "./patternLookup.js";
import type { ReviewSaltUiResult } from "./reviewSaltUi.js";
import type { UpgradeSaltUiResult } from "./upgradeSaltUi.js";
import { isComponentAllowedByDocsPolicy, tokenize } from "./utils.js";
import type {
  CreateSaltUiWorkflowContract,
  FollowThroughItem,
  MigrateToSaltWorkflowContract,
  ReviewSaltUiWorkflowContract,
  UpgradeSaltUiWorkflowContract,
  WorkflowFixCandidate,
  WorkflowStarterValidation,
} from "./workflowContracts.js";

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

export type PublicToolCallStep = {
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

export type PublicAskUserStep = {
  kind: "ask_user";
  question: string;
};

export type PublicImplementStep = {
  kind: "implement";
  scope: "exact_request";
};

export type PublicReviewStep = {
  kind: "review";
  tool: "review_salt_ui" | "salt-ds review";
  args?: Record<string, unknown>;
};

export type PublicFixContextStep = {
  kind: "fix_context";
  tool: "get_salt_project_context" | "salt-ds info";
  mode: "stop_and_fix_context";
  args?: Record<string, unknown>;
};

export type PublicNextStep =
  | PublicToolCallStep
  | PublicAskUserStep
  | PublicImplementStep
  | PublicReviewStep
  | PublicFixContextStep;

export const PUBLIC_WORKFLOW_CONTRACT_VERSION = "salt_workflow_v3";

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

export interface PublicPostAction {
  kind: "review";
  tool: "review_salt_ui" | "salt-ds review";
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
  summary: string;
  truncated?: boolean;
  available_expansions?: string[];
  full_output_bytes?: number;
}

export interface PublicWorkflowDetailsEnvelope<TDetails> extends PublicContract {
  details: TDetails;
}

export interface PublicContractExactRequest {
  requested_entity?: string;
  resolved_entity?: string | null;
  match_status?: PublicMatchStatus;
  exact_match_required?: boolean;
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
  summary: string;
  next_step: PublicNextStep;
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

  if (
    hasExactRequest(exactRequest) &&
    !isMatchSafe(exactRequest.match_status)
  ) {
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

  if (
    hasExactRequest(exactRequest) &&
    !isMatchSafe(exactRequest.match_status)
  ) {
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
    shouldBlockOnSemanticMismatch(input.exact_request)
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

  if (
    safety.exact_request_safe &&
    contract.status !== "success"
  ) {
    errors.push(
      "safety.exact_request_safe=true requires status=success",
    );
  }

  if (contract.status === "success" && !safety.exact_request_safe) {
    errors.push("status=success requires safety.exact_request_safe=true");
  }

  if (contract.status === "blocked" && safety.blocking_reasons.length === 0) {
    errors.push("status=blocked requires at least one blocking reason");
  }

  if ((contract.status === "partial" || contract.status === "blocked") && !action) {
    errors.push("non-success contract requires action");
  }

  if (
    request.match_status === "misrouted" &&
    safety.exact_request_safe
  ) {
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
    errors.push("request.entity or request.resolved_entity requires request.match_status");
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
  const requestedEntity = input.exact_request?.requested_entity?.trim();
  const resolvedEntity =
    input.exact_request?.resolved_entity === null
      ? null
      : input.exact_request?.resolved_entity?.trim();
  const postAction: PublicPostAction | null =
    input.next_step.kind === "implement" && input.workflow !== "review"
      ? {
          kind: "review",
          tool:
            input.transport_used === "cli"
              ? "salt-ds review"
              : "review_salt_ui",
        }
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
    },
    safety: {
      canonical_complete: canonicalComplete,
      exact_request_safe: safeToImplementExactRequest,
      blocking_reasons: blockingReasons,
    },
    action: {
      ...input.next_step,
      rule_ids: uniqueNonEmptyStrings(input.rule_ids ?? []),
      post_action: postAction,
    },
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

type CreateNamedTarget = {
  entity_type: "component" | "pattern";
  name: string;
  matched_by: string[];
  categories: string[];
  related_names: string[];
  lookup_keys: string[];
};

type CreateTargetReferenceKind = "exact" | "alias" | "descriptive";

type CreateTargetReference = {
  requested_entity: string;
  requested_target: CreateNamedTarget;
  reference_kind: CreateTargetReferenceKind;
};

/**
 * Filter tokens to only those carrying meaningful information.
 *
 * Uses shared static sets to remove:
 * 1. English function words (a, an, the, etc.)
 * 2. Registry meta words (component, pattern, salt, etc.)
 */
function getMeaningfulTokens(value: string): string[] {
  return uniqueNonEmptyStrings(
    tokenize(value).flatMap((token) => token.split("-")),
  ).filter((token) => {
    if (token.length <= 2) {
      return false;
    }
    if (ENGLISH_FUNCTION_WORDS.has(token)) {
      return false;
    }
    if (REGISTRY_META_WORDS.has(token)) {
      return false;
    }
    return true;
  });
}

function getPatternRouteSlug(route: string | null): string | null {
  if (!route) {
    return null;
  }

  const parts = route.split("/").filter((part) => part.length > 0);
  return parts.at(-1) ?? null;
}

function normalizeCreateLookupKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function containsLookupKey(queryKey: string, lookupKey: string): boolean {
  if (!queryKey || !lookupKey) {
    return false;
  }

  if (queryKey === lookupKey) {
    return true;
  }

  let currentIndex = queryKey.indexOf(lookupKey);
  while (currentIndex !== -1) {
    const beforeIndex = currentIndex - 1;
    const afterIndex = currentIndex + lookupKey.length;
    const startsAtBoundary = beforeIndex < 0 || queryKey[beforeIndex] === "-";
    const endsAtBoundary =
      afterIndex >= queryKey.length || queryKey[afterIndex] === "-";

    if (startsAtBoundary && endsAtBoundary) {
      return true;
    }

    currentIndex = queryKey.indexOf(lookupKey, currentIndex + 1);
  }

  return false;
}

function buildCreateNamedTargetFromComponent(
  component: ComponentRecord,
  matched_by: string[] = ["name"],
): CreateNamedTarget {
  return {
    entity_type: "component",
    name: component.name,
    matched_by,
    categories: [...component.category],
    related_names: [...component.patterns],
    lookup_keys: uniqueNonEmptyStrings([component.name, ...component.aliases]),
  };
}

function buildCreateNamedTargetFromPattern(
  pattern: PatternRecord,
  matched_by: string[] = ["name"],
): CreateNamedTarget {
  const routeSlug = getPatternRouteSlug(pattern.related_docs.overview);

  return {
    entity_type: "pattern",
    name: pattern.name,
    matched_by,
    categories: [...(pattern.category ?? [])],
    related_names: [...pattern.related_patterns],
    lookup_keys: uniqueNonEmptyStrings([
      pattern.name,
      ...pattern.aliases,
      routeSlug,
    ]),
  };
}

function listCreateNamedTargets(
  registry: SaltRegistry,
  packageName?: string,
): CreateNamedTarget[] {
  return [
    ...registry.components
      .filter((component) => isComponentAllowedByDocsPolicy(component))
      .filter((component) =>
        packageName ? component.package.name === packageName : true,
      )
      .map((component) => buildCreateNamedTargetFromComponent(component)),
    ...registry.patterns.map((pattern) =>
      buildCreateNamedTargetFromPattern(pattern),
    ),
  ];
}

function inferDescriptiveCreateTarget(
  registry: SaltRegistry,
  query: string,
  packageName?: string,
): CreateNamedTarget | null {
  const queryKey = normalizeCreateLookupKey(query);
  const queryTokens = getMeaningfulTokens(query);
  const queryTokenPositions = new Map<string, number>();

  queryTokens.forEach((token, index) => {
    if (!queryTokenPositions.has(token)) {
      queryTokenPositions.set(token, index);
    }
  });

  const scoredTargets = listCreateNamedTargets(registry, packageName)
    .map((target) => {
      const canonicalKey = normalizeCreateLookupKey(target.name);
      const aliasKeys = target.lookup_keys
        .map((entry) => normalizeCreateLookupKey(entry))
        .filter((entry) => entry !== canonicalKey);
      const hasCanonicalPhraseMatch = containsLookupKey(queryKey, canonicalKey);
      const aliasPhraseMatchKey =
        aliasKeys.find((entry) => containsLookupKey(queryKey, entry)) ?? null;
      const matchedTokens = getMeaningfulTokens(target.name).filter((token) =>
        queryTokenPositions.has(token),
      );

      if (
        !hasCanonicalPhraseMatch &&
        aliasPhraseMatchKey === null &&
        matchedTokens.length === 0
      ) {
        return null;
      }

      const firstMatchedPosition = matchedTokens.reduce(
        (lowest, token) =>
          Math.min(
            lowest,
            queryTokenPositions.get(token) ?? Number.MAX_SAFE_INTEGER,
          ),
        Number.MAX_SAFE_INTEGER,
      );
      const phraseScore = hasCanonicalPhraseMatch
        ? 500 + canonicalKey.split("-").length * 20
        : aliasPhraseMatchKey
          ? 420 + aliasPhraseMatchKey.split("-").length * 15
          : 0;
      const tokenScore = matchedTokens.length * 40;
      const positionScore =
        firstMatchedPosition === Number.MAX_SAFE_INTEGER
          ? 0
          : Math.max(0, 20 - firstMatchedPosition);

      return {
        target,
        score: phraseScore + tokenScore + positionScore,
      };
    })
    .filter(
      (entry): entry is { target: CreateNamedTarget; score: number } =>
        entry !== null,
    )
    .sort((left, right) => right.score - left.score);

  if (scoredTargets.length === 0) {
    return null;
  }

  if (scoredTargets[1] && scoredTargets[0].score === scoredTargets[1].score) {
    return null;
  }

  return scoredTargets[0].target;
}

function sharesPrimaryCreateCategory(
  left: CreateNamedTarget,
  right: CreateNamedTarget,
): boolean {
  const leftPrimaryCategory = left.categories[0] ?? null;
  const rightPrimaryCategory = right.categories[0] ?? null;

  return (
    leftPrimaryCategory !== null && leftPrimaryCategory === rightPrimaryCategory
  );
}

function sharesMeaningfulTargetTokens(
  leftName: string,
  rightName: string,
): boolean {
  const leftTokens = new Set(getMeaningfulTokens(leftName));

  return getMeaningfulTokens(rightName).some((token) => leftTokens.has(token));
}

function areCreateTargetsRelated(
  left: CreateNamedTarget,
  right: CreateNamedTarget,
): boolean {
  return (
    left.related_names.includes(right.name) ||
    right.related_names.includes(left.name)
  );
}

function classifyCreateTargetMatch(
  reference: CreateTargetReference,
  resolvedTarget: CreateNamedTarget | null,
): PublicMatchStatus {
  if (!resolvedTarget) {
    return "no_match";
  }

  if (resolvedTarget.name === reference.requested_target.name) {
    if (reference.reference_kind === "exact") {
      return "exact";
    }

    if (reference.reference_kind === "alias") {
      return "alias";
    }

    return "broadened";
  }

  if (
    reference.requested_target.entity_type === resolvedTarget.entity_type &&
    sharesPrimaryCreateCategory(reference.requested_target, resolvedTarget) &&
    (sharesMeaningfulTargetTokens(
      reference.requested_target.name,
      resolvedTarget.name,
    ) ||
      areCreateTargetsRelated(reference.requested_target, resolvedTarget))
  ) {
    return "broadened";
  }

  return "misrouted";
}

function deriveCreateTargetReference(
  result: CreateSaltUiResult,
  options: PublicContractBuildOptions,
): CreateTargetReference | undefined {
  if (result.mode !== "recommend" || !options.registry) {
    return undefined;
  }

  const query = options.query?.trim();
  if (!query) {
    return undefined;
  }

  const exactTarget = resolveCreateNamedTarget(
    options.registry,
    query,
    options.package,
  );
  if (exactTarget) {
    return {
      requested_entity: query,
      requested_target: exactTarget,
      reference_kind: exactTarget.matched_by.includes("name")
        ? "exact"
        : "alias",
    };
  }

  const descriptiveTarget = inferDescriptiveCreateTarget(
    options.registry,
    query,
    options.package,
  );
  if (!descriptiveTarget) {
    return undefined;
  }

  return {
    requested_entity: query,
    requested_target: descriptiveTarget,
    reference_kind: "descriptive",
  };
}

function resolveCreateNamedTarget(
  registry: SaltRegistry,
  query: string,
  packageName?: string,
): CreateNamedTarget | null {
  const componentResolution = resolveComponentTarget(
    registry,
    query,
    packageName,
  );
  const patternResolution = resolvePatternTarget(registry, query);

  if (componentResolution.ambiguity || patternResolution.ambiguity) {
    return null;
  }

  const candidates: CreateNamedTarget[] = [];

  if (componentResolution.candidate) {
    candidates.push(
      buildCreateNamedTargetFromComponent(
        componentResolution.candidate.component,
        [...componentResolution.candidate.matched_by],
      ),
    );
  }

  if (patternResolution.candidate) {
    candidates.push(
      buildCreateNamedTargetFromPattern(patternResolution.candidate.pattern, [
        ...patternResolution.candidate.matched_by,
      ]),
    );
  }

  if (candidates.length !== 1) {
    return null;
  }

  return candidates[0];
}

function deriveCreateExactRequest(
  result: CreateSaltUiResult,
  reference: CreateTargetReference | undefined,
  options: PublicContractBuildOptions,
): PublicContractExactRequest | undefined {
  if (options.exact_request) {
    return options.exact_request;
  }

  if (result.mode !== "recommend" || !options.registry || !reference) {
    return undefined;
  }

  if (!result.decision.name) {
    return {
      requested_entity: reference.requested_entity,
      resolved_entity: null,
      match_status: "no_match",
      exact_match_required: reference.reference_kind !== "descriptive",
    };
  }

  const resolvedTarget = resolveCreateNamedTarget(
    options.registry,
    result.decision.name,
    options.package,
  );

  return {
    requested_entity: reference.requested_entity,
    resolved_entity: result.decision.name,
    match_status: classifyCreateTargetMatch(reference, resolvedTarget),
    exact_match_required: reference.reference_kind !== "descriptive",
  };
}

function buildCreateNextStep(
  contract: CreateSaltUiWorkflowContract,
  exactRequest?: PublicContractExactRequest,
  reference?: CreateTargetReference,
): PublicNextStep {
  if (!contract.context_requirement.repo_specific_edits_ready) {
    return toFixContextStep(
      "get_salt_project_context",
      contract.context_requirement.retry_with.root_dir,
    );
  }

  if (
    reference?.requested_target.name &&
    exactRequest?.match_status &&
    !isMatchSafe(exactRequest.match_status)
  ) {
    return {
      kind: "tool_call",
      tool: "create_salt_ui",
      mode: "exact_name",
      args: {
        query: reference.requested_target.name,
      },
    };
  }

  if (
    exactRequest?.requested_entity &&
    (exactRequest.match_status === "misrouted" ||
      exactRequest.match_status === "no_match" ||
      (exactRequest.exact_match_required &&
        exactRequest.match_status === "broadened"))
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

  if (contract.implementation_gate.required_follow_through.length > 0) {
    return {
      kind: "tool_call",
      tool: "create_salt_ui",
      mode: "exact_name",
      args: {
        query: contract.implementation_gate.required_follow_through[0].entity,
      },
    };
  }

  if (contract.implementation_gate.blocking_questions.length > 0) {
    return {
      kind: "ask_user",
      question: contract.implementation_gate.blocking_questions[0],
    };
  }

  if (
    contract.readiness.implementation_ready &&
    (!exactRequest || isMatchSafe(exactRequest.match_status))
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
): PublicNextStep {
  if (contract.decision.status === "clean") {
    return {
      kind: "implement",
      scope: "exact_request",
    };
  }

  const topFixCandidate = contract.fix_candidates.candidates[0];
  if (topFixCandidate?.recommendation) {
    return {
      kind: "ask_user",
      question: topFixCandidate.recommendation,
    };
  }

  return {
    kind: "review",
    tool: "review_salt_ui",
    args: {
      next_step:
        result.next_step ?? contract.ide_summary.safest_next_fix ?? null,
    },
  };
}

function buildMigrateNextStep(
  result: MigrateToSaltResult,
  contract: MigrateToSaltWorkflowContract,
): PublicNextStep {
  if (!contract.context_requirement.repo_specific_edits_ready) {
    return toFixContextStep(
      "get_salt_project_context",
      contract.context_requirement.retry_with.root_dir,
    );
  }

  if ((result.clarifying_questions?.length ?? 0) > 0) {
    return {
      kind: "ask_user",
      question:
        result.clarifying_questions?.[0] ?? "Clarify the migration scope.",
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

function buildUpgradeNextStep(result: UpgradeSaltUiResult): PublicNextStep {
  if (result.ambiguity || (result.did_you_mean?.length ?? 0) > 0) {
    return {
      kind: "ask_user",
      question:
        "Clarify the exact package or component target before applying upgrade guidance.",
    };
  }

  return {
    kind: "review",
    tool: "review_salt_ui",
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
): string[] {
  return uniqueNonEmptyStrings([
    result.clarifying_questions?.[0] ?? null,
    starterBlockers[0],
    projectPolicyBlockers[0],
    contract.context_requirement.repo_specific_edits_ready
      ? null
      : contract.context_requirement.reason,
  ]);
}

function buildUpgradeBlockingReasons(result: UpgradeSaltUiResult): string[] {
  return uniqueNonEmptyStrings([
    result.ambiguity ? result.decision.why : null,
    result.did_you_mean?.length ? "upgrade target still has ambiguity" : null,
    result.breaking?.[0] ?? null,
  ]);
}

function countProjectPolicyFixCandidates(
  candidates: WorkflowFixCandidate[],
): number {
  return candidates.filter(
    (candidate) => candidate.category === "project-policy",
  ).length;
}

export function buildCreatePublicContract(
  result: CreateSaltUiResult,
  contract: CreateSaltUiWorkflowContract,
  options: PublicContractBuildOptions,
): PublicContract {
  const reference = deriveCreateTargetReference(result, options);
  const exactRequest = deriveCreateExactRequest(result, reference, options);
  const starterBlockers = buildStarterBlockers(contract.starter_validation);
  const projectPolicyBlockers = buildProjectPolicyBlockers({
    implementation_ready: contract.readiness.implementation_ready,
    readiness_reason: contract.readiness.reason,
    starter_blockers: starterBlockers,
  });

  return buildPublicContract({
    workflow: "create",
    transport_used: options.transport_used,
    exact_request: exactRequest,
    state: {
      implementation_ready: contract.readiness.implementation_ready,
      required_follow_through:
        contract.implementation_gate.required_follow_through,
      blocking_questions: contract.implementation_gate.blocking_questions,
      starter_blockers: starterBlockers,
      project_policy_blockers: projectPolicyBlockers,
      hard_blocked: false,
      context_ready: contract.context_requirement.repo_specific_edits_ready,
      usable_guidance_present:
        Boolean(result.decision.name) ||
        Boolean(contract.ide_summary.recommended_direction),
      transport_failed: false,
    },
    summary: buildCreateSummary(result, exactRequest),
    next_step:
      options.next_step ??
      buildCreateNextStep(contract, exactRequest, reference),
    rule_ids: contract.implementation_gate.rule_ids,
    blocking_reasons: options.blocking_reasons,
  });
}

export function buildReviewPublicContract(
  result: ReviewSaltUiResult,
  contract: ReviewSaltUiWorkflowContract,
  options: PublicContractBuildOptions,
): PublicContract {
  return buildPublicContract({
    workflow: "review",
    transport_used: options.transport_used,
    exact_request: options.exact_request,
    state: {
      implementation_ready:
        contract.decision.status === "clean" &&
        countProjectPolicyFixCandidates(contract.fix_candidates.candidates) ===
          0,
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
    next_step: options.next_step ?? buildReviewNextStep(result, contract),
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

  return buildPublicContract({
    workflow: "migrate",
    transport_used: options.transport_used,
    exact_request: options.exact_request,
    state: {
      implementation_ready: contract.readiness.implementation_ready,
      required_follow_through: [],
      blocking_questions: result.clarifying_questions ?? [],
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
    next_step: options.next_step ?? buildMigrateNextStep(result, contract),
    rule_ids: contract.rule_ids,
    blocking_reasons:
      options.blocking_reasons ??
      buildMigrateBlockingReasons(
        contract,
        result,
        starterBlockers,
        projectPolicyBlockers,
      ),
  });
}

export function buildUpgradePublicContract(
  result: UpgradeSaltUiResult,
  contract: UpgradeSaltUiWorkflowContract,
  options: PublicContractBuildOptions,
): PublicContract {
  const hasBlockingAmbiguity = Boolean(
    result.ambiguity || result.did_you_mean?.length,
  );
  const hasActionableChanges =
    (result.breaking?.length ?? 0) +
      (result.important?.length ?? 0) +
      (result.nice_to_know?.length ?? 0) >
    0;

  return buildPublicContract({
    workflow: "upgrade",
    transport_used: options.transport_used,
    exact_request: options.exact_request,
    state: {
      implementation_ready: !hasBlockingAmbiguity && !hasActionableChanges,
      required_follow_through: [],
      blocking_questions: [],
      starter_blockers: [],
      project_policy_blockers: [],
      hard_blocked: hasBlockingAmbiguity || hasActionableChanges,
      context_ready: true,
      usable_guidance_present: Boolean(
        result.decision.target || contract.ide_summary.target,
      ),
      transport_failed: false,
    },
    summary:
      result.decision.target != null
        ? `Salt produced upgrade guidance for ${result.decision.target}.`
        : "Salt produced upgrade guidance for the requested target.",
    next_step: options.next_step ?? buildUpgradeNextStep(result),
    rule_ids: contract.rule_ids,
    blocking_reasons:
      options.blocking_reasons ?? buildUpgradeBlockingReasons(result),
  });
}
