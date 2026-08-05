import { type BigIntStats, constants as fsConstants } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";

export type BoundedProjectFileFailure =
  | "outside_root"
  | "not_file"
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
  if (!sameIdentity(input.openedStats, namedStats)) {
    return { status: "invalid", reason: "changed_during_inspection" };
  }
  return { status: "valid", realPath: confirmedRealPath };
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
    const bytes = Buffer.alloc(input.maxUtf8Bytes + 1);
    let utf8Bytes = 0;
    while (utf8Bytes < bytes.length) {
      const { bytesRead } = await handle.read(
        bytes,
        utf8Bytes,
        bytes.length - utf8Bytes,
        null,
      );
      if (bytesRead === 0) break;
      utf8Bytes += bytesRead;
    }
    if (utf8Bytes > input.maxUtf8Bytes) {
      return { status: "invalid", path: publicPath, reason: "oversized" };
    }
    const text = bytes.subarray(0, utf8Bytes).toString("utf8");
    const afterRead = await verifyOpenIdentity({
      absoluteAuthorityRoot,
      absoluteRoot,
      absolutePath,
      openedStats: stats,
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
