import type {
  ComponentRecord,
  CreateRetrievalDocument,
  CreateRetrievalEntityType,
  CreateRetrievalEvidenceRole,
  CreateRetrievalSourceKind,
  PatternRecord,
  SaltRegistry,
  SaltStatus,
} from "../types.js";
import type { ConsumerRecommendationFilters } from "./consumerFilters.js";
import {
  matchesComponentConsumerFilters,
  matchesPatternConsumerFilters,
} from "./consumerFilters.js";
import {
  getEffectiveUsageSemantics,
  inferComponentCapabilities,
} from "./consumerSignals.js";
import { resolveComponentTarget } from "./componentLookup.js";
import {
  containsExplicitCreateReferencePhrase,
  getCreateReferenceQueries,
} from "./createReferenceQueries.js";
import { getStructuralPatternIntent } from "./patternIntent.js";
import {
  containsWholeWordPhrase,
  isComponentAllowedByDocsPolicy,
  normalizeQuery,
  stemTokenize,
  tokenize,
  unique,
} from "./utils.js";

type CreateTargetMatchKind = "name" | "alias" | "slug";

export type CreateTargetReferenceKind = "exact" | "alias" | "descriptive";

export interface CreateNamedTarget {
  id: string;
  entity_type: CreateRetrievalEntityType;
  name: string;
  package: string | null;
  status: SaltStatus | null;
  categories: string[];
  lookup_keys: string[];
  matched_by: CreateTargetMatchKind[];
  related_names: string[];
  structural_weight: number;
}

export interface CreateTargetReference {
  requested_entity: string;
  requested_target: CreateNamedTarget;
  reference_kind: CreateTargetReferenceKind;
}

export interface CreateRetrievalEvidence {
  document_id: string;
  source_kind: CreateRetrievalSourceKind;
  evidence_role: CreateRetrievalEvidenceRole;
  score: number;
  text: string;
  matched_terms: string[];
}

export interface CreateRetrievalCandidate {
  entity_id: string;
  entity_type: CreateRetrievalEntityType;
  entity_name: string;
  package: string | null;
  status: SaltStatus | null;
  categories: string[];
  structural_weight: number;
  explicit_owner_hits: number;
  owner_score: number;
  support_score: number;
  caution_score: number;
  total_score: number;
  confidence: number;
  exact_match: boolean;
  prefix_match: boolean;
  matched_terms: string[];
  match_reasons: string[];
  evidence: CreateRetrievalEvidence[];
}

export interface RetrieveCreateCandidatesInput {
  query: string;
  package?: string;
  status?: SaltStatus;
  top_k?: number;
  solution_type_hint?: "component" | "pattern";
  filters?: ConsumerRecommendationFilters;
}

export interface RetrieveCreateCandidatesResult {
  status: "exact" | "ranked" | "ambiguous" | "none";
  owner: CreateRetrievalCandidate | null;
  supporting_candidates: CreateRetrievalCandidate[];
  candidates: CreateRetrievalCandidate[];
  reference?: CreateTargetReference;
}

interface CreateQueryCompatibilitySignals {
  single_destination_intent: boolean;
  shell_container_intent: boolean;
  data_display_intent: boolean;
  same_page_sections_intent: boolean;
}

interface CreateCandidateCompatibilitySignals {
  shell_container_score: number;
  single_destination_score: number;
  multi_destination_score: number;
  data_display_score: number;
  same_page_sections_score: number;
  generic_container_component: boolean;
}

interface CreateRetrievalTokenStats {
  entity_count: number;
  entity_frequency: Map<string, number>;
}

const HARD_STOPWORDS = new Set([
  "a",
  "an",
  "and",
  "as",
  "at",
  "be",
  "by",
  "for",
  "from",
  "in",
  "into",
  "is",
  "of",
  "on",
  "or",
  "the",
  "to",
]);
const SOFT_STOPWORDS = new Set([
  "component",
  "components",
  "control",
  "controls",
  "display",
  "page",
  "pages",
  "section",
  "sections",
  "show",
  "showing",
  "ui",
  "with",
]);
const LOW_SIGNAL_SINGLE_TOKEN_ALIASES = new Set([
  "body",
  "content",
  "dashboard",
  "grid",
  "header",
  "key",
  "layout",
  "main",
  "panel",
  "screen",
  "shell",
]);

const CREATE_RETRIEVAL_INDEX_CACHE = new WeakMap<
  SaltRegistry,
  CreateRetrievalDocument[]
>();
const CREATE_TARGET_CACHE = new WeakMap<SaltRegistry, CreateNamedTarget[]>();
const CREATE_RETRIEVAL_TOKEN_STATS_CACHE = new WeakMap<
  SaltRegistry,
  CreateRetrievalTokenStats
>();

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

function countLookupTokens(value: string): number {
  return value.split("-").filter(Boolean).length;
}

function startsWithLookupKey(queryKey: string, lookupKey: string): boolean {
  return queryKey === lookupKey || queryKey.startsWith(`${lookupKey}-`);
}

function getQueryTerms(query: string): string[] {
  const hardFiltered = tokenize(query).filter(
    (token) => !HARD_STOPWORDS.has(token),
  );
  const softFiltered = hardFiltered.filter(
    (token) => !SOFT_STOPWORDS.has(token),
  );
  return stemTokenize(
    (softFiltered.length > 0 ? softFiltered : hardFiltered).join(" "),
  );
}

function getCreateRetrievalTokenStats(
  registry: SaltRegistry,
): CreateRetrievalTokenStats {
  const cached = CREATE_RETRIEVAL_TOKEN_STATS_CACHE.get(registry);
  if (cached) {
    return cached;
  }

  const tokenToEntities = new Map<string, Set<string>>();

  for (const doc of getCreateRetrievalIndex(registry)) {
    const uniqueTokens = new Set(doc.stemmed_tokens);
    for (const token of uniqueTokens) {
      let entityIds = tokenToEntities.get(token);
      if (!entityIds) {
        entityIds = new Set<string>();
        tokenToEntities.set(token, entityIds);
      }
      entityIds.add(doc.entity_id);
    }
  }

  const stats: CreateRetrievalTokenStats = {
    entity_count: new Set(
      getCreateRetrievalIndex(registry).map((doc) => doc.entity_id),
    ).size,
    entity_frequency: new Map(
      [...tokenToEntities.entries()].map(([token, entityIds]) => [
        token,
        entityIds.size,
      ]),
    ),
  };
  CREATE_RETRIEVAL_TOKEN_STATS_CACHE.set(registry, stats);
  return stats;
}

function getTokenSignalWeight(
  stats: CreateRetrievalTokenStats,
  token: string,
): number {
  if (!token || HARD_STOPWORDS.has(token) || token.length <= 2) {
    return 0;
  }

  const entityFrequency = stats.entity_frequency.get(token) ?? 0;
  if (entityFrequency === 0 || stats.entity_count === 0) {
    return 1;
  }

  const ratio = entityFrequency / stats.entity_count;
  if (ratio >= 0.55) {
    return 0;
  }
  if (ratio >= 0.35) {
    return 0.2;
  }
  if (ratio >= 0.2) {
    return 0.45;
  }
  if (ratio >= 0.1) {
    return 0.7;
  }
  return 1;
}

function getCreateEntityStructuralWeight(input: {
  entity_type: CreateRetrievalEntityType;
  name: string;
  categories: string[];
}): number {
  const normalizedName = normalizeLookupKey(input.name);
  const normalizedCategories = input.categories.map(normalizeLookupKey);
  const base = input.entity_type === "pattern" ? 8 : 5;
  let weight = base;

  if (
    normalizedCategories.some((category) =>
      [
        "data-display-and-analysis",
        "data-display-and-visualization",
        "dialogs-and-overlays",
        "forms-and-inputs",
        "inputs",
        "layout-and-shells",
        "navigation",
        "navigation-and-wayfinding",
        "selection-and-filtering",
        "selection-controls",
      ].includes(category),
    )
  ) {
    weight += 4;
  }

  if (
    /(dialog|wizard|stepper|navigation|dashboard|breadcrumb|tabs|table|chart|toolbar|header|form|grid)/.test(
      normalizedName,
    )
  ) {
    weight += 2;
  }

  if (/(avatar|icon|badge|indicator|symbol)/.test(normalizedName)) {
    weight -= 3;
  }

  return Math.max(1, weight);
}

function pushRetrievalDocument(
  docs: CreateRetrievalDocument[],
  input: {
    entity_id: string;
    entity_type: CreateRetrievalEntityType;
    entity_name: string;
    package: string | null;
    status: SaltStatus | null;
    source_kind: CreateRetrievalSourceKind;
    evidence_role: CreateRetrievalEvidenceRole;
    text: string;
    source_weight: number;
    categories: string[];
    structural_weight: number;
  },
): void {
  const normalizedText = normalizeQuery(input.text);
  if (!normalizedText) {
    return;
  }

  docs.push({
    id: `${input.entity_id}:${input.source_kind}:${docs.length + 1}`,
    entity_id: input.entity_id,
    entity_type: input.entity_type,
    entity_name: input.entity_name,
    package: input.package,
    status: input.status,
    source_kind: input.source_kind,
    evidence_role: input.evidence_role,
    text: input.text,
    normalized_text: normalizedText,
    tokens: tokenize(input.text),
    stemmed_tokens: stemTokenize(input.text),
    source_weight: input.source_weight,
    structural_weight: input.structural_weight,
    categories: input.categories,
  });
}

function buildComponentRetrievalDocs(
  component: ComponentRecord,
): CreateRetrievalDocument[] {
  const structuralWeight = getCreateEntityStructuralWeight({
    entity_type: "component",
    name: component.name,
    categories: component.category,
  });
  const docs: CreateRetrievalDocument[] = [];
  const componentPackage = component.package.name;
  const componentAliases = unique([
    ...component.aliases,
    ...(component.sub_components?.map((sub) => sub.export_name) ?? []),
  ]);

  pushRetrievalDocument(docs, {
    entity_id: component.id,
    entity_type: "component",
    entity_name: component.name,
    package: componentPackage,
    status: component.status,
    source_kind: "canonical_name",
    evidence_role: "owner",
    text: component.name,
    source_weight: 34,
    categories: component.category,
    structural_weight: structuralWeight,
  });

  for (const alias of componentAliases) {
    pushRetrievalDocument(docs, {
      entity_id: component.id,
      entity_type: "component",
      entity_name: component.name,
      package: componentPackage,
      status: component.status,
      source_kind: "alias",
      evidence_role: "owner",
      text: alias,
      source_weight: 22,
      categories: component.category,
      structural_weight: structuralWeight,
    });
  }

  pushRetrievalDocument(docs, {
    entity_id: component.id,
    entity_type: "component",
    entity_name: component.name,
    package: componentPackage,
    status: component.status,
    source_kind: "summary",
    evidence_role: "owner",
    text: component.summary,
    source_weight: 14,
    categories: component.category,
    structural_weight: structuralWeight,
  });

  for (const value of component.category) {
    pushRetrievalDocument(docs, {
      entity_id: component.id,
      entity_type: "component",
      entity_name: component.name,
      package: componentPackage,
      status: component.status,
      source_kind: "category",
      evidence_role: "supporting",
      text: value,
      source_weight: 8,
      categories: component.category,
      structural_weight: structuralWeight,
    });
  }

  for (const value of component.tags) {
    pushRetrievalDocument(docs, {
      entity_id: component.id,
      entity_type: "component",
      entity_name: component.name,
      package: componentPackage,
      status: component.status,
      source_kind: "tag",
      evidence_role: "supporting",
      text: value,
      source_weight: 7,
      categories: component.category,
      structural_weight: structuralWeight,
    });
  }

  for (const value of component.when_to_use) {
    pushRetrievalDocument(docs, {
      entity_id: component.id,
      entity_type: "component",
      entity_name: component.name,
      package: componentPackage,
      status: component.status,
      source_kind: "when_to_use",
      evidence_role: "owner",
      text: value,
      source_weight: 16,
      categories: component.category,
      structural_weight: structuralWeight,
    });
  }

  for (const value of component.when_not_to_use) {
    pushRetrievalDocument(docs, {
      entity_id: component.id,
      entity_type: "component",
      entity_name: component.name,
      package: componentPackage,
      status: component.status,
      source_kind: "when_not_to_use",
      evidence_role: "caution",
      text: value,
      source_weight: 14,
      categories: component.category,
      structural_weight: structuralWeight,
    });
  }

  const semantics = getEffectiveUsageSemantics(component);
  for (const value of semantics?.preferred_for ?? []) {
    pushRetrievalDocument(docs, {
      entity_id: component.id,
      entity_type: "component",
      entity_name: component.name,
      package: componentPackage,
      status: component.status,
      source_kind: "semantics_preferred_for",
      evidence_role: "owner",
      text: value,
      source_weight: 14,
      categories: component.category,
      structural_weight: structuralWeight,
    });
  }
  for (const value of semantics?.not_for ?? []) {
    pushRetrievalDocument(docs, {
      entity_id: component.id,
      entity_type: "component",
      entity_name: component.name,
      package: componentPackage,
      status: component.status,
      source_kind: "semantics_not_for",
      evidence_role: "caution",
      text: value,
      source_weight: 14,
      categories: component.category,
      structural_weight: structuralWeight,
    });
  }

  for (const example of component.examples) {
    pushRetrievalDocument(docs, {
      entity_id: component.id,
      entity_type: "component",
      entity_name: component.name,
      package: componentPackage,
      status: component.status,
      source_kind: "example",
      evidence_role: "supporting",
      text: [example.title, example.description, ...example.intent]
        .filter(Boolean)
        .join(" "),
      source_weight: 12,
      categories: component.category,
      structural_weight: structuralWeight,
    });
  }

  for (const prop of component.props) {
    pushRetrievalDocument(docs, {
      entity_id: component.id,
      entity_type: "component",
      entity_name: component.name,
      package: componentPackage,
      status: component.status,
      source_kind: "prop",
      evidence_role: "supporting",
      text: [
        prop.name,
        prop.type,
        prop.description,
        ...(prop.allowed_values ?? []).map(String),
      ]
        .filter(Boolean)
        .join(" "),
      source_weight: 6,
      categories: component.category,
      structural_weight: structuralWeight,
    });
  }

  for (const capability of inferComponentCapabilities(component)) {
    pushRetrievalDocument(docs, {
      entity_id: component.id,
      entity_type: "component",
      entity_name: component.name,
      package: componentPackage,
      status: component.status,
      source_kind: "capability",
      evidence_role: "supporting",
      text: capability,
      source_weight: 8,
      categories: component.category,
      structural_weight: structuralWeight,
    });
  }

  return docs;
}

function buildPatternRetrievalDocs(
  pattern: PatternRecord,
): CreateRetrievalDocument[] {
  const structuralWeight = getCreateEntityStructuralWeight({
    entity_type: "pattern",
    name: pattern.name,
    categories: pattern.category ?? [],
  });
  const docs: CreateRetrievalDocument[] = [];
  const routeSlug = getRouteSlug(pattern.related_docs.overview);

  pushRetrievalDocument(docs, {
    entity_id: pattern.id,
    entity_type: "pattern",
    entity_name: pattern.name,
    package: null,
    status: pattern.status,
    source_kind: "canonical_name",
    evidence_role: "owner",
    text: pattern.name,
    source_weight: 32,
    categories: pattern.category ?? [],
    structural_weight: structuralWeight,
  });

  for (const alias of unique([
    ...pattern.aliases,
    ...(routeSlug ? [routeSlug] : []),
  ])) {
    pushRetrievalDocument(docs, {
      entity_id: pattern.id,
      entity_type: "pattern",
      entity_name: pattern.name,
      package: null,
      status: pattern.status,
      source_kind: "alias",
      evidence_role: "owner",
      text: alias,
      source_weight: 20,
      categories: pattern.category ?? [],
      structural_weight: structuralWeight,
    });
  }

  pushRetrievalDocument(docs, {
    entity_id: pattern.id,
    entity_type: "pattern",
    entity_name: pattern.name,
    package: null,
    status: pattern.status,
    source_kind: "summary",
    evidence_role: "owner",
    text: pattern.summary,
    source_weight: 14,
    categories: pattern.category ?? [],
    structural_weight: structuralWeight,
  });

  for (const value of pattern.category ?? []) {
    pushRetrievalDocument(docs, {
      entity_id: pattern.id,
      entity_type: "pattern",
      entity_name: pattern.name,
      package: null,
      status: pattern.status,
      source_kind: "category",
      evidence_role: "supporting",
      text: value,
      source_weight: 9,
      categories: pattern.category ?? [],
      structural_weight: structuralWeight,
    });
  }

  for (const value of pattern.when_to_use) {
    pushRetrievalDocument(docs, {
      entity_id: pattern.id,
      entity_type: "pattern",
      entity_name: pattern.name,
      package: null,
      status: pattern.status,
      source_kind: "when_to_use",
      evidence_role: "owner",
      text: value,
      source_weight: 16,
      categories: pattern.category ?? [],
      structural_weight: structuralWeight,
    });
  }

  for (const value of pattern.when_not_to_use) {
    pushRetrievalDocument(docs, {
      entity_id: pattern.id,
      entity_type: "pattern",
      entity_name: pattern.name,
      package: null,
      status: pattern.status,
      source_kind: "when_not_to_use",
      evidence_role: "caution",
      text: value,
      source_weight: 14,
      categories: pattern.category ?? [],
      structural_weight: structuralWeight,
    });
  }

  const semantics = getEffectiveUsageSemantics(pattern);
  for (const value of semantics?.preferred_for ?? []) {
    pushRetrievalDocument(docs, {
      entity_id: pattern.id,
      entity_type: "pattern",
      entity_name: pattern.name,
      package: null,
      status: pattern.status,
      source_kind: "semantics_preferred_for",
      evidence_role: "owner",
      text: value,
      source_weight: 14,
      categories: pattern.category ?? [],
      structural_weight: structuralWeight,
    });
  }
  for (const value of semantics?.not_for ?? []) {
    pushRetrievalDocument(docs, {
      entity_id: pattern.id,
      entity_type: "pattern",
      entity_name: pattern.name,
      package: null,
      status: pattern.status,
      source_kind: "semantics_not_for",
      evidence_role: "caution",
      text: value,
      source_weight: 14,
      categories: pattern.category ?? [],
      structural_weight: structuralWeight,
    });
  }

  for (const value of pattern.how_to_build) {
    pushRetrievalDocument(docs, {
      entity_id: pattern.id,
      entity_type: "pattern",
      entity_name: pattern.name,
      package: null,
      status: pattern.status,
      source_kind: "pattern_how_to_build",
      evidence_role: "supporting",
      text: value,
      source_weight: 11,
      categories: pattern.category ?? [],
      structural_weight: structuralWeight,
    });
  }

  for (const value of pattern.how_it_works) {
    pushRetrievalDocument(docs, {
      entity_id: pattern.id,
      entity_type: "pattern",
      entity_name: pattern.name,
      package: null,
      status: pattern.status,
      source_kind: "pattern_how_it_works",
      evidence_role: "supporting",
      text: value,
      source_weight: 10,
      categories: pattern.category ?? [],
      structural_weight: structuralWeight,
    });
  }

  for (const item of pattern.composed_of) {
    pushRetrievalDocument(docs, {
      entity_id: pattern.id,
      entity_type: "pattern",
      entity_name: pattern.name,
      package: null,
      status: pattern.status,
      source_kind: "pattern_composition",
      evidence_role: "supporting",
      text: [item.component, item.role ?? ""].filter(Boolean).join(" "),
      source_weight: 10,
      categories: pattern.category ?? [],
      structural_weight: structuralWeight,
    });
  }

  for (const example of pattern.examples) {
    pushRetrievalDocument(docs, {
      entity_id: pattern.id,
      entity_type: "pattern",
      entity_name: pattern.name,
      package: null,
      status: pattern.status,
      source_kind: "example",
      evidence_role: "supporting",
      text: [example.title, example.description, ...example.intent]
        .filter(Boolean)
        .join(" "),
      source_weight: 12,
      categories: pattern.category ?? [],
      structural_weight: structuralWeight,
    });
  }

  for (const value of pattern.starter_scaffold?.semantics.regions ?? []) {
    pushRetrievalDocument(docs, {
      entity_id: pattern.id,
      entity_type: "pattern",
      entity_name: pattern.name,
      package: null,
      status: pattern.status,
      source_kind: "starter_scaffold_region",
      evidence_role: "supporting",
      text: value,
      source_weight: 10,
      categories: pattern.category ?? [],
      structural_weight: structuralWeight,
    });
  }
  for (const value of pattern.starter_scaffold?.semantics.build_around ?? []) {
    pushRetrievalDocument(docs, {
      entity_id: pattern.id,
      entity_type: "pattern",
      entity_name: pattern.name,
      package: null,
      status: pattern.status,
      source_kind: "starter_scaffold_build_around",
      evidence_role: "supporting",
      text: value,
      source_weight: 12,
      categories: pattern.category ?? [],
      structural_weight: structuralWeight,
    });
  }
  for (const value of pattern.starter_scaffold?.semantics.preserve_constraints ?? []) {
    pushRetrievalDocument(docs, {
      entity_id: pattern.id,
      entity_type: "pattern",
      entity_name: pattern.name,
      package: null,
      status: pattern.status,
      source_kind: "starter_scaffold_constraint",
      evidence_role: "caution",
      text: value,
      source_weight: 12,
      categories: pattern.category ?? [],
      structural_weight: structuralWeight,
    });
  }

  return docs;
}

export function buildCreateRetrievalIndex(
  registry: Pick<SaltRegistry, "components" | "patterns">,
): CreateRetrievalDocument[] {
  return [
    ...registry.components
      .filter((component) => isComponentAllowedByDocsPolicy(component))
      .flatMap((component) => buildComponentRetrievalDocs(component)),
    ...registry.patterns.flatMap((pattern) => buildPatternRetrievalDocs(pattern)),
  ];
}

function getCreateRetrievalIndex(
  registry: SaltRegistry,
): CreateRetrievalDocument[] {
  if (Array.isArray(registry.create_retrieval_index)) {
    return registry.create_retrieval_index;
  }

  const cached = CREATE_RETRIEVAL_INDEX_CACHE.get(registry);
  if (cached) {
    return cached;
  }

  const built = buildCreateRetrievalIndex(registry);
  CREATE_RETRIEVAL_INDEX_CACHE.set(registry, built);
  return built;
}

function buildCreateNamedTargetFromComponent(
  component: ComponentRecord,
  matchedBy: CreateTargetMatchKind[] = ["name"],
): CreateNamedTarget {
  return {
    id: component.id,
    entity_type: "component",
    name: component.name,
    package: component.package.name,
    status: component.status,
    categories: component.category,
    lookup_keys: unique([
      component.name,
      ...component.aliases,
      ...(component.sub_components?.map((sub) => sub.export_name) ?? []),
    ]),
    matched_by: matchedBy,
    related_names: component.patterns,
    structural_weight: getCreateEntityStructuralWeight({
      entity_type: "component",
      name: component.name,
      categories: component.category,
    }),
  };
}

function resolvePatternTarget(
  registry: SaltRegistry,
  query: string,
): {
  candidate?: { pattern: PatternRecord; matched_by: CreateTargetMatchKind[] };
  ambiguity?: {
    query: string;
    matches: Array<{ name: string; status: PatternRecord["status"] }>;
  };
} {
  const normalized = normalizeLookupKey(query);
  const matches = new Map<
    string,
    { pattern: PatternRecord; matched_by: CreateTargetMatchKind[] }
  >();

  for (const pattern of registry.patterns) {
    if (normalizeLookupKey(pattern.name) === normalized) {
      matches.set(pattern.id, { pattern, matched_by: ["name"] });
    }
  }

  for (const pattern of registry.patterns) {
    if (
      pattern.aliases.some((alias) => normalizeLookupKey(alias) === normalized)
    ) {
      const current = matches.get(pattern.id);
      if (current) {
        if (!current.matched_by.includes("alias")) {
          current.matched_by.push("alias");
        }
      } else {
        matches.set(pattern.id, { pattern, matched_by: ["alias"] });
      }
    }
  }

  for (const pattern of registry.patterns) {
    const routeSlug = getRouteSlug(pattern.related_docs.overview);
    if (routeSlug && normalizeLookupKey(routeSlug) === normalized) {
      const current = matches.get(pattern.id);
      if (current) {
        if (!current.matched_by.includes("slug")) {
          current.matched_by.push("slug");
        }
      } else {
        matches.set(pattern.id, { pattern, matched_by: ["slug"] });
      }
    }
  }

  const resolved = [...matches.values()];
  if (resolved.length > 1) {
    return {
      ambiguity: {
        query,
        matches: resolved.map(({ pattern }) => ({
          name: pattern.name,
          status: pattern.status,
        })),
      },
    };
  }

  return { candidate: resolved[0] };
}

function buildCreateNamedTargetFromPattern(
  pattern: PatternRecord,
  matchedBy: CreateTargetMatchKind[] = ["name"],
): CreateNamedTarget {
  return {
    id: pattern.id,
    entity_type: "pattern",
    name: pattern.name,
    package: null,
    status: pattern.status,
    categories: pattern.category ?? [],
    lookup_keys: unique([
      pattern.name,
      ...pattern.aliases,
      ...(getRouteSlug(pattern.related_docs.overview)
        ? [getRouteSlug(pattern.related_docs.overview)!]
        : []),
    ]),
    matched_by: matchedBy,
    related_names: unique([
      ...pattern.related_patterns,
      ...pattern.composed_of.map((item) => item.component),
    ]),
    structural_weight: getCreateEntityStructuralWeight({
      entity_type: "pattern",
      name: pattern.name,
      categories: pattern.category ?? [],
    }),
  };
}

function listCreateNamedTargets(registry: SaltRegistry): CreateNamedTarget[] {
  const cached = CREATE_TARGET_CACHE.get(registry);
  if (cached) {
    return cached;
  }

  const targets = [
    ...registry.components
      .filter((component) => isComponentAllowedByDocsPolicy(component))
      .map((component) => buildCreateNamedTargetFromComponent(component)),
    ...registry.patterns.map((pattern) => buildCreateNamedTargetFromPattern(pattern)),
  ];
  CREATE_TARGET_CACHE.set(registry, targets);
  return targets;
}

export function resolveCreateNamedTarget(
  registry: SaltRegistry,
  query: string,
  packageName?: string,
): CreateNamedTarget | null {
  const componentResolution = resolveComponentTarget(registry, query, packageName);
  const patternResolution = resolvePatternTarget(registry, query);

  if (componentResolution.ambiguity || patternResolution.ambiguity) {
    return null;
  }

  const candidates: CreateNamedTarget[] = [];

  if (componentResolution.candidate) {
    candidates.push(
      buildCreateNamedTargetFromComponent(
        componentResolution.candidate.component,
        [...componentResolution.candidate.matched_by],
      ),
    );
  }

  if (patternResolution.candidate) {
    candidates.push(
      buildCreateNamedTargetFromPattern(patternResolution.candidate.pattern, [
        ...patternResolution.candidate.matched_by,
      ]),
    );
  }

  if (candidates.length !== 1) {
    return null;
  }

  return candidates[0];
}

function derivePrefixAnchoredCreateTargetReference(
  registry: SaltRegistry,
  query: string,
  packageName?: string,
): CreateTargetReference | null {
  for (const queryVariant of getCreateReferenceQueries(query)) {
    if (getStructuralPatternIntent(queryVariant).score >= 4) {
      continue;
    }

    const queryKey = normalizeLookupKey(queryVariant);
    const candidates = listCreateNamedTargets(registry)
      .filter((target) =>
        packageName
          ? target.package === packageName || target.package === null
          : true,
      )
      .flatMap((target) =>
        target.lookup_keys.map((lookupKey) => ({
          target,
          lookupKey,
        })),
      )
      .filter(({ lookupKey }) =>
        startsWithLookupKey(queryKey, normalizeLookupKey(lookupKey)),
      )
      .filter(
        (entry, index, all) =>
          all.findIndex(
            (candidate) =>
              candidate.target.id === entry.target.id &&
              normalizeLookupKey(candidate.lookupKey) ===
                normalizeLookupKey(entry.lookupKey),
          ) === index,
      )
      .sort((left, right) => {
        const leftTokenCount = countLookupTokens(
          normalizeLookupKey(left.lookupKey),
        );
        const rightTokenCount = countLookupTokens(
          normalizeLookupKey(right.lookupKey),
        );
        if (leftTokenCount !== rightTokenCount) {
          return rightTokenCount - leftTokenCount;
        }
        if (left.target.structural_weight !== right.target.structural_weight) {
          return right.target.structural_weight - left.target.structural_weight;
        }
        return left.target.name.localeCompare(right.target.name);
      });

    const [first, second] = candidates;
    if (!first) {
      continue;
    }
    if (
      second &&
      second.target.id !== first.target.id &&
      normalizeLookupKey(second.lookupKey) ===
        normalizeLookupKey(first.lookupKey)
    ) {
      continue;
    }

    return {
      requested_entity: first.target.name,
      requested_target: first.target,
      reference_kind:
        normalizeLookupKey(first.lookupKey) ===
        normalizeLookupKey(first.target.name)
          ? "exact"
          : "alias",
    };
  }

  return null;
}

function getAllowedTargetIds(
  registry: SaltRegistry,
  input: RetrieveCreateCandidatesInput,
): Set<string> {
  const allowed = new Set<string>();
  const filters = input.filters ?? {};

  for (const component of registry.components) {
    if (!isComponentAllowedByDocsPolicy(component)) {
      continue;
    }
    if (input.package && component.package.name !== input.package) {
      continue;
    }
    if (input.status && component.status !== input.status) {
      continue;
    }
    if (!matchesComponentConsumerFilters(component, filters)) {
      continue;
    }
    allowed.add(component.id);
  }

  for (const pattern of registry.patterns) {
    if (input.status && pattern.status !== input.status) {
      continue;
    }
    if (!matchesPatternConsumerFilters(registry, pattern, filters)) {
      continue;
    }
    allowed.add(pattern.id);
  }

  return allowed;
}

function scoreRetrievalDocument(input: {
  normalized_query: string;
  query_terms: string[];
  doc: CreateRetrievalDocument;
  token_stats: CreateRetrievalTokenStats;
}): { score: number; matched_terms: string[]; reasons: string[] } {
  const queryTermSet = new Set(input.query_terms);
  const matchedTerms = unique(
    input.doc.stemmed_tokens.filter((token) => queryTermSet.has(token)),
  );
  const exact = input.doc.normalized_text === input.normalized_query;
  const prefix = input.normalized_query.startsWith(`${input.doc.normalized_text} `);
  const phrase = containsWholeWordPhrase(
    input.normalized_query,
    input.doc.normalized_text,
  );

  if (!exact && !prefix && !phrase && matchedTerms.length === 0) {
    return { score: 0, matched_terms: [], reasons: [] };
  }

  let score = 0;
  const reasons: string[] = [];

  if (exact) {
    score += input.doc.source_weight + 28;
    reasons.push("exact_phrase");
  } else if (prefix) {
    score += input.doc.source_weight + 22;
    reasons.push("prefix_phrase");
  } else if (phrase) {
    score += input.doc.source_weight + 10;
    reasons.push("full_phrase");
  }

  if (matchedTerms.length > 0) {
    const weightedTermCount = matchedTerms.reduce(
      (total, token) => total + getTokenSignalWeight(input.token_stats, token),
      0,
    );

    if (weightedTermCount > 0) {
      score += Math.min(
        input.doc.source_weight,
        Math.round(
          weightedTermCount *
            Math.max(3, Math.ceil(input.doc.source_weight / 4)),
        ),
      );
      reasons.push("token_overlap");
    }
  }

  const relevantDocTerms = unique(input.doc.stemmed_tokens).filter(
    (token) => getTokenSignalWeight(input.token_stats, token) > 0,
  );
  if (
    relevantDocTerms.length > 1 &&
    relevantDocTerms.every((token) => matchedTerms.includes(token))
  ) {
    score += 6;
    reasons.push("full_token_coverage");
  }

  if (
    input.doc.source_kind === "alias" &&
    input.doc.tokens.length === 1 &&
    input.query_terms.length >= 3 &&
    !exact &&
    !prefix
  ) {
    score = Math.min(
      score,
      LOW_SIGNAL_SINGLE_TOKEN_ALIASES.has(input.doc.tokens[0] ?? "") ? 2 : 4,
    );
    reasons.push("single_token_alias_downweighted");
  }

  return {
    score,
    matched_terms: matchedTerms,
    reasons,
  };
}

function buildCandidateConfidence(candidate: {
  owner_score: number;
  support_score: number;
  caution_score: number;
  total_score: number;
  exact_match: boolean;
  prefix_match: boolean;
}): number {
  return (
    candidate.total_score +
    Math.min(12, Math.round(candidate.owner_score / 12)) +
    (candidate.exact_match ? 12 : 0) +
    (candidate.prefix_match ? 8 : 0) -
    Math.min(8, Math.round(candidate.caution_score / 18))
  );
}

export function pickRetrievedCreateOwner(
  retrieval: RetrieveCreateCandidatesResult,
): CreateRetrievalCandidate | null {
  if (retrieval.owner) {
    return retrieval.owner;
  }

  const [topCandidate] = retrieval.candidates;
  if (!topCandidate) {
    return null;
  }

  const closeCandidates = retrieval.candidates
    .filter((candidate) => candidate.confidence >= topCandidate.confidence - 8)
    .filter((candidate) => candidate.entity_type === topCandidate.entity_type);

  if (closeCandidates.length === 0) {
    return null;
  }

  const [preferred] = [...closeCandidates].sort((left, right) => {
    if (left.explicit_owner_hits !== right.explicit_owner_hits) {
      return right.explicit_owner_hits - left.explicit_owner_hits;
    }
    if (left.structural_weight !== right.structural_weight) {
      return right.structural_weight - left.structural_weight;
    }
    if (left.total_score !== right.total_score) {
      return right.total_score - left.total_score;
    }
    return left.entity_name.localeCompare(right.entity_name);
  });

  return preferred ?? null;
}

function hasExplicitComponentHint(query: string): boolean {
  return /\b(component|components|control|controls|widget|widgets)\b/.test(
    normalizeQuery(query),
  );
}

function hasExplicitPatternHint(query: string): boolean {
  return /\b(pattern|patterns|dashboard|wizard|workflow|app shell|workspace|overview)\b/.test(
    normalizeQuery(query),
  );
}

function deriveCreateQueryCompatibilitySignals(input: {
  query: string;
  structuralPatternIntent: ReturnType<typeof getStructuralPatternIntent>;
}): CreateQueryCompatibilitySignals {
  const normalizedQuery = normalizeQuery(input.query);
  const singleDestinationIntent =
    /\b(link|route|page|pages|site|sites|destination|destinations|document|documents|article|articles|help|details|email|phone)\b/.test(
      normalizedQuery,
    ) &&
    !/\b(sidebar|navigation|menu|menus|toolbar|nav|hierarchy|hierarchical|nested|multi-level|multilevel|sections|tabs)\b/.test(
      normalizedQuery,
    );
  const shellContainerIntent =
    input.structuralPatternIntent.score >= 4 ||
    /\b(dashboard|workspace|app shell|shell|layout|console|control center)\b/.test(
      normalizedQuery,
    );
  const dataDisplayIntent =
    /\b(metric|metrics|kpi|kpis|trend|trends|indicator|indicators|chart|charts|table|tables|grid|grids|analysis|analytics|revenue|expenses|profit|portfolio|performance|stat|stats|value|values)\b/.test(
      normalizedQuery,
    );
  const samePageSectionsIntent =
    /\b(tab|tabs|tabbed|tablist|tabpanel|tab-panel|content panel|content panels)\b/.test(
      normalizedQuery,
    ) ||
    (/\b(section|sections)\b/.test(normalizedQuery) &&
      /\b(switch|switching|between|overview|activity|settings|details|profile)\b/.test(
        normalizedQuery,
      ));

  return {
    single_destination_intent: singleDestinationIntent,
    shell_container_intent: shellContainerIntent,
    data_display_intent: dataDisplayIntent,
    same_page_sections_intent: samePageSectionsIntent,
  };
}

function clampCompatibilityScore(value: number): number {
  return Math.max(0, Math.min(6, value));
}

function deriveCreateCandidateCompatibilitySignals(
  candidate: Pick<
    CreateRetrievalCandidate,
    "entity_name" | "entity_type" | "categories" | "evidence"
  >,
): CreateCandidateCompatibilitySignals {
  const ownerEvidenceText = normalizeQuery(
    candidate.evidence
      .filter((entry) => entry.evidence_role === "owner")
      .map((entry) => entry.text)
      .join(" "),
  );
  const categories = candidate.categories.map(normalizeLookupKey);
  const normalizedName = normalizeLookupKey(candidate.entity_name);

  const shellContainerScore = clampCompatibilityScore(
    (categories.includes("layout-and-shells") ? 2 : 0) +
      ((/\b(dashboard regions|main body region|header region|fixed panel|outer shell|app shell|page shell|shell layout|workspace layout|dashboard pages)\b/.test(
        ownerEvidenceText,
      )
        ? 3
        : 0) +
        (/\b(dashboard|wizard|dialog|workspace|app-header|app-header|header-block)\b/.test(
          normalizedName,
        )
          ? 1
          : 0)),
  );
  const singleDestinationScore = clampCompatibilityScore(
    ((/\b(navigate to a page|same or different site|specific section on the same page|documents email addresses or phone numbers|more detailed information|more detail|linked content|linked destination)\b/.test(
      ownerEvidenceText,
    )
      ? 3
      : 0) +
      (/\b(link|hyperlink|anchor|skip-link)\b/.test(normalizedName) ? 1 : 0)),
  );
  const multiDestinationScore = clampCompatibilityScore(
    ((/\b(multiple levels of navigation|more than eight|group of navigation items|structured vertical navigation|distinct webpages or applications|nested navigation|hierarchy|navigation items)\b/.test(
      ownerEvidenceText,
    )
      ? 3
      : 0) +
      (/\b(vertical-navigation|navigation-item|navigation)\b/.test(
        normalizedName,
      )
        ? 1
        : 0)),
  );
  const dataDisplayScore = clampCompatibilityScore(
    (categories.some((category) =>
      [
        "data-display-and-analysis",
        "data-display-and-visualization",
      ].includes(category),
    )
      ? 2
      : 0) +
      ((/\b(metric|metrics|chart|charts|table|tables|grid|grids|analysis|analytics|kpi|trend|indicator|performance)\b/.test(
        ownerEvidenceText,
      )
        ? 2
        : 0) +
        (/\b(metric|chart|table|data-grid|analytical-dashboard)\b/.test(
          normalizedName,
        )
          ? 1
          : 0)),
  );
  const samePageSectionsScore = clampCompatibilityScore(
    ((/\b(switch between content panels|switch between panels|content panels|tab panels|tabpanel|tab list|tablist|tabbed content|organize content into multiple dashboards using tabs|organize content using tabs)\b/.test(
      ownerEvidenceText,
    )
      ? 3
      : 0) +
      (/\btabs?\b/.test(normalizedName) ? 2 : 0) +
      (categories.includes("navigation") ||
      categories.includes("navigation-and-wayfinding")
        ? 1
        : 0)),
  );

  return {
    shell_container_score: shellContainerScore,
    single_destination_score: singleDestinationScore,
    multi_destination_score: multiDestinationScore,
    data_display_score: dataDisplayScore,
    same_page_sections_score: samePageSectionsScore,
    generic_container_component:
      candidate.entity_type === "component" &&
      categories.includes("containers-and-disclosure"),
  };
}

export function deriveCreateTargetReferenceFromQuery(
  registry: SaltRegistry,
  query: string,
  packageName?: string,
  input?: Omit<RetrieveCreateCandidatesInput, "query" | "package">,
): CreateTargetReference | undefined {
  const exactTarget = resolveCreateNamedTarget(registry, query, packageName);
  if (exactTarget) {
    return {
      requested_entity: query,
      requested_target: exactTarget,
      reference_kind: exactTarget.matched_by.includes("name")
        ? "exact"
        : "alias",
    };
  }

  const prefixTarget = derivePrefixAnchoredCreateTargetReference(
    registry,
    query,
    packageName,
  );
  if (prefixTarget) {
    return prefixTarget;
  }

  const retrieval = retrieveCreateCandidates(registry, {
    query,
    package: packageName,
    top_k: 5,
    solution_type_hint: input?.solution_type_hint,
    status: input?.status,
    filters: input?.filters,
  });

  const fallbackOwner = pickRetrievedCreateOwner(retrieval);
  if (!fallbackOwner || retrieval.status === "none") {
    return undefined;
  }

  const target = resolveCreateNamedTarget(
    registry,
    fallbackOwner.entity_name,
    packageName,
  );
  if (!target) {
    return undefined;
  }

  return {
    requested_entity: query,
    requested_target: target,
    reference_kind: "descriptive",
  };
}

export function retrieveCreateCandidates(
  registry: SaltRegistry,
  input: RetrieveCreateCandidatesInput,
): RetrieveCreateCandidatesResult {
  const query = input.query.trim();
  const normalizedQuery = normalizeQuery(query);
  if (!normalizedQuery) {
    return {
      status: "none",
      owner: null,
      supporting_candidates: [],
      candidates: [],
    };
  }

  const topK = Math.max(1, Math.min(input.top_k ?? 5, 25));
  const queryTerms = getQueryTerms(query);
  const tokenStats = getCreateRetrievalTokenStats(registry);
  const reference = derivePrefixAnchoredCreateTargetReference(
    registry,
    query,
    input.package,
  );
  if (reference) {
    const owner: CreateRetrievalCandidate = {
      entity_id: reference.requested_target.id,
      entity_type: reference.requested_target.entity_type,
      entity_name: reference.requested_target.name,
      package: reference.requested_target.package,
      status: reference.requested_target.status,
      categories: reference.requested_target.categories,
      structural_weight: reference.requested_target.structural_weight,
      owner_score: 120,
      support_score: 0,
      caution_score: 0,
      explicit_owner_hits: 1,
      total_score: 120,
      confidence: 144,
      exact_match: reference.reference_kind === "exact",
      prefix_match: true,
      matched_terms: stemTokenize(reference.requested_target.name),
      match_reasons: [
        reference.reference_kind === "exact"
          ? "exact_prefix_reference"
          : "alias_prefix_reference",
      ],
      evidence: [],
    };

    return {
      status: "exact",
      owner,
      supporting_candidates: [],
      candidates: [owner],
      reference,
    };
  }

  const allowedTargetIds = getAllowedTargetIds(registry, input);
  const candidateMap = new Map<
    string,
    Omit<CreateRetrievalCandidate, "confidence" | "total_score"> & {
      explicit_owner_hits: number;
    }
  >();
  const structuralPatternIntent = getStructuralPatternIntent(query);
  const explicitComponentHint = hasExplicitComponentHint(query);
  const explicitPatternHint = hasExplicitPatternHint(query);
  const queryCompatibility = deriveCreateQueryCompatibilitySignals({
    query,
    structuralPatternIntent,
  });

  for (const doc of getCreateRetrievalIndex(registry)) {
    if (!allowedTargetIds.has(doc.entity_id)) {
      continue;
    }
    if (input.package && doc.package && doc.package !== input.package) {
      continue;
    }
    if (input.status && doc.status && doc.status !== input.status) {
      continue;
    }

    const scored = scoreRetrievalDocument({
      normalized_query: normalizedQuery,
      query_terms: queryTerms,
      doc,
      token_stats: tokenStats,
    });
    if (scored.score <= 0) {
      continue;
    }

    let candidate = candidateMap.get(doc.entity_id);
    if (!candidate) {
      candidate = {
        entity_id: doc.entity_id,
        entity_type: doc.entity_type,
        entity_name: doc.entity_name,
        package: doc.package,
        status: doc.status,
        categories: doc.categories,
        structural_weight: doc.structural_weight,
        owner_score: 0,
        support_score: 0,
        caution_score: 0,
        explicit_owner_hits: 0,
        exact_match: false,
        prefix_match: false,
        matched_terms: [],
        match_reasons: [],
        evidence: [],
      };
      candidateMap.set(doc.entity_id, candidate);
    }

    if (doc.evidence_role === "owner") {
      candidate.owner_score += scored.score;
    } else if (doc.evidence_role === "supporting") {
      candidate.support_score += scored.score;
    } else {
      candidate.caution_score += scored.score;
    }

    if (
      doc.source_kind === "canonical_name" &&
      doc.normalized_text === normalizedQuery
    ) {
      candidate.exact_match = true;
    }
    if (
      doc.source_kind === "canonical_name" &&
      normalizedQuery.startsWith(`${doc.normalized_text} `)
    ) {
      candidate.prefix_match = true;
    }
    if (
      doc.evidence_role === "owner" &&
      (doc.source_kind === "canonical_name" || doc.source_kind === "alias") &&
      (scored.reasons.includes("exact_phrase") ||
        scored.reasons.includes("prefix_phrase") ||
        scored.reasons.includes("full_phrase")) &&
      containsExplicitCreateReferencePhrase(query, doc.text)
    ) {
      candidate.explicit_owner_hits += 1;
    }

    candidate.matched_terms = unique([
      ...candidate.matched_terms,
      ...scored.matched_terms,
    ]).sort();
    candidate.match_reasons = unique([
      ...candidate.match_reasons,
      ...scored.reasons.map((reason) => `${doc.source_kind}:${reason}`),
    ]).sort();
    candidate.evidence.push({
      document_id: doc.id,
      source_kind: doc.source_kind,
      evidence_role: doc.evidence_role,
      score: scored.score,
      text: doc.text,
      matched_terms: scored.matched_terms,
    });
  }

  const hasExplicitComponentSurface = [...candidateMap.values()].some(
    (candidate) =>
      candidate.entity_type === "component" && candidate.explicit_owner_hits > 0,
  );

  const candidates = [...candidateMap.values()]
    .map((candidate) => {
      let totalScore =
        candidate.owner_score +
        Math.round(candidate.support_score * 0.65) -
        Math.round(candidate.caution_score * 0.8) +
        candidate.structural_weight *
          (candidate.entity_type === "component" ? 2 : 1);

      const patternIntentStrong =
        structuralPatternIntent.score >= 4 || explicitPatternHint;

      if (candidate.entity_type === "pattern") {
        if (patternIntentStrong) {
          totalScore += structuralPatternIntent.score * 5 + 18;
        } else if (!candidate.exact_match && !candidate.prefix_match) {
          totalScore = Math.round(
            totalScore * (hasExplicitComponentSurface ? 0.35 : 0.45),
          );
        }
      }
      if (candidate.entity_type === "component") {
        totalScore += candidate.explicit_owner_hits * 18;
        if (explicitComponentHint) {
          totalScore += 20;
        } else if (!patternIntentStrong) {
          totalScore += 8;
        }
        if (
          structuralPatternIntent.score >= 4 &&
          candidate.structural_weight <= 7
        ) {
          totalScore -= 4;
        }
      }

      if (input.solution_type_hint === candidate.entity_type) {
        totalScore += 6;
      }

      const compatibility = deriveCreateCandidateCompatibilitySignals(candidate);

      if (queryCompatibility.single_destination_intent) {
        if (
          compatibility.single_destination_score >
          compatibility.multi_destination_score
        ) {
          totalScore +=
            32 +
            compatibility.single_destination_score * 8 -
            compatibility.multi_destination_score * 4;
        } else if (compatibility.multi_destination_score > 0) {
          totalScore -= 18 + compatibility.multi_destination_score * 8;
        }
      }

      if (queryCompatibility.shell_container_intent) {
        totalScore += compatibility.shell_container_score * 16;
        if (
          candidate.entity_type === "pattern" &&
          compatibility.shell_container_score === 0 &&
          !candidate.exact_match &&
          !candidate.prefix_match
        ) {
          totalScore -= 18;
        }
      }

      if (queryCompatibility.data_display_intent) {
        totalScore += compatibility.data_display_score * 9;
        if (
          compatibility.data_display_score > 0 &&
          candidate.explicit_owner_hits > 0
        ) {
          totalScore += candidate.explicit_owner_hits * 6;
        }
        if (
          compatibility.generic_container_component &&
          compatibility.data_display_score === 0
        ) {
          totalScore -= 26;
        }
      }

      if (queryCompatibility.same_page_sections_intent) {
        totalScore += compatibility.same_page_sections_score * 18;
        if (
          candidate.entity_type === "component" &&
          compatibility.same_page_sections_score > 0 &&
          candidate.explicit_owner_hits > 0
        ) {
          totalScore += 28 + candidate.explicit_owner_hits * 6;
        }
        if (
          candidate.entity_type === "pattern" &&
          compatibility.same_page_sections_score === 0 &&
          !candidate.exact_match &&
          !candidate.prefix_match
        ) {
          totalScore -= 28;
        }
        if (
          !queryCompatibility.data_display_intent &&
          compatibility.shell_container_score > 0 &&
          compatibility.same_page_sections_score === 0
        ) {
          totalScore -= 14;
        }
      }

      return {
        ...candidate,
        total_score: totalScore,
        confidence: buildCandidateConfidence({
          ...candidate,
          total_score: totalScore,
        }),
      };
    })
    .filter((candidate) => candidate.total_score > 0)
    .sort((left, right) => {
      if (left.confidence !== right.confidence) {
        return right.confidence - left.confidence;
      }
      if (left.total_score !== right.total_score) {
        return right.total_score - left.total_score;
      }
      if (left.structural_weight !== right.structural_weight) {
        return right.structural_weight - left.structural_weight;
      }
      return left.entity_name.localeCompare(right.entity_name);
    })
    .slice(0, topK);

  const [topCandidate, secondCandidate] = candidates;
  if (!topCandidate) {
    return {
      status: "none",
      owner: null,
      supporting_candidates: [],
      candidates: [],
    };
  }

  const dominantMargin =
    topCandidate.confidence - (secondCandidate?.confidence ?? 0);
  const supportingCandidates = candidates.filter(
    (candidate) =>
      candidate.entity_id !== topCandidate.entity_id &&
      candidate.total_score >=
        Math.max(12, Math.round(topCandidate.total_score * 0.45)) &&
      candidate.confidence >= Math.max(10, topCandidate.confidence - 18),
  );

  if (topCandidate.exact_match || topCandidate.prefix_match) {
    return {
      status: "exact",
      owner: topCandidate,
      supporting_candidates: supportingCandidates,
      candidates,
    };
  }

  if (
    topCandidate.total_score < 18 ||
    (topCandidate.total_score < 26 && dominantMargin < 6)
  ) {
    return {
      status: "ambiguous",
      owner: null,
      supporting_candidates: supportingCandidates,
      candidates,
    };
  }

  return {
    status: dominantMargin < 5 ? "ambiguous" : "ranked",
    owner: dominantMargin < 5 ? null : topCandidate,
    supporting_candidates: supportingCandidates,
    candidates,
  };
}
