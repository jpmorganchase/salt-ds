import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { TextDecoder } from "node:util";
import { assert } from "./shared.mjs";

const TEXT_EXTENSIONS = new Set([
  ".css",
  ".csv",
  ".html",
  ".js",
  ".json",
  ".jsx",
  ".md",
  ".mdx",
  ".mjs",
  ".ts",
  ".tsx",
  ".txt",
  ".yaml",
  ".yml",
]);
const utf8Decoder = new TextDecoder("utf-8", { fatal: true });

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

function compareCodePoints(left, right) {
  return left < right ? -1 : left > right ? 1 : 0;
}

export function normalizeRelativeSkillPath(relativePath) {
  assert(typeof relativePath === "string", "Skill path must be a string.");
  const normalized = relativePath.replaceAll("\\", "/");
  assert(normalized.length > 0, "Skill path must not be empty.");
  assert(!normalized.startsWith("/"), "Skill path must be relative.");
  assert(!/^[A-Za-z]:\//u.test(normalized), "Skill path must be relative.");
  const segments = normalized.split("/");
  assert(
    segments.every(
      (segment) => segment.length > 0 && segment !== "." && segment !== "..",
    ),
    `Unsafe skill path: ${relativePath}`,
  );
  return segments.join("/");
}

export function canonicalizeSkillRecords(inputRecords) {
  const seen = new Set();
  const records = inputRecords.map(({ path: relativePath, bytes }) => {
    const normalizedPath = normalizeRelativeSkillPath(relativePath);
    assert(
      !seen.has(normalizedPath),
      `Duplicate skill path: ${normalizedPath}`,
    );
    seen.add(normalizedPath);
    const rawBytes = Buffer.from(bytes);
    const extension = path.posix.extname(normalizedPath).toLowerCase();
    let canonicalBytes = rawBytes;

    if (TEXT_EXTENSIONS.has(extension)) {
      let text;
      try {
        text = utf8Decoder.decode(rawBytes);
      } catch {
        throw new Error(`Invalid UTF-8 in skill text file: ${normalizedPath}`);
      }
      canonicalBytes = Buffer.from(
        text.replaceAll("\r\n", "\n").replaceAll("\r", "\n"),
        "utf8",
      );
    }

    return {
      path: normalizedPath,
      bytes: canonicalBytes.byteLength,
      sha256: sha256(canonicalBytes),
    };
  });

  records.sort((left, right) => compareCodePoints(left.path, right.path));
  const serialized = JSON.stringify(records);
  return {
    algorithm: "salt_skill_tree_v1",
    records,
    sha256: sha256(Buffer.from(serialized, "utf8")),
  };
}

export async function hashCanonicalSkillTree(skillRoot) {
  const canonicalRoot = await fs.realpath(skillRoot);
  const rootStats = await fs.lstat(skillRoot);
  assert(
    rootStats.isDirectory(),
    `Skill root is not a directory: ${skillRoot}`,
  );
  assert(
    !rootStats.isSymbolicLink(),
    `Skill root must not be a symlink or junction: ${skillRoot}`,
  );
  const inputRecords = [];

  async function walk(directory) {
    const entries = await fs.readdir(directory, { withFileTypes: true });
    entries.sort((left, right) => compareCodePoints(left.name, right.name));

    for (const entry of entries) {
      const absolutePath = path.join(directory, entry.name);
      const stats = await fs.lstat(absolutePath);
      assert(
        !stats.isSymbolicLink(),
        `Skill tree contains a symlink or junction: ${absolutePath}`,
      );
      const canonicalPath = await fs.realpath(absolutePath);
      const relativeCanonical = path.relative(canonicalRoot, canonicalPath);
      assert(
        relativeCanonical !== "" &&
          !relativeCanonical.startsWith(`..${path.sep}`) &&
          relativeCanonical !== ".." &&
          !path.isAbsolute(relativeCanonical),
        `Skill tree entry escapes its root: ${absolutePath}`,
      );

      if (stats.isDirectory()) {
        await walk(absolutePath);
        continue;
      }
      assert(
        stats.isFile(),
        `Skill tree contains a special file: ${absolutePath}`,
      );
      inputRecords.push({
        path: path.relative(skillRoot, absolutePath),
        bytes: await fs.readFile(absolutePath),
      });
    }
  }

  await walk(skillRoot);
  assert(inputRecords.length > 0, `Skill tree is empty: ${skillRoot}`);
  return canonicalizeSkillRecords(inputRecords);
}
