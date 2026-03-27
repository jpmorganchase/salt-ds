import path from "node:path";
import fg from "fast-glob";
import matter from "gray-matter";
import ts from "typescript";
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

function isExportedStoryStatement(statement: ts.Statement): boolean {
  return Boolean(
    ts.canHaveModifiers(statement) &&
      ts
        .getModifiers(statement)
        ?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword),
  );
}

function buildPatternStoryExampleCode(
  source: string,
  sourceFile: ts.SourceFile,
  statementIndex: number,
): string {
  const snippets: string[] = [];

  sourceFile.statements.forEach((statement, index) => {
    if (ts.isImportDeclaration(statement)) {
      snippets.push(source.slice(statement.pos, statement.end).trim());
      return;
    }

    if (index === statementIndex) {
      snippets.push(source.slice(statement.pos, statement.end).trim());
      return;
    }

    if (index < statementIndex && !isExportedStoryStatement(statement)) {
      snippets.push(source.slice(statement.pos, statement.end).trim());
    }
  });

  return snippets.filter((snippet) => snippet.length > 0).join("\n\n");
}

function findSectionContent(
  content: string,
  headingLevel: number,
  title: string,
): string {
  const normalizedTitle = normalizePatternHeadingLabel(title).toLowerCase();
  return (
    parseMarkdownSections(content, headingLevel).find(
      (section) =>
        normalizePatternHeadingLabel(section.title).toLowerCase() ===
        normalizedTitle,
    )?.content ?? ""
  );
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

function extractListLabels(content: string): string[] {
  const labels: string[] = [];

  for (const line of content.split(/\r?\n/)) {
    const boldMatch = line.trim().match(/^(?:[-*]|\d+\.)\s+\*\*(.+?)\*\*/);
    const linkMatch = line.trim().match(/^(?:[-*]|\d+\.)\s+\[(.+?)\]\([^)]+\)/);
    const colonMatch = line.trim().match(/^(?:[-*]|\d+\.)\s+([^:]+):/);
    const simpleMatch = line.trim().match(/^(?:[-*]|\d+\.)\s+(.+?)$/);
    const matchedLabel =
      boldMatch?.[1] ?? linkMatch?.[1] ?? colonMatch?.[1] ?? simpleMatch?.[1];
    if (!matchedLabel) {
      continue;
    }

    const label = cleanMarkdownText(matchedLabel)
      .replace(/[:.]+$/g, "")
      .replace(
        /\s+\((required|optional|contextual variants?|variants?)\)$/i,
        "",
      )
      .trim();
    if (label) {
      labels.push(label);
    }
  }

  return uniqueStrings(labels);
}
type PatternStarterTemplateKind =
  | "metric"
  | "app-header"
  | "vertical-navigation"
  | "analytical-dashboard";

function inferPatternStarterTemplateKind(
  regions: string[],
): PatternStarterTemplateKind | null {
  const regionSet = new Set(regions);

  if (regionSet.has("metric-title") || regionSet.has("metric-value")) {
    return "metric";
  }

  if (regionSet.has("branding") && regionSet.has("utility-actions")) {
    return "app-header";
  }

  if (regionSet.has("navigation-pane") && regionSet.has("content-context")) {
    return "vertical-navigation";
  }

  if (
    regionSet.has("dashboard-header") ||
    regionSet.has("fixed-panel") ||
    regionSet.has("key-metrics") ||
    regionSet.has("content-modules") ||
    regionSet.has("main-body")
  ) {
    return "analytical-dashboard";
  }

  return null;
}

function normalizePatternRegionId(label: string): string {
  const normalized = normalizePatternHeadingLabel(label).toLowerCase();
  switch (normalized) {
    case "navigation":
      return "primary-navigation";
    case "utilities":
      return "utility-actions";
    case "header region":
      return "dashboard-header";
    case "fixed panel":
    case "fixed panels":
      return "fixed-panel";
    case "main body region":
      return "main-body";
    default:
      return toKebabCase(normalized);
  }
}

function extractAnatomyLabels(content: string): string[] {
  const howToBuild = findSectionContent(content, 2, "How to build");
  const anatomy = findSectionContent(howToBuild, 3, "Anatomy");
  return extractListLabels(anatomy);
}

function extractDashboardRegionLabels(content: string): string[] {
  const dashboardRegions = findSectionContent(content, 2, "Dashboard regions");
  const regionTitles = parseMarkdownSections(dashboardRegions, 3).map(
    (section) => normalizePatternHeadingLabel(section.title),
  );
  return uniqueStrings([
    ...extractListLabels(dashboardRegions),
    ...regionTitles,
  ]).filter((value) => value.length > 0);
}

function deriveDocsBackedBuildAround(input: {
  content: string;
  fallback: string[];
}): string[] {
  if (input.fallback.length > 0) {
    return uniqueStrings(input.fallback);
  }

  const labels = uniqueStrings([
    ...extractDashboardRegionLabels(input.content),
    ...extractAnatomyLabels(input.content),
  ]);

  return labels.length > 0 ? labels : input.fallback;
}

function deriveDocsBackedRegions(input: {
  content: string;
  fallback: string[];
}): string[] {
  if (input.fallback.length > 0) {
    return uniqueStrings(input.fallback);
  }

  const labels = uniqueStrings([
    ...extractDashboardRegionLabels(input.content),
    ...extractAnatomyLabels(input.content),
  ]);
  const mapped = labels
    .map((label) => normalizePatternRegionId(label))
    .filter((value) => value.length > 0);
  return mapped.length > 0 ? uniqueStrings(mapped) : input.fallback;
}

function deriveDocsBackedPreserveConstraints(input: {
  content: string;
  fallback: string[];
}): string[] {
  if (input.fallback.length > 0) {
    return uniqueStrings(input.fallback);
  }

  const structuredGuidance = parseStructuredGuidanceCallouts(input.content);
  const candidateStatements = uniqueStrings([
    ...structuredGuidance.preferred,
    ...structuredGuidance.avoid,
    ...parseSectionStatements(input.content, "How to build"),
    ...parseSectionStatements(input.content, "Dashboard regions"),
  ]);

  const normativeStatements = candidateStatements.filter((statement) =>
    /\b(always|never|avoid|don't|do not|won't|should|must|keep|remain)\b/i.test(
      statement,
    ),
  );

  return normativeStatements.length > 0
    ? uniqueStrings(normativeStatements)
    : input.fallback;
}

function buildPatternStarterTemplate(input: {
  templateKind?: string | null;
  regions: string[];
}): NonNullable<PatternRecord["starter_scaffold"]>["template"] | undefined {
  const templateKind =
    (input.templateKind as PatternStarterTemplateKind | null | undefined) ??
    inferPatternStarterTemplateKind(input.regions);

  switch (templateKind) {
    case "metric":
      return {
        kind: "fallback-template",
        imports: [
          { name: "StackLayout", package: "@salt-ds/core" },
          { name: "Text", package: "@salt-ds/core" },
        ],
        jsx_lines: [
          "<StackLayout>{/* Vertical metric */}",
          "  <Text>{/* Metric title */}Portfolio value</Text>",
          "  <Text>{/* Large metric value */}GBP 124.8m</Text>",
          "  <Text>{/* Subtitle or subvalue */}+2.4% vs previous close</Text>",
          "</StackLayout>",
        ],
      };
    case "app-header":
      return {
        kind: "fallback-template",
        imports: [
          { name: "Button", package: "@salt-ds/core" },
          { name: "NavigationItem", package: "@salt-ds/core" },
          { name: "StackLayout", package: "@salt-ds/core" },
        ],
        jsx_lines: [
          "<header>",
          '  <StackLayout direction="row" align="center">',
          '    <a href="/">{/* Branding: logo or mark plus app name */}</a>',
          '    <nav aria-label="Primary">',
          '      <NavigationItem href="/overview">Overview</NavigationItem>',
          '      <NavigationItem href="/reports">Reports</NavigationItem>',
          "    </nav>",
          '    <StackLayout direction="row">',
          '      <Button appearance="secondary">Search</Button>',
          '      <Button appearance="secondary">Settings</Button>',
          "    </StackLayout>",
          "  </StackLayout>",
          "</header>",
        ],
        notes: [
          "Replace the placeholder branding, navigation labels, and utility actions with the app-specific header content.",
        ],
      };
    case "vertical-navigation":
      return {
        kind: "fallback-template",
        imports: [
          { name: "BorderLayout", package: "@salt-ds/core" },
          { name: "NavigationItem", package: "@salt-ds/core" },
          { name: "StackLayout", package: "@salt-ds/core" },
        ],
        jsx_lines: [
          "<BorderLayout>",
          "  <aside>{/* Navigation pane: fixed or responsive depending on the app shell */}",
          '    <nav aria-label="Primary">',
          "      <StackLayout>",
          '        <NavigationItem href="/overview">Overview</NavigationItem>',
          "        <NavigationItem>{/* Parent section that reveals nested items */}</NavigationItem>",
          "      </StackLayout>",
          "    </nav>",
          "  </aside>",
          "  <main>",
          "    <StackLayout>{/* Main content area stays distinct from the navigation tree */}</StackLayout>",
          "  </main>",
          "</BorderLayout>",
        ],
        notes: [
          "Replace the placeholder destinations with the app-specific navigation tree and content entry point.",
        ],
      };
    case "analytical-dashboard":
      return {
        kind: "fallback-template",
        imports: [
          { name: "BorderLayout", package: "@salt-ds/core" },
          { name: "BorderItem", package: "@salt-ds/core" },
          { name: "Card", package: "@salt-ds/core" },
          { name: "FlowLayout", package: "@salt-ds/core" },
          { name: "GridItem", package: "@salt-ds/core" },
          { name: "GridLayout", package: "@salt-ds/core" },
          { name: "StackLayout", package: "@salt-ds/core" },
          { name: "Text", package: "@salt-ds/core" },
          { name: "Tabs", package: "@salt-ds/lab" },
        ],
        jsx_lines: [
          "<BorderLayout>",
          '  <BorderItem position="north" as="header">',
          "    <StackLayout>{/* Dashboard header region: title, context, and utilities */}</StackLayout>",
          "  </BorderItem>",
          '  <BorderItem position="west" as="aside">',
          "    <StackLayout>{/* Fixed panel: filters, toggles, and controls */}</StackLayout>",
          "  </BorderItem>",
          '  <BorderItem position="center" as="main">',
          "    <StackLayout>",
          '      <section aria-label="Key metrics bar">',
          "        <FlowLayout>{/* Key metrics bar: 3-5 concise metrics in one orientation */}",
          "          <StackLayout>{/* Metric 1 */}",
          "            <Text>{/* Metric title */}Net asset value</Text>",
          "            <Text>{/* Large metric value */}GBP 124.8m</Text>",
          "            <Text>{/* Metric subtitle or subvalue */}+2.4% vs previous close</Text>",
          "          </StackLayout>",
          "          <StackLayout>{/* Metric 2 */}",
          "            <Text>{/* Metric title */}Daily P&L</Text>",
          "            <Text>{/* Large metric value */}+GBP 3.1m</Text>",
          "            <Text>{/* Metric subtitle or subvalue */}Above desk target</Text>",
          "          </StackLayout>",
          "          <StackLayout>{/* Metric 3 */}",
          "            <Text>{/* Metric title */}Risk exposure</Text>",
          "            <Text>{/* Large metric value */}12.4%</Text>",
          "            <Text>{/* Metric subtitle or subvalue */}Within approved threshold</Text>",
          "          </StackLayout>",
          "        </FlowLayout>",
          "      </section>",
          '      <GridLayout columns={12} gap={3} aria-label="Dashboard modules">',
          "        <GridItem colSpan={8}><Card>{/* Primary analytical module */}</Card></GridItem>",
          "        <GridItem colSpan={4}><Card>{/* Secondary analytical module */}</Card></GridItem>",
          "        <GridItem colSpan={6}><Card>{/* Data grid or table module */}</Card></GridItem>",
          "        <GridItem colSpan={6}><Card>{/* Supporting analysis module */}</Card></GridItem>",
          "      </GridLayout>",
          "      <Tabs />",
          "    </StackLayout>",
          "  </BorderItem>",
          "</BorderLayout>",
        ],
        notes: [
          "Replace the placeholder dashboard modules with the closest production example from the linked docs.",
        ],
      };
    default:
      return undefined;
  }
}

function getPatternStarterScaffold(input: {
  content: string;
  route: string;
  data: Record<string, unknown> | undefined;
  exampleSourceUrls?: string[];
}): PatternRecord["starter_scaffold"] | undefined {
  const aiConfig = asRecord(input.data?.ai);
  const starterScaffoldConfig = asRecord(aiConfig?.starterScaffold);
  const semanticsConfig = asRecord(starterScaffoldConfig?.semantics);
  const fallbackRegions = asStringArray(semanticsConfig?.regions);
  const docsBackedRegions = deriveDocsBackedRegions({
    content: input.content,
    fallback: fallbackRegions,
  });

  if (docsBackedRegions.length === 0) {
    return undefined;
  }

  const starterTemplate = buildPatternStarterTemplate({
    templateKind: asString(starterScaffoldConfig?.template),
    regions: docsBackedRegions,
  });
  const starterFidelity = asString(starterScaffoldConfig?.fidelity) as
    | "canonical"
    | "hybrid"
    | "draft"
    | undefined;

  return {
    fidelity: starterFidelity ?? "hybrid",
    source_urls:
      asStringArray(starterScaffoldConfig?.sourceUrls).length > 0
        ? asStringArray(starterScaffoldConfig?.sourceUrls)
        : [input.route],
    example_source_urls: input.exampleSourceUrls ?? [],
    semantics: {
      regions: docsBackedRegions,
      required_regions: asStringArray(semanticsConfig?.requiredRegions),
      optional_regions: asStringArray(semanticsConfig?.optionalRegions),
      build_around: deriveDocsBackedBuildAround({
        content: input.content,
        fallback: asStringArray(semanticsConfig?.buildAround),
      }),
      preserve_constraints: deriveDocsBackedPreserveConstraints({
        content: input.content,
        fallback: asStringArray(semanticsConfig?.preserveConstraints),
      }),
    },
    ...(starterTemplate
      ? {
          template: starterTemplate,
        }
      : {}),
  };
}

function enrichPatternAliases(
  aliases: string[],
  additionalAliases: string[] = [],
): string[] {
  return uniqueStrings([...aliases, ...additionalAliases]);
}

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

    const sourceFile = ts.createSourceFile(
      storyPath,
      source,
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TSX,
    );

    sourceFile.statements.forEach((statement, statementIndex) => {
      if (!isExportedStoryStatement(statement)) {
        return;
      }

      if (ts.isVariableStatement(statement)) {
        for (const declaration of statement.declarationList.declarations) {
          if (!ts.isIdentifier(declaration.name)) {
            continue;
          }

          examples.push({
            id: `pattern-story.${toKebabCase(relativePath)}.${toKebabCase(declaration.name.text)}`,
            title: declaration.name.text,
            intent: ["pattern example"],
            complexity: "intermediate",
            code: buildPatternStoryExampleCode(
              source,
              sourceFile,
              statementIndex,
            ),
            source_url: relativePath,
            package: packageName,
            target_type: "pattern",
            target_name: patternName,
          });
        }
      }
      if (ts.isFunctionDeclaration(statement) && statement.name) {
        examples.push({
          id: `pattern-story.${toKebabCase(relativePath)}.${toKebabCase(statement.name.text)}`,
          title: statement.name.text,
          intent: ["pattern example"],
          complexity: "intermediate",
          code: buildPatternStoryExampleCode(
            source,
            sourceFile,
            statementIndex,
          ),
          source_url: relativePath,
          package: packageName,
          target_type: "pattern",
          target_name: patternName,
        });
      }
    });
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
    const aiConfig = asRecord(data?.ai);
    const components = asStringArray(data?.components);
    const relatedPatterns = asStringArray(data?.relatedPatterns);
    const resources = Array.isArray(data?.resources)
      ? (data?.resources as Array<Record<string, unknown>>)
      : [];
    const route = `/salt/patterns/${relativePatternPath.replace(/\.mdx$/, "")}`;
    const routeSlug = getRouteSlug(route);
    const aliases = enrichPatternAliases(
      uniqueStrings([
        ...asStringArray(parsed.data.aliases),
        ...(routeSlug ? [routeSlug] : []),
      ]),
      asStringArray(aiConfig?.aliases),
    );
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
      starter_scaffold: getPatternStarterScaffold({
        content: parsed.content,
        route,
        data,
        exampleSourceUrls: resourceRecords.map((resource) => resource.href),
      }),
      related_docs: {
        overview: route,
      },
      semantics,
      last_verified_at: verifiedAt,
    });
  }

  return patterns.sort((left, right) => left.name.localeCompare(right.name));
}
