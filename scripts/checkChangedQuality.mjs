#!/usr/bin/env node

import { execFileSync, spawnSync } from "node:child_process";
import { lstat, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { TextDecoder } from "node:util";

import { parseArgs, repositoryRoot } from "./saltAiEvidenceUtils.mjs";

const textExtensions = new Set([
  ".cjs",
  ".css",
  ".cts",
  ".gql",
  ".graphql",
  ".html",
  ".js",
  ".json",
  ".jsonc",
  ".jsx",
  ".md",
  ".mdx",
  ".mjs",
  ".mts",
  ".scss",
  ".ts",
  ".tsx",
  ".yaml",
  ".yml",
]);
const biomeExtensions = new Set([
  ".cjs",
  ".cts",
  ".js",
  ".json",
  ".jsonc",
  ".jsx",
  ".mjs",
  ".mts",
  ".ts",
  ".tsx",
]);
const fullCommit = /^[0-9a-f]{40}$/u;

function invariant(condition, message) {
  if (!condition) throw new Error(message);
}

function hasControlCharacters(value) {
  return [...value].some((character) => {
    const codePoint = character.codePointAt(0);
    return codePoint !== undefined && (codePoint <= 31 || codePoint === 127);
  });
}

export function validateRepositoryPath(value) {
  invariant(
    typeof value === "string" && value.length > 0,
    "Changed path is empty",
  );
  invariant(!value.includes("\\"), `Changed path is not portable: ${value}`);
  invariant(
    !path.posix.isAbsolute(value),
    `Changed path is absolute: ${value}`,
  );
  invariant(
    !value
      .split("/")
      .some((segment) => segment === ".." || segment.length === 0),
    `Changed path escapes or is malformed: ${value}`,
  );
  invariant(
    !hasControlCharacters(value),
    `Changed path contains controls: ${value}`,
  );
  invariant(
    !value.split("/").some((segment) => segment.startsWith("-")),
    `Changed path begins with an option-like segment: ${value}`,
  );
  invariant(
    !value.includes(":"),
    `Changed path contains an unsupported colon: ${value}`,
  );
  return value;
}

function splitNul(value) {
  let text;
  try {
    text = Buffer.isBuffer(value)
      ? new TextDecoder("utf-8", { fatal: true }).decode(value)
      : String(value);
  } catch {
    throw new Error("Git returned a path that is not valid UTF-8");
  }
  return text.split("\0").filter(Boolean).map(validateRepositoryPath);
}

export function validateExactBase(base, runGit) {
  invariant(
    fullCommit.test(base),
    "--base must be a full lowercase 40-character commit SHA",
  );
  const resolved = String(
    runGit(["rev-parse", "--verify", `${base}^{commit}`]),
  ).trim();
  invariant(
    resolved === base,
    "--base did not resolve to the exact requested commit",
  );
  runGit(["merge-base", "--is-ancestor", base, "HEAD"]);
  return base;
}

export function collectChangedPaths(base, runGit) {
  return collectChangedFiles(base, runGit).map((entry) => entry.path);
}

function parseNameStatus(value) {
  const records = splitNul(value);
  const entries = [];
  for (let index = 0; index < records.length; ) {
    const code = records[index++];
    invariant(
      /^(?:[ABDMUTX]|[RC][0-9]{1,3})$/u.test(code),
      `Malformed Git diff status: ${code}`,
    );
    const sourcePath = records[index++];
    invariant(sourcePath !== undefined, `Missing path for Git status ${code}`);
    if (/^[RC]/u.test(code)) {
      const destinationPath = records[index++];
      invariant(
        destinationPath !== undefined,
        `Missing destination for Git status ${code}`,
      );
      entries.push({
        code,
        path: destinationPath,
        sourcePath,
        rename: code.startsWith("R"),
      });
    } else {
      entries.push({ code, path: sourcePath, sourcePath: null, rename: false });
    }
  }
  return entries;
}

export function collectChangedFiles(base, runGit) {
  const diffGroups = [
    ["diff", "--name-status", "-z", "--find-renames", `${base}..HEAD`],
    ["diff", "--cached", "--name-status", "-z", "--find-renames"],
    ["diff", "--name-status", "-z", "--find-renames"],
  ];
  const provenance = new Map();
  const paths = new Set();
  for (const arguments_ of diffGroups) {
    const entries = parseNameStatus(runGit(arguments_, { encoding: null }));
    for (const entry of entries) {
      paths.add(entry.path);
      if (entry.rename) {
        const sourceBase = provenance.has(entry.sourcePath)
          ? provenance.get(entry.sourcePath)
          : entry.sourcePath;
        provenance.delete(entry.sourcePath);
        provenance.set(entry.path, sourceBase);
      } else if (entry.code === "D") {
        provenance.delete(entry.path);
      } else if (entry.code === "A" || entry.code.startsWith("C")) {
        provenance.set(entry.path, null);
      } else if (!provenance.has(entry.path)) {
        provenance.set(entry.path, entry.path);
      }
    }
  }
  for (const file of splitNul(
    runGit(["ls-files", "--others", "--exclude-standard", "-z"], {
      encoding: null,
    }),
  )) {
    paths.add(file);
    provenance.set(file, null);
  }

  return [...paths]
    .sort((left, right) => left.localeCompare(right))
    .map((file) => ({
      path: file,
      basePath: provenance.has(file) ? provenance.get(file) : file,
    }));
}

function crlfCount(bytes) {
  let count = 0;
  for (let index = 0; index + 1 < bytes.length; index += 1) {
    if (bytes[index] === 13 && bytes[index + 1] === 10) count += 1;
  }
  return count;
}

export function assertCrlfNonRegression(file, currentBytes, baseBytes) {
  const current = crlfCount(currentBytes);
  const baseline = baseBytes === null ? 0 : crlfCount(baseBytes);
  invariant(
    current <= baseline,
    `${file} increases CRLF count from ${baseline} to ${current}`,
  );
}

function replaceCrlfWithLf(bytes) {
  const normalized = [];
  for (let index = 0; index < bytes.length; index += 1) {
    if (bytes[index] === 13 && bytes[index + 1] === 10) continue;
    normalized.push(bytes[index]);
  }
  return Buffer.from(normalized);
}

function gitObjectIdForBytes(file, bytes, runGit) {
  return String(
    runGit(["hash-object", `--path=${file}`, "--stdin"], {
      encoding: "utf8",
      input: bytes,
      stdio: ["pipe", "pipe", "pipe"],
    }),
  ).trim();
}

export function crlfAffectsGitObject(file, currentBytes, runGit) {
  if (crlfCount(currentBytes) === 0) return false;
  const normalizedBytes = replaceCrlfWithLf(currentBytes);
  return (
    gitObjectIdForBytes(file, currentBytes, runGit) !==
    gitObjectIdForBytes(file, normalizedBytes, runGit)
  );
}

function supportedText(file) {
  return textExtensions.has(path.posix.extname(file).toLowerCase());
}

function supportedBiome(file) {
  return biomeExtensions.has(path.posix.extname(file).toLowerCase());
}

export function chunkPaths(paths, maximumCharacters = 6000) {
  const chunks = [];
  let current = [];
  let characters = 0;
  for (const file of paths) {
    const next = file.length + 1;
    if (current.length > 0 && characters + next > maximumCharacters) {
      chunks.push(current);
      current = [];
      characters = 0;
    }
    current.push(file);
    characters += next;
  }
  if (current.length > 0) chunks.push(current);
  return chunks;
}

export function runQualityTools(files, runTool) {
  for (const chunk of chunkPaths(files)) {
    runTool("prettier", [
      "--check",
      "--end-of-line",
      "auto",
      "--ignore-path",
      "scripts/fixtures/changed-quality/prettierignore",
      "--",
      ...chunk,
    ]);
  }
  const biomeFiles = files.filter(supportedBiome);
  for (const chunk of chunkPaths(biomeFiles)) {
    runTool("biome", [
      "check",
      "--formatter-enabled=false",
      "--diagnostic-level=error",
      ...chunk,
    ]);
  }
}

function createGitRunner(root) {
  return (arguments_, options = {}) =>
    execFileSync("git", arguments_, {
      cwd: root,
      encoding: Object.hasOwn(options, "encoding") ? options.encoding : "utf8",
      input: options.input,
      maxBuffer: 64 * 1024 * 1024,
      stdio: options.stdio ?? ["ignore", "pipe", "pipe"],
      windowsHide: true,
    });
}

function createToolRunner(root) {
  const yarn = path.join(root, ".yarn", "releases", "yarn-4.17.0.cjs");
  return (tool, arguments_) => {
    const result = spawnSync(
      process.execPath,
      [yarn, "exec", tool, ...arguments_],
      {
        cwd: root,
        stdio: "inherit",
        windowsHide: true,
      },
    );
    invariant(
      result.error === undefined,
      `${tool} could not start: ${result.error?.message}`,
    );
    invariant(
      result.status === 0,
      `${tool} failed with exit code ${String(result.status)}`,
    );
  };
}

async function readBaseBlob(base, file, runGit) {
  try {
    return runGit(["show", `${base}:${file}`], { encoding: null });
  } catch (error) {
    if (error.status === 128) return null;
    throw error;
  }
}

export async function checkChangedQuality({
  base,
  root = repositoryRoot,
  runGit,
  runTool,
} = {}) {
  const git = runGit ?? createGitRunner(root);
  const tools = runTool ?? createToolRunner(root);
  validateExactBase(base, git);
  const changedFiles = collectChangedFiles(base, git);
  const changed = changedFiles.map((entry) => entry.path);
  const files = [];
  for (const { path: file, basePath } of changedFiles) {
    if (!supportedText(file)) continue;
    const absolute = path.resolve(root, ...file.split("/"));
    const containment = path.relative(root, absolute);
    invariant(
      containment !== ".." &&
        !containment.startsWith(`..${path.sep}`) &&
        !path.isAbsolute(containment),
      `${file} escapes the repository`,
    );
    let stats;
    try {
      stats = await lstat(absolute);
    } catch (error) {
      if (error.code === "ENOENT") continue;
      throw error;
    }
    invariant(
      stats.isFile() && !stats.isSymbolicLink(),
      `${file} is not a regular file`,
    );
    const [currentBytes, baseBytes] = await Promise.all([
      readFile(absolute),
      basePath === null
        ? Promise.resolve(null)
        : readBaseBlob(base, basePath, git),
    ]);
    if (crlfAffectsGitObject(file, currentBytes, git))
      assertCrlfNonRegression(file, currentBytes, baseBytes);
    files.push(file);
  }
  runQualityTools(files, tools);
  return { base, changed, checked: files };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const allowed = new Set(["--base"]);
  for (const key of args.keys())
    invariant(allowed.has(key), `Unknown option: ${key}`);
  invariant(typeof args.get("--base") === "string", "--base is required");
  const result = await checkChangedQuality({
    base: String(args.get("--base")),
  });
  console.log(
    `Changed quality passed (${result.checked.length} supported files; ${result.changed.length} total paths; base ${result.base}).`,
  );
}

const isDirect =
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isDirect) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
