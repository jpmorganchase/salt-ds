import type { SaltRegistry, TokenRecord } from "../types.js";
import { containsWholeWordPhrase } from "./utils.js";

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
  source_url: string | null;
}

function getTokenDocs(token: TokenRecord): string[] {
  return [...new Set(token.policy?.docs ?? [])];
}

function toCompactToken(token: TokenRecord): Record<string, unknown> {
  return {
    name: token.name,
    category: token.category,
    type: token.type,
    value: token.value,
    semantic_intent: token.semantic_intent,
    guidance: token.guidance,
    applies_to: token.applies_to,
    ...(token.aliases.length > 0 ? { aliases: token.aliases } : {}),
    docs: getTokenDocs(token),
    policy: token.policy ?? null,
    ...(token.policy_gap ? { policy_gap: token.policy_gap } : {}),
    themes: token.themes,
    ...(token.densities.length > 0 ? { densities: token.densities } : {}),
    deprecated: token.deprecated,
  };
}

export function getTokenNextStep(
  token: Pick<TokenRecord, "name" | "policy"> | undefined,
): string {
  if (!token) {
    return "Broaden the styling description or remove one of the filters.";
  }

  if (token.policy?.direct_component_use === "never") {
    return `Do not apply ${token.name} directly in component code; choose a semantic characteristic token instead.`;
  }

  if (token.policy?.direct_component_use === "conditional") {
    return `Use ${token.name} only when its low-level structural role matches the need, then verify it fits the relevant theme and density.`;
  }

  return `Apply ${token.name} and verify it fits the relevant theme and density.`;
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
          ? containsWholeWordPhrase(
              (token.semantic_intent ?? "").toLowerCase(),
              semanticIntent,
            )
          : (token.semantic_intent ?? "").toLowerCase() === semanticIntent
        : true,
    );

  const tokens = matchedTokens.slice(0, maxResults);
  const sourceUrl = tokens.flatMap(getTokenDocs)[0] ?? null;

  return {
    tokens: tokens.map(toCompactToken),
    total_matches: matchedTokens.length,
    truncated: matchedTokens.length > maxResults,
    source_url: sourceUrl,
  };
}
