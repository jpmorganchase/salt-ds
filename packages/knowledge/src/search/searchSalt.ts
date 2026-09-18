import type {
  KnowledgeRecordFamily,
  KnowledgeRecordStore,
} from "../manifest/knowledgeStore.js";

export const KNOWLEDGE_SEARCH_TARGET_FAMILY_NAMES = [
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
}

export interface SaltKnowledgeRecordReference {
  family: KnowledgeSearchTargetFamilyName;
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
  searched_families: KnowledgeSearchTargetFamilyName[];
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
  const allowed = new Set(requested.map(normalize));
  return (document.facets.status ?? []).some((status) =>
    allowed.has(normalize(status)),
  );
}

function rankDocument(
  document: KnowledgeSearchDocument,
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
  store: KnowledgeRecordStore,
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
  const familySet = new Set<KnowledgeSearchTargetFamilyName>(families);
  const documents = store.getFamily(
    "search_document",
  ) as readonly KnowledgeSearchDocument[];
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

export const searchKnowledge = searchSaltRecords;

export function readKnowledgeRecord(
  store: KnowledgeRecordStore,
  reference: { family: KnowledgeRecordFamily; id: string },
): unknown | null {
  return store.getRecord(reference.family, reference.id);
}

function truncateUtf8(value: string, maxBytes: number): string {
  const bytes = Buffer.from(value, "utf8");
  if (bytes.byteLength <= maxBytes) return value;
  let boundary = maxBytes;
  while (boundary > 0 && (bytes[boundary] & 0xc0) === 0x80) boundary -= 1;
  return bytes.subarray(0, boundary).toString("utf8");
}

export function renderKnowledgeContext(
  store: KnowledgeRecordStore,
  input: SearchSaltInput & { max_utf8_bytes?: number },
): string {
  const maxBytes = Math.min(
    16 * 1024,
    Math.max(256, input.max_utf8_bytes ?? 16 * 1024),
  );
  const result = searchKnowledge(store, input);
  const header = `${truncateUtf8(
    `# Salt knowledge: ${result.query}`,
    maxBytes - 1,
  )}\n`;
  let output = header;
  for (const match of result.matches) {
    const next = `\n## ${match.title}\n\n${match.summary}\n\nRecord: ${match.reference.family}/${match.reference.id}\n`;
    if (Buffer.byteLength(output, "utf8") + Buffer.byteLength(next, "utf8") > maxBytes) {
      break;
    }
    output += next;
  }
  return output;
}
