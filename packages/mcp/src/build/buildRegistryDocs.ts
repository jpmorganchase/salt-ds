import path from "node:path";
import fg from "fast-glob";
import matter from "gray-matter";
import { toPosixPath } from "../registry/paths.js";
import type {
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
  uniqueStrings,
} from "./buildRegistryShared.js";
import { extractMdxTextBlocks } from "./pageTextExtractor.js";

interface SiteSearchPageShape {
  title?: unknown;
  route?: unknown;
  content?: unknown;
  keywords?: unknown;
}

interface MarkdownPageMetadata {
  summary: string | null;
  section_headings: string[];
}

interface MarkdownPageSource extends MarkdownPageMetadata {
  content: string[];
}

function findMarkdownSection(
  sections: Array<{ title: string; content: string }>,
  matcher: (title: string) => boolean,
): string {
  return sections.find((section) => matcher(section.title))?.content ?? "";
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

function normalizeSiteRoute(route: string): string {
  return route
    .trim()
    .replace(/\\/g, "/")
    .replace(/^\/+/, "")
    .replace(/\/+/g, "/")
    .replace(/\/$/, "");
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

async function readPageSnapshotMetadata(
  repoRoot: string,
  route: string,
): Promise<MarkdownPageMetadata> {
  const normalizedRoute = normalizeSiteRoute(route);
  if (!normalizedRoute.startsWith("salt/")) {
    return {
      summary: null,
      section_headings: [],
    };
  }

  const snapshotPath = path.join(
    repoRoot,
    "site",
    "snapshots",
    "latest",
    `${normalizedRoute}.mdx`,
  );
  const snapshotSource = await readFileOrNull(snapshotPath);
  if (!snapshotSource) {
    return {
      summary: null,
      section_headings: [],
    };
  }

  const parsed = matter(snapshotSource);
  return extractMarkdownPageMetadata(
    parsed.content,
    asString(parsed.data.description),
  );
}

async function buildSiteDocsRouteMap(
  repoRoot: string,
): Promise<Map<string, string>> {
  const docsRoot = path.join(repoRoot, "site", "docs");
  const docPaths = await fg("**/*.mdx", {
    absolute: true,
    cwd: docsRoot,
    onlyFiles: true,
  });
  const routeMap = new Map<string, string>();

  for (const docPath of docPaths) {
    const relativePath = toPosixPath(path.relative(docsRoot, docPath));
    const route =
      relativePath === "index.mdx"
        ? "salt/index"
        : `salt/${relativePath.replace(/\.mdx$/i, "")}`;
    routeMap.set(createNormalizedSiteRouteKey(route), docPath);

    if (/\/index$/i.test(route)) {
      routeMap.set(
        createNormalizedSiteRouteKey(route.replace(/\/index$/i, "")),
        docPath,
      );
    }
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

async function readSiteDocsPageSource(
  route: string,
  docsRouteMap: Map<string, string>,
): Promise<MarkdownPageSource | null> {
  const docPath = docsRouteMap.get(createNormalizedSiteRouteKey(route));
  if (!docPath) {
    return null;
  }

  const docSource = await readFileOrNull(docPath);
  if (!docSource) {
    return null;
  }

  const parsed = matter(docSource);
  const metadata = extractMarkdownPageMetadata(
    parsed.content,
    asString(parsed.data.description),
  );

  return {
    ...metadata,
    content: extractMarkdownContentBlocks(parsed.content),
  };
}

export async function extractPages(
  repoRoot: string,
  verifiedAt: string,
): Promise<PageRecord[]> {
  const searchDataPath = path.join(
    repoRoot,
    "site",
    "public",
    "search-data.json",
  );
  const searchDataSource = await readFileOrNull(searchDataPath);
  if (!searchDataSource) {
    return [];
  }

  let parsedSearchData: unknown;
  try {
    parsedSearchData = JSON.parse(searchDataSource);
  } catch {
    return [];
  }

  if (!Array.isArray(parsedSearchData)) {
    return [];
  }

  const docsRouteMap = await buildSiteDocsRouteMap(repoRoot);

  const pages = await Promise.all(
    parsedSearchData.map(async (entry): Promise<PageRecord | null> => {
      const page = entry as SiteSearchPageShape;
      const title = asString(page.title);
      const route = asString(page.route);
      if (!title || !route) {
        return null;
      }

      const fallbackContent = mergePageContentBlocks(
        asStringArray(page.content),
      );
      const docsSource = await readSiteDocsPageSource(route, docsRouteMap);
      const snapshotMetadata = docsSource
        ? null
        : await readPageSnapshotMetadata(repoRoot, route);
      const summary =
        docsSource?.summary ??
        snapshotMetadata?.summary ??
        fallbackContent[0] ??
        cleanMarkdownText(title);

      return {
        id: createPageId(route),
        title: cleanMarkdownText(title),
        route,
        page_kind: classifyPageKind(route),
        summary,
        keywords: uniqueStrings([
          ...asStringArray(page.keywords).map((keyword) =>
            normalizeWhitespace(cleanMarkdownText(keyword)),
          ),
          ...extractRouteKeywords(route),
          title,
        ]).filter((keyword) => keyword.length > 0),
        content:
          docsSource && docsSource.content.length > 0
            ? docsSource.content
            : fallbackContent,
        section_headings:
          docsSource?.section_headings ??
          snapshotMetadata?.section_headings ??
          [],
        last_verified_at: verifiedAt,
      };
    }),
  );

  return pages
    .filter((page): page is PageRecord => page !== null)
    .sort(
      (left, right) =>
        left.title.localeCompare(right.title) ||
        left.route.localeCompare(right.route),
    );
}

export async function extractGuides(
  repoRoot: string,
  verifiedAt: string,
): Promise<GuideRecord[]> {
  const guides: GuideRecord[] = [];

  const developingPath = path.join(
    repoRoot,
    "site/docs/getting-started/developing.mdx",
  );
  const developingSource = await readFileOrNull(developingPath);
  if (developingSource) {
    const parsed = matter(developingSource);
    const sections = parseMarkdownSections(parsed.content, 3);
    const installSection = findMarkdownSection(sections, (title) =>
      title.includes("Install the Salt packages"),
    );
    const fontsSection = findMarkdownSection(sections, (title) =>
      title.includes("Add required web fonts"),
    );
    const integrateSection = findMarkdownSection(sections, (title) =>
      title.includes("Integrate Salt into your app"),
    );
    const importSection = findMarkdownSection(sections, (title) =>
      title.includes("Import components"),
    );
    const labSection = findMarkdownSection(sections, (title) =>
      title.includes("Play with lab components"),
    );

    const installBlocks = extractFencedCodeBlocks(installSection);
    const fontBlocks = extractFencedCodeBlocks(fontsSection);
    const integrateBlocks = extractFencedCodeBlocks(integrateSection);
    const importBlocks = extractFencedCodeBlocks(importSection);

    const steps = [
      buildGuideStep(
        "Install core packages",
        [
          "`@salt-ds/core` contains production-ready UI components.",
          "`@salt-ds/theme` contains CSS files that apply Salt's default theme.",
          "`@salt-ds/icons` contains SVG-based icons.",
        ],
        [
          createGuideSnippet(
            "Install Salt packages",
            installBlocks[0]?.language ?? "shell",
            installBlocks[0]?.code,
          ),
        ].filter((snippet): snippet is GuideSnippet => snippet !== null),
      ),
      buildGuideStep(
        "Add required web fonts",
        [
          "Salt’s default theme requires the Open Sans and PT Mono web fonts.",
          "You can load them from Google Fonts or self-host them with Fontsource.",
        ],
        [
          createGuideSnippet(
            "Google Fonts",
            fontBlocks[0]?.language ?? "html",
            fontBlocks[0]?.code,
          ),
          createGuideSnippet(
            "Install Fontsource packages",
            fontBlocks[1]?.language ?? "shell",
            fontBlocks[1]?.code,
          ),
          createGuideSnippet(
            "Import Fontsource styles",
            fontBlocks[2]?.language ?? "tsx",
            fontBlocks[2]?.code,
          ),
        ].filter((snippet): snippet is GuideSnippet => snippet !== null),
      ),
      buildGuideStep(
        "Bootstrap Salt in your app",
        [
          "Import the Salt theme CSS and wrap your application in `SaltProvider`.",
          ...extractStatementsFromSection(integrateSection),
        ],
        [
          createGuideSnippet(
            "Bootstrap with SaltProvider",
            integrateBlocks[0]?.language ?? "tsx",
            integrateBlocks[0]?.code,
          ),
        ].filter((snippet): snippet is GuideSnippet => snippet !== null),
      ),
      buildGuideStep(
        "Import components",
        extractStatementsFromSection(importSection),
        [
          createGuideSnippet(
            "Import and render a Button",
            importBlocks[0]?.language ?? "tsx",
            importBlocks[0]?.code,
          ),
        ].filter((snippet): snippet is GuideSnippet => snippet !== null),
      ),
      buildGuideStep(
        "Adopt lab components intentionally",
        extractStatementsFromSection(labSection),
        [],
      ),
    ];

    guides.push({
      id: "guide.developing-with-salt",
      name: "Developing with Salt",
      aliases: ["getting started", "setup", "bootstrap", "developing"],
      kind: "getting-started",
      summary:
        asString(parsed.data.description) ??
        extractFirstParagraph(parsed.content),
      packages: ["@salt-ds/core", "@salt-ds/theme", "@salt-ds/icons"],
      steps,
      related_docs: {
        overview: "/salt/getting-started/developing",
        related_components: ["SaltProvider", "Button"],
        related_packages: ["@salt-ds/core", "@salt-ds/theme", "@salt-ds/icons"],
      },
      last_verified_at: verifiedAt,
    });
  }

  const themesPath = path.join(repoRoot, "site/docs/themes/index.mdx");
  const themesSource = await readFileOrNull(themesPath);
  if (themesSource) {
    const parsed = matter(themesSource);
    const sections = parseMarkdownSections(parsed.content, 3);
    const jpmBrandSection = findMarkdownSection(sections, (title) =>
      title.includes("JPM Brand theme"),
    );
    const legacySection = findMarkdownSection(sections, (title) =>
      title.includes("Legacy (UITK) theme"),
    );

    const jpmBrandBlocks = extractFencedCodeBlocks(jpmBrandSection);
    const legacyBlocks = extractFencedCodeBlocks(legacySection);

    guides.push({
      id: "guide.themes",
      name: "Themes",
      aliases: ["theme", "theming", "jpm brand", "legacy", "uitk"],
      kind: "theming",
      summary:
        asString(parsed.data.description) ??
        extractFirstParagraph(parsed.content),
      packages: ["@salt-ds/core", "@salt-ds/theme"],
      steps: [
        buildGuideStep(
          "Choose a Salt theme",
          [
            "Salt offers the default JPM Brand theme for new work and a Legacy theme for UITK migration paths.",
            "Salt recommends the JPM Brand theme for accessibility and long-term brand alignment.",
          ],
          [],
        ),
        buildGuideStep(
          "Apply the JPM Brand theme",
          extractStatementsFromSection(jpmBrandSection),
          [
            createGuideSnippet(
              "JPM Brand theme",
              jpmBrandBlocks[0]?.language ?? "tsx",
              jpmBrandBlocks[0]?.code,
            ),
            createGuideSnippet(
              "Amplitude font-face declarations",
              jpmBrandBlocks[1]?.language ?? "css",
              jpmBrandBlocks[1]?.code,
            ),
          ].filter((snippet): snippet is GuideSnippet => snippet !== null),
        ),
        buildGuideStep(
          "Apply the Legacy theme",
          extractStatementsFromSection(legacySection),
          [
            createGuideSnippet(
              "Legacy theme",
              legacyBlocks[0]?.language ?? "tsx",
              legacyBlocks[0]?.code,
            ),
          ].filter((snippet): snippet is GuideSnippet => snippet !== null),
        ),
      ],
      related_docs: {
        overview: "/salt/themes",
        related_components: ["SaltProvider", "SaltProviderNext"],
        related_packages: ["@salt-ds/core", "@salt-ds/theme"],
      },
      last_verified_at: verifiedAt,
    });
  }

  return guides.sort((left, right) => left.name.localeCompare(right.name));
}
