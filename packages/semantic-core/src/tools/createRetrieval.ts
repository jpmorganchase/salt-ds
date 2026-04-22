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
import { resolveComponentTarget } from "./componentLookup.js";
import type { ConsumerRecommendationFilters } from "./consumerFilters.js";
import {
  matchesComponentConsumerFilters,
  matchesPatternConsumerFilters,
} from "./consumerFilters.js";
import {
  getEffectiveUsageSemantics,
  inferComponentCapabilities,
} from "./consumerSignals.js";
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

export interface RetrieveCreateSupportCandidatesInput {
  query: string;
  owner_name: string;
  owner_categories?: string[];
  top_k?: number;
}

interface CreateRetrievalTokenStats {
  entity_count: number;
  entity_frequency: Map<string, number>;
}

function hasBreadcrumbWayfindingIntent(query: string): boolean {
  const normalizedQuery = normalizeQuery(query);
  if (!normalizedQuery) {
    return false;
  }

  return (
    /\b(path trail|breadcrumb|breadcrumbs|current directory path|directory path|directory tree|hierarchy path)\b/.test(
      normalizedQuery,
    ) ||
    (/\b(path|directory|tree|trail|folders|hierarchy)\b/.test(
      normalizedQuery,
    ) &&
      /\b(navigate back|back up|current location|current directory|previous levels|previous level|drill down)\b/.test(
        normalizedQuery,
      )) ||
    (/\b(file browser|file manager)\b/.test(normalizedQuery) &&
      /\b(path|trail|directory)\b/.test(normalizedQuery))
  );
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
const LOW_SIGNAL_SINGLE_TOKEN_SUPPORT_SOURCES =
  new Set<CreateRetrievalSourceKind>(["tag"]);
const OWNER_RETRIEVAL_EXCLUDED_SOURCES = new Set<CreateRetrievalSourceKind>([
  "example",
  "prop",
  "pattern_composition",
  "pattern_how_to_build",
  "pattern_how_it_works",
  "starter_scaffold_region",
  "starter_scaffold_build_around",
  "starter_scaffold_constraint",
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

function deriveSemanticCreateQueryExpansions(
  query: string,
  mode: "owner" | "support" = "owner",
): string[] {
  const normalizedQuery = normalizeQuery(query);
  if (!normalizedQuery) {
    return [];
  }

  const expansions: string[] = [];
  const multiStateMatches =
    Number(/\bloading\b/.test(normalizedQuery)) +
    Number(/\bempty\b/.test(normalizedQuery)) +
    Number(/\berror\b/.test(normalizedQuery)) +
    Number(/\bwarning\b/.test(normalizedQuery)) +
    Number(/\bsuccess\b/.test(normalizedQuery));

  if (mode === "support" && hasBreadcrumbWayfindingIntent(query)) {
    expansions.push(
      "current location within a hierarchy previous levels secondary navigation drill down into tables or charts",
    );
  }

  if (
    /\b(navigate|navigation|navigating)\b/.test(normalizedQuery) &&
    /\b(route|routes|destination|destinations)\b/.test(normalizedQuery) &&
    !/\b(sidebar|hierarchy|nested|submenu|section|sections)\b/.test(
      normalizedQuery,
    )
  ) {
    expansions.push(
      "link to another page or site related information same page section",
    );
  }

  if (
    /\b(tab|tabs|tabbed|tablist|tabpanel|tab-panel|content panel|content panels)\b/.test(
      normalizedQuery,
    ) ||
    (/\b(section|sections)\b/.test(normalizedQuery) &&
      /\b(switch|switching|between|overview|activity|settings|details|profile)\b/.test(
        normalizedQuery,
      ))
  ) {
    expansions.push(
      "switch between content panels within a single page same page sections",
    );
  }

  if (
    (/\b(toggle|toggled|toggling|enable|enabled|disable|disabled|switch on|switch off)\b/.test(
      normalizedQuery,
    ) ||
      (/\bturn\b/.test(normalizedQuery) &&
        /\b(on|off)\b/.test(normalizedQuery)) ||
      (/\bon\b/.test(normalizedQuery) && /\boff\b/.test(normalizedQuery))) &&
    /\b(control|setting|settings|alert|alerts|preference|preferences|form|forms)\b/.test(
      normalizedQuery,
    )
  ) {
    expansions.push(
      "binary control between two different states adjusting settings or preferences immediate effect",
    );
  }

  if (
    multiStateMatches >= 2 &&
    (/\b(content|container|region|area)\b/.test(normalizedQuery) ||
      /\bnot (?:as )?a global\b/.test(normalizedQuery) ||
      /\bcurrent\b/.test(normalizedQuery))
  ) {
    expansions.push(
      "loading empty warning error success states inside a container component tied to the current content area",
    );
  }

  if (
    /\b(single|one|summary)\b/.test(normalizedQuery) &&
    /\b(metric|metrics|kpi|kpis|value|values|indicator|indicators|trend|trends|label|labels)\b/.test(
      normalizedQuery,
    ) &&
    !/\b(dashboard|dashboards|table|tables|grid|grids|chart|charts|shell|layout|workspace)\b/.test(
      normalizedQuery,
    )
  ) {
    expansions.push(
      "key performance indicator single value label trend indicator",
    );
  }

  return unique(expansions);
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
      source_weight: 8,
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
      source_weight: 4,
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
      source_weight: 6,
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
      source_weight: 6,
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
      source_weight: 8,
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
      source_weight: 4,
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
      source_weight: 5,
      categories: pattern.category ?? [],
      structural_weight: structuralWeight,
    });
  }
  for (const value of pattern.starter_scaffold?.semantics
    .preserve_constraints ?? []) {
    pushRetrievalDocument(docs, {
      entity_id: pattern.id,
      entity_type: "pattern",
      entity_name: pattern.name,
      package: null,
      status: pattern.status,
      source_kind: "starter_scaffold_constraint",
      evidence_role: "caution",
      text: value,
      source_weight: 6,
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
    ...registry.patterns.flatMap((pattern) =>
      buildPatternRetrievalDocs(pattern),
    ),
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
    ...registry.patterns.map((pattern) =>
      buildCreateNamedTargetFromPattern(pattern),
    ),
  ];
  CREATE_TARGET_CACHE.set(registry, targets);
  return targets;
}

export function resolveCreateNamedTarget(
  registry: SaltRegistry,
  query: string,
  packageName?: string,
  preferredEntityType?: CreateRetrievalEntityType,
): CreateNamedTarget | null {
  const componentResolution = resolveComponentTarget(
    registry,
    query,
    packageName,
  );
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

  if (preferredEntityType) {
    const preferredCandidate =
      candidates.find(
        (candidate) => candidate.entity_type === preferredEntityType,
      ) ?? null;
    if (preferredCandidate) {
      return preferredCandidate;
    }
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
    const structuralPatternIntent = getStructuralPatternIntent(queryVariant);
    if (structuralPatternIntent.score >= 4) {
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

    const normalizedLookupKey = normalizeLookupKey(first.lookupKey);
    const normalizedTargetName = normalizeLookupKey(first.target.name);
    const singleTokenAliasReference =
      normalizedLookupKey !== normalizedTargetName &&
      countLookupTokens(normalizedLookupKey) === 1;

    if (singleTokenAliasReference && getQueryTerms(queryVariant).length >= 3) {
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
  semantic_queries: string[];
  query_terms: string[];
  doc: CreateRetrievalDocument;
  token_stats: CreateRetrievalTokenStats;
}): { score: number; matched_terms: string[]; reasons: string[] } {
  const queryTermSet = new Set(input.query_terms);
  const matchedTerms = unique(
    input.doc.stemmed_tokens.filter((token) => queryTermSet.has(token)),
  );
  const exact = input.doc.normalized_text === input.normalized_query;
  const prefix = input.normalized_query.startsWith(
    `${input.doc.normalized_text} `,
  );
  const phrase = [input.normalized_query, ...input.semantic_queries].some(
    (normalizedQuery) =>
      containsWholeWordPhrase(normalizedQuery, input.doc.normalized_text),
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
    input.doc.source_kind === "canonical_name" &&
    input.doc.tokens.length === 1 &&
    input.query_terms.length >= 4 &&
    !exact &&
    !prefix
  ) {
    score = Math.min(score, 18);
    reasons.push("single_token_name_downweighted");
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

  if (
    input.doc.source_kind === "alias" &&
    input.doc.tokens.length === 1 &&
    input.query_terms.length >= 3 &&
    prefix &&
    !exact
  ) {
    score = Math.min(
      score,
      LOW_SIGNAL_SINGLE_TOKEN_ALIASES.has(input.doc.tokens[0] ?? "") ? 4 : 10,
    );
    reasons.push("single_token_alias_prefix_downweighted");
  }

  if (
    LOW_SIGNAL_SINGLE_TOKEN_SUPPORT_SOURCES.has(input.doc.source_kind) &&
    input.doc.tokens.length === 1 &&
    input.query_terms.length >= 3 &&
    !exact &&
    !prefix
  ) {
    score = Math.min(score, 4);
    reasons.push("single_token_support_downweighted");
  }

  if (
    LOW_SIGNAL_SINGLE_TOKEN_SUPPORT_SOURCES.has(input.doc.source_kind) &&
    input.doc.tokens.length === 1 &&
    input.query_terms.length >= 3 &&
    prefix &&
    !exact
  ) {
    score = Math.min(score, 4);
    reasons.push("single_token_support_prefix_downweighted");
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
  options?: {
    prefer_component?: boolean;
    prefer_structural_patterns?: boolean;
  },
): CreateRetrievalCandidate | null {
  if (retrieval.owner) {
    return retrieval.owner;
  }

  const [topCandidate] = retrieval.candidates;
  if (!topCandidate) {
    return null;
  }

  const closeCandidates = retrieval.candidates
    .filter(
      (candidate) =>
        candidate.confidence >=
        topCandidate.confidence - (options?.prefer_component ? 60 : 8),
    )
    .filter((candidate) =>
      options?.prefer_component
        ? true
        : candidate.entity_type === topCandidate.entity_type,
    );

  if (closeCandidates.length === 0) {
    return null;
  }

  const [preferred] = [...closeCandidates].sort((left, right) => {
    if (options?.prefer_component && left.entity_type !== right.entity_type) {
      return left.entity_type === "component" ? -1 : 1;
    }

    if (
      options?.prefer_component &&
      left.entity_type === "component" &&
      right.entity_type === "component"
    ) {
      if (left.explicit_owner_hits !== right.explicit_owner_hits) {
        return right.explicit_owner_hits - left.explicit_owner_hits;
      }
      if (left.owner_score !== right.owner_score) {
        return right.owner_score - left.owner_score;
      }
    }

    if (
      options?.prefer_structural_patterns &&
      left.entity_type === "pattern" &&
      right.entity_type === "pattern" &&
      left.structural_weight !== right.structural_weight
    ) {
      return right.structural_weight - left.structural_weight;
    }

    if (left.explicit_owner_hits !== right.explicit_owner_hits) {
      return right.explicit_owner_hits - left.explicit_owner_hits;
    }
    if (left.total_score !== right.total_score) {
      return right.total_score - left.total_score;
    }
    if (left.structural_weight !== right.structural_weight) {
      return right.structural_weight - left.structural_weight;
    }
    return left.entity_name.localeCompare(right.entity_name);
  });

  return preferred ?? null;
}

export function hasExplicitComponentHint(query: string): boolean {
  return /\b(component|components|control|controls|widget|widgets)\b/.test(
    normalizeQuery(query),
  );
}

export function hasExplicitPatternHint(query: string): boolean {
  return /\b(pattern|patterns|dashboard|wizard|workflow|app shell|workspace|overview)\b/.test(
    normalizeQuery(query),
  );
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
  const retrievalQuery =
    [...getCreateReferenceQueries(query)].sort(
      (left, right) => left.length - right.length,
    )[0] ?? query;
  const normalizedQuery = normalizeQuery(retrievalQuery);
  if (!normalizedQuery) {
    return {
      status: "none",
      owner: null,
      supporting_candidates: [],
      candidates: [],
    };
  }

  const topK = Math.max(1, Math.min(input.top_k ?? 5, 25));
  const semanticExpansions = deriveSemanticCreateQueryExpansions(
    retrievalQuery,
    "owner",
  );
  const semanticQueries = semanticExpansions
    .map((expansion) => normalizeQuery(expansion))
    .filter(Boolean);
  const queryTerms = getQueryTerms(
    [retrievalQuery, ...semanticExpansions].join(" "),
  );
  const tokenStats = getCreateRetrievalTokenStats(registry);
  const reference = derivePrefixAnchoredCreateTargetReference(
    registry,
    retrievalQuery,
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
  const structuralPatternIntent = getStructuralPatternIntent(retrievalQuery);
  const explicitComponentHint = hasExplicitComponentHint(retrievalQuery);
  const explicitPatternHint = hasExplicitPatternHint(retrievalQuery);

  for (const doc of getCreateRetrievalIndex(registry)) {
    if (!allowedTargetIds.has(doc.entity_id)) {
      continue;
    }
    if (OWNER_RETRIEVAL_EXCLUDED_SOURCES.has(doc.source_kind)) {
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
      semantic_queries: semanticQueries,
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
      candidate.entity_type === "component" &&
      candidate.explicit_owner_hits > 0,
  );

  const candidates = [...candidateMap.values()]
    .map((candidate) => {
      let totalScore =
        candidate.owner_score +
        Math.round(candidate.support_score * 0.45) -
        Math.round(candidate.caution_score * 0.8) +
        candidate.structural_weight *
          (candidate.entity_type === "component" ? 2 : 1);

      const patternIntentStrong =
        structuralPatternIntent.score >= 4 || explicitPatternHint;

      if (candidate.entity_type === "pattern") {
        if (patternIntentStrong) {
          totalScore += structuralPatternIntent.score * 5 + 18;
          totalScore -= Math.round(candidate.caution_score * 0.35);
        } else if (!candidate.exact_match && !candidate.prefix_match) {
          const hasStrongOwnerEvidence =
            candidate.explicit_owner_hits > 0 ||
            candidate.owner_score >= 48 ||
            candidate.structural_weight >= 13;
          const penalty =
            explicitComponentHint &&
            !hasStrongOwnerEvidence &&
            !candidate.exact_match &&
            !candidate.prefix_match
              ? 0.42
              : hasExplicitComponentSurface && !hasStrongOwnerEvidence
                ? 0.65
                : hasStrongOwnerEvidence
                  ? 0.92
                  : 0.8;
          totalScore = Math.round(totalScore * penalty);
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
        Math.max(8, Math.round(topCandidate.total_score * 0.18)) &&
      candidate.confidence >= Math.max(6, topCandidate.confidence - 96),
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
    (topCandidate.total_score < 26 && dominantMargin < 8)
  ) {
    return {
      status: "ambiguous",
      owner: null,
      supporting_candidates: supportingCandidates,
      candidates,
    };
  }

  return {
    status: dominantMargin < 8 ? "ambiguous" : "ranked",
    owner: dominantMargin < 8 ? null : topCandidate,
    supporting_candidates: supportingCandidates,
    candidates,
  };
}

export function retrieveCreateSupportCandidates(
  registry: SaltRegistry,
  input: RetrieveCreateSupportCandidatesInput,
): CreateRetrievalCandidate[] {
  const ownerCategories = input.owner_categories ?? [];
  const supportQuery = [
    input.query,
    input.owner_name,
    ...ownerCategories.map((category) => category.replace(/-/g, " ")),
  ]
    .filter(Boolean)
    .join(" ");
  const normalizedQuery = normalizeQuery(supportQuery);
  if (!normalizedQuery) {
    return [];
  }

  const topK = Math.max(1, Math.min(input.top_k ?? 8, 25));
  const semanticExpansions = deriveSemanticCreateQueryExpansions(
    input.query,
    "support",
  );
  const semanticQueries = semanticExpansions
    .map((expansion) => normalizeQuery(expansion))
    .filter(Boolean);
  const queryTerms = getQueryTerms(
    [supportQuery, ...semanticExpansions].join(" "),
  );
  const tokenStats = getCreateRetrievalTokenStats(registry);
  const ownerCategorySet = new Set(ownerCategories.map(normalizeLookupKey));
  const ownerTerms = new Set(
    stemTokenize([input.owner_name, ...ownerCategories].join(" ")),
  );
  const candidateMap = new Map<
    string,
    Omit<CreateRetrievalCandidate, "confidence" | "total_score"> & {
      explicit_owner_hits: number;
    }
  >();

  for (const doc of getCreateRetrievalIndex(registry)) {
    const scored = scoreRetrievalDocument({
      normalized_query: normalizedQuery,
      semantic_queries: semanticQueries,
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

  return [...candidateMap.values()]
    .filter((candidate) => candidate.entity_name !== input.owner_name)
    .map((candidate) => {
      let totalScore =
        candidate.owner_score +
        Math.round(candidate.support_score * 0.65) -
        Math.round(candidate.caution_score * 0.8) +
        candidate.structural_weight;
      const ownerLinkedTermCount = unique(
        candidate.evidence.flatMap((entry) =>
          stemTokenize(entry.text).filter((token) => ownerTerms.has(token)),
        ),
      ).length;
      const categoryOverlap = candidate.categories.some((category) =>
        ownerCategorySet.has(normalizeLookupKey(category)),
      );
      totalScore += ownerLinkedTermCount * 12;
      if (!categoryOverlap) {
        totalScore += 6;
      } else {
        totalScore -= 4;
      }
      if (ownerLinkedTermCount === 0) {
        totalScore -= 18;
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
}
