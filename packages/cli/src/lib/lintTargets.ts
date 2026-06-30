import type { Stats } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import type { LintCommandResult, ResolvedLintTarget } from "../types.js";

const LINTABLE_EXTENSIONS = new Set([
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".mjs",
  ".cjs",
  ".mts",
  ".cts",
]);
const IGNORED_LINT_DIRECTORIES = new Set([
  ".git",
  "coverage",
  "dist",
  "build",
  "node_modules",
  "out",
]);

function isLintableFile(targetPath: string): boolean {
  return LINTABLE_EXTENSIONS.has(path.extname(targetPath).toLowerCase());
}

function shouldTraverseLintDirectory(targetPath: string): boolean {
  return !IGNORED_LINT_DIRECTORIES.has(path.basename(targetPath));
}

async function collectLintableFiles(targetPath: string): Promise<string[]> {
  const stat = await fs.stat(targetPath);
  if (stat.isFile()) {
    return isLintableFile(targetPath) ? [targetPath] : [];
  }

  if (!stat.isDirectory()) {
    return [];
  }

  const entries = await fs.readdir(targetPath, { withFileTypes: true });
  const files = await Promise.all(
    entries
      .sort((left, right) => left.name.localeCompare(right.name))
      .map(async (entry) => {
        const entryPath = path.join(targetPath, entry.name);
        if (entry.isDirectory()) {
          if (!shouldTraverseLintDirectory(entryPath)) {
            return [];
          }
          return collectLintableFiles(entryPath);
        }
        if (!entry.isFile()) {
          return [];
        }
        return isLintableFile(entryPath) ? [entryPath] : [];
      }),
  );

  return files.flat();
}

async function isLikelySaltBearingFile(targetPath: string): Promise<boolean> {
  try {
    const content = await fs.readFile(targetPath, "utf8");
    return content.includes("@salt-ds/");
  } catch {
    return false;
  }
}

export async function resolveLintTargets(
  rawTargets: string[],
  cwd: string,
): Promise<LintCommandResult> {
  const requestedTargets = rawTargets.length > 0 ? rawTargets : ["."];
  const targets: ResolvedLintTarget[] = [];
  const resolvedFiles = new Set<string>();

  for (const rawTarget of requestedTargets) {
    const resolvedTarget = path.resolve(cwd, rawTarget);
    let stat: Stats;
    try {
      stat = await fs.stat(resolvedTarget);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        throw new Error(`Lint target does not exist: ${rawTarget}`);
      }
      throw error;
    }

    if (stat.isFile()) {
      if (!isLintableFile(resolvedTarget)) {
        throw new Error(
          `Lint target is not a supported source file: ${rawTarget}`,
        );
      }
      resolvedFiles.add(resolvedTarget);
      targets.push({
        input: rawTarget,
        resolvedPath: resolvedTarget,
        kind: "file",
        fileCount: 1,
      });
      continue;
    }

    if (!stat.isDirectory()) {
      throw new Error(`Lint target must be a file or directory: ${rawTarget}`);
    }

    const files = (
      await Promise.all(
        (
          await collectLintableFiles(resolvedTarget)
        ).map(async (filePath) =>
          (await isLikelySaltBearingFile(filePath)) ? filePath : null,
        ),
      )
    ).filter((filePath): filePath is string => Boolean(filePath));
    if (files.length === 0) {
      throw new Error(
        `Lint target resolved no Salt-bearing source files: ${rawTarget}`,
      );
    }
    for (const filePath of files) {
      resolvedFiles.add(filePath);
    }
    targets.push({
      input: rawTarget,
      resolvedPath: resolvedTarget,
      kind: "directory",
      fileCount: files.length,
    });
  }

  return {
    rootDir: cwd,
    targetCount: targets.length,
    fileCount: resolvedFiles.size,
    targets,
    resolvedFiles: Array.from(resolvedFiles).sort((left, right) =>
      left.localeCompare(right),
    ),
    registryDir: "",
    registrySource: "monorepo",
    packageVersion: null,
    files: [],
    summary: {
      cleanFiles: 0,
      filesNeedingAttention: 0,
      errors: 0,
      warnings: 0,
      infos: 0,
      fixCount: 0,
      migrationCount: 0,
    },
    notes: [],
  };
}
