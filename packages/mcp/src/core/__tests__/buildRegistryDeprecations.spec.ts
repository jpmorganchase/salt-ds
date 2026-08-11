import fsSync from "node:fs";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { extractDeprecations } from "../build/buildRegistryDeprecations.js";
import {
  createCatalogInputInventory,
  withCatalogInputTracking,
} from "../build/catalogInputInventory.js";
import type { PackageRecord } from "../types.js";

const tempRoots: string[] = [];

const fixturePackage = (): PackageRecord => ({
  id: "package.salt-ds-core",
  name: "@salt-ds/core",
  status: "stable",
  version: "2.0.0",
  summary: "Core",
  source_root: "packages/core",
  changelog_path: null,
  docs_root: null,
});

async function createPackageFixture(
  files: Readonly<Record<string, string>>,
): Promise<string> {
  const repoRoot = await fs.mkdtemp(
    path.join(os.tmpdir(), "salt-deprecation-fixture-"),
  );
  tempRoots.push(repoRoot);
  const packageRoot = path.join(repoRoot, "packages/core");
  await fs.mkdir(path.join(packageRoot, "src"), { recursive: true });
  await Promise.all(
    Object.entries(files).map(async ([relativePath, source]) => {
      const filePath = path.join(packageRoot, ...relativePath.split("/"));
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(filePath, source, "utf8");
    }),
  );
  return repoRoot;
}

afterEach(async () => {
  await Promise.all(
    tempRoots
      .splice(0, tempRoots.length)
      .map((root) => fs.rm(root, { recursive: true, force: true })),
  );
});

describe("buildRegistryDeprecations", () => {
  it("retains deprecated_in inference from a package changelog", async () => {
    const repoRoot = await fs.mkdtemp(
      path.join(os.tmpdir(), "salt-deprecation-build-"),
    );
    tempRoots.push(repoRoot);
    await fs.mkdir(path.join(repoRoot, "packages/core/src"), {
      recursive: true,
    });
    await fs.writeFile(
      path.join(repoRoot, "packages/core/src/LegacyThing.ts"),
      "/** @deprecated Use {@link ModernThing} instead. */\nexport const LegacyThing = 1;\n",
      "utf8",
    );
    await fs.writeFile(
      path.join(repoRoot, "packages/core/src/ModernThing.ts"),
      "export const ModernThing = 2;\n",
      "utf8",
    );
    await fs.writeFile(
      path.join(repoRoot, "packages/core/src/index.ts"),
      'export * from "./LegacyThing";\nexport * from "./ModernThing";\n',
      "utf8",
    );
    await fs.writeFile(
      path.join(repoRoot, "packages/core/CHANGELOG.md"),
      "## 1.2.3\n\n### Minor Changes\n\n- Deprecated `LegacyThing`; use `ModernThing` instead.\n",
      "utf8",
    );
    const packages: PackageRecord[] = [
      {
        id: "package.salt-ds-core",
        name: "@salt-ds/core",
        status: "stable",
        version: "2.0.0",
        summary: "Core",
        source_root: "packages/core",
        changelog_path: "packages/core/CHANGELOG.md",
        docs_root: null,
      },
    ];

    const deprecations = await extractDeprecations(
      repoRoot,
      packages,
      new Set(),
    );

    expect(deprecations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "LegacyThing",
          deprecated_in: "1.2.3",
        }),
      ]),
    );
  });

  it("extracts public JavaScript deprecations from the inventoried source closure", async () => {
    const repoRoot = await createPackageFixture({
      "src/Fixture.js": `export const ModernThing = 1;
/** @deprecated Use {@link ModernThing} instead. */
export const LegacyThing = 2;
`,
      "src/index.ts":
        'export { LegacyThing, ModernThing } from "./Fixture.js";\n',
    });

    const [deprecation] = await extractDeprecations(
      repoRoot,
      [fixturePackage()],
      new Set(),
    );

    expect(deprecation).toMatchObject({
      name: "LegacyThing",
      subject: {
        export_name: "LegacyThing",
        symbol_space: "value",
      },
      replacement: {
        target: { export_name: "ModernThing" },
      },
    });
  });

  it.each([
    {
      name: "deprecated JavaScript JSDoc overload",
      source: `export function modern() {}
/**
 * @overload
 * @param {string} value
 * @returns {void}
 */
/**
 * @overload
 * @param {number} value
 * @returns {void}
 */
/**
 * @deprecated Use {@link modern} instead.
 * @param {string | number} value
 */
export function legacy(value) {}
`,
      expected: /Deprecated overloaded function 'legacy'/u,
    },
    {
      name: "replacement JavaScript JSDoc overload",
      source: `/**
 * @overload
 * @param {string} value
 * @returns {void}
 */
/**
 * @overload
 * @param {number} value
 * @returns {void}
 */
/**
 * @param {string | number} value
 */
export function modern(value) {}
/** @deprecated Use {@link modern} instead. */
export function legacy() {}
`,
      expected: /Overloaded replacement function 'modern'/u,
    },
  ])("rejects a $name", async ({ source, expected }) => {
    const repoRoot = await createPackageFixture({
      "src/Fixture.js": source,
      "src/index.ts": 'export { legacy, modern } from "./Fixture.js";\n',
    });

    await expect(
      extractDeprecations(repoRoot, [fixturePackage()], new Set()),
    ).rejects.toThrow(expected);
  });

  it("extracts public ambient value deprecations from declaration files", async () => {
    const repoRoot = await createPackageFixture({
      "src/Fixture.d.ts": `export declare const ModernThing: string;
/** @deprecated Use {@link ModernThing} instead. */
export declare const LegacyThing: string;
`,
      "src/index.ts": 'export { LegacyThing, ModernThing } from "./Fixture";\n',
    });

    const [deprecation] = await extractDeprecations(
      repoRoot,
      [fixturePackage()],
      new Set(),
    );

    expect(deprecation).toMatchObject({
      name: "LegacyThing",
      subject: {
        export_name: "LegacyThing",
        symbol_space: "value",
      },
      replacement: {
        target: {
          export_name: "ModernThing",
          symbol_space: "value",
        },
      },
    });
  });

  it("provides only the bounded build-time globals used by public sources", async () => {
    const repoRoot = await createPackageFixture({
      "src/Fixture.ts": `void process.env.NODE_ENV;
void (global as unknown);
export const ModernThing = 1;
/** @deprecated Use {@link ModernThing} instead. */
export const LegacyThing = 2;
`,
      "src/index.ts": 'export { LegacyThing, ModernThing } from "./Fixture";\n',
    });

    await expect(
      extractDeprecations(repoRoot, [fixturePackage()], new Set()),
    ).resolves.toEqual([
      expect.objectContaining({
        name: "LegacyThing",
      }),
    ]);
  });

  it("still rejects unrelated missing compiler globals", async () => {
    const repoRoot = await createPackageFixture({
      "src/Fixture.ts": `void missingCatalogGlobal;
export const ModernThing = 1;
/** @deprecated Use {@link ModernThing} instead. */
export const LegacyThing = 2;
`,
      "src/index.ts": 'export { LegacyThing, ModernThing } from "./Fixture";\n',
    });

    await expect(
      extractDeprecations(repoRoot, [fixturePackage()], new Set()),
    ).rejects.toThrow(
      /TS2304.*Cannot find name ['"]missingCatalogGlobal['"]/su,
    );
  });

  it("preserves type-only class, enum, and aliased owner deprecations", async () => {
    const repoRoot = await createPackageFixture({
      "src/Fixture.ts": `class ModernApi {}
/** @deprecated Use {@link ModernApi} instead. */
class LegacyApi {
  /** @deprecated Use {@link LegacyApi.modern} instead. */
  legacy(): void {}
  modern(): void {}
  /**
   * @deprecated Static usage is not public.
   * @saltMigration manual
   */
  static legacyStatic(): void {}
}
/**
 * @deprecated Review enum usage manually.
 * @saltMigration manual
 */
enum LegacyEnum { Value }
interface ButtonProps {
  /** @deprecated Use {@link ButtonProps.modern} instead. */
  legacy?: boolean;
  modern?: boolean;
}
export type {
  ButtonProps as PublicButtonProps,
  LegacyApi as PublicLegacyApi,
  LegacyEnum as PublicLegacyEnum,
  ModernApi as PublicModernApi,
};
`,
      "src/index.ts": `export type {
  PublicButtonProps,
  PublicLegacyApi,
  PublicLegacyEnum,
  PublicModernApi,
} from "./Fixture";
`,
    });

    const deprecations = await extractDeprecations(
      repoRoot,
      [fixturePackage()],
      new Set(),
    );

    expect(deprecations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "PublicLegacyApi",
          kind: "type",
          component: null,
          subject: expect.objectContaining({
            export_name: "PublicLegacyApi",
            symbol_space: "type",
            member_path: [],
          }),
          replacement: expect.objectContaining({
            target: expect.objectContaining({
              export_name: "PublicModernApi",
              symbol_space: "type",
            }),
          }),
        }),
        expect.objectContaining({
          name: "legacy",
          kind: "method",
          component: null,
          subject: expect.objectContaining({
            export_name: "PublicLegacyApi",
            symbol_space: "type",
            member_path: [{ kind: "method", name: "legacy" }],
          }),
        }),
        expect.objectContaining({
          name: "PublicLegacyEnum",
          kind: "type",
          component: null,
          subject: expect.objectContaining({
            export_name: "PublicLegacyEnum",
            symbol_space: "type",
          }),
        }),
        expect.objectContaining({
          name: "legacy",
          kind: "prop",
          component: "Button",
          subject: expect.objectContaining({
            export_name: "PublicButtonProps",
            symbol_space: "type",
            member_path: [{ kind: "prop", name: "legacy" }],
          }),
        }),
      ]),
    );
    expect(
      deprecations.some((deprecation) => deprecation.name === "legacyStatic"),
    ).toBe(false);
  });

  it("extracts effective public members from a generic type-alias wrapper", async () => {
    const repoRoot = await createPackageFixture({
      "src/Fixture.ts": `type PublicSurface<Element, Props> = Props & { as?: Element };
export type FixtureProps<T extends string = "div"> = PublicSurface<
  T,
  {
    replacement?: string;
    /** @deprecated Use {@link FixtureProps.replacement replacement} instead. */
    legacy?: string;
  }
>;
`,
      "src/index.ts": 'export type { FixtureProps } from "./Fixture";\n',
    });

    const deprecations = await extractDeprecations(
      repoRoot,
      [fixturePackage()],
      new Set(),
    );

    expect(deprecations).toHaveLength(1);
    expect(deprecations[0]).toMatchObject({
      name: "legacy",
      kind: "prop",
      component: "Fixture",
      subject: {
        export_name: "FixtureProps",
        symbol_space: "type",
        member_path: [{ kind: "prop", name: "legacy" }],
      },
      replacement: {
        mode: "single",
        target: {
          export_name: "FixtureProps",
          symbol_space: "type",
          member_path: [{ kind: "prop", name: "replacement" }],
        },
      },
    });
  });

  it("does not extract declarations from a discarded generic argument", async () => {
    const repoRoot = await createPackageFixture({
      "src/Fixture.ts": `type PublicSurface<_Props> = { visible?: string };
export type FixtureProps = PublicSurface<{
  /**
   * @deprecated This member is not part of the resolved public surface.
   * @saltMigration manual
   */
  legacy?: string;
}>;
`,
      "src/index.ts": 'export type { FixtureProps } from "./Fixture";\n',
    });

    await expect(
      extractDeprecations(repoRoot, [fixturePackage()], new Set()),
    ).resolves.toEqual([]);
  });

  it("preserves the exact type and value spaces of deprecated namespaces", async () => {
    const repoRoot = await createPackageFixture({
      "src/Fixture.ts": `namespace ModernTypes {
  export interface Value {}
}
/** @deprecated Use {@link ModernTypes} instead. */
namespace LegacyTypes {
  export interface Value {}
}
namespace ModernValues {
  export const value = 1;
}
/** @deprecated Use {@link ModernValues} instead. */
namespace LegacyValues {
  export const value = 1;
}
export type { LegacyTypes, ModernTypes };
export { LegacyValues, ModernValues };
`,
      "src/index.ts": `export type { LegacyTypes, ModernTypes } from "./Fixture";
export { LegacyValues, ModernValues } from "./Fixture";
`,
    });

    const deprecations = await extractDeprecations(
      repoRoot,
      [fixturePackage()],
      new Set(),
    );

    expect(deprecations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "LegacyTypes",
          subject: expect.objectContaining({
            export_name: "LegacyTypes",
            symbol_space: "type",
          }),
          replacement: expect.objectContaining({
            target: expect.objectContaining({
              export_name: "ModernTypes",
              symbol_space: "type",
            }),
          }),
        }),
        expect.objectContaining({
          name: "LegacyValues",
          subject: expect.objectContaining({
            export_name: "LegacyValues",
            symbol_space: "type_and_value",
          }),
          replacement: expect.objectContaining({
            target: expect.objectContaining({
              export_name: "ModernValues",
              symbol_space: "type_and_value",
            }),
          }),
        }),
      ]),
    );
  });

  it("rejects custom public entrypoints outside the inventoried source directory", async () => {
    const repoRoot = await createPackageFixture({
      "package.json": JSON.stringify({
        name: "@salt-ds/core",
        saltSourceEntrypoints: {
          ".": "public.ts",
        },
      }),
      "public.ts": `export const ModernThing = 1;
/** @deprecated Use {@link ModernThing} instead. */
export const LegacyThing = 2;
`,
      "src/index.ts": "export {};\n",
    });

    await expect(
      extractDeprecations(repoRoot, [fixturePackage()], new Set()),
    ).rejects.toThrow(
      /supported source file under its inventoried src directory/u,
    );
  });

  it.each(["src/../src/index.ts", "foo/../src/index.ts", "src//index.ts"])(
    "rejects noncanonical source entrypoint path %s",
    async (sourcePath) => {
      const repoRoot = await createPackageFixture({
        "package.json": JSON.stringify({
          name: "@salt-ds/core",
          saltSourceEntrypoints: {
            ".": sourcePath,
          },
        }),
        "src/index.ts": "export {};\n",
      });

      await expect(
        extractDeprecations(repoRoot, [fixturePackage()], new Set()),
      ).rejects.toThrow(/invalid source entrypoint/u);
    },
  );

  it("keeps semantic ids stable when prose, version, location, and byte ranges change", async () => {
    const repoRoot = await fs.mkdtemp(
      path.join(os.tmpdir(), "salt-deprecation-identity-"),
    );
    tempRoots.push(repoRoot);
    const sourceRoot = path.join(repoRoot, "packages/core/src");
    await fs.mkdir(sourceRoot, { recursive: true });
    const originalSource =
      'const café = "fixture";\n/** @deprecated since 1.0.0. Use {@link ModernThing} instead. */\nexport const LegacyThing = café;\n';
    await Promise.all([
      fs.writeFile(
        path.join(sourceRoot, "LegacyThing.ts"),
        originalSource,
        "utf8",
      ),
      fs.writeFile(
        path.join(sourceRoot, "ModernThing.ts"),
        "export const ModernThing = 2;\n",
        "utf8",
      ),
      fs.writeFile(
        path.join(sourceRoot, "index.ts"),
        'export * from "./LegacyThing";\nexport * from "./ModernThing";\n',
        "utf8",
      ),
    ]);
    const packages: PackageRecord[] = [
      {
        id: "package.salt-ds-core",
        name: "@salt-ds/core",
        status: "stable",
        version: "2.0.0",
        summary: "Core",
        source_root: "packages/core",
        changelog_path: null,
        docs_root: null,
      },
    ];

    const [original] = await extractDeprecations(repoRoot, packages, new Set());
    const originalOccurrence = original.source_occurrences[0];
    expect(
      Buffer.from(originalSource, "utf8")
        .subarray(
          originalOccurrence.source_range.start_offset,
          originalOccurrence.source_range.end_offset,
        )
        .toString("utf8"),
    ).toContain("@deprecated since 1.0.0");

    const movedDirectory = path.join(sourceRoot, "legacy");
    await fs.mkdir(movedDirectory, { recursive: true });
    const movedSource =
      '\n\n/** @deprecated since 9.9.9. Prefer the public {@link ModernThing} export. */\nexport const LegacyThing = "fixture";\n';
    await Promise.all([
      fs.rm(path.join(sourceRoot, "LegacyThing.ts")),
      fs.writeFile(
        path.join(movedDirectory, "LegacyThing.ts"),
        movedSource,
        "utf8",
      ),
      fs.writeFile(
        path.join(sourceRoot, "index.ts"),
        'export * from "./legacy/LegacyThing";\nexport * from "./ModernThing";\n',
        "utf8",
      ),
    ]);

    const [moved] = await extractDeprecations(repoRoot, packages, new Set());
    expect(moved.id).toBe(original.id);
    expect(moved.subject).toEqual(original.subject);
    expect(moved.deprecated_in).toBe("9.9.9");
    expect(moved.source_occurrences).not.toEqual(original.source_occurrences);
    expect(moved.source_occurrences[0].source_path).toBe(
      "packages/core/src/legacy/LegacyThing.ts",
    );
  });

  it("emits one stable public identity for every entrypoint that exports a deprecated symbol", async () => {
    const repoRoot = await fs.mkdtemp(
      path.join(os.tmpdir(), "salt-deprecation-entrypoints-"),
    );
    tempRoots.push(repoRoot);
    const packageRoot = path.join(repoRoot, "packages/core");
    const sourceRoot = path.join(packageRoot, "src");
    await fs.mkdir(sourceRoot, { recursive: true });
    await Promise.all([
      fs.writeFile(
        path.join(packageRoot, "package.json"),
        JSON.stringify({
          name: "@salt-ds/core",
          saltSourceEntrypoints: {
            ".": "src/index.ts",
            "./legacy": "src/legacy.ts",
          },
        }),
        "utf8",
      ),
      fs.writeFile(
        path.join(sourceRoot, "LegacyThing.ts"),
        "/** @deprecated Use {@link ModernThing} instead. */\nexport const LegacyThing = 1;\n",
        "utf8",
      ),
      fs.writeFile(
        path.join(sourceRoot, "ModernThing.ts"),
        "export const ModernThing = 2;\n",
        "utf8",
      ),
      fs.writeFile(
        path.join(sourceRoot, "index.ts"),
        'export * from "./LegacyThing";\nexport * from "./ModernThing";\n',
        "utf8",
      ),
      fs.writeFile(
        path.join(sourceRoot, "legacy.ts"),
        'export * from "./LegacyThing";\nexport * from "./ModernThing";\n',
        "utf8",
      ),
    ]);
    const packages: PackageRecord[] = [
      {
        id: "package.salt-ds-core",
        name: "@salt-ds/core",
        status: "stable",
        version: "2.0.0",
        summary: "Core",
        source_root: "packages/core",
        changelog_path: null,
        docs_root: null,
      },
    ];

    const deprecations = await extractDeprecations(
      repoRoot,
      packages,
      new Set(),
    );

    expect(deprecations).toHaveLength(2);
    expect(
      deprecations.map((deprecation) => deprecation.subject.entrypoint).sort(),
    ).toEqual([".", "./legacy"]);
    expect(
      new Set(deprecations.map((deprecation) => deprecation.id)).size,
    ).toBe(2);
    for (const deprecation of deprecations) {
      expect(deprecation.replacement.target?.entrypoint).toBe(
        deprecation.subject.entrypoint,
      );
    }
  });

  it("uses public aliases for subjects, replacements, names, and authored alias selection", async () => {
    const repoRoot = await createPackageFixture({
      "src/Fixture.ts": `/**
 * @deprecated Use {@link ModernThing} instead.
 * @saltDeprecatedExport PublicLegacy
 */
export const LegacyThing = 1;
export const ModernThing = 2;
`,
      "src/index.ts": [
        'export { LegacyThing as PublicLegacy } from "./Fixture";',
        'export { LegacyThing as StillSupported } from "./Fixture";',
        'export { ModernThing as PublicModern } from "./Fixture";',
      ].join("\n"),
    });

    const deprecations = await extractDeprecations(
      repoRoot,
      [fixturePackage()],
      new Set(),
    );

    expect(deprecations).toHaveLength(1);
    expect(deprecations[0]).toMatchObject({
      name: "PublicLegacy",
      component: null,
      subject: {
        export_name: "PublicLegacy",
        symbol_space: "value",
        member_path: [],
      },
      replacement: {
        target: {
          export_name: "PublicModern",
          symbol_space: "value",
          member_path: [],
        },
      },
      migration: {
        details: [{ from: "PublicLegacy", to: "PublicModern" }],
      },
    });
  });

  it("resolves a lexical replacement before an unrelated same-named public export", async () => {
    const repoRoot = await createPackageFixture({
      "src/Fixture.ts": `/** @deprecated Use {@link Modern} instead. */
export const Legacy = 1;
export const Modern = 2;
`,
      "src/Other.ts": "export const Modern = 3;\n",
      "src/index.ts": [
        'export { Legacy as PublicLegacy } from "./Fixture";',
        'export { Modern as PublicModern } from "./Fixture";',
        'export { Modern } from "./Other";',
      ].join("\n"),
    });

    const [deprecation] = await extractDeprecations(
      repoRoot,
      [fixturePackage()],
      new Set(),
    );
    expect(deprecation.replacement.target?.export_name).toBe("PublicModern");
  });

  it("resolves an imported replacement alias to its exact public leaf", async () => {
    const repoRoot = await createPackageFixture({
      "src/Modern.ts": "export const Modern = 2;\n",
      "src/Fixture.ts": `import { Modern as LocalModern } from "./Modern";
/** @deprecated Use {@link LocalModern} instead. */
export const Legacy = 1;
`,
      "src/index.ts": [
        'export { Legacy as PublicLegacy } from "./Fixture";',
        'export { Modern as PublicModern } from "./Modern";',
      ].join("\n"),
    });

    const [deprecation] = await extractDeprecations(
      repoRoot,
      [fixturePackage()],
      new Set(),
    );
    expect(deprecation.replacement.target?.export_name).toBe("PublicModern");
  });

  it("binds a named local default export to the stable public default identity", async () => {
    const repoRoot = await createPackageFixture({
      "src/Fixture.ts": `/** @deprecated Use {@link ModernThing} instead. */
class LegacyThing {}
export default LegacyThing;
export class ModernThing {}
`,
      "src/index.ts": [
        'export { default } from "./Fixture";',
        'export { ModernThing as PublicModern } from "./Fixture";',
      ].join("\n"),
    });

    const [deprecation] = await extractDeprecations(
      repoRoot,
      [fixturePackage()],
      new Set(),
    );

    expect(deprecation).toMatchObject({
      name: "default",
      subject: {
        export_name: "default",
        symbol_space: "type_and_value",
        member_path: [],
      },
      replacement: {
        target: {
          export_name: "PublicModern",
          symbol_space: "type_and_value",
        },
      },
    });
  });

  it("binds an anonymous deprecated default declaration by its public identity", async () => {
    const repoRoot = await createPackageFixture({
      "src/Fixture.ts": `/** @deprecated Use {@link ModernThing} instead. */
export default class {}
export class ModernThing {}
`,
      "src/index.ts": [
        'export { default } from "./Fixture";',
        'export { ModernThing } from "./Fixture";',
      ].join("\n"),
    });

    const [deprecation] = await extractDeprecations(
      repoRoot,
      [fixturePackage()],
      new Set(),
    );
    expect(deprecation).toMatchObject({
      name: "default",
      subject: {
        export_name: "default",
        symbol_space: "type_and_value",
      },
      replacement: {
        target: {
          export_name: "ModernThing",
          symbol_space: "type_and_value",
        },
      },
    });
  });

  it("binds a named deprecated default interface by its public type identity", async () => {
    const repoRoot = await createPackageFixture({
      "src/Fixture.ts": `export interface ModernThing {}
/** @deprecated Use {@link ModernThing} instead. */
export default interface LegacyThing {}
`,
      "src/index.ts": [
        'export type { default } from "./Fixture";',
        'export type { ModernThing } from "./Fixture";',
      ].join("\n"),
    });

    const [deprecation] = await extractDeprecations(
      repoRoot,
      [fixturePackage()],
      new Set(),
    );
    expect(deprecation).toMatchObject({
      name: "default",
      subject: {
        export_name: "default",
        symbol_space: "type",
      },
      replacement: {
        target: {
          export_name: "ModernThing",
          symbol_space: "type",
        },
      },
    });
  });

  it.each([
    {
      declaration: `export default class {
  modern(): void {}
  /** @deprecated Use {@link default.modern modern} instead. */
  legacy(): void {}
}`,
      symbolSpace: "type_and_value",
      index: 'export { default } from "./Fixture";\n',
    },
    {
      declaration: `export default interface FixtureApi {
  modern(): void;
  /** @deprecated Use {@link default.modern modern} instead. */
  legacy(): void;
}`,
      symbolSpace: "type",
      index: 'export type { default } from "./Fixture";\n',
    },
  ])(
    "binds a deprecated member of a default owner",
    async ({ declaration, symbolSpace, index }) => {
      const repoRoot = await createPackageFixture({
        "src/Fixture.ts": `${declaration}\n`,
        "src/index.ts": index,
      });

      const [deprecation] = await extractDeprecations(
        repoRoot,
        [fixturePackage()],
        new Set(),
      );
      expect(deprecation).toMatchObject({
        name: "legacy",
        subject: {
          export_name: "default",
          symbol_space: symbolSpace,
          member_path: [{ kind: "method", name: "legacy" }],
        },
        replacement: {
          target: {
            export_name: "default",
            member_path: [{ kind: "method", name: "modern" }],
          },
        },
      });
    },
  );

  it("binds a deprecated default export assignment to its local declaration leaf", async () => {
    const repoRoot = await createPackageFixture({
      "src/Fixture.ts": `const LegacyThing = 1;
export const ModernThing = 2;
/** @deprecated Use {@link ModernThing} instead. */
export default LegacyThing;
`,
      "src/index.ts": [
        'export { default } from "./Fixture";',
        'export { ModernThing } from "./Fixture";',
      ].join("\n"),
    });

    const [deprecation] = await extractDeprecations(
      repoRoot,
      [fixturePackage()],
      new Set(),
    );
    expect(deprecation).toMatchObject({
      name: "default",
      kind: "other",
      subject: {
        export_name: "default",
        symbol_space: "value",
      },
      replacement: {
        target: { export_name: "ModernThing" },
      },
    });
  });

  it("preserves an authored default-export deprecation when the binding is imported", async () => {
    const repoRoot = await createPackageFixture({
      "src/Definitions.ts": [
        "export class LegacyThing {}",
        "export class ModernThing {}",
      ].join("\n"),
      "src/Fixture.ts": `import { LegacyThing, ModernThing } from "./Definitions";
void ModernThing;
/** @deprecated Use {@link ModernThing} instead. */
export default LegacyThing;
`,
      "src/index.ts": [
        'export { default } from "./Fixture";',
        'export { ModernThing } from "./Definitions";',
      ].join("\n"),
    });

    const [deprecation] = await extractDeprecations(
      repoRoot,
      [fixturePackage()],
      new Set(),
    );
    expect(deprecation).toMatchObject({
      name: "default",
      kind: "other",
      subject: {
        export_name: "default",
        symbol_space: "type_and_value",
      },
      replacement: {
        target: { export_name: "ModernThing" },
      },
      source_paths: ["packages/core/src/Fixture.ts"],
    });
  });

  it("preserves dual identity for a deprecated default export assignment of a class", async () => {
    const repoRoot = await createPackageFixture({
      "src/Fixture.ts": `class LegacyThing {}
export class ModernThing {}
/** @deprecated Use {@link ModernThing} instead. */
export default LegacyThing;
`,
      "src/index.ts": [
        'export { default } from "./Fixture";',
        'export { ModernThing } from "./Fixture";',
      ].join("\n"),
    });

    const [deprecation] = await extractDeprecations(
      repoRoot,
      [fixturePackage()],
      new Set(),
    );
    expect(deprecation).toMatchObject({
      name: "default",
      subject: {
        export_name: "default",
        symbol_space: "type_and_value",
      },
      replacement: {
        target: {
          export_name: "ModernThing",
          symbol_space: "type_and_value",
        },
      },
    });
  });

  it("preserves public interface, instance, and static method identities", async () => {
    const repoRoot = await createPackageFixture({
      "src/Fixture.ts": `export interface InternalApi {
  modern(): void;
  /** @deprecated Use {@link InternalApi.modern modern} instead. */
  legacy(): void;
}

export class InternalClass {
  modern(): void {}
  static modernStatic(): void {}
  /** @deprecated Use {@link InternalClass.modern modern} instead. */
  legacy(): void {}
  /** @deprecated Use {@link PublicClass.modernStatic modernStatic} instead. */
  static legacyStatic(): void {}
  /** @deprecated Internal only. @saltMigration manual */
  protected protectedLegacy(): void {}
  /** @deprecated Internal only. @saltMigration manual */
  private privateLegacy(): void {}
}
`,
      "src/index.ts": [
        'export type { InternalApi as PublicApi } from "./Fixture";',
        'export { InternalClass as PublicClass } from "./Fixture";',
      ].join("\n"),
    });

    const deprecations = await extractDeprecations(
      repoRoot,
      [fixturePackage()],
      new Set(),
    );

    expect(deprecations).toHaveLength(3);
    const instanceMethod = deprecations.find(
      (deprecation) =>
        deprecation.subject.export_name === "PublicClass" &&
        deprecation.name === "legacy",
    );
    expect(instanceMethod).toMatchObject({
      kind: "method",
      subject: {
        export_name: "PublicClass",
        symbol_space: "type_and_value",
        member_path: [{ kind: "method", name: "legacy" }],
      },
      replacement: {
        target: {
          member_path: [{ kind: "method", name: "modern" }],
        },
      },
    });
    const staticMethod = deprecations.find(
      (deprecation) => deprecation.name === "legacyStatic",
    );
    expect(staticMethod).toMatchObject({
      kind: "method",
      subject: {
        export_name: "PublicClass",
        symbol_space: "type_and_value",
        member_path: [{ kind: "static_method", name: "legacyStatic" }],
      },
      replacement: {
        target: {
          member_path: [{ kind: "static_method", name: "modernStatic" }],
        },
      },
    });
    const interfaceMethod = deprecations.find(
      (deprecation) => deprecation.subject.export_name === "PublicApi",
    );
    expect(interfaceMethod).toMatchObject({
      kind: "method",
      subject: {
        symbol_space: "type",
        member_path: [{ kind: "method", name: "legacy" }],
      },
    });
    expect(
      new Set(deprecations.map((deprecation) => deprecation.id)).size,
    ).toBe(3);
  });

  it("resolves imported finite source and target aliases with the TypeScript checker", async () => {
    const repoRoot = await createPackageFixture({
      "src/Types.ts": `export interface ValidationStatuses {
  error: string;
  warning: string;
  success: string;
  info: string;
}
export type ValidationStatus = keyof ValidationStatuses;
export type AdornmentValidationStatus = Exclude<ValidationStatus, "info">;
export type LegacyMode = "primary" | "secondary" | undefined;
`,
      "src/Fixture.ts": `import type {
  AdornmentValidationStatus,
  LegacyMode,
} from "./Types";

export interface FixtureProps {
  validationStatus?: AdornmentValidationStatus;
  /**
   * @deprecated Use {@link FixtureProps.validationStatus validationStatus}.
   * @saltValueMap {"from":"primary","set":[["validationStatus","error"]]}
   * @saltValueMap {"from":"secondary","set":[["validationStatus","warning"]]}
   */
  legacy?: LegacyMode;
}
`,
      "src/index.ts": 'export type { FixtureProps } from "./Fixture";\n',
    });

    const [deprecation] = await extractDeprecations(
      repoRoot,
      [fixturePackage()],
      new Set(),
    );
    expect(
      deprecation.migration.value_map?.cases.map((entry) => entry.from),
    ).toEqual(["primary", "secondary"]);
  });

  it("accepts a literal value assignable to a broad string replacement type", async () => {
    const repoRoot = await createPackageFixture({
      "src/Fixture.ts": `export interface FixtureProps {
  replacement?: string;
  /**
   * @deprecated Use {@link FixtureProps.replacement replacement}.
   * @saltValueMap {"from":true,"set":[["replacement","allowed"]]}
   * @saltValueMap {"from":false,"set":[]}
   */
  legacy?: boolean;
}
`,
      "src/index.ts": 'export type { FixtureProps } from "./Fixture";\n',
    });

    const [deprecation] = await extractDeprecations(
      repoRoot,
      [fixturePackage()],
      new Set(),
    );
    expect(deprecation.migration.value_map?.cases[0]?.set[0]?.value).toBe(
      "allowed",
    );
  });

  it.each([
    {
      name: "an uncovered imported source literal",
      valueMaps:
        '   * @saltValueMap {"from":"primary","set":[["validationStatus","error"]]}',
      expected: /must cover every finite value/u,
    },
    {
      name: "a value outside an imported target alias",
      valueMaps: [
        '   * @saltValueMap {"from":"primary","set":[["validationStatus","bogus"]]}',
        '   * @saltValueMap {"from":"secondary","set":[["validationStatus","warning"]]}',
      ].join("\n"),
      expected: /outside the declared type of replacement target/u,
    },
  ])("rejects $name", async ({ valueMaps, expected }) => {
    const repoRoot = await createPackageFixture({
      "src/Types.ts": `export interface ValidationStatuses {
  error: string;
  warning: string;
  success: string;
  info: string;
}
export type AdornmentValidationStatus =
  Exclude<keyof ValidationStatuses, "info">;
export type LegacyMode = "primary" | "secondary";
`,
      "src/Fixture.ts": `import type {
  AdornmentValidationStatus,
  LegacyMode,
} from "./Types";

export interface FixtureProps {
  validationStatus?: AdornmentValidationStatus;
  /**
   * @deprecated Use {@link FixtureProps.validationStatus validationStatus}.
${valueMaps}
   */
  legacy?: LegacyMode;
}
`,
      "src/index.ts": 'export type { FixtureProps } from "./Fixture";\n',
    });

    await expect(
      extractDeprecations(repoRoot, [fixturePackage()], new Set()),
    ).rejects.toThrow(expected);
  });

  it("classifies every authored migration shape from typed source declarations", async () => {
    const repoRoot = await createPackageFixture({
      "src/FixtureProps.ts": `export interface FixtureProps {
  replacement?: string;
  validationStatus?: "error";
  appearance?: "solid" | "transparent";
  sentiment?: "accented" | "neutral";
  /** @deprecated Use {@link FixtureProps.replacement replacement} instead. */
  direct?: string;
  /**
   * @deprecated Use {@link FixtureProps.validationStatus validationStatus} instead.
   * @saltValueMap {"from":true,"set":[["validationStatus","error"]]}
   * @saltValueMap {"from":false,"set":[]}
   */
  booleanTransform?: boolean;
  /**
   * @deprecated Use {@link FixtureProps.appearance appearance} and {@link FixtureProps.sentiment sentiment} instead.
   * @saltValueMap {"from":"primary","set":[["appearance","solid"],["sentiment","neutral"]]}
   * @saltValueMap {"from":"cta","set":[["appearance","solid"],["sentiment","accented"]]}
   */
  compositeTransform?: "primary" | "cta";
  /**
   * @deprecated This property is no longer needed.
   * @saltMigration remove
   */
  removed?: string;
  /**
   * @deprecated Reconcile this behavior manually.
   * @saltMigration manual
   */
  manual?: string;
  /**
   * @deprecated No universal replacement is known.
   * @saltMigration unspecified
   */
  unspecified?: string;
}
`,
      "src/index.ts": 'export type { FixtureProps } from "./FixtureProps";\n',
    });

    const deprecations = await extractDeprecations(
      repoRoot,
      [fixturePackage()],
      new Set(),
    );
    const byName = new Map(
      deprecations.map((deprecation) => [deprecation.name, deprecation]),
    );

    expect(deprecations).toHaveLength(6);
    expect(byName.get("direct")).toMatchObject({
      replacement: {
        mode: "single",
        target: {
          export_name: "FixtureProps",
          symbol_space: "type",
          member_path: [{ kind: "prop", name: "replacement" }],
        },
      },
      migration: {
        strategy: "replace",
        value_map: null,
      },
    });
    expect(byName.get("booleanTransform")).toMatchObject({
      replacement: {
        mode: "single",
        target: {
          member_path: [{ kind: "prop", name: "validationStatus" }],
        },
      },
      migration: {
        strategy: "transform",
        value_map: {
          fallback: "manual",
          cases: [
            {
              from: true,
              set: [
                {
                  target: {
                    member_path: [{ kind: "prop", name: "validationStatus" }],
                  },
                  value: "error",
                },
              ],
            },
            { from: false, set: [] },
          ],
        },
      },
    });
    expect(byName.get("compositeTransform")).toMatchObject({
      replacement: {
        mode: "composite",
        target: null,
        targets: [
          { member_path: [{ kind: "prop", name: "appearance" }] },
          { member_path: [{ kind: "prop", name: "sentiment" }] },
        ],
      },
      migration: {
        strategy: "transform",
      },
    });
    const compositeOccurrence =
      byName.get("compositeTransform")?.source_occurrences[0];
    if (!compositeOccurrence) {
      throw new Error("Composite fixture has no source occurrence.");
    }
    const fixtureSource = await fs.readFile(
      path.join(repoRoot, "packages/core/src/FixtureProps.ts"),
      "utf8",
    );
    const citedCompositeSource = Buffer.from(fixtureSource, "utf8")
      .subarray(
        compositeOccurrence.source_range.start_offset,
        compositeOccurrence.source_range.end_offset,
      )
      .toString("utf8");
    expect(citedCompositeSource).toContain("@deprecated");
    expect(citedCompositeSource.match(/@saltValueMap/gu)).toHaveLength(2);
    for (const strategy of ["remove", "manual", "unspecified"] as const) {
      expect(
        byName.get(strategy === "remove" ? "removed" : strategy),
      ).toMatchObject({
        replacement: {
          mode: "none",
          target: null,
          targets: [],
        },
        migration: {
          strategy,
          value_map: null,
        },
      });
    }
  });

  it("extracts numeric public property deprecations without dropping them", async () => {
    const repoRoot = await createPackageFixture({
      "src/Fixture.ts": `export interface FixtureProps {
  /** @deprecated Remove this property. @saltMigration remove */
  1?: string;
}
`,
      "src/index.ts": 'export type { FixtureProps } from "./Fixture";\n',
    });

    const [deprecation] = await extractDeprecations(
      repoRoot,
      [fixturePackage()],
      new Set(),
    );

    expect(deprecation).toMatchObject({
      name: "1",
      kind: "prop",
      subject: {
        export_name: "FixtureProps",
        symbol_space: "type",
        member_path: [{ kind: "prop", name: "1" }],
      },
      migration: {
        strategy: "remove",
      },
    });
  });

  it.each([
    {
      name: "statement-level deprecation with multiple public bindings",
      source: `/** @deprecated Remove these bindings. @saltMigration remove */
export const LegacyOne = 1, LegacyTwo = 2;
`,
      index: 'export { LegacyOne, LegacyTwo } from "./Fixture";\n',
      expected:
        /variable statement declares multiple public bindings.*cannot share one single-declaration deprecation contract/u,
    },
    {
      name: "private replacement",
      source: `/** @deprecated Use {@link ModernThing} instead. */
export const LegacyThing = 1;
const ModernThing = 2;
`,
      index: 'export { LegacyThing } from "./Fixture";\n',
      expected:
        /Replacement value declaration 'ModernThing' is not uniquely public/u,
    },
    {
      name: "wrong symbol space",
      source: `/** @deprecated Use {@link ModernThing} instead. */
export type LegacyThing = string;
export const ModernThing = 2;
`,
      index:
        'export type { LegacyThing } from "./Fixture";\nexport { ModernThing } from "./Fixture";\n',
      expected:
        /Replacement type declaration 'ModernThing' is not uniquely public/u,
    },
    {
      name: "wrong member owner",
      source: `export interface FixtureProps {
  replacement?: string;
  /** @deprecated Use {@link OtherProps.replacement replacement} instead. */
  legacy?: string;
}
`,
      index: 'export type { FixtureProps } from "./Fixture";\n',
      expected: /must name public owner 'FixtureProps'/u,
    },
    {
      name: "missing explicit disposition",
      source: `/** @deprecated Legacy behavior. */
export const LegacyThing = 1;
`,
      index: 'export { LegacyThing } from "./Fixture";\n',
      expected:
        /must declare typed replacement links or an explicit @saltMigration strategy/u,
    },
    {
      name: "incomplete finite value map",
      source: `export interface FixtureProps {
  validationStatus?: "error";
  /**
   * @deprecated Use {@link FixtureProps.validationStatus validationStatus} instead.
   * @saltValueMap {"from":true,"set":[["validationStatus","error"]]}
   */
  legacy?: boolean;
}
`,
      index: 'export type { FixtureProps } from "./Fixture";\n',
      expected: /must cover every finite value/u,
    },
    {
      name: "composite without a value map",
      source: `export interface FixtureProps {
  appearance?: "solid";
  sentiment?: "neutral";
  /** @deprecated Use {@link FixtureProps.appearance appearance} and {@link FixtureProps.sentiment sentiment}. */
  legacy?: "primary";
}
`,
      index: 'export type { FixtureProps } from "./Fixture";\n',
      expected: /requires a complete @saltValueMap/u,
    },
    {
      name: "value map outside a finite target type",
      source: `export interface FixtureProps {
  replacement?: "allowed";
  /**
   * @deprecated Use {@link FixtureProps.replacement replacement} instead.
   * @saltValueMap {"from":true,"set":[["replacement","bogus"]]}
   * @saltValueMap {"from":false,"set":[]}
   */
  legacy?: boolean;
}
`,
      index: 'export type { FixtureProps } from "./Fixture";\n',
      expected:
        /outside the declared type of replacement target 'replacement'/u,
    },
    {
      name: "value map outside a broad target type",
      source: `export interface FixtureProps {
  replacement?: number;
  /**
   * @deprecated Use {@link FixtureProps.replacement replacement} instead.
   * @saltValueMap {"from":true,"set":[["replacement","bogus"]]}
   * @saltValueMap {"from":false,"set":[]}
   */
  legacy?: boolean;
}
`,
      index: 'export type { FixtureProps } from "./Fixture";\n',
      expected:
        /outside the declared type of replacement target 'replacement'/u,
    },
    {
      name: "value map with an unknown target type",
      source: `export interface FixtureProps {
  replacement?: unknown;
  /**
   * @deprecated Use {@link FixtureProps.replacement replacement} instead.
   * @saltValueMap {"from":true,"set":[["replacement","value"]]}
   * @saltValueMap {"from":false,"set":[]}
   */
  legacy?: boolean;
}
`,
      index: 'export type { FixtureProps } from "./Fixture";\n',
      expected: /must have a statically checkable type/u,
    },
    {
      name: "nested replacement member",
      source: `export interface FixtureProps {
  nested?: { replacement?: string };
  /** @deprecated Use {@link FixtureProps.replacement replacement} instead. */
  legacy?: string;
}
`,
      index: 'export type { FixtureProps } from "./Fixture";\n',
      expected: /Replacement member 'replacement' does not exist/u,
    },
    {
      name: "value map authored on a method",
      source: `export interface FixtureApi {
  replacement?: "allowed";
  /**
   * @deprecated Use {@link FixtureApi.replacement replacement} instead.
   * @saltValueMap {"from":true,"set":[["replacement","allowed"]]}
   * @saltValueMap {"from":false,"set":[]}
   */
  legacy(): boolean;
}
`,
      index: 'export type { FixtureApi } from "./Fixture";\n',
      expected: /only valid for deprecated public properties/u,
    },
    {
      name: "method replacement target in a value map",
      source: `export interface FixtureApi {
  replacement(): void;
  /**
   * @deprecated Use {@link FixtureApi.replacement replacement} instead.
   * @saltValueMap {"from":true,"set":[["replacement","value"]]}
   * @saltValueMap {"from":false,"set":[]}
   */
  legacy?: boolean;
}
`,
      index: 'export type { FixtureApi } from "./Fixture";\n',
      expected: /replacement targets must be public properties/u,
    },
    {
      name: "deprecated static property",
      source: `export class FixtureApi {
  static modern = "modern";
  /** @deprecated Use {@link FixtureApi.modern modern} instead. */
  static legacy = "legacy";
}
`,
      index: 'export { FixtureApi } from "./Fixture";\n',
      expected: /static properties.*cannot be represented/u,
    },
    {
      name: "static property replacement target",
      source: `export class FixtureApi {
  static modern = "modern";
  /** @deprecated Use {@link FixtureApi.modern modern} instead. */
  legacy = "legacy";
}
`,
      index: 'export { FixtureApi } from "./Fixture";\n',
      expected: /Static replacement property 'modern' cannot be represented/u,
    },
    {
      name: "overloaded deprecated method",
      source: `export class FixtureApi {
  modern(): void {}
  /** @deprecated Use {@link FixtureApi.modern modern} instead. */
  legacy(value: string): void;
  legacy(value: number): void;
  legacy(value: string | number): void {}
}
`,
      index: 'export { FixtureApi } from "./Fixture";\n',
      expected: /Deprecated overloaded method 'legacy' cannot be represented/u,
    },
    {
      name: "overloaded replacement method",
      source: `export class FixtureApi {
  modern(value: string): void;
  modern(value: number): void;
  modern(value: string | number): void {}
  /** @deprecated Use {@link FixtureApi.modern modern} instead. */
  legacy(): void {}
}
`,
      index: 'export { FixtureApi } from "./Fixture";\n',
      expected: /Overloaded replacement method 'modern' cannot be represented/u,
    },
    {
      name: "overloaded top-level function",
      source: `export function modern(): void {}
/** @deprecated Use {@link modern} instead. */
export function legacy(value: string): void;
export function legacy(value: number): void;
export function legacy(value: string | number): void {}
`,
      index: 'export { legacy, modern } from "./Fixture";\n',
      expected:
        /Deprecated overloaded function 'legacy' cannot be represented/u,
    },
    {
      name: "overloaded top-level replacement function",
      source: `export function modern(value: string): void;
export function modern(value: number): void;
export function modern(value: string | number): void {}
/** @deprecated Use {@link modern} instead. */
export function legacy(): void {}
`,
      index: 'export { legacy, modern } from "./Fixture";\n',
      expected:
        /Overloaded replacement function 'modern' cannot be represented/u,
    },
    {
      name: "overloaded replacement function behind a public barrel alias",
      source: `export function modern(value: string): void;
export function modern(value: number): void;
export function modern(value: string | number): void {}
/** @deprecated Use {@link PublicModern} instead. */
export function legacy(): void {}
`,
      index: 'export { legacy, modern as PublicModern } from "./Fixture";\n',
      expected: /Overloaded replacement function 'PublicModern'.*overloaded/u,
    },
    {
      name: "overloaded function deprecated through a default export assignment",
      source: `function legacy(value: string): void;
function legacy(value: number): void;
function legacy(value: string | number): void {}
/** @deprecated Remove this API. @saltMigration remove */
export default legacy;
`,
      index: 'export { default } from "./Fixture";\n',
      expected: /Deprecated function 'default'.*overloaded/u,
    },
    {
      name: "static replacement method on a type-only class surface",
      source: `export class FixtureApi {
  static modern(): void {}
  /** @deprecated Use {@link FixtureApi.modern modern} instead. */
  legacy(): void {}
}
`,
      index: 'export type { FixtureApi } from "./Fixture";\n',
      expected: /Static replacement method 'modern'.*type-only public owner/u,
    },
    {
      name: "public enum member",
      source: `export enum FixtureState {
  /** @deprecated Remove this member. @saltMigration remove */
  Legacy = "legacy",
}
`,
      index: 'export { FixtureState } from "./Fixture";\n',
      expected: /public member 'Legacy'.*cannot be represented/u,
    },
    {
      name: "overloaded method across merged interfaces",
      source: `export interface FixtureApi {
  modern(): void;
  /** @deprecated Use {@link FixtureApi.modern modern} instead. */
  legacy(value: string): void;
}
export interface FixtureApi {
  legacy(value: number): void;
}
`,
      index: 'export type { FixtureApi } from "./Fixture";\n',
      expected: /Deprecated overloaded method 'legacy' cannot be represented/u,
    },
    {
      name: "overloaded replacement method across merged interfaces",
      source: `export interface FixtureApi {
  modern(value: string): void;
  /** @deprecated Use {@link FixtureApi.modern modern} instead. */
  legacy(): void;
}
export interface FixtureApi {
  modern(value: number): void;
}
`,
      index: 'export type { FixtureApi } from "./Fixture";\n',
      expected: /Overloaded replacement method 'modern' cannot be represented/u,
    },
    {
      name: "unsupported public accessor",
      source: `export class FixtureApi {
  /** @deprecated Remove this accessor. @saltMigration remove */
  get legacy(): string {
    return "legacy";
  }
}
`,
      index: 'export { FixtureApi } from "./Fixture";\n',
      expected: /public member 'legacy'.*cannot be represented/u,
    },
  ])("rejects a $name", async ({ source, index, expected }) => {
    const repoRoot = await createPackageFixture({
      "src/Fixture.ts": source,
      "src/index.ts": index,
    });

    await expect(
      extractDeprecations(repoRoot, [fixturePackage()], new Set()),
    ).rejects.toThrow(expected);
  });

  it("omits unsupported members on internal owners instead of aborting public extraction", async () => {
    const repoRoot = await createPackageFixture({
      "src/Fixture.ts": `class InternalApi {
  /** @deprecated Internal only. @saltMigration manual */
  static legacy = "legacy";
}
export const PublicThing = 1;
`,
      "src/index.ts": 'export { PublicThing } from "./Fixture";\n',
    });

    await expect(
      extractDeprecations(repoRoot, [fixturePackage()], new Set()),
    ).resolves.toEqual([]);
  });

  it("does not bind a nested same-named owner to a top-level public export", async () => {
    const repoRoot = await createPackageFixture({
      "src/Fixture.ts": `export class PublicApi {}
export function createInternalApi(): unknown {
  class PublicApi {
    /** @deprecated Internal only. @saltMigration manual */
    legacy(): void {}
  }
  return PublicApi;
}
`,
      "src/index.ts":
        'export { PublicApi, createInternalApi } from "./Fixture";\n',
    });

    await expect(
      extractDeprecations(repoRoot, [fixturePackage()], new Set()),
    ).resolves.toEqual([]);
  });

  it("fails closed when the tracked TypeScript program has unresolved imports", async () => {
    const repoRoot = await createPackageFixture({
      "src/Helper.ts": `import type { Missing } from "./Missing";
export interface Wrapper extends Missing {}
`,
      "src/Fixture.ts": `import type { Wrapper } from "./Helper";
export const ModernThing = 1;
/** @deprecated Use {@link ModernThing} instead. */
export const LegacyThing = {} as Wrapper;
`,
      "src/index.ts": 'export { LegacyThing, ModernThing } from "./Fixture";\n',
    });

    await expect(
      extractDeprecations(repoRoot, [fixturePackage()], new Set()),
    ).rejects.toThrow(/TS2307.*Cannot find module '\.\/Missing'/su);
  });

  it("fails closed when a public entrypoint has semantic export errors", async () => {
    const repoRoot = await createPackageFixture({
      "src/Fixture.ts": `export const ModernThing = 1;
/** @deprecated Use {@link ModernThing} instead. */
export const LegacyThing = 2;
`,
      "src/index.ts":
        'export { LegacyThing, ModernThing, MissingThing } from "./Fixture";\n',
    });

    await expect(
      extractDeprecations(repoRoot, [fixturePackage()], new Set()),
    ).rejects.toThrow(
      /TS2305.*Module .*\.\/Fixture.*has no exported member ['"]MissingThing['"]/su,
    );
  });

  it("still diagnoses a broken public re-export when it filters the only deprecated candidate", async () => {
    const repoRoot = await createPackageFixture({
      "src/Fixture.ts": `export const ModernThing = 1;
/** @deprecated Use {@link ModernThing} instead. */
export const LegacyThing = 2;
`,
      "src/index.ts":
        'export { MissingThing as LegacyThing } from "./Fixture";\n',
    });

    await expect(
      extractDeprecations(repoRoot, [fixturePackage()], new Set()),
    ).rejects.toThrow(
      /TS2305.*Module .*\.\/Fixture.*has no exported member ['"]MissingThing['"]/su,
    );
  });

  it("does not resolve an existing relative type import outside the repository", async () => {
    const repoRoot = await createPackageFixture({
      "src/Helper.ts": "",
      "src/Fixture.ts": `import type { External } from "./Helper";
export const ModernThing = 1;
declare const external: External;
/** @deprecated Use {@link ModernThing} instead. */
export const LegacyThing = external;
`,
      "src/index.ts": 'export { LegacyThing, ModernThing } from "./Fixture";\n',
    });
    const outsideRoot = await fs.mkdtemp(
      path.join(os.tmpdir(), "salt-deprecation-outside-"),
    );
    tempRoots.push(outsideRoot);
    await fs.writeFile(
      path.join(outsideRoot, "External.ts"),
      "export interface External { value: string }\n",
      "utf8",
    );
    const sourceDirectory = path.join(repoRoot, "packages/core/src");
    const relativeImport = path
      .relative(sourceDirectory, path.join(outsideRoot, "External"))
      .split(path.sep)
      .join("/");
    await fs.writeFile(
      path.join(sourceDirectory, "Helper.ts"),
      `export type { External } from "${relativeImport.startsWith(".") ? relativeImport : `./${relativeImport}`}";\n`,
      "utf8",
    );

    await expect(
      extractDeprecations(repoRoot, [fixturePackage()], new Set()),
    ).rejects.toThrow(/TS2307.*Cannot find module/su);
  });

  it("supports a repository root reached through a directory junction", async () => {
    const repoRoot = await createPackageFixture({
      "src/Fixture.ts": `export const ModernThing = 1;
/** @deprecated Use {@link ModernThing} instead. */
export const LegacyThing = 2;
`,
      "src/index.ts": 'export { LegacyThing, ModernThing } from "./Fixture";\n',
    });
    const junctionParent = await fs.mkdtemp(
      path.join(os.tmpdir(), "salt-deprecation-root-link-"),
    );
    tempRoots.push(junctionParent);
    const linkedRoot = path.join(junctionParent, "repo");
    await fs.symlink(
      repoRoot,
      linkedRoot,
      process.platform === "win32" ? "junction" : "dir",
    );
    const inventory = await createCatalogInputInventory(linkedRoot);

    const deprecations = await withCatalogInputTracking(
      linkedRoot,
      inventory,
      () => extractDeprecations(linkedRoot, [fixturePackage()], new Set()),
    );

    expect(deprecations.map((deprecation) => deprecation.name)).toEqual([
      "LegacyThing",
    ]);
  });

  it("rejects a first-party type import that escapes through a subtree junction", async () => {
    const repoRoot = await createPackageFixture({
      "src/Fixture.ts": `import type { External } from "./escape/External";
export const ModernThing = 1;
declare const external: External;
/** @deprecated Use {@link ModernThing} instead. */
export const LegacyThing = external;
`,
      "src/index.ts": 'export { LegacyThing, ModernThing } from "./Fixture";\n',
    });
    const outsideRoot = await fs.mkdtemp(
      path.join(os.tmpdir(), "salt-deprecation-link-escape-"),
    );
    tempRoots.push(outsideRoot);
    await fs.writeFile(
      path.join(outsideRoot, "External.ts"),
      "export interface External { value: string }\n",
      "utf8",
    );
    await fs.symlink(
      outsideRoot,
      path.join(repoRoot, "packages/core/src/escape"),
      process.platform === "win32" ? "junction" : "dir",
    );

    await expect(
      extractDeprecations(repoRoot, [fixturePackage()], new Set()),
    ).rejects.toThrow(
      /resolves through a nested link or outside the repository/u,
    );
  });

  it("rejects an untracked first-party alias reached through a nested directory link", async () => {
    const repoRoot = await createPackageFixture({
      "src/Fixture.ts": `import type { External } from "./alias/External";
export const ModernThing = 1;
declare const external: External;
/** @deprecated Use {@link ModernThing} instead. */
export const LegacyThing = external;
`,
      "src/real/External.ts": "export interface External { value: string }\n",
      "src/index.ts": 'export { LegacyThing, ModernThing } from "./Fixture";\n',
    });
    await fs.symlink(
      path.join(repoRoot, "packages/core/src/real"),
      path.join(repoRoot, "packages/core/src/alias"),
      process.platform === "win32" ? "junction" : "dir",
    );

    await expect(
      extractDeprecations(repoRoot, [fixturePackage()], new Set()),
    ).rejects.toThrow(/resolves through a nested link/u);
  });

  it("rejects paths that reach a linked dependency root outside the lexical node_modules boundary", async () => {
    const repoRoot = await createPackageFixture({
      "src/Helper.ts": "",
      "src/Fixture.ts": `import type { External } from "./Helper";
export const ModernThing = 1;
declare const external: External;
/** @deprecated Use {@link ModernThing} instead. */
export const LegacyThing = external;
`,
      "src/index.ts": 'export { LegacyThing, ModernThing } from "./Fixture";\n',
    });
    const dependencyRoot = await fs.mkdtemp(
      path.join(os.tmpdir(), "salt-deprecation-dependencies-"),
    );
    tempRoots.push(dependencyRoot);
    await fs.writeFile(
      path.join(dependencyRoot, "External.ts"),
      "export interface External { value: string }\n",
      "utf8",
    );
    await fs.symlink(
      dependencyRoot,
      path.join(repoRoot, "node_modules"),
      process.platform === "win32" ? "junction" : "dir",
    );
    const sourcePath = path.join(repoRoot, "packages/core/src/Helper.ts");
    const relativeImport = path
      .relative(path.dirname(sourcePath), path.join(dependencyRoot, "External"))
      .replaceAll("\\", "/");
    await fs.writeFile(
      sourcePath,
      `export type { External } from "${relativeImport.startsWith(".") ? relativeImport : `./${relativeImport}`}";\n`,
      "utf8",
    );

    await expect(
      extractDeprecations(repoRoot, [fixturePackage()], new Set()),
    ).rejects.toThrow(
      /reaches the dependency root without passing through the repository node_modules boundary/u,
    );
  });

  it("resolves a bare dependency through a repository node_modules junction without exposing its physical path", async () => {
    const repoRoot = await createPackageFixture({
      "src/Fixture.ts": `import type { External } from "fixture-dependency";
export const ModernThing = 1;
declare const external: External;
/** @deprecated Use {@link ModernThing} instead. */
export const LegacyThing = external;
`,
      "src/index.ts": 'export { LegacyThing, ModernThing } from "./Fixture";\n',
    });
    const dependencyRoot = await fs.mkdtemp(
      path.join(os.tmpdir(), "salt-deprecation-dependencies-"),
    );
    tempRoots.push(dependencyRoot);
    await fs.mkdir(path.join(dependencyRoot, "fixture-dependency"), {
      recursive: true,
    });
    await fs.writeFile(
      path.join(dependencyRoot, "fixture-dependency/package.json"),
      JSON.stringify({
        name: "fixture-dependency",
        types: "index.d.ts",
      }),
      "utf8",
    );
    await fs.writeFile(
      path.join(dependencyRoot, "fixture-dependency/index.d.ts"),
      "export interface External { value: string }\n",
      "utf8",
    );
    await fs.symlink(
      dependencyRoot,
      path.join(repoRoot, "node_modules"),
      process.platform === "win32" ? "junction" : "dir",
    );

    await expect(
      extractDeprecations(repoRoot, [fixturePackage()], new Set()),
    ).resolves.toEqual([
      expect.objectContaining({
        name: "LegacyThing",
      }),
    ]);
  });

  it("rejects a bare dependency that escapes through a nested node_modules link", async () => {
    const repoRoot = await createPackageFixture({
      "src/Fixture.ts": `import type { External } from "fixture-dependency";
export const ModernThing = 1;
declare const external: External;
/** @deprecated Use {@link ModernThing} instead. */
export const LegacyThing = external;
`,
      "src/index.ts": 'export { LegacyThing, ModernThing } from "./Fixture";\n',
    });
    const dependencyRoot = await fs.mkdtemp(
      path.join(os.tmpdir(), "salt-deprecation-dependency-link-"),
    );
    tempRoots.push(dependencyRoot);
    await fs.writeFile(
      path.join(dependencyRoot, "package.json"),
      JSON.stringify({
        name: "fixture-dependency",
        types: "index.d.ts",
      }),
      "utf8",
    );
    await fs.writeFile(
      path.join(dependencyRoot, "index.d.ts"),
      "export interface External { value: string }\n",
      "utf8",
    );
    await fs.mkdir(path.join(repoRoot, "node_modules"), { recursive: true });
    await fs.symlink(
      dependencyRoot,
      path.join(repoRoot, "node_modules/fixture-dependency"),
      process.platform === "win32" ? "junction" : "dir",
    );

    await expect(
      extractDeprecations(repoRoot, [fixturePackage()], new Set()),
    ).rejects.toThrow(/dependency path escapes.*node_modules root/u);
  });

  it("rejects inherited TypeScript config until its inputs can be inventoried", async () => {
    const repoRoot = await createPackageFixture({
      "src/Fixture.ts": `export const ModernThing = 1;
/** @deprecated Use {@link ModernThing} instead. */
export const LegacyThing = 2;
`,
      "src/index.ts": 'export { LegacyThing, ModernThing } from "./Fixture";\n',
    });
    await fs.writeFile(
      path.join(repoRoot, "tsconfig.json"),
      JSON.stringify({ extends: "./tsconfig.base.json" }),
      "utf8",
    );

    await expect(
      extractDeprecations(repoRoot, [fixturePackage()], new Set()),
    ).rejects.toThrow(/config inheritance is not supported/u);
  });

  it("propagates a tracked compiler read failure even when TypeScript swallows and the source is restored", async () => {
    const source = `export const ModernThing = 1;
/** @deprecated Use {@link ModernThing} instead. */
export const LegacyThing = 2;
`;
    const repoRoot = await createPackageFixture({
      "src/Fixture.ts": source,
      "src/index.ts": 'export { LegacyThing, ModernThing } from "./Fixture";\n',
    });
    const inventory = await createCatalogInputInventory(repoRoot);
    const sourcePath = path.join(repoRoot, "packages/core/src/Fixture.ts");
    const originalReadFileSync = fsSync.readFileSync;
    let injected = false;
    const readSpy = vi.spyOn(fsSync, "readFileSync").mockImplementation(((
      targetPath: fsSync.PathOrFileDescriptor,
      ...args: unknown[]
    ) => {
      const resolvedTarget =
        typeof targetPath === "string"
          ? path.resolve(targetPath)
          : Buffer.isBuffer(targetPath)
            ? path.resolve(targetPath.toString())
            : null;
      if (!injected && resolvedTarget === path.resolve(sourcePath)) {
        injected = true;
        fsSync.writeFileSync(
          sourcePath,
          source.replace("LegacyThing", "LegacyThinx"),
          "utf8",
        );
        try {
          return Reflect.apply(originalReadFileSync, fsSync, [
            targetPath,
            ...args,
          ]);
        } finally {
          fsSync.writeFileSync(sourcePath, source, "utf8");
        }
      }
      return Reflect.apply(originalReadFileSync, fsSync, [targetPath, ...args]);
    }) as typeof fsSync.readFileSync);

    try {
      await expect(
        withCatalogInputTracking(repoRoot, inventory, () =>
          extractDeprecations(repoRoot, [fixturePackage()], new Set()),
        ),
      ).rejects.toThrow(
        /Tracked deprecation TypeScript read failed.*input changed after inventory/su,
      );
      expect(injected).toBe(true);
    } finally {
      readSpy.mockRestore();
      await fs.writeFile(sourcePath, source, "utf8");
    }
  });

  it("rejects ambiguous public subjects instead of selecting one export origin", async () => {
    const repoRoot = await createPackageFixture({
      "src/First.ts": `/** @deprecated Use {@link ModernThing} instead. */
export const LegacyThing = 1;
export const ModernThing = 2;
`,
      "src/Second.ts": "export const LegacyThing = 3;\n",
      "src/index.ts": 'export * from "./First";\nexport * from "./Second";\n',
    });

    await expect(
      extractDeprecations(repoRoot, [fixturePackage()], new Set()),
    ).rejects.toThrow(
      /TS2308.*already exported a member named ['"]LegacyThing['"]/su,
    );
  });
});
