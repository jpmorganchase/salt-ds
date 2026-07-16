import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { MAX_PACKAGE_JSON_BYTES } from "../server/projectContext/saltInstallation.js";
import {
  collectSaltWorkflowContextData,
  getSaltProjectContext,
} from "../server/projectContext.js";
import { CODE_ANALYSIS_REGISTRY } from "./fixtures/codeAnalysisRegistry.js";
import { REPO_ROOT } from "./registryTestUtils.js";

const tempDirs: string[] = [];
const originalCwd = process.cwd();

async function createTempDir(name: string): Promise<string> {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), `${name}-`));
  const resolvedDir = await fs.realpath(tempDir);
  tempDirs.push(resolvedDir);
  return resolvedDir;
}

afterEach(async () => {
  process.chdir(originalCwd);
  await Promise.all(
    tempDirs
      .splice(0, tempDirs.length)
      .map((dir) => fs.rm(dir, { recursive: true, force: true })),
  );
});

describe("getSaltProjectContext", () => {
  it("bounds manifest reads in the normal workflow context path", async () => {
    const rootDir = await createTempDir("salt-mcp-bounded-workflow-manifest");
    await fs.writeFile(
      path.join(rootDir, "package.json"),
      JSON.stringify({
        dependencies: { "@salt-ds/core": "^2.0.0", react: "^19.0.0" },
        padding: "x".repeat(MAX_PACKAGE_JSON_BYTES),
      }),
      "utf8",
    );

    const context = await collectSaltWorkflowContextData(
      CODE_ANALYSIS_REGISTRY,
      { root_dir: rootDir },
    );

    expect(context.salt.packages).toEqual([]);
    expect(context.salt.package_version).toBeNull();
    expect(context.framework).toEqual({ name: "unknown", evidence: [] });
    expect(context.package_json_path).toBeNull();
    expect(context.summary.context_health).toMatchObject({
      trusted: false,
      repo_specific_workflows_ready: false,
      reason: expect.stringContaining("oversized"),
    });
    expect(context.sources).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          original: expect.stringContaining("package.json"),
        }),
      ]),
    );
  });

  it("keeps a malformed package marker untrusted even with a valid repo signal", async () => {
    const rootDir = await createTempDir("salt-mcp-invalid-package-marker");
    await fs.mkdir(path.join(rootDir, ".git"));
    await fs.writeFile(path.join(rootDir, "package.json"), "{", "utf8");
    await fs.writeFile(path.join(rootDir, "AGENTS.md"), "# Instructions\n");

    const context = await collectSaltWorkflowContextData(
      CODE_ANALYSIS_REGISTRY,
      { root_dir: rootDir },
    );

    expect(context.resolution.status).toBe("resolved");
    expect(context.package_json_path).toBeNull();
    expect(context.summary.context_health).toMatchObject({
      trusted: false,
      repo_specific_workflows_ready: false,
      reason: expect.stringContaining("parse_error"),
    });
    expect(context.summary.reasons).toEqual(
      expect.arrayContaining([
        expect.stringMatching(
          /Invalid project marker.*package\.json.*parse_error/,
        ),
      ]),
    );
  });

  it("keeps a valid package root untrusted when its tsconfig marker is invalid", async () => {
    const rootDir = await createTempDir("salt-mcp-invalid-tsconfig-marker");
    await fs.writeFile(
      path.join(rootDir, "package.json"),
      JSON.stringify({ name: "valid-package", private: true }),
      "utf8",
    );
    await fs.writeFile(path.join(rootDir, "tsconfig.json"), "{", "utf8");

    const context = await collectSaltWorkflowContextData(
      CODE_ANALYSIS_REGISTRY,
      { root_dir: rootDir },
    );

    expect(context.resolution.status).toBe("resolved");
    expect(context.package_json_path).toContain("package.json");
    expect(context.imports).toEqual({ tsconfig_path: null, aliases: [] });
    expect(context.summary.context_health).toMatchObject({
      trusted: false,
      repo_specific_workflows_ready: false,
      reason: expect.stringContaining("parse_error"),
    });
    expect(context.sources).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          original: expect.stringContaining("tsconfig.json"),
        }),
      ]),
    );
  });

  it("accepts a valid BOM-prefixed tsconfig marker", async () => {
    const rootDir = await createTempDir("salt-mcp-bom-tsconfig");
    await fs.writeFile(
      path.join(rootDir, "package.json"),
      JSON.stringify({ name: "valid-package", private: true }),
      "utf8",
    );
    await fs.writeFile(
      path.join(rootDir, "tsconfig.json"),
      `\uFEFF${JSON.stringify({
        compilerOptions: { paths: { "@valid/*": ["./src/*"] } },
      })}`,
      "utf8",
    );

    const context = await collectSaltWorkflowContextData(
      CODE_ANALYSIS_REGISTRY,
      { root_dir: rootDir },
    );

    expect(context.resolution.status).toBe("resolved");
    expect(context.imports).toMatchObject({
      tsconfig_path: expect.stringContaining("tsconfig.json"),
      aliases: [{ alias: "@valid/*", targets: ["./src/*"] }],
    });
    expect(context.summary.context_health).toMatchObject({
      trusted: true,
      repo_specific_workflows_ready: true,
    });
  });

  it("ignores malformed manifest sections in the normal workflow context path", async () => {
    const rootDir = await createTempDir("salt-mcp-malformed-workflow-manifest");
    await fs.writeFile(
      path.join(rootDir, "package.json"),
      JSON.stringify({
        packageManager: 42,
        workspaces: "packages/*",
        scripts: 42,
        dependencies: { "@salt-ds/core": 2, react: null },
        devDependencies: ["vite"],
      }),
      "utf8",
    );

    const context = await collectSaltWorkflowContextData(
      CODE_ANALYSIS_REGISTRY,
      { root_dir: rootDir },
    );

    expect(context.environment.package_manager).toBe("unknown");
    expect(context.workspace).toEqual({
      kind: "single-package",
      workspace_root: null,
    });
    expect(context.salt.packages).toEqual([]);
    expect(context.framework).toEqual({ name: "unknown", evidence: [] });
  });

  it("uses a manifest-only context for normal workflows", async () => {
    const rootDir = await createTempDir("salt-mcp-workflow-context");
    await fs.mkdir(path.join(rootDir, "node_modules", "@salt-ds", "core"), {
      recursive: true,
    });
    await fs.writeFile(
      path.join(rootDir, "package.json"),
      JSON.stringify(
        {
          name: "workflow-context",
          private: true,
          packageManager: "yarn@4.9.2",
          dependencies: { "@salt-ds/core": "^2.0.0" },
        },
        null,
        2,
      ),
      "utf8",
    );
    await fs.writeFile(
      path.join(rootDir, "node_modules", "@salt-ds", "core", "package.json"),
      JSON.stringify({ name: "@salt-ds/core", version: "1.0.0" }),
      "utf8",
    );

    const context = await collectSaltWorkflowContextData(
      CODE_ANALYSIS_REGISTRY,
      { root_dir: rootDir },
    );

    expect(context.resolution.status).toBe("resolved");
    expect(context.salt.packages).toEqual([
      { name: "@salt-ds/core", version: "^2.0.0" },
    ]);
    expect(context.salt.installation).toMatchObject({
      version_health: {
        resolved_versions: [],
        issues: [],
      },
      inspection: {
        package_manager: "yarn",
        strategy: "manifest-only",
        status: "limited",
      },
      health_summary: {
        health: "pass",
        blocking_workflows: [],
      },
    });
  });

  it("flags cwd-based context as weak when no repo root can be inferred", async () => {
    const rootDir = await createTempDir("salt-mcp-project-context-unresolved");
    process.chdir(rootDir);

    const result = await getSaltProjectContext(CODE_ANALYSIS_REGISTRY);

    expect(result.result).toMatchObject({
      root_dir: rootDir.replace(/\\/g, "/"),
      package_json_path: null,
      resolution: {
        root_source: "process_cwd",
        status: "needs_explicit_root",
        quality: "needs_explicit_root",
      },
    });
    expect(result.artifacts.summary).toMatchObject({
      recommended_next_tool: null,
      context_health: {
        resolution_status: "needs_explicit_root",
        trusted: false,
        repo_specific_workflows_ready: false,
      },
      policy_note: {
        status: "not_applicable",
        next_tool_after_policy: null,
      },
      retry_with: {
        root_dir: null,
      },
    });
    expect(result.artifacts.summary.reasons).toEqual(
      expect.arrayContaining([expect.stringContaining("explicit root_dir")]),
    );
    expect(result.artifacts.notes).toEqual(
      expect.arrayContaining([expect.stringContaining("explicit root_dir")]),
    );
  });

  it("trusts cwd when it is the detected repo root", async () => {
    const rootDir = await createTempDir("salt-mcp-project-context-fallback");
    await fs.writeFile(
      path.join(rootDir, "package.json"),
      JSON.stringify(
        {
          name: "fallback-repo",
          private: true,
          dependencies: {
            "@salt-ds/core": "^2.0.0",
          },
        },
        null,
        2,
      ),
      "utf8",
    );
    process.chdir(rootDir);

    const result = await getSaltProjectContext(CODE_ANALYSIS_REGISTRY);

    expect(result.result.resolution).toMatchObject({
      root_source: "process_cwd",
      status: "resolved",
      quality: "ready",
    });
    // Root resolution is trusted, but full diagnostics still withhold review
    // because this fixture declares Salt without installing it.
    expect(result.artifacts.summary.recommended_next_tool).toBeNull();
    expect(result.artifacts.summary).toMatchObject({
      context_health: {
        resolution_status: "resolved",
        trusted: true,
        repo_specific_workflows_ready: true,
      },
      retry_with: {
        root_dir: rootDir.replace(/\\/g, "/"),
      },
    });
    expect(result.artifacts.summary.reasons).not.toEqual(
      expect.arrayContaining([expect.stringContaining("root_dir set to")]),
    );
  });

  it("flags an explicit wrong root as a mismatch", async () => {
    const rootDir = await createTempDir("salt-mcp-project-context-mismatch");

    const result = await getSaltProjectContext(CODE_ANALYSIS_REGISTRY, {
      root_dir: rootDir,
    });

    expect(result.result.resolution).toMatchObject({
      root_source: "explicit_input",
      status: "mismatch",
      quality: "needs_explicit_root",
    });
    expect(result.artifacts.summary.recommended_next_tool).toBeNull();
    expect(result.artifacts.summary.reasons).toEqual(
      expect.arrayContaining([
        expect.stringContaining("explicit root_dir did not expose"),
      ]),
    );
    expect(result.artifacts.summary).toMatchObject({
      context_health: {
        resolution_status: "mismatch",
        trusted: false,
        repo_specific_workflows_ready: false,
      },
      retry_with: {
        root_dir: null,
      },
    });
  });

  it("flags an explicit nested subdirectory as a mismatch and suggests the repo root", async () => {
    const rootDir = await createTempDir("salt-mcp-project-context-nested");
    const nestedDir = path.join(rootDir, "src", "features");
    await fs.mkdir(nestedDir, { recursive: true });
    await fs.writeFile(
      path.join(rootDir, "package.json"),
      JSON.stringify(
        {
          name: "nested-context",
          private: true,
          dependencies: {
            "@salt-ds/core": "^2.0.0",
          },
        },
        null,
        2,
      ),
      "utf8",
    );

    const result = await getSaltProjectContext(CODE_ANALYSIS_REGISTRY, {
      root_dir: nestedDir,
    });

    expect(result.result).toMatchObject({
      root_dir: nestedDir.replace(/\\/g, "/"),
      resolution: {
        root_source: "explicit_input",
        status: "mismatch",
        quality: "needs_explicit_root",
      },
    });
    expect(result.artifacts.summary).toMatchObject({
      recommended_next_tool: null,
      context_health: {
        resolution_status: "mismatch",
        trusted: false,
        repo_specific_workflows_ready: false,
      },
      retry_with: {
        root_dir: rootDir.replace(/\\/g, "/"),
      },
    });
    expect(result.artifacts.summary.reasons).toEqual(
      expect.arrayContaining([
        expect.stringContaining(rootDir.replace(/\\/g, "/")),
      ]),
    );
  });

  it("surfaces direct Salt resolution drift without crawling the dependency graph", async () => {
    const rootDir = await createTempDir("salt-mcp-project-context");
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

    const result = await getSaltProjectContext(CODE_ANALYSIS_REGISTRY, {
      root_dir: rootDir,
      include_policy_diagnostics: true,
    });
    const context = result.result;
    const summary = result.artifacts.summary;
    const notes = result.artifacts.notes;

    expect(summary).toMatchObject({
      context_health: {
        resolution_status: "resolved",
        trusted: true,
        repo_specific_workflows_ready: true,
      },
      retry_with: {
        root_dir: rootDir.replace(/\\/g, "/"),
      },
    });

    expect(context.salt.installation.version_health).toEqual(
      expect.objectContaining({
        multiple_resolved_versions: true,
        resolved_versions: expect.arrayContaining(["1.9.0", "2.0.1"]),
        mismatched_packages: [
          expect.objectContaining({
            name: "@salt-ds/core",
            declared_version: "^2.0.0",
            resolved_version: "1.9.0",
          }),
        ],
      }),
    );
    expect(context.salt.installation.inspection).toEqual(
      expect.objectContaining({
        strategy: "manifest-resolution",
        status: "succeeded",
        package_layout: "node-modules",
        limitations: [
          expect.stringContaining(
            "Use the host package manager for full dependency-graph",
          ),
        ],
        manifest_override_fields: [],
      }),
    );
    expect(context.salt.installation.remediation).toEqual(
      expect.objectContaining({
        explain_command: null,
        dedupe_command: null,
      }),
    );
    expect(context.salt.installation.workspace).toEqual(
      expect.objectContaining({
        kind: "single-package",
        issue_source_hint: "package-local",
      }),
    );
    expect(context.salt.installation.health_summary).toEqual(
      expect.objectContaining({
        health: "fail",
        recommended_action: "inspect-dependency-drift",
        blocking_workflows: ["review", "migrate"],
      }),
    );
    expect(notes).toEqual(
      expect.arrayContaining([
        expect.stringContaining(
          "@salt-ds/core declares ^2.0.0 but resolves to 1.9.0",
        ),
        expect.stringContaining(
          "Use the host package manager for full dependency-graph",
        ),
        expect.stringContaining("Salt install health blocks workflows"),
      ]),
    );
    expect(summary.recommended_next_tool).toBeNull();
    expect(summary.policy_note).toEqual(
      expect.objectContaining({
        status: "not_declared",
        next_tool_after_policy: null,
      }),
    );
    expect(summary.reasons).toEqual(
      expect.arrayContaining([
        expect.stringContaining("No durable Salt team policy"),
      ]),
    );
  });

  it("marks workspace-root Salt drift separately from package-local context", async () => {
    const repoRoot = await createTempDir("salt-mcp-workspace-context");
    const packageRoot = path.join(repoRoot, "apps", "shell");
    await fs.mkdir(path.join(packageRoot, "node_modules", "@salt-ds", "core"), {
      recursive: true,
    });
    await fs.writeFile(
      path.join(repoRoot, "package.json"),
      JSON.stringify(
        {
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

    const result = await getSaltProjectContext(CODE_ANALYSIS_REGISTRY, {
      root_dir: packageRoot,
    });
    const context = result.result;
    const notes = result.artifacts.notes;

    expect(context.salt.installation.workspace).toEqual(
      expect.objectContaining({
        kind: "workspace-package",
        issue_source_hint: "workspace-root",
        workspace_root: repoRoot.replaceAll("\\", "/"),
      }),
    );
    expect(context.salt.installation.health_summary).toEqual(
      expect.objectContaining({
        health: "warn",
        recommended_action: "inspect-dependency-drift",
        blocking_workflows: [],
      }),
    );
    expect(notes).toEqual(
      expect.arrayContaining([
        expect.stringContaining("Salt install issue scope: workspace-root"),
      ]),
    );
  });

  it("reports package-backed policy as unsupported data rather than executing it", async () => {
    const rootDir = await createTempDir("salt-mcp-project-context-policy-pack");
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

    const result = await getSaltProjectContext(CODE_ANALYSIS_REGISTRY, {
      root_dir: rootDir,
      include_policy_diagnostics: true,
    });
    const context = result.result;

    expect(context.policy.shared_conventions).toEqual(
      expect.objectContaining({
        enabled: false,
        pack_count: 1,
        packs: ["@example/lob-salt-conventions#markets"],
        pack_details: [
          expect.objectContaining({
            id: "lob-defaults",
            package_name: "@example/lob-salt-conventions",
            export_name: "markets",
            version: null,
            package_version: null,
            conventions_version: null,
            pack_id: null,
            supported_salt_range: null,
            status: "invalid",
            compatibility: null,
            reason: expect.stringContaining("data-only JSON"),
          }),
        ],
      }),
    );
    expect(context.policy.stack_layers).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "lob-defaults",
          resolution: expect.objectContaining({
            status: "invalid",
            pack_id: null,
            supported_salt_range: null,
            package_version: null,
            conventions_version: null,
            compatibility: null,
            reason: expect.stringContaining("data-only JSON"),
          }),
        }),
      ]),
    );
    expect(result.artifacts.summary.context_health).toMatchObject({
      repo_specific_workflows_ready: false,
      reason: expect.stringContaining("data-only JSON"),
    });
  });

  it("turns malformed team policy into a bounded blocked diagnostic", async () => {
    const rootDir = await createTempDir("salt-mcp-malformed-team-policy");
    await fs.mkdir(path.join(rootDir, ".salt"), { recursive: true });
    await fs.writeFile(
      path.join(rootDir, "package.json"),
      JSON.stringify({ name: "malformed-policy", private: true }),
    );
    await fs.writeFile(
      path.join(rootDir, ".salt", "team.json"),
      JSON.stringify({
        contract: "project_conventions_v1",
        approved_wrappers: ["AppButton"],
      }),
    );

    const result = await getSaltProjectContext(CODE_ANALYSIS_REGISTRY, {
      root_dir: rootDir,
      include_policy_diagnostics: true,
    });

    expect(result.result.policy).toMatchObject({
      mode: "team",
      approved_wrappers: [],
    });
    expect(result.artifacts.summary.context_health).toMatchObject({
      trusted: true,
      repo_specific_workflows_ready: false,
      reason: expect.stringContaining("bounded project_conventions_v1"),
    });
    expect(result.artifacts.notes).toEqual(
      expect.arrayContaining([
        expect.stringContaining("bounded project_conventions_v1"),
      ]),
    );
  });

  it("blocks repo-specific readiness when declared policy modules or named exports are missing", async () => {
    const rootDir = await createTempDir("salt-mcp-policy-import-diagnostics");
    await fs.mkdir(path.join(rootDir, ".salt"), { recursive: true });
    await fs.mkdir(path.join(rootDir, "src", "theme"), { recursive: true });
    await fs.writeFile(
      path.join(rootDir, "package.json"),
      JSON.stringify({ name: "policy-import-diagnostics", private: true }),
      "utf8",
    );
    await fs.writeFile(
      path.join(rootDir, "tsconfig.json"),
      JSON.stringify({
        compilerOptions: {
          paths: {
            "@/*": ["./src/*"],
          },
        },
      }),
      "utf8",
    );
    await fs.writeFile(
      path.join(rootDir, "src", "theme", "BrandProvider.tsx"),
      "export function DifferentProvider() { return null; }\n",
      "utf8",
    );
    await fs.writeFile(
      path.join(rootDir, ".salt", "team.json"),
      JSON.stringify({
        contract: "project_conventions_v1",
        version: "1.0.0",
        approved_wrappers: [
          {
            name: "AppButton",
            wraps: "Button",
            reason: "Use the product action wrapper.",
            import: {
              from: "@/components/AppButton",
              name: "AppButton",
            },
          },
        ],
        theme_defaults: {
          provider: "BrandProvider",
          provider_import: {
            from: "@/theme/BrandProvider",
            name: "BrandProvider",
          },
          reason: "Use the product theme provider.",
        },
      }),
      "utf8",
    );

    const result = await getSaltProjectContext(CODE_ANALYSIS_REGISTRY, {
      root_dir: rootDir,
      include_policy_diagnostics: true,
    });

    expect(result.result.policy.import_targets).toMatchObject({
      status: "blocked",
      declared_count: 2,
      resolved_count: 0,
      blocking_count: 2,
      targets: expect.arrayContaining([
        expect.objectContaining({
          kind: "approved_wrapper",
          owner: "AppButton",
          status: "missing_module",
          resolved_path: null,
        }),
        expect.objectContaining({
          kind: "theme_provider",
          owner: "BrandProvider",
          status: "missing_export",
          resolved_path: expect.stringContaining(
            "/src/theme/BrandProvider.tsx",
          ),
        }),
      ]),
    });
    expect(result.result.policy.approved_wrappers).toEqual(["AppButton"]);
    expect(result.artifacts.summary.context_health).toMatchObject({
      trusted: true,
      repo_specific_workflows_ready: false,
      reason: expect.stringContaining(
        "Declared project policy is not implementation-ready",
      ),
    });
    expect(result.artifacts.notes).toEqual(
      expect.arrayContaining([
        expect.stringContaining("no supported repo-local module exists"),
        expect.stringContaining(
          "does not declare the named value export BrandProvider",
        ),
      ]),
    );
  });

  it("blocks an undeclared custom alias even when a matching repo module exists", async () => {
    const rootDir = await createTempDir("salt-mcp-policy-unsupported-alias");
    await fs.mkdir(path.join(rootDir, ".salt"), { recursive: true });
    await fs.mkdir(path.join(rootDir, "src", "components"), {
      recursive: true,
    });
    await fs.writeFile(
      path.join(rootDir, "package.json"),
      JSON.stringify({ name: "unsupported-policy-alias", private: true }),
      "utf8",
    );
    await fs.writeFile(
      path.join(rootDir, "tsconfig.json"),
      JSON.stringify({
        compilerOptions: {
          paths: {
            "@/*": ["./src/*"],
          },
        },
      }),
      "utf8",
    );
    await fs.writeFile(
      path.join(rootDir, "src", "components", "AppButton.tsx"),
      "export function AppButton() { return null; }\n",
      "utf8",
    );
    await fs.writeFile(
      path.join(rootDir, ".salt", "team.json"),
      JSON.stringify({
        contract: "project_conventions_v1",
        version: "1.0.0",
        approved_wrappers: [
          {
            name: "AppButton",
            wraps: "Button",
            reason: "Use the product action wrapper.",
            import: {
              from: "~/components/AppButton",
              name: "AppButton",
            },
          },
        ],
      }),
      "utf8",
    );

    const result = await getSaltProjectContext(CODE_ANALYSIS_REGISTRY, {
      root_dir: rootDir,
    });

    expect(result.result.policy.import_targets).toMatchObject({
      status: "blocked",
      blocking_count: 1,
      targets: [
        expect.objectContaining({
          owner: "AppButton",
          from: "~/components/AppButton",
          status: "unsupported",
          resolved_path: null,
          reason: expect.stringContaining(
            "not a repo-relative module or a resolvable tsconfig paths alias",
          ),
        }),
      ],
    });
    expect(
      result.artifacts.summary.context_health.repo_specific_workflows_ready,
    ).toBe(false);
  });

  it("does not treat a broken barrel re-export as an implementation-ready policy target", async () => {
    const rootDir = await createTempDir("salt-mcp-policy-broken-barrel");
    await fs.mkdir(path.join(rootDir, ".salt"), { recursive: true });
    await fs.mkdir(path.join(rootDir, "src", "components"), {
      recursive: true,
    });
    await fs.writeFile(
      path.join(rootDir, "package.json"),
      JSON.stringify({ name: "broken-policy-barrel", private: true }),
      "utf8",
    );
    await fs.writeFile(
      path.join(rootDir, "src", "components", "index.ts"),
      'export { AppButton } from "./missing";\n',
      "utf8",
    );
    await fs.writeFile(
      path.join(rootDir, ".salt", "team.json"),
      JSON.stringify({
        contract: "project_conventions_v1",
        version: "1.0.0",
        approved_wrappers: [
          {
            name: "AppButton",
            wraps: "Button",
            reason: "Use the product action wrapper.",
            import: {
              from: "./src/components",
              name: "AppButton",
            },
          },
        ],
      }),
      "utf8",
    );

    const result = await getSaltProjectContext(CODE_ANALYSIS_REGISTRY, {
      root_dir: rootDir,
    });

    expect(result.result.policy.import_targets).toMatchObject({
      status: "blocked",
      resolved_count: 0,
      blocking_count: 1,
      targets: [
        expect.objectContaining({
          owner: "AppButton",
          status: "unsupported",
          resolved_path: expect.stringContaining("/src/components/index.ts"),
          reason: expect.stringContaining("indirect or barrel export"),
        }),
      ],
    });
    expect(
      result.artifacts.summary.context_health.repo_specific_workflows_ready,
    ).toBe(false);
  });

  it("keeps the shipped consumer policy import targets implementation-ready", async () => {
    const consumerRoot = path.join(
      REPO_ROOT,
      "workflow-examples",
      "consumer-repo",
    );

    const context = await collectSaltWorkflowContextData(
      CODE_ANALYSIS_REGISTRY,
      { root_dir: consumerRoot },
    );

    expect(context.policy.import_targets).toMatchObject({
      status: "ready",
      declared_count: 3,
      resolved_count: 3,
      blocking_count: 0,
      targets: expect.arrayContaining([
        expect.objectContaining({
          owner: "AppButton",
          status: "resolved",
          resolved_path: expect.stringContaining(
            "/workflow-examples/consumer-repo/src/components/AppButton.tsx",
          ),
        }),
        expect.objectContaining({
          owner: "ConsumerBrandProvider",
          status: "resolved",
          resolved_path: expect.stringContaining(
            "/workflow-examples/consumer-repo/src/theme/ConsumerBrandProvider.tsx",
          ),
        }),
        expect.objectContaining({
          kind: "theme_import",
          owner: "ConsumerBrandProvider",
          from: "@/theme/consumer-brand.css",
          name: null,
          status: "resolved",
          resolved_path: expect.stringContaining(
            "/workflow-examples/consumer-repo/src/theme/consumer-brand.css",
          ),
        }),
      ]),
    });
    expect(context.summary.context_health).toMatchObject({
      trusted: true,
      repo_specific_workflows_ready: true,
      reason: null,
    });
  });
});
