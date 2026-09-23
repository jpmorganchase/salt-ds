import { resolveKnowledgeCompatibility } from "../compatibility/resolveCompatibility.js";
import {
  assembleCanonicalDocument,
  type CanonicalDocumentSection,
  type CanonicalDocumentSelection,
  canonicalDocumentReference,
  renderCanonicalDocument,
} from "../documents/assembleCanonicalDocument.js";
import type { DocumentModel } from "../documents/documentSchema.js";
import { canonicalJson } from "../manifest/canonicalJson.js";
import { sha256Digest } from "../manifest/digestCodec.js";
import type {
  KnowledgeRecordFamily,
  KnowledgeRecordStore,
} from "../manifest/knowledgeStore.js";
import { renderExcludedPackageFamilies } from "../markdown/renderExcludedPackageFamilies.js";
import {
  renderUntrustedMarkdownEvidence,
  resolveUntrustedMarkdownLink,
} from "../markdown/untrustedMarkdown.js";

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

function hasSharedWordPair(
  field: string,
  queryWordPairs: ReadonlySet<string>,
): boolean {
  const fieldWords = allWords(field);
  return fieldWords.some(
    (word, index) =>
      fieldWords[index + 1] !== undefined &&
      queryWordPairs.has(`${word}\u0000${fieldWords[index + 1]}`),
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
  queryWordPairs: ReadonlySet<string>,
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
  const hasIdentityPhrase =
    queryWords.length >= 5 &&
    fields
      .slice(0, 5)
      .flatMap((field) => field.values)
      .some((value) => hasSharedWordPair(value, queryWordPairs));
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
  const explicitComponentName =
    document.target.family === "component" &&
    allWords(canonicalName).length > 0 &&
    allWords(canonicalName).every((word) => queryWords.includes(word));
  const components: Record<string, number> = {};
  if (exactId) components.exact_record_id = 12_000;
  if (exactExport) components.exact_export_name = 11_000;
  if (exactCanonical) components.exact_canonical_name = 10_000;
  if (exactAlias) components.exact_alias = 9_000;
  if (exactTitle && !exactCanonical) components.exact_title = 8_500;
  // Task language commonly names a Salt component alongside the work to do.
  // Keep that named component among the bounded results so its verified source
  // evidence remains available beside broader pattern or workflow guidance.
  if (explicitComponentName) components.explicit_component_name = 1_600;

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
  if (queryWords.length >= 5 && hasIdentityPhrase) {
    components.identity_phrase = 500;
  }
  // In a longer task query, rank evidence that covers more than one query term
  // above a record that repeats one incidental word across identity fields.
  const matchedTermCount = matchedTerms.size;
  if (queryWords.length >= 5 && matchedTermCount > 1) {
    components.query_term_coverage = (matchedTermCount - 1) * 500;
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
  const queryWordPairs = new Set(
    queryWords
      .slice(1)
      .map((word, index) => `${queryWords[index]}\u0000${word}`),
  );
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
      queryWordPairs,
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
  /** Present only when verified canonical guidance was relevant to the query. */
  canonical_documents?: KnowledgeContextCanonicalDocument[];
  /** Read-only source examples; resolve the reference for exact extracted code. */
  contextual_examples?: KnowledgeContextSourceExample[];
  /** Omitted for legacy record-only context where no canonical guide exists. */
  answer_status?: "applicable" | "contextual" | "no_applicable_evidence";
  limitations?: string[];
  truncated: boolean;
  utf8_bytes: number;
}

export interface KnowledgeContextCanonicalDocument {
  contract: "salt-canonical-document/1";
  reference: string;
  title: string;
  source_url: string;
  source_records: string[];
  content_identity: string;
  recipe_identity: CanonicalDocumentSelection["recipe_identity"];
  readiness: CanonicalDocumentSelection["readiness"];
  sections: Array<Omit<CanonicalDocumentSection, "search_text">>;
  files?: CanonicalDocumentSelection["files"];
  limitations: string[];
  omissions: CanonicalDocumentSelection["omissions"];
}

export interface KnowledgeContextSourceExample {
  reference: string;
  title: string;
  description: string;
  readiness: "contextual";
  validation: "unvalidated";
  source_records: string[];
  supporting_files: string[];
}

export const MIN_KNOWLEDGE_CONTEXT_UTF8_BYTES = 512;
export const MAX_KNOWLEDGE_CONTEXT_UTF8_BYTES = 16 * 1024;

export class KnowledgeContextInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "KnowledgeContextInputError";
  }
}

type KnowledgeContextDigestInput = Omit<
  KnowledgeContextResult,
  "context_digest" | "utf8_bytes"
>;

const KNOWLEDGE_CONTEXT_INPUT_ERROR =
  "Knowledge context input cannot fit the requested output budget.";

function contextBudget(input: { max_utf8_bytes?: number }): number {
  const requested = input.max_utf8_bytes ?? MAX_KNOWLEDGE_CONTEXT_UTF8_BYTES;
  if (
    !Number.isSafeInteger(requested) ||
    requested < MIN_KNOWLEDGE_CONTEXT_UTF8_BYTES
  ) {
    throw new KnowledgeContextInputError(KNOWLEDGE_CONTEXT_INPUT_ERROR);
  }
  return Math.min(requested, MAX_KNOWLEDGE_CONTEXT_UTF8_BYTES);
}

type CanonicalContextIntent = "general" | "workflow" | "adaptation";

interface CanonicalContextCandidates {
  documents: KnowledgeContextCanonicalDocument[];
  section_priorities: ReadonlyMap<string, number>;
  source_examples: KnowledgeContextSourceExample[];
  had_canonical_document: boolean;
  had_incompatible_canonical_document: boolean;
  intent: CanonicalContextIntent;
  query_words: string[];
  direct_evidence_focus: boolean;
  /** A compact variant withheld canonical sections or complete-file metadata. */
  truncated?: boolean;
  omitted_document_references?: readonly string[];
}

const WORKFLOW_INTENT_WORDS = new Set([
  "add",
  "build",
  "create",
  "make",
  "new",
  "start",
]);
const ADAPTATION_INTENT_WORDS = new Set([
  "adapt",
  "existing",
  "integrate",
  "integration",
  "migrate",
  "reuse",
]);
const API_INTENT_WORDS = new Set([
  "api",
  "argument",
  "attribute",
  "option",
  "parameter",
  "prop",
  "props",
]);
const CONTEXT_QUESTION_WORDS = new Set([
  "can",
  "could",
  "do",
  "does",
  "i",
  "is",
  "it",
  "my",
  "on",
  "please",
  "set",
  "should",
  "this",
  "use",
  "want",
  "what",
  "which",
  "will",
]);

function canonicalContextIntent(
  queryWords: readonly string[],
): CanonicalContextIntent {
  if (queryWords.some((word) => ADAPTATION_INTENT_WORDS.has(word))) {
    return "adaptation";
  }
  if (queryWords.some((word) => WORKFLOW_INTENT_WORDS.has(word))) {
    return "workflow";
  }
  return "general";
}

type CanonicalSectionEvidence = Pick<
  CanonicalDocumentSection,
  "title" | "markdown"
> &
  Partial<Pick<CanonicalDocumentSection, "search_text">>;

function sectionWords(section: CanonicalSectionEvidence): Set<string> {
  return new Set(
    allWords(
      `${section.title}\n${section.markdown}\n${section.search_text ?? ""}`,
    ),
  );
}

function coversAny(
  section: CanonicalSectionEvidence,
  words: readonly string[],
): boolean {
  return sectionCoverage(section, words) > 0;
}

/**
 * A canonical section is the smallest authored unit that can establish a
 * task-specific answer. Keep the coverage count separate from record ranking:
 * this only chooses among evidence that has already been selected and
 * compatibility-checked.
 */
function sectionCoverage(
  section: CanonicalSectionEvidence,
  words: readonly string[],
): number {
  const covered = sectionWords(section);
  return words.filter((word) => covered.has(word)).length;
}

function titleCoverage(
  section: CanonicalSectionEvidence,
  words: readonly string[],
): number {
  const title = new Set(allWords(section.title));
  return words.filter((word) => title.has(word)).length;
}

function topicWordsForDocument(
  document: CanonicalDocumentSelection,
  queryWords: readonly string[],
): string[] {
  const titleWords = new Set(allWords(document.title));
  const intentWords = new Set([
    ...WORKFLOW_INTENT_WORDS,
    ...ADAPTATION_INTENT_WORDS,
    ...API_INTENT_WORDS,
  ]);
  const contentWords = queryWords.filter(
    (word) =>
      !STOP_WORDS.has(word) &&
      !CONTEXT_QUESTION_WORDS.has(word) &&
      !intentWords.has(word),
  );
  const novelWords = contentWords.filter((word) => !titleWords.has(word));
  // A title-only request is still eligible only when its content word occurs
  // in selected evidence. Novel terms take precedence so a weak "create"
  // ranking hit cannot pull in an unrelated workflow.
  if (novelWords.length > 0) return novelWords;
  return document.sections.some(
    (section) =>
      section.purpose === "prerequisites" ||
      section.purpose === "implementation" ||
      section.purpose === "adaptation" ||
      section.purpose === "acceptance",
  )
    ? contentWords
    : [];
}

function hasTopicCoverage(
  document: CanonicalDocumentSelection,
  topicWords: readonly string[],
): boolean {
  return (
    topicWords.length > 0 &&
    document.sections.some((section) => coversAny(section, topicWords))
  );
}

function isNarrowCanonicalQuestion(
  document: CanonicalDocumentSelection,
  queryWords: readonly string[],
): boolean {
  if (queryWords.some((word) => API_INTENT_WORDS.has(word))) return true;
  const titleWords = new Set(allWords(document.title));
  return (
    queryWords.length > 1 && queryWords.every((word) => titleWords.has(word))
  );
}

/** Small task cues select authored roles, never synthesize design advice. */
function taskRoles(queryWords: readonly string[]): readonly string[] {
  if (queryWords.some((word) => API_INTENT_WORDS.has(word))) return [];
  const roles = new Set<string>();
  const has = (...words: string[]) =>
    words.some((word) => queryWords.includes(word));
  if (has("limitation", "limitations", "constraint", "constraints")) {
    roles.add("constraint");
    roles.add("behavior");
  }
  if (
    has("focus", "keyboard", "accessible", "accessibility") ||
    (has("screen") && has("reader", "readers"))
  ) {
    roles.add("accessibility");
    if (has("loading", "pending", "announcement", "announce"))
      roles.add("behavior");
  }
  if (has("narrow", "viewport", "responsive", "breakpoint", "reflow"))
    roles.add("constraint");
  if (has("composition", "compose", "anatomy", "placement", "goes"))
    roles.add("composition");
  if (
    has("use", "choose", "prefer", "alternative", "alternatives") &&
    has(
      "should",
      "which",
      "when",
      "choose",
      "prefer",
      "alternative",
      "alternatives",
    )
  ) {
    roles.add("decision");
    roles.add("use-condition");
    roles.add("exclusion");
  }
  if (
    has(
      "draft",
      "owns",
      "ownership",
      "invalid",
      "validation",
      "pending",
      "save",
      "failed",
      "cancel",
      "discard",
      "edits",
      "production",
      "concurrent",
      "certification",
    )
  )
    roles.add("behavior");
  return [...roles];
}

/** Conditions and their exclusions are one authored evidence unit. */
function qualifiedSections<T extends { qualification_group?: string }>(
  sections: readonly T[],
  selected: ReadonlySet<T>,
): T[] {
  const groups = new Set(
    [...selected].map((section) => section.qualification_group).filter(Boolean),
  );
  return sections.filter(
    (section) =>
      selected.has(section) ||
      (section.qualification_group !== undefined &&
        groups.has(section.qualification_group)),
  );
}

function isOwnershipPrerequisite(
  section: Pick<CanonicalDocumentSection, "purpose">,
  queryWords: readonly string[],
): boolean {
  return (
    section.purpose === "prerequisites" &&
    queryWords.some((word) => ["owns", "ownership", "draft"].includes(word))
  );
}

function selectedCanonicalSections(
  document: CanonicalDocumentSelection,
  queryWords: readonly string[],
  intent: CanonicalContextIntent,
): CanonicalDocumentSection[] {
  const selected = new Set<CanonicalDocumentSection>();
  const guidance = document.sections.filter(
    (section) => section.purpose === "guidance",
  );
  const topicWords = topicWordsForDocument(document, queryWords);
  const topicCovered = hasTopicCoverage(document, topicWords);
  const narrow = isNarrowCanonicalQuestion(document, queryWords);
  const roles = !narrow && intent === "general" ? taskRoles(queryWords) : [];

  if (intent === "workflow" || intent === "adaptation") {
    if (!topicCovered) return [];
    for (const section of document.sections) {
      if (
        section.purpose === "prerequisites" ||
        section.purpose === "implementation" ||
        section.purpose === "adaptation" ||
        section.purpose === "acceptance"
      ) {
        selected.add(section);
      }
    }
    for (const section of guidance) {
      if (coversAny(section, topicWords)) selected.add(section);
    }
  } else if (narrow) {
    for (const section of guidance) {
      if (coversAny(section, queryWords)) selected.add(section);
    }
    for (const section of document.sections) {
      if (
        section.purpose === "api" &&
        (queryWords.some((word) => API_INTENT_WORDS.has(word)) ||
          coversAny(section, queryWords))
      ) {
        selected.add(section);
      }
    }
  } else if (roles.length > 0 && topicCovered) {
    for (const section of document.sections) {
      // Role guidance augments directly matching authored evidence.
      if (
        (section.purpose !== "api" && coversAny(section, topicWords)) ||
        (section.semantic_role && roles.includes(section.semantic_role))
      )
        selected.add(section);
      if (
        roles.includes("behavior") &&
        isOwnershipPrerequisite(section, queryWords)
      )
        selected.add(section);
    }
  } else if (topicCovered) {
    // A neutral request can still ask how an identified component is used or
    // composed. Include each directly relevant authored section instead of
    // treating guidance headings as the only usable evidence. This preserves
    // implementation, adaptation, and acceptance evidence when it actually
    // covers the request, without promoting a weak title-only match.
    for (const section of document.sections) {
      if (
        (section.purpose === "guidance" ||
          section.purpose === "prerequisites" ||
          section.purpose === "implementation" ||
          section.purpose === "adaptation" ||
          section.purpose === "acceptance" ||
          section.purpose === "api") &&
        coversAny(section, topicWords)
      ) {
        selected.add(section);
      }
    }
  }

  return qualifiedSections(document.sections, selected);
}

function toCanonicalContextDocument(
  document: CanonicalDocumentSelection,
  sections: readonly CanonicalDocumentSection[],
): KnowledgeContextCanonicalDocument {
  const selected = new Set(sections);
  const omissions = [
    ...document.omissions,
    ...document.sections
      .filter((section) => !selected.has(section))
      .map((section) => ({
        reference: section.reference,
        title: section.title,
        reason: "Outside the selected query evidence.",
      })),
  ];
  return {
    contract: document.contract,
    reference: document.reference,
    title: document.title,
    source_url: document.source_url,
    source_records: [...document.source_records],
    content_identity: document.content_identity,
    recipe_identity: document.recipe_identity,
    readiness: document.readiness,
    sections: sections.map(
      ({ search_text: _searchText, ...section }) => section,
    ),
    files: document.files.map((file) => ({ ...file })),
    limitations: [...document.limitations],
    omissions,
  };
}

function canonicalSelectionForContext(
  document: KnowledgeContextCanonicalDocument,
): CanonicalDocumentSelection {
  return {
    ...document,
    files: document.files ?? [],
    sections: document.sections.map((section) => ({
      ...section,
      search_text: "",
    })),
  };
}

function sourceExamplesForMatches(
  store: KnowledgeRecordStore,
  matches: readonly SearchSaltRecordMatch[],
  queryWords: readonly string[],
): KnowledgeContextSourceExample[] {
  const matchKeys = new Set(
    matches.map((match) => `${match.reference.family}:${match.reference.id}`),
  );
  const matchedOwnerRank = new Map(
    matches.map((match, index) => [
      `${match.reference.family}:${match.reference.id}`,
      index,
    ]),
  );
  return (store.getFamily("evidence") as readonly any[])
    .filter(
      (evidence) =>
        evidence?.evidence_kind === "executable_example" &&
        typeof evidence.local_id === "string" &&
        evidence.owner &&
        matchKeys.has(`${evidence.owner.family}:${evidence.owner.id}`),
    )
    .map((evidence) => {
      const owner = evidence.owner as { family: string; id: string };
      const ownerRecord = store.getRecord(owner.family, owner.id);
      const ownerName =
        typeof ownerRecord?.name === "string"
          ? ownerRecord.name
          : typeof ownerRecord?.title === "string"
            ? ownerRecord.title
            : "";
      const ownerWords = allWords(ownerName);
      const explicitlyNamedOwner =
        ownerWords.length > 0 &&
        ownerWords.every((word) => queryWords.includes(word));
      const searchable = [
        evidence.title,
        evidence.description,
        ...(Array.isArray(evidence.intent) ? evidence.intent : []),
      ]
        .filter((value): value is string => typeof value === "string")
        .join(" ");
      const searchableWords = new Set(allWords(searchable));
      const coverage = queryWords.filter((word) =>
        searchableWords.has(word),
      ).length;
      return {
        reference: `record:${owner.family}:${owner.id}#example/${evidence.local_id}`,
        title:
          typeof evidence.title === "string"
            ? evidence.title
            : evidence.local_id,
        description:
          typeof evidence.description === "string" ? evidence.description : "",
        readiness: "contextual" as const,
        validation: "unvalidated" as const,
        source_records: [evidence.source_ref?.id]
          .filter((id): id is string => typeof id === "string")
          .sort(),
        supporting_files: Array.isArray(evidence.supporting_files)
          ? evidence.supporting_files
              .map((file: any) => file?.source_path)
              .filter(
                (path: unknown): path is string => typeof path === "string",
              )
              .sort()
          : [],
        coverage,
        explicitly_named_owner: explicitlyNamedOwner,
        owner_rank:
          matchedOwnerRank.get(`${owner.family}:${owner.id}`) ??
          Number.MAX_SAFE_INTEGER,
        ordinal:
          typeof evidence.owner_ordinal === "number"
            ? evidence.owner_ordinal
            : Number.MAX_SAFE_INTEGER,
      };
    })
    .filter((example) => example.coverage > 0 || example.explicitly_named_owner)
    .sort(
      (left, right) =>
        right.coverage - left.coverage ||
        left.owner_rank - right.owner_rank ||
        left.ordinal - right.ordinal ||
        left.title.localeCompare(right.title),
    )
    .slice(0, 2)
    .map(
      ({
        coverage: _coverage,
        explicitly_named_owner: _explicitlyNamedOwner,
        owner_rank: _ownerRank,
        ordinal: _ordinal,
        ...example
      }) => example,
    );
}

/** Read links from inert authored AST nodes, never from code or rendered text. */
function selectedAuthoredLinks(
  store: KnowledgeRecordStore,
  document: KnowledgeContextCanonicalDocument,
): string[] {
  const id = document.reference.slice("record:guide:".length);
  const guide = store.getRecord("guide", id);
  if (guide?.detail_content_ref?.codec !== "document_detail") return [];
  const detail = store.getContentValue(guide.detail_content_ref) as {
    document: DocumentModel;
  };
  const selectedIds = new Set(document.sections.map((section) => section.id));
  const links: string[] = [];
  for (const section of detail.document.sections) {
    if (!selectedIds.has(section.id)) continue;
    const route = (section.source ?? detail.document.source).route;
    const visit = (value: unknown): void => {
      if (Array.isArray(value)) {
        value.forEach(visit);
        return;
      }
      if (!value || typeof value !== "object") return;
      const node = value as Record<string, unknown>;
      if (node.kind === "link" && typeof node.href === "string") {
        const href = resolveUntrustedMarkdownLink(node.href, route);
        if (href) links.push(href);
      }
      Object.values(node).forEach(visit);
    };
    visit(section.blocks);
  }
  return links;
}

function canonicalContextCandidates(
  store: KnowledgeRecordStore,
  matches: readonly SearchSaltRecordMatch[],
  query: string,
  installedVersions?: Readonly<Record<string, string | null | undefined>>,
): CanonicalContextCandidates {
  const queryWords = meaningfulWords(query);
  const intent = canonicalContextIntent(queryWords);
  const guides = new Set<string>();
  const documents: KnowledgeContextCanonicalDocument[] = [];
  const sectionPriorities = new Map<string, number>();
  const addDocument = (
    document: CanonicalDocumentSelection,
    sections: readonly CanonicalDocumentSection[],
  ) => {
    // Compute priority before the public projection removes search-only evidence.
    for (const section of sections) {
      sectionPriorities.set(
        section.reference,
        contextSectionPriority(section, intent, queryWords),
      );
    }
    documents.push(toCanonicalContextDocument(document, sections));
  };
  const sourceExamples = sourceExamplesForMatches(store, matches, queryWords);
  let hadCanonicalDocument = false;
  let hadIncompatibleCanonicalDocument = false;
  for (const match of matches) {
    const guide = canonicalDocumentReference(store, match.reference);
    if (!guide || guides.has(guide.id)) continue;
    guides.add(guide.id);
    if (
      !resolveKnowledgeRecordCompatibility(store, guide, installedVersions)
        .included
    ) {
      hadIncompatibleCanonicalDocument = true;
      continue;
    }
    const document = assembleCanonicalDocument(store, match.reference);
    if (!document) continue;
    hadCanonicalDocument = true;
    const sections = selectedCanonicalSections(document, queryWords, intent);
    if (sections.length > 0) {
      addDocument(document, sections);
    }
  }
  // Follow one authored link hop to another selected guide, constrained by
  // the requested role and the target's own package compatibility. No network
  // reads or inferred preference edges are involved.
  const roles = taskRoles(queryWords);
  if (intent === "general" && roles.length > 0) {
    const links = documents.flatMap((document) =>
      selectedAuthoredLinks(store, document),
    );
    for (const href of [...new Set(links)].slice(0, 32)) {
      const url = new URL(href);
      if (url.origin !== "https://www.saltdesignsystem.com" || !url.hash)
        continue;
      const page = store
        .getFamily("page")
        .find((record) => record.route === url.pathname);
      if (!page) continue;
      const reference = { family: "page" as const, id: page.id };
      const guide = canonicalDocumentReference(store, reference);
      if (
        !guide ||
        documents.some(
          (document) => document.reference === `record:guide:${guide.id}`,
        )
      )
        continue;
      if (
        !resolveKnowledgeRecordCompatibility(store, guide, installedVersions)
          .included
      )
        continue;
      const linked = assembleCanonicalDocument(store, reference);
      if (!linked) continue;
      let anchor: string;
      try {
        anchor = decodeURIComponent(url.hash.slice(1));
      } catch {
        continue;
      }
      const section = linked.sections.find(
        (section) =>
          section.source_url === url.origin + url.pathname &&
          section.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/gu, "-")
            .replace(/^-|-$/gu, "") === anchor &&
          section.semantic_role &&
          roles.includes(section.semantic_role),
      );
      if (!section) continue;
      guides.add(guide.id);
      addDocument(
        linked,
        qualifiedSections(linked.sections, new Set([section])),
      );
    }
  }
  return {
    documents,
    section_priorities: sectionPriorities,
    source_examples: sourceExamples,
    had_canonical_document: hadCanonicalDocument,
    had_incompatible_canonical_document: hadIncompatibleCanonicalDocument,
    intent,
    query_words: queryWords,
    direct_evidence_focus:
      taskRoles(queryWords).length === 0 &&
      intent === "general" &&
      queryWords.length > 2 &&
      sourceExamples.length > 0,
  };
}

function contextSectionPriority(
  section: KnowledgeContextCanonicalDocument["sections"][number],
  intent: CanonicalContextIntent,
  queryWords: readonly string[],
): number {
  const roles = intent === "general" ? taskRoles(queryWords) : [];
  const requestedRole =
    roles.includes("behavior") && isOwnershipPrerequisite(section, queryWords)
      ? "behavior"
      : section.semantic_role;
  const rolePriority = requestedRole ? roles.indexOf(requestedRole) : -1;
  let purpose = 70;
  if (intent === "adaptation") {
    if (section.purpose === "adaptation") purpose = 100;
    else if (section.purpose === "prerequisites") purpose = 95;
    else if (section.purpose === "acceptance") purpose = 90;
    else if (section.purpose === "implementation") purpose = 85;
  }
  if (intent === "workflow") {
    if (section.purpose === "prerequisites") purpose = 100;
    else if (section.purpose === "adaptation") purpose = 95;
    else if (section.purpose === "acceptance") purpose = 90;
    else if (section.purpose === "implementation") purpose = 85;
  }
  if (section.purpose === "guidance" || section.purpose === "api") {
    purpose = Math.max(purpose, 80);
  }
  if (intent === "workflow" || intent === "adaptation") {
    // A create or integration request needs the authored workflow sequence.
    // Direct matching only breaks ties within that sequence.
    return (
      purpose * 1_000 +
      sectionCoverage(section, queryWords) * 10 +
      titleCoverage(section, queryWords)
    );
  }
  // Direct evidence of the query is more useful than a generic workflow step
  // once output must be compacted. Title matches win ties because they are the
  // author's explicit subject label; section coverage keeps usage and
  // composition details ahead of unrelated dashboard headings.
  return (
    (rolePriority < 0 ? 0 : (roles.length - rolePriority) * 100_000) +
    sectionCoverage(section, queryWords) * 1_000 +
    titleCoverage(section, queryWords) * 100 +
    purpose
  );
}

function filePriority(
  file: NonNullable<KnowledgeContextCanonicalDocument["files"]>[number],
  queryWords: readonly string[],
): number {
  const pathWords = new Set(allWords(file.path));
  const coverage = queryWords.filter((word) => pathWords.has(word)).length;
  const role = file.role === "reusable" ? 2 : file.role === "setup" ? 1 : 0;
  const extension = file.path.split(".").at(-1)?.toLocaleLowerCase("en-US");
  const executable =
    extension === "ts" ||
    extension === "tsx" ||
    extension === "js" ||
    extension === "jsx"
      ? 2
      : extension === "json" || extension === "html"
        ? 1
        : 0;
  return coverage * 100 + role * 10 + executable;
}

function compactCanonicalDocument(
  document: KnowledgeContextCanonicalDocument,
  sectionCount: number,
  sectionPriority: (
    section: KnowledgeContextCanonicalDocument["sections"][number],
  ) => number,
  queryWords: readonly string[],
  selectedSectionId?: string,
): KnowledgeContextCanonicalDocument {
  const rankedSections = [...document.sections].sort(
    (left, right) =>
      sectionPriority(right) - sectionPriority(left) ||
      document.sections.indexOf(left) - document.sections.indexOf(right),
  );
  const selected = new Set(
    selectedSectionId
      ? rankedSections.filter((section) => section.id === selectedSectionId)
      : rankedSections.slice(0, sectionCount),
  );
  const sections = qualifiedSections(document.sections, selected);
  const retained = new Set(sections);
  const unselected = rankedSections.find((section) => !retained.has(section));
  const nextFile = [...(document.files ?? [])].sort(
    (left, right) =>
      filePriority(right, queryWords) - filePriority(left, queryWords) ||
      left.path.localeCompare(right.path),
  )[0];
  const omissions = [
    ...(unselected
      ? [
          ...(taskRoles(queryWords).length > 0
            ? [
                {
                  reference: document.reference,
                  title: document.title,
                  reason:
                    "Complete qualified guidance is available at this document reference.",
                },
              ]
            : []),
          {
            reference: unselected.reference,
            title: unselected.title,
            reason: "Resolve this omitted section.",
          },
        ]
      : []),
    ...(nextFile
      ? [
          {
            reference: nextFile.reference,
            title: nextFile.path,
            reason: "Resolve this complete file.",
          },
        ]
      : []),
  ];
  return {
    contract: document.contract,
    reference: document.reference,
    title: document.title,
    source_url: document.source_url,
    source_records: document.source_records,
    content_identity: document.content_identity,
    // Qualifications and provenance are inseparable from selected guidance.
    // The budget selector must drop sections (or the document), never these.
    recipe_identity: document.recipe_identity,
    readiness: document.readiness,
    sections,
    limitations: document.limitations,
    omissions,
  };
}

function canonicalContextVariants(
  candidates: CanonicalContextCandidates,
): CanonicalContextCandidates[] {
  if (candidates.documents.length === 0) {
    return candidates.source_examples.length > 0
      ? [candidates, { ...candidates, source_examples: [], truncated: true }]
      : [candidates];
  }
  const sectionPriority = (
    section: KnowledgeContextCanonicalDocument["sections"][number],
  ): number => candidates.section_priorities.get(section.reference) ?? 0;
  // A lower-ranked broad guide must not force a fitting leading document
  // (and its matches/files) to compact. Try intact prefixes first, then
  // shrink sections while retaining their qualification groups.
  const variants = [candidates];
  for (let count = candidates.documents.length - 1; count > 0; count -= 1) {
    variants.push({
      ...candidates,
      documents: candidates.documents.slice(0, count),
      truncated: true,
    });
  }
  const roles =
    candidates.intent === "general" ? taskRoles(candidates.query_words) : [];
  // Choosing between alternatives keeps use conditions and exclusions together.
  const priorityRoles =
    roles[0] === "decision" ? roles.slice(0, 3) : roles.slice(0, 1);
  if (roles.length > 0) {
    // Keep a fitting mixed task packet ahead of any role-focused fallback.
    variants.push({
      ...candidates,
      truncated: true,
      documents: candidates.documents.map((document) =>
        compactCanonicalDocument(
          document,
          document.sections.length,
          sectionPriority,
          candidates.query_words,
        ),
      ),
    });
    // Complete direct evidence was tried first. These fallbacks may omit
    // secondary lexical matches, preserving qualifications and guide references.
    const roleSets =
      priorityRoles.length < roles.length ? [roles, priorityRoles] : [roles];
    for (const requestedRoles of roleSets) {
      const roleDocuments = candidates.documents.flatMap((document) => {
        const sections = qualifiedSections(
          document.sections,
          new Set(
            document.sections.filter(
              (section) =>
                (section.semantic_role !== undefined &&
                  requestedRoles.includes(section.semantic_role)) ||
                (requestedRoles.includes("behavior") &&
                  isOwnershipPrerequisite(section, candidates.query_words)),
            ),
          ),
        );
        return sections.length > 0 ? [{ ...document, sections }] : [];
      });
      // A compact prefix must retain the strongest authored evidence, not
      // whichever broad document happened to rank first in record search.
      const strongestSection = (document: KnowledgeContextCanonicalDocument) =>
        Math.max(...document.sections.map(sectionPriority));
      roleDocuments.sort(
        (left, right) => strongestSection(right) - strongestSection(left),
      );
      const retainedReferences = new Set(
        roleDocuments.map((document) => document.reference),
      );
      const omittedDocuments = candidates.documents.filter(
        (document) => !retainedReferences.has(document.reference),
      );
      const maximumSections = Math.max(
        0,
        ...roleDocuments.map((document) => document.sections.length),
      );
      for (let count = maximumSections; count > 0; count -= 1) {
        const documents = roleDocuments.map((document) => {
          const compact = compactCanonicalDocument(
            document,
            count,
            sectionPriority,
            candidates.query_words,
          );
          const original = candidates.documents.find(
            (candidate) => candidate.reference === document.reference,
          );
          if (
            original &&
            (original.sections.length > document.sections.length ||
              (document.files?.length ?? 0) > 0) &&
            !compact.omissions.some(
              (omission) => omission.reference === document.reference,
            )
          ) {
            compact.omissions.push({
              reference: document.reference,
              title: document.title,
              reason: "Resolve complete guidance for the remaining task roles.",
            });
          }
          // Keep every resolver reference, with concise labels for this fallback.
          compact.omissions = compact.omissions.map((omission) => {
            if (omission.reference === document.reference) {
              return {
                ...omission,
                title: "Further guidance",
                reason: "Resolve other task roles.",
              };
            }
            if (omission.reference.startsWith(`${document.reference}#file/`)) {
              return {
                ...omission,
                title: omission.title.split("/").at(-1) ?? omission.title,
                reason: "Complete file.",
              };
            }
            return omission;
          });
          return compact;
        });
        documents[0].omissions.push(
          ...omittedDocuments.map((document) => ({
            reference: document.reference,
            title: document.title,
            reason: "Resolve guide.",
          })),
        );
        variants.push({ ...candidates, truncated: true, documents });
        if (count === maximumSections) {
          // Preserve the complete task role in leading documents before
          // shortening every document to the same number of sections.
          for (let length = documents.length - 1; length > 0; length -= 1) {
            variants.push({
              ...candidates,
              truncated: true,
              documents: documents.slice(0, length),
            });
          }
        }
        // Try all requested roles together before narrowing to the priority role.
        if (roleSets.length > 1 && requestedRoles === roles) break;
      }
    }
  }
  for (
    let documentCount = candidates.documents.length;
    documentCount >= 1;
    documentCount -= 1
  ) {
    const documents = candidates.documents.slice(0, documentCount);
    const maximumSections = Math.max(
      ...documents.map((document) => document.sections.length),
    );
    const sectionCounts = candidates.direct_evidence_focus
      ? Array.from({ length: maximumSections }, (_, index) => index + 1)
      : Array.from(
          { length: maximumSections },
          (_, index) => maximumSections - index,
        );
    for (const sectionCount of sectionCounts) {
      variants.push({
        ...candidates,
        truncated: true,
        documents: documents.map((document) =>
          compactCanonicalDocument(
            document,
            sectionCount,
            sectionPriority,
            candidates.query_words,
          ),
        ),
      });
    }
  }
  // Try every compact document prefix before falling back to one section.
  // A small fragment of a broad first guide must not hide a fitting packet
  // containing the focused guidance in a later document.
  // When the highest-priority whole section cannot fit, preserve a smaller
  // authored section before giving up canonical evidence. The first omitted
  // reference still points to the highest-priority next step.
  for (const document of candidates.documents) {
    const rankedSections = [...document.sections].sort(
      (left, right) =>
        sectionPriority(right) - sectionPriority(left) ||
        document.sections.indexOf(left) - document.sections.indexOf(right),
    );
    for (const section of rankedSections) {
      variants.push({
        ...candidates,
        truncated: true,
        documents: [
          compactCanonicalDocument(
            document,
            1,
            sectionPriority,
            candidates.query_words,
            section.id,
          ),
        ],
      });
    }
  }
  variants.push({
    ...candidates,
    documents: [],
    truncated: true,
    omitted_document_references: candidates.documents.map(
      (document) => document.reference,
    ),
  });
  const disclosedVariants = variants.map((variant) => {
    if (variant.documents.length === 0) return variant;
    const disclosedReferences = new Set(
      variant.documents.flatMap((document) =>
        document.omissions.map((omission) => omission.reference),
      ),
    );
    const omitted = candidates.documents.filter(
      (document) =>
        !disclosedReferences.has(document.reference) &&
        !variant.documents.some(
          (selected) => selected.reference === document.reference,
        ),
    );
    if (omitted.length === 0) return variant;
    const [first, ...rest] = variant.documents;
    return {
      ...variant,
      documents: [
        {
          ...first,
          omissions: [
            ...first.omissions,
            ...omitted.map((document) => ({
              reference: document.reference,
              title: document.title,
              reason: "Resolve this omitted document.",
            })),
          ],
        },
        ...rest,
      ],
    };
  });
  if (candidates.source_examples.length === 0) return disclosedVariants;
  const withoutExamples = (variant: CanonicalContextCandidates) => ({
    ...variant,
    source_examples: [],
    truncated: true,
  });
  const withDocuments = disclosedVariants.filter(
    (variant) => variant.documents.length > 0,
  );
  const omittedDocuments = disclosedVariants.filter(
    (variant) => variant.documents.length === 0,
  );
  // Preserve canonical evidence before retaining optional example summaries.
  // Retain a fitting prefix of examples before dropping them or shrinking guidance.
  return [
    ...withDocuments.flatMap((variant) => [
      variant,
      ...Array.from(
        { length: variant.source_examples.length },
        (_, omitted) => ({
          ...variant,
          source_examples: variant.source_examples.slice(
            0,
            variant.source_examples.length - omitted - 1,
          ),
          truncated: true,
        }),
      ),
    ]),
    ...omittedDocuments.flatMap((variant) =>
      candidates.intent !== "general"
        ? [withoutExamples(variant), variant]
        : [variant, withoutExamples(variant)],
    ),
  ];
}

function contextualResultFields(
  candidates: CanonicalContextCandidates,
  matchCount: number,
): Pick<
  KnowledgeContextResult,
  | "canonical_documents"
  | "contextual_examples"
  | "answer_status"
  | "limitations"
> {
  if (candidates.documents.length > 0) {
    const contextual = candidates.documents.some(
      (document) => document.readiness === "contextual",
    );
    return {
      canonical_documents: candidates.documents,
      contextual_examples:
        candidates.source_examples.length > 0
          ? candidates.source_examples
          : undefined,
      answer_status: contextual ? "contextual" : "applicable",
      limitations:
        contextual || candidates.source_examples.length > 0
          ? [
              ...(contextual
                ? ["Selected canonical evidence remains contextual."]
                : []),
              ...(candidates.source_examples.length > 0
                ? [
                    "Source examples remain contextual illustrations; their adaptations and dependency closure are not independently verified.",
                  ]
                : []),
            ]
          : undefined,
    };
  }
  if (
    candidates.source_examples.length > 0 ||
    (candidates.omitted_document_references?.length ?? 0) > 0
  ) {
    return {
      ...(candidates.source_examples.length > 0
        ? { contextual_examples: candidates.source_examples }
        : {}),
      answer_status: "contextual",
      limitations: [
        ...(candidates.source_examples.length > 0
          ? [
              "Selected source examples are contextual; resolve their references for exact code and support evidence.",
            ]
          : []),
        ...(candidates.omitted_document_references ?? []).map(
          (reference) =>
            `Canonical guidance was omitted to fit the output budget; resolve ${reference} for the complete document.`,
        ),
      ],
    };
  }
  if (candidates.had_canonical_document) {
    return {
      answer_status: "contextual",
      limitations: [
        "The focused canonical guidance does not cover this neutral query.",
      ],
    };
  }
  if (candidates.had_incompatible_canonical_document) {
    return {
      answer_status: "contextual",
      limitations: [
        "Attached canonical guidance is incompatible with the installed package vector.",
      ],
    };
  }
  if (matchCount === 0) return { answer_status: "no_applicable_evidence" };
  return {
    answer_status: "contextual",
    limitations: [
      "Matched records are contextual references; no verified canonical guidance is available for this query.",
    ],
  };
}

function finalizeKnowledgeContext(
  digestInput: KnowledgeContextDigestInput,
): KnowledgeContextResult {
  const contextDigest = sha256Digest(canonicalJson(digestInput));
  const resultWithSize = (utf8Bytes: number): KnowledgeContextResult => ({
    contract: digestInput.contract,
    scoring_version: digestInput.scoring_version,
    query: digestInput.query,
    bundle_digest: digestInput.bundle_digest,
    context_digest: contextDigest,
    matches: digestInput.matches,
    excluded_package_families: digestInput.excluded_package_families,
    ...(digestInput.canonical_documents
      ? { canonical_documents: digestInput.canonical_documents }
      : {}),
    ...(digestInput.contextual_examples
      ? { contextual_examples: digestInput.contextual_examples }
      : {}),
    ...(digestInput.answer_status
      ? { answer_status: digestInput.answer_status }
      : {}),
    ...(digestInput.limitations
      ? { limitations: digestInput.limitations }
      : {}),
    truncated: digestInput.truncated,
    utf8_bytes: utf8Bytes,
  });
  let utf8Bytes = 0;
  for (;;) {
    const result = resultWithSize(utf8Bytes);
    const measured = Buffer.byteLength(JSON.stringify(result), "utf8");
    if (measured === utf8Bytes) return result;
    utf8Bytes = measured;
  }
}

function renderFinalKnowledgeContext(result: KnowledgeContextResult): string {
  let output = `# Salt knowledge\n\nQuery: ${renderUntrustedMarkdownEvidence(
    result.query,
    { mode: "inline" },
  )}\n\nBundle: ${renderUntrustedMarkdownEvidence(result.bundle_digest, {
    mode: "inline",
  })}\nContext: ${renderUntrustedMarkdownEvidence(result.context_digest, {
    mode: "inline",
  })}\nTruncated: ${
    result.truncated
      ? "yes; evidence was omitted to fit the output budget"
      : "no"
  }\n`;
  output += renderExcludedPackageFamilies(result.excluded_package_families);
  for (const match of result.matches) {
    const sources = match.citation.source_records.length
      ? `; sources ${match.citation.source_records
          .map((source) =>
            renderUntrustedMarkdownEvidence(source, { mode: "inline" }),
          )
          .join(", ")}`
      : "";
    output += `\n## ${renderUntrustedMarkdownEvidence(match.title, {
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
  }
  if (result.answer_status) {
    output += `\nAnswer status: ${renderUntrustedMarkdownEvidence(
      result.answer_status,
      { mode: "inline" },
    )}\n`;
  }
  if (result.limitations?.length) {
    output += `\n## Context limits\n\n${result.limitations
      .map(
        (limitation) =>
          `- ${renderUntrustedMarkdownEvidence(limitation, {
            mode: "inline",
          })}`,
      )
      .join("\n")}\n`;
  }
  if (result.contextual_examples?.length) {
    output += `\n## Contextual source examples\n\n${result.contextual_examples
      .map((example) => {
        const sources = example.source_records.length
          ? `; sources ${example.source_records
              .map((source) =>
                renderUntrustedMarkdownEvidence(source, { mode: "inline" }),
              )
              .join(", ")}`
          : "";
        return `- ${renderUntrustedMarkdownEvidence(example.title, { mode: "inline" })}: ${renderUntrustedMarkdownEvidence(example.reference, { mode: "inline" })}${example.description ? ` — ${renderUntrustedMarkdownEvidence(example.description, { mode: "inline" })}` : ""}${sources}`;
      })
      .join("\n")}\n`;
  }
  for (const document of result.canonical_documents ?? []) {
    output += `\n${renderCanonicalDocument(
      canonicalSelectionForContext(document),
    )}\n`;
  }
  return output;
}

export function buildKnowledgeContext(
  store: KnowledgeRecordStore,
  input: SearchSaltInput & { max_utf8_bytes?: number },
): KnowledgeContextResult {
  const maxBytes = contextBudget(input);
  if (Buffer.byteLength(input.query.trim(), "utf8") > maxBytes) {
    throw new KnowledgeContextInputError(KNOWLEDGE_CONTEXT_INPUT_ERROR);
  }
  const search = searchSaltRecords(store, input);
  // Task questions can match canonical guidance below component/API hits.
  // Reuse the same lexical index within the guide family, without changing
  // search ranking or replacing the user's selected record matches.
  const hasMatchedGuide = search.matches.some((match) => {
    const reference = canonicalDocumentReference(store, match.reference);
    return (
      reference &&
      resolveKnowledgeRecordCompatibility(
        store,
        reference,
        input.installed_versions,
      ).included
    );
  });
  const guideMatches =
    !hasMatchedGuide &&
    taskRoles(meaningfulWords(input.query)).length > 0 &&
    (!input.families ||
      input.families.length === 0 ||
      input.families.includes("guide"))
      ? searchSaltRecords(store, { ...input, families: ["guide"], limit: 8 })
          .matches
      : [];
  const base = {
    contract: "salt-knowledge-context/1" as const,
    scoring_version: KNOWLEDGE_SEARCH_SCORING_VERSION,
    query: search.query,
    bundle_digest: search.bundle_digest,
    excluded_package_families: search.excluded_package_families,
  };
  for (
    let matchCount = search.matches.length;
    matchCount >= 0;
    matchCount -= 1
  ) {
    const candidates = canonicalContextCandidates(
      store,
      [...search.matches.slice(0, matchCount), ...guideMatches],
      search.query,
      input.installed_versions,
    );
    for (const candidate of canonicalContextVariants(candidates)) {
      // No match prefix can fit if the canonical payload alone exceeds budget.
      if (
        Buffer.byteLength(JSON.stringify(candidate.documents), "utf8") >
        maxBytes
      )
        continue;
      const matchVariants = Array.from(
        { length: matchCount + 1 },
        (_, omitted) => ({
          matches: search.matches.slice(0, matchCount - omitted),
          truncated:
            omitted > 0 ||
            matchCount < search.matches.length ||
            candidate.truncated === true,
        }),
      ).filter(
        (variant) =>
          variant.matches.length > 0 ||
          !(
            candidates.direct_evidence_focus &&
            candidate.documents.length > 0 &&
            candidate.truncated !== true
          ),
      );
      for (const selectedMatches of matchVariants) {
        const result = finalizeKnowledgeContext({
          ...base,
          ...selectedMatches,
          ...contextualResultFields(candidate, selectedMatches.matches.length),
        });
        if (
          result.utf8_bytes + 1 <= maxBytes &&
          Buffer.byteLength(renderFinalKnowledgeContext(result), "utf8") <=
            maxBytes
        ) {
          return result;
        }
      }
    }
    if (candidates.documents.length > 0) {
      // The variants already tried an omission with no matches or examples.
      // Dropping its reference would falsely imply no applicable guide exists.
      throw new KnowledgeContextInputError(KNOWLEDGE_CONTEXT_INPUT_ERROR);
    }
  }
  throw new KnowledgeContextInputError(KNOWLEDGE_CONTEXT_INPUT_ERROR);
}

export function renderKnowledgeContext(
  store: KnowledgeRecordStore,
  input: SearchSaltInput & { max_utf8_bytes?: number },
): string {
  const result = buildKnowledgeContext(store, input);
  return renderFinalKnowledgeContext(result);
}
