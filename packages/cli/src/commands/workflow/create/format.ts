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

export function formatCreateReport(result: CreateWorkflowResult): string {
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
      `Required follow-through: ${result.workflow.implementationGate.required_follow_through.map((item) => `${item.entity} (${item.region})`).join(", ")}`,
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
