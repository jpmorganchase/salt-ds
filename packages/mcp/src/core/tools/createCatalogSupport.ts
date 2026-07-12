import type {
  ComponentRecord,
  CreateRetrievalEntityType,
  PatternRecord,
  RetrievalSignalsRecord,
  SaltRegistry,
  SaltStatus,
} from "../types.js";

export const SALT_CREATE_CATALOG_CONTRACT_VERSION =
  "salt_create_catalog_v1" as const;

export interface CreateCatalogSupportManifest {
  contract_version: typeof SALT_CREATE_CATALOG_CONTRACT_VERSION;
  entity_lookup_match_modes: Array<"canonical_name" | "alias" | "route_slug">;
}

export interface CreateCatalogEntitySummary {
  id: string;
  entity_type: CreateRetrievalEntityType;
  name: string;
  aliases: string[];
  route_slugs: string[];
  package: string | null;
  status: SaltStatus | null;
  categories: string[];
  summary: string;
  when_to_use: string[];
  when_not_to_use: string[];
  starter_available: boolean;
  supporting_surfaces: string[];
  related_entities: string[];
  retrieval_signals: RetrievalSignalsRecord | null;
  example_count: number;
  source_urls: string[];
}

export interface CreateCatalogEntityLookupResult {
  contract_version: typeof SALT_CREATE_CATALOG_CONTRACT_VERSION;
  query: string;
  status: "resolved" | "ambiguous" | "none";
  matches: CreateCatalogEntitySummary[];
}

type CreateCatalogEntityRecord =
  | {
      entity_type: "component";
      record: ComponentRecord;
    }
  | {
      entity_type: "pattern";
      record: PatternRecord;
    };

function uniqueSorted(values: Array<string | null | undefined>): string[] {
  return [...new Set(values.filter((value): value is string => Boolean(value)))]
    .map((value) => value.trim())
    .filter((value) => value.length > 0)
    .sort((left, right) => left.localeCompare(right));
}

function normalizeLookupKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function getRouteSlug(route: string | null | undefined): string | null {
  if (!route) {
    return null;
  }

  return route.split("/").filter(Boolean).at(-1) ?? null;
}

function getComponentLookupKeys(component: ComponentRecord): string[] {
  return uniqueSorted([
    component.name,
    ...component.aliases,
    ...(component.sub_components?.map((sub) => sub.export_name) ?? []),
  ]).map(normalizeLookupKey);
}

function getPatternLookupKeys(pattern: PatternRecord): string[] {
  return uniqueSorted([
    pattern.name,
    ...pattern.aliases,
    getRouteSlug(pattern.related_docs.overview),
  ]).map(normalizeLookupKey);
}

function summarizeComponent(
  component: ComponentRecord,
): CreateCatalogEntitySummary {
  return {
    id: component.id,
    entity_type: "component",
    name: component.name,
    aliases: uniqueSorted(component.aliases),
    route_slugs: [],
    package: component.package.name,
    status: component.status,
    categories: [...component.category],
    summary: component.summary,
    when_to_use: [...component.when_to_use],
    when_not_to_use: [...component.when_not_to_use],
    starter_available: true,
    supporting_surfaces: uniqueSorted([
      ...component.patterns,
      ...(component.sub_components?.map((sub) => sub.name) ?? []),
      ...(component.sub_components?.map((sub) => sub.export_name) ?? []),
    ]),
    related_entities: uniqueSorted([
      ...component.patterns,
      ...(component.sub_components?.map((sub) => sub.name) ?? []),
    ]),
    retrieval_signals: component.retrieval_signals ?? null,
    example_count: component.examples.length,
    source_urls: uniqueSorted([
      component.related_docs.overview,
      component.related_docs.usage,
      component.related_docs.accessibility,
      component.related_docs.examples,
      ...component.examples.map((example) => example.source_url),
    ]),
  };
}

function summarizePattern(pattern: PatternRecord): CreateCatalogEntitySummary {
  return {
    id: pattern.id,
    entity_type: "pattern",
    name: pattern.name,
    aliases: uniqueSorted(pattern.aliases),
    route_slugs: uniqueSorted([getRouteSlug(pattern.related_docs.overview)]),
    package: null,
    status: pattern.status,
    categories: [...(pattern.category ?? [])],
    summary: pattern.summary,
    when_to_use: [...pattern.when_to_use],
    when_not_to_use: [...pattern.when_not_to_use],
    starter_available:
      Boolean(pattern.starter_scaffold) || pattern.examples.length > 0,
    supporting_surfaces: uniqueSorted([
      ...pattern.composed_of.map((item) => item.component),
      ...pattern.related_patterns,
    ]),
    related_entities: uniqueSorted([
      ...pattern.composed_of.map((item) => item.component),
      ...pattern.related_patterns,
    ]),
    retrieval_signals: pattern.retrieval_signals ?? null,
    example_count: pattern.examples.length,
    source_urls: uniqueSorted([
      pattern.related_docs.overview,
      ...pattern.resources.map((resource) => resource.href),
      ...pattern.examples.map((example) => example.source_url),
      ...(pattern.starter_scaffold?.source_urls ?? []),
      ...(pattern.starter_scaffold?.example_source_urls ?? []),
    ]),
  };
}

function summarizeEntityRecord(
  entityRecord: CreateCatalogEntityRecord,
): CreateCatalogEntitySummary {
  if (entityRecord.entity_type === "component") {
    return summarizeComponent(entityRecord.record);
  }

  return summarizePattern(entityRecord.record);
}

export function buildCreateCatalogSupportManifest(): CreateCatalogSupportManifest {
  return {
    contract_version: SALT_CREATE_CATALOG_CONTRACT_VERSION,
    entity_lookup_match_modes: ["canonical_name", "alias", "route_slug"],
  };
}

export function listCreateCatalogEntityNames(registry: SaltRegistry): string[] {
  return uniqueSorted([
    ...registry.components.map((component) => component.name),
    ...registry.patterns.map((pattern) => pattern.name),
  ]);
}

export function lookupCreateCatalogEntity(
  registry: SaltRegistry,
  query: string,
  packageName?: string,
): CreateCatalogEntityLookupResult {
  const lookupKey = normalizeLookupKey(query);
  if (!lookupKey) {
    return {
      contract_version: SALT_CREATE_CATALOG_CONTRACT_VERSION,
      query,
      status: "none",
      matches: [],
    };
  }

  const matches = [
    ...registry.components
      .filter((component) => {
        if (packageName && component.package.name !== packageName) {
          return false;
        }

        return getComponentLookupKeys(component).includes(lookupKey);
      })
      .map((record) =>
        summarizeEntityRecord({
          entity_type: "component",
          record,
        }),
      ),
    ...registry.patterns
      .filter((pattern) => getPatternLookupKeys(pattern).includes(lookupKey))
      .map((record) =>
        summarizeEntityRecord({
          entity_type: "pattern",
          record,
        }),
      ),
  ].sort((left, right) => {
    if (left.name !== right.name) {
      return left.name.localeCompare(right.name);
    }
    if (left.entity_type !== right.entity_type) {
      return left.entity_type.localeCompare(right.entity_type);
    }
    return (left.package ?? "").localeCompare(right.package ?? "");
  });

  return {
    contract_version: SALT_CREATE_CATALOG_CONTRACT_VERSION,
    query,
    status:
      matches.length === 0
        ? "none"
        : matches.length === 1
          ? "resolved"
          : "ambiguous",
    matches,
  };
}
