import type {
  AnalyzeSaltCodeResult,
  ChooseSaltSolutionResult,
  CompareSaltVersionsResult,
  SourceUiOutlineInput,
  TranslateUiToSaltResult,
} from "../../../semantic-core/src/index.js";
import type { SuggestedFollowUp } from "../../../semantic-core/src/tools/consumerPresentation.js";
import { toPublicWorkflowLabel } from "../../../semantic-core/src/tools/publicWorkflowLabels.js";
import {
  buildCreateIntent,
  buildReviewIssueClasses,
  collectReviewRuleIds,
  deriveReviewRuleId,
  getCreateRuleIds,
  getMigrationRuleIds,
  getUpgradeRuleIds,
  type WorkflowIssueClass,
} from "../../../semantic-core/src/tools/workflowRuleIds.js";

export interface ToolWorkflowConfidence {
  level: "high" | "medium" | "low";
  reasons: string[];
  ask_before_proceeding: boolean;
  raise_confidence: string[];
}

export interface ToolFixCandidate {
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

export interface ToolFixCandidates {
  total_count: number;
  deterministic_count: number;
  manual_review_count: number;
  candidates: ToolFixCandidate[];
  notes: string[];
}

export interface ToolPostMigrationVerification {
  source_checks: string[];
  runtime_checks: string[];
  preserve_checks: string[];
  confirmation_checks: string[];
  suggested_workflow: "analyze_salt_code";
  suggested_command: string;
}

export interface ToolVisualEvidenceContract {
  role: "supporting-evidence";
  not_canonical_source_of_truth: true;
  supported_inputs: Array<"structured-outline" | "current-ui-capture">;
  planned_inputs: Array<"screenshot-file" | "image-url" | "mockup-image">;
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

export interface ToolWorkflowIntent {
  user_task: string;
  key_interaction: string;
  composition_direction: string;
  canonical_choice: string | null;
  rule_ids: string[];
}

export interface ToolIssueClass {
  rule_id: WorkflowIssueClass["ruleId"];
  label: string;
  description: string;
  count: number;
  semantic_categories: string[];
  semantic_rules: string[];
}

function unique(values: string[]): string[] {
  return [...new Set(values)];
}

function normalizeWorkflowLabel(label: string): string {
  return toPublicWorkflowLabel(label);
}

function normalizeSuggestedFollowUps(
  followUps?: SuggestedFollowUp[],
): SuggestedFollowUp[] | undefined {
  if (!Array.isArray(followUps)) {
    return followUps;
  }

  return followUps.map((entry) => ({
    ...entry,
    workflow: normalizeWorkflowLabel(entry.workflow),
  }));
}

function normalizeChooseResult(
  result: ChooseSaltSolutionResult,
): ChooseSaltSolutionResult {
  if (!result.suggested_follow_ups) {
    return result;
  }

  return {
    ...result,
    suggested_follow_ups: normalizeSuggestedFollowUps(
      result.suggested_follow_ups,
    ),
  };
}

function normalizeTranslateResult(
  result: TranslateUiToSaltResult,
): TranslateUiToSaltResult {
  if (!result.suggested_follow_ups) {
    return result;
  }

  return {
    ...result,
    suggested_follow_ups: normalizeSuggestedFollowUps(
      result.suggested_follow_ups,
    ),
  };
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

function buildCreateConfidence(
  result: ChooseSaltSolutionResult,
): ToolWorkflowConfidence {
  const reasons: string[] = [];
  const raiseConfidence: string[] = [];
  let level: ToolWorkflowConfidence["level"] = "high";
  let askBeforeProceeding = false;

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

  return {
    level,
    reasons,
    ask_before_proceeding: askBeforeProceeding,
    raise_confidence: unique(raiseConfidence),
  };
}

function buildCreateIntentPayload(
  query: string | undefined,
  result: ChooseSaltSolutionResult,
): ToolWorkflowIntent {
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
): ToolFixCandidate | null {
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
): ToolFixCandidate | null {
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

function toToolIssueClass(entry: WorkflowIssueClass): ToolIssueClass {
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
  result: AnalyzeSaltCodeResult,
): ToolFixCandidates {
  const candidates: ToolFixCandidate[] = [];
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

  return {
    total_count: candidates.length,
    deterministic_count: deterministicCount,
    manual_review_count: manualReviewCount,
    candidates,
    notes:
      candidates.length > 0
        ? [
            "Use fix_candidates as agent-applied remediation guidance. The MCP returns structured candidates but does not mutate files directly.",
          ]
        : [],
  };
}

function buildReviewConfidence(
  result: AnalyzeSaltCodeResult,
  fixCandidates: ToolFixCandidates,
): ToolWorkflowConfidence {
  const reasons = [
    "Review findings come from deterministic source validation against canonical Salt guidance.",
  ];
  const raiseConfidence: string[] = [];
  let level: ToolWorkflowConfidence["level"] = "high";

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

function buildToolIssueClasses(
  result: AnalyzeSaltCodeResult,
): ToolIssueClass[] {
  return buildReviewIssueClasses(
    (result.issues ?? []).filter(
      (entry): entry is Record<string, unknown> =>
        Boolean(entry) && typeof entry === "object",
    ),
    {
      includeEvidenceGap: false,
    },
  ).map(toToolIssueClass);
}

function buildMigrateConfidence(
  result: TranslateUiToSaltResult,
): ToolWorkflowConfidence {
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
  const level: ToolWorkflowConfidence["level"] =
    lowConfidenceCount > 0
      ? "low"
      : mediumConfidenceCount > 0 || result.summary.confirmation_required > 0
        ? "medium"
        : "high";

  if (result.summary.confirmation_required > 0) {
    reasons.push(
      "Some translated areas require explicit confirmation before the Salt result is treated as final.",
    );
    raiseConfidence.push(
      "Answer the migration clarifying questions before implementation is locked.",
    );
  }

  if (lowConfidenceCount > 0) {
    raiseConfidence.push(
      "Resolve the low-confidence or manual-review regions before large edits.",
    );
  }

  raiseConfidence.push(
    "Use local runtime evidence through salt-ds migrate --url or salt-ds review --url when current landmarks, action hierarchy, or visible states must stay familiar.",
  );

  return {
    level,
    reasons,
    ask_before_proceeding:
      level === "low" || result.summary.confirmation_required > 0,
    raise_confidence: unique(raiseConfidence),
  };
}

function buildUpgradeConfidence(
  result: CompareSaltVersionsResult,
): ToolWorkflowConfidence {
  const reasons = [
    "Upgrade guidance is based on structured Salt version comparison.",
  ];
  const raiseConfidence: string[] = [];
  let level: ToolWorkflowConfidence["level"] = "high";

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

function buildPostMigrationVerification(
  result: TranslateUiToSaltResult,
): ToolPostMigrationVerification {
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
    suggested_workflow: "analyze_salt_code",
    suggested_command: "salt-ds review <changed-path>",
  };
}

function buildTranslateVisualEvidenceContract(
  input: { source_outline?: SourceUiOutlineInput } = {},
): ToolVisualEvidenceContract {
  const counts = {
    regions: input.source_outline?.regions?.length ?? 0,
    actions: input.source_outline?.actions?.length ?? 0,
    states: input.source_outline?.states?.length ?? 0,
    notes: input.source_outline?.notes?.length ?? 0,
  };
  const sourceOutlineProvided =
    counts.regions + counts.actions + counts.states + counts.notes > 0;

  return {
    role: "supporting-evidence",
    not_canonical_source_of_truth: true,
    supported_inputs: ["structured-outline", "current-ui-capture"],
    planned_inputs: ["screenshot-file", "image-url", "mockup-image"],
    structured_outputs: [
      "landmarks",
      "action-hierarchy",
      "layout-signals",
      "familiarity-anchors",
      "confidence-impact",
    ],
    source_outline_provided: sourceOutlineProvided,
    source_outline_signal_counts: counts,
    runtime_capture: {
      supported_via_cli: true,
      command: "salt-ds migrate --url <url>",
      purpose:
        "Capture current landmarks, action hierarchy, visible states, and layout signals outside MCP when migration scoping needs live UI evidence.",
    },
    confidence_impact: {
      level: sourceOutlineProvided ? "supporting" : "none",
      reasons: sourceOutlineProvided
        ? [
            "Structured outline signals contributed regions, actions, and states before the Salt mapping step.",
          ]
        : [],
    },
  };
}

export function withChooseWorkflowGuidance(
  result: ChooseSaltSolutionResult,
  input: {
    query?: string;
  } = {},
): ChooseSaltSolutionResult & {
  confidence: ToolWorkflowConfidence;
  intent: ToolWorkflowIntent;
} {
  const normalizedResult = normalizeChooseResult(result);
  return {
    ...normalizedResult,
    confidence: buildCreateConfidence(normalizedResult),
    intent: buildCreateIntentPayload(input.query, normalizedResult),
  };
}

export function withAnalyzeWorkflowGuidance(
  result: AnalyzeSaltCodeResult,
): AnalyzeSaltCodeResult & {
  confidence: ToolWorkflowConfidence;
  fix_candidates: ToolFixCandidates;
  issue_classes: ToolIssueClass[];
  rule_ids: string[];
} {
  const fixCandidates = buildReviewFixCandidates(result);
  const issueClasses = buildToolIssueClasses(result);
  return {
    ...result,
    confidence: buildReviewConfidence(result, fixCandidates),
    fix_candidates: fixCandidates,
    issue_classes: issueClasses,
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
  };
}

export function withTranslateWorkflowGuidance(
  result: TranslateUiToSaltResult,
  input: {
    source_outline?: SourceUiOutlineInput;
  } = {},
): TranslateUiToSaltResult & {
  confidence: ToolWorkflowConfidence;
  post_migration_verification: ToolPostMigrationVerification;
  visual_evidence_contract: ToolVisualEvidenceContract;
  rule_ids: string[];
} {
  const normalizedResult = normalizeTranslateResult(result);
  return {
    ...normalizedResult,
    confidence: buildMigrateConfidence(normalizedResult),
    rule_ids: getMigrationRuleIds({
      projectConventionsMayMatter:
        normalizedResult.guidance_boundary.project_conventions
          .check_recommended,
      runtimeScopingMatters: false,
      requiresConfirmation: normalizedResult.summary.confirmation_required > 0,
    }),
    post_migration_verification:
      buildPostMigrationVerification(normalizedResult),
    visual_evidence_contract: buildTranslateVisualEvidenceContract(input),
  };
}

export function withCompareWorkflowGuidance(
  result: CompareSaltVersionsResult,
): CompareSaltVersionsResult & {
  confidence: ToolWorkflowConfidence;
  rule_ids: string[];
} {
  return {
    ...result,
    confidence: buildUpgradeConfidence(result),
    rule_ids: getUpgradeRuleIds(),
  };
}
