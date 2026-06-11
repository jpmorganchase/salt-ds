import type { UpgradeWorkflowResult } from "../shared/types.js";

export function formatUpgradeReport(result: UpgradeWorkflowResult): string {
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
