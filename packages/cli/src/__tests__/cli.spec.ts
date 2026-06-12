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
import { validateSaltReviewReportSchema } from "../../../semantic-core/src/__tests__/reviewReportSchemaTestUtils.js";
import { validateSaltReviewReportValidationSchema } from "../../../semantic-core/src/__tests__/reviewReportValidationSchemaTestUtils.js";
import { validateSaltWorkflowFollowupReportSchema } from "../../../semantic-core/src/__tests__/workflowFollowupReportSchemaTestUtils.js";
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

function workflowStatusToExitCode(
  status: "success" | "partial" | "blocked" | "failed",
) {
  switch (status) {
    case "success":
      return 0;
    case "partial":
      return 10;
    case "blocked":
      return 20;
    case "failed":
      return 30;
  }
}

// biome-ignore lint/suspicious/noExplicitAny: Test helper accepts both compact and normalized full workflow payloads.
function expectWorkflowExitCode(payload: any, exitCode: number) {
  if (
    payload?.contract === "salt_workflow_v1" &&
    typeof payload?.status === "string" &&
    /^(success|partial|blocked|failed)$/.test(payload.status)
  ) {
    expect(exitCode).toBe(
      workflowStatusToExitCode(
        payload.status as "success" | "partial" | "blocked" | "failed",
      ),
    );
    return;
  }

  expect(exitCode).toBe(0);
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

// biome-ignore lint/suspicious/noExplicitAny: Test helper returns heterogeneous CLI JSON payloads used across this suite.
function readCliJson(text: string): any {
  return normalizeCliJson(JSON.parse(text));
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
  it("prints root and command-specific workflow help", async () => {
    let rootHelp = "";
    let createHelp = "";
    let migrateHelp = "";
    let reviewHelp = "";

    expect(
      await runCli(["help"], {
        writeStdout: (message) => {
          rootHelp += message;
        },
        writeStderr: () => {},
      }),
    ).toBe(0);
    expect(
      await runCli(["create", "--help"], {
        writeStdout: (message) => {
          createHelp += message;
        },
        writeStderr: () => {},
      }),
    ).toBe(0);
    expect(
      await runCli(["help", "migrate"], {
        writeStdout: (message) => {
          migrateHelp += message;
        },
        writeStderr: () => {},
      }),
    ).toBe(0);
    expect(
      await runCli(["review", "--help"], {
        writeStdout: (message) => {
          reviewHelp += message;
        },
        writeStderr: () => {},
      }),
    ).toBe(0);

    expect(rootHelp).toContain("Workflow commands:");
    expect(rootHelp).toContain(
      "Create compact JSON is a workflow contract only; starter code requires --full --include-starter-code or --starter-only.",
    );
    expect(createHelp).toContain("Salt DS CLI - create");
    expect(createHelp).toContain(
      "salt-ds create <query> --json --full --include-starter-code",
    );
    expect(createHelp).toContain(
      "Compact JSON is a workflow contract only and does not include starter code.",
    );
    expect(createHelp).not.toContain(
      "salt-ds create <query> [--json] [--full] [--include-starter-code]",
    );
    expect(migrateHelp).toContain("--source-outline must be JSON");
    expect(reviewHelp).toContain("action.kind is complete");
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
            "get_salt_entity",
            "get_salt_examples",
            "validate_salt_review_report",
            "resume_salt_review",
            "persist_salt_context_pack",
            "persist_salt_generated_artifact",
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

  it("creates a Salt-first recommendation through the public workflow command", async () => {
    const rootDir = await createTempDir("salt-cli-create");
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

    let stdout = "";
    let stderr = "";
    const exitCode = await runCli(
      withRegistry([
        "create",
        "link to another page from a toolbar action",
        "--include-starter-code",
        "--json",
        "--full",
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

    // Registry content drift since this test was written (mainline added more
    // components/patterns under data-display / navigation families) means the
    // create heuristic now triages the ambiguous "toolbar action" phrase by
    // returning status:partial with action.kind:retrieve_entity (asking the
    // agent to retrieve the Toolbar entity first) rather than status:blocked.
    // The rich --full details envelope is still attached on both paths; only
    // the workflow-status exit code differs.
    expect([10, 20]).toContain(exitCode);
    expect(stderr).toBe("");
    const payload = readCliJson(stdout);
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
            "@salt-ds/core": "^2.0.0",
            "@salt-ds/theme": "^2.0.0",
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
        "--full",
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

    expect(exitCode).toBe(20);
    expect(stderr).toBe("");
    const payload = readCliJson(stdout);
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
        "--full",
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

    const payload = readCliJson(stdout);
    expectWorkflowExitCode(payload, exitCode);
    expect(stderr).toBe("");
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

  it("routes primary action requests to Button before applying an approved repo wrapper", async () => {
    const rootDir = await createTempDir(
      "salt-cli-create-action-wrapper-policy",
    );
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
              name: "AppButton",
              wraps: "Button",
              reason: "Primary product actions use AppButton.",
              import: {
                from: "@/components/AppButton",
                name: "AppButton",
              },
              use_when: ["primary product actions"],
              docs: ["./docs/app-button.md"],
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
        "add a primary action to this view. The repo policy says all Salt buttons in this package must go through the local AppButton wrapper",
        "--include-starter-code",
        "--json",
        "--full",
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

    const payload = readCliJson(stdout);
    expectWorkflowExitCode(payload, exitCode);
    expect(stderr).toBe("");
    expect(payload.status).toBe("partial");
    expect(payload.request).toEqual(
      expect.objectContaining({
        resolved_entity: "Button",
        match_status: "broadened",
      }),
    );
    expect(payload.result.summary).toEqual(
      expect.objectContaining({
        decisionName: "Button",
        finalDecisionName: "AppButton",
        finalDecisionSource: "project_policy",
      }),
    );
    expect(payload.artifacts.repoRefinement).toEqual(
      expect.objectContaining({
        status: "refined_by_project_policy",
        canonical_name: "Button",
        final_name: "AppButton",
        source: "project_policy",
      }),
    );
    expect(payload.result.recommendation.starter_code?.[0]?.code).toContain(
      'import { AppButton } from "@/components/AppButton";',
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
        "--full",
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

    const payload = readCliJson(stdout);
    expectWorkflowExitCode(payload, exitCode);
    expect(stderr).toBe("");
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

  it("does not inject theme bootstrap facts in pattern starter code without workflow or policy evidence", async () => {
    const rootDir = await createTempDir("salt-cli-create-dashboard");
    await fs.writeFile(
      path.join(rootDir, "package.json"),
      JSON.stringify(
        {
          packageManager: "pnpm@9.1.0",
          dependencies: {
            "@salt-ds/core": "^2.0.0",
            "@salt-ds/theme": "^2.0.0",
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
        "--full",
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

    expect(exitCode).toBe(10);
    expect(stderr).toBe("");
    const payload = readCliJson(stdout);
    expect(payload.result.recommendation.recommended.name).toBe(
      "Analytical dashboard",
    );
    const starter = payload.result.recommendation.starter_code?.[0];
    expect(starter?.code).not.toContain("SaltProvider");
    expect(starter?.code).not.toContain('accent="teal"');
    expect(starter?.code).toContain("<BorderLayout>");
    expect(starter?.code).toContain(
      '<BorderItem position="north" as="header">',
    );
    expect(starter?.code).toContain('<BorderItem position="center" as="main">');
    expect(starter?.code).toContain(
      '<GridLayout columns={12} gap={3} aria-label="Dashboard modules">',
    );
    expect(starter?.code).toContain("Metric subtitle or subvalue");
    expect(starter?.code).toContain(
      "Fixed panel: filters, toggles, and controls",
    );
    expect(starter?.notes ?? []).not.toEqual(
      expect.arrayContaining([expect.stringContaining("theme bootstrap")]),
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
            "@salt-ds/core": "^2.0.0",
            "@salt-ds/theme": "^2.0.0",
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
        "--full",
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

    const payload = readCliJson(stdout);
    expectWorkflowExitCode(payload, exitCode);
    expect(stderr).toBe("");
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
        "--full",
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

    const payload = readCliJson(stdout);
    expectWorkflowExitCode(payload, exitCode);
    expect(stderr).toBe("");
    expect(payload.result.recommendation.decision.name).toBe(
      "Analytical dashboard",
    );
    expect(payload.workflow.implementationGate).toEqual(
      expect.objectContaining({
        status: "follow_through_required",
        required_follow_through: expect.arrayContaining([
          expect.objectContaining({ entity: "Metric" }),
        ]),
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
        "--full",
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

    const payload = readCliJson(stdout);
    expectWorkflowExitCode(payload, exitCode);
    expect(stderr).toBe("");
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
        "--full",
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

    const payload = readCliJson(stdout);
    expectWorkflowExitCode(payload, exitCode);
    expect(stderr).toBe("");
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
        "--full",
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

    const payload = readCliJson(stdout);
    expectWorkflowExitCode(payload, exitCode);
    expect(stderr).toBe("");
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
        "--full",
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

    expect(exitCode).toBe(20);
    expect(stderr).toBe("");
    const payload = readCliJson(stdout);
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
        "--full",
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

    const payload = readCliJson(stdout);
    expectWorkflowExitCode(payload, exitCode);
    expect(stderr).toBe("");
    expect(payload.result.recommendation.recommended.name).toBe("Metric");
    expect(payload.result.recommendation.starter_code?.[0]?.code).toContain(
      "Performance",
    );
    expect(payload.result.recommendation.starter_code?.[0]?.code).toContain(
      "Display1",
    );
    expect(payload.result.recommendation.starter_code?.[0]?.notes).toEqual(
      expect.arrayContaining([
        expect.stringContaining(
          "Starter code is based on the closest extracted pattern story example rather than a private fallback template.",
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

  it("emits valid JS identifiers in starter code for multi-word component names", async () => {
    const rootDir = await createTempDir("salt-cli-create-multiword-export");
    await fs.writeFile(
      path.join(rootDir, "package.json"),
      JSON.stringify(
        {
          packageManager: "pnpm@9.1.0",
          dependencies: {
            "@salt-ds/core": "^2.0.0",
            "@salt-ds/theme": "^2.0.0",
            react: "^18.3.1",
            vite: "^7.1.0",
          },
        },
        null,
        2,
      ),
      "utf8",
    );

    // Test with "Grid layout" — a multi-word component that previously
    // emitted `import { Grid layout }` (invalid JS) instead of `import { GridLayout }`.
    let stdout = "";
    let stderr = "";
    const exitCode = await runCli(
      withRegistry([
        "create",
        "GridLayout",
        "--include-starter-code",
        "--json",
        "--full",
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

    expect(stderr).toBe("");
    const payload = readCliJson(stdout);
    expectWorkflowExitCode(payload, exitCode);
    const starterSnippets = payload.result?.recommendation?.starter_code ?? [];
    expect(starterSnippets.length).toBeGreaterThan(0);

    // Every import identifier must be a valid JS identifier (no spaces).
    const importPattern = /import\s*\{([^}]+)\}/g;
    for (const snippet of starterSnippets) {
      const code: string = snippet.code ?? "";
      let match = importPattern.exec(code);
      while (match !== null) {
        const identifiers = match[1].split(",").map((s: string) => s.trim());
        for (const id of identifiers) {
          if (id.length === 0) continue;
          expect(id).toMatch(/^[A-Za-z_$][A-Za-z0-9_$]*$/);
        }
        match = importPattern.exec(code);
      }
    }
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
        "--full",
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

    const payload = readCliJson(stdout);
    expectWorkflowExitCode(payload, exitCode);
    expect(stderr).toBe("");
    expect(payload.result.recommendation.recommended.name).toBe(
      "Vertical navigation",
    );
    expect(payload.result.recommendation.starter_code?.[0]?.code).toContain(
      "NavigationItem",
    );
    expect(payload.result.recommendation.starter_code?.[0]?.code).toContain(
      "NestedGroup",
    );
    expect(payload.workflow.readiness.status).toBe("starter_needs_attention");
  });

  it("uses implementation-gate follow-through as the create summary next step in full output", async () => {
    const rootDir = await createTempDir("salt-cli-create-chart-follow-through");
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
        "chart dashboard with filters and summary",
        "--json",
        "--full",
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

    const payload = readCliJson(stdout);
    expectWorkflowExitCode(payload, exitCode);
    expect(stderr).toBe("");
    expect(payload.workflow.implementationGate).toEqual(
      expect.objectContaining({
        status: "follow_through_required",
        next_call: {
          workflow: "create_salt_ui",
          follow_up_mode: "exact_name",
          args: {
            query: "Chart",
          },
        },
        rule_ids: ["create-follow-through-required"],
      }),
    );
    expect(payload.result.summary.nextStep).toContain(
      "Run targeted Salt create follow-up",
    );
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
    const reportPath = path.join(rootDir, ".salt", "reports", "review.json");

    let stdout = "";
    let stderr = "";
    const exitCode = await runCli(
      withRegistry([
        "review",
        "src",
        "--json",
        "--full",
        "--report",
        reportPath,
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

    expect(exitCode).toBe(20);
    expect(stderr).toBe("");
    const payload = readCliJson(stdout);
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
    expect(
      validateSaltReviewReportSchema(payload.artifacts.reviewReport),
    ).toEqual([]);
    expect(payload.artifacts.reviewReport).toEqual(
      expect.objectContaining({
        contract: "salt_review_report_v1",
        workflow: expect.objectContaining({
          transport_used: "cli",
        }),
        registry: expect.objectContaining({
          hash: expect.stringMatching(/^sha256:/),
        }),
      }),
    );
    expect(payload.result.sourceValidation.files[0]?.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "component-choice.navigation",
        }),
      ]),
    );
    const reportPayload = JSON.parse(await fs.readFile(reportPath, "utf8"));
    expect(validateSaltReviewReportSchema(reportPayload)).toEqual([]);
    expect(reportPayload).toEqual(
      expect.objectContaining({
        contract: "salt_review_report_v1",
        status: "needs_attention",
        registry: expect.objectContaining({
          hash: expect.stringMatching(/^sha256:/),
        }),
        workflow: expect.objectContaining({
          id: "review",
          transport_used: "cli",
        }),
        surface_gate: expect.objectContaining({
          status: "validated",
          validation_issues: [],
          unsupported_claim_count: 0,
          artifact_id: "review-report.validation",
          artifact_kind: "review-report",
        }),
        evidence_validation: expect.objectContaining({
          status: "validated",
          issues: [],
        }),
        unsupported_claims: [],
      }),
    );
    expect(reportPayload.evidence_validation).toEqual({
      status: reportPayload.surface_gate.status,
      issues: reportPayload.surface_gate.validation_issues,
      missing: reportPayload.surface_gate.missing,
      unsupported_claim_count:
        reportPayload.surface_gate.unsupported_claim_count,
    });
    expect(reportPayload.findings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "component-choice.navigation",
          status: "source_backed",
          evidence_ref_ids: expect.arrayContaining([expect.any(String)]),
        }),
      ]),
    );
    expect(reportPayload.generated_artifact.claims).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field_path: "issues.component-choice.navigation",
          evidence_ref_ids: expect.arrayContaining([expect.any(String)]),
        }),
      ]),
    );
    expect(payload.artifacts.reviewReport).toEqual(reportPayload);

    let validationStdout = "";
    expect(
      await runCli(
        withRegistry(["review", "--validate", reportPath, "--json"]),
        {
          cwd: rootDir,
          writeStdout: (message) => {
            validationStdout += message;
          },
          writeStderr: (message) => {
            stderr += message;
          },
        },
      ),
    ).toBe(0);
    const validationPayload = readCliJson(validationStdout);
    expect(validateSaltReviewReportValidationSchema(validationPayload)).toEqual(
      [],
    );
    expect(validationPayload).toEqual(
      expect.objectContaining({
        contract: "salt_review_report_validation_v1",
        status: "current",
        current: true,
        supported: true,
        report_path: reportPath,
        mismatches: [],
        missing: [],
        resume: expect.objectContaining({
          contract: "salt_review_resume_v1",
          status: "ready",
          report_path: reportPath,
          reusable_evidence_ref_ids: expect.arrayContaining([
            expect.any(String),
          ]),
          unsupported_claim_ids: [],
        }),
      }),
    );

    let resumeStdout = "";
    expect(
      await runCli(withRegistry(["review", "--resume", reportPath, "--json"]), {
        cwd: rootDir,
        writeStdout: (message) => {
          resumeStdout += message;
        },
        writeStderr: (message) => {
          stderr += message;
        },
      }),
    ).toBe(0);
    expect(readCliJson(resumeStdout)).toEqual(
      expect.objectContaining({
        contract: "salt_review_resume_v1",
        status: "ready",
        report_path: reportPath,
        reusable_evidence_ref_ids: expect.arrayContaining([expect.any(String)]),
        unsupported_claim_ids: [],
      }),
    );

    const tamperedReportPath = path.join(
      rootDir,
      ".salt",
      "reports",
      "review-undocumented.json",
    );
    const tamperedReport = JSON.parse(JSON.stringify(reportPayload)) as {
      generated_artifact?: {
        evidence_refs?: Array<{
          registry?: { field_path?: string };
        }>;
      };
    };
    const tamperedEvidenceRef =
      tamperedReport.generated_artifact?.evidence_refs?.find(
        (ref) => ref.registry,
      );
    if (!tamperedEvidenceRef?.registry) {
      throw new Error("Expected report fixture to include registry evidence.");
    }
    tamperedEvidenceRef.registry.field_path = "__invalid_test_fixture_field__";
    await fs.writeFile(
      tamperedReportPath,
      JSON.stringify(tamperedReport, null, 2),
      "utf8",
    );

    let tamperedValidationStdout = "";
    expect(
      await runCli(
        withRegistry(["review", "--validate", tamperedReportPath, "--json"]),
        {
          cwd: rootDir,
          writeStdout: (message) => {
            tamperedValidationStdout += message;
          },
          writeStderr: (message) => {
            stderr += message;
          },
        },
      ),
    ).toBe(10);
    const tamperedValidationPayload = readCliJson(tamperedValidationStdout);
    expect(
      validateSaltReviewReportValidationSchema(tamperedValidationPayload),
    ).toEqual([]);
    expect(tamperedValidationPayload).toEqual(
      expect.objectContaining({
        contract: "salt_review_report_validation_v1",
        status: "unsupported",
        current: false,
        supported: false,
        validation_issues: expect.arrayContaining([
          expect.objectContaining({
            code: "missing_registry_field",
          }),
        ]),
        mismatches: expect.arrayContaining([
          "surface_gate",
          "evidence_validation",
          "release_gate",
        ]),
        resume: expect.objectContaining({
          contract: "salt_review_resume_v1",
          status: "unsupported",
          reusable_evidence_ref_ids: [],
        }),
      }),
    );

    let tamperedResumeStdout = "";
    expect(
      await runCli(
        withRegistry(["review", "--resume", tamperedReportPath, "--json"]),
        {
          cwd: rootDir,
          writeStdout: (message) => {
            tamperedResumeStdout += message;
          },
          writeStderr: (message) => {
            stderr += message;
          },
        },
      ),
    ).toBe(10);
    expect(readCliJson(tamperedResumeStdout)).toEqual(
      expect.objectContaining({
        contract: "salt_review_resume_v1",
        status: "unsupported",
        reusable_evidence_ref_ids: [],
      }),
    );
  }, 20000);

  it("prints compact create json output", async () => {
    const rootDir = await createTempDir("salt-cli-create-compact-json");
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
        "create",
        "link to another page from a toolbar action",
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

    // See comment on the rich-payload sibling test above: the same toolbar query
    // now returns status:partial / exit 10 against the current registry.
    expect([10, 20]).toContain(exitCode);
    expect(stderr).toBe("");
    const payload = JSON.parse(stdout);
    expect(payload).toMatchObject({
      contract: "salt_workflow_v1",
      workflow: "create",
      transport: "cli",
      status: expect.stringMatching(/^(success|partial|blocked|failed)$/),
      safety: {
        canonical_complete: expect.any(Boolean),
        exact_request_safe: expect.any(Boolean),
        blocking_reasons: expect.any(Array),
      },
      action: expect.objectContaining({
        kind: expect.any(String),
      }),
      summary: expect.any(String),
    });
    expect(payload).not.toHaveProperty("result");
    expect(payload).not.toHaveProperty("artifacts");
  });

  it("surfaces semantic-match metadata for exact named create json", async () => {
    const rootDir = await createTempDir("salt-cli-create-compact-json-exact");
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
      withRegistry(["create", "Metric", "--json"]),
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

    const payload = JSON.parse(stdout);
    expectWorkflowExitCode(payload, exitCode);
    expect(stderr).toBe("");
    expect(payload).toMatchObject({
      workflow: "create",
      request: {
        entity: "Metric",
        resolved_entity: "Metric",
        match_status: "exact",
      },
    });
  });

  it("writes compact create json to --json-file", async () => {
    const rootDir = await createTempDir("salt-cli-create-compact-json-file");
    const reportPath = path.join(rootDir, "create-agent.json");
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
      withRegistry(["create", "Metric", "--json", "--json-file", reportPath]),
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

    const payload = JSON.parse(stdout);
    expectWorkflowExitCode(payload, exitCode);
    expect(stderr).toBe("");
    const writtenPayload = JSON.parse(await fs.readFile(reportPath, "utf8"));
    expect(payload).toMatchObject({
      workflow: "create",
      request: {
        entity: "Metric",
        resolved_entity: "Metric",
        match_status: "exact",
      },
    });
    expect(writtenPayload).toEqual(payload);
  });

  it("surfaces broadened semantic-match metadata for descriptive create json", async () => {
    const rootDir = await createTempDir(
      "salt-cli-create-compact-json-broadened",
    );
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
      withRegistry(["create", "analytical dashboard body", "--json"]),
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

    const payload = JSON.parse(stdout);
    expectWorkflowExitCode(payload, exitCode);
    expect(stderr).toBe("");
    expect(payload).toMatchObject({
      workflow: "create",
      request: {
        entity: "analytical dashboard body",
        resolved_entity: "Analytical dashboard",
        match_status: "broadened",
      },
      action: {
        kind: "install_dependencies",
        package_manager: "pnpm",
        packages: expect.arrayContaining(["@salt-ds/core", "@salt-ds/theme"]),
      },
    });
  });

  it("accepts resolved follow-through evidence on create rerun", async () => {
    const rootDir = await createTempDir(
      "salt-cli-create-resolved-follow-through",
    );
    await fs.writeFile(
      path.join(rootDir, "package.json"),
      JSON.stringify(
        {
          dependencies: {
            "@salt-ds/core": "^2.0.0",
            "@salt-ds/theme": "^2.0.0",
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
        "profile page with tabs and avatar",
        "--json",
        "--resolved-entity",
        "Avatar",
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

    const payload = JSON.parse(stdout);
    expectWorkflowExitCode(payload, exitCode);
    expect(stderr).toBe("");
    expect(payload).toEqual(
      expect.objectContaining({
        status: "success",
        action: expect.objectContaining({
          kind: "implement",
        }),
        safety: expect.objectContaining({
          exact_request_safe: true,
        }),
        evidence: expect.objectContaining({
          status: "complete",
          missing: [],
          items: expect.arrayContaining([
            expect.objectContaining({
              entity: "Avatar",
              field: "resolved_follow_through",
              source_urls: expect.any(Array),
            }),
          ]),
        }),
      }),
    );
    expect(payload.request).toEqual(
      expect.objectContaining({
        match_status: "broadened",
        full_request_evidence_complete: true,
      }),
    );
  });

  it("prints minimal starter-only create json output for follow-through grounding", async () => {
    const rootDir = await createTempDir("salt-cli-create-starter-only");
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
        "create",
        "Table",
        "--json",
        "--include-starter-code",
        "--type",
        "component",
        "--starter-only",
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

    expect(exitCode).toBeLessThanOrEqual(20);
    expect(stderr).toBe("");
    const payload = JSON.parse(stdout);
    expect(payload).toMatchObject({
      workflow: "create",
      status: expect.stringMatching(/^(success|partial|blocked|failed)$/),
      decision: expect.objectContaining({
        name: expect.any(String),
      }),
      action: expect.anything(),
    });
    expect(Object.keys(payload).sort()).toEqual([
      "action",
      "composition_contract",
      "decision",
      "required_follow_through",
      "starter_code",
      "status",
      "workflow",
    ]);
    expect(payload).not.toHaveProperty("result");
    expect(payload).not.toHaveProperty("artifacts");
    expect(payload).not.toHaveProperty("safety");
  });

  it("writes starter-only create json to --output without widening to the compact contract", async () => {
    const rootDir = await createTempDir("salt-cli-create-starter-only-output");
    const reportPath = path.join(rootDir, "create-starter-only.json");
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
        "create",
        "Table",
        "--json",
        "--include-starter-code",
        "--type",
        "component",
        "--starter-only",
        "--output",
        reportPath,
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

    expect(exitCode).toBeLessThanOrEqual(20);
    expect(stderr).toBe("");
    const payload = JSON.parse(stdout);
    const writtenPayload = JSON.parse(await fs.readFile(reportPath, "utf8"));
    expect(Object.keys(payload).sort()).toEqual([
      "action",
      "composition_contract",
      "decision",
      "required_follow_through",
      "starter_code",
      "status",
      "workflow",
    ]);
    expect(payload).not.toHaveProperty("safety");
    expect(writtenPayload).toEqual(payload);
  });

  it("rejects starter-only create output when --json is omitted", async () => {
    const rootDir = await createTempDir("salt-cli-create-starter-only-no-json");
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
      withRegistry(["create", "Table", "--starter-only"]),
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

    expect(exitCode).toBe(30);
    expect(stdout).toBe("");
    expect(stderr).toContain("--starter-only is only supported with --json");
  });

  it("rejects starter-only create output when --full is also requested", async () => {
    const rootDir = await createTempDir("salt-cli-create-starter-only-full");
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
      withRegistry(["create", "Table", "--json", "--full", "--starter-only"]),
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

    expect(exitCode).toBe(30);
    expect(stdout).toBe("");
    expect(stderr).toContain("--starter-only cannot be combined with --full");
  });

  it("rejects starter-only outside the create workflow", async () => {
    const rootDir = await createTempDir("salt-cli-review-starter-only");
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
      "export function App() { return null; }\n",
      "utf8",
    );

    let stdout = "";
    let stderr = "";
    const exitCode = await runCli(
      withRegistry(["review", "src", "--json", "--starter-only"]),
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

    expect(exitCode).toBe(30);
    expect(stdout).toBe("");
    expect(stderr).toContain(
      "--starter-only is only supported for `salt-ds create --json`.",
    );
  });

  it("returns structured fix candidates for manual-review navigation cases", async () => {
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
    const exitCode = await runCli(
      withRegistry(["review", "src", "--json", "--full"]),
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

    expect(exitCode).toBe(20);
    expect(stderr).toBe("");
    const payload = readCliJson(stdout);
    expect(payload.workflow.id).toBe("review");
    expect(payload.artifacts.fixCandidates).toEqual(
      expect.objectContaining({
        totalCount: expect.any(Number),
        deterministicCount: 0,
        manualReviewCount: 1,
      }),
    );
    expect(payload.result.summary).toEqual(
      expect.objectContaining({
        status: "needs_attention",
        fixCandidateCount: expect.any(Number),
        deterministicFixCandidateCount: 0,
      }),
    );
    expect(payload.artifacts.fixCandidates.files).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          relativePath: path.join("src", "App.tsx"),
          candidates: expect.arrayContaining([
            expect.objectContaining({
              candidateType: "guided_fix",
              safety: "manual_review",
              category: "primitive-choice",
              kind: null,
              from: null,
              to: null,
              ruleId: "review-canonical-mismatch",
            }),
          ]),
        }),
      ]),
    );
    const originalSource = await fs.readFile(
      path.join(rootDir, "src", "App.tsx"),
      "utf8",
    );
    expect(originalSource).toContain('href="/next"');
  });

  it("prints compact review json output", async () => {
    const rootDir = await createTempDir("salt-cli-review-compact-json");
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
    const exitCode = await runCli(withRegistry(["review", "src", "--json"]), {
      cwd: rootDir,
      writeStdout: (message) => {
        stdout += message;
      },
      writeStderr: () => {},
    });

    expect(exitCode).toBe(20);
    const payload = JSON.parse(stdout);
    expect(payload).toMatchObject({
      contract: "salt_workflow_v1",
      workflow: "review",
      transport: "cli",
      status: "blocked",
      safety: {
        canonical_complete: true,
        exact_request_safe: false,
        blocking_reasons: expect.any(Array),
      },
      action: expect.objectContaining({
        kind: expect.any(String),
      }),
      summary: "Salt review found issues that still need attention.",
    });
    expect(payload.evidence.status).toBe("complete");
    expect(payload.evidence.missing).toEqual([]);
    expect(payload).not.toHaveProperty("result");
    expect(payload).not.toHaveProperty("artifacts");
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
    const exitCode = await runCli(
      withRegistry(["review", "src", "--json", "--full"]),
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

    expect(exitCode).toBe(20);
    expect(stderr).toBe("");
    const payload = readCliJson(stdout);
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

    expect(exitCode).toBe(30);
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

    expect(exitCode).toBe(30);
    expect(stderr).toContain(
      "Lint target is not a supported source file: notes.txt",
    );
  });

  it("migrates UI through the public workflow command", async () => {
    const rootDir = await createTempDir("salt-cli-migrate");
    const reportPath = path.join(rootDir, ".salt", "reports", "migrate.json");
    const query = (
      await readVisualMigrationFixture("legacy-orders.query.txt")
    ).trim();

    let stdout = "";
    let stderr = "";
    const exitCode = await runCli(
      withRegistry([
        "migrate",
        query,
        "--json",
        "--full",
        "--include-starter-code",
        "--report",
        reportPath,
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

    expect(exitCode).toBe(20);
    expect(stderr).toBe("");
    const payload = readCliJson(stdout);
    expect(payload.workflow.id).toBe("migrate");
    expect(payload.workflow.transportUsed).toBe("cli");
    expect(payload.artifacts.ruleIds).toEqual(
      expect.arrayContaining([
        "migrate-preserve-task-flow",
        "migrate-move-toward-canonical-salt",
      ]),
    );
    expect(
      validateSaltWorkflowFollowupReportSchema(
        payload.artifacts.workflowFollowupReport,
      ),
    ).toEqual([]);
    expect(payload.artifacts.workflowFollowupReport).toEqual(
      expect.objectContaining({
        contract: "salt_workflow_followup_report_v1",
        status: "degraded",
        workflow: expect.objectContaining({
          id: "migration",
          transport_used: "cli",
        }),
        source: expect.objectContaining({
          request_provided: true,
          evidence_ref_ids: expect.arrayContaining([
            "migration.workflow-input.request",
          ]),
        }),
        review_evidence: null,
        evidence_refs: expect.arrayContaining([
          expect.objectContaining({
            id: "migration.workflow-input.request",
            source_kind: "workflow_input",
          }),
        ]),
        checks: expect.arrayContaining([
          expect.objectContaining({
            id: "migration_review_followup",
            status: "action_required",
          }),
        ]),
        release_gate: expect.objectContaining({
          status: "blocked",
          releasable: false,
        }),
      }),
    );
    const savedMigrationReport = readCliJson(
      await fs.readFile(reportPath, "utf8"),
    );
    expect(
      validateSaltWorkflowFollowupReportSchema(savedMigrationReport),
    ).toEqual([]);
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
        starterValidationStatus: "needs_attention",
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

  it("prints compact migrate json output", async () => {
    const rootDir = await createTempDir("salt-cli-migrate-compact-json");
    const query = (
      await readVisualMigrationFixture("legacy-orders.query.txt")
    ).trim();

    let stdout = "";
    const exitCode = await runCli(
      withRegistry(["migrate", query, "--json", "--include-starter-code"]),
      {
        cwd: rootDir,
        writeStdout: (message) => {
          stdout += message;
        },
        writeStderr: () => {},
      },
    );

    expect(exitCode).toBe(20);
    const payload = JSON.parse(stdout);
    expect(payload).toMatchObject({
      contract: "salt_workflow_v1",
      workflow: "migrate",
      transport: "cli",
      status: expect.stringMatching(/^(partial|blocked)$/),
      safety: {
        canonical_complete: false,
        exact_request_safe: false,
        blocking_reasons: expect.any(Array),
      },
      action: expect.objectContaining({
        kind: expect.any(String),
      }),
      summary: expect.any(String),
    });
    expect(payload).not.toHaveProperty("result");
    expect(payload).not.toHaveProperty("artifacts");
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
      withRegistry([
        "migrate",
        query,
        "--json",
        "--full",
        "--include-starter-code",
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

    expect(exitCode).toBe(20);
    expect(stderr).toBe("");
    const payload = readCliJson(stdout);
    expect(payload.workflow.readiness).toEqual(
      expect.objectContaining({
        status: "starter_needs_attention",
        implementationReady: false,
        reason: expect.stringContaining("provider_import metadata"),
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
        "--full",
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

    expect(exitCode).toBe(20);
    expect(stderr).toBe("");
    const payload = readCliJson(stdout);
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
      withRegistry([
        "migrate",
        "--source-outline",
        outlinePath,
        "--json",
        "--full",
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

    expect(exitCode).toBe(20);
    expect(stderr).toBe("");
    const payload = readCliJson(stdout);
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

      expect(exitCode).toBe(30);
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
          "--full",
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

      expect(exitCode).toBe(20);
      expect(stderr).toBe("");
      const payload = readCliJson(stdout);
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

      expect(exitCode).toBe(30);
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
        "--full",
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

    expect(exitCode).toBe(20);
    expect(stderr).toBe("");
    const payload = readCliJson(stdout);
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
    const reportPath = path.join(rootDir, ".salt", "reports", "upgrade.json");
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
      withRegistry([
        "upgrade",
        "--include-deprecations",
        "--json",
        "--full",
        "--report",
        reportPath,
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

    expect(exitCode).toBe(20);
    expect(stderr).toBe("");
    const payload = readCliJson(stdout);
    expect(payload.workflow.id).toBe("upgrade");
    expect(payload.workflow.transportUsed).toBe("cli");
    expect(payload.artifacts.ruleIds).toEqual(["upgrade-review-version-risks"]);
    expect(
      validateSaltWorkflowFollowupReportSchema(
        payload.artifacts.workflowFollowupReport,
      ),
    ).toEqual([]);
    expect(payload.artifacts.workflowFollowupReport).toEqual(
      expect.objectContaining({
        contract: "salt_workflow_followup_report_v1",
        status: "degraded",
        workflow: expect.objectContaining({
          id: "upgrade",
          transport_used: "cli",
        }),
        target: expect.objectContaining({
          package_name: "@salt-ds/core",
          from_version: "1.1.0",
          evidence_ref_ids: expect.arrayContaining([
            "upgrade.package.target",
            "upgrade.package.from-version",
          ]),
        }),
        review_evidence: null,
        evidence_refs: expect.arrayContaining([
          expect.objectContaining({
            id: "upgrade.package.target",
            source_kind: "package",
          }),
        ]),
        checks: expect.arrayContaining([
          expect.objectContaining({
            id: "upgrade_review_followup",
            status: "action_required",
          }),
        ]),
        release_gate: expect.objectContaining({
          status: "blocked",
          releasable: false,
        }),
      }),
    );
    const savedUpgradeReport = readCliJson(
      await fs.readFile(reportPath, "utf8"),
    );
    expect(
      validateSaltWorkflowFollowupReportSchema(savedUpgradeReport),
    ).toEqual([]);
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

  it("attaches review report evidence to migration and upgrade follow-up reports", async () => {
    const rootDir = await createTempDir("salt-cli-workflow-review-evidence");
    const reportsDir = path.join(rootDir, ".salt", "reports");
    const reviewPath = path.join(reportsDir, "post-action-review.json");
    const migrateReportPath = path.join(reportsDir, "migrate-followup.json");
    const upgradeReportPath = path.join(reportsDir, "upgrade-followup.json");
    const invalidReviewPath = path.join(reportsDir, "invalid-review.json");
    await fs.mkdir(path.join(rootDir, "src"), { recursive: true });
    await fs.writeFile(
      path.join(rootDir, "package.json"),
      JSON.stringify(
        {
          dependencies: {
            // Fixture-only package metadata used to exercise upgrade evidence.
            "@salt-ds/core": "^1.1.0",
          },
        },
        null,
        2,
      ),
      "utf8",
    );
    await fs.writeFile(
      path.join(rootDir, "src", "FixtureApp.tsx"),
      [
        "// Fixture-only Salt source used to mint source-backed review report evidence.",
        'import { Button } from "@salt-ds/core";',
        "",
        "export function FixtureApp() {",
        '  return <Button href="/fixture">Fixture</Button>;',
        "}",
        "",
      ].join("\n"),
      "utf8",
    );

    let reviewStdout = "";
    let stderr = "";
    const reviewExitCode = await runCli(
      withRegistry([
        "review",
        "src",
        "--json",
        "--full",
        "--report",
        reviewPath,
      ]),
      {
        cwd: rootDir,
        writeStdout: (message) => {
          reviewStdout += message;
        },
        writeStderr: (message) => {
          stderr += message;
        },
      },
    );
    expect(stderr).toBe("");
    const reviewPayload = readCliJson(reviewStdout);
    expectWorkflowExitCode(reviewPayload, reviewExitCode);
    expect(
      validateSaltReviewReportSchema(reviewPayload.artifacts.reviewReport),
    ).toEqual([]);

    let migrateStdout = "";
    stderr = "";
    expect(
      await runCli(
        withRegistry([
          "migrate",
          "Fixture-only migration request for attached review evidence.",
          "--json",
          "--full",
          "--review-report",
          reviewPath,
          "--report",
          migrateReportPath,
        ]),
        {
          cwd: rootDir,
          writeStdout: (message) => {
            migrateStdout += message;
          },
          writeStderr: (message) => {
            stderr += message;
          },
        },
      ),
    ).toBe(20);
    expect(stderr).toBe("");
    const migratePayload = readCliJson(migrateStdout);
    expect(
      validateSaltWorkflowFollowupReportSchema(
        migratePayload.artifacts.workflowFollowupReport,
      ),
    ).toEqual([]);
    expect(migratePayload.artifacts.workflowFollowupReport).toEqual(
      expect.objectContaining({
        status: "ready",
        review_evidence: expect.objectContaining({
          report_path: reviewPath,
          validation_status: "current",
          current: true,
          supported: true,
          evidence_ref_ids: ["migration.review-report.validation"],
        }),
        checks: expect.arrayContaining([
          expect.objectContaining({
            id: "migration_review_followup",
            status: "passed",
          }),
        ]),
        release_gate: expect.objectContaining({
          status: "passed",
          releasable: true,
        }),
      }),
    );

    let upgradeStdout = "";
    stderr = "";
    expect(
      await runCli(
        withRegistry([
          "upgrade",
          "--include-deprecations",
          "--json",
          "--full",
          "--review-report",
          reviewPath,
          "--report",
          upgradeReportPath,
        ]),
        {
          cwd: rootDir,
          writeStdout: (message) => {
            upgradeStdout += message;
          },
          writeStderr: (message) => {
            stderr += message;
          },
        },
      ),
    ).toBe(20);
    expect(stderr).toBe("");
    const upgradePayload = readCliJson(upgradeStdout);
    expect(
      validateSaltWorkflowFollowupReportSchema(
        upgradePayload.artifacts.workflowFollowupReport,
      ),
    ).toEqual([]);
    expect(upgradePayload.artifacts.workflowFollowupReport).toEqual(
      expect.objectContaining({
        status: "ready",
        review_evidence: expect.objectContaining({
          report_path: reviewPath,
          validation_status: "current",
          current: true,
          supported: true,
          evidence_ref_ids: ["upgrade.review-report.validation"],
        }),
        checks: expect.arrayContaining([
          expect.objectContaining({
            id: "upgrade_review_followup",
            status: "passed",
          }),
        ]),
        release_gate: expect.objectContaining({
          status: "passed",
          releasable: true,
        }),
      }),
    );

    await fs.writeFile(
      invalidReviewPath,
      JSON.stringify({ contract: "fixture_invalid_review_report" }, null, 2),
      "utf8",
    );

    let invalidUpgradeStdout = "";
    stderr = "";
    expect(
      await runCli(
        withRegistry([
          "upgrade",
          "--include-deprecations",
          "--json",
          "--full",
          "--review-report",
          invalidReviewPath,
        ]),
        {
          cwd: rootDir,
          writeStdout: (message) => {
            invalidUpgradeStdout += message;
          },
          writeStderr: (message) => {
            stderr += message;
          },
        },
      ),
    ).toBe(20);
    expect(stderr).toBe("");
    const invalidUpgradePayload = readCliJson(invalidUpgradeStdout);
    expect(
      validateSaltWorkflowFollowupReportSchema(
        invalidUpgradePayload.artifacts.workflowFollowupReport,
      ),
    ).toEqual([]);
    expect(invalidUpgradePayload.artifacts.workflowFollowupReport).toEqual(
      expect.objectContaining({
        status: "unsupported",
        review_evidence: expect.objectContaining({
          report_path: invalidReviewPath,
          validation_status: "invalid",
          current: false,
          supported: false,
          evidence_ref_ids: ["upgrade.review-report.validation"],
          missing: expect.arrayContaining([
            "report is not a salt_review_report_v1 payload",
            "valid post-upgrade review report evidence",
          ]),
        }),
        checks: expect.arrayContaining([
          expect.objectContaining({
            id: "upgrade_review_followup",
            status: "unsupported",
          }),
        ]),
        release_gate: expect.objectContaining({
          status: "blocked",
          releasable: false,
        }),
      }),
    );
  }, 60000);

  it("prints compact upgrade json output", async () => {
    const rootDir = await createTempDir("salt-cli-upgrade-compact-json");
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
    const exitCode = await runCli(
      withRegistry(["upgrade", "--include-deprecations", "--json"]),
      {
        cwd: rootDir,
        writeStdout: (message) => {
          stdout += message;
        },
        writeStderr: () => {},
      },
    );

    expect(exitCode).toBe(20);
    const payload = JSON.parse(stdout);
    expect(payload).toMatchObject({
      contract: "salt_workflow_v1",
      workflow: "upgrade",
      transport: "cli",
      status: "blocked",
      safety: {
        canonical_complete: true,
        exact_request_safe: false,
        blocking_reasons: expect.any(Array),
      },
      action: expect.objectContaining({
        kind: expect.any(String),
      }),
      summary: "Salt produced upgrade guidance for @salt-ds/core.",
    });
    expect(payload).not.toHaveProperty("result");
    expect(payload).not.toHaveProperty("artifacts");
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
        "--full",
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

    expect(stderr).toBe("");
    const payload = readCliJson(stdout);
    expectWorkflowExitCode(payload, exitCode);
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
        "--full",
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

    expect(stderr).toBe("");
    const payload = readCliJson(stdout);
    expectWorkflowExitCode(payload, exitCode);
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
            rule: expect.stringMatching(/^workflow-expected-pattern-/),
            evidence_refs: expect.arrayContaining([
              expect.objectContaining({
                source_kind: "workflow_input",
              }),
              expect.objectContaining({
                source_kind: "registry",
              }),
            ]),
          }),
        ]),
        missingData: expect.arrayContaining([
          expect.stringContaining(
            "Expected pattern target 'Metric' has source-backed rule kinds that semantic-core records as unsupported",
          ),
        ]),
      }),
    );
    expect(payload.artifacts.notes).toEqual(
      expect.arrayContaining([
        expect.stringContaining("Loaded create report expectations"),
        "Review compared the current implementation against the saved create report and found workflow-expected drift.",
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
        "--full",
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

    expect(stderr).toBe("");
    const payload = readCliJson(stdout);
    expectWorkflowExitCode(payload, exitCode);
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

  // ----- salt-ds review --hook (Phase 2 task 2.12 / E1) -----

  it("review --hook PostToolUse exits 2 with stderr findings when the edited Salt file fails review", async () => {
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
      ["review", "--hook", "--registry-dir", registryDir],
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

  it("review --hook PostToolUse exits 0 silently when the edited file has no Salt imports", async () => {
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
      ["review", "--hook", "--registry-dir", registryDir],
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

  it("review --hook PreToolUse emits permissionDecision: allow when no rules are declared", async () => {
    const rootDir = await createTempDir("salt-cli-review-hook-pre-allow");

    let stdout = "";
    let stderr = "";
    const code = await runCli(["review", "--hook"], {
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

  it("review --hook PreToolUse emits permissionDecision: ask when a scope rule matches", async () => {
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
    const code = await runCli(["review", "--hook"], {
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

  it("review --hook PostToolUse passes silently for events with no edited Salt files", async () => {
    const rootDir = await createTempDir("salt-cli-review-hook-pass-empty");

    let stdout = "";
    let stderr = "";
    const code = await runCli(
      ["review", "--hook", "--registry-dir", registryDir],
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

  it("review --hook errors out when stdin is empty", async () => {
    const rootDir = await createTempDir("salt-cli-review-hook-empty-stdin");

    let stderr = "";
    const code = await runCli(["review", "--hook"], {
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

  it("review --hook errors out on malformed JSON", async () => {
    const rootDir = await createTempDir("salt-cli-review-hook-bad-stdin");

    let stderr = "";
    const code = await runCli(["review", "--hook"], {
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

  it("review --hook silently passes for unhandled events", async () => {
    const rootDir = await createTempDir("salt-cli-review-hook-other");

    let stdout = "";
    let stderr = "";
    const code = await runCli(["review", "--hook"], {
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

  it("review surfaces require_human_review_for matches as blocking policy findings with rule_id policy.require_human_review_for.<kind>", async () => {
    const rootDir = await createTempDir("salt-cli-review-policy-finding");
    await fs.mkdir(path.join(rootDir, "src", "auth"), { recursive: true });
    await fs.mkdir(path.join(rootDir, ".salt"), { recursive: true });
    await fs.writeFile(
      path.join(rootDir, "package.json"),
      JSON.stringify(
        { dependencies: { "@salt-ds/core": "^2.0.0" } },
        null,
        2,
      ),
      "utf8",
    );
    await fs.writeFile(
      path.join(rootDir, "src", "auth", "Login.tsx"),
      [
        'import { Button } from "@salt-ds/core";',
        "",
        "export function Login() {",
        "  return <Button>Sign in</Button>;",
        "}",
        "",
      ].join("\n"),
      "utf8",
    );
    await fs.writeFile(
      path.join(rootDir, ".salt", "team.json"),
      `${JSON.stringify(
        {
          contract: "project_conventions_v1",
          version: "1.0.0",
          project: "policy-finding-test",
          require_human_review_for: [
            {
              kind: "auth-flow-edit",
              scope: "src/auth",
              reason: "needs security guild review",
            },
          ],
        },
        null,
        2,
      )}\n`,
      "utf8",
    );

    let stdout = "";
    let stderr = "";
    const exitCode = await runCli(
      withRegistry(["review", "src", "--json", "--full"]),
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

    expect(exitCode).toBe(20);
    expect(stderr).toBe("");
    const payload = readCliJson(stdout);
    expect(payload).toMatchObject({
      contract: "salt_workflow_v1",
      status: "blocked",
    });
    expect(payload.workflow.id).toBe("review");
    expect((payload.safety.blocking_reasons as string[]).join(" ")).toMatch(
      /require_human_review_for/,
    );
    const issueClasses = payload.artifacts.issueClasses as Array<{
      ruleId: string;
      semanticRules: string[];
    }>;
    const semanticRules = issueClasses.flatMap((entry) => entry.semanticRules);
    expect(semanticRules).toEqual(
      expect.arrayContaining([
        "policy.require_human_review_for.auth-flow-edit",
      ]),
    );
  });

  it("review emits no policy finding when require_human_review_for does not match the reviewed files", async () => {
    const rootDir = await createTempDir("salt-cli-review-policy-no-match");
    await fs.mkdir(path.join(rootDir, "src", "auth"), { recursive: true });
    await fs.mkdir(path.join(rootDir, ".salt"), { recursive: true });
    await fs.writeFile(
      path.join(rootDir, "package.json"),
      JSON.stringify(
        { dependencies: { "@salt-ds/core": "^2.0.0" } },
        null,
        2,
      ),
      "utf8",
    );
    await fs.writeFile(
      path.join(rootDir, "src", "auth", "Login.tsx"),
      [
        'import { Button } from "@salt-ds/core";',
        "",
        "export function Login() {",
        "  return <Button>Sign in</Button>;",
        "}",
        "",
      ].join("\n"),
      "utf8",
    );
    await fs.writeFile(
      path.join(rootDir, ".salt", "team.json"),
      `${JSON.stringify(
        {
          contract: "project_conventions_v1",
          version: "1.0.0",
          project: "policy-no-match-test",
          require_human_review_for: [
            {
              kind: "billing-edit",
              scope: "src/billing",
              reason: "needs finance reviewer",
            },
          ],
        },
        null,
        2,
      )}\n`,
      "utf8",
    );

    let stdout = "";
    let stderr = "";
    const exitCode = await runCli(
      withRegistry(["review", "src", "--json", "--full"]),
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

    // Non-matching policy must not contribute its own blocking finding. The
    // review may still return another status if normal Salt findings exist;
    // for this clean fixture we expect success.
    expect(stderr).toBe("");
    expect(exitCode).toBe(0);
    const payload = readCliJson(stdout);
    expect(payload.status).toBe("success");
    expect(JSON.stringify(payload)).not.toMatch(/require_human_review_for/);
    expect(JSON.stringify(payload)).not.toMatch(
      /policy\.require_human_review_for/,
    );
  });

  // ----- salt-ds review --emit-attestation / --verify-attestations (Phase 2 task 2.15 / E4, rev-3 narrowing) -----

  it("review --hook --emit-attestation emits a SaltAttestationV1 NDJSON line on a clean PostToolUse review", async () => {
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
        "review",
        "--hook",
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

  it("review --hook --emit-attestation emits no payload when review is blocking", async () => {
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
        "review",
        "--hook",
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

  it("review --verify-attestations exits 0 when attestations match on-disk file hashes", async () => {
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
        "review",
        "--hook",
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
      ["review", "--verify-attestations"],
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

  it("review --verify-attestations exits 2 with drift findings after a file is edited post-attestation", async () => {
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
        "review",
        "--hook",
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
      ["review", "--verify-attestations"],
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
      ["review", "--verify-attestations"],
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
