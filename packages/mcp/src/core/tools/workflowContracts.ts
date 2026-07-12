import type { SaltRegistry } from "../types.js";
import {
  chooseDominantCreateQueryAnchor,
  collectCreateQueryAnchors,
  isHighPriorityCreateQueryAnchor,
  toCreateQueryAnchorRegionId,
} from "./createQueryAnchors.js";
import { startsWithCreateReferencePhrase } from "./createReferenceQueries.js";
import { retrieveCreateSupportCandidates } from "./createRetrieval.js";
import type { CreateSaltUiResult } from "./createSaltUi.js";
import type {
  GuidanceBoundary,
  ProjectConventionsTopic,
} from "./guidanceBoundary.js";
import type { GuideReference } from "./guideAwareness.js";
import type { MigrateToSaltResult } from "./migrateToSalt.js";
import type {
  ReviewExpectedTargets,
  ReviewSaltUiResult,
} from "./reviewSaltUi.js";
import type { StarterCodeSnippet } from "./starterCode.js";
import type { StarterValidationSummary } from "./starterValidation.js";
import { validateStarterCodeSnippets } from "./starterValidation.js";
import type {
  NormalizedVisualEvidenceInput,
  SourceUiOutlineInput,
} from "./translation/sourceUiTypes.js";
import { containsWholeWordPhrase, normalizeQuery } from "./utils.js";
import {
  getWorkflowProjectPolicyStarterBlockers,
  type WorkflowProjectPolicyArtifact,
} from "./workflowProjectPolicy.js";
import {
  applyProjectPolicyToStarterCodeSnippets,
  buildProjectPolicyReviewGuidanceCandidates,
} from "./workflowProjectPolicyApplication.js";
import {
  buildCreateRepoRefinementArtifact,
  type WorkflowRepoRefinementArtifact,
} from "./workflowRepoRefinement.js";
import {
  buildReviewIssueClasses,
  collectReviewRuleIds,
  deriveReviewRuleId,
  getMigrationRuleIds,
} from "./workflowRuleIds.js";

export interface WorkflowReadiness {
  implementation_ready: boolean;
  reason: string;
}

export interface WorkflowContextRequirement {
  repo_specific_edits_ready: boolean;
  reason: string;
  retry_with: {
    root_dir: string | null;
  };
}

export interface WorkflowIntent {
  user_task: string;
  canonical_choice: string | null;
}

export interface WorkflowStarterValidation {
  status: "clean" | "needs_attention";
  top_issue: string | null;
  next_step: string | null;
  source_urls: string[];
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
  candidates: WorkflowFixCandidate[];
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
}
export interface WorkflowProvenance {
  canonical_source_urls: string[];
  related_guide_urls: string[];
  starter_source_urls: string[];
  source_urls: string[];
}

export interface WorkflowReviewIdeSummary {
  safest_next_fix: string | null;
}

export interface WorkflowCreateIdeSummary {
  recommended_direction: string;
  starter_plan: string[];
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

export interface WorkflowCreateImplementationGate {
  required_follow_through: FollowThroughItem[];
  blocking_questions: string[];
  rule_ids: WorkflowCreateImplementationGateRuleId[];
}

export interface WorkflowMigrateIdeSummary {
  first_scaffold: string[];
}

export interface CreateSaltUiWorkflowContract {
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
  ide_summary: WorkflowReviewIdeSummary;
  decision: ReviewSaltUiResult["decision"];
  fix_candidates: WorkflowFixCandidates;
  project_conventions_check: WorkflowProjectConventionsCheck;
  rule_ids: string[];
  provenance: WorkflowProvenance;
}

export interface MigrateToSaltWorkflowContract {
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

function unique(values: Array<string | null | undefined>): string[] {
  return [
    ...new Set(values.filter((value): value is string => Boolean(value))),
  ];
}

function readString(
  record: Record<string, unknown>,
  key: string,
): string | null {
  const value = record[key];
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

function readStringArray(
  record: Record<string, unknown>,
  key: string,
): string[] {
  const value = record[key];
  return Array.isArray(value)
    ? value.filter(
        (entry): entry is string =>
          typeof entry === "string" && entry.trim().length > 0,
      )
    : [];
}

function takeFirstUnique(
  values: Array<string | null | undefined>,
  limit: number,
): string[] {
  return unique(values).slice(0, limit);
}

function getGuideUrls(guides: GuideReference[] | undefined): string[] {
  return unique(
    (guides ?? []).flatMap((guide) => (guide.overview ? [guide.overview] : [])),
  );
}

function buildProvenanceSourceUrls(
  provenance: Omit<WorkflowProvenance, "source_urls">,
): string[] {
  return unique([
    ...provenance.canonical_source_urls,
    ...provenance.related_guide_urls,
    ...provenance.starter_source_urls,
  ]);
}

function buildWorkflowReadiness(
  starterValidation: WorkflowStarterValidation | null,
  projectPolicy: WorkflowProjectPolicyArtifact | null | undefined = null,
  workflowBlockers: string[] = [],
): WorkflowReadiness {
  if (!starterValidation) {
    return {
      implementation_ready: false,
      reason:
        "No starter code was validated, so this result is planning guidance rather than implementation-ready Salt code.",
    };
  }

  const policyStarterBlockers =
    getWorkflowProjectPolicyStarterBlockers(projectPolicy);

  if (starterValidation.status === "needs_attention") {
    const reasons = unique([
      starterValidation.top_issue,
      ...policyStarterBlockers,
    ]);
    const reason =
      reasons.length > 0
        ? reasons.join(" ")
        : "Starter code was generated but still has Salt validation issues to correct before implementation continues.";

    return {
      implementation_ready: false,
      reason,
    };
  }

  if (policyStarterBlockers.length > 0) {
    return {
      implementation_ready: false,
      reason: policyStarterBlockers[0],
    };
  }

  if (workflowBlockers.length > 0) {
    return {
      implementation_ready: false,
      reason: workflowBlockers[0],
    };
  }

  return {
    implementation_ready: true,
    reason:
      "Starter code was generated and passed the Salt-specific self-check for this workflow result.",
  };
}

function getMigrationReadinessBlockers(result: MigrateToSaltResult): string[] {
  const blockers: string[] = [];

  if (result.summary.confirmation_required > 0) {
    blockers.push(
      "Migration has unresolved decision gates that must be confirmed before implementation is ready.",
    );
  }

  if (result.summary.manual_reviews > 0) {
    blockers.push(
      "Migration includes manual-review translations that must be resolved before implementation is ready.",
    );
  }

  return blockers;
}

function getCreateFollowThroughTargets(
  registry: SaltRegistry,
  result: CreateSaltUiResult,
  query?: string,
): FollowThroughItem[] {
  const primaryTarget =
    result.composition_contract?.primary_target.name ?? null;
  const primaryTargetType =
    result.composition_contract?.primary_target.solution_type ?? null;
  const slots =
    result.composition_contract?.slots.filter(
      (slot) => slot.certainty !== "optional",
    ) ?? [];
  const expectedComponentSet = new Set(
    result.composition_contract?.expected_components ?? [],
  );
  const queryTokens = new Set(
    normalizeQuery(query ?? result.decision.name ?? result.decision.why)
      .split(/\s+/)
      .filter(Boolean),
  );
  const pageLevelDecision =
    /\b(dashboard|page|screen|workspace|overview)\b/i.test(
      result.decision.name ?? "",
    );
  const allQueryAnchors = collectCreateQueryAnchors(registry, query ?? "");
  const allHighPriorityQueryAnchors = allQueryAnchors.filter(
    isHighPriorityCreateQueryAnchor,
  );
  const dominantQueryAnchor = chooseDominantCreateQueryAnchor(
    allHighPriorityQueryAnchors,
  );
  const explicitNamedQueryAnchors = allQueryAnchors.filter(
    (anchor) =>
      anchor.name !== primaryTarget &&
      anchor.matched_by.includes("name") &&
      !isHighPriorityCreateQueryAnchor(anchor),
  );
  const queryAnchors = [
    ...allHighPriorityQueryAnchors,
    ...explicitNamedQueryAnchors,
  ].filter((anchor) => anchor.name !== primaryTarget);
  const queryAnchorByName = new Map(
    queryAnchors.map((anchor) => [anchor.name, anchor] as const),
  );
  const primaryTargetCategories = new Set(
    (
      registry.components.find((entry) => entry.name === primaryTarget)
        ?.category ??
      registry.patterns.find((entry) => entry.name === primaryTarget)
        ?.category ??
      []
    ).map((category) => normalizeQuery(category)),
  );
  const frequency = new Map<string, number>();

  // Build a map from entity name → region (slot id) for region-level binding
  const entityToRegion = new Map<string, string>();
  for (const slot of slots) {
    for (const name of slot.preferred_patterns) {
      if (name === primaryTarget) {
        continue;
      }
      frequency.set(name, (frequency.get(name) ?? 0) + 1);
      if (!entityToRegion.has(name)) {
        entityToRegion.set(name, slot.id);
      }
    }
    for (const name of slot.preferred_components) {
      if (name === primaryTarget || !expectedComponentSet.has(name)) {
        continue;
      }
      frequency.set(name, (frequency.get(name) ?? 0) + 1);
      if (!entityToRegion.has(name)) {
        entityToRegion.set(name, slot.id);
      }
    }
  }

  const scoredTargets = takeFirstUnique(
    [
      ...slots.flatMap((slot) => [
        ...slot.preferred_patterns,
        ...slot.preferred_components.filter((name) =>
          expectedComponentSet.has(name),
        ),
      ]),
      ...(result.composition_contract?.expected_patterns ?? []),
      ...(result.composition_contract?.expected_components ?? []),
    ].filter((name) => name !== primaryTarget),
    32,
  )
    .map((name) => {
      const normalizedName = normalizeQuery(name);
      const nameTokens = normalizedName.split(/\s+/).filter(Boolean);
      const overlapScore = nameTokens.reduce(
        (score, token) => score + (queryTokens.has(token) ? 4 : 0),
        0,
      );
      const pageLevelBonus =
        pageLevelDecision &&
        /\b(header|metric|grid|table|navigation|filter|summary|panel)\b/i.test(
          name,
        )
          ? 8
          : 0;
      const pageLevelPenalty =
        pageLevelDecision &&
        /\b(dialog|address|phone|toast|banner|avatar|combo|keyboard)\b/i.test(
          name,
        )
          ? -10
          : 0;
      const explicitQueryAnchor = queryAnchorByName.get(name) ?? null;
      const explicitQueryBonus = explicitQueryAnchor
        ? 120 +
          explicitQueryAnchor.structural_weight * 6 -
          Math.min(explicitQueryAnchor.query_index, 24)
        : 0;
      const genericScaffoldPenalty =
        queryAnchorByName.size > 0 &&
        !explicitQueryAnchor &&
        (frequency.get(name) ?? 0) <= 1 &&
        overlapScore === 0 &&
        /\b(border layout|app header|header block|stack layout|flow layout)\b/i.test(
          name,
        )
          ? -24
          : 0;
      const nonExplicitPenalty =
        queryAnchorByName.size > 0 &&
        !explicitQueryAnchor &&
        (frequency.get(name) ?? 0) <= 1 &&
        overlapScore === 0
          ? -10
          : 0;

      return {
        entity: name,
        region: entityToRegion.get(name) ?? "top-level",
        score:
          (frequency.get(name) ?? 0) * 10 +
          overlapScore +
          pageLevelBonus +
          pageLevelPenalty +
          explicitQueryBonus +
          genericScaffoldPenalty +
          nonExplicitPenalty,
      };
    })
    .filter((entry) => entry.score > 0)
    .sort((left, right) => {
      if (left.score !== right.score) {
        return right.score - left.score;
      }
      return left.entity.localeCompare(right.entity);
    });

  const exactQueryTargets = queryAnchors.map((anchor) => ({
    region: toCreateQueryAnchorRegionId(anchor),
    entity: anchor.name,
    score:
      160 + anchor.structural_weight * 8 - Math.min(anchor.query_index, 24),
  }));
  const exactNamedQueryTargets = queryAnchors
    .filter((anchor) => anchor.matched_by.includes("name"))
    .map((anchor) => ({
      region: toCreateQueryAnchorRegionId(anchor),
      entity: anchor.name,
      score:
        160 + anchor.structural_weight * 8 - Math.min(anchor.query_index, 24),
    }));
  const retrievalSupportTargets =
    slots.length === 0 &&
    query &&
    primaryTarget &&
    primaryTargetType === "component" &&
    exactNamedQueryTargets.length === 0 &&
    [...primaryTargetCategories].some((category) =>
      ["data-display-and-analysis", "data-display-and-visualization"].includes(
        category,
      ),
    )
      ? retrieveCreateSupportCandidates(registry, {
          query,
          owner_name: primaryTarget,
          owner_categories: [...primaryTargetCategories],
          top_k: 8,
        })
          .filter((candidate) => candidate.entity_name !== primaryTarget)
          .filter((candidate) => candidate.structural_weight >= 10)
          .filter(
            (candidate) => candidate.support_score > candidate.caution_score,
          )
          .filter(
            (candidate) =>
              candidate.support_score >=
              Math.max(10, Math.round(candidate.owner_score * 0.2)),
          )
          .filter(
            (candidate) =>
              !candidate.evidence.some(
                (entry) =>
                  entry.evidence_role === "caution" &&
                  containsWholeWordPhrase(entry.text, primaryTarget),
              ),
          )
          .filter((candidate) => {
            const candidateCategories = new Set(
              candidate.categories.map((category) => normalizeQuery(category)),
            );
            return ![...candidateCategories].some((category) =>
              primaryTargetCategories.has(category),
            );
          })
          .map((candidate) => ({
            region:
              normalizeQuery(candidate.entity_name).replace(/\s+/g, "-") ||
              "top-level",
            entity: candidate.entity_name,
            score: 100 + Math.round(candidate.confidence),
          }))
      : [];

  const queryStartsWithPrimaryTarget = primaryTarget
    ? startsWithCreateReferencePhrase(
        query ?? result.decision.name ?? result.decision.why,
        primaryTarget,
      )
    : false;

  if (
    primaryTarget &&
    dominantQueryAnchor?.name === primaryTarget &&
    queryStartsWithPrimaryTarget &&
    !pageLevelDecision
  ) {
    return exactNamedQueryTargets
      .sort((left, right) => {
        if (left.score !== right.score) {
          return right.score - left.score;
        }
        return left.entity.localeCompare(right.entity);
      })
      .slice(0, 4)
      .map((entry) => ({ region: entry.region, entity: entry.entity }));
  }

  return [...exactQueryTargets, ...retrievalSupportTargets, ...scoredTargets]
    .sort((left, right) => {
      if (left.score !== right.score) {
        return right.score - left.score;
      }
      return left.entity.localeCompare(right.entity);
    })
    .filter(
      (entry, index, all) =>
        all.findIndex((candidate) => candidate.entity === entry.entity) ===
        index,
    )
    .slice(0, 4)
    .map((entry) => ({ region: entry.region, entity: entry.entity }));
}

const DOCS_NAVIGATION_CONDITION_STOPWORDS = new Set([
  "a",
  "an",
  "and",
  "as",
  "for",
  "from",
  "header",
  "if",
  "in",
  "instead",
  "is",
  "it",
  "navigation",
  "need",
  "not",
  "of",
  "on",
  "or",
  "primarily",
  "shell",
  "the",
  "to",
  "use",
  "when",
  "with",
]);

function normalizeDocsConditionToken(token: string): string {
  return token.length > 4 && token.endsWith("s") && !token.endsWith("ss")
    ? token.slice(0, -1)
    : token;
}

function toDocsConditionTokens(value: string): string[] {
  return normalizeQuery(value)
    .replace(/\b(?:multi-level|multilevel)\b/g, "multiple levels")
    .split(/\s+/)
    .filter(Boolean)
    .map(normalizeDocsConditionToken);
}

function getWhenNotToUseConditionClause(value: string): string {
  return value
    .split(/\.\s+instead\b/i, 1)[0]
    .split(/,\s+(?:use|consider using)\b/i, 1)[0];
}

function queryMatchesDocsNavigationCondition(
  normalizedQuery: string,
  condition: string,
): boolean {
  if (!normalizeQuery(condition).includes("navigation")) {
    return false;
  }

  const queryTokens = toDocsConditionTokens(normalizedQuery);
  const conditionTokens = toDocsConditionTokens(
    getWhenNotToUseConditionClause(condition),
  );
  const queryTokenSet = new Set(queryTokens);
  const sharedMeaningfulTerms = unique(
    conditionTokens.filter(
      (token) =>
        !DOCS_NAVIGATION_CONDITION_STOPWORDS.has(token) &&
        queryTokenSet.has(token),
    ),
  );
  if (sharedMeaningfulTerms.length >= 2) {
    return true;
  }

  const queryPhrases = new Set(
    queryTokens
      .slice(0, -1)
      .map((token, index) => [token, queryTokens[index + 1]].join(" ")),
  );
  return conditionTokens.slice(0, -1).some((token, index) => {
    const nextToken = conditionTokens[index + 1];
    return (
      (!DOCS_NAVIGATION_CONDITION_STOPWORDS.has(token) ||
        !DOCS_NAVIGATION_CONDITION_STOPWORDS.has(nextToken)) &&
      queryPhrases.has([token, nextToken].join(" "))
    );
  });
}

function getDocsBackedCreateBlockingQuestions(
  registry: SaltRegistry,
  result: CreateSaltUiResult,
  query?: string,
): string[] {
  const normalizedQuery = normalizeQuery(query ?? "");
  if (!normalizedQuery.includes("navigation")) {
    return [];
  }

  const decisionName = result.decision.name;
  if (!decisionName) {
    return [];
  }

  const record =
    registry.components.find((component) => component.name === decisionName) ??
    registry.patterns.find((pattern) => pattern.name === decisionName);
  const matchingCondition = (record?.when_not_to_use ?? []).find((condition) =>
    queryMatchesDocsNavigationCondition(normalizedQuery, condition),
  );
  if (!matchingCondition) {
    return [];
  }

  return [
    `Salt docs flag this navigation case for ${decisionName}: ${matchingCondition} Should this request use in-page tabs, or route/page navigation?`,
  ];
}

function buildCreateImplementationGate(
  registry: SaltRegistry,
  result: CreateSaltUiResult,
  query?: string,
): WorkflowCreateImplementationGate {
  const requiredFollowThrough = getCreateFollowThroughTargets(
    registry,
    result,
    query,
  );
  const blockingQuestions = unique([
    ...(result.open_questions ?? []).map((question) => question.prompt),
    ...getDocsBackedCreateBlockingQuestions(registry, result, query),
  ]);
  const ruleIds: WorkflowCreateImplementationGateRuleId[] = [];

  if (requiredFollowThrough.length > 0) {
    ruleIds.push("create-follow-through-required");
  }
  if (blockingQuestions.length > 0) {
    ruleIds.push("create-blocking-question");
  }

  return {
    required_follow_through: requiredFollowThrough,
    blocking_questions: blockingQuestions,
    rule_ids: ruleIds,
  };
}

function buildWorkflowContextRequirement(
  input: { retry_with_root_dir?: string | null } = {},
): WorkflowContextRequirement {
  return {
    repo_specific_edits_ready: false,
    reason:
      "This workflow result is canonical Salt guidance only. Repo context was not checked before it was returned, so repo-specific refinement may still be incomplete even though the canonical Salt answer is usable.",
    retry_with: {
      root_dir: input.retry_with_root_dir ?? null,
    },
  };
}

function buildSatisfiedWorkflowContextRequirement(
  input: { retry_with_root_dir?: string | null } = {},
): WorkflowContextRequirement {
  return {
    repo_specific_edits_ready: true,
    reason:
      "Local Salt project context was collected before this workflow result was returned, so repo-specific edits can proceed with framework, package, runtime, and policy context in scope.",
    retry_with: {
      root_dir: input.retry_with_root_dir ?? null,
    },
  };
}

function toWorkflowStarterValidation(
  starterValidation: StarterValidationSummary | null,
): WorkflowStarterValidation | null {
  if (!starterValidation) {
    return null;
  }

  return {
    status: starterValidation.status,
    top_issue: starterValidation.top_issue,
    next_step: starterValidation.next_step,
    source_urls: starterValidation.source_urls,
  };
}

function buildProjectConventionsCheck(
  guidanceBoundary: GuidanceBoundary,
  projectPolicy: WorkflowProjectPolicyArtifact | null | undefined = null,
): WorkflowProjectConventionsCheck {
  const checkRecommended =
    guidanceBoundary.project_conventions.check_recommended;
  const declaredPolicyStatus = !projectPolicy
    ? "unknown-until-project-context"
    : !projectPolicy.declared
      ? "none-declared"
      : projectPolicy.policyMode === "stack"
        ? "stack-declared"
        : "team-declared";
  const nextStep =
    declaredPolicyStatus === "unknown-until-project-context"
      ? checkRecommended
        ? "Load repo policy context before finalizing wrappers, shells, migration shims, or other repo-local decisions."
        : "No separate project-conventions check is usually required unless the repo already layers local abstractions on top of canonical Salt."
      : declaredPolicyStatus === "none-declared"
        ? checkRecommended
          ? "No repo policy is declared yet. Proceed with the canonical Salt answer; durable repo policy setup is deferred from public v1."
          : "No repo policy is declared. Proceed with the canonical Salt answer unless the repo needs durable wrappers, bans, or other local Salt rules."
        : checkRecommended
          ? "Repo policy is declared. Apply it only after the canonical Salt answer is clear."
          : "Repo policy is declared, but this workflow result does not require a project-conventions check by default.";
  return {
    supported: guidanceBoundary.project_conventions.supported,
    contract: guidanceBoundary.project_conventions.contract,
    check_recommended: checkRecommended,
    topics: guidanceBoundary.project_conventions.topics,
    reason: guidanceBoundary.project_conventions.reason,
    canonical_only: true,
    declared_policy_status: declaredPolicyStatus,
    policy_paths: [".salt/team.json", ".salt/stack.json"],
    suggested_follow_up_tool: "get_salt_project_context",
    next_step: nextStep,
  };
}

function hasReviewExpectedPatternTarget(
  expectedTargets: ReviewExpectedTargets | undefined,
): boolean {
  return Boolean(
    expectedTargets?.patterns?.some((pattern) => pattern.trim().length > 0) ||
      expectedTargets?.composition_contract?.expected_patterns.some(
        (pattern) => pattern.trim().length > 0,
      ) ||
      expectedTargets?.composition_contract?.slots.some((slot) =>
        slot.preferred_patterns.some((pattern) => pattern.trim().length > 0),
      ),
  );
}

function withReviewExpectedTargetProjectConventions(
  guidanceBoundary: GuidanceBoundary,
  expectedTargets: ReviewExpectedTargets | undefined,
): GuidanceBoundary {
  if (!hasReviewExpectedPatternTarget(expectedTargets)) {
    return guidanceBoundary;
  }

  const topics = unique([
    ...guidanceBoundary.project_conventions.topics,
    "wrappers",
    "page-patterns",
  ]) as ProjectConventionsTopic[];

  return {
    ...guidanceBoundary,
    project_conventions: {
      ...guidanceBoundary.project_conventions,
      check_recommended: true,
      topics,
      reason: guidanceBoundary.project_conventions.check_recommended
        ? guidanceBoundary.project_conventions.reason
        : "Expected pattern targets came from explicit workflow input. Confirm repo-level wrappers or page patterns through project conventions before finalizing the fix plan.",
    },
  };
}

function buildCreateIntentPayload(
  query: string | undefined,
  result: CreateSaltUiResult,
): WorkflowIntent {
  return {
    user_task:
      query?.trim() ||
      "Clarify the user task before applying the create result.",
    canonical_choice: result.decision.name,
  };
}

function buildMigrationCandidate(
  record: Record<string, unknown>,
): WorkflowFixCandidate | null {
  const kind = readString(record, "kind");
  const from = readString(record, "from");
  const to = readString(record, "to");
  const reason = readString(record, "reason");
  if (!kind && !from && !to && !reason) {
    return null;
  }

  const deterministic = kind === "prop" && Boolean(from) && Boolean(to);
  return {
    candidate_type: "migration",
    safety: deterministic ? "deterministic" : "manual_review",
    kind,
    title:
      reason ??
      (from && to
        ? `Replace ${from} with ${to}.`
        : "Review the suggested Salt migration."),
    recommendation:
      from && to
        ? `Replace ${from} with ${to}.`
        : (reason ?? "Review and apply the migration manually."),
    from,
    to,
    reason,
    category: "deprecated",
    rule: null,
    rule_id: "review-migration-upgrade-risk",
    source_urls: readStringArray(record, "source_urls"),
  };
}

function buildGuidedFixCandidate(
  record: Record<string, unknown>,
): WorkflowFixCandidate | null {
  const nestedIssue =
    record.issue && typeof record.issue === "object"
      ? (record.issue as Record<string, unknown>)
      : {};
  const recipeSteps = readStringArray(record, "steps");
  const problem =
    readString(record, "problem") ??
    readString(nestedIssue, "message") ??
    readString(nestedIssue, "title");
  const recommendedFix =
    readString(record, "recommended_fix") ?? recipeSteps[0] ?? null;
  const category =
    readString(record, "category") ?? readString(nestedIssue, "category");
  const rule = readString(record, "rule") ?? readString(nestedIssue, "rule");
  if (!problem && !recommendedFix) {
    return null;
  }

  return {
    candidate_type: "guided_fix",
    safety: "manual_review",
    kind: null,
    title:
      problem ?? recommendedFix ?? "Review the suggested Salt remediation.",
    recommendation: recommendedFix,
    from: null,
    to: null,
    reason: problem,
    category,
    rule,
    rule_id: deriveReviewRuleId({ category, rule }),
    source_urls: unique([
      ...readStringArray(record, "docs"),
      ...readStringArray(record, "related_guides"),
      ...readStringArray(record, "supporting_docs"),
      readString(nestedIssue, "canonical_source"),
    ]),
  };
}

function buildReviewFixCandidates(
  result: ReviewSaltUiResult,
  input: {
    code?: string;
    project_policy?: WorkflowProjectPolicyArtifact | null;
  } = {},
): WorkflowFixCandidates {
  const candidates: WorkflowFixCandidate[] = [];

  for (const migration of result.migrations ?? []) {
    if (!migration || typeof migration !== "object") {
      continue;
    }

    const candidate = buildMigrationCandidate(
      migration as Record<string, unknown>,
    );
    if (!candidate) {
      continue;
    }

    candidates.push(candidate);
  }

  for (const fix of result.fixes ?? []) {
    if (!fix || typeof fix !== "object") {
      continue;
    }

    const candidate = buildGuidedFixCandidate(fix as Record<string, unknown>);
    if (!candidate) {
      continue;
    }

    candidates.push(candidate);
  }

  for (const candidate of buildProjectPolicyReviewGuidanceCandidates({
    code: input.code ?? "",
    projectPolicy: input.project_policy,
  })) {
    candidates.push({
      candidate_type: "guided_fix",
      safety: "manual_review",
      kind: null,
      title: candidate.title,
      recommendation: candidate.recommendation,
      from: null,
      to: null,
      reason: candidate.reason,
      category: "project-policy",
      rule: "project-policy",
      rule_id: candidate.rule_id,
      source_urls: candidate.source_urls,
    });
  }

  return { candidates };
}

function buildReviewDecision(
  result: ReviewSaltUiResult,
  fixCandidates: WorkflowFixCandidates,
): ReviewSaltUiResult["decision"] {
  const projectPolicyCandidateCount = fixCandidates.candidates.filter(
    (candidate) => candidate.category === "project-policy",
  ).length;

  if (
    result.decision.status === "needs_attention" ||
    projectPolicyCandidateCount === 0
  ) {
    return result.decision;
  }

  return {
    status: "needs_attention",
    why: "Canonical Salt validation is clean, but repo policy still requires follow-up before implementation is complete.",
  };
}

function buildCreateIdeSummary(input: {
  result: CreateSaltUiResult;
  implementationGate: WorkflowCreateImplementationGate;
  starterValidation: WorkflowStarterValidation | null;
}): WorkflowCreateIdeSummary {
  const { result, implementationGate, starterValidation } = input;
  const starterLabels =
    result.starter_code?.map((snippet) => snippet.label).filter(Boolean) ?? [];

  return {
    recommended_direction: result.decision.name
      ? `${result.decision.name}: ${result.decision.why}`
      : result.decision.why,
    starter_plan: takeFirstUnique(
      [
        implementationGate.required_follow_through.length > 0
          ? "Before coding named sub-surfaces, run Salt follow-up grounding for the unresolved composition-contract items first."
          : null,
        ...starterLabels.map((label) => `Start from ${label}.`),
        starterValidation?.status === "needs_attention"
          ? starterValidation.top_issue
          : null,
        result.next_step ?? null,
      ],
      4,
    ),
  };
}

function buildReviewIdeSummary(input: {
  result: ReviewSaltUiResult;
  fixCandidates: WorkflowFixCandidates;
}): WorkflowReviewIdeSummary {
  const { result, fixCandidates } = input;
  const deterministicCandidate =
    fixCandidates.candidates.find(
      (candidate) => candidate.safety === "deterministic",
    ) ?? null;
  const safestCandidate = deterministicCandidate ?? fixCandidates.candidates[0];

  return {
    safest_next_fix:
      safestCandidate?.recommendation ??
      safestCandidate?.title ??
      result.next_step ??
      null,
  };
}

function buildMigrateIdeSummary(
  result: MigrateToSaltResult,
): WorkflowMigrateIdeSummary {
  return {
    first_scaffold: takeFirstUnique(
      [
        ...(result.implementation_plan.scaffold_handoff?.start_with ?? []).map(
          (entry) => `Start with ${entry}.`,
        ),
        ...(
          result.implementation_plan.scaffold_handoff?.build_around ?? []
        ).map((entry) => `Build around ${entry}.`),
        ...(result.starter_code ?? []).map(
          (snippet) => `Use ${snippet.label} as the first scaffold.`,
        ),
        result.next_step ?? null,
      ],
      5,
    ),
  };
}

function buildPostMigrationVerification(
  result: MigrateToSaltResult,
): WorkflowPostMigrationVerification {
  return {
    source_checks: [
      "Run the review_salt_ui MCP tool on the migrated files after the first implementation pass.",
      "Confirm the migrated code is using canonical Salt primitives, patterns, and tokens.",
    ],
    runtime_checks: [
      "Run the host repo's existing runtime, interaction, or Storybook checks after implementation when landmarks, visible states, or runtime behavior still need verification.",
    ],
    preserve_checks: result.familiarity_contract.preserve,
    confirmation_checks: result.familiarity_contract.requires_confirmation,
    suggested_workflow: "review_salt_ui",
    suggested_command:
      'review_salt_ui via the @salt-ds/mcp server (args: { code: "<file contents>" })',
  };
}

function buildTranslateVisualEvidenceContract(
  input: {
    source_outline?: SourceUiOutlineInput;
    visual_evidence?: NormalizedVisualEvidenceInput[];
  } = {},
): WorkflowVisualEvidenceContract {
  const explicitSourceOutlineCounts = {
    regions: input.source_outline?.regions?.length ?? 0,
    actions: input.source_outline?.actions?.length ?? 0,
    states: input.source_outline?.states?.length ?? 0,
    notes: input.source_outline?.notes?.length ?? 0,
  };
  const sourceOutlineProvided =
    explicitSourceOutlineCounts.regions +
      explicitSourceOutlineCounts.actions +
      explicitSourceOutlineCounts.states +
      explicitSourceOutlineCounts.notes >
    0;
  const visualEvidence = input.visual_evidence ?? [];
  const derivedOutlineCounts = {
    regions: unique([
      ...(input.source_outline?.regions ?? []),
      ...visualEvidence.flatMap((entry) => entry.derived_outline.regions ?? []),
    ]).length,
    actions: unique([
      ...(input.source_outline?.actions ?? []),
      ...visualEvidence.flatMap((entry) => entry.derived_outline.actions ?? []),
    ]).length,
    states: unique([
      ...(input.source_outline?.states ?? []),
      ...visualEvidence.flatMap((entry) => entry.derived_outline.states ?? []),
    ]).length,
    notes: unique([
      ...(input.source_outline?.notes ?? []),
      ...visualEvidence.flatMap((entry) => entry.derived_outline.notes ?? []),
    ]).length,
  };
  const derivedOutlineAvailable =
    derivedOutlineCounts.regions +
      derivedOutlineCounts.actions +
      derivedOutlineCounts.states +
      derivedOutlineCounts.notes >
    0;
  const visualInputKinds = unique(
    visualEvidence.map((entry) => entry.kind),
  ) as Array<NormalizedVisualEvidenceInput["kind"]>;

  return {
    source_outline_provided: sourceOutlineProvided,
    source_outline_signal_counts: explicitSourceOutlineCounts,
    derived_outline_available: derivedOutlineAvailable,
    derived_outline_signal_counts: derivedOutlineCounts,
    visual_input_count: visualEvidence.length,
    visual_input_kinds: visualInputKinds,
  };
}

function buildCreateProvenance(
  result: CreateSaltUiResult,
  starterValidation: WorkflowStarterValidation | null,
): WorkflowProvenance {
  const provenance = {
    canonical_source_urls: unique([
      ...readStringArray(result.recommended ?? {}, "docs"),
      ...readStringArray(result.recommended ?? {}, "source_urls"),
    ]),
    related_guide_urls: getGuideUrls(result.related_guides),
    starter_source_urls: starterValidation?.source_urls ?? [],
  };

  return {
    ...provenance,
    source_urls: buildProvenanceSourceUrls(provenance),
  };
}

function buildReviewProvenance(result: ReviewSaltUiResult): WorkflowProvenance {
  const provenance = {
    canonical_source_urls: result.source_urls,
    related_guide_urls: [],
    starter_source_urls: [],
  };

  return {
    ...provenance,
    source_urls: buildProvenanceSourceUrls(provenance),
  };
}

function buildMigrateProvenance(
  result: MigrateToSaltResult,
  starterValidation: WorkflowStarterValidation | null,
): WorkflowProvenance {
  const provenance = {
    canonical_source_urls: result.source_urls,
    related_guide_urls: getGuideUrls(result.related_guides),
    starter_source_urls: starterValidation?.source_urls ?? [],
  };

  return {
    ...provenance,
    source_urls: buildProvenanceSourceUrls(provenance),
  };
}

export function buildCreateSaltUiWorkflowContract(
  registry: SaltRegistry,
  result: CreateSaltUiResult,
  input: {
    query?: string;
    context_checked?: boolean;
    context_retry_with_root_dir?: string | null;
    project_policy?: WorkflowProjectPolicyArtifact | null;
    starter_code?: StarterCodeSnippet[] | undefined;
  } = {},
): CreateSaltUiWorkflowContract {
  const starterValidation = toWorkflowStarterValidation(
    validateStarterCodeSnippets(
      registry,
      input.starter_code ??
        applyProjectPolicyToStarterCodeSnippets(
          result.starter_code,
          input.project_policy,
        ),
    ),
  );
  const repoRefinement = buildCreateRepoRefinementArtifact({
    canonical_name: result.decision.name,
    project_policy: input.project_policy,
  });
  const intent = buildCreateIntentPayload(input.query, result);
  const projectConventionsCheck = buildProjectConventionsCheck(
    result.guidance_boundary,
    input.project_policy,
  );
  const implementationGate = buildCreateImplementationGate(
    registry,
    result,
    input.query,
  );

  const provenance = buildCreateProvenance(result, starterValidation);

  return {
    ide_summary: buildCreateIdeSummary({
      result,
      implementationGate,
      starterValidation,
    }),
    implementation_gate: implementationGate,
    intent,
    readiness: buildWorkflowReadiness(starterValidation, input.project_policy),
    context_requirement: input.context_checked
      ? buildSatisfiedWorkflowContextRequirement({
          retry_with_root_dir: input.context_retry_with_root_dir ?? null,
        })
      : buildWorkflowContextRequirement({
          retry_with_root_dir: input.context_retry_with_root_dir ?? null,
        }),
    starter_validation: starterValidation,
    repo_refinement: repoRefinement,
    project_conventions_check: projectConventionsCheck,
    provenance,
  };
}

export function buildReviewSaltUiWorkflowContract(
  result: ReviewSaltUiResult,
  input: {
    code?: string;
    expected_targets?: ReviewExpectedTargets;
    project_policy?: WorkflowProjectPolicyArtifact | null;
  } = {},
): ReviewSaltUiWorkflowContract {
  const fixCandidates = buildReviewFixCandidates(result, input);
  const issueClasses = buildReviewIssueClasses(
    (result.issues ?? []).filter(
      (entry): entry is Record<string, unknown> =>
        Boolean(entry) && typeof entry === "object",
    ),
    { includeEvidenceGap: false },
  );
  const decision = buildReviewDecision(result, fixCandidates);
  const guidanceBoundary = withReviewExpectedTargetProjectConventions(
    result.guidance_boundary,
    input.expected_targets,
  );
  const projectConventionsCheck = buildProjectConventionsCheck(
    guidanceBoundary,
    input.project_policy,
  );

  const provenance = buildReviewProvenance(result);

  return {
    ide_summary: buildReviewIdeSummary({
      result,
      fixCandidates,
    }),
    decision,
    fix_candidates: fixCandidates,
    project_conventions_check: projectConventionsCheck,
    rule_ids: collectReviewRuleIds(issueClasses),
    provenance,
  };
}

export function buildMigrateToSaltWorkflowContract(
  registry: SaltRegistry,
  result: MigrateToSaltResult,
  input: {
    source_outline?: SourceUiOutlineInput;
    visual_evidence?: NormalizedVisualEvidenceInput[];
    context_checked?: boolean;
    context_retry_with_root_dir?: string | null;
    project_policy?: WorkflowProjectPolicyArtifact | null;
    starter_code?: StarterCodeSnippet[] | undefined;
  } = {},
): MigrateToSaltWorkflowContract {
  const starterValidation = toWorkflowStarterValidation(
    validateStarterCodeSnippets(
      registry,
      input.starter_code ??
        applyProjectPolicyToStarterCodeSnippets(
          result.starter_code,
          input.project_policy,
        ),
    ),
  );
  const projectConventionsCheck = buildProjectConventionsCheck(
    result.guidance_boundary,
    input.project_policy,
  );
  const postMigrationVerification = buildPostMigrationVerification(result);
  const provenance = buildMigrateProvenance(result, starterValidation);

  return {
    ide_summary: buildMigrateIdeSummary(result),
    readiness: buildWorkflowReadiness(
      starterValidation,
      input.project_policy,
      getMigrationReadinessBlockers(result),
    ),
    context_requirement: input.context_checked
      ? buildSatisfiedWorkflowContextRequirement({
          retry_with_root_dir: input.context_retry_with_root_dir ?? null,
        })
      : buildWorkflowContextRequirement({
          retry_with_root_dir: input.context_retry_with_root_dir ?? null,
        }),
    starter_validation: starterValidation,
    project_conventions_check: projectConventionsCheck,
    rule_ids: getMigrationRuleIds({
      projectConventionsMayMatter:
        result.guidance_boundary.project_conventions.check_recommended,
      runtimeScopingMatters: false,
      requiresConfirmation: result.summary.confirmation_required > 0,
    }),
    post_migration_verification: postMigrationVerification,
    visual_evidence_contract: buildTranslateVisualEvidenceContract(input),
    provenance,
  };
}
