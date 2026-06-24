import fs from "node:fs/promises";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { runDoctor } from "../doctor.js";

const tempDirs: string[] = [];
const activeServers: http.Server[] = [];

async function createTempDir(name: string): Promise<string> {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), `${name}-`));
  tempDirs.push(tempDir);
  return tempDir;
}

afterEach(async () => {
  await Promise.all(
    tempDirs
      .splice(0, tempDirs.length)
      .map((dir) => fs.rm(dir, { recursive: true, force: true })),
  );
  await Promise.all(
    activeServers.splice(0, activeServers.length).map(
      (server) =>
        new Promise<void>((resolve, reject) => {
          server.close((error) => {
            if (error) {
              reject(error);
              return;
            }
            resolve();
          });
        }),
    ),
  );
});

function startServer(
  contentType = "text/html; charset=utf-8",
): Promise<string> {
  return new Promise((resolve) => {
    const server = http.createServer((_request, response) => {
      response.writeHead(200, { "content-type": contentType });
      response.end("<!doctype html><title>Doctor Runtime</title>");
    });

    server.listen(0, "127.0.0.1", () => {
      activeServers.push(server);
      const address = server.address();
      if (address && typeof address === "object") {
        resolve(`http://127.0.0.1:${address.port}/`);
      }
    });
  });
}

describe("runDoctor", () => {
  it("detects Salt packages, Storybook, and Salt config files", async () => {
    const rootDir = await createTempDir("salt-doctor");
    await fs.mkdir(path.join(rootDir, ".storybook"));
    await fs.mkdir(path.join(rootDir, ".salt"));
    await fs.writeFile(path.join(rootDir, ".salt", "team.json"), "{}", "utf8");
    await fs.writeFile(
      path.join(rootDir, "package.json"),
      JSON.stringify(
        {
          packageManager: "yarn@4.10.3",
          dependencies: {
            "@salt-ds/core": "^1.2.3",
            storybook: "^10.0.0",
          },
        },
        null,
        2,
      ),
      "utf8",
    );

    const result = await runDoctor({
      rootDir,
      toolVersion: "1.0.0",
      timestamp: "2026-03-25T12:00:00Z",
    });

    expect(result.rootDir).toBe(rootDir);
    expect(result.environment.packageManager).toBe("yarn");
    expect(result.saltPackages).toEqual([
      { name: "@salt-ds/core", version: "^1.2.3" },
    ]);
    expect(result.policyLayers).toEqual(
      expect.objectContaining({
        teamConfigPath: expect.stringContaining("/.salt/team.json"),
        stackConfigPath: null,
        layers: [],
      }),
    );
    expect(result.repoSignals.storybookDetected).toBe(true);
    expect(result.repoSignals.saltTeamConfigFound).toBe(true);
    expect(
      result.checks.find((check) => check.id === "package-json-found")?.status,
    ).toBe("pass");
  });

  it("reports declared, resolved, and installed Salt version drift", async () => {
    const rootDir = await createTempDir("salt-doctor-version-drift");
    await fs.mkdir(path.join(rootDir, ".salt"), { recursive: true });
    await fs.mkdir(path.join(rootDir, "node_modules", "@salt-ds", "core"), {
      recursive: true,
    });
    await fs.mkdir(path.join(rootDir, "node_modules", "@salt-ds", "icons"), {
      recursive: true,
    });
    await fs.mkdir(
      path.join(
        rootDir,
        "node_modules",
        "example-dep",
        "node_modules",
        "@salt-ds",
        "core",
      ),
      { recursive: true },
    );
    await fs.writeFile(path.join(rootDir, ".salt", "team.json"), "{}", "utf8");
    await fs.writeFile(
      path.join(rootDir, "package.json"),
      JSON.stringify(
        {
          packageManager: "pnpm@9.1.0",
          dependencies: {
            "@salt-ds/core": "^2.0.0",
            "@salt-ds/icons": "^2.0.0",
          },
        },
        null,
        2,
      ),
      "utf8",
    );
    await fs.writeFile(
      path.join(rootDir, "node_modules", "@salt-ds", "core", "package.json"),
      JSON.stringify(
        {
          name: "@salt-ds/core",
          version: "1.9.0",
        },
        null,
        2,
      ),
      "utf8",
    );
    await fs.writeFile(
      path.join(rootDir, "node_modules", "@salt-ds", "icons", "package.json"),
      JSON.stringify(
        {
          name: "@salt-ds/icons",
          version: "2.0.1",
        },
        null,
        2,
      ),
      "utf8",
    );
    await fs.writeFile(
      path.join(rootDir, "node_modules", "example-dep", "package.json"),
      JSON.stringify(
        {
          name: "example-dep",
          version: "1.0.0",
        },
        null,
        2,
      ),
      "utf8",
    );
    await fs.writeFile(
      path.join(
        rootDir,
        "node_modules",
        "example-dep",
        "node_modules",
        "@salt-ds",
        "core",
        "package.json",
      ),
      JSON.stringify(
        {
          name: "@salt-ds/core",
          version: "2.0.1",
        },
        null,
        2,
      ),
      "utf8",
    );

    const result = await runDoctor({
      rootDir,
      toolVersion: "1.0.0",
      timestamp: "2026-03-25T12:00:00Z",
      commandRunner: async (command, args) => {
        expect(command).toBe("pnpm");
        expect(args).toEqual(["list", "--json", "--depth", "Infinity"]);
        return {
          exitCode: 0,
          stdout: JSON.stringify([
            {
              name: "salt-doctor-version-drift",
              dependencies: {
                "@salt-ds/core": {
                  name: "@salt-ds/core",
                  version: "1.9.0",
                },
                "@salt-ds/icons": {
                  name: "@salt-ds/icons",
                  version: "2.0.1",
                },
              },
            },
          ]),
          stderr: "",
        };
      },
    });

    expect(result.saltInstallation.versionHealth).toEqual(
      expect.objectContaining({
        declaredVersions: ["^2.0.0"],
        resolvedVersions: expect.arrayContaining(["1.9.0", "2.0.1"]),
        installedVersions: expect.arrayContaining(["1.9.0", "2.0.1"]),
        multipleResolvedVersions: false,
        multipleInstalledVersions: true,
        mismatchedPackages: [
          expect.objectContaining({
            name: "@salt-ds/core",
            declaredVersion: "^2.0.0",
            resolvedVersion: "1.9.0",
          }),
        ],
      }),
    );
    expect(result.saltInstallation.installedPackages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "@salt-ds/core",
          version: "1.9.0",
          path: expect.stringContaining(
            "/node_modules/@salt-ds/core/package.json",
          ),
        }),
        expect.objectContaining({
          name: "@salt-ds/core",
          version: "2.0.1",
          path: expect.stringContaining(
            "/node_modules/example-dep/node_modules/@salt-ds/core/package.json",
          ),
        }),
      ]),
    );
    expect(result.saltInstallation.inspection).toEqual(
      expect.objectContaining({
        packageManager: "pnpm",
        strategy: "package-manager-command",
        status: "succeeded",
        listCommand: "pnpm list --json --depth Infinity",
        discoveredVersions: ["1.9.0", "2.0.1"],
      }),
    );
    expect(result.saltInstallation.duplicatePackages).toEqual([
      expect.objectContaining({
        name: "@salt-ds/core",
        versions: ["1.9.0", "2.0.1"],
        packageCount: 2,
        versionCount: 2,
        paths: expect.arrayContaining([
          expect.stringContaining("/node_modules/@salt-ds/core/package.json"),
          expect.stringContaining(
            "/node_modules/example-dep/node_modules/@salt-ds/core/package.json",
          ),
        ]),
      }),
    ]);
    expect(result.saltInstallation.remediation).toEqual(
      expect.objectContaining({
        explainCommand: "pnpm why @salt-ds/core",
        dedupeCommand: "pnpm dedupe",
        reinstallCommand: "pnpm install",
      }),
    );
    expect(result.saltInstallation.workspace).toEqual(
      expect.objectContaining({
        kind: "single-package",
        issueSourceHint: "package-local",
      }),
    );
    expect(result.saltInstallation.healthSummary).toEqual(
      expect.objectContaining({
        health: "fail",
        recommendedAction: "inspect-dependency-drift",
        blockingWorkflows: ["review", "migrate", "upgrade"],
        reasons: expect.arrayContaining([
          expect.stringContaining(
            "Duplicate Salt package copies were found for @salt-ds/core",
          ),
        ]),
      }),
    );
    expect(
      result.checks.find(
        (check) => check.id === "salt-package-installed-version-consistency",
      )?.status,
    ).toBe("warn");
    expect(
      result.checks.find(
        (check) => check.id === "salt-package-resolution-match",
      )?.status,
    ).toBe("warn");
  });

  it("falls back cleanly when the yarn inspection command fails", async () => {
    const rootDir = await createTempDir("salt-doctor-yarn-fallback");
    await fs.mkdir(path.join(rootDir, "node_modules", "@salt-ds", "core"), {
      recursive: true,
    });
    await fs.writeFile(path.join(rootDir, "yarn.lock"), "", "utf8");
    await fs.writeFile(
      path.join(rootDir, "package.json"),
      JSON.stringify(
        {
          dependencies: {
            "@salt-ds/core": "^2.0.0",
          },
        },
        null,
        2,
      ),
      "utf8",
    );
    await fs.writeFile(
      path.join(rootDir, "node_modules", "@salt-ds", "core", "package.json"),
      JSON.stringify(
        {
          name: "@salt-ds/core",
          version: "2.0.1",
        },
        null,
        2,
      ),
      "utf8",
    );

    const result = await runDoctor({
      rootDir,
      commandRunner: async (command, args) => {
        expect(command).toBe("yarn");
        expect(args).toEqual(["list", "--json", "--pattern", "@salt-ds"]);
        return {
          exitCode: 1,
          stdout: "",
          stderr: "yarn list is not available in this environment",
        };
      },
    });

    expect(result.environment.packageManager).toBe("yarn");
    expect(result.saltInstallation.inspection).toEqual(
      expect.objectContaining({
        packageManager: "yarn",
        strategy: "package-manager-command",
        status: "failed",
        listCommand: "yarn list --json --pattern @salt-ds",
        error: "yarn list is not available in this environment",
      }),
    );
    expect(result.saltInstallation.duplicatePackages).toEqual([]);
    expect(result.saltInstallation.versionHealth.issues).toEqual(
      expect.arrayContaining([
        expect.stringContaining(
          "yarn inspection failed and Salt fell back to the node_modules scan",
        ),
      ]),
    );
    expect(result.saltInstallation.healthSummary).toEqual(
      expect.objectContaining({
        health: "warn",
        recommendedAction: "inspect-dependency-drift",
        blockingWorkflows: [],
      }),
    );
    expect(
      result.checks.find(
        (check) => check.id === "salt-package-manager-inspection",
      )?.status,
    ).toBe("warn");
  });

  it("treats Yarn PnP installs as limited inspection instead of broken resolution", async () => {
    const rootDir = await createTempDir("salt-doctor-yarn-pnp");
    await fs.writeFile(
      path.join(rootDir, ".pnp.cjs"),
      "module.exports = {};",
      "utf8",
    );
    await fs.writeFile(
      path.join(rootDir, "package.json"),
      JSON.stringify(
        {
          packageManager: "yarn@4.10.3",
          dependencies: {
            "@salt-ds/core": "^2.0.0",
          },
        },
        null,
        2,
      ),
      "utf8",
    );

    const result = await runDoctor({
      rootDir,
      commandRunner: async (command, args) => {
        expect(command).toBe("yarn");
        expect(args).toEqual(["list", "--json", "--pattern", "@salt-ds"]);
        return {
          exitCode: 0,
          stdout: `${JSON.stringify({
            type: "tree",
            data: {
              trees: [{ name: "@salt-ds/core@npm:2.0.1", children: [] }],
            },
          })}\n`,
          stderr: "",
        };
      },
    });

    expect(result.saltInstallation.resolvedPackages).toEqual([
      expect.objectContaining({
        name: "@salt-ds/core",
        resolvedVersion: null,
        resolvedPath: null,
      }),
    ]);
    expect(result.saltInstallation.inspection).toEqual(
      expect.objectContaining({
        packageManager: "yarn",
        strategy: "package-manager-command",
        status: "succeeded",
        packageLayout: "pnp",
        discoveredVersions: ["2.0.1"],
        manifestOverrideFields: [],
        limitations: expect.arrayContaining([
          expect.stringContaining("Yarn PnP layout detected"),
        ]),
      }),
    );
    expect(result.saltInstallation.versionHealth.issues).toEqual([]);
    expect(result.saltInstallation.healthSummary).toEqual({
      health: "pass",
      recommendedAction: "none",
      blockingWorkflows: [],
      reasons: [],
    });
    expect(
      result.checks.find(
        (check) => check.id === "salt-package-resolution-match",
      )?.status,
    ).toBe("info");
    expect(
      result.checks.find(
        (check) => check.id === "salt-package-manager-inspection",
      )?.status,
    ).toBe("info");
  });

  it("marks Bun installs as limited node_modules scans", async () => {
    const rootDir = await createTempDir("salt-doctor-bun");
    await fs.mkdir(path.join(rootDir, "node_modules", "@salt-ds", "core"), {
      recursive: true,
    });
    await fs.writeFile(path.join(rootDir, "bun.lock"), "", "utf8");
    await fs.writeFile(
      path.join(rootDir, "package.json"),
      JSON.stringify(
        {
          dependencies: {
            "@salt-ds/core": "^2.0.0",
          },
        },
        null,
        2,
      ),
      "utf8",
    );
    await fs.writeFile(
      path.join(rootDir, "node_modules", "@salt-ds", "core", "package.json"),
      JSON.stringify(
        {
          name: "@salt-ds/core",
          version: "2.0.1",
        },
        null,
        2,
      ),
      "utf8",
    );

    const result = await runDoctor({ rootDir });

    expect(result.environment.packageManager).toBe("bun");
    expect(result.saltInstallation.inspection).toEqual(
      expect.objectContaining({
        packageManager: "bun",
        strategy: "node-modules-scan",
        status: "fallback",
        packageLayout: "node-modules",
        limitations: expect.arrayContaining([
          expect.stringContaining(
            "Bun installs currently rely on node_modules scanning",
          ),
        ]),
      }),
    );
    expect(result.saltInstallation.healthSummary).toEqual(
      expect.objectContaining({
        health: "pass",
        recommendedAction: "none",
        blockingWorkflows: [],
      }),
    );
    expect(
      result.checks.find(
        (check) => check.id === "salt-package-manager-inspection",
      )?.status,
    ).toBe("info");
  });

  it("flags manifest override fields as dependency drift hints", async () => {
    const rootDir = await createTempDir("salt-doctor-overrides");
    await fs.mkdir(path.join(rootDir, "node_modules", "@salt-ds", "core"), {
      recursive: true,
    });
    await fs.writeFile(
      path.join(rootDir, "package.json"),
      JSON.stringify(
        {
          packageManager: "npm@10.9.0",
          dependencies: {
            "@salt-ds/core": "^2.0.0",
          },
          overrides: {
            "@salt-ds/core": "2.0.1",
          },
          resolutions: {
            "@salt-ds/core": "2.0.1",
          },
          pnpm: {
            overrides: {
              "@salt-ds/core": "2.0.1",
            },
          },
        },
        null,
        2,
      ),
      "utf8",
    );
    await fs.writeFile(
      path.join(rootDir, "node_modules", "@salt-ds", "core", "package.json"),
      JSON.stringify(
        {
          name: "@salt-ds/core",
          version: "2.0.1",
        },
        null,
        2,
      ),
      "utf8",
    );

    const result = await runDoctor({
      rootDir,
      commandRunner: async (command, args) => {
        expect(command).toBe("npm");
        expect(args).toEqual(["ls", "--json", "--all"]);
        return {
          exitCode: 0,
          stdout: JSON.stringify({
            name: "salt-doctor-overrides",
            dependencies: {
              "@salt-ds/core": {
                name: "@salt-ds/core",
                version: "2.0.1",
              },
            },
          }),
          stderr: "",
        };
      },
    });

    expect(result.saltInstallation.inspection.manifestOverrideFields).toEqual([
      "overrides",
      "pnpm.overrides",
      "resolutions",
    ]);
    expect(result.saltInstallation.versionHealth.issues).toEqual(
      expect.arrayContaining([
        expect.stringContaining(
          "Manifest override fields detected: overrides, pnpm.overrides, resolutions",
        ),
      ]),
    );
    expect(result.saltInstallation.healthSummary).toEqual(
      expect.objectContaining({
        health: "warn",
        recommendedAction: "inspect-dependency-drift",
        blockingWorkflows: [],
        reasons: expect.arrayContaining([
          expect.stringContaining(
            "Dependency override fields were detected in package.json",
          ),
        ]),
      }),
    );
  });

  it("distinguishes workspace-root Salt drift from package-local context", async () => {
    const repoRoot = await createTempDir("salt-doctor-workspace");
    const packageRoot = path.join(repoRoot, "apps", "shell");
    await fs.mkdir(path.join(packageRoot, "node_modules", "@salt-ds", "core"), {
      recursive: true,
    });
    await fs.writeFile(
      path.join(repoRoot, "package.json"),
      JSON.stringify(
        {
          packageManager: "pnpm@9.1.0",
          workspaces: ["apps/*"],
          dependencies: {
            "@salt-ds/core": "^1.0.0",
            "@salt-ds/icons": "^2.0.0",
          },
        },
        null,
        2,
      ),
      "utf8",
    );
    await fs.writeFile(
      path.join(packageRoot, "package.json"),
      JSON.stringify(
        {
          name: "@example/shell",
          dependencies: {
            react: "^18.3.1",
          },
        },
        null,
        2,
      ),
      "utf8",
    );
    await fs.writeFile(
      path.join(
        packageRoot,
        "node_modules",
        "@salt-ds",
        "core",
        "package.json",
      ),
      JSON.stringify(
        {
          name: "@salt-ds/core",
          version: "1.9.0",
        },
        null,
        2,
      ),
      "utf8",
    );

    const result = await runDoctor({
      rootDir: packageRoot,
      commandRunner: async () => ({
        exitCode: 0,
        stdout: JSON.stringify([
          {
            name: "repo-root",
            dependencies: {
              "@salt-ds/core": {
                name: "@salt-ds/core",
                version: "1.9.0",
              },
            },
          },
        ]),
        stderr: "",
      }),
    });

    expect(result.rootDir).toBe(packageRoot);
    expect(result.saltInstallation.workspace).toEqual(
      expect.objectContaining({
        kind: "workspace-package",
        workspaceRoot: repoRoot.replaceAll("\\", "/"),
        issueSourceHint: "workspace-root",
        workspaceSaltPackages: [
          { name: "@salt-ds/core", version: "^1.0.0" },
          { name: "@salt-ds/icons", version: "^2.0.0" },
        ],
      }),
    );
    expect(result.saltInstallation.workspace.workspaceIssues).toEqual(
      expect.arrayContaining([
        expect.stringContaining(
          "@salt-ds/core is declared in package.json but could not be resolved from the current install.",
        ),
        expect.stringContaining(
          "@salt-ds/icons is declared in package.json but could not be resolved from the current install.",
        ),
      ]),
    );
    expect(result.saltInstallation.workspace.workspaceIssues).not.toEqual(
      expect.arrayContaining([
        expect.stringContaining("Multiple declared Salt versions found"),
      ]),
    );
    expect(result.saltInstallation.duplicatePackages).toEqual([]);
    expect(result.saltInstallation.healthSummary).toEqual(
      expect.objectContaining({
        health: "warn",
        recommendedAction: "inspect-dependency-drift",
        blockingWorkflows: [],
        reasons: expect.arrayContaining([
          "The workspace root reports Salt install issues.",
        ]),
      }),
    );
  });

  it("validates layered policy sources for repos using shared conventions packs", async () => {
    const rootDir = await createTempDir("salt-doctor-policy-layers");
    await fs.mkdir(path.join(rootDir, ".salt"), { recursive: true });
    await fs.mkdir(
      path.join(rootDir, "node_modules", "@example", "lob-salt-conventions"),
      { recursive: true },
    );
    await fs.writeFile(path.join(rootDir, ".salt", "team.json"), "{}", "utf8");
    await fs.writeFile(
      path.join(rootDir, ".salt", "stack.json"),
      JSON.stringify(
        {
          contract: "project_conventions_stack_v1",
          layers: [
            {
              id: "lob-defaults",
              scope: "line_of_business",
              source: {
                type: "package",
                specifier: "@example/lob-salt-conventions",
                export: "markets",
              },
            },
            {
              id: "team-overrides",
              scope: "team",
              source: {
                type: "file",
                path: "./team.json",
              },
            },
          ],
        },
        null,
        2,
      ),
      "utf8",
    );
    await fs.writeFile(
      path.join(
        rootDir,
        "node_modules",
        "@example",
        "lob-salt-conventions",
        "index.js",
      ),
      [
        "exports.markets = {",
        '  contract: "project_conventions_v1",',
        '  id: "lob-markets",',
        '  version: "1.0.0",',
        '  project: "lob-markets",',
        '  supported_salt_range: "^1.2.0",',
        "  preferred_components: [],",
        "};",
        "",
      ].join("\n"),
      "utf8",
    );
    await fs.writeFile(
      path.join(
        rootDir,
        "node_modules",
        "@example",
        "lob-salt-conventions",
        "package.json",
      ),
      JSON.stringify(
        {
          name: "@example/lob-salt-conventions",
          version: "1.2.3",
        },
        null,
        2,
      ),
      "utf8",
    );
    await fs.writeFile(
      path.join(rootDir, "package.json"),
      JSON.stringify(
        {
          packageManager: "yarn@4.10.3",
          dependencies: {
            "@salt-ds/core": "^1.2.3",
          },
        },
        null,
        2,
      ),
      "utf8",
    );

    const result = await runDoctor({
      rootDir,
      toolVersion: "1.0.0",
      timestamp: "2026-03-25T12:00:00Z",
    });

    expect(result.policyLayers.layers).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "lob-defaults",
          sourceType: "package",
          status: "resolved",
          packageName: "@example/lob-salt-conventions",
          exportName: "markets",
          version: "1.2.3",
          packageVersion: "1.2.3",
          conventionsVersion: "1.0.0",
          packId: "lob-markets",
          supportedSaltRange: "^1.2.0",
          compatibility: expect.objectContaining({
            status: "compatible",
            checkedVersion: "1.2.3",
          }),
        }),
        expect.objectContaining({
          id: "team-overrides",
          sourceType: "file",
          status: "resolved",
          resolvedPath: expect.stringContaining("/.salt/team.json"),
        }),
      ]),
    );
    expect(
      result.checks.find((check) => check.id === "salt-stack-config-readable")
        ?.status,
    ).toBe("pass");
    expect(
      result.checks.find((check) => check.id === "policy-layer-lob-defaults")
        ?.status,
    ).toBe("pass");
  });

  it("warns when a shared conventions pack resolves but is incompatible with the repo Salt version", async () => {
    const rootDir = await createTempDir("salt-doctor-policy-incompatible-pack");
    await fs.mkdir(path.join(rootDir, ".salt"), { recursive: true });
    await fs.mkdir(
      path.join(rootDir, "node_modules", "@example", "lob-salt-conventions"),
      { recursive: true },
    );
    await fs.writeFile(
      path.join(rootDir, ".salt", "stack.json"),
      JSON.stringify(
        {
          contract: "project_conventions_stack_v1",
          layers: [
            {
              id: "lob-defaults",
              scope: "line_of_business",
              source: {
                type: "package",
                specifier: "@example/lob-salt-conventions",
                export: "markets",
              },
            },
          ],
        },
        null,
        2,
      ),
      "utf8",
    );
    await fs.writeFile(
      path.join(
        rootDir,
        "node_modules",
        "@example",
        "lob-salt-conventions",
        "index.js",
      ),
      [
        "exports.markets = {",
        '  contract: "project_conventions_v1",',
        '  id: "lob-markets",',
        '  version: "1.0.0",',
        '  project: "lob-markets",',
        '  supported_salt_range: "^1.0.0",',
        "  preferred_components: [],",
        "};",
        "",
      ].join("\n"),
      "utf8",
    );
    await fs.writeFile(
      path.join(
        rootDir,
        "node_modules",
        "@example",
        "lob-salt-conventions",
        "package.json",
      ),
      JSON.stringify(
        {
          name: "@example/lob-salt-conventions",
          version: "1.2.3",
        },
        null,
        2,
      ),
      "utf8",
    );
    await fs.writeFile(
      path.join(rootDir, "package.json"),
      JSON.stringify(
        {
          dependencies: {
            "@salt-ds/core": "^2.0.0",
          },
        },
        null,
        2,
      ),
      "utf8",
    );

    const result = await runDoctor({
      rootDir,
      toolVersion: "1.0.0",
      timestamp: "2026-03-25T12:00:00Z",
    });

    expect(result.policyLayers.layers).toEqual([
      expect.objectContaining({
        id: "lob-defaults",
        status: "resolved",
        packId: "lob-markets",
        supportedSaltRange: "^1.0.0",
        compatibility: expect.objectContaining({
          status: "unsupported",
          checkedVersion: "2.0.0",
        }),
      }),
    ]);
    expect(
      result.checks.find((check) => check.id === "policy-layer-lob-defaults")
        ?.status,
    ).toBe("warn");
  });

  it("fails when a required package-backed policy layer cannot be resolved", async () => {
    const rootDir = await createTempDir("salt-doctor-policy-missing");
    await fs.mkdir(path.join(rootDir, ".salt"), { recursive: true });
    await fs.writeFile(
      path.join(rootDir, ".salt", "stack.json"),
      JSON.stringify(
        {
          contract: "project_conventions_stack_v1",
          layers: [
            {
              id: "lob-defaults",
              scope: "line_of_business",
              source: {
                type: "package",
                specifier: "@example/missing-salt-conventions",
                export: "markets",
              },
            },
          ],
        },
        null,
        2,
      ),
      "utf8",
    );
    await fs.writeFile(
      path.join(rootDir, "package.json"),
      JSON.stringify(
        {
          dependencies: {
            "@salt-ds/core": "^1.2.3",
          },
        },
        null,
        2,
      ),
      "utf8",
    );

    const result = await runDoctor({
      rootDir,
      toolVersion: "1.0.0",
      timestamp: "2026-03-25T12:00:00Z",
    });

    expect(result.policyLayers.layers).toEqual([
      expect.objectContaining({
        id: "lob-defaults",
        status: "missing",
        packageName: "@example/missing-salt-conventions",
      }),
    ]);
    expect(
      result.checks.find((check) => check.id === "policy-layer-lob-defaults")
        ?.status,
    ).toBe("fail");
  });

  it("returns a blocking failure when no package.json can be found", async () => {
    const rootDir = await createTempDir("salt-doctor-empty");

    const result = await runDoctor({
      rootDir,
      toolVersion: "1.0.0",
      timestamp: "2026-03-25T12:00:00Z",
    });

    expect(result.rootDir).toBe(rootDir);
    expect(result.saltPackages).toEqual([]);
    expect(result.runtimeTargets).toEqual([]);
    expect(
      result.checks.find((check) => check.id === "package-json-found")?.status,
    ).toBe("fail");
  });

  it("checks runtime target reachability and writes a support bundle", async () => {
    const rootDir = await createTempDir("salt-doctor-runtime");
    const supportBundleDir = path.join(
      rootDir,
      ".salt-support",
      "doctor-bundle",
    );
    const storybookUrl = await startServer();
    await fs.mkdir(path.join(rootDir, ".storybook"));
    await fs.writeFile(
      path.join(rootDir, "package.json"),
      JSON.stringify(
        {
          packageManager: "yarn@4.10.3",
          dependencies: {
            "@salt-ds/core": "^1.2.3",
            storybook: "^10.0.0",
          },
        },
        null,
        2,
      ),
      "utf8",
    );

    const result = await runDoctor({
      rootDir,
      storybookUrl,
      reachabilityTimeoutMs: 2_000,
      supportBundleDir,
      toolVersion: "1.0.0",
      timestamp: "2026-03-25T12:00:00Z",
    });

    expect(result.runtimeTargets).toEqual([
      {
        label: "storybook",
        url: storybookUrl,
        source: "user",
        reachable: true,
        statusCode: 200,
        contentType: "text/html; charset=utf-8",
      },
    ]);
    expect(
      result.checks.find((check) => check.id === "runtime-target-storybook")
        ?.status,
    ).toBe("pass");
    expect(
      result.artifacts.find((artifact) => artifact.kind === "support-bundle")
        ?.path,
    ).toBe(supportBundleDir);
    await expect(
      fs.access(path.join(supportBundleDir, "doctor-report.json")),
    ).resolves.toBeUndefined();
    await expect(
      fs.access(path.join(supportBundleDir, "manifest-summary.json")),
    ).resolves.toBeUndefined();
    await expect(
      fs.access(path.join(supportBundleDir, "salt-config-summary.json")),
    ).resolves.toBeUndefined();
    await expect(
      fs.access(path.join(supportBundleDir, "policy-layer-summary.json")),
    ).resolves.toBeUndefined();
  });
});
