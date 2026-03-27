import {
  createComponentPackageKey,
  getRegistryIndexes,
  normalizeRegistryLookupKey,
} from "../registry/runtimeCache.js";
import type {
  ComponentRecord,
  ExampleRecord,
  SaltRegistry,
  SearchIndexEntry,
} from "../types.js";

const SITE_COMPONENT_DOCS_PREFIX = "/salt/components/";

export function normalizeQuery(input: string): string {
  return input.trim().toLowerCase();
}

export function tokenize(input: string): string[] {
  return input
    .toLowerCase()
    .split(/[^a-z0-9-]+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 1);
}

export function unique<T>(values: T[]): T[] {
  return [...new Set(values)];
}

export function hasSiteComponentDocumentation(
  url: string | null | undefined,
): boolean {
  return typeof url === "string" && url.startsWith(SITE_COMPONENT_DOCS_PREFIX);
}

export function isComponentAllowedByDocsPolicy(
  component: Pick<ComponentRecord, "package" | "related_docs">,
): boolean {
  if (component.package.name !== "@salt-ds/lab") {
    return true;
  }

  return Object.values(component.related_docs).some(
    hasSiteComponentDocumentation,
  );
}

function findComponentForExample(
  registry: SaltRegistry,
  example: ExampleRecord,
): ComponentRecord | null {
  if (example.target_type !== "component") {
    return null;
  }

  const normalizedTargetName = normalizeRegistryLookupKey(example.target_name);
  const { componentsByNormalizedAlias, componentsByNormalizedName } =
    getRegistryIndexes(registry);

  return (
    componentsByNormalizedName.get(normalizedTargetName)?.[0] ??
    componentsByNormalizedAlias.get(normalizedTargetName)?.[0] ??
    null
  );
}

export function isExampleAllowedByDocsPolicy(
  registry: SaltRegistry,
  example: ExampleRecord,
): boolean {
  if (example.target_type !== "component") {
    return true;
  }

  const component = findComponentForExample(registry, example);
  if (component) {
    return isComponentAllowedByDocsPolicy(component);
  }

  if (example.package !== "@salt-ds/lab") {
    return true;
  }

  return hasSiteComponentDocumentation(example.source_url);
}

export function isSearchEntryAllowedByDocsPolicy(
  registry: SaltRegistry,
  entry: SearchIndexEntry,
): boolean {
  const { changeById, componentById, componentByPackageAndName, exampleById } =
    getRegistryIndexes(registry);

  if (entry.type === "component") {
    const component = componentById.get(entry.id) ?? null;

    if (component) {
      return isComponentAllowedByDocsPolicy(component);
    }

    if (entry.package !== "@salt-ds/lab") {
      return true;
    }

    return hasSiteComponentDocumentation(entry.source_url);
  }

  if (entry.type === "example") {
    const exampleId = entry.id.replace(/^example\./, "");
    const example = exampleById.get(exampleId) ?? null;

    if (example) {
      return isExampleAllowedByDocsPolicy(registry, example);
    }

    if (entry.package !== "@salt-ds/lab") {
      return true;
    }

    return hasSiteComponentDocumentation(entry.source_url);
  }

  if (entry.type === "change") {
    const change = changeById.get(entry.id) ?? null;
    if (!change) {
      return true;
    }

    if (change.target_type !== "component") {
      return true;
    }

    const component =
      componentByPackageAndName.get(
        createComponentPackageKey(change.package, change.target_name),
      ) ?? null;

    return component ? isComponentAllowedByDocsPolicy(component) : true;
  }

  return true;
}
