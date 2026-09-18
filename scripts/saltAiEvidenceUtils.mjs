import { createHash } from "node:crypto";
import { mkdir, readFile, rename, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

export const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

export function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, canonicalize(value[key])]),
    );
  }
  return value;
}

export function stableJson(value) {
  return `${JSON.stringify(canonicalize(value), null, 2)}\n`;
}

export function sha256(value) {
  return `sha256:${createHash("sha256").update(value).digest("hex")}`;
}

export async function sha256File(file) {
  return sha256(await readFile(file));
}

export async function readJson(file) {
  return JSON.parse(await readFile(file, "utf8"));
}

export async function writeJsonAtomic(file, value) {
  await mkdir(path.dirname(file), { recursive: true });
  const temporary = `${file}.${process.pid}.tmp`;
  await writeFile(temporary, stableJson(value), "utf8");
  await rename(temporary, file);
}

export async function gitHeadCommit() {
  const dotGit = path.join(repositoryRoot, ".git");
  let gitDirectory = dotGit;
  if (!(await stat(dotGit)).isDirectory()) {
    const marker = await readFile(dotGit, "utf8");
    const match = marker.match(/^gitdir:\s*(.+)\s*$/u);
    assert(match, "Unable to resolve the Git directory");
    gitDirectory = path.resolve(repositoryRoot, match[1]);
  }
  let commonDirectory = gitDirectory;
  try {
    const commonMarker = (await readFile(
      path.join(gitDirectory, "commondir"),
      "utf8",
    )).trim();
    commonDirectory = path.resolve(gitDirectory, commonMarker);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  const head = (await readFile(path.join(gitDirectory, "HEAD"), "utf8")).trim();
  if (/^[0-9a-f]{40}$/u.test(head)) return head;
  const match = head.match(/^ref:\s*(.+)$/u);
  assert(match, "Git HEAD is neither a commit nor a symbolic ref");
  try {
    return (await readFile(path.join(commonDirectory, match[1]), "utf8")).trim();
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  const packedRefs = await readFile(
    path.join(commonDirectory, "packed-refs"),
    "utf8",
  );
  const packed = packedRefs
    .split(/\r?\n/u)
    .find((line) => line.endsWith(` ${match[1]}`));
  assert(packed, `Unable to resolve Git ref ${match[1]}`);
  return packed.split(" ")[0];
}

export function parseArgs(argv) {
  const values = new Map();
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (!argument.startsWith("--")) {
      throw new Error(`Unexpected argument: ${argument}`);
    }
    const next = argv[index + 1];
    if (next === undefined || next.startsWith("--")) {
      values.set(argument, true);
    } else {
      values.set(argument, next);
      index += 1;
    }
  }
  return values;
}

export function portablePath(file) {
  return path.relative(repositoryRoot, file).replaceAll("\\", "/");
}

export function assert(condition, message) {
  if (!condition) throw new Error(message);
}

export function digestPattern(value) {
  return /^sha256:[0-9a-f]{64}$/u.test(value);
}

export function commitPattern(value) {
  return /^[0-9a-f]{7,40}$/u.test(value);
}
