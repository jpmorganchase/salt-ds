import type { PatternRecord, SaltRegistry } from "../types.js";
import { resolveLookup } from "./lookupResolver.js";

function normalizePatternLookup(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function getRouteSlug(route: string | null): string | null {
  if (!route) {
    return null;
  }

  const parts = route.split("/").filter((part) => part.length > 0);
  return parts.at(-1) ?? null;
}

export interface ResolvedPatternTarget {
  pattern: PatternRecord;
  matched_by: Array<"name" | "alias" | "slug">;
}

export interface PatternLookupAmbiguity {
  query: string;
  matched_by: "name" | "alias" | "slug";
  matches: Array<{
    name: string;
    status: PatternRecord["status"];
  }>;
}

export function resolvePatternTarget(
  registry: SaltRegistry,
  targetName: string,
): {
  candidate?: ResolvedPatternTarget;
  ambiguity?: PatternLookupAmbiguity;
} {
  const normalizedName = normalizePatternLookup(targetName);
  const nameMatches = registry.patterns.filter(
    (pattern) => normalizePatternLookup(pattern.name) === normalizedName,
  );
  const aliasMatches = registry.patterns.filter((pattern) =>
    pattern.aliases.some(
      (alias) => normalizePatternLookup(alias) === normalizedName,
    ),
  );
  const slugMatches = registry.patterns.filter((pattern) => {
    const routeSlug = getRouteSlug(pattern.related_docs.overview);
    return routeSlug
      ? normalizePatternLookup(routeSlug) === normalizedName
      : false;
  });

  const resolution = resolveLookup(targetName, [
    {
      matchedBy: "name" as const,
      matches: nameMatches,
      toAmbiguityMatch: (pattern: PatternRecord) => ({
        name: pattern.name,
        status: pattern.status,
      }),
    },
    {
      matchedBy: "alias" as const,
      matches: aliasMatches,
      ambiguityWhen: "if_unresolved",
      toAmbiguityMatch: (pattern: PatternRecord) => ({
        name: pattern.name,
        status: pattern.status,
      }),
    },
    {
      matchedBy: "slug" as const,
      matches: slugMatches,
      ambiguityWhen: "if_unresolved",
      toAmbiguityMatch: (pattern: PatternRecord) => ({
        name: pattern.name,
        status: pattern.status,
      }),
    },
  ]);

  if (!resolution.candidate) {
    return {
      ambiguity: resolution.ambiguity,
    };
  }

  const matchedBy: ResolvedPatternTarget["matched_by"] = [];
  if (nameMatches.includes(resolution.candidate)) {
    matchedBy.push("name");
  }
  if (aliasMatches.includes(resolution.candidate)) {
    matchedBy.push("alias");
  }
  if (slugMatches.includes(resolution.candidate)) {
    matchedBy.push("slug");
  }

  return {
    candidate: {
      pattern: resolution.candidate,
      matched_by: matchedBy.length > 0 ? matchedBy : ["name"],
    },
  };
}
