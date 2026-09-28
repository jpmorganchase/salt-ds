import { readdir, stat } from "node:fs/promises";
import path from "node:path";

export function toPosix(filePath) {
  return filePath.split(path.sep).join("/");
}

export async function pathExists(filePath) {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function isFile(filePath) {
  try {
    return (await stat(filePath)).isFile();
  } catch {
    return false;
  }
}

/** Lists files below `directory` (as posix paths relative to it), sorted. */
export async function listFiles(directory, predicate = () => true) {
  const results = [];
  async function visit(current) {
    const entries = await readdir(current, { withFileTypes: true });
    for (const entry of entries) {
      const entryPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        await visit(entryPath);
      } else if (entry.isFile()) {
        const relativePath = toPosix(path.relative(directory, entryPath));
        if (predicate(relativePath)) results.push(relativePath);
      }
    }
  }
  await visit(directory);
  return results.sort();
}
