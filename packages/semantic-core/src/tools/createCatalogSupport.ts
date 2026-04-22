import type {
  ComponentRecord,
  CreateRetrievalEntityType,
  CreateRetrievalEvidenceRole,
  CreateRetrievalSourceKind,
  PatternRecord,
  SaltRegistry,
  SaltStatus,
} from "../types.js";
import { resolveCreateRecommendation } from "./createResolve.js";
import {
  type CreateRetrievalCandidate,
  type CreateTargetReferenceKind,
  type RetrieveCreateCandidatesInput,
  retrieveCreateCandidates,
} from "./createRetrieval.js";

export const SALT_CREATE_CATALOG_CONTRACT_VERSION =
  "salt_create_catalog_v1" as const;
export const SALT_CREATE_CATALOG_TOP_K_DEFAULT = 5 as const;
export const SALT_CREATE_CATALOG_TOP_K_MAX = 25 as const;

export interface CreateCatalogSupportManifest {
  contract_version: typeof SALT_CREATE_CATALOG_CONTRACT_VERSION;
  top_k_default: typeof SALT_CREATE_CATALOG_TOP_K_DEFAULT;
  top_k_max: typeof SALT_CREATE_CATALOG_TOP_K_MAX;
  entity_lookup_match_modes: Array<"canonical_name" | "alias" | "route_slug">;
  family_lookup_match_modes: Array<"category" | "normalized_category">;
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
  example_count: number;
  source_urls: string[];
}

export interface CreateCatalogEvidenceSummary {
  source_kind: CreateRetrievalSourceKind;
  evidence_role: CreateRetrievalEvidenceRole;
  score: number;
  text: string;
  matched_terms: string[];
}

export interface CreateCatalogCandidateSummary {
  entity: CreateCatalogEntitySummary;
  confidence: number;
  exact_match: boolean;
  prefix_match: boolean;
  explicit_owner_hits: number;
  owner_score: number;
  support_score: number;
  caution_score: number;
  total_score: number;
  matched_terms: string[];
  match_reasons: string[];
  evidence: CreateCatalogEvidenceSummary[];
}

export interface CreateCatalogQuerySummary {
  contract_version: typeof SALT_CREATE_CATALOG_CONTRACT_VERSION;
  query: string;
  status: "exact" | "ranked" | "ambiguous" | "none";
  reference_kind: CreateTargetReferenceKind | null;
  owner: CreateCatalogCandidateSummary | null;
  retrieval_owner: CreateCatalogCandidateSummary | null;
  supporting_candidates: CreateCatalogCandidateSummary[];
  candidates: CreateCatalogCandidateSummary[];
}

export interface CreateCatalogEntityLookupResult {
  contract_version: typeof SALT_CREATE_CATALOG_CONTRACT_VERSION;
  query: string;
  status: "resolved" | "ambiguous" | "none";
  matches: CreateCatalogEntitySummary[];
}

export interface CreateCatalogFamilySummary {
  family: string;
  entity_count: number;
  component_count: number;
  pattern_count: number;
  entities: CreateCatalogEntitySummary[];
}

export interface CreateCatalogFamilyLookupResult {
  contract_version: typeof SALT_CREATE_CATALOG_CONTRACT_VERSION;
  query: string;
  status: "resolved" | "none";
  matches: CreateCatalogFamilySummary[];
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

function getEntityRecordById(
  registry: SaltRegistry,
  entityId: string,
): CreateCatalogEntityRecord | null {
  const component = registry.components.find(
    (record) => record.id === entityId,
  );
  if (component) {
    return {
      entity_type: "component",
      record: component,
    };
  }

  const pattern = registry.patterns.find((record) => record.id === entityId);
  if (pattern) {
    return {
      entity_type: "pattern",
      record: pattern,
    };
  }

  return null;
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

function summarizeCandidate(
  registry: SaltRegistry,
  candidate: CreateRetrievalCandidate,
): CreateCatalogCandidateSummary | null {
  const entityRecord = getEntityRecordById(registry, candidate.entity_id);
  if (!entityRecord) {
    return null;
  }

  return {
    entity: summarizeEntityRecord(entityRecord),
    confidence: candidate.confidence,
    exact_match: candidate.exact_match,
    prefix_match: candidate.prefix_match,
    explicit_owner_hits: candidate.explicit_owner_hits,
    owner_score: candidate.owner_score,
    support_score: candidate.support_score,
    caution_score: candidate.caution_score,
    total_score: candidate.total_score,
    matched_terms: [...candidate.matched_terms],
    match_reasons: [...candidate.match_reasons],
    evidence: [...candidate.evidence]
      .sort((left, right) => right.score - left.score)
      .slice(0, 8)
      .map((entry) => ({
        source_kind: entry.source_kind,
        evidence_role: entry.evidence_role,
        score: entry.score,
        text: entry.text,
        matched_terms: [...entry.matched_terms],
      })),
  };
}

export function buildCreateCatalogSupportManifest(): CreateCatalogSupportManifest {
  return {
    contract_version: SALT_CREATE_CATALOG_CONTRACT_VERSION,
    top_k_default: SALT_CREATE_CATALOG_TOP_K_DEFAULT,
    top_k_max: SALT_CREATE_CATALOG_TOP_K_MAX,
    entity_lookup_match_modes: ["canonical_name", "alias", "route_slug"],
    family_lookup_match_modes: ["category", "normalized_category"],
  };
}

export function listCreateCatalogEntityNames(registry: SaltRegistry): string[] {
  return uniqueSorted([
    ...registry.components.map((component) => component.name),
    ...registry.patterns.map((pattern) => pattern.name),
  ]);
}

export function listCreateCatalogFamilies(registry: SaltRegistry): string[] {
  return uniqueSorted([
    ...registry.components.flatMap((component) => component.category),
    ...registry.patterns.flatMap((pattern) => pattern.category ?? []),
  ]);
}

function summarizeFamily(
  family: string,
  matches: CreateCatalogEntitySummary[],
): CreateCatalogFamilySummary {
  const sortedMatches = [...matches].sort((left, right) => {
    if (left.name !== right.name) {
      return left.name.localeCompare(right.name);
    }
    if (left.entity_type !== right.entity_type) {
      return left.entity_type.localeCompare(right.entity_type);
    }
    return (left.package ?? "").localeCompare(right.package ?? "");
  });

  return {
    family,
    entity_count: sortedMatches.length,
    component_count: sortedMatches.filter(
      (match) => match.entity_type === "component",
    ).length,
    pattern_count: sortedMatches.filter(
      (match) => match.entity_type === "pattern",
    ).length,
    entities: sortedMatches,
  };
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

export function lookupCreateCatalogFamily(
  registry: SaltRegistry,
  query: string,
): CreateCatalogFamilyLookupResult {
  const lookupKey = normalizeLookupKey(query);
  if (!lookupKey) {
    return {
      contract_version: SALT_CREATE_CATALOG_CONTRACT_VERSION,
      query,
      status: "none",
      matches: [],
    };
  }

  const families = listCreateCatalogFamilies(registry).filter(
    (family) => normalizeLookupKey(family) === lookupKey,
  );

  const matches = families.map((family) =>
    summarizeFamily(family, [
      ...registry.components
        .filter((component) => component.category.includes(family))
        .map((record) =>
          summarizeEntityRecord({
            entity_type: "component",
            record,
          }),
        ),
      ...registry.patterns
        .filter((pattern) => (pattern.category ?? []).includes(family))
        .map((record) =>
          summarizeEntityRecord({
            entity_type: "pattern",
            record,
          }),
        ),
    ]),
  );

  return {
    contract_version: SALT_CREATE_CATALOG_CONTRACT_VERSION,
    query,
    status: matches.length > 0 ? "resolved" : "none",
    matches,
  };
}

export function inspectCreateCatalogQuery(
  registry: SaltRegistry,
  input: RetrieveCreateCandidatesInput,
): CreateCatalogQuerySummary {
  const topK = Math.max(
    1,
    Math.min(
      input.top_k ?? SALT_CREATE_CATALOG_TOP_K_DEFAULT,
      SALT_CREATE_CATALOG_TOP_K_MAX,
    ),
  );
  const resolution = resolveCreateRecommendation(registry, {
    query: input.query,
    package: input.package,
    status: input.status,
    top_k: topK,
    production_ready: input.filters?.production_ready,
    prefer_stable: input.filters?.prefer_stable,
    a11y_required: input.filters?.a11y_required,
    form_field_support: input.filters?.form_field_support,
    solution_type:
      input.solution_type_hint === "component" ||
      input.solution_type_hint === "pattern"
        ? input.solution_type_hint
        : undefined,
  });
  const retrieval =
    resolution.retrieval ??
    retrieveCreateCandidates(registry, {
      ...input,
      top_k: topK,
    });

  const retrievalOwner = retrieval.owner
    ? summarizeCandidate(registry, retrieval.owner)
    : null;
  const candidates = retrieval.candidates
    .map((candidate) => summarizeCandidate(registry, candidate))
    .filter(
      (candidate): candidate is CreateCatalogCandidateSummary =>
        candidate != null,
    );
  const supportingCandidates = retrieval.supporting_candidates
    .map((candidate) => summarizeCandidate(registry, candidate))
    .filter(
      (candidate): candidate is CreateCatalogCandidateSummary =>
        candidate != null,
    );
  const resolvedOwner =
    candidates.find(
      (candidate) =>
        candidate.entity.name === resolution.routed_query &&
        candidate.entity.entity_type === resolution.solution_type,
    ) ??
    (retrievalOwner &&
    retrievalOwner.entity.name === resolution.routed_query &&
    retrievalOwner.entity.entity_type === resolution.solution_type
      ? retrievalOwner
      : null);
  const owner = resolvedOwner ?? retrievalOwner;

  return {
    contract_version: SALT_CREATE_CATALOG_CONTRACT_VERSION,
    query: input.query,
    status: retrieval.status,
    reference_kind: resolution.reference?.reference_kind ?? null,
    owner,
    retrieval_owner: retrievalOwner,
    supporting_candidates: supportingCandidates,
    candidates,
  };
}
