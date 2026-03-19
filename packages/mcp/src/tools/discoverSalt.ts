import type {
  SaltRegistry,
  SaltStatus,
  SearchArea,
  SearchIndexEntry,
} from "../types.js";
import type { SuggestedFollowUp } from "./consumerPresentation.js";
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
import { listFoundations } from "./listFoundations.js";
import { listSaltCatalog } from "./listSaltCatalog.js";
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
    | "choose_salt_solution"
    | "get_salt_entity"
    | "get_salt_examples"
    | "compare_salt_versions";
  why: string;
  args?: Record<string, unknown>;
  result: Record<string, unknown> | null;
}

export interface DiscoverSaltResult {
  mode: "route" | "browse" | "related";
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

function toDecisionFromSearchResult(
  result: ReturnType<typeof searchSaltDocs>["results"][number] | undefined,
): DiscoverSaltDecision | null {
  if (!result) {
    return null;
  }

  switch (result.type) {
    case "component":
      return {
        workflow: "get_salt_entity",
        why: "The closest match looks like a specific Salt component.",
        args: {
          entity_type: "component",
          name: result.name,
          package: result.package ?? undefined,
        },
        result: {
          name: result.name,
          summary: result.summary,
          package: result.package,
        },
      };
    case "pattern":
      return {
        workflow: "get_salt_entity",
        why: "The closest match looks like a specific Salt pattern.",
        args: {
          entity_type: "pattern",
          name: result.name,
        },
        result: {
          name: result.name,
          summary: result.summary,
        },
      };
    case "guide":
    case "page":
    case "token":
    case "package":
    case "icon":
    case "country_symbol":
      return {
        workflow: "get_salt_entity",
        why: "The closest match looks like a specific Salt entity.",
        args: {
          entity_type:
            result.type === "country_symbol" ? "country_symbol" : result.type,
          name: result.name,
        },
        result: {
          name: result.name,
          summary: result.summary,
          package: result.package,
        },
      };
    case "example":
      return {
        workflow: "get_salt_examples",
        why: "The closest match is an implementation example.",
        args: {
          query: result.name,
        },
        result: {
          title: result.name,
          summary: result.summary,
        },
      };
    case "change":
      return {
        workflow: "compare_salt_versions",
        why: "The closest match is upgrade or change history content.",
        args: {
          package: result.package ?? undefined,
          from_version: "1.0.0",
        },
        result: {
          title: result.name,
          summary: result.summary,
        },
      };
    default:
      return {
        workflow: "discover_salt",
        why: "Stay in discovery mode and narrow further from the nearest docs result.",
        args: {
          query: result.name,
        },
        result: {
          title: result.name,
          summary: result.summary,
        },
      };
  }
}

function toDecisionFromDocOption(
  doc: Record<string, unknown> | undefined,
): DiscoverSaltDecision | null {
  if (!doc || typeof doc.type !== "string") {
    return null;
  }

  const type = doc.type as SearchIndexEntry["type"];
  const name = String(doc.title ?? "");
  const summary = String(doc.summary ?? "");
  const packageName = typeof doc.package === "string" ? doc.package : null;

  return toDecisionFromSearchResult({
    id: "search-result",
    type,
    name,
    package: packageName,
    status:
      doc.status === "stable" ||
      doc.status === "beta" ||
      doc.status === "lab" ||
      doc.status === "deprecated"
        ? doc.status
        : null,
    summary,
    score: 0,
    match_reasons: [],
    score_breakdown: {
      name_exact: 0,
      name_phrase: 0,
      summary_phrase: 0,
      content_phrase: 0,
      name_tokens: 0,
      summary_tokens: 0,
      content_tokens: 0,
      keyword_tokens: 0,
    },
    matched_keywords: [],
    matched_excerpt: typeof doc.why === "string" ? doc.why : null,
    source_url:
      Array.isArray(doc.docs) && typeof doc.docs[0] === "string"
        ? doc.docs[0]
        : null,
  });
}

function chooseRouteDecision(input: {
  query: string;
  foundationScore: number;
  tokenScore: number;
  patternScore: number;
  foundations: Array<Record<string, unknown>>;
  tokens: Array<Record<string, unknown>>;
  patterns: Array<Record<string, unknown>>;
  components: Array<Record<string, unknown>>;
  docs: Array<Record<string, unknown>>;
  apiSurface: Array<Record<string, unknown>>;
}): DiscoverSaltDecision | null {
  const {
    query,
    foundationScore,
    tokenScore,
    patternScore,
    foundations,
    tokens,
    patterns,
    components,
    docs,
    apiSurface,
  } = input;

  if (
    foundations.length > 0 &&
    foundationScore >= tokenScore &&
    foundationScore >= patternScore &&
    foundationScore > 0
  ) {
    return {
      workflow: "get_salt_entity",
      why: "The query looks foundation-oriented, so start from the closest foundation guidance.",
      args: {
        entity_type: "foundation",
        name: foundations[0]?.title,
      },
      result: foundations[0] ?? null,
    };
  }

  if (tokens.length > 0 && tokenScore >= patternScore && tokenScore > 0) {
    return {
      workflow: "choose_salt_solution",
      why: "The query looks styling-oriented, so start from token selection.",
      args: {
        solution_type: "token",
        query,
      },
      result: tokens[0] ?? null,
    };
  }

  if (patterns.length > 0 && patternScore > 0) {
    return {
      workflow: "choose_salt_solution",
      why: "The query sounds like a pattern or flow problem, so start from composition guidance.",
      args: {
        solution_type: "pattern",
        query,
      },
      result: patterns[0] ?? null,
    };
  }

  if (components.length > 0) {
    return {
      workflow: "choose_salt_solution",
      why: "The query sounds like a component choice problem, so start from the strongest component fit.",
      args: {
        solution_type: "component",
        query,
      },
      result: components[0] ?? null,
    };
  }

  if (apiSurface.length > 0) {
    return {
      workflow: "get_salt_entity",
      why: "The query looks like a prop or API lookup, so start from the component that exposes the closest prop match.",
      args: {
        entity_type: "component",
        name: apiSurface[0]?.component,
        include: ["props"],
      },
      result: apiSurface[0] ?? null,
    };
  }

  return toDecisionFromDocOption(docs[0]);
}

function getClarifyingQuestions(input: {
  query: string;
  production_ready?: boolean;
  prefer_stable?: boolean;
  a11y_required?: boolean;
  form_field_support?: boolean;
  components: Array<Record<string, unknown>>;
  foundationScore: number;
  tokenScore: number;
  patternScore: number;
}): ClarifyingQuestion[] {
  const questions: ClarifyingQuestion[] = [];
  const { query } = input;

  if (
    /\b(select|choose|pick|option|dropdown|combo)\b/.test(query) &&
    !/\b(single|multi|multiple)\b/.test(query)
  ) {
    questions.push({
      id: "selection-mode",
      question: "Is this a single-select or multi-select interaction?",
      why: "That changes the likely Salt component family.",
      options: ["Single-select", "Multi-select", "Not sure yet"],
    });
  }

  if (
    /\b(button|link|action|cta|target)\b/.test(query) &&
    !/\b(route|href|navigation|navigate)\b/.test(query)
  ) {
    questions.push({
      id: "navigation-vs-action",
      question:
        "Should this navigate somewhere, or trigger an in-place action?",
      why: "Navigation and action intent usually map to different Salt primitives.",
      options: ["Navigation", "In-place action", "Both"],
    });
  }

  if (
    /\b(form|input|field|login|sign in|signin|picker)\b/.test(query) &&
    input.form_field_support === undefined
  ) {
    questions.push({
      id: "form-field-support",
      question:
        "Does this need FormField-style labeling and validation support?",
      why: "That narrows the best examples and starter scaffolds.",
      options: ["Yes", "No", "Not sure"],
    });
  }

  if (
    input.production_ready === undefined &&
    input.prefer_stable === undefined &&
    input.components.some(
      (item) => typeof item.status === "string" && item.status !== "stable",
    )
  ) {
    questions.push({
      id: "stable-only",
      question: "Do you need production-ready stable components only?",
      why: "Some close matches may still be beta or lab.",
      options: ["Stable only", "Stable preferred", "Open to beta or lab"],
    });
  }

  const strongSignals = [
    input.foundationScore > 0,
    input.tokenScore > 0,
    input.patternScore > 0,
  ].filter(Boolean).length;
  const scores = [input.foundationScore, input.tokenScore, input.patternScore]
    .filter((score) => score > 0)
    .sort((left, right) => right - left);

  if (strongSignals > 1 && scores.length > 1 && scores[0] - scores[1] <= 1) {
    questions.push({
      id: "guidance-vs-implementation",
      question:
        "Do you want design guidance, a specific implementation direction, or both?",
      why: "The query is pulling equally toward foundations and implementation help.",
      options: ["Design guidance", "Implementation direction", "Both"],
    });
  }

  if (
    input.a11y_required === undefined &&
    /\b(form|input|action|menu|dialog)\b/.test(query)
  ) {
    questions.push({
      id: "a11y-priority",
      question:
        "Should accessibility guidance be treated as a hard requirement?",
      why: "That can remove candidates with thinner accessibility coverage.",
      options: ["Required", "Preferred", "Not a filter"],
    });
  }

  return questions.slice(0, 3);
}

function getCatalogDecision(
  catalog: ReturnType<typeof listSaltCatalog>,
): DiscoverSaltDecision | null {
  const [first] = catalog.items;
  if (!first) {
    return null;
  }

  if (first.type === "change") {
    return {
      workflow: "compare_salt_versions",
      why: "The current browse view is change-oriented, so version comparison is the next step.",
      args: {
        package: first.package ?? undefined,
        from_version: "1.0.0",
      },
      result: {
        title: first.name,
        summary: first.summary,
      },
    };
  }

  if (first.type === "example") {
    return {
      workflow: "get_salt_examples",
      why: "The current browse view is example-oriented, so jump straight to examples.",
      args: {
        query: first.name,
      },
      result: {
        title: first.name,
        summary: first.summary,
      },
    };
  }

  return {
    workflow: "get_salt_entity",
    why: "The current browse view already has a likely Salt entity to inspect next.",
    args: {
      entity_type:
        first.type === "country_symbol" ? "country_symbol" : first.type,
      name: first.name,
      package: first.package ?? undefined,
    },
    result: {
      name: first.name,
      type: first.type,
      summary: first.summary,
    },
  };
}

function getRelatedDecision(
  related: ReturnType<typeof getRelatedEntities>,
): DiscoverSaltDecision | null {
  const firstComponent = related.related.components[0];
  if (firstComponent) {
    return {
      workflow: "get_salt_entity",
      why: "The related component is the closest next lookup.",
      args: {
        entity_type: "component",
        name: firstComponent.name,
        package:
          typeof firstComponent.package === "string"
            ? firstComponent.package
            : undefined,
      },
      result: firstComponent,
    };
  }

  const firstPattern = related.related.patterns[0];
  if (firstPattern) {
    return {
      workflow: "get_salt_entity",
      why: "The related pattern is the closest next lookup.",
      args: {
        entity_type: "pattern",
        name: firstPattern.name,
      },
      result: firstPattern,
    };
  }

  const firstToken = related.related.tokens[0];
  if (firstToken) {
    return {
      workflow: "get_salt_entity",
      why: "The related token is the closest next lookup.",
      args: {
        entity_type: "token",
        name: firstToken.name,
      },
      result: firstToken,
    };
  }

  return null;
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

    return {
      mode: "related",
      query: input.related_to.name,
      decision,
      best_start: decision,
      related: related.related,
      did_you_mean: related.did_you_mean,
      ambiguity: related.ambiguity as Record<string, unknown> | undefined,
      next_step:
        decision?.workflow === "get_salt_entity"
          ? "Inspect the closest related entity next."
          : "Broaden the related-entity exploration with a more specific starting entity.",
      raw: view === "full" ? { related } : undefined,
    };
  }

  if (!query) {
    const catalog = listSaltCatalog(registry, {
      area: input.area,
      package: input.package,
      status: input.status,
      max_results: topK,
    });
    const decision = getCatalogDecision(catalog);

    return {
      mode: "browse",
      decision,
      best_start: decision,
      catalog,
      next_step:
        catalog.items.length > 0
          ? "Choose one of the surfaced Salt entries and inspect it directly."
          : "Remove a filter or provide a query to broaden discovery.",
      raw: view === "full" ? { catalog } : undefined,
    };
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
  const patternScore = scoreDiscoveryKeywordIntent(
    query,
    RECIPE_DISCOVERY_KEYWORDS,
  );
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
    query: input.query,
    decision,
    best_start: decision,
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
    ),
    next_step: resolveDiscoverNextStep({
      decision,
      firstFoundation: foundations[0],
      foundationNextStep: foundationLookup.next_step,
      componentNextStep: componentResult.next_step,
      patternNextStep: patternResult.next_step,
      tokenNextStep: tokenResult.next_step,
    }),
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
            component_recommendations: componentResult,
            composition_recipes: patternResult,
            foundation_lookup: foundationLookup,
            foundation_list: foundationList,
            token_recommendations: tokenResult,
            docs_results: docsResult,
            api_surface: apiSurfaceResult,
          }
        : undefined,
  };
}
