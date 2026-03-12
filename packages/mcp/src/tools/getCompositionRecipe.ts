import type { PatternRecord, SaltRegistry } from "../types.js";
import { findReferencedComponent } from "./componentLookup.js";
import {
  type ConsumerRecommendationFilters,
  compareComponentsByConsumerPreference,
  comparePatternsByConsumerPreference,
  matchesComponentConsumerFilters,
  matchesPatternConsumerFilters,
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
  getPatternQueryFields,
  scoreQueryFields,
} from "./consumerSignals.js";
import {
  createRecipeStarterCode,
  type StarterCodeSnippet,
} from "./starterCode.js";
import { isComponentAllowedByDocsPolicy, normalizeQuery } from "./utils.js";

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

function buildPatternRecipe(
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

  return {
    recipe_name: pattern.name,
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
    docs: [
      pattern.related_docs.overview,
      ...pattern.resources.map((r) => r.href),
    ].filter((value): value is string => Boolean(value)),
    caveats: getPatternCaveats(registry, pattern),
    ship_check: getPatternShipCheck(registry, pattern),
    suggested_follow_ups: getPatternSuggestedFollowUps(pattern),
  };
}

function buildFallbackRecipe(
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

  return {
    recipe_name: "Suggested component set",
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

function getRecipeNextStep(
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

  return "Broaden the query or try search_salt_docs for a more specific Salt pattern.";
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

function toSuggestedFollowUps(
  recipe: Record<string, unknown> | undefined,
): SuggestedFollowUp[] | undefined {
  return Array.isArray(recipe?.suggested_follow_ups) &&
    recipe.suggested_follow_ups.length > 0
    ? (recipe.suggested_follow_ups as SuggestedFollowUp[])
    : undefined;
}

function toRecipeStarterCode(
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

  const patternRecipes = registry.patterns
    .filter((pattern) =>
      matchesPatternConsumerFilters(registry, pattern, filters),
    )
    .map((pattern) => ({
      pattern,
      ...scoreQueryFields(query, getPatternQueryFields(pattern)),
    }))
    .filter((candidate) => candidate.score > 0)
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
    type: recipe.recipe_type,
    summary: recipe.summary,
    steps: recipe.steps,
    components: recipe.components,
    examples: recipe.supporting_examples ?? [],
    docs: recipe.docs ?? [],
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
