import path from "node:path";
import { compareOrdinalStrings } from "../catalog/catalogSerialization.js";
import { toPosixPath } from "../registry/paths.js";
import type {
  ComponentRecord,
  ExampleRecord,
  GuideRecord,
  GuideSnippet,
  PageKind,
  PageRecord,
} from "../types.js";
import {
  extractFencedCodeBlocks,
  extractFirstParagraph,
  extractStatementsFromSection,
  parseMarkdownSections,
} from "./buildRegistryMarkdown.js";
import {
  asString,
  asStringArray,
  cleanMarkdownText,
  normalizeWhitespace,
  readFileOrNull,
  toKebabCase,
  uniqueStrings,
} from "./buildRegistryShared.js";
import { globCatalogInputs } from "./catalogInputInventory.js";
import { extractMdxTextBlocks } from "./pageTextExtractor.js";
import { parseYamlFrontmatter } from "./parseYamlFrontmatter.js";
import {
  normalizeSiteRoute,
  siteDocsRouteFromRelativePath,
} from "./siteDocsRoutes.js";

interface MarkdownPageMetadata {
  summary: string | null;
  section_headings: string[];
}

function buildGuideStep(
  title: string,
  statements: string[],
  snippets: GuideSnippet[],
) {
  return {
    title,
    statements: uniqueStrings(
      statements
        .map((statement) => cleanMarkdownText(statement))
        .filter((statement) => statement.length > 0),
    ),
    snippets,
  };
}

function createGuideSnippet(
  title: string,
  language: GuideSnippet["language"],
  code: string | null | undefined,
): GuideSnippet | null {
  const normalizedCode = code?.trim();
  if (!normalizedCode) {
    return null;
  }

  return {
    title,
    language,
    code: normalizedCode,
  };
}

function normalizeGuideStepTitle(title: string): string {
  return title.replace(/^\d+\.\s*/, "").trim();
}

function normalizeGuideAlias(candidate: string): string {
  return normalizeWhitespace(cleanMarkdownText(candidate)).trim();
}

function expandGuideAliasCandidate(candidate: string): string[] {
  const normalized = normalizeGuideAlias(candidate);
  if (!normalized) {
    return [];
  }

  const comparisonMatch = normalized.match(/^(.+?)\s+or\s+(.+)$/i);
  if (!comparisonMatch) {
    return [normalized];
  }

  return uniqueStrings([
    normalized,
    `${comparisonMatch[1]} vs ${comparisonMatch[2]}`,
  ]);
}

function inferGettingStartedGuideAliases(
  basename: string,
  title: string,
  content: string,
): string[] {
  const h2Sections = parseMarkdownSections(content, 2);
  const h3Sections = parseMarkdownSections(content, 3);

  return uniqueStrings(
    [
      title,
      basename.replace(/-/g, " "),
      ...h2Sections.map((section) => section.title),
      ...h3Sections.map((section) => section.title),
    ]
      .flatMap(expandGuideAliasCandidate)
      .filter((candidate) => candidate.length >= 3 && candidate.length <= 80),
  );
}

function inferGettingStartedGuidePackages(content: string): string[] {
  return uniqueStrings(
    [...content.matchAll(/@salt-ds\/[a-z-]+/g)].map((match) => match[0]),
  );
}

type GuideComponentRoute = Pick<ComponentRecord, "name"> & {
  related_docs: Pick<ComponentRecord["related_docs"], "overview">;
};

function buildGuideComponentNameByRoute(
  components: readonly GuideComponentRoute[],
): ReadonlyMap<string, string> {
  const componentNameByRoute = new Map<string, string>();
  for (const component of components) {
    const overview = component.related_docs.overview;
    if (!overview) {
      throw new Error(
        `Component '${component.name}' has no canonical guide relation route.`,
      );
    }
    const normalizedRoute = normalizeSiteRoute(overview);
    const componentRoutePrefix = "salt/components/";
    if (!normalizedRoute.startsWith(componentRoutePrefix)) {
      throw new Error(
        `Component '${component.name}' has a non-canonical guide relation route '${overview}'.`,
      );
    }
    const route = normalizedRoute
      .slice(componentRoutePrefix.length)
      .toLowerCase();
    if (!route) {
      throw new Error(
        `Component '${component.name}' has a non-canonical guide relation route '${overview}'.`,
      );
    }
    const existingName = componentNameByRoute.get(route);
    if (existingName) {
      throw new Error(
        `Component guide relation route '${overview}' is shared by '${existingName}' and '${component.name}'.`,
      );
    }
    componentNameByRoute.set(route, component.name);
  }
  return componentNameByRoute;
}

function guideComponentRouteFromHref(
  href: string,
  guideRoute: string,
): string | null {
  let resolved: URL;
  try {
    resolved = new URL(href, `https://salt.local${guideRoute}`);
  } catch {
    return null;
  }
  if (resolved.origin !== "https://salt.local") return null;
  const normalizedRoute = normalizeSiteRoute(resolved.pathname);
  const componentRoutePrefix = "salt/components/";
  if (!normalizedRoute.startsWith(componentRoutePrefix)) return null;
  const route = normalizedRoute
    .slice(componentRoutePrefix.length)
    .replace(/\/(?:usage|accessibility|examples|index)$/iu, "")
    .replace(/^\/+|\/+$/gu, "")
    .toLowerCase();
  return route && route !== "layouts" ? route : null;
}

function inferGettingStartedGuideRelatedComponents(
  content: string,
  componentNameByRoute: ReadonlyMap<string, string>,
  guidePath: string,
): string[] {
  const guideBasename = path.basename(guidePath, path.extname(guidePath));
  const guideRoute = `/salt/getting-started/${guideBasename}`;
  return uniqueStrings(
    [...content.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)]
      .map((match) => match[1]?.trim() ?? "")
      .map((href) => ({
        href,
        route: guideComponentRouteFromHref(href, guideRoute),
      }))
      .filter(
        (candidate): candidate is { href: string; route: string } =>
          candidate.route !== null,
      )
      .map(({ href, route }) => {
        const componentName = componentNameByRoute.get(route);
        if (!componentName) {
          throw new Error(
            `Guide '${toPosixPath(guidePath)}' links unknown component route '${route}' through '${href}'.`,
          );
        }
        return componentName;
      }),
  );
}

function inferGettingStartedGuideStepHeadingDepth(content: string): number {
  const hasStepByStepSection = /^##\s+The step-by-step process\b/m.test(
    content,
  );
  if (!hasStepByStepSection) {
    return 2;
  }

  return parseMarkdownSections(content, 3).length > 0 ? 3 : 2;
}

function buildGettingStartedGuideRecord(
  filePath: string,
  source: string,
  componentNameByRoute: ReadonlyMap<string, string>,
): GuideRecord | null {
  const parsed = parseYamlFrontmatter(source);
  const title = asString(parsed.data.title);

  if (!title) {
    return null;
  }

  const stepHeadingDepth = inferGettingStartedGuideStepHeadingDepth(
    parsed.content,
  );

  const sections = parseMarkdownSections(parsed.content, stepHeadingDepth);
  const steps = sections
    .map((section) => {
      const stepTitle = normalizeGuideStepTitle(section.title);
      const snippets = extractFencedCodeBlocks(section.content)
        .map((block, index) =>
          createGuideSnippet(
            `${stepTitle} example ${index + 1}`,
            block.language,
            block.code,
          ),
        )
        .filter((snippet): snippet is GuideSnippet => snippet !== null);
      const statements = extractStatementsFromSection(section.content);

      if (statements.length === 0 && snippets.length === 0) {
        return null;
      }

      return buildGuideStep(stepTitle, statements, snippets);
    })
    .filter((step): step is GuideRecord["steps"][number] => step !== null);

  if (steps.length === 0) {
    return null;
  }

  const basename = path.basename(filePath, path.extname(filePath));
  const packages = inferGettingStartedGuidePackages(parsed.content);
  const relatedComponents = inferGettingStartedGuideRelatedComponents(
    parsed.content,
    componentNameByRoute,
    filePath,
  );

  return {
    id: `guide.${basename.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`,
    name: title,
    aliases: inferGettingStartedGuideAliases(basename, title, parsed.content),
    kind: "getting-started",
    summary:
      asString(parsed.data.description) ??
      extractFirstParagraph(parsed.content),
    packages,
    steps,
    related_docs: {
      overview: `/salt/getting-started/${basename}`,
      related_components: relatedComponents,
      related_packages: packages,
    },
    last_verified_at: null,
  };
}

function createNormalizedSiteRouteKey(route: string): string {
  return normalizeSiteRoute(route).toLowerCase();
}

function createPageId(route: string): string {
  return `page.${normalizeSiteRoute(route)
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/(^-|-$)/g, "")
    .toLowerCase()}`;
}

function classifyPageKind(route: string): PageKind {
  const normalizedRoute = normalizeSiteRoute(route).toLowerCase();

  if (normalizedRoute === "salt/index" || normalizedRoute === "salt") {
    return "landing";
  }
  if (normalizedRoute.startsWith("salt/about/")) {
    return "about";
  }
  if (normalizedRoute.startsWith("salt/getting-started/")) {
    return "guide";
  }
  if (normalizedRoute.startsWith("salt/components/")) {
    return "component-doc";
  }
  if (normalizedRoute.startsWith("salt/patterns/")) {
    return "pattern-doc";
  }
  if (normalizedRoute.startsWith("salt/foundations/")) {
    // Pages under salt/foundations/fragments/** are reusable MDX
    // includes (sidebar: exclude), not standalone foundations. Treat
    // them as generic pages so the registry coverage audit does not demand a
    // canonical example for them.
    if (normalizedRoute.includes("/fragments/")) {
      return "other";
    }
    return "foundation";
  }
  if (normalizedRoute.startsWith("salt/themes/")) {
    return "theme-doc";
  }
  if (normalizedRoute.startsWith("salt/support-and-contributions/")) {
    return "support";
  }
  if (normalizedRoute.startsWith("salt-github/")) {
    return "release-note";
  }

  return "other";
}

function mergePageContentBlocks(values: string[]): string[] {
  const cleanedValues = values
    .map((value) => cleanMarkdownText(value))
    .map((value) => normalizeWhitespace(value))
    .filter((value) => value.length > 1 && /[a-z0-9]/i.test(value));
  const blocks: string[] = [];
  let current = "";

  for (const value of cleanedValues) {
    current = current ? `${current} ${value}` : value;
    if (/[.!?]$/.test(value) || current.length >= 220) {
      blocks.push(current);
      current = "";
    }
  }

  if (current) {
    blocks.push(current);
  }

  return uniqueStrings(blocks);
}

function extractMarkdownPageMetadata(
  content: string,
  description: string | null,
): MarkdownPageMetadata {
  const summary = description ?? extractFirstParagraph(content);
  const section_headings = uniqueStrings(
    [2, 3, 4]
      .flatMap((level) =>
        parseMarkdownSections(content, level).map((section) =>
          cleanMarkdownText(section.title),
        ),
      )
      .filter((heading) => heading.length > 0),
  );

  return {
    summary,
    section_headings,
  };
}

function extractFallbackMarkdownLines(content: string): string[] {
  return content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(
      (line) =>
        line.length > 0 &&
        !line.startsWith("#") &&
        !line.startsWith("```") &&
        !line.startsWith("<"),
    )
    .map((line) => normalizeWhitespace(line))
    .filter((line) => line.length > 1);
}

function extractRouteKeywords(route: string): string[] {
  const normalizedRoute = normalizeSiteRoute(route);
  return uniqueStrings([
    normalizedRoute,
    ...normalizedRoute
      .split("/")
      .filter((part) => part.length > 0)
      .flatMap((part) =>
        part
          .split(/[-_]/)
          .map((segment) => segment.trim())
          .filter((segment) => segment.length > 0),
      ),
  ]);
}

async function buildSiteDocsRouteMap(
  repoRoot: string,
): Promise<Map<string, string>> {
  const docsRoot = path.join(repoRoot, "site", "docs");
  const docPaths = await globCatalogInputs("**/*.mdx", {
    absolute: true,
    cwd: docsRoot,
    onlyFiles: true,
  });
  const routeMap = new Map<string, string>();
  const routeByPortableIdentity = new Map<string, string>();

  for (const docPath of docPaths.sort(compareOrdinalStrings)) {
    const relativePath = toPosixPath(path.relative(docsRoot, docPath));
    const route = siteDocsRouteFromRelativePath(relativePath);
    const routeKey = createNormalizedSiteRouteKey(route);
    const existingRoute = routeByPortableIdentity.get(routeKey);
    if (existingRoute) {
      const existing = routeMap.get(existingRoute);
      throw new Error(
        `Duplicate live MDX route ${route}: ${toPosixPath(
          path.relative(repoRoot, existing as string),
        )} and ${relativePath}`,
      );
    }
    routeByPortableIdentity.set(routeKey, route);
    routeMap.set(route, docPath);
  }

  return routeMap;
}

function extractMarkdownContentBlocks(content: string): string[] {
  try {
    return mergePageContentBlocks(extractMdxTextBlocks(content));
  } catch {
    return mergePageContentBlocks(extractFallbackMarkdownLines(content));
  }
}

export async function extractPages(repoRoot: string): Promise<PageRecord[]> {
  const docsRouteMap = await buildSiteDocsRouteMap(repoRoot);
  const docsRoot = path.join(repoRoot, "site", "docs");
  const parsedByPath = new Map<
    string,
    { data: Record<string, unknown>; content: string }
  >();
  for (const docPath of docsRouteMap.values()) {
    const source = await readFileOrNull(docPath);
    if (source == null) {
      throw new Error(`Required live MDX page disappeared: ${docPath}`);
    }
    const parsed = parseYamlFrontmatter(source);
    parsedByPath.set(path.resolve(docPath), {
      data: parsed.data as Record<string, unknown>,
      content: parsed.content,
    });
  }

  const resolvePageTitle = (
    docPath: string,
    parsed: { data: Record<string, unknown>; content: string },
  ): string | null => {
    const direct =
      asString(parsed.data.title) ??
      /^#\s+(.+)$/mu.exec(parsed.content)?.[1]?.trim() ??
      null;
    if (direct) return direct;

    let currentDir = path.dirname(docPath);
    while (
      currentDir === docsRoot ||
      (!path.relative(docsRoot, currentDir).startsWith("..") &&
        !path.isAbsolute(path.relative(docsRoot, currentDir)))
    ) {
      const parentIndexPath = path.join(currentDir, "index.mdx");
      if (parentIndexPath !== docPath) {
        const parent = parsedByPath.get(path.resolve(parentIndexPath));
        const inherited =
          parent &&
          (asString(parent.data.title) ??
            /^#\s+(.+)$/mu.exec(parent.content)?.[1]?.trim() ??
            null);
        if (inherited) return inherited;
      }
      if (currentDir === docsRoot) break;
      currentDir = path.dirname(currentDir);
    }
    return null;
  };

  const pages: PageRecord[] = [];
  for (const [route, docPath] of [...docsRouteMap.entries()].sort(
    ([left], [right]) => compareOrdinalStrings(left, right),
  )) {
    const parsed = parsedByPath.get(path.resolve(docPath));
    if (!parsed) throw new Error(`Live MDX parse cache missed ${docPath}`);
    const title = resolvePageTitle(docPath, parsed);
    if (!title) {
      throw new Error(
        `Live MDX page is missing a deterministic title: ${toPosixPath(
          path.relative(repoRoot, docPath),
        )}`,
      );
    }
    const metadata = extractMarkdownPageMetadata(
      parsed.content,
      asString(parsed.data.description),
    );
    const content = extractMarkdownContentBlocks(parsed.content);
    pages.push({
      id: createPageId(route),
      title: cleanMarkdownText(title),
      route,
      page_kind: classifyPageKind(route),
      summary: metadata.summary ?? content[0] ?? cleanMarkdownText(title),
      keywords: uniqueStrings([
        ...asStringArray(parsed.data.keywords).map((keyword) =>
          normalizeWhitespace(cleanMarkdownText(keyword)),
        ),
        ...extractRouteKeywords(route),
        title,
      ]).filter((keyword) => keyword.length > 0),
      content,
      section_headings: metadata.section_headings,
      source_path: toPosixPath(path.relative(repoRoot, docPath)),
      last_verified_at: null,
    });
  }

  return pages.sort(
    (left, right) =>
      compareOrdinalStrings(left.title, right.title) ||
      compareOrdinalStrings(left.route, right.route),
  );
}

export async function extractGuides(
  repoRoot: string,
  components: readonly GuideComponentRoute[],
): Promise<GuideRecord[]> {
  const guides: GuideRecord[] = [];
  const componentNameByRoute = buildGuideComponentNameByRoute(components);
  const gettingStartedPaths = (
    await globCatalogInputs("site/docs/getting-started/*.mdx", {
      cwd: repoRoot,
      absolute: true,
    })
  )
    .filter((filePath) => path.basename(filePath) !== "index.mdx")
    .sort(compareOrdinalStrings);

  for (const guidePath of gettingStartedPaths) {
    const guideSource = await readFileOrNull(guidePath);
    if (!guideSource) {
      continue;
    }

    const parsedGuide = parseYamlFrontmatter(guideSource);
    if (parsedGuide.data.salt_ai_guide !== true) {
      continue;
    }

    const guide = buildGettingStartedGuideRecord(
      guidePath,
      guideSource,
      componentNameByRoute,
    );
    if (guide) {
      guides.push(guide);
    }
  }

  const themesPath = path.join(repoRoot, "site/docs/themes/index.mdx");
  const themesSource = await readFileOrNull(themesPath);
  if (themesSource) {
    const parsed = parseYamlFrontmatter(themesSource);
    const sections = parseMarkdownSections(parsed.content, 3);
    const sourceBackedSteps = sections
      .map((section) =>
        buildGuideStep(
          section.title,
          extractStatementsFromSection(section.content),
          [],
        ),
      )
      .filter((step) => step.statements.length > 0);

    guides.push({
      id: "guide.themes",
      name: "Themes",
      aliases: uniqueStrings([
        "theme",
        "theming",
        ...sections.map((section) => section.title.toLowerCase()),
      ]),
      kind: "theming",
      summary:
        asString(parsed.data.description) ??
        extractFirstParagraph(parsed.content),
      packages: [],
      steps:
        sourceBackedSteps.length > 0
          ? sourceBackedSteps
          : [
              buildGuideStep(
                "Theme evidence unavailable",
                [
                  "Theme provider, import, prop, font, package, and compatibility claims are unsupported until source-backed documentation or project policy supplies evidence.",
                ],
                [],
              ),
            ],
      related_docs: {
        overview: "/salt/themes",
        related_components: [],
        related_packages: [],
      },
      last_verified_at: null,
    });
  }

  return guides.sort((left, right) =>
    compareOrdinalStrings(left.name, right.name),
  );
}

/**
 * Extract one canonical `ExampleRecord` per foundation page so the
 * registry-coverage audit and downstream catalog consumers can
 * resolve foundations through the same `target_name` lookup used for
 * components and patterns.
 *
 * Source of truth: `site/docs/foundations/**\/*.mdx`. The first fenced
 * code block (or the first paragraph as a fallback) becomes the
 * example body so a model can read structured evidence without having
 * to scrape the foundation page itself. Fragments
 * (`site/docs/foundations/fragments/**`) are intentionally skipped —
 * they are reusable MDX includes, not foundation entities, and
 * `classifyPageKind` already routes them to `page_kind: other`.
 *
 * Each emitted example uses:
 * - `target_type: "foundation"`
 * - `target_name`: the page frontmatter title (lowercase match for the
 *   coverage spec)
 * - `source_url`: the foundation page route (so consumers can fetch
 *   the full doc when they need it).
 */
export async function extractFoundationExamples(
  repoRoot: string,
): Promise<ExampleRecord[]> {
  const foundationDocPaths = (
    await globCatalogInputs("site/docs/foundations/**/*.mdx", {
      cwd: repoRoot,
      absolute: true,
      onlyFiles: true,
      // Mirror the pattern docs extractor: skip fragments and any
      // index-only pages that don't classify as foundations.
      ignore: [
        "site/docs/foundations/fragments/**",
        "site/docs/foundations/**/fragments/**",
      ],
    })
  ).sort(compareOrdinalStrings);

  const examples: ExampleRecord[] = [];

  for (const foundationPath of foundationDocPaths) {
    const source = await readFileOrNull(foundationPath);
    if (!source) {
      continue;
    }

    const parsed = parseYamlFrontmatter(source);
    const title = asString(parsed.data.title);
    if (!title) {
      continue;
    }

    // Skip docs explicitly marked as sidebar excludes that are not
    // real foundations (these are typically embedded fragments or
    // duplicated landing sections). We still extract index.mdx pages
    // that are landing pages for a category (e.g. assets/index.mdx
    // titled "Icons") because they carry primary foundation content.
    const sidebarConfig = parsed.data.sidebar as
      | { exclude?: unknown }
      | undefined;
    if (sidebarConfig?.exclude === true) {
      continue;
    }

    const relativePath = toPosixPath(
      path.relative(
        path.join(repoRoot, "site/docs/foundations"),
        foundationPath,
      ),
    );
    const routeSuffix = relativePath.replace(/\.mdx$/i, "");
    const route = siteDocsRouteFromRelativePath(`foundations/${relativePath}`);

    const codeBlocks = extractFencedCodeBlocks(parsed.content);
    const firstSnippet = codeBlocks.find((block) => block.code.length > 0);
    const summary = extractFirstParagraph(parsed.content);

    const fallbackBody = summary
      ? `// ${cleanMarkdownText(summary).slice(0, 480)}\n// See ${route}`
      : `// Salt foundation: ${title}\n// See ${route}`;

    examples.push({
      id: `foundation.${toKebabCase(routeSuffix)}`,
      title,
      description: cleanMarkdownText(summary ?? title).slice(0, 500),
      intent: uniqueStrings([
        `${title.toLowerCase()} foundation`,
        "foundation guidance",
        ...title
          .toLowerCase()
          .split(/\s+/)
          .filter((word) => word.length >= 3),
      ]),
      complexity: "basic",
      code: firstSnippet?.code ?? fallbackBody,
      source_url: route,
      source_path: null,
      package: null,
      target_type: "foundation",
      target_name: title,
    });
  }

  return examples;
}
