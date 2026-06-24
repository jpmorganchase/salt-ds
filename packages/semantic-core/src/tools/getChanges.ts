import {
  getRegistryIndexes,
  normalizeRegistryLookupKey,
} from "../registry/runtimeCache.js";
import type { ChangeRecord, ComponentRecord, SaltRegistry } from "../types.js";
import {
  clampChangeLimit,
  filterChangesSinceVersion,
  getChangesForComponent,
  getChangesForPackage,
  sortChangesNewestFirst,
  toChangeResultRecord,
} from "./changeUtils.js";
import { isComponentAllowedByDocsPolicy } from "./utils.js";

export interface GetChangesInput {
  target_type?: ChangeRecord["target_type"];
  target_name?: string;
  package?: string;
  kinds?: ChangeRecord["kind"][];
  since_version?: string;
  limit?: number;
}

export interface GetChangesResult {
  changes: Array<Record<string, unknown>>;
  resolved_target?: {
    query: string;
    target_type: ChangeRecord["target_type"];
    name: string;
    package: string;
    matched_by: Array<"name" | "alias">;
  };
  ambiguity?: {
    query: string;
    target_type: ChangeRecord["target_type"];
    matches: Array<{
      name: string;
      package: string;
      matched_by: Array<"name" | "alias">;
    }>;
  };
}

interface ComponentTargetCandidate {
  component: ComponentRecord;
  matched_by: Array<"name" | "alias">;
}

function normalizeLookup(value: string): string {
  return normalizeRegistryLookupKey(value);
}

function resolveComponentTarget(
  registry: SaltRegistry,
  targetName: string,
  packageName?: string,
): {
  candidate?: ComponentTargetCandidate;
  ambiguity?: NonNullable<GetChangesResult["ambiguity"]>;
} {
  const normalizedTargetName = normalizeLookup(targetName);
  const { componentsByNormalizedAlias, componentsByNormalizedName } =
    getRegistryIndexes(registry);
  const matchesById = new Map<string, ComponentTargetCandidate>();

  for (const component of componentsByNormalizedName.get(
    normalizedTargetName,
  ) ?? []) {
    if (packageName && component.package.name !== packageName) {
      continue;
    }
    if (!isComponentAllowedByDocsPolicy(component)) {
      continue;
    }

    matchesById.set(component.id, {
      component,
      matched_by: ["name"],
    });
  }

  for (const component of componentsByNormalizedAlias.get(
    normalizedTargetName,
  ) ?? []) {
    if (packageName && component.package.name !== packageName) {
      continue;
    }
    if (!isComponentAllowedByDocsPolicy(component)) {
      continue;
    }

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
        target_type: "component",
        matches: matches.map((match) => ({
          name: match.component.name,
          package: match.component.package.name,
          matched_by: match.matched_by,
        })),
      },
    };
  }

  return { candidate: matches[0] };
}

export function getChanges(
  registry: SaltRegistry,
  input: GetChangesInput,
): GetChangesResult {
  const limit = clampChangeLimit(input.limit, 10, 50);
  const requestedKinds = input.kinds ?? [];
  let changes = registry.changes;
  let resolvedTarget: GetChangesResult["resolved_target"];

  if (input.target_name?.trim()) {
    if (input.target_type === "package") {
      const packageName = input.target_name.trim();
      changes = getChangesForPackage(registry, packageName);
      resolvedTarget = {
        query: packageName,
        target_type: "package",
        name: packageName,
        package: packageName,
        matched_by: ["name"],
      };
    } else {
      const resolution = resolveComponentTarget(
        registry,
        input.target_name,
        input.package,
      );
      if (resolution.ambiguity) {
        return {
          changes: [],
          ambiguity: resolution.ambiguity,
        };
      }

      const component = resolution.candidate?.component;
      if (component) {
        changes = getChangesForComponent(registry, component);
        resolvedTarget = {
          query: input.target_name,
          target_type: "component",
          name: component.name,
          package: component.package.name,
          matched_by: resolution.candidate?.matched_by ?? ["name"],
        };
      } else {
        const normalizedTargetName = normalizeLookup(input.target_name);
        changes = changes.filter(
          (change) =>
            normalizeLookup(change.target_name) === normalizedTargetName,
        );
      }
    }
  }

  if (input.target_type) {
    changes = changes.filter(
      (change) => change.target_type === input.target_type,
    );
  }
  if (input.package) {
    changes = changes.filter((change) => change.package === input.package);
  }
  if (requestedKinds.length > 0) {
    changes = changes.filter((change) => requestedKinds.includes(change.kind));
  }

  changes = sortChangesNewestFirst(
    filterChangesSinceVersion(changes, input.since_version),
  );

  return {
    changes: changes.slice(0, limit).map(toChangeResultRecord),
    resolved_target: resolvedTarget,
  };
}
