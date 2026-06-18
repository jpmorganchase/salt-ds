import fs from "node:fs/promises";
import path from "node:path";
import { buildPatternValidationRulePack } from "../patternValidationRulePacks.js";
import {
  REGISTRY_ARRAY_ARTIFACTS,
  REGISTRY_CREATE_RETRIEVAL_INDEX_ARTIFACT,
  REGISTRY_ICON_LITE_ARTIFACT,
  REGISTRY_METADATA_ARTIFACT,
  REGISTRY_PAGE_SEARCH_INDEX_ARTIFACT,
  REGISTRY_PATTERN_VALIDATION_RULE_PACK_ARTIFACT,
  REGISTRY_SEARCH_INDEX_ARTIFACT,
  REGISTRY_TOKEN_POLICY_STRUCTURAL_ROLE_RULE_PACK_ARTIFACT,
  type RegistryArrayCollections,
  serializeJsonLines,
  writeJsonFile,
} from "../registry/artifacts.js";
import { findSaltRepoRoot, getPackageRoot } from "../registry/paths.js";
import { buildSerializedPageSearchIndex } from "../search/pageSearchIndex.js";
import { buildTokenPolicyStructuralRoleRulePack } from "../tokenPolicyStructuralRoleRules.js";
import { buildCreateRetrievalIndex } from "../tools/createRetrieval.js";
import type {
  BuildRegistryOptions,
  IconLiteRecord,
  IconRecord,
  SaltRegistry,
} from "../types.js";
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
import {
  extractFoundationExamples,
  extractGuides,
  extractPages,
} from "./buildRegistryDocs.js";
import {
  buildPatternCompositionContract,
  createPatternNameBySlug,
  derivePatternExampleAccessibilitySignals,
  derivePatternImplementationAccessibilitySignals,
  extractPatternExamplesFromStories,
  extractPatterns,
} from "./buildRegistryPatterns.js";
import { buildTokenPolicySourceRegistry } from "./buildRegistryTokenPolicy.js";
import {
  extractTokens,
  linkTokensToComponents,
} from "./buildRegistryTokens.js";
import { buildSearchIndex } from "./buildSearchIndex.js";

const REGISTRY_VERSION = "0.1.0";
const EXCLUDED_REGISTRY_PACKAGES = new Set([
  "@salt-ds/mcp",
  "@salt-ds/data-grid",
]);

function buildIconLiteRecords(icons: IconRecord[]): IconLiteRecord[] {
  return icons
    .map((icon) => ({
      name: icon.name,
      export_name: icon.source.export_name ?? icon.name,
      package: icon.package.name,
      status: icon.status,
      category: icon.category,
      variant: icon.variant,
      aliases: icon.aliases,
      synonyms: icon.synonyms,
    }))
    .sort((left, right) => left.name.localeCompare(right.name));
}

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
  const [buildInfo, packages, propMetadata, tokenPolicySources] =
    await Promise.all([
      buildRegistryBuildInfo(sourceRoot),
      extractPackages(sourceRoot, EXCLUDED_REGISTRY_PACKAGES),
      loadPropMetadata(sourceRoot),
      buildTokenPolicySourceRegistry(sourceRoot),
    ]);
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
      extractTokens(sourceRoot, generatedAt, tokenPolicySources),
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

  for (const pattern of enrichedPatternMap.values()) {
    let accessibilitySignals =
      derivePatternExampleAccessibilitySignals(pattern);
    if (accessibilitySignals.length === 0) {
      accessibilitySignals =
        await derivePatternImplementationAccessibilitySignals(
          sourceRoot,
          pattern,
        );
    }

    if (accessibilitySignals.length === 0) {
      continue;
    }

    pattern.accessibility.implementation_signals = accessibilitySignals;
  }

  // Re-derive composition_contract now that pattern-story examples are
  // merged into each pattern. The first pass (in extractPatterns) sees
  // only docs-derived examples; story code is the strongest signal for
  // classifying a composed component as `required`, so refining here
  // promotes optional → required for components that show up in a real
  // canonical story. Roadmap task 0.7(b).
  for (const pattern of enrichedPatternMap.values()) {
    const refined = buildPatternCompositionContract({
      composed_of: pattern.composed_of,
      starter_scaffold: pattern.starter_scaffold,
      examples: pattern.examples,
    });
    if (refined) {
      pattern.composition_contract = refined;
    }
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
  // Foundation examples are extracted from site/docs/foundations/** so
  // every public foundation page resolves through the same target_name
  // lookup as components and patterns. Required by the gold-standard
  // roadmap task 0.6 registry coverage spec and consumed by task 2.10
  // (theme-aware create_salt_ui). The records are not attached to any
  // component or pattern; they flow straight into examples.json.
  const foundationExamples = await extractFoundationExamples(sourceRoot);
  const examples = [
    ...componentExamples,
    ...patternExamples,
    ...foundationExamples,
  ].sort((left, right) => left.id.localeCompare(right.id));
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
  const create_retrieval_index = buildCreateRetrievalIndex(baseRegistry);
  const icons_lite = buildIconLiteRecords(icons);
  const page_search_index = buildSerializedPageSearchIndex(pages);
  const token_policy_structural_role_rule_pack =
    buildTokenPolicyStructuralRoleRulePack({
      structural_role_rules: tokenPolicySources.structural_role_rules,
      generated_at: generatedAt,
      generator: {
        name: "semantic-core buildRegistry",
      },
      registry: {
        version,
        generated_at: generatedAt,
      },
    });
  const pattern_validation_rule_pack = buildPatternValidationRulePack({
    registry: baseRegistry,
    generated_at: generatedAt,
    generator: {
      name: "semantic-core buildRegistry",
    },
  });
  const registry: SaltRegistry = {
    ...baseRegistry,
    search_index,
    create_retrieval_index,
    pattern_validation_rule_pack,
    token_policy_structural_role_rule_pack,
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
      path.join(outputDir, REGISTRY_ICON_LITE_ARTIFACT.file_name),
      JSON.stringify({
        generated_at: generatedAt,
        version,
        [REGISTRY_ICON_LITE_ARTIFACT.key]: icons_lite,
      }),
      "utf8",
    ),
    writeJsonFile(
      path.join(
        outputDir,
        REGISTRY_PATTERN_VALIDATION_RULE_PACK_ARTIFACT.file_name,
      ),
      {
        generated_at: generatedAt,
        version,
        [REGISTRY_PATTERN_VALIDATION_RULE_PACK_ARTIFACT.key]:
          pattern_validation_rule_pack,
      },
    ),
    writeJsonFile(
      path.join(
        outputDir,
        REGISTRY_TOKEN_POLICY_STRUCTURAL_ROLE_RULE_PACK_ARTIFACT.file_name,
      ),
      {
        generated_at: generatedAt,
        version,
        [REGISTRY_TOKEN_POLICY_STRUCTURAL_ROLE_RULE_PACK_ARTIFACT.key]:
          token_policy_structural_role_rule_pack,
      },
    ),
    fs.writeFile(
      path.join(outputDir, REGISTRY_SEARCH_INDEX_ARTIFACT.file_name),
      serializeJsonLines(search_index),
      "utf8",
    ),
    fs.writeFile(
      path.join(outputDir, REGISTRY_CREATE_RETRIEVAL_INDEX_ARTIFACT.file_name),
      serializeJsonLines(create_retrieval_index),
      "utf8",
    ),
  ]);

  return registry;
}
