import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  assertUniquePackageValueExportOrigin,
  buildPackageValueExportGraph,
  resolveUniquePackageTypeExport,
  resolveUniquePackageValueExport,
} from "../build/catalogExportGraph.js";

const temporaryDirectories: string[] = [];

async function createFixture(
  files: Readonly<Record<string, string>>,
): Promise<string> {
  const repoRoot = await fs.mkdtemp(
    path.join(os.tmpdir(), "salt-export-graph-"),
  );
  temporaryDirectories.push(repoRoot);
  for (const [relativePath, content] of Object.entries(files)) {
    const absolutePath = path.join(repoRoot, relativePath);
    await fs.mkdir(path.dirname(absolutePath), { recursive: true });
    await fs.writeFile(absolutePath, content, "utf8");
  }
  return repoRoot;
}

afterEach(async () => {
  await Promise.all(
    temporaryDirectories
      .splice(0, temporaryDirectories.length)
      .map((directory) => fs.rm(directory, { recursive: true, force: true })),
  );
});

describe("catalog TypeScript value-export graph", () => {
  it("ignores opaque imported assets unless their binding is publicly re-exported", async () => {
    const repoRoot = await createFixture({
      "packages/fixture/src/index.ts": 'export * from "./Button";',
      "packages/fixture/src/Button.tsx": [
        'import buttonCss from "./Button.css";',
        "void buttonCss;",
        "export const Button = 1;",
      ].join("\n"),
      "packages/fixture/src/Button.css": ".fixture {}",
    });

    const graph = await buildPackageValueExportGraph(
      repoRoot,
      "@salt-ds/fixture",
    );
    expect(resolveUniquePackageValueExport(graph, "Button")).toBe(
      "packages/fixture/src/Button.tsx",
    );

    const exportedAssetRoot = await createFixture({
      "packages/fixture/src/index.ts": 'export * from "./Button";',
      "packages/fixture/src/Button.tsx": [
        'import buttonCss from "./Button.css";',
        "export { buttonCss };",
      ].join("\n"),
      "packages/fixture/src/Button.css": ".fixture {}",
    });
    await expect(
      buildPackageValueExportGraph(exportedAssetRoot, "@salt-ds/fixture"),
    ).rejects.toThrow(/cannot resolve '\.\/Button\.css'/u);
  });

  it("fails closed when import-equals bindings reach the public graph", async () => {
    const repoRoot = await createFixture({
      "packages/fixture/src/index.ts": [
        'import Fixture = require("./Fixture");',
        "export { Fixture };",
      ].join("\n"),
      "packages/fixture/src/Fixture.ts": "export const value = 1;",
    });

    await expect(
      buildPackageValueExportGraph(repoRoot, "@salt-ds/fixture"),
    ).rejects.toThrow(/cannot represent re-exported import-equals binding/u);

    const exportEqualsRoot = await createFixture({
      "packages/fixture/src/index.cts": [
        'import Fixture = require("./Fixture");',
        "export = Fixture;",
      ].join("\n"),
      "packages/fixture/src/Fixture.cts": "export const value = 1;",
    });
    await expect(
      buildPackageValueExportGraph(exportEqualsRoot, "@salt-ds/fixture", {
        entrypoint: "packages/fixture/src/index.cts",
      }),
    ).rejects.toThrow(/cannot represent export-equals assignments/u);
  });

  it("resolves direct, aliased, star, default, and imported-local value origins", async () => {
    const repoRoot = await createFixture({
      "packages/fixture/src/index.ts": [
        'export { Direct } from "./direct";',
        'export { Original as Alias } from "./alias";',
        'export * from "./star";',
        'export { Explicit } from "./explicit";',
        'export * from "./also-explicit";',
        'import { Imported } from "./imported";',
        "export { Imported as ImportedAgain };",
        'export { default as DefaultAlias } from "./default";',
        'export { JsMapped } from "./js-mapped.js";',
        'export * as Namespace from "./namespace";',
        'export { RuntimeEnum, AmbientValue, AmbientClass, AmbientFunction, ConstEnum } from "./declarations";',
        'export type { TypeOnly } from "./types";',
        'import type { TypeOnlyImported } from "./types";',
        "export { TypeOnlyImported };",
        'export * from "./ambiguous-a";',
        'export * from "./ambiguous-b";',
      ].join("\n"),
      "packages/fixture/src/direct.ts":
        'import { css } from "@salt-ds/styles";\nexport const Direct = css;',
      "packages/fixture/src/alias.ts": "export const Original = 1;",
      "packages/fixture/src/star.ts":
        "export const Starred = 1;\nexport default 2;",
      "packages/fixture/src/explicit.ts": "export const Explicit = 1;",
      "packages/fixture/src/also-explicit.ts":
        "export const Explicit = 2;\nexport const StarOnly = 3;",
      "packages/fixture/src/imported.ts": "export const Imported = 1;",
      "packages/fixture/src/default.ts":
        "export default class FixtureDefault {}",
      "packages/fixture/src/js-mapped.ts": "export const JsMapped = 1;",
      "packages/fixture/src/namespace.ts": "export const Namespaced = 1;",
      "packages/fixture/src/declarations.ts": [
        "export enum RuntimeEnum { Value }",
        "export declare const AmbientValue: string;",
        "export declare class AmbientClass {}",
        "export declare function AmbientFunction(): void;",
        "export const enum ConstEnum { Value }",
      ].join("\n"),
      "packages/fixture/src/types.ts": [
        "export type TypeOnly = string;",
        "export interface TypeOnlyImported { value: string }",
      ].join("\n"),
      "packages/fixture/src/ambiguous-a.ts": "export const Ambiguous = 1;",
      "packages/fixture/src/ambiguous-b.ts": "export const Ambiguous = 2;",
    });

    const graph = await buildPackageValueExportGraph(
      repoRoot,
      "@salt-ds/fixture",
    );
    expect(resolveUniquePackageValueExport(graph, "Direct")).toBe(
      "packages/fixture/src/direct.ts",
    );
    expect(resolveUniquePackageValueExport(graph, "Alias")).toBe(
      "packages/fixture/src/alias.ts",
    );
    expect(graph.valueExportOrigins.get("Alias")).toEqual([
      {
        repoPath: "packages/fixture/src/alias.ts",
        declarationName: "Original",
        declarationKey: "value:Original",
      },
    ]);
    expect(resolveUniquePackageValueExport(graph, "Starred")).toBe(
      "packages/fixture/src/star.ts",
    );
    expect(resolveUniquePackageValueExport(graph, "Explicit")).toBe(
      "packages/fixture/src/explicit.ts",
    );
    expect(resolveUniquePackageValueExport(graph, "StarOnly")).toBe(
      "packages/fixture/src/also-explicit.ts",
    );
    expect(resolveUniquePackageValueExport(graph, "ImportedAgain")).toBe(
      "packages/fixture/src/imported.ts",
    );
    expect(resolveUniquePackageValueExport(graph, "DefaultAlias")).toBe(
      "packages/fixture/src/default.ts",
    );
    expect(graph.valueExportOrigins.get("DefaultAlias")).toEqual([
      {
        repoPath: "packages/fixture/src/default.ts",
        declarationName: "FixtureDefault",
        declarationKey: "dual:FixtureDefault",
      },
    ]);
    expect(graph.typeExportOrigins.get("DefaultAlias")).toEqual([
      {
        repoPath: "packages/fixture/src/default.ts",
        declarationName: "FixtureDefault",
        declarationKey: "dual:FixtureDefault",
      },
    ]);
    expect(resolveUniquePackageValueExport(graph, "JsMapped")).toBe(
      "packages/fixture/src/js-mapped.ts",
    );
    expect(resolveUniquePackageValueExport(graph, "Namespace")).toBe(
      "packages/fixture/src/namespace.ts",
    );
    expect(resolveUniquePackageValueExport(graph, "RuntimeEnum")).toBe(
      "packages/fixture/src/declarations.ts",
    );
    expect(resolveUniquePackageTypeExport(graph, "RuntimeEnum")).toBe(
      "packages/fixture/src/declarations.ts",
    );
    expect(resolveUniquePackageValueExport(graph, "AmbientValue")).toBe(
      "packages/fixture/src/declarations.ts",
    );
    expect(resolveUniquePackageValueExport(graph, "AmbientClass")).toBe(
      "packages/fixture/src/declarations.ts",
    );
    expect(resolveUniquePackageTypeExport(graph, "AmbientClass")).toBe(
      "packages/fixture/src/declarations.ts",
    );
    expect(resolveUniquePackageValueExport(graph, "AmbientFunction")).toBe(
      "packages/fixture/src/declarations.ts",
    );
    expect(resolveUniquePackageTypeExport(graph, "TypeOnly")).toBe(
      "packages/fixture/src/types.ts",
    );
    expect(resolveUniquePackageTypeExport(graph, "TypeOnlyImported")).toBe(
      "packages/fixture/src/types.ts",
    );
    expect(graph.valueExports.has("default")).toBe(false);
    expect(graph.valueExports.has("TypeOnly")).toBe(false);
    expect(graph.valueExports.has("TypeOnlyImported")).toBe(false);
    expect(graph.valueExports.has("ConstEnum")).toBe(false);
    expect(graph.typeExports.has("Direct")).toBe(false);
  });

  it("resolves value and type exports from an explicit public subpath entrypoint", async () => {
    const repoRoot = await createFixture({
      "packages/fixture/src/index.ts": "export const RootOnly = 1;",
      "packages/fixture/src/moment.ts": [
        'export { AdapterMoment } from "./moment-adapter";',
        'export type { MomentOptions } from "./moment-adapter";',
      ].join("\n"),
      "packages/fixture/src/moment-adapter.ts": [
        "export class AdapterMoment {}",
        "export interface MomentOptions { strict: boolean }",
      ].join("\n"),
    });

    const graph = await buildPackageValueExportGraph(
      repoRoot,
      "@salt-ds/fixture",
      { entrypoint: "packages/fixture/src/moment.ts" },
    );

    expect(resolveUniquePackageValueExport(graph, "AdapterMoment")).toBe(
      "packages/fixture/src/moment-adapter.ts",
    );
    expect(resolveUniquePackageTypeExport(graph, "AdapterMoment")).toBe(
      "packages/fixture/src/moment-adapter.ts",
    );
    expect(resolveUniquePackageTypeExport(graph, "MomentOptions")).toBe(
      "packages/fixture/src/moment-adapter.ts",
    );
    expect(graph.valueExports.has("RootOnly")).toBe(false);
  });

  it("preserves the type space of a directly declared public namespace", async () => {
    const repoRoot = await createFixture({
      "packages/fixture/src/index.ts": [
        'export type { FixtureNamespace } from "./namespace";',
        'export { FixtureValueNamespace } from "./namespace";',
      ].join("\n"),
      "packages/fixture/src/namespace.ts": [
        "export namespace FixtureNamespace { export type Value = string; }",
        "export namespace FixtureValueNamespace { export const value = 1; }",
      ].join("\n"),
    });

    const graph = await buildPackageValueExportGraph(
      repoRoot,
      "@salt-ds/fixture",
    );

    expect(resolveUniquePackageTypeExport(graph, "FixtureNamespace")).toBe(
      "packages/fixture/src/namespace.ts",
    );
    expect(graph.valueExports.has("FixtureNamespace")).toBe(false);
    expect(
      resolveUniquePackageValueExport(graph, "FixtureValueNamespace"),
    ).toBe("packages/fixture/src/namespace.ts");
    expect(resolveUniquePackageTypeExport(graph, "FixtureValueNamespace")).toBe(
      "packages/fixture/src/namespace.ts",
    );
  });

  it.each([
    "packages/other/src/index.ts",
    "packages/fixture/src/../src/index.ts",
    "packages\\fixture\\src\\index.ts",
    "packages/fixture/src/catalog.json",
  ])("rejects a noncanonical or cross-package entrypoint: %s", async (entrypoint) => {
    const repoRoot = await createFixture({
      "packages/fixture/src/index.ts": "export const Fixture = 1;",
      "packages/other/src/index.ts": "export const Other = 1;",
    });

    await expect(
      buildPackageValueExportGraph(repoRoot, "@salt-ds/fixture", {
        entrypoint,
      }),
    ).rejects.toThrow(/canonical portable path beneath/u);
  });

  it("rejects a wrong-case entrypoint spelling on case-insensitive filesystems", async () => {
    if (process.platform !== "win32") return;
    const repoRoot = await createFixture({
      "packages/fixture/src/index.ts": "export const Fixture = 1;",
    });

    await expect(
      buildPackageValueExportGraph(repoRoot, "@salt-ds/fixture", {
        entrypoint: "packages/fixture/src/Index.ts",
      }),
    ).rejects.toThrow(/nested link/u);
  });

  it.each([
    'export { Fixture } from ".\\\\fixture";',
    'export { Fixture } from "./../src/fixture";',
  ])("rejects a noncanonical relative module specifier", async (source) => {
    const repoRoot = await createFixture({
      "packages/fixture/src/index.ts": source,
      "packages/fixture/src/fixture.ts": "export const Fixture = 1;",
    });

    await expect(
      buildPackageValueExportGraph(repoRoot, "@salt-ds/fixture"),
    ).rejects.toThrow(/canonical portable relative module specifier/u);
  });

  it("does not reinterpret a dot-prefixed bare module as a relative path", async () => {
    const repoRoot = await createFixture({
      "packages/fixture/src/index.ts": 'export { Fixture } from ".fixture";',
      "packages/fixture/src/.fixture.ts": "export const Fixture = 1;",
    });

    await expect(
      buildPackageValueExportGraph(repoRoot, "@salt-ds/fixture"),
    ).rejects.toThrow(/non-relative re-export '\.fixture'/u);
  });

  it.each([
    {
      specifier: "../internal",
      target: "packages/fixture/internal.ts",
    },
    {
      specifier: "../../other/src/other",
      target: "packages/other/src/other.ts",
    },
  ])("rejects a module outside the labeled package source root", async ({
    specifier,
    target,
  }) => {
    const repoRoot = await createFixture({
      "packages/fixture/src/index.ts": `export { Other } from "${specifier}";`,
      [target]: "export const Other = 1;",
    });

    await expect(
      buildPackageValueExportGraph(repoRoot, "@salt-ds/fixture"),
    ).rejects.toThrow(/escapes package source root/u);
  });

  it("follows imported default forwarding to the original value and type leaf", async () => {
    const repoRoot = await createFixture({
      "packages/fixture/src/index.ts":
        'export { default as PublicDefault } from "./forward";',
      "packages/fixture/src/forward.ts": [
        'import Internal from "./leaf";',
        "export default Internal;",
      ].join("\n"),
      "packages/fixture/src/leaf.ts": "export default class Internal {}",
    });

    const graph = await buildPackageValueExportGraph(
      repoRoot,
      "@salt-ds/fixture",
    );
    const expectedOrigin = {
      repoPath: "packages/fixture/src/leaf.ts",
      declarationName: "Internal",
      declarationKey: "dual:Internal",
    };
    expect(graph.valueExportOrigins.get("PublicDefault")).toEqual([
      expectedOrigin,
    ]);
    expect(graph.typeExportOrigins.get("PublicDefault")).toEqual([
      expectedOrigin,
    ]);
  });

  it("keeps separate same-named value and type declarations as different leaves", async () => {
    const repoRoot = await createFixture({
      "packages/fixture/src/index.ts": 'export * from "./leaf";',
      "packages/fixture/src/leaf.ts": [
        "export const Shared = 1;",
        "export type Shared = string;",
      ].join("\n"),
    });

    const graph = await buildPackageValueExportGraph(
      repoRoot,
      "@salt-ds/fixture",
    );
    expect(graph.valueExportOrigins.get("Shared")).toEqual([
      {
        repoPath: "packages/fixture/src/leaf.ts",
        declarationName: "Shared",
        declarationKey: "value:Shared",
      },
    ]);
    expect(graph.typeExportOrigins.get("Shared")).toEqual([
      {
        repoPath: "packages/fixture/src/leaf.ts",
        declarationName: "Shared",
        declarationKey: "type:Shared",
      },
    ]);
  });

  it("uses TypeScript declaration-file substitutions for public re-exports", async () => {
    const repoRoot = await createFixture({
      "packages/fixture/src/index.ts": [
        'export { Runtime } from "./runtime.js";',
        'export type { Declared } from "./declared.js";',
        'export type { ModuleType } from "./module.mjs";',
        'export type { CommonType } from "./common.cjs";',
        'export type { DirectoryType } from "./directory";',
      ].join("\n"),
      "packages/fixture/src/runtime.d.ts": "export class Runtime {}",
      "packages/fixture/src/declared.d.ts":
        "export interface Declared { value: string }",
      "packages/fixture/src/module.d.mts":
        "export interface ModuleType { value: string }",
      "packages/fixture/src/common.d.cts":
        "export interface CommonType { value: string }",
      "packages/fixture/src/directory/index.d.ts":
        "export interface DirectoryType { value: string }",
    });

    const graph = await buildPackageValueExportGraph(
      repoRoot,
      "@salt-ds/fixture",
    );

    expect(resolveUniquePackageValueExport(graph, "Runtime")).toBe(
      "packages/fixture/src/runtime.d.ts",
    );
    expect(resolveUniquePackageTypeExport(graph, "Declared")).toBe(
      "packages/fixture/src/declared.d.ts",
    );
    expect(resolveUniquePackageTypeExport(graph, "ModuleType")).toBe(
      "packages/fixture/src/module.d.mts",
    );
    expect(resolveUniquePackageTypeExport(graph, "CommonType")).toBe(
      "packages/fixture/src/common.d.cts",
    );
    expect(resolveUniquePackageTypeExport(graph, "DirectoryType")).toBe(
      "packages/fixture/src/directory/index.d.ts",
    );
  });

  it("fails closed for missing and genuinely ambiguous public values", async () => {
    const repoRoot = await createFixture({
      "packages/fixture/src/index.ts": [
        'export * from "./left";',
        'export * from "./right";',
      ].join("\n"),
      "packages/fixture/src/left.ts": "export const Collision = 1;",
      "packages/fixture/src/right.ts": "export const Collision = 2;",
    });
    const graph = await buildPackageValueExportGraph(
      repoRoot,
      "@salt-ds/fixture",
    );
    expect(() => resolveUniquePackageValueExport(graph, "Collision")).toThrow(
      /ambiguous/u,
    );
    expect(() => resolveUniquePackageValueExport(graph, "Missing")).toThrow(
      /missing/u,
    );
  });

  it("requires the unique public value to originate from the expected file", async () => {
    const repoRoot = await createFixture({
      "packages/fixture/src/index.ts":
        'export { Actual as Public } from "./actual";',
      "packages/fixture/src/actual.ts": "export const Actual = 1;",
    });
    const graph = await buildPackageValueExportGraph(
      repoRoot,
      "@salt-ds/fixture",
    );

    expect(
      assertUniquePackageValueExportOrigin(
        graph,
        "Public",
        "packages/fixture/src/actual.ts",
      ),
    ).toBe("packages/fixture/src/actual.ts");
    expect(() =>
      assertUniquePackageValueExportOrigin(
        graph,
        "Public",
        "packages/fixture/src/other.ts",
      ),
    ).toThrow(/Public.*@salt-ds\/fixture.*actual\.ts.*expected.*other\.ts/iu);
  });

  it("rejects direct non-relative re-exports instead of inventing an origin", async () => {
    const repoRoot = await createFixture({
      "packages/fixture/src/index.ts":
        'export { External } from "@external/package";',
    });
    await expect(
      buildPackageValueExportGraph(repoRoot, "@salt-ds/fixture"),
    ).rejects.toThrow(/cannot follow non-relative re-export/u);
  });

  it("rejects an imported external binding only when it becomes public", async () => {
    const repoRoot = await createFixture({
      "packages/fixture/src/index.ts": [
        'import { External } from "@external/package";',
        "export { External };",
      ].join("\n"),
    });
    await expect(
      buildPackageValueExportGraph(repoRoot, "@salt-ds/fixture"),
    ).rejects.toThrow(/cannot follow non-relative re-export/u);
  });

  it("fails closed when a public export module has parse diagnostics", async () => {
    const repoRoot = await createFixture({
      "packages/fixture/src/index.ts": 'export { PublicValue from "./leaf";',
      "packages/fixture/src/leaf.ts": "export const PublicValue = 1;",
    });

    await expect(
      buildPackageValueExportGraph(repoRoot, "@salt-ds/fixture"),
    ).rejects.toThrow(/cannot parse.*index\.ts.*TS\d+/su);
  });

  it("deduplicates diamond and cyclic star paths to the same runtime origin", async () => {
    const repoRoot = await createFixture({
      "packages/fixture/src/index.ts": [
        'export * from "./left";',
        'export * from "./right";',
        'export * from "./cycle-a";',
      ].join("\n"),
      "packages/fixture/src/left.ts": 'export * from "./leaf";',
      "packages/fixture/src/right.ts": 'export * from "./leaf";',
      "packages/fixture/src/leaf.ts": "export const Diamond = 1;",
      "packages/fixture/src/cycle-a.ts": [
        "export const Cyclic = 1;",
        'export * from "./cycle-b";',
      ].join("\n"),
      "packages/fixture/src/cycle-b.ts": 'export * from "./cycle-a";',
    });
    const graph = await buildPackageValueExportGraph(
      repoRoot,
      "@salt-ds/fixture",
    );
    expect(graph.valueExports.get("Diamond")).toEqual([
      "packages/fixture/src/leaf.ts",
    ]);
    expect(graph.valueExports.get("Cyclic")).toEqual([
      "packages/fixture/src/cycle-a.ts",
    ]);
  });

  it("rejects module resolution outside the repository root", async () => {
    const repoRoot = await createFixture({
      "packages/fixture/src/index.ts": 'export * from "../../../../outside";',
    });
    await expect(
      buildPackageValueExportGraph(repoRoot, "@salt-ds/fixture"),
    ).rejects.toThrow(/escapes the repository/u);
  });

  it("rejects a nested linked directory beneath the package source root", async () => {
    const repoRoot = await createFixture({
      "packages/fixture/src/index.ts": 'export * from "./linked/leaf";',
    });
    const externalRoot = await fs.mkdtemp(
      path.join(os.tmpdir(), "salt-export-graph-external-"),
    );
    temporaryDirectories.push(externalRoot);
    await fs.writeFile(
      path.join(externalRoot, "leaf.ts"),
      "export const Escaped = 1;",
      "utf8",
    );
    await fs.symlink(
      externalRoot,
      path.join(repoRoot, "packages/fixture/src/linked"),
      process.platform === "win32" ? "junction" : "dir",
    );

    await expect(
      buildPackageValueExportGraph(repoRoot, "@salt-ds/fixture"),
    ).rejects.toThrow(/nested link|escapes package source root/u);
  });
});
