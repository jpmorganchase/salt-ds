import { describe, expect, it } from "vitest";
import {
  assertGuideEditorialOverridesResolved,
  assertPatternEditorialOverridesResolved,
  isSelectedMcpGuideRoute,
  patternEditorialOverride,
} from "../build/catalogEditorialOverrides.js";
import {
  assertComponentAuthoringOverridesResolved,
  componentExportAliasOverrides,
  componentPrimaryExportOverride,
} from "../build/componentAuthoringOverrides.js";
import {
  assertDeprecationMigrationOverridesResolved,
  deprecationMigrationStrategyOverride,
} from "../build/deprecationMigrationOverrides.js";
import {
  assertDeprecationValueMapOverridesResolved,
  deprecationValueMapOverride,
} from "../build/deprecationValueMapOverrides.js";
import type { ApiSymbolIdentity } from "../types.js";

const unknownSubject = {
  package: "@salt-ds/core",
  entrypoint: ".",
  export_name: "NotAnAuthoredDeprecation",
  symbol_space: "type",
  member_path: [],
} as const satisfies ApiSymbolIdentity;

describe("catalog authoring override helpers", () => {
  it("distinguishes an authored null primary from an unknown route", () => {
    expect(
      componentPrimaryExportOverride("/salt/components/ag-grid-theme"),
    ).toEqual({ configured: true, value: null });
    expect(componentPrimaryExportOverride("/salt/components/button")).toEqual({
      configured: false,
    });
  });

  it("returns neutral results for unknown authoring identities", () => {
    expect(componentExportAliasOverrides("/salt/components/button")).toEqual(
      [],
    );
    expect(patternEditorialOverride("/salt/patterns/not-authored")).toBeNull();
    expect(isSelectedMcpGuideRoute("/salt/getting-started/index")).toBe(false);
    expect(
      deprecationMigrationStrategyOverride(unknownSubject),
    ).toBeNull();
    expect(deprecationValueMapOverride(unknownSubject)).toEqual([]);
  });

  it("fails closed when configured identities are absent", () => {
    expect(() => assertComponentAuthoringOverridesResolved([])).toThrow(
      /do not match authored component routes/u,
    );
    expect(() => assertGuideEditorialOverridesResolved([])).toThrow(
      /do not match authored getting-started routes/u,
    );
    expect(() => assertPatternEditorialOverridesResolved([])).toThrow(
      /do not match authored pattern routes/u,
    );
    expect(() => assertDeprecationMigrationOverridesResolved([])).toThrow(
      /do not match public deprecated API identities/u,
    );
    expect(() => assertDeprecationValueMapOverridesResolved([])).toThrow(
      /do not match public deprecated API identities/u,
    );
  });
});
