import type { SerializedPageSearchIndex } from "../search/pageSearchIndex.js";
import type { RegistryBuildInfo, SaltRegistry } from "../types.js";
export declare const REGISTRY_ARRAY_ARTIFACTS: readonly [
  {
    readonly file_name: "packages.json";
    readonly key: "packages";
  },
  {
    readonly file_name: "components.json";
    readonly key: "components";
  },
  {
    readonly file_name: "icons.json";
    readonly key: "icons";
  },
  {
    readonly file_name: "country-symbols.json";
    readonly key: "country_symbols";
  },
  {
    readonly file_name: "pages.json";
    readonly key: "pages";
  },
  {
    readonly file_name: "patterns.json";
    readonly key: "patterns";
  },
  {
    readonly file_name: "guides.json";
    readonly key: "guides";
  },
  {
    readonly file_name: "tokens.json";
    readonly key: "tokens";
  },
  {
    readonly file_name: "deprecations.json";
    readonly key: "deprecations";
  },
  {
    readonly file_name: "examples.json";
    readonly key: "examples";
  },
  {
    readonly file_name: "changes.json";
    readonly key: "changes";
  },
];
export type RegistryArrayArtifactKey =
  (typeof REGISTRY_ARRAY_ARTIFACTS)[number]["key"];
export interface RegistryArrayArtifactDefinition<
  Key extends RegistryArrayArtifactKey = RegistryArrayArtifactKey,
> {
  file_name: `${string}.json`;
  key: Key;
}
export type RegistryArrayCollections = Pick<
  SaltRegistry,
  RegistryArrayArtifactKey
>;
export declare const REGISTRY_METADATA_ARTIFACT: {
  readonly file_name: "metadata.json";
  readonly key: "build_info";
};
export declare const REGISTRY_PAGE_SEARCH_INDEX_ARTIFACT: {
  readonly file_name: "page-search-index.json";
  readonly key: "page_search_index";
};
export declare const REGISTRY_SEARCH_INDEX_ARTIFACT: {
  readonly file_name: "search-index.jsonl";
};
export interface MetadataArtifact {
  generated_at: string;
  version: string;
  [REGISTRY_METADATA_ARTIFACT.key]?: RegistryBuildInfo | null;
}
export interface PageSearchIndexArtifact {
  generated_at: string;
  version: string;
  [REGISTRY_PAGE_SEARCH_INDEX_ARTIFACT.key]?: SerializedPageSearchIndex | null;
}
export declare function readJsonFile<T>(filePath: string): Promise<T>;
export declare function writeJsonFile(
  filePath: string,
  data: unknown,
): Promise<void>;
export declare function serializeJsonLines(values: readonly unknown[]): string;
