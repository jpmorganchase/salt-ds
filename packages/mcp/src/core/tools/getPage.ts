import type { PageRecord, SaltRegistry } from "../types.js";
import { projectLookupRecord } from "./lookupResolver.js";
import { resolvePageLookup } from "./pageLookup.js";

export interface GetPageInput {
  name: string;
  view?: "compact" | "full";
}

export interface GetPageResult {
  page: Record<string, unknown> | null;
  did_you_mean?: string[];
  ambiguity?: {
    query: string;
    matched_by: "title" | "route" | "slug";
    matches: Array<{
      title: string;
      route: string;
      page_kind: PageRecord["page_kind"];
    }>;
  };
}

function toCompactPage(page: PageRecord): Record<string, unknown> {
  return {
    id: page.id,
    title: page.title,
    route: page.route,
    page_kind: page.page_kind,
    summary: page.summary,
    keywords: page.keywords,
    section_headings: page.section_headings,
    content_preview: page.content.slice(0, 6),
  };
}

export function getPage(
  registry: SaltRegistry,
  input: GetPageInput,
): GetPageResult {
  const resolution = resolvePageLookup(registry.pages, input.name);

  if (resolution.ambiguity) {
    return {
      page: null,
      did_you_mean: resolution.ambiguity.matches.map((match) => match.title),
      ambiguity: resolution.ambiguity,
    };
  }

  if (!resolution.candidate) {
    return { page: null };
  }

  return {
    page: projectLookupRecord(resolution.candidate, input.view, {
      toCompact: toCompactPage,
    }),
  };
}
