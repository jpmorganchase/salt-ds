import MiniSearch from "minisearch";
import type { PageRecord } from "../types.js";

export interface PageSearchDocument {
  id: string;
  title: string;
  route: string;
  page_kind: string;
  summary: string;
  keywords: string[];
  section_headings: string[];
  content: string[];
}

export type SerializedPageSearchIndex = ReturnType<
  MiniSearch<PageSearchDocument>["toJSON"]
>;

const PAGE_SEARCH_BOOST = {
  title: 8,
  summary: 6,
  content: 5,
  keywords: 3,
  section_headings: 2,
  route: 2,
  page_kind: 1,
} as const;

function usePageSearchPrefix(term: string): boolean {
  return term.length >= 3;
}

function getPageSearchFuzzy(term: string): number | false {
  return term.length >= 5 ? 0.15 : false;
}

export function getPageSearchQueryOptions() {
  return {
    boost: { ...PAGE_SEARCH_BOOST },
    prefix: usePageSearchPrefix,
    fuzzy: getPageSearchFuzzy,
    combineWith: "OR" as const,
  };
}

export function getPageSearchIndexOptions() {
  return {
    fields: [
      "title",
      "summary",
      "keywords",
      "section_headings",
      "content",
      "route",
      "page_kind",
    ],
    storeFields: ["id", "title", "route", "summary", "page_kind"],
    searchOptions: getPageSearchQueryOptions(),
  };
}

export function toPageSearchDocument(page: PageRecord): PageSearchDocument {
  return {
    id: page.id,
    title: page.title,
    route: page.route,
    page_kind: page.page_kind,
    summary: page.summary,
    keywords: page.keywords,
    section_headings: page.section_headings,
    content: page.content,
  };
}

export function createPageSearchIndex(
  pages: PageRecord[],
): MiniSearch<PageSearchDocument> {
  const index = new MiniSearch<PageSearchDocument>(getPageSearchIndexOptions());
  if (pages.length > 0) {
    index.addAll(pages.map(toPageSearchDocument));
  }
  return index;
}

export function buildSerializedPageSearchIndex(
  pages: PageRecord[],
): SerializedPageSearchIndex {
  return createPageSearchIndex(pages).toJSON();
}

export function loadSerializedPageSearchIndex(
  serializedIndex: SerializedPageSearchIndex,
): MiniSearch<PageSearchDocument> {
  return MiniSearch.loadJS<PageSearchDocument>(
    serializedIndex,
    getPageSearchIndexOptions(),
  );
}
