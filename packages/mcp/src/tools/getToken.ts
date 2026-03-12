import type { SaltRegistry, TokenRecord } from "../types.js";

const TOKEN_DOCS_SOURCE_URL = "/salt/themes/design-tokens/index";

export interface GetTokenInput {
  name?: string;
  category?: string;
  semantic_intent?: string;
  semantic_intent_match?: "exact" | "contains";
  include_deprecated?: boolean;
  max_results?: number;
}

export interface GetTokenResult {
  tokens: Array<Record<string, unknown>>;
  total_matches: number;
  truncated: boolean;
  source_url: string;
}

function toCompactToken(token: TokenRecord): Record<string, unknown> {
  return {
    name: token.name,
    category: token.category,
    semantic_intent: token.semantic_intent,
    guidance: token.guidance,
    themes: token.themes,
    deprecated: token.deprecated,
  };
}

export function getToken(
  registry: SaltRegistry,
  input: GetTokenInput,
): GetTokenResult {
  const includeDeprecated = input.include_deprecated ?? false;
  const maxResults = Math.max(1, Math.min(input.max_results ?? 100, 500));
  const name = input.name?.trim().toLowerCase();
  const category = input.category?.trim().toLowerCase();
  const semanticIntent = input.semantic_intent?.trim().toLowerCase();
  const semanticIntentMatch = input.semantic_intent_match ?? "exact";

  const matchedTokens = registry.tokens
    .filter((token) => (includeDeprecated ? true : !token.deprecated))
    .filter((token) => (name ? token.name.toLowerCase() === name : true))
    .filter((token) =>
      category ? token.category.toLowerCase() === category : true,
    )
    .filter((token) =>
      semanticIntent
        ? semanticIntentMatch === "contains"
          ? (token.semantic_intent ?? "").toLowerCase().includes(semanticIntent)
          : (token.semantic_intent ?? "").toLowerCase() === semanticIntent
        : true,
    );

  const tokens = matchedTokens.slice(0, maxResults);

  return {
    tokens: tokens.map(toCompactToken),
    total_matches: matchedTokens.length,
    truncated: matchedTokens.length > maxResults,
    source_url: TOKEN_DOCS_SOURCE_URL,
  };
}
