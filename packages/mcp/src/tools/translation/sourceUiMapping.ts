import type { SaltRegistry } from "../../types.js";
import {
  chooseSaltSolution,
  type SaltSolutionType,
} from "../chooseSaltSolution.js";
import { extractGuideReferences } from "../guideAwareness.js";
import { getArchetype } from "./sourceUiArchetypes.js";
import type {
  SourceUiModel,
  SourceUiNode,
  StarterCodeSnippet,
  TranslateUiToSaltInput,
  TranslationConfidenceBlocker,
  TranslationConfidenceDetail,
  TranslationMigrationKind,
  TranslationReadiness,
  TranslationRecord,
} from "./sourceUiTypes.js";

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(value, max));
}

function toRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : null;
}

function toStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((entry): entry is string => typeof entry === "string")
    : [];
}

function extractDecisionRecord(
  result: ReturnType<typeof chooseSaltSolution>,
): Record<string, unknown> | null {
  return (
    toRecord(result.recommended) ??
    toRecord(result.compared?.[0]) ??
    toRecord(result.alternatives?.[0]) ??
    null
  );
}

function extractDocs(record: Record<string, unknown> | null): string[] {
  if (!record) {
    return [];
  }

  const docs = toStringArray(record.docs);
  if (docs.length > 0) {
    return docs;
  }

  if (typeof record.route === "string") {
    return [record.route];
  }

  const relatedDocs = toRecord(record.related_docs);
  if (!relatedDocs) {
    return [];
  }

  return Object.values(relatedDocs).filter(
    (value): value is string => typeof value === "string" && value.length > 0,
  );
}

function getTranslationConfidence(
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
  }
  if (source.detected_from.includes("query")) {
    score += 0.04;
  }
  if (source.complexity === "multi-part") {
    score -= 0.03;
  }
  score += Math.min(input.relatedRegionCount, 2) * 0.03;
  score += Math.min(input.groupingCount, 1) * 0.03;
  score += input.hasTarget ? 0.08 : -0.04;

  return Number(clamp(score, 0.42, 0.97).toFixed(2));
}

function getMigrationKind(
  archetype: ReturnType<typeof getArchetype>,
  hasTarget: boolean,
  confidence: number,
): TranslationMigrationKind {
  if (!hasTarget || confidence < 0.62) {
    return "manual-review";
  }

  return archetype.migration_kind;
}

function getTranslationReadiness(
  migrationKind: TranslationMigrationKind,
  confidence: number,
): TranslationReadiness {
  if (migrationKind === "manual-review" || confidence < 0.62) {
    return "review";
  }
  if (migrationKind === "pattern" || migrationKind === "foundation" || confidence < 0.78) {
    return "medium";
  }
  return "high";
}

function getRelatedPageRegionRefs(
  source: SourceUiNode,
  sourceModel: SourceUiModel,
): string[] {
  switch (source.kind) {
    case "vertical-navigation":
      return sourceModel.page_regions
        .filter((region) => region.kind === "sidebar" || region.kind === "header")
        .map((region) => region.id);
    case "dialog":
      return sourceModel.page_regions
        .filter((region) => region.kind.startsWith("dialog-"))
        .map((region) => region.id);
    case "toolbar":
      return sourceModel.page_regions
        .filter((region) => region.kind === "toolbar" || region.kind === "filter-bar")
        .map((region) => region.id);
    case "text-input":
    case "selection-control":
      return sourceModel.page_regions
        .filter((region) => region.kind === "form-section")
        .map((region) => region.id);
    case "data-table":
      return sourceModel.page_regions
        .filter(
          (region) =>
            region.kind === "content" ||
            region.kind === "toolbar" ||
            region.kind === "filter-bar",
        )
        .map((region) => region.id);
    case "navigation":
      return sourceModel.page_regions
        .filter((region) => region.kind === "sidebar" || region.kind === "content")
        .map((region) => region.id);
    case "split-action":
    case "action":
      return sourceModel.page_regions
        .filter((region) => region.kind === "toolbar" || region.kind === "footer")
        .map((region) => region.id);
    case "tabs":
      return sourceModel.page_regions
        .filter((region) => region.kind === "content")
        .map((region) => region.id);
  }
}

function getRelatedGroupingRefs(
  source: SourceUiNode,
  sourceModel: SourceUiModel,
): string[] {
  return sourceModel.groupings
    .filter(
      (grouping) =>
        grouping.ui_region_refs.includes(source.id) ||
        getRelatedPageRegionRefs(source, sourceModel).some((regionId) =>
          grouping.region_refs.includes(regionId),
        ),
    )
    .map((grouping) => grouping.id);
}

function getBlockerQuestion(
  source: SourceUiNode,
  blocker: TranslationConfidenceBlocker | null,
): string | undefined {
  if (!blocker) {
    return undefined;
  }

  switch (source.kind) {
    case "vertical-navigation":
      return "Should this stay persistent app-level navigation, or is it only switching local sections within one screen?";
    case "dialog":
      return "Does this overlay need a full header, body, and footer action structure, or is it only a lightweight confirmation?";
    case "tabs":
      return "Are these peer views within one page, or should they really be navigation between routes or panels?";
    case "data-table":
      return "Is this a dense data surface with sorting or filters, or just a simple list or read-only table?";
    case "text-input":
    case "selection-control":
      return "Does this field need validation, helper text, or grouped FormField structure in the Salt version?";
    default:
      if (blocker === "missing-source-semantics") {
        return "What is the minimum interaction and state model this region needs in the Salt version?";
      }
      return "Which part of this source region is most important to preserve: structure, states, or interaction behavior?";
  }
}

function buildConfidenceDetail(
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

  if (source.detected_from.includes("code")) {
    reasons.push("Backed by code-level JSX signals.");
  } else {
    reasons.push("Based on descriptive language rather than executable code.");
  }

  if (source.complexity === "multi-part") {
    reasons.push("This is a multi-part UI flow that usually needs structure-aware translation.");
  }

  if (source.matched_sources.length === 0) {
    reasons.push("No direct source component names were matched.");
  }

  if (input.relatedRegionCount > 0) {
    reasons.push("Page-region signals support the translation target.");
  }

  if (input.groupingCount > 0) {
    reasons.push("The source sits inside a broader grouped flow that should stay coherent during migration.");
  }

  if (!input.hasTarget) {
    reasons.push("No clear Salt target resolved from the current evidence.");
  }

  let blocker: TranslationConfidenceBlocker | null = null;
  if (!input.hasTarget) {
    blocker = "no-direct-salt-match";
  } else if (
    !source.detected_from.includes("code") &&
    source.scope !== "control"
  ) {
    blocker = "ambiguous-structure";
  } else if (
    source.matched_sources.length === 0 &&
    !source.detected_from.includes("code")
  ) {
    blocker = "missing-source-semantics";
  } else if (input.migrationKind === "pattern" && input.confidence < 0.75) {
    blocker = "pattern-rewrite";
  }

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

function getTranslationNextAction(
  source: SourceUiNode,
  migrationKind: TranslationMigrationKind,
  targetName: string | null,
  relatedRegionCount: number,
): string {
  const regionHint =
    relatedRegionCount > 0
      ? " Keep the surrounding page-region structure aligned while you translate it."
      : "";

  if (migrationKind === "direct") {
    return `Swap this ${source.label.toLowerCase()} to ${targetName ?? "the closest Salt primitive"} and keep the surrounding structure minimal.${regionHint}`;
  }
  if (migrationKind === "pattern") {
    return `Rebuild this ${source.label.toLowerCase()} around ${targetName ?? "the nearest Salt pattern"} instead of preserving the foreign structure verbatim.${regionHint}`;
  }
  if (migrationKind === "foundation") {
    return `Translate the supporting foundations for this ${source.label.toLowerCase()} before finalizing component details.${regionHint}`;
  }
  return `Resolve the Salt direction for this ${source.label.toLowerCase()} before coding the final structure.${regionHint}`;
}

function getTranslationValidationStep(
  source: SourceUiNode,
  migrationKind: TranslationMigrationKind,
): string {
  if (migrationKind === "direct") {
    return `Confirm ${source.label.toLowerCase()} usage with canonical component details and examples before polishing the migrated code.`;
  }
  if (migrationKind === "pattern") {
    return `Check the Salt pattern guidance for ${source.label.toLowerCase()} before finalizing hierarchy and supporting parts.`;
  }
  return `Review the Salt guidance and nearby examples for ${source.label.toLowerCase()} before locking the implementation.`;
}

export function buildTranslationRecords(
  registry: SaltRegistry,
  input: TranslateUiToSaltInput,
  sourceModel: SourceUiModel,
): TranslationRecord[] {
  const view = input.view ?? "compact";

  return sourceModel.ui_regions.map((source) => {
    const archetype = getArchetype(source.kind);
    const recommendation = chooseSaltSolution(registry, {
      query: archetype.salt_query,
      solution_type: archetype.solution_type,
      package: input.package,
      prefer_stable: input.prefer_stable,
      a11y_required: input.a11y_required,
      form_field_support:
        archetype.require_form_field_support ?? input.form_field_support,
      include_starter_code: input.include_starter_code,
      view,
    });
    const targetRecord = extractDecisionRecord(recommendation);
    const targetName = recommendation.decision.name;
    const targetDocs = extractDocs(targetRecord);
    const relatedGuides =
      recommendation.related_guides ??
      extractGuideReferences(targetRecord).slice(0, 4);
    const pageRegionRefs = getRelatedPageRegionRefs(source, sourceModel);
    const groupingRefs = getRelatedGroupingRefs(source, sourceModel);
    const confidence = getTranslationConfidence(source, {
      hasTarget: Boolean(targetName),
      relatedRegionCount: pageRegionRefs.length,
      groupingCount: groupingRefs.length,
    });
    const migrationKind = getMigrationKind(
      archetype,
      Boolean(targetName),
      confidence,
    );
    const starterCode = input.include_starter_code
      ? (recommendation.starter_code as StarterCodeSnippet[] | undefined)
      : undefined;
    const confidenceDetail = buildConfidenceDetail(source, {
      confidence,
      migrationKind,
      hasTarget: Boolean(targetName),
      relatedRegionCount: pageRegionRefs.length,
      groupingCount: groupingRefs.length,
    });

    return {
      source_model_ref: source.id,
      source_kind: source.kind,
      label: archetype.label,
      source_scope: source.scope,
      source_role: source.role,
      page_region_refs: pageRegionRefs.length > 0 ? pageRegionRefs : undefined,
      grouping_refs: groupingRefs.length > 0 ? groupingRefs : undefined,
      evidence: source.evidence,
      matched_sources: source.matched_sources,
      confidence,
      confidence_detail: confidenceDetail,
      migration_kind: migrationKind,
      notes: source.notes,
      implementation: {
        readiness: getTranslationReadiness(migrationKind, confidence),
        next_action: getTranslationNextAction(
          source,
          migrationKind,
          targetName,
          pageRegionRefs.length,
        ),
        validation_step: getTranslationValidationStep(source, migrationKind),
        starter_code_available: Boolean(starterCode?.length),
      },
      salt_target: {
        solution_type: targetName ? archetype.solution_type : null,
        name: targetName,
        why: recommendation.decision.why,
        docs: targetDocs,
        related_guides: relatedGuides,
        starter_code: starterCode,
      },
      ...(view === "full"
        ? {
            raw_recommendation: recommendation,
          }
        : {}),
    };
  });
}
