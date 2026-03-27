import type { CountrySymbolRecord } from "../types.js";
import { normalizeQuery, tokenize } from "./utils.js";

export function toCountrySymbolMatchKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

export function getCountrySymbolSearchTerms(
  countrySymbol: CountrySymbolRecord,
): string[] {
  return [
    countrySymbol.code,
    countrySymbol.name,
    countrySymbol.variants.circle.export_name,
    countrySymbol.variants.sharp.export_name,
    ...countrySymbol.aliases,
  ];
}

export function scoreCountrySymbol(
  countrySymbol: CountrySymbolRecord,
  inputQuery: string,
): number {
  const query = normalizeQuery(inputQuery);
  if (!query) {
    return 0;
  }

  const queryKey = toCountrySymbolMatchKey(query);
  const queryTokens = tokenize(query);
  const exactTerms = getCountrySymbolSearchTerms(countrySymbol).map((term) =>
    toCountrySymbolMatchKey(term),
  );
  const names = [
    countrySymbol.code,
    countrySymbol.name,
    countrySymbol.variants.circle.export_name,
    countrySymbol.variants.sharp.export_name,
  ].map((value) => value.toLowerCase());
  const aliases = countrySymbol.aliases.map((value) => value.toLowerCase());
  const summary = countrySymbol.summary.toLowerCase();

  let score = 0;

  if (exactTerms.some((term) => term === queryKey)) {
    score += 20;
  } else if (names.some((value) => value.includes(query))) {
    score += 8;
  } else if (aliases.some((value) => value.includes(query))) {
    score += 5;
  }

  if (summary.includes(query)) {
    score += 3;
  }

  for (const token of queryTokens) {
    if (names.some((value) => value.includes(token))) {
      score += 4;
    }
    if (aliases.some((value) => value.includes(token))) {
      score += 2;
    }
    if (summary.includes(token)) {
      score += 1;
    }
  }

  return score;
}
