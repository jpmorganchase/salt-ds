import path from "node:path";
import { inspectUrl } from "../../../runtime-inspector-core/src/index.js";
import {
  type ChooseSaltSolutionResult,
  type CompareSaltVersionsResult,
  chooseSaltSolution,
  compareSaltVersions,
  type TranslateUiToSaltResult,
  translateUiToSalt,
} from "../../../semantic-core/src/index.js";
import {
  replaceInternalWorkflowLabels,
  toPublicWorkflowLabel,
} from "../../../semantic-core/src/tools/publicWorkflowLabels.js";
import {
  buildCreateIntent,
  buildReviewIssueClasses,
  type CreateRuleId,
  collectReviewRuleIds,
  getCreateRuleIds,
  getMigrationRuleIds,
  getUpgradeRuleIds,
  type MigrationRuleId,
  type ReviewRuleId,
  type UpgradeRuleId,
  type WorkflowIssueClass,
} from "../../../semantic-core/src/tools/workflowRuleIds.js";
import { writeJsonFile } from "../lib/common.js";
import { collectSaltInfo } from "../lib/infoContext.js";
import { analyzeLintTargets } from "../lib/lintAnalysis.js";
import {
  assessMigrationVerification,
  loadMigrationVerificationContract,
  type MigrationVerificationSummary,
} from "../lib/migrationVerification.js";
import {
  type LoadedSourceOutline,
  loadSourceOutlineFile,
} from "../lib/migrationVisualEvidence.js";
import {
  loadCreateProjectConventionsSummary,
  type WorkflowProjectConventionsSummary,
} from "../lib/projectConventionsWorkflow.js";
import { resolveSemanticRegistry } from "../lib/registry.js";
import {
  buildReviewFixCandidates,
  type ReviewFixCandidatesResult,
} from "../lib/reviewFixCandidates.js";
import type {
  LintCommandResult,
  RequiredCliIo,
  SaltInfoResult,
} from "../types.js";

type RuntimeInspectResult = Awaited<ReturnType<typeof inspectUrl>>;

interface WorkflowConfidence {
  level: "high" | "medium" | "low";
  reasons: string[];
  askBeforeProceeding: boolean;
  raiseConfidence: string[];
}

interface PublicSuggestedFollowUp {
  workflow: string;
  reason: string;
  args: Record<string, unknown>;
}

type PublicCreateRecommendation = Omit<
  ChooseSaltSolutionResult,
  "suggested_follow_ups"
> & {
  suggested_follow_ups?: PublicSuggestedFollowUp[];
};

type PublicTranslateDecisionGate = Omit<
  NonNullable<TranslateUiToSaltResult["decision_gates"]>[number],
  "suggested_workflow"
> & {
  suggested_workflow: string;
};

type PublicTranslateResult = Omit<
  TranslateUiToSaltResult,
  "decision_gates" | "suggested_follow_ups"
> & {
  decision_gates?: PublicTranslateDecisionGate[];
  suggested_follow_ups?: PublicSuggestedFollowUp[];
};

interface ReviewWorkflowResult {
  workflow: "review";
  context: SaltInfoResult;
  confidence: WorkflowConfidence;
  issueClasses: WorkflowIssueClass[];
  ruleIds: ReviewRuleId[];
  sourceValidation: LintCommandResult;
  fixCandidates: ReviewFixCandidatesResult;
  migrationVerification: MigrationVerificationSummary | null;
  runtimeEvidence: {
    requested: boolean;
    url: string | null;
    result: RuntimeInspectResult | null;
  };
  summary: {
    status: "clean" | "needs_attention";
    filesNeedingAttention: number;
    cleanFiles: number;
    runtimeIssues: number;
    runtimeMode: string | null;
    fixCandidateCount: number;
    deterministicFixCandidateCount: number;
    manualReviewFixCandidateCount: number;
    nextStep: string;
  };
  notes: string[];
}

interface CreateWorkflowResult {
  workflow: "create";
  context: SaltInfoResult;
  confidence: WorkflowConfidence;
  projectConventions: WorkflowProjectConventionsSummary | null;
  intent: {
    userTask: string;
    keyInteraction: string;
    compositionDirection: string;
    canonicalChoice: string | null;
    ruleIds: CreateRuleId[];
  };
  recommendation: PublicCreateRecommendation;
  summary: {
    mode: "recommend" | "compare";
    solutionType: string;
    decisionName: string | null;
    finalDecisionName: string | null;
    nextStep: string;
    suggestedFollowUps: string[];
  };
  notes: string[];
}

interface MigrateWorkflowResult {
  workflow: "migrate";
  context: SaltInfoResult;
  confidence: WorkflowConfidence;
  ruleIds: MigrationRuleId[];
  translation: PublicTranslateResult;
  visualEvidence: {
    contract: {
      role: "supporting-evidence";
      notCanonicalSourceOfTruth: true;
      supportedInputs: Array<"structured-outline" | "current-ui-capture">;
      plannedInputs: Array<"screenshot-file" | "image-url" | "mockup-image">;
      structuredOutputs: Array<
        | "landmarks"
        | "action-hierarchy"
        | "layout-signals"
        | "familiarity-anchors"
        | "confidence-impact"
      >;
    };
    inputs: {
      structuredOutline: {
        provided: boolean;
        path: string | null;
        regions: number;
        actions: number;
        states: number;
        notes: number;
      };
      currentUiCapture: {
        requested: boolean;
        url: string | null;
        mode: string | null;
        currentExperienceCaptured: boolean;
        screenshotArtifacts: number;
      };
    };
    confidenceImpact: {
      level: "none" | "supporting" | "stronger-scoping";
      reasons: string[];
    };
  };
  migrationScope: {
    questions: string[];
    preserveFocus: string[];
    allowSaltChanges: string[];
    confirmationTriggers: string[];
    currentExperienceCaptured: boolean;
    runtimeRecommended: boolean;
  };
  postMigrationVerification: {
    sourceChecks: string[];
    runtimeChecks: string[];
    preserveChecks: string[];
    confirmationChecks: string[];
    suggestedWorkflow: "review";
    suggestedCommand: string;
  };
  runtimeEvidence: {
    requested: boolean;
    url: string | null;
    result: RuntimeInspectResult | null;
    currentExperience: {
      pageTitle: string;
      landmarks: string[];
      interactionAnchors: string[];
      structure: string[];
      layoutSignals: string[];
    } | null;
  };
  summary: {
    translationCount: number;
    manualReviews: number;
    confirmationRequired: number;
    runtimeMode: string | null;
    nextStep: string;
  };
  notes: string[];
}

interface UpgradeWorkflowResult {
  workflow: "upgrade";
  context: SaltInfoResult;
  confidence: WorkflowConfidence;
  ruleIds: UpgradeRuleId[];
  comparison: CompareSaltVersionsResult;
  summary: {
    target: string;
    fromVersion: string;
    toVersion: string;
    changeCount: number;
    nextStep: string;
  };
  notes: string[];
}

function normalizeVersion(
  rawVersion: string | null | undefined,
): string | null {
  if (!rawVersion) {
    return null;
  }

  const match = rawVersion.match(/\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?/);
  return match?.[0] ?? null;
}

function toPublicWorkflowName(workflow: string): string {
  return toPublicWorkflowLabel(workflow);
}

function sanitizeWorkflowText(text: string): string {
  return replaceInternalWorkflowLabels(text);
}

function sanitizeWorkflowPayload<T>(value: T): T {
  if (typeof value === "string") {
    return sanitizeWorkflowText(value) as T;
  }

  if (Array.isArray(value)) {
    return value.map((entry) => sanitizeWorkflowPayload(entry)) as T;
  }

  if (value && typeof value === "object") {
    const sanitizedEntries = Object.entries(value).map(([key, entry]) => [
      key,
      key === "workflow" || key === "suggested_workflow"
        ? typeof entry === "string"
          ? toPublicWorkflowName(entry)
          : entry
        : sanitizeWorkflowPayload(entry),
    ]);
    return Object.fromEntries(sanitizedEntries) as T;
  }

  return value;
}

function formatProjectPolicyLayer(
  layer: { id: string; scope: string } | null | undefined,
): string | null {
  if (!layer) {
    return null;
  }

  return `${layer.id} (${layer.scope})`;
}

function formatProjectPolicyLayers(
  layers: Array<{ id: string; scope: string }>,
): string | null {
  if (layers.length === 0) {
    return null;
  }

  return layers.map((layer) => formatProjectPolicyLayer(layer)).join(", ");
}

function buildCreateConfidence(
  recommendation: PublicCreateRecommendation,
  context: SaltInfoResult,
  projectConventions: WorkflowProjectConventionsSummary | null,
): WorkflowConfidence {
  const reasons: string[] = [];
  const raiseConfidence: string[] = [];
  let level: WorkflowConfidence["level"] = "high";
  let askBeforeProceeding = false;

  if (recommendation.decision.name) {
    reasons.push("Canonical Salt guidance resolved a concrete starting point.");
  } else {
    level = "low";
    askBeforeProceeding = true;
    reasons.push(
      "The create workflow did not resolve a concrete Salt decision.",
    );
  }

  if (
    recommendation.ambiguity ||
    (recommendation.did_you_mean?.length ?? 0) > 0
  ) {
    level = "low";
    askBeforeProceeding = true;
    reasons.push("The request still has ambiguity that should be clarified.");
    raiseConfidence.push(
      "Clarify the target flow or entity before applying the create result.",
    );
  }

  if (recommendation.guidance_boundary.project_conventions.check_recommended) {
    if (projectConventions?.consulted) {
      reasons.push(
        projectConventions.applied
          ? "Repo policy refined the canonical Salt answer for this project."
          : "Repo policy was checked and kept the canonical Salt answer.",
      );
    } else {
      level = level === "low" ? "low" : "medium";
      reasons.push("Repo policy may still refine the canonical Salt answer.");
      raiseConfidence.push(
        "Check repo-local project conventions before implementation is locked.",
      );
    }
  }

  if (!context.policy.teamConfigPath && !context.policy.stackConfigPath) {
    level = level === "low" ? "low" : "medium";
    reasons.push("No declared Salt policy was found in the repo yet.");
    raiseConfidence.push(
      "Run salt-ds init if the repo still needs a default Salt policy file.",
    );
  }

  if ((projectConventions?.warnings.length ?? 0) > 0) {
    level = level === "low" ? "low" : "medium";
    reasons.push(
      "Project policy could not be fully resolved, so the canonical Salt answer may still need a manual policy check.",
    );
    raiseConfidence.push(projectConventions!.warnings[0]!);
  }

  if ((recommendation.suggested_follow_ups?.length ?? 0) > 0) {
    raiseConfidence.push(
      "Ground the recommendation with examples or canonical entity details before editing.",
    );
  }

  return {
    level,
    reasons,
    askBeforeProceeding,
    raiseConfidence: Array.from(new Set(raiseConfidence)),
  };
}

function buildReviewConfidence(
  sourceValidation: LintCommandResult,
  fixCandidates: ReviewFixCandidatesResult,
  context: SaltInfoResult,
  runtimeRequested: boolean,
  runtimeResult: RuntimeInspectResult | null,
  migrationVerification: MigrationVerificationSummary | null,
): WorkflowConfidence {
  const reasons: string[] = [];
  const raiseConfidence: string[] = [];
  let level: WorkflowConfidence["level"] = "high";

  reasons.push("Review findings come from deterministic source validation.");

  if (fixCandidates.manualReviewCount > 0) {
    level = "medium";
    reasons.push(
      "Some findings still need manual judgment after the deterministic pass.",
    );
    raiseConfidence.push(
      "Review the manual fix candidates before applying repo changes.",
    );
  }

  if (!runtimeRequested && context.runtime.detectedTargets.length > 0) {
    reasons.push(
      "A runtime target exists, but this review stayed source-only.",
    );
    raiseConfidence.push(
      "Add --url if rendered structure, runtime errors, or visible states still matter.",
    );
  }

  if (runtimeRequested) {
    reasons.push("Runtime evidence was checked in the same review pass.");
  }

  if ((runtimeResult?.errors.length ?? 0) > 0) {
    level = "medium";
    reasons.push("Runtime evidence reported issues that still need judgment.");
  }

  if (migrationVerification) {
    if (migrationVerification.summary.notChecked > 0) {
      level = "medium";
      reasons.push(
        "Some migration verification checks were not compared against runtime evidence yet.",
      );
      raiseConfidence.push(
        "Add --url with --migration-report to compare the migrated result against the migration contract.",
      );
    }

    if (migrationVerification.summary.manualReview > 0) {
      level = "medium";
      reasons.push(
        "The migration verification contract still has checks that need explicit confirmation.",
      );
      raiseConfidence.push(
        "Confirm the preserved task flow, landmarks, and other migration verification items before calling the migration done.",
      );
    }
  }

  return {
    level,
    reasons,
    askBeforeProceeding: false,
    raiseConfidence: Array.from(new Set(raiseConfidence)),
  };
}

function buildMigrateConfidence(
  translation: PublicTranslateResult,
  context: SaltInfoResult,
  runtimeResult: RuntimeInspectResult | null,
  sourceOutline: LoadedSourceOutline | null,
): WorkflowConfidence {
  const translations = translation.translations;
  const lowConfidenceCount = translations.filter(
    (entry) => entry.confidence_detail.level === "low",
  ).length;
  const mediumConfidenceCount = translations.filter(
    (entry) => entry.confidence_detail.level === "medium",
  ).length;
  const reasons: string[] = [
    "Migration recommendations come from generic Salt translation heuristics rather than library-specific rules.",
  ];
  const raiseConfidence: string[] = [];
  const level: WorkflowConfidence["level"] =
    lowConfidenceCount > 0
      ? "low"
      : mediumConfidenceCount > 0 ||
          translation.summary.confirmation_required > 0
        ? "medium"
        : "high";

  if (translation.summary.confirmation_required > 0) {
    reasons.push(
      "Some translated areas require explicit confirmation before the Salt result is treated as final.",
    );
    raiseConfidence.push(
      "Answer the migrationScope questions before implementation is locked.",
    );
  }

  if (sourceOutline) {
    reasons.push(
      "Structured visual evidence was used to model regions, actions, and states before translation.",
    );
  } else if (!translation.source_profile.code_provided) {
    raiseConfidence.push(
      "Add --source-outline when the migration starts from a mockup, screenshot notes, or a rough design outline.",
    );
  }

  if (runtimeResult) {
    reasons.push(
      "Runtime evidence was used to scope the current experience before migration.",
    );
  } else if (context.runtime.detectedTargets.length > 0) {
    reasons.push(
      "No runtime evidence was used even though a runtime target is available.",
    );
    raiseConfidence.push(
      "Add --url when landmarks, action hierarchy, or visible states must stay familiar.",
    );
  }

  if (lowConfidenceCount > 0) {
    raiseConfidence.push(
      "Resolve the low-confidence or manual-review regions before large edits.",
    );
  }

  return {
    level,
    reasons,
    askBeforeProceeding:
      level === "low" || translation.summary.confirmation_required > 0,
    raiseConfidence: Array.from(new Set(raiseConfidence)),
  };
}

function buildMigrateVisualEvidence(
  sourceOutline: LoadedSourceOutline | null,
  requestedUrl: string | null,
  runtimeResult: RuntimeInspectResult | null,
): MigrateWorkflowResult["visualEvidence"] {
  const reasons: string[] = [];
  let level: MigrateWorkflowResult["visualEvidence"]["confidenceImpact"]["level"] =
    "none";

  if (sourceOutline) {
    level = "supporting";
    reasons.push(
      "Structured outline signals contributed regions, actions, and states before the Salt mapping step.",
    );
  }

  if (runtimeResult) {
    level = sourceOutline ? "stronger-scoping" : "supporting";
    reasons.push(
      "Current UI capture contributed live landmarks, action hierarchy, structure, and layout signals.",
    );
  }

  return {
    contract: {
      role: "supporting-evidence",
      notCanonicalSourceOfTruth: true,
      supportedInputs: ["structured-outline", "current-ui-capture"],
      plannedInputs: ["screenshot-file", "image-url", "mockup-image"],
      structuredOutputs: [
        "landmarks",
        "action-hierarchy",
        "layout-signals",
        "familiarity-anchors",
        "confidence-impact",
      ],
    },
    inputs: {
      structuredOutline: {
        provided: Boolean(sourceOutline),
        path: sourceOutline?.path ?? null,
        regions: sourceOutline?.counts.regions ?? 0,
        actions: sourceOutline?.counts.actions ?? 0,
        states: sourceOutline?.counts.states ?? 0,
        notes: sourceOutline?.counts.notes ?? 0,
      },
      currentUiCapture: {
        requested: Boolean(requestedUrl),
        url: requestedUrl,
        mode: runtimeResult?.inspectionMode ?? null,
        currentExperienceCaptured: Boolean(runtimeResult),
        screenshotArtifacts: runtimeResult?.screenshots.length ?? 0,
      },
    },
    confidenceImpact: {
      level,
      reasons,
    },
  };
}

function describeMigrateVisualEvidence(
  visualEvidence: MigrateWorkflowResult["visualEvidence"],
): string {
  const activeInputs: string[] = [];
  if (visualEvidence.inputs.structuredOutline.provided) {
    activeInputs.push("structured outline");
  }
  if (visualEvidence.inputs.currentUiCapture.requested) {
    activeInputs.push("current UI capture");
  }

  if (activeInputs.length === 0) {
    return "none";
  }

  return `${activeInputs.join(" + ")} (${visualEvidence.confidenceImpact.level})`;
}

function buildUpgradeConfidence(
  comparison: CompareSaltVersionsResult,
  inferredFromVersion: boolean,
): WorkflowConfidence {
  const reasons: string[] = [];
  const raiseConfidence: string[] = [];
  let level: WorkflowConfidence["level"] = "high";

  reasons.push(
    "Upgrade guidance is based on structured Salt version comparison.",
  );

  if (comparison.ambiguity || (comparison.did_you_mean?.length ?? 0) > 0) {
    level = "low";
    reasons.push("The upgrade target still has ambiguity.");
    raiseConfidence.push(
      "Clarify the package or component target before applying upgrade work.",
    );
  }

  if (
    (comparison.breaking?.length ?? 0) > 0 ||
    (comparison.deprecations?.length ?? 0) > 0
  ) {
    level = level === "low" ? "low" : "medium";
    reasons.push(
      "Breaking or deprecation-driven changes still need review before rollout.",
    );
    raiseConfidence.push(
      "Review the breaking changes and deprecations before applying edits.",
    );
  }

  if (inferredFromVersion) {
    level = level === "low" ? "low" : "medium";
    reasons.push(
      "The source version was inferred from repo context rather than passed explicitly.",
    );
    raiseConfidence.push(
      "Pass --from-version explicitly if the detected package version is not the true migration boundary.",
    );
  }

  return {
    level,
    reasons,
    askBeforeProceeding: level === "low",
    raiseConfidence: Array.from(new Set(raiseConfidence)),
  };
}

function buildPostMigrationVerification(
  translation: PublicTranslateResult,
  runtimeRequested: boolean,
  sourceOutline: LoadedSourceOutline | null,
  currentExperience: MigrateWorkflowResult["runtimeEvidence"]["currentExperience"],
): MigrateWorkflowResult["postMigrationVerification"] {
  const sourceChecks = [
    "Run salt-ds review on the migrated files after the first implementation pass.",
    "Confirm the migrated code is using canonical Salt primitives, patterns, and tokens.",
  ];
  const runtimeChecks = runtimeRequested
    ? [
        "Use the captured runtime evidence as the baseline when checking landmarks, action hierarchy, and visible states after migration.",
        "Rerun salt-ds review --url on the migrated result if runtime behavior still needs confirmation.",
      ]
    : [
        "Use salt-ds review --url after the first migration pass when landmarks, visible states, or runtime behavior still need verification.",
      ];
  const preserveChecks = [...translation.familiarity_contract.preserve];
  const confirmationChecks = [
    ...translation.familiarity_contract.requires_confirmation,
  ];

  if (sourceOutline) {
    sourceChecks.push(
      "Confirm the first Salt scaffold still covers the outlined regions, actions, and states before deeper implementation polish.",
    );
  }

  if (sourceOutline && currentExperience) {
    const outlinedRegions = sourceOutline.outline.regions
      ?.slice(0, 3)
      .join(", ");
    const outlinedActions = sourceOutline.outline.actions
      ?.slice(0, 3)
      .join(", ");
    const outlinedStates = sourceOutline.outline.states?.slice(0, 3).join(", ");
    const liveLandmarks = currentExperience.landmarks.slice(0, 3).join(", ");
    const liveActions = currentExperience.interactionAnchors
      .slice(0, 3)
      .join(", ");

    runtimeChecks.push(
      "Compare the migrated Salt result against both the structured outline and the captured runtime baseline before sign-off.",
    );

    if (outlinedRegions && liveLandmarks) {
      preserveChecks.push(
        `Keep the live landmarks (${liveLandmarks}) recognizable within the outlined regions (${outlinedRegions}) unless the workflow change is explicitly approved.`,
      );
    }

    if (outlinedActions && liveActions) {
      preserveChecks.push(
        `Confirm the live action anchors (${liveActions}) still fit the outlined action set (${outlinedActions}) after migration.`,
      );
    }

    if (outlinedStates) {
      confirmationChecks.push(
        `Recheck the outlined states (${outlinedStates}) against the running experience before rollout.`,
      );
    }

    confirmationChecks.push(
      "Resolve any mismatch between the structured outline and the captured runtime experience before calling the migration plan done.",
    );
  }

  return {
    sourceChecks: Array.from(new Set(sourceChecks)),
    runtimeChecks: Array.from(new Set(runtimeChecks)),
    preserveChecks: Array.from(new Set(preserveChecks)),
    confirmationChecks: Array.from(new Set(confirmationChecks)),
    suggestedWorkflow: "review",
    suggestedCommand: "salt-ds review <changed-path>",
  };
}

function buildMigrateQuestions(
  translation: PublicTranslateResult,
  sourceOutline: LoadedSourceOutline | null,
  currentExperience: MigrateWorkflowResult["runtimeEvidence"]["currentExperience"],
): string[] {
  const combinedQuestions: string[] = [];

  if (sourceOutline && currentExperience) {
    const outlinedRegions = sourceOutline.outline.regions
      ?.slice(0, 3)
      .join(", ");
    const outlinedActions = sourceOutline.outline.actions
      ?.slice(0, 3)
      .join(", ");
    const outlinedStates = sourceOutline.outline.states?.slice(0, 3).join(", ");
    const liveLandmarks = currentExperience.landmarks.slice(0, 3).join(", ");
    const liveActions = currentExperience.interactionAnchors
      .slice(0, 3)
      .join(", ");

    if (outlinedRegions && liveLandmarks) {
      combinedQuestions.push(
        `Which live landmarks (${liveLandmarks}) must stay recognizable inside the outlined regions (${outlinedRegions})?`,
      );
    }

    if (outlinedActions && liveActions) {
      combinedQuestions.push(
        `Which live actions (${liveActions}) are non-negotiable, and do they still fit the outlined action set (${outlinedActions})?`,
      );
    }

    if (outlinedStates) {
      combinedQuestions.push(
        `Do the outlined states (${outlinedStates}) match the running experience closely enough for the first migration pass?`,
      );
    }
  }

  return Array.from(
    new Set([
      ...(combinedQuestions.length > 0 ? combinedQuestions : []),
      ...(translation.clarifying_questions ?? []),
    ]),
  ).slice(0, 5);
}

function buildReviewNotes(
  context: SaltInfoResult,
  lint: LintCommandResult,
  runtimeRequested: boolean,
): string[] {
  const notes = [...context.notes, ...lint.notes];
  if (runtimeRequested) {
    notes.push(
      "Runtime evidence was requested through salt-ds review --url and evaluated after the source pass.",
    );
  } else if (context.runtime.detectedTargets.length > 0) {
    notes.push(
      `Use salt-ds review --url ${context.runtime.detectedTargets[0].url} if rendered behavior still needs runtime evidence.`,
    );
  } else {
    notes.push(
      "No detected runtime target. Run salt-ds doctor if runtime evidence is still needed after source review.",
    );
  }

  return Array.from(new Set(notes));
}

function formatReviewReport(result: ReviewWorkflowResult): string {
  const lines = [
    "Salt DS Review",
    `Root: ${result.context.rootDir}`,
    `Status: ${result.summary.status}`,
    `Confidence: ${result.confidence.level}`,
    `Files needing attention: ${result.summary.filesNeedingAttention}`,
    `Clean files: ${result.summary.cleanFiles}`,
    `Next step: ${result.summary.nextStep}`,
  ];

  if (result.confidence.reasons.length > 0) {
    lines.push(`Why: ${result.confidence.reasons[0]}`);
  }

  if (result.confidence.raiseConfidence.length > 0) {
    lines.push(`Raise confidence: ${result.confidence.raiseConfidence[0]}`);
  }

  if (result.issueClasses.length > 0) {
    lines.push("Issue classes:");
    lines.push(
      ...result.issueClasses.map(
        (entry) => `- ${entry.ruleId}: ${entry.label} (${entry.count})`,
      ),
    );
  }

  if (result.fixCandidates.totalCount > 0) {
    lines.push(
      `Fix candidates: ${result.summary.fixCandidateCount} (${result.summary.deterministicFixCandidateCount} deterministic, ${result.summary.manualReviewFixCandidateCount} manual review)`,
    );
  }

  if (result.migrationVerification) {
    lines.push(
      `Migration verification: ${result.migrationVerification.summary.verified} verified, ${result.migrationVerification.summary.manualReview} manual review, ${result.migrationVerification.summary.notChecked} not checked`,
    );
  }

  if (result.runtimeEvidence.requested) {
    lines.push(
      `Runtime mode: ${result.summary.runtimeMode ?? "not-requested"}`,
    );
    lines.push(`Runtime issues: ${result.summary.runtimeIssues}`);
  }

  if (result.sourceValidation.files.length > 0) {
    lines.push("Top files:");
    lines.push(
      ...result.sourceValidation.files.slice(0, 5).map((file) => {
        const counts = `${file.summary.errors} error${file.summary.errors === 1 ? "" : "s"}, ${file.summary.warnings} warning${file.summary.warnings === 1 ? "" : "s"}, ${file.summary.infos} info${file.summary.infos === 1 ? "" : "s"}`;
        return `- ${file.relativePath}: ${file.decision.status} (${counts})`;
      }),
    );
  }

  if (result.runtimeEvidence.result?.artifacts.length) {
    lines.push("Artifacts:");
    lines.push(
      ...result.runtimeEvidence.result.artifacts.map(
        (artifact) =>
          `- ${artifact.kind}: ${artifact.path}${artifact.label ? ` (${artifact.label})` : ""}`,
      ),
    );
  }

  return `${lines.join("\n")}\n`;
}

function formatMigrateReport(
  result: MigrateWorkflowResult,
  query: string,
): string {
  const lines = [
    "Salt DS Migrate",
    `Query: ${query || "structured outline"}`,
    `Confidence: ${result.confidence.level}`,
    `Translations: ${result.summary.translationCount}`,
    `Manual reviews: ${result.summary.manualReviews}`,
    `Requires confirmation: ${result.summary.confirmationRequired}`,
    `Visual evidence: ${describeMigrateVisualEvidence(result.visualEvidence)}`,
    `Rule IDs: ${result.ruleIds.join(", ")}`,
    `Next step: ${result.summary.nextStep}`,
  ];

  if (result.confidence.reasons.length > 0) {
    lines.push(`Why: ${result.confidence.reasons[0]}`);
  }

  if (result.confidence.raiseConfidence.length > 0) {
    lines.push(`Raise confidence: ${result.confidence.raiseConfidence[0]}`);
  }

  if (result.runtimeEvidence.requested) {
    lines.push(
      `Runtime mode: ${result.summary.runtimeMode ?? "not-requested"}`,
    );
  }

  if (result.translation.familiarity_contract.preserve.length > 0) {
    lines.push("Preserve:");
    lines.push(
      ...result.translation.familiarity_contract.preserve
        .slice(0, 3)
        .map((entry) => `- ${entry}`),
    );
  }

  if (result.migrationScope.questions.length > 0) {
    lines.push("Clarify first:");
    lines.push(
      ...result.migrationScope.questions
        .slice(0, 3)
        .map((entry) => `- ${entry}`),
    );
  }

  if (result.translation.translations.length > 0) {
    lines.push("Top targets:");
    lines.push(
      ...result.translation.translations.slice(0, 5).map((entry) => {
        const sourceKind = entry.source_kind ?? "unknown";
        const targetName = entry.salt_target?.name ?? "unknown";
        return `- ${sourceKind} -> ${targetName} (${entry.delta_category})`;
      }),
    );
  }

  return `${lines.join("\n")}\n`;
}

function summarizeRoleSummary(entry: {
  role: string;
  name: string;
  count?: number;
}): string {
  const label = entry.name ? `${entry.role}:${entry.name}` : entry.role;
  return entry.count && entry.count > 1 ? `${label} (${entry.count})` : label;
}

function buildMigrationExperienceSummary(
  result: RuntimeInspectResult | null,
): MigrateWorkflowResult["runtimeEvidence"]["currentExperience"] {
  if (!result) {
    return null;
  }

  const anchorRoles = new Set([
    "button",
    "link",
    "navigation",
    "dialog",
    "form",
    "table",
    "tab",
    "textbox",
    "combobox",
    "checkbox",
    "radio",
  ]);

  return {
    pageTitle: result.page.title,
    landmarks: result.accessibility.landmarks
      .slice(0, 6)
      .map(summarizeRoleSummary),
    interactionAnchors: result.accessibility.roles
      .filter((entry) => anchorRoles.has(entry.role))
      .slice(0, 8)
      .map(summarizeRoleSummary),
    structure: result.structure.summary.slice(0, 8),
    layoutSignals: result.layout.hints.slice(0, 4),
  };
}

function formatUpgradeReport(result: UpgradeWorkflowResult): string {
  return [
    "Salt DS Upgrade",
    `Target: ${result.summary.target}`,
    `Confidence: ${result.confidence.level}`,
    `Rule IDs: ${result.ruleIds.join(", ")}`,
    `From: ${result.summary.fromVersion}`,
    `To: ${result.summary.toVersion}`,
    `Changes: ${result.summary.changeCount}`,
    ...(result.confidence.reasons.length > 0
      ? [`Why: ${result.confidence.reasons[0]}`]
      : []),
    ...(result.confidence.raiseConfidence.length > 0
      ? [`Raise confidence: ${result.confidence.raiseConfidence[0]}`]
      : []),
    `Next step: ${result.summary.nextStep}`,
  ]
    .join("\n")
    .concat("\n");
}

async function writeWorkflowOutput<
  T extends
    | CreateWorkflowResult
    | ReviewWorkflowResult
    | MigrateWorkflowResult
    | UpgradeWorkflowResult,
>(
  result: T,
  flags: Record<string, string>,
  io: RequiredCliIo,
  formatter: (result: T) => string,
): Promise<void> {
  const outputPath = flags.output
    ? path.resolve(io.cwd, flags.output)
    : undefined;
  if (outputPath) {
    await writeJsonFile(outputPath, result);
  }

  if (flags.json === "true") {
    io.writeStdout(`${JSON.stringify(result, null, 2)}\n`);
  } else {
    io.writeStdout(formatter(result));
    if (outputPath) {
      io.writeStdout(`Wrote JSON report to ${outputPath}\n`);
    }
  }
}

function formatCreateReport(result: CreateWorkflowResult): string {
  const consultedLayers = formatProjectPolicyLayers(
    result.projectConventions?.layersConsulted ?? [],
  );
  const appliedLayer = formatProjectPolicyLayer(
    result.projectConventions?.appliedRule?.layer,
  );
  const lines = [
    "Salt DS Create",
    `Root: ${result.context.rootDir}`,
    `Confidence: ${result.confidence.level}`,
    `Task: ${result.intent.userTask}`,
    `Key interaction: ${result.intent.keyInteraction}`,
    `Composition direction: ${result.intent.compositionDirection}`,
    `Canonical choice: ${result.intent.canonicalChoice ?? "none"}`,
    `Mode: ${result.summary.mode}`,
    `Solution type: ${result.summary.solutionType}`,
    `Decision: ${result.summary.finalDecisionName ?? result.summary.decisionName ?? "none"}`,
    `Next step: ${result.summary.nextStep}`,
  ];

  if (result.projectConventions) {
    lines.push(
      `Project policy mode: ${result.projectConventions.policyMode}`,
      `Project conventions check: ${
        result.projectConventions.consulted ? "consulted" : "not applied"
      }`,
    );

    if (consultedLayers) {
      lines.push(`Project policy layers: ${consultedLayers}`);
    }

    if (result.projectConventions.applied) {
      lines.push(
        `Project override: ${
          result.projectConventions.finalRecommendation ?? "none"
        } via ${result.projectConventions.appliedRule?.type ?? "project convention"} from ${
          appliedLayer ?? "project conventions"
        }`,
        `Final project answer: ${
          result.projectConventions.finalRecommendation ?? "none"
        }`,
      );
    } else if (result.projectConventions.consulted) {
      lines.push(
        `Final project answer: ${
          result.projectConventions.finalRecommendation ?? "none"
        }`,
      );
    }

    if (result.projectConventions.warnings.length > 0) {
      lines.push(
        `Project policy warning: ${result.projectConventions.warnings[0]}`,
      );
    }
  }

  if (result.confidence.reasons.length > 0) {
    lines.push(`Why: ${result.confidence.reasons[0]}`);
  }

  if (result.confidence.raiseConfidence.length > 0) {
    lines.push(`Raise confidence: ${result.confidence.raiseConfidence[0]}`);
  }

  if (result.summary.suggestedFollowUps.length > 0) {
    lines.push("Suggested follow-ups:");
    lines.push(
      ...result.summary.suggestedFollowUps.map((followUp) => `- ${followUp}`),
    );
  }

  lines.push(`Rule IDs: ${result.intent.ruleIds.join(", ")}`);

  return `${lines.join("\n")}\n`;
}

export async function runCreateCommand(
  positionals: string[],
  flags: Record<string, string>,
  io: RequiredCliIo,
): Promise<number> {
  const query = positionals.join(" ").trim();
  if (!query) {
    io.writeStderr("Missing query. Usage: salt-ds create <query>\n");
    return 1;
  }

  try {
    const context = await collectSaltInfo(io.cwd, flags["registry-dir"]);
    const { registry } = await resolveSemanticRegistry(
      io.cwd,
      flags["registry-dir"],
    );
    const recommendation = sanitizeWorkflowPayload(
      chooseSaltSolution(registry, {
        query,
        solution_type:
          flags.type === "component" ||
          flags.type === "pattern" ||
          flags.type === "foundation" ||
          flags.type === "token" ||
          flags.type === "auto"
            ? flags.type
            : undefined,
        package: flags.package,
        status:
          flags.status === "stable" ||
          flags.status === "beta" ||
          flags.status === "lab" ||
          flags.status === "deprecated"
            ? flags.status
            : undefined,
        include_starter_code: flags["include-starter-code"] === "true",
        view: flags.full === "true" ? "full" : "compact",
      }),
    ) as PublicCreateRecommendation;
    const createRuleIds = getCreateRuleIds({
      projectConventionsMayMatter:
        recommendation.guidance_boundary.project_conventions.check_recommended,
    });
    const projectConventions = await loadCreateProjectConventionsSummary({
      rootDir: io.cwd,
      policy: context.policy,
      decision: recommendation.decision,
      guidanceBoundary: recommendation.guidance_boundary,
    });
    const consultedPolicyLayers = formatProjectPolicyLayers(
      projectConventions?.layersConsulted ?? [],
    );
    const appliedPolicyLayer = formatProjectPolicyLayer(
      projectConventions?.appliedRule?.layer,
    );
    const result: CreateWorkflowResult = {
      workflow: "create",
      context,
      confidence: buildCreateConfidence(
        recommendation,
        context,
        projectConventions,
      ),
      projectConventions,
      intent: buildCreateIntent({
        query,
        solutionType: recommendation.solution_type,
        decisionName: recommendation.decision.name,
        decisionWhy: recommendation.decision.why,
        ruleIds: createRuleIds,
      }),
      recommendation,
      summary: {
        mode: recommendation.mode,
        solutionType: recommendation.solution_type,
        decisionName: recommendation.decision.name,
        finalDecisionName:
          projectConventions?.finalRecommendation ??
          recommendation.decision.name,
        nextStep:
          recommendation.next_step ??
          "Use the recommended Salt direction as the first scaffold, then validate the changed code with salt-ds review.",
        suggestedFollowUps:
          recommendation.suggested_follow_ups?.map((entry) => entry.workflow) ??
          [],
      },
      notes: Array.from(
        new Set([
          ...context.notes,
          ...(context.policy.teamConfigPath
            ? []
            : [
                "No .salt/team.json detected yet. Add repo-local policy only after the canonical Salt direction is chosen.",
              ]),
          ...(recommendation.guidance_boundary.project_conventions
            .check_recommended
            ? [
                "The canonical create result recommends a project-conventions check before the final project answer is locked.",
              ]
            : []),
          ...(projectConventions?.applied
            ? [
                `Project conventions changed the final project answer from ${
                  projectConventions.canonicalChoice.name ?? "none"
                } to ${projectConventions.finalRecommendation ?? "none"}.`,
                ...(appliedPolicyLayer
                  ? [`Project policy layer applied: ${appliedPolicyLayer}.`]
                  : []),
              ]
            : projectConventions?.consulted
              ? [
                  "Project conventions were checked and kept the canonical Salt answer.",
                ]
              : []),
          ...(consultedPolicyLayers
            ? [`Project policy layers consulted: ${consultedPolicyLayers}.`]
            : []),
          ...(projectConventions?.warnings ?? []),
        ]),
      ),
    };

    await writeWorkflowOutput(result, flags, io, formatCreateReport);
    return recommendation.decision.name ? 0 : 2;
  } catch (error) {
    io.writeStderr(
      `${error instanceof Error ? error.message : "Failed to plan the Salt UI creation."}\n`,
    );
    return 1;
  }
}

export async function runReviewCommand(
  positionals: string[],
  flags: Record<string, string>,
  io: RequiredCliIo,
): Promise<number> {
  return runReviewLikeCommand(positionals, flags, io);
}

export async function runMigrateCommand(
  positionals: string[],
  flags: Record<string, string>,
  io: RequiredCliIo,
): Promise<number> {
  const query = positionals.join(" ").trim();
  try {
    const sourceOutline = flags["source-outline"]
      ? await loadSourceOutlineFile(io.cwd, flags["source-outline"])
      : null;
    if (!query && !sourceOutline) {
      io.writeStderr(
        "Missing query. Usage: salt-ds migrate [query] [--source-outline <path>]\n",
      );
      return 1;
    }

    const context = await collectSaltInfo(io.cwd, flags["registry-dir"]);
    const { registry } = await resolveSemanticRegistry(
      io.cwd,
      flags["registry-dir"],
    );
    const translation = sanitizeWorkflowPayload(
      translateUiToSalt(registry, {
        query: query || undefined,
        source_outline: sourceOutline?.outline,
        package: flags.package,
        include_starter_code: flags["include-starter-code"] === "true",
        view: flags.full === "true" ? "full" : "compact",
      }),
    ) as PublicTranslateResult;

    let runtimeResult: RuntimeInspectResult | null = null;
    const requestedUrl = flags.url ?? null;
    if (requestedUrl) {
      const timeoutMs = flags.timeout ? Number(flags.timeout) : undefined;
      runtimeResult = await inspectUrl(requestedUrl, {
        mode:
          flags.mode === "browser" || flags.mode === "fetched-html"
            ? flags.mode
            : "auto",
        timeoutMs: Number.isFinite(timeoutMs) ? timeoutMs : undefined,
        outputDir: flags["output-dir"]
          ? path.resolve(io.cwd, flags["output-dir"])
          : undefined,
        captureScreenshot: flags["no-screenshot"] !== "true",
      });
    }
    const currentExperience = buildMigrationExperienceSummary(runtimeResult);

    const result: MigrateWorkflowResult = {
      workflow: "migrate",
      context,
      confidence: buildMigrateConfidence(
        translation,
        context,
        runtimeResult,
        sourceOutline,
      ),
      ruleIds: getMigrationRuleIds({
        projectConventionsMayMatter:
          translation.guidance_boundary.project_conventions.check_recommended,
        runtimeScopingMatters:
          Boolean(requestedUrl) || context.runtime.detectedTargets.length > 0,
        requiresConfirmation: translation.summary.confirmation_required > 0,
      }),
      translation,
      visualEvidence: buildMigrateVisualEvidence(
        sourceOutline,
        requestedUrl,
        runtimeResult,
      ),
      migrationScope: {
        questions: buildMigrateQuestions(
          translation,
          sourceOutline,
          currentExperience,
        ),
        preserveFocus: translation.familiarity_contract.preserve,
        allowSaltChanges: translation.familiarity_contract.allow_salt_changes,
        confirmationTriggers:
          translation.familiarity_contract.requires_confirmation,
        currentExperienceCaptured: Boolean(runtimeResult),
        runtimeRecommended:
          !requestedUrl && context.runtime.detectedTargets.length > 0,
      },
      postMigrationVerification: buildPostMigrationVerification(
        translation,
        Boolean(requestedUrl),
        sourceOutline,
        currentExperience,
      ),
      runtimeEvidence: {
        requested: Boolean(requestedUrl),
        url: requestedUrl,
        result: runtimeResult,
        currentExperience,
      },
      summary: {
        translationCount: translation.translations.length,
        manualReviews: translation.summary.manual_reviews,
        confirmationRequired: translation.summary.confirmation_required,
        runtimeMode: runtimeResult?.inspectionMode ?? null,
        nextStep:
          translation.next_step ??
          "Apply the migration in stages, then run salt-ds review on the changed files.",
      },
      notes: Array.from(
        new Set([
          ...context.notes,
          "Keep canonical Salt mappings separate from repo-local wrapper decisions until after the first migration pass.",
          ...(sourceOutline
            ? [
                `Structured visual evidence from --source-outline was used at ${sourceOutline.path}.`,
              ]
            : [
                "Add --source-outline when the migration starts from a mockup, screenshot notes, or a rough design outline.",
              ]),
          ...(requestedUrl
            ? [
                "Runtime evidence was used to scope the current experience before finalizing the migration plan.",
              ]
            : context.runtime.detectedTargets.length > 0
              ? [
                  `Use --url with a current runtime target (${context.runtime.detectedTargets
                    .map((target) => target.url)
                    .join(
                      ", ",
                    )}) when preserving landmarks, action hierarchy, or state visibility matters.`,
                ]
              : [
                  "Add --url when migration scoping needs runtime evidence about landmarks, structure, action hierarchy, or visible states.",
                ]),
          ...(sourceOutline && requestedUrl
            ? [
                "Structured outline and runtime capture were both used, so any mismatch between the mockup-style plan and the live UI should be clarified before coding.",
              ]
            : []),
        ]),
      ),
    };

    await writeWorkflowOutput(result, flags, io, (payload) =>
      formatMigrateReport(payload, query),
    );
    return 0;
  } catch (error) {
    io.writeStderr(
      `${error instanceof Error ? error.message : "Failed to plan the Salt migration."}\n`,
    );
    return 1;
  }
}

export async function runUpgradeCommand(
  positionals: string[],
  flags: Record<string, string>,
  io: RequiredCliIo,
): Promise<number> {
  if (positionals.length > 0) {
    io.writeStderr(
      "Upgrade does not accept positional arguments. Use flags instead.\n",
    );
    return 1;
  }

  try {
    const context = await collectSaltInfo(io.cwd, flags["registry-dir"]);
    const inferredPackage =
      flags.package ??
      context.salt.packages.find((pkg) => pkg.name === "@salt-ds/core")?.name ??
      context.salt.packages[0]?.name;
    const fromVersionWasInferred = !flags["from-version"];
    const inferredFromVersion =
      flags["from-version"] ?? normalizeVersion(context.salt.packageVersion);

    if (!flags.component && !inferredPackage) {
      io.writeStderr(
        "Missing target. Provide --package or --component, or run the command from a repo with a detected Salt package.\n",
      );
      return 1;
    }

    if (!inferredFromVersion) {
      io.writeStderr(
        "Missing --from-version and no installed Salt package version could be inferred.\n",
      );
      return 1;
    }

    const { registry } = await resolveSemanticRegistry(
      io.cwd,
      flags["registry-dir"],
    );
    const comparison = compareSaltVersions(registry, {
      package: inferredPackage,
      component_name: flags.component,
      from_version: inferredFromVersion,
      to_version: flags["to-version"],
      include_deprecations: flags["include-deprecations"] === "true",
      view: flags.full === "true" ? "full" : "compact",
    });
    const changeCount =
      (comparison.breaking?.length ?? 0) +
      (comparison.important?.length ?? 0) +
      (comparison.nice_to_know?.length ?? 0);
    const target =
      comparison.decision.target ??
      inferredPackage ??
      flags.component ??
      "unknown";
    const result: UpgradeWorkflowResult = {
      workflow: "upgrade",
      context,
      confidence: buildUpgradeConfidence(comparison, fromVersionWasInferred),
      ruleIds: getUpgradeRuleIds(),
      comparison,
      summary: {
        target,
        fromVersion: comparison.decision.from_version ?? inferredFromVersion,
        toVersion:
          comparison.decision.to_version ??
          flags["to-version"] ??
          "latest-supported",
        changeCount,
        nextStep:
          comparison.next_step ??
          "Apply the required upgrade changes first, then run salt-ds review on the affected files.",
      },
      notes: Array.from(
        new Set([
          ...context.notes,
          ...(flags["from-version"]
            ? []
            : [
                `Inferred from-version ${inferredFromVersion} from the detected project context.`,
              ]),
          ...(flags.package || !inferredPackage
            ? []
            : [
                `Inferred package target ${inferredPackage} from detected Salt packages.`,
              ]),
        ]),
      ),
    };

    await writeWorkflowOutput(result, flags, io, formatUpgradeReport);
    return 0;
  } catch (error) {
    io.writeStderr(
      `${error instanceof Error ? error.message : "Failed to plan the Salt upgrade."}\n`,
    );
    return 1;
  }
}

async function runReviewLikeCommand(
  positionals: string[],
  flags: Record<string, string>,
  io: RequiredCliIo,
): Promise<number> {
  if (flags.fix === "true") {
    io.writeStderr(
      "salt-ds review no longer writes files directly. Use --json and apply the returned fixCandidates through the agent workflow.\n",
    );
    return 1;
  }

  try {
    const context = await collectSaltInfo(io.cwd, flags["registry-dir"]);
    const sourceValidation = await analyzeLintTargets(
      positionals.length > 0 ? positionals : ["."],
      io.cwd,
      flags["registry-dir"],
    );
    const fixCandidates = buildReviewFixCandidates(sourceValidation);
    const loadedMigrationVerification = await loadMigrationVerificationContract(
      io.cwd,
      flags["migration-report"],
    );

    let runtimeResult: RuntimeInspectResult | null = null;
    const requestedUrl = flags.url ?? null;
    if (requestedUrl) {
      const timeoutMs = flags.timeout ? Number(flags.timeout) : undefined;
      runtimeResult = await inspectUrl(requestedUrl, {
        mode:
          flags.mode === "browser" || flags.mode === "fetched-html"
            ? flags.mode
            : "auto",
        timeoutMs: Number.isFinite(timeoutMs) ? timeoutMs : undefined,
        outputDir: flags["output-dir"]
          ? path.resolve(io.cwd, flags["output-dir"])
          : undefined,
        captureScreenshot: flags["no-screenshot"] !== "true",
      });
    }

    const migrationVerification = loadedMigrationVerification
      ? assessMigrationVerification({
          loadedContract: loadedMigrationVerification,
          sourceValidation,
          runtimeResult,
        })
      : null;
    const reviewIssueClasses = buildReviewIssueClasses(
      sourceValidation.files.flatMap((file) =>
        (file.issues ?? []).filter(
          (entry): entry is Record<string, unknown> =>
            Boolean(entry) && typeof entry === "object",
        ),
      ),
      {
        includeEvidenceGap:
          !requestedUrl &&
          (context.runtime.detectedTargets.length > 0 ||
            Boolean(loadedMigrationVerification)),
      },
    );

    const runtimeIssues = runtimeResult?.errors.length ?? 0;
    const needsAttention =
      sourceValidation.summary.filesNeedingAttention > 0 || runtimeIssues > 0;
    const reviewConfidence = buildReviewConfidence(
      sourceValidation,
      fixCandidates,
      context,
      Boolean(requestedUrl),
      runtimeResult,
      migrationVerification,
    );
    const nextStep = migrationVerification
      ? needsAttention
        ? fixCandidates.totalCount > 0
          ? "Review the returned fixCandidates, confirm the migration verification items, apply the safest changes through the agent workflow, then rerun salt-ds review."
          : "Fix the remaining source or runtime issues, confirm the migration verification items, then rerun salt-ds review."
        : migrationVerification.nextStep
      : needsAttention
        ? fixCandidates.totalCount > 0
          ? "Review the returned fixCandidates, apply the safest changes through the agent workflow, then rerun salt-ds review."
          : "Fix the remaining source or runtime issues, then rerun salt-ds review."
        : requestedUrl
          ? "Source validation is clean and no runtime issues were found."
          : "Source validation is clean. Add --url if you still need runtime evidence.";
    const result: ReviewWorkflowResult = {
      workflow: "review",
      context,
      confidence: reviewConfidence,
      issueClasses: reviewIssueClasses,
      ruleIds: collectReviewRuleIds(reviewIssueClasses),
      sourceValidation,
      fixCandidates,
      migrationVerification,
      runtimeEvidence: {
        requested: Boolean(requestedUrl),
        url: requestedUrl,
        result: runtimeResult,
      },
      summary: {
        status: needsAttention ? "needs_attention" : "clean",
        filesNeedingAttention: sourceValidation.summary.filesNeedingAttention,
        cleanFiles: sourceValidation.summary.cleanFiles,
        runtimeIssues,
        runtimeMode: runtimeResult?.inspectionMode ?? null,
        fixCandidateCount: fixCandidates.totalCount,
        deterministicFixCandidateCount: fixCandidates.deterministicCount,
        manualReviewFixCandidateCount: fixCandidates.manualReviewCount,
        nextStep,
      },
      notes: Array.from(
        new Set([
          ...buildReviewNotes(context, sourceValidation, Boolean(requestedUrl)),
          ...fixCandidates.notes,
          ...(requestedUrl
            ? []
            : context.runtime.detectedTargets.length > 0
              ? [
                  `Runtime targets were detected (${context.runtime.detectedTargets
                    .map((target) => target.url)
                    .join(
                      ", ",
                    )}), but no --url was provided for runtime evidence.`,
                ]
              : [
                  "No runtime URL was provided. Use --url when you need runtime evidence in addition to source validation.",
                ]),
          ...(migrationVerification
            ? [
                `Loaded migration verification contract from ${migrationVerification.reportPath}.`,
              ]
            : []),
        ]),
      ),
    };

    await writeWorkflowOutput(result, flags, io, formatReviewReport);
    return needsAttention ? 2 : 0;
  } catch (error) {
    io.writeStderr(
      `${error instanceof Error ? error.message : "Failed to review the Salt targets."}\n`,
    );
    return 1;
  }
}
