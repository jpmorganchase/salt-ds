import path from "node:path";
import { assertCanonicalSiteRoute } from "../catalog/catalogSiteRoute.js";
import { toPosixPath } from "../registry/paths.js";

export function normalizeSiteRoute(route: string): string {
  return route
    .trim()
    .replace(/\\/gu, "/")
    .replace(/^\/+/u, "")
    .replace(/\/+/gu, "/")
    .replace(/\/$/u, "");
}

export function siteDocsRouteFromRelativePath(
  relativePathInput: string,
): string {
  const relativePath = toPosixPath(relativePathInput)
    .replace(/^\/+/u, "")
    .replace(/\.mdx$/iu, "");
  const withoutIndex =
    relativePath === "index" ? "" : relativePath.replace(/\/index$/iu, "");
  return assertCanonicalSiteRoute(
    `/salt${withoutIndex ? `/${withoutIndex}` : ""}`,
  );
}

export function siteDocsRouteFromAbsolutePath(
  repoRoot: string,
  filePath: string,
): string | null {
  const docsRoot = path.join(repoRoot, "site", "docs");
  const relativePath = toPosixPath(path.relative(docsRoot, filePath));
  if (
    relativePath === ".." ||
    relativePath.startsWith("../") ||
    path.isAbsolute(relativePath)
  ) {
    return null;
  }
  return siteDocsRouteFromRelativePath(relativePath);
}
