import { lstat, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const snapshotsRoot = fileURLToPath(new URL("./snapshots", import.meta.url));
const output = path.resolve(snapshotsRoot, "offline-author");

if (path.relative(snapshotsRoot, output) !== "offline-author") {
  throw new Error("Unexpected offline author snapshot destination.");
}

for (const target of [snapshotsRoot, output]) {
  const stats = await lstat(target).catch((error) => {
    if (error.code === "ENOENT") return null;
    throw error;
  });
  if (stats && (!stats.isDirectory() || stats.isSymbolicLink())) {
    throw new Error(`Offline author snapshot target is unsafe: ${target}`);
  }
}

await rm(output, { recursive: true, force: true });
