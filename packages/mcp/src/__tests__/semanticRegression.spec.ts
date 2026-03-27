import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  buildSourceUiModel,
  buildTranslationRecords,
  detectFromOutline,
  getCompositionRecipe,
} from "../../../semantic-core/src/index.js";
import { buildRegistry } from "../build/buildRegistry.js";
import { loadRegistry } from "../registry/loadRegistry.js";
import type {
  ComponentRecord,
  PatternRecord,
  SaltRegistry,
  UsageSemanticsRecord,
} from "../types.js";
import { REPO_ROOT } from "./registryTestUtils.js";

const BUILT_AT = "2026-03-10T00:00:00Z";

type SemanticExpectation = {
  category: string[];
  derivedFrom: UsageSemanticsRecord["derived_from"];
  preferredForContains?: string[];
  notForContains?: string[];
};

let registry: SaltRegistry;
let registryDir: string;

function expectStatementFragments(
  statements: string[],
  fragments: string[] | undefined,
  label: string,
): void {
  for (const fragment of fragments ?? []) {
    expect(
      statements.some((statement) =>
        statement.toLowerCase().includes(fragment.toLowerCase()),
      ),
      `${label} should contain '${fragment}'`,
    ).toBe(true);
  }
}

function expectSemanticsRegression(
  record: ComponentRecord | PatternRecord | undefined,
  expected: SemanticExpectation,
): void {
  expect(record).toBeDefined();
  expect(record?.semantics).toBeDefined();
  expect(record?.category ?? []).toEqual(expected.category);
  expect(record?.semantics?.category ?? []).toEqual(expected.category);

  for (const source of expected.derivedFrom) {
    expect(record?.semantics?.derived_from).toContain(source);
  }

  expectStatementFragments(
    record?.semantics?.preferred_for ?? [],
    expected.preferredForContains,
    `${record?.name} preferred_for`,
  );
  expectStatementFragments(
    record?.semantics?.not_for ?? [],
    expected.notForContains,
    `${record?.name} not_for`,
  );
}

beforeAll(async () => {
  registryDir = await fs.mkdtemp(path.join(os.tmpdir(), "salt-mcp-semantics-"));
  await buildRegistry({
    sourceRoot: REPO_ROOT,
    outputDir: registryDir,
    timestamp: BUILT_AT,
  });
  registry = await loadRegistry({ registryDir });
}, 120000);

afterAll(async () => {
  if (registryDir) {
    await fs.rm(registryDir, { recursive: true, force: true });
  }
});

describe("semantic regression guards", () => {
  it("preserves representative component semantics derived from category maps and usage docs", () => {
    expectSemanticsRegression(
      registry.components.find((component) => component.name === "Button"),
      {
        category: ["actions"],
        derivedFrom: ["component-category-map", "usage-docs"],
        preferredForContains: ["execute an action"],
        notForContains: ["another page"],
      },
    );

    expectSemanticsRegression(
      registry.components.find((component) => component.name === "Link"),
      {
        category: ["navigation"],
        derivedFrom: ["component-category-map", "usage-docs"],
        preferredForContains: ["same or different site"],
        notForContains: ["trigger an action"],
      },
    );

    expectSemanticsRegression(
      registry.components.find(
        (component) => component.name === "Vertical navigation",
      ),
      {
        category: ["navigation"],
        derivedFrom: ["component-category-map", "usage-docs"],
        preferredForContains: ["multiple levels of navigation"],
      },
    );

    expectSemanticsRegression(
      registry.components.find(
        (component) => component.name === "Navigation item",
      ),
      {
        category: ["navigation"],
        derivedFrom: ["component-category-map", "usage-docs"],
        notForContains: ["vertical navigation", "Vertical Navigation"],
      },
    );

    expectSemanticsRegression(
      registry.components.find((component) => component.name === "Combo box"),
      {
        category: ["selection-controls"],
        derivedFrom: ["component-category-map", "usage-docs"],
        preferredForContains: ["quickly narrow down the available options"],
        notForContains: ["five to ten options", "Dropdown"],
      },
    );

    expectSemanticsRegression(
      registry.components.find((component) => component.name === "Dialog"),
      {
        category: ["overlays"],
        derivedFrom: ["component-category-map", "usage-docs"],
        preferredForContains: ["requires immediate action"],
        notForContains: ["interrupt the user's flow", "Toast", "Banner"],
      },
    );

    expectSemanticsRegression(
      registry.components.find((component) => component.name === "Tabs"),
      {
        category: ["selection-controls"],
        derivedFrom: ["component-category-map", "usage-docs"],
        preferredForContains: ["single page"],
        notForContains: ["primary navigation"],
      },
    );

    expectSemanticsRegression(
      registry.components.find((component) => component.name === "Banner"),
      {
        category: ["feedback-and-status"],
        derivedFrom: ["component-category-map", "usage-docs"],
        preferredForContains: ["current task or workflow"],
        notForContains: ["peripheral application", "Toast"],
      },
    );
  });

  it("preserves representative pattern semantics derived from category maps and pattern docs", () => {
    expectSemanticsRegression(
      registry.patterns.find(
        (pattern) => pattern.name === "Vertical navigation",
      ),
      {
        category: ["navigation-and-wayfinding", "layout-and-shells"],
        derivedFrom: ["pattern-category-map", "pattern-docs", "usage-callouts"],
        preferredForContains: [
          "multiple top-level categories",
          "main sections of your website or application",
        ],
      },
    );

    expectSemanticsRegression(
      registry.patterns.find((pattern) => pattern.name === "Split button"),
      {
        category: ["actions-and-commands"],
        derivedFrom: ["pattern-category-map", "pattern-docs", "usage-callouts"],
        preferredForContains: [
          "multiple associated commands",
          "supplementary actions",
        ],
      },
    );

    expectSemanticsRegression(
      registry.patterns.find((pattern) => pattern.name === "Search"),
      {
        category: ["navigation-and-wayfinding", "selection-and-filtering"],
        derivedFrom: ["pattern-category-map", "pattern-docs"],
        preferredForContains: [
          "expandable search",
          "search placement",
          "accessible from any page",
        ],
      },
    );

    expectSemanticsRegression(
      registry.patterns.find((pattern) => pattern.name === "Menu button"),
      {
        category: ["actions-and-commands", "dialogs-and-overlays"],
        derivedFrom: ["pattern-category-map", "pattern-docs", "usage-callouts"],
        preferredForContains: ["overflow menu", "heading as menu"],
      },
    );

    expectSemanticsRegression(
      registry.patterns.find((pattern) => pattern.name === "Button bar"),
      {
        category: ["actions-and-commands"],
        derivedFrom: ["pattern-category-map", "pattern-docs", "usage-callouts"],
        preferredForContains: [
          "button bar position fixed",
          "button order multi-step form",
        ],
      },
    );
  });

  it("keeps category-map semantics aligned with the built registry taxonomy", () => {
    for (const component of registry.components) {
      if (!component.semantics) {
        continue;
      }

      expect(component.semantics.category).toEqual(component.category);
      expect(component.semantics.derived_from).toContain(
        "component-category-map",
      );
    }

    for (const pattern of registry.patterns) {
      if (!pattern.semantics) {
        continue;
      }

      expect(pattern.semantics.category).toEqual(pattern.category ?? []);
      expect(pattern.semantics.derived_from).toContain("pattern-category-map");
    }
  });

  it("keeps high-value component guidance populated where recommendation depends on it", () => {
    const records = ["Button", "Link", "Combo box", "Dialog", "Tabs", "Banner"]
      .map((name) =>
        registry.components.find((component) => component.name === name),
      )
      .filter((record): record is ComponentRecord => Boolean(record));

    for (const record of records) {
      expect(record.semantics?.preferred_for.length ?? 0).toBeGreaterThan(0);
      expect(record.semantics?.not_for.length ?? 0).toBeGreaterThan(0);
    }
  });

  it("uses built pattern semantics to rank real pattern scenario queries", () => {
    expect(
      getCompositionRecipe(registry, {
        query: "overflow menu for actions in a data grid",
      }).recommended?.name,
    ).toBe("Menu button");

    expect(
      getCompositionRecipe(registry, {
        query: "expandable search in a header",
      }).recommended?.name,
    ).toBe("Search");

    expect(
      getCompositionRecipe(registry, {
        query: "fixed button bar for a multi-step form",
      }).recommended?.name,
    ).toBe("Button bar");
  });

  it("keeps grouped app-shell recommendation aligned with translation on the vertical navigation family", () => {
    expect(
      getCompositionRecipe(registry, {
        query:
          "sidebar navigation with header and main content for many top-level views",
      }).recommended?.name,
    ).toBe("Vertical navigation");

    const model = buildSourceUiModel(
      detectFromOutline({
        regions: ["header", "sidebar", "main content"],
        actions: ["vertical navigation"],
      }),
      {
        codeProvided: false,
        queryProvided: true,
        uiFlavor: "description",
      },
    );
    const translations = buildTranslationRecords(
      registry,
      { view: "full" },
      model,
    );
    const navigation = translations.find(
      (translation) => translation.source_kind === "vertical-navigation",
    );

    expect(navigation?.salt_target.name).toBe("Vertical navigation");
  });
});
