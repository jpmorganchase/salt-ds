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

import { buildUpgradeConfidence } from "./confidence.js";
import { formatUpgradeReport } from "./format.js";

export async function runUpgradeCommand(
  positionals: string[],
  flags: Record<string, string>,
  io: RequiredCliIo,
): Promise<number> {
  const invalidJsonVariantExitCode = rejectUnsupportedJsonVariant(
    "upgrade",
    flags,
    io,
  );
  if (invalidJsonVariantExitCode != null) {
    return invalidJsonVariantExitCode;
  }

  if (positionals.length > 0) {
    io.writeStderr(
      "Upgrade does not accept positional arguments. Use flags instead.\n",
    );
    return 30;
  }

  try {
    const context = await collectSaltInfo(io.cwd, flags["registry-dir"]);
    const inferredPackage = flags.package ?? context.salt.packages[0]?.name;
    const fromVersionWasInferred = !flags["from-version"];
    const inferredFromVersion =
      flags["from-version"] ?? normalizeVersion(context.salt.packageVersion);

    if (!flags.component && !inferredPackage) {
      io.writeStderr(
        "Missing target. Provide --package or --component, or run the command from a repo with a detected Salt package.\n",
      );
      return 30;
    }

    if (!inferredFromVersion) {
      io.writeStderr(
        "Missing --from-version and no installed Salt package version could be inferred.\n",
      );
      return 30;
    }

    const { registry } = await resolveSemanticRegistry(
      io.cwd,
      flags["registry-dir"],

      readRegistryLoadOptionsFromFlags(flags),
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
    const upgradeContract = buildUpgradeSaltUiWorkflowContract(comparison);
    const reviewReportValidation = await loadAttachedReviewReportValidation({
      cwd: io.cwd,
      registry,
      reviewReportPath: flags["review-report"],
    });
    const reviewReportPath = flags["review-report"]
      ? path.resolve(io.cwd, flags["review-report"])
      : null;
    const workflowFollowupReport = buildSaltWorkflowFollowupReport({
      registry,
      generated_at: new Date().toISOString(),
      generator: {
        name: "salt-ds upgrade",
      },
      workflow: "upgrade",
      transport_used: "cli",
      source_command: "salt-ds upgrade",
      target: {
        package_name: inferredPackage ?? null,
        package_name_source: flags.package ? "workflow_input" : "package",
        component_name: flags.component ?? null,
        from_version: inferredFromVersion,
        from_version_source: fromVersionWasInferred
          ? "package"
          : "workflow_input",
        to_version: flags["to-version"] ?? null,
      },
      followup: {
        review_report_path:
          reviewReportValidation?.report_path ?? reviewReportPath,
        review_report_validation: reviewReportValidation,
      },
    });
    const result: UpgradeWorkflowResult = {
      workflow: {
        id: "upgrade",
        transportUsed: "cli",
        confidence: buildUpgradeConfidence(
          comparison,
          fromVersionWasInferred,
          projectConventionsCheck,
        ),
        provenance: upgradeContract.provenance,
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
        workflowFollowupReport,
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

    const compactJson = toUpgradeAgentWorkflowJson(comparison, upgradeContract);
    if (flags.report) {
      await writeJsonFile(
        path.resolve(io.cwd, flags.report),
        workflowFollowupReport,
      );
    }
    await writeWorkflowOutput(result, flags, io, formatUpgradeReport, {
      compactJsonOverride: compactJson,
    });
    return getWorkflowExitCode(compactJson);
  } catch (error) {
    io.writeStderr(
      `${error instanceof Error ? error.message : "Failed to plan the Salt upgrade."}\n`,
    );
    return 30;
  }
}

