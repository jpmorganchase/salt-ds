import fs from "node:fs/promises";
import path from "node:path";
import {
  REGISTRY_ARRAY_ARTIFACTS,
  REGISTRY_METADATA_ARTIFACT,
  REGISTRY_PAGE_SEARCH_INDEX_ARTIFACT,
  REGISTRY_SEARCH_INDEX_ARTIFACT,
  type RegistryArrayCollections,
  serializeJsonLines,
  writeJsonFile,
} from "../registry/artifacts.js";
import { findSaltRepoRoot, getPackageRoot } from "../registry/paths.js";
import { buildSerializedPageSearchIndex } from "../search/pageSearchIndex.js";
import type { BuildRegistryOptions, SaltRegistry } from "../types.js";
import { extractCountrySymbols, extractIcons } from "./buildRegistryAssets.js";
import { buildRegistryBuildInfo } from "./buildRegistryBuildInfo.js";
import { extractChanges } from "./buildRegistryChanges.js";
import { linkDeprecationsToComponents } from "./buildRegistryComponentDeprecations.js";
import {
  extractComponents,
  extractPackages,
} from "./buildRegistryComponents.js";
import { extractDeprecations } from "./buildRegistryDeprecations.js";
import { loadPropMetadata } from "./buildRegistryDocgen.js";
import { extractGuides, extractPages } from "./buildRegistryDocs.js";
import {
  createPatternNameBySlug,
  extractPatternExamplesFromStories,
  extractPatterns,
} from "./buildRegistryPatterns.js";
import {
  extractTokens,
  linkTokensToComponents,
} from "./buildRegistryTokens.js";
import { buildSearchIndex } from "./buildSearchIndex.js";

const REGISTRY_VERSION = "0.1.0";
const EXCLUDED_REGISTRY_PACKAGES = new Set(["@salt-ds/mcp"]);

export async function buildRegistry(
  options: BuildRegistryOptions = {},
): Promise<SaltRegistry> {
  const packageRoot = getPackageRoot(import.meta.url);
  const requestedSourceRoot = options.sourceRoot
    ? path.resolve(options.sourceRoot)
    : null;
  const sourceRoot =
    requestedSourceRoot ??
    (await findSaltRepoRoot(process.cwd())) ??
    process.cwd();
  const outputDir =
    options.outputDir != null
      ? path.resolve(options.outputDir)
      : path.join(packageRoot, "generated");
  const generatedAt = options.timestamp ?? new Date().toISOString();
  const version = options.version ?? REGISTRY_VERSION;
  const buildInfo = await buildRegistryBuildInfo(sourceRoot);

  const packages = await extractPackages(
    sourceRoot,
    EXCLUDED_REGISTRY_PACKAGES,
  );
  const propMetadata = await loadPropMetadata(sourceRoot);
  const packageByName = new Map(packages.map((pkg) => [pkg.name, pkg]));
  const components = await extractComponents(
    sourceRoot,
    packageByName,
    propMetadata,
    generatedAt,
  );
  const [patterns, guides, rawTokens, rawDeprecations, changes] =
    await Promise.all([
      extractPatterns(sourceRoot, generatedAt),
      extractGuides(sourceRoot, generatedAt),
      extractTokens(sourceRoot, generatedAt),
      extractDeprecations(sourceRoot, packages, EXCLUDED_REGISTRY_PACKAGES),
      extractChanges(sourceRoot, packages, components, generatedAt),
    ]);
  const pages = await extractPages(sourceRoot, generatedAt);
  const patternStoryExamples = await extractPatternExamplesFromStories(
    sourceRoot,
    createPatternNameBySlug(patterns),
  );
  const enrichedPatternMap = new Map(
    patterns.map((pattern) => [pattern.name, pattern] as const),
  );
  for (const example of patternStoryExamples) {
    const pattern = enrichedPatternMap.get(example.target_name);
    if (!pattern) {
      continue;
    }

    pattern.examples = [...pattern.examples, example].sort((left, right) =>
      left.id.localeCompare(right.id),
    );
  }
  const enrichedPatterns = [...enrichedPatternMap.values()];
  const linkedTokens = await linkTokensToComponents(
    sourceRoot,
    components,
    rawTokens,
  );
  const linkedDeprecations = linkDeprecationsToComponents(
    linkedTokens.components,
    rawDeprecations,
  );
  const enrichedComponents = linkedDeprecations.components;
  const icons = await extractIcons(
    sourceRoot,
    packageByName,
    linkedDeprecations.deprecations,
    generatedAt,
  );
  const country_symbols = await extractCountrySymbols(
    sourceRoot,
    packageByName,
    linkedDeprecations.deprecations,
    generatedAt,
  );
  const tokens = linkedTokens.tokens;
  const deprecations = linkedDeprecations.deprecations;

  const componentExamples = enrichedComponents.flatMap(
    (component) => component.examples,
  );
  const patternExamples = enrichedPatterns.flatMap(
    (pattern) => pattern.examples,
  );
  const examples = [...componentExamples, ...patternExamples].sort(
    (left, right) => left.id.localeCompare(right.id),
  );
  const registryArrays: RegistryArrayCollections = {
    packages,
    components: enrichedComponents,
    icons,
    country_symbols,
    pages,
    patterns: enrichedPatterns,
    guides,
    tokens,
    deprecations,
    examples,
    changes,
  };

  const baseRegistry = {
    generated_at: generatedAt,
    version,
    build_info: buildInfo,
    ...registryArrays,
  };

  const search_index = buildSearchIndex(baseRegistry);
  const page_search_index = buildSerializedPageSearchIndex(pages);
  const registry: SaltRegistry = {
    ...baseRegistry,
    search_index,
  };

  await fs.mkdir(outputDir, { recursive: true });

  await Promise.all([
    ...REGISTRY_ARRAY_ARTIFACTS.map((definition) =>
      writeJsonFile(path.join(outputDir, definition.file_name), {
        generated_at: generatedAt,
        version,
        [definition.key]: registryArrays[definition.key],
      }),
    ),
    writeJsonFile(path.join(outputDir, REGISTRY_METADATA_ARTIFACT.file_name), {
      generated_at: generatedAt,
      version,
      [REGISTRY_METADATA_ARTIFACT.key]: buildInfo,
    }),
    writeJsonFile(
      path.join(outputDir, REGISTRY_PAGE_SEARCH_INDEX_ARTIFACT.file_name),
      {
        generated_at: generatedAt,
        version,
        [REGISTRY_PAGE_SEARCH_INDEX_ARTIFACT.key]: page_search_index,
      },
    ),
    fs.writeFile(
      path.join(outputDir, REGISTRY_SEARCH_INDEX_ARTIFACT.file_name),
      serializeJsonLines(search_index),
      "utf8",
    ),
  ]);

  return registry;
}
