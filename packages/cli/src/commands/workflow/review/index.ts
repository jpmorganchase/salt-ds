import fs from "node:fs/promises";
import path from "node:path";
import { inspectUrl } from "@salt-ds/runtime-inspector-core";
import {
  buildSaltReviewReport,
  validateSaltReviewReport,
} from "@salt-ds/semantic-core";
import {
  type ReviewSaltUiResult,
  reviewSaltUi,
} from "@salt-ds/semantic-core/tools/reviewSaltUi";
import {
  buildRepoAwareReviewNextStep,
  buildRepoAwareReviewWorkflowMetadata,
  buildReviewSaltUiWorkflowContract,
} from "@salt-ds/semantic-core/tools/workflowContracts";
import {
  buildReviewIssueClasses,
  collectReviewRuleIds,
} from "@salt-ds/semantic-core/tools/workflowRuleIds";
import { writeJsonFile } from "../../../lib/common.js";
import { loadCreateReviewTargets } from "../../../lib/createReviewTargets.js";
import { collectSaltInfo } from "../../../lib/infoContext.js";
import { analyzeLintTargets } from "../../../lib/lintAnalysis.js";
import {
  assessMigrationVerification,
  loadMigrationVerificationContract,
} from "../../../lib/migrationVerification.js";
import {
  buildProjectConventionsCheckSummary,
  loadWorkflowProjectPolicySummary,
} from "../../../lib/projectConventionsWorkflow.js";
import {
  readRegistryLoadOptionsFromFlags,
  resolveSemanticRegistry,
} from "../../../lib/registry.js";
import { buildReviewFixCandidates } from "../../../lib/reviewFixCandidates.js";
import type { RequiredCliIo } from "../../../types.js";
import { toReviewAgentWorkflowJson } from "../shared/agentJson.js";
import { toCliWorkflowConfidence } from "../shared/confidence.js";
import {
  getWorkflowExitCode,
  rejectUnsupportedJsonVariant,
} from "../shared/exitCode.js";
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
import { writeWorkflowOutput } from "../shared/output.js";
import {
  buildProjectConventionsCheckNotes,
  buildProjectPolicyNotes,
} from "../shared/policy.js";
import type {
  ReviewWorkflowResult,
  RuntimeInspectResult,
} from "../shared/types.js";
import { formatReviewReport } from "./format.js";
import {
  applyRequireHumanReviewPolicyFindings,
  readReviewHookPolicyRules,
  runReviewHookCommand,
} from "./hook/index.js";

export async function runReviewCommand(
  positionals: string[],
  flags: Record<string, string>,
  io: RequiredCliIo,
): Promise<number> {
  if (flags.hook === "true") {
    return runReviewHookCommand(positionals, flags, io);
  }

  const invalidJsonVariantExitCode = rejectUnsupportedJsonVariant(
    "review",
    flags,
    io,
  );
  if (invalidJsonVariantExitCode != null) {
    return invalidJsonVariantExitCode;
  }

  return runReviewLikeCommand(positionals, flags, io);
}

async function runReviewLikeCommand(
  positionals: string[],
  flags: Record<string, string>,
  io: RequiredCliIo,
): Promise<number> {
  if (flags.resume) {
    try {
      const reportPath = path.resolve(io.cwd, flags.resume);
      const { registry } = await resolveSemanticRegistry(
        io.cwd,
        flags["registry-dir"],

        readRegistryLoadOptionsFromFlags(flags),
      );
      const validation = validateSaltReviewReport({
        report: JSON.parse(await fs.readFile(reportPath, "utf8")) as unknown,
        registry,
        report_path: reportPath,
      });

      if (flags.json === "true") {
        io.writeStdout(`${JSON.stringify(validation.resume, null, 2)}\n`);
      } else {
        io.writeStdout(
          [
            "Salt Review Resume",
            `Status: ${validation.resume.status}`,
            `Reusable EvidenceRefs: ${validation.resume.reusable_evidence_ref_ids.length}`,
            `Unsupported claims: ${validation.resume.unsupported_claim_ids.length}`,
            `Missing: ${validation.resume.missing.length}`,
            "",
          ].join("\n"),
        );
      }

      return validation.resume.status === "ready" ? 0 : 10;
    } catch (error) {
      io.writeStderr(
        `${error instanceof Error ? error.message : "Failed to resume the Salt review report."}\n`,
      );
      return 30;
    }
  }

  if (flags.validate) {
    try {
      const reportPath = path.resolve(io.cwd, flags.validate);
      const { registry } = await resolveSemanticRegistry(
        io.cwd,
        flags["registry-dir"],

        readRegistryLoadOptionsFromFlags(flags),
      );
      const validation = validateSaltReviewReport({
        report: JSON.parse(await fs.readFile(reportPath, "utf8")) as unknown,
        registry,
        report_path: reportPath,
      });

      if (flags.json === "true") {
        io.writeStdout(`${JSON.stringify(validation, null, 2)}\n`);
      } else {
        io.writeStdout(
          [
            "Salt Review Report Validation",
            `Status: ${validation.status}`,
            `Mismatches: ${validation.mismatches.length}`,
            `Missing: ${validation.missing.length}`,
            "",
          ].join("\n"),
        );
      }

      return validation.current ? 0 : 10;
    } catch (error) {
      io.writeStderr(
        `${error instanceof Error ? error.message : "Failed to validate the Salt review report."}\n`,
      );
      return 30;
    }
  }

  if (flags.fix === "true") {
    io.writeStderr(
      "salt-ds review no longer writes files directly. Use --json and apply the returned fixCandidates through the agent workflow.\n",
    );
    return 30;
  }

  try {
    const sourceValidation = await analyzeLintTargets(
      positionals.length > 0 ? positionals : ["."],
      io.cwd,
      flags["registry-dir"],

      readRegistryLoadOptionsFromFlags(flags),
    );
    applyRequireHumanReviewPolicyFindings(
      sourceValidation,
      await readReviewHookPolicyRules(io.cwd),
    );
    const context = await collectSaltInfo(io.cwd, flags["registry-dir"]);
    const { registry } = await resolveSemanticRegistry(
      io.cwd,
      flags["registry-dir"],

      readRegistryLoadOptionsFromFlags(flags),
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
    const expectedTargetReviewResult =
      loadedCreateReviewTargets == null
        ? null
        : reviewSaltUi(registry, {
            code: Array.from(codeByPath.values()).join("\n\n"),
            framework: "react",
            package_version: sourceValidation.packageVersion ?? undefined,
            expected_targets: loadedCreateReviewTargets.expectedTargets,
          });
    const expectedTargetReviewIssues =
      expectedTargetReviewResult == null
        ? []
        : extractWorkflowExpectedIssues(expectedTargetReviewResult.issues);
    const expectedTargetReviewMissingData =
      expectedTargetReviewResult?.missing_data ?? [];
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
      ...(expectedTargetReviewResult?.source_urls ?? []),
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
    const reviewResultForContract: ReviewSaltUiResult = {
      guidance_boundary: sourceValidation.files[0]?.guidanceBoundary ?? {
        guidance_source: "canonical_salt",
        scope: "official_salt_only",
        project_conventions: {
          supported: true,
          contract: "project_conventions_v1",
          check_recommended: projectConventionsCheck?.checkRecommended ?? false,
          reason: "Repo policy may still refine the final remediation choice.",
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
      missing_data: [
        ...sourceValidation.files.flatMap((file) => file.missingData),
        ...expectedTargetReviewMissingData,
      ],
      next_step:
        sourceValidation.files[0]?.nextStep ??
        (loadedCreateReviewTargets
          ? "Follow the saved create report's canonical Salt direction, then rerun salt-ds review."
          : undefined),
      source_urls: mergedSourceUrls,
    };
    const reviewContract = buildReviewSaltUiWorkflowContract(
      reviewResultForContract,
      {
        code: Array.from(codeByPath.values()).join("\n\n"),
        expected_targets: loadedCreateReviewTargets?.expectedTargets,
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
    const compactJson = toReviewAgentWorkflowJson(
      reviewResultForContract,
      reviewContract,
      registry,
    );
    const reviewReport = buildSaltReviewReport({
      registry,
      generated_at: new Date().toISOString(),
      generator: {
        name: "salt-ds review",
      },
      profile: "auto",
      transport_used: "cli",
      review: reviewResultForContract,
      contract: reviewContract,
      public_contract: compactJson,
      scope: {
        root_dir: sourceValidation.rootDir,
        targets: sourceValidation.targets.map((target) => target.input),
        file_count: sourceValidation.fileCount,
        files: sourceValidation.files.map((file) => ({
          path: file.path,
          relative_path: file.relativePath,
          status: file.decision.status,
          errors: file.summary.errors,
          warnings: file.summary.warnings,
          infos: file.summary.infos,
        })),
      },
      runtime: {
        requested: Boolean(requestedUrl),
        checked: Boolean(runtimeResult),
      },
    });
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
        reviewReport,
        expectedTargetReview: loadedCreateReviewTargets
          ? {
              reportPath: loadedCreateReviewTargets.reportPath,
              expectedTargets: loadedCreateReviewTargets.expectedTargets,
              issues: expectedTargetReviewIssues,
              missingData: expectedTargetReviewMissingData,
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

    if (flags.report) {
      await writeJsonFile(path.resolve(io.cwd, flags.report), reviewReport);
    }
    await writeWorkflowOutput(result, flags, io, formatReviewReport, {
      compactJsonOverride: compactJson,
    });
    return getWorkflowExitCode(compactJson);
  } catch (error) {
    io.writeStderr(
      `${error instanceof Error ? error.message : "Failed to review the Salt targets."}\n`,
    );
    return 30;
  }
}

// ---------- salt-ds review --hook (Phase 2 task 2.12 / E1) ----------
