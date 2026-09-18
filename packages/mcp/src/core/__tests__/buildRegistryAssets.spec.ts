import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  extractCountrySymbols,
  extractIcons,
} from "../build/buildRegistryAssets.js";
import type { DeprecationRecord, PackageRecord } from "../types.js";

const temporaryDirectories: string[] = [];
async function createFixture(
  files: Readonly<Record<string, string>>,
): Promise<string> {
  const repoRoot = await fs.mkdtemp(
    path.join(os.tmpdir(), "salt-registry-assets-"),
  );
  temporaryDirectories.push(repoRoot);
  for (const [relativePath, content] of Object.entries(files)) {
    const absolutePath = path.join(repoRoot, relativePath);
    await fs.mkdir(path.dirname(absolutePath), { recursive: true });
    await fs.writeFile(absolutePath, content, "utf8");
  }
  return repoRoot;
}

function packageMap(...names: string[]): Map<string, PackageRecord> {
  return new Map(
    names.map((name) => [
      name,
      {
        id: `package.${name.slice("@salt-ds/".length)}`,
        name,
        status: "stable",
        version: "1.0.0",
        summary: "",
        source_root: `packages/${name.slice("@salt-ds/".length)}/src`,
        changelog_path: null,
        docs_root: null,
      },
    ]),
  );
}

afterEach(async () => {
  await Promise.all(
    temporaryDirectories
      .splice(0, temporaryDirectories.length)
      .map((directory) => fs.rm(directory, { recursive: true, force: true })),
  );
});

describe("registry asset public export validation", () => {
  it("accepts direct, star, default-as-named, and hyphenated country exports with exact origins", async () => {
    const repoRoot = await createFixture({
      "packages/icons/src/index.ts": [
        'export { AddIcon } from "./components/Add";',
        'export * from "./components/Search";',
        'export { default as DefaultIcon } from "./components/Default";',
      ].join("\n"),
      "packages/icons/src/components/Add.tsx":
        "export const AddIcon = () => null;",
      "packages/icons/src/components/Search.tsx":
        "export const SearchIcon = () => null;",
      "packages/icons/src/components/Default.tsx":
        "export default function DefaultIcon() { return null; }",
      "packages/countries/src/index.ts": 'export * from "./components";',
      "packages/countries/src/components/index.ts": [
        'export { default as GB_ENG } from "./GB-ENG";',
        'export { default as GB_ENG_Sharp } from "./GB-ENG_Sharp";',
      ].join("\n"),
      "packages/countries/src/components/GB-ENG.tsx":
        "export default function England() { return null; }",
      "packages/countries/src/components/GB-ENG_Sharp.tsx":
        "export default function EnglandSharp() { return null; }",
      "packages/countries/src/countryMetaMap.ts":
        '"GB-ENG": { countryCode: "GB-ENG", countryName: "England" },',
    });

    const icons = await extractIcons(
      repoRoot,
      packageMap("@salt-ds/icons"),
      [],
    );
    expect(icons.map((icon) => [icon.name, icon.source.repo_path])).toEqual([
      ["AddIcon", "packages/icons/src/components/Add.tsx"],
      ["DefaultIcon", "packages/icons/src/components/Default.tsx"],
      ["SearchIcon", "packages/icons/src/components/Search.tsx"],
    ]);

    const countries = await extractCountrySymbols(
      repoRoot,
      packageMap("@salt-ds/countries"),
      [],
    );
    expect(countries).toHaveLength(1);
    expect(countries[0]?.variants).toEqual({
      circle: {
        export_name: "GB_ENG",
        repo_path: "packages/countries/src/components/GB-ENG.tsx",
      },
      sharp: {
        export_name: "GB_ENG_Sharp",
        repo_path: "packages/countries/src/components/GB-ENG_Sharp.tsx",
      },
    });
  });

  it("rejects an icon source file that is not publicly exported", async () => {
    const repoRoot = await createFixture({
      "packages/icons/src/index.ts": "export {};",
      "packages/icons/src/components/Add.tsx":
        "export const AddIcon = () => null;",
    });

    await expect(
      extractIcons(repoRoot, packageMap("@salt-ds/icons"), []),
    ).rejects.toThrow(/AddIcon.*missing.*@salt-ds\/icons/iu);
  });

  it("does not mark an asset deprecated from a same-named member deprecation", async () => {
    const repoRoot = await createFixture({
      "packages/icons/src/index.ts":
        'export { AddIcon } from "./components/Add";',
      "packages/icons/src/components/Add.tsx":
        "export const AddIcon = () => null;",
    });
    const methodDeprecation: DeprecationRecord = {
      id: "deprecation.fixture-method",
      subject: {
        package: "@salt-ds/icons",
        entrypoint: ".",
        export_name: "FixtureApi",
        symbol_space: "type",
        member_path: [{ kind: "method", name: "AddIcon" }],
      },
      package: "@salt-ds/icons",
      component: "AddIcon",
      kind: "method",
      name: "AddIcon",
      deprecated_in: null,
      removed_in: null,
      replacement: {
        mode: "none",
        target: null,
        targets: [],
        type: null,
        name: null,
        notes: null,
      },
      migration: {
        strategy: "manual",
        value_map: null,
        details: [],
      },
      source_paths: ["packages/icons/src/Fixture.ts"],
      source_occurrences: [
        {
          source_path: "packages/icons/src/Fixture.ts",
          source_range: {
            start_offset: 0,
            end_offset: 1,
            start_line: 1,
            start_column: 1,
            end_line: 1,
            end_column: 2,
          },
        },
      ],
      source_urls: [],
    };

    const [icon] = await extractIcons(repoRoot, packageMap("@salt-ds/icons"), [
      methodDeprecation,
    ]);
    expect(icon.status).toBe("stable");
  });

  it("rejects ambiguous and wrong-origin icon exports", async () => {
    const ambiguousRoot = await createFixture({
      "packages/icons/src/index.ts": [
        'export * from "./components/Add";',
        'export * from "./components/Other";',
      ].join("\n"),
      "packages/icons/src/components/Add.tsx":
        "export const AddIcon = () => null;",
      "packages/icons/src/components/Other.tsx":
        "export const AddIcon = () => null;",
    });
    await expect(
      extractIcons(ambiguousRoot, packageMap("@salt-ds/icons"), []),
    ).rejects.toThrow(/AddIcon.*ambiguous.*@salt-ds\/icons/iu);

    const wrongOriginRoot = await createFixture({
      "packages/icons/src/index.ts":
        'export { OtherIcon as AddIcon } from "./components/Other";',
      "packages/icons/src/components/Add.tsx":
        "export const AddIcon = () => null;",
      "packages/icons/src/components/Other.tsx":
        "export const OtherIcon = () => null;",
    });
    await expect(
      extractIcons(wrongOriginRoot, packageMap("@salt-ds/icons"), []),
    ).rejects.toThrow(/AddIcon.*Other\.tsx.*expected.*Add\.tsx/iu);
  });

  it("rejects a country variant that is absent from the public barrel", async () => {
    const repoRoot = await createFixture({
      "packages/countries/src/index.ts": 'export * from "./components";',
      "packages/countries/src/components/index.ts":
        'export { default as GB_ENG } from "./GB-ENG";',
      "packages/countries/src/components/GB-ENG.tsx":
        "export default function England() { return null; }",
      "packages/countries/src/components/GB-ENG_Sharp.tsx":
        "export default function EnglandSharp() { return null; }",
      "packages/countries/src/countryMetaMap.ts":
        '"GB-ENG": { countryCode: "GB-ENG", countryName: "England" },',
    });

    await expect(
      extractCountrySymbols(repoRoot, packageMap("@salt-ds/countries"), []),
    ).rejects.toThrow(/GB_ENG_Sharp.*missing.*@salt-ds\/countries/iu);
  });
});
