// The Salt packages an application resolves, which salt-ds init and
// salt-ds check both read: Salt's own, and packages built on Salt that ship
// agent docs in the same format.
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

/** The file in each Salt package's docs folder that salt-ds check reads. */
export const CHECK_DATA_FILE = "salt-check.json";

/** The scope of Salt's own packages, each with agent docs in `docs`. */
const SALT_SCOPE = "@salt-ds";

/**
 * The Salt packages the application at `projectDir` resolves, nearest first
 * as Node resolves them, with each one's name, folder and docs folder:
 * - every package in each `node_modules/@salt-ds` folder from it up to the
 *   filesystem root, where a nearer package shadows the same package above it;
 * - then the application's own dependencies that declare agent docs with
 *   `"salt": { "agentDocs": "<folder>" }` in their package.json, such as
 *   pattern packages built on Salt.
 * Symlinked packages keep their link paths.
 */
export function saltPackages(projectDir) {
  const found = [];
  const seen = new Set();
  for (let current = projectDir; ; current = path.dirname(current)) {
    const scopeDir = path.join(current, "node_modules", SALT_SCOPE);
    let entries = [];
    try {
      entries = readdirSync(scopeDir, { withFileTypes: true });
    } catch (error) {
      if (error.code !== "ENOENT" && error.code !== "ENOTDIR") throw error;
    }
    entries.sort((left, right) => left.name.localeCompare(right.name, "en"));
    for (const entry of entries) {
      if (!entry.isDirectory() && !entry.isSymbolicLink()) continue;
      if (seen.has(entry.name)) continue;
      seen.add(entry.name);
      const packageDir = path.join(scopeDir, entry.name);
      found.push({
        name: `${SALT_SCOPE}/${entry.name}`,
        packageDir,
        docsDir: path.join(packageDir, "docs"),
      });
    }
    if (path.dirname(current) === current) break;
  }
  return [...found, ...extensionPackages(projectDir)];
}

const readJson = (file) => {
  try {
    return JSON.parse(readFileSync(file, "utf8"));
  } catch {
    return undefined;
  }
};

/** The folder Node resolves a package name to from `projectDir`, if any. */
function resolvePackage(projectDir, name) {
  for (let current = projectDir; ; current = path.dirname(current)) {
    const packageDir = path.join(current, "node_modules", ...name.split("/"));
    const manifest = readJson(path.join(packageDir, "package.json"));
    if (manifest) return { packageDir, manifest };
    if (path.dirname(current) === current) return undefined;
  }
}

/**
 * The application's dependencies outside @salt-ds that declare agent docs.
 * Only direct dependencies are read: they are the packages the application
 * imports, and reading every installed package would be slow.
 */
function extensionPackages(projectDir) {
  const application = readJson(path.join(projectDir, "package.json")) ?? {};
  const names = new Set(
    [
      "dependencies",
      "devDependencies",
      "optionalDependencies",
      "peerDependencies",
    ].flatMap((field) => Object.keys(application[field] ?? {})),
  );
  const found = [];
  for (const name of [...names].sort((left, right) =>
    left.localeCompare(right, "en"),
  )) {
    if (name.startsWith(`${SALT_SCOPE}/`)) continue;
    const resolved = resolvePackage(projectDir, name);
    const docs = resolved?.manifest.salt?.agentDocs;
    // A package installed under another name, as an npm alias is, doesn't
    // describe the name the application imports.
    if (docs === undefined || resolved.manifest.name !== name) continue;
    if (
      typeof docs !== "string" ||
      docs === "" ||
      path.isAbsolute(docs) ||
      /[\\\0]/.test(docs) ||
      docs.split("/").some((part) => part === "..")
    ) {
      throw new Error(
        `${name}: "salt.agentDocs" in package.json must name a folder inside the package.`,
      );
    }
    found.push({
      name,
      packageDir: resolved.packageDir,
      docsDir: path.join(resolved.packageDir, ...docs.split("/")),
    });
  }
  return found;
}
