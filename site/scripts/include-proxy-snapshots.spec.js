import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import includeProxySnapshots from "./include-proxy-snapshots.cjs";

const temporaryDirectories = [];

afterEach(async () => {
  await Promise.all(
    temporaryDirectories
      .splice(0)
      .map((directory) => fs.rm(directory, { recursive: true, force: true })),
  );
});

async function createTraces() {
  const projectDir = await fs.mkdtemp(
    path.join(os.tmpdir(), "salt-proxy-trace-"),
  );
  temporaryDirectories.push(projectDir);
  const distDir = path.join(projectDir, ".next");
  const sourceFile = path.join(distDir, "server/app/page.js.nft.json");
  const targetFile = path.join(distDir, "server/middleware.js.nft.json");
  const source = {
    version: 1,
    files: [
      "../../../snapshots/latest/mosaic-snapshot.json",
      "../../../snapshots/latest/mosaic-routes.json",
      "../../../snapshots/latest/salt/index.mdx",
      "../../../snapshots/latest/salt/index",
      "../../../../node_modules/unrelated.js",
    ],
    fileHashes: ["identity", "inventory", "document", "alias", "unrelated"],
    symlinks: [[3, "../../../snapshots/latest/salt/index.mdx"]],
    entryHash: "page-entry",
  };
  const target = {
    version: 1,
    files: ["chunks/proxy.js", "../node_modules/shiki"],
    fileHashes: ["proxy", "shiki"],
    symlinks: [[1, "../../../node_modules/shiki"]],
    entryHash: "proxy-entry",
  };
  await fs.mkdir(path.dirname(sourceFile), { recursive: true });
  await fs.writeFile(sourceFile, JSON.stringify(source));
  await fs.writeFile(targetFile, JSON.stringify(target));
  return { projectDir, distDir, sourceFile, targetFile, source, target };
}

describe("includeProxySnapshots", () => {
  it("includes complete snapshot assets and rebases aliases without changing existing trace entries", async () => {
    const fixture = await createTraces();

    await expect(includeProxySnapshots(fixture)).resolves.toEqual({
      snapshotFiles: 4,
      added: 4,
    });

    expect(JSON.parse(await fs.readFile(fixture.targetFile, "utf8"))).toEqual({
      ...fixture.target,
      files: [
        ...fixture.target.files,
        "../../snapshots/latest/mosaic-snapshot.json",
        "../../snapshots/latest/mosaic-routes.json",
        "../../snapshots/latest/salt/index.mdx",
        "../../snapshots/latest/salt/index",
      ],
      fileHashes: [
        ...fixture.target.fileHashes,
        "identity",
        "inventory",
        "document",
        "alias",
      ],
      symlinks: [
        ...fixture.target.symlinks,
        [5, "../../snapshots/latest/salt/index.mdx"],
      ],
    });

    const firstOutput = await fs.readFile(fixture.targetFile, "utf8");
    await expect(includeProxySnapshots(fixture)).resolves.toEqual({
      snapshotFiles: 4,
      added: 0,
    });
    expect(await fs.readFile(fixture.targetFile, "utf8")).toBe(firstOutput);
  });

  it.each(["hashes", "symlink index", "identity", "inventory"])(
    "rejects missing or malformed %s without writing a partial proxy trace",
    async (problem) => {
      const fixture = await createTraces();
      if (problem === "hashes") fixture.source.fileHashes.pop();
      if (problem === "symlink index") fixture.source.symlinks[0][0] = 99;
      if (problem === "identity") fixture.source.files[0] += ".missing";
      if (problem === "inventory") fixture.source.files[1] += ".missing";
      await fs.writeFile(fixture.sourceFile, JSON.stringify(fixture.source));
      const original = await fs.readFile(fixture.targetFile, "utf8");

      await expect(includeProxySnapshots(fixture)).rejects.toThrow();
      expect(await fs.readFile(fixture.targetFile, "utf8")).toBe(original);
    },
  );

  it("fails when the source trace is missing", async () => {
    const fixture = await createTraces();
    await fs.unlink(fixture.sourceFile);
    const original = await fs.readFile(fixture.targetFile, "utf8");

    await expect(includeProxySnapshots(fixture)).rejects.toMatchObject({
      code: "ENOENT",
    });
    expect(await fs.readFile(fixture.targetFile, "utf8")).toBe(original);
  });
});
