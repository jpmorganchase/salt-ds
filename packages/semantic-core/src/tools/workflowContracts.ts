import type { SaltRegistry } from "../types.js";
import type { SuggestedFollowUp } from "./consumerPresentation.js";
import type { CreateSaltUiResult } from "./createSaltUi.js";
import type { GuidanceBoundary } from "./guidanceBoundary.js";
import type { GuideReference } from "./guideAwareness.js";
import type { MigrateToSaltResult } from "./migrateToSalt.js";
import type { ReviewSaltUiResult } from "./reviewSaltUi.js";
import type { StarterCodeSnippet } from "./starterCode.js";
import type { StarterValidationSummary } from "./starterValidation.js";
import { validateStarterCodeSnippets } from "./starterValidation.js";
import type {
  NormalizedVisualEvidenceInput,
  SourceUiOutlineInput,
  VisualEvidenceInputType,
} from "./translation/sourceUiTypes.js";
import type { UpgradeSaltUiResult } from "./upgradeSaltUi.js";
import { normalizeQuery } from "./utils.js";
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
  buildCreateIntent,
  buildReviewIssueClasses,
  collectReviewRuleIds,
  deriveReviewRuleId,
  getCreateRuleIds,
  getMigrationRuleIds,
  getUpgradeRuleIds,
  type WorkflowIssueClass as WorkflowRuleIssueClass,
} from "./workflowRuleIds.js";

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

export type WorkflowContextRequirement =
  | {
      status: "context_required";
      repo_specific_edits_ready: false;
      reason: string;
      suggested_follow_up_tool: "get_salt_project_context";
      suggested_follow_up_cli: "salt-ds info --json";
    }
  | {
      status: "context_checked";
      repo_specific_edits_ready: true;
      reason: string;
      satisfied_by: "salt-ds info";
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
}

export interface WorkflowUpgradeIdeSummary {
  target: string | null;
  from_version: string | null;
  to_version: string | null;
  required_changes: string[];
  optional_cleanup: string[];
  suggested_order: string[];
  verify: string[];
}

export interface WorkflowCreateIdeSummary {
  recommended_direction: string;
  bounded_scope: string[];
  open_question: string | null;
  starter_plan: string[];
  verify: string[];
}

export interface WorkflowCreateImplementationGate {
  status: "clear" | "follow_through_required";
  reason: string;
  required_follow_through: string[];
  blocking_questions: string[];
  next_step: string | null;
}

export interface WorkflowMigrateIdeSummary {
  screen_map: string[];
  preserve: string[];
  needs_confirmation: string[];
  recommended_direction: string[];
  first_scaffold: string[];
  verify: string[];
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

function getSuggestedWorkflowSignals(
  followUps: SuggestedFollowUp[] | undefined,
): string[] {
  return unique((followUps ?? []).map((followUp) => followUp.workflow));
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
): WorkflowReadiness {
  if (!starterValidation) {
    return {
      status: "guidance_only",
      implementation_ready: false,
      reason:
        "No starter code was validated, so this result is planning guidance rather than implementation-ready Salt code.",
    };
  }

  if (starterValidation.status === "needs_attention") {
    return {
      status: "starter_needs_attention",
      implementation_ready: false,
      reason:
        starterValidation.top_issue ??
        "Starter code was generated but still has Salt validation issues to correct before implementation continues.",
    };
  }

  const policyStarterBlockers =
    getWorkflowProjectPolicyStarterBlockers(projectPolicy);
  if (policyStarterBlockers.length > 0) {
    return {
      status: "starter_needs_attention",
      implementation_ready: false,
      reason: policyStarterBlockers[0],
    };
  }

  return {
    status: "starter_validated",
    implementation_ready: true,
    reason:
      "Starter code was generated and passed the Salt-specific self-check for this workflow result.",
  };
}

function getCreateFollowThroughTargets(
  result: CreateSaltUiResult,
  query?: string,
): string[] {
  const primaryTarget =
    result.composition_contract?.primary_target.name ?? null;
  const slots =
    result.composition_contract?.slots.filter(
      (slot) => slot.certainty !== "optional",
    ) ?? [];
  const queryTokens = new Set(
    normalizeQuery(query ?? result.decision.name ?? result.decision.why)
      .split(/\s+/)
      .filter(Boolean),
  );
  const pageLevelDecision =
    /\b(dashboard|page|screen|workspace|overview)\b/i.test(
      result.decision.name ?? "",
    );
  const frequency = new Map<string, number>();

  for (const slot of slots) {
    for (const name of [
      ...slot.preferred_patterns,
      ...slot.preferred_components,
    ]) {
      if (name === primaryTarget) {
        continue;
      }
      frequency.set(name, (frequency.get(name) ?? 0) + 1);
    }
  }

  const scoredTargets = takeFirstUnique(
    [
      ...slots.flatMap((slot) => [
        ...slot.preferred_patterns,
        ...slot.preferred_components,
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

      return {
        name,
        score:
          (frequency.get(name) ?? 0) * 10 +
          overlapScore +
          pageLevelBonus +
          pageLevelPenalty,
      };
    })
    .sort((left, right) => {
      if (left.score !== right.score) {
        return right.score - left.score;
      }
      return left.name.localeCompare(right.name);
    });

  return scoredTargets.slice(0, 4).map((entry) => entry.name);
}

function buildCreateImplementationGate(
  result: CreateSaltUiResult,
  query?: string,
): WorkflowCreateImplementationGate {
  const requiredFollowThrough = getCreateFollowThroughTargets(result, query);
  const blockingQuestions = (result.open_questions ?? []).map(
    (question) => question.prompt,
  );

  if (requiredFollowThrough.length === 0) {
    return {
      status: "clear",
      reason:
        "No additional named Salt follow-through is required before implementation starts.",
      required_follow_through: [],
      blocking_questions: blockingQuestions,
      next_step: blockingQuestions.length
        ? "Resolve the blocking Salt questions before treating the implementation as final."
        : null,
    };
  }

  return {
    status: "follow_through_required",
    reason:
      "This create result names additional Salt patterns or components that must be grounded before those regions are implemented.",
    required_follow_through: requiredFollowThrough,
    blocking_questions: blockingQuestions,
    next_step: blockingQuestions.length
      ? "Run targeted Salt create follow-up for each required item, answer the blocking Salt questions, then implement the scaffold."
      : "Run targeted Salt create follow-up for each required item before implementing those regions.",
  };
}

export function buildWorkflowContextRequirement(): WorkflowContextRequirement {
  return {
    status: "context_required",
    repo_specific_edits_ready: false,
    reason:
      "This workflow result is canonical Salt guidance only. Repo context was not checked before it was returned, so repo-specific refinement may still be incomplete even though the canonical Salt answer is usable.",
    suggested_follow_up_tool: "get_salt_project_context",
    suggested_follow_up_cli: "salt-ds info --json",
  };
}

export function buildSatisfiedWorkflowContextRequirement(): WorkflowContextRequirement {
  return {
    status: "context_checked",
    repo_specific_edits_ready: true,
    reason:
      "Local Salt project context was collected before this workflow result was returned, so repo-specific edits can proceed with framework, package, runtime, and policy context in scope.",
    satisfied_by: "salt-ds info",
  };
}

export function toWorkflowStarterValidation(
  starterValidation: StarterValidationSummary | null,
): WorkflowStarterValidation | null {
  if (!starterValidation) {
    return null;
  }

  return {
    status: starterValidation.status,
    snippets_checked: starterValidation.snippets_checked,
    errors: starterValidation.errors,
    warnings: starterValidation.warnings,
    infos: starterValidation.infos,
    fix_count: starterValidation.fix_count,
    migration_count: starterValidation.migration_count,
    top_issue: starterValidation.top_issue,
    next_step: starterValidation.next_step,
    source_urls: starterValidation.source_urls,
  };
}

export function buildProjectConventionsCheck(
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
          ? "No repo policy is declared yet. Proceed with the canonical Salt answer, and run init/bootstrap only if wrappers, shells, bans, or other durable repo rules would change the final project answer."
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
    suggested_follow_up_cli: "salt-ds info --json",
    next_step: nextStep,
  };
}

function buildCreateConfidence(
  result: CreateSaltUiResult,
  starterValidation: WorkflowStarterValidation | null,
  projectPolicy: WorkflowProjectPolicyArtifact | null | undefined = null,
): WorkflowConfidence {
  const implementationGate = buildCreateImplementationGate(result);
  const reasons: string[] = [];
  const raiseConfidence: string[] = [];
  let level: WorkflowConfidence["level"] = "high";
  let askBeforeProceeding = false;
  const policyStarterBlockers =
    getWorkflowProjectPolicyStarterBlockers(projectPolicy);

  if (result.decision.name) {
    reasons.push("Canonical Salt guidance resolved a concrete starting point.");
  } else {
    level = "low";
    askBeforeProceeding = true;
    reasons.push(
      "The create workflow did not resolve a concrete Salt decision.",
    );
  }

  if (result.ambiguity || (result.did_you_mean?.length ?? 0) > 0) {
    level = "low";
    askBeforeProceeding = true;
    reasons.push("The request still has ambiguity that should be clarified.");
    raiseConfidence.push(
      "Clarify the target flow or entity before applying the create result.",
    );
  }

  if (result.guidance_boundary.project_conventions.check_recommended) {
    level = level === "low" ? "low" : "medium";
    askBeforeProceeding = true;
    reasons.push("Repo policy may still refine the canonical Salt answer.");
    raiseConfidence.push(
      "Check repo-local project conventions before implementation is locked.",
    );
  }

  if ((result.suggested_follow_ups?.length ?? 0) > 0) {
    raiseConfidence.push(
      "Ground the recommendation with examples or canonical entity details before editing.",
    );
  }

  if (implementationGate.status === "follow_through_required") {
    level = level === "low" ? "low" : "medium";
    reasons.push(
      "The create result still requires targeted Salt follow-through for named patterns or components before those regions are implemented.",
    );
    if (implementationGate.next_step) {
      raiseConfidence.push(implementationGate.next_step);
    }
  }

  const openQuestions = result.open_questions ?? [];
  if (openQuestions.length > 0) {
    level = level === "low" ? "low" : "medium";
    askBeforeProceeding = true;
    reasons.push(
      "The create result still has open Salt implementation choices that should be confirmed before coding.",
    );
    raiseConfidence.push(...openQuestions.map((question) => question.prompt));
  }

  raiseConfidence.push(
    "If you name a specific Salt token, prop, or API, verify the exact name against canonical Salt guidance before editing.",
  );
  raiseConfidence.push(
    "Run get_salt_project_context before repo-specific edits so local framework, package, runtime, and policy constraints are in scope.",
  );

  if (starterValidation?.status === "needs_attention") {
    level = level === "low" ? "low" : "medium";
    askBeforeProceeding = true;
    reasons.push(
      "The returned starter code still has Salt validation issues that should be corrected before implementation continues.",
    );
    if (starterValidation.top_issue) {
      raiseConfidence.push(starterValidation.top_issue);
    }
    if (starterValidation.next_step) {
      raiseConfidence.push(starterValidation.next_step);
    }
  }

  if (policyStarterBlockers.length > 0) {
    level = level === "low" ? "low" : "medium";
    askBeforeProceeding = true;
    reasons.push(
      "Repo policy could not be fully applied to the starter output, so implementation is not ready yet.",
    );
    raiseConfidence.push(...policyStarterBlockers);
  }

  return {
    level,
    reasons,
    ask_before_proceeding: askBeforeProceeding,
    raise_confidence: unique(raiseConfidence),
  };
}

function buildCreateIntentPayload(
  query: string | undefined,
  result: CreateSaltUiResult,
): WorkflowIntent {
  const intent = buildCreateIntent({
    query:
      query?.trim() ||
      "Clarify the user task before applying the create result.",
    solutionType: result.solution_type,
    decisionName: result.decision.name,
    decisionWhy: result.decision.why,
    ruleIds: getCreateRuleIds({
      projectConventionsMayMatter:
        result.guidance_boundary.project_conventions.check_recommended,
    }),
  });

  return {
    user_task: intent.userTask,
    key_interaction: intent.keyInteraction,
    composition_direction: intent.compositionDirection,
    canonical_choice: intent.canonicalChoice,
    rule_ids: intent.ruleIds,
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
  const problem = readString(record, "problem");
  const recommendedFix = readString(record, "recommended_fix");
  const category = readString(record, "category");
  const rule = readString(record, "rule");
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
    ]),
  };
}

function toWorkflowIssueClass(
  entry: WorkflowRuleIssueClass,
): WorkflowIssueClass {
  return {
    rule_id: entry.ruleId,
    label: entry.label,
    description: entry.description,
    count: entry.count,
    semantic_categories: entry.semanticCategories,
    semantic_rules: entry.semanticRules,
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
  let deterministicCount = 0;
  let manualReviewCount = 0;

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
    if (candidate.safety === "deterministic") {
      deterministicCount += 1;
    } else {
      manualReviewCount += 1;
    }
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
    manualReviewCount += 1;
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
    manualReviewCount += 1;
  }

  return {
    total_count: candidates.length,
    deterministic_count: deterministicCount,
    manual_review_count: manualReviewCount,
    candidates,
    notes:
      candidates.length > 0
        ? [
            "Use fix_candidates as agent-applied remediation guidance. The workflow returns structured candidates but does not mutate files directly.",
            ...(input.project_policy
              ? [
                  "Project-policy guidance candidates can still require follow-up even when canonical Salt validation is otherwise clean.",
                ]
              : []),
          ]
        : [],
  };
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

function buildReviewConfidence(
  result: ReviewSaltUiResult,
  fixCandidates: WorkflowFixCandidates,
): WorkflowConfidence {
  const reasons = [
    "Review findings come from deterministic source validation against canonical Salt guidance.",
  ];
  const raiseConfidence: string[] = [];
  let level: WorkflowConfidence["level"] = "high";

  if (fixCandidates.manual_review_count > 0) {
    level = "medium";
    reasons.push(
      "Some findings still need manual judgment after the deterministic pass.",
    );
    raiseConfidence.push(
      "Review the manual fix candidates before applying repo changes.",
    );
  }

  if (result.guidance_boundary.project_conventions.check_recommended) {
    level = level === "high" ? "medium" : level;
    reasons.push("Repo policy may still refine the final remediation choice.");
    raiseConfidence.push(
      "Check repo-local project conventions before finalizing the fix plan.",
    );
  }

  raiseConfidence.push(
    "Use local runtime evidence through salt-ds review --url if rendered behavior still matters.",
  );

  return {
    level,
    reasons,
    ask_before_proceeding: false,
    raise_confidence: unique(raiseConfidence),
  };
}

function buildCreateIdeSummary(input: {
  result: CreateSaltUiResult;
  query?: string;
  intent: WorkflowIntent;
  starterValidation: WorkflowStarterValidation | null;
  projectConventionsCheck: WorkflowProjectConventionsCheck;
}): WorkflowCreateIdeSummary {
  const { result, query, intent, starterValidation, projectConventionsCheck } =
    input;
  const implementationGate = buildCreateImplementationGate(result, query);
  const requiredSlots =
    result.composition_contract?.slots.filter(
      (slot) => slot.certainty !== "optional",
    ) ?? [];
  const starterLabels =
    result.starter_code?.map((snippet) => snippet.label).filter(Boolean) ?? [];

  return {
    recommended_direction: result.decision.name
      ? `${result.decision.name}: ${result.decision.why}`
      : result.decision.why,
    bounded_scope: takeFirstUnique(
      [
        ...requiredSlots.map(
          (slot) =>
            slot.preferred_patterns[0] ??
            slot.preferred_components[0] ??
            slot.label,
        ),
        intent.composition_direction,
      ],
      4,
    ),
    open_question: result.open_questions?.[0]?.prompt ?? null,
    starter_plan: takeFirstUnique(
      [
        implementationGate.status === "follow_through_required"
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
    verify: takeFirstUnique(
      [
        "Run salt-ds review on the changed files after the first implementation pass.",
        implementationGate.status === "follow_through_required"
          ? "Treat the composition contract as a required checklist and do not mark the scaffold complete until each named pattern or component has been grounded."
          : null,
        result.open_questions?.length
          ? "Resolve the blocking Salt question before treating the scaffold as final."
          : null,
        projectConventionsCheck.check_recommended
          ? "Confirm repo-local wrappers, shells, and token aliases before calling the create flow complete."
          : null,
      ],
      3,
    ),
  };
}

function buildReviewIdeSummary(input: {
  result: ReviewSaltUiResult;
  decision: ReviewSaltUiResult["decision"];
  fixCandidates: WorkflowFixCandidates;
  projectConventionsCheck: WorkflowProjectConventionsCheck;
}): WorkflowReviewIdeSummary {
  const { result, decision, fixCandidates, projectConventionsCheck } = input;
  const deterministicCandidate =
    fixCandidates.candidates.find(
      (candidate) => candidate.safety === "deterministic",
    ) ?? null;
  const safestCandidate = deterministicCandidate ?? fixCandidates.candidates[0];
  const verdictLevel: WorkflowReviewIdeSummary["verdict"]["level"] =
    decision.status === "clean"
      ? "clean"
      : result.summary.errors > 0
        ? "high_risk"
        : "medium_risk";

  return {
    verdict: {
      level: verdictLevel,
      summary: decision.why,
    },
    top_findings: takeFirstUnique(
      [
        ...(result.issues ?? []).flatMap((issue) =>
          issue && typeof issue === "object"
            ? [
                readString(issue as Record<string, unknown>, "message") ??
                  readString(issue as Record<string, unknown>, "title"),
              ]
            : [],
        ),
        ...fixCandidates.candidates.map((candidate) => candidate.title),
        decision.why,
      ],
      3,
    ),
    safest_next_fix:
      safestCandidate?.recommendation ??
      safestCandidate?.title ??
      result.next_step ??
      null,
    verify: takeFirstUnique(
      [
        "Rerun salt-ds review on the changed files.",
        fixCandidates.manual_review_count > 0
          ? "Confirm the manual review candidates against the affected interaction before merging."
          : null,
        projectConventionsCheck.check_recommended
          ? "Confirm repo-local wrappers, shells, migration shims, and token aliases before calling the fix complete."
          : null,
      ],
      3,
    ),
  };
}

function buildRepoAwareReviewConfidence(
  input: RepoAwareReviewWorkflowInput,
): WorkflowConfidence {
  const reasons = [
    "Review findings come from deterministic source validation.",
  ];
  const raiseConfidence: string[] = [];
  let level: WorkflowConfidence["level"] = "high";

  if (input.manual_review_fix_count > 0) {
    level = "medium";
    reasons.push(
      "Some findings still need manual judgment after the deterministic pass.",
    );
    raiseConfidence.push(
      "Review the manual fix candidates before applying repo changes.",
    );
  }

  if (!input.runtime_requested && input.runtime_target_detected) {
    reasons.push(
      "A runtime target exists, but this review stayed source-only.",
    );
    raiseConfidence.push(
      "Add --url if rendered structure, runtime errors, or visible states still matter.",
    );
  }

  if (input.runtime_requested) {
    reasons.push("Runtime evidence was checked in the same review pass.");
  }

  if (input.project_conventions_check_recommended) {
    level = level === "high" ? "medium" : level;
    reasons.push(
      input.project_conventions_declared
        ? "Repo policy is declared and may still refine the final remediation choice."
        : "Repo policy may still refine the final remediation choice.",
    );
    raiseConfidence.push(
      input.project_conventions_declared
        ? "Check the declared project conventions before finalizing the fix plan."
        : "Add .salt/team.json or confirm the relevant project conventions before finalizing the fix plan.",
    );
  }

  if (input.runtime_issue_count > 0) {
    level = "medium";
    reasons.push("Runtime evidence reported issues that still need judgment.");
  }

  if (input.migration_verification) {
    if (input.migration_verification.not_checked_count > 0) {
      level = "medium";
      reasons.push(
        "Some migration verification checks were not compared against runtime evidence yet.",
      );
      raiseConfidence.push(
        "Add --url with --migration-report to compare the migrated result against the migration contract.",
      );
    }

    if (input.migration_verification.manual_review_count > 0) {
      level = "medium";
      reasons.push(
        "The migration verification contract still has checks that need explicit confirmation.",
      );
      raiseConfidence.push(
        "Confirm the preserved task flow, landmarks, and other migration verification items before calling the migration done.",
      );
    }
  }

  if (input.project_conventions_warnings.length > 0) {
    level = level === "high" ? "medium" : level;
    reasons.push(
      "Declared project conventions could not be fully resolved for this review.",
    );
    const firstWarning = input.project_conventions_warnings[0];
    if (firstWarning) {
      raiseConfidence.push(firstWarning);
    }
  }

  return {
    level,
    reasons,
    ask_before_proceeding: false,
    raise_confidence: unique(raiseConfidence),
  };
}

function buildToolIssueClasses(
  result: ReviewSaltUiResult,
): WorkflowIssueClass[] {
  return buildReviewIssueClasses(
    (result.issues ?? []).filter(
      (entry): entry is Record<string, unknown> =>
        Boolean(entry) && typeof entry === "object",
    ),
    {
      includeEvidenceGap: false,
    },
  ).map(toWorkflowIssueClass);
}

function buildMigrateConfidence(
  result: MigrateToSaltResult,
  starterValidation: WorkflowStarterValidation | null,
  projectPolicy: WorkflowProjectPolicyArtifact | null | undefined = null,
): WorkflowConfidence {
  const lowConfidenceCount = result.translations.filter(
    (entry) => entry.confidence_detail.level === "low",
  ).length;
  const mediumConfidenceCount = result.translations.filter(
    (entry) => entry.confidence_detail.level === "medium",
  ).length;
  const reasons = [
    "Migration recommendations come from generic Salt translation heuristics rather than library-specific rules.",
  ];
  const raiseConfidence: string[] = [];
  const policyStarterBlockers =
    getWorkflowProjectPolicyStarterBlockers(projectPolicy);
  let level: WorkflowConfidence["level"] =
    lowConfidenceCount > 0
      ? "low"
      : mediumConfidenceCount > 0 || result.summary.confirmation_required > 0
        ? "medium"
        : "high";
  let askBeforeProceeding =
    level === "low" || result.summary.confirmation_required > 0;

  if (result.summary.confirmation_required > 0) {
    reasons.push(
      "Some translated areas require explicit confirmation before the Salt result is treated as final.",
    );
    raiseConfidence.push(
      "Answer the migration clarifying questions before implementation is locked.",
    );
  }

  if (result.guidance_boundary.project_conventions.check_recommended) {
    askBeforeProceeding = true;
    level = level === "low" ? "low" : "medium";
    reasons.push("Repo policy may still refine the translated Salt answer.");
    raiseConfidence.push(
      "Run get_salt_project_context before repo-specific migration edits so local wrappers, shells, and policy are in scope.",
    );
  }

  if (lowConfidenceCount > 0) {
    raiseConfidence.push(
      "Resolve the low-confidence or manual-review regions before large edits.",
    );
  }

  if (starterValidation?.status === "needs_attention") {
    level = level === "low" ? "low" : "medium";
    askBeforeProceeding = true;
    reasons.push(
      "The returned starter code still has Salt validation issues that should be corrected before implementation continues.",
    );
    if (starterValidation.top_issue) {
      raiseConfidence.push(starterValidation.top_issue);
    }
    if (starterValidation.next_step) {
      raiseConfidence.push(starterValidation.next_step);
    }
  }

  if (policyStarterBlockers.length > 0) {
    level = level === "low" ? "low" : "medium";
    askBeforeProceeding = true;
    reasons.push(
      "Repo policy could not be fully applied to the migration starter output, so implementation is not ready yet.",
    );
    raiseConfidence.push(...policyStarterBlockers);
  }

  raiseConfidence.push(
    "Use local runtime evidence through salt-ds migrate --url or salt-ds review --url when current landmarks, action hierarchy, or visible states must stay familiar.",
  );
  raiseConfidence.push(
    "If you name a specific Salt token, prop, or API, verify the exact name against canonical Salt guidance before editing.",
  );

  return {
    level,
    reasons,
    ask_before_proceeding: askBeforeProceeding,
    raise_confidence: unique(raiseConfidence),
  };
}

function buildMigrateIdeSummary(input: {
  result: MigrateToSaltResult;
  postMigrationVerification: WorkflowPostMigrationVerification;
  projectConventionsCheck: WorkflowProjectConventionsCheck;
}): WorkflowMigrateIdeSummary {
  const { result, postMigrationVerification, projectConventionsCheck } = input;

  return {
    screen_map: takeFirstUnique(
      [
        ...result.source_ui_model.page_regions.map((region) => region.label),
        ...result.source_ui_model.ui_regions.map((region) => region.label),
      ],
      6,
    ),
    preserve: takeFirstUnique(result.familiarity_contract.preserve, 5),
    needs_confirmation: takeFirstUnique(
      [
        ...(result.familiarity_contract.requires_confirmation ?? []),
        ...(result.clarifying_questions ?? []),
      ],
      5,
    ),
    recommended_direction: takeFirstUnique(
      result.translations.map(
        (translation) =>
          `${translation.label} -> ${translation.salt_target.name ?? "nearest Salt target"}`,
      ),
      5,
    ),
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
    verify: takeFirstUnique(
      [
        ...postMigrationVerification.source_checks,
        ...postMigrationVerification.runtime_checks,
        ...postMigrationVerification.confirmation_checks,
        projectConventionsCheck.check_recommended
          ? "Confirm repo-local wrappers, shells, and migration shims before calling the migration complete."
          : null,
      ],
      5,
    ),
  };
}

function buildUpgradeConfidence(
  result: UpgradeSaltUiResult,
): WorkflowConfidence {
  const reasons = [
    "Upgrade guidance is based on structured Salt version comparison.",
  ];
  const raiseConfidence: string[] = [];
  let level: WorkflowConfidence["level"] = "high";

  if (result.ambiguity || (result.did_you_mean?.length ?? 0) > 0) {
    level = "low";
    reasons.push("The upgrade target still has ambiguity.");
    raiseConfidence.push(
      "Clarify the package or component target before applying upgrade work.",
    );
  }

  if (
    (result.breaking?.length ?? 0) > 0 ||
    (result.deprecations?.length ?? 0) > 0
  ) {
    level = level === "low" ? "low" : "medium";
    reasons.push(
      "Breaking or deprecation-driven changes still need review before rollout.",
    );
    raiseConfidence.push(
      "Review the breaking changes and deprecations before applying edits.",
    );
  }

  return {
    level,
    reasons,
    ask_before_proceeding: level === "low",
    raise_confidence: unique(raiseConfidence),
  };
}

function buildUpgradeIdeSummary(
  result: UpgradeSaltUiResult,
  projectConventionsCheck: WorkflowProjectConventionsCheck,
): WorkflowUpgradeIdeSummary {
  const requiredChanges = takeFirstUnique(
    [...(result.next_steps ?? []), ...(result.breaking ?? [])],
    5,
  );
  const optionalCleanup = takeFirstUnique(
    [
      ...(result.important ?? []).filter(
        (entry) => !requiredChanges.includes(entry),
      ),
      ...(result.nice_to_know ?? []).filter(
        (entry) => !requiredChanges.includes(entry),
      ),
    ],
    5,
  );

  return {
    target: result.decision.target,
    from_version: result.decision.from_version,
    to_version: result.decision.to_version,
    required_changes: requiredChanges,
    optional_cleanup: optionalCleanup,
    suggested_order: takeFirstUnique(
      [
        requiredChanges.length > 0
          ? "Apply the required changes first."
          : "Review the version delta before editing.",
        "Run salt-ds review on the affected files after the first upgrade pass.",
        optionalCleanup.length > 0
          ? "Apply optional cleanup after the required changes are stable."
          : null,
      ],
      3,
    ),
    verify: takeFirstUnique(
      [
        "Run salt-ds review on the changed files after the upgrade pass.",
        requiredChanges.length > 0
          ? "Confirm the required API replacements and removals compile cleanly in the affected feature."
          : "Confirm the affected feature still renders and behaves correctly after the version change.",
        projectConventionsCheck.check_recommended
          ? "Confirm repo-local wrappers, shells, and migration shims still match the upgraded Salt surface."
          : null,
      ],
      3,
    ),
  };
}

function buildPostMigrationVerification(
  result: MigrateToSaltResult,
): WorkflowPostMigrationVerification {
  return {
    source_checks: [
      "Run salt-ds review on the migrated files after the first implementation pass.",
      "Confirm the migrated code is using canonical Salt primitives, patterns, and tokens.",
    ],
    runtime_checks: [
      "Use local runtime evidence through salt-ds review --url after implementation when landmarks, visible states, or runtime behavior still need verification.",
    ],
    preserve_checks: result.familiarity_contract.preserve,
    confirmation_checks: result.familiarity_contract.requires_confirmation,
    suggested_workflow: "review_salt_ui",
    suggested_command: "salt-ds review <changed-path>",
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
  const visualInputSources = unique(
    visualEvidence.map((entry) => entry.source_type),
  ) as Array<NormalizedVisualEvidenceInput["source_type"]>;

  return {
    role: "supporting-evidence",
    not_canonical_source_of_truth: true,
    supported_inputs: [
      "structured-outline",
      "current-ui-capture",
      "mockup-image",
      "screenshot-file",
      "image-url",
    ],
    interpretation_owner: "agent-or-adapter",
    normalization_required: true,
    normalization_contract: "migrate_visual_evidence_v1",
    structured_outputs: [
      "landmarks",
      "action-hierarchy",
      "layout-signals",
      "familiarity-anchors",
      "confidence-impact",
    ],
    source_outline_provided: sourceOutlineProvided,
    source_outline_signal_counts: explicitSourceOutlineCounts,
    derived_outline_available: derivedOutlineAvailable,
    derived_outline_signal_counts: derivedOutlineCounts,
    visual_input_count: visualEvidence.length,
    visual_input_kinds: visualInputKinds,
    visual_input_sources: visualInputSources,
    runtime_capture: {
      supported_via_cli: true,
      command: "salt-ds migrate --url <url>",
      purpose:
        "Capture current landmarks, action hierarchy, visible states, and layout signals outside MCP when migration scoping needs live UI evidence.",
    },
    confidence_impact: {
      level: derivedOutlineAvailable ? "supporting" : "none",
      reasons:
        visualEvidence.length > 0
          ? [
              "Agent- or adapter-derived outline signals contributed regions, actions, and states before the Salt mapping step.",
            ]
          : sourceOutlineProvided
            ? [
                "Structured outline signals contributed regions, actions, and states before the Salt mapping step.",
              ]
            : [],
    },
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
    guidance_signals: unique([
      ...(result.guidance_sources ?? []),
      ...getSuggestedWorkflowSignals(result.suggested_follow_ups),
    ]),
    project_conventions_contract:
      result.guidance_boundary.project_conventions.contract,
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
    guidance_signals: [],
    project_conventions_contract:
      result.guidance_boundary.project_conventions.contract,
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
    guidance_signals: getSuggestedWorkflowSignals(result.suggested_follow_ups),
    project_conventions_contract:
      result.guidance_boundary.project_conventions.contract,
  };

  return {
    ...provenance,
    source_urls: buildProvenanceSourceUrls(provenance),
  };
}

function buildUpgradeProvenance(
  result: UpgradeSaltUiResult,
): WorkflowProvenance {
  const provenance = {
    canonical_source_urls: result.docs ?? [],
    related_guide_urls: [],
    starter_source_urls: [],
    guidance_signals: [],
    project_conventions_contract:
      result.guidance_boundary.project_conventions.contract,
  };

  return {
    ...provenance,
    source_urls: buildProvenanceSourceUrls(provenance),
  };
}

export function buildRepoAwareReviewWorkflowMetadata(
  input: RepoAwareReviewWorkflowInput,
): RepoAwareReviewWorkflowMetadata {
  const provenance = {
    canonical_source_urls: unique(input.canonical_source_urls),
    related_guide_urls: [],
    starter_source_urls: [],
    guidance_signals: unique([
      ...(input.guidance_signals ?? []),
      ...(input.runtime_requested ? ["runtime-evidence"] : []),
      ...(input.migration_verification ? ["migration-verification"] : []),
    ]),
    project_conventions_contract:
      input.project_conventions_contract ?? "project_conventions_v1",
  };

  return {
    confidence: buildRepoAwareReviewConfidence(input),
    provenance: {
      ...provenance,
      source_urls: buildProvenanceSourceUrls(provenance),
    },
  };
}

export function buildRepoAwareReviewNextStep(input: {
  needs_attention: boolean;
  fix_candidate_count: number;
  runtime_requested: boolean;
  migration_verification?: RepoAwareReviewMigrationVerification | null;
}): string {
  if (input.migration_verification) {
    if (input.needs_attention) {
      return input.fix_candidate_count > 0
        ? "Review the returned fixCandidates, confirm the migration verification items, apply the safest changes through the agent workflow, then rerun salt-ds review."
        : "Fix the remaining source or runtime issues, confirm the migration verification items, then rerun salt-ds review.";
    }

    return input.migration_verification.next_step;
  }

  if (input.needs_attention) {
    return input.fix_candidate_count > 0
      ? "Review the returned fixCandidates, apply the safest changes through the agent workflow, then rerun salt-ds review."
      : "Fix the remaining source or runtime issues, then rerun salt-ds review.";
  }

  return input.runtime_requested
    ? "Source validation is clean and no runtime issues were found."
    : "Source validation is clean. Add --url if you still need runtime evidence.";
}

export function buildCreateSaltUiWorkflowContract(
  registry: SaltRegistry,
  result: CreateSaltUiResult,
  input: {
    query?: string;
    context_checked?: boolean;
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
  const implementationGate = buildCreateImplementationGate(result, input.query);

  return {
    confidence: buildCreateConfidence(
      result,
      starterValidation,
      input.project_policy,
    ),
    ide_summary: buildCreateIdeSummary({
      result,
      query: input.query,
      intent,
      starterValidation,
      projectConventionsCheck,
    }),
    implementation_gate: implementationGate,
    intent,
    readiness: buildWorkflowReadiness(starterValidation, input.project_policy),
    context_requirement: input.context_checked
      ? buildSatisfiedWorkflowContextRequirement()
      : buildWorkflowContextRequirement(),
    starter_validation: starterValidation,
    repo_refinement: repoRefinement,
    project_conventions_check: projectConventionsCheck,
    provenance: buildCreateProvenance(result, starterValidation),
  };
}

export function buildReviewSaltUiWorkflowContract(
  result: ReviewSaltUiResult,
  input: {
    code?: string;
    project_policy?: WorkflowProjectPolicyArtifact | null;
  } = {},
): ReviewSaltUiWorkflowContract {
  const fixCandidates = buildReviewFixCandidates(result, input);
  const issueClasses = buildToolIssueClasses(result);
  const decision = buildReviewDecision(result, fixCandidates);
  const projectConventionsCheck = buildProjectConventionsCheck(
    result.guidance_boundary,
    input.project_policy,
  );

  return {
    confidence: buildReviewConfidence(result, fixCandidates),
    ide_summary: buildReviewIdeSummary({
      result,
      decision,
      fixCandidates,
      projectConventionsCheck,
    }),
    decision,
    fix_candidates: fixCandidates,
    issue_classes: issueClasses,
    project_conventions_check: projectConventionsCheck,
    rule_ids: collectReviewRuleIds(
      issueClasses.map((entry) => ({
        ruleId: entry.rule_id,
        label: entry.label,
        description: entry.description,
        count: entry.count,
        semanticCategories: entry.semantic_categories,
        semanticRules: entry.semantic_rules,
      })),
    ),
    provenance: buildReviewProvenance(result),
  };
}

export function buildMigrateToSaltWorkflowContract(
  registry: SaltRegistry,
  result: MigrateToSaltResult,
  input: {
    source_outline?: SourceUiOutlineInput;
    visual_evidence?: NormalizedVisualEvidenceInput[];
    context_checked?: boolean;
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

  return {
    confidence: buildMigrateConfidence(
      result,
      starterValidation,
      input.project_policy,
    ),
    ide_summary: buildMigrateIdeSummary({
      result,
      postMigrationVerification,
      projectConventionsCheck,
    }),
    readiness: buildWorkflowReadiness(starterValidation, input.project_policy),
    context_requirement: input.context_checked
      ? buildSatisfiedWorkflowContextRequirement()
      : buildWorkflowContextRequirement(),
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
    provenance: buildMigrateProvenance(result, starterValidation),
  };
}

export function buildUpgradeSaltUiWorkflowContract(
  result: UpgradeSaltUiResult,
  input: {
    project_policy?: WorkflowProjectPolicyArtifact | null;
  } = {},
): UpgradeSaltUiWorkflowContract {
  const projectConventionsCheck = buildProjectConventionsCheck(
    result.guidance_boundary,
    input.project_policy,
  );

  return {
    confidence: buildUpgradeConfidence(result),
    ide_summary: buildUpgradeIdeSummary(result, projectConventionsCheck),
    project_conventions_check: projectConventionsCheck,
    rule_ids: getUpgradeRuleIds(),
    provenance: buildUpgradeProvenance(result),
  };
}
