const FORBIDDEN_CHARACTER = /[\u0000-\u001f<>:"|?*\\]/u;
const WINDOWS_DEVICE_NAME = /^(?:con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/iu;

export type KnowledgeArtifactPath = string & {
  readonly __knowledgeArtifactPath: unique symbol;
};

export function parseKnowledgeArtifactPath(
  value: unknown,
): KnowledgeArtifactPath {
  if (
    typeof value !== "string" ||
    value.length === 0 ||
    value !== value.normalize("NFC") ||
    value.startsWith("/") ||
    value.endsWith("/") ||
    value.includes("//") ||
    value.includes("%") ||
    FORBIDDEN_CHARACTER.test(value)
  ) {
    throw new Error(`Invalid canonical Salt artifact path: ${String(value)}`);
  }
  const segments = value.split("/");
  if (
    segments.some(
      (segment) =>
        segment.length === 0 ||
        segment === "." ||
        segment === ".." ||
        segment.trim() !== segment ||
        segment.endsWith(".") ||
        WINDOWS_DEVICE_NAME.test(segment),
    )
  ) {
    throw new Error(`Invalid canonical Salt artifact path: ${value}`);
  }
  return value as KnowledgeArtifactPath;
}

export function compareArtifactPaths(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

export function assertPortableArtifactPathSet(paths: readonly string[]): void {
  const portable = new Map<string, string>();
  let previous: string | null = null;
  for (const rawPath of paths) {
    const artifactPath = parseKnowledgeArtifactPath(rawPath);
    if (previous !== null && compareArtifactPaths(previous, artifactPath) >= 0) {
      throw new Error("Salt artifact paths must be unique and canonical-sorted.");
    }
    const identity = artifactPath.normalize("NFC").toLocaleLowerCase("en-US");
    const collision = portable.get(identity);
    if (collision) {
      throw new Error(
        `Salt artifact paths collide portably: ${collision}, ${artifactPath}`,
      );
    }
    portable.set(identity, artifactPath);
    previous = artifactPath;
  }
}
