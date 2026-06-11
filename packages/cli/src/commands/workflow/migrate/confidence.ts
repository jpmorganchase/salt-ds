import fs from "node:fs/promises";
import path from "node:path";
import { inspectUrl } from "@salt-ds/runtime-inspector-core";
import {
  buildSaltReviewReport,
  buildSaltWorkflowFollowupReport,
  type SaltReviewReport,
  type SaltReviewReportValidationResult,
  type SaltWorkflowFollowupReport,
  validateSaltReviewReport,
} from "@salt-ds/semantic-core";
import {
  type CreateSaltUiResult,
  createSaltUi,
} from "@salt-ds/semantic-core/tools/createSaltUi";
import {
  type MigrateToSaltResult,
  migrateToSalt,
} from "@salt-ds/semantic-core/tools/migrateToSalt";
import {
  attachPublicContractDetails,
  buildCreatePublicContract,
  buildMigratePublicContract,
  buildReviewPublicContract,
  buildUpgradePublicContract,
  type PublicContract,
  type PublicWorkflowStatus,
} from "@salt-ds/semantic-core/tools/publicContract";
import {
  isWorkflowExpectedReviewIssueId,
  type ReviewExpectedTargets,
  type ReviewSaltUiResult,
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
  type MigrateToSaltWorkflowContract,
  type ReviewSaltUiWorkflowContract,
  type UpgradeSaltUiWorkflowContract,
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
import { readRepeatableFlagValues } from "../../../lib/args.js";
import { writeJsonFile } from "../../../lib/common.js";
import { loadCreateReviewTargets } from "../../../lib/createReviewTargets.js";
import {
  emitHookAdvice,
  emitHookBlock,
  emitHookPass,
  type HookInput,
  HookInputError,
  readHookInput,
} from "../../../lib/hookIO.js";
import { collectSaltInfo } from "../../../lib/infoContext.js";
import { analyzeLintTargets } from "../../../lib/lintAnalysis.js";
import {
  assessMigrationVerification,
  loadMigrationVerificationContract,
  type MigrationVerificationSummary,
} from "../../../lib/migrationVerification.js";
import {
  type LoadedMigrationVisualEvidence,
  loadMigrationVisualEvidence,
  MIGRATE_VISUAL_ADAPTER_ENV_VAR,
  type ResolvedSourceOutline,
} from "../../../lib/migrationVisualEvidence.js";
import {
  buildProjectConventionsCheckSummary,
  loadCreateProjectConventionsSummary,
  loadWorkflowProjectPolicySummary,
  type WorkflowProjectConventionsCheckSummary,
  type WorkflowProjectConventionsSummary,
  type WorkflowProjectPolicySummary,
} from "../../../lib/projectConventionsWorkflow.js";
import {
  readRegistryLoadOptionsFromFlags,
  resolveSemanticRegistry,
} from "../../../lib/registry.js";
import {
  buildReviewFixCandidates,
  type ReviewFixCandidatesResult,
} from "../../../lib/reviewFixCandidates.js";
import type {
  LintCommandResult,
  RequiredCliIo,
  SaltInfoResult,
} from "../../../types.js";
import {
  toCreateAgentWorkflowJson,
  toMigrateAgentWorkflowJson,
  toReviewAgentWorkflowJson,
  toUpgradeAgentWorkflowJson,
} from "../shared/agentJson.js";
import {
  buildCliWorkflowContextRequirement,
  buildCliWorkflowSummaryNextStep,
  buildCreateConfidence,
  toCliStarterValidationStatus,
  toCliWorkflowConfidence,
  toCliWorkflowReadiness,
} from "../shared/confidence.js";
import {
  getWorkflowExitCode,
  normalizeVersion,
  rejectUnsupportedJsonVariant,
  shouldEmitCompactWorkflowJson,
  type WorkflowExitCode,
  workflowStatusToExitCode,
} from "../shared/exitCode.js";
import {
  PUBLIC_CLI_FOLLOW_UP_WORKFLOWS,
  toPublicCliSuggestedFollowUps,
  toPublicCliWorkflowId,
} from "../shared/followUps.js";
import {
  dedupeIssueRecords,
  extractWorkflowExpectedIssues,
  readStringArrayRecordValue,
  readStringRecordValue,
  sortIssueRecords,
  summarizeIssueRecords,
  uniqueStrings,
} from "../shared/issues.js";
import { buildReviewNotes } from "../shared/notes.js";
import {
  loadAttachedReviewReportValidation,
  writeWorkflowOutput,
} from "../shared/output.js";
import {
  appendProjectPolicyLines,
  buildProjectConventionsCheckNotes,
  buildProjectPolicyNotes,
  formatProjectConventionsTopics,
  formatProjectPolicyLayer,
  formatProjectPolicyLayers,
  formatThemeDefaultSummary,
  formatTokenFamilyPolicySummary,
  toActionableProjectConventionsRepoRefinement,
} from "../shared/policy.js";
import type {
  CreateWorkflowResult,
  MigrateWorkflowResult,
  PublicCreateRecommendation,
  PublicSuggestedFollowUp,
  PublicTranslateDecisionGate,
  PublicTranslateResult,
  ReviewWorkflowResult,
  RuntimeInspectResult,
  UpgradeWorkflowResult,
  WorkflowConfidence,
  WorkflowContextRequirement,
  WorkflowReadiness,
} from "../shared/types.js";

export function buildMigrateConfidence(
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

