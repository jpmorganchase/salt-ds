import path from "node:path";
import ts from "typescript";
import { compareOrdinalStrings } from "../catalog/catalogSerialization.js";
import { assertCanonicalSiteRoute } from "../catalog/catalogSiteRoute.js";
import { toPosixPath } from "../registry/paths.js";
import type {
  ExampleRecord,
  PatternRecord,
  RegistrySourceLocator,
} from "../types.js";
import {
  extractFirstParagraph,
  extractStatementsFromSection,
  parseMarkdownSections,
  parseSectionStatements,
  parseStructuredGuidanceCallouts,
} from "./buildRegistryMarkdown.js";
import { buildRetrievalSignals } from "./buildRegistryRetrievalSignals.js";
import {
  asString,
  asStringArray,
  buildUsageSemantics,
  cleanMarkdownText,
  readFileOrNull,
  toKebabCase,
  uniqueStrings,
} from "./buildRegistryShared.js";
import { globCatalogInputs } from "./catalogInputInventory.js";
import { NON_PRODUCTION_IMPLEMENTATION_GLOB_IGNORES } from "./catalogProductionSource.js";
import { parseYamlFrontmatter } from "./parseYamlFrontmatter.js";

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

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

function parseAuthoredComponentRoles(
  aiConfig: Record<string, unknown> | null,
  componentNames: string[],
  patternTitle: string,
): Map<string, string> {
  const roles = new Map<string, string>();
  const rawRoles = aiConfig?.componentRoles;
  if (rawRoles === undefined) {
    return roles;
  }
  const roleRecord = asRecord(rawRoles);
  if (!roleRecord) {
    throw new Error(
      `Pattern '${patternTitle}' data.ai.componentRoles must be an object.`,
    );
  }

  const componentSet = new Set(componentNames);
  for (const [componentName, rawRole] of Object.entries(roleRecord)) {
    if (!componentSet.has(componentName)) {
      const caseMismatch = componentNames.find(
        (candidate) => candidate.toLowerCase() === componentName.toLowerCase(),
      );
      throw new Error(
        caseMismatch
          ? `Pattern '${patternTitle}' data.ai.componentRoles key '${componentName}' must use the exact component name '${caseMismatch}'.`
          : `Pattern '${patternTitle}' data.ai.componentRoles references undeclared component '${componentName}'.`,
      );
    }
    if (typeof rawRole !== "string" || rawRole.trim().length === 0) {
      throw new Error(
        `Pattern '${patternTitle}' data.ai.componentRoles['${componentName}'] must be a non-empty string.`,
      );
    }
    roles.set(componentName, rawRole.trim());
  }

  return roles;
}

function deriveStoryExampleIntent(exportName: string): string[] {
  const expanded = exportName
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1 $2")
    .toLowerCase()
    .trim();

  const intents = [expanded];

  const words = expanded.split(/\s+/).filter((word) => word.length >= 3);

  if (words.length > 1) {
    intents.push(...words);
  }

  intents.push("pattern example");

  return uniqueStrings(intents);
}

function inferStoryComplexity(code: string): ExampleRecord["complexity"] {
  if (!code) {
    return "intermediate";
  }

  const lines = code.split(/\r?\n/).filter((line) => line.trim().length > 0);
  const importCount = lines.filter((line) => /^\s*import\b/.test(line)).length;
  const hasState = /\buseState\b/.test(code);
  const hasEffect = /\buseEffect\b/.test(code);
  const hasRef = /\buseRef\b/.test(code);
  const hookCount = (hasState ? 1 : 0) + (hasEffect ? 1 : 0) + (hasRef ? 1 : 0);

  if (lines.length > 80 || importCount > 8 || hookCount >= 3) {
    return "advanced";
  }

  if (lines.length > 20 || importCount > 3 || hookCount >= 1) {
    return "intermediate";
  }

  return "basic";
}

interface PatternDocsExampleTag {
  tagName: "Diagram" | "ImageSwitcher" | "LivePreview";
  raw: string;
  heading: string;
}

function readMdxQuotedAttribute(raw: string, name: string): string | null {
  const match = new RegExp(`${name}\\s*=\\s*"([^"]*)"`).exec(raw);
  return match?.[1] ?? null;
}

function firstNonEmptyText(
  values: Array<string | null | undefined>,
): string | null {
  return (
    values.find((value): value is string => Boolean(value?.trim())) ?? null
  );
}

function collectPatternDocsExampleTags(
  content: string,
): PatternDocsExampleTag[] {
  const tags: PatternDocsExampleTag[] = [];
  const tagStartPattern = /^\s*<(Diagram|ImageSwitcher|LivePreview)\b/;
  let currentHeading = "";
  let activeTag: {
    tagName: PatternDocsExampleTag["tagName"];
    lines: string[];
    heading: string;
  } | null = null;

  const flushActiveTag = (): void => {
    if (!activeTag) {
      return;
    }

    tags.push({
      tagName: activeTag.tagName,
      raw: activeTag.lines.join("\n").trim(),
      heading: activeTag.heading,
    });
    activeTag = null;
  };

  for (const line of content.split(/\r?\n/)) {
    if (activeTag) {
      activeTag.lines.push(line);
      if (
        /\/>\s*$/.test(line) ||
        new RegExp(`</${activeTag.tagName}>\\s*$`).test(line)
      ) {
        flushActiveTag();
      }
      continue;
    }

    const headingMatch = line.trim().match(/^#{2,4}\s+(.+)$/);
    if (headingMatch) {
      currentHeading = cleanMarkdownText(headingMatch[1]);
      continue;
    }

    const tagMatch = line.match(tagStartPattern);
    if (!tagMatch) {
      continue;
    }

    activeTag = {
      tagName: tagMatch[1] as PatternDocsExampleTag["tagName"],
      lines: [line],
      heading: currentHeading,
    };
    if (/\/>\s*$/.test(line)) {
      flushActiveTag();
    }
  }

  flushActiveTag();
  return tags;
}

function titleFromPatternDocsExampleTag(
  tag: PatternDocsExampleTag,
  index: number,
): string {
  const displayName = readMdxQuotedAttribute(tag.raw, "displayName");
  const exampleName = readMdxQuotedAttribute(tag.raw, "exampleName");
  const caption = readMdxQuotedAttribute(tag.raw, "caption");
  const content = readMdxQuotedAttribute(tag.raw, "content");
  const alt = readMdxQuotedAttribute(tag.raw, "alt");
  const fallback = `${tag.tagName} example ${index + 1}`;

  return cleanMarkdownText(
    firstNonEmptyText([
      displayName,
      tag.heading,
      exampleName,
      caption,
      content,
      alt,
    ]) ?? fallback,
  );
}

function descriptionFromPatternDocsExampleTag(
  tag: PatternDocsExampleTag,
): string {
  return cleanMarkdownText(
    readMdxQuotedAttribute(tag.raw, "caption") ??
      readMdxQuotedAttribute(tag.raw, "content") ??
      readMdxQuotedAttribute(tag.raw, "alt") ??
      readMdxQuotedAttribute(tag.raw, "exampleName") ??
      "",
  ).slice(0, 500);
}

function extractPatternDocsExamples(input: {
  patternTitle: string;
  route: string;
  content: string;
}): ExampleRecord[] {
  return collectPatternDocsExampleTags(input.content).map((tag, index) => {
    const title = titleFromPatternDocsExampleTag(tag, index);

    return {
      id: `pattern-docs.${toKebabCase(input.patternTitle)}.${toKebabCase(title)}.${index + 1}`,
      title,
      description: descriptionFromPatternDocsExampleTag(tag),
      intent: uniqueStrings([
        `${input.patternTitle.toLowerCase()} docs example`,
        tag.tagName.toLowerCase(),
        "pattern example",
      ]),
      complexity: tag.tagName === "LivePreview" ? "intermediate" : "basic",
      code: tag.raw,
      source_url: input.route,
      source_path: null,
      package: null,
      target_type: "pattern",
      target_name: input.patternTitle,
    };
  });
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

function extractPatternBehaviorStatements(
  patternTitle: string,
  content: string,
): string[] {
  const sections = parseMarkdownSections(content, 2);
  const statements: string[] = [];

  for (const section of sections) {
    const sectionTitle = normalizePatternHeadingLabel(section.title);
    if (!sectionTitle || shouldIgnorePatternSectionHeading(sectionTitle)) {
      continue;
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

        statements.push(
          ...extractStatementsFromSection(subsection.content)
            .slice(0, 2)
            .map((statement) =>
              prefixPatternTopicStatement(subsectionTopic, statement),
            ),
        );
      }

      continue;
    }

    const sectionTopic = formatPatternTopicLabel(patternTitle, sectionTitle);
    statements.push(
      ...extractStatementsFromSection(section.content)
        .slice(0, 4)
        .map((statement) =>
          prefixPatternTopicStatement(sectionTopic, statement),
        ),
    );
  }

  return uniqueStrings(
    statements.filter((statement) => statement.trim().length > 0),
  );
}

function isExplicitPatternAccessibilityStatement(statement: string): boolean {
  return /\b(accessibility|ADA|WCAG|screen reader|assistive|keyboard users?|mobility impairments?|visual impairments?|visually impaired users?|browser zoom|400% zoom|accessible layout)\b/i.test(
    statement,
  );
}

function parsePatternAccessibilitySummary(content: string): string[] {
  const explicitAccessibility = parseSectionStatements(
    content,
    "Accessibility",
  );
  if (explicitAccessibility.length > 0) {
    return explicitAccessibility;
  }

  return uniqueStrings(
    extractStatementsFromSection(content).filter(
      isExplicitPatternAccessibilityStatement,
    ),
  ).slice(0, 5);
}

type PatternAccessibilitySignal = NonNullable<
  PatternRecord["accessibility"]["implementation_signals"]
>[number];

interface PatternExampleAccessibilitySignals {
  ariaAttributes: string[];
  ariaRoles: string[];
  ariaAnnouncements: boolean;
  semanticElements: string[];
}

function extractAriaAttributesFromCode(code: string): string[] {
  return uniqueStrings(
    [...code.matchAll(/\baria-[a-zA-Z0-9_-]+\b/g)]
      .map((match) => match[0])
      .sort(compareOrdinalStrings),
  );
}

function extractAriaRoleValuesFromCode(code: string): string[] {
  return uniqueStrings(
    [
      ...code.matchAll(
        /\brole\s*=\s*(?:"([^"]+)"|'([^']+)'|\{\s*["']([^"']+)["']\s*\})/g,
      ),
    ]
      .map((match) => match[1] ?? match[2] ?? match[3] ?? "")
      .filter((value) => /^[a-z][a-z0-9-]*$/i.test(value))
      .sort(compareOrdinalStrings),
  );
}

function extractSemanticElementsFromCode(code: string): string[] {
  const semanticElements = ["aside", "footer", "form", "header", "main", "nav"];

  return semanticElements.filter((element) =>
    new RegExp(`<${element}\\b`, "i").test(code),
  );
}

function mergePatternExampleAccessibilitySignals(
  left: PatternExampleAccessibilitySignals,
  right: PatternExampleAccessibilitySignals,
): PatternExampleAccessibilitySignals {
  return {
    ariaAttributes: uniqueStrings([
      ...left.ariaAttributes,
      ...right.ariaAttributes,
    ]).sort(compareOrdinalStrings),
    ariaRoles: uniqueStrings([...left.ariaRoles, ...right.ariaRoles]).sort(
      compareOrdinalStrings,
    ),
    ariaAnnouncements: left.ariaAnnouncements || right.ariaAnnouncements,
    semanticElements: uniqueStrings([
      ...left.semanticElements,
      ...right.semanticElements,
    ]).sort(compareOrdinalStrings),
  };
}

function extractPatternExampleAccessibilitySignals(
  code: string,
): PatternExampleAccessibilitySignals {
  return {
    ariaAttributes: extractAriaAttributesFromCode(code),
    ariaRoles: extractAriaRoleValuesFromCode(code),
    ariaAnnouncements: /\buseAriaAnnouncer\b/.test(code),
    semanticElements: extractSemanticElementsFromCode(code),
  };
}

function toPatternAccessibilitySignals(input: {
  signals: PatternExampleAccessibilitySignals;
  source_kind: PatternAccessibilitySignal["source_kind"];
  source: RegistrySourceLocator;
}): PatternAccessibilitySignal[] {
  const entries: PatternAccessibilitySignal[] = [];

  if (input.signals.ariaAttributes.length > 0) {
    entries.push({
      kind: "aria_attribute",
      values: input.signals.ariaAttributes,
      source_kind: input.source_kind,
      ...input.source,
    });
  }

  if (input.signals.ariaRoles.length > 0) {
    entries.push({
      kind: "aria_role",
      values: input.signals.ariaRoles,
      source_kind: input.source_kind,
      ...input.source,
    });
  }

  if (input.signals.ariaAnnouncements) {
    entries.push({
      kind: "aria_announcement",
      values: ["useAriaAnnouncer"],
      source_kind: input.source_kind,
      ...input.source,
    });
  }

  if (input.signals.semanticElements.length > 0) {
    entries.push({
      kind: "semantic_element",
      values: input.signals.semanticElements,
      source_kind: input.source_kind,
      ...input.source,
    });
  }

  return entries;
}

export function derivePatternExampleAccessibilitySignals(
  pattern: PatternRecord,
): PatternAccessibilitySignal[] {
  if (pattern.accessibility.summary.length > 0) {
    return [];
  }

  const signalsBySourceLocator = new Map<
    string,
    {
      source: RegistrySourceLocator;
      signals: PatternExampleAccessibilitySignals;
    }
  >();

  for (const example of pattern.examples) {
    if (!example.code.trim()) {
      continue;
    }
    const source: RegistrySourceLocator =
      example.source_path !== null
        ? { source_url: null, source_path: example.source_path }
        : { source_url: example.source_url, source_path: null };
    const sourceKey = example.source_url
      ? `url:${example.source_url}`
      : `path:${example.source_path}`;

    const signals = extractPatternExampleAccessibilitySignals(example.code);
    if (
      signals.ariaAttributes.length === 0 &&
      signals.ariaRoles.length === 0 &&
      !signals.ariaAnnouncements &&
      signals.semanticElements.length === 0
    ) {
      continue;
    }

    const previous = signalsBySourceLocator.get(sourceKey);
    signalsBySourceLocator.set(sourceKey, {
      source,
      signals: mergePatternExampleAccessibilitySignals(
        previous?.signals ?? {
          ariaAttributes: [],
          ariaRoles: [],
          ariaAnnouncements: false,
          semanticElements: [],
        },
        signals,
      ),
    });
  }

  const accessibilitySignals: PatternAccessibilitySignal[] = [];

  for (const { source, signals } of signalsBySourceLocator.values()) {
    accessibilitySignals.push(
      ...toPatternAccessibilitySignals({
        signals,
        source_kind: "example",
        source,
      }),
    );
  }

  return accessibilitySignals.slice(0, 5);
}

export async function derivePatternImplementationAccessibilitySignals(
  repoRoot: string,
  pattern: PatternRecord,
): Promise<PatternAccessibilitySignal[]> {
  if (pattern.accessibility.summary.length > 0) {
    return [];
  }

  const patternSlug = toKebabCase(pattern.name);
  const sourcePaths = (
    await globCatalogInputs(`packages/*/src/${patternSlug}/**/*.{ts,tsx}`, {
      cwd: repoRoot,
      absolute: true,
      onlyFiles: true,
      ignore: [...NON_PRODUCTION_IMPLEMENTATION_GLOB_IGNORES],
    })
  ).sort(compareOrdinalStrings);
  const accessibilitySignals: PatternAccessibilitySignal[] = [];

  for (const sourcePath of sourcePaths) {
    const source = await readFileOrNull(sourcePath);
    if (!source) {
      continue;
    }

    const sourceRepositoryPath = toPosixPath(
      path.relative(repoRoot, sourcePath),
    );
    const signals = extractPatternExampleAccessibilitySignals(source);

    accessibilitySignals.push(
      ...toPatternAccessibilitySignals({
        signals,
        source_kind: "source",
        source: {
          source_url: null,
          source_path: sourceRepositoryPath,
        },
      }),
    );
  }

  return accessibilitySignals.slice(0, 5);
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
    meta?: {
      patternCount?: unknown;
    };
    patterns?: Record<string, PatternCategoryMapEntry>;
  };
  const entries = Object.values(parsed.patterns ?? {});
  if (
    !Number.isInteger(parsed.meta?.patternCount) ||
    parsed.meta?.patternCount !== entries.length
  ) {
    throw new Error(
      `Pattern category map count '${String(
        parsed.meta?.patternCount,
      )}' does not match its ${entries.length} pattern entries.`,
    );
  }
  const byRoute = new Map<
    string,
    {
      categoryIds: string[];
      categoryLabels: string[];
    }
  >();

  for (const entry of entries) {
    const route = assertCanonicalSiteRoute(entry.route);
    if (byRoute.has(route)) {
      throw new Error(`Duplicate pattern category route '${route}'.`);
    }
    const categoryLabels = [
      entry.category,
      ...(entry.secondaryCategories ?? []),
    ].filter((value) => value.length > 0);

    byRoute.set(route, {
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
    await globCatalogInputs("packages/*/stories/patterns/**/*.stories.tsx", {
      cwd: repoRoot,
      absolute: true,
      onlyFiles: true,
    })
  ).sort(compareOrdinalStrings);

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

          const storyCode = buildPatternStoryExampleCode(
            source,
            sourceFile,
            statementIndex,
          );
          examples.push({
            id: `pattern-story.${toKebabCase(relativePath)}.${toKebabCase(declaration.name.text)}`,
            title: declaration.name.text,
            description: "",
            intent: deriveStoryExampleIntent(declaration.name.text),
            complexity: inferStoryComplexity(storyCode),
            code: storyCode,
            source_url: null,
            source_path: relativePath,
            package: packageName,
            target_type: "pattern",
            target_name: patternName,
          });
        }
      }
      if (ts.isFunctionDeclaration(statement) && statement.name) {
        const storyCode = buildPatternStoryExampleCode(
          source,
          sourceFile,
          statementIndex,
        );
        examples.push({
          id: `pattern-story.${toKebabCase(relativePath)}.${toKebabCase(statement.name.text)}`,
          title: statement.name.text,
          description: "",
          intent: deriveStoryExampleIntent(statement.name.text),
          complexity: inferStoryComplexity(storyCode),
          code: storyCode,
          source_url: null,
          source_path: relativePath,
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
): Promise<PatternRecord[]> {
  const patternMdxPaths = (
    await globCatalogInputs("site/docs/patterns/**/*.mdx", {
      cwd: repoRoot,
      absolute: true,
      onlyFiles: true,
    })
  ).sort(compareOrdinalStrings);

  const patternCategoryByRoute = await loadPatternCategoryMap(repoRoot);
  const consumedCategoryRoutes = new Set<string>();
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

    const parsed = parseYamlFrontmatter(source);
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
    const route = assertCanonicalSiteRoute(
      `/salt/patterns/${relativePatternPath.replace(/\.mdx$/, "")}`,
    );
    const routeSlug = getRouteSlug(route);
    const aliases = enrichPatternAliases(
      uniqueStrings([
        ...asStringArray(parsed.data.aliases),
        ...(routeSlug ? [routeSlug] : []),
      ]),
      asStringArray(aiConfig?.aliases),
    );
    const categoryRecord = patternCategoryByRoute.get(route);
    if (!categoryRecord) {
      throw new Error(
        `Missing pattern category map entry for '${title}' (${route}).`,
      );
    }
    consumedCategoryRoutes.add(route);
    const whenToUse = parseSectionStatements(parsed.content, "When to use");
    const explicitWhenNotToUse = parseSectionStatements(
      parsed.content,
      "When not to use",
    );
    const explicitHowItWorks = parseSectionStatements(
      parsed.content,
      "How it works",
    );
    const howItWorks =
      explicitHowItWorks.length > 0
        ? explicitHowItWorks
        : extractPatternBehaviorStatements(title, parsed.content);
    const structuredGuidance = parseStructuredGuidanceCallouts(parsed.content);
    const whenNotToUse = uniqueStrings([
      ...explicitWhenNotToUse,
      ...structuredGuidance.avoid,
    ]);
    const topicSignals = extractPatternTopicSignals(title, parsed.content);
    const componentRoles = parseAuthoredComponentRoles(
      aiConfig,
      components,
      title,
    );
    const semantics = buildUsageSemantics({
      category: categoryRecord.categoryIds,
      preferred_for: [
        ...whenToUse,
        ...structuredGuidance.preferred,
        ...topicSignals,
      ],
      not_for: whenNotToUse,
      derived_from: [
        "pattern-category-map",
        "pattern-docs",
        ...(structuredGuidance.preferred.length > 0 ||
        structuredGuidance.avoid.length > 0
          ? (["usage-callouts"] as const)
          : []),
      ],
    });
    const retrievalSignals = buildRetrievalSignals({
      caution_statements: whenNotToUse,
    });

    const summary =
      asString(parsed.data.description) ??
      extractFirstParagraph(parsed.content);

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
    });
    const docsExamples = extractPatternDocsExamples({
      patternTitle: title,
      route,
      content: parsed.content,
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
        role: componentRoles.get(componentName) ?? null,
      })),
      related_patterns: relatedPatterns,
      how_to_build: parseSectionStatements(parsed.content, "How to build"),
      how_it_works: howItWorks,
      accessibility: {
        summary: parsePatternAccessibilitySummary(parsed.content),
      },
      resources: resourceRecords,
      examples: docsExamples,
      related_docs: {
        overview: route,
      },
      semantics,
      retrieval_signals: retrievalSignals,
      last_verified_at: null,
    });
  }

  const orphanCategoryRoutes = [...patternCategoryByRoute.keys()].filter(
    (route) => !consumedCategoryRoutes.has(route),
  );
  if (orphanCategoryRoutes.length > 0) {
    throw new Error(
      `Pattern category map contains routes without pattern docs: ${orphanCategoryRoutes.join(
        ", ",
      )}.`,
    );
  }

  return patterns.sort((left, right) =>
    compareOrdinalStrings(left.name, right.name),
  );
}
