import type { SaltRegistry, SaltStatus } from "../types.js";
import {
  getFoundationSuggestedFollowUpsByTitle,
  type SuggestedFollowUp,
} from "./consumerPresentation.js";
import { getCompositionRecipe } from "./getCompositionRecipe.js";
import { getFoundation } from "./getFoundation.js";
import { listFoundations } from "./listFoundations.js";
import { recommendComponent } from "./recommendComponent.js";
import { recommendTokens } from "./recommendTokens.js";
import { searchSaltDocs } from "./searchSaltDocs.js";
import type { StarterCodeSnippet } from "./starterCode.js";
import { normalizeQuery, tokenize } from "./utils.js";

const FOUNDATION_KEYWORDS = [
  "breakpoint",
  "breakpoints",
  "density",
  "elevation",
  "foundation",
  "foundations",
  "grid",
  "layout",
  "motion",
  "responsive",
  "responsiveness",
  "size",
  "spacing",
  "typography",
];

const TOKEN_KEYWORDS = [
  "background",
  "border",
  "color",
  "density",
  "font",
  "foreground",
  "margin",
  "padding",
  "radius",
  "semantic",
  "shadow",
  "theme",
  "token",
  "tokens",
];

const RECIPE_KEYWORDS = [
  "build",
  "compose",
  "composition",
  "dashboard",
  "filter",
  "flow",
  "form",
  "header",
  "layout",
  "login",
  "page",
  "pattern",
  "screen",
  "toolbar",
  "wizard",
];

export interface DiscoverSaltInput {
  query: string;
  package?: string;
  status?: SaltStatus;
  top_k?: number;
  production_ready?: boolean;
  prefer_stable?: boolean;
  a11y_required?: boolean;
  form_field_support?: boolean;
  include_starter_code?: boolean;
  view?: "compact" | "full";
}

export interface ClarifyingQuestion {
  id: string;
  question: string;
  why: string;
  options: string[];
}

export interface DiscoverSaltResult {
  query: string;
  best_start: {
    tool:
      | "get_foundation"
      | "recommend_tokens"
      | "get_composition_recipe"
      | "recommend_component"
      | "search_salt_docs";
    why: string;
    result: Record<string, unknown> | null;
  } | null;
  options: {
    components: Array<Record<string, unknown>>;
    recipes: Array<Record<string, unknown>>;
    foundations: Array<Record<string, unknown>>;
    tokens: Array<Record<string, unknown>>;
    docs: Array<Record<string, unknown>>;
  };
  clarifying_questions?: ClarifyingQuestion[];
  starter_code?: StarterCodeSnippet[];
  suggested_follow_ups?: SuggestedFollowUp[];
  next_step?: string;
  signals?: {
    foundations: number;
    tokens: number;
    recipes: number;
  };
  raw?: Record<string, unknown>;
}

function scoreIntent(query: string, keywords: string[]): number {
  const queryTokens = new Set(tokenize(query));
  const tokenScore = keywords.reduce(
    (score, keyword) => score + (queryTokens.has(keyword) ? 1 : 0),
    0,
  );
  const phraseScore = keywords.reduce(
    (score, keyword) => score + (query.includes(keyword) ? 1 : 0),
    0,
  );

  return tokenScore + phraseScore;
}

function toCompactDocs(
  results: ReturnType<typeof searchSaltDocs>["results"],
): Array<Record<string, unknown>> {
  return results.map((result) => ({
    title: result.name,
    type: result.type,
    summary: result.summary,
    why: result.matched_excerpt ?? result.summary,
    docs: result.source_url ? [result.source_url] : [],
  }));
}

function toStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((entry): entry is string => typeof entry === "string")
    : [];
}

function toRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : null;
}

function getDocsFromRelatedDocs(value: unknown): string[] {
  const relatedDocs = toRecord(value);
  if (!relatedDocs) {
    return [];
  }

  return Object.values(relatedDocs).filter(
    (entry): entry is string => typeof entry === "string" && entry.length > 0,
  );
}

function toCompactFoundationOption(
  foundation: Record<string, unknown> | null | undefined,
): Record<string, unknown> | null {
  const record = toRecord(foundation);
  if (!record) {
    return null;
  }

  const docs =
    toStringArray(record.docs).length > 0
      ? toStringArray(record.docs)
      : typeof record.route === "string"
        ? [record.route]
        : [];
  const topics =
    toStringArray(record.topics).length > 0
      ? toStringArray(record.topics).slice(0, 6)
      : toStringArray(record.section_headings).slice(0, 6);
  const guidance =
    toStringArray(record.guidance).length > 0
      ? toStringArray(record.guidance).slice(0, 3)
      : toStringArray(record.content).slice(0, 3);
  const title =
    typeof record.title === "string" ? record.title : "Suggested foundation";
  const nextStep =
    typeof record.next_step === "string"
      ? record.next_step
      : getFoundationNextStep(record);

  return {
    title,
    summary: typeof record.summary === "string" ? record.summary : "",
    topics,
    guidance,
    docs,
    next_step: nextStep,
  };
}

function toCompactComponentOptions(
  result: ReturnType<typeof recommendComponent>,
): Array<Record<string, unknown>> {
  if (result.recommended || result.alternatives) {
    return [
      ...(result.recommended ? [result.recommended] : []),
      ...(result.alternatives ?? []),
    ];
  }

  return (result.recommendations ?? []).map((recommendation) => {
    const recommendationRecord = toRecord(recommendation);
    const component = toRecord(recommendationRecord?.component);
    const status =
      typeof component?.status === "string" ? component.status : "stable";
    const examples =
      component &&
      typeof toRecord(component.related_docs)?.examples === "string"
        ? [String(toRecord(component.related_docs)?.examples)]
        : [];

    return {
      name: typeof component?.name === "string" ? component.name : "Component",
      summary: typeof component?.summary === "string" ? component.summary : "",
      why:
        toStringArray(recommendationRecord?.why)[0] ??
        (typeof component?.summary === "string" ? component.summary : ""),
      tradeoffs: toStringArray(recommendationRecord?.tradeoffs).slice(0, 2),
      docs: getDocsFromRelatedDocs(component?.related_docs),
      examples,
      caveats: toStringArray(recommendationRecord?.caveats),
      ship_check: toRecord(recommendationRecord?.ship_check),
      ...(status !== "stable" ? { status } : {}),
    };
  });
}

function toCompactRecipeOptions(
  result: ReturnType<typeof getCompositionRecipe>,
): Array<Record<string, unknown>> {
  if (result.recommended || result.alternatives) {
    return [
      ...(result.recommended ? [result.recommended] : []),
      ...(result.alternatives ?? []),
    ];
  }

  return (result.recipes ?? []).map((recipe) => {
    const recipeRecord = toRecord(recipe);

    return {
      name:
        typeof recipeRecord?.recipe_name === "string"
          ? recipeRecord.recipe_name
          : typeof recipeRecord?.name === "string"
            ? recipeRecord.name
            : "Recipe",
      type:
        typeof recipeRecord?.recipe_type === "string"
          ? recipeRecord.recipe_type
          : typeof recipeRecord?.type === "string"
            ? recipeRecord.type
            : "pattern",
      summary:
        typeof recipeRecord?.summary === "string" ? recipeRecord.summary : "",
      steps: Array.isArray(recipeRecord?.steps) ? recipeRecord.steps : [],
      components: Array.isArray(recipeRecord?.components)
        ? recipeRecord.components
        : [],
      examples: Array.isArray(recipeRecord?.supporting_examples)
        ? recipeRecord.supporting_examples
        : [],
      docs: toStringArray(recipeRecord?.docs),
      caveats: toStringArray(recipeRecord?.caveats),
      ship_check: toRecord(recipeRecord?.ship_check),
    };
  });
}

function toCompactTokenOptions(
  result: ReturnType<typeof recommendTokens>,
): Array<Record<string, unknown>> {
  if (result.recommended || result.alternatives) {
    return [
      ...(result.recommended ? [result.recommended] : []),
      ...(result.alternatives ?? []),
    ];
  }

  return (result.recommendations ?? []).map((recommendation) => {
    const recommendationRecord = toRecord(recommendation);
    const token = toRecord(recommendationRecord?.token);
    const guidance = toStringArray(token?.guidance);

    return {
      name: typeof token?.name === "string" ? token.name : "Token",
      category: typeof token?.category === "string" ? token.category : null,
      semantic_intent:
        typeof token?.semantic_intent === "string"
          ? token.semantic_intent
          : null,
      why:
        guidance[0] ??
        (typeof token?.semantic_intent === "string"
          ? token.semantic_intent
          : "Matches the requested styling need."),
      applies_to: toStringArray(token?.applies_to),
      docs: [result.source_url],
      ...(token?.deprecated ? { status: "deprecated" } : {}),
    };
  });
}

function chooseBestStart(input: {
  foundationScore: number;
  tokenScore: number;
  recipeScore: number;
  foundations: Array<Record<string, unknown>>;
  tokens: Array<Record<string, unknown>>;
  recipes: Array<Record<string, unknown>>;
  components: Array<Record<string, unknown>>;
  docs: Array<Record<string, unknown>>;
}): DiscoverSaltResult["best_start"] {
  const {
    foundationScore,
    tokenScore,
    recipeScore,
    foundations,
    tokens,
    recipes,
    components,
    docs,
  } = input;

  if (
    foundations.length > 0 &&
    foundationScore >= tokenScore &&
    foundationScore >= recipeScore &&
    foundationScore > 0
  ) {
    return {
      tool: "get_foundation",
      why: "The query looks foundation-oriented, so start with layout, spacing, typography, or responsiveness guidance.",
      result: foundations[0] ?? null,
    };
  }

  if (tokens.length > 0 && tokenScore >= recipeScore && tokenScore > 0) {
    return {
      tool: "recommend_tokens",
      why: "The query looks styling-oriented, so start with a token recommendation.",
      result: tokens[0] ?? null,
    };
  }

  if (recipes.length > 0 && recipeScore > 0) {
    return {
      tool: "get_composition_recipe",
      why: "The query sounds like a UI flow or pattern, so start with a composition recipe.",
      result: recipes[0] ?? null,
    };
  }

  if (components.length > 0) {
    return {
      tool: "recommend_component",
      why: "The query sounds like a component choice problem, so start with the strongest component fit.",
      result: components[0] ?? null,
    };
  }

  if (docs.length > 0) {
    return {
      tool: "search_salt_docs",
      why: "No strong component, token, or pattern match was found, so start with the closest docs result.",
      result: docs[0] ?? null,
    };
  }

  return null;
}

function getFoundationNextStep(
  foundation: Record<string, unknown> | undefined,
): string {
  const title =
    typeof foundation?.title === "string"
      ? foundation.title.toLowerCase()
      : "suggested foundation";

  return `Apply the ${title} guidance to the current layout or component.`;
}

function getDiscoverySuggestedFollowUps(input: {
  bestStart: DiscoverSaltResult["best_start"];
  foundationLookup: ReturnType<typeof getFoundation>;
  recipeResult: ReturnType<typeof getCompositionRecipe>;
  componentResult: ReturnType<typeof recommendComponent>;
  query: string;
  foundations: Array<Record<string, unknown>>;
  docs: Array<Record<string, unknown>>;
}): SuggestedFollowUp[] | undefined {
  const {
    bestStart,
    foundationLookup,
    recipeResult,
    componentResult,
    query,
    foundations,
    docs,
  } = input;

  if (bestStart?.tool === "get_foundation") {
    if (foundationLookup.suggested_follow_ups) {
      return foundationLookup.suggested_follow_ups;
    }

    if (typeof foundations[0]?.title === "string") {
      return getFoundationSuggestedFollowUpsByTitle(foundations[0].title);
    }

    return undefined;
  }

  if (bestStart?.tool === "get_composition_recipe") {
    return recipeResult.suggested_follow_ups;
  }

  if (bestStart?.tool === "recommend_component") {
    return componentResult.suggested_follow_ups;
  }

  if (bestStart?.tool === "recommend_tokens") {
    return [
      {
        tool: "search_salt_docs",
        reason: "Review nearby token docs and examples after choosing a token.",
        args: {
          query,
          area: "tokens",
          top_k: 5,
        },
      },
    ];
  }

  if (docs[0]) {
    return [
      {
        tool: "search_salt_docs",
        reason: "Inspect the nearest docs results before narrowing further.",
        args: {
          query,
          top_k: 5,
        },
      },
    ];
  }

  return undefined;
}

function hasStatusFlag(item: Record<string, unknown>): boolean {
  return typeof item.status === "string" && item.status !== "stable";
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
  recipeScore: number;
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
    input.components.some(hasStatusFlag)
  ) {
    questions.push({
      id: "stable-only",
      question: "Do you need production-ready stable components only?",
      why: "Some close matches may be lab or otherwise not ideal for shipping.",
      options: ["Stable only", "Stable preferred", "Open to lab"],
    });
  }

  const strongSignals = [
    input.foundationScore > 0,
    input.tokenScore > 0,
    input.recipeScore > 0,
  ].filter(Boolean).length;
  const scores = [input.foundationScore, input.tokenScore, input.recipeScore]
    .filter((score) => score > 0)
    .sort((left, right) => right - left);

  if (strongSignals > 1 && scores.length > 1 && scores[0] - scores[1] <= 1) {
    questions.push({
      id: "guidance-vs-implementation",
      question:
        "Do you want design guidance, a starter implementation, or both?",
      why: "The query is pulling equally toward foundations and implementation help.",
      options: ["Design guidance", "Starter implementation", "Both"],
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
      why: "That can remove candidates that have weaker a11y documentation.",
      options: ["Required", "Preferred", "Not a filter"],
    });
  }

  return questions.slice(0, 3);
}

export function discoverSalt(
  registry: SaltRegistry,
  input: DiscoverSaltInput,
): DiscoverSaltResult {
  const query = normalizeQuery(input.query);
  const topK = Math.max(1, Math.min(input.top_k ?? 5, 10));
  const view = input.view ?? "compact";
  const recommendationView = view === "full" ? "full" : "compact";

  const componentResult = recommendComponent(registry, {
    task: input.query,
    package: input.package,
    status: input.status,
    top_k: topK,
    production_ready: input.production_ready,
    prefer_stable: input.prefer_stable,
    a11y_required: input.a11y_required,
    form_field_support: input.form_field_support,
    include_starter_code: input.include_starter_code,
    view: recommendationView,
  });
  const recipeResult = getCompositionRecipe(registry, {
    query: input.query,
    top_k: Math.min(topK, 3),
    production_ready: input.production_ready,
    prefer_stable: input.prefer_stable,
    a11y_required: input.a11y_required,
    form_field_support: input.form_field_support,
    include_starter_code: input.include_starter_code,
    view: recommendationView,
  });
  const foundationLookup = getFoundation(registry, {
    name: input.query,
    include_starter_code: input.include_starter_code,
    view: recommendationView,
  });
  const foundationList = listFoundations(registry, {
    query: input.query,
    max_results: topK,
  });
  const tokenResult = recommendTokens(registry, {
    query: input.query,
    top_k: topK,
    view: recommendationView,
  });
  const docsResult = searchSaltDocs(registry, {
    query: input.query,
    package: input.package,
    status: input.status,
    top_k: topK,
  });

  const components = toCompactComponentOptions(componentResult);
  const recipes = toCompactRecipeOptions(recipeResult);
  const primaryFoundation = toCompactFoundationOption(
    foundationLookup.foundation,
  );
  const foundations = primaryFoundation
    ? [primaryFoundation]
    : foundationList.foundations;
  const tokens = toCompactTokenOptions(tokenResult);
  const docs = toCompactDocs(docsResult.results);

  const foundationScore =
    scoreIntent(query, FOUNDATION_KEYWORDS) +
    (foundationLookup.foundation ? 4 : 0);
  const tokenScore = scoreIntent(query, TOKEN_KEYWORDS);
  const recipeScore = scoreIntent(query, RECIPE_KEYWORDS);

  const bestStart = chooseBestStart({
    foundationScore,
    tokenScore,
    recipeScore,
    foundations,
    tokens,
    recipes,
    components,
    docs,
  });
  const clarifyingQuestions = getClarifyingQuestions({
    query,
    production_ready: input.production_ready,
    prefer_stable: input.prefer_stable,
    a11y_required: input.a11y_required,
    form_field_support: input.form_field_support,
    components,
    foundationScore,
    tokenScore,
    recipeScore,
  });

  const result: DiscoverSaltResult = {
    query: input.query,
    best_start: bestStart,
    options: {
      components,
      recipes,
      foundations,
      tokens,
      docs,
    },
    clarifying_questions:
      clarifyingQuestions.length > 0 ? clarifyingQuestions : undefined,
    starter_code:
      input.include_starter_code && bestStart?.tool === "get_foundation"
        ? foundationLookup.starter_code
        : input.include_starter_code &&
            bestStart?.tool === "get_composition_recipe"
          ? recipeResult.starter_code
          : input.include_starter_code &&
              bestStart?.tool === "recommend_component"
            ? componentResult.starter_code
            : undefined,
    suggested_follow_ups: getDiscoverySuggestedFollowUps({
      bestStart,
      foundationLookup,
      recipeResult,
      componentResult,
      query: input.query,
      foundations,
      docs,
    }),
    next_step:
      bestStart?.tool === "get_foundation"
        ? (foundationLookup.next_step ?? getFoundationNextStep(foundations[0]))
        : bestStart?.tool === "recommend_tokens"
          ? tokenResult.next_step
          : bestStart?.tool === "get_composition_recipe"
            ? recipeResult.next_step
            : bestStart?.tool === "recommend_component"
              ? componentResult.next_step
              : docs[0]
                ? "Open the closest docs result and follow the referenced guidance."
                : "Try a more specific Salt query.",
  };

  if (view === "full") {
    result.signals = {
      foundations: foundationScore,
      tokens: tokenScore,
      recipes: recipeScore,
    };
    result.raw = {
      foundation_lookup: foundationLookup,
      foundation_list: foundationList,
      component_recommendations: componentResult,
      composition_recipes: recipeResult,
      token_recommendations: tokenResult,
      docs_results: docsResult,
    };
  }

  return result;
}
