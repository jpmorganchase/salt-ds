import { getRegistryIndexes } from "../registry/runtimeCache.js";
import type {
  SaltRegistry,
  SaltStatus,
  SearchArea,
  SearchIndexEntry,
} from "../types.js";
import { isSearchEntryAllowedByDocsPolicy } from "./utils.js";

export interface SearchEntryFilterInput {
  area?: SearchArea;
  package?: string;
  status?: SaltStatus;
  exclude_types?: SearchIndexEntry["type"][];
}

export function areaIncludes(
  area: SearchArea,
  entryType: SearchIndexEntry["type"],
): boolean {
  if (area === "all") {
    return true;
  }
  if (area === "packages") {
    return entryType === "package";
  }
  if (area === "components") {
    return entryType === "component";
  }
  if (area === "icons") {
    return entryType === "icon";
  }
  if (area === "country_symbols") {
    return entryType === "country_symbol";
  }
  if (area === "pages") {
    return entryType === "page";
  }
  if (area === "foundations") {
    return entryType === "page";
  }
  if (area === "patterns") {
    return entryType === "pattern";
  }
  if (area === "guides") {
    return entryType === "guide";
  }
  if (area === "tokens") {
    return entryType === "token";
  }
  if (area === "examples") {
    return entryType === "example";
  }
  if (area === "changes") {
    return entryType === "change";
  }
  return true;
}

export function createEmptyCounts(): Record<SearchIndexEntry["type"], number> {
  return {
    package: 0,
    component: 0,
    icon: 0,
    country_symbol: 0,
    page: 0,
    pattern: 0,
    guide: 0,
    token: 0,
    example: 0,
    change: 0,
  };
}

export function filterSearchEntries(
  registry: SaltRegistry,
  input: SearchEntryFilterInput,
): SearchIndexEntry[] {
  const area = input.area ?? "all";
  const excludedTypes = new Set(input.exclude_types ?? []);
  const { pageById } = getRegistryIndexes(registry);

  return registry.search_index
    .filter((entry) => areaIncludes(area, entry.type))
    .filter((entry) =>
      area === "foundations"
        ? entry.type === "page" &&
          (pageById.get(entry.id)?.page_kind ?? null) === "foundation"
        : true,
    )
    .filter((entry) => !excludedTypes.has(entry.type))
    .filter((entry) => isSearchEntryAllowedByDocsPolicy(registry, entry))
    .filter((entry) => (input.package ? entry.package === input.package : true))
    .filter((entry) => (input.status ? entry.status === input.status : true));
}
