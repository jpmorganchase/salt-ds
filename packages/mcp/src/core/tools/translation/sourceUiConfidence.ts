import { getBlockerQuestion } from "./sourceUiQuestions.js";
import type {
  SourceUiNode,
  TranslationConfidenceBlocker,
  TranslationConfidenceDetail,
  TranslationMigrationKind,
  TranslationReadiness,
} from "./sourceUiTypes.js";

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(value, max));
}

export function getTranslationConfidence(
  source: SourceUiNode,
  input: {
    hasTarget: boolean;
    relatedRegionCount: number;
    groupingCount: number;
  },
): number {
  let score = 0.56;
  score += Math.min(source.evidence.length, 3) * 0.08;
  score += Math.min(source.matched_sources.length, 2) * 0.04;

  if (source.detected_from.includes("code")) {
    score += 0.08;
  } else {
    score -= 0.04;
  }

  if (source.detected_from.includes("query")) {
    score += 0.04;
  }
  if (source.complexity === "multi-part") {
    score -= 0.07;
  }

  score += Math.min(input.relatedRegionCount, 2) * 0.03;
  score += Math.min(input.groupingCount, 2) * 0.02;
  score += input.hasTarget ? 0.08 : -0.04;

  if (
    !source.detected_from.includes("code") &&
    source.matched_sources.length === 0
  ) {
    score -= 0.08;
  }
  if (!source.detected_from.includes("code") && source.scope !== "control") {
    score -= 0.08;
  }
  if (
    !source.detected_from.includes("code") &&
    source.scope === "app-structure"
  ) {
    score -= 0.06;
  }

  return Number(clamp(score, 0.42, 0.97).toFixed(2));
}

export function getMigrationKind(
  defaultMigrationKind: TranslationMigrationKind,
  hasTarget: boolean,
  confidence: number,
): TranslationMigrationKind {
  if (!hasTarget || confidence < 0.62) {
    return "manual-review";
  }

  return defaultMigrationKind;
}

export function getTranslationReadiness(
  migrationKind: TranslationMigrationKind,
  confidence: number,
): TranslationReadiness {
  if (migrationKind === "manual-review" || confidence < 0.62) {
    return "review";
  }
  if (
    migrationKind === "pattern" ||
    migrationKind === "foundation" ||
    confidence < 0.78
  ) {
    return "medium";
  }
  return "high";
}

function getConfidenceBlocker(
  source: SourceUiNode,
  input: {
    confidence: number;
    migrationKind: TranslationMigrationKind;
    hasTarget: boolean;
    relatedRegionCount: number;
    groupingCount: number;
  },
): TranslationConfidenceBlocker | null {
  const queryOnly = !source.detected_from.includes("code");
  const likelyProjectConventionDependency =
    queryOnly &&
    (source.scope === "app-structure" ||
      input.relatedRegionCount > 0 ||
      input.groupingCount > 0);

  if (!input.hasTarget) {
    return "no-direct-salt-match";
  }
  if (likelyProjectConventionDependency && input.confidence < 0.78) {
    return "project-conventions-dependency";
  }
  if (
    queryOnly &&
    source.scope !== "control" &&
    source.matched_sources.length === 0
  ) {
    return "incomplete-source-structure";
  }
  if (queryOnly && source.scope !== "control") {
    return "ambiguous-structure";
  }
  if (source.matched_sources.length === 0 && queryOnly) {
    return "missing-source-semantics";
  }
  if (input.migrationKind === "pattern" && input.confidence < 0.75) {
    return "pattern-rewrite";
  }

  return null;
}

export function buildConfidenceDetail(
  source: SourceUiNode,
  input: {
    confidence: number;
    migrationKind: TranslationMigrationKind;
    hasTarget: boolean;
    relatedRegionCount: number;
    groupingCount: number;
  },
): TranslationConfidenceDetail {
  const reasons: string[] = [];
  const queryOnly = !source.detected_from.includes("code");
  const likelyProjectConventionDependency =
    queryOnly &&
    (source.scope === "app-structure" ||
      input.relatedRegionCount > 0 ||
      input.groupingCount > 0);

  if (!queryOnly) {
    reasons.push("Backed by code-level JSX signals.");
  } else {
    reasons.push("Based on descriptive language rather than executable code.");
  }

  if (source.complexity === "multi-part") {
    reasons.push(
      "This is a multi-part UI flow that usually needs structure-aware translation.",
    );
  }

  if (source.matched_sources.length === 0) {
    reasons.push("No direct source component names were matched.");
  }

  if (queryOnly && source.scope !== "control") {
    reasons.push(
      "The source describes a broader structure than one control, so the final hierarchy still needs confirmation.",
    );
  }

  if (input.relatedRegionCount > 0) {
    reasons.push("Page-region signals support the translation target.");
  }

  if (input.groupingCount > 0) {
    reasons.push(
      "The source sits inside a broader grouped flow that should stay coherent during migration.",
    );
  }

  if (!input.hasTarget) {
    reasons.push("No clear Salt target resolved from the current evidence.");
  }

  if (likelyProjectConventionDependency) {
    reasons.push(
      "This looks like shell-level or grouped structure, which often depends on repo-specific wrappers or page conventions.",
    );
  }

  const blocker = getConfidenceBlocker(source, input);

  return {
    level:
      input.confidence >= 0.8
        ? "high"
        : input.confidence >= 0.62
          ? "medium"
          : "low",
    reasons,
    blocker,
    next_question: getBlockerQuestion(source, blocker),
  };
}
