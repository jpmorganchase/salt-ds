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

const componentAliasOverrides = [
  [
    "/salt/components/card",
    [
      {
        exportName: "InteractableCard",
        sourceRepoPath: "packages/core/src/interactable-card",
      },
      {
        exportName: "InteractableCardGroup",
        sourceRepoPath: "packages/core/src/interactable-card",
      },
      {
        exportName: "LinkCard",
        sourceRepoPath: "packages/core/src/link-card",
      },
    ],
  ],
  [
    "/salt/components/layouts/border-layout",
    [
      {
        exportName: "BorderItem",
        sourceRepoPath: "packages/core/src/border-item",
      },
    ],
  ],
  [
    "/salt/components/layouts/flex-layout",
    [
      {
        exportName: "FlexItem",
        sourceRepoPath: "packages/core/src/flex-item",
      },
    ],
  ],
  [
    "/salt/components/layouts/grid-layout",
    [
      {
        exportName: "GridItem",
        sourceRepoPath: "packages/core/src/grid-item",
      },
    ],
  ],
  [
    "/salt/components/list-box",
    [
      {
        exportName: "Option",
        sourceRepoPath: "packages/core/src/option",
      },
      {
        exportName: "OptionGroup",
        sourceRepoPath: "packages/core/src/option",
      },
    ],
  ],
  [
    "/salt/components/text",
    [
      "Code",
      "Display1",
      "Display2",
      "Display3",
      "Display4",
      "H1",
      "H2",
      "H3",
      "H4",
      "Label",
      "TextAction",
      "TextNotation",
    ].map((exportName) => ({ exportName })),
  ],
  [
    "/salt/components/toggle-button",
    [
      {
        exportName: "ToggleButtonGroup",
        sourceRepoPath: "packages/core/src/toggle-button-group",
      },
    ],
  ],
] as const;

const guideOverrides = [
  "/salt/getting-started/choosing-the-right-primitive",
  "/salt/getting-started/composition-pitfalls",
  "/salt/getting-started/custom-wrappers",
  "/salt/getting-started/developing",
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
] as const satisfies readonly {
  subject: ApiSymbolIdentity;
  cases: readonly {
    from: string | boolean;
    set: readonly (readonly [string, string])[];
  }[];
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
    for (const [route, aliases] of componentAliasOverrides) {
      expect(componentExportAliasOverrides(route)).toEqual(aliases);
    }

    const routes = [
      ...new Set([
        ...componentOverrides.map(([route]) => route),
        ...componentAliasOverrides.map(([route]) => route),
      ]),
    ];
    expect(() =>
      assertComponentAuthoringOverridesResolved(routes),
    ).not.toThrow();
    expect(() =>
      assertComponentAuthoringOverridesResolved(routes.slice(1)),
    ).toThrow(/do not match authored component routes/u);
  });

  it("binds guide and pattern editorial overrides to canonical routes", () => {
    for (const route of guideOverrides) {
      expect(isSelectedMcpGuideRoute(route)).toBe(true);
    }
    expect(isSelectedMcpGuideRoute("/salt/getting-started/index")).toBe(false);
    expect(patternEditorialOverride("/salt/patterns/content-status")).toEqual({
      componentRoles: {
        "Stack layout":
          "Arranges the visual indicator, title, supporting message, and optional action in one vertically centered content-status group.",
      },
    });
    expect(patternEditorialOverride("/salt/patterns/metric")).toEqual({
      aliases: ["large metric", "kpi", "key metric", "dashboard metric"],
    });
    expect(
      patternEditorialOverride("/salt/patterns/vertical-navigation"),
    ).toEqual({
      aliases: [
        "sidebar navigation",
        "navigation pane",
        "left-hand navigation",
        "nested navigation",
      ],
    });

    expect(() =>
      assertGuideEditorialOverridesResolved(guideOverrides),
    ).not.toThrow();
    expect(() =>
      assertGuideEditorialOverridesResolved(guideOverrides.slice(1)),
    ).toThrow(/do not match authored getting-started routes/u);
    const patternRoutes = [
      "/salt/patterns/content-status",
      "/salt/patterns/metric",
      "/salt/patterns/vertical-navigation",
    ];
    expect(() =>
      assertPatternEditorialOverridesResolved(patternRoutes),
    ).not.toThrow();
    expect(() =>
      assertPatternEditorialOverridesResolved(patternRoutes.slice(1)),
    ).toThrow(/do not match authored pattern routes/u);
  });

  it("binds no-target migration strategies to stable public API identities", () => {
    for (const { subject, strategy } of deprecationOverrides) {
      expect(deprecationMigrationStrategyOverride(subject)).toBe(strategy);
    }

    const ids = deprecationOverrides.map(({ subject }) =>
      createDeprecationId(subject),
    );
    expect(() =>
      assertDeprecationMigrationOverridesResolved(ids),
    ).not.toThrow();
    expect(() =>
      assertDeprecationMigrationOverridesResolved(ids.slice(1)),
    ).toThrow(/do not match public deprecated API identities/u);
  });

  it("binds value maps to stable public API identities", () => {
    for (const { subject, cases } of valueMapOverrides) {
      expect(deprecationValueMapOverride(subject)).toEqual(cases);
    }

    const ids = valueMapOverrides.map(({ subject }) =>
      createDeprecationId(subject),
    );
    expect(() => assertDeprecationValueMapOverridesResolved(ids)).not.toThrow();
    expect(() =>
      assertDeprecationValueMapOverridesResolved(ids.slice(1)),
    ).toThrow(/do not match public deprecated API identities/u);
  });
});
