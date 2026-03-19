import semver from "semver";
import {
  getRegistryIndexes,
  normalizeRegistryLookupKey,
} from "../registry/runtimeCache.js";
import type { ChangeKind, SaltRegistry } from "../types.js";
import { compareVersions } from "./compareVersions.js";

export interface CompareSaltVersionsInput {
  package?: string;
  component_name?: string;
  from_version: string;
  to_version?: string;
  include_deprecations?: boolean;
  kinds?: ChangeKind[];
  max_results?: number;
  view?: "compact" | "full";
}

export interface CompareSaltVersionsResult {
  mode: "compare" | "history";
  decision: {
    target: string | null;
    from_version: string | null;
    to_version: string | null;
    why: string;
  };
  breaking?: string[];
  important?: string[];
  nice_to_know?: string[];
  changes?: Array<Record<string, unknown>>;
  deprecations?: Array<Record<string, unknown>>;
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
  ambiguity?: Record<string, unknown>;
  raw?: Record<string, unknown>;
}

function unique(values: string[]): string[] {
  return [...new Set(values)];
}

function valueToString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function resolveLatestBoundary(
  registry: SaltRegistry,
  input: CompareSaltVersionsInput,
): string {
  if (input.package) {
    return (
      registry.packages.find((entry) => entry.name === input.package)
        ?.version ?? registry.version
    );
  }

  if (input.component_name) {
    const query = normalizeRegistryLookupKey(input.component_name);
    const { componentsByNormalizedAlias, componentsByNormalizedName } =
      getRegistryIndexes(registry);
    const component =
      (componentsByNormalizedName.get(query) ?? [])[0] ??
      (componentsByNormalizedAlias.get(query) ?? [])[0] ??
      null;

    if (component) {
      return (
        registry.packages.find((entry) => entry.name === component.package.name)
          ?.version ?? registry.version
      );
    }
  }

  return registry.version;
}

function buildDeprecationNextStep(
  deprecation: Record<string, unknown>,
): string | null {
  const migration =
    deprecation.migration && typeof deprecation.migration === "object"
      ? (deprecation.migration as {
          details?: Array<{ from?: string; to?: string }>;
        })
      : null;
  const [firstMigration] = migration?.details ?? [];

  if (firstMigration?.to) {
    return `Replace ${firstMigration.from} with ${firstMigration.to}.`;
  }

  const replacement =
    deprecation.replacement && typeof deprecation.replacement === "object"
      ? (deprecation.replacement as {
          name?: string | null;
          notes?: string | null;
        })
      : null;
  if (replacement?.name) {
    return `Move to ${replacement.name}.`;
  }

  return replacement?.notes ?? null;
}

function summarizeChanges(input: {
  target: string | null;
  fromVersion: string | null;
  toVersion: string | null;
  changes: Array<Record<string, unknown>>;
  deprecations: Array<Record<string, unknown>>;
}) {
  const { changes, deprecations } = input;
  const hasMirroredDeprecation = (change: Record<string, unknown>): boolean => {
    const summary = valueToString(change.summary).toLowerCase();
    const version = valueToString(change.version);

    return deprecations.some((deprecation) => {
      const name = valueToString(deprecation.name).toLowerCase();
      const deprecatedIn = valueToString(deprecation.deprecated_in);

      return (
        Boolean(name) && deprecatedIn === version && summary.includes(name)
      );
    });
  };

  const breaking = unique([
    ...changes
      .filter((change) => change.kind === "removed")
      .map(
        (change) =>
          `${valueToString(change.version)}: ${valueToString(change.summary)}`,
      ),
    ...deprecations
      .filter((deprecation) => Boolean(deprecation.removed_in))
      .map(
        (deprecation) =>
          `${valueToString(deprecation.removed_in)}: ${valueToString(deprecation.name)} is scheduled for removal.`,
      ),
  ]);
  const important = unique([
    ...changes
      .filter((change) =>
        ["changed", "fixed"].includes(valueToString(change.kind)),
      )
      .map(
        (change) =>
          `${valueToString(change.version)}: ${valueToString(change.summary)}`,
      ),
    ...changes
      .filter((change) => change.kind === "deprecated")
      .filter((change) => !hasMirroredDeprecation(change))
      .map(
        (change) =>
          `${valueToString(change.version)}: ${valueToString(change.summary)}`,
      ),
    ...deprecations
      .filter((deprecation) => !deprecation.removed_in)
      .map(
        (deprecation) =>
          `${valueToString(deprecation.deprecated_in || "unknown")}: ${valueToString(deprecation.name)} is deprecated.`,
      ),
  ]);
  const niceToKnow = unique(
    changes
      .filter((change) => change.kind === "added")
      .map(
        (change) =>
          `${valueToString(change.version)}: ${valueToString(change.summary)}`,
      ),
  );
  const nextSteps = unique(
    deprecations
      .map((deprecation) => buildDeprecationNextStep(deprecation))
      .filter((value): value is string => Boolean(value)),
  );
  const docs = unique([
    ...changes.flatMap((change) =>
      Array.isArray(change.source_urls)
        ? change.source_urls.filter(
            (entry): entry is string => typeof entry === "string",
          )
        : [],
    ),
    ...deprecations.flatMap((deprecation) =>
      Array.isArray(deprecation.source_urls)
        ? deprecation.source_urls.filter(
            (entry): entry is string => typeof entry === "string",
          )
        : [],
    ),
  ]);
  const subject = input.target ?? "Salt";
  const summary = `${subject} has ${breaking.length} breaking, ${important.length} important, and ${niceToKnow.length} informational changes between ${input.fromVersion ?? "unknown"} and ${input.toVersion ?? "unknown"}.`;

  return {
    summary,
    breaking,
    important,
    nice_to_know: niceToKnow,
    next_steps: nextSteps,
    docs,
  };
}

export function compareSaltVersions(
  registry: SaltRegistry,
  input: CompareSaltVersionsInput,
): CompareSaltVersionsResult {
  const view = input.view ?? "compact";
  const mode = input.to_version ? "compare" : "history";
  const effectiveToVersion =
    input.to_version ?? resolveLatestBoundary(registry, input);
  const notes: string[] = [];

  if (!input.to_version) {
    notes.push(
      `to_version was not provided, so ${effectiveToVersion} was used as the latest known comparison boundary.`,
    );
  }

  const result = compareVersions(registry, {
    package: input.package,
    component_name: input.component_name,
    from_version: input.from_version,
    to_version: effectiveToVersion,
    include_deprecations: input.include_deprecations,
    max_results: input.max_results,
    view: "full",
  });

  const resolvedTarget = result.resolved_target;
  const target =
    resolvedTarget?.component ??
    resolvedTarget?.package ??
    input.component_name ??
    input.package ??
    null;
  const fromVersion =
    result.summary && typeof result.summary === "object"
      ? valueToString(result.summary.from_version)
      : null;
  const toVersion =
    result.summary && typeof result.summary === "object"
      ? valueToString(result.summary.to_version)
      : null;
  const requestedKinds = new Set(input.kinds ?? []);
  const changes = Array.isArray(result.changes)
    ? requestedKinds.size > 0
      ? result.changes.filter((change) =>
          requestedKinds.has(change.kind as ChangeKind),
        )
      : result.changes
    : [];
  const deprecations = Array.isArray(result.deprecations)
    ? requestedKinds.size > 0 && !requestedKinds.has("deprecated")
      ? []
      : result.deprecations
    : [];
  const summary = summarizeChanges({
    target,
    fromVersion,
    toVersion,
    changes,
    deprecations,
  });
  const mergedNotes = unique([...(result.notes ?? []), ...notes]);

  return {
    mode,
    decision: {
      target,
      from_version: fromVersion,
      to_version: toVersion,
      why: summary.summary,
    },
    breaking: summary.breaking,
    important: summary.important,
    nice_to_know: summary.nice_to_know,
    changes: view === "full" ? changes : undefined,
    deprecations: view === "full" ? deprecations : undefined,
    next_steps: summary.next_steps,
    next_step: summary.next_steps[0] ?? result.next_step,
    docs: summary.docs,
    notes: mergedNotes,
    did_you_mean: result.did_you_mean,
    resolved_target: resolvedTarget,
    ambiguity: result.ambiguity as Record<string, unknown> | undefined,
    raw:
      view === "full"
        ? {
            result,
            semver_valid:
              semver.valid(input.from_version) !== null ||
              semver.coerce(input.from_version) !== null,
          }
        : undefined,
  };
}
