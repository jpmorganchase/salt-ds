import { normalizeCatalogPublicCitation } from "../catalog/catalogPublicCitation.js";
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

export interface SearchSaltMatch {
  family: CatalogSearchTargetFamilyName;
  id: string;
  title: string;
  summary: string;
  uri: string;
  evidence: {
    matched_fields: Array<"title" | "summary" | "terms">;
    matched_terms: string[];
    score: number;
  };
  provenance: {
    resource_uri: string;
  };
}

export interface SearchSaltResult {
  data: {
    query: string;
    matches: SearchSaltMatch[];
    ambiguity: {
      is_ambiguous: boolean;
      candidate_count: number;
      top_score_tie_count: number;
    };
  };
  coverage: {
    indexed_documents: number;
    evaluated_documents: number;
    matched_documents: number;
    ranking: "deterministic_catalog_index";
  };
  scope: {
    kind: "catalog_search";
    searched_families: CatalogSearchTargetFamilyName[];
    searched_statuses: string[] | null;
    total_documents: number;
    returned: number;
    truncated: boolean;
  };
  limitations: string[];
  provenance: {
    catalog_version: string;
    semantic_digest: string;
  };
}

export const MAX_SEARCH_RESULTS = 8;
export const MAX_SEARCH_STRUCTURED_CONTENT_UTF8_BYTES = 3 * 1024;
const MAX_SUMMARY_CHARS = 240;
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

function boundedSummary(summary: string): string {
  if (summary.length <= MAX_SUMMARY_CHARS) return summary;
  return `${summary.slice(0, MAX_SUMMARY_CHARS - 1).trimEnd()}…`;
}

export function searchSalt(
  store: CatalogStoreV2,
  input: SearchSaltInput,
): SearchSaltResult {
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
    MAX_SEARCH_RESULTS,
    Math.max(1, input.limit ?? MAX_SEARCH_RESULTS),
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
  let matches = ranked.slice(0, limit).map(({ document, ranking }) => {
    const uri = normalizeCatalogPublicCitation({
      kind: "catalog_record",
      manifest: store.manifest,
      family: document.target.family,
      id: document.target.id,
    });
    return {
      family: document.target.family,
      id: document.target.id,
      title: document.title,
      summary: boundedSummary(document.summary),
      uri,
      evidence: {
        matched_fields: ranking.matchedFields,
        matched_terms: ranking.matchedTerms,
        score: ranking.score,
      },
      provenance: { resource_uri: uri },
    };
  });
  const topScore = ranked[0]?.ranking.score;
  const topScoreTieCount =
    topScore === undefined
      ? 0
      : ranked.filter((entry) => entry.ranking.score === topScore).length;

  const queryUtf8Bytes = Buffer.byteLength(query, "utf8");
  let publicQuery = query;
  const buildResult = (
    matchLimited: boolean,
    queryLimited: boolean,
  ): SearchSaltResult => ({
    data: {
      query: publicQuery,
      matches,
      ambiguity: {
        is_ambiguous: topScoreTieCount > 1,
        candidate_count: ranked.length,
        top_score_tie_count: topScoreTieCount,
      },
    },
    scope: {
      kind: "catalog_search",
      searched_families: families,
      searched_statuses: statuses,
      total_documents: documents.length,
      returned: matches.length,
      truncated: ranked.length > matches.length || queryLimited,
    },
    coverage: {
      indexed_documents: documents.length,
      evaluated_documents: evaluatedDocuments,
      matched_documents: ranked.length,
      ranking: "deterministic_catalog_index" as const,
    },
    limitations: [
      "Search returns bounded summaries. Read the linked canonical resource for complete catalog content.",
      ...(matchLimited
        ? [
            "Additional matches were omitted to keep the structured result within the public byte limit.",
          ]
        : []),
      ...(queryLimited
        ? [
            `The ${queryUtf8Bytes}-byte submitted query was used in full for search, but its public echo was truncated to fit the structured result budget.`,
          ]
        : []),
    ],
    provenance: {
      catalog_version: store.manifest.catalog_version,
      semantic_digest: store.manifest.semantic_digest,
    },
  });

  let result = buildResult(false, false);
  let matchLimited = false;
  while (
    Buffer.byteLength(JSON.stringify(result), "utf8") >
      MAX_SEARCH_STRUCTURED_CONTENT_UTF8_BYTES &&
    matches.length > 0
  ) {
    matches = matches.slice(0, -1);
    matchLimited = true;
    result = buildResult(matchLimited, false);
  }
  if (
    Buffer.byteLength(JSON.stringify(result), "utf8") >
    MAX_SEARCH_STRUCTURED_CONTENT_UTF8_BYTES
  ) {
    const codePoints = Array.from(query);
    let lower = 0;
    let upper = codePoints.length;
    while (lower < upper) {
      const candidateLength = Math.ceil((lower + upper) / 2);
      publicQuery = codePoints.slice(0, candidateLength).join("");
      const candidate = buildResult(matchLimited, true);
      if (
        Buffer.byteLength(JSON.stringify(candidate), "utf8") <=
        MAX_SEARCH_STRUCTURED_CONTENT_UTF8_BYTES
      ) {
        lower = candidateLength;
      } else {
        upper = candidateLength - 1;
      }
    }
    publicQuery = codePoints.slice(0, lower).join("");
    result = buildResult(matchLimited, true);
  }
  if (
    Buffer.byteLength(JSON.stringify(result), "utf8") >
    MAX_SEARCH_STRUCTURED_CONTENT_UTF8_BYTES
  ) {
    throw new Error(
      `search_salt metadata exceeded its ${MAX_SEARCH_STRUCTURED_CONTENT_UTF8_BYTES}-byte public result limit.`,
    );
  }
  return result;
}
