import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  collectSaltInstallationDiagnostics,
  collectSaltPackages,
  detectPackageManagerName,
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
  const packageManager = await detectPackageManagerName(rootDir, packageJson);
  const saltPackages = collectSaltPackages(packageJson);

  return {
    packageManager,
    installation: await collectSaltInstallationDiagnostics(
      rootDir,
      saltPackages,
      { packageManager },
    ),
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
            "Use the host package manager for full dependency-graph",
          ),
        ],
      }),
    );
    expect(result.installation.healthSummary).toEqual({
      health: "pass",
      recommendedAction: "none",
      blockingWorkflows: [],
      reasons: [],
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
    expect(result.installation.healthSummary).toEqual(
      expect.objectContaining({
        health: "fail",
        recommendedAction: "reinstall-dependencies",
        blockingWorkflows: ["review", "migrate"],
      }),
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
    expect(result.installation.versionHealth.issues).toEqual([]);
    expect(result.installation.healthSummary).toEqual(
      expect.objectContaining({
        health: "warn",
        recommendedAction: "inspect-dependency-drift",
        blockingWorkflows: [],
      }),
    );
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
    expect(result.installation.healthSummary.health).toBe("pass");
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
    expect(result.installation.healthSummary.health).toBe("fail");
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
    expect(result.installation.healthSummary).toEqual(
      expect.objectContaining({
        health: "warn",
        recommendedAction: "inspect-dependency-drift",
        blockingWorkflows: [],
      }),
    );
  });
});
