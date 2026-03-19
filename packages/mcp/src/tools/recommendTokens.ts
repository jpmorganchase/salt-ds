import type { SaltRegistry } from "../types.js";
import { getTokenQueryFields, scoreQueryFields } from "./consumerSignals.js";
import { normalizeQuery } from "./utils.js";

const TOKEN_DOCS_SOURCE_URL = "/salt/themes/design-tokens/index";

export interface RecommendTokensInput {
  query: string;
  category?: string;
  component_name?: string;
  theme?: string;
  density?: string;
  include_deprecated?: boolean;
  top_k?: number;
  view?: "compact" | "full";
}

export interface RecommendTokensResult {
  source_url: string;
  recommended?: Record<string, unknown> | null;
  alternatives?: Array<Record<string, unknown>>;
  recommendations?: Array<Record<string, unknown>>;
  next_step?: string;
}

function toCompactTokenRecommendation(candidate: {
  token: SaltRegistry["tokens"][number];
}): Record<string, unknown> {
  return {
    name: candidate.token.name,
    category: candidate.token.category,
    semantic_intent: candidate.token.semantic_intent,
    why:
      candidate.token.guidance[0] ??
      candidate.token.semantic_intent ??
      "Matches the requested styling need.",
    applies_to: candidate.token.applies_to,
    docs: [TOKEN_DOCS_SOURCE_URL],
    ...(candidate.token.deprecated ? { status: "deprecated" } : {}),
  };
}

function getTokenNextStep(
  candidate: { token: SaltRegistry["tokens"][number] } | undefined,
): string {
  if (candidate) {
    return `Apply ${candidate.token.name} and verify it fits the relevant theme and density.`;
  }

  return "Broaden the styling description or remove one of the filters.";
}

export function recommendTokens(
  registry: SaltRegistry,
  input: RecommendTokensInput,
): RecommendTokensResult {
  const query = normalizeQuery(input.query);
  const category = normalizeQuery(input.category ?? "");
  const componentName = normalizeQuery(input.component_name ?? "");
  const theme = normalizeQuery(input.theme ?? "");
  const density = normalizeQuery(input.density ?? "");
  const topK = Math.max(1, Math.min(input.top_k ?? 10, 50));
  const includeDeprecated = input.include_deprecated ?? false;
  const view = input.view ?? "compact";

  const rankedCandidates = registry.tokens
    .filter((token) => (includeDeprecated ? true : !token.deprecated))
    .filter((token) =>
      category ? token.category.toLowerCase().includes(category) : true,
    )
    .filter((token) =>
      componentName
        ? token.applies_to.some((value) =>
            value.toLowerCase().includes(componentName),
          )
        : true,
    )
    .filter((token) =>
      theme
        ? token.themes.some((value) => value.toLowerCase() === theme)
        : true,
    )
    .filter((token) =>
      density
        ? token.densities.some((value) => value.toLowerCase() === density)
        : true,
    )
    .map((token) => ({
      token,
      ...scoreQueryFields(query, getTokenQueryFields(token)),
    }))
    .filter((candidate) => candidate.score > 0)
    .sort((left, right) => {
      if (left.score !== right.score) {
        return right.score - left.score;
      }
      return left.token.name.localeCompare(right.token.name);
    })
    .slice(0, topK);

  const recommendations = rankedCandidates.map((candidate) => ({
    token: {
      name: candidate.token.name,
      category: candidate.token.category,
      semantic_intent: candidate.token.semantic_intent,
      themes: candidate.token.themes,
      densities: candidate.token.densities,
      applies_to: candidate.token.applies_to,
      guidance: candidate.token.guidance,
      deprecated: candidate.token.deprecated,
    },
    score: candidate.score,
    matched_terms: candidate.matched_terms,
    match_reasons: candidate.match_reasons,
  }));

  if (view === "full") {
    return {
      source_url: TOKEN_DOCS_SOURCE_URL,
      recommendations,
      next_step: getTokenNextStep(rankedCandidates[0]),
    };
  }

  const [recommended, ...alternatives] = rankedCandidates;

  return {
    source_url: TOKEN_DOCS_SOURCE_URL,
    recommended: recommended ? toCompactTokenRecommendation(recommended) : null,
    alternatives: alternatives.map((candidate) =>
      toCompactTokenRecommendation(candidate),
    ),
    next_step: getTokenNextStep(recommended),
  };
}
