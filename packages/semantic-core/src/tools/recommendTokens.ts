import type { SaltRegistry } from "../types.js";
import { getTokenQueryFields, scoreQueryFields } from "./consumerSignals.js";
import { getTokenNextStep } from "./getToken.js";
import { containsWholeWordPhrase, normalizeQuery } from "./utils.js";

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
  source_url: string | null;
  recommended?: Record<string, unknown> | null;
  alternatives?: Array<Record<string, unknown>>;
  recommendations?: Array<Record<string, unknown>>;
  next_step?: string;
}

function getTokenDocs(token: SaltRegistry["tokens"][number]): string[] {
  return [...new Set(token.policy?.docs ?? [])];
}

function toCompactTokenRecommendation(candidate: {
  token: SaltRegistry["tokens"][number];
}): Record<string, unknown> {
  return {
    name: candidate.token.name,
    category: candidate.token.category,
    semantic_intent: candidate.token.semantic_intent,
    value: candidate.token.value,
    type: candidate.token.type,
    why:
      candidate.token.policy?.notes[0] ??
      candidate.token.guidance[0] ??
      candidate.token.semantic_intent ??
      "Matches the requested styling need.",
    applies_to: candidate.token.applies_to,
    ...(candidate.token.themes.length > 0
      ? { themes: candidate.token.themes }
      : {}),
    ...(candidate.token.densities.length > 0
      ? { densities: candidate.token.densities }
      : {}),
    docs: getTokenDocs(candidate.token),
    policy: candidate.token.policy ?? null,
    ...(candidate.token.deprecated ? { status: "deprecated" } : {}),
  };
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
      category
        ? containsWholeWordPhrase(token.category.toLowerCase(), category)
        : true,
    )
    .filter((token) =>
      componentName
        ? token.applies_to.some((value) =>
            containsWholeWordPhrase(value.toLowerCase(), componentName),
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
      docs: getTokenDocs(candidate.token),
      policy: candidate.token.policy ?? null,
      deprecated: candidate.token.deprecated,
    },
    score: candidate.score,
    matched_terms: candidate.matched_terms,
    match_reasons: candidate.match_reasons,
  }));

  if (view === "full") {
    return {
      source_url: rankedCandidates.flatMap((candidate) =>
        getTokenDocs(candidate.token),
      )[0] ?? null,
      recommendations,
      next_step: getTokenNextStep(rankedCandidates[0]?.token),
    };
  }

  const [recommended, ...alternatives] = rankedCandidates;

  return {
    source_url: rankedCandidates.flatMap((candidate) =>
      getTokenDocs(candidate.token),
    )[0] ?? null,
    recommended: recommended ? toCompactTokenRecommendation(recommended) : null,
    alternatives: alternatives.map((candidate) =>
      toCompactTokenRecommendation(candidate),
    ),
    next_step: getTokenNextStep(recommended?.token),
  };
}
