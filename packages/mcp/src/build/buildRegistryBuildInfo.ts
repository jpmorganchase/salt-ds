import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import fg from "fast-glob";
import { toPosixPath } from "../registry/paths.js";
import type { RegistryBuildInfo, RegistrySourceArtifact } from "../types.js";

function toRelativeSourcePath(repoRoot: string, targetPath: string): string {
  const relativePath = path.relative(repoRoot, targetPath);
  return toPosixPath(relativePath.length > 0 ? relativePath : ".");
}

async function readDirectoryStats(rootPath: string): Promise<{
  file_count: number;
  newest_file_modified_at: string | null;
  sha256: string | null;
}> {
  const files = await fg("**/*", {
    cwd: rootPath,
    absolute: true,
    onlyFiles: true,
  });

  if (files.length === 0) {
    return {
      file_count: 0,
      newest_file_modified_at: null,
      sha256: null,
    };
  }

  const sortedFiles = files.sort((left, right) => left.localeCompare(right));
  const hash = crypto.createHash("sha256");
  let newestModifiedAt: string | null = null;

  for (const filePath of sortedFiles) {
    const fileStat = await fs.stat(filePath);
    const modifiedAt = fileStat.mtime.toISOString();
    if (!newestModifiedAt || modifiedAt > newestModifiedAt) {
      newestModifiedAt = modifiedAt;
    }
    hash.update(toPosixPath(path.relative(rootPath, filePath)));
    hash.update(String(fileStat.size));
    hash.update(String(fileStat.mtimeMs));
  }

  return {
    file_count: sortedFiles.length,
    newest_file_modified_at: newestModifiedAt,
    sha256: hash.digest("hex"),
  };
}

async function getSourceArtifactInfo(
  repoRoot: string,
  targetPath: string,
  kind: RegistrySourceArtifact["kind"],
): Promise<RegistrySourceArtifact> {
  try {
    const stat = await fs.stat(targetPath);
    if (kind === "file") {
      const fileContents = await fs.readFile(targetPath);
      return {
        path: toRelativeSourcePath(repoRoot, targetPath),
        kind,
        exists: true,
        sha256: crypto.createHash("sha256").update(fileContents).digest("hex"),
        last_modified_at: stat.mtime.toISOString(),
        file_count: 1,
        newest_file_modified_at: stat.mtime.toISOString(),
      };
    }

    const directoryStats = await readDirectoryStats(targetPath);
    return {
      path: toRelativeSourcePath(repoRoot, targetPath),
      kind,
      exists: true,
      sha256: directoryStats.sha256,
      last_modified_at: stat.mtime.toISOString(),
      file_count: directoryStats.file_count,
      newest_file_modified_at: directoryStats.newest_file_modified_at,
    };
  } catch {
    return {
      path: toRelativeSourcePath(repoRoot, targetPath),
      kind,
      exists: false,
      sha256: null,
      last_modified_at: null,
      file_count: null,
      newest_file_modified_at: null,
    };
  }
}

export async function buildRegistryBuildInfo(
  repoRoot: string,
): Promise<RegistryBuildInfo> {
  const docsRoot = path.join(repoRoot, "site", "docs");
  const searchDataPath = path.join(
    repoRoot,
    "site",
    "public",
    "search-data.json",
  );
  const snapshotRoot = path.join(
    repoRoot,
    "site",
    "snapshots",
    "latest",
    "salt",
  );

  return {
    source_root: toPosixPath(repoRoot),
    source_artifacts: {
      docs_root: await getSourceArtifactInfo(repoRoot, docsRoot, "directory"),
      search_data: await getSourceArtifactInfo(
        repoRoot,
        searchDataPath,
        "file",
      ),
      snapshot_root: await getSourceArtifactInfo(
        repoRoot,
        snapshotRoot,
        "directory",
      ),
    },
  };
}
