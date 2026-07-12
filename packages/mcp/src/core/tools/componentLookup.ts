import {
  getRegistryIndexes,
  normalizeRegistryLookupKey,
} from "../registry/runtimeCache.js";
import type { ComponentRecord, SaltRegistry } from "../types.js";
import { isComponentAllowedByDocsPolicy } from "./utils.js";

export interface ResolvedComponentTarget {
  component: ComponentRecord;
  matched_by: Array<"name" | "alias">;
}

export interface ComponentLookupAmbiguity {
  query: string;
  matches: Array<{
    name: string;
    package: string;
    status: ComponentRecord["status"];
    matched_by: Array<"name" | "alias">;
  }>;
}

function normalizeLookup(value: string): string {
  return normalizeRegistryLookupKey(value);
}

function filterAllowedComponents(
  components: ComponentRecord[],
  packageName?: string,
): ComponentRecord[] {
  return components
    .filter((component) =>
      packageName ? component.package.name === packageName : true,
    )
    .filter((component) => isComponentAllowedByDocsPolicy(component));
}

export function findReferencedComponent(
  registry: SaltRegistry,
  targetName: string,
  packageName?: string,
): ComponentRecord | null {
  const normalizedTargetName = normalizeLookup(targetName);
  const { componentsByNormalizedAlias, componentsByNormalizedName } =
    getRegistryIndexes(registry);
  const nameMatches = filterAllowedComponents(
    componentsByNormalizedName.get(normalizedTargetName) ?? [],
    packageName,
  );
  if (nameMatches.length > 0) {
    return nameMatches[0];
  }

  const aliasMatches = filterAllowedComponents(
    componentsByNormalizedAlias.get(normalizedTargetName) ?? [],
    packageName,
  );

  return aliasMatches[0] ?? null;
}

export function resolveComponentTarget(
  registry: SaltRegistry,
  targetName: string,
  packageName?: string,
): {
  candidate?: ResolvedComponentTarget;
  ambiguity?: ComponentLookupAmbiguity;
} {
  const normalizedTargetName = normalizeLookup(targetName);
  const { componentsByNormalizedAlias, componentsByNormalizedName } =
    getRegistryIndexes(registry);
  const matchesById = new Map<string, ResolvedComponentTarget>();

  for (const component of filterAllowedComponents(
    componentsByNormalizedName.get(normalizedTargetName) ?? [],
    packageName,
  )) {
    matchesById.set(component.id, {
      component,
      matched_by: ["name"],
    });
  }

  for (const component of filterAllowedComponents(
    componentsByNormalizedAlias.get(normalizedTargetName) ?? [],
    packageName,
  )) {
    const current = matchesById.get(component.id);
    if (current) {
      if (!current.matched_by.includes("alias")) {
        current.matched_by.push("alias");
      }
      continue;
    }

    matchesById.set(component.id, {
      component,
      matched_by: ["alias"],
    });
  }

  const matches = [...matchesById.values()];

  if (matches.length > 1) {
    return {
      ambiguity: {
        query: targetName,
        matches: matches.map((match) => ({
          name: match.component.name,
          package: match.component.package.name,
          status: match.component.status,
          matched_by: match.matched_by,
        })),
      },
    };
  }

  return { candidate: matches[0] };
}
