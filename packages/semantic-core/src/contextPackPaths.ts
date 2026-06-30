import path from "node:path";

export const DEFAULT_CONTEXT_PACK_OUTPUT_DIR = ".salt/context/components";
export const DEFAULT_CONTEXT_PACK_MANIFEST_PATH = ".salt/context/manifest.json";

function toPosixPath(inputPath: string): string {
  return inputPath.split(path.sep).join("/");
}

function safeFileStem(id: string): string {
  return id.replace(/[^a-z0-9._-]+/gi, "-");
}

export function toContextPackOutputPathForManifest(
  rootDir: string,
  outputPath: string,
): string {
  const relativePath = path.relative(rootDir, outputPath);

  return relativePath.startsWith("..") || path.isAbsolute(relativePath)
    ? toPosixPath(outputPath)
    : toPosixPath(relativePath);
}

export function toSafeContextFileName(component: { id: string }): string {
  return `${safeFileStem(component.id)}.json`;
}

export function toSafePatternContextFileName(pattern: { id: string }): string {
  return `${safeFileStem(pattern.id)}.pattern.json`;
}

export function toSafeFoundationContextFileName(foundation: {
  category: string;
}): string {
  return `tokens-${safeFileStem(foundation.category)}.foundation.json`;
}

export function toSafeContextMarkdownFileName(component: {
  id: string;
}): string {
  return `${safeFileStem(component.id)}.context.md`;
}
