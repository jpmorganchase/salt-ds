// The Salt packages an application resolves, which salt-ds init and
// salt-ds check both read.
import { readdirSync } from "node:fs";
import path from "node:path";

/** The file in each Salt package's docs folder that salt-ds check reads. */
export const CHECK_DATA_FILE = "salt-check.json";

/**
 * The Salt packages the application at `projectDir` resolves: those in each
 * `node_modules/@salt-ds` folder from it up to the filesystem root, where a
 * nearer package shadows the same package above it, as Node resolves them.
 * Symlinked packages keep their link paths.
 */
export function saltPackages(projectDir) {
  const found = [];
  const seen = new Set();
  for (let current = projectDir; ; current = path.dirname(current)) {
    const scopeDir = path.join(current, "node_modules", "@salt-ds");
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
      found.push({
        name: entry.name,
        packageDir: path.join(scopeDir, entry.name),
      });
    }
    if (path.dirname(current) === current) break;
  }
  return found;
}
