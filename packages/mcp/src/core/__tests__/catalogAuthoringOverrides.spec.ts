import { describe, expect, it } from "vitest";
import {
  assertComponentPrimaryExportOverridesResolved,
  componentPrimaryExportOverride,
} from "../build/componentPrimaryExportOverrides.js";
import {
  assertDeprecationMigrationOverridesResolved,
  deprecationMigrationStrategyOverride,
} from "../build/deprecationMigrationOverrides.js";
import { createDeprecationId } from "../catalog/catalogApiSymbolV2.js";
import type { ApiSymbolIdentity } from "../types.js";

const componentOverrides = [
  ["/salt/components/ag-grid-theme", null],
  ["/salt/components/chart", null],
  ["/salt/components/date-input", null],
  ["/salt/components/date-picker/range-date-picker", null],
  ["/salt/components/progress", null],
  ["/salt/components/splitter", null],
  ["/salt/components/tokenized-input-next", "TokenizedInputNext"],
] as const;

const deprecationOverrides = [
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
] as const satisfies readonly {
  subject: ApiSymbolIdentity;
  strategy: "remove" | "manual" | "unspecified";
}[];

describe("catalog authoring overrides", () => {
  it("keeps only exceptional component-to-export bindings", () => {
    expect(componentPrimaryExportOverride("/salt/components/button")).toEqual({
      configured: false,
    });
    for (const [route, value] of componentOverrides) {
      expect(componentPrimaryExportOverride(route)).toEqual({
        configured: true,
        value,
      });
    }

    expect(() =>
      assertComponentPrimaryExportOverridesResolved(
        componentOverrides.map(([route]) => route),
      ),
    ).not.toThrow();
    expect(() =>
      assertComponentPrimaryExportOverridesResolved(
        componentOverrides.slice(1).map(([route]) => route),
      ),
    ).toThrow(/do not match authored component routes/u);
  });

  it("binds no-target migration strategies to stable public API identities", () => {
    for (const { subject, strategy } of deprecationOverrides) {
      expect(deprecationMigrationStrategyOverride(subject)).toBe(strategy);
    }

    const ids = deprecationOverrides.map(({ subject }) =>
      createDeprecationId(subject),
    );
    expect(() => assertDeprecationMigrationOverridesResolved(ids)).not.toThrow();
    expect(() =>
      assertDeprecationMigrationOverridesResolved(ids.slice(1)),
    ).toThrow(/do not match public deprecated API identities/u);
  });
});
