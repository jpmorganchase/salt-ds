import fs from "node:fs/promises";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildRegistry } from "@salt-ds/semantic-core/build/buildRegistry";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
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

async function createVisualEvidenceAdapterScript(
  rootDir: string,
): Promise<string> {
  const scriptPath = path.join(rootDir, "visual-evidence-adapter.mjs");
  await fs.writeFile(
    scriptPath,
    [
      "process.stdin.setEncoding('utf8');",
      "let input = '';",
      "process.stdin.on('data', (chunk) => { input += chunk; });",
      "process.stdin.on('end', () => {",
      "  const request = JSON.parse(input);",
      "  const visualEvidence = request.inputs.map((entry) => ({",
      "    kind: entry.kind,",
      "    source_type: entry.source_type,",
      "    source: entry.source,",
      "    label: entry.label,",
      "    confidence: entry.kind === 'screenshot' ? 'low' : 'high',",
      "    derived_outline:",
      "      entry.kind === 'screenshot'",
      "        ? {",
      "            regions: ['toolbar'],",
      "            actions: ['Refresh'],",
      "            states: ['loading'],",
      "            notes: ['Confirm the screenshot-only toolbar state against the running app.'],",
      "          }",
      "        : {",
      "            regions: ['header', 'sidebar', 'content', 'footer'],",
      "            actions: ['Save', 'Cancel'],",
      "            states: ['loading', 'empty'],",
      "            notes: ['Preserve the legacy action order in the first Salt pass.'],",
      "          },",
      "    notes:",
      "      entry.kind === 'screenshot'",
      "        ? ['Screenshot interpretation is approximate and should be confirmed.']",
      "        : ['Mockup interpretation is stable enough for the first migration pass.'],",
      "  }));",
      "  process.stdout.write(JSON.stringify({",
      "    contract: 'migrate_visual_evidence_v1',",
      "    visual_evidence: visualEvidence,",
      "    ambiguities: ['Screenshot-derived landmarks should be confirmed against runtime before implementation is finalized.'],",
      "  }));",
      "});",
    ].join("\n"),
    "utf8",
  );

  return JSON.stringify(["node", scriptPath]);
}

async function createBrokenVisualEvidenceAdapterScript(
  rootDir: string,
): Promise<string> {
  const scriptPath = path.join(rootDir, "broken-visual-evidence-adapter.mjs");
  await fs.writeFile(
    scriptPath,
    [
      "process.stdin.setEncoding('utf8');",
      "let input = '';",
      "process.stdin.on('data', (chunk) => { input += chunk; });",
      "process.stdin.on('end', () => {",
      "  process.stdout.write(JSON.stringify({",
      "    contract: 'migrate_visual_evidence_v1',",
      "    visual_evidence: [],",
      "  }));",
      "});",
    ].join("\n"),
    "utf8",
  );

  return JSON.stringify(["node", scriptPath]);
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
        review: false,
        migrate: false,
        upgrade: false,
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

  it("surfaces installed Salt version drift in info output", async () => {
    const rootDir = await createTempDir("salt-cli-info-version-drift");
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
    await fs.writeFile(
      path.join(rootDir, "package.json"),
      JSON.stringify(
        {
          dependencies: {
            "@salt-ds/core": "^2.0.0",
            "@salt-ds/icons": "^2.0.0",
            react: "^18.3.1",
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
    expect(payload.salt.installation.versionHealth).toEqual(
      expect.objectContaining({
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
    expect(payload.salt.installation.inspection).toEqual(
      expect.objectContaining({
        strategy: "node-modules-scan",
        status: "fallback",
        packageLayout: "node-modules",
        limitations: [],
        manifestOverrideFields: [],
      }),
    );
    expect(payload.salt.installation.remediation).toEqual(
      expect.objectContaining({
        explainCommand: null,
        dedupeCommand: null,
      }),
    );
    expect(payload.salt.installation.workspace).toEqual(
      expect.objectContaining({
        kind: "single-package",
        issueSourceHint: "package-local",
      }),
    );
    expect(payload.salt.installation.duplicatePackages).toEqual([
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
    expect(payload.salt.installation.healthSummary).toEqual(
      expect.objectContaining({
        health: "fail",
        recommendedAction: "inspect-dependency-drift",
        blockingWorkflows: ["review", "migrate", "upgrade"],
      }),
    );
    expect(payload.notes).toEqual(
      expect.arrayContaining([
        expect.stringContaining(
          "@salt-ds/core is installed 2 times across versions 1.9.0, 2.0.1",
        ),
        expect.stringContaining(
          "@salt-ds/core declares ^2.0.0 but resolves to 1.9.0",
        ),
        expect.stringContaining("Salt install health blocks workflows"),
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
        "index.js",
      ),
      [
        "exports.markets = {",
        '  contract: "project_conventions_v1",',
        '  id: "lob-markets",',
        '  version: "1.0.0",',
        '  project: "lob-markets",',
        '  supported_salt_range: "^2.0.0",',
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
              packageVersion: "1.2.3",
              conventionsVersion: "1.0.0",
              packId: "lob-markets",
              supportedSaltRange: "^2.0.0",
              status: "resolved",
              compatibility: expect.objectContaining({
                status: "compatible",
                checkedVersion: "2.0.0",
              }),
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
            packageVersion: "1.2.3",
            conventionsVersion: "1.0.0",
            packId: "lob-markets",
            supportedSaltRange: "^2.0.0",
            compatibility: expect.objectContaining({
              status: "compatible",
              checkedVersion: "2.0.0",
            }),
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
    expect(agents).toContain(
      "use repo-aware Salt workflows so Salt applies the declared project conventions",
    );
    expect(agents).toContain("salt-ds review");
    expect(agents).toContain("Do not inspect `node_modules`");
    expect(agents).toContain("run the repo `ui:verify` script");
    expect(agents).toContain("keep the first result canonical-only");
    expect(agents).toContain(
      "follow the returned canonical Salt follow-up before editing",
    );
    expect(agents).not.toContain("entity-grounding step");
    expect(agents).not.toContain("salt lint");
    expect(agents).not.toContain("salt doctor");
    expect(agents).not.toContain("salt runtime inspect");

    await expect(
      fs.access(path.join(rootDir, ".github", "copilot-instructions.md")),
    ).rejects.toBeTruthy();
    await expect(
      fs.access(path.join(rootDir, ".github", "agents", "salt-ui.agent.md")),
    ).rejects.toBeTruthy();

    const updatedPackageJson = JSON.parse(
      await fs.readFile(path.join(rootDir, "package.json"), "utf8"),
    ) as {
      scripts?: Record<string, string>;
    };
    expect(updatedPackageJson.scripts?.["ui:verify"]).toBeUndefined();

    expect(payload.notes).not.toEqual(
      expect.arrayContaining([
        expect.stringContaining(".github/copilot-instructions.md"),
        expect.stringContaining(".github/agents/salt-ui.agent.md"),
        expect.stringContaining("ui:verify"),
      ]),
    );
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
            "@salt-ds/core": "^2.0.0",
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
        "index.js",
      ),
      [
        "exports.markets = {",
        '  contract: "project_conventions_v1",',
        '  id: "lob-markets",',
        '  version: "1.0.0",',
        '  project: "lob-markets",',
        '  supported_salt_range: "^2.0.0",',
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
    expect(payload.summary).toEqual(
      expect.objectContaining({
        nextStep: expect.stringContaining("salt-ds info --json"),
      }),
    );
    expect(payload.notes).toEqual(
      expect.arrayContaining([
        expect.stringContaining(
          "Run salt-ds info --json to verify the layered conventions stack",
        ),
        expect.stringContaining(
          "Verified shared conventions pack @example/lob-salt-conventions#markets",
        ),
      ]),
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

  it("scaffolds IDE files and ui:verify only when explicitly requested", async () => {
    const rootDir = await createTempDir("salt-cli-init-existing-salt");
    await fs.mkdir(path.join(rootDir, "src"), { recursive: true });
    await fs.writeFile(
      path.join(rootDir, "package.json"),
      JSON.stringify(
        {
          name: "salt-cli-init-existing-salt",
          dependencies: {
            "@salt-ds/core": "^2.0.0",
            "@salt-ds/theme": "^2.0.0",
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
    const exitCode = await runCli(
      withRegistry([
        "init",
        ".",
        "--json",
        "--host-adapters",
        "vscode",
        "--add-ui-verify",
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

    await expect(
      fs.access(path.join(rootDir, "AGENTS.md")),
    ).resolves.toBeUndefined();
    await expect(
      fs.access(path.join(rootDir, ".github", "copilot-instructions.md")),
    ).resolves.toBeUndefined();
    await expect(
      fs.access(path.join(rootDir, ".github", "agents", "salt-ui.agent.md")),
    ).resolves.toBeUndefined();

    const packageJson = JSON.parse(
      await fs.readFile(path.join(rootDir, "package.json"), "utf8"),
    ) as { scripts?: Record<string, string> };
    expect(packageJson.scripts?.["ui:verify"]).toBe("salt-ds review src");
  });

  it("upgrades a legacy unmarked AGENTS bootstrap snippet into the managed Salt block", async () => {
    const rootDir = await createTempDir("salt-cli-init-legacy-agents");
    await fs.writeFile(
      path.join(rootDir, "package.json"),
      JSON.stringify(
        {
          name: "salt-cli-init-legacy-agents",
          private: true,
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
      path.join(rootDir, "AGENTS.md"),
      [
        "Team-specific notes stay here.",
        "",
        "Use the Salt MCP for canonical Salt guidance.",
        "",
        "Treat requests to build, refine, restyle, or structurally fix UI in this repo as Salt UI tasks by default when they touch dashboards, metrics, navigation, forms, dialogs, tables, layouts, or alignment/composition fixes on existing Salt UI.",
        "",
        "Do not complete Salt UI tasks with generic React/CSS output if a canonical Salt option exists.",
        "",
        "For Salt UI tasks, complete:",
        "",
        "- a selection step through Salt MCP or the Salt CLI fallback",
        "- a validation step through the Salt review workflow (`salt-ds review` in CLI hosts)",
        "- if the workflow output says stronger grounding is needed, follow the returned canonical Salt follow-up before editing",
        "",
        "If Salt MCP is unavailable and the Salt CLI is available, keep the same workflow and let the environment use the CLI fallback for canonical Salt guidance.",
        "",
        "If a Salt workflow result says project conventions matter:",
        "",
        "- keep repo-local policy in `.salt/team.json` when it exists",
        "- use `.salt/stack.json` only when the repo already declares layered upstream policy",
        "- use repo-aware Salt workflows so Salt applies the declared project conventions",
        "- keep the canonical Salt choice visible as provenance",
        "",
        "Default to `.salt/team.json` for simple repos. Add `.salt/stack.json` only when shared upstream layers or explicit merge ordering are real.",
        "",
      ].join("\n"),
      "utf8",
    );

    let stdout = "";
    const exitCode = await runCli(withRegistry(["init", ".", "--json"]), {
      cwd: rootDir,
      writeStdout: (message) => {
        stdout += message;
      },
      writeStderr: () => {},
    });

    expect(exitCode).toBe(0);
    const payload = JSON.parse(stdout);
    expect(payload.repoInstructions).toEqual(
      expect.objectContaining({
        action: "updated",
        filename: "AGENTS.md",
      }),
    );

    const agents = await fs.readFile(path.join(rootDir, "AGENTS.md"), "utf8");
    expect(agents).toContain("Team-specific notes stay here.");
    expect(agents).toContain("<!-- salt-ds:repo-instructions:start -->");
    expect(agents).toContain("keep the first result canonical-only");
    expect(agents).not.toContain(
      "Do not choose Salt components, patterns, props, tokens, or write Salt-specific code until both the canonical selection step and the validation step have completed successfully.",
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
    expect(claude).toContain(
      "use repo-aware Salt workflows so Salt applies the declared project conventions",
    );
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
    expect(payload.workflow.id).toBe("create");
    expect(payload.workflow.transportUsed).toBe("cli");
    expect(payload.result.intent).toEqual(
      expect.objectContaining({
        userTask: "link to another page from a toolbar action",
        ruleIds: expect.arrayContaining([
          "create-task-first",
          "create-canonical-before-custom",
        ]),
      }),
    );
    expect(payload.workflow.confidence).toEqual(
      expect.objectContaining({
        level: expect.any(String),
        reasons: expect.arrayContaining([expect.any(String)]),
      }),
    );
    expect(payload.workflow.implementationGate).toEqual(
      expect.objectContaining({
        status: expect.stringMatching(/^(clear|follow_through_required)$/),
        required_follow_through: expect.any(Array),
      }),
    );
    expect(payload.result.summary).toEqual(
      expect.objectContaining({
        mode: "recommend",
        decisionName: expect.any(String),
        starterValidationStatus: expect.stringMatching(
          /^(clean|needs_attention)$/,
        ),
      }),
    );
    expect(payload.workflow.readiness).toEqual(
      expect.objectContaining({
        status: expect.stringMatching(
          /^(guidance_only|starter_validated|starter_needs_attention)$/,
        ),
        implementationReady: expect.any(Boolean),
        reason: expect.any(String),
      }),
    );
    expect(payload.workflow.contextRequirement).toEqual(
      expect.objectContaining({
        status: "context_checked",
        repoSpecificEditsReady: true,
        satisfiedBy: "salt-ds info",
      }),
    );
    expect(payload.artifacts.starterValidation).toEqual(
      expect.objectContaining({
        status: expect.stringMatching(/^(clean|needs_attention)$/),
        snippets_checked: expect.any(Number),
        source_urls: expect.any(Array),
      }),
    );
    expect(payload.workflow.projectConventionsCheck).toEqual(
      expect.objectContaining({
        contract: "project_conventions_v1",
        suggested_follow_up_tool: "get_salt_project_context",
      }),
    );
    expect(payload.workflow.provenance).toEqual(
      expect.objectContaining({
        canonical_source_urls: expect.any(Array),
        related_guide_urls: expect.any(Array),
        project_conventions_contract: "project_conventions_v1",
      }),
    );
    expect(payload.result.recommendation.suggested_follow_ups).toEqual(
      expect.any(Array),
    );
    expect(payload.result.recommendation.composition_contract).toEqual(
      expect.objectContaining({
        primary_target: {
          solution_type: "component",
          name: "Link",
        },
        expected_components: ["Link"],
      }),
    );
    expect(payload.result.recommendation.open_questions).toBeUndefined();
    expect(
      payload.result.recommendation.suggested_follow_ups.every(
        (followUp: { workflow: string }) =>
          ["info", "create", "review", "migrate", "upgrade"].includes(
            followUp.workflow,
          ),
      ),
    ).toBe(true);
    expect(payload.artifacts.notes).toEqual(
      expect.arrayContaining([
        expect.stringContaining(
          "No .salt/team.json or .salt/stack.json is declared yet.",
        ),
      ]),
    );
  });

  it("treats create --include-starter-code false as an explicit guidance-only escape hatch", async () => {
    const rootDir = await createTempDir("salt-cli-create-guidance-only");
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
        "false",
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
    expect(payload.workflow.readiness).toEqual(
      expect.objectContaining({
        status: "guidance_only",
        implementationReady: false,
      }),
    );
    expect(payload.artifacts.starterValidation).toBeNull();
  });

  it("surfaces a repo-refined final decision when project policy declares an approved wrapper", async () => {
    const rootDir = await createTempDir("salt-cli-create-wrapper-policy");
    await fs.mkdir(path.join(rootDir, ".salt"), { recursive: true });
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
      path.join(rootDir, ".salt", "team.json"),
      JSON.stringify(
        {
          contract: "project_conventions_v1",
          approved_wrappers: [
            {
              name: "AppLink",
              wraps: "Link",
              reason: "Route links must use the repo wrapper.",
              import: {
                from: "@/navigation/AppLink",
                name: "AppLink",
              },
              docs: ["./docs/router-policy.md"],
            },
          ],
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
        "navigate to another route",
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
    expect(payload.result.summary).toEqual(
      expect.objectContaining({
        decisionName: "Link",
        finalDecisionName: "AppLink",
        finalDecisionSource: "project_policy",
      }),
    );
    expect(payload.artifacts.projectPolicy).toEqual(
      expect.objectContaining({
        approvedWrappers: ["AppLink"],
        approvedWrapperDetails: expect.arrayContaining([
          expect.objectContaining({
            name: "AppLink",
            wraps: "Link",
            sourceUrls: ["./docs/router-policy.md"],
          }),
        ]),
      }),
    );
    expect(payload.artifacts.repoRefinement).toEqual(
      expect.objectContaining({
        status: "refined_by_project_policy",
        canonical_name: "Link",
        final_name: "AppLink",
        source: "project_policy",
      }),
    );
    expect(payload.result.recommendation.starter_code?.[0]?.code).toContain(
      'import { AppLink } from "@/navigation/AppLink";',
    );
  });

  it("keeps the create final decision canonical when a repo wrapper has no import metadata", async () => {
    const rootDir = await createTempDir("salt-cli-create-wrapper-warning");
    await fs.mkdir(path.join(rootDir, ".salt"), { recursive: true });
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
      path.join(rootDir, ".salt", "team.json"),
      JSON.stringify(
        {
          contract: "project_conventions_v1",
          approved_wrappers: [
            {
              name: "AppLink",
              wraps: "Link",
              reason: "Route links should use the repo wrapper.",
              docs: ["./docs/router-policy.md"],
            },
          ],
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
        "navigate to another route",
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
    expect(payload.result.summary).toEqual(
      expect.objectContaining({
        decisionName: "Link",
        finalDecisionName: "Link",
        finalDecisionSource: "canonical_salt",
      }),
    );
    expect(payload.artifacts.repoRefinement).toEqual(
      expect.objectContaining({
        status: "canonical_only",
        canonical_name: "Link",
        final_name: "Link",
        source: "canonical_salt",
        reason: expect.stringContaining("no import metadata"),
      }),
    );
    expect(payload.result.recommendation.starter_code?.[0]?.code).not.toContain(
      "AppLink",
    );
    expect(payload.artifacts.notes).toEqual(
      expect.arrayContaining([
        expect.stringContaining("no actionable import metadata"),
      ]),
    );
  });

  it("uses the default JPM Brand theme bootstrap in pattern starter code for new create work", async () => {
    const rootDir = await createTempDir("salt-cli-create-dashboard");
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
        "metrics dashboard",
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

    expect(exitCode).toBe(2);
    expect(stderr).toBe("");
    const payload = JSON.parse(stdout);
    expect(payload.result.recommendation.recommended.name).toBe(
      "Analytical dashboard",
    );
    expect(payload.result.recommendation.starter_code?.[0]?.code).toContain(
      "SaltProviderNext",
    );
    expect(payload.result.recommendation.starter_code?.[0]?.code).toContain(
      'accent="teal"',
    );
    expect(payload.result.recommendation.starter_code?.[0]?.code).toContain(
      "<BorderLayout>",
    );
    expect(payload.result.recommendation.starter_code?.[0]?.code).toContain(
      '<BorderItem position="north" as="header">',
    );
    expect(payload.result.recommendation.starter_code?.[0]?.code).toContain(
      '<BorderItem position="center" as="main">',
    );
    expect(payload.result.recommendation.starter_code?.[0]?.code).toContain(
      '<GridLayout columns={12} gap={3} aria-label="Dashboard modules">',
    );
    expect(payload.result.recommendation.starter_code?.[0]?.code).toContain(
      "Metric subtitle or subvalue",
    );
    expect(payload.result.recommendation.starter_code?.[0]?.code).toContain(
      "Fixed panel: filters, toggles, and controls",
    );
    expect(payload.result.recommendation.starter_code?.[0]?.notes).toEqual(
      expect.arrayContaining([
        expect.stringContaining("JPM Brand theme bootstrap"),
      ]),
    );
    expect(payload.artifacts.starterValidation).toEqual(
      expect.objectContaining({
        status: expect.stringMatching(/^(clean|needs_attention)$/),
        snippets_checked: expect.any(Number),
      }),
    );
    expect(payload.workflow.confidence.raiseConfidence).toEqual(
      expect.arrayContaining([
        expect.stringContaining(
          "verify the exact name against canonical Salt guidance",
        ),
      ]),
    );
  });

  it("returns a composition contract and open questions for broad dashboard create work", async () => {
    const rootDir = await createTempDir("salt-cli-create-dashboard-contract");
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
        "create a finance metric dashboard with KPI cards, sparklines, and a data grid table",
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

    expect(exitCode).toBe(2);
    expect(stderr).toBe("");
    const payload = JSON.parse(stdout);
    expect(payload.result.recommendation.composition_contract).toEqual(
      expect.objectContaining({
        primary_target: {
          solution_type: "pattern",
          name: "Analytical dashboard",
        },
        expected_patterns: expect.arrayContaining(["Metric"]),
        expected_components: expect.arrayContaining(["Data grid", "Table"]),
        slots: expect.arrayContaining([
          expect.objectContaining({
            id: "key-metrics",
            certainty: "strongly_implied",
            preferred_patterns: expect.arrayContaining(["Metric"]),
          }),
          expect.objectContaining({
            id: "main-body",
            certainty: "confirmation_needed",
            preferred_components: expect.arrayContaining([
              "Data grid",
              "Table",
            ]),
          }),
        ]),
      }),
    );
    expect(payload.result.recommendation.open_questions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          kind: "component-choice",
          topic: "tabular-data",
          choices: ["Data grid", "Table"],
        }),
      ]),
    );
    expect(payload.workflow.confidence).toEqual(
      expect.objectContaining({
        askBeforeProceeding: true,
      }),
    );
  });

  it("keeps the paraphrased finance dashboard create prompt on analytical dashboard", async () => {
    const rootDir = await createTempDir("salt-cli-create-dashboard-paraphrase");
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
        "Finance-themed metric dashboard with key financial metrics like revenue, expenses, profit margin, and portfolio performance",
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

    expect(exitCode).toBe(2);
    expect(stderr).toBe("");
    const payload = JSON.parse(stdout);
    expect(payload.result.recommendation.decision.name).toBe(
      "Analytical dashboard",
    );
    expect(payload.workflow.implementationGate).toEqual(
      expect.objectContaining({
        status: "follow_through_required",
        required_follow_through: expect.arrayContaining(["Metric"]),
      }),
    );
  });

  it("keeps narrow single-metric create prompts on Metric", async () => {
    const rootDir = await createTempDir("salt-cli-create-single-metric");
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
        "Create a metric card for revenue with a trend indicator",
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
    expect(payload.result.recommendation.decision.name).toBe("Metric");
  });

  it("accepts --type composition as a create alias for pattern composition work", async () => {
    const rootDir = await createTempDir("salt-cli-create-composition-alias");
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
        "Finance-themed metric dashboard with key financial metrics like revenue, expenses, profit margin, and portfolio performance",
        "--type",
        "composition",
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

    expect(exitCode).toBe(2);
    expect(stderr).toBe("");
    const payload = JSON.parse(stdout);
    expect(payload.result.recommendation.decision.name).toBe(
      "Analytical dashboard",
    );
  });

  it("surfaces repo theme defaults in create policy artifacts when project policy declares them", async () => {
    const rootDir = await createTempDir("salt-cli-create-theme-policy");
    await fs.mkdir(path.join(rootDir, ".salt"), { recursive: true });
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
    await fs.writeFile(
      path.join(rootDir, ".salt", "team.json"),
      JSON.stringify(
        {
          contract: "project_conventions_v1",
          theme_defaults: {
            provider: "BrandShellProvider",
            provider_import: {
              from: "@/theme/BrandShellProvider",
              name: "BrandShellProvider",
            },
            imports: ["@/theme/brand-shell.css"],
            props: [{ name: "density", value: "high" }],
            reason: "The repo uses one approved shell bootstrap.",
            docs: ["./docs/theme-policy.md"],
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
        "create a large metric",
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
    expect(payload.artifacts.projectPolicy.themeDefaults).toEqual(
      expect.objectContaining({
        provider: "BrandShellProvider",
        providerImport: {
          from: "@/theme/BrandShellProvider",
          name: "BrandShellProvider",
        },
        imports: ["@/theme/brand-shell.css"],
        props: [{ name: "density", value: "high" }],
      }),
    );
    expect(payload.artifacts.notes).toEqual(
      expect.arrayContaining([
        expect.stringContaining("Repo theme default: BrandShellProvider"),
      ]),
    );
    expect(
      payload.result.recommendation.starter_code?.[0]?.source_urls,
    ).toEqual(
      expect.arrayContaining(["./team.json", "./docs/theme-policy.md"]),
    );
  });

  it("does not partially rewrite theme bootstrap starters when a custom provider is missing provider_import metadata", async () => {
    const rootDir = await createTempDir("salt-cli-create-theme-policy-warning");
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
    await fs.mkdir(path.join(rootDir, ".salt"), { recursive: true });
    await fs.writeFile(
      path.join(rootDir, ".salt", "team.json"),
      JSON.stringify(
        {
          contract: "project_conventions_v1",
          theme_defaults: {
            provider: "BrandShellProvider",
            imports: ["@/theme/brand-shell.css"],
            props: [{ name: "density", value: "high" }],
            reason: "The repo uses one approved shell bootstrap.",
            docs: ["./docs/theme-policy.md"],
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
        "create a large metric",
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

    expect(exitCode).toBe(2);
    expect(stderr).toBe("");
    const payload = JSON.parse(stdout);
    expect(payload.workflow.readiness).toEqual(
      expect.objectContaining({
        status: "starter_needs_attention",
        implementationReady: false,
        reason: expect.stringContaining("provider_import"),
      }),
    );
    expect(payload.result.summary).toEqual(
      expect.objectContaining({
        starterValidationStatus: "needs_attention",
        nextStep: expect.stringContaining("provider_import"),
      }),
    );
    expect(payload.result.recommendation.starter_code?.[0]?.code).not.toContain(
      "BrandShellProvider",
    );
    expect(payload.result.recommendation.starter_code?.[0]?.code).not.toContain(
      'import "@/theme/brand-shell.css";',
    );
    expect(payload.result.recommendation.starter_code?.[0]?.code).not.toContain(
      'density="high"',
    );
    expect(payload.artifacts.projectPolicy.warnings).toEqual(
      expect.arrayContaining([expect.stringContaining("provider_import")]),
    );
  });

  it("preserves the metric pattern anatomy in starter code for metric create work", async () => {
    const rootDir = await createTempDir("salt-cli-create-metric");
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
        "create a large metric",
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
    expect(payload.result.recommendation.recommended.name).toBe("Metric");
    expect(payload.result.recommendation.starter_code?.[0]?.code).toContain(
      "Performance",
    );
    expect(payload.result.recommendation.starter_code?.[0]?.code).toContain(
      "Display1",
    );
    expect(payload.result.recommendation.starter_code?.[0]?.notes).toEqual(
      expect.arrayContaining([
        expect.stringContaining("Build around: Metric value"),
        expect.stringContaining(
          "Starter code is based on the closest extracted pattern story example",
        ),
      ]),
    );
    expect(payload.artifacts.starterValidation).toEqual(
      expect.objectContaining({
        status: expect.stringMatching(/^(clean|needs_attention)$/),
        snippets_checked: expect.any(Number),
      }),
    );
  });

  it("routes structured navigation shell create queries to Vertical navigation", async () => {
    const rootDir = await createTempDir("salt-cli-create-vertical-navigation");
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
        "sidebar navigation with nested sections",
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

    expect(exitCode).toBe(2);
    expect(stderr).toBe("");
    const payload = JSON.parse(stdout);
    expect(payload.result.recommendation.solution_type).toBe("pattern");
    expect(payload.result.recommendation.recommended.name).toBe(
      "Vertical navigation",
    );
    expect(payload.result.recommendation.starter_code?.[0]?.code).toContain(
      "NavigationItem",
    );
    expect(payload.result.recommendation.starter_code?.[0]?.code).toContain(
      "NestedGroup",
    );
    expect(payload.result.recommendation.starter_code?.[0]?.notes).toEqual(
      expect.arrayContaining([
        expect.stringContaining("Required scaffold regions: navigation-pane"),
        expect.stringContaining("Optional scaffold regions: nested-navigation"),
      ]),
    );
    expect(payload.workflow.readiness.status).toBe("starter_needs_attention");
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
          packId: "lob-markets",
          supportedSaltRange: "^1.2.0",
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
    expect(payload.workflow.id).toBe("review");
    expect(payload.workflow.transportUsed).toBe("cli");
    expect(payload.artifacts.issueClasses).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          ruleId: "review-canonical-mismatch",
        }),
      ]),
    );
    expect(payload.artifacts.ruleIds).toEqual(
      expect.arrayContaining(["review-canonical-mismatch"]),
    );
    expect(payload.workflow.confidence).toEqual(
      expect.objectContaining({
        level: expect.any(String),
        reasons: expect.arrayContaining([expect.any(String)]),
      }),
    );
    expect(payload.result.summary).toEqual(
      expect.objectContaining({
        status: "needs_attention",
        filesNeedingAttention: 1,
      }),
    );
    expect(payload.artifacts.context.registry).toEqual(
      expect.objectContaining({
        available: true,
      }),
    );
    expect(payload.result.sourceValidation.files[0]?.issues).toEqual(
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
    expect(payload.workflow.id).toBe("review");
    expect(payload.artifacts.fixCandidates).toEqual(
      expect.objectContaining({
        totalCount: expect.any(Number),
        deterministicCount: 1,
      }),
    );
    expect(payload.result.summary).toEqual(
      expect.objectContaining({
        status: "needs_attention",
        fixCandidateCount: expect.any(Number),
        deterministicFixCandidateCount: 1,
      }),
    );
    expect(payload.artifacts.fixCandidates.files).toEqual(
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

  it("treats repo-policy-only review guidance as needs_attention", async () => {
    const rootDir = await createTempDir("salt-cli-review-project-policy");
    await fs.mkdir(path.join(rootDir, "src"), { recursive: true });
    await fs.mkdir(path.join(rootDir, ".salt"), { recursive: true });
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
      path.join(rootDir, ".salt", "team.json"),
      JSON.stringify(
        {
          contract: "project_conventions_v1",
          approved_wrappers: [
            {
              name: "AppLink",
              wraps: "Link",
              reason: "Repo links use the router wrapper.",
              import: {
                from: "@/navigation/AppLink",
                name: "AppLink",
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
      path.join(rootDir, "src", "LinkOnly.tsx"),
      [
        'import { Link } from "@salt-ds/core";',
        "",
        "export function LinkOnly() {",
        '  return <Link href="/next">Next</Link>;',
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
    expect(payload.result.summary).toEqual(
      expect.objectContaining({
        status: "needs_attention",
        filesNeedingAttention: 1,
        fixCandidateCount: 1,
        manualReviewFixCandidateCount: 1,
      }),
    );
    expect(payload.artifacts.fixCandidates.files).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          relativePath: path.join("src", "LinkOnly.tsx"),
          candidates: expect.arrayContaining([
            expect.objectContaining({
              ruleId: "review-project-policy-wrapper",
              category: "project-policy",
            }),
          ]),
        }),
      ]),
    );
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
    const exitCode = await runCli(
      withRegistry(["migrate", query, "--json", "--include-starter-code"]),
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

    expect(exitCode).toBe(2);
    expect(stderr).toBe("");
    const payload = JSON.parse(stdout);
    expect(payload.workflow.id).toBe("migrate");
    expect(payload.workflow.transportUsed).toBe("cli");
    expect(payload.artifacts.ruleIds).toEqual(
      expect.arrayContaining([
        "migrate-preserve-task-flow",
        "migrate-move-toward-canonical-salt",
      ]),
    );
    expect(payload.workflow.confidence).toEqual(
      expect.objectContaining({
        level: expect.any(String),
        reasons: expect.arrayContaining([expect.any(String)]),
      }),
    );
    expect(payload.result.summary).toEqual(
      expect.objectContaining({
        translationCount: expect.any(Number),
        manualReviews: expect.any(Number),
        confirmationRequired: expect.any(Number),
        starterValidationStatus: expect.stringMatching(
          /^(clean|needs_attention)$/,
        ),
      }),
    );
    expect(payload.workflow.readiness).toEqual(
      expect.objectContaining({
        status: "starter_needs_attention",
        implementationReady: false,
        reason: expect.any(String),
      }),
    );
    expect(payload.workflow.contextRequirement).toEqual(
      expect.objectContaining({
        status: "context_checked",
        repoSpecificEditsReady: true,
        satisfiedBy: "salt-ds info",
      }),
    );
    expect(payload.artifacts.starterValidation).toEqual(
      expect.objectContaining({
        status: expect.stringMatching(/^(clean|needs_attention)$/),
        snippets_checked: expect.any(Number),
        source_urls: expect.any(Array),
      }),
    );
    expect(payload.result.migrationScope).toEqual(
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
    expect(payload.artifacts.visualEvidence).toEqual(
      expect.objectContaining({
        contract: expect.objectContaining({
          role: "supporting-evidence",
          supportedInputs: expect.arrayContaining([
            "structured-outline",
            "current-ui-capture",
            "mockup-image",
            "screenshot-file",
            "image-url",
          ]),
          interpretationOwner: "agent-or-adapter",
          normalizationRequired: true,
        }),
        interpretationOwner: "agent-or-adapter",
        inputs: expect.objectContaining({
          structuredOutline: expect.objectContaining({
            provided: false,
          }),
          currentUiCapture: expect.objectContaining({
            requested: false,
            currentExperienceCaptured: false,
          }),
          mockups: [],
          screenshots: [],
        }),
        derivedOutline: expect.objectContaining({
          available: false,
        }),
        confidenceImpact: expect.objectContaining({
          level: "none",
          changedScoping: false,
        }),
        ambiguities: [],
      }),
    );
    expect(payload.artifacts.postMigrationVerification).toEqual(
      expect.objectContaining({
        sourceChecks: expect.arrayContaining([expect.any(String)]),
        preserveChecks: expect.arrayContaining([
          expect.stringContaining("task flow"),
        ]),
        suggestedWorkflow: "review",
      }),
    );
    expect(payload.result.translation.familiarity_contract).toEqual(
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
    expect(payload.result.translation.migration_checkpoints).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          phase: "before",
        }),
        expect.objectContaining({
          phase: "after",
        }),
      ]),
    );
    expect(payload.result.translation.translations).toEqual(
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

  it("returns a non-zero exit code when migrate starter output is blocked by repo theme policy", async () => {
    const rootDir = await createTempDir(
      "salt-cli-migrate-theme-policy-warning",
    );
    const query = (
      await readVisualMigrationFixture("legacy-orders.query.txt")
    ).trim();
    await fs.mkdir(path.join(rootDir, ".salt"), { recursive: true });
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
    await fs.writeFile(
      path.join(rootDir, ".salt", "team.json"),
      JSON.stringify(
        {
          contract: "project_conventions_v1",
          theme_defaults: {
            provider: "BrandShellProvider",
            imports: ["@/theme/brand-shell.css"],
            props: [{ name: "density", value: "high" }],
            reason: "The repo uses one approved shell bootstrap.",
            docs: ["./docs/theme-policy.md"],
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
      withRegistry(["migrate", query, "--json", "--include-starter-code"]),
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

    expect(exitCode).toBe(2);
    expect(stderr).toBe("");
    const payload = JSON.parse(stdout);
    expect(payload.workflow.readiness).toEqual(
      expect.objectContaining({
        status: "starter_needs_attention",
        implementationReady: false,
        reason: expect.stringContaining("--salt-size-base"),
      }),
    );
    expect(payload.result.summary).toEqual(
      expect.objectContaining({
        starterValidationStatus: "needs_attention",
      }),
    );
    expect(payload.artifacts.projectPolicy.warnings).toEqual(
      expect.arrayContaining([expect.stringContaining("provider_import")]),
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

    expect(exitCode).toBe(2);
    expect(stderr).toBe("");
    const payload = JSON.parse(stdout);
    expect(payload.workflow.id).toBe("migrate");
    expect(payload.artifacts.postMigrationVerification).toEqual(
      expect.objectContaining({
        runtimeChecks: expect.arrayContaining([expect.any(String)]),
      }),
    );
    expect(payload.result.migrationScope).toEqual(
      expect.objectContaining({
        currentExperienceCaptured: true,
      }),
    );
    expect(payload.artifacts.runtimeEvidence).toEqual(
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
    expect(payload.artifacts.visualEvidence).toEqual(
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
          mockups: [],
          screenshots: [],
        }),
        derivedOutline: expect.objectContaining({
          available: false,
        }),
        confidenceImpact: expect.objectContaining({
          level: "supporting",
          reasons: expect.arrayContaining([
            expect.stringContaining("Current UI capture contributed"),
          ]),
          changedScoping: true,
        }),
      }),
    );
    expect(payload.result.summary.runtimeMode).toBe("fetched-html");
    expect(payload.artifacts.notes).toEqual(
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
    expect(payload.workflow.id).toBe("migrate");
    expect(payload.result.translation.source_ui_model.page_regions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ kind: "header" }),
        expect.objectContaining({ kind: "sidebar" }),
      ]),
    );
    expect(payload.artifacts.visualEvidence).toEqual(
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
          mockups: [],
          screenshots: [],
        }),
        derivedOutline: expect.objectContaining({
          available: true,
          regions: 4,
          actions: 2,
          states: 2,
          notes: 1,
        }),
        confidenceImpact: expect.objectContaining({
          level: "supporting",
          reasons: expect.arrayContaining([
            expect.stringContaining("Structured outline signals"),
          ]),
        }),
      }),
    );
    expect(payload.workflow.confidence.reasons).toEqual(
      expect.arrayContaining([
        "Structured visual evidence was used to model regions, actions, and states before translation.",
      ]),
    );
    expect(payload.artifacts.notes).toEqual(
      expect.arrayContaining([
        expect.stringContaining(
          "Structured visual evidence from --source-outline was used",
        ),
        "Canonical Salt guidance remained the source of truth; visual evidence only scoped the migration.",
      ]),
    );
  });

  it("fails closed when mockup or screenshot inputs are provided without a configured adapter", async () => {
    const rootDir = await createTempDir("salt-cli-migrate-visual-no-adapter");
    const mockupPath = path.join(rootDir, "legacy-orders.mockup.txt");
    await fs.writeFile(mockupPath, "mockup placeholder", "utf8");
    const previousAdapter = process.env.SALT_DS_MIGRATE_VISUAL_ADAPTER;
    delete process.env.SALT_DS_MIGRATE_VISUAL_ADAPTER;

    let stdout = "";
    let stderr = "";
    try {
      const exitCode = await runCli(
        withRegistry(["migrate", "--mockup", mockupPath, "--json"]),
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

      expect(exitCode).toBe(1);
      expect(stdout).toBe("");
      expect(stderr).toContain("SALT_DS_MIGRATE_VISUAL_ADAPTER");
      expect(stderr).toContain("--source-outline");
    } finally {
      if (previousAdapter == null) {
        delete process.env.SALT_DS_MIGRATE_VISUAL_ADAPTER;
      } else {
        process.env.SALT_DS_MIGRATE_VISUAL_ADAPTER = previousAdapter;
      }
    }
  });

  it("accepts adapter-derived mockup and screenshot evidence for migrate scoping", async () => {
    const rootDir = await createTempDir("salt-cli-migrate-visual-adapter");
    const mockupPath = path.join(rootDir, "legacy-orders.mockup.txt");
    const screenshotPath = path.join(rootDir, "legacy-orders.screenshot.txt");
    await fs.writeFile(mockupPath, "mockup placeholder", "utf8");
    await fs.writeFile(screenshotPath, "screenshot placeholder", "utf8");
    const adapterCommand = await createVisualEvidenceAdapterScript(rootDir);
    const previousAdapter = process.env.SALT_DS_MIGRATE_VISUAL_ADAPTER;
    process.env.SALT_DS_MIGRATE_VISUAL_ADAPTER = adapterCommand;

    let stdout = "";
    let stderr = "";
    try {
      const exitCode = await runCli(
        withRegistry([
          "migrate",
          "--mockup",
          mockupPath,
          "--screenshot",
          screenshotPath,
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
      expect(payload.workflow.id).toBe("migrate");
      expect(payload.workflow.confidence).toEqual(
        expect.objectContaining({
          level: "low",
          askBeforeProceeding: true,
          reasons: expect.arrayContaining([
            "Migration recommendations come from generic Salt translation heuristics rather than library-specific rules.",
            "Some translated areas require explicit confirmation before the Salt result is treated as final.",
            "Adapter-derived visual evidence was used to model regions, actions, and states before translation.",
            "Some visual evidence was interpreted at low confidence and should stay provisional until it is confirmed.",
            "The visual evidence still has ambiguities that should be resolved before implementation is treated as final.",
          ]),
        }),
      );
      expect(payload.result.migrationScope.questions).toEqual(
        expect.arrayContaining([
          expect.stringContaining(
            "low-confidence screenshot or mockup interpretation",
          ),
          expect.stringContaining(
            "Screenshot-derived landmarks should be confirmed",
          ),
        ]),
      );
      expect(payload.artifacts.visualEvidence).toEqual(
        expect.objectContaining({
          interpretationOwner: "agent-or-adapter",
          inputs: expect.objectContaining({
            structuredOutline: expect.objectContaining({
              provided: false,
            }),
            mockups: expect.arrayContaining([
              expect.objectContaining({
                sourceType: "file",
                source: expect.stringContaining("legacy-orders.mockup.txt"),
                confidence: "high",
                regions: 4,
                actions: 2,
                states: 2,
                notes: 1,
              }),
            ]),
            screenshots: expect.arrayContaining([
              expect.objectContaining({
                sourceType: "file",
                source: expect.stringContaining("legacy-orders.screenshot.txt"),
                confidence: "low",
                regions: 1,
                actions: 1,
                states: 1,
                notes: 1,
              }),
            ]),
          }),
          derivedOutline: expect.objectContaining({
            available: true,
            regions: 5,
            actions: 3,
            states: 2,
            notes: 2,
          }),
          confidenceImpact: expect.objectContaining({
            level: "supporting",
            changedScoping: true,
          }),
          ambiguities: expect.arrayContaining([
            expect.stringContaining("Screenshot-derived landmarks"),
            expect.stringContaining("Low-confidence visual interpretation"),
          ]),
        }),
      );
      expect(payload.workflow.confidence.reasons).toEqual(
        expect.arrayContaining([
          "Adapter-derived visual evidence was used to model regions, actions, and states before translation.",
        ]),
      );
      expect(payload.artifacts.notes).toEqual(
        expect.arrayContaining([
          expect.stringContaining("Adapter-derived visual evidence was used"),
          "Canonical Salt guidance remained the source of truth; visual evidence only scoped the migration.",
        ]),
      );
      expect(payload.artifacts.postMigrationVerification).toEqual(
        expect.objectContaining({
          sourceChecks: expect.arrayContaining([
            expect.stringContaining(
              "low-confidence screenshot or mockup interpretations",
            ),
          ]),
          confirmationChecks: expect.arrayContaining([
            expect.stringContaining("low-confidence visual interpretations"),
            expect.stringContaining(
              "Screenshot-derived landmarks should be confirmed",
            ),
          ]),
        }),
      );
    } finally {
      if (previousAdapter == null) {
        delete process.env.SALT_DS_MIGRATE_VISUAL_ADAPTER;
      } else {
        process.env.SALT_DS_MIGRATE_VISUAL_ADAPTER = previousAdapter;
      }
    }
  });

  it("fails closed when the visual adapter returns no normalized evidence", async () => {
    const rootDir = await createTempDir(
      "salt-cli-migrate-visual-empty-adapter",
    );
    const mockupPath = path.join(rootDir, "legacy-orders.mockup.txt");
    await fs.writeFile(mockupPath, "mockup placeholder", "utf8");
    const adapterCommand =
      await createBrokenVisualEvidenceAdapterScript(rootDir);
    const previousAdapter = process.env.SALT_DS_MIGRATE_VISUAL_ADAPTER;
    process.env.SALT_DS_MIGRATE_VISUAL_ADAPTER = adapterCommand;

    let stdout = "";
    let stderr = "";
    try {
      const exitCode = await runCli(
        withRegistry(["migrate", "--mockup", mockupPath, "--json"]),
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

      expect(exitCode).toBe(1);
      expect(stdout).toBe("");
      expect(stderr).toContain("returned no normalized visual evidence");
      expect(stderr).toContain("--source-outline");
    } finally {
      if (previousAdapter == null) {
        delete process.env.SALT_DS_MIGRATE_VISUAL_ADAPTER;
      } else {
        process.env.SALT_DS_MIGRATE_VISUAL_ADAPTER = previousAdapter;
      }
    }
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

    expect(exitCode).toBe(2);
    expect(stderr).toBe("");
    const payload = JSON.parse(stdout);
    expect(payload.workflow.id).toBe("migrate");
    expect(payload.artifacts.visualEvidence.confidenceImpact.level).toBe(
      "stronger-scoping",
    );
    expect(payload.result.migrationScope.questions).toEqual(
      expect.arrayContaining([
        expect.stringContaining("live landmarks"),
        expect.stringContaining("live actions"),
        expect.stringContaining("outlined states"),
      ]),
    );
    expect(payload.artifacts.postMigrationVerification).toEqual(
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
    expect(payload.artifacts.notes).toEqual(
      expect.arrayContaining([
        expect.stringContaining(
          "Derived outline evidence and runtime capture were both used",
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
    expect(payload.workflow.id).toBe("upgrade");
    expect(payload.workflow.transportUsed).toBe("cli");
    expect(payload.artifacts.ruleIds).toEqual(["upgrade-review-version-risks"]);
    expect(payload.workflow.confidence).toEqual(
      expect.objectContaining({
        level: expect.any(String),
        reasons: expect.arrayContaining([expect.any(String)]),
      }),
    );
    expect(payload.workflow.projectConventionsCheck).toEqual(
      expect.objectContaining({
        policyMode: "none",
        declared: false,
        checkRecommended: true,
        topics: expect.arrayContaining(["migration-shims"]),
      }),
    );
    expect(payload.result.summary).toEqual(
      expect.objectContaining({
        target: "@salt-ds/core",
        fromVersion: "1.1.0",
      }),
    );
    expect(payload.artifacts.notes).toEqual(
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
    expect(payload.workflow.id).toBe("review");
    expect(payload.result.summary).toEqual(
      expect.objectContaining({
        status: "clean",
        filesNeedingAttention: 0,
        runtimeMode: "fetched-html",
        runtimeIssues: 0,
      }),
    );
    expect(payload.artifacts.runtimeEvidence.requested).toBe(true);
    expect(payload.artifacts.runtimeEvidence.result).toEqual(
      expect.objectContaining({
        inspectionMode: "fetched-html",
        page: expect.objectContaining({
          title: "Review Me",
        }),
      }),
    );
  });

  it("can compare the reviewed implementation against a saved create report", async () => {
    const rootDir = await createTempDir("salt-cli-review-create-report");
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
      path.join(rootDir, "src", "DashboardMetric.tsx"),
      [
        'import { Card, StackLayout, Text } from "@salt-ds/core";',
        "",
        "export function DashboardMetric() {",
        "  return (",
        "    <Card>",
        "      <StackLayout gap={1}>",
        '        <Text styleAs="label">PnL</Text>',
        '        <Text styleAs="h3">+12.5%</Text>',
        "      </StackLayout>",
        "    </Card>",
        "  );",
        "}",
        "",
      ].join("\n"),
      "utf8",
    );
    await fs.writeFile(
      path.join(rootDir, "create-report.json"),
      `${JSON.stringify(
        {
          workflow: {
            id: "create",
            provenance: {
              source_urls: ["/salt/patterns/metric"],
            },
          },
          result: {
            recommendation: {
              decision: {
                name: "Metric",
              },
            },
            summary: {
              decisionName: "Metric",
            },
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
        "--create-report",
        "create-report.json",
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

    expect(exitCode).toBe(2);
    expect(stderr).toBe("");
    const payload = JSON.parse(stdout);
    expect(payload.result.summary).toEqual(
      expect.objectContaining({
        status: "needs_attention",
        filesNeedingAttention: 1,
      }),
    );
    expect(payload.artifacts.expectedTargetReview).toEqual(
      expect.objectContaining({
        reportPath: expect.stringContaining("/create-report.json"),
        expectedTargets: expect.objectContaining({
          patterns: expect.arrayContaining(["Metric"]),
        }),
        issues: expect.arrayContaining([
          expect.objectContaining({
            id: "workflow-expected.metric-pattern",
          }),
        ]),
      }),
    );
    expect(payload.artifacts.notes).toEqual(
      expect.arrayContaining([
        expect.stringContaining("Loaded create report expectations"),
      ]),
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
    expect(payload.artifacts.migrationVerification).toEqual(
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
    expect(payload.artifacts.notes).toEqual(
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
