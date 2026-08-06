import fs from "node:fs";
import path from "node:path";

export function readPhase5ExternalFile(absolutePath, label, repoRoot) {
  if (typeof absolutePath !== "string" || !path.isAbsolute(absolutePath)) {
    throw new Error(`${label} must be an absolute external file path.`);
  }
  const lexicalPath = path.resolve(absolutePath);
  const lexicalStats = fs.lstatSync(lexicalPath);
  if (
    !lexicalStats.isFile() ||
    lexicalStats.isSymbolicLink() ||
    lexicalStats.nlink !== 1
  ) {
    throw new Error(
      `${label} must be a regular, non-link, singly linked file.`,
    );
  }
  const fileDescriptor = fs.openSync(lexicalPath, "r");
  try {
    const openedStats = fs.fstatSync(fileDescriptor);
    if (
      !openedStats.isFile() ||
      openedStats.nlink !== 1 ||
      openedStats.dev !== lexicalStats.dev ||
      openedStats.ino !== lexicalStats.ino
    ) {
      throw new Error(`${label} changed while its trust boundary was opened.`);
    }
    const realPath = fs.realpathSync.native(lexicalPath);
    const samePath =
      process.platform === "win32"
        ? realPath.toLowerCase() === lexicalPath.toLowerCase()
        : realPath === lexicalPath;
    if (!samePath) {
      throw new Error(`${label} may not resolve through a link.`);
    }
    const relative = path.relative(repoRoot, realPath);
    if (
      relative === "" ||
      (relative !== ".." &&
        !relative.startsWith(`..${path.sep}`) &&
        !path.isAbsolute(relative))
    ) {
      throw new Error(`${label} must be provisioned outside the repository.`);
    }
    const bytes = fs.readFileSync(fileDescriptor);
    const finalStats = fs.fstatSync(fileDescriptor);
    if (
      finalStats.dev !== openedStats.dev ||
      finalStats.ino !== openedStats.ino ||
      finalStats.size !== openedStats.size ||
      finalStats.mtimeMs !== openedStats.mtimeMs ||
      finalStats.nlink !== 1
    ) {
      throw new Error(`${label} changed while it was read.`);
    }
    return bytes;
  } finally {
    fs.closeSync(fileDescriptor);
  }
}
