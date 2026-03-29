import type { CountrySymbolRecord, SaltRegistry } from "../types.js";
import { scoreCountrySymbol } from "./countrySymbolSearch.js";
import { normalizeQuery } from "./utils.js";

export interface GetCountrySymbolsInput {
  query?: string;
  status?: CountrySymbolRecord["status"];
  max_results?: number;
}

export interface GetCountrySymbolsResult {
  country_symbols: Array<Record<string, unknown>>;
}

function toCompactCountrySymbol(
  countrySymbol: CountrySymbolRecord,
): Record<string, unknown> {
  return {
    id: countrySymbol.id,
    code: countrySymbol.code,
    name: countrySymbol.name,
    package: countrySymbol.package.name,
    status: countrySymbol.status,
    summary: countrySymbol.summary,
    aliases: countrySymbol.aliases,
    variants: countrySymbol.variants,
    related_docs: countrySymbol.related_docs,
  };
}

export function getCountrySymbols(
  registry: SaltRegistry,
  input: GetCountrySymbolsInput,
): GetCountrySymbolsResult {
  const query = normalizeQuery(input.query ?? "");
  const maxResults = Math.max(1, Math.min(input.max_results ?? 50, 500));

  const country_symbols = registry.country_symbols
    .filter((countrySymbol) =>
      input.status ? countrySymbol.status === input.status : true,
    )
    .map((countrySymbol) => ({
      countrySymbol,
      score: scoreCountrySymbol(countrySymbol, query),
    }))
    .filter((candidate) => candidate.score > 0 || query.length === 0)
    .sort((left, right) => {
      if (left.score !== right.score) {
        return right.score - left.score;
      }
      return left.countrySymbol.name.localeCompare(right.countrySymbol.name);
    })
    .slice(0, maxResults)
    .map(({ countrySymbol }) => toCompactCountrySymbol(countrySymbol));

  return { country_symbols };
}
