import path from "node:path";
import {
  canonicalJson,
  compareOrdinalStrings,
} from "../catalog/catalogSerialization.js";
import { findSaltRepoRoot } from "../registry/paths.js";
import { buildTokenPolicyStructuralRoleRulePackBody } from "../tokenPolicyStructuralRoleRules.js";
import type { BuildRegistryOptions, SaltRegistry } from "../types.js";
import { extractCountrySymbols, extractIcons } from "./buildRegistryAssets.js";
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
  derivePatternExampleAccessibilitySignals,
  derivePatternImplementationAccessibilitySignals,
  extractPatterns,
} from "./buildRegistryPatterns.js";
import { buildTokenPolicySourceRegistry } from "./buildRegistryTokenPolicy.js";
import {
  extractTokens,
  linkTokensToComponents,
} from "./buildRegistryTokens.js";
import {
  assertGuideEditorialOverridesResolved,
  assertPatternEditorialOverridesResolved,
} from "./catalogEditorialOverrides.js";
import {
  CATALOG_INPUT_PATTERNS,
  type CatalogInputInventory,
  createCatalogInputInventory,
  validateCatalogInputPatterns,
  withCatalogInputTracking,
} from "./catalogInputInventory.js";
import { assertComponentAuthoringOverridesResolved } from "./componentAuthoringOverrides.js";
import { assertDeprecationMigrationOverridesResolved } from "./deprecationMigrationOverrides.js";
import { assertDeprecationValueMapOverridesResolved } from "./deprecationValueMapOverrides.js";
import {
  createSealedKnowledgeGeneratorDigest,
  type GeneratorDependencyInventory,
  type SealedKnowledgeGeneratorReceipt,
  withGeneratorDependencyInventory,
} from "./generatorDependencyInventory.js";
import {
  normalizeKnowledgeRecords,
  type NormalizedKnowledgeRecords,
} from "./normalizeKnowledgeRecords.js";

const REGISTRY_VERSION = "0.1.0";

export type ExtendedBuildRegistryOptions = BuildRegistryOptions & {
  inputInventory?: CatalogInputInventory;
  generatorDependencyInventory?: GeneratorDependencyInventory;
  generatorDependencySnapshotRoot?: string;
  generatorReceipt?: SealedKnowledgeGeneratorReceipt;
  assertGeneratorDependenciesStable?: () => Promise<void>;
};

export interface KnowledgeSourceBuild {
  registry: SaltRegistry;
  normalized: NormalizedKnowledgeRecords;
  inventory: CatalogInputInventory;
}

export type KnowledgeGeneratorCapability =
  | {
      mode: "sealed";
      dependencyInventory: GeneratorDependencyInventory;
      dependencySnapshotRoot: string;
      receipt: SealedKnowledgeGeneratorReceipt;
      assertStable: () => Promise<void>;
    }
  | {
      mode: "test";
    };

export function resolveKnowledgeGeneratorCapability(
  options: ExtendedBuildRegistryOptions,
  requestedSourceRoot: string | null,
): KnowledgeGeneratorCapability {
  const dependencyInventory = options.generatorDependencyInventory;
  if (dependencyInventory) {
    if (
      !requestedSourceRoot ||
      options.packageRoot === undefined ||
      options.outputDir === undefined ||
      options.packageVersion === undefined ||
      options.semanticInputPatterns === undefined ||
      options.compilerInputPatterns === undefined ||
      !options.generatorDependencySnapshotRoot ||
      !options.generatorReceipt ||
      !options.assertGeneratorDependenciesStable
    ) {
      throw new Error(
        "Sealed Knowledge generation requires explicit source/package/output roots, package version, semantic/compiler input patterns, a receipt, and a final dependency stability check.",
      );
    }
    if (options.generatorDigest !== undefined) {
      throw new Error(
        "Sealed Knowledge generation derives its digest from the receipt and rejects caller-supplied digests.",
      );
    }
    if (
      options.generatorVersion !== undefined &&
      /(?:^|-)test(?:-|$)/u.test(options.generatorVersion)
    ) {
      throw new Error(
        "Sealed Knowledge generation rejects test generator versions.",
      );
    }
    if (
      options.generatorReceipt.dependencies.sha256 !==
      dependencyInventory.digest
    ) {
      throw new Error(
        "Sealed generator receipt does not bind the active dependency inventory.",
      );
    }
    return {
      mode: "sealed",
      dependencyInventory,
      dependencySnapshotRoot: options.generatorDependencySnapshotRoot,
      receipt: options.generatorReceipt,
      assertStable: options.assertGeneratorDependenciesStable,
    };
  }
  if (
    options.generatorReceipt !== undefined ||
    options.generatorDependencySnapshotRoot !== undefined ||
    options.assertGeneratorDependenciesStable !== undefined
  ) {
    throw new Error(
      "A sealed generator receipt and stability check require the matching dependency inventory.",
    );
  }
  if (
    process.env.VITEST !== "true" ||
    (options.generatorVersion !== undefined &&
      !/(?:^|-)test(?:-|$)/u.test(options.generatorVersion))
  ) {
    throw new Error(
      "Persisted catalog generation requires a sealed generator dependency inventory.",
    );
  }
  return { mode: "test" };
}

export async function buildKnowledgeSource(
  options: ExtendedBuildRegistryOptions = {},
): Promise<KnowledgeSourceBuild> {
  const requestedSourceRoot = options.sourceRoot
    ? path.resolve(options.sourceRoot)
    : null;
  const generatorCapability = resolveKnowledgeGeneratorCapability(
    options,
    requestedSourceRoot,
  );
  const sourceRoot =
    requestedSourceRoot ??
    (await findSaltRepoRoot(process.cwd())) ??
    process.cwd();
  const packageRoot = path.resolve(
    options.packageRoot ?? path.join(sourceRoot, "packages", "knowledge"),
  );
  const outputDir =
    options.outputDir != null
      ? path.resolve(options.outputDir)
      : path.join(packageRoot, "generated");
  const version = options.version ?? REGISTRY_VERSION;
  const packageVersion = options.packageVersion ?? "0.0.0";
  if (!/^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/u.test(packageVersion)) {
    throw new Error("Catalog packageVersion must be an exact semantic version.");
  }
  const semanticInputPatterns = validateCatalogInputPatterns(
    options.semanticInputPatterns ?? CATALOG_INPUT_PATTERNS,
    "semanticInputPatterns",
  );
  const compilerInputPatterns = validateCatalogInputPatterns(
    options.compilerInputPatterns ?? ["package.json"],
    "compilerInputPatterns",
  );
  const inputPatterns = [...semanticInputPatterns, ...compilerInputPatterns];
  const excludedPackageNames = new Set(options.excludedPackageNames ?? []);
  const inventory =
    options.inputInventory ??
    (await createCatalogInputInventory(sourceRoot, inputPatterns));
  const sourceRevision = options.sourceRevision ?? inventory.digest;
  const generatorVersion =
    options.generatorVersion ??
    (generatorCapability.mode === "test" ? "2.0.0-test-unsealed" : "2.0.0");
  const generatorDigest =
    generatorCapability.mode === "sealed"
      ? createSealedKnowledgeGeneratorDigest(generatorCapability.receipt)
      : (options.generatorDigest ?? inventory.digest);
  if (!generatorDigest) {
    throw new Error(
      "Sealed catalog generation requires an explicit composite generator digest.",
    );
  }

  const executeBuild = async (): Promise<KnowledgeSourceBuild> => {
    const built = await withCatalogInputTracking(
      sourceRoot,
      inventory,
      async () => {
        const [packages, propMetadata, tokenPolicySources] = await Promise.all([
          extractPackages(sourceRoot, excludedPackageNames),
          loadPropMetadata(sourceRoot),
          buildTokenPolicySourceRegistry(sourceRoot),
        ]);
        const packageByName = new Map(packages.map((pkg) => [pkg.name, pkg]));
        const components = await extractComponents(
          sourceRoot,
          packageByName,
          propMetadata,
        );
        assertComponentAuthoringOverridesResolved(
          components
            .map((component) => component.related_docs.overview)
            .filter((route): route is string => route !== null),
        );
        const [patterns, guides, rawTokens, rawDeprecations] =
          await Promise.all([
            extractPatterns(sourceRoot),
            extractGuides(sourceRoot, components),
            extractTokens(sourceRoot, tokenPolicySources),
            extractDeprecations(
              sourceRoot,
              packages,
              excludedPackageNames,
            ),
          ]);
        assertPatternEditorialOverridesResolved(
          patterns
            .map((pattern) => pattern.related_docs.overview)
            .filter((route): route is string => route !== null),
        );
        assertGuideEditorialOverridesResolved(
          guides
            .map((guide) => guide.related_docs.overview)
            .filter((route): route is string => route !== null),
        );
        assertDeprecationMigrationOverridesResolved(
          rawDeprecations.map((deprecation) => deprecation.id),
        );
        assertDeprecationValueMapOverridesResolved(
          rawDeprecations.map((deprecation) => deprecation.id),
        );
        const pages = await extractPages(sourceRoot);
        const enrichedPatternMap = new Map(
          patterns.map((pattern) => [pattern.name, pattern] as const),
        );

        for (const pattern of enrichedPatternMap.values()) {
          const accessibilitySignals = [
            ...derivePatternExampleAccessibilitySignals(pattern),
            ...(await derivePatternImplementationAccessibilitySignals(
              sourceRoot,
              pattern,
            )),
          ];
          const uniqueSignals = new Map(
            accessibilitySignals.map((signal) => [
              canonicalJson(signal),
              signal,
            ]),
          );
          if (uniqueSignals.size > 0) {
            pattern.accessibility.implementation_signals = [
              ...uniqueSignals.values(),
            ];
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
        );
        const country_symbols = await extractCountrySymbols(
          sourceRoot,
          packageByName,
          linkedDeprecations.deprecations,
        );
        const tokens = linkedTokens.tokens;
        const deprecations = linkedDeprecations.deprecations;
        const componentExamples = enrichedComponents.flatMap(
          (component) => component.examples,
        );
        const patternExamples = enrichedPatterns.flatMap(
          (pattern) => pattern.examples,
        );
        const foundationExamples = await extractFoundationExamples(sourceRoot);
        const examples = [
          ...componentExamples,
          ...patternExamples,
          ...foundationExamples,
        ].sort((left, right) => compareOrdinalStrings(left.id, right.id));
        const tokenPolicyStructuralRoleRulePackBody =
          buildTokenPolicyStructuralRoleRulePackBody({
            structural_role_rules: tokenPolicySources.structural_role_rules,
            generator: {
              name: "mcp core buildRegistry",
            },
          });
        const registry: SaltRegistry = {
          generated_at: null,
          version,
          semantic_hash: null,
          build_info: null,
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
          token_policy_structural_role_rule_pack: null,
        };
        return {
          registry,
          normalized: normalizeKnowledgeRecords({
            registry,
            inventory,
            tokenPolicyStructuralRoleRulePackBody,
          }),
        };
      },
    );

    const finalInventory = await createCatalogInputInventory(
      sourceRoot,
      inputPatterns,
    );
    if (
      finalInventory.digest !== inventory.digest ||
      canonicalJson(finalInventory.entries) !== canonicalJson(inventory.entries)
    ) {
      throw new Error(
        "Catalog inputs changed during generation; refusing to publish a mixed-source catalog.",
      );
    }
    if (generatorCapability.mode === "sealed") {
      await generatorCapability.assertStable();
    }
    void outputDir;
    void version;
    void sourceRevision;
    void generatorVersion;
    void generatorDigest;
    return { ...built, inventory };
  };

  return generatorCapability.mode === "sealed"
    ? withGeneratorDependencyInventory(
        sourceRoot,
        generatorCapability.dependencyInventory,
        executeBuild,
        generatorCapability.dependencySnapshotRoot,
      )
    : executeBuild();
}

export async function buildRegistry(
  options: ExtendedBuildRegistryOptions = {},
): Promise<SaltRegistry> {
  return (await buildKnowledgeSource(options)).registry;
}
