import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { buildRegistryBuildInfo } from "../build/buildRegistryBuildInfo.js";

const tempDirs: string[] = [];

async function createRepoFixture(docsContent = "alpha"): Promise<string> {
  const repoRoot = await fs.mkdtemp(
    path.join(os.tmpdir(), "salt-registry-build-info-"),
  );
  tempDirs.push(repoRoot);

  await Promise.all([
    fs.mkdir(path.join(repoRoot, "site", "docs", "nested"), {
      recursive: true,
    }),
    fs.mkdir(path.join(repoRoot, "site", "public"), { recursive: true }),
    fs.mkdir(path.join(repoRoot, "site", "snapshots", "latest", "salt"), {
      recursive: true,
    }),
  ]);
  await Promise.all([
    fs.writeFile(
      path.join(repoRoot, "site", "docs", "nested", "guide.md"),
      docsContent,
      "utf8",
    ),
    fs.writeFile(
      path.join(repoRoot, "site", "public", "search-data.json"),
      '{"results":[]}',
      "utf8",
    ),
    fs.writeFile(
      path.join(
        repoRoot,
        "site",
        "snapshots",
        "latest",
        "salt",
        "component.json",
      ),
      '{"name":"Button"}',
      "utf8",
    ),
  ]);

  return repoRoot;
}

afterEach(async () => {
  await Promise.all(
    tempDirs
      .splice(0, tempDirs.length)
      .map((dir) => fs.rm(dir, { recursive: true, force: true })),
  );
});

describe("registry build provenance", () => {
  it("hashes directory contents rather than file metadata", async () => {
    const repoRoot = await createRepoFixture("alpha");
    const docsPath = path.join(repoRoot, "site", "docs", "nested", "guide.md");
    const initial = await buildRegistryBuildInfo(repoRoot);

    await fs.utimes(
      docsPath,
      new Date("2030-01-01T00:00:00.000Z"),
      new Date("2030-01-01T00:00:00.000Z"),
    );
    const afterMtimeChange = await buildRegistryBuildInfo(repoRoot);

    expect(afterMtimeChange.source_artifacts.docs_root.sha256).toBe(
      initial.source_artifacts.docs_root.sha256,
    );

    await fs.writeFile(docsPath, "bravo", "utf8");
    const afterContentChange = await buildRegistryBuildInfo(repoRoot);

    expect(afterContentChange.source_artifacts.docs_root.sha256).not.toBe(
      initial.source_artifacts.docs_root.sha256,
    );
  });

  it("produces the same digests after relocating identical source trees", async () => {
    const firstRoot = await createRepoFixture();
    const secondRoot = await createRepoFixture();
    const first = await buildRegistryBuildInfo(firstRoot);
    const second = await buildRegistryBuildInfo(secondRoot);

    expect(first.source_root).toBe(".");
    expect(second.source_root).toBe(".");
    expect(JSON.stringify(first)).not.toContain(firstRoot);
    expect(JSON.stringify(second)).not.toContain(secondRoot);
    expect(second.source_artifacts.docs_root.sha256).toBe(
      first.source_artifacts.docs_root.sha256,
    );
    expect(second.source_artifacts.search_data.sha256).toBe(
      first.source_artifacts.search_data.sha256,
    );
    expect(second.source_artifacts.snapshot_root.sha256).toBe(
      first.source_artifacts.snapshot_root.sha256,
    );
  });
});
