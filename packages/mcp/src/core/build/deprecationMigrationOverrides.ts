import { createDeprecationId } from "../catalog/catalogApiSymbolV2.js";
import type { ApiSymbolIdentity } from "../types.js";

export type NoTargetMigrationStrategy = "remove" | "manual" | "unspecified";

interface DeprecationMigrationOverride {
  subject: ApiSymbolIdentity;
  strategy: NoTargetMigrationStrategy;
}

const migrationOverrides = [
  {
    subject: {
      package: "@salt-ds/core",
      entrypoint: ".",
      export_name: "AriaAnnounceProps",
      symbol_space: "type",
      member_path: [{ kind: "prop", name: "delay" }],
    },
    strategy: "manual",
  },
  {
    subject: {
      package: "@salt-ds/core",
      entrypoint: ".",
      export_name: "DialogProps",
      symbol_space: "type",
      member_path: [{ kind: "prop", name: "idProp" }],
    },
    strategy: "remove",
  },
  {
    subject: {
      package: "@salt-ds/lab",
      entrypoint: ".",
      export_name: "TabstripProps",
      symbol_space: "type",
      member_path: [{ kind: "prop", name: "enableCloseTab" }],
    },
    strategy: "unspecified",
  },
  {
    subject: {
      package: "@salt-ds/date-adapters",
      entrypoint: "./moment",
      export_name: "AdapterMoment",
      symbol_space: "type_and_value",
      member_path: [],
    },
    strategy: "manual",
  },
] as const satisfies readonly DeprecationMigrationOverride[];

const migrationStrategyByDeprecationId = new Map<
  string,
  NoTargetMigrationStrategy
>();
for (const override of migrationOverrides) {
  const id = createDeprecationId(override.subject);
  if (migrationStrategyByDeprecationId.has(id)) {
    throw new Error(`Duplicate deprecation migration override '${id}'.`);
  }
  migrationStrategyByDeprecationId.set(id, override.strategy);
}

export function deprecationMigrationStrategyOverride(
  subject: ApiSymbolIdentity,
): NoTargetMigrationStrategy | null {
  return migrationStrategyByDeprecationId.get(createDeprecationId(subject)) ?? null;
}

export function assertDeprecationMigrationOverridesResolved(
  deprecationIds: Iterable<string>,
): void {
  const resolvedIds = new Set(deprecationIds);
  const staleIds = [...migrationStrategyByDeprecationId.keys()].filter(
    (id) => !resolvedIds.has(id),
  );
  if (staleIds.length > 0) {
    throw new Error(
      `Deprecation migration overrides do not match public deprecated API identities: ${staleIds.join(", ")}.`,
    );
  }
}
