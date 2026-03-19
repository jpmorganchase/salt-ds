import type { GuideRecord } from "../types.js";
import { resolveLookup } from "./lookupResolver.js";

export interface GuideLookupAmbiguity {
  query: string;
  matched_by: "name" | "alias";
  matches: Array<{
    name: string;
    kind: GuideRecord["kind"];
  }>;
}

export interface GuideLookupResult {
  candidate: GuideRecord | null;
  ambiguity?: GuideLookupAmbiguity;
}

export function normalizeGuideLookup(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function resolveGuideLookup(
  guides: GuideRecord[],
  query: string,
): GuideLookupResult {
  const normalizedName = normalizeGuideLookup(query);
  const nameMatches = guides.filter(
    (guide) => normalizeGuideLookup(guide.name) === normalizedName,
  );
  const aliasMatches = guides.filter((guide) =>
    guide.aliases.some(
      (alias) => normalizeGuideLookup(alias) === normalizedName,
    ),
  );

  return resolveLookup(query, [
    {
      matchedBy: "name" as const,
      matches: nameMatches,
      toAmbiguityMatch: (guide: GuideRecord) => ({
        name: guide.name,
        kind: guide.kind,
      }),
    },
    {
      matchedBy: "alias" as const,
      matches: aliasMatches,
      ambiguityWhen: "if_unresolved",
      toAmbiguityMatch: (guide: GuideRecord) => ({
        name: guide.name,
        kind: guide.kind,
      }),
    },
  ]);
}
