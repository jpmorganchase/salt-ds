import type { PatternRecord, SaltRegistry } from "../types.js";
import {
  getPatternSuggestedFollowUps,
  type SuggestedFollowUp,
} from "./consumerPresentation.js";
import { projectLookupRecord, resolveLookup } from "./lookupResolver.js";

export interface GetPatternInput {
  name: string;
  view?: "compact" | "full";
  include?: Array<"examples" | "accessibility">;
}

export interface GetPatternResult {
  pattern: Record<string, unknown> | null;
  suggested_follow_ups?: SuggestedFollowUp[];
  next_step?: string;
  did_you_mean?: string[];
  ambiguity?: {
    query: string;
    matched_by: "name" | "alias" | "slug";
    matches: Array<{
      name: string;
      status: PatternRecord["status"];
    }>;
  };
}

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

function toCompactPattern(
  pattern: PatternRecord,
  include: GetPatternInput["include"] = [],
): Record<string, unknown> {
  const compact: Record<string, unknown> = {
    id: pattern.id,
    name: pattern.name,
    aliases: pattern.aliases,
    status: pattern.status,
    summary: pattern.summary,
    when_to_use: pattern.when_to_use,
    when_not_to_use: pattern.when_not_to_use,
    composed_of: pattern.composed_of,
    related_patterns: pattern.related_patterns,
    how_to_build: pattern.how_to_build,
    how_it_works: pattern.how_it_works,
    resources: pattern.resources,
    related_docs: pattern.related_docs,
    next_step: getPatternNextStep(pattern),
  };

  if (include.includes("accessibility")) {
    compact.accessibility = pattern.accessibility;
  }
  if (include.includes("examples")) {
    compact.examples = pattern.examples;
  }

  return compact;
}

function getPatternNextStep(pattern: PatternRecord): string {
  if (pattern.examples.length > 0) {
    return `Review examples for ${pattern.name} before implementing.`;
  }

  if (pattern.related_docs.overview) {
    return `Review the ${pattern.name} pattern guidance before implementing.`;
  }

  return `Review the ${pattern.name} pattern details before implementing.`;
}

export function getPattern(
  registry: SaltRegistry,
  input: GetPatternInput,
): GetPatternResult {
  const normalizedName = normalizePatternLookup(input.name);
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
  const resolution = resolveLookup(input.name, [
    {
      matchedBy: "name",
      matches: nameMatches,
      toAmbiguityMatch: (pattern) => ({
        name: pattern.name,
        status: pattern.status,
      }),
    },
    {
      matchedBy: "alias",
      matches: aliasMatches,
      ambiguityWhen: "if_unresolved",
      toAmbiguityMatch: (pattern) => ({
        name: pattern.name,
        status: pattern.status,
      }),
    },
    {
      matchedBy: "slug",
      matches: slugMatches,
      ambiguityWhen: "if_unresolved",
      toAmbiguityMatch: (pattern) => ({
        name: pattern.name,
        status: pattern.status,
      }),
    },
  ]);

  if (resolution.ambiguity) {
    return {
      pattern: null,
      did_you_mean: resolution.ambiguity.matches.map((match) => match.name),
      ambiguity: resolution.ambiguity,
    };
  }

  if (!resolution.candidate) {
    return { pattern: null };
  }

  return {
    pattern: projectLookupRecord(resolution.candidate, input.view, {
      toCompact: (pattern) => toCompactPattern(pattern, input.include),
    }),
    suggested_follow_ups: getPatternSuggestedFollowUps(resolution.candidate, {
      include_lookup: false,
    }),
    next_step: getPatternNextStep(resolution.candidate),
  };
}
