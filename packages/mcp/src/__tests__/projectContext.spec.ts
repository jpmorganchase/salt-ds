import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { getSaltProjectContext } from "../server/projectContext.js";
import { CODE_ANALYSIS_REGISTRY } from "./fixtures/codeAnalysisRegistry.js";

const tempDirs: string[] = [];

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
});

describe("getSaltProjectContext", () => {
  it("surfaces installed Salt version drift in project context", async () => {
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

    expect(context.salt.installation.version_health).toEqual(
      expect.objectContaining({
        multiple_resolved_versions: false,
        multiple_installed_versions: true,
        resolved_versions: expect.arrayContaining(["1.9.0", "2.0.1"]),
        installed_versions: expect.arrayContaining(["1.9.0", "2.0.1"]),
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
        strategy: "node-modules-scan",
        status: "fallback",
        package_layout: "node-modules",
        limitations: [],
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
    expect(context.salt.installation.duplicate_packages).toEqual([
      expect.objectContaining({
        name: "@salt-ds/core",
        versions: ["1.9.0", "2.0.1"],
        package_count: 2,
        version_count: 2,
        paths: expect.arrayContaining([
          expect.stringContaining("/node_modules/@salt-ds/core/package.json"),
          expect.stringContaining(
            "/node_modules/example-dep/node_modules/@salt-ds/core/package.json",
          ),
        ]),
      }),
    ]);
    expect(context.salt.installation.health_summary).toEqual(
      expect.objectContaining({
        health: "fail",
        recommended_action: "inspect-dependency-drift",
        blocking_workflows: ["review", "migrate", "upgrade"],
      }),
    );
    expect(notes).toEqual(
      expect.arrayContaining([
        expect.stringContaining(
          "@salt-ds/core is installed 2 times across versions 1.9.0, 2.0.1",
        ),
        expect.stringContaining(
          "@salt-ds/core declares ^2.0.0 but resolves to 1.9.0",
        ),
        expect.stringContaining(
          "Duplicate Salt installs detected for @salt-ds/core",
        ),
        expect.stringContaining("Salt install health blocks workflows"),
      ]),
    );
    expect(summary.recommended_next_tool).toBeNull();
    expect(summary.bootstrap_requirement).toEqual(
      expect.objectContaining({
        status: "recommended",
        tool: "bootstrap_salt_repo",
        cli_command: "salt-ds init",
        next_tool_after_bootstrap: null,
      }),
    );
    expect(summary.reasons).toEqual(
      expect.arrayContaining([
        expect.stringContaining("Bootstrap is optional for first results"),
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

  it("surfaces shared conventions-pack metadata and compatibility in project context", async () => {
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
        enabled: true,
        pack_count: 1,
        packs: ["@example/lob-salt-conventions#markets"],
        pack_details: [
          expect.objectContaining({
            id: "lob-defaults",
            package_name: "@example/lob-salt-conventions",
            export_name: "markets",
            version: "1.2.3",
            package_version: "1.2.3",
            conventions_version: "1.0.0",
            pack_id: "lob-markets",
            supported_salt_range: "^2.0.0",
            status: "resolved",
            compatibility: expect.objectContaining({
              status: "compatible",
              checked_version: "2.0.0",
            }),
          }),
        ],
      }),
    );
    expect(context.policy.stack_layers).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "lob-defaults",
          resolution: expect.objectContaining({
            pack_id: "lob-markets",
            supported_salt_range: "^2.0.0",
            package_version: "1.2.3",
            conventions_version: "1.0.0",
            compatibility: expect.objectContaining({
              status: "compatible",
              checked_version: "2.0.0",
            }),
          }),
        }),
      ]),
    );
  });
});
