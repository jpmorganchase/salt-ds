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
export declare function normalizeRegistryLookupKey(value: string): string;
export declare function createComponentPackageKey(
  packageName: string,
  componentName: string,
): string;
export declare function getRegistryIndexes(
  registry: SaltRegistry,
): RegistryIndexes;
export declare function setSerializedPageSearchIndex(
  registry: SaltRegistry,
  serializedIndex: SerializedPageSearchIndex | null | undefined,
): void;
export declare function getSerializedPageSearchIndex(
  registry: SaltRegistry,
): SerializedPageSearchIndex | null;
export declare function getCachedPageSearchIndex(
  registry: SaltRegistry,
): MiniSearch<PageSearchDocument> | null;
export declare function setCachedPageSearchIndex(
  registry: SaltRegistry,
  index: MiniSearch<PageSearchDocument>,
): void;
