import fs from "node:fs/promises";
import path from "node:path";
import { inspectUrl } from "@salt-ds/runtime-inspector-core";
import { describeMigrateVisualEvidence } from "./visualEvidence.js";
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

export function formatMigrateReport(
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

export function summarizeRoleSummary(entry: {
  role: string;
  name: string;
  count?: number;
}): string {
  const label = entry.name ? `${entry.role}:${entry.name}` : entry.role;
  return entry.count && entry.count > 1 ? `${label} (${entry.count})` : label;
}

export function buildMigrationExperienceSummary(
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

