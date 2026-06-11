import type { UpgradeSaltUiResult } from "@salt-ds/semantic-core/tools/upgradeSaltUi";
import type { WorkflowProjectConventionsCheckSummary } from "../../../lib/projectConventionsWorkflow.js";
import type { WorkflowConfidence } from "../shared/types.js";

export function buildUpgradeConfidence(
  comparison: UpgradeSaltUiResult,
  inferredFromVersion: boolean,
  projectConventionsCheck: WorkflowProjectConventionsCheckSummary | null,
): WorkflowConfidence {
  const reasons: string[] = [];
  const raiseConfidence: string[] = [];
  let level: WorkflowConfidence["level"] = "high";

  reasons.push(
    "Upgrade guidance is based on structured Salt version comparison.",
  );

  if (comparison.ambiguity || (comparison.did_you_mean?.length ?? 0) > 0) {
    level = "low";
    reasons.push("The upgrade target still has ambiguity.");
    raiseConfidence.push(
      "Clarify the package or component target before applying upgrade work.",
    );
  }

  if (
    (comparison.breaking?.length ?? 0) > 0 ||
    (comparison.deprecations?.length ?? 0) > 0
  ) {
    level = level === "low" ? "low" : "medium";
    reasons.push(
      "Breaking or deprecation-driven changes still need review before rollout.",
    );
    raiseConfidence.push(
      "Review the breaking changes and deprecations before applying edits.",
    );
  }

  if (inferredFromVersion) {
    level = level === "low" ? "low" : "medium";
    reasons.push(
      "The source version was inferred from repo context rather than passed explicitly.",
    );
    raiseConfidence.push(
      "Pass --from-version explicitly if the detected package version is not the true migration boundary.",
    );
  }

  if (projectConventionsCheck?.checkRecommended) {
    level = level === "low" ? "low" : "medium";
    reasons.push(
      projectConventionsCheck.declared
        ? "Repo policy is declared and may still refine migration shims, wrappers, or compatibility decisions during the upgrade."
        : "Repo policy may still refine migration shims, wrappers, or compatibility decisions during the upgrade.",
    );
    raiseConfidence.push(
      projectConventionsCheck.declared
        ? "Check the declared project conventions before finalizing the upgrade rollout."
        : "Add .salt/team.json or confirm the relevant project conventions before finalizing the upgrade rollout.",
    );
  }

  if ((projectConventionsCheck?.warnings.length ?? 0) > 0) {
    level = level === "low" ? "low" : "medium";
    reasons.push(
      "Declared project conventions could not be fully resolved for this upgrade plan.",
    );
    const firstWarning = projectConventionsCheck?.warnings[0];
    if (firstWarning) {
      raiseConfidence.push(firstWarning);
    }
  }

  return {
    level,
    reasons,
    askBeforeProceeding: level === "low",
    raiseConfidence: Array.from(new Set(raiseConfidence)),
  };
}
