import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  collectSaltInstallationDiagnostics,
  collectSaltPackages,
  detectPackageManagerName,
  inspectPackageJsonFile,
  MAX_PACKAGE_JSON_BYTES,
  MAX_PNPM_WORKSPACE_BYTES,
  MAX_WORKSPACE_ANCESTOR_DIRECTORIES,
  type SaltPackageJsonLike,
} from "../server/projectContext/saltInstallation.js";

const tempDirs: string[] = [];

async function createTempDir(name: string): Promise<string> {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), `${name}-`));
  tempDirs.push(tempDir);
  return tempDir;
}

async function writeJson(filePath: string, value: unknown): Promise<void> {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(value, null, 2), "utf8");
}

async function inspectInstallation(
  rootDir: string,
  packageJson: SaltPackageJsonLike,
) {
  const saltPackages = collectSaltPackages(packageJson);
  const installation = await collectSaltInstallationDiagnostics(
    rootDir,
    saltPackages,
  );

  return {
    packageManager: installation.inspection.packageManager,
    installation,
  };
}

afterEach(async () => {
  await Promise.all(
    tempDirs
      .splice(0, tempDirs.length)
      .map((dir) => fs.rm(dir, { recursive: true, force: true })),
  );
});

describe("MCP project-context installation diagnostics", () => {
  it("distinguishes valid, absent, and invalid package markers", async () => {
    const rootDir = await createTempDir("salt-mcp-marker-inspection");
    const markerPath = path.join(rootDir, "package.json");

    await expect(inspectPackageJsonFile(markerPath, rootDir)).resolves.toEqual({
      status: "absent",
      path: null,
    });

    await fs.writeFile(markerPath, "{", "utf8");
    await expect(
      inspectPackageJsonFile(markerPath, rootDir),
    ).resolves.toMatchObject({ status: "invalid", reason: "parse_error" });

    await fs.writeFile(markerPath, "[]", "utf8");
    await expect(
      inspectPackageJsonFile(markerPath, rootDir),
    ).resolves.toMatchObject({ status: "invalid", reason: "parse_error" });

    const prefix = '{"padding":"';
    const suffix = '"}';
    const atLimit = `${prefix}${"x".repeat(
      MAX_PACKAGE_JSON_BYTES - Buffer.byteLength(prefix + suffix, "utf8"),
    )}${suffix}`;
    expect(Buffer.byteLength(atLimit, "utf8")).toBe(MAX_PACKAGE_JSON_BYTES);
    await fs.writeFile(markerPath, atLimit, "utf8");
    await expect(
      inspectPackageJsonFile(markerPath, rootDir),
    ).resolves.toMatchObject({ status: "valid" });

    await fs.writeFile(markerPath, `${atLimit} `, "utf8");
    await expect(
      inspectPackageJsonFile(markerPath, rootDir),
    ).resolves.toMatchObject({ status: "invalid", reason: "oversized" });
  });

  it("rejects non-file and escaping package markers", async () => {
    const rootDir = await createTempDir("salt-mcp-marker-boundary");
    const markerPath = path.join(rootDir, "package.json");
    await fs.mkdir(markerPath);
    await expect(
      inspectPackageJsonFile(markerPath, rootDir),
    ).resolves.toMatchObject({ status: "invalid", reason: "not_file" });

    await fs.rm(markerPath, { recursive: true, force: true });
    const outsideDir = await createTempDir("salt-mcp-marker-outside");
    const outsideMarker = path.join(outsideDir, "package.json");
    await fs.writeFile(outsideMarker, "{}", "utf8");
    await fs.symlink(outsideMarker, markerPath, "file");
    await expect(
      inspectPackageJsonFile(markerPath, rootDir),
    ).resolves.toMatchObject({ status: "invalid", reason: "outside_root" });
  });

  it("ignores malformed dependency fields and invalid Salt package names", async () => {
    const rootDir = await createTempDir("salt-mcp-malformed-manifest");
    const packageJson = {
      packageManager: 42,
      dependencies: {
        "@salt-ds/core": 2,
        "@salt-ds/../../outside": "1.0.0",
      },
      devDependencies: ["@salt-ds/icons"],
    } as unknown as SaltPackageJsonLike;

    expect(collectSaltPackages(packageJson)).toEqual([]);
    await expect(detectPackageManagerName(rootDir, packageJson)).resolves.toBe(
      "unknown",
    );
  });

  it("resolves only declared Salt package manifests", async () => {
    const rootDir = await createTempDir("salt-mcp-manifest-resolution");
    const packageJson = {
      packageManager: "yarn@4.10.3",
      dependencies: { "@salt-ds/core": "^2.0.0" },
    };
    await writeJson(path.join(rootDir, "package.json"), packageJson);
    await writeJson(
      path.join(rootDir, "node_modules", "@salt-ds", "core", "package.json"),
      { name: "@salt-ds/core", version: "2.0.1" },
    );

    const result = await inspectInstallation(rootDir, packageJson);

    expect(result.packageManager).toBe("yarn");
    expect(result.installation.resolvedPackages).toEqual([
      expect.objectContaining({
        name: "@salt-ds/core",
        declaredVersion: "^2.0.0",
        resolvedVersion: "2.0.1",
        satisfiesDeclaredVersion: true,
      }),
    ]);
    expect(result.installation.inspection).toEqual(
      expect.objectContaining({
        packageManager: "yarn",
        strategy: "manifest-resolution",
        status: "succeeded",
        packageLayout: "node-modules",
        limitations: [
          expect.stringContaining(
            "full dependency-graph and duplicate-install diagnosis is outside",
          ),
        ],
      }),
    );
    expect(result.installation.versionHealth.issues).toEqual([]);
  });

  it("does not satisfy a stable declaration with an implicit prerelease", async () => {
    const rootDir = await createTempDir("salt-mcp-prerelease-resolution");
    const packageJson = {
      dependencies: { "@salt-ds/core": "^2.0.0" },
    };
    await writeJson(path.join(rootDir, "package.json"), packageJson);
    await writeJson(
      path.join(rootDir, "node_modules", "@salt-ds", "core", "package.json"),
      { name: "@salt-ds/core", version: "2.1.0-beta.1" },
    );

    const result = await inspectInstallation(rootDir, packageJson);

    expect(result.installation.resolvedPackages[0]).toMatchObject({
      resolvedVersion: "2.1.0-beta.1",
      satisfiesDeclaredVersion: false,
    });
  });

  it("reads a contained package manifest when exports hide the package.json subpath", async () => {
    const rootDir = await createTempDir("salt-mcp-hidden-package-manifest");
    const packageJson = {
      dependencies: { "@salt-ds/core": "^2.0.0" },
    };
    await writeJson(path.join(rootDir, "package.json"), packageJson);
    const packageRoot = path.join(rootDir, "node_modules", "@salt-ds", "core");
    await writeJson(path.join(packageRoot, "package.json"), {
      name: "@salt-ds/core",
      version: "2.0.1",
      exports: { ".": "./index.js" },
    });
    await fs.writeFile(path.join(packageRoot, "index.js"), "export {};\n");

    const result = await inspectInstallation(rootDir, packageJson);

    expect(result.installation.resolvedPackages).toEqual([
      expect.objectContaining({
        name: "@salt-ds/core",
        resolvedVersion: "2.0.1",
        satisfiesDeclaredVersion: true,
      }),
    ]);
  });

  it("rejects a package that resolves outside the selected non-workspace root", async () => {
    const parentDir = await createTempDir("salt-mcp-contained-resolution");
    const rootDir = path.join(parentDir, "selected-project");
    const packageJson = {
      dependencies: { "@salt-ds/core": "^2.0.0" },
    };
    await writeJson(path.join(rootDir, "package.json"), packageJson);
    await writeJson(
      path.join(parentDir, "node_modules", "@salt-ds", "core", "package.json"),
      { name: "@salt-ds/core", version: "2.0.1" },
    );

    const result = await inspectInstallation(rootDir, packageJson);

    expect(result.installation.resolvedPackages).toEqual([
      expect.objectContaining({
        name: "@salt-ds/core",
        resolvedVersion: null,
        resolvedPath: null,
      }),
    ]);
    expect(result.installation.inspection).toEqual(
      expect.objectContaining({
        strategy: "manifest-resolution",
        status: "limited",
      }),
    );
    expect(result.installation.versionHealth.issues).toEqual(
      expect.arrayContaining([
        expect.stringContaining(
          "could not be resolved within the selected repo",
        ),
      ]),
    );
  });

  it("treats Yarn PnP as limited inspection instead of broken resolution", async () => {
    const rootDir = await createTempDir("salt-mcp-yarn-pnp");
    const packageJson = {
      packageManager: "yarn@4.10.3",
      dependencies: { "@salt-ds/core": "^2.0.0" },
    };
    await writeJson(path.join(rootDir, "package.json"), packageJson);
    await fs.writeFile(
      path.join(rootDir, ".pnp.cjs"),
      "module.exports = {};",
      "utf8",
    );

    const result = await inspectInstallation(rootDir, packageJson);

    expect(result.installation.inspection).toEqual(
      expect.objectContaining({
        packageManager: "yarn",
        strategy: "manifest-resolution",
        status: "limited",
        packageLayout: "pnp",
        limitations: expect.arrayContaining([
          expect.stringContaining("Yarn PnP layout detected"),
        ]),
      }),
    );
    expect(result.installation.versionHealth.issues).toEqual([
      expect.stringContaining("effective version could not be verified"),
    ]);
    expect(result.installation.versionHealth.unverifiablePackages).toEqual([
      expect.objectContaining({
        name: "@salt-ds/core",
        declaredVersion: "^2.0.0",
      }),
    ]);
  });

  it("allows a declared workspace package to resolve a hoisted dependency", async () => {
    const workspaceRoot = await createTempDir("salt-mcp-workspace-resolution");
    const packageRoot = path.join(workspaceRoot, "packages", "app");
    const packageJson = {
      dependencies: { "@salt-ds/core": "^2.0.0" },
    };
    await writeJson(path.join(workspaceRoot, "package.json"), {
      private: true,
      workspaces: ["packages/*", "!packages/standalone"],
    });
    await writeJson(path.join(packageRoot, "package.json"), packageJson);
    await writeJson(
      path.join(
        workspaceRoot,
        "node_modules",
        "@salt-ds",
        "core",
        "package.json",
      ),
      { name: "@salt-ds/core", version: "2.0.1" },
    );

    const result = await inspectInstallation(packageRoot, packageJson);

    expect(result.installation.resolvedPackages).toEqual([
      expect.objectContaining({
        name: "@salt-ds/core",
        resolvedVersion: "2.0.1",
      }),
    ]);
    expect(result.installation.workspace).toEqual(
      expect.objectContaining({
        kind: "workspace-package",
        workspaceRoot: workspaceRoot.replaceAll("\\", "/"),
      }),
    );
    expect(result.installation.versionHealth.issues).toEqual([]);
  });

  it.each([
    {
      reason: "parse_error",
      writeMarker: (markerPath: string) =>
        fs.writeFile(markerPath, "[", "utf8"),
    },
    {
      reason: "oversized",
      writeMarker: (markerPath: string) =>
        fs.writeFile(
          markerPath,
          "x".repeat(MAX_PNPM_WORKSPACE_BYTES + 1),
          "utf8",
        ),
    },
    {
      reason: "not_file",
      writeMarker: (markerPath: string) => fs.mkdir(markerPath),
    },
  ])("treats a nearer invalid pnpm workspace marker ($reason) as an authority boundary", async ({
    reason,
    writeMarker,
  }) => {
    const authorityRoot = await createTempDir(
      `salt-mcp-invalid-inner-pnpm-${reason}`,
    );
    const innerRoot = path.join(authorityRoot, "inner");
    const packageRoot = path.join(innerRoot, "packages", "app");
    const packageJson = {
      dependencies: { "@salt-ds/core": "^2.0.0" },
    };
    await writeJson(path.join(authorityRoot, "package.json"), {
      private: true,
      workspaces: ["inner/**"],
    });
    await writeJson(path.join(packageRoot, "package.json"), packageJson);
    await writeMarker(path.join(innerRoot, "pnpm-workspace.yaml"));
    await writeJson(
      path.join(
        authorityRoot,
        "node_modules",
        "@salt-ds",
        "core",
        "package.json",
      ),
      { name: "@salt-ds/core", version: "2.0.1" },
    );

    const installation = await collectSaltInstallationDiagnostics(
      packageRoot,
      collectSaltPackages(packageJson),
      { authorityRoot },
    );

    expect(installation.workspace).toEqual(
      expect.objectContaining({
        kind: "single-package",
        workspaceRoot: null,
      }),
    );
    expect(installation.resolvedPackages).toEqual([
      expect.objectContaining({
        name: "@salt-ds/core",
        resolvedVersion: null,
        resolvedPath: null,
        satisfiesDeclaredVersion: null,
        declarationResolution: "unverifiable",
      }),
    ]);
    expect(installation.inspection.status).toBe("limited");
    expect(installation.inspection.limitations).toEqual(
      expect.arrayContaining([expect.stringContaining(reason)]),
    );
    expect(installation.versionHealth.issues.join(" ")).toMatch(
      /pnpm workspace marker could not be inspected/iu,
    );
  });

  it.each([
    ["packages/{app,core}", "packages/app"],
    ["packages/[ac]pp", "packages/app"],
    ["packages/?pp", "packages/app"],
    ["packages/**/app", "packages/app"],
  ])("uses standards-compatible workspace pattern %s", async (workspacePattern, packageRelativePath) => {
    const workspaceRoot = await createTempDir("salt-mcp-workspace-glob");
    const packageRoot = path.join(workspaceRoot, packageRelativePath);
    const packageJson = {
      dependencies: { "@salt-ds/core": "^2.0.0" },
    };
    await writeJson(path.join(workspaceRoot, "package.json"), {
      private: true,
      workspaces: [workspacePattern],
    });
    await writeJson(path.join(packageRoot, "package.json"), packageJson);
    await writeJson(
      path.join(
        workspaceRoot,
        "node_modules",
        "@salt-ds",
        "core",
        "package.json",
      ),
      { name: "@salt-ds/core", version: "2.0.1" },
    );

    const result = await inspectInstallation(packageRoot, packageJson);

    expect(result.installation.workspace.kind).toBe("workspace-package");
    expect(result.installation.resolvedPackages[0]).toMatchObject({
      resolvedVersion: "2.0.1",
    });
  });

  it.each([
    ["packages/a**b", "packages/a/x/b"],
    ["packages/**", "packages/.hidden/app"],
  ])("does not let workspace pattern %s match %s", async (workspacePattern, packageRelativePath) => {
    const workspaceRoot = await createTempDir("salt-mcp-workspace-no-match");
    const packageRoot = path.join(workspaceRoot, packageRelativePath);
    const packageJson = {
      dependencies: { "@salt-ds/core": "^2.0.0" },
    };
    await writeJson(path.join(workspaceRoot, "package.json"), {
      private: true,
      workspaces: [workspacePattern],
    });
    await writeJson(path.join(packageRoot, "package.json"), packageJson);
    await writeJson(
      path.join(
        workspaceRoot,
        "node_modules",
        "@salt-ds",
        "core",
        "package.json",
      ),
      { name: "@salt-ds/core", version: "2.0.1" },
    );

    const result = await inspectInstallation(packageRoot, packageJson);

    expect(result.installation.workspace.kind).toBe("single-package");
    expect(result.installation.resolvedPackages[0]?.resolvedVersion).toBeNull();
  });

  it("applies workspace exclusions globally", async () => {
    const workspaceRoot = await createTempDir("salt-mcp-workspace-globstar");
    const packageRoot = path.join(workspaceRoot, "packages", "a", "x", "b");
    const packageJson = {
      dependencies: { "@salt-ds/core": "^2.0.0" },
    };
    await writeJson(path.join(workspaceRoot, "package.json"), {
      private: true,
      workspaces: ["packages/**", "!packages/{a,core}/**", "packages/a/**"],
    });
    await writeJson(path.join(packageRoot, "package.json"), packageJson);
    await writeJson(
      path.join(
        workspaceRoot,
        "node_modules",
        "@salt-ds",
        "core",
        "package.json",
      ),
      { name: "@salt-ds/core", version: "2.0.1" },
    );

    const result = await inspectInstallation(packageRoot, packageJson);

    expect(result.installation.workspace.kind).toBe("single-package");
    expect(result.installation.resolvedPackages[0]).toMatchObject({
      resolvedVersion: null,
      resolvedPath: null,
    });
  });

  it("fails closed at a nearer invalid workspace pattern", async () => {
    const outerRoot = await createTempDir("salt-mcp-workspace-invalid");
    const innerRoot = path.join(outerRoot, "inner");
    const packageRoot = path.join(innerRoot, "packages", "app");
    const packageJson = {
      dependencies: { "@salt-ds/core": "^2.0.0" },
    };
    await writeJson(path.join(outerRoot, "package.json"), {
      private: true,
      workspaces: ["inner/**"],
    });
    await writeJson(path.join(innerRoot, "package.json"), {
      private: true,
      workspaces: ["x".repeat(1_025)],
    });
    await writeJson(path.join(packageRoot, "package.json"), packageJson);
    await writeJson(
      path.join(outerRoot, "node_modules", "@salt-ds", "core", "package.json"),
      { name: "@salt-ds/core", version: "2.0.1" },
    );

    const result = await inspectInstallation(packageRoot, packageJson);

    expect(result.installation.workspace.kind).toBe("single-package");
    expect(result.installation.inspection).toMatchObject({ status: "limited" });
    expect(result.installation.inspection.limitations).toEqual(
      expect.arrayContaining([
        expect.stringContaining("Workspace membership patterns were invalid"),
      ]),
    );
    expect(result.installation.resolvedPackages[0]?.resolvedVersion).toBeNull();
  });

  it("does not widen resolution to a workspace whose globs exclude the selected package", async () => {
    const workspaceRoot = await createTempDir("salt-mcp-workspace-exclusion");
    const packageRoot = path.join(workspaceRoot, "tools", "standalone");
    const packageJson = {
      dependencies: { "@salt-ds/core": "^2.0.0" },
    };
    await writeJson(path.join(workspaceRoot, "package.json"), {
      private: true,
      workspaces: ["packages/*"],
    });
    await writeJson(path.join(packageRoot, "package.json"), packageJson);
    await writeJson(
      path.join(
        workspaceRoot,
        "node_modules",
        "@salt-ds",
        "core",
        "package.json",
      ),
      { name: "@salt-ds/core", version: "2.0.1" },
    );

    const result = await inspectInstallation(packageRoot, packageJson);

    expect(result.installation.workspace.kind).toBe("single-package");
    expect(result.installation.resolvedPackages).toEqual([
      expect.objectContaining({
        name: "@salt-ds/core",
        resolvedVersion: null,
        resolvedPath: null,
      }),
    ]);
  });

  it("rejects a declared package manifest that escapes through a directory junction", async () => {
    const rootDir = await createTempDir("salt-mcp-package-junction-root");
    const outsideDir = await createTempDir("salt-mcp-package-junction-outside");
    const packageJson = {
      dependencies: { "@salt-ds/core": "^2.0.0" },
    };
    await writeJson(path.join(rootDir, "package.json"), packageJson);
    await writeJson(path.join(outsideDir, "package.json"), {
      name: "@salt-ds/core",
      version: "2.0.1",
    });
    const packageDir = path.join(rootDir, "node_modules", "@salt-ds", "core");
    await fs.mkdir(path.dirname(packageDir), { recursive: true });
    await fs.symlink(outsideDir, packageDir, "junction");

    const result = await inspectInstallation(rootDir, packageJson);

    expect(result.installation.resolvedPackages).toEqual([
      expect.objectContaining({
        name: "@salt-ds/core",
        resolvedVersion: null,
        resolvedPath: null,
      }),
    ]);
    expect(result.installation.inspection.status).toBe("limited");
    expect(result.installation.versionHealth.issues).toEqual(
      expect.arrayContaining([
        expect.stringContaining("could not be resolved"),
      ]),
    );
  });

  it("surfaces manifest override fields as dependency-drift hints", async () => {
    const rootDir = await createTempDir("salt-mcp-overrides");
    const packageJson = {
      packageManager: "npm@10.9.0",
      dependencies: { "@salt-ds/core": "^2.0.0" },
      overrides: { "@salt-ds/core": "2.0.1" },
      resolutions: { "@salt-ds/core": "2.0.1" },
      pnpm: { overrides: { "@salt-ds/core": "2.0.1" } },
    };
    await writeJson(path.join(rootDir, "package.json"), packageJson);
    await writeJson(
      path.join(rootDir, "node_modules", "@salt-ds", "core", "package.json"),
      { name: "@salt-ds/core", version: "2.0.1" },
    );

    const result = await inspectInstallation(rootDir, packageJson);

    expect(result.installation.inspection.manifestOverrideFields).toEqual([
      "overrides",
      "pnpm.overrides",
      "resolutions",
    ]);
    expect(result.installation.versionHealth.issues).toEqual(
      expect.arrayContaining([
        expect.stringContaining(
          "Manifest override fields detected: overrides, pnpm.overrides, resolutions",
        ),
      ]),
    );
  });

  it.each([
    "workspace:",
    "workspace:*",
    "workspace:^",
    "workspace:~",
  ])("verifies %s only against a real local pnpm workspace package", async (declaration) => {
    const workspaceRoot = await createTempDir("salt-mcp-pnpm-workspace");
    const appRoot = path.join(workspaceRoot, "packages", "app");
    const coreRoot = path.join(workspaceRoot, "packages", "core");
    const packageJson = {
      dependencies: { "@salt-ds/core": declaration },
    };
    await writeJson(path.join(workspaceRoot, "package.json"), {
      private: true,
    });
    await fs.writeFile(
      path.join(workspaceRoot, "pnpm-workspace.yaml"),
      "packages:\n  - packages/{app,core}\n",
      "utf8",
    );
    await fs.writeFile(path.join(workspaceRoot, "pnpm-lock.yaml"), "", "utf8");
    await writeJson(path.join(appRoot, "package.json"), packageJson);
    await writeJson(path.join(coreRoot, "package.json"), {
      name: "@salt-ds/core",
      version: "2.1.0",
    });
    const link = path.join(workspaceRoot, "node_modules", "@salt-ds", "core");
    await fs.mkdir(path.dirname(link), { recursive: true });
    await fs.symlink(coreRoot, link, "junction");

    const result = await inspectInstallation(appRoot, packageJson);
    expect(result.installation.workspace.kind).toBe("workspace-package");
    expect(result.installation.inspection.packageManager).toBe("pnpm");
    expect(result.installation.resolvedPackages).toEqual([
      expect.objectContaining({
        name: "@salt-ds/core",
        declarationResolution: "verified",
        resolvedVersion: "2.1.0",
        satisfiesDeclaredVersion: true,
      }),
    ]);
  });

  it("does not verify workspace protocol against a registry-like installed copy", async () => {
    const workspaceRoot = await createTempDir("salt-mcp-pnpm-false-workspace");
    const appRoot = path.join(workspaceRoot, "packages", "app");
    const packageJson = {
      dependencies: { "@salt-ds/core": "workspace:*" },
    };
    await writeJson(path.join(workspaceRoot, "package.json"), {
      private: true,
    });
    await fs.writeFile(
      path.join(workspaceRoot, "pnpm-workspace.yaml"),
      "packages:\n  - packages/*\n",
      "utf8",
    );
    await writeJson(path.join(appRoot, "package.json"), packageJson);
    await writeJson(
      path.join(
        workspaceRoot,
        "node_modules",
        "@salt-ds",
        "core",
        "package.json",
      ),
      { name: "@salt-ds/core", version: "99.0.0" },
    );

    const result = await inspectInstallation(appRoot, packageJson);
    expect(result.installation.resolvedPackages[0]).toMatchObject({
      resolvedVersion: "99.0.0",
      declarationResolution: "unverifiable",
      satisfiesDeclaredVersion: null,
    });
  });

  it("resolves default, explicit-default, named, and optional pnpm catalogs", async () => {
    const workspaceRoot = await createTempDir("salt-mcp-pnpm-catalog");
    const appRoot = path.join(workspaceRoot, "packages", "app");
    const packageJson = {
      dependencies: {
        "@salt-ds/core": "catalog:default",
        "@salt-ds/lab": "catalog:",
      },
      optionalDependencies: { "@salt-ds/icons": "catalog:next" },
    };
    await writeJson(path.join(workspaceRoot, "package.json"), {
      private: true,
    });
    await fs.writeFile(
      path.join(workspaceRoot, "pnpm-workspace.yaml"),
      [
        "packages:",
        "  - packages/*",
        "catalog:",
        "  '@salt-ds/core': ^2.0.0",
        "  '@salt-ds/lab': ~1.4.0",
        "catalogs:",
        "  next:",
        "    '@salt-ds/icons': ^3.0.0",
      ].join("\n"),
      "utf8",
    );
    await writeJson(path.join(appRoot, "package.json"), packageJson);
    for (const [name, version] of [
      ["core", "2.1.0"],
      ["lab", "1.4.2"],
      ["icons", "3.2.0"],
    ] as const) {
      await writeJson(
        path.join(
          workspaceRoot,
          "node_modules",
          "@salt-ds",
          name,
          "package.json",
        ),
        { name: `@salt-ds/${name}`, version },
      );
    }

    const result = await inspectInstallation(appRoot, packageJson);
    expect(result.installation.resolvedPackages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "@salt-ds/core",
          effectiveDeclaredVersion: "^2.0.0",
          declarationResolution: "verified",
        }),
        expect.objectContaining({
          name: "@salt-ds/lab",
          effectiveDeclaredVersion: "~1.4.0",
          declarationResolution: "verified",
        }),
        expect.objectContaining({
          name: "@salt-ds/icons",
          effectiveDeclaredVersion: "^3.0.0",
          declarationResolution: "verified",
        }),
      ]),
    );
  });

  it("surfaces malformed and non-file pnpm workspace markers as limitations", async () => {
    const root = await createTempDir("salt-mcp-pnpm-marker");
    const packageJson = {
      workspaces: ["packages/*"],
      dependencies: { "@salt-ds/core": "catalog:" },
    };
    await writeJson(path.join(root, "package.json"), packageJson);
    await fs.writeFile(path.join(root, "pnpm-workspace.yaml"), "[", "utf8");
    let result = await inspectInstallation(root, packageJson);
    expect(result.installation.workspace.kind).toBe("single-package");
    expect(result.installation.workspace.workspaceRoot).toBeNull();
    expect(result.installation.versionHealth.issues).toEqual(
      expect.arrayContaining([
        expect.stringContaining("pnpm workspace marker could not be inspected"),
      ]),
    );

    await fs.rm(path.join(root, "pnpm-workspace.yaml"));
    await fs.mkdir(path.join(root, "pnpm-workspace.yaml"));
    result = await inspectInstallation(root, packageJson);
    expect(result.installation.inspection.status).toBe("limited");
    expect(result.installation.inspection.limitations).toEqual(
      expect.arrayContaining([expect.stringContaining("not_file")]),
    );
  });

  it("bounds workspace ancestor discovery and reports incomplete scope", async () => {
    const authorityRoot = await createTempDir("salt-mcp-workspace-depth");
    let appRoot = authorityRoot;
    for (
      let index = 0;
      index < MAX_WORKSPACE_ANCESTOR_DIRECTORIES;
      index += 1
    ) {
      appRoot = path.join(appRoot, `d${index}`);
    }
    const packageJson = { dependencies: { "@salt-ds/core": "^2.0.0" } };
    await writeJson(path.join(authorityRoot, "package.json"), {
      private: true,
      workspaces: ["**"],
    });
    await writeJson(path.join(appRoot, "package.json"), packageJson);

    const installation = await collectSaltInstallationDiagnostics(
      appRoot,
      collectSaltPackages(packageJson),
      { authorityRoot },
    );

    expect(installation.workspace.kind).toBe("single-package");
    expect(installation.workspace.workspaceRoot).toBeNull();
    expect(installation.inspection.status).toBe("limited");
    expect(installation.inspection.limitations).toEqual(
      expect.arrayContaining([
        expect.stringContaining("Workspace ancestor discovery was limited"),
      ]),
    );
    expect(installation.versionHealth.issues).toEqual(
      expect.arrayContaining([
        expect.stringContaining(
          "workspace and dependency resolution may be incomplete",
        ),
      ]),
    );
  });

  it("downgrades otherwise healthy installation evidence for ambiguous lockfiles", async () => {
    const root = await createTempDir("salt-mcp-ambiguous-lockfiles");
    const packageJson = {
      packageManager: "yarn@4.17.0",
      dependencies: { "@salt-ds/core": "^2.0.0" },
    };
    await writeJson(path.join(root, "package.json"), packageJson);
    await writeJson(
      path.join(root, "node_modules", "@salt-ds", "core", "package.json"),
      { name: "@salt-ds/core", version: "2.1.0" },
    );
    await fs.writeFile(path.join(root, "yarn.lock"), "", "utf8");
    await fs.writeFile(path.join(root, "package-lock.json"), "{}", "utf8");

    const result = await inspectInstallation(root, packageJson);
    expect(result.installation.inspection).toMatchObject({
      packageManager: "yarn",
      packageManagerDetectionStatus: "ambiguous",
      status: "limited",
    });
    expect(result.installation.versionHealth.issues.join(" ")).toMatch(
      /conflicts with detected lockfile families/iu,
    );
  });

  it("surfaces invalid lockfile markers and treats both Bun markers as one manager", async () => {
    const invalidRoot = await createTempDir("salt-mcp-invalid-lockfile");
    await writeJson(path.join(invalidRoot, "package.json"), {});
    await fs.mkdir(path.join(invalidRoot, "yarn.lock"));
    const invalid = await inspectInstallation(invalidRoot, {});
    expect(invalid.installation.inspection).toMatchObject({
      packageManagerDetectionStatus: "invalid",
      status: "limited",
    });
    expect(invalid.installation.versionHealth.issues.join(" ")).toMatch(
      /yarn\.lock.*not_file/iu,
    );

    const bunRoot = await createTempDir("salt-mcp-bun-lockfiles");
    await writeJson(path.join(bunRoot, "package.json"), {});
    await fs.writeFile(path.join(bunRoot, "bun.lock"), "", "utf8");
    await fs.writeFile(path.join(bunRoot, "bun.lockb"), "", "utf8");
    const bun = await inspectInstallation(bunRoot, {});
    expect(bun.installation.inspection).toMatchObject({
      packageManager: "bun",
      packageManagerDetectionStatus: "marker",
    });
  });
});
