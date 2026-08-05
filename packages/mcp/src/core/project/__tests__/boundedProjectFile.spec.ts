import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { readBoundedProjectFile } from "../boundedProjectFile.js";

const tempDirs: string[] = [];

async function tempDir(): Promise<string> {
  const directory = await fs.mkdtemp(
    path.join(os.tmpdir(), "salt-bounded-file-"),
  );
  tempDirs.push(directory);
  return directory;
}

afterEach(async () => {
  vi.restoreAllMocks();
  await Promise.all(
    tempDirs
      .splice(0)
      .map((directory) => fs.rm(directory, { recursive: true, force: true })),
  );
});

describe("bounded project file reads", () => {
  it("reads a stable regular file and enforces the byte cap", async () => {
    const root = await tempDir();
    const filePath = path.join(root, "fixture.txt");
    await fs.writeFile(filePath, "fixture", "utf8");

    await expect(
      readBoundedProjectFile({
        authorityRoot: root,
        rootDir: root,
        filePath,
        maxUtf8Bytes: 7,
      }),
    ).resolves.toMatchObject({
      status: "valid",
      text: "fixture",
      utf8_bytes: 7,
    });
    await expect(
      readBoundedProjectFile({
        authorityRoot: root,
        rootDir: root,
        filePath,
        maxUtf8Bytes: 6,
      }),
    ).resolves.toMatchObject({ status: "invalid", reason: "oversized" });
  });

  it("fails closed when the named path changes after opening", async () => {
    const root = await tempDir();
    const filePath = path.join(root, "fixture.txt");
    await fs.writeFile(filePath, "original", "utf8");
    const originalStat = fs.stat.bind(fs);
    vi.spyOn(fs, "stat").mockImplementationOnce(async (target, options) => {
      await fs.rename(filePath, `${filePath}.previous`);
      await fs.writeFile(filePath, "replacement", "utf8");
      return originalStat(target, options as never) as never;
    });

    await expect(
      readBoundedProjectFile({
        authorityRoot: root,
        rootDir: root,
        filePath,
        maxUtf8Bytes: 64,
      }),
    ).resolves.toMatchObject({
      status: "invalid",
      reason: "changed_during_inspection",
    });
  });

  it("fails closed when the filesystem cannot provide stable identity", async () => {
    const root = await tempDir();
    const filePath = path.join(root, "fixture.txt");
    await fs.writeFile(filePath, "fixture", "utf8");
    const originalStat = fs.stat.bind(fs);
    vi.spyOn(fs, "stat").mockImplementationOnce(async (target, options) => {
      const stats = await originalStat(target, options as never);
      Object.defineProperty(stats, "ino", { value: 0n });
      return stats as never;
    });

    await expect(
      readBoundedProjectFile({
        authorityRoot: root,
        rootDir: root,
        filePath,
        maxUtf8Bytes: 64,
      }),
    ).resolves.toMatchObject({
      status: "invalid",
      reason: "identity_unavailable",
    });
  });

  it("never reads more than the byte cap plus one during concurrent growth", async () => {
    const root = await tempDir();
    const filePath = path.join(root, "fixture.txt");
    await fs.writeFile(filePath, "small", "utf8");
    const originalStat = fs.stat.bind(fs);
    vi.spyOn(fs, "stat").mockImplementationOnce(async (target, options) => {
      await fs.appendFile(filePath, "x".repeat(1024), "utf8");
      return originalStat(target, options as never) as never;
    });

    await expect(
      readBoundedProjectFile({
        authorityRoot: root,
        rootDir: root,
        filePath,
        maxUtf8Bytes: 8,
      }),
    ).resolves.toMatchObject({ status: "invalid", reason: "oversized" });
  });

  it("rejects a project root rebound outside its immutable authority", async () => {
    const authorityRoot = await tempDir();
    const outsideRoot = await tempDir();
    const projectRoot = path.join(authorityRoot, "project");
    const previousRoot = path.join(authorityRoot, "project-previous");
    await fs.mkdir(projectRoot);
    await fs.writeFile(
      path.join(outsideRoot, "fixture.txt"),
      "outside",
      "utf8",
    );
    const immutableAuthority = await fs.realpath(authorityRoot);
    await fs.rename(projectRoot, previousRoot);
    await fs.symlink(outsideRoot, projectRoot, "junction");

    await expect(
      readBoundedProjectFile({
        authorityRoot: immutableAuthority,
        rootDir: projectRoot,
        filePath: path.join(projectRoot, "fixture.txt"),
        maxUtf8Bytes: 64,
      }),
    ).resolves.toMatchObject({ status: "invalid", reason: "outside_root" });
  });
});
