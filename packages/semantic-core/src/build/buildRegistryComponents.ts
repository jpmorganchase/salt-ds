import path from "node:path";
import fg from "fast-glob";
import matter from "gray-matter";
import { toPosixPath } from "../registry/paths.js";
import type {
  AccessibilityRule,
  ComponentComposition,
  ComponentRecord,
  ComponentSubComponent,
  ExampleRecord,
  PackageRecord,
  SaltStatus,
} from "../types.js";
import {
  type PropMetadata,
  selectDocgenComponent,
  selectSubComponents,
  selectSubComponentsBySourceExports,
  toComponentProps,
} from "./buildRegistryDocgen.js";
import {
  extractFirstParagraph,
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
  toPascalCase,
  uniqueStrings,
} from "./buildRegistryShared.js";

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

  const normalized = sourceCodeUrl.replace(/\\/g, "/");
  const branchPathMatch = normalized.match(/\/(?:blob|tree)\/[^/]+\/(.+)$/);
  if (!branchPathMatch) {
    return null;
  }

  return branchPathMatch[1];
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
    await fg("packages/*/package.json", {
      cwd: repoRoot,
      absolute: true,
      onlyFiles: true,
    })
  ).sort((left, right) => left.localeCompare(right));

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
    };

    const packageName = asString(manifest.name);
    if (!packageName || !packageName.startsWith("@salt-ds/")) {
      continue;
    }
    if (excludedPackageNames.has(packageName)) {
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

  return packages.sort((left, right) => left.name.localeCompare(right.name));
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
  componentRoute: string,
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
    examples.push({
      id: `${preview.componentName}.${toKebabCase(preview.exampleName)}`,
      title: preview.title,
      description: preview.description,
      intent: deriveExampleIntent(preview.title, preview.description),
      complexity: inferExampleComplexity(sourceCode ?? ""),
      code: sourceCode ?? "",
      source_url: `${componentRoute}/examples`,
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

function normalizeComponentDocsRoute(route: string): string {
  return route.replace(/\/index$/, "");
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
    components?: Record<string, ComponentCategoryMapEntry>;
  };
  const byRoute = new Map<
    string,
    {
      categoryIds: string[];
      categoryLabels: string[];
    }
  >();

  for (const entry of Object.values(parsed.components ?? {})) {
    const categoryLabels = [
      entry.category,
      ...(entry.secondaryCategories ?? []),
    ].filter((value) => value.length > 0);

    byRoute.set(normalizeComponentDocsRoute(entry.route), {
      categoryIds: uniqueStrings(
        categoryLabels.map((label) => normalizeComponentCategoryLabel(label)),
      ),
      categoryLabels: uniqueStrings(categoryLabels),
    });
  }

  return byRoute;
}

/**
 * Suffixes that indicate a parent/wrapper component rather than a child.
 * These components wrap or group instances of the root component, so they
 * belong in `typical_parent` rather than `required_children`/`optional_children`.
 */
const PARENT_WRAPPER_SUFFIXES = /^(Group|Container|Provider|OverlayProvider)$/;

/**
 * Derive composition rules for a compound component from its sub-components
 * and example code. Sub-components whose names suggest structural roles
 * (Content, Panel, Body) are marked as required; Group/Container/Provider
 * entries are classified as typical parents instead of children.
 */
function deriveComposition(
  subComponents: ComponentSubComponent[],
  exampleRecords: ExampleRecord[],
): ComponentComposition | undefined {
  if (subComponents.length === 0) {
    return undefined;
  }

  // Separate parent wrappers from actual children.
  const parentWrappers: string[] = [];
  const childSubs: ComponentSubComponent[] = [];
  for (const sub of subComponents) {
    if (PARENT_WRAPPER_SUFFIXES.test(sub.name)) {
      parentWrappers.push(sub.export_name);
    } else {
      childSubs.push(sub);
    }
  }

  // If every sub-component is a parent wrapper, there are no children to compose.
  if (childSubs.length === 0) {
    return {
      typical_parent:
        parentWrappers.length === 1 ? parentWrappers[0] : undefined,
    };
  }

  // Names that strongly imply required structural children.
  const requiredSuffixes = new Set(["Content", "Panel", "Body"]);

  // Use the default/first example to check which child sub-components actually appear.
  const defaultExample = exampleRecords.find(
    (example) => example.title === "Default",
  );
  const exampleCode = defaultExample?.code ?? "";

  const requiredChildren: string[] = [];
  const optionalChildren: string[] = [];

  for (const sub of childSubs) {
    const appearsInDefault = exampleCode.includes(`<${sub.export_name}`);
    const isStructural = requiredSuffixes.has(sub.name);

    if (isStructural || appearsInDefault) {
      requiredChildren.push(sub.export_name);
    } else {
      optionalChildren.push(sub.export_name);
    }
  }

  // If nothing ended up required, promote everything that appears in
  // any example to required, rest to optional.
  if (requiredChildren.length === 0 && optionalChildren.length > 0) {
    const anyExampleCode = exampleRecords.map((e) => e.code).join("\n");
    for (const sub of childSubs) {
      if (anyExampleCode.includes(`<${sub.export_name}`)) {
        requiredChildren.push(sub.export_name);
      } else {
        optionalChildren.push(sub.export_name);
      }
    }
    optionalChildren.length = 0;
    for (const sub of childSubs) {
      if (!requiredChildren.includes(sub.export_name)) {
        optionalChildren.push(sub.export_name);
      }
    }
  }

  return {
    required_children:
      requiredChildren.length > 0 ? requiredChildren : undefined,
    optional_children:
      optionalChildren.length > 0 ? optionalChildren : undefined,
    typical_parent: parentWrappers.length === 1 ? parentWrappers[0] : undefined,
  };
}

export async function extractComponents(
  repoRoot: string,
  packageByName: Map<string, PackageRecord>,
  propMetadata: PropMetadata,
  verifiedAt: string,
): Promise<ComponentRecord[]> {
  const componentIndexPaths = (
    await fg("site/docs/components/**/index.mdx", {
      cwd: repoRoot,
      absolute: true,
      onlyFiles: true,
    })
  ).sort((left, right) => left.localeCompare(right));

  const componentCategoryByRoute = await loadComponentCategoryMap(repoRoot);
  const components: ComponentRecord[] = [];

  for (const componentIndexPath of componentIndexPaths) {
    const indexContent = await readFileOrNull(componentIndexPath);
    if (!indexContent) {
      continue;
    }

    const parsed = matter(indexContent);
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

    const componentRoute = `/salt/components/${routeSuffix}`;
    const categoryRecord = componentCategoryByRoute.get(
      normalizeComponentDocsRoute(componentRoute),
    );
    if (!categoryRecord) {
      throw new Error(
        `Missing component category map entry for '${title}' (${componentRoute}/index).`,
      );
    }
    const aliases = asStringArray(data?.alsoKnownAs);
    const usageContent = await readFileOrNull(
      path.join(componentDir, "usage.mdx"),
    );
    const accessibilityContent = await readFileOrNull(
      path.join(componentDir, "accessibility.mdx"),
    );
    const examplesMdx = await readFileOrNull(
      path.join(componentDir, "examples.mdx"),
    );
    const docgenSelection = selectDocgenComponent(
      propMetadata,
      packageName,
      title,
      aliases,
      routeSuffix,
      sourceRepoPath,
    );
    const props = toComponentProps(docgenSelection.candidate?.props);
    const exampleRecords = await extractComponentExamples(
      repoRoot,
      componentRoute,
      examplesMdx,
      packageName,
      title,
    );

    // Extract sub-components and derive composition rules for compound components.
    const rootDisplayName =
      docgenSelection.inference.selected_display_name ?? toPascalCase(title);
    const prefixSubComponents = selectSubComponents(
      propMetadata,
      packageName,
      rootDisplayName,
    );
    const subComponents =
      prefixSubComponents.length > 0
        ? prefixSubComponents
        : selectSubComponentsBySourceExports(
            propMetadata,
            packageName,
            rootDisplayName,
            sourceRepoPath,
            repoRoot,
          );
    const composition = deriveComposition(subComponents, exampleRecords);

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

    const accessibilityBestPractices = parseSectionStatements(
      accessibilityContent,
      "Best practices",
    );
    const accessibilityRules: AccessibilityRule[] =
      accessibilityBestPractices.map((ruleText, index) => ({
        id: `${toKebabCase(title)}-a11y-${index + 1}`,
        severity: "warning",
        rule: ruleText,
      }));

    components.push({
      id: `component.${toKebabCase(title)}`,
      name: title,
      aliases,
      package: {
        name: packageName,
        status: packageRecord.status,
        since: packageRecord.version,
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
      sub_components: subComponents.length > 0 ? subComponents : undefined,
      composition,
      accessibility: {
        summary: accessibilityBestPractices,
        rules: accessibilityRules,
      },
      patterns: relatedPatterns,
      deprecations: [],
      examples: exampleRecords,
      related_docs: {
        overview: componentRoute,
        usage: usageContent ? `${componentRoute}/usage` : null,
        accessibility: accessibilityContent
          ? `${componentRoute}/accessibility`
          : null,
        examples: examplesMdx ? `${componentRoute}/examples` : null,
      },
      semantics,
      source: {
        repo_path: sourceRepoPath,
        export_name: rootDisplayName,
      },
      inference: {
        docgen: docgenSelection.inference,
      },
      last_verified_at: verifiedAt,
    });
  }

  return components.sort((left, right) => left.name.localeCompare(right.name));
}
