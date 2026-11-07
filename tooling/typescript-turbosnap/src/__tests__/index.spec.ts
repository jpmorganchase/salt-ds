import fs from "node:fs/promises";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createForwardGraph } from "../index";
import {
  affectedStories,
  appModule,
  buildFixture,
  cleanupFixtures,
  createFixture,
  fixtureFiles,
  type GraphStats,
  storiesModule,
} from "./fixtures";

afterAll(cleanupFixtures);

const stories = Object.keys(fixtureFiles).filter((filename) =>
  filename.includes(".stories."),
);
const storyPaths = (...names: string[]) =>
  names.map((name) => `stories/${name}.stories.ts`).sort();
const alphaStories = storyPaths(
  "alpha",
  "alias",
  "namespace",
  "dynamic",
  "mixed",
);
const betaStories = storyPaths("beta", "namespace", "dynamic", "mixed");
const namespaceStories = storyPaths(
  "namespace-default",
  "namespace-named",
  "namespace-cycle-a",
  "namespace-cycle-b",
);

describe("TypeScript TurboSnap graph", () => {
  let baseline: Awaited<ReturnType<typeof buildFixture>>;
  let changed: Awaited<ReturnType<typeof buildFixture>>;
  let reversedStats: GraphStats;

  beforeAll(async () => {
    const directory = await createFixture(fixtureFiles);
    baseline = await buildFixture(directory, stories);

    // Replay real bundler events in reverse order. A partial namespace-cycle
    // traversal must not poison the export cache for a later consumer.
    const reversed = createForwardGraph({ rootDir: directory });
    for (const event of baseline.moduleEvents.toReversed()) {
      reversed.moduleParsed(event);
    }
    reversedStats = reversed.getStats().toJson();

    // These inputs are erased by Vite but contribute to emitted docgen.
    // Changing them in a second real build proves they are observable inputs.
    for (const [filename, from, to] of [
      ["src/base-props.d.ts", "warmInherited", "brightInherited"],
      ["src/aug/augment.d.ts", "warmAugmented", "brightAugmented"],
      ["src/jsdoc/erased.ts", "warmJSDocType", "brightJSDocType"],
      ["src/jsdoc/erased-tag.ts", "warmJSDocTag", "brightJSDocTag"],
      ["src/globals.d.cts", "warmCts", "brightCts"],
    ]) {
      await fs.writeFile(
        path.join(directory, filename),
        fixtureFiles[filename].replace(from, to),
      );
    }
    changed = await buildFixture(directory, stories);
  }, 60_000);

  it.each<[string, string, string[]]>([
    ["named, renamed and export-star imports", "src/Alpha.tsx", alphaStories],
    ["an unrelated export from the same barrel", "src/Beta.tsx", betaStories],
    ["inline CSS with a Vite query suffix", "src/alpha.css", alphaStories],
    [
      "a CSS alias resolved only by Vite",
      "src/aliased-alpha.css",
      alphaStories,
    ],
    [
      "type-only imports and import type expressions",
      "src/props.ts",
      [...alphaStories, ...storyPaths("import-type")].sort(),
    ],
    [
      "inherited declaration-file props",
      "src/base-props.d.ts",
      [...alphaStories, ...storyPaths("import-type")].sort(),
    ],
    ["a function-only export", "src/function-only.ts", storyPaths("function")],
    [
      "a class export through a runtime-imported __tests__ barrel",
      "src/class-only.ts",
      storyPaths("class", "test-barrel"),
    ],
    ["a default object shorthand", "src/shorthand.ts", storyPaths("shorthand")],
    [
      "an explicitly side-effectful module",
      "src/effects/register.ts",
      storyPaths("effect"),
    ],
  ])("retains the expected consumers of %s", (_name, filename, expected) => {
    expect(affectedStories(baseline.stats, stories, filename)).toEqual(
      expected,
    );
  });

  it.each([
    ["preview imports outside tsconfig.include", "outside/leaf.ts"],
    ["ambient global declarations", "ambient.d.ts"],
    ["a UMD global namespace", "src/umd.d.ts"],
    ["an extended TypeScript config", "tsconfig.base.json"],
    ["the sideEffects package contract", "package.json"],
  ])("conservatively covers every story for %s", (_name, filename) => {
    expect(affectedStories(baseline.stats, stories, filename)).toEqual(
      [...stories].sort(),
    );
  });

  it.each([
    "src/generated-commonjs.js",
    "src/generated-commonjs.cjs",
    "src/commonjs-module.d.cts",
    "src/data.json",
  ])("does not mistake unbuilt %s for an ambient global script", (filename) => {
    expect(baseline.stats.modules.map((module) => module.name)).not.toContain(
      `./${filename}`,
    );
    expect(affectedStories(baseline.stats, stories, filename)).toEqual([]);
  });

  it.each([
    "src/props.ts",
    "src/base-props.d.ts",
    "src/aug/augment.d.ts",
    "src/jsdoc/types.js",
    "src/jsdoc/tag-types.js",
  ])("retains %s even though Vite never parses it", (filename) => {
    expect(baseline.parsed.has(filename)).toBe(false);
    expect(changed.parsed.has(filename)).toBe(false);
    expect(baseline.stats.modules.map((module) => module.name)).toContain(
      `./${filename}`,
    );
  });

  it("emits different docgen metadata when erased inherited props change", () => {
    expect(baseline.code).toContain("__docgenInfo");
    expect(baseline.code).toContain("warmInherited");
    expect(changed.code).toContain("__docgenInfo");
    expect(changed.code).toContain("brightInherited");
    expect(changed.code).not.toContain("warmInherited");
  });

  it("emits different docgen metadata when an erased module augmentation changes", () => {
    expect(baseline.code).toContain("tone");
    expect(baseline.code).toContain("warmAugmented");
    expect(changed.code).toContain("tone");
    expect(changed.code).toContain("brightAugmented");
    expect(changed.code).not.toContain("warmAugmented");
  });

  it.each<[string, string, string, string, string[]]>([
    [
      "a JSDoc typedef import",
      "src/jsdoc/erased.ts",
      "warmJSDocType",
      "brightJSDocType",
      storyPaths("jsdoc-import-type"),
    ],
    [
      "a JSDoc @import tag",
      "src/jsdoc/erased-tag.ts",
      "warmJSDocTag",
      "brightJSDocTag",
      storyPaths("jsdoc-import-tag"),
    ],
    [
      "a global .d.cts declaration without imports or exports",
      "src/globals.d.cts",
      "warmCts",
      "brightCts",
      [...stories].sort(),
    ],
  ])(
    "tracks erased props from %s when they change emitted docgen",
    (_name, filename, before, after, expected) => {
      expect(baseline.parsed.has(filename)).toBe(false);
      expect(changed.parsed.has(filename)).toBe(false);
      expect(baseline.code).toContain("__docgenInfo");
      expect(baseline.code).toContain(before);
      expect(changed.code).toContain("__docgenInfo");
      expect(changed.code).toContain(after);
      expect(changed.code).not.toContain(before);
      expect(affectedStories(baseline.stats, stories, filename)).toEqual(
        expected,
      );
      expect(affectedStories(changed.stats, stories, filename)).toEqual(
        expected,
      );
    },
  );

  describe.each(["bundler order", "reverse bundler order"])("%s", (order) => {
    it.each<[string, string[]]>([
      ["src/namespaces/alpha.ts", namespaceStories],
      ["src/namespaces/beta.ts", namespaceStories],
      ["src/aug/augment.d.ts", storyPaths("augmented")],
    ])(
      "preserves namespace and augmentation consumers for %s",
      (filename, expected) => {
        const stats =
          order === "bundler order" ? baseline.stats : reversedStats;
        expect(affectedStories(stats, stories, filename)).toEqual(expected);
      },
    );
  });

  it("includes both namespace values in the emitted runtime", () => {
    expect(baseline.code).toContain("alpha-fixture-value");
    expect(baseline.code).toContain("beta-fixture-value");
  });

  it("preserves the Storybook stats plugin and virtual-module contract", () => {
    expect(baseline.pluginName).toBe("storybook:rollup-plugin-webpack-stats");
    const modules = new Map(
      baseline.stats.modules.map((module) => [module.name, module]),
    );
    expect(modules.get(`/${storiesModule}`)?.reasons).toContainEqual({
      moduleName: `/${appModule}`,
    });
    expect(modules.get("./stories/alpha.stories.ts")?.reasons).toContainEqual({
      moduleName: `/${storiesModule}`,
    });
    for (const module of baseline.stats.modules) {
      expect(module.id).toBe(module.name);
      expect(module.name).not.toMatch(/[\0?]/);
      const reasons = module.reasons?.map((reason) => reason.moduleName) ?? [];
      expect(new Set(reasons).size).toBe(reasons.length);
    }
  });

  it("keeps global guards out of the app's direct dependencies", () => {
    const global = baseline.stats.modules.find(
      (module) => module.name === "./ambient.d.ts",
    );
    expect(global?.reasons).toHaveLength(1);
    const guard = baseline.stats.modules.find(
      (module) => module.name === global?.reasons?.[0].moduleName,
    );
    expect(guard?.reasons?.length).toBeGreaterThan(0);
    // Chromatic uses the app's direct dependencies to infer story globs.
    // A synthetic global guard in that set can break native story selection.
    expect(guard?.reasons).not.toContainEqual({ moduleName: `/${appModule}` });
    expect(guard?.reasons).not.toContainEqual({
      moduleName: `/${storiesModule}`,
    });
  });
});

describe("TypeScript configuration", () => {
  it("resolves a relative config path against rootDir", async () => {
    const directory = await createFixture({
      "tsconfig.json": "not valid JSON",
      "config/tsconfig.json": JSON.stringify({
        compilerOptions: { types: [] },
        include: ["../src"],
      }),
      "src/value.ts": "export const value = 1;",
    });
    const graph = createForwardGraph({
      rootDir: directory,
      tsConfigFilePath: "config/tsconfig.json",
    });
    graph.moduleParsed({ id: path.join(directory, "src/value.ts") });
    expect(graph.getStats().toJson().modules).toContainEqual({
      id: "./config/tsconfig.json",
      name: "./config/tsconfig.json",
      reasons: [{ moduleName: "./src/value.ts" }],
    });
  });

  it("fails when an extended config is missing", async () => {
    const directory = await createFixture({
      "tsconfig.json": JSON.stringify({
        extends: "./missing-config.json",
        include: ["src"],
      }),
      "src/value.ts": "export const value = 1;",
    });
    expect(() => createForwardGraph({ rootDir: directory })).toThrow(
      /missing-config\.json/,
    );
  });

  it("fails on invalid compiler options", async () => {
    const directory = await createFixture({
      "tsconfig.json": JSON.stringify({
        compilerOptions: { target: "invalid-target" },
        include: ["src"],
      }),
      "src/value.ts": "export const value = 1;",
    });
    expect(() => createForwardGraph({ rootDir: directory })).toThrow(/target/);
  });
});
