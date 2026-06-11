import { readStringRecordValue } from "../shared/issues.js";
import { appendProjectPolicyLines } from "../shared/policy.js";
import type { ReviewWorkflowResult } from "../shared/types.js";

export function formatReviewReport(result: ReviewWorkflowResult): string {
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
