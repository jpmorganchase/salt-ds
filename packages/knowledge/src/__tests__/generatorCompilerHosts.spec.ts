import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import ts from "typescript";
import { afterEach, describe, expect, it } from "vitest";
import { createTrackedDeprecationCompilerHost } from "../build/buildRegistryDeprecations.js";
import {
  createTrackedDocgenCompilerHost,
  DOCGEN_PACKAGES,
  loadPropMetadata,
  toComponentProps,
} from "../build/buildRegistryDocgen.js";
import {
  createCatalogInputInventory,
  withCatalogInputTracking,
} from "../build/catalogInputInventory.js";
import {
  type GeneratorDependencyInventory,
  withGeneratorDependencyInventory,
} from "../build/generatorDependencyInventory.js";
import { canonicalJson, sha256Bytes } from "../catalog/catalogSerialization.js";

const temporaryDirectories: string[] = [];

function sealDependencyInventory(
  entries: GeneratorDependencyInventory["entries"],
): GeneratorDependencyInventory {
  const payload = {
    schema_version: "1.0.0" as const,
    entries,
  };
  return {
    ...payload,
    digest: sha256Bytes(canonicalJson(payload)),
  };
}

afterEach(async () => {
  await Promise.all(
    temporaryDirectories
      .splice(0, temporaryDirectories.length)
      .map((directory) => fs.rm(directory, { recursive: true, force: true })),
  );
});

describe.sequential("sealed TypeScript compiler hosts", () => {
  // Two full docgen passes verify correctness, not a five-second performance limit.
  it("extracts workspace source props regardless of built declarations", async () => {
    const repoRoot = await fs.mkdtemp(
      path.join(os.tmpdir(), "salt-docgen-source-"),
    );
    temporaryDirectories.push(repoRoot);
    const paths: Record<string, string[]> = {};
    for (const { directory, packageName } of DOCGEN_PACKAGES) {
      const packageRoot = path.join(repoRoot, "packages", directory);
      await fs.mkdir(path.join(packageRoot, "src"), { recursive: true });
      paths[packageName] = [`./packages/${directory}/src/index.ts`];
      await fs.writeFile(
        path.join(packageRoot, "package.json"),
        JSON.stringify({
          name: packageName,
          main: "src/index.ts",
          typings: "dist-types/index.d.ts",
        }),
      );
      await fs.writeFile(
        path.join(packageRoot, "src/index.ts"),
        directory === "lab"
          ? 'import type { SourceProps } from "@salt-ds/core"; export function Fixture(props: SourceProps) { return null; }'
          : "export interface SourceProps { sourceLabel?: string; } export function Fixture(props: SourceProps) { return null; }",
      );
    }
    await fs.writeFile(
      path.join(repoRoot, "tsconfig.json"),
      JSON.stringify({ compilerOptions: { paths } }),
    );
    const scopeRoot = path.join(repoRoot, "node_modules/@salt-ds");
    await fs.mkdir(scopeRoot, { recursive: true });
    await fs.symlink(
      path.join(repoRoot, "packages/core"),
      path.join(scopeRoot, "core"),
      process.platform === "win32" ? "junction" : "dir",
    );
    const sourceInventory = await createCatalogInputInventory(repoRoot, [
      "tsconfig.json",
      "packages/*/package.json",
      "packages/*/src/**/*.ts",
    ]);
    const extractProps = () =>
      withCatalogInputTracking(repoRoot, sourceInventory, async () => {
        const metadata = await loadPropMetadata(repoRoot);
        return toComponentProps(
          metadata.byPackage.get("@salt-ds/lab")?.get("fixture")?.[0].props,
        );
      });
    const sourceProps = await extractProps();

    const builtDirectory = path.join(repoRoot, "packages/core/dist-types");
    await fs.mkdir(builtDirectory, { recursive: true });
    await fs.writeFile(
      path.join(builtDirectory, "index.d.ts"),
      "export interface SourceProps { staleBuiltLabel: number; }",
    );
    expect(await extractProps()).toEqual(sourceProps);
    expect(sourceProps).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "sourceLabel" }),
      ]),
    );
  }, 20_000);

  it("uses captured workspace links, hides ambient dependencies, and fails on topology drift", async () => {
    const repoRoot = await fs.mkdtemp(
      path.join(os.tmpdir(), "salt-generator-hosts-"),
    );
    temporaryDirectories.push(repoRoot);
    const capturedRoot = path.join(repoRoot, "packages", "captured");
    const ambientRoot = path.join(repoRoot, "packages", "ambient");
    const capturedFile = path.join(capturedRoot, "src", "index.ts");
    const ambientFile = path.join(ambientRoot, "src", "index.ts");
    const scopeRoot = path.join(repoRoot, "node_modules", "@fixture");
    const workspaceLink = path.join(scopeRoot, "captured");
    const linkedFile = path.join(workspaceLink, "src", "index.ts");
    const undeclaredFile = path.join(
      repoRoot,
      "node_modules",
      "ambient-dependency",
      "index.d.ts",
    );
    await fs.mkdir(path.dirname(capturedFile), { recursive: true });
    await fs.mkdir(path.dirname(ambientFile), { recursive: true });
    await fs.mkdir(scopeRoot, { recursive: true });
    await fs.mkdir(path.dirname(undeclaredFile), { recursive: true });
    await fs.writeFile(capturedFile, "export const identity = 'captured';\n");
    await fs.writeFile(ambientFile, "export const identity = 'ambient';\n");
    await fs.writeFile(undeclaredFile, "export declare const ambient: true;\n");
    await fs.symlink(
      capturedRoot,
      workspaceLink,
      process.platform === "win32" ? "junction" : "dir",
    );

    const sourceInventory = await createCatalogInputInventory(repoRoot, [
      "packages/captured/src/**/*.ts",
    ]);
    const dependencyInventory = sealDependencyInventory([
      { kind: "directory", path: "node_modules" },
      { kind: "directory", path: "node_modules/@fixture" },
      {
        kind: "link",
        path: "node_modules/@fixture/captured",
        raw_target: "packages/captured",
        target: "packages/captured",
      },
    ]);
    const compilerOptions: ts.CompilerOptions = {
      module: ts.ModuleKind.NodeNext,
      moduleResolution: ts.ModuleResolutionKind.NodeNext,
      target: ts.ScriptTarget.ES2022,
      types: [],
    };

    await withGeneratorDependencyInventory(
      repoRoot,
      dependencyInventory,
      async () =>
        withCatalogInputTracking(repoRoot, sourceInventory, async () => {
          const docgenHost = createTrackedDocgenCompilerHost(repoRoot);
          const deprecationHost = createTrackedDeprecationCompilerHost(
            repoRoot,
            compilerOptions,
          ).host;
          for (const host of [docgenHost, deprecationHost]) {
            expect(host.readFile(linkedFile)).toContain("captured");
            expect(host.readFile(undeclaredFile)).toBeUndefined();
            expect(() => host.readFile(ambientFile)).toThrow(
              /undeclared input read/u,
            );
            expect(
              host.readDirectory?.(path.dirname(undeclaredFile), [], [], [], 0),
            ).toEqual([]);
            expect(host.getDirectories?.(path.dirname(undeclaredFile))).toEqual(
              [],
            );
          }

          await fs.unlink(workspaceLink);
          await fs.symlink(
            ambientRoot,
            workspaceLink,
            process.platform === "win32" ? "junction" : "dir",
          );
          expect(() => docgenHost.readFile(linkedFile)).toThrow(
            /link topology changed/u,
          );
          expect(() => deprecationHost.readFile(linkedFile)).toThrow(
            /link topology changed/u,
          );
        }),
    );
  });
});
