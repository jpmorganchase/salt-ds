import {
  searchSaltRecords,
  type KnowledgeRecordStore,
  type KnowledgeSearchTargetFamilyName,
  type SaltKnowledgeRecordReference,
  type SearchSaltInput,
  type SearchSaltRecordMatch,
  type SearchSaltRecordsResult,
} from "@salt-ds/knowledge";
import { normalizeCatalogPublicCitation } from "../catalog/catalogPublicCitation.js";

export { searchSaltRecords };
export type {
  SaltKnowledgeRecordReference,
  SearchSaltInput,
  SearchSaltRecordMatch,
  SearchSaltRecordsResult,
};

export interface SearchSaltMatch {
  family: KnowledgeSearchTargetFamilyName;
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
    searched_families: KnowledgeSearchTargetFamilyName[];
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
export const DEFAULT_SEARCH_RESULTS = 8;
export const MAX_SEARCH_STRUCTURED_CONTENT_UTF8_BYTES = 3 * 1024;
const MAX_SUMMARY_CHARS = 240;

function boundedSummary(summary: string): string {
  if (summary.length <= MAX_SUMMARY_CHARS) return summary;
  return `${summary.slice(0, MAX_SUMMARY_CHARS - 1).trimEnd()}…`;
}

export function searchSalt(
  store: KnowledgeRecordStore,
  input: SearchSaltInput,
): SearchSaltResult {
  const neutral = searchSaltRecords(store, {
    ...input,
    limit: Math.min(
      MAX_SEARCH_RESULTS,
      Math.max(1, input.limit ?? DEFAULT_SEARCH_RESULTS),
    ),
  });
  const query = neutral.query;
  const families = neutral.searched_families;
  const statuses = neutral.searched_statuses;
  const documents = store.getFamily("search_document");
  let matches = neutral.matches.map((match) => {
    const uri = normalizeCatalogPublicCitation({
      kind: "catalog_record",
      manifest: store.manifest,
      family: match.reference.family,
      id: match.reference.id,
    });
    return {
      family: match.reference.family,
      id: match.reference.id,
      title: match.title,
      summary: boundedSummary(match.summary),
      uri,
      evidence: match.evidence,
      provenance: { resource_uri: uri },
    };
  });
  const topScoreTieCount = neutral.top_score_tie_count;

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
        candidate_count: neutral.candidate_count,
        top_score_tie_count: topScoreTieCount,
      },
    },
    scope: {
      kind: "catalog_search",
      searched_families: families,
      searched_statuses: statuses,
      total_documents: documents.length,
      returned: matches.length,
      truncated: neutral.matched_documents > matches.length || queryLimited,
    },
    coverage: {
      indexed_documents: documents.length,
      evaluated_documents: neutral.evaluated_documents,
      matched_documents: neutral.matched_documents,
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
      catalog_version:
        store.manifest.bundle_version ?? "0.0.0",
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
