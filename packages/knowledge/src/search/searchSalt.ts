import {
  CATALOG_SEARCH_TARGET_FAMILY_NAMES,
  type CatalogRecordForFamily,
  type CatalogSearchTargetFamilyName,
} from "../catalog/catalogSchemaV2.js";
import type { CatalogStoreV2 } from "../catalog/catalogStoreV2.js";

export interface SearchSaltInput {
  query: string;
  families?: CatalogSearchTargetFamilyName[];
  statuses?: string[];
  limit?: number;
}

export interface SaltKnowledgeRecordReference {
  family: CatalogSearchTargetFamilyName;
  id: string;
}

export interface SearchSaltRecordMatch {
  reference: SaltKnowledgeRecordReference;
  title: string;
  summary: string;
  evidence: {
    matched_fields: Array<"title" | "summary" | "terms">;
    matched_terms: string[];
    score: number;
  };
}

export interface SearchSaltRecordsResult {
  query: string;
  matches: SearchSaltRecordMatch[];
  searched_families: CatalogSearchTargetFamilyName[];
  searched_statuses: string[] | null;
  indexed_documents: number;
  evaluated_documents: number;
  matched_documents: number;
  candidate_count: number;
  top_score_tie_count: number;
}

export const MAX_KNOWLEDGE_SEARCH_RESULTS = 100;
export const DEFAULT_SEARCH_RESULTS = 8;
const WORD_PATTERN = /[\p{L}\p{N}]+/gu;

function normalize(value: string): string {
  return value.normalize("NFKC").toLocaleLowerCase("en-US").trim();
}

function words(value: string): string[] {
  return [...new Set(normalize(value).match(WORD_PATTERN) ?? [])];
}

function selectedFamilies(
  requested: readonly CatalogSearchTargetFamilyName[] | undefined,
): CatalogSearchTargetFamilyName[] {
  const allow = new Set(CATALOG_SEARCH_TARGET_FAMILY_NAMES);
  return requested && requested.length > 0
    ? [...new Set(requested)].filter((family) => allow.has(family))
    : [...CATALOG_SEARCH_TARGET_FAMILY_NAMES];
}

function hasSelectedStatus(
  document: CatalogRecordForFamily<"search_document">,
  requested: readonly string[] | undefined,
): boolean {
  if (!requested || requested.length === 0) return true;
  const allowed = new Set(requested.map(normalize));
  return (document.facets.status ?? []).some((status) =>
    allowed.has(normalize(status)),
  );
}

function rankDocument(
  document: CatalogRecordForFamily<"search_document">,
  normalizedQuery: string,
  queryWords: readonly string[],
): {
  score: number;
  matchedFields: Array<"title" | "summary" | "terms">;
  matchedTerms: string[];
} | null {
  const title = normalize(document.title);
  const summary = normalize(document.summary);
  const normalizedTerms = document.terms.map(normalize);
  const searchable = normalize(
    [document.title, document.summary, ...document.terms].join(" "),
  );
  const matchedTerms = document.terms.filter((term) => {
    const candidate = normalize(term);
    return (
      candidate.includes(normalizedQuery) ||
      queryWords.some((word) => candidate.includes(word))
    );
  });
  const matchedWords = queryWords.filter((word) => searchable.includes(word));
  const fieldMatches = (value: string) =>
    value.includes(normalizedQuery) ||
    queryWords.some((word) => value.includes(word));
  const matchedFields: Array<"title" | "summary" | "terms"> = [];
  if (fieldMatches(title)) matchedFields.push("title");
  if (fieldMatches(summary)) matchedFields.push("summary");
  if (normalizedTerms.some(fieldMatches)) matchedFields.push("terms");

  if (
    title !== normalizedQuery &&
    !searchable.includes(normalizedQuery) &&
    matchedWords.length === 0
  ) {
    return null;
  }

  let score = 0;
  if (title === normalizedQuery) score += 1_000;
  if (title.startsWith(normalizedQuery)) score += 400;
  if (normalizedTerms.includes(normalizedQuery)) score += 300;
  if (title.includes(normalizedQuery)) score += 200;
  if (searchable.includes(normalizedQuery)) score += 100;
  score += matchedWords.length * 25;
  score += Math.round(
    (matchedWords.length / Math.max(1, queryWords.length)) * 50,
  );

  return {
    score,
    matchedFields,
    matchedTerms: [...new Set(matchedTerms)].slice(0, 8),
  };
}

/**
 * Protocol-neutral catalog search. References identify records without
 * choosing a transport URI, public response envelope, or wire-size budget.
 */
export function searchSaltRecords(
  store: CatalogStoreV2,
  input: SearchSaltInput,
): SearchSaltRecordsResult {
  const query = input.query.trim();
  const normalizedQuery = normalize(query);
  const queryWords = words(query);
  const families = selectedFamilies(input.families);
  const statuses =
    input.statuses && input.statuses.length > 0
      ? [...new Set(input.statuses.map(normalize))]
      : null;
  const familySet = new Set<CatalogSearchTargetFamilyName>(families);
  const documents = store.getFamily("search_document");
  const limit = Math.min(
    MAX_KNOWLEDGE_SEARCH_RESULTS,
    Math.max(1, input.limit ?? DEFAULT_SEARCH_RESULTS),
  );

  let evaluatedDocuments = 0;
  const ranked = documents.flatMap((document) => {
    if (
      !familySet.has(document.target.family) ||
      !hasSelectedStatus(document, statuses ?? undefined)
    ) {
      return [];
    }
    evaluatedDocuments += 1;
    const ranking = rankDocument(document, normalizedQuery, queryWords);
    return ranking ? [{ document, ranking }] : [];
  });
  ranked.sort(
    (left, right) =>
      right.ranking.score - left.ranking.score ||
      left.document.target.family.localeCompare(right.document.target.family) ||
      left.document.target.id.localeCompare(right.document.target.id),
  );
  const topScore = ranked[0]?.ranking.score;
  const topScoreTieCount =
    topScore === undefined
      ? 0
      : ranked.filter((entry) => entry.ranking.score === topScore).length;

  return {
    query,
    matches: ranked.slice(0, limit).map(({ document, ranking }) => ({
      reference: {
        family: document.target.family,
        id: document.target.id,
      },
      title: document.title,
      summary: document.summary,
      evidence: {
        matched_fields: ranking.matchedFields,
        matched_terms: ranking.matchedTerms,
        score: ranking.score,
      },
    })),
    searched_families: families,
    searched_statuses: statuses,
    indexed_documents: documents.length,
    evaluated_documents: evaluatedDocuments,
    matched_documents: ranked.length,
    candidate_count: ranked.length,
    top_score_tie_count: topScoreTieCount,
  };
}

