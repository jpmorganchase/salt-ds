import { createDeprecationId } from "../records/apiSymbolIdentity.js";
import type { ApiLiteral, ApiSymbolIdentity } from "../types.js";

export interface DeprecationValueMapOverrideCase {
  from: ApiLiteral;
  set: readonly (readonly [target: string, value: ApiLiteral])[];
}

interface DeprecationValueMapOverride {
  subject: ApiSymbolIdentity;
  cases: readonly DeprecationValueMapOverrideCase[];
}

const valueMapOverrides = [
  {
    subject: {
      package: "@salt-ds/core",
      entrypoint: ".",
      export_name: "ButtonProps",
      symbol_space: "type",
      member_path: [{ kind: "prop", name: "variant" }],
    },
    cases: [
      {
        from: "cta",
        set: [
          ["appearance", "solid"],
          ["sentiment", "accented"],
        ],
      },
      {
        from: "primary",
        set: [
          ["appearance", "solid"],
          ["sentiment", "neutral"],
        ],
      },
      {
        from: "secondary",
        set: [
          ["appearance", "transparent"],
          ["sentiment", "neutral"],
        ],
      },
    ],
  },
  {
    subject: {
      package: "@salt-ds/core",
      entrypoint: ".",
      export_name: "CheckboxIconProps",
      symbol_space: "type",
      member_path: [{ kind: "prop", name: "error" }],
    },
    cases: [
      { from: true, set: [["validationStatus", "error"]] },
      { from: false, set: [] },
    ],
  },
  {
    subject: {
      package: "@salt-ds/core",
      entrypoint: ".",
      export_name: "RadioButtonIconProps",
      symbol_space: "type",
      member_path: [{ kind: "prop", name: "error" }],
    },
    cases: [
      { from: true, set: [["validationStatus", "error"]] },
      { from: false, set: [] },
    ],
  },
] as const satisfies readonly DeprecationValueMapOverride[];

const valueMapCasesByDeprecationId = new Map<
  string,
  readonly DeprecationValueMapOverrideCase[]
>();
for (const override of valueMapOverrides) {
  const id = createDeprecationId(override.subject);
  if (valueMapCasesByDeprecationId.has(id)) {
    throw new Error(`Duplicate deprecation value-map override '${id}'.`);
  }
  valueMapCasesByDeprecationId.set(id, override.cases);
}

export function deprecationValueMapOverride(
  subject: ApiSymbolIdentity,
): readonly DeprecationValueMapOverrideCase[] {
  return valueMapCasesByDeprecationId.get(createDeprecationId(subject)) ?? [];
}

export function assertDeprecationValueMapOverridesResolved(
  deprecationIds: Iterable<string>,
): void {
  const resolvedIds = new Set(deprecationIds);
  const staleIds = [...valueMapCasesByDeprecationId.keys()].filter(
    (id) => !resolvedIds.has(id),
  );
  if (staleIds.length > 0) {
    throw new Error(
      `Deprecation value-map overrides do not match public deprecated API identities: ${staleIds.join(", ")}.`,
    );
  }
}
