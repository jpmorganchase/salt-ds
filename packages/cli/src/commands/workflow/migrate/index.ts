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

import { buildMigrateConfidence } from "./confidence.js";
import { formatMigrateReport } from "./format.js";
import { buildPostMigrationVerification } from "./postMigration.js";
import { buildMigrateQuestions } from "./questions.js";
import {
  buildMigrateVisualEvidence,
  describeMigrateVisualEvidence,
} from "./visualEvidence.js";
import { buildMigrationExperienceSummary } from "./format.js";

export async function runMigrateCommand(
  positionals: string[],
  flags: Record<string, string>,
  io: RequiredCliIo,
): Promise<number> {
  const invalidJsonVariantExitCode = rejectUnsupportedJsonVariant(
    "migrate",
    flags,
    io,
  );
  if (invalidJsonVariantExitCode != null) {
    return invalidJsonVariantExitCode;
  }

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
      return 30;
    }

    const context = await collectSaltInfo(io.cwd, flags["registry-dir"]);
    const { registry } = await resolveSemanticRegistry(
      io.cwd,
      flags["registry-dir"],

      readRegistryLoadOptionsFromFlags(flags),
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
    const postMigrationVerification = buildPostMigrationVerification(
      translation,
      Boolean(requestedUrl),
      derivedOutline,
      visualEvidence,
      currentExperience,
      projectConventionsCheck,
    );
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
        name: "salt-ds migrate",
      },
      workflow: "migration",
      transport_used: "cli",
      source_command: "salt-ds migrate",
      workflow_input: {
        request: query,
        source_outline_path: sourceOutline?.path ?? null,
        runtime_url: requestedUrl,
      },
      runtime: {
        requested: Boolean(requestedUrl),
        captured: Boolean(runtimeResult),
        url: requestedUrl,
        section: runtimeResult ? "migration runtime inspection" : null,
      },
      followup: {
        verification_check_count:
          postMigrationVerification.sourceChecks.length +
          postMigrationVerification.runtimeChecks.length +
          postMigrationVerification.preserveChecks.length +
          postMigrationVerification.confirmationChecks.length,
        review_report_path:
          reviewReportValidation?.report_path ?? reviewReportPath,
        review_report_validation: reviewReportValidation,
      },
    });

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
        postMigrationVerification,
        workflowFollowupReport,
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

    const compactJson = toMigrateAgentWorkflowJson(
      policyTranslation as MigrateToSaltResult,
      canonicalContract,
    );
    if (flags.report) {
      await writeJsonFile(
        path.resolve(io.cwd, flags.report),
        workflowFollowupReport,
      );
    }
    await writeWorkflowOutput(
      result,
      flags,
      io,
      (payload) => formatMigrateReport(payload, query),
      {
        compactJsonOverride: compactJson,
      },
    );
    return getWorkflowExitCode(compactJson);
  } catch (error) {
    io.writeStderr(
      `${error instanceof Error ? error.message : "Failed to plan the Salt migration."}\n`,
    );
    return 30;
  }
}

