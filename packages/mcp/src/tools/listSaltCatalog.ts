import type {
  SaltRegistry,
  SaltStatus,
  SearchArea,
  SearchIndexEntry,
} from "../types.js";
import { createEmptyCounts, filterSearchEntries } from "./searchCommon.js";

export interface ListSaltCatalogInput {
  area?: SearchArea;
  package?: string;
  status?: SaltStatus;
  max_results?: number;
}

export interface ListSaltCatalogResult {
  total: number;
  truncated: boolean;
  counts: Record<SearchIndexEntry["type"], number>;
  items: Array<{
    id: string;
    type: SearchIndexEntry["type"];
    name: string;
    package: string | null;
    status: SaltStatus | null;
    summary: string;
    source_url: string | null;
  }>;
}

export function listSaltCatalog(
  registry: SaltRegistry,
  input: ListSaltCatalogInput,
): ListSaltCatalogResult {
  const maxResults = Math.max(1, Math.min(input.max_results ?? 50, 200));
  const filteredEntries = filterSearchEntries(registry, {
    area: input.area,
    package: input.package,
    status: input.status,
  }).sort((left, right) => {
    if (left.type !== right.type) {
      return left.type.localeCompare(right.type);
    }
    return left.name.localeCompare(right.name);
  });

  const counts = filteredEntries.reduce((acc, entry) => {
    acc[entry.type] += 1;
    return acc;
  }, createEmptyCounts());

  return {
    total: filteredEntries.length,
    truncated: filteredEntries.length > maxResults,
    counts,
    items: filteredEntries.slice(0, maxResults).map((entry) => ({
      id: entry.id,
      type: entry.type,
      name: entry.name,
      package: entry.package,
      status: entry.status,
      summary: entry.summary,
      source_url: entry.source_url,
    })),
  };
}
