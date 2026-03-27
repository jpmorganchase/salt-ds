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
