import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import glob from "fast-glob";

const projectBase = fileURLToPath(new URL("..", import.meta.url));
const buildDir = path.posix.join(projectBase, ".next");
const nftFilePath = path.posix.join(
  buildDir,
  "server/pages/[...route].js.nft.json"
);

// Find all snapshot files
const paths = await glob("**/snapshots/latest/**", {
  cwd: projectBase,
  onlyFiles: true,
});

const data = JSON.parse(await fs.promises.readFile(nftFilePath, "utf-8"));

// Add the snapshot file paths to the nft trace
paths.forEach(async (snapshotFile) => {
  // Determine relative path to the file we want to include
  const nftFileDir = path.posix.dirname(nftFilePath);
  const newEntry = path.posix.relative(
    nftFileDir,
    path.posix.resolve(snapshotFile)
  );
  // Add the file and write our changes
  data.files.push(newEntry);
});

await fs.promises.writeFile(nftFilePath, JSON.stringify(data));
