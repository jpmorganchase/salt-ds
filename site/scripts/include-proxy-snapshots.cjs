const { readFile, writeFile } = require("node:fs/promises");
const path = require("node:path");

// Next 16.4's Turbopack Proxy entry does not apply outputFileTracingIncludes.
// Reuse the snapshot assets traced for the root page, including Turbopack's
// hashes and symlink metadata, before the deployment adapter reads the traces.
module.exports = async function includeProxySnapshots({ projectDir, distDir }) {
  const sourceFile = path.join(distDir, "server/app/page.js.nft.json");
  const targetFile = path.join(distDir, "server/middleware.js.nft.json");
  const [source, target] = await Promise.all(
    [sourceFile, targetFile].map(async (file) =>
      JSON.parse(await readFile(file, "utf8")),
    ),
  );
  for (const trace of [source, target]) {
    if (
      trace.version !== 1 ||
      !Array.isArray(trace.files) ||
      !Array.isArray(trace.fileHashes) ||
      trace.files.length !== trace.fileHashes.length ||
      !Array.isArray(trace.symlinks) ||
      trace.symlinks.some(
        (entry) =>
          !Array.isArray(entry) ||
          entry.length !== 2 ||
          !Number.isInteger(entry[0]) ||
          entry[0] < 0 ||
          entry[0] >= trace.files.length ||
          typeof entry[1] !== "string",
      )
    ) {
      throw new Error("Unexpected Turbopack trace format for snapshot assets");
    }
  }

  const sourceDir = path.dirname(sourceFile);
  const targetDir = path.dirname(targetFile);
  const snapshotRoot = `${path.resolve(projectDir, "snapshots")}${path.sep}`;
  const sourceLinks = new Map(source.symlinks);
  const targetLinks = new Map(target.symlinks);
  const targetIndexes = new Map(
    target.files.map((file, index) => [path.resolve(targetDir, file), index]),
  );
  const relativeToTarget = (file) =>
    path
      .relative(targetDir, path.resolve(sourceDir, file))
      .split(path.sep)
      .join("/");

  const entries = source.files
    .map((file, index) => ({
      file,
      index,
      absolute: path.resolve(sourceDir, file),
    }))
    .filter(({ absolute }) => absolute.startsWith(snapshotRoot));
  for (const name of ["mosaic-snapshot.json", "mosaic-routes.json"]) {
    if (
      !entries.some(
        ({ absolute }) => absolute === path.join(snapshotRoot, "latest", name),
      )
    ) {
      throw new Error(`Root page trace is missing snapshots/latest/${name}`);
    }
  }

  let added = 0;
  for (const { file, index, absolute } of entries) {
    let targetIndex = targetIndexes.get(absolute);
    if (targetIndex === undefined) {
      targetIndex = target.files.length;
      targetIndexes.set(absolute, targetIndex);
      target.files.push(relativeToTarget(file));
      target.fileHashes.push(source.fileHashes[index]);
      added++;
    } else if (target.fileHashes[targetIndex] !== source.fileHashes[index]) {
      throw new Error(`Inconsistent snapshot trace hash: ${file}`);
    }

    const sourceLink = sourceLinks.get(index);
    const targetLink = targetLinks.get(targetIndex);
    if (sourceLink !== undefined) {
      const link = relativeToTarget(sourceLink);
      if (targetLink === undefined) {
        target.symlinks.push([targetIndex, link]);
        targetLinks.set(targetIndex, link);
      } else if (
        path.resolve(targetDir, targetLink) !== path.resolve(targetDir, link)
      ) {
        throw new Error(`Inconsistent snapshot symlink trace: ${file}`);
      }
    } else if (targetLink !== undefined) {
      throw new Error(`Unexpected snapshot symlink trace: ${file}`);
    }
  }

  await writeFile(targetFile, JSON.stringify(target));
  return { snapshotFiles: entries.length, added };
};
