import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { runInfoCommand } from "../info.js";

const knowledgeHarness = vi.hoisted(() => ({
  inspectSaltProjectFacts: vi.fn(),
  originalInspectSaltProjectFacts: undefined as
    | undefined
    | typeof import("@salt-ds/knowledge").inspectSaltProjectFacts,
}));

vi.mock("@salt-ds/knowledge", async () => {
  const actual =
    await vi.importActual<typeof import("@salt-ds/knowledge")>(
      "@salt-ds/knowledge",
    );
  knowledgeHarness.originalInspectSaltProjectFacts =
    actual.inspectSaltProjectFacts;
  knowledgeHarness.inspectSaltProjectFacts.mockImplementation(
    actual.inspectSaltProjectFacts,
  );
  return {
    ...actual,
    inspectSaltProjectFacts: knowledgeHarness.inspectSaltProjectFacts,
    loadKnowledgeRuntimeContext: (
      options: Parameters<typeof actual.loadKnowledgeRuntimeContext>[0] = {},
    ) =>
      actual.loadKnowledgeRuntimeContext(
        options.bundleDir
          ? options
          : { bundleDir: `${process.cwd()}/packages/knowledge/generated` },
      ),
  };
});

const temporaryRoots: string[] = [];

beforeEach(() => {
  knowledgeHarness.inspectSaltProjectFacts.mockReset();
  knowledgeHarness.inspectSaltProjectFacts.mockImplementation(
    knowledgeHarness.originalInspectSaltProjectFacts!,
  );
});

async function fixtureRoot(): Promise<string> {
  const root = await fs.mkdtemp(
    path.join(os.tmpdir(), "salt-info-distinctive-root-"),
  );
  temporaryRoots.push(root);
  await fs.writeFile(
    path.join(root, "package.json"),
    `${JSON.stringify({ name: "salt-info-fixture", private: true })}\n`,
    "utf8",
  );
  return root;
}

afterEach(async () => {
  await Promise.all(
    temporaryRoots
      .splice(0)
      .map((root) => fs.rm(root, { recursive: true, force: true })),
  );
});

describe("info command path projection", () => {
  it("selects independently versioned exact installed package families", async () => {
    const root = await fixtureRoot();
    await fs.writeFile(
      path.join(root, "package.json"),
      `${JSON.stringify({
        name: "salt-info-exact-fixture",
        private: true,
        packageManager: "npm@11.0.0",
        dependencies: {
          "@salt-ds/core": "1.70.0",
          "@salt-ds/theme": "1.45.0",
        },
      })}\n`,
      "utf8",
    );
    for (const [name, version] of [
      ["core", "1.70.0"],
      ["theme", "1.45.0"],
    ] as const) {
      const packageRoot = path.join(root, "node_modules", "@salt-ds", name);
      await fs.mkdir(packageRoot, { recursive: true });
      await fs.writeFile(
        path.join(packageRoot, "package.json"),
        `${JSON.stringify({ name: `@salt-ds/${name}`, version })}\n`,
        "utf8",
      );
    }

    const result = await runInfoCommand({ rootDir: root, cliVersion: "0.0.0" });
    expect(result.selection).toMatchObject({
      status: "selected",
      reason_code: "SALT_PROJECT_SELECTED",
      installed_package_vector: [
        { name: "@salt-ds/core", version: "1.70.0" },
        { name: "@salt-ds/theme", version: "1.45.0" },
      ],
    });
    expect(result.coverage.exact_project_package_vector).toBe(true);
  });

  it("uses portable project-relative paths without leaking its temp authority", async () => {
    const root = await fixtureRoot();
    const result = await runInfoCommand({ rootDir: root, cliVersion: "0.0.0" });
    const serialized = JSON.stringify(result);

    expect(result.project.root).toBe(".");
    expect(result.project.package_manifest.path).toBe("package.json");
    expect(result.project.workspace.packageRoot).toBe(".");
    expect(serialized).not.toContain(root);
    expect(serialized).not.toContain(path.dirname(root));
    expect(serialized).not.toMatch(/[A-Za-z]:[\\/]|(?:^|["])\/[A-Za-z0-9_.-]/u);
  });

  it("projects a nested selected root independently", async () => {
    const parent = await fixtureRoot();
    const root = path.join(parent, "nested-consumer");
    await fs.mkdir(root);
    await fs.writeFile(
      path.join(root, "package.json"),
      `${JSON.stringify({ name: "nested-salt-info-fixture", private: true })}\n`,
      "utf8",
    );

    const result = await runInfoCommand({ rootDir: root, cliVersion: "0.0.0" });
    expect(result.project.root).toBe(".");
    expect(result.project.package_manifest.path).toBe("package.json");
    expect(result.project.workspace.packageRoot).toBe(".");
    expect(JSON.stringify(result)).not.toContain(parent);
  });

  it("nulls observed paths outside authority and records a stable limitation", async () => {
    const root = await fixtureRoot();
    const inspected = await knowledgeHarness.originalInspectSaltProjectFacts!({
      rootDir: root,
    });
    const outsidePath = path.join(
      path.dirname(root),
      "outside-authority-package.json",
    );
    const workspace = {
      ...inspected.facts.workspace,
      workspaceRoot: path.dirname(outsidePath),
    };
    knowledgeHarness.inspectSaltProjectFacts.mockResolvedValue({
      limitations: inspected.limitations,
      facts: {
        ...inspected.facts,
        package_manifest: {
          ...inspected.facts.package_manifest,
          path: outsidePath,
        },
        declared_salt_packages: [{ name: "@salt-ds/core", version: "1.50.0" }],
        installation: {
          ...inspected.facts.installation,
          resolvedPackages: [
            {
              name: "@salt-ds/core",
              declaredVersion: "1.50.0",
              effectiveDeclaredVersion: "1.50.0",
              declarationResolution: "verified",
              resolvedVersion: "1.50.0",
              resolvedPath: outsidePath,
              satisfiesDeclaredVersion: true,
            },
          ],
          workspace,
        },
        workspace,
      },
    });

    const result = await runInfoCommand({ rootDir: root, cliVersion: "0.0.0" });
    expect(result.project.package_manifest.path).toBeNull();
    expect(result.project.workspace.workspaceRoot).toBeNull();
    expect(result.project.packages[0]?.observed_manifest_path).toBeNull();
    expect(result.limitations).toContain("SALT_INFO_PATH_NOT_PORTABLE");
    expect(JSON.stringify(result)).not.toContain(outsidePath);
  });
});
