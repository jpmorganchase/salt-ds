import type { PageRecord } from "../types.js";
import { resolveLookup } from "./lookupResolver.js";

export interface PageLookupAmbiguity {
  query: string;
  matched_by: "route" | "title" | "slug";
  matches: Array<{
    title: string;
    route: string;
    page_kind: PageRecord["page_kind"];
  }>;
}

export interface PageLookupResult {
  candidate: PageRecord | null;
  ambiguity?: PageLookupAmbiguity;
}

export function normalizePageTitle(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function normalizePageRoute(value: string): string {
  const normalized = value
    .trim()
    .replace(/\\/g, "/")
    .replace(/\/+/g, "/")
    .replace(/\.mdx?$/i, "");
  const withLeadingSlash =
    normalized.startsWith("/") || !/^(salt|salt-github)(\/|$)/i.test(normalized)
      ? normalized
      : `/${normalized}`;

  return withLeadingSlash.toLowerCase();
}

export function normalizePageRouteBase(value: string): string {
  return normalizePageRoute(value).replace(/\/index$/i, "");
}

export function getPageSlug(route: string): string {
  const parts = normalizePageRoute(route).split("/").filter(Boolean);
  return parts.at(-1) ?? "";
}

export function resolvePageLookup(
  pages: PageRecord[],
  query: string,
): PageLookupResult {
  const normalizedTitle = normalizePageTitle(query);
  const normalizedRoute = normalizePageRoute(query);
  const normalizedRouteBase = normalizePageRouteBase(query);
  const routeMatches = pages.filter((page) => {
    const route = normalizePageRoute(page.route);
    return (
      route === normalizedRoute ||
      normalizePageRouteBase(page.route) === normalizedRouteBase
    );
  });
  const titleMatches = pages.filter(
    (page) => normalizePageTitle(page.title) === normalizedTitle,
  );
  const slugMatches = pages.filter(
    (page) => normalizePageTitle(getPageSlug(page.route)) === normalizedTitle,
  );

  return resolveLookup(query, [
    {
      matchedBy: "route" as const,
      matches: routeMatches,
      toAmbiguityMatch: (page: PageRecord) => ({
        title: page.title,
        route: page.route,
        page_kind: page.page_kind,
      }),
    },
    {
      matchedBy: "title" as const,
      matches: titleMatches,
      ambiguityWhen: "if_unresolved",
      toAmbiguityMatch: (page: PageRecord) => ({
        title: page.title,
        route: page.route,
        page_kind: page.page_kind,
      }),
    },
    {
      matchedBy: "slug" as const,
      matches: slugMatches,
      ambiguityWhen: "if_unresolved",
      toAmbiguityMatch: (page: PageRecord) => ({
        title: page.title,
        route: page.route,
        page_kind: page.page_kind,
      }),
    },
  ]);
}
