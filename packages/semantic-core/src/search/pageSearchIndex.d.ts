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
declare function usePageSearchPrefix(term: string): boolean;
declare function getPageSearchFuzzy(term: string): number | false;
export declare function getPageSearchQueryOptions(): {
  boost: {
    title: 8;
    summary: 6;
    content: 5;
    keywords: 3;
    section_headings: 2;
    route: 2;
    page_kind: 1;
  };
  prefix: typeof usePageSearchPrefix;
  fuzzy: typeof getPageSearchFuzzy;
  combineWith: "OR";
};
export declare function getPageSearchIndexOptions(): {
  fields: string[];
  storeFields: string[];
  searchOptions: {
    boost: {
      title: 8;
      summary: 6;
      content: 5;
      keywords: 3;
      section_headings: 2;
      route: 2;
      page_kind: 1;
    };
    prefix: typeof usePageSearchPrefix;
    fuzzy: typeof getPageSearchFuzzy;
    combineWith: "OR";
  };
};
export declare function toPageSearchDocument(
  page: PageRecord,
): PageSearchDocument;
export declare function createPageSearchIndex(
  pages: PageRecord[],
): MiniSearch<PageSearchDocument>;
export declare function buildSerializedPageSearchIndex(
  pages: PageRecord[],
): SerializedPageSearchIndex;
export declare function loadSerializedPageSearchIndex(
  serializedIndex: SerializedPageSearchIndex,
): MiniSearch<PageSearchDocument>;
