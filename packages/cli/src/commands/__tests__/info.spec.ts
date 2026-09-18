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

async function writeJson(file: string, value: unknown): Promise<void> {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, `${JSON.stringify(value)}\n`, "utf8");
}

async function writeInstalledPackage(
  authorityRoot: string,
  name: string,
  version: string,
): Promise<void> {
  await writeJson(
    path.join(authorityRoot, "node_modules", "@salt-ds", name, "package.json"),
    { name: `@salt-ds/${name}`, version },
  );
}

async function writeWorkspaceRoot(authorityRoot: string): Promise<void> {
  await writeJson(path.join(authorityRoot, "package.json"), {
    name: "salt-info-authority",
    private: true,
    packageManager: "npm@11.0.0",
    workspaces: ["apps/*"],
    dependencies: {
      "@salt-ds/cli": "^0.0.0",
      "@salt-ds/knowledge": "^0.0.0",
    },
  });
}

async function linkDirectory(target: string, link: string): Promise<void> {
  await fs.mkdir(path.dirname(link), { recursive: true });
  await fs.symlink(
    target,
    link,
    process.platform === "win32" ? "junction" : "dir",
  );
}

afterEach(async () => {
  await Promise.all(
    temporaryRoots
      .splice(0)
      .map((root) => fs.rm(root, { recursive: true, force: true })),
  );
});

describe("info command path projection", () => {
  it("reports the selected hoisted workspace app relative to its authority", async () => {
    const { version: coreVersion } = JSON.parse(
      await fs.readFile(
        path.join(process.cwd(), "packages/core/package.json"),
        "utf8",
      ),
    ) as { version: string };
    const authorityRoot = await fixtureRoot();
    await writeWorkspaceRoot(authorityRoot);
    await writeJson(
      path.join(authorityRoot, "apps", "consumer", "package.json"),
      { name: "consumer", dependencies: { "@salt-ds/core": coreVersion } },
    );
    await writeInstalledPackage(authorityRoot, "core", coreVersion);

    const result = await runInfoCommand({
      rootDir: authorityRoot,
      project: "apps/consumer",
      cliVersion: "0.0.0",
    });

    expect(result.selection.status).toBe("selected");
    expect(result.project.root).toBe("apps/consumer");
    expect(result.project.package_manifest.path).toBe(
      "apps/consumer/package.json",
    );
    expect(result.project.workspace).toMatchObject({
      packageRoot: "apps/consumer",
      workspaceRoot: ".",
    });
    expect(result.project.packages).toEqual([
      expect.objectContaining({
        name: "@salt-ds/core",
        observed_manifest_path: "node_modules/@salt-ds/core/package.json",
      }),
    ]);
    expect(JSON.stringify(result)).not.toContain(authorityRoot);
  });

  it("does not treat a tooling-only authority root as a Salt project", async () => {
    const root = await fixtureRoot();
    await writeWorkspaceRoot(root);

    const result = await runInfoCommand({
      rootDir: root,
      project: ".",
      cliVersion: "0.0.0",
    });

    expect(result.project.root).toBe(".");
    expect(result.selection).toMatchObject({ status: "not_salt" });
  });

  it("requires an explicit selection when an authority contains two apps", async () => {
    const authorityRoot = await fixtureRoot();
    await writeWorkspaceRoot(authorityRoot);
    for (const [app, packageName, version] of [
      ["one", "core", "1.70.0"],
      ["two", "theme", "1.45.0"],
    ] as const) {
      await writeJson(path.join(authorityRoot, "apps", app, "package.json"), {
        name: app,
        dependencies: { [`@salt-ds/${packageName}`]: version },
      });
      await writeInstalledPackage(authorityRoot, packageName, version);
    }

    const rootResult = await runInfoCommand({
      rootDir: authorityRoot,
      project: ".",
      cliVersion: "0.0.0",
    });
    const [first, second] = await Promise.all(
      ["apps/one", "apps/two"].map((project) =>
        runInfoCommand({
          rootDir: authorityRoot,
          project,
          cliVersion: "0.0.0",
        }),
      ),
    );

    expect(rootResult).toMatchObject({
      project: { root: ".", packages: [] },
      selection: { status: "not_salt", installed_package_vector: [] },
    });
    expect(first.project).toMatchObject({
      root: "apps/one",
      packages: [expect.objectContaining({ name: "@salt-ds/core" })],
    });
    expect(second.project).toMatchObject({
      root: "apps/two",
      packages: [expect.objectContaining({ name: "@salt-ds/theme" })],
    });
  });

  it("accepts contained project links and rejects escaping project links", async () => {
    const authorityRoot = await fixtureRoot();
    const outsideRoot = await fs.mkdtemp(
      path.join(os.tmpdir(), "salt-info-outside-link-"),
    );
    temporaryRoots.push(outsideRoot);
    await writeWorkspaceRoot(authorityRoot);
    await writeJson(
      path.join(authorityRoot, "apps", "consumer", "package.json"),
      { name: "consumer", dependencies: { "@salt-ds/core": "1.70.0" } },
    );
    await writeInstalledPackage(authorityRoot, "core", "1.70.0");
    await linkDirectory(
      path.join(authorityRoot, "apps", "consumer"),
      path.join(authorityRoot, "links", "contained"),
    );
    await linkDirectory(
      outsideRoot,
      path.join(authorityRoot, "links", "escaping"),
    );

    await expect(
      runInfoCommand({
        rootDir: authorityRoot,
        project: "links/contained",
        cliVersion: "0.0.0",
      }),
    ).resolves.toMatchObject({ project: { root: "apps/consumer" } });
    await expect(
      runInfoCommand({
        rootDir: authorityRoot,
        project: "links/escaping",
        cliVersion: "0.0.0",
      }),
    ).rejects.toMatchObject({ code: "SALT_PROJECT_ROOT_UNAVAILABLE" });
  });

  it("selects independently versioned exact installed package families", async () => {
    const [coreVersion, themeVersion] = await Promise.all(
      ["core", "theme"].map(async (name) => {
        const manifest = JSON.parse(
          await fs.readFile(
            path.join(process.cwd(), "packages", name, "package.json"),
            "utf8",
          ),
        ) as { version: string };
        return manifest.version;
      }),
    );
    expect(coreVersion).not.toBe(themeVersion);
    const root = await fixtureRoot();
    await fs.writeFile(
      path.join(root, "package.json"),
      `${JSON.stringify({
        name: "salt-info-exact-fixture",
        private: true,
        packageManager: "npm@11.0.0",
        dependencies: {
          "@salt-ds/core": coreVersion,
          "@salt-ds/theme": themeVersion,
        },
      })}\n`,
      "utf8",
    );
    for (const [name, version] of [
      ["core", coreVersion],
      ["theme", themeVersion],
    ] as const) {
      const packageRoot = path.join(root, "node_modules", "@salt-ds", name);
      await fs.mkdir(packageRoot, { recursive: true });
      await fs.writeFile(
        path.join(packageRoot, "package.json"),
        `${JSON.stringify({ name: `@salt-ds/${name}`, version })}\n`,
        "utf8",
      );
    }

    const result = await runInfoCommand({
      rootDir: root,
      project: ".",
      cliVersion: "0.0.0",
    });
    expect(result.selection).toMatchObject({
      status: "selected",
      reason_code: "SALT_PROJECT_SELECTED",
      installed_package_vector: [
        { name: "@salt-ds/core", version: coreVersion },
        { name: "@salt-ds/theme", version: themeVersion },
      ],
    });
    expect(result.coverage.exact_project_package_vector).toBe(true);
  });

  it("uses portable project-relative paths without leaking its temp authority", async () => {
    const root = await fixtureRoot();
    const result = await runInfoCommand({
      rootDir: root,
      project: ".",
      cliVersion: "0.0.0",
    });
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

    const result = await runInfoCommand({
      rootDir: root,
      project: ".",
      cliVersion: "0.0.0",
    });
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
      authorityRoot: root,
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

    const result = await runInfoCommand({
      rootDir: root,
      project: ".",
      cliVersion: "0.0.0",
    });
    expect(result.project.package_manifest.path).toBeNull();
    expect(result.project.workspace.workspaceRoot).toBeNull();
    expect(result.project.packages[0]?.observed_manifest_path).toBeNull();
    expect(result.limitations).toContain("SALT_INFO_PATH_NOT_PORTABLE");
    expect(JSON.stringify(result)).not.toContain(outsidePath);
  });
});
