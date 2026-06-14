import fs from "node:fs/promises";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import { Readable } from "node:stream";
import { fileURLToPath } from "node:url";
import { upsertSaltRepoInstructions } from "@salt-ds/semantic-core/bootstrapScaffolding";
import { buildRegistry } from "@salt-ds/semantic-core/build/buildRegistry";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { validateSaltAiSetupSchema } from "../../../semantic-core/src/__tests__/aiSetupSchemaTestUtils.js";
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
let registryDir = "";

async function createTempDir(name: string): Promise<string> {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), `${name}-`));
  tempDirs.push(tempDir);
  return tempDir;
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

// biome-ignore lint/suspicious/noExplicitAny: Test helper normalizes many heterogeneous CLI JSON payload shapes.
function normalizeCliJson(value: unknown): any {
  if (value == null || typeof value !== "object") {
    return value;
  }

  const payload = value as Record<string, unknown>;
  if (payload.contract !== "salt_workflow_v1" || payload.details == null) {
    return value;
  }

  expect(payload).toEqual(
    expect.objectContaining({
      contract: "salt_workflow_v1",
      workflow: expect.any(String),
      transport: expect.any(String),
      status: expect.any(String),
      safety: expect.any(Object),
      action: expect.any(Object),
      summary: expect.any(String),
      details: expect.any(Object),
    }),
  );

  const details = payload.details as Record<string, unknown>;
  return {
    ...payload,
    workflow: details.workflow as Record<string, unknown>,
    result: details.result as Record<string, unknown>,
    artifacts: details.artifacts as Record<string, unknown>,
  };
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
  it("prints root help that documents the support-tier surface and points workflow commands at the MCP server", async () => {
    let rootHelp = "";
    let hookHelp = "";
    let verifyHelp = "";
    let exportContextHelp = "";

    expect(
      await runCli(["help"], {
        writeStdout: (message) => {
          rootHelp += message;
        },
        writeStderr: () => {},
      }),
    ).toBe(0);
    expect(
      await runCli(["hook", "--help"], {
        writeStdout: (message) => {
          hookHelp += message;
        },
        writeStderr: () => {},
      }),
    ).toBe(0);
    expect(
      await runCli(["verify", "--help"], {
        writeStdout: (message) => {
          verifyHelp += message;
        },
        writeStderr: () => {},
      }),
    ).toBe(0);
    expect(
      await runCli(["export-context", "--help"], {
        writeStdout: (message) => {
          exportContextHelp += message;
        },
        writeStderr: () => {},
      }),
    ).toBe(0);

    expect(rootHelp).toContain("Setup commands:");
    expect(rootHelp).toContain("Agent-hook commands:");
    expect(rootHelp).toContain("Support commands:");
    expect(rootHelp).toContain(
      "Workflow commands moved to the @salt-ds/mcp server:",
    );
    expect(rootHelp).toContain("create_salt_ui");
    expect(rootHelp).toContain("review_salt_ui");
    expect(rootHelp).toContain("migrate_to_salt");
    expect(rootHelp).toContain("upgrade_salt_ui");
    // No CLI subcommand line should still advertise the removed workflow verbs.
    expect(rootHelp).not.toMatch(/^\s+salt-ds (create|review|migrate|upgrade) /m);
    expect(hookHelp).toContain("Salt DS CLI - hook");
    expect(hookHelp).toContain("--emit-attestation");
    expect(verifyHelp).toContain("Salt DS CLI - verify");
    expect(verifyHelp).toContain("exit non-zero on drift");
    expect(exportContextHelp).toContain("Salt DS CLI - export-context");
  });

  it("prints a removal stderr and exits 1 for each demoted workflow command", async () => {
    for (const command of ["create", "review", "migrate", "upgrade"] as const) {
      let stderr = "";
      const exitCode = await runCli([command, "anything"], {
        writeStdout: () => {},
        writeStderr: (message) => {
          stderr += message;
        },
      });
      expect(exitCode).toBe(1);
      expect(stderr).toContain(`salt-ds ${command} has been removed`);
      expect(stderr).toContain("@salt-ds/mcp");
    }
  });

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

    expect(stderr).toBe("");
    expect(exitCode).toBe(0);
    const payload = JSON.parse(stdout);
    expect(payload.toolVersion).toBe("0.0.0");
    expect(payload.capabilityManifest).toEqual(
      expect.objectContaining({
        manifest_version: "salt_capability_manifest_v1",
        transport: "cli",
        runtime: expect.objectContaining({
          command_name: "salt-ds",
          package_name: "@salt-ds/cli",
          package_version: "0.0.0",
        }),
        registry: expect.objectContaining({
          available: true,
          version: "0.1.0",
        }),
        contracts: expect.objectContaining({
          compact_workflow_contract_version: "v1",
          compact_workflow_ids: ["create", "review", "migrate", "upgrade"],
          setup_contract_ids: ["info", "init"],
          workflow_action_contract: expect.objectContaining({
            implementation_gate: expect.objectContaining({
              required: {
                status: "success",
                "safety.exact_request_safe": true,
                "action.kind": "implement",
                "evidence.status": "complete",
                "action.post_action.kind": "review",
              },
              non_implementable_statuses: ["partial", "blocked", "failed"],
            }),
            evidence_contract: expect.objectContaining({
              source_backed_kinds: [
                "docs",
                "examples",
                "registry",
                "project_policy",
              ],
              fallback_kind: "heuristic_fallback",
              success_requires_complete_evidence: true,
            }),
            recipe_contract: expect.objectContaining({
              composite_requests_use_recipe: true,
              questions_block_implementation: true,
            }),
          }),
        }),
        public_surface: expect.objectContaining({
          default_surface_ids: [
            "info",
            "init",
            "create",
            "review",
            "migrate",
            "upgrade",
            "hook",
            "verify",
            "export-context",
          ],
          advanced_output_ids: ["full", "starter-only"],
        }),
        support_tools: expect.objectContaining({
          policy: "default_read_only_host_surface",
          default_exposed: true,
          tool_ids: expect.arrayContaining([
            "discover_salt",
            "get_salt_entities",
            "get_salt_examples",
            "persist_salt_artifact",
          ]),
        }),
        support_surface: expect.objectContaining({
          retrieval_catalog: expect.objectContaining({
            available: true,
            contract_version: "salt_create_catalog_v1",
            access: ["info", "command"],
          }),
        }),
        capabilities: expect.objectContaining({
          review_runtime_url: true,
          starter_only_create_artifact: true,
          visual_input: expect.objectContaining({
            source_outline: true,
            runtime_capture: true,
            image_or_mockup_inputs: true,
            normalized_adapter_contract: "migrate_visual_evidence_v1",
          }),
        }),
        resources: expect.objectContaining({
          capability_manifest_uri: null,
          catalog_manifest_uri: null,
          catalog_entity_template_uri: null,
          catalog_candidates_template_uri: null,
        }),
      }),
    );
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

    expect(stderr).toBe("");
    expect(exitCode).toBe(0);
    const payload = JSON.parse(stdout);
    expect(payload.packageJsonPath).toBeNull();
    expect(payload.capabilityManifest.registry).toEqual({
      available: false,
      version: null,
      generated_at: null,
    });
    expect(payload.capabilityManifest.support_surface).toEqual({
      retrieval_catalog: {
        available: false,
        contract_version: null,
        access: ["info", "command"],
      },
    });
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

    expect({ exitCode, stderr }).toEqual({ exitCode: 0, stderr: "" });
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

    expect({ exitCode, stderr }).toEqual({ exitCode: 0, stderr: "" });
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
    expect(agents).toContain(".salt/team.json");
    expect(agents).toContain("salt-ds review");
    expect(agents).toContain("Do not invent Salt APIs");
    expect(agents).toContain("run the repo `ui:verify` script");
    expect(agents).toContain("canonical-only");
    expect(agents).toContain("`status: success`");
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
    ).rejects.toBeTruthy();

    const packageJson = JSON.parse(
      await fs.readFile(path.join(rootDir, "package.json"), "utf8"),
    ) as { scripts?: Record<string, string> };
    expect(packageJson.scripts?.["ui:verify"]).toBe("salt-ds review src");
  });

  it("bootstraps the fact-free Salt AI setup path through init --ai", async () => {
    const rootDir = await createTempDir("salt-cli-init-ai");
    await fs.mkdir(path.join(rootDir, "src"), { recursive: true });
    await fs.writeFile(
      path.join(rootDir, "package.json"),
      JSON.stringify(
        {
          name: "salt-cli-init-ai",
          dependencies: {
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
      withRegistry(["init", ".", "--ai", "--json"]),
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
    expect({ exitCode, stderr }).toEqual({ exitCode: 0, stderr: "" });
    const payload = JSON.parse(stdout);
    expect(validateSaltAiSetupSchema(payload.aiSetup)).toEqual([]);
    expect(payload.aiSetup).toEqual(
      expect.objectContaining({
        contract: "salt_ai_setup_v1",
        status: "degraded",
        next_command: "salt-ds export-context . --manifest --json",
        steps: expect.arrayContaining([
          expect.objectContaining({
            id: "repo-policy",
            status: "current",
          }),
          expect.objectContaining({
            id: "host-adapters",
            status: "current",
          }),
          expect.objectContaining({
            id: "ui-verify",
            status: "current",
          }),
          expect.objectContaining({
            id: "generated-context",
            status: "action_required",
            missing: ["generated context health check"],
          }),
        ]),
      }),
    );
    await expect(
      fs.access(path.join(rootDir, ".github", "copilot-instructions.md")),
    ).resolves.toBeUndefined();
    await expect(
      fs.access(path.join(rootDir, ".github", "agents", "salt-ui.agent.md")),
    ).rejects.toBeTruthy();
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
    expect(agents).toContain("canonical-only");
    expect(
      agents.match(/Use the Salt MCP \(or the `salt-ds` CLI fallback\) for any Salt UI task\./g),
    ).toHaveLength(1);
    expect(agents).not.toContain("- a selection step through Salt MCP");
    expect(agents).not.toContain(
      "if the workflow output says stronger grounding is needed",
    );
    expect(agents).not.toContain(
      "Do not choose Salt components, patterns, props, tokens, or write Salt-specific code until both the canonical selection step and the validation step have completed successfully.",
    );
  });

  it("strips stale validation-before-code legacy repo instruction snippets", () => {
    const legacyInstructions = [
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
      "- if compact Salt output is `blocked`, `partial`, or `safety.exact_request_safe: false`, follow the returned top-level `action` before editing",
      "",
      "Do not inspect `node_modules`, copied app code, or generic web examples to choose Salt-specific components, patterns, tokens, props, or layout structures.",
      "",
      "Do not choose Salt components, patterns, props, tokens, or write Salt-specific code until both the canonical selection step and the validation step have completed successfully.",
      "",
      "If Salt MCP is unavailable and the Salt CLI is available, keep the same workflow and let the environment use the CLI fallback for canonical Salt guidance.",
      "",
      "Before considering Salt UI work complete, run the repo `ui:verify` script when it exists, or run `salt-ds review` directly.",
      "",
      "If both Salt MCP and the Salt CLI are unavailable or failing, stop, resolve the blocker, or ask the user before proceeding. Do not continue with guessed Salt-specific guidance.",
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
    ].join("\n");

    const { content } = upsertSaltRepoInstructions(legacyInstructions);

    expect(content).toContain("Team-specific notes stay here.");
    expect(content).toContain("<!-- salt-ds:repo-instructions:start -->");
    expect(
      content.match(/Use the Salt MCP \(or the `salt-ds` CLI fallback\) for any Salt UI task\./g),
    ).toHaveLength(1);
    expect(content).not.toContain("- a selection step through Salt MCP");
    expect(content).not.toContain(
      "canonical selection step and the validation step have completed successfully",
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
    expect(claude).toContain(".salt/team.json");
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

  it("returns retrieval catalog support through info --catalog-query, --entity, and --family", async () => {
    const rootDir = await createTempDir("salt-cli-info-catalog");
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

    let stdout = "";
    let stderr = "";
    const exitCode = await runCli(
      withRegistry([
        "info",
        ".",
        "--json",
        "--catalog-query",
        "File manager page with breadcrumb navigation showing the current directory path and a data table listing files and folders.",
        "--entity",
        "Tabs",
        "--family",
        "selection-controls",
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
    expect(payload.catalog).toEqual(
      expect.objectContaining({
        manifest: expect.objectContaining({
          contract_version: "salt_create_catalog_v1",
          top_k_default: 5,
          top_k_max: 25,
        }),
        query: expect.objectContaining({
          query:
            "File manager page with breadcrumb navigation showing the current directory path and a data table listing files and folders.",
          // Registry content drift since this test was written (mainline added more
          // candidate entities under data-display + navigation) can push the ranker
          // from a confident single-owner "ranked" status to "ambiguous" when several
          // candidates tie on the query. Either outcome carries the same owner +
          // candidates payload structure the test inspects.
          status: expect.stringMatching(/^(ranked|ambiguous)$/),
          owner: expect.objectContaining({
            entity: expect.objectContaining({
              name: "Table",
            }),
          }),
        }),
        entity: expect.objectContaining({
          query: "Tabs",
          status: "resolved",
          matches: expect.arrayContaining([
            expect.objectContaining({
              name: "Tabs",
              aliases: expect.arrayContaining(["Tab"]),
            }),
          ]),
        }),
        family: expect.objectContaining({
          query: "selection-controls",
          status: "resolved",
          matches: expect.arrayContaining([
            expect.objectContaining({
              family: "selection-controls",
              entities: expect.arrayContaining([
                expect.objectContaining({ name: "Tabs" }),
              ]),
            }),
          ]),
        }),
      }),
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

  it("emits a warn check when playwright is a transitive dep but no browser-mode usage is detected", async () => {
    const rootDir = await createTempDir("salt-cli-doctor-check-install-warn");
    await fs.writeFile(
      path.join(rootDir, "package.json"),
      JSON.stringify({ dependencies: { "@salt-ds/core": "^1.0.0" } }, null, 2),
      "utf8",
    );
    // Simulate @salt-ds/cli installed with a transitive playwright dep
    await fs.mkdir(path.join(rootDir, "node_modules", "@salt-ds", "cli"), {
      recursive: true,
    });
    await fs.writeFile(
      path.join(rootDir, "node_modules", "@salt-ds", "cli", "package.json"),
      JSON.stringify(
        {
          name: "@salt-ds/cli",
          version: "1.0.0",
          dependencies: { "@salt-ds/runtime-inspector-core": "^1.0.0" },
        },
        null,
        2,
      ),
      "utf8",
    );
    await fs.mkdir(
      path.join(rootDir, "node_modules", "@salt-ds", "runtime-inspector-core"),
      { recursive: true },
    );
    await fs.writeFile(
      path.join(
        rootDir,
        "node_modules",
        "@salt-ds",
        "runtime-inspector-core",
        "package.json",
      ),
      JSON.stringify(
        {
          name: "@salt-ds/runtime-inspector-core",
          version: "1.0.0",
          dependencies: { playwright: "^1.40.0" },
        },
        null,
        2,
      ),
      "utf8",
    );
    // No browser-mode usage anywhere in the repo

    let stdout = "";
    const exitCode = await runCli(
      ["doctor", ".", "--json", "--check-install"],
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
    const warnCheck = payload.checks.find(
      (c: { id: string }) => c.id === "check-install-playwright-unused",
    );
    expect(warnCheck).toBeDefined();
    expect(warnCheck.status).toBe("warn");
    expect(warnCheck.summary).toContain("playwright");
    expect(warnCheck.details).toContain("--mode fetched-html");
  });

  it("emits a pass check when playwright is installed and browser-mode usage is detected in package.json scripts", async () => {
    const rootDir = await createTempDir("salt-cli-doctor-check-install-pass");
    // Root package.json with a script that uses --mode browser
    await fs.writeFile(
      path.join(rootDir, "package.json"),
      JSON.stringify(
        {
          dependencies: { "@salt-ds/core": "^1.0.0" },
          scripts: {
            inspect:
              "salt-ds runtime inspect http://localhost:6006 --mode browser",
          },
        },
        null,
        2,
      ),
      "utf8",
    );
    // @salt-ds/cli with playwright in transitive deps
    await fs.mkdir(path.join(rootDir, "node_modules", "@salt-ds", "cli"), {
      recursive: true,
    });
    await fs.writeFile(
      path.join(rootDir, "node_modules", "@salt-ds", "cli", "package.json"),
      JSON.stringify(
        {
          name: "@salt-ds/cli",
          version: "1.0.0",
          dependencies: { playwright: "^1.40.0" },
        },
        null,
        2,
      ),
      "utf8",
    );

    let stdout = "";
    const exitCode = await runCli(
      ["doctor", ".", "--json", "--check-install"],
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
    const passCheck = payload.checks.find(
      (c: { id: string }) => c.id === "check-install-playwright-used",
    );
    expect(passCheck).toBeDefined();
    expect(passCheck.status).toBe("pass");
    expect(passCheck.details).toContain("package.json");
  });

  it("emits a pass check when playwright is not a transitive dep of @salt-ds/cli or @salt-ds/mcp", async () => {
    const rootDir = await createTempDir("salt-cli-doctor-check-install-absent");
    await fs.writeFile(
      path.join(rootDir, "package.json"),
      JSON.stringify({ dependencies: { "@salt-ds/core": "^1.0.0" } }, null, 2),
      "utf8",
    );
    // @salt-ds/cli with no playwright in its deps
    await fs.mkdir(path.join(rootDir, "node_modules", "@salt-ds", "cli"), {
      recursive: true,
    });
    await fs.writeFile(
      path.join(rootDir, "node_modules", "@salt-ds", "cli", "package.json"),
      JSON.stringify(
        {
          name: "@salt-ds/cli",
          version: "1.0.0",
          dependencies: { "@salt-ds/semantic-core": "^1.0.0" },
        },
        null,
        2,
      ),
      "utf8",
    );

    let stdout = "";
    const exitCode = await runCli(
      ["doctor", ".", "--json", "--check-install"],
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
    const absentCheck = payload.checks.find(
      (c: { id: string }) => c.id === "check-install-playwright-absent",
    );
    expect(absentCheck).toBeDefined();
    expect(absentCheck.status).toBe("pass");
  });

  it("does not emit check-install checks when --check-install flag is absent", async () => {
    const rootDir = await createTempDir("salt-cli-doctor-no-check-install");
    await fs.writeFile(
      path.join(rootDir, "package.json"),
      JSON.stringify({ dependencies: { "@salt-ds/core": "^1.0.0" } }, null, 2),
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
    const checkInstallChecks = payload.checks.filter((c: { id: string }) =>
      c.id.startsWith("check-install-"),
    );
    expect(checkInstallChecks).toHaveLength(0);
  });

  it("emits a pass check when playwright is detected via --mode auto usage in a CI yaml file", async () => {
    const rootDir = await createTempDir(
      "salt-cli-doctor-check-install-ci-yaml",
    );
    await fs.writeFile(
      path.join(rootDir, "package.json"),
      JSON.stringify({ dependencies: { "@salt-ds/core": "^1.0.0" } }, null, 2),
      "utf8",
    );
    // playwright in @salt-ds/mcp
    await fs.mkdir(path.join(rootDir, "node_modules", "@salt-ds", "mcp"), {
      recursive: true,
    });
    await fs.writeFile(
      path.join(rootDir, "node_modules", "@salt-ds", "mcp", "package.json"),
      JSON.stringify(
        {
          name: "@salt-ds/mcp",
          version: "1.0.0",
          dependencies: { playwright: "^1.40.0" },
        },
        null,
        2,
      ),
      "utf8",
    );
    // CI file that uses --mode auto
    await fs.mkdir(path.join(rootDir, ".github", "workflows"), {
      recursive: true,
    });
    await fs.writeFile(
      path.join(rootDir, ".github", "workflows", "ci.yml"),
      [
        "jobs:",
        "  inspect:",
        "    steps:",
        "      - run: salt-ds runtime inspect $URL --mode auto --json",
      ].join("\n"),
      "utf8",
    );

    let stdout = "";
    const exitCode = await runCli(
      ["doctor", ".", "--json", "--check-install"],
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
    const passCheck = payload.checks.find(
      (c: { id: string }) => c.id === "check-install-playwright-used",
    );
    expect(passCheck).toBeDefined();
    expect(passCheck.status).toBe("pass");
    expect(passCheck.details).toContain("ci.yml");
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
    expect(stderr).toContain("review_salt_ui");
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

  // ----- salt-ds review --hook (Phase 2 task 2.12 / E1) -----

  it("hook PostToolUse exits 2 with stderr findings when the edited Salt file fails review", async () => {
    const rootDir = await createTempDir("salt-cli-review-hook-block");
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
    const filePath = path.join(rootDir, "App.tsx");
    await fs.writeFile(
      filePath,
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
    const code = await runCli(
      ["hook", "--registry-dir", registryDir],
      {
        cwd: rootDir,
        stdin: Readable.from(
          Buffer.from(
            JSON.stringify({
              session_id: "sess-block",
              cwd: rootDir,
              hook_event_name: "PostToolUse",
              tool_name: "Edit",
              tool_input: { file_path: filePath },
            }),
            "utf8",
          ),
        ),
        writeStdout: (message) => {
          stdout += message;
        },
        writeStderr: (message) => {
          stderr += message;
        },
      },
    );

    expect(code).toBe(2);
    expect(stdout).toBe("");
    expect(stderr).toMatch(/salt-ds review blocked/);
    expect(stderr).toMatch(/App\.tsx/);
  });

  it("hook PostToolUse exits 0 silently when the edited file has no Salt imports", async () => {
    const rootDir = await createTempDir("salt-cli-review-hook-pass-nonsalt");
    const filePath = path.join(rootDir, "Plain.tsx");
    await fs.writeFile(
      filePath,
      "export function Plain() {\n  return 'plain';\n}\n",
      "utf8",
    );

    let stdout = "";
    let stderr = "";
    const code = await runCli(
      ["hook", "--registry-dir", registryDir],
      {
        cwd: rootDir,
        stdin: Readable.from(
          Buffer.from(
            JSON.stringify({
              hook_event_name: "PostToolUse",
              tool_name: "Edit",
              tool_input: { file_path: filePath },
            }),
            "utf8",
          ),
        ),
        writeStdout: (message) => {
          stdout += message;
        },
        writeStderr: (message) => {
          stderr += message;
        },
      },
    );

    expect(code).toBe(0);
    expect(stdout).toBe("");
    expect(stderr).toBe("");
  });

  it("hook PreToolUse emits permissionDecision: allow when no rules are declared", async () => {
    const rootDir = await createTempDir("salt-cli-review-hook-pre-allow");

    let stdout = "";
    let stderr = "";
    const code = await runCli(["hook"], {
      cwd: rootDir,
      stdin: Readable.from(
        Buffer.from(
          JSON.stringify({
            hook_event_name: "PreToolUse",
            tool_name: "Edit",
            tool_input: { file_path: path.join(rootDir, "src", "App.tsx") },
          }),
          "utf8",
        ),
      ),
      writeStdout: (message) => {
        stdout += message;
      },
      writeStderr: (message) => {
        stderr += message;
      },
    });

    expect(code).toBe(0);
    expect(stderr).toBe("");
    const payload = JSON.parse(stdout);
    expect(payload).toEqual({
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "allow",
      },
    });
  });

  it("hook PreToolUse emits permissionDecision: ask when a scope rule matches", async () => {
    const rootDir = await createTempDir("salt-cli-review-hook-pre-ask");
    await fs.mkdir(path.join(rootDir, ".salt"), { recursive: true });
    await fs.writeFile(
      path.join(rootDir, ".salt", "team.json"),
      `${JSON.stringify(
        {
          contract: "project_conventions_v1",
          version: "1.0.0",
          project: "test",
          require_human_review_for: [
            { kind: "auth-flow-edit", scope: "auth", reason: "needs review" },
          ],
        },
        null,
        2,
      )}\n`,
      "utf8",
    );

    let stdout = "";
    let stderr = "";
    const code = await runCli(["hook"], {
      cwd: rootDir,
      stdin: Readable.from(
        Buffer.from(
          JSON.stringify({
            cwd: rootDir,
            hook_event_name: "PreToolUse",
            tool_name: "Edit",
            tool_input: {
              file_path: path.join(rootDir, "src", "auth", "Login.tsx"),
            },
          }),
          "utf8",
        ),
      ),
      writeStdout: (message) => {
        stdout += message;
      },
      writeStderr: (message) => {
        stderr += message;
      },
    });

    expect(code).toBe(0);
    expect(stderr).toBe("");
    const payload = JSON.parse(stdout);
    expect(payload.hookSpecificOutput).toMatchObject({
      hookEventName: "PreToolUse",
      permissionDecision: "ask",
    });
    expect(payload.hookSpecificOutput.permissionDecisionReason).toMatch(
      /scope=auth/,
    );
    expect(payload.hookSpecificOutput.permissionDecisionReason).toMatch(
      /reason=needs review/,
    );
  });

  it("hook PostToolUse passes silently for events with no edited Salt files", async () => {
    const rootDir = await createTempDir("salt-cli-review-hook-pass-empty");

    let stdout = "";
    let stderr = "";
    const code = await runCli(
      ["hook", "--registry-dir", registryDir],
      {
        cwd: rootDir,
        stdin: Readable.from(
          Buffer.from(
            JSON.stringify({
              hook_event_name: "PostToolUse",
              tool_name: "Bash",
              tool_input: { command: "ls" },
            }),
            "utf8",
          ),
        ),
        writeStdout: (message) => {
          stdout += message;
        },
        writeStderr: (message) => {
          stderr += message;
        },
      },
    );
    expect(code).toBe(0);
    expect(stdout).toBe("");
    expect(stderr).toBe("");
  });

  it("hook errors out when stdin is empty", async () => {
    const rootDir = await createTempDir("salt-cli-review-hook-empty-stdin");

    let stderr = "";
    const code = await runCli(["hook"], {
      cwd: rootDir,
      stdin: Readable.from([]),
      writeStdout: () => {},
      writeStderr: (message) => {
        stderr += message;
      },
    });
    expect(code).toBe(1);
    expect(stderr).toMatch(/requires hook JSON on stdin/);
  });

  it("hook errors out on malformed JSON", async () => {
    const rootDir = await createTempDir("salt-cli-review-hook-bad-stdin");

    let stderr = "";
    const code = await runCli(["hook"], {
      cwd: rootDir,
      stdin: Readable.from(Buffer.from("{not json}", "utf8")),
      writeStdout: () => {},
      writeStderr: (message) => {
        stderr += message;
      },
    });
    expect(code).toBe(1);
    expect(stderr).toMatch(/Invalid JSON on hook stdin/);
  });

  it("hook silently passes for unhandled events", async () => {
    const rootDir = await createTempDir("salt-cli-review-hook-other");

    let stdout = "";
    let stderr = "";
    const code = await runCli(["hook"], {
      cwd: rootDir,
      stdin: Readable.from(
        Buffer.from(
          JSON.stringify({ hook_event_name: "Notification" }),
          "utf8",
        ),
      ),
      writeStdout: (message) => {
        stdout += message;
      },
      writeStderr: (message) => {
        stderr += message;
      },
    });
    expect(code).toBe(0);
    expect(stdout).toBe("");
    expect(stderr).toBe("");
  });

  // ----- salt-ds info --hook (Phase 2 task 2.17 / E6) -----

  it("info --hook SessionStart emits additionalContext summarizing repo Salt state", async () => {
    const rootDir = await createTempDir("salt-cli-info-hook");

    let stdout = "";
    let stderr = "";
    const code = await runCli(
      ["info", "--hook", "--registry-dir", registryDir],
      {
        cwd: rootDir,
        stdin: Readable.from(
          Buffer.from(
            JSON.stringify({
              cwd: rootDir,
              hook_event_name: "SessionStart",
            }),
            "utf8",
          ),
        ),
        writeStdout: (message) => {
          stdout += message;
        },
        writeStderr: (message) => {
          stderr += message;
        },
      },
    );

    expect(code).toBe(0);
    expect(stderr).toBe("");
    const payload = JSON.parse(stdout);
    expect(payload.hookSpecificOutput.hookEventName).toBe("SessionStart");
    expect(typeof payload.hookSpecificOutput.additionalContext).toBe("string");
    expect(payload.hookSpecificOutput.additionalContext).toMatch(
      /Salt DS context for/,
    );
    expect(payload.hookSpecificOutput.additionalContext).toMatch(/Registry:/);
    expect(payload.hookSpecificOutput.additionalContext).toMatch(/Policy:/);
  });

  it("info --hook silently passes for non-SessionStart events", async () => {
    const rootDir = await createTempDir("salt-cli-info-hook-other");

    let stdout = "";
    let stderr = "";
    const code = await runCli(["info", "--hook"], {
      cwd: rootDir,
      stdin: Readable.from(
        Buffer.from(JSON.stringify({ hook_event_name: "PostToolUse" }), "utf8"),
      ),
      writeStdout: (message) => {
        stdout += message;
      },
      writeStderr: (message) => {
        stderr += message;
      },
    });
    expect(code).toBe(0);
    expect(stdout).toBe("");
    expect(stderr).toBe("");
  });

  it("info --hook errors out when stdin is empty", async () => {
    const rootDir = await createTempDir("salt-cli-info-hook-empty");

    let stderr = "";
    const code = await runCli(["info", "--hook"], {
      cwd: rootDir,
      stdin: Readable.from([]),
      writeStdout: () => {},
      writeStderr: (message) => {
        stderr += message;
      },
    });
    expect(code).toBe(1);
    expect(stderr).toMatch(/requires hook JSON on stdin/);
  });

  // ----- salt-ds init --add-agent-hooks (Phase 2 task 2.12 wiring) -----

  it("init --add-agent-hooks writes .github/hooks/salt.json with Salt PostToolUse + SessionStart commands", async () => {
    const rootDir = await createTempDir("salt-cli-init-add-agent-hooks");

    let stdout = "";
    const code = await runCli(
      [
        "init",
        rootDir,
        "--add-agent-hooks",
        "--json",
        "--registry-dir",
        registryDir,
      ],
      {
        cwd: rootDir,
        writeStdout: (message) => {
          stdout += message;
        },
        writeStderr: () => {},
      },
    );

    expect(code).toBe(0);
    const payload = JSON.parse(stdout) as {
      agentHooks: { path: string; action: string };
      notes: string[];
    };
    expect(payload.agentHooks.action).toBe("created");
    expect(payload.agentHooks.path).toMatch(/\.github\/hooks\/salt\.json$/);
    expect(
      payload.notes.some((note) =>
        note.includes("Created Salt agent hook manifest"),
      ),
    ).toBe(true);

    const manifestPath = path.join(rootDir, ".github", "hooks", "salt.json");
    const manifestRaw = await fs.readFile(manifestPath, "utf8");
    const manifest = JSON.parse(manifestRaw) as {
      hooks: {
        PostToolUse: Array<{ type: string; command: string }>;
        SessionStart: Array<{ type: string; command: string }>;
        Stop: Array<{ type: string; command: string }>;
      };
    };
    expect(manifest.hooks.PostToolUse).toEqual([
      { type: "command", command: "npx salt-ds hook" },
    ]);
    expect(manifest.hooks.SessionStart).toEqual([
      { type: "command", command: "npx salt-ds info --hook" },
    ]);
    expect(manifest.hooks.Stop).toEqual([
      {
        type: "command",
        command: "npx salt-ds verify",
      },
    ]);
  });

  it("init --add-agent-hooks is idempotent and preserves existing entries", async () => {
    const rootDir = await createTempDir("salt-cli-init-agent-hooks-idempotent");
    await fs.mkdir(path.join(rootDir, ".github", "hooks"), { recursive: true });
    await fs.writeFile(
      path.join(rootDir, ".github", "hooks", "salt.json"),
      `${JSON.stringify(
        {
          hooks: {
            PostToolUse: [
              { type: "command", command: "npx salt-ds hook" },
              { type: "command", command: "echo custom" },
            ],
            SessionStart: [
              { type: "command", command: "npx salt-ds info --hook" },
            ],
            Stop: [
              {
                type: "command",
                command: "npx salt-ds verify",
              },
            ],
          },
        },
        null,
        2,
      )}\n`,
      "utf8",
    );

    let stdout = "";
    const code = await runCli(
      [
        "init",
        rootDir,
        "--add-agent-hooks",
        "--json",
        "--registry-dir",
        registryDir,
      ],
      {
        cwd: rootDir,
        writeStdout: (message) => {
          stdout += message;
        },
        writeStderr: () => {},
      },
    );

    expect(code).toBe(0);
    const payload = JSON.parse(stdout) as {
      agentHooks: { action: string };
    };
    expect(payload.agentHooks.action).toBe("unchanged");
    const manifest = JSON.parse(
      await fs.readFile(
        path.join(rootDir, ".github", "hooks", "salt.json"),
        "utf8",
      ),
    ) as {
      hooks: {
        PostToolUse: Array<{ command: string }>;
        SessionStart: Array<{ command: string }>;
      };
    };
    expect(
      manifest.hooks.PostToolUse.some(
        (entry) => entry.command === "echo custom",
      ),
    ).toBe(true);
    expect(
      manifest.hooks.PostToolUse.some(
        (entry) => entry.command === "npx salt-ds hook",
      ),
    ).toBe(true);
  });

  it("init without --add-agent-hooks does not write the hook manifest", async () => {
    const rootDir = await createTempDir("salt-cli-init-no-hooks");

    let stdout = "";
    const code = await runCli(
      ["init", rootDir, "--json", "--registry-dir", registryDir],
      {
        cwd: rootDir,
        writeStdout: (message) => {
          stdout += message;
        },
        writeStderr: () => {},
      },
    );

    expect(code).toBe(0);
    const payload = JSON.parse(stdout) as {
      agentHooks: { action: string; path: string | null };
    };
    expect(payload.agentHooks.action).toBe("not_requested");
    expect(payload.agentHooks.path).toBeNull();
    await expect(
      fs.access(path.join(rootDir, ".github", "hooks", "salt.json")),
    ).rejects.toThrow();
  });

  // ----- salt-ds review require_human_review_for policy findings (Phase 2 task 2.13, rev-8 / rev-10) -----

  it("hook --emit-attestation emits a SaltAttestationV1 NDJSON line on a clean PostToolUse review", async () => {
    const rootDir = await createTempDir("salt-cli-attest-emit");
    const filePath = path.join(rootDir, "Clean.tsx");
    await fs.writeFile(
      filePath,
      [
        'import { Card } from "@salt-ds/core";',
        "",
        "export function Clean() {",
        "  return <Card>ok</Card>;",
        "}",
        "",
      ].join("\n"),
      "utf8",
    );

    let stdout = "";
    let stderr = "";
    const code = await runCli(
      [
        "hook",
        "--emit-attestation",
        "--registry-dir",
        registryDir,
      ],
      {
        cwd: rootDir,
        stdin: Readable.from(
          Buffer.from(
            JSON.stringify({
              session_id: "sess-attest-emit",
              cwd: rootDir,
              hook_event_name: "PostToolUse",
              tool_name: "Edit",
              tool_input: { file_path: filePath },
            }),
            "utf8",
          ),
        ),
        writeStdout: (message) => {
          stdout += message;
        },
        writeStderr: (message) => {
          stderr += message;
        },
      },
    );

    expect(code).toBe(0);
    expect(stderr).toBe("");
    const lines = stdout.split("\n").filter((line) => line.length > 0);
    expect(lines).toHaveLength(1);
    const payload = JSON.parse(lines[0]);
    expect(payload.$schema).toBe("salt-ds.dev/schemas/attestation/v1");
    expect(payload.contract).toBe("salt_attestation_v1");
    expect(payload.post_action).toEqual({
      kind: "PostToolUse",
      ran: true,
      review_status: "ready",
    });
    expect(payload.files_touched).toHaveLength(1);
    expect(payload.files_touched[0].path).toBe("Clean.tsx");
    expect(payload.files_touched[0].hash_alg).toBe("sha256");
    expect(payload.files_touched[0].hash).toMatch(/^[a-f0-9]{64}$/);
    expect(payload.registry.hash).toMatch(/^[a-f0-9]{64}$/);
    expect(payload.trace_id).toMatch(/^trace_[a-f0-9]{16}$/);
  });

  it("hook --emit-attestation emits no payload when review is blocking", async () => {
    const rootDir = await createTempDir("salt-cli-attest-no-emit-on-block");
    await fs.writeFile(
      path.join(rootDir, "package.json"),
      JSON.stringify(
        { dependencies: { "@salt-ds/core": "^2.0.0" } },
        null,
        2,
      ),
      "utf8",
    );
    const filePath = path.join(rootDir, "App.tsx");
    await fs.writeFile(
      filePath,
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
    const code = await runCli(
      [
        "hook",
        "--emit-attestation",
        "--registry-dir",
        registryDir,
      ],
      {
        cwd: rootDir,
        stdin: Readable.from(
          Buffer.from(
            JSON.stringify({
              cwd: rootDir,
              hook_event_name: "PostToolUse",
              tool_name: "Edit",
              tool_input: { file_path: filePath },
            }),
            "utf8",
          ),
        ),
        writeStdout: (message) => {
          stdout += message;
        },
        writeStderr: (message) => {
          stderr += message;
        },
      },
    );

    expect(code).toBe(2);
    expect(stdout).toBe("");
    expect(stderr).toMatch(/salt-ds review blocked/);
  });

  it("verify exits 0 when attestations match on-disk file hashes", async () => {
    const rootDir = await createTempDir("salt-cli-attest-verify-pass");
    const filePath = path.join(rootDir, "Clean.tsx");
    await fs.writeFile(
      filePath,
      [
        'import { Card } from "@salt-ds/core";',
        "",
        "export function Clean() {",
        "  return <Card>ok</Card>;",
        "}",
        "",
      ].join("\n"),
      "utf8",
    );

    // Step 1: emit attestation via clean PostToolUse.
    let emitStdout = "";
    await runCli(
      [
        "hook",
        "--emit-attestation",
        "--registry-dir",
        registryDir,
      ],
      {
        cwd: rootDir,
        stdin: Readable.from(
          Buffer.from(
            JSON.stringify({
              cwd: rootDir,
              hook_event_name: "PostToolUse",
              tool_name: "Edit",
              tool_input: { file_path: filePath },
            }),
            "utf8",
          ),
        ),
        writeStdout: (message) => {
          emitStdout += message;
        },
        writeStderr: () => {},
      },
    );
    expect(emitStdout.trim().length).toBeGreaterThan(0);

    // Step 2: verify via stdin pipe.
    let verifyStdout = "";
    let verifyStderr = "";
    const code = await runCli(
      ["verify"],
      {
        cwd: rootDir,
        stdin: Readable.from(Buffer.from(emitStdout, "utf8")),
        writeStdout: (message) => {
          verifyStdout += message;
        },
        writeStderr: (message) => {
          verifyStderr += message;
        },
      },
    );

    expect(code).toBe(0);
    expect(verifyStderr).toBe("");
    expect(verifyStdout).toMatch(/Verified 1 attestation/);
  });

  it("verify exits 2 with drift findings after a file is edited post-attestation", async () => {
    const rootDir = await createTempDir("salt-cli-attest-verify-fail");
    const filePath = path.join(rootDir, "Clean.tsx");
    const original = [
      'import { Card } from "@salt-ds/core";',
      "",
      "export function Clean() {",
      "  return <Card>ok</Card>;",
      "}",
      "",
    ].join("\n");
    await fs.writeFile(filePath, original, "utf8");

    let emitStdout = "";
    await runCli(
      [
        "hook",
        "--emit-attestation",
        "--registry-dir",
        registryDir,
      ],
      {
        cwd: rootDir,
        stdin: Readable.from(
          Buffer.from(
            JSON.stringify({
              cwd: rootDir,
              hook_event_name: "PostToolUse",
              tool_name: "Edit",
              tool_input: { file_path: filePath },
            }),
            "utf8",
          ),
        ),
        writeStdout: (message) => {
          emitStdout += message;
        },
        writeStderr: () => {},
      },
    );
    expect(emitStdout.trim().length).toBeGreaterThan(0);

    // Mutate the file after the attestation was emitted.
    await fs.writeFile(filePath, `${original}// drift\n`, "utf8");

    let verifyStderr = "";
    const code = await runCli(
      ["verify"],
      {
        cwd: rootDir,
        stdin: Readable.from(Buffer.from(emitStdout, "utf8")),
        writeStdout: () => {},
        writeStderr: (message) => {
          verifyStderr += message;
        },
      },
    );

    expect(code).toBe(2);
    expect(verifyStderr).toMatch(/drift finding/);
    expect(verifyStderr).toMatch(/Clean\.tsx: expected /);

    // Restoring the file should put verify back to clean (idempotency check).
    await fs.writeFile(filePath, original, "utf8");
    let verifyAgainStderr = "";
    let verifyAgainStdout = "";
    const cleanAgain = await runCli(
      ["verify"],
      {
        cwd: rootDir,
        stdin: Readable.from(Buffer.from(emitStdout, "utf8")),
        writeStdout: (message) => {
          verifyAgainStdout += message;
        },
        writeStderr: (message) => {
          verifyAgainStderr += message;
        },
      },
    );
    expect(cleanAgain).toBe(0);
    expect(verifyAgainStderr).toBe("");
    expect(verifyAgainStdout).toMatch(/All file hashes match/);
  });
});
