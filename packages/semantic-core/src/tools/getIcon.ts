import type { IconRecord, SaltRegistry } from "../types.js";
import { projectLookupRecord, resolveLookup } from "./lookupResolver.js";

export interface GetIconInput {
  name: string;
  view?: "compact" | "full";
}

export interface GetIconResult {
  icon: Record<string, unknown> | null;
  ambiguity?: {
    query: string;
    matched_by: "name" | "alias";
    matches: Array<{
      name: string;
      category: string;
      variant: IconRecord["variant"];
      status: IconRecord["status"];
    }>;
  };
}

function toIconMatchKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function toCompactIcon(icon: IconRecord): Record<string, unknown> {
  return {
    id: icon.id,
    name: icon.name,
    base_name: icon.base_name,
    figma_name: icon.figma_name,
    package: icon.package.name,
    status: icon.status,
    category: icon.category,
    variant: icon.variant,
    summary: icon.summary,
    synonyms: icon.synonyms,
    related_docs: icon.related_docs,
  };
}

function matchesCanonicalName(icon: IconRecord, queryKey: string): boolean {
  const canonicalCandidates = [icon.name, icon.base_name, icon.figma_name];
  return canonicalCandidates.some(
    (candidate) => toIconMatchKey(candidate) === queryKey,
  );
}

function matchesAlias(icon: IconRecord, queryKey: string): boolean {
  return icon.aliases.some((alias) => toIconMatchKey(alias) === queryKey);
}

export function getIcon(
  registry: SaltRegistry,
  input: GetIconInput,
): GetIconResult {
  const queryKey = toIconMatchKey(input.name);
  const nameMatches = registry.icons.filter((icon) =>
    matchesCanonicalName(icon, queryKey),
  );
  const aliasMatches = registry.icons.filter((icon) =>
    matchesAlias(icon, queryKey),
  );
  const resolution = resolveLookup(input.name, [
    {
      matchedBy: "name",
      matches: nameMatches,
      toAmbiguityMatch: (match) => ({
        name: match.name,
        category: match.category,
        variant: match.variant,
        status: match.status,
      }),
    },
    {
      matchedBy: "alias",
      matches: aliasMatches,
      ambiguityWhen: "if_unresolved",
      toAmbiguityMatch: (match) => ({
        name: match.name,
        category: match.category,
        variant: match.variant,
        status: match.status,
      }),
    },
  ]);

  if (resolution.ambiguity) {
    return {
      icon: null,
      ambiguity: resolution.ambiguity,
    };
  }

  if (!resolution.candidate) {
    return { icon: null };
  }

  return {
    icon: projectLookupRecord(resolution.candidate, input.view, {
      toCompact: toCompactIcon,
    }),
  };
}
