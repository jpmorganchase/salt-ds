import semver from "semver";
import {
  createComponentPackageKey,
  getRegistryIndexes,
  normalizeRegistryLookupKey,
} from "../registry/runtimeCache.js";
import type { ChangeRecord, ComponentRecord, SaltRegistry } from "../types.js";

export function sortChangesNewestFirst(
  changes: ChangeRecord[],
): ChangeRecord[] {
  return [...changes].sort((left, right) => {
    if (left.package !== right.package) {
      return left.package.localeCompare(right.package);
    }

    const versionCompare = semver.rcompare(left.version, right.version);
    if (versionCompare !== 0) {
      return versionCompare;
    }

    if (left.target_type !== right.target_type) {
      return left.target_type.localeCompare(right.target_type);
    }

    if (left.target_name !== right.target_name) {
      return left.target_name.localeCompare(right.target_name);
    }

    return left.summary.localeCompare(right.summary);
  });
}

export function filterChangesSinceVersion(
  changes: ChangeRecord[],
  sinceVersion?: string,
): ChangeRecord[] {
  const normalizedSinceVersion = sinceVersion?.trim();
  if (!normalizedSinceVersion) {
    return changes;
  }

  const minVersion =
    semver.valid(normalizedSinceVersion) ??
    semver.minVersion(normalizedSinceVersion)?.version ??
    semver.coerce(normalizedSinceVersion)?.version;
  if (!minVersion) {
    return changes;
  }

  return changes.filter((change) => semver.gte(change.version, minVersion));
}

export function clampChangeLimit(
  requestedLimit: number | undefined,
  fallback = 10,
  max = 50,
): number {
  return Math.max(1, Math.min(requestedLimit ?? fallback, max));
}

export function toChangeResultRecord(
  change: ChangeRecord,
): Record<string, unknown> {
  return {
    id: change.id,
    package: change.package,
    target_type: change.target_type,
    target_name: change.target_name,
    version: change.version,
    release_type: change.release_type,
    kind: change.kind,
    summary: change.summary,
    details: change.details,
    source_urls: change.source_urls,
    inference: change.inference,
    last_verified_at: change.last_verified_at,
  };
}

export function getChangesForComponent(
  registry: SaltRegistry,
  component: ComponentRecord,
): ChangeRecord[] {
  return (
    getRegistryIndexes(registry).changesByComponentKey.get(
      createComponentPackageKey(component.package.name, component.name),
    ) ?? []
  );
}

export function getChangesForPackage(
  registry: SaltRegistry,
  packageName: string,
): ChangeRecord[] {
  return (
    getRegistryIndexes(registry).changesByPackage.get(
      normalizeRegistryLookupKey(packageName),
    ) ?? []
  );
}
