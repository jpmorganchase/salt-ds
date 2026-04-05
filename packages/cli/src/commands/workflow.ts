import fs from "node:fs/promises";
import path from "node:path";
import { inspectUrl } from "@salt-ds/runtime-inspector-core";
import {
  type CreateSaltUiResult,
  createSaltUi,
} from "@salt-ds/semantic-core/tools/createSaltUi";
import {
  type MigrateToSaltResult,
  migrateToSalt,
} from "@salt-ds/semantic-core/tools/migrateToSalt";
import {
  isWorkflowExpectedReviewIssueId,
  type ReviewExpectedTargets,
  reviewSaltUi,
} from "@salt-ds/semantic-core/tools/reviewSaltUi";
import {
  type UpgradeSaltUiResult,
  upgradeSaltUi,
} from "@salt-ds/semantic-core/tools/upgradeSaltUi";
import {
  buildCreateSaltUiWorkflowContract,
  buildMigrateToSaltWorkflowContract,
  buildRepoAwareReviewNextStep,
  buildRepoAwareReviewWorkflowMetadata,
  buildReviewSaltUiWorkflowContract,
  buildSatisfiedWorkflowContextRequirement,
  buildUpgradeSaltUiWorkflowContract,
  type WorkflowConfidence as CoreWorkflowConfidence,
  type WorkflowContextRequirement as CoreWorkflowContextRequirement,
  type WorkflowReadiness as CoreWorkflowReadiness,
  type CreateSaltUiWorkflowContract,
  type WorkflowCreateImplementationGate,
  type WorkflowProvenance,
  type WorkflowStarterValidation,
} from "@salt-ds/semantic-core/tools/workflowContracts";
import { applyProjectPolicyToStarterCodeSnippets } from "@salt-ds/semantic-core/tools/workflowProjectPolicyApplication";
import {
  buildProjectConventionRepoRefinementArtifact,
  type WorkflowRepoRefinementArtifact,
} from "@salt-ds/semantic-core/tools/workflowRepoRefinement";
import {
  buildReviewIssueClasses,
  type CreateRuleId,
  collectReviewRuleIds,
  getMigrationRuleIds,
  getUpgradeRuleIds,
  type MigrationRuleId,
  type ReviewRuleId,
  type UpgradeRuleId,
  type WorkflowIssueClass,
} from "@salt-ds/semantic-core/tools/workflowRuleIds";
import type { ValidationSeverity } from "@salt-ds/semantic-core/validation/shared";
import { readRepeatableFlagValues } from "../lib/args.js";
import { writeJsonFile } from "../lib/common.js";
import { loadCreateReviewTargets } from "../lib/createReviewTargets.js";
import { collectSaltInfo } from "../lib/infoContext.js";
import { analyzeLintTargets } from "../lib/lintAnalysis.js";
import {
  assessMigrationVerification,
  loadMigrationVerificationContract,
  type MigrationVerificationSummary,
} from "../lib/migrationVerification.js";
import {
  type LoadedMigrationVisualEvidence,
  loadMigrationVisualEvidence,
  MIGRATE_VISUAL_ADAPTER_ENV_VAR,
  type ResolvedSourceOutline,
} from "../lib/migrationVisualEvidence.js";
import {
  buildProjectConventionsCheckSummary,
  loadCreateProjectConventionsSummary,
  loadWorkflowProjectPolicySummary,
  type WorkflowProjectConventionsCheckSummary,
  type WorkflowProjectConventionsSummary,
  type WorkflowProjectPolicySummary,
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

interface WorkflowReadiness {
  status: CoreWorkflowReadiness["status"];
  implementationReady: CoreWorkflowReadiness["implementation_ready"];
  reason: string;
}

interface WorkflowContextRequirement {
  status: CoreWorkflowContextRequirement["status"];
  repoSpecificEditsReady: CoreWorkflowContextRequirement["repo_specific_edits_ready"];
  reason: string;
  satisfiedBy: "salt-ds info" | null;
}

interface PublicSuggestedFollowUp {
  workflow: string;
  reason: string;
  args: Record<string, unknown>;
}

type PublicCreateRecommendation = Omit<
  CreateSaltUiResult,
  "suggested_follow_ups"
> & {
  suggested_follow_ups?: PublicSuggestedFollowUp[];
};

type PublicTranslateDecisionGate = Omit<
  NonNullable<MigrateToSaltResult["decision_gates"]>[number],
  "suggested_workflow"
> & {
  suggested_workflow: string;
};

type PublicTranslateResult = Omit<
  MigrateToSaltResult,
  "decision_gates" | "suggested_follow_ups"
> & {
  decision_gates?: PublicTranslateDecisionGate[];
  suggested_follow_ups?: PublicSuggestedFollowUp[];
};

interface ReviewWorkflowResult {
  workflow: {
    id: "review";
    transportUsed: "cli";
    confidence: WorkflowConfidence;
    projectConventionsCheck: WorkflowProjectConventionsCheckSummary | null;
    provenance: WorkflowProvenance;
  };
  result: {
    sourceValidation: LintCommandResult;
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
  };
  artifacts: {
    context: SaltInfoResult;
    projectPolicy: WorkflowProjectPolicySummary | null;
    issueClasses: WorkflowIssueClass[];
    ruleIds: ReviewRuleId[];
    fixCandidates: ReviewFixCandidatesResult;
    expectedTargetReview: {
      reportPath: string;
      expectedTargets: ReviewExpectedTargets;
      issues: Array<Record<string, unknown>>;
    } | null;
    migrationVerification: MigrationVerificationSummary | null;
    runtimeEvidence: {
      requested: boolean;
      url: string | null;
      result: RuntimeInspectResult | null;
    };
    notes: string[];
  };
}

interface CreateWorkflowResult {
  workflow: {
    id: "create";
    transportUsed: "cli";
    implementationGate: WorkflowCreateImplementationGate;
    confidence: WorkflowConfidence;
    readiness: WorkflowReadiness;
    contextRequirement: WorkflowContextRequirement;
    projectConventionsCheck: CreateSaltUiWorkflowContract["project_conventions_check"];
    provenance: WorkflowProvenance;
  };
  result: {
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
      finalDecisionSource: "canonical_salt" | "project_policy";
      starterValidationStatus: "clean" | "needs_attention" | "not_run";
      nextStep: string;
      suggestedFollowUps: string[];
    };
  };
  artifacts: {
    context: SaltInfoResult;
    starterValidation: WorkflowStarterValidation | null;
    projectConventions: WorkflowProjectConventionsSummary | null;
    projectPolicy: WorkflowProjectPolicySummary | null;
    repoRefinement: WorkflowRepoRefinementArtifact | null;
    notes: string[];
  };
}

interface MigrateWorkflowResult {
  workflow: {
    id: "migrate";
    transportUsed: "cli";
    confidence: WorkflowConfidence;
    readiness: WorkflowReadiness;
    contextRequirement: WorkflowContextRequirement;
    projectConventionsCheck: WorkflowProjectConventionsCheckSummary | null;
    provenance: WorkflowProvenance;
  };
  result: {
    translation: PublicTranslateResult;
    migrationScope: {
      questions: string[];
      preserveFocus: string[];
      allowSaltChanges: string[];
      confirmationTriggers: string[];
      currentExperienceCaptured: boolean;
      runtimeRecommended: boolean;
    };
    summary: {
      translationCount: number;
      manualReviews: number;
      confirmationRequired: number;
      runtimeMode: string | null;
      starterValidationStatus: "clean" | "needs_attention" | "not_run";
      nextStep: string;
    };
  };
  artifacts: {
    context: SaltInfoResult;
    starterValidation: WorkflowStarterValidation | null;
    projectPolicy: WorkflowProjectPolicySummary | null;
    ruleIds: MigrationRuleId[];
    visualEvidence: {
      contract: {
        role: "supporting-evidence";
        notCanonicalSourceOfTruth: true;
        supportedInputs: Array<
          | "structured-outline"
          | "current-ui-capture"
          | "mockup-image"
          | "screenshot-file"
          | "image-url"
        >;
        interpretationOwner: "agent-or-adapter";
        normalizationRequired: true;
        normalizationContract: "migrate_visual_evidence_v1";
        structuredOutputs: Array<
          | "landmarks"
          | "action-hierarchy"
          | "layout-signals"
          | "familiarity-anchors"
          | "confidence-impact"
        >;
      };
      interpretationOwner: "agent-or-adapter";
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
        mockups: Array<{
          sourceType: "file" | "url";
          source: string;
          label: string | null;
          confidence: "low" | "medium" | "high";
          regions: number;
          actions: number;
          states: number;
          notes: number;
          adapterNotes: string[];
        }>;
        screenshots: Array<{
          sourceType: "file" | "url";
          source: string;
          label: string | null;
          confidence: "low" | "medium" | "high";
          regions: number;
          actions: number;
          states: number;
          notes: number;
          adapterNotes: string[];
        }>;
      };
      derivedOutline: {
        available: boolean;
        regions: number;
        actions: number;
        states: number;
        notes: number;
      };
      confidenceImpact: {
        level: "none" | "supporting" | "stronger-scoping";
        reasons: string[];
        changedScoping: boolean;
        changedConfidence: boolean;
      };
      ambiguities: string[];
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
    notes: string[];
  };
}

function uniqueStrings(values: string[]): string[] {
  return [...new Set(values)];
}

function readStringRecordValue(
  record: Record<string, unknown>,
  key: string,
): string | null {
  const value = record[key];
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

function readStringArrayRecordValue(
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

function dedupeIssueRecords(
  issues: Array<Record<string, unknown>>,
): Array<Record<string, unknown>> {
  const issueMap = new Map<string, Record<string, unknown>>();

  for (const issue of issues) {
    const id =
      readStringRecordValue(issue, "id") ??
      `${readStringRecordValue(issue, "rule") ?? "issue"}:${readStringRecordValue(issue, "title") ?? "unknown"}`;
    if (!issueMap.has(id)) {
      issueMap.set(id, issue);
    }
  }

  return [...issueMap.values()];
}

function sortIssueRecords(
  issues: Array<Record<string, unknown>>,
): Array<Record<string, unknown>> {
  const severityRank = (severity: ValidationSeverity | null): number => {
    if (severity === "error") {
      return 0;
    }
    if (severity === "warning") {
      return 1;
    }
    return 2;
  };

  return [...issues].sort((left, right) => {
    const leftSeverity = readStringRecordValue(
      left,
      "severity",
    ) as ValidationSeverity | null;
    const rightSeverity = readStringRecordValue(
      right,
      "severity",
    ) as ValidationSeverity | null;
    const severityDelta =
      severityRank(leftSeverity) - severityRank(rightSeverity);
    if (severityDelta !== 0) {
      return severityDelta;
    }

    const leftMatches = Number(left.matches ?? 0);
    const rightMatches = Number(right.matches ?? 0);
    if (leftMatches !== rightMatches) {
      return rightMatches - leftMatches;
    }

    return Number(right.confidence ?? 0) - Number(left.confidence ?? 0);
  });
}

function summarizeIssueRecords(issues: Array<Record<string, unknown>>): {
  errors: number;
  warnings: number;
  infos: number;
} {
  return issues.reduce<{
    errors: number;
    warnings: number;
    infos: number;
  }>(
    (summary, issue) => {
      const severity = readStringRecordValue(issue, "severity");
      if (severity === "error") {
        summary.errors += 1;
      } else if (severity === "warning") {
        summary.warnings += 1;
      } else {
        summary.infos += 1;
      }
      return summary;
    },
    { errors: 0, warnings: 0, infos: 0 },
  );
}

function extractWorkflowExpectedIssues(
  issues: Array<Record<string, unknown>> | undefined,
): Array<Record<string, unknown>> {
  return (issues ?? []).filter((issue) => {
    const id = readStringRecordValue(issue, "id");
    return id ? isWorkflowExpectedReviewIssueId(id) : false;
  });
}

interface UpgradeWorkflowResult {
  workflow: {
    id: "upgrade";
    transportUsed: "cli";
    confidence: WorkflowConfidence;
    projectConventionsCheck: WorkflowProjectConventionsCheckSummary | null;
    provenance: WorkflowProvenance;
  };
  result: {
    comparison: UpgradeSaltUiResult;
    summary: {
      target: string;
      fromVersion: string;
      toVersion: string;
      changeCount: number;
      nextStep: string;
    };
  };
  artifacts: {
    context: SaltInfoResult;
    ruleIds: UpgradeRuleId[];
    notes: string[];
  };
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

function formatProjectConventionsTopics(topics: string[]): string | null {
  if (topics.length === 0) {
    return null;
  }

  return topics.map((topic) => topic.replaceAll("-", " ")).join(", ");
}

function formatThemeDefaultSummary(
  summary: WorkflowProjectConventionsSummary["themeDefaults"],
): string | null {
  if (!summary?.provider) {
    return null;
  }

  const propSummary =
    summary.props.length > 0
      ? ` (${summary.props.map((entry) => `${entry.name}=${entry.value}`).join(", ")})`
      : "";

  return `${summary.provider}${propSummary}`;
}

function formatTokenFamilyPolicySummary(
  policies:
    | WorkflowProjectConventionsSummary["tokenFamilyPolicies"]
    | WorkflowProjectPolicySummary["tokenFamilyPolicies"],
): string | null {
  if (policies.length === 0) {
    return null;
  }

  return policies.map((entry) => `${entry.family}:${entry.mode}`).join(", ");
}

function buildProjectPolicyNotes(
  summary: WorkflowProjectPolicySummary | null,
): string[] {
  if (!summary) {
    return [];
  }

  const notes: string[] = [];
  const consultedLayers = formatProjectPolicyLayers(summary.layersConsulted);
  const themeDefaultSummary = formatThemeDefaultSummary(summary.themeDefaults);
  const tokenFamilyPolicySummary = formatTokenFamilyPolicySummary(
    summary.tokenFamilyPolicies,
  );

  if (summary.declared) {
    notes.push(
      summary.policyMode === "stack"
        ? "Repo policy is layered through .salt/stack.json."
        : summary.policyMode === "team"
          ? "Repo policy is declared through .salt/team.json."
          : "Repo policy is declared for this repo.",
    );
  }

  if (consultedLayers) {
    notes.push(`Repo policy layers consulted: ${consultedLayers}.`);
  }

  if (summary.sharedPacks.length > 0) {
    notes.push(
      `Shared project conventions pack(s) available: ${summary.sharedPacks.join(", ")}.`,
    );
  }

  if (summary.approvedWrappers.length > 0) {
    notes.push(
      `Approved wrappers declared: ${summary.approvedWrappers.join(", ")}.`,
    );
  }

  if (themeDefaultSummary) {
    notes.push(`Repo theme default: ${themeDefaultSummary}.`);
  }

  if (summary.tokenAliases.length > 0) {
    notes.push(`Repo token aliases declared: ${summary.tokenAliases.length}.`);
  }

  if (tokenFamilyPolicySummary) {
    notes.push(`Repo token families: ${tokenFamilyPolicySummary}.`);
  }

  return Array.from(new Set([...notes, ...summary.warnings]));
}

function appendProjectPolicyLines(
  lines: string[],
  summary: WorkflowProjectPolicySummary | null,
): void {
  if (!summary) {
    return;
  }

  const themeDefaultSummary = formatThemeDefaultSummary(summary.themeDefaults);
  const tokenFamilyPolicySummary = formatTokenFamilyPolicySummary(
    summary.tokenFamilyPolicies,
  );

  if (themeDefaultSummary) {
    lines.push(`Project theme default: ${themeDefaultSummary}`);
  }

  if (summary.tokenAliases.length > 0) {
    lines.push(`Project token aliases: ${summary.tokenAliases.length}`);
  }

  if (tokenFamilyPolicySummary) {
    lines.push(`Project token families: ${tokenFamilyPolicySummary}`);
  }
}

const PUBLIC_CLI_FOLLOW_UP_WORKFLOWS = new Set([
  "info",
  "create",
  "review",
  "migrate",
  "upgrade",
]);

function toPublicCliWorkflowId(workflow: string): string | null {
  switch (workflow) {
    case "get_salt_project_context":
      return "info";
    case "create_salt_ui":
      return "create";
    case "review_salt_ui":
      return "review";
    case "migrate_to_salt":
      return "migrate";
    case "upgrade_salt_ui":
      return "upgrade";
    default:
      return PUBLIC_CLI_FOLLOW_UP_WORKFLOWS.has(workflow) ? workflow : null;
  }
}

function toPublicCliSuggestedFollowUps(
  followUps: PublicSuggestedFollowUp[] | undefined,
): PublicSuggestedFollowUp[] | undefined {
  if (!followUps) {
    return undefined;
  }

  const normalized: PublicSuggestedFollowUp[] = [];

  for (const followUp of followUps) {
    const workflow = toPublicCliWorkflowId(followUp.workflow);
    if (!workflow) {
      continue;
    }

    const key = `${workflow}:${JSON.stringify(followUp.args ?? {})}`;
    if (
      normalized.some(
        (entry) =>
          `${entry.workflow}:${JSON.stringify(entry.args ?? {})}` === key,
      )
    ) {
      continue;
    }

    normalized.push({
      ...followUp,
      workflow,
    });
  }

  return normalized.length > 0 ? normalized : undefined;
}

function buildProjectConventionsCheckNotes(
  summary: WorkflowProjectConventionsCheckSummary | null,
): string[] {
  if (!summary) {
    return [];
  }

  const notes: string[] = [];
  const formattedTopics = formatProjectConventionsTopics(summary.topics);

  if (summary.declared) {
    notes.push(
      summary.policyMode === "stack"
        ? "Project conventions are declared through .salt/stack.json."
        : summary.policyMode === "team"
          ? "Project conventions are declared through .salt/team.json."
          : "Project conventions are declared for this repo.",
    );
  } else if (summary.checkRecommended) {
    notes.push(
      "No .salt/team.json or .salt/stack.json was detected even though project conventions may still refine the final project answer.",
    );
  }

  if (summary.sharedPacks.length > 0) {
    notes.push(
      `Shared project conventions pack(s) available: ${summary.sharedPacks.join(", ")}.`,
    );
  }

  if (summary.checkRecommended && formattedTopics) {
    notes.push(`Project conventions topics to confirm: ${formattedTopics}.`);
  }

  return Array.from(new Set([...notes, ...summary.warnings]));
}

function buildCreateConfidence(
  recommendation: PublicCreateRecommendation,
  context: SaltInfoResult,
  projectConventions: WorkflowProjectConventionsSummary | null,
  starterValidation: WorkflowStarterValidation | null,
  implementationGate: WorkflowCreateImplementationGate,
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
    const firstWarning = projectConventions?.warnings[0];
    if (firstWarning) {
      raiseConfidence.push(firstWarning);
    }
  }

  if ((recommendation.suggested_follow_ups?.length ?? 0) > 0) {
    raiseConfidence.push(
      "Ground the recommendation with examples or canonical entity details before editing.",
    );
  }

  if (implementationGate.status === "follow_through_required") {
    level = level === "low" ? "low" : "medium";
    reasons.push(
      "The create result still requires targeted Salt follow-through before named regions are implemented.",
    );
    if (implementationGate.next_step) {
      raiseConfidence.push(implementationGate.next_step);
    }
  }

  const openQuestions = recommendation.open_questions ?? [];
  if (openQuestions.length > 0) {
    level = level === "low" ? "low" : "medium";
    askBeforeProceeding = true;
    reasons.push(
      "The create result still has unresolved Salt implementation choices that should be confirmed before coding.",
    );
    raiseConfidence.push(...openQuestions.map((question) => question.prompt));
  }

  raiseConfidence.push(
    "If you name a specific Salt token, prop, or API, verify the exact name against canonical Salt guidance before editing.",
  );

  if (starterValidation?.status === "needs_attention") {
    level = level === "low" ? "low" : "medium";
    askBeforeProceeding = true;
    reasons.push(
      "The returned starter code still has Salt validation issues that should be corrected before editing continues.",
    );
    if (starterValidation.top_issue) {
      raiseConfidence.push(starterValidation.top_issue);
    }
    if (starterValidation.next_step) {
      raiseConfidence.push(starterValidation.next_step);
    }
  }

  return {
    level,
    reasons,
    askBeforeProceeding,
    raiseConfidence: Array.from(new Set(raiseConfidence)),
  };
}

function toCliWorkflowReadiness(
  readiness: CoreWorkflowReadiness,
): WorkflowReadiness {
  return {
    status: readiness.status,
    implementationReady: readiness.implementation_ready,
    reason: readiness.reason,
  };
}

function toCliStarterValidationStatus(
  readiness: WorkflowReadiness,
  starterValidation: WorkflowStarterValidation | null,
): "clean" | "needs_attention" | "not_run" {
  if (readiness.status === "guidance_only") {
    return "not_run";
  }

  if (readiness.status === "starter_needs_attention") {
    return "needs_attention";
  }

  return starterValidation?.status ?? "clean";
}

function buildCliWorkflowSummaryNextStep(input: {
  readiness: WorkflowReadiness;
  defaultNextStep: string;
}): string {
  return input.readiness.status === "starter_needs_attention"
    ? input.readiness.reason
    : input.defaultNextStep;
}

function shouldFailWorkflowReadiness(readiness: WorkflowReadiness): boolean {
  return readiness.status === "starter_needs_attention";
}

function toActionableProjectConventionsRepoRefinement(
  summary: WorkflowProjectConventionsSummary | null,
): WorkflowRepoRefinementArtifact | null {
  if (!summary?.applied) {
    return null;
  }

  return buildProjectConventionRepoRefinementArtifact({
    canonical_name: summary.canonicalChoice.name,
    final_name: summary.finalRecommendation,
    reason: summary.whyChanged ?? summary.appliedRule?.reason ?? null,
    import_reference:
      summary.finalChoice.import ?? summary.appliedRule?.import ?? null,
    source_urls: Array.from(
      new Set(
        [
          ...(summary.appliedRule?.docs ?? []),
          summary.appliedRule?.layer?.source ?? null,
        ].filter((value): value is string => Boolean(value)),
      ),
    ),
  });
}

function toCliWorkflowConfidence(
  confidence: CoreWorkflowConfidence,
): WorkflowConfidence {
  return {
    level: confidence.level,
    reasons: confidence.reasons,
    askBeforeProceeding: confidence.ask_before_proceeding,
    raiseConfidence: confidence.raise_confidence,
  };
}

function buildCliWorkflowContextRequirement(): WorkflowContextRequirement {
  const requirement = buildSatisfiedWorkflowContextRequirement();
  return {
    status: requirement.status,
    repoSpecificEditsReady: requirement.repo_specific_edits_ready,
    reason: requirement.reason,
    satisfiedBy:
      requirement.status === "context_checked"
        ? requirement.satisfied_by
        : null,
  };
}

function buildMigrateConfidence(
  translation: PublicTranslateResult,
  context: SaltInfoResult,
  runtimeResult: RuntimeInspectResult | null,
  visualEvidence: LoadedMigrationVisualEvidence,
  projectConventionsCheck: WorkflowProjectConventionsCheckSummary | null,
  starterValidation: WorkflowStarterValidation | null,
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
  let level: WorkflowConfidence["level"] =
    lowConfidenceCount > 0
      ? "low"
      : mediumConfidenceCount > 0 ||
          translation.summary.confirmation_required > 0
        ? "medium"
        : "high";
  let askBeforeProceeding =
    level === "low" || translation.summary.confirmation_required > 0;
  const lowConfidenceVisualInputs = visualEvidence.visualInputs.filter(
    (entry) => entry.confidence === "low",
  );

  if (translation.summary.confirmation_required > 0) {
    reasons.push(
      "Some translated areas require explicit confirmation before the Salt result is treated as final.",
    );
    raiseConfidence.push(
      "Answer the migrationScope questions before implementation is locked.",
    );
  }

  if (visualEvidence.visualInputs.length > 0) {
    reasons.push(
      "Adapter-derived visual evidence was used to model regions, actions, and states before translation.",
    );
  } else if (visualEvidence.sourceOutline) {
    reasons.push(
      "Structured visual evidence was used to model regions, actions, and states before translation.",
    );
  } else if (!translation.source_profile.code_provided) {
    raiseConfidence.push(
      `Add --source-outline, or configure ${MIGRATE_VISUAL_ADAPTER_ENV_VAR} before using --mockup/--screenshot, when the migration starts from a mockup, screenshot notes, or a rough design outline.`,
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

  if (lowConfidenceVisualInputs.length > 0) {
    level = level === "low" ? "low" : "medium";
    askBeforeProceeding = true;
    reasons.push(
      "Some visual evidence was interpreted at low confidence and should stay provisional until it is confirmed.",
    );
    raiseConfidence.push(
      "Confirm low-confidence screenshot or mockup interpretations before implementation is locked.",
    );
    if (!runtimeResult) {
      raiseConfidence.push(
        "Add --url when you need runtime evidence to confirm low-confidence visual interpretations.",
      );
    }
  }

  if (visualEvidence.ambiguities.length > 0) {
    level = level === "low" ? "low" : "medium";
    askBeforeProceeding = true;
    reasons.push(
      "The visual evidence still has ambiguities that should be resolved before implementation is treated as final.",
    );
    raiseConfidence.push(...visualEvidence.ambiguities);
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

  if (projectConventionsCheck?.checkRecommended) {
    reasons.push(
      projectConventionsCheck.declared
        ? "Repo policy is declared and should still be checked before finalizing wrapper, shell, or migration-shim choices."
        : "Repo policy may still refine wrapper, shell, or migration-shim choices after the canonical Salt plan is chosen.",
    );
    raiseConfidence.push(
      projectConventionsCheck.declared
        ? "Check the declared project conventions before finalizing the migrated structure."
        : "Add .salt/team.json or confirm the relevant project conventions before finalizing wrapper or shell choices.",
    );
  }

  if ((projectConventionsCheck?.warnings.length ?? 0) > 0) {
    reasons.push(
      "Declared project conventions could not be fully resolved for this migration plan.",
    );
    const firstWarning = projectConventionsCheck?.warnings[0];
    if (firstWarning) {
      raiseConfidence.push(firstWarning);
    }
  }

  return {
    level,
    reasons,
    askBeforeProceeding,
    raiseConfidence: Array.from(new Set(raiseConfidence)),
  };
}

function buildMigrateVisualEvidence(
  visualEvidence: LoadedMigrationVisualEvidence,
  requestedUrl: string | null,
  runtimeResult: RuntimeInspectResult | null,
): MigrateWorkflowResult["artifacts"]["visualEvidence"] {
  const reasons: string[] = [];
  let level: MigrateWorkflowResult["artifacts"]["visualEvidence"]["confidenceImpact"]["level"] =
    "none";

  if (visualEvidence.visualInputs.length > 0) {
    level = "supporting";
    reasons.push(
      "Adapter-derived mockup or screenshot evidence contributed regions, actions, and states before the Salt mapping step.",
    );
  } else if (visualEvidence.sourceOutline) {
    level = "supporting";
    reasons.push(
      "Structured outline signals contributed regions, actions, and states before the Salt mapping step.",
    );
  }

  if (runtimeResult) {
    level = visualEvidence.mergedOutline ? "stronger-scoping" : "supporting";
    reasons.push(
      "Current UI capture contributed live landmarks, action hierarchy, structure, and layout signals.",
    );
  }

  const mockups = visualEvidence.visualInputs
    .filter((entry) => entry.kind === "mockup")
    .map((entry) => ({
      sourceType: entry.sourceType,
      source: entry.source,
      label: entry.label,
      confidence: entry.confidence,
      regions: entry.counts.regions,
      actions: entry.counts.actions,
      states: entry.counts.states,
      notes: entry.counts.notes,
      adapterNotes: entry.notes,
    }));
  const screenshots = visualEvidence.visualInputs
    .filter((entry) => entry.kind === "screenshot")
    .map((entry) => ({
      sourceType: entry.sourceType,
      source: entry.source,
      label: entry.label,
      confidence: entry.confidence,
      regions: entry.counts.regions,
      actions: entry.counts.actions,
      states: entry.counts.states,
      notes: entry.counts.notes,
      adapterNotes: entry.notes,
    }));

  return {
    contract: {
      role: "supporting-evidence",
      notCanonicalSourceOfTruth: true,
      supportedInputs: [
        "structured-outline",
        "current-ui-capture",
        "mockup-image",
        "screenshot-file",
        "image-url",
      ],
      interpretationOwner: "agent-or-adapter",
      normalizationRequired: true,
      normalizationContract: "migrate_visual_evidence_v1",
      structuredOutputs: [
        "landmarks",
        "action-hierarchy",
        "layout-signals",
        "familiarity-anchors",
        "confidence-impact",
      ],
    },
    interpretationOwner: "agent-or-adapter",
    inputs: {
      structuredOutline: {
        provided: Boolean(visualEvidence.sourceOutline),
        path: visualEvidence.sourceOutline?.path ?? null,
        regions: visualEvidence.sourceOutline?.counts.regions ?? 0,
        actions: visualEvidence.sourceOutline?.counts.actions ?? 0,
        states: visualEvidence.sourceOutline?.counts.states ?? 0,
        notes: visualEvidence.sourceOutline?.counts.notes ?? 0,
      },
      currentUiCapture: {
        requested: Boolean(requestedUrl),
        url: requestedUrl,
        mode: runtimeResult?.inspectionMode ?? null,
        currentExperienceCaptured: Boolean(runtimeResult),
        screenshotArtifacts: runtimeResult?.screenshots.length ?? 0,
      },
      mockups,
      screenshots,
    },
    derivedOutline: {
      available: Boolean(visualEvidence.mergedOutline),
      regions: visualEvidence.mergedOutline?.counts.regions ?? 0,
      actions: visualEvidence.mergedOutline?.counts.actions ?? 0,
      states: visualEvidence.mergedOutline?.counts.states ?? 0,
      notes: visualEvidence.mergedOutline?.counts.notes ?? 0,
    },
    confidenceImpact: {
      level,
      reasons,
      changedScoping: level !== "none",
      changedConfidence: reasons.length > 0,
    },
    ambiguities: visualEvidence.ambiguities,
  };
}

function describeMigrateVisualEvidence(
  visualEvidence: MigrateWorkflowResult["artifacts"]["visualEvidence"],
): string {
  const activeInputs: string[] = [];
  if (visualEvidence.inputs.structuredOutline.provided) {
    activeInputs.push("structured outline");
  }
  if (visualEvidence.inputs.mockups.length > 0) {
    activeInputs.push("mockup image");
  }
  if (visualEvidence.inputs.screenshots.length > 0) {
    activeInputs.push("screenshot evidence");
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
  comparison: UpgradeSaltUiResult,
  inferredFromVersion: boolean,
  projectConventionsCheck: WorkflowProjectConventionsCheckSummary | null,
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

  if (projectConventionsCheck?.checkRecommended) {
    level = level === "low" ? "low" : "medium";
    reasons.push(
      projectConventionsCheck.declared
        ? "Repo policy is declared and may still refine migration shims, wrappers, or compatibility decisions during the upgrade."
        : "Repo policy may still refine migration shims, wrappers, or compatibility decisions during the upgrade.",
    );
    raiseConfidence.push(
      projectConventionsCheck.declared
        ? "Check the declared project conventions before finalizing the upgrade rollout."
        : "Add .salt/team.json or confirm the relevant project conventions before finalizing the upgrade rollout.",
    );
  }

  if ((projectConventionsCheck?.warnings.length ?? 0) > 0) {
    level = level === "low" ? "low" : "medium";
    reasons.push(
      "Declared project conventions could not be fully resolved for this upgrade plan.",
    );
    const firstWarning = projectConventionsCheck?.warnings[0];
    if (firstWarning) {
      raiseConfidence.push(firstWarning);
    }
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
  sourceOutline: ResolvedSourceOutline | null,
  visualEvidence: LoadedMigrationVisualEvidence,
  currentExperience: MigrateWorkflowResult["artifacts"]["runtimeEvidence"]["currentExperience"],
  projectConventionsCheck: WorkflowProjectConventionsCheckSummary | null,
): MigrateWorkflowResult["artifacts"]["postMigrationVerification"] {
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

  if (projectConventionsCheck?.checkRecommended) {
    sourceChecks.push(
      projectConventionsCheck.declared
        ? "Confirm repo-local wrappers, shells, or migration shims from the declared project conventions before finalizing the migrated code."
        : "Confirm any repo-local wrappers, shells, or migration shims before finalizing the migrated code.",
    );
  }

  if (visualEvidence.visualInputs.some((entry) => entry.confidence === "low")) {
    sourceChecks.push(
      "Treat low-confidence screenshot or mockup interpretations as provisional until they are confirmed against code review, runtime evidence, or an updated outline.",
    );
    confirmationChecks.push(
      "Confirm the low-confidence visual interpretations before the first migration scaffold is treated as final.",
    );
  }

  if (visualEvidence.ambiguities.length > 0) {
    confirmationChecks.push(...visualEvidence.ambiguities);
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
  sourceOutline: ResolvedSourceOutline | null,
  visualEvidence: LoadedMigrationVisualEvidence,
  currentExperience: MigrateWorkflowResult["artifacts"]["runtimeEvidence"]["currentExperience"],
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

  if (visualEvidence.visualInputs.some((entry) => entry.confidence === "low")) {
    combinedQuestions.push(
      "Which parts of the low-confidence screenshot or mockup interpretation must be confirmed before the first migration pass?",
    );
  }

  return Array.from(
    new Set([
      ...(combinedQuestions.length > 0 ? combinedQuestions : []),
      ...visualEvidence.ambiguities,
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
  if (!context.policy.teamConfigPath && !context.policy.stackConfigPath) {
    notes.push(
      "No .salt/team.json or .salt/stack.json is declared. Review results use canonical Salt guidance only unless durable repo policy is added later.",
    );
  }
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
    `Root: ${result.artifacts.context.rootDir}`,
    `Status: ${result.result.summary.status}`,
    `Confidence: ${result.workflow.confidence.level}`,
    `Files needing attention: ${result.result.summary.filesNeedingAttention}`,
    `Clean files: ${result.result.summary.cleanFiles}`,
    `Next step: ${result.result.summary.nextStep}`,
  ];

  if (result.workflow.confidence.reasons.length > 0) {
    lines.push(`Why: ${result.workflow.confidence.reasons[0]}`);
  }

  if (result.workflow.confidence.raiseConfidence.length > 0) {
    lines.push(
      `Raise confidence: ${result.workflow.confidence.raiseConfidence[0]}`,
    );
  }

  if (result.workflow.projectConventionsCheck) {
    lines.push(
      `Project policy: ${result.workflow.projectConventionsCheck.policyMode} (${result.workflow.projectConventionsCheck.checkRecommended ? "check recommended" : "declared"})`,
    );
    if (result.workflow.projectConventionsCheck.sharedPacks.length > 0) {
      lines.push(
        `Shared packs: ${result.workflow.projectConventionsCheck.sharedPacks.join(", ")}`,
      );
    }
  }

  appendProjectPolicyLines(lines, result.artifacts.projectPolicy);

  if (result.artifacts.issueClasses.length > 0) {
    lines.push("Issue classes:");
    lines.push(
      ...result.artifacts.issueClasses.map(
        (entry) => `- ${entry.ruleId}: ${entry.label} (${entry.count})`,
      ),
    );
  }

  if (result.artifacts.fixCandidates.totalCount > 0) {
    lines.push(
      `Fix candidates: ${result.result.summary.fixCandidateCount} (${result.result.summary.deterministicFixCandidateCount} deterministic, ${result.result.summary.manualReviewFixCandidateCount} manual review)`,
    );
  }

  if (result.artifacts.expectedTargetReview) {
    const expectedPatterns =
      result.artifacts.expectedTargetReview.expectedTargets.patterns ?? [];
    const expectedComponents =
      result.artifacts.expectedTargetReview.expectedTargets.components ?? [];
    lines.push(
      `Create report: ${result.artifacts.expectedTargetReview.reportPath}`,
    );
    if (expectedPatterns.length > 0) {
      lines.push(`Expected patterns: ${expectedPatterns.join(", ")}`);
    }
    if (expectedComponents.length > 0) {
      lines.push(`Expected components: ${expectedComponents.join(", ")}`);
    }
    if (result.artifacts.expectedTargetReview.issues.length > 0) {
      lines.push("Expected-target issues:");
      lines.push(
        ...result.artifacts.expectedTargetReview.issues.map(
          (issue) =>
            `- ${readStringRecordValue(issue, "title") ?? readStringRecordValue(issue, "id") ?? "issue"}`,
        ),
      );
    }
  }

  if (result.artifacts.migrationVerification) {
    lines.push(
      `Migration verification: ${result.artifacts.migrationVerification.summary.verified} verified, ${result.artifacts.migrationVerification.summary.manualReview} manual review, ${result.artifacts.migrationVerification.summary.notChecked} not checked`,
    );
  }

  if (result.artifacts.runtimeEvidence.requested) {
    lines.push(
      `Runtime mode: ${result.result.summary.runtimeMode ?? "not-requested"}`,
    );
    lines.push(`Runtime issues: ${result.result.summary.runtimeIssues}`);
  }

  if (result.result.sourceValidation.files.length > 0) {
    lines.push("Top files:");
    lines.push(
      ...result.result.sourceValidation.files.slice(0, 5).map((file) => {
        const counts = `${file.summary.errors} error${file.summary.errors === 1 ? "" : "s"}, ${file.summary.warnings} warning${file.summary.warnings === 1 ? "" : "s"}, ${file.summary.infos} info${file.summary.infos === 1 ? "" : "s"}`;
        return `- ${file.relativePath}: ${file.decision.status} (${counts})`;
      }),
    );
  }

  if (result.artifacts.runtimeEvidence.result?.artifacts.length) {
    lines.push("Artifacts:");
    lines.push(
      ...result.artifacts.runtimeEvidence.result.artifacts.map(
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
    `Confidence: ${result.workflow.confidence.level}`,
    `Translations: ${result.result.summary.translationCount}`,
    `Manual reviews: ${result.result.summary.manualReviews}`,
    `Requires confirmation: ${result.result.summary.confirmationRequired}`,
    `Starter validation: ${result.result.summary.starterValidationStatus}`,
    `Visual evidence: ${describeMigrateVisualEvidence(result.artifacts.visualEvidence)}`,
    `Rule IDs: ${result.artifacts.ruleIds.join(", ")}`,
    `Next step: ${result.result.summary.nextStep}`,
  ];

  if (result.workflow.confidence.reasons.length > 0) {
    lines.push(`Why: ${result.workflow.confidence.reasons[0]}`);
  }

  if (result.workflow.confidence.raiseConfidence.length > 0) {
    lines.push(
      `Raise confidence: ${result.workflow.confidence.raiseConfidence[0]}`,
    );
  }

  if (result.artifacts.starterValidation?.status === "needs_attention") {
    lines.push(
      `Starter validation detail: ${result.artifacts.starterValidation.top_issue ?? "Starter code still needs Salt-specific cleanup."}`,
    );
  }

  if (result.workflow.projectConventionsCheck) {
    lines.push(
      `Project policy: ${result.workflow.projectConventionsCheck.policyMode} (${result.workflow.projectConventionsCheck.checkRecommended ? "check recommended" : "declared"})`,
    );
    if (result.workflow.projectConventionsCheck.sharedPacks.length > 0) {
      lines.push(
        `Shared packs: ${result.workflow.projectConventionsCheck.sharedPacks.join(", ")}`,
      );
    }
  }

  appendProjectPolicyLines(lines, result.artifacts.projectPolicy);

  if (result.artifacts.runtimeEvidence.requested) {
    lines.push(
      `Runtime mode: ${result.result.summary.runtimeMode ?? "not-requested"}`,
    );
  }

  if (result.result.translation.familiarity_contract.preserve.length > 0) {
    lines.push("Preserve:");
    lines.push(
      ...result.result.translation.familiarity_contract.preserve
        .slice(0, 3)
        .map((entry) => `- ${entry}`),
    );
  }

  if (result.result.migrationScope.questions.length > 0) {
    lines.push("Clarify first:");
    lines.push(
      ...result.result.migrationScope.questions
        .slice(0, 3)
        .map((entry) => `- ${entry}`),
    );
  }

  if (result.result.translation.translations.length > 0) {
    lines.push("Top targets:");
    lines.push(
      ...result.result.translation.translations.slice(0, 5).map((entry) => {
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
): MigrateWorkflowResult["artifacts"]["runtimeEvidence"]["currentExperience"] {
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
    `Target: ${result.result.summary.target}`,
    `Confidence: ${result.workflow.confidence.level}`,
    `Rule IDs: ${result.artifacts.ruleIds.join(", ")}`,
    `From: ${result.result.summary.fromVersion}`,
    `To: ${result.result.summary.toVersion}`,
    `Changes: ${result.result.summary.changeCount}`,
    ...(result.workflow.confidence.reasons.length > 0
      ? [`Why: ${result.workflow.confidence.reasons[0]}`]
      : []),
    ...(result.workflow.confidence.raiseConfidence.length > 0
      ? [`Raise confidence: ${result.workflow.confidence.raiseConfidence[0]}`]
      : []),
    ...(result.workflow.projectConventionsCheck
      ? [
          `Project policy: ${result.workflow.projectConventionsCheck.policyMode} (${result.workflow.projectConventionsCheck.checkRecommended ? "check recommended" : "declared"})`,
          ...(result.workflow.projectConventionsCheck.sharedPacks.length > 0
            ? [
                `Shared packs: ${result.workflow.projectConventionsCheck.sharedPacks.join(", ")}`,
              ]
            : []),
        ]
      : []),
    `Next step: ${result.result.summary.nextStep}`,
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
    result.artifacts.projectConventions?.layersConsulted ?? [],
  );
  const appliedLayer = formatProjectPolicyLayer(
    result.artifacts.projectConventions?.appliedRule?.layer,
  );
  const themeDefaultSummary = formatThemeDefaultSummary(
    result.artifacts.projectConventions?.themeDefaults ?? null,
  );
  const tokenFamilyPolicySummary = formatTokenFamilyPolicySummary(
    result.artifacts.projectConventions?.tokenFamilyPolicies ?? [],
  );
  const finalDecisionName =
    result.result.summary.finalDecisionName ??
    result.result.summary.decisionName ??
    "none";
  const decisionScope =
    /\b(dashboard|page|screen|workspace|overview)\b/i.test(finalDecisionName) ||
    (result.result.recommendation.composition_contract?.slots?.length ?? 0) >= 3
      ? "page-level pattern"
      : "focused pattern or component";
  const lines = [
    "Salt DS Create",
    `Root: ${result.artifacts.context.rootDir}`,
    `Confidence: ${result.workflow.confidence.level}`,
    `Task: ${result.result.intent.userTask}`,
    `Key interaction: ${result.result.intent.keyInteraction}`,
    `Composition direction: ${result.result.intent.compositionDirection}`,
    `Canonical choice: ${result.result.intent.canonicalChoice ?? "none"}`,
    `Mode: ${result.result.summary.mode}`,
    `Solution type: ${result.result.summary.solutionType}`,
    `Decision: ${finalDecisionName}`,
    `Decision scope: ${decisionScope}`,
    `Next step: ${result.result.summary.nextStep}`,
    `Starter validation: ${result.result.summary.starterValidationStatus}`,
    `Implementation gate: ${result.workflow.implementationGate.status}`,
  ];

  if (result.workflow.implementationGate.status === "follow_through_required") {
    lines.push(
      `Implementation gate reason: ${result.workflow.implementationGate.reason}`,
      `Required follow-through: ${result.workflow.implementationGate.required_follow_through.join(", ")}`,
    );
  }

  if (result.artifacts.starterValidation?.status === "needs_attention") {
    lines.push(
      `Starter validation detail: ${result.artifacts.starterValidation.top_issue ?? "Starter code still needs Salt-specific cleanup."}`,
    );
  }

  if (result.artifacts.projectConventions) {
    lines.push(
      `Project policy mode: ${result.artifacts.projectConventions.policyMode}`,
      `Project conventions check: ${
        result.artifacts.projectConventions.consulted
          ? "consulted"
          : "not applied"
      }`,
    );

    if (consultedLayers) {
      lines.push(`Project policy layers: ${consultedLayers}`);
    }

    if (themeDefaultSummary) {
      lines.push(`Project theme default: ${themeDefaultSummary}`);
    }

    if (result.artifacts.projectConventions.tokenAliases.length > 0) {
      lines.push(
        `Project token aliases: ${result.artifacts.projectConventions.tokenAliases.length}`,
      );
    }

    if (tokenFamilyPolicySummary) {
      lines.push(`Project token families: ${tokenFamilyPolicySummary}`);
    }

    if (result.artifacts.projectConventions.applied) {
      lines.push(
        `Project override: ${
          result.artifacts.projectConventions.finalRecommendation ?? "none"
        } via ${result.artifacts.projectConventions.appliedRule?.type ?? "project convention"} from ${
          appliedLayer ?? "project conventions"
        }`,
        `Final project answer: ${
          result.artifacts.projectConventions.finalRecommendation ?? "none"
        }`,
      );
    } else if (result.artifacts.projectConventions.consulted) {
      lines.push(
        `Final project answer: ${
          result.artifacts.projectConventions.finalRecommendation ?? "none"
        }`,
      );
    }

    if (result.artifacts.projectConventions.warnings.length > 0) {
      lines.push(
        `Project policy warning: ${result.artifacts.projectConventions.warnings[0]}`,
      );
    }
  }

  if (result.workflow.confidence.reasons.length > 0) {
    lines.push(`Why: ${result.workflow.confidence.reasons[0]}`);
  }

  if (result.workflow.confidence.raiseConfidence.length > 0) {
    lines.push(
      `Raise confidence: ${result.workflow.confidence.raiseConfidence[0]}`,
    );
  }

  const openQuestions = result.result.recommendation.open_questions ?? [];
  if (openQuestions.length > 0) {
    lines.push("Open questions:");
    lines.push(...openQuestions.map((question) => `- ${question.prompt}`));
  }

  if (result.result.summary.suggestedFollowUps.length > 0) {
    lines.push("Suggested follow-ups:");
    lines.push(
      ...result.result.summary.suggestedFollowUps.map(
        (followUp) => `- ${followUp}`,
      ),
    );
  }

  lines.push(`Rule IDs: ${result.result.intent.ruleIds.join(", ")}`);

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
    const createType = flags.type === "composition" ? "pattern" : flags.type;
    const context = await collectSaltInfo(io.cwd, flags["registry-dir"]);
    const { registry } = await resolveSemanticRegistry(
      io.cwd,
      flags["registry-dir"],
    );
    const rawRecommendation = createSaltUi(registry, {
      query,
      solution_type:
        createType === "component" ||
        createType === "pattern" ||
        createType === "foundation" ||
        createType === "token" ||
        createType === "auto"
          ? createType
          : undefined,
      package: flags.package,
      status:
        flags.status === "stable" ||
        flags.status === "beta" ||
        flags.status === "lab" ||
        flags.status === "deprecated"
          ? flags.status
          : undefined,
      include_starter_code: flags["include-starter-code"] !== "false",
      view: flags.full === "true" ? "full" : "compact",
    }) as PublicCreateRecommendation;
    const recommendation: PublicCreateRecommendation = {
      ...rawRecommendation,
      suggested_follow_ups: toPublicCliSuggestedFollowUps(
        rawRecommendation.suggested_follow_ups,
      ),
    };
    const projectConventions = await loadCreateProjectConventionsSummary({
      rootDir: io.cwd,
      policy: context.policy,
      salt: context.salt,
      decision: recommendation.decision,
      guidanceBoundary: recommendation.guidance_boundary,
    });
    const projectPolicy = await loadWorkflowProjectPolicySummary({
      rootDir: io.cwd,
      policy: context.policy,
      salt: context.salt,
    });
    const policyStarterCode = applyProjectPolicyToStarterCodeSnippets(
      recommendation.starter_code,
      projectPolicy,
    );
    const policyRecommendation: PublicCreateRecommendation = {
      ...recommendation,
      ...(policyStarterCode ? { starter_code: policyStarterCode } : {}),
    };
    const canonicalContract = buildCreateSaltUiWorkflowContract(
      registry,
      policyRecommendation,
      {
        query,
        context_checked: true,
        project_policy: projectPolicy,
        starter_code: policyStarterCode,
      },
    );
    const starterValidation = canonicalContract.starter_validation;
    const repoRefinement = canonicalContract.repo_refinement;
    const projectConventionRepoRefinement =
      toActionableProjectConventionsRepoRefinement(projectConventions);
    const effectiveRepoRefinement =
      projectConventionRepoRefinement ?? repoRefinement;
    const workflowReadiness = toCliWorkflowReadiness(
      canonicalContract.readiness,
    );
    const consultedPolicyLayers = formatProjectPolicyLayers(
      projectConventions?.layersConsulted ?? [],
    );
    const appliedPolicyLayer = formatProjectPolicyLayer(
      projectConventions?.appliedRule?.layer,
    );
    const result: CreateWorkflowResult = {
      workflow: {
        id: "create",
        transportUsed: "cli",
        implementationGate: canonicalContract.implementation_gate,
        confidence: buildCreateConfidence(
          policyRecommendation,
          context,
          projectConventions,
          starterValidation,
          canonicalContract.implementation_gate,
        ),
        readiness: workflowReadiness,
        contextRequirement: buildCliWorkflowContextRequirement(),
        projectConventionsCheck: canonicalContract.project_conventions_check,
        provenance: canonicalContract.provenance,
      },
      result: {
        intent: {
          userTask: canonicalContract.intent.user_task,
          keyInteraction: canonicalContract.intent.key_interaction,
          compositionDirection: canonicalContract.intent.composition_direction,
          canonicalChoice: canonicalContract.intent.canonical_choice,
          ruleIds: canonicalContract.intent.rule_ids as CreateRuleId[],
        },
        recommendation: policyRecommendation,
        summary: {
          mode: policyRecommendation.mode,
          solutionType: policyRecommendation.solution_type,
          decisionName: policyRecommendation.decision.name,
          finalDecisionName:
            effectiveRepoRefinement?.final_name ??
            policyRecommendation.decision.name,
          finalDecisionSource:
            effectiveRepoRefinement?.source === "project_policy"
              ? "project_policy"
              : "canonical_salt",
          starterValidationStatus: toCliStarterValidationStatus(
            workflowReadiness,
            starterValidation,
          ),
          nextStep: buildCliWorkflowSummaryNextStep({
            readiness: workflowReadiness,
            defaultNextStep:
              recommendation.next_step ??
              "Use the recommended Salt direction as the first scaffold, then validate the changed code with salt-ds review.",
          }),
          suggestedFollowUps:
            recommendation.suggested_follow_ups?.map(
              (entry) => entry.workflow,
            ) ?? [],
        },
      },
      artifacts: {
        context,
        starterValidation,
        projectConventions,
        projectPolicy,
        repoRefinement: effectiveRepoRefinement,
        notes: Array.from(
          new Set([
            ...context.notes,
            ...(!context.policy.teamConfigPath &&
            !context.policy.stackConfigPath
              ? [
                  "No .salt/team.json or .salt/stack.json is declared yet. Proceed with the canonical Salt direction first, and add repo-local policy only if durable wrappers, bans, or pattern preferences would change the final answer.",
                ]
              : []),
            ...(recommendation.guidance_boundary.project_conventions
              .check_recommended
              ? [
                  "The canonical create result recommends a project-conventions check before the final project answer is locked.",
                ]
              : []),
            ...(projectConventions &&
            projectConventionRepoRefinement?.status ===
              "refined_by_project_policy"
              ? [
                  `Project conventions changed the final project answer from ${
                    projectConventions.canonicalChoice.name ?? "none"
                  } to ${projectConventions.finalRecommendation ?? "none"}.`,
                  ...(appliedPolicyLayer
                    ? [`Project policy layer applied: ${appliedPolicyLayer}.`]
                    : []),
                ]
              : projectConventions?.applied
                ? [
                    `Project conventions suggested ${
                      projectConventions.finalRecommendation ?? "none"
                    } instead of ${
                      projectConventions.canonicalChoice.name ?? "none"
                    }, but no actionable import metadata was declared, so the workflow output stayed on canonical Salt.`,
                    ...(appliedPolicyLayer
                      ? [
                          `Project policy layer consulted: ${appliedPolicyLayer}.`,
                        ]
                      : []),
                  ]
                : projectConventions?.consulted
                  ? [
                      "Project conventions were checked and kept the canonical Salt answer.",
                    ]
                  : []),
            ...(repoRefinement?.status === "refined_by_project_policy" &&
            projectConventionRepoRefinement == null
              ? [
                  `Repo policy refines the final project answer from ${
                    repoRefinement.canonical_name ?? "none"
                  } to ${repoRefinement.final_name ?? "none"}.`,
                ]
              : []),
            ...(consultedPolicyLayers
              ? [`Project policy layers consulted: ${consultedPolicyLayers}.`]
              : []),
            ...(projectConventions?.themeDefaults?.provider
              ? [
                  `Project theme default: ${projectConventions.themeDefaults.provider}.`,
                ]
              : []),
            ...(projectConventions && projectConventions.tokenAliases.length > 0
              ? [
                  `Project token aliases declared: ${projectConventions.tokenAliases.length}.`,
                ]
              : []),
            ...(projectConventions &&
            projectConventions.tokenFamilyPolicies.length > 0
              ? [
                  `Project token family policies declared: ${projectConventions.tokenFamilyPolicies
                    .map((entry) => `${entry.family}:${entry.mode}`)
                    .join(", ")}.`,
                ]
              : []),
            ...(projectConventions?.warnings ?? []),
            ...buildProjectPolicyNotes(projectPolicy),
            ...(starterValidation?.status === "needs_attention"
              ? [
                  `Starter code self-check found Salt issues: ${starterValidation.top_issue ?? "review the starter validation output before editing."}`,
                ]
              : []),
          ]),
        ),
      },
    };

    await writeWorkflowOutput(result, flags, io, formatCreateReport);
    if (
      !recommendation.decision.name ||
      shouldFailWorkflowReadiness(workflowReadiness)
    ) {
      return 2;
    }
    return 0;
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
    const visualEvidence = await loadMigrationVisualEvidence({
      rootDir: io.cwd,
      sourceOutlinePath: flags["source-outline"],
      mockups: readRepeatableFlagValues(flags.mockup),
      screenshots: readRepeatableFlagValues(flags.screenshot),
      adapterCommand: process.env[MIGRATE_VISUAL_ADAPTER_ENV_VAR],
    });
    const sourceOutline = visualEvidence.sourceOutline;
    const derivedOutline = visualEvidence.mergedOutline;
    if (!query && !derivedOutline) {
      io.writeStderr(
        "Missing query. Usage: salt-ds migrate [query] [--source-outline <path>] [--mockup <path-or-url>] [--screenshot <path-or-url>]\n",
      );
      return 1;
    }

    const context = await collectSaltInfo(io.cwd, flags["registry-dir"]);
    const { registry } = await resolveSemanticRegistry(
      io.cwd,
      flags["registry-dir"],
    );
    const rawTranslation = migrateToSalt(registry, {
      query: query || undefined,
      source_outline: sourceOutline?.outline,
      visual_evidence: visualEvidence.visualInputs.map((entry) => ({
        kind: entry.kind,
        source_type: entry.sourceType,
        source: entry.source,
        ...(entry.label ? { label: entry.label } : {}),
        derived_outline: entry.derivedOutline,
        confidence: entry.confidence,
        ...(entry.notes.length > 0 ? { notes: entry.notes } : {}),
      })),
      package: flags.package,
      include_starter_code: flags["include-starter-code"] !== "false",
      view: flags.full === "true" ? "full" : "compact",
    }) as PublicTranslateResult;
    const translation: PublicTranslateResult = {
      ...rawTranslation,
      suggested_follow_ups: toPublicCliSuggestedFollowUps(
        rawTranslation.suggested_follow_ups,
      ),
    };
    const projectPolicy = await loadWorkflowProjectPolicySummary({
      rootDir: io.cwd,
      policy: context.policy,
      salt: context.salt,
    });
    const policyStarterCode = applyProjectPolicyToStarterCodeSnippets(
      translation.starter_code,
      projectPolicy,
    );
    const policyCombinedScaffold = applyProjectPolicyToStarterCodeSnippets(
      translation.combined_scaffold,
      projectPolicy,
    );
    const policyTranslation: PublicTranslateResult = {
      ...translation,
      ...(policyStarterCode ? { starter_code: policyStarterCode } : {}),
      ...(policyCombinedScaffold
        ? { combined_scaffold: policyCombinedScaffold }
        : {}),
    };
    const canonicalContract = buildMigrateToSaltWorkflowContract(
      registry,
      policyTranslation as MigrateToSaltResult,
      {
        source_outline: sourceOutline?.outline,
        visual_evidence: visualEvidence.visualInputs.map((entry) => ({
          kind: entry.kind,
          source_type: entry.sourceType,
          source: entry.source,
          ...(entry.label ? { label: entry.label } : {}),
          derived_outline: entry.derivedOutline,
          confidence: entry.confidence,
          ...(entry.notes.length > 0 ? { notes: entry.notes } : {}),
        })),
        context_checked: true,
        project_policy: projectPolicy,
        starter_code: policyStarterCode,
      },
    );
    const starterValidation = canonicalContract.starter_validation;
    const workflowReadiness = toCliWorkflowReadiness(
      canonicalContract.readiness,
    );
    const projectConventionsCheck = buildProjectConventionsCheckSummary({
      policy: context.policy,
      guidanceBoundaries: [translation.guidance_boundary],
    });

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
      workflow: {
        id: "migrate",
        transportUsed: "cli",
        confidence: buildMigrateConfidence(
          policyTranslation,
          context,
          runtimeResult,
          visualEvidence,
          projectConventionsCheck,
          starterValidation,
        ),
        readiness: workflowReadiness,
        contextRequirement: buildCliWorkflowContextRequirement(),
        projectConventionsCheck,
        provenance: canonicalContract.provenance,
      },
      result: {
        translation: policyTranslation,
        migrationScope: {
          questions: buildMigrateQuestions(
            translation,
            derivedOutline,
            visualEvidence,
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
        summary: {
          translationCount: translation.translations.length,
          manualReviews: translation.summary.manual_reviews,
          confirmationRequired: translation.summary.confirmation_required,
          runtimeMode: runtimeResult?.inspectionMode ?? null,
          starterValidationStatus: toCliStarterValidationStatus(
            workflowReadiness,
            starterValidation,
          ),
          nextStep: buildCliWorkflowSummaryNextStep({
            readiness: workflowReadiness,
            defaultNextStep:
              translation.next_step ??
              "Apply the migration in stages, then run salt-ds review on the changed files.",
          }),
        },
      },
      artifacts: {
        context,
        starterValidation,
        projectPolicy,
        ruleIds: getMigrationRuleIds({
          projectConventionsMayMatter:
            translation.guidance_boundary.project_conventions.check_recommended,
          runtimeScopingMatters:
            Boolean(requestedUrl) || context.runtime.detectedTargets.length > 0,
          requiresConfirmation: translation.summary.confirmation_required > 0,
        }),
        visualEvidence: buildMigrateVisualEvidence(
          visualEvidence,
          requestedUrl,
          runtimeResult,
        ),
        postMigrationVerification: buildPostMigrationVerification(
          translation,
          Boolean(requestedUrl),
          derivedOutline,
          visualEvidence,
          currentExperience,
          projectConventionsCheck,
        ),
        runtimeEvidence: {
          requested: Boolean(requestedUrl),
          url: requestedUrl,
          result: runtimeResult,
          currentExperience,
        },
        notes: Array.from(
          new Set([
            ...context.notes,
            ...(!context.policy.teamConfigPath &&
            !context.policy.stackConfigPath
              ? [
                  "No .salt/team.json or .salt/stack.json is declared yet. Migration guidance uses canonical Salt only unless durable repo policy is added later.",
                ]
              : []),
            "Keep canonical Salt mappings separate from repo-local wrapper decisions until after the first migration pass.",
            ...buildProjectConventionsCheckNotes(projectConventionsCheck),
            ...buildProjectPolicyNotes(projectPolicy),
            ...(visualEvidence.visualInputs.length > 0
              ? [
                  `Adapter-derived visual evidence was used from ${visualEvidence.visualInputs
                    .map((entry) => entry.label ?? entry.source)
                    .join(", ")}.`,
                ]
              : sourceOutline
                ? [
                    `Structured visual evidence from --source-outline was used at ${sourceOutline.path}.`,
                  ]
                : [
                    `Add --source-outline, or configure ${MIGRATE_VISUAL_ADAPTER_ENV_VAR} before using --mockup/--screenshot, when the migration starts from a mockup, screenshot notes, or a rough design outline.`,
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
            ...(derivedOutline && requestedUrl
              ? [
                  "Derived outline evidence and runtime capture were both used, so any mismatch between the mockup-style plan and the live UI should be clarified before coding.",
                ]
              : []),
            ...(visualEvidence.ambiguities.length > 0
              ? visualEvidence.ambiguities
              : []),
            "Canonical Salt guidance remained the source of truth; visual evidence only scoped the migration.",
            ...(starterValidation?.status === "needs_attention"
              ? [
                  `Starter code self-check found Salt issues: ${starterValidation.top_issue ?? "review the starter validation output before editing."}`,
                ]
              : []),
          ]),
        ),
      },
    };

    await writeWorkflowOutput(result, flags, io, (payload) =>
      formatMigrateReport(payload, query),
    );
    return shouldFailWorkflowReadiness(workflowReadiness) ? 2 : 0;
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
    const comparison = upgradeSaltUi(registry, {
      package: inferredPackage,
      component_name: flags.component,
      from_version: inferredFromVersion,
      to_version: flags["to-version"],
      include_deprecations: flags["include-deprecations"] === "true",
      view: flags.full === "true" ? "full" : "compact",
    });
    const projectConventionsCheck = buildProjectConventionsCheckSummary({
      policy: context.policy,
      guidanceBoundaries: [comparison.guidance_boundary],
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
      workflow: {
        id: "upgrade",
        transportUsed: "cli",
        confidence: buildUpgradeConfidence(
          comparison,
          fromVersionWasInferred,
          projectConventionsCheck,
        ),
        provenance: buildUpgradeSaltUiWorkflowContract(comparison).provenance,
        projectConventionsCheck,
      },
      result: {
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
      },
      artifacts: {
        context,
        ruleIds: getUpgradeRuleIds(),
        notes: Array.from(
          new Set([
            ...context.notes,
            ...buildProjectConventionsCheckNotes(projectConventionsCheck),
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
      },
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
    const sourceValidation = await analyzeLintTargets(
      positionals.length > 0 ? positionals : ["."],
      io.cwd,
      flags["registry-dir"],
    );
    const context = await collectSaltInfo(io.cwd, flags["registry-dir"]);
    const { registry } = await resolveSemanticRegistry(
      io.cwd,
      flags["registry-dir"],
    );
    const projectPolicy = await loadWorkflowProjectPolicySummary({
      rootDir: io.cwd,
      policy: context.policy,
      salt: context.salt,
    });
    const codeByPath = new Map<string, string>(
      await Promise.all(
        sourceValidation.files.map(
          async (file): Promise<[string, string]> => [
            file.path,
            await fs.readFile(file.path, "utf8"),
          ],
        ),
      ),
    );
    const fixCandidates = buildReviewFixCandidates(sourceValidation, {
      projectPolicy,
      codeByPath,
    });
    const loadedCreateReviewTargets = await loadCreateReviewTargets(
      io.cwd,
      flags["create-report"],
      registry,
    );
    const expectedTargetReviewIssues =
      loadedCreateReviewTargets == null
        ? []
        : extractWorkflowExpectedIssues(
            reviewSaltUi(registry, {
              code: Array.from(codeByPath.values()).join("\n\n"),
              framework: "react",
              package_version: sourceValidation.packageVersion ?? undefined,
              expected_targets: loadedCreateReviewTargets.expectedTargets,
            }).issues,
          );
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
    const projectConventionsCheck = buildProjectConventionsCheckSummary({
      policy: context.policy,
      guidanceBoundaries: sourceValidation.files.map(
        (file) => file.guidanceBoundary,
      ),
    });

    const mergedIssues = sortIssueRecords(
      dedupeIssueRecords([
        ...sourceValidation.files.flatMap((file) =>
          (file.issues ?? []).filter(
            (entry): entry is Record<string, unknown> =>
              Boolean(entry) && typeof entry === "object",
          ),
        ),
        ...expectedTargetReviewIssues,
      ]),
    );
    const mergedIssueSummary = summarizeIssueRecords(mergedIssues);
    const mergedSourceUrls = uniqueStrings([
      ...sourceValidation.files.flatMap((file) => file.sourceUrls),
      ...expectedTargetReviewIssues.flatMap((issue) =>
        readStringArrayRecordValue(issue, "source_urls"),
      ),
    ]);
    const topMergedIssue =
      mergedIssues.length > 0
        ? (readStringRecordValue(mergedIssues[0], "message") ??
          readStringRecordValue(mergedIssues[0], "title"))
        : null;
    const runtimeIssues = runtimeResult?.errors.length ?? 0;
    const canonicalNeedsAttention =
      sourceValidation.summary.filesNeedingAttention > 0 ||
      runtimeIssues > 0 ||
      expectedTargetReviewIssues.length > 0;
    const reviewContract = buildReviewSaltUiWorkflowContract(
      {
        guidance_boundary: sourceValidation.files[0]?.guidanceBoundary ?? {
          guidance_source: "canonical_salt",
          scope: "official_salt_only",
          project_conventions: {
            supported: true,
            contract: "project_conventions_v1",
            check_recommended:
              projectConventionsCheck?.checkRecommended ?? false,
            reason:
              "Repo policy may still refine the final remediation choice.",
            topics: projectConventionsCheck?.topics ?? [],
          },
        },
        decision: {
          status: canonicalNeedsAttention ? "needs_attention" : "clean",
          why:
            topMergedIssue ??
            sourceValidation.files[0]?.decision.why ??
            "Review results are available.",
        },
        summary: {
          errors: mergedIssueSummary.errors,
          warnings: mergedIssueSummary.warnings,
          infos: mergedIssueSummary.infos,
          fix_count: sourceValidation.summary.fixCount,
          migration_count: sourceValidation.summary.migrationCount,
        },
        fixes: sourceValidation.files.flatMap((file) => file.fixes ?? []),
        issues: mergedIssues,
        migrations: sourceValidation.files.flatMap(
          (file) => file.migrations ?? [],
        ),
        missing_data: sourceValidation.files.flatMap(
          (file) => file.missingData,
        ),
        next_step:
          sourceValidation.files[0]?.nextStep ??
          (loadedCreateReviewTargets
            ? "Follow the saved create report's canonical Salt direction, then rerun salt-ds review."
            : undefined),
        source_urls: mergedSourceUrls,
      },
      {
        code: Array.from(codeByPath.values()).join("\n\n"),
        project_policy: projectPolicy,
      },
    );
    const needsAttention = reviewContract.decision.status === "needs_attention";
    const reviewMetadata = buildRepoAwareReviewWorkflowMetadata({
      canonical_source_urls: Array.from(
        new Set(sourceValidation.files.flatMap((file) => file.sourceUrls)),
      ),
      manual_review_fix_count: fixCandidates.manualReviewCount,
      project_conventions_check_recommended:
        projectConventionsCheck?.checkRecommended ?? false,
      project_conventions_declared: projectConventionsCheck?.declared ?? false,
      project_conventions_warnings: projectConventionsCheck?.warnings ?? [],
      runtime_target_detected: context.runtime.detectedTargets.length > 0,
      runtime_requested: Boolean(requestedUrl),
      runtime_issue_count: runtimeIssues,
      migration_verification: migrationVerification
        ? {
            manual_review_count: migrationVerification.summary.manualReview,
            not_checked_count: migrationVerification.summary.notChecked,
            next_step: migrationVerification.nextStep,
          }
        : null,
      guidance_signals: reviewContract.provenance.guidance_signals,
    });
    const nextStep = buildRepoAwareReviewNextStep({
      needs_attention: needsAttention,
      fix_candidate_count: fixCandidates.totalCount,
      runtime_requested: Boolean(requestedUrl),
      migration_verification: migrationVerification
        ? {
            manual_review_count: migrationVerification.summary.manualReview,
            not_checked_count: migrationVerification.summary.notChecked,
            next_step: migrationVerification.nextStep,
          }
        : null,
    });
    const filesNeedingAttention = Math.max(
      sourceValidation.summary.filesNeedingAttention,
      expectedTargetReviewIssues.length > 0 ? 1 : 0,
      fixCandidates.files.length,
    );
    const cleanFiles = Math.max(
      0,
      sourceValidation.files.length - filesNeedingAttention,
    );
    const result: ReviewWorkflowResult = {
      workflow: {
        id: "review",
        transportUsed: "cli",
        confidence: toCliWorkflowConfidence(reviewMetadata.confidence),
        provenance: reviewMetadata.provenance,
        projectConventionsCheck,
      },
      result: {
        sourceValidation,
        summary: {
          status: needsAttention ? "needs_attention" : "clean",
          filesNeedingAttention,
          cleanFiles,
          runtimeIssues,
          runtimeMode: runtimeResult?.inspectionMode ?? null,
          fixCandidateCount: fixCandidates.totalCount,
          deterministicFixCandidateCount: fixCandidates.deterministicCount,
          manualReviewFixCandidateCount: fixCandidates.manualReviewCount,
          nextStep,
        },
      },
      artifacts: {
        context,
        projectPolicy,
        issueClasses: reviewIssueClasses,
        ruleIds: collectReviewRuleIds(reviewIssueClasses),
        fixCandidates,
        expectedTargetReview: loadedCreateReviewTargets
          ? {
              reportPath: loadedCreateReviewTargets.reportPath,
              expectedTargets: loadedCreateReviewTargets.expectedTargets,
              issues: expectedTargetReviewIssues,
            }
          : null,
        migrationVerification,
        runtimeEvidence: {
          requested: Boolean(requestedUrl),
          url: requestedUrl,
          result: runtimeResult,
        },
        notes: Array.from(
          new Set([
            ...buildReviewNotes(
              context,
              sourceValidation,
              Boolean(requestedUrl),
            ),
            ...buildProjectConventionsCheckNotes(projectConventionsCheck),
            ...buildProjectPolicyNotes(projectPolicy),
            ...fixCandidates.notes,
            ...(loadedCreateReviewTargets
              ? [
                  `Loaded create report expectations from ${loadedCreateReviewTargets.reportPath}.`,
                  ...(expectedTargetReviewIssues.length > 0
                    ? [
                        "Review compared the current implementation against the saved create report and found workflow-expected drift.",
                      ]
                    : [
                        "Review compared the current implementation against the saved create report and did not find explicit workflow-target drift.",
                      ]),
                ]
              : []),
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
      },
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
