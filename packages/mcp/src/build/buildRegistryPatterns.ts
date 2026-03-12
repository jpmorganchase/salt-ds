import path from "node:path";
import fg from "fast-glob";
import matter from "gray-matter";
import { toPosixPath } from "../registry/paths.js";
import type { ExampleRecord, PatternRecord } from "../types.js";
import {
  extractFirstParagraph,
  parseSectionStatements,
} from "./buildRegistryMarkdown.js";
import {
  asString,
  asStringArray,
  cleanMarkdownText,
  readFileOrNull,
  toKebabCase,
} from "./buildRegistryShared.js";

export async function extractPatternExamplesFromStories(
  repoRoot: string,
  patternNameBySlug: Map<string, string>,
): Promise<ExampleRecord[]> {
  const storyPaths = (
    await fg("packages/*/stories/patterns/**/*.stories.tsx", {
      cwd: repoRoot,
      absolute: true,
      onlyFiles: true,
    })
  ).sort((left, right) => left.localeCompare(right));

  const examples: ExampleRecord[] = [];
  for (const storyPath of storyPaths) {
    const source = await readFileOrNull(storyPath);
    if (!source) {
      continue;
    }

    const relativePath = toPosixPath(path.relative(repoRoot, storyPath));
    const packageSlug = relativePath.split("/")[1] ?? "";
    const packageName =
      packageSlug.length > 0 ? `@salt-ds/${packageSlug}` : null;
    const patternSlug = path.basename(path.dirname(storyPath));
    const patternName = patternNameBySlug.get(patternSlug) ?? patternSlug;

    const exportRegex = /export const (\w+)\s*=/g;
    let exportMatch = exportRegex.exec(source);
    while (exportMatch) {
      examples.push({
        id: `pattern-story.${toKebabCase(relativePath)}.${toKebabCase(exportMatch[1])}`,
        title: exportMatch[1],
        intent: ["pattern example"],
        complexity: "intermediate",
        code: `// See ${relativePath} (${exportMatch[1]})`,
        source_url: null,
        package: packageName,
        target_type: "pattern",
        target_name: patternName,
      });
      exportMatch = exportRegex.exec(source);
    }
  }

  return examples;
}

function getRouteSlug(route: string | null): string | null {
  if (!route) {
    return null;
  }

  const parts = route.split("/").filter((part) => part.length > 0);
  return parts.at(-1) ?? null;
}

export function createPatternNameBySlug(
  patterns: PatternRecord[],
): Map<string, string> {
  const patternNameBySlug = new Map<string, string>();

  for (const pattern of patterns) {
    patternNameBySlug.set(toKebabCase(pattern.name), pattern.name);

    const routeSlug = getRouteSlug(pattern.related_docs.overview);
    if (routeSlug) {
      patternNameBySlug.set(routeSlug, pattern.name);
    }
  }

  return patternNameBySlug;
}

export async function extractPatterns(
  repoRoot: string,
  verifiedAt: string,
): Promise<PatternRecord[]> {
  const patternMdxPaths = (
    await fg("site/docs/patterns/**/*.mdx", {
      cwd: repoRoot,
      absolute: true,
      onlyFiles: true,
    })
  ).sort((left, right) => left.localeCompare(right));

  const patterns: PatternRecord[] = [];
  for (const patternPath of patternMdxPaths) {
    const relativePatternPath = toPosixPath(
      path.relative(path.join(repoRoot, "site/docs/patterns"), patternPath),
    );

    if (
      relativePatternPath === "index.mdx" ||
      relativePatternPath.startsWith("fragments/")
    ) {
      continue;
    }

    const source = await readFileOrNull(patternPath);
    if (!source) {
      continue;
    }

    const parsed = matter(source);
    const title = asString(parsed.data.title);
    if (!title) {
      continue;
    }

    const data = parsed.data.data as Record<string, unknown> | undefined;
    const components = asStringArray(data?.components);
    const aliases = asStringArray(parsed.data.aliases);
    const relatedPatterns = asStringArray(data?.relatedPatterns);
    const resources = Array.isArray(data?.resources)
      ? (data?.resources as Array<Record<string, unknown>>)
      : [];

    const summary =
      asString(parsed.data.description) ??
      extractFirstParagraph(parsed.content);

    const route = `/salt/patterns/${relativePatternPath.replace(/\.mdx$/, "")}`;
    const examples: ExampleRecord[] = [];
    const resourceRecords: PatternRecord["resources"] = [];
    resources.forEach((resource, index) => {
      const href = asString(resource.href);
      const label = asString(resource.label) ?? `Resource ${index + 1}`;
      const internal = Boolean(resource.internal);
      if (!href) {
        return;
      }

      resourceRecords.push({
        label,
        href,
        internal,
      });
      examples.push({
        id: `pattern.${toKebabCase(title)}.resource.${index + 1}`,
        title: label,
        intent: ["pattern resource"],
        complexity: "basic",
        code: `// Linked resource: ${href}`,
        source_url: href,
        package: null,
        target_type: "pattern",
        target_name: title,
      });
    });

    patterns.push({
      id: `pattern.${toKebabCase(title)}`,
      name: title,
      aliases,
      summary: cleanMarkdownText(summary),
      status: "stable",
      when_to_use: parseSectionStatements(parsed.content, "When to use"),
      when_not_to_use: parseSectionStatements(
        parsed.content,
        "When not to use",
      ),
      composed_of: components.map((componentName) => ({
        component: componentName,
        role: null,
      })),
      related_patterns: relatedPatterns,
      how_to_build: parseSectionStatements(parsed.content, "How to build"),
      how_it_works: parseSectionStatements(parsed.content, "How it works"),
      accessibility: {
        summary: parseSectionStatements(parsed.content, "Accessibility"),
      },
      resources: resourceRecords,
      examples,
      related_docs: {
        overview: route,
      },
      last_verified_at: verifiedAt,
    });
  }

  return patterns.sort((left, right) => left.name.localeCompare(right.name));
}
