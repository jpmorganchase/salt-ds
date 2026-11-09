/**
 * Snapshot releases: checks the publish job runs on every tarball before it
 * can be published.
 *
 * The tarballs come from a job that ran pull request code, so they are not
 * trusted. Only the publish job holds a publish credential, and it publishes
 * a tarball only if:
 *
 * - every entry is a regular file or directory under `package/`, with no
 *   `.`/`..` segments, absolute paths, links or duplicate paths;
 * - it has exactly one `package/package.json`;
 * - the package is in the `@salt-ds` scope. Pull requests can add packages,
 *   so there is no fixed list: npm only issues a publish token for packages
 *   that trust this repository's release workflow;
 * - the version is a snapshot version (`0.0.0-snapshot-<timestamp>`), the
 *   same for every tarball, so a snapshot can never satisfy a normal range;
 * - `publishConfig` only has the manifest fields Yarn packs from it (npm
 *   applies any other key as config, such as the registry or dist-tag) and
 *   there are no install scripts;
 * - npm's own `publish --dry-run` reports the same name and version.
 */
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { gunzipSync } from "node:zlib";

export const SNAPSHOT_VERSION = /^0\.0\.0-snapshot-\d{14}$/;
const PACKAGE_NAME = /^@salt-ds\/[a-z0-9][a-z0-9._-]*$/;
// `provenance` is overridden by the publish command's `--provenance=false`.
const PUBLISH_CONFIG_KEYS = new Set([
  "bin",
  "browser",
  "exports",
  "main",
  "module",
  "provenance",
  "type",
  "types",
  "typings",
]);
const INSTALL_SCRIPTS = ["preinstall", "install", "postinstall"];
const FILE_TYPES = new Set(["0", "\0", "7"]);
const DIRECTORY_TYPE = "5";

function readString(block, start, length) {
  const field = block.subarray(start, start + length);
  const end = field.indexOf(0);
  return field.toString("utf8", 0, end === -1 ? field.length : end);
}

function readOctal(block, start, length) {
  const text = readString(block, start, length).trim();
  if (!/^[0-7]*$/.test(text)) {
    throw new Error(`corrupt tar header (bad number "${text}")`);
  }
  return text ? Number.parseInt(text, 8) : 0;
}

function checkChecksum(header) {
  const expected = readOctal(header, 148, 8);
  let sum = 0;
  for (let i = 0; i < 512; i++) {
    sum += i >= 148 && i < 156 ? 32 : header[i];
  }
  if (sum !== expected) {
    throw new Error("corrupt tar header (checksum mismatch)");
  }
}

function readPaxPath(data) {
  let paxPath;
  let offset = 0;
  while (offset < data.length) {
    const space = data.indexOf(0x20, offset);
    const length = Number.parseInt(data.toString("utf8", offset, space), 10);
    if (space === -1 || !Number.isInteger(length) || length <= 0) {
      throw new Error("corrupt pax header");
    }
    const record = data.toString("utf8", space + 1, offset + length - 1);
    const separator = record.indexOf("=");
    if (record.slice(0, separator) === "path") {
      paxPath = record.slice(separator + 1);
    }
    offset += length;
  }
  return paxPath;
}

/** Lists the entries of a (decompressed) tar archive. */
export function readTarEntries(archive) {
  const entries = [];
  let offset = 0;
  let pendingPath;
  while (offset + 512 <= archive.length) {
    const header = archive.subarray(offset, offset + 512);
    if (header.every((byte) => byte === 0)) {
      break;
    }
    checkChecksum(header);
    const size = readOctal(header, 124, 12);
    const type = String.fromCharCode(header[156]);
    const dataStart = offset + 512;
    const data = archive.subarray(dataStart, dataStart + size);
    if (data.length < size) {
      throw new Error("truncated tar archive");
    }
    offset = dataStart + Math.ceil(size / 512) * 512;

    if (type === "x") {
      pendingPath = readPaxPath(data) ?? pendingPath;
      continue;
    }
    if (type === "L") {
      pendingPath = readString(data, 0, data.length);
      continue;
    }
    const name = readString(header, 0, 100);
    const prefix = readString(header, 257, 6).startsWith("ustar")
      ? readString(header, 345, 155)
      : "";
    entries.push({
      path: pendingPath ?? (prefix ? `${prefix}/${name}` : name),
      type,
      data,
    });
    pendingPath = undefined;
  }
  return entries;
}

function checkEntry(entry) {
  const isFile = FILE_TYPES.has(entry.type);
  const isDirectory = entry.type === DIRECTORY_TYPE;
  if (!isFile && !isDirectory) {
    throw new Error(
      `"${entry.path}" is not a regular file or directory (type ${entry.type})`,
    );
  }
  const trimmed = isDirectory ? entry.path.replace(/\/$/, "") : entry.path;
  const segments = trimmed.split("/");
  if (
    entry.path.includes("\\") ||
    segments[0] !== "package" ||
    segments.some(
      (segment) => segment === "" || segment === "." || segment === "..",
    )
  ) {
    throw new Error(
      `"${entry.path}" is outside package/ or is not a plain path`,
    );
  }
  return segments.join("/");
}

/** Checks one tarball and returns its package name and version. */
export function checkTarball(gzipped) {
  const entries = readTarEntries(gunzipSync(gzipped));
  const seen = new Set();
  let manifest;
  for (const entry of entries) {
    const normalized = checkEntry(entry);
    if (seen.has(normalized)) {
      throw new Error(`"${entry.path}" appears more than once`);
    }
    seen.add(normalized);
    if (normalized === "package/package.json") {
      manifest = entry.data.toString("utf8");
    }
  }
  if (manifest === undefined) {
    throw new Error("package/package.json is missing");
  }

  let pkg;
  try {
    pkg = JSON.parse(manifest);
  } catch {
    throw new Error("package/package.json is not valid JSON");
  }
  if (typeof pkg.name !== "string" || !PACKAGE_NAME.test(pkg.name)) {
    throw new Error(`"${pkg.name}" is not a @salt-ds package`);
  }
  if (typeof pkg.version !== "string" || !SNAPSHOT_VERSION.test(pkg.version)) {
    throw new Error(`${pkg.name}: "${pkg.version}" is not a snapshot version`);
  }
  if (pkg.private) {
    throw new Error(`${pkg.name} is private`);
  }
  if (pkg.publishConfig !== undefined) {
    if (
      typeof pkg.publishConfig !== "object" ||
      pkg.publishConfig === null ||
      Array.isArray(pkg.publishConfig)
    ) {
      throw new Error(`${pkg.name} has an invalid publishConfig`);
    }
    const unexpected = Object.keys(pkg.publishConfig).filter(
      (key) => !PUBLISH_CONFIG_KEYS.has(key),
    );
    if (unexpected.length > 0) {
      throw new Error(
        `${pkg.name} has unexpected publishConfig keys (${unexpected.join(", ")})`,
      );
    }
  }
  const installScripts = INSTALL_SCRIPTS.filter(
    (script) => pkg.scripts?.[script] !== undefined,
  );
  if (installScripts.length > 0) {
    throw new Error(
      `${pkg.name} has install scripts (${installScripts.join(", ")})`,
    );
  }
  return { name: pkg.name, version: pkg.version };
}

/**
 * Checks every tarball in `dir` and returns `{ file, name, version }` for
 * each. `checkWithNpm(file)` should resolve to npm's own `{ name, version }`
 * for the tarball (from `npm publish --dry-run --json`).
 */
export async function checkSnapshotTarballs(dir, { checkWithNpm }) {
  const files = (await readdir(dir)).sort();
  const others = files.filter((file) => !file.endsWith(".tgz"));
  if (others.length > 0) {
    throw new Error(
      `Unexpected files next to the tarballs: ${others.join(", ")}`,
    );
  }
  if (files.length === 0) {
    throw new Error("No tarballs to publish");
  }

  const tarballs = [];
  const names = new Set();
  for (const file of files) {
    const fullPath = path.join(dir, file);
    let checked;
    try {
      checked = checkTarball(await readFile(fullPath));
    } catch (error) {
      throw new Error(`${file}: ${error.message}`, { cause: error });
    }
    if (names.has(checked.name)) {
      throw new Error(`${file}: ${checked.name} has more than one tarball`);
    }
    names.add(checked.name);
    tarballs.push({ file: fullPath, ...checked });
  }

  const versions = new Set(tarballs.map((tarball) => tarball.version));
  if (versions.size > 1) {
    throw new Error(
      `Tarballs have different versions: ${[...versions].join(", ")}`,
    );
  }

  for (const tarball of tarballs) {
    const npm = await checkWithNpm(tarball.file);
    if (npm?.name !== tarball.name || npm?.version !== tarball.version) {
      throw new Error(
        `${path.basename(tarball.file)}: npm reads it as ${npm?.name}@${npm?.version}, ` +
          `not ${tarball.name}@${tarball.version}`,
      );
    }
  }
  return tarballs;
}
