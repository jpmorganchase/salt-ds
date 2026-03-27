import type { SaltRegistry, SaltStatus, SearchArea } from "../types.js";
import type { SuggestedFollowUp } from "./consumerPresentation.js";
import {
  buildRoutingDebug,
  chooseRouteDecision,
  getCatalogDecision,
  getClarifyingQuestions,
  getDecisionGuidanceSources,
  getDiscoverRelatedGuides,
  getRelatedDecision,
  toGuideReferenceArray,
} from "./discoverSaltHelpers.js";
import {
  getDiscoverySuggestedFollowUps,
  resolveDiscoverNextStep,
  resolveDiscoverStarterCode,
  toCompactApiMatches,
  toCompactComponentOptions,
  toCompactDocs,
  toCompactFoundationOption,
  toCompactPatternOptions,
  toCompactTokenOptions,
} from "./discoverSaltPresentation.js";
import {
  FOUNDATION_DISCOVERY_KEYWORDS,
  inferDiscoveryPreferences,
  RECIPE_DISCOVERY_KEYWORDS,
  scoreDiscoveryKeywordIntent,
  TOKEN_DISCOVERY_KEYWORDS,
} from "./discoverSaltSignals.js";
import { getCompositionRecipe } from "./getCompositionRecipe.js";
import { getFoundation } from "./getFoundation.js";
import { getRelatedEntities } from "./getRelatedEntities.js";
import {
  appendProjectConventionsNextStep,
  buildGuidanceBoundary,
  type GuidanceBoundary,
} from "./guidanceBoundary.js";
import type { GuideReference } from "./guideAwareness.js";
import { listFoundations } from "./listFoundations.js";
import { listSaltCatalog } from "./listSaltCatalog.js";
import { getStructuralPatternIntent } from "./patternIntent.js";
import { recommendComponent } from "./recommendComponent.js";
import { recommendTokens } from "./recommendTokens.js";
import { searchApiSurface } from "./searchApiSurface.js";
import { searchSaltDocs } from "./searchSaltDocs.js";
import type { StarterCodeSnippet } from "./starterCode.js";
import { normalizeQuery } from "./utils.js";

type DiscoveryEntityType = "component" | "pattern" | "token" | "guide" | "page";

export interface DiscoverSaltInput {
  query?: string;
  area?: SearchArea;
  package?: string;
  status?: SaltStatus;
  related_to?: {
    entity_type: DiscoveryEntityType;
    name: string;
    package?: string;
  };
  view?: "compact" | "full";
}

export interface ClarifyingQuestion {
  id: string;
  question: string;
  why: string;
  options: string[];
}

export interface DiscoverSaltDecision {
  workflow:
    | "discover_salt"
    | "migrate_to_salt"
    | "create_salt_ui"
    | "get_salt_entity"
    | "get_salt_examples"
    | "upgrade_salt_ui";
  why: string;
  args?: Record<string, unknown>;
  result: Record<string, unknown> | null;
}

export interface DiscoverSaltResult {
  mode: "route" | "browse" | "related";
  guidance_boundary: GuidanceBoundary;
  guidance_sources?: string[];
  query?: string;
  decision: DiscoverSaltDecision | null;
  best_start?: DiscoverSaltDecision | null;
  options?: {
    components: Array<Record<string, unknown>>;
    patterns: Array<Record<string, unknown>>;
    foundations: Array<Record<string, unknown>>;
    tokens: Array<Record<string, unknown>>;
    docs: Array<Record<string, unknown>>;
    api_surface: Array<Record<string, unknown>>;
  };
  catalog?: ReturnType<typeof listSaltCatalog>;
  related?: ReturnType<typeof getRelatedEntities>["related"];
  clarifying_questions?: ClarifyingQuestion[];
  starter_code?: StarterCodeSnippet[];
  related_guides?: GuideReference[];
  suggested_follow_ups?: SuggestedFollowUp[];
  next_step?: string;
  signals?: {
    foundations: number;
    tokens: number;
    patterns: number;
  };
  raw?: Record<string, unknown>;
  did_you_mean?: string[];
  ambiguity?: Record<string, unknown>;
}

export function discoverSalt(
  registry: SaltRegistry,
  input: DiscoverSaltInput,
): DiscoverSaltResult {
  const view = input.view ?? "compact";
  const topK = 5;
  const query = normalizeQuery(input.query ?? "");
  const preferences = inferDiscoveryPreferences(query);

  if (input.related_to) {
    const related = getRelatedEntities(registry, {
      target_type: input.related_to.entity_type,
      name: input.related_to.name,
      package: input.related_to.package,
      max_results: topK,
    });
    const decision = getRelatedDecision(related);
    const guidanceBoundary = buildGuidanceBoundary({
      workflow: "discover_salt",
      routed_workflow: decision?.workflow,
    });

    return {
      mode: "related",
      guidance_boundary: guidanceBoundary,
      guidance_sources: getDecisionGuidanceSources(decision),
      query: input.related_to.name,
      decision,
      best_start: decision,
      related: related.related,
      related_guides:
        related.related.guides.length > 0
          ? toGuideReferenceArray(related.related.guides)
          : undefined,
      did_you_mean: related.did_you_mean,
      ambiguity: related.ambiguity as Record<string, unknown> | undefined,
      next_step: appendProjectConventionsNextStep(
        decision?.workflow === "get_salt_entity"
          ? "Inspect the closest related entity next."
          : "Broaden the related-entity exploration with a more specific starting entity.",
        guidanceBoundary,
      ),
      raw:
        view === "full"
          ? {
              routing_debug: buildRoutingDebug({ decision }),
              related,
            }
          : undefined,
    } satisfies DiscoverSaltResult;
  }

  if (!query) {
    const catalog = listSaltCatalog(registry, {
      area: input.area,
      package: input.package,
      status: input.status,
      max_results: topK,
    });
    const decision = getCatalogDecision(catalog);
    const guidanceBoundary = buildGuidanceBoundary({
      workflow: "discover_salt",
      routed_workflow: decision?.workflow,
    });

    return {
      mode: "browse",
      guidance_boundary: guidanceBoundary,
      guidance_sources: getDecisionGuidanceSources(decision),
      decision,
      best_start: decision,
      catalog,
      next_step: appendProjectConventionsNextStep(
        catalog.items.length > 0
          ? "Choose one of the surfaced Salt entries and inspect it directly."
          : "Remove a filter or provide a query to broaden discovery.",
        guidanceBoundary,
      ),
      raw:
        view === "full"
          ? {
              routing_debug: buildRoutingDebug({ decision }),
              catalog,
            }
          : undefined,
    } satisfies DiscoverSaltResult;
  }

  const recommendationView = view === "full" ? "full" : "compact";
  const componentResult = recommendComponent(registry, {
    task: input.query ?? "",
    package: input.package,
    status: input.status,
    top_k: topK,
    production_ready: preferences.production_ready,
    prefer_stable: preferences.prefer_stable,
    a11y_required: preferences.a11y_required,
    form_field_support: preferences.form_field_support,
    include_starter_code: preferences.include_starter_code,
    view: recommendationView,
  });
  const patternResult = getCompositionRecipe(registry, {
    query: input.query ?? "",
    top_k: Math.min(topK, 5),
    production_ready: preferences.production_ready,
    prefer_stable: preferences.prefer_stable,
    a11y_required: preferences.a11y_required,
    form_field_support: preferences.form_field_support,
    include_starter_code: preferences.include_starter_code,
    view: recommendationView,
  });
  const foundationLookup = getFoundation(registry, {
    name: input.query ?? "",
    include_starter_code: preferences.include_starter_code,
    view: recommendationView,
  });
  const foundationList = listFoundations(registry, {
    query: input.query,
    max_results: topK,
  });
  const tokenResult = recommendTokens(registry, {
    query: input.query ?? "",
    top_k: topK,
    view: recommendationView,
  });
  const docsResult = searchSaltDocs(registry, {
    query: input.query ?? "",
    area: input.area,
    package: input.package,
    status: input.status,
    top_k: topK,
  });
  const apiSurfaceResult = searchApiSurface(registry, {
    query: input.query ?? "",
    component_name: undefined,
    package: input.package,
    status: input.status,
    top_k: Math.min(topK, 5),
  });

  const components = toCompactComponentOptions(componentResult);
  const patterns = toCompactPatternOptions(patternResult);
  const primaryFoundation = toCompactFoundationOption(
    foundationLookup.foundation,
  );
  const foundations = primaryFoundation
    ? [primaryFoundation]
    : foundationList.foundations;
  const tokens = toCompactTokenOptions(tokenResult);
  const docs = toCompactDocs(docsResult.results);
  const apiSurface = toCompactApiMatches(apiSurfaceResult);
  const foundationScore =
    scoreDiscoveryKeywordIntent(query, FOUNDATION_DISCOVERY_KEYWORDS) +
    (foundationLookup.foundation ? 4 : 0);
  const tokenScore = scoreDiscoveryKeywordIntent(
    query,
    TOKEN_DISCOVERY_KEYWORDS,
  );
  const structuralPatternIntent = getStructuralPatternIntent(query);
  const patternScore =
    scoreDiscoveryKeywordIntent(query, RECIPE_DISCOVERY_KEYWORDS) +
    structuralPatternIntent.score;
  const decision = chooseRouteDecision({
    query: input.query ?? "",
    foundationScore,
    tokenScore,
    patternScore,
    foundations,
    tokens,
    patterns,
    components,
    docs,
    apiSurface,
  });
  const guidanceBoundary = buildGuidanceBoundary({
    workflow: "discover_salt",
    routed_workflow: decision?.workflow,
    solution_type:
      decision?.workflow === "create_salt_ui" &&
      typeof decision.args?.solution_type === "string" &&
      (decision.args.solution_type === "component" ||
        decision.args.solution_type === "pattern" ||
        decision.args.solution_type === "foundation" ||
        decision.args.solution_type === "token")
        ? decision.args.solution_type
        : undefined,
  });
  const clarifyingQuestions = getClarifyingQuestions({
    query,
    production_ready: preferences.production_ready,
    prefer_stable: preferences.prefer_stable,
    a11y_required: preferences.a11y_required,
    form_field_support: preferences.form_field_support,
    components,
    foundationScore,
    tokenScore,
    patternScore,
  });

  return {
    mode: "route",
    guidance_boundary: guidanceBoundary,
    guidance_sources: getDecisionGuidanceSources(decision),
    query: input.query,
    decision,
    best_start: decision,
    related_guides: getDiscoverRelatedGuides(registry, [
      decision?.result,
      components[0],
      patterns[0],
      foundations[0],
    ]),
    options: {
      components,
      patterns,
      foundations,
      tokens,
      docs,
      api_surface: apiSurface,
    },
    clarifying_questions:
      clarifyingQuestions.length > 0 ? clarifyingQuestions : undefined,
    starter_code: resolveDiscoverStarterCode({
      decision,
      foundationStarterCode: foundationLookup.starter_code,
      patternStarterCode: patternResult.starter_code,
      componentStarterCode: componentResult.starter_code,
    }),
    suggested_follow_ups: getDiscoverySuggestedFollowUps(
      decision,
      input.query ?? "",
      docs,
      guidanceBoundary,
    ),
    next_step: appendProjectConventionsNextStep(
      resolveDiscoverNextStep({
        decision,
        firstFoundation: foundations[0],
        foundationNextStep: foundationLookup.next_step,
        componentNextStep: componentResult.next_step,
        patternNextStep: patternResult.next_step,
        tokenNextStep: tokenResult.next_step,
      }),
      guidanceBoundary,
    ),
    signals:
      view === "full"
        ? {
            foundations: foundationScore,
            tokens: tokenScore,
            patterns: patternScore,
          }
        : undefined,
    raw:
      view === "full"
        ? {
            routing_debug: buildRoutingDebug({
              decision,
              components,
              patterns,
              foundations,
              tokens,
              docs,
            }),
            component_recommendations: componentResult,
            composition_recipes: patternResult,
            foundation_lookup: foundationLookup,
            foundation_list: foundationList,
            token_recommendations: tokenResult,
            docs_results: docsResult,
            api_surface: apiSurfaceResult,
          }
        : undefined,
  } satisfies DiscoverSaltResult;
}
