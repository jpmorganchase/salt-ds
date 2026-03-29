import path from "node:path";
import fg from "fast-glob";
import matter from "gray-matter";
import { toPosixPath } from "../registry/paths.js";
import type { ExampleRecord, PatternRecord } from "../types.js";
import {
  extractFirstParagraph,
  extractStatementsFromSection,
  parseMarkdownSections,
  parseSectionStatements,
  parseStructuredGuidanceCallouts,
} from "./buildRegistryMarkdown.js";
import {
  asString,
  asStringArray,
  buildUsageSemantics,
  cleanMarkdownText,
  readFileOrNull,
  toKebabCase,
  uniqueStrings,
} from "./buildRegistryShared.js";

interface PatternCategoryMapEntry {
  route: string;
  category: string;
  secondaryCategories?: string[];
}

const GENERIC_PATTERN_SECTION_HEADINGS = new Set([
  "when-to-use",
  "when-not-to-use",
  "how-to-build",
  "how-it-works",
  "accessibility",
  "anatomy",
  "layout",
]);

function normalizePatternCategoryLabel(label: string): string {
  return toKebabCase(label);
}

function normalizePatternHeadingLabel(label: string): string {
  return cleanMarkdownText(label)
    .replace(/[:.]+$/g, "")
    .trim();
}

function shouldIgnorePatternSectionHeading(heading: string): boolean {
  const normalized = toKebabCase(heading);
  return (
    normalized.length === 0 ||
    GENERIC_PATTERN_SECTION_HEADINGS.has(normalized) ||
    /^example(?:-\d+)?$/.test(normalized)
  );
}

function formatPatternTopicLabel(
  patternTitle: string,
  heading: string,
): string {
  const normalizedHeading = normalizePatternHeadingLabel(heading);
  if (!normalizedHeading) {
    return "";
  }

  return normalizedHeading.toLowerCase().includes(patternTitle.toLowerCase())
    ? normalizedHeading
    : `${patternTitle} ${normalizedHeading}`;
}

function prefixPatternTopicStatement(
  topicLabel: string,
  statement: string,
): string {
  const normalizedStatement = cleanMarkdownText(statement);
  if (!normalizedStatement) {
    return "";
  }

  return normalizedStatement.toLowerCase().includes(topicLabel.toLowerCase())
    ? normalizedStatement
    : `${topicLabel}: ${normalizedStatement}`;
}

function extractPatternTopicSignals(
  patternTitle: string,
  content: string,
): string[] {
  const sections = parseMarkdownSections(content, 2);
  const signals: string[] = [];

  for (const section of sections) {
    const sectionTitle = normalizePatternHeadingLabel(section.title);
    if (!sectionTitle || shouldIgnorePatternSectionHeading(sectionTitle)) {
      continue;
    }

    const sectionTopic = formatPatternTopicLabel(patternTitle, sectionTitle);
    if (sectionTopic) {
      signals.push(sectionTopic);
    }

    const subsections = parseMarkdownSections(section.content, 3).filter(
      (subsection) =>
        !shouldIgnorePatternSectionHeading(
          normalizePatternHeadingLabel(subsection.title),
        ),
    );

    if (subsections.length > 0) {
      for (const subsection of subsections) {
        const subsectionTitle = normalizePatternHeadingLabel(subsection.title);
        if (!subsectionTitle) {
          continue;
        }

        const subsectionTopic = formatPatternTopicLabel(
          patternTitle,
          `${sectionTitle} ${subsectionTitle}`,
        );
        if (subsectionTopic) {
          signals.push(subsectionTopic);
        }

        for (const statement of extractStatementsFromSection(
          subsection.content,
        ).slice(0, 2)) {
          const scopedStatement = prefixPatternTopicStatement(
            subsectionTopic,
            statement,
          );
          if (scopedStatement) {
            signals.push(scopedStatement);
          }
        }
      }

      continue;
    }

    for (const statement of extractStatementsFromSection(section.content).slice(
      0,
      4,
    )) {
      const scopedStatement = prefixPatternTopicStatement(
        sectionTopic,
        statement,
      );
      if (scopedStatement) {
        signals.push(scopedStatement);
      }
    }
  }

  return uniqueStrings(
    signals.filter((signal): signal is string => signal.trim().length > 0),
  );
}

function normalizePatternDocsRoute(route: string): string {
  return route.replace(/\/index$/, "");
}

async function loadPatternCategoryMap(repoRoot: string): Promise<
  Map<
    string,
    {
      categoryIds: string[];
      categoryLabels: string[];
    }
  >
> {
  const categoryMapPath = path.join(repoRoot, "site/pattern-category-map.json");
  const source = await readFileOrNull(categoryMapPath);
  if (!source) {
    throw new Error("Missing site/pattern-category-map.json.");
  }

  const parsed = JSON.parse(source) as {
    patterns?: Record<string, PatternCategoryMapEntry>;
  };
  const byRoute = new Map<
    string,
    {
      categoryIds: string[];
      categoryLabels: string[];
    }
  >();

  for (const entry of Object.values(parsed.patterns ?? {})) {
    const categoryLabels = [
      entry.category,
      ...(entry.secondaryCategories ?? []),
    ].filter(
      (value): value is string => typeof value === "string" && value.length > 0,
    );

    byRoute.set(normalizePatternDocsRoute(entry.route), {
      categoryIds: [
        ...new Set(categoryLabels.map(normalizePatternCategoryLabel)),
      ],
      categoryLabels: [...new Set(categoryLabels)],
    });
  }

  return byRoute;
}

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

  const patternCategoryByRoute = await loadPatternCategoryMap(repoRoot);
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
    const relatedPatterns = asStringArray(data?.relatedPatterns);
    const resources = Array.isArray(data?.resources)
      ? (data?.resources as Array<Record<string, unknown>>)
      : [];
    const route = `/salt/patterns/${relativePatternPath.replace(/\.mdx$/, "")}`;
    const routeSlug = getRouteSlug(route);
    const aliases = uniqueStrings([
      ...asStringArray(parsed.data.aliases),
      ...(routeSlug ? [routeSlug] : []),
    ]);
    const categoryRecord = patternCategoryByRoute.get(
      normalizePatternDocsRoute(route),
    );
    if (!categoryRecord) {
      throw new Error(
        `Missing pattern category map entry for '${title}' (${route}/index).`,
      );
    }
    const whenToUse = parseSectionStatements(parsed.content, "When to use");
    const whenNotToUse = parseSectionStatements(
      parsed.content,
      "When not to use",
    );
    const structuredGuidance = parseStructuredGuidanceCallouts(parsed.content);
    const topicSignals = extractPatternTopicSignals(title, parsed.content);
    const semantics = buildUsageSemantics({
      category: categoryRecord.categoryIds,
      preferred_for: [
        ...whenToUse,
        ...structuredGuidance.preferred,
        ...topicSignals,
      ],
      not_for: [...whenNotToUse, ...structuredGuidance.avoid],
      derived_from: [
        "pattern-category-map",
        "pattern-docs",
        ...(structuredGuidance.preferred.length > 0 ||
        structuredGuidance.avoid.length > 0
          ? (["usage-callouts"] as const)
          : []),
      ],
    });

    const summary =
      asString(parsed.data.description) ??
      extractFirstParagraph(parsed.content);

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
      category: categoryRecord.categoryIds,
      when_to_use: whenToUse,
      when_not_to_use: whenNotToUse,
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
      semantics,
      last_verified_at: verifiedAt,
    });
  }

  return patterns.sort((left, right) => left.name.localeCompare(right.name));
}
