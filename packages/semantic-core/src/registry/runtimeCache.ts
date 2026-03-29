import type MiniSearch from "minisearch";
import type {
  PageSearchDocument,
  SerializedPageSearchIndex,
} from "../search/pageSearchIndex.js";
import type {
  ChangeRecord,
  ComponentRecord,
  DeprecationRecord,
  ExampleRecord,
  GuideRecord,
  PackageRecord,
  PageRecord,
  SaltRegistry,
  SearchIndexEntry,
} from "../types.js";

export interface RegistryIndexes {
  packagesByNormalizedName: Map<string, PackageRecord>;
  componentsByNormalizedName: Map<string, ComponentRecord[]>;
  componentsByNormalizedAlias: Map<string, ComponentRecord[]>;
  componentById: Map<string, ComponentRecord>;
  componentByPackageAndName: Map<string, ComponentRecord>;
  deprecationById: Map<string, DeprecationRecord>;
  exampleById: Map<string, ExampleRecord>;
  guideById: Map<string, GuideRecord>;
  pageById: Map<string, PageRecord>;
  changeById: Map<string, ChangeRecord>;
  changesByPackage: Map<string, ChangeRecord[]>;
  changesByComponentKey: Map<string, ChangeRecord[]>;
  searchEntryById: Map<string, SearchIndexEntry>;
}

const REGISTRY_INDEX_CACHE = new WeakMap<SaltRegistry, RegistryIndexes>();
const SERIALIZED_PAGE_SEARCH_INDEX_CACHE = new WeakMap<
  SaltRegistry,
  SerializedPageSearchIndex
>();
const PAGE_SEARCH_INDEX_CACHE = new WeakMap<
  SaltRegistry,
  MiniSearch<PageSearchDocument>
>();

export function normalizeRegistryLookupKey(value: string): string {
  return value.trim().toLowerCase();
}

export function createComponentPackageKey(
  packageName: string,
  componentName: string,
): string {
  return `${normalizeRegistryLookupKey(packageName)}\u0000${normalizeRegistryLookupKey(componentName)}`;
}

function appendIndexedValue<T>(map: Map<string, T[]>, key: string, value: T) {
  const current = map.get(key);
  if (current) {
    if (!current.includes(value)) {
      current.push(value);
    }
    return;
  }

  map.set(key, [value]);
}

function buildRegistryIndexes(registry: SaltRegistry): RegistryIndexes {
  const packagesByNormalizedName = new Map(
    registry.packages.map((pkg) => [normalizeRegistryLookupKey(pkg.name), pkg]),
  );
  const componentsByNormalizedName = new Map<string, ComponentRecord[]>();
  const componentsByNormalizedAlias = new Map<string, ComponentRecord[]>();

  for (const component of registry.components) {
    appendIndexedValue(
      componentsByNormalizedName,
      normalizeRegistryLookupKey(component.name),
      component,
    );
    for (const alias of component.aliases) {
      appendIndexedValue(
        componentsByNormalizedAlias,
        normalizeRegistryLookupKey(alias),
        component,
      );
    }
  }

  const changesByPackage = new Map<string, ChangeRecord[]>();
  const changesByComponentKey = new Map<string, ChangeRecord[]>();
  for (const change of registry.changes) {
    appendIndexedValue(
      changesByPackage,
      normalizeRegistryLookupKey(change.package),
      change,
    );
    if (change.target_type === "component") {
      appendIndexedValue(
        changesByComponentKey,
        createComponentPackageKey(change.package, change.target_name),
        change,
      );
    }
  }

  return {
    packagesByNormalizedName,
    componentsByNormalizedName,
    componentsByNormalizedAlias,
    componentById: new Map(
      registry.components.map((component) => [component.id, component]),
    ),
    componentByPackageAndName: new Map(
      registry.components.map((component) => [
        createComponentPackageKey(component.package.name, component.name),
        component,
      ]),
    ),
    deprecationById: new Map(
      registry.deprecations.map((deprecation) => [deprecation.id, deprecation]),
    ),
    exampleById: new Map(
      registry.examples.map((example) => [example.id, example]),
    ),
    guideById: new Map(registry.guides.map((guide) => [guide.id, guide])),
    pageById: new Map(registry.pages.map((page) => [page.id, page])),
    changeById: new Map(registry.changes.map((change) => [change.id, change])),
    changesByPackage,
    changesByComponentKey,
    searchEntryById: new Map(
      registry.search_index.map((entry) => [entry.id, entry]),
    ),
  };
}

export function getRegistryIndexes(registry: SaltRegistry): RegistryIndexes {
  const cachedIndexes = REGISTRY_INDEX_CACHE.get(registry);
  if (cachedIndexes) {
    return cachedIndexes;
  }

  const indexes = buildRegistryIndexes(registry);
  REGISTRY_INDEX_CACHE.set(registry, indexes);
  return indexes;
}

export function setSerializedPageSearchIndex(
  registry: SaltRegistry,
  serializedIndex: SerializedPageSearchIndex | null | undefined,
): void {
  if (serializedIndex) {
    SERIALIZED_PAGE_SEARCH_INDEX_CACHE.set(registry, serializedIndex);
  } else {
    SERIALIZED_PAGE_SEARCH_INDEX_CACHE.delete(registry);
  }
}

export function getSerializedPageSearchIndex(
  registry: SaltRegistry,
): SerializedPageSearchIndex | null {
  return SERIALIZED_PAGE_SEARCH_INDEX_CACHE.get(registry) ?? null;
}

export function getCachedPageSearchIndex(
  registry: SaltRegistry,
): MiniSearch<PageSearchDocument> | null {
  return PAGE_SEARCH_INDEX_CACHE.get(registry) ?? null;
}

export function setCachedPageSearchIndex(
  registry: SaltRegistry,
  index: MiniSearch<PageSearchDocument>,
): void {
  PAGE_SEARCH_INDEX_CACHE.set(registry, index);
}
