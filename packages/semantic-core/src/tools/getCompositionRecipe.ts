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

const PAGE_LEVEL_CREATE_KEYWORDS = [
  "dashboard",
  "page",
  "screen",
  "workspace",
  "overview",
] as const;

const BOUNDED_REGION_CREATE_KEYWORDS = [
  "area",
  "section",
  "region",
  "strip",
  "panel",
  "toolbar",
  "dialog",
  "form",
  "card",
  "widget",
] as const;

const RELATIONAL_CREATE_KEYWORDS = [
  "above",
  "below",
  "alongside",
  "beside",
  "within",
  "inside",
  "under",
  "over",
] as const;

const MULTI_REGION_CREATE_HINTS = [
  "metric",
  "metrics",
  "kpi",
  "kpis",
  "table",
  "grid",
  "filter",
  "filters",
  "chart",
  "charts",
  "sparkline",
  "sparklines",
  "navigation",
  "tabs",
  "transactions",
  "portfolio",
  "reports",
  "module",
  "modules",
  "summary",
  "header",
  "body",
] as const;

function countKeywordMatches(
  query: string,
  keywords: readonly string[],
): number {
  return keywords.reduce((count, keyword) => {
    const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return count + (new RegExp(`\\b${escaped}\\b`, "i").test(query) ? 1 : 0);
  }, 0);
}

function hasBroadPageLevelCreateIntent(query: string): boolean {
  if (!query) {
    return false;
  }

  const hasPageLevelKeyword = countKeywordMatches(
    query,
    PAGE_LEVEL_CREATE_KEYWORDS,
  );
  if (hasPageLevelKeyword === 0) {
    return false;
  }

  const boundedRegionCount = countKeywordMatches(
    query,
    BOUNDED_REGION_CREATE_KEYWORDS,
  );
  const relationalCount = countKeywordMatches(
    query,
    RELATIONAL_CREATE_KEYWORDS,
  );
  const multiRegionCount = countKeywordMatches(
    query,
    MULTI_REGION_CREATE_HINTS,
  );

  const regionScoped = boundedRegionCount > 0 && relationalCount > 0;
  if (regionScoped) {
    return false;
  }

  return multiRegionCount >= 2 || boundedRegionCount === 0;
}

function getPageLevelPatternBoost(
  pattern: { name: string; category?: string[] | null },
  query: string,
): number {
  if (!hasBroadPageLevelCreateIntent(query)) {
    return 0;
  }

  const normalizedName = normalizeQuery(pattern.name);
  const normalizedCategories = (pattern.category ?? []).map((category) =>
    normalizeQuery(category),
  );
  const isPageLevelPattern =
    normalizedCategories.includes("layout-and-shells") ||
    /\b(dashboard|page|screen|workspace|overview)\b/.test(normalizedName);

  if (isPageLevelPattern) {
    return 24;
  }

  if (normalizedName === "metric") {
    return -12;
  }

  return 0;
}

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
      const pageLevelBoost = getPageLevelPatternBoost(pattern, query);

      return {
        pattern,
        accepted: alignment.accepted,
        score:
          queryScore.score +
          semanticScore.score_adjustment +
          alignment.scoreAdjustment +
          pageLevelBoost,
        matched_terms: mergeUniqueStrings(
          queryScore.matched_terms,
          semanticScore.matched_terms,
          alignment.matchedTerms,
        ),
        match_reasons: mergeUniqueStrings(
          queryScore.match_reasons,
          semanticScore.match_reasons,
          alignment.matchReasons,
          pageLevelBoost > 0
            ? ["page_level_dashboard_intent"]
            : pageLevelBoost < 0
              ? ["narrow_pattern_penalty_for_page_level_intent"]
              : [],
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
