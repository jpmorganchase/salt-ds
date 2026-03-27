import semver from "semver";
import type {
  ChangeRecord,
  DeprecationRecord,
  SaltRegistry,
} from "../types.js";
import {
  getChangesForPackage,
  sortChangesNewestFirst,
  toChangeResultRecord,
} from "./changeUtils.js";
import { resolveComponentTarget } from "./componentLookup.js";

export interface CompareVersionsInput {
  package?: string;
  component_name?: string;
  from_version: string;
  to_version: string;
  include_deprecations?: boolean;
  max_results?: number;
  view?: "compact" | "full";
}

export interface CompareVersionsResult {
  summary: Record<string, unknown> | string;
  changes?: Array<Record<string, unknown>>;
  deprecations?: Array<Record<string, unknown>>;
  breaking?: string[];
  important?: string[];
  nice_to_know?: string[];
  next_steps?: string[];
  next_step?: string;
  docs?: string[];
  notes?: string[];
  did_you_mean?: string[];
  resolved_target?: {
    package: string | null;
    component: string | null;
    matched_by?: Array<"name" | "alias">;
  };
  ambiguity?: {
    query: string;
    matches: Array<{
      name: string;
      package: string;
      status: string;
      matched_by: Array<"name" | "alias">;
    }>;
  };
}

interface FullCompareVersionsResult {
  summary: {
    package: string | null;
    component: string | null;
    from_version: string | null;
    to_version: string | null;
    change_count: number;
    deprecation_count: number;
  };
  changes: Array<Record<string, unknown>>;
  deprecations: Array<Record<string, unknown>>;
  notes: string[];
  resolved_target?: {
    package: string | null;
    component: string | null;
    matched_by?: Array<"name" | "alias">;
  };
  ambiguity?: CompareVersionsResult["ambiguity"];
}

function normalizeVersionBoundary(version: string): string | null {
  return (
    semver.valid(version) ??
    semver.minVersion(version)?.version ??
    semver.coerce(version)?.version ??
    null
  );
}

function isVersionBetween(
  version: string | null | undefined,
  fromVersion: string,
  toVersion: string,
): boolean {
  const normalized = version ? normalizeVersionBoundary(version) : null;
  if (!normalized) {
    return false;
  }

  return (
    semver.gt(normalized, fromVersion) && semver.lte(normalized, toVersion)
  );
}

function filterChangesBetween(
  changes: ChangeRecord[],
  fromVersion: string,
  toVersion: string,
) {
  return sortChangesNewestFirst(
    changes.filter((change) => {
      const normalizedVersion = normalizeVersionBoundary(change.version);
      if (!normalizedVersion) {
        return false;
      }

      return (
        semver.gt(normalizedVersion, fromVersion) &&
        semver.lte(normalizedVersion, toVersion)
      );
    }),
  );
}

function toDeprecationRecord(
  deprecation: DeprecationRecord,
): Record<string, unknown> {
  return {
    id: deprecation.id,
    package: deprecation.package,
    component: deprecation.component,
    kind: deprecation.kind,
    name: deprecation.name,
    deprecated_in: deprecation.deprecated_in,
    removed_in: deprecation.removed_in,
    replacement: deprecation.replacement,
    migration: deprecation.migration,
    source_urls: deprecation.source_urls,
  };
}

function getDeprecationNextStep(deprecation: DeprecationRecord): string | null {
  const [firstMigration] = deprecation.migration.details;
  if (firstMigration?.to) {
    return `Replace ${firstMigration.from} with ${firstMigration.to}.`;
  }

  if (deprecation.replacement.name) {
    return `Move to ${deprecation.replacement.name}.`;
  }

  return deprecation.replacement.notes ?? null;
}

function toCompactCompareVersionsResult(
  result: FullCompareVersionsResult,
): CompareVersionsResult {
  const changes = result.changes ?? [];
  const deprecations = result.deprecations ?? [];
  const hasMirroredDeprecation = (change: Record<string, unknown>): boolean => {
    const summary = String(change.summary ?? "").toLowerCase();
    const version = String(change.version ?? "");

    return deprecations.some((deprecation) => {
      const name = String(deprecation.name ?? "").toLowerCase();
      const deprecatedIn = String(deprecation.deprecated_in ?? "");

      return (
        Boolean(name) && deprecatedIn === version && summary.includes(name)
      );
    });
  };
  const breaking = [
    ...changes
      .filter((change) => change.kind === "removed")
      .map((change) => `${change.version}: ${String(change.summary)}`),
    ...deprecations
      .filter((deprecation) => Boolean(deprecation.removed_in))
      .map(
        (deprecation) =>
          `${String(deprecation.removed_in)}: ${String(deprecation.name)} is scheduled for removal.`,
      ),
  ].filter((value, index, values) => values.indexOf(value) === index);
  const important = [
    ...changes
      .filter((change) => ["changed", "fixed"].includes(String(change.kind)))
      .map((change) => `${change.version}: ${String(change.summary)}`),
    ...changes
      .filter((change) => change.kind === "deprecated")
      .filter((change) => !hasMirroredDeprecation(change))
      .map((change) => `${change.version}: ${String(change.summary)}`),
    ...deprecations
      .filter((deprecation) => !deprecation.removed_in)
      .map(
        (deprecation) =>
          `${String(deprecation.deprecated_in ?? "unknown")}: ${String(deprecation.name)} is deprecated.`,
      ),
  ].filter((value, index, values) => values.indexOf(value) === index);
  const niceToKnow = changes
    .filter((change) => change.kind === "added")
    .map((change) => `${change.version}: ${String(change.summary)}`)
    .filter((value, index, values) => values.indexOf(value) === index);
  const nextSteps = [
    ...deprecations
      .map((deprecation) => {
        const matchedDeprecation = {
          id: String(deprecation.id),
          package: String(deprecation.package),
          component:
            typeof deprecation.component === "string"
              ? deprecation.component
              : null,
          kind: deprecation.kind as DeprecationRecord["kind"],
          name: String(deprecation.name),
          deprecated_in:
            typeof deprecation.deprecated_in === "string"
              ? deprecation.deprecated_in
              : null,
          removed_in:
            typeof deprecation.removed_in === "string"
              ? deprecation.removed_in
              : null,
          replacement:
            deprecation.replacement as DeprecationRecord["replacement"],
          migration: deprecation.migration as DeprecationRecord["migration"],
          source_urls: (deprecation.source_urls as string[]) ?? [],
        };
        return getDeprecationNextStep(matchedDeprecation);
      })
      .filter((value): value is string => Boolean(value)),
  ];
  const docs = [
    ...changes.flatMap((change) => (change.source_urls as string[]) ?? []),
    ...deprecations.flatMap(
      (deprecation) => (deprecation.source_urls as string[]) ?? [],
    ),
  ].filter((value, index, values) => values.indexOf(value) === index);
  const subject =
    result.resolved_target?.component ??
    result.resolved_target?.package ??
    "Salt";
  const fromVersion = String(
    (result.summary as FullCompareVersionsResult["summary"]).from_version ?? "",
  );
  const toVersion = String(
    (result.summary as FullCompareVersionsResult["summary"]).to_version ?? "",
  );

  return {
    summary: `${subject} has ${breaking.length} breaking, ${important.length} important, and ${niceToKnow.length} informational changes between ${fromVersion} and ${toVersion}.`,
    breaking,
    important,
    nice_to_know: niceToKnow,
    next_steps: nextSteps,
    next_step: nextSteps[0] ?? undefined,
    docs,
    notes: result.notes,
    resolved_target: result.resolved_target
      ? {
          package: result.resolved_target.package,
          component: result.resolved_target.component,
        }
      : undefined,
  };
}

export function compareVersions(
  registry: SaltRegistry,
  input: CompareVersionsInput,
): CompareVersionsResult {
  const fromVersion = normalizeVersionBoundary(input.from_version);
  const toVersion = normalizeVersionBoundary(input.to_version);
  const maxResults = Math.max(1, Math.min(input.max_results ?? 20, 100));
  const notes: string[] = [];
  const view = input.view ?? "compact";

  if (!fromVersion || !toVersion) {
    return {
      summary: {
        package: null,
        component: null,
        from_version: fromVersion,
        to_version: toVersion,
        change_count: 0,
        deprecation_count: 0,
      },
      changes: [],
      deprecations: [],
      notes: ["from_version and to_version must be valid semver values."],
      next_step: "Pass valid semver values for from_version and to_version.",
    };
  }

  if (semver.gt(fromVersion, toVersion)) {
    return {
      summary: {
        package: null,
        component: null,
        from_version: fromVersion,
        to_version: toVersion,
        change_count: 0,
        deprecation_count: 0,
      },
      changes: [],
      deprecations: [],
      notes: ["from_version cannot be greater than to_version."],
      next_step:
        "Swap the version boundaries so from_version is earlier than to_version.",
    };
  }

  let packageName = input.package ?? null;
  let componentName: string | null = null;
  let matchedBy: Array<"name" | "alias"> | undefined;
  let changes = registry.changes;

  if (input.component_name?.trim()) {
    const resolution = resolveComponentTarget(
      registry,
      input.component_name,
      input.package,
    );
    if (resolution.ambiguity) {
      return {
        summary: {
          package: input.package ?? null,
          component: null,
          from_version: fromVersion,
          to_version: toVersion,
          change_count: 0,
          deprecation_count: 0,
        },
        changes: [],
        deprecations: [],
        notes: [],
        next_step:
          "Choose one of the suggested component names and retry with the exact name.",
        did_you_mean: resolution.ambiguity.matches.map(
          (match) => `${match.name} (${match.package})`,
        ),
        ambiguity: resolution.ambiguity,
      };
    }

    if (resolution.candidate) {
      componentName = resolution.candidate.component.name;
      packageName = resolution.candidate.component.package.name;
      matchedBy = resolution.candidate.matched_by;
      changes = changes.filter(
        (change) =>
          change.package === packageName &&
          change.target_type === "component" &&
          change.target_name === componentName,
      );
    } else {
      componentName = input.component_name;
      changes = changes.filter(
        (change) =>
          change.target_type === "component" &&
          change.target_name === input.component_name,
      );
    }
  } else if (packageName) {
    changes = getChangesForPackage(registry, packageName);
  }

  const filteredChanges = filterChangesBetween(
    changes,
    fromVersion,
    toVersion,
  ).slice(0, maxResults);

  const includeDeprecations = input.include_deprecations ?? true;
  const deprecations = includeDeprecations
    ? registry.deprecations
        .filter((deprecation) =>
          packageName ? deprecation.package === packageName : true,
        )
        .filter((deprecation) =>
          componentName ? deprecation.component === componentName : true,
        )
        .filter(
          (deprecation) =>
            isVersionBetween(
              deprecation.deprecated_in,
              fromVersion,
              toVersion,
            ) ||
            isVersionBetween(deprecation.removed_in, fromVersion, toVersion),
        )
        .slice(0, maxResults)
        .map(toDeprecationRecord)
    : [];

  if (!packageName && !componentName) {
    notes.push(
      "No package or component target was provided, so changes were compared across the full registry.",
    );
  }

  const fullResult: FullCompareVersionsResult = {
    summary: {
      package: packageName,
      component: componentName,
      from_version: fromVersion,
      to_version: toVersion,
      change_count: filteredChanges.length,
      deprecation_count: deprecations.length,
    },
    changes: filteredChanges.map(toChangeResultRecord),
    deprecations,
    notes,
    resolved_target:
      packageName || componentName
        ? {
            package: packageName,
            component: componentName,
            matched_by: matchedBy,
          }
        : undefined,
  };

  if (view === "full") {
    const compactResult = toCompactCompareVersionsResult(fullResult);

    return {
      ...fullResult,
      next_step: compactResult.next_step,
    };
  }

  return toCompactCompareVersionsResult(fullResult);
}
