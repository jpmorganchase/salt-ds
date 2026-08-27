import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  inspectProjectFileMetadata,
  readBoundedProjectFile,
} from "../boundedProjectFile.js";

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
  it("probes an oversized regular marker without reading its contents", async () => {
    const root = await tempDir();
    const filePath = path.join(root, "yarn.lock");
    const writable = await fs.open(filePath, "w");
    await writable.truncate(9 * 1024 * 1024);
    await writable.close();

    const originalOpen = fs.open.bind(fs);
    const readSpy = vi.fn();
    vi.spyOn(fs, "open").mockImplementationOnce(async (target, flags) => {
      const handle = await originalOpen(target, flags);
      vi.spyOn(handle, "read").mockImplementation(readSpy);
      return handle;
    });

    await expect(
      inspectProjectFileMetadata({
        authorityRoot: root,
        rootDir: root,
        filePath,
      }),
    ).resolves.toMatchObject({ status: "valid" });
    expect(readSpy).not.toHaveBeenCalled();
  });

  it("rejects linked, non-file, and escaping metadata-only markers", async () => {
    const root = await tempDir();
    const outsideRoot = await tempDir();
    const outsidePath = path.join(outsideRoot, "outside.lock");
    await fs.writeFile(outsidePath, "outside", "utf8");

    const hardLink = path.join(root, "hard.lock");
    try {
      await fs.link(outsidePath, hardLink);
      await expect(
        inspectProjectFileMetadata({
          authorityRoot: root,
          rootDir: root,
          filePath: hardLink,
        }),
      ).resolves.toMatchObject({ status: "invalid", reason: "multiple_links" });
    } catch (error) {
      if (
        !["EACCES", "ENOTSUP", "EPERM"].includes(
          (error as NodeJS.ErrnoException).code ?? "",
        )
      ) {
        throw error;
      }
    }

    const directory = path.join(root, "directory.lock");
    await fs.mkdir(directory);
    await expect(
      inspectProjectFileMetadata({
        authorityRoot: root,
        rootDir: root,
        filePath: directory,
      }),
    ).resolves.toMatchObject({ status: "invalid", reason: "not_file" });

    const symbolicLink = path.join(root, "symbolic.lock");
    await fs.symlink(outsidePath, symbolicLink, "file");
    await expect(
      inspectProjectFileMetadata({
        authorityRoot: root,
        rootDir: root,
        filePath: symbolicLink,
      }),
    ).resolves.toMatchObject({ status: "invalid", reason: "outside_root" });
  });

  it("fails a metadata-only probe when the named path changes after opening", async () => {
    const root = await tempDir();
    const filePath = path.join(root, "yarn.lock");
    await fs.writeFile(filePath, "original", "utf8");
    const originalStat = fs.stat.bind(fs);
    vi.spyOn(fs, "stat").mockImplementationOnce(async (target, options) => {
      await fs.rename(filePath, `${filePath}.previous`);
      await fs.writeFile(filePath, "replacement", "utf8");
      return originalStat(target, options as never) as never;
    });

    await expect(
      inspectProjectFileMetadata({
        authorityRoot: root,
        rootDir: root,
        filePath,
      }),
    ).resolves.toMatchObject({
      status: "invalid",
      reason: "changed_during_inspection",
    });
  });

  it.each([-1, 0.5, Number.MAX_SAFE_INTEGER + 1])(
    "rejects an invalid byte cap (%s)",
    async (maxUtf8Bytes) => {
      const root = await tempDir();
      const filePath = path.join(root, "fixture.txt");
      await fs.writeFile(filePath, "fixture", "utf8");

      await expect(
        readBoundedProjectFile({
          authorityRoot: root,
          rootDir: root,
          filePath,
          maxUtf8Bytes,
        }),
      ).rejects.toThrow("maxUtf8Bytes must be a non-negative safe integer");
    },
  );

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

  it("allocates from the opened descriptor size instead of the byte cap", async () => {
    const root = await tempDir();
    const filePath = path.join(root, "fixture.txt");
    await fs.writeFile(filePath, "tiny", "utf8");
    const originalOpen = fs.open.bind(fs);
    const observedBufferSizes: number[] = [];
    vi.spyOn(fs, "open").mockImplementationOnce(async (target, flags) => {
      const handle = await originalOpen(target, flags);
      const originalRead = handle.read.bind(handle);
      const readThrough = originalRead as unknown as (
        ...readArgs: unknown[]
      ) => Promise<{ bytesRead: number; buffer: NodeJS.ArrayBufferView }>;
      vi.spyOn(handle, "read").mockImplementation(async (...args) => {
        const [buffer] = args;
        if (ArrayBuffer.isView(buffer)) {
          observedBufferSizes.push(buffer.byteLength);
        }
        return readThrough(...args);
      });
      return handle;
    });

    await expect(
      readBoundedProjectFile({
        authorityRoot: root,
        rootDir: root,
        filePath,
        maxUtf8Bytes: 1024 * 1024,
      }),
    ).resolves.toMatchObject({ status: "valid", text: "tiny" });
    expect(observedBufferSizes).toEqual([5, 5]);
  });

  it("rejects a hard-linked alias before exposing its content", async () => {
    const projectRoot = await tempDir();
    const outsideRoot = await tempDir();
    const outsidePath = path.join(outsideRoot, "outside.txt");
    const linkedPath = path.join(projectRoot, "fixture.txt");
    await fs.writeFile(outsidePath, "outside-content", "utf8");
    try {
      await fs.link(outsidePath, linkedPath);
    } catch (error) {
      if (
        ["EACCES", "ENOTSUP", "EPERM"].includes(
          (error as NodeJS.ErrnoException).code ?? "",
        )
      ) {
        return;
      }
      throw error;
    }

    const result = await readBoundedProjectFile({
      authorityRoot: projectRoot,
      rootDir: projectRoot,
      filePath: linkedPath,
      maxUtf8Bytes: 64,
    });

    expect(result).toMatchObject({
      status: "invalid",
      reason: "multiple_links",
    });
    expect(JSON.stringify(result)).not.toContain("outside-content");
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

  it("fails closed when an opened file changes in place during the read", async () => {
    const root = await tempDir();
    const filePath = path.join(root, "fixture.txt");
    await fs.writeFile(filePath, "original", "utf8");
    const originalOpen = fs.open.bind(fs);
    vi.spyOn(fs, "open").mockImplementationOnce(async (target, flags) => {
      const handle = await originalOpen(target, flags);
      const originalRead = handle.read.bind(handle);
      const readThrough = originalRead as unknown as (
        ...readArgs: unknown[]
      ) => Promise<{ bytesRead: number; buffer: NodeJS.ArrayBufferView }>;
      vi.spyOn(handle, "read").mockImplementationOnce(async (...args) => {
        const result = await readThrough(...args);
        await fs.writeFile(filePath, "mutated!", "utf8");
        await fs.utimes(filePath, new Date(1_000), new Date(1_000));
        return result;
      });
      return handle;
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
