import path from "node:path";
import { isPortableRepositoryPath } from "../catalog/catalogPortablePath.js";
import { compareOrdinalStrings } from "../catalog/catalogSerialization.js";
import { assertCanonicalSiteRoute } from "../catalog/catalogSiteRoute.js";
import { toPosixPath } from "../registry/paths.js";
import type {
  AccessibilityImplementationSignal,
  ComponentCanonicalExampleExport,
  ComponentImplementationRequirements,
  ComponentRecord,
  ExampleRecord,
  PackageRecord,
  RegistrySourceLocator,
  SaltStatus,
} from "../types.js";
import {
  type PropMetadata,
  selectDocgenComponent,
  selectSubComponents,
  selectSubComponentsBySourceExports,
  toComponentPropSubjects,
  toComponentProps,
} from "./buildRegistryDocgen.js";
import {
  extractFencedCodeBlocks,
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
  toPascalCase,
  uniqueStrings,
} from "./buildRegistryShared.js";
import {
  buildPackageValueExportGraph,
  type PackageValueExportGraph,
  resolveUniquePackageValueExport,
} from "./catalogExportGraph.js";
import { globCatalogInputs } from "./catalogInputInventory.js";
import { NON_PRODUCTION_IMPLEMENTATION_GLOB_IGNORES } from "./catalogProductionSource.js";
import {
  type ComponentExportAliasOverride,
  componentExportAliasOverrides,
  componentPrimaryExportOverride,
} from "./componentAuthoringOverrides.js";
import { parseYamlFrontmatter } from "./parseYamlFrontmatter.js";

function inferStatusFromPackage(name: string, version: string): SaltStatus {
  if (name === "@salt-ds/lab") {
    return "lab";
  }

  if (/(alpha|beta|rc)/i.test(version)) {
    return "beta";
  }

  return "stable";
}

function inferDocsRoot(packageName: string): string | null {
  if (packageName === "@salt-ds/theme") {
    return "/salt/themes";
  }

  if (
    packageName === "@salt-ds/core" ||
    packageName === "@salt-ds/lab" ||
    packageName === "@salt-ds/date-components" ||
    packageName === "@salt-ds/countries" ||
    packageName === "@salt-ds/icons" ||
    packageName === "@salt-ds/ag-grid-theme" ||
    packageName === "@salt-ds/highcharts-theme" ||
    packageName === "@salt-ds/embla-carousel" ||
    packageName === "@salt-ds/react-resizable-panels-theme"
  ) {
    return "/salt/components";
  }

  return null;
}

function parseSourceRepoPath(sourceCodeUrl: string | null): string | null {
  if (!sourceCodeUrl) {
    return null;
  }

  let parsed: URL;
  try {
    parsed = new URL(sourceCodeUrl);
  } catch {
    return null;
  }

  if (
    parsed.protocol !== "https:" ||
    parsed.hostname !== "github.com" ||
    parsed.username !== "" ||
    parsed.password !== "" ||
    parsed.search !== "" ||
    parsed.hash !== ""
  ) {
    return null;
  }
  const branchPathMatch = parsed.pathname.match(
    /^\/jpmorganchase\/salt-ds\/(?:blob|tree)\/[^/]+\/(.+)$/u,
  );
  const repositoryPath = branchPathMatch?.[1] ?? null;
  return repositoryPath && isPortableRepositoryPath(repositoryPath)
    ? repositoryPath
    : null;
}

function parsePackageNameFromRepoPath(repoPath: string | null): string | null {
  if (!repoPath) {
    return null;
  }

  const normalized = toPosixPath(repoPath);
  const match = normalized.match(/^packages\/([^/]+)/);
  if (!match) {
    return null;
  }

  return `@salt-ds/${match[1]}`;
}

interface ComponentExportAlias {
  exportName: string;
  sourceRepoPath: string | null;
}

function resolveComponentExportAliases(
  title: string,
  overrides: readonly ComponentExportAliasOverride[],
  defaultSourceRepoPath: string | null,
  packageName: string,
): ComponentExportAlias[] {
  const aliases: ComponentExportAlias[] = [];
  const seenExportNames = new Set<string>();
  for (const override of overrides) {
    const exportName = override.exportName;
    const sourceRepoPath = override.sourceRepoPath ?? defaultSourceRepoPath;
    if (override.sourceRepoPath !== undefined) {
      if (
        override.sourceRepoPath !== override.sourceRepoPath.trim() ||
        !isPortableRepositoryPath(override.sourceRepoPath)
      ) {
        throw new Error(
          `Component '${title}' export alias '${exportName}' has a non-canonical MCP source path '${override.sourceRepoPath}'.`,
        );
      }
      const aliasPackageName = parsePackageNameFromRepoPath(sourceRepoPath);
      if (aliasPackageName !== packageName) {
        throw new Error(
          `Component '${title}' export alias '${exportName}' source path belongs to '${String(aliasPackageName)}', not '${packageName}'.`,
        );
      }
    }

    if (
      exportName !== exportName.trim() ||
      !/^[A-Za-z_$][A-Za-z0-9_$]*$/u.test(exportName)
    ) {
      throw new Error(
        `Component '${title}' MCP export-alias override contains invalid export name '${exportName}'.`,
      );
    }
    if (seenExportNames.has(exportName)) {
      throw new Error(
        `Component '${title}' MCP export-alias override contains duplicate export name '${exportName}'.`,
      );
    }
    seenExportNames.add(exportName);
    aliases.push({ exportName, sourceRepoPath });
  }

  return aliases;
}

function removeKeyboardReferenceContent(content: string): string {
  return content
    .replace(/^#{2,4}\s+Keyboard interactions?\s*$/gim, "")
    .replace(/<KeyboardControls\b[\s\S]*?<\/KeyboardControls>/gi, "")
    .replace(/<KeyboardControl\b[\s\S]*?<\/KeyboardControl>/gi, "");
}

function parseAccessibilitySummaryStatements(content: string | null): string[] {
  if (!content) {
    return [];
  }

  const parsed = parseYamlFrontmatter(content);
  const bodyWithoutKeyboardControls = removeKeyboardReferenceContent(
    parsed.content,
  );
  const bestPractices = parseSectionStatements(
    bodyWithoutKeyboardControls,
    "Best practices",
  );
  if (bestPractices.length > 0) {
    return bestPractices;
  }

  return extractStatementsFromSection(bodyWithoutKeyboardControls).slice(0, 12);
}

interface ComponentSourceFile {
  repoPath: string;
  content: string;
}

async function readComponentSourceFiles(
  repoRoot: string,
  sourceRepoPath: string | null,
): Promise<ComponentSourceFile[]> {
  if (!sourceRepoPath) {
    return [];
  }

  const sourcePath = path.join(repoRoot, sourceRepoPath);
  const directSourceFile = await readFileOrNull(sourcePath);
  if (directSourceFile !== null) {
    return [
      {
        repoPath: toPosixPath(path.relative(repoRoot, sourcePath)),
        content: directSourceFile,
      },
    ];
  }

  const relativeSourcePath = toPosixPath(path.relative(repoRoot, sourcePath));
  const sourceFilePaths = await globCatalogInputs(
    `${relativeSourcePath}/**/*.{ts,tsx}`,
    {
      cwd: repoRoot,
      absolute: true,
      onlyFiles: true,
      ignore: [
        ...NON_PRODUCTION_IMPLEMENTATION_GLOB_IGNORES,
        "**/*.css.ts",
        "**/*.d.ts",
      ],
    },
  );

  const files = await Promise.all(
    sourceFilePaths.sort(compareOrdinalStrings).map(async (filePath) => {
      const content = await readFileOrNull(filePath);
      return content
        ? {
            repoPath: toPosixPath(path.relative(repoRoot, filePath)),
            content,
          }
        : null;
    }),
  );

  return files.filter((file): file is ComponentSourceFile => file !== null);
}

function collectSourceAccessibilitySignals(
  sourceFiles: ComponentSourceFile[],
): AccessibilityImplementationSignal[] {
  const signals: AccessibilityImplementationSignal[] = [];
  for (const sourceFile of sourceFiles) {
    const ariaAttributes = uniqueStrings(
      [
        ...sourceFile.content.matchAll(/["']?(aria-[a-z0-9-]+)["']?\s*[:=]/gi),
      ].map((match) => match[1]),
    ).sort(compareOrdinalStrings);
    const roles = uniqueStrings(
      [
        ...sourceFile.content.matchAll(
          /\brole\s*(?:=|:)\s*\{?\s*["']([^"']+)["']/g,
        ),
      ].map((match) => match[1]),
    ).sort(compareOrdinalStrings);
    if (ariaAttributes.length > 0) {
      signals.push({
        kind: "aria_attribute",
        values: ariaAttributes,
        source_kind: "source",
        source_url: null,
        source_path: sourceFile.repoPath,
      });
    }
    if (roles.length > 0) {
      signals.push({
        kind: "aria_role",
        values: roles,
        source_kind: "source",
        source_url: null,
        source_path: sourceFile.repoPath,
      });
    }
    if (
      /\buseAriaAnnouncer\s*\(/.test(sourceFile.content) ||
      /<AriaAnnouncerProvider\b/.test(sourceFile.content)
    ) {
      signals.push({
        kind: "aria_announcement",
        values: ["ARIA announcer utility"],
        source_kind: "source",
        source_url: null,
        source_path: sourceFile.repoPath,
      });
    }
  }
  return signals.sort(
    (left, right) =>
      compareOrdinalStrings(
        left.source_url ?? left.source_path,
        right.source_url ?? right.source_path,
      ) ||
      compareOrdinalStrings(left.kind, right.kind) ||
      compareOrdinalStrings(left.values.join("\0"), right.values.join("\0")),
  );
}

interface CanonicalExampleExportCandidate {
  component_id: string;
  export_name: string;
  example_id: string;
  source_locator: RegistrySourceLocator;
  score: number;
}

function normalizeCanonicalExportName(value: string): string {
  return value.replace(/[^a-zA-Z0-9]+/g, "").toLowerCase();
}

function canonicalExportOwnerScore(
  component: ComponentRecord,
  exportName: string,
): number {
  const normalizedExport = normalizeCanonicalExportName(exportName);
  const ownerNames = [component.source.export_name, component.name]
    .filter((value): value is string => Boolean(value))
    .map(normalizeCanonicalExportName);

  let score = 0;
  for (const ownerName of ownerNames) {
    if (normalizedExport === ownerName) {
      score = Math.max(score, 100);
    } else if (
      ownerName.length >= 3 &&
      normalizedExport.startsWith(ownerName)
    ) {
      score = Math.max(score, 90);
    }

    const layoutRoot = ownerName.endsWith("layout")
      ? ownerName.slice(0, -"layout".length)
      : ownerName;
    if (
      layoutRoot.length >= 3 &&
      normalizedExport !== layoutRoot &&
      normalizedExport.startsWith(layoutRoot)
    ) {
      score = Math.max(score, 70);
    }
  }

  return score;
}

function isWithinRepositoryScope(
  repoPath: string,
  authoredSourceScope: string,
): boolean {
  return (
    repoPath === authoredSourceScope ||
    repoPath.startsWith(`${authoredSourceScope}/`)
  );
}

function canonicalExportSourceScopeDepth(
  exportGraph: PackageValueExportGraph,
  exportName: string,
  authoredSourceScope: string | null,
): number {
  if (!authoredSourceScope) {
    return 0;
  }

  const origins = exportGraph.valueExportOrigins.get(exportName) ?? [];
  if (
    origins.length !== 1 ||
    !isWithinRepositoryScope(origins[0].repoPath, authoredSourceScope)
  ) {
    return 0;
  }

  const sites = exportGraph.valueExportSites.get(exportName) ?? [];
  if (
    !sites.some((site) =>
      isWithinRepositoryScope(site.repoPath, authoredSourceScope),
    )
  ) {
    return 0;
  }

  return authoredSourceScope.split("/").length;
}

function readNamedValueImports(code: string): Array<{
  packageName: string;
  exportName: string;
}> {
  const imports: Array<{ packageName: string; exportName: string }> = [];
  const importPattern =
    /\bimport\s+(type\s+)?\{([\s\S]*?)\}\s+from\s+["']([^"']+)["']/g;
  const boundedCode = code.slice(0, 200_000);
  let match = importPattern.exec(boundedCode);
  while (match) {
    if (!match[1]) {
      const packageName = match[3].trim();
      for (const rawSpecifier of match[2].split(",")) {
        const specifier = rawSpecifier.trim();
        if (!specifier || /^type\s+/.test(specifier)) {
          continue;
        }
        const exportName = specifier.split(/\s+as\s+/i)[0].trim();
        if (exportName) {
          imports.push({ packageName, exportName });
        }
      }
    }
    match = importPattern.exec(boundedCode);
  }
  return imports;
}

function canonicalExampleExportKey(
  packageName: string,
  exportName: string,
): string {
  return `${packageName}\u0000${exportName}`;
}

/**
 * Resolve canonical child-export ownership while the source-backed examples
 * are already in memory. Ownership requires a unique public value origin
 * within the component's authored source scope plus either an authored export
 * alias or a component-related export name. Ambiguous same-score owners fail
 * closed so the generated registry never turns a heuristic tie into evidence.
 */
async function attachCanonicalExampleExports(
  repoRoot: string,
  components: ComponentRecord[],
  exportGraphs: Map<string, Promise<PackageValueExportGraph>>,
  authoredSourceScopeByComponentId: ReadonlyMap<string, string | null>,
  authoredExportAliasesByComponentId: ReadonlyMap<
    string,
    ReadonlyMap<string, string | null>
  >,
): Promise<ComponentRecord[]> {
  const candidatesByKey = new Map<string, CanonicalExampleExportCandidate[]>();
  const representedExportOwners = new Map<string, string>();
  for (const component of components) {
    for (const exportName of [
      component.source.export_name,
      ...(component.sub_components ?? []).map(
        (subComponent) => subComponent.export_name,
      ),
    ].filter((value): value is string => Boolean(value))) {
      const key = canonicalExampleExportKey(component.package.name, exportName);
      const existingOwner = representedExportOwners.get(key);
      if (existingOwner && existingOwner !== component.id) {
        throw new Error(
          `Public component export '${exportName}' has conflicting component owners: ${existingOwner}, ${component.id}.`,
        );
      }
      representedExportOwners.set(key, component.id);
    }
  }

  const authoredExportOwners = new Map<string, string>();
  for (const component of components) {
    const aliases = authoredExportAliasesByComponentId.get(component.id);
    if (!aliases) {
      continue;
    }
    for (const exportName of aliases.keys()) {
      const key = canonicalExampleExportKey(component.package.name, exportName);
      const representedOwner = representedExportOwners.get(key);
      if (representedOwner && representedOwner !== component.id) {
        throw new Error(
          `Authored export alias '${exportName}' for '${component.id}' conflicts with public component owner '${representedOwner}'.`,
        );
      }
      const existingOwner = authoredExportOwners.get(key);
      if (existingOwner && existingOwner !== component.id) {
        throw new Error(
          `Authored export alias '${exportName}' has conflicting component owners: ${existingOwner}, ${component.id}.`,
        );
      }
      authoredExportOwners.set(key, component.id);
    }
  }

  for (const component of [...components].sort((left, right) =>
    compareOrdinalStrings(left.id, right.id),
  )) {
    let exportGraph: PackageValueExportGraph | null = null;
    const authoredSourceScope =
      authoredSourceScopeByComponentId.get(component.id) ?? null;
    const authoredExportAliases =
      authoredExportAliasesByComponentId.get(component.id) ?? new Map();

    for (const example of [...component.examples].sort((left, right) =>
      compareOrdinalStrings(left.id, right.id),
    )) {
      for (const imported of readNamedValueImports(example.code)) {
        if (imported.packageName !== component.package.name) {
          continue;
        }
        const key = canonicalExampleExportKey(
          imported.packageName,
          imported.exportName,
        );
        if (representedExportOwners.has(key)) {
          continue;
        }
        const authoredOwner = authoredExportOwners.get(key);
        if (authoredOwner && authoredOwner !== component.id) {
          continue;
        }

        const isAuthoredExportAlias = authoredExportAliases.has(
          imported.exportName,
        );
        if (
          !isAuthoredExportAlias &&
          canonicalExportOwnerScore(component, imported.exportName) === 0
        ) {
          continue;
        }

        if (!exportGraph) {
          let graphPromise = exportGraphs.get(component.package.name);
          if (!graphPromise) {
            graphPromise = buildPackageValueExportGraph(
              repoRoot,
              component.package.name,
            );
            exportGraphs.set(component.package.name, graphPromise);
          }
          exportGraph = await graphPromise;
        }
        const scopeDepth = canonicalExportSourceScopeDepth(
          exportGraph,
          imported.exportName,
          isAuthoredExportAlias
            ? (authoredExportAliases.get(imported.exportName) ?? null)
            : authoredSourceScope,
        );
        if (scopeDepth === 0) {
          continue;
        }

        const candidate: CanonicalExampleExportCandidate = {
          component_id: component.id,
          export_name: imported.exportName,
          example_id: example.id,
          source_locator:
            example.source_url !== null
              ? {
                  source_url: example.source_url,
                  source_path: null,
                }
              : {
                  source_url: null,
                  source_path: example.source_path,
                },
          score: scopeDepth * 2 + (isAuthoredExportAlias ? 1 : 0),
        };
        const current = candidatesByKey.get(key);
        if (current) {
          current.push(candidate);
        } else {
          candidatesByKey.set(key, [candidate]);
        }
      }
    }
  }

  const exportsByComponentId = new Map<
    string,
    ComponentCanonicalExampleExport[]
  >();
  for (const candidates of candidatesByKey.values()) {
    const bestScore = Math.max(
      ...candidates.map((candidate) => candidate.score),
    );
    const strongestCandidates = candidates.filter(
      (candidate) => candidate.score === bestScore,
    );
    const ownerIds = new Set(
      strongestCandidates.map((candidate) => candidate.component_id),
    );
    if (ownerIds.size !== 1) {
      throw new Error(
        `Canonical example export '${strongestCandidates[0]?.export_name}' has ambiguous component owners: ${[...ownerIds].join(", ")}.`,
      );
    }

    const selected = [...strongestCandidates].sort((left, right) =>
      compareOrdinalStrings(
        `${left.example_id}:${left.export_name}`,
        `${right.example_id}:${right.export_name}`,
      ),
    )[0];
    const component = components.find(
      (candidate) => candidate.id === selected.component_id,
    );
    if (!component) {
      throw new Error(
        `Canonical example export owner '${selected.component_id}' is missing.`,
      );
    }
    let graphPromise = exportGraphs.get(component.package.name);
    if (!graphPromise) {
      graphPromise = buildPackageValueExportGraph(
        repoRoot,
        component.package.name,
      );
      exportGraphs.set(component.package.name, graphPromise);
    }
    const repoPath = resolveUniquePackageValueExport(
      await graphPromise,
      selected.export_name,
    );
    const componentExports = exportsByComponentId.get(selected.component_id);
    const canonicalExport = {
      export_name: selected.export_name,
      example_id: selected.example_id,
      ...selected.source_locator,
      export_repo_path: repoPath,
    };
    if (componentExports) {
      componentExports.push(canonicalExport);
    } else {
      exportsByComponentId.set(selected.component_id, [canonicalExport]);
    }
  }

  return components.map((component) => {
    const canonicalExports = exportsByComponentId.get(component.id);
    if (!canonicalExports || canonicalExports.length === 0) {
      const record = { ...component };
      delete record.canonical_example_exports;
      return record;
    }

    return {
      ...component,
      canonical_example_exports: canonicalExports.sort((left, right) =>
        compareOrdinalStrings(left.export_name, right.export_name),
      ),
    };
  });
}

async function extractComponentSourceAccessibilitySignals(
  repoRoot: string,
  sourceRepoPath: string | null,
): Promise<AccessibilityImplementationSignal[]> {
  const sourceFiles = await readComponentSourceFiles(repoRoot, sourceRepoPath);
  return collectSourceAccessibilitySignals(sourceFiles);
}

function parseLivePreviewTags(mdx: string): Array<{
  componentName: string;
  exampleName: string;
  title: string;
  description: string;
}> {
  const lines = mdx.split(/\r?\n/);
  const examples: Array<{
    componentName: string;
    exampleName: string;
    title: string;
    description: string;
  }> = [];
  let currentHeading = "";
  let livePreviewBuffer: string[] | null = null;
  let descriptionLines: string[] = [];

  const flushLivePreviewBuffer = (): void => {
    if (!livePreviewBuffer) {
      return;
    }

    const livePreviewTag = livePreviewBuffer.join(" ");
    livePreviewBuffer = null;

    const componentNameMatch = livePreviewTag.match(/componentName="([^"]+)"/);
    const exampleNameMatch = livePreviewTag.match(/exampleName="([^"]+)"/);
    if (!componentNameMatch || !exampleNameMatch) {
      descriptionLines = [];
      return;
    }

    const displayNameMatch = livePreviewTag.match(/displayName="([^"]+)"/);
    const rawDescription = descriptionLines.join(" ");
    const description = cleanMarkdownText(rawDescription).slice(0, 500);
    descriptionLines = [];
    examples.push({
      componentName: componentNameMatch[1],
      exampleName: exampleNameMatch[1],
      title: displayNameMatch?.[1] ?? (currentHeading || exampleNameMatch[1]),
      description,
    });
  };

  for (const line of lines) {
    if (livePreviewBuffer) {
      livePreviewBuffer.push(line.trim());
      if (/\/>\s*$/.test(line)) {
        flushLivePreviewBuffer();
      }
      continue;
    }

    const headingMatch = line.trim().match(/^#{2,4}\s+(.+)$/);
    if (headingMatch) {
      currentHeading = cleanMarkdownText(headingMatch[1]);
      descriptionLines = [];
      continue;
    }

    if (!line.includes("<LivePreview")) {
      const trimmed = line.trim();
      if (
        trimmed.length > 0 &&
        !trimmed.startsWith("```") &&
        !trimmed.startsWith("{/*")
      ) {
        descriptionLines.push(trimmed);
      }
      continue;
    }

    livePreviewBuffer = [line.trim()];
    if (/\/>\s*$/.test(line)) {
      flushLivePreviewBuffer();
    }
  }

  flushLivePreviewBuffer();
  return examples;
}

export async function extractPackages(
  repoRoot: string,
  excludedPackageNames: ReadonlySet<string>,
): Promise<PackageRecord[]> {
  const packageManifestPaths = (
    await globCatalogInputs(
      "packages/{ag-grid-theme,core,countries,date-adapters,date-components,embla-carousel,highcharts-theme,icons,lab,react-resizable-panels-theme,styles,theme,window}/package.json",
      {
        cwd: repoRoot,
        absolute: true,
        onlyFiles: true,
      },
    )
  ).sort(compareOrdinalStrings);

  const packages: PackageRecord[] = [];

  for (const manifestPath of packageManifestPaths) {
    const manifestRaw = await readFileOrNull(manifestPath);
    if (!manifestRaw) {
      continue;
    }

    const manifest = JSON.parse(manifestRaw) as {
      name?: unknown;
      version?: unknown;
      description?: unknown;
      private?: unknown;
    };

    const packageName = asString(manifest.name);
    if (!packageName || !packageName.startsWith("@salt-ds/")) {
      continue;
    }
    if (manifest.private === true || excludedPackageNames.has(packageName)) {
      continue;
    }

    const packageVersion = asString(manifest.version) ?? "0.0.0";
    const packageDir = path.dirname(manifestPath);
    const changelogPath = path.join(packageDir, "CHANGELOG.md");
    const hasChangelog = await readFileOrNull(changelogPath);

    packages.push({
      id: `package.${toKebabCase(packageName)}`,
      name: packageName,
      status: inferStatusFromPackage(packageName, packageVersion),
      version: packageVersion,
      summary:
        asString(manifest.description) ??
        `${packageName} package in Salt Design System.`,
      source_root: toPosixPath(path.relative(repoRoot, packageDir)),
      changelog_path: hasChangelog
        ? toPosixPath(path.relative(repoRoot, changelogPath))
        : null,
      docs_root: inferDocsRoot(packageName),
    });
  }

  return packages.sort((left, right) =>
    compareOrdinalStrings(left.name, right.name),
  );
}

const INTENT_STOPWORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "by",
  "can",
  "for",
  "from",
  "has",
  "have",
  "if",
  "in",
  "is",
  "it",
  "its",
  "of",
  "on",
  "or",
  "such",
  "that",
  "the",
  "this",
  "to",
  "use",
  "was",
  "when",
  "will",
  "with",
  "you",
  "your",
]);

function deriveExampleIntent(title: string, description: string): string[] {
  const intents = [title.toLowerCase()];

  if (!description) {
    return uniqueStrings(intents);
  }

  const propMatches = [
    ...description.matchAll(/`([a-zA-Z][a-zA-Z0-9]*(?:=[{"][^`]*)?)`/g),
  ]
    .map((match) => match[1].split("=")[0].trim().toLowerCase())
    .filter((prop) => prop.length >= 2);

  intents.push(...propMatches);

  const words = description
    .toLowerCase()
    .replace(/`[^`]*`/g, "")
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length >= 4 && !INTENT_STOPWORDS.has(word));

  const wordFrequency = new Map<string, number>();
  for (const word of words) {
    wordFrequency.set(word, (wordFrequency.get(word) ?? 0) + 1);
  }

  const topWords = [...wordFrequency.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, 8)
    .map(([word]) => word);

  intents.push(...topWords);

  return uniqueStrings(intents).slice(0, 15);
}

function inferExampleComplexity(code: string): ExampleRecord["complexity"] {
  if (!code) {
    return "basic";
  }

  const lines = code.split(/\r?\n/).filter((line) => line.trim().length > 0);
  const importCount = lines.filter((line) => /^\s*import\b/.test(line)).length;
  const hasState = /\buseState\b/.test(code);
  const hasEffect = /\buseEffect\b/.test(code);
  const hasRef = /\buseRef\b/.test(code);
  const hasCallback = /\buseCallback\b|\buseMemo\b/.test(code);
  const hookCount =
    (hasState ? 1 : 0) +
    (hasEffect ? 1 : 0) +
    (hasRef ? 1 : 0) +
    (hasCallback ? 1 : 0);

  if (lines.length > 80 || importCount > 8 || hookCount >= 3) {
    return "advanced";
  }

  if (lines.length > 30 || importCount > 4 || hookCount >= 1) {
    return "intermediate";
  }

  return "basic";
}

async function extractComponentExamples(
  repoRoot: string,
  examplesMdx: string | null,
  packageName: string,
  componentName: string,
): Promise<ExampleRecord[]> {
  if (!examplesMdx) {
    return [];
  }

  const previews = parseLivePreviewTags(examplesMdx);
  const examples: ExampleRecord[] = [];

  for (const preview of previews) {
    const examplePath = path.join(
      repoRoot,
      "site/src/examples",
      preview.componentName,
      `${preview.exampleName}.tsx`,
    );

    const sourceCode = await readFileOrNull(examplePath);
    if (sourceCode === null) {
      throw new Error(
        `Missing component example source ${toPosixPath(
          path.relative(repoRoot, examplePath),
        )}.`,
      );
    }
    examples.push({
      id: `${preview.componentName}.${toKebabCase(preview.exampleName)}`,
      title: preview.title,
      description: preview.description,
      intent: deriveExampleIntent(preview.title, preview.description),
      complexity: inferExampleComplexity(sourceCode),
      code: sourceCode,
      source_url: null,
      source_path: toPosixPath(path.relative(repoRoot, examplePath)),
      package: packageName,
      target_type: "component",
      target_name: componentName,
    });
  }

  return examples;
}

interface ComponentCategoryMapEntry {
  route: string;
  category: string;
  secondaryCategories?: string[];
}

function normalizeComponentCategoryLabel(label: string): string {
  const normalized = toKebabCase(label);
  return normalized === "data-entry" ? "inputs" : normalized;
}

async function loadComponentCategoryMap(repoRoot: string): Promise<
  Map<
    string,
    {
      categoryIds: string[];
      categoryLabels: string[];
    }
  >
> {
  const categoryMapPath = path.join(
    repoRoot,
    "site/component-category-map.json",
  );
  const source = await readFileOrNull(categoryMapPath);
  if (!source) {
    throw new Error("Missing site/component-category-map.json.");
  }

  const parsed = JSON.parse(source) as {
    meta?: {
      componentCount?: unknown;
    };
    components?: Record<string, ComponentCategoryMapEntry>;
  };
  const entries = Object.values(parsed.components ?? {});
  if (
    !Number.isInteger(parsed.meta?.componentCount) ||
    parsed.meta?.componentCount !== entries.length
  ) {
    throw new Error(
      `Component category map count '${String(
        parsed.meta?.componentCount,
      )}' does not match its ${entries.length} component entries.`,
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
      throw new Error(`Duplicate component category route '${route}'.`);
    }
    const categoryLabels = [
      entry.category,
      ...(entry.secondaryCategories ?? []),
    ].filter((value) => value.length > 0);

    byRoute.set(route, {
      categoryIds: uniqueStrings(
        categoryLabels.map((label) => normalizeComponentCategoryLabel(label)),
      ),
      categoryLabels: uniqueStrings(categoryLabels),
    });
  }

  return byRoute;
}

function extractImplementationRequirements(
  usageContent: string | null,
  componentRoute: string,
): ComponentImplementationRequirements | undefined {
  if (!usageContent) {
    return undefined;
  }

  const importSection = parseMarkdownSections(usageContent, 2).find(
    (section) => section.title.toLowerCase() === "import",
  );
  if (!importSection) {
    return undefined;
  }

  const sourceUrl = `${componentRoute}/usage`;
  const requiredImports = uniqueStrings(
    extractFencedCodeBlocks(importSection.content).flatMap((block) =>
      [...block.code.matchAll(/^\s*import\s+["']([^"']+\.css)["'];?\s*$/gm)]
        .map((match) => match[1])
        .filter((specifier) => specifier.length > 0),
    ),
  ).map((specifier) => ({
    kind: "css" as const,
    specifier,
    statement: `import "${specifier}";`,
    source_url: sourceUrl,
  }));

  return requiredImports.length > 0
    ? {
        required_imports: requiredImports,
      }
    : undefined;
}

export async function extractComponents(
  repoRoot: string,
  packageByName: Map<string, PackageRecord>,
  propMetadata: PropMetadata,
): Promise<ComponentRecord[]> {
  const componentIndexPaths = (
    await globCatalogInputs("site/docs/components/**/index.mdx", {
      cwd: repoRoot,
      absolute: true,
      onlyFiles: true,
    })
  ).sort(compareOrdinalStrings);

  const componentCategoryByRoute = await loadComponentCategoryMap(repoRoot);
  const consumedCategoryRoutes = new Set<string>();
  const components: ComponentRecord[] = [];
  const exportGraphs = new Map<string, Promise<PackageValueExportGraph>>();
  const authoredSourceScopeByComponentId = new Map<string, string | null>();
  const authoredExportAliasesByComponentId = new Map<
    string,
    ReadonlyMap<string, string | null>
  >();

  for (const componentIndexPath of componentIndexPaths) {
    const indexContent = await readFileOrNull(componentIndexPath);
    if (!indexContent) {
      continue;
    }

    const parsed = parseYamlFrontmatter(indexContent);
    if (asString(parsed.data.layout) !== "DetailComponent") {
      continue;
    }

    const title = asString(parsed.data.title);
    if (!title) {
      continue;
    }

    const componentDir = path.dirname(componentIndexPath);
    const routeSuffix = toPosixPath(
      path.relative(path.join(repoRoot, "site/docs/components"), componentDir),
    );
    if (routeSuffix === "." || routeSuffix === "") {
      continue;
    }

    const data = parsed.data.data as Record<string, unknown> | undefined;
    const packageData = data?.package as Record<string, unknown> | undefined;
    const sourceCodeUrl = asString(data?.sourceCodeUrl);
    const sourceRepoPath = parseSourceRepoPath(sourceCodeUrl);
    if (sourceCodeUrl && !sourceRepoPath) {
      throw new Error(
        `Component '${title}' has a non-canonical Salt sourceCodeUrl '${sourceCodeUrl}'.`,
      );
    }
    const packageNameFromDocs = asString(packageData?.name);
    const packageNameFromSource = parsePackageNameFromRepoPath(sourceRepoPath);
    const packageName = packageNameFromDocs ?? packageNameFromSource;
    if (!packageName) {
      throw new Error(
        `Unable to determine package for component '${title}' at ${toPosixPath(path.relative(repoRoot, componentIndexPath))}. Add data.package.name or sourceCodeUrl.`,
      );
    }

    const packageRecord = packageByName.get(packageName);
    if (!packageRecord) {
      throw new Error(
        `Unknown package '${packageName}' for component '${title}'.`,
      );
    }

    const description =
      asString(data?.description) ?? extractFirstParagraph(parsed.content);

    const componentRoute = assertCanonicalSiteRoute(
      `/salt/components/${routeSuffix}`,
    );
    const categoryRecord = componentCategoryByRoute.get(componentRoute);
    if (!categoryRecord) {
      throw new Error(
        `Missing component category map entry for '${title}' (${componentRoute}).`,
      );
    }
    consumedCategoryRoutes.add(componentRoute);
    if (data != null && Object.hasOwn(data, "componentExportAliases")) {
      throw new Error(
        `Component '${title}' must not declare data.componentExportAliases; configure exceptional code bindings in the MCP-owned component override map.`,
      );
    }
    const componentExportAliases = resolveComponentExportAliases(
      title,
      componentExportAliasOverrides(componentRoute),
      sourceRepoPath,
      packageName,
    );
    const aliases = uniqueStrings([
      ...asStringArray(data?.alsoKnownAs),
      ...componentExportAliases.map((alias) => alias.exportName),
    ]);
    const usageContent = await readFileOrNull(
      path.join(componentDir, "usage.mdx"),
    );
    const accessibilityContent = await readFileOrNull(
      path.join(componentDir, "accessibility.mdx"),
    );
    const examplesMdx = await readFileOrNull(
      path.join(componentDir, "examples.mdx"),
    );
    if (data != null && Object.hasOwn(data, "primaryExport")) {
      throw new Error(
        `Component '${title}' must not declare data.primaryExport; configure exceptional code bindings in the MCP-owned component override map.`,
      );
    }
    const primaryExportOverride =
      componentPrimaryExportOverride(componentRoute);
    const primaryExportName = primaryExportOverride.configured
      ? primaryExportOverride.value
      : toPascalCase(title);
    const docgenSelection = selectDocgenComponent(
      propMetadata,
      packageName,
      title,
      aliases,
      routeSuffix,
      sourceRepoPath,
      primaryExportName,
    );
    const props = toComponentProps(docgenSelection.candidate?.props);
    const exampleRecords = await extractComponentExamples(
      repoRoot,
      examplesMdx,
      packageName,
      title,
    );

    // Extract source-declared sub-components. Example occurrence is evidence,
    // never a normative required-child contract.
    const rootDisplayName =
      docgenSelection.inference.selected_display_name ?? toPascalCase(title);
    const resolvedPrimaryExportName = primaryExportName;
    const suppressSingleExportInference = primaryExportName === null;
    const prefixSubComponents = suppressSingleExportInference
      ? []
      : selectSubComponents(propMetadata, packageName, rootDisplayName);
    let subComponents = suppressSingleExportInference
      ? []
      : prefixSubComponents.length > 0
        ? prefixSubComponents
        : selectSubComponentsBySourceExports(
            propMetadata,
            packageName,
            rootDisplayName,
            sourceRepoPath,
            repoRoot,
          );
    let primarySourceRepoPath = sourceRepoPath;
    let exportGraph: PackageValueExportGraph | null = null;
    if (
      resolvedPrimaryExportName ||
      subComponents.length > 0 ||
      componentExportAliases.length > 0 ||
      props.length > 0
    ) {
      let exportGraphPromise = exportGraphs.get(packageName);
      if (!exportGraphPromise) {
        exportGraphPromise = buildPackageValueExportGraph(
          repoRoot,
          packageName,
        );
        exportGraphs.set(packageName, exportGraphPromise);
      }
      exportGraph = await exportGraphPromise;
      primarySourceRepoPath = resolvedPrimaryExportName
        ? resolveUniquePackageValueExport(
            exportGraph,
            resolvedPrimaryExportName,
          )
        : sourceRepoPath;
      if (
        sourceRepoPath &&
        primarySourceRepoPath &&
        primarySourceRepoPath !== sourceRepoPath &&
        !primarySourceRepoPath.startsWith(`${sourceRepoPath}/`)
      ) {
        throw new Error(
          `Component '${title}' primary export '${resolvedPrimaryExportName}' resolves to '${primarySourceRepoPath}', outside its authored sourceCodeUrl path '${sourceRepoPath}'.`,
        );
      }
      for (const exportAlias of componentExportAliases) {
        if (
          canonicalExportSourceScopeDepth(
            exportGraph,
            exportAlias.exportName,
            exportAlias.sourceRepoPath,
          ) === 0
        ) {
          throw new Error(
            `Component '${title}' export alias '${exportAlias.exportName}' is not a unique public value export within its MCP source path '${exportAlias.sourceRepoPath}'.`,
          );
        }
      }
      const authoredExportAliasScopes = new Map(
        componentExportAliases.map((alias) => [
          alias.exportName,
          alias.sourceRepoPath,
        ]),
      );
      subComponents = subComponents.filter(
        (subComponent) =>
          canonicalExportSourceScopeDepth(
            exportGraph as PackageValueExportGraph,
            subComponent.export_name,
            authoredExportAliasScopes.has(subComponent.export_name)
              ? (authoredExportAliasScopes.get(subComponent.export_name) ??
                  null)
              : sourceRepoPath,
          ) > 0,
      );
    }
    const resolvedSubComponents = subComponents.map((subComponent) => ({
      ...subComponent,
      repo_path: resolveUniquePackageValueExport(
        exportGraph as PackageValueExportGraph,
        subComponent.export_name,
      ),
    }));
    const propSubjects = exportGraph
      ? toComponentPropSubjects(
          docgenSelection.candidate?.props,
          repoRoot,
          exportGraph,
          ".",
        )
      : [];

    const relatedPatterns = asStringArray(data?.relatedPatterns);
    const whenToUse = parseSectionStatements(usageContent, "When to use");
    const whenNotToUse = parseSectionStatements(
      usageContent,
      "When not to use",
    );
    const structuredGuidance = parseStructuredGuidanceCallouts(usageContent);
    const semantics = buildUsageSemantics({
      category: categoryRecord.categoryIds,
      preferred_for: [...whenToUse, ...structuredGuidance.preferred],
      not_for: [...whenNotToUse, ...structuredGuidance.avoid],
      derived_from: [
        "component-category-map",
        "usage-docs",
        ...(structuredGuidance.preferred.length > 0 ||
        structuredGuidance.avoid.length > 0
          ? (["usage-callouts"] as const)
          : []),
      ],
    });
    const retrievalSignals = buildRetrievalSignals({
      caution_statements: [...whenNotToUse, ...structuredGuidance.avoid],
    });
    const implementationRequirements = extractImplementationRequirements(
      usageContent,
      componentRoute,
    );
    const relatedComponents = Array.isArray(data?.relatedComponents)
      ? (data?.relatedComponents as Array<Record<string, unknown>>)
      : [];

    const alternatives = relatedComponents
      .map((component) => {
        const name = asString(component.name);
        const relationship = asString(component.relationship) ?? "related";
        if (!name) {
          return null;
        }

        return {
          use: name,
          reason: `Related component (${relationship}).`,
        };
      })
      .filter((item): item is { use: string; reason: string } => item !== null);

    const docsAccessibilitySummaries =
      parseAccessibilitySummaryStatements(accessibilityContent);
    const sourceAccessibilitySignals =
      await extractComponentSourceAccessibilitySignals(
        repoRoot,
        sourceRepoPath,
      );

    const componentId = `component.${toKebabCase(title)}`;
    authoredSourceScopeByComponentId.set(componentId, sourceRepoPath);
    authoredExportAliasesByComponentId.set(
      componentId,
      new Map(
        componentExportAliases.map((alias) => [
          alias.exportName,
          alias.sourceRepoPath,
        ]),
      ),
    );
    components.push({
      id: componentId,
      name: title,
      aliases,
      package: {
        name: packageName,
        status: packageRecord.status,
        // The current package version is not evidence that this component was
        // introduced in that release. Keep historical availability unknown.
        since: null,
      },
      summary: cleanMarkdownText(description),
      status: packageRecord.status,
      category: categoryRecord.categoryIds,
      tags: uniqueStrings([
        ...aliases.map((alias) => alias.toLowerCase()),
        ...categoryRecord.categoryLabels.map((label) => label.toLowerCase()),
        ...relatedPatterns.map((pattern) => pattern.toLowerCase()),
      ]),
      when_to_use: whenToUse,
      when_not_to_use: whenNotToUse,
      alternatives,
      props,
      prop_subjects: propSubjects,
      sub_components:
        resolvedSubComponents.length > 0 ? resolvedSubComponents : undefined,
      accessibility: {
        summary: docsAccessibilitySummaries,
        rules: [],
        implementation_signals: sourceAccessibilitySignals,
      },
      patterns: relatedPatterns,
      deprecations: [],
      examples: exampleRecords,
      ...(implementationRequirements
        ? { implementation_requirements: implementationRequirements }
        : {}),
      related_docs: {
        overview: componentRoute,
        usage: usageContent ? `${componentRoute}/usage` : null,
        accessibility: accessibilityContent
          ? `${componentRoute}/accessibility`
          : null,
        examples: examplesMdx ? `${componentRoute}/examples` : null,
      },
      semantics,
      retrieval_signals: retrievalSignals,
      source: {
        repo_path: primarySourceRepoPath,
        export_name: resolvedPrimaryExportName,
      },
      inference: {
        docgen: docgenSelection.inference,
      },
      last_verified_at: null,
    });
  }

  const orphanCategoryRoutes = [...componentCategoryByRoute.keys()].filter(
    (route) => !consumedCategoryRoutes.has(route),
  );
  if (orphanCategoryRoutes.length > 0) {
    throw new Error(
      `Component category map contains routes without DetailComponent docs: ${orphanCategoryRoutes.join(
        ", ",
      )}.`,
    );
  }

  return attachCanonicalExampleExports(
    repoRoot,
    components.sort((left, right) =>
      compareOrdinalStrings(left.name, right.name),
    ),
    exportGraphs,
    authoredSourceScopeByComponentId,
    authoredExportAliasesByComponentId,
  );
}
