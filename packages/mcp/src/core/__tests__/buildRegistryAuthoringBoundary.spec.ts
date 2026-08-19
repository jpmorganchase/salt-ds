import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { SOURCE_REGISTRY_BUILD_TEST_TIMEOUT_MS } from "../../__tests__/registryTestUtils.js";

const guardCalls = vi.hoisted(() => ({
  componentRoutes: [] as string[][],
  componentAliasOverrides: [] as Array<{
    route: string;
    aliases: Array<{ exportName: string; sourceRepoPath?: string }>;
  }>,
  patternRoutes: [] as string[][],
  guideRoutes: [] as string[][],
  migrationIds: [] as string[][],
  valueMapIds: [] as string[][],
}));

vi.mock("../build/componentAuthoringOverrides.js", async () => {
  const actual = await vi.importActual<
    typeof import("../build/componentAuthoringOverrides.js")
  >("../build/componentAuthoringOverrides.js");
  return {
    ...actual,
    componentExportAliasOverrides(route: string) {
      const aliases = actual.componentExportAliasOverrides(route);
      guardCalls.componentAliasOverrides.push({
        route,
        aliases: aliases.map((alias) => ({ ...alias })),
      });
      return aliases;
    },
    assertComponentAuthoringOverridesResolved(routes: readonly string[]) {
      guardCalls.componentRoutes.push([...routes]);
      return actual.assertComponentAuthoringOverridesResolved(routes);
    },
  };
});

vi.mock("../build/catalogEditorialOverrides.js", async () => {
  const actual = await vi.importActual<
    typeof import("../build/catalogEditorialOverrides.js")
  >("../build/catalogEditorialOverrides.js");
  return {
    ...actual,
    assertGuideEditorialOverridesResolved(routes: readonly string[]) {
      guardCalls.guideRoutes.push([...routes]);
      return actual.assertGuideEditorialOverridesResolved(routes);
    },
    assertPatternEditorialOverridesResolved(routes: readonly string[]) {
      guardCalls.patternRoutes.push([...routes]);
      return actual.assertPatternEditorialOverridesResolved(routes);
    },
  };
});

vi.mock("../build/deprecationMigrationOverrides.js", async () => {
  const actual = await vi.importActual<
    typeof import("../build/deprecationMigrationOverrides.js")
  >("../build/deprecationMigrationOverrides.js");
  return {
    ...actual,
    assertDeprecationMigrationOverridesResolved(ids: readonly string[]) {
      guardCalls.migrationIds.push([...ids]);
      return actual.assertDeprecationMigrationOverridesResolved(ids);
    },
  };
});

vi.mock("../build/deprecationValueMapOverrides.js", async () => {
  const actual = await vi.importActual<
    typeof import("../build/deprecationValueMapOverrides.js")
  >("../build/deprecationValueMapOverrides.js");
  return {
    ...actual,
    assertDeprecationValueMapOverridesResolved(ids: readonly string[]) {
      guardCalls.valueMapIds.push([...ids]);
      return actual.assertDeprecationValueMapOverridesResolved(ids);
    },
  };
});

import { buildRegistry } from "../build/buildRegistry.js";
import { CatalogStoreV2 } from "../catalog/catalogStoreV2.js";
import type { SaltRegistry } from "../types.js";

const EXPECTED_COMPONENT_ALIAS_OVERRIDES = {
  "/salt/components/card": [
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
  "/salt/components/layouts/border-layout": [
    {
      exportName: "BorderItem",
      sourceRepoPath: "packages/core/src/border-item",
    },
  ],
  "/salt/components/layouts/flex-layout": [
    {
      exportName: "FlexItem",
      sourceRepoPath: "packages/core/src/flex-item",
    },
  ],
  "/salt/components/layouts/grid-layout": [
    {
      exportName: "GridItem",
      sourceRepoPath: "packages/core/src/grid-item",
    },
  ],
  "/salt/components/list-box": [
    { exportName: "Option", sourceRepoPath: "packages/core/src/option" },
    {
      exportName: "OptionGroup",
      sourceRepoPath: "packages/core/src/option",
    },
  ],
  "/salt/components/text": [
    { exportName: "Code" },
    { exportName: "Display1" },
    { exportName: "Display2" },
    { exportName: "Display3" },
    { exportName: "Display4" },
    { exportName: "H1" },
    { exportName: "H2" },
    { exportName: "H3" },
    { exportName: "H4" },
    { exportName: "Label" },
    { exportName: "TextAction" },
    { exportName: "TextNotation" },
  ],
  "/salt/components/toggle-button": [
    {
      exportName: "ToggleButtonGroup",
      sourceRepoPath: "packages/core/src/toggle-button-group",
    },
  ],
} as const;

const TEST_DIRECTORY = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(TEST_DIRECTORY, "../../../../..");
let outputDirectory = "";
let registry: SaltRegistry;
let store: CatalogStoreV2;

beforeAll(async () => {
  outputDirectory = await fs.mkdtemp(
    path.join(os.tmpdir(), "salt-authoring-boundary-"),
  );
  registry = await buildRegistry({
    sourceRoot: REPO_ROOT,
    outputDir: outputDirectory,
    sourceRevision: "authoring-boundary-test-source",
    generatorVersion: "2.0.0-test",
    generatorDigest: `sha256:${"2".repeat(64)}`,
  });
  store = new CatalogStoreV2({ registryDir: outputDirectory });
  store.validateCrossReferences();
}, SOURCE_REGISTRY_BUILD_TEST_TIMEOUT_MS);

afterAll(async () => {
  if (outputDirectory) {
    await fs.rm(outputDirectory, { recursive: true, force: true });
  }
});

describe("buildRegistry authoring boundary", () => {
  it("delegates every authored override guard exactly once", () => {
    expect(guardCalls.componentRoutes).toHaveLength(1);
    expect(guardCalls.patternRoutes).toHaveLength(1);
    expect(guardCalls.guideRoutes).toHaveLength(1);
    expect(guardCalls.migrationIds).toHaveLength(1);
    expect(guardCalls.valueMapIds).toHaveLength(1);
  });

  it("binds captured guard inputs to the emitted public catalog", () => {
    const componentRoutes = new Set(
      registry.components.map((component) => component.related_docs.overview),
    );
    const patternRoutes = new Set(
      registry.patterns.map((pattern) => pattern.related_docs.overview),
    );
    const guideRoutes = new Set(
      registry.guides.map((guide) => guide.related_docs.overview),
    );
    for (const route of guardCalls.componentRoutes[0] ?? []) {
      expect(componentRoutes).toContain(route);
    }
    for (const route of guardCalls.patternRoutes[0] ?? []) {
      expect(patternRoutes).toContain(route);
    }
    for (const route of guardCalls.guideRoutes[0] ?? []) {
      expect(guideRoutes).toContain(route);
    }

    const publicDeprecationIds = new Set(
      store.getFamily("deprecation").map((record) => record.id),
    );
    expect(new Set(guardCalls.migrationIds[0])).toEqual(publicDeprecationIds);
    expect(new Set(guardCalls.valueMapIds[0])).toEqual(publicDeprecationIds);
  });

  it("binds every raw component alias override to builder and store output", () => {
    const observationsByRoute = new Map<
      string,
      Array<Array<{ exportName: string; sourceRepoPath?: string }>>
    >();
    for (const observation of guardCalls.componentAliasOverrides) {
      const observations = observationsByRoute.get(observation.route) ?? [];
      observations.push(observation.aliases);
      observationsByRoute.set(observation.route, observations);
    }

    for (const component of registry.components) {
      const route = component.related_docs.overview;
      if (!route) {
        throw new Error(`Component '${component.id}' has no overview route.`);
      }
      expect(
        observationsByRoute.has(route),
        route,
      ).toBe(true);
    }
    for (const [route, observations] of observationsByRoute) {
      expect(observations.length, route).toBeGreaterThan(0);
      for (const observation of observations) {
        expect(observation, route).toEqual(observations[0]);
      }
    }

    const nonEmptyObservations = Object.fromEntries(
      [...observationsByRoute.entries()]
        .filter(([, observations]) => (observations[0]?.length ?? 0) > 0)
        .map(([route, observations]) => [route, observations[0]]),
    );
    expect(nonEmptyObservations).toEqual(EXPECTED_COMPONENT_ALIAS_OVERRIDES);
    expect(
      Object.values(EXPECTED_COMPONENT_ALIAS_OVERRIDES).flat(),
    ).toHaveLength(21);

    for (const [route, aliases] of Object.entries(
      EXPECTED_COMPONENT_ALIAS_OVERRIDES,
    )) {
      const registryComponent = registry.components.find(
        (component) => component.related_docs.overview === route,
      );
      expect(registryComponent, route).toBeDefined();
      expect(registryComponent?.aliases, route).toEqual(
        expect.arrayContaining(aliases.map((alias) => alias.exportName)),
      );

      const storedComponents = store
        .getFamily("component")
        .filter(
          (component) =>
            store.getContentJson(component.detail_content_ref).related_docs
              .overview === route,
        );
      expect(storedComponents, route).toHaveLength(1);
      expect(storedComponents[0]?.aliases, route).toEqual(
        expect.arrayContaining(aliases.map((alias) => alias.exportName)),
      );
    }
  });
});
