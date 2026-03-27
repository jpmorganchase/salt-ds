import type { CountrySymbolRecord, SaltRegistry } from "../types.js";
import {
  getCountrySymbolSearchTerms,
  scoreCountrySymbol,
  toCountrySymbolMatchKey,
} from "./countrySymbolSearch.js";
import { projectLookupRecord, resolveLookup } from "./lookupResolver.js";

export interface GetCountrySymbolInput {
  name: string;
  view?: "compact" | "full";
}

export interface GetCountrySymbolResult {
  country_symbol: Record<string, unknown> | null;
  ambiguity?: {
    query: string;
    matched_by: "name" | "alias" | "fuzzy";
    matches: Array<{
      code: string;
      name: string;
      status: CountrySymbolRecord["status"];
    }>;
  };
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

function matchesCanonicalCountrySymbol(
  countrySymbol: CountrySymbolRecord,
  queryKey: string,
): boolean {
  return [countrySymbol.code, countrySymbol.name].some(
    (candidate) => toCountrySymbolMatchKey(candidate) === queryKey,
  );
}

function matchesCountrySymbolAlias(
  countrySymbol: CountrySymbolRecord,
  queryKey: string,
): boolean {
  return getCountrySymbolSearchTerms(countrySymbol).some(
    (candidate) => toCountrySymbolMatchKey(candidate) === queryKey,
  );
}

function toAmbiguityMatch(countrySymbol: CountrySymbolRecord) {
  return {
    code: countrySymbol.code,
    name: countrySymbol.name,
    status: countrySymbol.status,
  };
}

export function getCountrySymbol(
  registry: SaltRegistry,
  input: GetCountrySymbolInput,
): GetCountrySymbolResult {
  const queryKey = toCountrySymbolMatchKey(input.name);
  const nameMatches = registry.country_symbols.filter((countrySymbol) =>
    matchesCanonicalCountrySymbol(countrySymbol, queryKey),
  );
  const aliasMatches = registry.country_symbols.filter((countrySymbol) =>
    matchesCountrySymbolAlias(countrySymbol, queryKey),
  );
  const resolution = resolveLookup(input.name, [
    {
      matchedBy: "name",
      matches: nameMatches,
      toAmbiguityMatch,
    },
    {
      matchedBy: "alias",
      matches: aliasMatches,
      ambiguityWhen: "if_unresolved",
      toAmbiguityMatch,
    },
  ]);

  if (resolution.ambiguity) {
    return {
      country_symbol: null,
      ambiguity: resolution.ambiguity,
    };
  }

  if (resolution.candidate) {
    return {
      country_symbol: projectLookupRecord(resolution.candidate, input.view, {
        toCompact: toCompactCountrySymbol,
      }),
    };
  }

  const fuzzyCandidates = registry.country_symbols
    .map((countrySymbol) => ({
      countrySymbol,
      score: scoreCountrySymbol(countrySymbol, input.name),
    }))
    .filter((candidate) => candidate.score > 0)
    .sort((left, right) => {
      if (left.score !== right.score) {
        return right.score - left.score;
      }
      return left.countrySymbol.name.localeCompare(right.countrySymbol.name);
    });
  const topScore = fuzzyCandidates[0]?.score ?? 0;

  if (topScore < 8) {
    return { country_symbol: null };
  }

  const topMatches = fuzzyCandidates
    .filter((candidate) => candidate.score === topScore)
    .map((candidate) => candidate.countrySymbol);

  if (topMatches.length > 1) {
    return {
      country_symbol: null,
      ambiguity: {
        query: input.name,
        matched_by: "fuzzy",
        matches: topMatches.map(toAmbiguityMatch),
      },
    };
  }

  const [countrySymbol] = topMatches;
  if (!countrySymbol) {
    return { country_symbol: null };
  }

  return {
    country_symbol: projectLookupRecord(countrySymbol, input.view, {
      toCompact: toCompactCountrySymbol,
    }),
  };
}
