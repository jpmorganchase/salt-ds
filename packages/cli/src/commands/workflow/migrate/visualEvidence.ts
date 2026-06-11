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

export function buildMigrateVisualEvidence(
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

export function describeMigrateVisualEvidence(
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
