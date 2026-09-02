import { resolveKnowledgeCompatibility } from "../compatibility/resolveCompatibility.js";
import { canonicalJson } from "../manifest/canonicalJson.js";
import { sha256Digest } from "../manifest/digestCodec.js";
import type {
  KnowledgeRecordFamily,
  KnowledgeRecordStore,
} from "../manifest/knowledgeStore.js";
import { renderUntrustedMarkdownEvidence } from "../markdown/untrustedMarkdown.js";

export const KNOWLEDGE_SEARCH_SCORING_VERSION =
  "salt-lexical-ranking/1" as const;
export const KNOWLEDGE_SEARCH_STOP_WORD_VERSION = "salt-stop-words/1" as const;

export const KNOWLEDGE_SEARCH_TARGET_FAMILY_NAMES = [
  "api_symbol",
  "component",
  "concept",
  "country_symbol",
  "deprecation",
  "guide",
  "icon",
  "package",
  "page",
  "pattern",
  "token",
] as const;

export type KnowledgeSearchTargetFamilyName =
  (typeof KNOWLEDGE_SEARCH_TARGET_FAMILY_NAMES)[number];

interface KnowledgeSearchDocument {
  target: { family: KnowledgeSearchTargetFamilyName; id: string };
  title: string;
  summary: string;
  terms: string[];
  facets: { status?: string[] };
}

export interface SearchSaltInput {
  query: string;
  families?: KnowledgeSearchTargetFamilyName[];
  statuses?: string[];
  limit?: number;
  /** Exact installed Salt package versions. Omit to query the tested vector. */
  installed_versions?: Readonly<Record<string, string | null | undefined>>;
}

export interface SaltKnowledgeRecordReference {
  family: KnowledgeSearchTargetFamilyName;
  id: string;
}

export type KnowledgeSearchMatchedField =
  | "record_id"
  | "export_name"
  | "canonical_name"
  | "title"
  | "aliases"
  | "search_terms"
  | "summary"
  | "kind";

export interface SearchSaltRecordMatch {
  reference: SaltKnowledgeRecordReference;
  title: string;
  summary: string;
  citation: {
    record_key: string;
    bundle_digest: string;
    source_records: string[];
  };
  evidence: {
    scoring_version: typeof KNOWLEDGE_SEARCH_SCORING_VERSION;
    matched_fields: KnowledgeSearchMatchedField[];
    matched_terms: string[];
    score: number;
    score_components: Record<string, number>;
  };
}

export interface SearchSaltRecordsResult {
  contract: "salt-knowledge-search-result/1";
  scoring_version: typeof KNOWLEDGE_SEARCH_SCORING_VERSION;
  stop_word_version: typeof KNOWLEDGE_SEARCH_STOP_WORD_VERSION;
  bundle_digest: string;
  query: string;
  matches: SearchSaltRecordMatch[];
  searched_families: KnowledgeSearchTargetFamilyName[];
  searched_statuses: string[] | null;
  indexed_documents: number;
  evaluated_documents: number;
  excluded_documents: number;
  excluded_package_families: Array<{
    name: string;
    state: string;
    observed_version: string | null;
    supported_range: string;
  }>;
  matched_documents: number;
  candidate_count: number;
  top_score_tie_count: number;
}

export const MAX_KNOWLEDGE_SEARCH_RESULTS = 100;
export const DEFAULT_SEARCH_RESULTS = 8;
const WORD_PATTERN = /[\p{L}\p{N}]+/gu;
const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "for",
  "how",
  "in",
  "of",
  "or",
  "the",
  "to",
  "versus",
  "vs",
  "with",
]);

export function normalizeKnowledgeQuery(value: string): string {
  return value
    .normalize("NFKC")
    .toLocaleLowerCase("en-US")
    .trim()
    .replace(/\s+/gu, " ");
}

function allWords(value: string): string[] {
  const segmented = value
    .normalize("NFKC")
    .replace(/([\p{Ll}\p{N}])([\p{Lu}])/gu, "$1 $2");
  return [
    ...new Set(normalizeKnowledgeQuery(segmented).match(WORD_PATTERN) ?? []),
  ];
}

function meaningfulWords(value: string): string[] {
  const tokens = allWords(value);
  const withoutStopWords = tokens.filter((token) => !STOP_WORDS.has(token));
  return withoutStopWords.length > 0 ? withoutStopWords : tokens;
}

function selectedFamilies(
  requested: readonly KnowledgeSearchTargetFamilyName[] | undefined,
): KnowledgeSearchTargetFamilyName[] {
  const allow = new Set(KNOWLEDGE_SEARCH_TARGET_FAMILY_NAMES);
  return requested && requested.length > 0
    ? [...new Set(requested)].filter((family) => allow.has(family))
    : [...KNOWLEDGE_SEARCH_TARGET_FAMILY_NAMES];
}

function hasSelectedStatus(
  document: KnowledgeSearchDocument,
  requested: readonly string[] | undefined,
): boolean {
  if (!requested || requested.length === 0) return true;
  const allowed = new Set(requested.map(normalizeKnowledgeQuery));
  return (document.facets.status ?? []).some((status) =>
    allowed.has(normalizeKnowledgeQuery(status)),
  );
}

function strings(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((entry): entry is string => typeof entry === "string")
    : [];
}

function collectReferences(
  value: unknown,
  family: string,
  ids: Set<string>,
): void {
  if (Array.isArray(value)) {
    for (const entry of value) collectReferences(entry, family, ids);
    return;
  }
  if (!value || typeof value !== "object") return;
  const candidate = value as Record<string, unknown>;
  if (candidate.family === family && typeof candidate.id === "string") {
    ids.add(candidate.id);
  }
  for (const entry of Object.values(candidate)) {
    collectReferences(entry, family, ids);
  }
}

function sourceCitations(record: unknown): string[] {
  const ids = new Set<string>();
  collectReferences(record, "source", ids);
  return [...ids].sort();
}

function packageNamesForRecord(
  store: KnowledgeRecordStore,
  reference: SaltKnowledgeRecordReference,
  record: any,
): string[] {
  const packageIds = new Set<string>();
  collectReferences(record, "package", packageIds);
  if (reference.family === "package") packageIds.add(reference.id);
  return [...packageIds]
    .map((id) => store.getRecord("package", id)?.name)
    .filter((name): name is string => typeof name === "string")
    .sort();
}

function testedPackageVector(store: KnowledgeRecordStore) {
  if (!Array.isArray(store.manifest.compatibility?.packages)) return {};
  return Object.fromEntries(
    store.manifest.compatibility.packages.map((entry) => [
      entry.name,
      entry.tested_version,
    ]),
  );
}

export function resolveKnowledgeRecordCompatibility(
  store: KnowledgeRecordStore,
  reference: SaltKnowledgeRecordReference,
  installedVersions?: Readonly<Record<string, string | null | undefined>>,
) {
  const record = store.getRecord(reference.family, reference.id);
  if (!record) return { included: false, packages: [] };
  const decision = resolveKnowledgeCompatibility(
    store.manifest,
    installedVersions ?? testedPackageVector(store),
  );
  const byName = new Map(decision.packages.map((entry) => [entry.name, entry]));
  const packages = packageNamesForRecord(store, reference, record).map(
    (name) => byName.get(name)!,
  );
  return {
    included: packages.every((entry) => entry.usable),
    packages,
  };
}

function includesPhrase(field: string, queryWords: readonly string[]): boolean {
  if (queryWords.length === 0) return false;
  const fieldWords = allWords(field);
  if (queryWords.length > fieldWords.length) return false;
  return fieldWords.some((_, start) =>
    queryWords.every((word, offset) => fieldWords[start + offset] === word),
  );
}

interface RankedDocument {
  score: number;
  matchedFields: KnowledgeSearchMatchedField[];
  matchedTerms: string[];
  scoreComponents: Record<string, number>;
}

function relatedSearchTerms(
  store: KnowledgeRecordStore,
  document: KnowledgeSearchDocument,
  record: any,
): string[] {
  if (document.target.family !== "deprecation") return [];
  const subject =
    record?.subject_ref?.family === "api_symbol"
      ? store.getRecord("api_symbol", record.subject_ref.id)
      : null;
  const component =
    record?.component_ref?.family === "component"
      ? store.getRecord("component", record.component_ref.id)
      : null;
  return [
    "deprecated",
    "migration",
    "replacement",
    typeof subject?.export_name === "string" ? subject.export_name : "",
    ...(Array.isArray(subject?.member_path)
      ? subject.member_path
          .map((member: any) => member?.name)
          .filter((name: unknown): name is string => typeof name === "string")
      : []),
    typeof component?.name === "string" ? component.name : "",
    ...strings(component?.aliases),
  ].filter(Boolean);
}

function rankDocument(
  document: KnowledgeSearchDocument,
  record: any,
  relatedTerms: readonly string[],
  normalizedQuery: string,
  queryWords: readonly string[],
): RankedDocument | null {
  if (normalizedQuery.length === 0 || queryWords.length === 0) return null;
  const canonicalName =
    typeof record?.name === "string"
      ? record.name
      : typeof record?.title === "string"
        ? record.title
        : document.title;
  const aliases = strings(record?.aliases);
  const exportName =
    typeof record?.export_name === "string" ? record.export_name : "";
  const kinds = [
    document.target.family,
    typeof record?.kind === "string" ? record.kind : "",
    typeof record?.page_kind === "string" ? record.page_kind : "",
    typeof record?.category === "string" ? record.category : "",
  ].filter(Boolean);
  const normalizedAliases = new Set(aliases.map(normalizeKnowledgeQuery));
  const authoredTerms = document.terms.filter((term) => {
    const normalized = normalizeKnowledgeQuery(term);
    return (
      normalized !== normalizeKnowledgeQuery(canonicalName) &&
      !normalizedAliases.has(normalized)
    );
  });
  const fields: Array<{
    name: KnowledgeSearchMatchedField;
    values: string[];
    weight: number;
  }> = [
    { name: "record_id", values: [document.target.id], weight: 220 },
    {
      name: "export_name",
      values: exportName ? [exportName] : [],
      weight: 210,
    },
    { name: "canonical_name", values: [canonicalName], weight: 200 },
    { name: "title", values: [document.title], weight: 180 },
    { name: "aliases", values: aliases, weight: 170 },
    {
      name: "search_terms",
      values: [...authoredTerms, ...relatedTerms],
      weight: 110,
    },
    { name: "summary", values: [document.summary], weight: 35 },
    { name: "kind", values: kinds, weight: 80 },
  ];
  const exactId =
    normalizeKnowledgeQuery(document.target.id) === normalizedQuery;
  const exactExport =
    exportName.length > 0 &&
    normalizeKnowledgeQuery(exportName) === normalizedQuery;
  const exactCanonical =
    normalizeKnowledgeQuery(canonicalName) === normalizedQuery;
  const exactAlias = aliases.some(
    (alias) => normalizeKnowledgeQuery(alias) === normalizedQuery,
  );
  const exactTitle =
    normalizeKnowledgeQuery(document.title) === normalizedQuery;
  const components: Record<string, number> = {};
  if (exactId) components.exact_record_id = 12_000;
  if (exactExport) components.exact_export_name = 11_000;
  if (exactCanonical) components.exact_canonical_name = 10_000;
  if (exactAlias) components.exact_alias = 9_000;
  if (exactTitle && !exactCanonical) components.exact_title = 8_500;

  const matchedFields = new Set<KnowledgeSearchMatchedField>();
  const matchedTerms = new Set<string>();
  for (const field of fields) {
    const fieldTokens = new Set(field.values.flatMap(allWords));
    const matching = queryWords.filter((word) => fieldTokens.has(word));
    if (matching.length === 0) continue;
    matchedFields.add(field.name);
    for (const term of matching) matchedTerms.add(term);
    components[`union_${field.name}`] = matching.length * field.weight;
    if (queryWords.every((word) => fieldTokens.has(word))) {
      components[`intersection_${field.name}`] = 900;
    }
    if (field.values.some((value) => includesPhrase(value, queryWords))) {
      components[`phrase_${field.name}`] = 1_500;
    }
  }
  const queryIntent = new Set(queryWords);
  if (queryIntent.has(document.target.family.replace("_", ""))) {
    components.kind_intent = 300;
  }
  if (
    (queryIntent.has("deprecated") || queryIntent.has("migration")) &&
    (document.target.family === "deprecation" ||
      record?.status === "deprecated")
  ) {
    components.migration_intent = 500;
  }
  if (exactId) matchedFields.add("record_id");
  if (exactExport) matchedFields.add("export_name");
  if (exactCanonical) matchedFields.add("canonical_name");
  if (exactAlias) matchedFields.add("aliases");
  if (exactTitle) matchedFields.add("title");
  const score = Object.values(components).reduce(
    (sum, value) => sum + value,
    0,
  );
  return score === 0
    ? null
    : {
        score,
        matchedFields: [...matchedFields],
        matchedTerms: [...matchedTerms].sort().slice(0, 8),
        scoreComponents: components,
      };
}

/** Deterministic Knowledge-v1 retrieval; compatibility precedes scoring. */
export function searchSaltRecords(
  store: KnowledgeRecordStore,
  input: SearchSaltInput,
): SearchSaltRecordsResult {
  const query = input.query.trim();
  const normalizedQuery = normalizeKnowledgeQuery(query);
  const queryWords = meaningfulWords(query);
  const families = selectedFamilies(input.families);
  const statuses =
    input.statuses && input.statuses.length > 0
      ? [...new Set(input.statuses.map(normalizeKnowledgeQuery))]
      : null;
  const familySet = new Set<KnowledgeSearchTargetFamilyName>(families);
  const documents = store.getFamily(
    "search_document",
  ) as readonly KnowledgeSearchDocument[];
  const limit = Math.min(
    MAX_KNOWLEDGE_SEARCH_RESULTS,
    Math.max(1, input.limit ?? DEFAULT_SEARCH_RESULTS),
  );
  const hasCompatibility = Array.isArray(
    store.manifest.compatibility?.packages,
  );
  const compatibility = hasCompatibility
    ? resolveKnowledgeCompatibility(
        store.manifest,
        input.installed_versions ?? testedPackageVector(store),
      )
    : { packages: [] };
  const compatibilityByName = new Map(
    compatibility.packages.map((entry) => [entry.name, entry]),
  );

  let evaluatedDocuments = 0;
  let excludedDocuments = 0;
  const excludedNames = new Set<string>();
  const ranked = documents.flatMap((document) => {
    if (
      !familySet.has(document.target.family) ||
      !hasSelectedStatus(document, statuses ?? undefined)
    ) {
      return [];
    }
    const record =
      typeof store.getRecord === "function"
        ? store.getRecord(document.target.family, document.target.id)
        : {
            family: document.target.family,
            id: document.target.id,
            title: document.title,
            summary: document.summary,
          };
    if (!record) return [];
    const packageNames = hasCompatibility
      ? packageNamesForRecord(store, document.target, record)
      : [];
    const incompatible = hasCompatibility
      ? packageNames.filter(
          (name) => compatibilityByName.get(name)?.usable !== true,
        )
      : [];
    if (incompatible.length > 0) {
      excludedDocuments += 1;
      for (const name of incompatible) excludedNames.add(name);
      return [];
    }
    evaluatedDocuments += 1;
    const ranking = rankDocument(
      document,
      record,
      relatedSearchTerms(store, document, record),
      normalizedQuery,
      queryWords,
    );
    return ranking ? [{ document, record, ranking }] : [];
  });
  ranked.sort(
    (left, right) =>
      right.ranking.score - left.ranking.score ||
      left.document.target.id.localeCompare(right.document.target.id) ||
      left.document.target.family.localeCompare(right.document.target.family),
  );
  const topScore = ranked[0]?.ranking.score;
  const topScoreTieCount =
    topScore === undefined
      ? 0
      : ranked.filter((entry) => entry.ranking.score === topScore).length;
  const bundleDigest =
    store.manifest.bundle_digest ?? store.manifest.semantic_digest;

  return {
    contract: "salt-knowledge-search-result/1",
    scoring_version: KNOWLEDGE_SEARCH_SCORING_VERSION,
    stop_word_version: KNOWLEDGE_SEARCH_STOP_WORD_VERSION,
    bundle_digest: bundleDigest,
    query,
    matches: ranked.slice(0, limit).map(({ document, record, ranking }) => ({
      reference: {
        family: document.target.family,
        id: document.target.id,
      },
      title: document.title,
      summary: document.summary,
      citation: {
        record_key: `record:${document.target.family}:${document.target.id}`,
        bundle_digest: bundleDigest,
        source_records: sourceCitations(record),
      },
      evidence: {
        scoring_version: KNOWLEDGE_SEARCH_SCORING_VERSION,
        matched_fields: ranking.matchedFields,
        matched_terms: ranking.matchedTerms,
        score: ranking.score,
        score_components: ranking.scoreComponents,
      },
    })),
    searched_families: families,
    searched_statuses: statuses,
    indexed_documents: documents.length,
    evaluated_documents: evaluatedDocuments,
    excluded_documents: excludedDocuments,
    excluded_package_families: [...excludedNames].sort().map((name) => {
      const decision = compatibilityByName.get(name)!;
      return {
        name,
        state: decision.state,
        observed_version: decision.installed_version,
        supported_range: decision.supported_range,
      };
    }),
    matched_documents: ranked.length,
    candidate_count: ranked.length,
    top_score_tie_count: topScoreTieCount,
  };
}

export const searchKnowledge = searchSaltRecords;

export function readKnowledgeRecord(
  store: KnowledgeRecordStore,
  reference: { family: KnowledgeRecordFamily; id: string },
): unknown | null {
  return store.getRecord(reference.family, reference.id);
}

export interface KnowledgeContextResult {
  contract: "salt-knowledge-context/1";
  scoring_version: typeof KNOWLEDGE_SEARCH_SCORING_VERSION;
  query: string;
  bundle_digest: string;
  context_digest: string;
  matches: SearchSaltRecordMatch[];
  excluded_package_families: SearchSaltRecordsResult["excluded_package_families"];
  truncated: boolean;
  utf8_bytes: number;
}

export function buildKnowledgeContext(
  store: KnowledgeRecordStore,
  input: SearchSaltInput & { max_utf8_bytes?: number },
): KnowledgeContextResult {
  const maxBytes = Math.min(
    16 * 1024,
    Math.max(256, input.max_utf8_bytes ?? 16 * 1024),
  );
  const search = searchSaltRecords(store, input);
  const matches = [...search.matches];
  const base = {
    contract: "salt-knowledge-context/1" as const,
    scoring_version: KNOWLEDGE_SEARCH_SCORING_VERSION,
    query: search.query,
    bundle_digest: search.bundle_digest,
    excluded_package_families: search.excluded_package_families,
  };
  let result: Omit<KnowledgeContextResult, "utf8_bytes">;
  do {
    result = {
      ...base,
      context_digest: sha256Digest(
        canonicalJson({
          ...base,
          citations: matches.map((match) => match.citation),
        }),
      ),
      matches,
      truncated: matches.length < search.matches.length,
    };
    if (Buffer.byteLength(JSON.stringify(result), "utf8") <= maxBytes - 64) {
      break;
    }
    matches.pop();
  } while (matches.length > 0);
  return {
    ...result,
    utf8_bytes: Buffer.byteLength(JSON.stringify(result), "utf8"),
  };
}

export function renderKnowledgeContext(
  store: KnowledgeRecordStore,
  input: SearchSaltInput & { max_utf8_bytes?: number },
): string {
  const maxBytes = Math.min(
    16 * 1024,
    Math.max(256, input.max_utf8_bytes ?? 16 * 1024),
  );
  const result = buildKnowledgeContext(store, input);
  const headerPrefix = "# Salt knowledge\n\nQuery: ";
  const headerSuffix = `\n\nBundle: ${renderUntrustedMarkdownEvidence(
    result.bundle_digest,
    { mode: "inline" },
  )}\nContext: ${renderUntrustedMarkdownEvidence(result.context_digest, {
    mode: "inline",
  })}\n`;
  const queryBudget =
    maxBytes -
    Buffer.byteLength(headerPrefix, "utf8") -
    Buffer.byteLength(headerSuffix, "utf8");
  const renderedQuery = renderUntrustedMarkdownEvidence(result.query, {
    mode: "inline",
    max_utf8_bytes: Math.max(16, queryBudget),
  });
  let output = `${headerPrefix}${renderedQuery}${headerSuffix}`;
  for (const match of result.matches) {
    const sources = match.citation.source_records.length
      ? `; sources ${match.citation.source_records
          .map((source) =>
            renderUntrustedMarkdownEvidence(source, { mode: "inline" }),
          )
          .join(", ")}`
      : "";
    const next = `\n## ${renderUntrustedMarkdownEvidence(match.title, {
      mode: "inline",
    })}\n\nEvidence:\n\n${renderUntrustedMarkdownEvidence(match.summary, {
      mode: "block",
    })}\n\nCitation: ${renderUntrustedMarkdownEvidence(
      match.citation.record_key,
      { mode: "inline" },
    )}${sources}; bundle ${renderUntrustedMarkdownEvidence(
      match.citation.bundle_digest,
      { mode: "inline" },
    )}\n`;
    if (
      Buffer.byteLength(output, "utf8") + Buffer.byteLength(next, "utf8") >
      maxBytes
    ) {
      break;
    }
    output += next;
  }
  return output;
}
