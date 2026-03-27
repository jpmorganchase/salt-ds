import {
  getRegistryIndexes,
  normalizeRegistryLookupKey,
} from "../registry/runtimeCache.js";
import type { SaltRegistry } from "../types.js";
import {
  clampChangeLimit,
  filterChangesSinceVersion,
  getChangesForPackage,
  sortChangesNewestFirst,
  toChangeResultRecord,
} from "./changeUtils.js";

export interface GetPackageInput {
  name: string;
  include?: Array<"changes">;
  change_limit?: number;
  since_version?: string;
}

export interface GetPackageResult {
  package: Record<string, unknown> | null;
}

export function getPackage(
  registry: SaltRegistry,
  input: GetPackageInput,
): GetPackageResult {
  const normalizedName = normalizeRegistryLookupKey(input.name);
  const match =
    getRegistryIndexes(registry).packagesByNormalizedName.get(normalizedName) ??
    null;

  if (!match) {
    return { package: null };
  }

  const result: Record<string, unknown> = {
    ...match,
  };

  if (input.include?.includes("changes")) {
    result.changes = sortChangesNewestFirst(
      filterChangesSinceVersion(
        getChangesForPackage(registry, match.name),
        input.since_version,
      ),
    )
      .slice(0, clampChangeLimit(input.change_limit, 10, 50))
      .map(toChangeResultRecord);
  }

  return { package: result };
}
