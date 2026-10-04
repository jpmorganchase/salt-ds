import { readFile } from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { COMPONENT_TABS, SECTION_RULES } from "./config.mjs";
import { listFiles } from "./files.mjs";

/** `components/button/usage.mdx` -> `/salt/components/button/usage`. */
export function routeForRelativePath(relativePath) {
  const segments = relativePath.replace(/\.mdx$/, "").split("/");
  if (segments.at(-1) === "index") segments.pop();
  return ["/salt", ...segments].join("/");
}

/** Removes trailing slashes and a trailing `/index` segment. */
export function normalizeRoute(pathname) {
  const withoutSlash = pathname.replace(/\/+$/, "");
  return withoutSlash.replace(/\/index$/, "") || "/";
}

/** `/salt/components/button` -> `components/button.md`. */
export function docPathForRoute(route) {
  const relative = route.replace(/^\/salt\/?/, "");
  if (!relative) {
    throw new Error("The site root is not a documentation page.");
  }
  return `${relative}.md`;
}

export function packageFromSourceUrl(url) {
  const match = /\/packages\/([a-z0-9-]+)(?:\/|$)/.exec(url ?? "");
  return match ? `@salt-ds/${match[1]}` : undefined;
}

async function readPage(siteDocsDir, relativePath) {
  const source = await readFile(path.join(siteDocsDir, relativePath), "utf8");
  // Pass an options object so gray-matter does not return a cached result.
  const parsed = matter(source, {});
  const frontmatterLength = source.length - parsed.content.length;
  return {
    relativePath,
    route: routeForRelativePath(relativePath),
    // The URL path the site serves this page at; relative links resolve from it.
    sitePath: `/salt/${relativePath.replace(/\.mdx$/, "")}`,
    frontmatter: parsed.data ?? {},
    body: parsed.content,
    lineOffset: source.slice(0, frontmatterLength).split("\n").length - 1,
  };
}

function sectionRuleFor(relativePath) {
  return SECTION_RULES.find(({ prefix }) =>
    prefix.endsWith("/")
      ? relativePath.startsWith(prefix)
      : relativePath === prefix,
  );
}

function asList(value) {
  return Array.isArray(value) ? value : [];
}

/**
 * Reads every site page and groups them into documents: one per component
 * (its overview and tabs merged) and one per other shipped page.
 */
export async function discoverDocuments({ siteDocsDir }) {
  const relativePaths = await listFiles(siteDocsDir, (file) =>
    file.endsWith(".mdx"),
  );
  const pages = new Map();
  for (const relativePath of relativePaths) {
    pages.set(relativePath, await readPage(siteDocsDir, relativePath));
  }

  const documents = [];
  const errors = [];
  const grouped = new Set();
  const componentPackageByDirectory = new Map();

  // Component pages are a component's index page, which normally uses the
  // DetailComponent layout. Pages with another layout that declare a package,
  // such as technical pages for lab layouts, belong to that package too.
  const componentIndexes = [...pages.values()].filter(
    (page) =>
      page.relativePath.startsWith("components/") &&
      page.relativePath.endsWith("/index.mdx") &&
      (page.frontmatter.layout === "DetailComponent" ||
        typeof page.frontmatter.data?.package?.name === "string"),
  );
  // Parents first, so nested components can inherit their parent's package.
  componentIndexes.sort(
    (left, right) =>
      left.relativePath.split("/").length -
        right.relativePath.split("/").length ||
      left.relativePath.localeCompare(right.relativePath),
  );

  for (const index of componentIndexes) {
    const directory = index.relativePath.slice(0, -"index.mdx".length);
    const parentDirectory = `${path.posix.dirname(directory.slice(0, -1))}/`;
    const data = index.frontmatter.data ?? {};
    const packageName =
      data.package?.name ??
      packageFromSourceUrl(data.sourceCodeUrl) ??
      componentPackageByDirectory.get(parentDirectory) ??
      "@salt-ds/core";
    componentPackageByDirectory.set(directory, packageName);

    const tabs = COMPONENT_TABS.flatMap((tab) => {
      const page = pages.get(`${directory}${tab.file}`);
      return page ? [{ heading: tab.heading, page }] : [];
    });
    grouped.add(index.relativePath);
    for (const { page } of tabs) grouped.add(page.relativePath);

    documents.push({
      kind: "component",
      packageName,
      route: index.route,
      docPath: docPathForRoute(index.route),
      title: index.frontmatter.title ?? path.posix.basename(directory),
      summary: data.description,
      aliases: asList(data.alsoKnownAs).filter(
        (alias) => typeof alias === "string",
      ),
      relatedComponents: asList(data.relatedComponents),
      relatedPatterns: asList(data.relatedPatterns),
      index,
      tabs,
    });
  }

  for (const page of pages.values()) {
    if (grouped.has(page.relativePath)) continue;
    const rule = sectionRuleFor(page.relativePath);
    if (!rule) {
      errors.push(
        `${page.relativePath}: no owning package is configured for this page.`,
      );
      continue;
    }
    if (rule.skip) continue;
    documents.push({
      kind: "page",
      packageName: rule.package,
      route: page.route,
      docPath: docPathForRoute(page.route),
      title: page.frontmatter.title ?? path.posix.basename(page.route),
      summary:
        page.frontmatter.description ?? page.frontmatter.data?.description,
      aliases: [],
      page,
    });
  }

  documents.sort((left, right) => left.route.localeCompare(right.route));
  return { documents, errors };
}
