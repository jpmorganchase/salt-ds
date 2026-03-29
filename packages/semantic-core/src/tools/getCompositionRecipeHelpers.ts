import type { PatternRecord, SaltRegistry } from "../types.js";
import { findReferencedComponent } from "./componentLookup.js";
import {
  type ConsumerRecommendationFilters,
  compareComponentsByConsumerPreference,
  matchesComponentConsumerFilters,
} from "./consumerFilters.js";
import {
  getComponentShipCheck,
  getComponentSuggestedFollowUps,
  getPatternCaveats,
  getPatternShipCheck,
  getPatternSuggestedFollowUps,
  type ShipCheck,
  type SuggestedFollowUp,
} from "./consumerPresentation.js";
import {
  getComponentQueryFields,
  getEffectiveUsageSemantics,
  getPatternQueryFields,
  scoreQueryFields,
  scoreUsageSemantics,
} from "./consumerSignals.js";
import {
  getRelevantGuidesForContext,
  mergeGuideContexts,
} from "./guideAwareness.js";
import {
  buildPatternPresentationBase,
  getComponentGuideContext,
} from "./solutionPresentation.js";
import {
  createRecipeStarterCode,
  type StarterCodeSnippet,
} from "./starterCode.js";
import { getArchetype } from "./translation/sourceUiArchetypes.js";
import {
  buildContextualHints,
  buildContextualQueryHints,
  buildContextualSourceNode,
  getRelatedGroupingMembers,
  getRelatedGroupingRefs,
  getRelatedGroupings,
  getRelatedPageRegionRefs,
  getRelatedPageRegions,
} from "./translation/sourceUiContextualHints.js";
import {
  createEmptySourceAnalysis,
  detectFromQuery,
  mergeDetectionBundle,
} from "./translation/sourceUiDetection.js";
import { buildSourceUiModel } from "./translation/sourceUiModel.js";
import {
  buildSourceIntentProfile,
  createTranslationSemanticIndex,
  hasPreferredCategoryMatch,
  hasSemanticallyAlignedTarget,
  refinePreferredCategoriesForSource,
  type TranslationSemanticIndex,
} from "./translation/sourceUiSemanticMatching.js";
import type { SourceUiNode } from "./translation/sourceUiTypes.js";
import { isComponentAllowedByDocsPolicy } from "./utils.js";

export function mergeUniqueStrings(...valueSets: string[][]): string[] {
  return [...new Set(valueSets.flat())];
}

export interface PatternAlignmentIntent {
  source: SourceUiNode;
  query: string;
  preferredCategories: string[];
  contextualHints: string[];
  strict: boolean;
}

export interface PatternAlignmentOutcome {
  accepted: boolean;
  scoreAdjustment: number;
  matchedTerms: string[];
  matchReasons: string[];
}

const PATTERN_SPECIFIC_ALIGNMENT_KINDS = new Set([
  "split-action",
  "dialog",
  "tabs",
  "toolbar",
  "vertical-navigation",
]);

export function buildPatternAlignmentIntents(
  registry: SaltRegistry,
  query: string,
): PatternAlignmentIntent[] {
  if (!query) {
    return [];
  }

  const mergedDetections = mergeDetectionBundle(
    createEmptySourceAnalysis(),
    detectFromQuery(query),
  );
  if (
    mergedDetections.detections.size === 0 &&
    mergedDetections.region_signals.size === 0
  ) {
    return [];
  }

  const sourceModel = buildSourceUiModel(mergedDetections, {
    codeProvided: false,
    queryProvided: true,
    uiFlavor: "description",
  });
  const semanticIndex = createTranslationSemanticIndex(registry);
  const intents: PatternAlignmentIntent[] = [];

  for (const source of sourceModel.ui_regions) {
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
    const strict =
      relatedGroupings.length > 0 ||
      relatedPageRegions.length > 0 ||
      PATTERN_SPECIFIC_ALIGNMENT_KINDS.has(source.kind);

    if (!strict) {
      continue;
    }

    const archetype = getArchetype(source.kind);
    const intentProfile = buildSourceIntentProfile(contextualSource, archetype);
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

    intents.push({
      source: contextualSource,
      query: mergeUniqueStrings(
        [query],
        [intentProfile.query],
        contextualQueryHints,
      ).join(" "),
      preferredCategories: (() => {
        const refinedCategories =
          contextualHints.length > 0 || contextualQueryHints.length > 0
            ? refinePreferredCategoriesForSource(
                semanticIndex,
                contextualSource,
                "pattern",
                intentProfile.preferred_categories,
                [...contextualHints, ...contextualQueryHints],
              )
            : [];

        if (refinedCategories.length === 0) {
          return intentProfile.preferred_categories;
        }

        return contextualSource.role === "overlay"
          ? mergeUniqueStrings(
              intentProfile.preferred_categories,
              refinedCategories,
            )
          : refinedCategories;
      })(),
      contextualHints: [...contextualHints, ...contextualQueryHints],
      strict,
    });
  }

  return intents.filter(
    (intent, index) =>
      intents.findIndex(
        (candidate) =>
          candidate.source.kind === intent.source.kind &&
          candidate.source.scope === intent.source.scope &&
          candidate.query === intent.query &&
          candidate.contextualHints.join("|") ===
            intent.contextualHints.join("|") &&
          candidate.preferredCategories.join("|") ===
            intent.preferredCategories.join("|"),
      ) === index,
  );
}

function getPatternSourceKindBonus(
  pattern: PatternRecord,
  source: SourceUiNode,
): number {
  const sourceLabel = source.kind.replace(/-/g, " ").toLowerCase();
  const matchSurface = [
    pattern.name,
    ...pattern.aliases,
    pattern.related_docs.overview,
  ]
    .filter((value): value is string => Boolean(value))
    .join(" ")
    .toLowerCase();

  return matchSurface.includes(sourceLabel) ? 10 : 0;
}

export function scorePatternAlignment(
  index: TranslationSemanticIndex,
  pattern: PatternRecord,
  intents: PatternAlignmentIntent[],
): PatternAlignmentOutcome {
  if (intents.length === 0) {
    return {
      accepted: true,
      scoreAdjustment: 0,
      matchedTerms: [],
      matchReasons: [],
    };
  }

  const patternRecord = pattern as unknown as Record<string, unknown>;
  const strictIntentPresent = intents.some((intent) => intent.strict);
  let bestAligned: PatternAlignmentOutcome | null = null;

  for (const intent of intents) {
    const queryScore = scoreQueryFields(
      intent.query,
      getPatternQueryFields(pattern),
    );
    const semanticScore = scoreUsageSemantics(
      intent.query,
      getEffectiveUsageSemantics(pattern),
    );
    const categoryMatch = hasPreferredCategoryMatch(
      index,
      intent.preferredCategories,
      patternRecord,
      patternRecord,
    );
    const semanticMatch = hasSemanticallyAlignedTarget(
      index,
      intent.source,
      patternRecord,
      patternRecord,
      intent.contextualHints,
    );

    if (!categoryMatch || !semanticMatch) {
      continue;
    }

    const overlapScore = Math.max(
      0,
      queryScore.score + semanticScore.score_adjustment,
    );
    const scoreAdjustment =
      Math.max(8, Math.min(20, Math.round(overlapScore / 3))) +
      getPatternSourceKindBonus(pattern, intent.source) +
      (intent.source.scope === "app-structure" ? 6 : 0) +
      (intent.source.scope === "flow" ? 4 : 0);
    const outcome: PatternAlignmentOutcome = {
      accepted: true,
      scoreAdjustment,
      matchedTerms: mergeUniqueStrings(
        queryScore.matched_terms,
        semanticScore.matched_terms,
      ),
      matchReasons: mergeUniqueStrings(
        queryScore.match_reasons,
        semanticScore.match_reasons,
        ["grouped_intent_alignment"],
      ),
    };

    if (
      !bestAligned ||
      outcome.scoreAdjustment > bestAligned.scoreAdjustment ||
      (outcome.scoreAdjustment === bestAligned.scoreAdjustment &&
        outcome.matchedTerms.length > bestAligned.matchedTerms.length)
    ) {
      bestAligned = outcome;
    }
  }

  if (bestAligned) {
    return bestAligned;
  }

  if (strictIntentPresent) {
    return {
      accepted: false,
      scoreAdjustment: -25,
      matchedTerms: [],
      matchReasons: ["grouped_intent_rejection"],
    };
  }

  return {
    accepted: true,
    scoreAdjustment: 0,
    matchedTerms: [],
    matchReasons: [],
  };
}

export function buildPatternRecipe(
  registry: SaltRegistry,
  pattern: PatternRecord,
  score: number,
  matchedTerms: string[],
  matchReasons: string[],
): Record<string, unknown> {
  const components = pattern.composed_of.map((entry) => {
    const component = findReferencedComponent(registry, entry.component);

    return {
      name: entry.component,
      role: entry.role,
      package: component?.package.name ?? null,
      related_docs: component?.related_docs ?? null,
    };
  });

  const supportingExample = pattern.examples[0];
  const presentation = buildPatternPresentationBase(registry, pattern);

  return {
    recipe_name: pattern.name,
    name: pattern.name,
    category: pattern.category ?? [],
    recipe_type: "pattern",
    summary: pattern.summary,
    score,
    matched_terms: matchedTerms,
    match_reasons: matchReasons,
    steps:
      pattern.how_to_build.length > 0
        ? pattern.how_to_build
        : pattern.how_it_works,
    components,
    supporting_examples: pattern.examples.slice(0, 3).map((example) => ({
      title: example.title,
      intent: example.intent,
      code: example.code,
      source_url: example.source_url,
    })),
    supporting_example: supportingExample
      ? {
          title: supportingExample.title,
          code: supportingExample.code,
          source_url: supportingExample.source_url,
        }
      : null,
    related_patterns: pattern.related_patterns,
    docs: presentation.docs,
    related_guides: presentation.related_guides,
    guidance_sources: presentation.guidance_sources,
    caveats: getPatternCaveats(registry, pattern),
    ship_check: getPatternShipCheck(registry, pattern),
    suggested_follow_ups: getPatternSuggestedFollowUps(pattern),
  };
}

export function buildFallbackRecipe(
  registry: SaltRegistry,
  query: string,
  filters: ConsumerRecommendationFilters,
): Record<string, unknown> | null {
  const candidates = registry.components
    .filter((component) => isComponentAllowedByDocsPolicy(component))
    .filter((component) => matchesComponentConsumerFilters(component, filters))
    .map((component) => ({
      component,
      ...scoreQueryFields(query, getComponentQueryFields(component)),
    }))
    .filter((candidate) => candidate.score > 0)
    .sort((left, right) => {
      if (left.score !== right.score) {
        return right.score - left.score;
      }

      const preferenceOrder = compareComponentsByConsumerPreference(
        left.component,
        right.component,
        filters,
      );
      if (preferenceOrder !== 0) {
        return preferenceOrder;
      }

      return left.component.name.localeCompare(right.component.name);
    })
    .slice(0, 3);

  if (candidates.length === 0) {
    return null;
  }

  const componentShipChecks = candidates.map((candidate) =>
    getComponentShipCheck(candidate.component),
  );
  const shipCheck: ShipCheck = {
    stable_for_production: componentShipChecks.every(
      (candidate) => candidate.stable_for_production,
    ),
    accessibility_guidance: componentShipChecks.every(
      (candidate) => candidate.accessibility_guidance,
    ),
    usage_guidance: componentShipChecks.every(
      (candidate) => candidate.usage_guidance,
    ),
    examples_available: componentShipChecks.some(
      (candidate) => candidate.examples_available,
    ),
    form_field_support: componentShipChecks.some(
      (candidate) => candidate.form_field_support,
    ),
  };
  const caveats: string[] = [];

  if (!shipCheck.stable_for_production) {
    caveats.push(
      "This fallback recipe includes at least one non-stable component.",
    );
  }

  if (!shipCheck.accessibility_guidance) {
    caveats.push(
      "At least one suggested component has limited accessibility guidance.",
    );
  }

  if (!shipCheck.examples_available) {
    caveats.push(
      "This fallback recipe has limited example coverage across its components.",
    );
  }

  const primaryCandidate = candidates[0];
  const relatedGuides = getRelevantGuidesForContext(
    registry,
    mergeGuideContexts(
      ...candidates.map((candidate) =>
        getComponentGuideContext(candidate.component),
      ),
    ),
    4,
  );

  return {
    recipe_name: "Suggested component set",
    name: "Suggested component set",
    recipe_type: "component-set",
    summary:
      "No strong pattern match was found, so this recipe is assembled from the best-fitting Salt components.",
    score: candidates.reduce((sum, candidate) => sum + candidate.score, 0),
    matched_terms: candidates.flatMap((candidate) => candidate.matched_terms),
    match_reasons: candidates.flatMap((candidate) => candidate.match_reasons),
    steps: candidates.map(
      (candidate, index) =>
        `${index + 1}. Use ${candidate.component.name} when ${candidate.component.when_to_use[0] ?? candidate.component.summary}`,
    ),
    components: candidates.map((candidate) => ({
      name: candidate.component.name,
      package: candidate.component.package.name,
      summary: candidate.component.summary,
      related_docs: candidate.component.related_docs,
    })),
    docs: candidates.flatMap((candidate) =>
      [
        candidate.component.related_docs.overview,
        candidate.component.related_docs.usage,
        candidate.component.related_docs.examples,
      ].filter((value): value is string => Boolean(value)),
    ),
    related_guides: relatedGuides,
    guidance_sources: [
      ...new Set(
        candidates.flatMap(
          (candidate) => candidate.component.semantics?.derived_from ?? [],
        ),
      ),
    ],
    caveats,
    ship_check: shipCheck,
    suggested_follow_ups: getComponentSuggestedFollowUps(
      primaryCandidate.component,
      candidates.slice(1).map((candidate) => candidate.component.name),
    ),
    supporting_example: primaryCandidate.component.examples[0]
      ? {
          title: primaryCandidate.component.examples[0].title,
          code: primaryCandidate.component.examples[0].code,
          source_url: primaryCandidate.component.examples[0].source_url,
        }
      : null,
  };
}

export function getRecipeNextStep(
  recipe: Record<string, unknown> | undefined,
): string {
  const name =
    typeof recipe?.name === "string"
      ? recipe.name
      : typeof recipe?.recipe_name === "string"
        ? recipe.recipe_name
        : "the recipe";
  const steps = Array.isArray(recipe?.steps) ? recipe.steps : [];
  const firstStep =
    typeof steps[0] === "string" ? steps[0].replace(/^\d+\.\s*/, "") : null;

  if (firstStep) {
    return `Start with ${name}: ${firstStep}`;
  }

  return "Broaden the query or try discover_salt for a more specific Salt pattern.";
}

function toSupportingExample(recipe: Record<string, unknown> | undefined): {
  title: string;
  code: string;
  source_url: string | null;
} | null {
  const supportingExample =
    recipe?.supporting_example && typeof recipe.supporting_example === "object"
      ? (recipe.supporting_example as Record<string, unknown>)
      : null;

  if (!supportingExample) {
    return null;
  }

  return {
    title: String(supportingExample.title ?? "Example"),
    code: String(supportingExample.code ?? ""),
    source_url:
      typeof supportingExample.source_url === "string"
        ? supportingExample.source_url
        : null,
  };
}

export function toSuggestedFollowUps(
  recipe: Record<string, unknown> | undefined,
): SuggestedFollowUp[] | undefined {
  return Array.isArray(recipe?.suggested_follow_ups) &&
    recipe.suggested_follow_ups.length > 0
    ? (recipe.suggested_follow_ups as SuggestedFollowUp[])
    : undefined;
}

export function toRecipeStarterCode(
  recipe: Record<string, unknown> | undefined,
): StarterCodeSnippet[] | undefined {
  if (!recipe) {
    return undefined;
  }

  return createRecipeStarterCode({
    recipeName: String(recipe.recipe_name ?? recipe.name ?? "Recipe"),
    components: Array.isArray(recipe.components)
      ? recipe.components.map((component) => ({
          name: String(component.name ?? "Component"),
          package:
            typeof component.package === "string" ? component.package : null,
          role: typeof component.role === "string" ? component.role : null,
        }))
      : [],
    supporting_example: toSupportingExample(recipe),
  });
}
