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

export function buildPostMigrationVerification(
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
