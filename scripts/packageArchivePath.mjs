import path from "node:path";
import { hasForbiddenPortablePathCharacter } from "./catalogBuildIdentity.mjs";

const WINDOWS_RESERVED_SEGMENT =
  /^(?:con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/iu;

function isPathWithinRoot(root, candidate) {
  const relative = path.relative(root, candidate);
  return (
    relative === "" ||
    (!relative.startsWith(`..${path.sep}`) &&
      relative !== ".." &&
      !path.isAbsolute(relative))
  );
}

export function isPortableArchivePath(filePath) {
  return (
    typeof filePath === "string" &&
    filePath.length > 0 &&
    filePath === filePath.normalize("NFC") &&
    !filePath.includes("\\") &&
    !filePath.startsWith("/") &&
    !/^[A-Za-z]:/u.test(filePath) &&
    !hasForbiddenPortablePathCharacter(filePath) &&
    filePath
      .split("/")
      .every(
        (segment) =>
          segment.length > 0 &&
          segment !== "." &&
          segment !== ".." &&
          !/[ .]$/u.test(segment) &&
          !WINDOWS_RESERVED_SEGMENT.test(segment),
      )
  );
}

function resolveCanonicalPortablePath(root, portablePath) {
  const resolvedRoot = path.resolve(root);
  const resolvedPath = path.resolve(resolvedRoot, ...portablePath.split("/"));
  if (!isPathWithinRoot(resolvedRoot, resolvedPath)) {
    throw new Error(`Archive path escapes its authority root: ${portablePath}`);
  }
  const canonicalRelative = path
    .relative(resolvedRoot, resolvedPath)
    .split(path.sep)
    .join("/");
  if (canonicalRelative !== portablePath) {
    throw new Error(`Archive path is not canonical: ${portablePath}`);
  }
  return resolvedPath;
}

export function resolvePackageArchiveEntry(extractionRoot, rawEntry) {
  if (typeof rawEntry !== "string" || rawEntry.length === 0) {
    throw new Error("Archive entry must be a nonempty string.");
  }
  const directory = rawEntry.endsWith("/");
  if (rawEntry.endsWith("//")) {
    throw new Error(
      `Archive directory has repeated trailing separators: ${rawEntry}`,
    );
  }
  const entry = directory ? rawEntry.slice(0, -1) : rawEntry;
  if (!isPortableArchivePath(entry)) {
    throw new Error(
      `Archive entry is not a portable canonical path: ${rawEntry}`,
    );
  }
  if (entry !== "package" && !entry.startsWith("package/")) {
    throw new Error(`Archive entry is outside the package root: ${rawEntry}`);
  }

  const destination = resolveCanonicalPortablePath(extractionRoot, entry);
  const packageRoot = path.resolve(extractionRoot, "package");
  if (!isPathWithinRoot(packageRoot, destination)) {
    throw new Error(
      `Archive entry resolves outside the package root: ${rawEntry}`,
    );
  }
  return { directory, entry, destination };
}

export function resolvePackageRelativeArchivePath(packageRoot, rawPath) {
  if (!isPortableArchivePath(rawPath)) {
    throw new Error(`Package-relative archive path is unsafe: ${rawPath}`);
  }
  return {
    path: rawPath,
    destination: resolveCanonicalPortablePath(packageRoot, rawPath),
  };
}
