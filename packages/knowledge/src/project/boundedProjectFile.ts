import { type BigIntStats, constants as fsConstants } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";

export type BoundedProjectFileFailure =
  | "outside_root"
  | "not_file"
  | "multiple_links"
  | "unreadable"
  | "oversized"
  | "changed_during_inspection"
  | "identity_unavailable";

export type BoundedProjectFileResult =
  | { status: "absent"; path: string }
  | {
      status: "valid";
      path: string;
      text: string;
      utf8_bytes: number;
    }
  | {
      status: "invalid";
      path: string;
      reason: BoundedProjectFileFailure;
    };

export type ProjectFileMetadataResult =
  | { status: "absent"; path: string }
  | { status: "valid"; path: string }
  | {
      status: "invalid";
      path: string;
      reason: BoundedProjectFileFailure;
    };

function isPathInside(rootDir: string, candidatePath: string): boolean {
  const relative = path.relative(rootDir, candidatePath);
  return (
    relative === "" ||
    (!relative.startsWith(`..${path.sep}`) &&
      relative !== ".." &&
      !path.isAbsolute(relative))
  );
}

function portable(value: string): string {
  return value.split(path.sep).join("/");
}

function isMissing(error: unknown): boolean {
  return (error as NodeJS.ErrnoException | undefined)?.code === "ENOENT";
}

function hasUsableIdentity(stats: BigIntStats): boolean {
  return stats.ino > 0n && stats.dev >= 0n;
}

function sameIdentity(left: BigIntStats, right: BigIntStats): boolean {
  return left.dev === right.dev && left.ino === right.ino;
}

function sameDescriptorSnapshot(
  before: BigIntStats,
  after: BigIntStats,
): boolean {
  return (
    before.isFile() === after.isFile() &&
    sameIdentity(before, after) &&
    before.nlink === after.nlink &&
    before.size === after.size &&
    before.mtimeNs === after.mtimeNs &&
    before.ctimeNs === after.ctimeNs
  );
}

type OpenIdentityCheck =
  | { status: "valid"; realPath: string }
  | { status: "invalid"; reason: BoundedProjectFileFailure };

async function verifyOpenIdentity(input: {
  absoluteAuthorityRoot: string;
  absoluteRoot: string;
  absolutePath: string;
  openedStats: BigIntStats;
}): Promise<OpenIdentityCheck> {
  let realRoot: string;
  let realPath: string;
  let namedStats: BigIntStats;
  let confirmedRealPath: string;
  try {
    realRoot = await fs.realpath(input.absoluteRoot);
    realPath = await fs.realpath(input.absolutePath);
    if (
      !isPathInside(input.absoluteAuthorityRoot, realRoot) ||
      !isPathInside(input.absoluteAuthorityRoot, realPath) ||
      !isPathInside(realRoot, realPath)
    ) {
      return { status: "invalid", reason: "outside_root" };
    }
    namedStats = await fs.stat(input.absolutePath, { bigint: true });
    confirmedRealPath = await fs.realpath(input.absolutePath);
  } catch (error) {
    return {
      status: "invalid",
      reason: isMissing(error) ? "changed_during_inspection" : "unreadable",
    };
  }

  if (path.relative(realPath, confirmedRealPath) !== "") {
    return { status: "invalid", reason: "changed_during_inspection" };
  }
  if (
    !isPathInside(input.absoluteAuthorityRoot, realRoot) ||
    !isPathInside(input.absoluteAuthorityRoot, confirmedRealPath) ||
    !isPathInside(realRoot, confirmedRealPath)
  ) {
    return { status: "invalid", reason: "outside_root" };
  }
  if (!hasUsableIdentity(input.openedStats) || !hasUsableIdentity(namedStats)) {
    return { status: "invalid", reason: "identity_unavailable" };
  }
  if (input.openedStats.nlink !== 1n || namedStats.nlink !== 1n) {
    return { status: "invalid", reason: "multiple_links" };
  }
  if (!sameIdentity(input.openedStats, namedStats)) {
    return { status: "invalid", reason: "changed_during_inspection" };
  }
  return { status: "valid", realPath: confirmedRealPath };
}

/**
 * Probes a caller-authorized project file without reading its contents. The
 * containment, no-follow, regular-file, single-link, identity, and mutation
 * checks intentionally match readBoundedProjectFile.
 */
export async function inspectProjectFileMetadata(input: {
  authorityRoot: string;
  rootDir: string;
  filePath: string;
}): Promise<ProjectFileMetadataResult> {
  const absoluteAuthorityRoot = path.resolve(input.authorityRoot);
  const absoluteRoot = path.resolve(input.rootDir);
  const absolutePath = path.resolve(input.filePath);
  const publicPath = portable(absolutePath);

  if (
    !isPathInside(absoluteAuthorityRoot, absoluteRoot) ||
    !isPathInside(absoluteAuthorityRoot, absolutePath) ||
    !isPathInside(absoluteRoot, absolutePath)
  ) {
    return { status: "invalid", path: publicPath, reason: "outside_root" };
  }

  try {
    const realRoot = await fs.realpath(absoluteRoot);
    const realPath = await fs.realpath(absolutePath);
    if (
      !isPathInside(absoluteAuthorityRoot, realRoot) ||
      !isPathInside(absoluteAuthorityRoot, realPath) ||
      !isPathInside(realRoot, realPath)
    ) {
      return { status: "invalid", path: publicPath, reason: "outside_root" };
    }
  } catch (error) {
    return isMissing(error)
      ? { status: "absent", path: publicPath }
      : { status: "invalid", path: publicPath, reason: "unreadable" };
  }

  let handle: fs.FileHandle | null = null;
  try {
    const noFollow = fsConstants.O_NOFOLLOW ?? 0;
    handle = await fs.open(absolutePath, fsConstants.O_RDONLY | noFollow);
    const before = await handle.stat({ bigint: true });
    if (!before.isFile()) {
      return { status: "invalid", path: publicPath, reason: "not_file" };
    }
    if (before.nlink !== 1n) {
      return { status: "invalid", path: publicPath, reason: "multiple_links" };
    }
    const beforeIdentity = await verifyOpenIdentity({
      absoluteAuthorityRoot,
      absoluteRoot,
      absolutePath,
      openedStats: before,
    });
    if (beforeIdentity.status === "invalid") {
      return {
        status: "invalid",
        path: publicPath,
        reason: beforeIdentity.reason,
      };
    }
    const after = await handle.stat({ bigint: true });
    if (!sameDescriptorSnapshot(before, after)) {
      return {
        status: "invalid",
        path: publicPath,
        reason: "changed_during_inspection",
      };
    }
    const afterIdentity = await verifyOpenIdentity({
      absoluteAuthorityRoot,
      absoluteRoot,
      absolutePath,
      openedStats: after,
    });
    if (afterIdentity.status === "invalid") {
      return {
        status: "invalid",
        path: publicPath,
        reason: afterIdentity.reason,
      };
    }
    return { status: "valid", path: portable(afterIdentity.realPath) };
  } catch (error) {
    return isMissing(error)
      ? {
          status: "invalid",
          path: publicPath,
          reason: "changed_during_inspection",
        }
      : { status: "invalid", path: publicPath, reason: "unreadable" };
  } finally {
    await handle?.close().catch(() => undefined);
  }
}

/**
 * The sole primitive for reading caller-authorized project marker/config files.
 * It checks lexical and canonical containment, opens the caller-named path with
 * no-follow where the platform supports it, verifies the opened handle against
 * the named path, requires a regular file, and applies the byte cap before and
 * after reading.
 */
export async function readBoundedProjectFile(input: {
  authorityRoot: string;
  rootDir: string;
  filePath: string;
  maxUtf8Bytes: number;
}): Promise<BoundedProjectFileResult> {
  if (!Number.isSafeInteger(input.maxUtf8Bytes) || input.maxUtf8Bytes < 0) {
    throw new RangeError("maxUtf8Bytes must be a non-negative safe integer");
  }
  const absoluteAuthorityRoot = path.resolve(input.authorityRoot);
  const absoluteRoot = path.resolve(input.rootDir);
  const absolutePath = path.resolve(input.filePath);
  const publicPath = portable(absolutePath);

  if (
    !isPathInside(absoluteAuthorityRoot, absoluteRoot) ||
    !isPathInside(absoluteAuthorityRoot, absolutePath) ||
    !isPathInside(absoluteRoot, absolutePath)
  ) {
    return { status: "invalid", path: publicPath, reason: "outside_root" };
  }

  let realRoot: string;
  let realPath: string;
  try {
    realRoot = await fs.realpath(absoluteRoot);
    realPath = await fs.realpath(absolutePath);
  } catch (error) {
    return isMissing(error)
      ? { status: "absent", path: publicPath }
      : { status: "invalid", path: publicPath, reason: "unreadable" };
  }

  if (
    !isPathInside(absoluteAuthorityRoot, realRoot) ||
    !isPathInside(absoluteAuthorityRoot, realPath) ||
    !isPathInside(realRoot, realPath)
  ) {
    return { status: "invalid", path: publicPath, reason: "outside_root" };
  }

  let handle: fs.FileHandle | null = null;
  try {
    const noFollow = fsConstants.O_NOFOLLOW ?? 0;
    handle = await fs.open(absolutePath, fsConstants.O_RDONLY | noFollow);
    const stats = await handle.stat({ bigint: true });
    if (!stats.isFile()) {
      return { status: "invalid", path: publicPath, reason: "not_file" };
    }
    if (stats.nlink !== 1n) {
      return { status: "invalid", path: publicPath, reason: "multiple_links" };
    }
    if (stats.size > BigInt(input.maxUtf8Bytes)) {
      return { status: "invalid", path: publicPath, reason: "oversized" };
    }
    const beforeRead = await verifyOpenIdentity({
      absoluteAuthorityRoot,
      absoluteRoot,
      absolutePath,
      openedStats: stats,
    });
    if (beforeRead.status === "invalid") {
      return { status: "invalid", path: publicPath, reason: beforeRead.reason };
    }
    let bytes = Buffer.alloc(Number(stats.size) + 1);
    let utf8Bytes = 0;
    for (;;) {
      if (utf8Bytes === bytes.length) {
        if (bytes.length >= input.maxUtf8Bytes + 1) break;
        const grown = Buffer.alloc(
          Math.min(
            input.maxUtf8Bytes + 1,
            Math.max(bytes.length + 1, bytes.length * 2),
          ),
        );
        bytes.copy(grown, 0, 0, utf8Bytes);
        bytes = grown;
      }
      const { bytesRead } = await handle.read(
        bytes,
        utf8Bytes,
        bytes.length - utf8Bytes,
        null,
      );
      if (bytesRead === 0) break;
      utf8Bytes += bytesRead;
    }
    const finalStats = await handle.stat({ bigint: true });
    if (utf8Bytes > input.maxUtf8Bytes) {
      return { status: "invalid", path: publicPath, reason: "oversized" };
    }
    if (!sameDescriptorSnapshot(stats, finalStats)) {
      return {
        status: "invalid",
        path: publicPath,
        reason: "changed_during_inspection",
      };
    }
    const text = bytes.subarray(0, utf8Bytes).toString("utf8");
    const afterRead = await verifyOpenIdentity({
      absoluteAuthorityRoot,
      absoluteRoot,
      absolutePath,
      openedStats: finalStats,
    });
    if (afterRead.status === "invalid") {
      return { status: "invalid", path: publicPath, reason: afterRead.reason };
    }
    return {
      status: "valid",
      path: portable(afterRead.realPath),
      text,
      utf8_bytes: utf8Bytes,
    };
  } catch (error) {
    return isMissing(error)
      ? {
          status: "invalid",
          path: publicPath,
          reason: "changed_during_inspection",
        }
      : { status: "invalid", path: publicPath, reason: "unreadable" };
  } finally {
    await handle?.close().catch(() => undefined);
  }
}
