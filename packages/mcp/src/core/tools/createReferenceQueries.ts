import { normalizeQuery } from "./utils.js";

const CREATE_INSTRUCTION_PREFIX_PATTERNS = [
  /^(?:please\s+)?(?:can\s+you\s+)?(?:help\s+me\s+)?(?:create|build|make|design|generate|show)\s+(?:me\s+)?(?:a|an|the)\s+/i,
  /^(?:please\s+)?(?:can\s+you\s+)?(?:help\s+me\s+)?(?:create|build|make|design|generate|show)\s+/i,
] as const;
const SINGLE_TOKEN_REFERENCE_PREFIXES = new Set([
  "a",
  "an",
  "and",
  "as",
  "data",
  "display",
  "featuring",
  "feature",
  "for",
  "has",
  "have",
  "include",
  "including",
  "plus",
  "render",
  "show",
  "the",
  "use",
  "using",
  "with",
]);
const SINGLE_TOKEN_REFERENCE_SUFFIXES = new Set([
  "component",
  "components",
  "control",
  "controls",
  "element",
  "elements",
  "layout",
  "layouts",
  "pattern",
  "patterns",
  "surface",
  "surfaces",
  "ui",
]);

function toNormalizedPhraseTokens(value: string | string[]): string[] {
  if (Array.isArray(value)) {
    return value
      .map((token) => normalizeQuery(token))
      .flatMap((token) => token.split(/\s+/))
      .filter(Boolean);
  }

  const normalized = normalizeQuery(value);
  return normalized ? normalized.split(/\s+/).filter(Boolean) : [];
}

function normalizePhraseToken(token: string): string {
  if (token.endsWith("ies") && token.length > 4) {
    return `${token.slice(0, -3)}y`;
  }

  if (
    token.endsWith("es") &&
    token.length > 4 &&
    /(ches|shes|sses|xes|zes)$/.test(token)
  ) {
    return token.slice(0, -2);
  }

  if (token.endsWith("s") && token.length > 3 && !token.endsWith("ss")) {
    return token.slice(0, -1);
  }

  return token;
}

export function getCreateReferenceQueries(query: string): string[] {
  const baseQuery = query.trim();
  if (!baseQuery) {
    return [];
  }

  const variants = new Set<string>([baseQuery]);
  let stripped = baseQuery;

  for (const pattern of CREATE_INSTRUCTION_PREFIX_PATTERNS) {
    stripped = stripped.replace(pattern, "").trim();
  }

  if (stripped && stripped !== baseQuery) {
    variants.add(stripped);
  }

  return [...variants];
}

export function containsExactTokenPhrase(
  haystack: string | string[],
  needle: string | string[],
): boolean {
  const haystackTokens =
    toNormalizedPhraseTokens(haystack).map(normalizePhraseToken);
  const needleTokens =
    toNormalizedPhraseTokens(needle).map(normalizePhraseToken);

  if (
    needleTokens.length === 0 ||
    needleTokens.length > haystackTokens.length
  ) {
    return false;
  }

  for (
    let startIndex = 0;
    startIndex <= haystackTokens.length - needleTokens.length;
    startIndex += 1
  ) {
    if (
      needleTokens.every(
        (token, tokenIndex) =>
          haystackTokens[startIndex + tokenIndex] === token,
      )
    ) {
      return true;
    }
  }

  return false;
}

export function startsWithCreateReferencePhrase(
  query: string,
  target: string,
): boolean {
  const targetTokens =
    toNormalizedPhraseTokens(target).map(normalizePhraseToken);
  if (targetTokens.length === 0) {
    return false;
  }

  return getCreateReferenceQueries(query).some((queryVariant) => {
    const queryTokens =
      toNormalizedPhraseTokens(queryVariant).map(normalizePhraseToken);
    if (queryTokens.length < targetTokens.length) {
      return false;
    }

    return targetTokens.every(
      (token, tokenIndex) => queryTokens[tokenIndex] === token,
    );
  });
}

export function containsExplicitCreateReferencePhrase(
  query: string,
  target: string | string[],
): boolean {
  const targetTokens =
    toNormalizedPhraseTokens(target).map(normalizePhraseToken);
  if (targetTokens.length === 0) {
    return false;
  }

  return getCreateReferenceQueries(query).some((queryVariant) => {
    const queryTokens =
      toNormalizedPhraseTokens(queryVariant).map(normalizePhraseToken);
    if (queryTokens.length < targetTokens.length) {
      return false;
    }

    for (
      let startIndex = 0;
      startIndex <= queryTokens.length - targetTokens.length;
      startIndex += 1
    ) {
      const matches = targetTokens.every(
        (token, tokenIndex) => queryTokens[startIndex + tokenIndex] === token,
      );
      if (!matches) {
        continue;
      }

      if (
        targetTokens.length > 1 ||
        queryTokens.length === targetTokens.length
      ) {
        return true;
      }

      const previousToken = queryTokens[startIndex - 1] ?? null;
      const nextToken = queryTokens[startIndex + targetTokens.length] ?? null;
      if (
        startIndex === 0 ||
        (previousToken && SINGLE_TOKEN_REFERENCE_PREFIXES.has(previousToken)) ||
        (nextToken && SINGLE_TOKEN_REFERENCE_SUFFIXES.has(nextToken))
      ) {
        return true;
      }
    }

    return false;
  });
}
