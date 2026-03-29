import fs from "node:fs/promises";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { buildRegistry } from "../../../semantic-core/src/index.js";
import { runCli } from "../cli.js";

const tempDirs: string[] = [];
const activeServers: http.Server[] = [];
const REPO_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  "..",
  "..",
);
const VISUAL_MIGRATION_FIXTURE_DIR = path.join(
  REPO_ROOT,
  "workflow-examples",
  "migration-visual-grounding",
);
let registryDir = "";

async function createTempDir(name: string): Promise<string> {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), `${name}-`));
  tempDirs.push(tempDir);
  return tempDir;
}

async function readVisualMigrationFixture(name: string): Promise<string> {
  return fs.readFile(path.join(VISUAL_MIGRATION_FIXTURE_DIR, name), "utf8");
}

function startServer(html: string): Promise<string> {
  return new Promise((resolve) => {
    const server = http.createServer((_request, response) => {
      response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
      response.end(html);
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

let browserAvailabilityPromise: Promise<boolean> | null = null;

function canLaunchBrowser(): Promise<boolean> {
  browserAvailabilityPromise ??= (async () => {
    try {
      const { chromium } = await import("playwright");
      const browser = await chromium.launch({ headless: true });
      await browser.close();
      return true;
    } catch {
      return false;
    }
  })();

  return browserAvailabilityPromise;
}

function withRegistry(args: string[]): string[] {
  return registryDir ? [...args, "--registry-dir", registryDir] : args;
}

beforeAll(async () => {
  registryDir = await fs.mkdtemp(path.join(os.tmpdir(), "salt-cli-registry-"));
  await buildRegistry({
    sourceRoot: REPO_ROOT,
    outputDir: registryDir,
    timestamp: "2026-03-27T00:00:00Z",
  });
}, 40000);

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

afterAll(async () => {
  if (registryDir) {
    await fs.rm(registryDir, { recursive: true, force: true });
  }
});

describe("salt cli", () => {
  it("prints info json output with detected repo context and workflow capabilities", async () => {
    const rootDir = await createTempDir("salt-cli-info");
    await fs.mkdir(path.join(rootDir, ".storybook"));
    await fs.mkdir(path.join(rootDir, ".salt"), { recursive: true });
    await fs.writeFile(
      path.join(rootDir, "AGENTS.md"),
      "# Repo instructions\n",
    );
    await fs.writeFile(
      path.join(rootDir, ".salt", "team.json"),
      `${JSON.stringify(
        {
          contract: "project_conventions_v1",
          approved_wrappers: ["AppShell"],
          preferred_components: [],
          banned_choices: [],
          pattern_preferences: [],
        },
        null,
        2,
      )}\n`,
      "utf8",
    );
    await fs.writeFile(
      path.join(rootDir, "package.json"),
      JSON.stringify(
        {
          packageManager: "pnpm@9.1.0",
          dependencies: {
            "@salt-ds/core": "^2.0.0",
            react: "^18.3.1",
            vite: "^7.1.0",
          },
        },
        null,
        2,
      ),
      "utf8",
    );
    await fs.writeFile(
      path.join(rootDir, "tsconfig.json"),
      JSON.stringify(
        {
          compilerOptions: {
            baseUrl: ".",
            paths: {
              "@/*": ["src/*"],
              "@components/*": ["src/components/*"],
            },
          },
        },
        null,
        2,
      ),
      "utf8",
    );

    let stdout = "";
    let stderr = "";
    const exitCode = await runCli(withRegistry(["info", ".", "--json"]), {
      cwd: rootDir,
      writeStdout: (message) => {
        stdout += message;
      },
      writeStderr: (message) => {
        stderr += message;
      },
    });

    expect(exitCode).toBe(0);
    expect(stderr).toBe("");
    const payload = JSON.parse(stdout);
    expect(payload.framework).toEqual(
      expect.objectContaining({
        name: "vite-react",
      }),
    );
    expect(payload.workspace.kind).toBe("single-package");
    expect(payload.salt.packageVersion).toBe("^2.0.0");
    expect(payload.policy).toEqual(
      expect.objectContaining({
        mode: "team",
        approvedWrappers: ["AppShell"],
      }),
    );
    expect(payload.repoInstructions).toEqual(
      expect.objectContaining({
        filename: "AGENTS.md",
      }),
    );
    expect(payload.repoInstructions.path).toContain("/AGENTS.md");
    expect(payload.imports.aliases).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          alias: "@/*",
        }),
      ]),
    );
    expect(payload.runtime.storybookDetected).toBe(true);
    expect(payload.registry).toEqual(
      expect.objectContaining({
        available: true,
        source: "explicit",
        canonicalTransport: "cli",
      }),
    );
    expect(payload.workflows).toEqual(
      expect.objectContaining({
        bootstrapConventions: true,
        create: true,
        review: true,
        migrate: true,
        upgrade: true,
        runtimeEvidence: true,
      }),
    );
  });

  it("prints info json output even when the requested registry path is invalid", async () => {
    const rootDir = await createTempDir("salt-cli-info-missing-registry");

    let stdout = "";
    let stderr = "";
    const exitCode = await runCli(
      ["info", ".", "--json", "--registry-dir", "./missing-registry"],
      {
        cwd: rootDir,
        writeStdout: (message) => {
          stdout += message;
        },
        writeStderr: (message) => {
          stderr += message;
        },
      },
    );

    expect(exitCode).toBe(0);
    expect(stderr).toBe("");
    const payload = JSON.parse(stdout);
    expect(payload.packageJsonPath).toBeNull();
    expect(payload.registry).toEqual(
      expect.objectContaining({
        available: false,
        canonicalTransport: "unavailable",
      }),
    );
    expect(payload.notes).toEqual(
      expect.arrayContaining([
        expect.stringContaining("Registry directory does not exist"),
      ]),
    );
  });

  it("reports shared conventions-pack metadata for package-backed convention layers", async () => {
    const rootDir = await createTempDir("salt-cli-info-conventions-pack");
    await fs.mkdir(path.join(rootDir, ".salt"), { recursive: true });
    await fs.mkdir(
      path.join(rootDir, "node_modules", "@example", "lob-salt-conventions"),
      { recursive: true },
    );
    await fs.writeFile(
      path.join(rootDir, ".salt", "team.json"),
      JSON.stringify(
        {
          contract: "project_conventions_v1",
          approved_wrappers: ["MarketsButton"],
        },
        null,
        2,
      ),
      "utf8",
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
            {
              id: "team-checkout",
              scope: "team",
              source: {
                type: "file",
                path: "./team.json",
              },
              optional: true,
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
          dependencies: {
            "@salt-ds/core": "^2.0.0",
            react: "^18.3.1",
          },
        },
        null,
        2,
      ),
      "utf8",
    );

    let stdout = "";
    let stderr = "";
    const exitCode = await runCli(withRegistry(["info", ".", "--json"]), {
      cwd: rootDir,
      writeStdout: (message) => {
        stdout += message;
      },
      writeStderr: (message) => {
        stderr += message;
      },
    });

    expect(exitCode).toBe(0);
    expect(stderr).toBe("");
    const payload = JSON.parse(stdout);
    expect(payload.policy).toEqual(
      expect.objectContaining({
        mode: "stack",
        sharedConventions: expect.objectContaining({
          enabled: true,
          packCount: 1,
          packs: ["@example/lob-salt-conventions#markets"],
          packDetails: [
            expect.objectContaining({
              id: "lob-defaults",
              packageName: "@example/lob-salt-conventions",
              exportName: "markets",
              version: "1.2.3",
              status: "resolved",
            }),
          ],
        }),
      }),
    );
    expect(payload.policy.stackLayers).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "lob-defaults",
          scope: "line_of_business",
          sourceType: "package",
          source: "@example/lob-salt-conventions#markets",
          optional: false,
          resolution: expect.objectContaining({
            status: "resolved",
            packageName: "@example/lob-salt-conventions",
            exportName: "markets",
            version: "1.2.3",
          }),
        }),
        expect.objectContaining({
          id: "team-checkout",
          scope: "team",
          sourceType: "file",
          source: "./team.json",
          optional: true,
          resolution: expect.objectContaining({
            status: "resolved",
            contract: "project_conventions_v1",
            resolvedPath: expect.stringContaining("/.salt/team.json"),
          }),
        }),
      ]),
    );
    expect(payload.notes).toEqual(
      expect.arrayContaining([
        expect.stringContaining("shared conventions packs"),
      ]),
    );
  });

  it("bootstraps default Salt policy and AGENTS.md through init", async () => {
    const rootDir = await createTempDir("salt-cli-init");
    await fs.writeFile(
      path.join(rootDir, "package.json"),
      JSON.stringify(
        {
          name: "salt-cli-init",
          packageManager: "pnpm@9.1.0",
          dependencies: {
            react: "^18.3.1",
            vite: "^7.1.0",
          },
        },
        null,
        2,
      ),
      "utf8",
    );

    let stdout = "";
    let stderr = "";
    const exitCode = await runCli(withRegistry(["init", ".", "--json"]), {
      cwd: rootDir,
      writeStdout: (message) => {
        stdout += message;
      },
      writeStderr: (message) => {
        stderr += message;
      },
    });

    expect(exitCode).toBe(0);
    expect(stderr).toBe("");
    const payload = JSON.parse(stdout);
    expect(payload.workflow).toBe("init");
    expect(payload.projectName).toBe("salt-cli-init");
    expect(payload.policy).toEqual(
      expect.objectContaining({
        action: "created",
        mode: "team",
      }),
    );
    expect(payload.repoInstructions).toEqual(
      expect.objectContaining({
        action: "created",
        filename: "AGENTS.md",
      }),
    );
    expect(payload.summary).toEqual(
      expect.objectContaining({
        readyForCreate: true,
      }),
    );
    expect(payload.context.policy.teamConfigPath).toContain("/.salt/team.json");
    expect(payload.context.repoInstructions.path).toContain("/AGENTS.md");

    const teamConfig = JSON.parse(
      await fs.readFile(path.join(rootDir, ".salt", "team.json"), "utf8"),
    );
    expect(teamConfig.contract).toBe("project_conventions_v1");
    expect(teamConfig.project).toBe("salt-cli-init");

    const agents = await fs.readFile(path.join(rootDir, "AGENTS.md"), "utf8");
    expect(agents).toContain("read `.salt/team.json` if it exists");
    expect(agents).toContain("salt-ds review");
    expect(agents).toContain(
      "follow the returned canonical Salt follow-up before editing",
    );
    expect(agents).not.toContain("entity-grounding step");
    expect(agents).not.toContain("salt lint");
    expect(agents).not.toContain("salt doctor");
    expect(agents).not.toContain("salt runtime inspect");
  });

  it("can scaffold a conventions-pack stack during init", async () => {
    const rootDir = await createTempDir("salt-cli-init-conventions-pack");
    await fs.mkdir(
      path.join(rootDir, "node_modules", "@example", "lob-salt-conventions"),
      { recursive: true },
    );
    await fs.writeFile(
      path.join(rootDir, "package.json"),
      JSON.stringify(
        {
          name: "salt-cli-init-conventions-pack",
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

    let stdout = "";
    let stderr = "";
    const exitCode = await runCli(
      withRegistry([
        "init",
        ".",
        "--json",
        "--conventions-pack",
        "@example/lob-salt-conventions#markets",
      ]),
      {
        cwd: rootDir,
        writeStdout: (message) => {
          stdout += message;
        },
        writeStderr: (message) => {
          stderr += message;
        },
      },
    );

    expect(exitCode).toBe(0);
    expect(stderr).toBe("");
    const payload = JSON.parse(stdout);
    expect(payload.workflow).toBe("init");
    expect(payload.policy).toEqual(
      expect.objectContaining({
        action: "created",
        mode: "stack",
      }),
    );
    expect(payload.stack).toEqual(
      expect.objectContaining({
        action: "created",
        conventionsPackSource: "@example/lob-salt-conventions#markets",
      }),
    );
    expect(payload.context.policy.sharedConventions).toEqual(
      expect.objectContaining({
        enabled: true,
        packCount: 1,
      }),
    );

    const stackConfig = JSON.parse(
      await fs.readFile(path.join(rootDir, ".salt", "stack.json"), "utf8"),
    );
    expect(stackConfig.layers).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "org-defaults",
          scope: "line_of_business",
          source: expect.objectContaining({
            type: "package",
            specifier: "@example/lob-salt-conventions",
            export: "markets",
          }),
        }),
        expect.objectContaining({
          id: "team-checkout",
          scope: "team",
        }),
      ]),
    );
  });

  it("updates an existing CLAUDE.md instead of creating AGENTS.md during init", async () => {
    const rootDir = await createTempDir("salt-cli-init-claude");
    await fs.writeFile(
      path.join(rootDir, "package.json"),
      JSON.stringify(
        {
          name: "salt-cli-init-claude",
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
      path.join(rootDir, "CLAUDE.md"),
      "# Existing repo instructions\n",
      "utf8",
    );

    let stdout = "";
    let stderr = "";
    const exitCode = await runCli(withRegistry(["init", ".", "--json"]), {
      cwd: rootDir,
      writeStdout: (message) => {
        stdout += message;
      },
      writeStderr: (message) => {
        stderr += message;
      },
    });

    expect(exitCode).toBe(0);
    expect(stderr).toBe("");
    const payload = JSON.parse(stdout);
    expect(payload.repoInstructions).toEqual(
      expect.objectContaining({
        action: "updated",
        filename: "CLAUDE.md",
      }),
    );
    await expect(
      fs.access(path.join(rootDir, "AGENTS.md")),
    ).rejects.toBeTruthy();
    const claude = await fs.readFile(path.join(rootDir, "CLAUDE.md"), "utf8");
    expect(claude).toContain("# Existing repo instructions");
    expect(claude).toContain("read `.salt/team.json` if it exists");
  });

  it("skips team bootstrap when layered stack policy already exists", async () => {
    const rootDir = await createTempDir("salt-cli-init-stack");
    await fs.mkdir(path.join(rootDir, ".salt"), { recursive: true });
    await fs.writeFile(
      path.join(rootDir, "package.json"),
      JSON.stringify(
        {
          name: "salt-cli-init-stack",
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
      path.join(rootDir, ".salt", "stack.json"),
      JSON.stringify(
        {
          contract: "project_conventions_v1",
          layers: [],
        },
        null,
        2,
      ),
      "utf8",
    );

    let stdout = "";
    let stderr = "";
    const exitCode = await runCli(withRegistry(["init", ".", "--json"]), {
      cwd: rootDir,
      writeStdout: (message) => {
        stdout += message;
      },
      writeStderr: (message) => {
        stderr += message;
      },
    });

    expect(exitCode).toBe(0);
    expect(stderr).toBe("");
    const payload = JSON.parse(stdout);
    expect(payload.policy).toEqual(
      expect.objectContaining({
        action: "skipped-layered",
        mode: "stack",
      }),
    );
    await expect(
      fs.access(path.join(rootDir, ".salt", "team.json")),
    ).rejects.toBeTruthy();
  });

  it("creates a Salt-first recommendation through the public workflow command", async () => {
    const rootDir = await createTempDir("salt-cli-create");
    await fs.writeFile(
      path.join(rootDir, "package.json"),
      JSON.stringify(
        {
          packageManager: "pnpm@9.1.0",
          dependencies: {
            react: "^18.3.1",
            vite: "^7.1.0",
          },
        },
        null,
        2,
      ),
      "utf8",
    );

    let stdout = "";
    let stderr = "";
    const exitCode = await runCli(
      withRegistry([
        "create",
        "link to another page from a toolbar action",
        "--include-starter-code",
        "--json",
      ]),
      {
        cwd: rootDir,
        writeStdout: (message) => {
          stdout += message;
        },
        writeStderr: (message) => {
          stderr += message;
        },
      },
    );

    expect(exitCode).toBe(0);
    expect(stderr).toBe("");
    const payload = JSON.parse(stdout);
    expect(payload.workflow).toBe("create");
    expect(payload.intent).toEqual(
      expect.objectContaining({
        userTask: "link to another page from a toolbar action",
        ruleIds: expect.arrayContaining([
          "create-task-first",
          "create-canonical-before-custom",
        ]),
      }),
    );
    expect(payload.confidence).toEqual(
      expect.objectContaining({
        level: expect.any(String),
        reasons: expect.arrayContaining([expect.any(String)]),
      }),
    );
    expect(payload.summary).toEqual(
      expect.objectContaining({
        mode: "recommend",
        decisionName: expect.any(String),
      }),
    );
    expect(payload.recommendation.suggested_follow_ups).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          workflow: "ground_with_examples",
        }),
      ]),
    );
    expect(payload.notes).toEqual(
      expect.arrayContaining([
        expect.stringContaining("No .salt/team.json detected yet"),
      ]),
    );
  });

  it("prints doctor json output and returns success for a valid repo", async () => {
    const rootDir = await createTempDir("salt-cli");
    await fs.mkdir(path.join(rootDir, ".storybook"));
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

    let stdout = "";
    let stderr = "";
    const exitCode = await runCli(["doctor", ".", "--json"], {
      cwd: rootDir,
      writeStdout: (message) => {
        stdout += message;
      },
      writeStderr: (message) => {
        stderr += message;
      },
    });

    expect(exitCode).toBe(0);
    expect(stderr).toBe("");
    const payload = JSON.parse(stdout);
    expect(payload.repoSignals.storybookDetected).toBe(true);
    expect(payload.saltPackages[0].name).toBe("@salt-ds/core");
    expect(payload.policyLayers).toEqual(
      expect.objectContaining({
        teamConfigPath: null,
        stackConfigPath: null,
        layers: [],
      }),
    );
  });

  it("validates layered policy sources through doctor", async () => {
    const rootDir = await createTempDir("salt-cli-doctor-policy");
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
          dependencies: {
            "@salt-ds/core": "^1.2.3",
          },
        },
        null,
        2,
      ),
      "utf8",
    );

    let stdout = "";
    const exitCode = await runCli(["doctor", ".", "--json"], {
      cwd: rootDir,
      writeStdout: (message) => {
        stdout += message;
      },
      writeStderr: () => {},
    });

    expect(exitCode).toBe(0);
    const payload = JSON.parse(stdout);
    expect(payload.policyLayers.layers).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "lob-defaults",
          sourceType: "package",
          status: "resolved",
          packageName: "@example/lob-salt-conventions",
          exportName: "markets",
        }),
        expect.objectContaining({
          id: "team-overrides",
          sourceType: "file",
          status: "resolved",
          resolvedPath: expect.stringContaining("/.salt/team.json"),
        }),
      ]),
    );
    expect(payload.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "policy-layer-lob-defaults",
          status: "pass",
        }),
      ]),
    );
  });

  it("checks doctor runtime target reachability and writes a support bundle", async () => {
    const rootDir = await createTempDir("salt-cli-doctor-runtime");
    const bundleDir = path.join(rootDir, "support");
    const storybookUrl = await startServer(`
      <!doctype html>
      <html>
        <head><title>Doctor Runtime</title></head>
        <body><main>Ready</main></body>
      </html>
    `);
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

    let stdout = "";
    const exitCode = await runCli(
      [
        "doctor",
        ".",
        "--json",
        "--storybook-url",
        storybookUrl,
        "--bundle-dir",
        bundleDir,
      ],
      {
        cwd: rootDir,
        writeStdout: (message) => {
          stdout += message;
        },
        writeStderr: () => {},
      },
    );

    expect(exitCode).toBe(0);
    const payload = JSON.parse(stdout);
    expect(payload.runtimeTargets).toEqual([
      expect.objectContaining({
        label: "storybook",
        url: storybookUrl,
        source: "user",
        reachable: true,
        statusCode: 200,
      }),
    ]);
    expect(
      payload.artifacts.some(
        (artifact: { kind: string; path: string }) =>
          artifact.kind === "support-bundle" && artifact.path === bundleDir,
      ),
    ).toBe(true);
    await expect(
      fs.access(path.join(bundleDir, "doctor-report.json")),
    ).resolves.toBeUndefined();
    await expect(
      fs.access(path.join(bundleDir, "policy-layer-summary.json")),
    ).resolves.toBeUndefined();
  });

  it("returns 1 for an unknown command", async () => {
    let stderr = "";
    const exitCode = await runCli(["nope"], {
      writeStdout: () => {},
      writeStderr: (message) => {
        stderr += message;
      },
    });

    expect(exitCode).toBe(1);
    expect(stderr).toContain("Unknown command");
  });

  it("returns a migration message when lint is requested", async () => {
    let stderr = "";
    const exitCode = await runCli(["lint", "src"], {
      writeStdout: () => {},
      writeStderr: (message) => {
        stderr += message;
      },
    });

    expect(exitCode).toBe(1);
    expect(stderr).toContain("salt-ds lint has been removed");
    expect(stderr).toContain("salt-ds review");
  });

  it("reviews Salt source through the public workflow command", async () => {
    const rootDir = await createTempDir("salt-cli-review");
    await fs.mkdir(path.join(rootDir, "src"), { recursive: true });
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
      path.join(rootDir, "src", "App.tsx"),
      [
        'import { Button } from "@salt-ds/core";',
        "",
        "export function App() {",
        '  return <Button href="/next">Go</Button>;',
        "}",
        "",
      ].join("\n"),
      "utf8",
    );

    let stdout = "";
    let stderr = "";
    const exitCode = await runCli(withRegistry(["review", "src", "--json"]), {
      cwd: rootDir,
      writeStdout: (message) => {
        stdout += message;
      },
      writeStderr: (message) => {
        stderr += message;
      },
    });

    expect(exitCode).toBe(2);
    expect(stderr).toBe("");
    const payload = JSON.parse(stdout);
    expect(payload.workflow).toBe("review");
    expect(payload.issueClasses).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          ruleId: "review-canonical-mismatch",
        }),
      ]),
    );
    expect(payload.ruleIds).toEqual(
      expect.arrayContaining(["review-canonical-mismatch"]),
    );
    expect(payload.confidence).toEqual(
      expect.objectContaining({
        level: expect.any(String),
        reasons: expect.arrayContaining([expect.any(String)]),
      }),
    );
    expect(payload.summary).toEqual(
      expect.objectContaining({
        status: "needs_attention",
        filesNeedingAttention: 1,
      }),
    );
    expect(payload.context.registry).toEqual(
      expect.objectContaining({
        available: true,
      }),
    );
    expect(payload.sourceValidation.files[0]?.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "component-choice.navigation",
        }),
      ]),
    );
  });

  it("returns structured fix candidates for deterministic prop migrations", async () => {
    const rootDir = await createTempDir("salt-cli-review-fix");
    await fs.mkdir(path.join(rootDir, "src"), { recursive: true });
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
      path.join(rootDir, "src", "Deprecated.tsx"),
      [
        'import { Button } from "@salt-ds/core";',
        "",
        "export function Deprecated() {",
        '  return <Button variant="cta">Go</Button>;',
        "}",
        "",
      ].join("\n"),
      "utf8",
    );

    let stdout = "";
    let stderr = "";
    const exitCode = await runCli(withRegistry(["review", "src", "--json"]), {
      cwd: rootDir,
      writeStdout: (message) => {
        stdout += message;
      },
      writeStderr: (message) => {
        stderr += message;
      },
    });

    expect(exitCode).toBe(2);
    expect(stderr).toBe("");
    const payload = JSON.parse(stdout);
    expect(payload.workflow).toBe("review");
    expect(payload.fixCandidates).toEqual(
      expect.objectContaining({
        totalCount: expect.any(Number),
        deterministicCount: 1,
      }),
    );
    expect(payload.summary).toEqual(
      expect.objectContaining({
        status: "needs_attention",
        fixCandidateCount: expect.any(Number),
        deterministicFixCandidateCount: 1,
      }),
    );
    expect(payload.fixCandidates.files).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          relativePath: path.join("src", "Deprecated.tsx"),
          candidates: expect.arrayContaining([
            expect.objectContaining({
              candidateType: "migration",
              safety: "deterministic",
              kind: "prop",
              from: 'variant="cta"',
              to: 'appearance="solid" sentiment="accented"',
              ruleId: "review-migration-upgrade-risk",
            }),
          ]),
        }),
      ]),
    );
    const originalSource = await fs.readFile(
      path.join(rootDir, "src", "Deprecated.tsx"),
      "utf8",
    );
    expect(originalSource).toContain('variant="cta"');
  });

  it("fails fast when review --fix is requested", async () => {
    const rootDir = await createTempDir("salt-cli-review-fix-flag");
    let stderr = "";

    const exitCode = await runCli(["review", "src", "--fix"], {
      cwd: rootDir,
      writeStdout: () => {},
      writeStderr: (message) => {
        stderr += message;
      },
    });

    expect(exitCode).toBe(1);
    expect(stderr).toContain("review no longer writes files directly");
  });

  it("returns 1 when a review target is not a supported source file", async () => {
    const rootDir = await createTempDir("salt-cli-review-error");
    await fs.writeFile(path.join(rootDir, "notes.txt"), "hello\n");

    let stderr = "";
    const exitCode = await runCli(["review", "notes.txt"], {
      cwd: rootDir,
      writeStdout: () => {},
      writeStderr: (message) => {
        stderr += message;
      },
    });

    expect(exitCode).toBe(1);
    expect(stderr).toContain(
      "Lint target is not a supported source file: notes.txt",
    );
  });

  it("migrates UI through the public workflow command", async () => {
    const rootDir = await createTempDir("salt-cli-migrate");
    const query = (
      await readVisualMigrationFixture("legacy-orders.query.txt")
    ).trim();

    let stdout = "";
    let stderr = "";
    const exitCode = await runCli(withRegistry(["migrate", query, "--json"]), {
      cwd: rootDir,
      writeStdout: (message) => {
        stdout += message;
      },
      writeStderr: (message) => {
        stderr += message;
      },
    });

    expect(exitCode).toBe(0);
    expect(stderr).toBe("");
    const payload = JSON.parse(stdout);
    expect(payload.workflow).toBe("migrate");
    expect(payload.ruleIds).toEqual(
      expect.arrayContaining([
        "migrate-preserve-task-flow",
        "migrate-move-toward-canonical-salt",
      ]),
    );
    expect(payload.confidence).toEqual(
      expect.objectContaining({
        level: expect.any(String),
        reasons: expect.arrayContaining([expect.any(String)]),
      }),
    );
    expect(payload.summary).toEqual(
      expect.objectContaining({
        translationCount: expect.any(Number),
        manualReviews: expect.any(Number),
        confirmationRequired: expect.any(Number),
      }),
    );
    expect(payload.migrationScope).toEqual(
      expect.objectContaining({
        questions: expect.arrayContaining([expect.any(String)]),
        preserveFocus: expect.arrayContaining([
          expect.stringContaining("task flow"),
        ]),
        allowSaltChanges: expect.arrayContaining([
          expect.stringContaining("Salt-native"),
        ]),
        currentExperienceCaptured: false,
      }),
    );
    expect(payload.visualEvidence).toEqual(
      expect.objectContaining({
        contract: expect.objectContaining({
          role: "supporting-evidence",
          supportedInputs: ["structured-outline", "current-ui-capture"],
          plannedInputs: expect.arrayContaining([
            "screenshot-file",
            "image-url",
            "mockup-image",
          ]),
        }),
        inputs: expect.objectContaining({
          structuredOutline: expect.objectContaining({
            provided: false,
          }),
          currentUiCapture: expect.objectContaining({
            requested: false,
            currentExperienceCaptured: false,
          }),
        }),
        confidenceImpact: expect.objectContaining({
          level: "none",
        }),
      }),
    );
    expect(payload.postMigrationVerification).toEqual(
      expect.objectContaining({
        sourceChecks: expect.arrayContaining([expect.any(String)]),
        preserveChecks: expect.arrayContaining([
          expect.stringContaining("task flow"),
        ]),
        suggestedWorkflow: "review",
      }),
    );
    expect(payload.translation.familiarity_contract).toEqual(
      expect.objectContaining({
        preserve: expect.arrayContaining([
          expect.stringContaining("task flow"),
        ]),
        allow_salt_changes: expect.arrayContaining([
          expect.stringContaining("Salt-native"),
        ]),
        requires_confirmation: expect.any(Array),
      }),
    );
    expect(payload.translation.migration_checkpoints).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          phase: "before",
        }),
        expect.objectContaining({
          phase: "after",
        }),
      ]),
    );
    expect(payload.translation.translations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          delta_category: expect.any(String),
          delta_rationale: expect.any(String),
          salt_target: expect.objectContaining({
            name: "Vertical navigation",
          }),
        }),
      ]),
    );
  });

  it("can attach runtime scoping evidence to migration through --url", async () => {
    const rootDir = await createTempDir("salt-cli-migrate-runtime");
    const query = (
      await readVisualMigrationFixture("legacy-orders.query.txt")
    ).trim();
    const runtimeHtml = await readVisualMigrationFixture(
      "legacy-orders.runtime.html",
    );
    const migrateUrl = await startServer(runtimeHtml);

    let stdout = "";
    let stderr = "";
    const exitCode = await runCli(
      withRegistry([
        "migrate",
        query,
        "--url",
        migrateUrl,
        "--json",
        "--mode",
        "fetched-html",
      ]),
      {
        cwd: rootDir,
        writeStdout: (message) => {
          stdout += message;
        },
        writeStderr: (message) => {
          stderr += message;
        },
      },
    );

    expect(exitCode).toBe(0);
    expect(stderr).toBe("");
    const payload = JSON.parse(stdout);
    expect(payload.workflow).toBe("migrate");
    expect(payload.postMigrationVerification).toEqual(
      expect.objectContaining({
        runtimeChecks: expect.arrayContaining([expect.any(String)]),
      }),
    );
    expect(payload.migrationScope).toEqual(
      expect.objectContaining({
        currentExperienceCaptured: true,
      }),
    );
    expect(payload.runtimeEvidence).toEqual(
      expect.objectContaining({
        requested: true,
        url: migrateUrl,
        currentExperience: expect.objectContaining({
          pageTitle: "Legacy Orders",
          landmarks: expect.arrayContaining([
            expect.stringContaining("main"),
            expect.stringContaining("navigation"),
          ]),
          interactionAnchors: expect.arrayContaining([
            expect.stringContaining("button:Save"),
            expect.stringContaining("button:Cancel"),
          ]),
        }),
      }),
    );
    expect(payload.visualEvidence).toEqual(
      expect.objectContaining({
        inputs: expect.objectContaining({
          structuredOutline: expect.objectContaining({
            provided: false,
          }),
          currentUiCapture: expect.objectContaining({
            requested: true,
            url: migrateUrl,
            mode: "fetched-html",
            currentExperienceCaptured: true,
          }),
        }),
        confidenceImpact: expect.objectContaining({
          level: "supporting",
          reasons: expect.arrayContaining([
            expect.stringContaining("Current UI capture contributed"),
          ]),
        }),
      }),
    );
    expect(payload.summary.runtimeMode).toBe("fetched-html");
    expect(payload.notes).toEqual(
      expect.arrayContaining([
        expect.stringContaining("Runtime evidence was used"),
      ]),
    );
  });

  it("accepts a structured source outline for mockup-style migrate scoping", async () => {
    const rootDir = await createTempDir("salt-cli-migrate-outline");
    const outlinePath = path.join(
      VISUAL_MIGRATION_FIXTURE_DIR,
      "legacy-orders.source-outline.json",
    );

    let stdout = "";
    let stderr = "";
    const exitCode = await runCli(
      withRegistry(["migrate", "--source-outline", outlinePath, "--json"]),
      {
        cwd: rootDir,
        writeStdout: (message) => {
          stdout += message;
        },
        writeStderr: (message) => {
          stderr += message;
        },
      },
    );

    expect(exitCode).toBe(0);
    expect(stderr).toBe("");
    const payload = JSON.parse(stdout);
    expect(payload.workflow).toBe("migrate");
    expect(payload.translation.source_ui_model.page_regions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ kind: "header" }),
        expect.objectContaining({ kind: "sidebar" }),
      ]),
    );
    expect(payload.visualEvidence).toEqual(
      expect.objectContaining({
        inputs: expect.objectContaining({
          structuredOutline: expect.objectContaining({
            provided: true,
            path: expect.stringContaining("legacy-orders.source-outline.json"),
            regions: 4,
            actions: 2,
            states: 2,
            notes: 1,
          }),
          currentUiCapture: expect.objectContaining({
            requested: false,
          }),
        }),
        confidenceImpact: expect.objectContaining({
          level: "supporting",
          reasons: expect.arrayContaining([
            expect.stringContaining("Structured outline signals"),
          ]),
        }),
      }),
    );
    expect(payload.confidence.reasons).toEqual(
      expect.arrayContaining([
        "Structured visual evidence was used to model regions, actions, and states before translation.",
      ]),
    );
    expect(payload.notes).toEqual(
      expect.arrayContaining([
        expect.stringContaining(
          "Structured visual evidence from --source-outline was used",
        ),
      ]),
    );
  });

  it("sharpens migrate questions and verification when outline and runtime evidence are combined", async () => {
    const rootDir = await createTempDir("salt-cli-migrate-combined-evidence");
    const query = (
      await readVisualMigrationFixture("legacy-orders.query.txt")
    ).trim();
    const runtimeHtml = await readVisualMigrationFixture(
      "legacy-orders.runtime.html",
    );
    const migrateUrl = await startServer(runtimeHtml);
    const outlinePath = path.join(
      VISUAL_MIGRATION_FIXTURE_DIR,
      "legacy-orders.source-outline.json",
    );

    let stdout = "";
    let stderr = "";
    const exitCode = await runCli(
      withRegistry([
        "migrate",
        query,
        "--source-outline",
        outlinePath,
        "--url",
        migrateUrl,
        "--json",
        "--mode",
        "fetched-html",
      ]),
      {
        cwd: rootDir,
        writeStdout: (message) => {
          stdout += message;
        },
        writeStderr: (message) => {
          stderr += message;
        },
      },
    );

    expect(exitCode).toBe(0);
    expect(stderr).toBe("");
    const payload = JSON.parse(stdout);
    expect(payload.workflow).toBe("migrate");
    expect(payload.visualEvidence.confidenceImpact.level).toBe(
      "stronger-scoping",
    );
    expect(payload.migrationScope.questions).toEqual(
      expect.arrayContaining([
        expect.stringContaining("live landmarks"),
        expect.stringContaining("live actions"),
        expect.stringContaining("outlined states"),
      ]),
    );
    expect(payload.postMigrationVerification).toEqual(
      expect.objectContaining({
        runtimeChecks: expect.arrayContaining([
          expect.stringContaining(
            "structured outline and the captured runtime baseline",
          ),
        ]),
        confirmationChecks: expect.arrayContaining([
          expect.stringContaining(
            "Resolve any mismatch between the structured outline and the captured runtime experience",
          ),
          expect.stringContaining("outlined states"),
        ]),
        preserveChecks: expect.arrayContaining([
          expect.stringContaining("live landmarks"),
          expect.stringContaining("live action anchors"),
        ]),
      }),
    );
    expect(payload.notes).toEqual(
      expect.arrayContaining([
        expect.stringContaining(
          "Structured outline and runtime capture were both used",
        ),
      ]),
    );
  });

  it("upgrades Salt usage through the public workflow command and infers from-version", async () => {
    const rootDir = await createTempDir("salt-cli-upgrade");
    await fs.writeFile(
      path.join(rootDir, "package.json"),
      JSON.stringify(
        {
          dependencies: {
            "@salt-ds/core": "^1.1.0",
          },
        },
        null,
        2,
      ),
      "utf8",
    );

    let stdout = "";
    let stderr = "";
    const exitCode = await runCli(
      withRegistry(["upgrade", "--include-deprecations", "--json"]),
      {
        cwd: rootDir,
        writeStdout: (message) => {
          stdout += message;
        },
        writeStderr: (message) => {
          stderr += message;
        },
      },
    );

    expect(exitCode).toBe(0);
    expect(stderr).toBe("");
    const payload = JSON.parse(stdout);
    expect(payload.workflow).toBe("upgrade");
    expect(payload.ruleIds).toEqual(["upgrade-review-version-risks"]);
    expect(payload.confidence).toEqual(
      expect.objectContaining({
        level: expect.any(String),
        reasons: expect.arrayContaining([expect.any(String)]),
      }),
    );
    expect(payload.summary).toEqual(
      expect.objectContaining({
        target: "@salt-ds/core",
        fromVersion: "1.1.0",
      }),
    );
    expect(payload.notes).toEqual(
      expect.arrayContaining([
        expect.stringContaining("Inferred from-version 1.1.0"),
      ]),
    );
  });

  it("reviews Salt source and optionally attaches runtime evidence through --url", async () => {
    const rootDir = await createTempDir("salt-cli-review-runtime");
    const verifyUrl = await startServer(`
      <!doctype html>
      <html>
        <head><title>Review Me</title></head>
        <body><main><a href="/next">Next</a></main></body>
      </html>
    `);
    await fs.mkdir(path.join(rootDir, "src"), { recursive: true });
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
      path.join(rootDir, "src", "Clean.tsx"),
      [
        'import { Link } from "@salt-ds/core";',
        "",
        "export function Clean() {",
        '  return <Link href="/next">Go</Link>;',
        "}",
        "",
      ].join("\n"),
      "utf8",
    );

    let stdout = "";
    let stderr = "";
    const exitCode = await runCli(
      withRegistry([
        "review",
        "src",
        "--url",
        verifyUrl,
        "--json",
        "--mode",
        "fetched-html",
      ]),
      {
        cwd: rootDir,
        writeStdout: (message) => {
          stdout += message;
        },
        writeStderr: (message) => {
          stderr += message;
        },
      },
    );

    expect(exitCode).toBe(0);
    expect(stderr).toBe("");
    const payload = JSON.parse(stdout);
    expect(payload.workflow).toBe("review");
    expect(payload.summary).toEqual(
      expect.objectContaining({
        status: "clean",
        filesNeedingAttention: 0,
        runtimeMode: "fetched-html",
        runtimeIssues: 0,
      }),
    );
    expect(payload.runtimeEvidence.requested).toBe(true);
    expect(payload.runtimeEvidence.result).toEqual(
      expect.objectContaining({
        inspectionMode: "fetched-html",
        page: expect.objectContaining({
          title: "Review Me",
        }),
      }),
    );
  });

  it("can verify a migrated result against a saved migration report", async () => {
    const rootDir = await createTempDir("salt-cli-review-migration-report");
    const reviewUrl = await startServer(`
      <!doctype html>
      <html>
        <head><title>Migrated Orders</title></head>
        <body>
          <header><nav aria-label="Primary"><a href="/orders">Orders</a></nav></header>
          <main>
            <button>Save</button>
            <button>Cancel</button>
          </main>
        </body>
      </html>
    `);
    await fs.mkdir(path.join(rootDir, "src"), { recursive: true });
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
      path.join(rootDir, "src", "Clean.tsx"),
      [
        'import { Link } from "@salt-ds/core";',
        "",
        "export function Clean() {",
        '  return <Link href="/orders">Orders</Link>;',
        "}",
        "",
      ].join("\n"),
      "utf8",
    );
    await fs.writeFile(
      path.join(rootDir, "migration-report.json"),
      `${JSON.stringify(
        {
          postMigrationVerification: {
            sourceChecks: [
              "Run salt-ds review on the migrated files after the first implementation pass.",
            ],
            runtimeChecks: [
              "Use salt-ds review --url after the first migration pass when landmarks, visible states, or runtime behavior still need verification.",
            ],
            preserveChecks: [
              "Keep the task flow and action hierarchy familiar for existing users.",
              "Preserve important landmarks for navigation and main content.",
            ],
            confirmationChecks: [
              "Confirm any intentional workflow changes before rollout.",
            ],
            suggestedWorkflow: "review",
            suggestedCommand: "salt-ds review src --url http://127.0.0.1:3000/",
          },
        },
        null,
        2,
      )}\n`,
      "utf8",
    );

    let stdout = "";
    let stderr = "";
    const exitCode = await runCli(
      withRegistry([
        "review",
        "src",
        "--url",
        reviewUrl,
        "--mode",
        "fetched-html",
        "--migration-report",
        "migration-report.json",
        "--json",
      ]),
      {
        cwd: rootDir,
        writeStdout: (message) => {
          stdout += message;
        },
        writeStderr: (message) => {
          stderr += message;
        },
      },
    );

    expect(exitCode).toBe(0);
    expect(stderr).toBe("");
    const payload = JSON.parse(stdout);
    expect(payload.migrationVerification).toEqual(
      expect.objectContaining({
        runtimeCompared: true,
        summary: expect.objectContaining({
          verified: expect.any(Number),
          manualReview: expect.any(Number),
          notChecked: 0,
        }),
        preserveChecks: expect.arrayContaining([
          expect.objectContaining({
            status: expect.stringMatching(/verified|manual_review/),
          }),
        ]),
      }),
    );
    expect(payload.notes).toEqual(
      expect.arrayContaining([
        expect.stringContaining("Loaded migration verification contract"),
      ]),
    );
  });

  it("prints runtime inspect json output", async () => {
    const url = await startServer(`
      <!doctype html>
      <html>
        <head><title>Inspect Me</title></head>
        <body>
          <main><button>Save</button></main>
        </body>
      </html>
    `);

    let stdout = "";
    const exitCode = await runCli(
      ["runtime", "inspect", url, "--json", "--mode", "fetched-html"],
      {
        writeStdout: (message) => {
          stdout += message;
        },
        writeStderr: () => {},
      },
    );

    expect(exitCode).toBe(0);
    const payload = JSON.parse(stdout);
    expect(payload.inspectionMode).toBe("fetched-html");
    expect(payload.page.title).toBe("Inspect Me");
    expect(
      payload.accessibility.landmarks.some(
        (entry: { role: string }) => entry.role === "main",
      ),
    ).toBe(true);
    expect(payload.layout.available).toBe(false);
  });

  it("prints browser-session runtime inspect output with screenshot artifacts", async (context) => {
    if (!(await canLaunchBrowser())) {
      context.skip();
      return;
    }

    const outputDir = await createTempDir("salt-cli-browser");
    const url = await startServer(`
        <!doctype html>
        <html>
          <head>
            <title>Before Browser</title>
            <script>
              document.title = "After Browser";
            </script>
          </head>
          <body>
            <main><button>Save</button></main>
          </body>
        </html>
      `);

    let stdout = "";
    const exitCode = await runCli(
      [
        "runtime",
        "inspect",
        url,
        "--json",
        "--mode",
        "browser",
        "--output-dir",
        outputDir,
      ],
      {
        writeStdout: (message) => {
          stdout += message;
        },
        writeStderr: () => {},
      },
    );

    expect(exitCode).toBe(0);
    const payload = JSON.parse(stdout);
    expect(payload.inspectionMode).toBe("browser-session");
    expect(payload.page.title).toBe("After Browser");
    expect(payload.layout.available).toBe(true);
    expect(payload.layout.nodes.length).toBeGreaterThan(0);
    expect(payload.screenshots.length).toBeGreaterThan(0);
    await expect(
      fs.access(payload.screenshots[0].path),
    ).resolves.toBeUndefined();
  }, 15_000);
});
