import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  type ProjectPolicyImportTargetInput,
  validateProjectPolicyImportTargets,
} from "../server/projectPolicyImports.js";

const tempDirs: string[] = [];

async function createTempDir(name: string): Promise<string> {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), `${name}-`));
  const resolvedDir = await fs.realpath(tempDir);
  tempDirs.push(resolvedDir);
  return resolvedDir;
}

function wrapperTarget(
  from: string,
  name = "AppButton",
): ProjectPolicyImportTargetInput {
  return {
    kind: "approved_wrapper",
    owner: "AppButton",
    from,
    name,
  };
}

afterEach(async () => {
  await Promise.all(
    tempDirs
      .splice(0, tempDirs.length)
      .map((dir) => fs.rm(dir, { recursive: true, force: true })),
  );
});

describe("project policy import target validation", () => {
  it("accepts local runtime values and existing theme side-effect imports", async () => {
    const rootDir = await createTempDir("salt-policy-import-valid");
    await fs.mkdir(path.join(rootDir, "src"), { recursive: true });
    await fs.writeFile(
      path.join(rootDir, "src", "AppButton.tsx"),
      "const LocalButton = () => null; export { LocalButton as AppButton };\n",
      "utf8",
    );
    await fs.writeFile(
      path.join(rootDir, "src", "brand.css"),
      ":root { --brand: blue; }\n",
      "utf8",
    );

    const diagnostics = await validateProjectPolicyImportTargets(rootDir, [
      wrapperTarget("./src/AppButton"),
      {
        kind: "theme_import",
        owner: "BrandProvider",
        from: "./src/brand.css",
        name: null,
      },
    ]);

    expect(diagnostics).toMatchObject({
      status: "ready",
      declared_count: 2,
      resolved_count: 2,
      blocking_count: 0,
    });
  });

  it.each([
    ["AppButton.d.ts", "export declare const AppButton: () => null;\n"],
    ["AppButton.ts", "export declare const AppButton: () => null;\n"],
    ["AppButton.ts", "export const enum AppButton { Primary }\n"],
    ["AppButton.ts", "export type AppButton = () => null;\n"],
  ])("rejects declaration-only runtime target %s", async (fileName, source) => {
    const rootDir = await createTempDir("salt-policy-import-declaration");
    await fs.mkdir(path.join(rootDir, "src"), { recursive: true });
    await fs.writeFile(path.join(rootDir, "src", fileName), source, "utf8");

    const diagnostics = await validateProjectPolicyImportTargets(rootDir, [
      wrapperTarget(`./src/${fileName}`),
    ]);

    expect(diagnostics.status).toBe("blocked");
    expect(diagnostics.resolved_count).toBe(0);
    expect(diagnostics.targets[0]?.status).not.toBe("resolved");
  });

  it("blocks missing theme imports and paths that leave the declared root", async () => {
    const rootDir = await createTempDir("salt-policy-import-root");
    const outsideDir = await createTempDir("salt-policy-import-outside");
    await fs.writeFile(
      path.join(outsideDir, "AppButton.ts"),
      "export const AppButton = () => null;\n",
      "utf8",
    );
    const outsideSpecifier = path.relative(
      rootDir,
      path.join(outsideDir, "AppButton"),
    );

    const diagnostics = await validateProjectPolicyImportTargets(rootDir, [
      wrapperTarget(
        outsideSpecifier.startsWith(".")
          ? outsideSpecifier
          : `.${path.sep}${outsideSpecifier}`,
      ),
      {
        kind: "theme_import",
        owner: "BrandProvider",
        from: "./src/missing.css",
        name: null,
      },
    ]);

    expect(diagnostics).toMatchObject({
      status: "blocked",
      resolved_count: 0,
      blocking_count: 2,
      targets: [
        expect.objectContaining({
          status: "unsupported",
          reason: expect.stringContaining("leaves the declared root_dir"),
        }),
        expect.objectContaining({ status: "missing_module" }),
      ],
    });
  });

  it("bounds inspected policy targets and total possible parse input", async () => {
    const rootDir = await createTempDir("salt-policy-import-bounds");
    await fs.mkdir(path.join(rootDir, "src"), { recursive: true });
    await fs.writeFile(
      path.join(rootDir, "src", "AppButton.tsx"),
      "export function AppButton() { return null; }\n",
      "utf8",
    );

    const diagnostics = await validateProjectPolicyImportTargets(
      rootDir,
      Array.from({ length: 17 }, () => wrapperTarget("./src/AppButton")),
    );

    expect(diagnostics).toMatchObject({
      status: "blocked",
      declared_count: 17,
      resolved_count: 16,
      blocking_reasons: expect.arrayContaining([
        expect.stringContaining("bounded inspection limit of 16"),
      ]),
    });
    expect(diagnostics.targets).toHaveLength(16);
  });

  it("rejects individual modules above the bounded parse limit", async () => {
    const rootDir = await createTempDir("salt-policy-import-module-size");
    await fs.mkdir(path.join(rootDir, "src"), { recursive: true });
    await fs.writeFile(
      path.join(rootDir, "src", "AppButton.tsx"),
      `export function AppButton() { return null; }\n${" ".repeat(256 * 1024)}`,
      "utf8",
    );

    const diagnostics = await validateProjectPolicyImportTargets(rootDir, [
      wrapperTarget("./src/AppButton"),
    ]);

    expect(diagnostics.targets[0]).toMatchObject({
      status: "unsupported",
      reason: expect.stringContaining(
        "too large for bounded static inspection",
      ),
    });
  });
});
