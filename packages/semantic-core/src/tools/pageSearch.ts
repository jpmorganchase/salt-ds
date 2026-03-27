import {
  getCachedPageSearchIndex,
  getRegistryIndexes,
  getSerializedPageSearchIndex,
  setCachedPageSearchIndex,
} from "../registry/runtimeCache.js";
import {
  createPageSearchIndex,
  getPageSearchQueryOptions,
  loadSerializedPageSearchIndex,
} from "../search/pageSearchIndex.js";
import type { PageRecord, SaltRegistry } from "../types.js";
import { normalizeQuery, tokenize } from "./utils.js";

interface RawPageSearchResult {
  id: string;
  score: number;
  terms?: string[];
  queryTerms?: string[];
  match?: Record<string, string[]>;
}

export interface PageSearchResult {
  page: PageRecord;
  score: number;
  terms: string[];
  query_terms: string[];
  match: Record<string, string[]>;
}

function getPageSearchIndex(registry: SaltRegistry) {
  const cachedIndex = getCachedPageSearchIndex(registry);
  if (cachedIndex) {
    return cachedIndex;
  }

  const serializedIndex = getSerializedPageSearchIndex(registry);
  const index = serializedIndex
    ? loadSerializedPageSearchIndex(serializedIndex)
    : createPageSearchIndex(registry.pages);
  setCachedPageSearchIndex(registry, index);
  return index;
}

function normalizePageSearchQuery(query: string): string {
  const tokens = tokenize(query);
  if (tokens.length > 0) {
    return tokens.join(" ");
  }

  return normalizeQuery(query);
}

export function searchPages(
  registry: SaltRegistry,
  query: string,
  limit: number,
): PageSearchResult[] {
  const normalizedQuery = normalizePageSearchQuery(query);
  if (!normalizedQuery) {
    return [];
  }

  const index = getPageSearchIndex(registry);
  const rawResults = index.search(
    normalizedQuery,
    getPageSearchQueryOptions(),
  ) as Array<RawPageSearchResult>;
  const { pageById } = getRegistryIndexes(registry);

  return rawResults
    .map((result) => {
      const page = pageById.get(result.id) ?? null;
      if (!page) {
        return null;
      }

      return {
        page,
        score: result.score,
        terms: result.terms ?? [],
        query_terms: result.queryTerms ?? [],
        match: result.match ?? {},
      } satisfies PageSearchResult;
    })
    .filter((result): result is PageSearchResult => result !== null)
    .slice(0, limit);
}
