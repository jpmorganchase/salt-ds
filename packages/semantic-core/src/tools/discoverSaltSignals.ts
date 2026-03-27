import { tokenize } from "./utils.js";

export const FOUNDATION_DISCOVERY_KEYWORDS = [
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
] as const;

export const TOKEN_DISCOVERY_KEYWORDS = [
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
] as const;

export const RECIPE_DISCOVERY_KEYWORDS = [
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
] as const;

export interface DiscoveryPreferences {
  production_ready?: boolean;
  prefer_stable?: boolean;
  a11y_required?: boolean;
  form_field_support?: boolean;
  include_starter_code?: boolean;
}

export function scoreDiscoveryKeywordIntent(
  query: string,
  keywords: readonly string[],
): number {
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

export function inferDiscoveryPreferences(query: string): DiscoveryPreferences {
  return {
    production_ready: /\b(production|prod|ship|shipping|ready to ship)\b/.test(
      query,
    )
      ? true
      : undefined,
    prefer_stable: /\b(stable|supported|avoid lab|avoid beta)\b/.test(query)
      ? true
      : undefined,
    a11y_required: /\b(a11y|accessib|aria|keyboard|screen reader|wcag)\b/.test(
      query,
    )
      ? true
      : undefined,
    form_field_support:
      /\b(form ?field|validation|helper text|error state|field label)\b/.test(
        query,
      )
        ? true
        : undefined,
    include_starter_code:
      /\b(starter code|code example|starter|snippet|scaffold)\b/.test(query)
        ? true
        : undefined,
  };
}
