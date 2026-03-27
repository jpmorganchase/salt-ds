import type { SaltRegistry } from "../types.js";
import type { ConsumerRecommendationFilters } from "./consumerFilters.js";
import {
  comparePatternsByConsumerPreference,
  matchesPatternConsumerFilters,
} from "./consumerFilters.js";
import type { SuggestedFollowUp } from "./consumerPresentation.js";
import {
  getEffectiveUsageSemantics,
  getPatternQueryFields,
  scoreQueryFields,
  scoreUsageSemantics,
} from "./consumerSignals.js";
import {
  buildFallbackRecipe,
  buildPatternAlignmentIntents,
  buildPatternRecipe,
  getRecipeNextStep,
  mergeUniqueStrings,
  scorePatternAlignment,
  toRecipeStarterCode,
  toSuggestedFollowUps,
} from "./getCompositionRecipeHelpers.js";
import type { StarterCodeSnippet } from "./starterCode.js";
import { createTranslationSemanticIndex } from "./translation/sourceUiSemanticMatching.js";
import { normalizeQuery } from "./utils.js";

export interface GetCompositionRecipeInput {
  query: string;
  top_k?: number;
  production_ready?: boolean;
  prefer_stable?: boolean;
  a11y_required?: boolean;
  form_field_support?: boolean;
  include_starter_code?: boolean;
  view?: "compact" | "full";
}

export interface GetCompositionRecipeResult {
  recommended?: Record<string, unknown> | null;
  alternatives?: Array<Record<string, unknown>>;
  recipes?: Array<Record<string, unknown>>;
  starter_code?: StarterCodeSnippet[];
  suggested_follow_ups?: SuggestedFollowUp[];
  next_step?: string;
}

export function getCompositionRecipe(
  registry: SaltRegistry,
  input: GetCompositionRecipeInput,
): GetCompositionRecipeResult {
  const query = normalizeQuery(input.query);
  const topK = Math.max(1, Math.min(input.top_k ?? 3, 10));
  const view = input.view ?? "compact";
  const filters: ConsumerRecommendationFilters = {
    production_ready: input.production_ready,
    prefer_stable: input.prefer_stable,
    a11y_required: input.a11y_required,
    form_field_support: input.form_field_support,
  };
  const semanticIndex = createTranslationSemanticIndex(registry);
  const patternAlignmentIntents = buildPatternAlignmentIntents(registry, query);

  const patternRecipes = registry.patterns
    .filter((pattern) =>
      matchesPatternConsumerFilters(registry, pattern, filters),
    )
    .map((pattern) => {
      const queryScore = scoreQueryFields(
        query,
        getPatternQueryFields(pattern),
      );
      const semanticScore = scoreUsageSemantics(
        query,
        getEffectiveUsageSemantics(pattern),
      );
      const alignment = scorePatternAlignment(
        semanticIndex,
        pattern,
        patternAlignmentIntents,
      );

      return {
        pattern,
        accepted: alignment.accepted,
        score:
          queryScore.score +
          semanticScore.score_adjustment +
          alignment.scoreAdjustment,
        matched_terms: mergeUniqueStrings(
          queryScore.matched_terms,
          semanticScore.matched_terms,
          alignment.matchedTerms,
        ),
        match_reasons: mergeUniqueStrings(
          queryScore.match_reasons,
          semanticScore.match_reasons,
          alignment.matchReasons,
        ),
      };
    })
    .filter((candidate) => candidate.accepted && candidate.score > 0)
    .sort((left, right) => {
      if (left.score !== right.score) {
        return right.score - left.score;
      }
      const preferenceOrder = comparePatternsByConsumerPreference(
        registry,
        left.pattern,
        right.pattern,
        filters,
      );
      if (preferenceOrder !== 0) {
        return preferenceOrder;
      }
      return left.pattern.name.localeCompare(right.pattern.name);
    })
    .slice(0, topK)
    .map((candidate) =>
      buildPatternRecipe(
        registry,
        candidate.pattern,
        candidate.score,
        candidate.matched_terms,
        candidate.match_reasons,
      ),
    );

  const fallbackRecipe = buildFallbackRecipe(registry, query, filters);

  const recipes =
    patternRecipes.length > 0
      ? fallbackRecipe
        ? [...patternRecipes, fallbackRecipe]
        : patternRecipes
      : fallbackRecipe
        ? [fallbackRecipe]
        : [];

  if (view === "full") {
    return {
      recipes,
      starter_code:
        input.include_starter_code && recipes[0]
          ? toRecipeStarterCode(recipes[0])
          : undefined,
      suggested_follow_ups: toSuggestedFollowUps(recipes[0]),
      next_step: getRecipeNextStep(recipes[0]),
    };
  }

  const compactRecipes = recipes.map((recipe) => ({
    name: recipe.recipe_name,
    category: Array.isArray(recipe.category) ? recipe.category : [],
    type: recipe.recipe_type,
    summary: recipe.summary,
    steps: recipe.steps,
    components: recipe.components,
    examples: recipe.supporting_examples ?? [],
    docs: recipe.docs ?? [],
    related_guides: recipe.related_guides ?? [],
    guidance_sources: recipe.guidance_sources ?? [],
    caveats: recipe.caveats ?? [],
    ship_check: recipe.ship_check ?? null,
  }));
  const [recommended, ...alternatives] = compactRecipes;

  return {
    recommended: recommended ?? null,
    alternatives,
    starter_code:
      input.include_starter_code && recommended
        ? toRecipeStarterCode(recipes[0])
        : undefined,
    suggested_follow_ups: toSuggestedFollowUps(recipes[0]),
    next_step: getRecipeNextStep(recommended),
  };
}
