import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { discoverSaltProject } from "../discoverProject.js";

const temporaryRoots: string[] = [];

async function fixtureRoot(): Promise<string> {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "salt-cli-discovery-"));
  temporaryRoots.push(root);
  return root;
}

async function write(root: string, relativePath: string, contents: string) {
  const filePath = path.join(root, ...relativePath.split("/"));
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, contents, "utf8");
  return filePath;
}

async function json(root: string, relativePath: string, value: unknown) {
  return write(root, relativePath, JSON.stringify(value));
}

afterEach(async () => {
  await Promise.all(
    temporaryRoots
      .splice(0)
      .map((root) => fs.rm(root, { recursive: true, force: true })),
  );
});

describe("bounded workspace discovery", () => {
  it("is deterministic and respects config, VCS, and fixed exclusions", async () => {
    const root = await fixtureRoot();
    await json(root, "package.json", { name: "fixture", private: true });
    await json(root, "salt.config.json", {
      include: ["src/**/*.ts"],
      exclude: ["src/generated/**"],
    });
    await write(root, ".gitignore", "ignored.ts\r\n");
    await write(root, "src/z.ts", "export const z = 1;\n");
    await write(root, "src/a.ts", "export const a = 1;\n");
    await write(root, "src/ignored.ts", "ignored\n");
    await write(root, "src/generated/output.ts", "generated\n");
    await write(root, "dist/bundle.ts", "built\n");
    await write(root, "src/readme.md", "unsupported\n");

    const first = await discoverSaltProject({ rootDir: root });
    const second = await discoverSaltProject({ rootDir: root });
    expect(first).toEqual(second);
    expect(first.files.map((file) => file.path)).toEqual([
      "src/a.ts",
      "src/z.ts",
    ]);
    expect(first.files.every((file) => file.workspace_unit_id === ".")).toBe(
      true,
    );
    expect(first.skipped).toEqual(
      expect.arrayContaining([
        { path: "dist", reason: "SCAN_FIXED_EXCLUSION" },
        { path: "src/generated", reason: "SCAN_CONFIG_EXCLUSION" },
        { path: "src/ignored.ts", reason: "SCAN_VCS_IGNORED" },
        { path: "src/readme.md", reason: "SCAN_UNSUPPORTED_EXTENSION" },
      ]),
    );
    expect(first.coverage).toEqual({ status: "complete", reasons: [] });
  });

  it("assigns sibling workspaces independent exact Salt vectors", async () => {
    const root = await fixtureRoot();
    await json(root, "package.json", {
      name: "workspace",
      private: true,
      packageManager: "npm@11.0.0",
      workspaces: ["packages/*"],
    });
    await json(root, "package-lock.json", {
      name: "workspace",
      lockfileVersion: 3,
      packages: {},
    });
    for (const [name, version] of [
      ["app-a", "1.40.0"],
      ["app-b", "1.41.0"],
    ]) {
      await json(root, `packages/${name}/package.json`, {
        name,
        private: true,
        dependencies: { "@salt-ds/core": version },
      });
      await write(root, `packages/${name}/src/index.ts`, "export {};\n");
      await json(
        root,
        `packages/${name}/node_modules/@salt-ds/core/package.json`,
        {
          name: "@salt-ds/core",
          version,
        },
      );
    }

    const result = await discoverSaltProject({ rootDir: root });
    const apps = result.workspace_units.filter(
      (unit) => unit.workspace_unit_id !== ".",
    );
    expect(apps.map((unit) => unit.workspace_unit_id)).toEqual([
      "packages/app-a",
      "packages/app-b",
    ]);
    expect(apps.map((unit) => unit.classification)).toEqual([
      "salt-application",
      "salt-application",
    ]);
    expect(
      apps.map((unit) => unit.package_vector[0]?.observed_version),
    ).toEqual(["1.40.0", "1.41.0"]);
    expect(result.files.map((file) => file.workspace_unit_id)).toEqual([
      "packages/app-a",
      "packages/app-b",
    ]);
  });

  it("classifies a shared package boundary as a library with explicit evidence", async () => {
    const root = await fixtureRoot();
    await json(root, "package.json", {
      private: true,
      workspaces: ["packages/*"],
    });
    await json(root, "packages/shared/package.json", {
      name: "@fixture/shared",
      exports: { ".": "./src/index.ts" },
    });
    await write(root, "packages/shared/src/index.ts", "export {};\n");
    const result = await discoverSaltProject({ rootDir: root });
    expect(result.workspace_units).toContainEqual(
      expect.objectContaining({
        workspace_unit_id: "packages/shared",
        classification: "library",
        classification_evidence: ["library_entrypoint:exports"],
        package_vector: [],
      }),
    );
  });

  it("fails coverage and skips sources with overlapping workspace claims", async () => {
    const root = await fixtureRoot();
    await json(root, "package.json", {
      private: true,
      workspaces: ["packages/**"],
    });
    await json(root, "packages/group/package.json", {
      private: true,
      workspaces: ["apps/*"],
    });
    await json(root, "packages/group/apps/demo/package.json", {
      name: "demo",
      private: true,
    });
    await write(root, "packages/group/apps/demo/src/index.ts", "export {};\n");

    const result = await discoverSaltProject({ rootDir: root });
    expect(result.coverage).toEqual({
      status: "failed",
      reasons: ["SCAN_WORKSPACE_OWNERSHIP_CONFLICT"],
    });
    expect(result.files).toEqual([]);
    expect(result.skipped_units).toContainEqual({
      workspace_unit_id: "packages/group/apps/demo",
      reason: "SCAN_WORKSPACE_OWNERSHIP_CONFLICT",
      workspace_claims: [".", "packages/group"],
    });
  });

  it.each([
    ["traversal_depth", 1, "SCAN_TRAVERSAL_DEPTH_LIMIT", "one/two/deep.ts"],
    ["visited_directories", 1, "SCAN_VISITED_DIRECTORY_LIMIT", "one/source.ts"],
    ["directory_entries", 1, "SCAN_DIRECTORY_ENTRY_LIMIT", "a.ts"],
    ["queued_paths", 1, "SCAN_QUEUED_PATH_LIMIT", "one/source.ts"],
    ["selected_files", 1, "SCAN_SELECTED_FILE_LIMIT", "a.ts|b.ts"],
    ["selected_aggregate_bytes", 1, "SCAN_SELECTED_BYTES_LIMIT", "a.ts|b.ts"],
    ["individual_source_bytes", 1, "SCAN_SOURCE_BYTES_LIMIT", "large.ts"],
  ] as const)(
    "enforces the %s discovery ceiling incrementally",
    async (limitName, value, expectedReason, fixture) => {
      const root = await fixtureRoot();
      await json(root, "salt.config.json", { limits: { [limitName]: value } });
      for (const relativePath of fixture.split("|")) {
        await write(
          root,
          relativePath,
          limitName === "individual_source_bytes" ? "ab" : "a",
        );
      }
      const result = await discoverSaltProject({ rootDir: root });
      expect(result.coverage.status).toBe("partial");
      expect(result.coverage.reasons).toContain(expectedReason);
      expect(
        result.skipped.some((entry) => entry.reason === expectedReason),
      ).toBe(true);
    },
  );

  it("treats discovery timeout as failed coverage", async () => {
    const root = await fixtureRoot();
    await json(root, "salt.config.json", {
      limits: { discovery_elapsed_ms: 1 },
    });
    await write(root, "one/source.ts", "a\n");
    let tick = 0;
    const result = await discoverSaltProject({
      rootDir: root,
      now: () => tick++,
    });
    expect(result.coverage.status).toBe("failed");
    expect(result.coverage.reasons).toEqual(["SCAN_DISCOVERY_TIMEOUT"]);
  });

  it("rejects multiply-linked selected sources as failed coverage", async () => {
    const root = await fixtureRoot();
    const source = await write(root, "src/source.ts", "export {};\n");
    await fs.link(source, path.join(root, "src", "copy.ts"));
    const result = await discoverSaltProject({ rootDir: root });
    expect(result.coverage).toEqual({
      status: "failed",
      reasons: ["SCAN_PATH_CONTAINMENT_FAILURE"],
    });
    expect(result.files).toEqual([]);
    expect(result.skipped).toEqual(
      expect.arrayContaining([
        { path: "src/copy.ts", reason: "SCAN_PATH_CONTAINMENT_FAILURE" },
        { path: "src/source.ts", reason: "SCAN_PATH_CONTAINMENT_FAILURE" },
      ]),
    );
  });

  it("rejects an out-of-root directory link without traversing it", async ({
    skip,
  }) => {
    const root = await fixtureRoot();
    const outside = await fixtureRoot();
    await write(outside, "outside.ts", "doNotRead();\n");
    try {
      await fs.symlink(
        outside,
        path.join(root, "linked"),
        process.platform === "win32" ? "junction" : "dir",
      );
    } catch (error) {
      if (
        ["EACCES", "ENOTSUP", "EPERM"].includes(
          (error as NodeJS.ErrnoException).code ?? "",
        )
      ) {
        skip();
        return;
      }
      throw error;
    }
    const result = await discoverSaltProject({ rootDir: root });
    expect(result.coverage).toEqual({
      status: "failed",
      reasons: ["SCAN_PATH_CONTAINMENT_FAILURE"],
    });
    expect(result.files).toEqual([]);
    expect(result.skipped).toContainEqual({
      path: "linked",
      reason: "SCAN_PATH_CONTAINMENT_FAILURE",
    });
  });

  it("returns a truthful complete result for an empty non-Salt repository", async () => {
    const root = await fixtureRoot();
    const result = await discoverSaltProject({ rootDir: root });
    expect(result.files).toEqual([]);
    expect(result.workspace_units).toHaveLength(1);
    expect(result.workspace_units[0]).toMatchObject({
      workspace_unit_id: ".",
      classification: "unknown",
      package_vector: [],
    });
    expect(result.coverage).toEqual({ status: "complete", reasons: [] });
  });
});
