import type { PageRecord, SaltRegistry } from "../types.js";
import { normalizeQuery, tokenize } from "./utils.js";

export interface ListFoundationsInput {
  query?: string;
  max_results?: number;
}

export interface ListFoundationsResult {
  total: number;
  truncated: boolean;
  foundations: Array<Record<string, unknown>>;
}

function toCompactFoundation(page: PageRecord): Record<string, unknown> {
  return {
    id: page.id,
    title: page.title,
    route: page.route,
    summary: page.summary,
    keywords: page.keywords,
    section_headings: page.section_headings,
    content_preview: page.content.slice(0, 6),
  };
}

function scoreFoundation(page: PageRecord, query: string): number {
  if (!query) {
    return 0;
  }

  const queryTokens = tokenize(query);
  let score = 0;
  const title = page.title.toLowerCase();
  const summary = page.summary.toLowerCase();
  const keywords = page.keywords.map((keyword) => keyword.toLowerCase());
  const headings = page.section_headings.map((heading) =>
    heading.toLowerCase(),
  );
  const content = page.content.map((block) => block.toLowerCase());

  if (title === query) {
    score += 18;
  } else if (title.includes(query)) {
    score += 10;
  }

  if (summary.includes(query)) {
    score += 6;
  }
  if (headings.some((heading) => heading.includes(query))) {
    score += 6;
  }
  if (content.some((block) => block.includes(query))) {
    score += 4;
  }

  for (const token of queryTokens) {
    if (title.includes(token)) {
      score += 4;
    }
    if (summary.includes(token)) {
      score += 2;
    }
    if (keywords.some((keyword) => keyword.includes(token))) {
      score += 2;
    }
    if (headings.some((heading) => heading.includes(token))) {
      score += 2;
    }
    if (content.some((block) => block.includes(token))) {
      score += 1;
    }
  }

  return score;
}

export function listFoundations(
  registry: SaltRegistry,
  input: ListFoundationsInput,
): ListFoundationsResult {
  const query = normalizeQuery(input.query ?? "");
  const maxResults = Math.max(1, Math.min(input.max_results ?? 25, 100));

  const foundations = registry.pages
    .filter((page) => page.page_kind === "foundation")
    .map((page) => ({
      page,
      score: scoreFoundation(page, query),
    }))
    .filter((candidate) => candidate.score > 0 || query.length === 0)
    .sort((left, right) => {
      if (left.score !== right.score) {
        return right.score - left.score;
      }
      return left.page.title.localeCompare(right.page.title);
    });

  return {
    total: foundations.length,
    truncated: foundations.length > maxResults,
    foundations: foundations
      .slice(0, maxResults)
      .map(({ page }) => toCompactFoundation(page)),
  };
}
