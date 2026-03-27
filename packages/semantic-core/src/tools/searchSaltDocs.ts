import { getRegistryIndexes } from "../registry/runtimeCache.js";
import type {
  SaltRegistry,
  SaltStatus,
  SearchArea,
  SearchIndexEntry,
} from "../types.js";
import { searchPages } from "./pageSearch.js";
import { filterSearchEntries } from "./searchCommon.js";
import { normalizeQuery, tokenize } from "./utils.js";

export interface SearchSaltDocsInput {
  query: string;
  area?: SearchArea;
  package?: string;
  status?: SaltStatus;
  top_k?: number;
}

export interface SearchSaltDocsResult {
  results: Array<{
    id: string;
    type: SearchIndexEntry["type"];
    name: string;
    package: string | null;
    status: SaltStatus | null;
    summary: string;
    score: number;
    match_reasons: Array<
      | "name_exact"
      | "name_phrase"
      | "summary_phrase"
      | "content_phrase"
      | "name_tokens"
      | "summary_tokens"
      | "content_tokens"
      | "keyword_tokens"
    >;
    score_breakdown: {
      name_exact: number;
      name_phrase: number;
      summary_phrase: number;
      content_phrase: number;
      name_tokens: number;
      summary_tokens: number;
      content_tokens: number;
      keyword_tokens: number;
    };
    matched_keywords: string[];
    matched_excerpt: string | null;
    source_url: string | null;
  }>;
}

interface SearchScoreDetails {
  score: number;
  match_reasons: Array<
    | "name_exact"
    | "name_phrase"
    | "summary_phrase"
    | "content_phrase"
    | "name_tokens"
    | "summary_tokens"
    | "content_tokens"
    | "keyword_tokens"
  >;
  score_breakdown: {
    name_exact: number;
    name_phrase: number;
    summary_phrase: number;
    content_phrase: number;
    name_tokens: number;
    summary_tokens: number;
    content_tokens: number;
    keyword_tokens: number;
  };
  matched_keywords: string[];
  matched_excerpt: string | null;
}

function getEntryContent(
  registry: SaltRegistry,
  entry: SearchIndexEntry,
): string[] {
  const { changeById, guideById, pageById } = getRegistryIndexes(registry);

  if (entry.type === "page") {
    const page = pageById.get(entry.id) ?? null;
    return page ? [...page.section_headings, ...page.content] : [];
  }

  if (entry.type === "guide") {
    const guide = guideById.get(entry.id) ?? null;
    return guide
      ? guide.steps.flatMap((step) => [step.title, ...step.statements])
      : [];
  }

  if (entry.type === "change") {
    const change = changeById.get(entry.id) ?? null;
    return change ? [change.details] : [];
  }

  return [];
}

function scoreContentBlock(
  block: string,
  query: string,
  queryTokens: string[],
) {
  const normalizedBlock = block.toLowerCase();
  const phraseScore = normalizedBlock.includes(query) ? 6 : 0;
  const tokenScore = queryTokens.reduce(
    (sum, token) => sum + (normalizedBlock.includes(token) ? 1 : 0),
    0,
  );

  return {
    phrase: phraseScore,
    tokens: tokenScore,
    total: phraseScore + tokenScore,
  };
}

function findBestContentMatch(
  contentBlocks: string[],
  query: string,
  queryTokens: string[],
): string | null {
  if (contentBlocks.length === 0) {
    return null;
  }

  const bestMatch = contentBlocks
    .map((block) => ({
      block,
      score: scoreContentBlock(block, query, queryTokens).total,
    }))
    .filter((candidate) => candidate.score > 0)
    .sort((left, right) => right.score - left.score)[0];

  return bestMatch?.block ?? null;
}

function scoreEntry(
  registry: SaltRegistry,
  entry: SearchIndexEntry,
  query: string,
): SearchScoreDetails {
  if (!query) {
    return {
      score: 0,
      match_reasons: [],
      score_breakdown: {
        name_exact: 0,
        name_phrase: 0,
        summary_phrase: 0,
        content_phrase: 0,
        name_tokens: 0,
        summary_tokens: 0,
        content_tokens: 0,
        keyword_tokens: 0,
      },
      matched_keywords: [],
      matched_excerpt: null,
    };
  }

  const normalizedName = entry.name.toLowerCase();
  const normalizedSummary = entry.summary.toLowerCase();
  const keywords = entry.keywords.map((keyword) => keyword.toLowerCase());
  const contentBlocks = getEntryContent(registry, entry);
  const normalizedContent = contentBlocks.map((block) => block.toLowerCase());
  const queryTokens = tokenize(query);
  const matchedKeywords = new Set<string>();
  const contentTokenWeight = entry.type === "page" ? 2 : 1;
  const scoreBreakdown = {
    name_exact: 0,
    name_phrase: 0,
    summary_phrase: 0,
    content_phrase: 0,
    name_tokens: 0,
    summary_tokens: 0,
    content_tokens: 0,
    keyword_tokens: 0,
  };

  if (normalizedName === query) {
    scoreBreakdown.name_exact = 30;
  } else if (normalizedName.includes(query)) {
    scoreBreakdown.name_phrase = 8;
  }

  if (normalizedSummary.includes(query)) {
    scoreBreakdown.summary_phrase = 5;
  }
  if (normalizedContent.some((block) => block.includes(query))) {
    scoreBreakdown.content_phrase = 6;
  }

  for (const token of queryTokens) {
    if (normalizedName.includes(token)) {
      scoreBreakdown.name_tokens += 4;
    }
    if (normalizedSummary.includes(token)) {
      scoreBreakdown.summary_tokens += 2;
    }
    if (normalizedContent.some((block) => block.includes(token))) {
      scoreBreakdown.content_tokens += contentTokenWeight;
    }

    const keywordMatches = keywords.filter((keyword) =>
      keyword.includes(token),
    );
    if (keywordMatches.length > 0) {
      scoreBreakdown.keyword_tokens += 1;
      for (const keyword of keywordMatches) {
        matchedKeywords.add(keyword);
      }
    }
  }

  const matchReasons = (
    [
      ["name_exact", scoreBreakdown.name_exact],
      ["name_phrase", scoreBreakdown.name_phrase],
      ["summary_phrase", scoreBreakdown.summary_phrase],
      ["content_phrase", scoreBreakdown.content_phrase],
      ["name_tokens", scoreBreakdown.name_tokens],
      ["summary_tokens", scoreBreakdown.summary_tokens],
      ["content_tokens", scoreBreakdown.content_tokens],
      ["keyword_tokens", scoreBreakdown.keyword_tokens],
    ] as const
  )
    .filter(([, contribution]) => contribution > 0)
    .map(([reason]) => reason);

  const score =
    scoreBreakdown.name_exact +
    scoreBreakdown.name_phrase +
    scoreBreakdown.summary_phrase +
    scoreBreakdown.content_phrase +
    scoreBreakdown.name_tokens +
    scoreBreakdown.summary_tokens +
    scoreBreakdown.content_tokens +
    scoreBreakdown.keyword_tokens;

  return {
    score,
    match_reasons: matchReasons,
    score_breakdown: scoreBreakdown,
    matched_keywords: [...matchedKeywords].sort((left, right) =>
      left.localeCompare(right),
    ),
    matched_excerpt: findBestContentMatch(contentBlocks, query, queryTokens),
  };
}

function toSearchResult(
  entry: SearchIndexEntry,
  details: SearchScoreDetails,
  scoreOverride?: number,
): SearchSaltDocsResult["results"][number] {
  return {
    id: entry.id,
    type: entry.type,
    name: entry.name,
    package: entry.package,
    status: entry.status,
    summary: entry.summary,
    score: scoreOverride ?? details.score,
    match_reasons: details.match_reasons,
    score_breakdown: details.score_breakdown,
    matched_keywords: details.matched_keywords,
    matched_excerpt: details.matched_excerpt,
    source_url: entry.source_url,
  };
}

function normalizeRankScore(
  rawScore: number,
  maxRawScore: number,
  maxBonus = 6,
): number {
  if (rawScore <= 0 || maxRawScore <= 0) {
    return 0;
  }

  return Number(((rawScore / maxRawScore) * maxBonus).toFixed(3));
}

export function searchSaltDocs(
  registry: SaltRegistry,
  input: SearchSaltDocsInput,
): SearchSaltDocsResult {
  const query = normalizeQuery(input.query);
  const area = input.area ?? "all";
  const topK = Math.max(1, Math.min(input.top_k ?? 5, 25));
  const useMiniSearchForPages =
    query.length > 0 &&
    (area === "all" || area === "pages" || area === "foundations");
  const { searchEntryById } = getRegistryIndexes(registry);

  const rawPageResults = useMiniSearchForPages
    ? searchPages(registry, input.query, topK * (area === "all" ? 3 : 1))
        .filter((result) =>
          area === "foundations"
            ? result.page.page_kind === "foundation"
            : true,
        )
        .filter(() => !input.package)
        .filter((_result) => (input.status ? input.status === "stable" : true))
    : [];
  const maxPageScore = rawPageResults.reduce(
    (maxScore, result) => Math.max(maxScore, result.score),
    0,
  );

  const pageResults = rawPageResults.map((result) => {
    const entry =
      searchEntryById.get(result.page.id) ??
      ({
        id: result.page.id,
        type: "page",
        name: result.page.title,
        package: null,
        status: "stable",
        summary: result.page.summary,
        source_url: result.page.route,
        keywords: [
          result.page.title,
          result.page.page_kind,
          ...result.page.keywords,
          ...result.page.section_headings,
        ],
      } satisfies SearchIndexEntry);
    const details = scoreEntry(registry, entry, query);
    const rankScore =
      details.score + normalizeRankScore(result.score, maxPageScore);
    return {
      result: toSearchResult(entry, details, rankScore),
      rank_score: rankScore,
    };
  });

  const scored = filterSearchEntries(registry, {
    area,
    package: input.package,
    status: input.status,
    exclude_types: useMiniSearchForPages ? ["page"] : [],
  })
    .map((entry) => ({
      entry,
      details: scoreEntry(registry, entry, query),
    }))
    .filter((candidate) => candidate.details.score > 0 || query.length === 0)
    .map(({ entry, details }) => ({
      result: toSearchResult(entry, details),
      rank_score: details.score,
    }));

  const combined = [...pageResults, ...scored]
    .sort((left, right) => {
      if (right.rank_score !== left.rank_score) {
        return right.rank_score - left.rank_score;
      }
      if (left.result.type !== right.result.type) {
        return left.result.type.localeCompare(right.result.type);
      }
      return left.result.name.localeCompare(right.result.name);
    })
    .slice(0, topK)
    .map((candidate) => candidate.result);

  return {
    results: combined,
  };
}
