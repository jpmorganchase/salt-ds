import type { SaltRegistry } from "../../types.js";
import {
  chooseSaltSolution,
  type SaltSolutionType,
} from "../chooseSaltSolution.js";
import { extractGuideReferences } from "../guideAwareness.js";
import { getArchetype } from "./sourceUiArchetypes.js";
import {
  buildConfidenceDetail,
  getMigrationKind,
  getTranslationConfidence,
  getTranslationReadiness,
} from "./sourceUiConfidence.js";
import {
  buildContextualHints,
  buildContextualQueryHints,
  buildContextualSourceNode,
  getRelatedGroupingMembers,
  getRelatedGroupingRefs,
  getRelatedGroupings,
  getRelatedPageRegionRefs,
  getRelatedPageRegions,
} from "./sourceUiContextualHints.js";
import {
  buildSourceIntentProfile,
  createTranslationSemanticIndex,
  extractDocs,
  getRejectedTargetWhy,
  hasPreferredCategoryMatch,
  hasSemanticallyAlignedTarget,
  refinePreferredCategoriesForSource,
  resolveCanonicalDecisionRecord,
} from "./sourceUiSemanticMatching.js";
import type {
  MigrationDeltaCategory,
  SourceUiModel,
  SourceUiNode,
  StarterCodeSnippet,
  TranslateUiToSaltInput,
  TranslationMigrationKind,
  TranslationRecord,
} from "./sourceUiTypes.js";

function toRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : null;
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

function isFallbackCompositionRecord(
  record: Record<string, unknown> | null,
): boolean {
  return (
    record?.recipe_type === "component-set" ||
    record?.name === "Suggested component set" ||
    record?.recipe_name === "Suggested component set"
  );
}

function createDecisionCacheKey(input: {
  query: string;
  solutionType: Exclude<SaltSolutionType, "auto" | "token">;
  preferredCategories: string[];
  package?: string;
  preferStable?: boolean;
  a11yRequired?: boolean;
  formFieldSupport?: boolean;
  includeStarterCode?: boolean;
  view: "compact" | "full";
}): string {
  return JSON.stringify({
    query: input.query,
    solutionType: input.solutionType,
    preferredCategories: [...input.preferredCategories].sort(),
    package: input.package ?? null,
    preferStable: Boolean(input.preferStable),
    a11yRequired: Boolean(input.a11yRequired),
    formFieldSupport: Boolean(input.formFieldSupport),
    includeStarterCode: Boolean(input.includeStarterCode),
    view: input.view,
  });
}

function uniqueStrings(values: Array<string | null | undefined>): string[] {
  return [
    ...new Set(values.filter((value): value is string => Boolean(value))),
  ];
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

function getMigrationDeltaCategory(
  source: SourceUiNode,
  migrationKind: TranslationMigrationKind,
  confidence: number,
): MigrationDeltaCategory {
  if (migrationKind === "manual-review" || confidence < 0.62) {
    return "workflow-change-requires-confirmation";
  }

  if (
    migrationKind === "pattern" ||
    migrationKind === "foundation" ||
    source.scope !== "control" ||
    source.complexity === "multi-part"
  ) {
    return "salt-recomposition";
  }

  if (migrationKind === "direct" && confidence >= 0.8) {
    return "direct-swap";
  }

  return "intent-preserved-visual-change";
}

function getMigrationDeltaRationale(
  source: SourceUiNode,
  category: MigrationDeltaCategory,
): string {
  switch (category) {
    case "direct-swap":
      return `Salt has a close primitive match for ${source.label.toLowerCase()}, so preserve the interaction model and swap to the canonical Salt control.`;
    case "salt-recomposition":
      return `Translate ${source.label.toLowerCase()} around Salt-native structure instead of preserving the previous composition literally.`;
    case "intent-preserved-visual-change":
      return `Keep the user intent of ${source.label.toLowerCase()} intact while allowing the migrated result to look and feel recognizably Salt.`;
    case "workflow-change-requires-confirmation":
      return `The current evidence suggests ${source.label.toLowerCase()} may need a meaningful workflow change or more clarification before migration is safe.`;
  }
}

export function buildTranslationRecords(
  registry: SaltRegistry,
  input: TranslateUiToSaltInput,
  sourceModel: SourceUiModel,
): TranslationRecord[] {
  const view = input.view ?? "compact";
  const semanticIndex = createTranslationSemanticIndex(registry);
  const recommendationCache = new Map<
    string,
    ReturnType<typeof chooseSaltSolution>
  >();

  return sourceModel.ui_regions.map((source) => {
    const archetype = getArchetype(source.kind);
    const pageRegionRefs = getRelatedPageRegionRefs(source, sourceModel);
    const groupingRefs = getRelatedGroupingRefs(source, sourceModel);
    const relatedPageRegions = getRelatedPageRegions(
      sourceModel,
      pageRegionRefs,
    );
    const relatedGroupings = getRelatedGroupings(sourceModel, groupingRefs);
    const relatedUiMembers = getRelatedGroupingMembers(
      source,
      sourceModel,
      groupingRefs,
    );
    const contextualSource = buildContextualSourceNode(
      source,
      relatedGroupings,
    );
    const contextualHints = buildContextualHints({
      relatedPageRegions,
      relatedGroupings,
      relatedUiMembers,
    });
    const contextualQueryHints = buildContextualQueryHints({
      source: contextualSource,
      relatedPageRegions,
      relatedGroupings,
      relatedUiMembers,
    });
    const contextualIntentProfile = buildSourceIntentProfile(
      contextualSource,
      archetype,
    );
    const effectiveIntentProfile = {
      ...contextualIntentProfile,
      query: uniqueStrings([
        contextualIntentProfile.query,
        ...contextualQueryHints,
      ]).join(" "),
      preferred_categories: (() => {
        const refinedCategories =
          archetype.solution_type === "pattern" &&
          (contextualHints.length > 0 || contextualQueryHints.length > 0)
            ? refinePreferredCategoriesForSource(
                semanticIndex,
                contextualSource,
                archetype.solution_type,
                contextualIntentProfile.preferred_categories,
                [...contextualHints, ...contextualQueryHints],
              )
            : [];

        if (refinedCategories.length === 0) {
          return contextualIntentProfile.preferred_categories;
        }

        return contextualSource.role === "overlay"
          ? uniqueStrings([
              ...contextualIntentProfile.preferred_categories,
              ...refinedCategories,
            ])
          : refinedCategories;
      })(),
    };
    const cacheKey = createDecisionCacheKey({
      query: effectiveIntentProfile.query,
      solutionType: archetype.solution_type,
      preferredCategories: effectiveIntentProfile.preferred_categories,
      package: input.package,
      preferStable: input.prefer_stable,
      a11yRequired: input.a11y_required,
      formFieldSupport:
        archetype.require_form_field_support ?? input.form_field_support,
      includeStarterCode: input.include_starter_code,
      view,
    });
    const recommendation =
      recommendationCache.get(cacheKey) ??
      (() => {
        const result = chooseSaltSolution(registry, {
          query: effectiveIntentProfile.query,
          solution_type: archetype.solution_type,
          preferred_categories: effectiveIntentProfile.preferred_categories,
          package: input.package,
          prefer_stable: input.prefer_stable,
          a11y_required: input.a11y_required,
          form_field_support:
            archetype.require_form_field_support ?? input.form_field_support,
          include_starter_code: input.include_starter_code,
          view,
        });

        recommendationCache.set(cacheKey, result);
        return result;
      })();
    const recommendationSolutionType =
      recommendation.solution_type === "token"
        ? null
        : recommendation.solution_type;
    const targetRecord = extractDecisionRecord(recommendation);
    const canonicalTargetRecord = resolveCanonicalDecisionRecord(
      semanticIndex,
      recommendationSolutionType,
      recommendation.decision.name,
    );
    const rawTargetName = recommendation.decision.name;
    const hasAcceptableTarget =
      Boolean(rawTargetName) &&
      !isFallbackCompositionRecord(targetRecord) &&
      hasPreferredCategoryMatch(
        semanticIndex,
        effectiveIntentProfile.preferred_categories,
        targetRecord,
        canonicalTargetRecord,
      ) &&
      hasSemanticallyAlignedTarget(
        semanticIndex,
        contextualSource,
        targetRecord,
        canonicalTargetRecord,
        [...contextualHints, ...contextualQueryHints],
      );
    const targetName = hasAcceptableTarget ? rawTargetName : null;
    const targetDocs = hasAcceptableTarget
      ? extractDocs(targetRecord ?? canonicalTargetRecord)
      : [];
    const relatedGuides =
      recommendation.related_guides ??
      extractGuideReferences(targetRecord).slice(0, 4);
    const confidence = getTranslationConfidence(source, {
      hasTarget: hasAcceptableTarget,
      relatedRegionCount: pageRegionRefs.length,
      groupingCount: groupingRefs.length,
    });
    const migrationKind = getMigrationKind(
      archetype.migration_kind,
      hasAcceptableTarget,
      confidence,
    );
    const starterCode = input.include_starter_code
      ? hasAcceptableTarget
        ? (recommendation.starter_code as StarterCodeSnippet[] | undefined)
        : undefined
      : undefined;
    const confidenceDetail = buildConfidenceDetail(source, {
      confidence,
      migrationKind,
      hasTarget: hasAcceptableTarget,
      relatedRegionCount: pageRegionRefs.length,
      groupingCount: groupingRefs.length,
    });
    const deltaCategory = getMigrationDeltaCategory(
      source,
      migrationKind,
      confidence,
    );

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
      delta_category: deltaCategory,
      delta_rationale: getMigrationDeltaRationale(source, deltaCategory),
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
        solution_type: targetName ? recommendationSolutionType : null,
        name: targetName,
        why:
          hasAcceptableTarget && recommendation.decision.why
            ? recommendation.decision.why
            : getRejectedTargetWhy(
                contextualSource,
                recommendation.decision.why,
              ),
        docs: targetDocs,
        related_guides: relatedGuides,
        starter_code: starterCode,
      },
      ...(view === "full"
        ? {
            raw_recommendation: {
              intent_profile: effectiveIntentProfile,
              recommendation,
            },
          }
        : {}),
    };
  });
}
