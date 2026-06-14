import { appendProjectPolicyLines } from "../shared/policy.js";
import type {
  MigrateWorkflowResult,
  RuntimeInspectResult,
} from "../shared/types.js";
import { describeMigrateVisualEvidence } from "./visualEvidence.js";

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

function summarizeRoleSummary(entry: {
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
