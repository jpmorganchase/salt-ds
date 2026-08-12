export const CONSUMED_PATTERN_STORY_GLOB =
  "packages/*/stories/patterns/**/*.stories.tsx";

const CONSUMED_PATTERN_STORY_PATTERN =
  /^packages\/[^/]+\/stories\/patterns\/.+\.stories\.tsx$/u;

export function isSemanticCatalogSourcePath(repoPath: string): boolean {
  const segments = repoPath.split("/");
  if (
    segments.includes("__tests__") ||
    /\.(?:spec|test)\.[^/]+$/u.test(repoPath)
  ) {
    return false;
  }
  if (/\.stories\.[^/]+$/u.test(repoPath)) {
    return CONSUMED_PATTERN_STORY_PATTERN.test(repoPath);
  }
  return true;
}
