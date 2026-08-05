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
  occurrenceId?: string,
): ProjectPolicyImportTargetInput {
  return {
    kind: "approved_wrapper",
    owner: "AppButton",
    from,
    name,
    ...(occurrenceId
      ? {
          occurrence_id: occurrenceId,
          json_pointer: `/approved_wrappers/${occurrenceId}`,
          slot: "wrapper_import" as const,
          slot_index: null,
        }
      : {}),
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
      status: "verified",
      declared_count: 2,
      resolved_count: 2,
      issue_count: 0,
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

    expect(diagnostics.status).toBe("issues");
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
      status: "issues",
      resolved_count: 0,
      issue_count: 2,
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
      Array.from({ length: 17 }, (_, index) =>
        wrapperTarget("./src/AppButton", "AppButton", `wrapper-${index}`),
      ),
    );

    expect(diagnostics).toMatchObject({
      status: "issues",
      declared_count: 17,
      resolved_count: 16,
      issue_count: 1,
      diagnostic_reasons: expect.arrayContaining([
        expect.stringContaining("bounded inspection limit of 16"),
      ]),
    });
    expect(diagnostics.targets).toHaveLength(17);
    expect(diagnostics.targets[16]).toMatchObject({
      occurrence_id: "wrapper-16",
      slot: "wrapper_import",
      status: "not_inspected_limit",
      resolved_path: null,
      reason: expect.stringContaining("bounded inspection limit of 16"),
    });
  });

  it("keeps duplicate owners distinguishable by occurrence identity", async () => {
    const rootDir = await createTempDir("salt-policy-import-occurrences");
    await fs.mkdir(path.join(rootDir, "src"), { recursive: true });
    await fs.writeFile(
      path.join(rootDir, "src", "Valid.ts"),
      "export const AppButton = () => null;\n",
      "utf8",
    );

    const diagnostics = await validateProjectPolicyImportTargets(rootDir, [
      wrapperTarget("./src/Valid", "AppButton", "valid-occurrence"),
      wrapperTarget("./src/Missing", "AppButton", "invalid-occurrence"),
    ]);

    expect(diagnostics.targets).toEqual([
      expect.objectContaining({
        occurrence_id: "valid-occurrence",
        owner: "AppButton",
        status: "resolved",
      }),
      expect.objectContaining({
        occurrence_id: "invalid-occurrence",
        owner: "AppButton",
        status: "missing_module",
      }),
    ]);
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

  it("rejects oversized theme side-effect imports", async () => {
    const rootDir = await createTempDir("salt-policy-import-theme-size");
    await fs.mkdir(path.join(rootDir, "src"), { recursive: true });
    await fs.writeFile(
      path.join(rootDir, "src", "brand.css"),
      `:root {}\n${" ".repeat(256 * 1024)}`,
      "utf8",
    );

    const diagnostics = await validateProjectPolicyImportTargets(rootDir, [
      {
        kind: "theme_import",
        owner: "BrandProvider",
        from: "./src/brand.css",
        name: null,
      },
    ]);

    expect(diagnostics.targets[0]).toMatchObject({
      status: "unsupported",
      reason: expect.stringContaining(
        "too large for bounded static inspection",
      ),
    });
  });

  it("does not verify aliases from a structurally invalid tsconfig", async () => {
    const rootDir = await createTempDir("salt-policy-import-invalid-tsconfig");
    await fs.mkdir(path.join(rootDir, "src"), { recursive: true });
    await fs.writeFile(
      path.join(rootDir, "src", "AppButton.ts"),
      "export const AppButton = () => null;\n",
      "utf8",
    );
    await fs.writeFile(
      path.join(rootDir, "tsconfig.json"),
      JSON.stringify({
        compilerOptions: {
          baseUrl: 42,
          paths: { "@app/*": ["src/*"] },
        },
      }),
      "utf8",
    );

    const diagnostics = await validateProjectPolicyImportTargets(rootDir, [
      wrapperTarget("@app/AppButton"),
    ]);
    expect(diagnostics.status).toBe("issues");
    expect(diagnostics.targets[0]?.status).toBe("unsupported");
    expect(diagnostics.inspection_limitations).toContain("tsconfig_invalid");
  });

  it("does not skip an escaping higher-precedence alias target", async () => {
    const parentDir = await createTempDir("salt-policy-alias-precedence");
    const rootDir = path.join(parentDir, "repo");
    const outsideDir = path.join(parentDir, "outside");
    await fs.mkdir(path.join(rootDir, "src"), { recursive: true });
    await fs.mkdir(outsideDir, { recursive: true });
    await Promise.all([
      fs.writeFile(
        path.join(outsideDir, "AppButton.ts"),
        "export const AppButton = () => null;\n",
        "utf8",
      ),
      fs.writeFile(
        path.join(rootDir, "src", "AppButton.ts"),
        "export const AppButton = () => null;\n",
        "utf8",
      ),
      fs.writeFile(
        path.join(rootDir, "tsconfig.json"),
        JSON.stringify({
          compilerOptions: {
            baseUrl: ".",
            paths: { "@app/*": ["../outside/*", "src/*"] },
          },
        }),
        "utf8",
      ),
    ]);

    const diagnostics = await validateProjectPolicyImportTargets(rootDir, [
      wrapperTarget("@app/AppButton"),
    ]);

    expect(diagnostics.status).toBe("issues");
    expect(diagnostics.resolved_count).toBe(0);
    expect(diagnostics.targets[0]).toMatchObject({
      status: "unsupported",
      reason: expect.stringContaining("leaves the declared root_dir"),
    });
  });

  it("limits structurally oversized modules even when their bytes are bounded", async () => {
    const rootDir = await createTempDir("salt-policy-import-complexity");
    await fs.mkdir(path.join(rootDir, "src"), { recursive: true });
    await fs.writeFile(
      path.join(rootDir, "src", "ManyStatements.ts"),
      `${Array.from({ length: 4_097 }, (_, index) => `const v${index}=0;`).join("\n")}\nexport const AppButton = () => null;\n`,
      "utf8",
    );

    const diagnostics = await validateProjectPolicyImportTargets(rootDir, [
      wrapperTarget("./src/ManyStatements"),
    ]);

    expect(diagnostics.targets[0]).toMatchObject({
      status: "not_inspected_limit",
      reason: expect.stringMatching(
        /AST node, depth, statement, or aggregate/iu,
      ),
    });
  });

  it("reads and parses one shared module once for duplicate targets", async () => {
    const rootDir = await createTempDir("salt-policy-import-cache");
    await fs.mkdir(path.join(rootDir, "src"), { recursive: true });
    const declarations = Array.from(
      { length: 3_000 },
      (_, index) => `A${index}=${index}`,
    ).join(",");
    await fs.writeFile(
      path.join(rootDir, "src", "Shared.ts"),
      `export const ${declarations};\n`,
      "utf8",
    );

    const diagnostics = await validateProjectPolicyImportTargets(
      rootDir,
      Array.from({ length: 16 }, (_, index) =>
        wrapperTarget("./src/Shared", `A${index}`),
      ),
    );

    expect(diagnostics.resolved_count).toBe(16);
    expect(
      diagnostics.targets.every((target) => target.status === "resolved"),
    ).toBe(true);
  });
});
