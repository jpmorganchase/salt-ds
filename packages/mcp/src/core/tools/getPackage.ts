import {
  getRegistryIndexes,
  normalizeRegistryLookupKey,
} from "../registry/runtimeCache.js";
import type { SaltRegistry } from "../types.js";

export interface GetPackageInput {
  name: string;
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

  return { package: { ...match } };
}
