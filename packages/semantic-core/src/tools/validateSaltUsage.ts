import * as t from "@babel/types";
import {
  type SaltEvidenceRef,
  type SaltEvidenceValidationIssue,
  type SaltGeneratedArtifact,
  type SaltGeneratedArtifactGenerator,
  type SaltUnsupportedClaim,
} from "../evidence.js";
import {
  type SerializedGeneratedSaltArtifactSurfaceGate,
  serializeGeneratedSaltArtifactSurfaceGate,
} from "../generatedArtifactSurface.js";
import type { DeprecationRecord, SaltRegistry } from "../types.js";
import { buildValidationReportEvidenceGate } from "../validationReportArtifacts.js";
import type { SaltValidationRulePack } from "../validationRulePacks.js";
import {
  analyzeParsedSaltCode,
  buildPropDeprecationIndex,
  createVersionContext,
  type ImportedSaltSymbol,
  isDeprecationRelevant,
  normalizeComponentKey,
  resolveImportedSaltSymbol,
  resolveNamespaceMemberImportedSaltSymbol,
  type SaltCodeAnalysis,
  traverseAst,
} from "./codeAnalysisCommon.js";
import type { ValidationIssue } from "./validation/shared.js";
import {
  buildAccessibleNameValidationIssue,
  buildActionNavigationHandlerValidationIssue,
  buildActionNavigationValidationIssue,
  buildComponentRegistryEvidenceRef,
  buildDecorativeIconValidationIssue,
  buildDeprecationEvidenceRefs,
  buildDeprecationFix,
  buildEvidence,
  buildNavigationActionValidationIssue,
  buildNestedInteractiveValidationIssue,
  buildPassThroughWrapperValidationIssue,
  buildPrimitiveRecreationValidationIssue,
  buildTabularRecreationValidationIssue,
  type ComponentAccessibilityRuleEvidence,
  type ComponentNestedInteractiveEvidence,
  type ComponentPassThroughWrapperEvidence,
  type ComponentPrimitiveRecreationEvidence,
  type ComponentTabularRecreationEvidence,
  type ComponentUsageContrastEvidence,
  clamp,
  componentDocUrls,
  createIssueCollector,
  deprecationSeverity,
  finalizeValidationIssues,
  findAccessibleNameRuleEvidence,
  findActionNavigationRuleEvidence,
  findDecorativeIconRuleEvidence,
  findNavigationActionRuleEvidence,
  findNestedInteractiveRuleEvidence,
  findPassThroughWrapperRuleEvidence,
  findPrimitiveRecreationRuleEvidence,
  findTabularRecreationRuleEvidence,
  hasActionNavigationRuleCandidate,
  hasInteractiveComponentCandidate,
  hasNavigationActionRuleCandidate,
  hasNestedInteractiveRuleCandidate,
  hasPrimitiveRecreationRuleCandidate,
  hasTabularRecreationRuleCandidate,
  type PrimitiveRecreationSurface,
  slugify,
} from "./validation/validateSaltUsageHelpers.js";
import {
  expressionContainsNavigationCall,
  findNestedSaltJsxElement,
  getJsxAttributeName,
  getJsxTagName,
  getReturnedJsxElement,
  getStaticStringAttributeValue,
  getStaticTextLength,
  hasAccessibleLabelAttribute,
  hasDecorativeIconWithoutAriaHidden,
  hasIconIndicator,
  hasInteractiveHandlerAttribute,
  hasNavigationTargetAttribute,
  isComponentLikeName,
  isPurePassThroughWrapper,
} from "./validation/validateSaltUsageJsx.js";
import {
  addTokenPolicyIssues,
  analyzeCssLikeSource,
  analyzeStyleAttribute,
  buildTokenLookup,
  createEmptyTokenPolicyCounts,
  mergeTokenPolicyCounts,
} from "./validation/validateSaltUsageStyle.js";
import { addValidationRulePackIssues } from "./validation/validationRulePackApplication.js";

export type { ValidationIssue } from "./validation/shared.js";

export interface ValidateSaltUsageInput {
  code: string;
  framework?: string;
  package_version?: string;
  max_issues?: number;
  analysis?: SaltCodeAnalysis;
  validation_rule_pack?: SaltValidationRulePack;
  generated_at?: string;
  generator?: SaltGeneratedArtifactGenerator;
  registry_hash?: string | null;
}

export interface ValidateSaltUsageEvidenceValidation {
  status: SerializedGeneratedSaltArtifactSurfaceGate["status"];
  issues: SaltEvidenceValidationIssue[];
  missing: string[];
  unsupported_claim_count: number;
}

export interface ValidateSaltUsageResult {
  summary: {
    errors: number;
    warnings: number;
    infos: number;
  };
  issues: ValidationIssue[];
  missing_data: string[];
  evidence_refs: SaltEvidenceRef[];
  unsupported_claims: SaltUnsupportedClaim[];
  surface_gate: SerializedGeneratedSaltArtifactSurfaceGate;
  evidence_validation: ValidateSaltUsageEvidenceValidation;
  generated_artifact: SaltGeneratedArtifact;
}

const PROP_DEPRECATION_EXCLUDES = new Set(["error", "unknown"]);

function getImportedSaltSymbolKey(symbol: ImportedSaltSymbol): string {
  return `${symbol.packageName}:${symbol.imported}`;
}

function toEvidenceValidationMirror(
  surfaceGate: SerializedGeneratedSaltArtifactSurfaceGate,
): ValidateSaltUsageEvidenceValidation {
  return {
    status: surfaceGate.status,
    issues: surfaceGate.validation_issues,
    missing: surfaceGate.missing,
    unsupported_claim_count: surfaceGate.unsupported_claim_count,
  };
}

export function buildValidateSaltUsageResult(input: {
  registry: SaltRegistry;
  summary: ValidateSaltUsageResult["summary"];
  issues: ValidationIssue[];
  missing_data: string[];
  generated_at?: string;
  generator?: SaltGeneratedArtifactGenerator;
  registry_hash?: string | null;
}): ValidateSaltUsageResult {
  const evidenceGate = buildValidationReportEvidenceGate({
    registry: input.registry,
    registry_hash: input.registry_hash,
    issues: input.issues,
    missing_data: input.missing_data,
    generated_at: input.generated_at ?? input.registry.generated_at,
    generator: input.generator ?? {
      name: "validateSaltUsage",
    },
  });
  const surfaceGate = serializeGeneratedSaltArtifactSurfaceGate(evidenceGate);

  return {
    summary: input.summary,
    issues: input.issues,
    missing_data: input.missing_data,
    evidence_refs: evidenceGate.artifact.evidence_refs,
    unsupported_claims: evidenceGate.artifact.unsupported_claims ?? [],
    surface_gate: surfaceGate,
    evidence_validation: toEvidenceValidationMirror(surfaceGate),
    generated_artifact: evidenceGate.artifact,
  };
}

export function validateSaltUsage(
  registry: SaltRegistry,
  input: ValidateSaltUsageInput,
): ValidateSaltUsageResult {
  const code = input.code ?? "";
  const framework = input.framework?.trim().toLowerCase() ?? "react";
  const maxIssues = clamp(input.max_issues ?? 20, 1, 50);
  const missingData: string[] = [];
  const versionContext = createVersionContext(input.package_version);

  if (code.trim().length === 0) {
    return buildValidateSaltUsageResult({
      registry,
      summary: { errors: 0, warnings: 0, infos: 0 },
      issues: [],
      missing_data: ["No code was provided."],
      generated_at: input.generated_at,
      generator: input.generator,
      registry_hash: input.registry_hash,
    });
  }

  if (framework !== "react") {
    missingData.push(
      `Framework '${input.framework}' is not fully supported. Rules are tuned for React JSX.`,
    );
  }

  if (versionContext.input && !versionContext.normalized) {
    missingData.push(
      `package_version '${versionContext.input}' is not a valid semver value; version-aware deprecation filtering was skipped.`,
    );
  }

  const tokenCounts = createEmptyTokenPolicyCounts();
  const tokenLookup = buildTokenLookup(registry);
  const { issueMap, addIssue } = createIssueCollector();

  let analysis: SaltCodeAnalysis;
  try {
    analysis = input.analysis ?? analyzeParsedSaltCode(code);
  } catch (error) {
    mergeTokenPolicyCounts(
      tokenCounts,
      analyzeCssLikeSource(code, tokenLookup),
    );

    missingData.push(
      "Code could not be parsed as JSX/TSX; validation fell back to a conservative stylesheet scan.",
      error instanceof Error ? error.message : String(error),
    );

    addTokenPolicyIssues({
      registry,
      addIssue,
      counts: tokenCounts,
      missingData,
    });
    const { summary, issues } = finalizeValidationIssues(issueMap, maxIssues);

    return buildValidateSaltUsageResult({
      registry,
      summary,
      issues,
      missing_data: missingData,
      generated_at: input.generated_at,
      generator: input.generator,
      registry_hash: input.registry_hash,
    });
  }

  const { ast, saltImports, directImportByLocal, namespaceImportByLocal } =
    analysis;

  if (saltImports.length === 0) {
    missingData.push(
      "No @salt-ds imports were detected; component-choice and deprecation checks are limited.",
    );
  }

  let incompleteVersionMetadata = false;
  const resolvedUsageBySymbolKey = new Map<string, ImportedSaltSymbol>();

  const collectResolvedUsage = (
    name: t.JSXIdentifier | t.JSXMemberExpression | t.JSXNamespacedName,
  ): ImportedSaltSymbol | null => {
    const imported = resolveImportedSaltSymbol(
      name,
      directImportByLocal,
      namespaceImportByLocal,
    );
    if (!imported) {
      return null;
    }

    resolvedUsageBySymbolKey.set(getImportedSaltSymbolKey(imported), imported);
    return imported;
  };

  const collectResolvedNamespaceMemberUsage = (
    node: t.MemberExpression,
  ): ImportedSaltSymbol | null => {
    const imported = resolveNamespaceMemberImportedSaltSymbol(
      node,
      namespaceImportByLocal,
    );
    if (!imported) {
      return null;
    }

    resolvedUsageBySymbolKey.set(getImportedSaltSymbolKey(imported), imported);
    return imported;
  };

  const importedSymbolsForCatalogChecks = new Map<string, ImportedSaltSymbol>(
    saltImports
      .filter((item) => !item.typeOnly && item.imported !== "*")
      .map((item) => [getImportedSaltSymbolKey(item), item] as const),
  );

  traverseAst(ast, {
    JSXOpeningElement(path) {
      collectResolvedUsage(path.node.name);
    },
    MemberExpression(path) {
      collectResolvedNamespaceMemberUsage(path.node);
    },
  });

  for (const [symbolKey, imported] of resolvedUsageBySymbolKey) {
    importedSymbolsForCatalogChecks.set(symbolKey, imported);
  }

  for (const imported of importedSymbolsForCatalogChecks.values()) {
    const component =
      registry.components.find(
        (record) =>
          record.package.name === imported.packageName &&
          (record.name === imported.imported ||
            record.aliases.includes(imported.imported)),
      ) ?? null;

    if (!component || component.status === "stable") {
      continue;
    }

    // Lab components that are documented on the Salt site are intentionally
    // recommended for use — skip the prefer-stable warning for them.
    // Deprecated components should still be flagged regardless.
    const isSiteDocumented = component.related_docs?.overview != null;
    if (isSiteDocumented && component.status !== "deprecated") {
      continue;
    }

    addIssue({
      id: `component-status.${slugify(component.name)}.${component.status}`,
      category: "catalog-status",
      rule: "prefer-stable-catalog-status",
      severity: component.status === "deprecated" ? "error" : "warning",
      title: `${component.name} is ${component.status}`,
      message: `Imported component ${component.name} has status '${component.status}'. Prefer stable components for production usage.`,
      evidence: buildEvidence(
        `Imported Salt component ${component.name} has non-stable status '${component.status}'`,
        1,
      ),
      canonical_source:
        componentDocUrls(registry, component.name, ["overview", "usage"])[0] ??
        null,
      suggested_fix: "Use a stable component alternative when available.",
      confidence: 0.97,
      source_urls: componentDocUrls(registry, component.name, [
        "overview",
        "usage",
      ]),
      evidence_refs: [
        buildComponentRegistryEvidenceRef({
          registry,
          component,
          claim_kind: "status",
          field_path: "status",
          id_suffix: "status",
        }),
      ],
      matches: 1,
    });
  }

  addValidationRulePackIssues({
    registry,
    rulePack: input.validation_rule_pack,
    ast,
    directImportByLocal,
    namespaceImportByLocal,
    addIssue,
    missingData,
  });

  const nonPropDeprecations = registry.deprecations.filter(
    (deprecation) =>
      deprecation.kind !== "prop" &&
      isDeprecationRelevant(deprecation, versionContext),
  );
  const matchedImportDeprecations = new Set<string>();
  for (const imported of importedSymbolsForCatalogChecks.values()) {
    const deprecations = nonPropDeprecations.filter(
      (deprecation) =>
        deprecation.package === imported.packageName &&
        deprecation.name === imported.imported,
    );

    for (const deprecation of deprecations) {
      if (versionContext.normalized && !deprecation.deprecated_in) {
        incompleteVersionMetadata = true;
      }
      const depKey = `${deprecation.package}:${deprecation.kind}:${deprecation.name}`;
      if (matchedImportDeprecations.has(depKey)) {
        continue;
      }
      matchedImportDeprecations.add(depKey);

      addIssue({
        id: `deprecated.import.${slugify(deprecation.package)}.${slugify(deprecation.name)}`,
        category: "deprecated",
        rule: "deprecated-import-replacement",
        severity: deprecationSeverity(deprecation, versionContext),
        title: `Deprecated API imported: ${deprecation.name}`,
        message:
          deprecation.replacement.notes ??
          `${deprecation.name} is deprecated in ${deprecation.package}.`,
        evidence: buildEvidence(
          `Imported deprecated API ${deprecation.name} from ${deprecation.package}`,
          1,
        ),
        canonical_source: deprecation.source_urls[0] ?? null,
        suggested_fix: buildDeprecationFix(deprecation),
        confidence: 0.96,
        source_urls: deprecation.source_urls,
        evidence_refs: buildDeprecationEvidenceRefs({
          registry,
          deprecation,
          primary_claim_kind: "import",
          id_suffix: "deprecated-import",
        }),
        matches: 1,
      });
    }
  }

  const propDeprecationIndex = buildPropDeprecationIndex(
    registry.deprecations,
    versionContext,
    {
      excluded_names: PROP_DEPRECATION_EXCLUDES,
    },
  );
  const hasSaltImports = saltImports.length > 0;
  const actionNavigationMatchesByComponentId = new Map<string, number>();
  const actionNavigationEvidenceByComponentId = new Map<
    string,
    ComponentUsageContrastEvidence
  >();
  const unsupportedActionNavigationComponentIds = new Set<string>();
  const actionNavigationHandlerMatchesByComponentId = new Map<string, number>();
  const unsupportedActionNavigationHandlerComponentIds = new Set<string>();
  const navigationActionMatchesByComponentId = new Map<string, number>();
  const navigationActionEvidenceByComponentId = new Map<
    string,
    ComponentUsageContrastEvidence
  >();
  const unsupportedNavigationActionComponentIds = new Set<string>();
  const primitiveRecreationMatchesBySurface = new Map<
    PrimitiveRecreationSurface,
    number
  >();
  const primitiveRecreationEvidenceBySurface = new Map<
    PrimitiveRecreationSurface,
    ComponentPrimitiveRecreationEvidence
  >();
  let nativeTableMatches = 0;
  let tabularRecreationEvidence: ComponentTabularRecreationEvidence | null =
    null;
  const iconOnlyAccessibleNameMatchesByComponentId = new Map<string, number>();
  const accessibleNameEvidenceByComponentId = new Map<
    string,
    ComponentAccessibilityRuleEvidence
  >();
  const unsupportedIconOnlyAccessibleNameComponentIds = new Set<string>();
  const decorativeIconMatchesByComponentId = new Map<string, number>();
  const decorativeIconEvidenceByComponentId = new Map<
    string,
    ComponentAccessibilityRuleEvidence
  >();
  const unsupportedDecorativeIconComponentIds = new Set<string>();
  const nestedInteractiveMatchesByPairKey = new Map<string, number>();
  const nestedInteractivePairComponents = new Map<
    string,
    {
      outer: SaltRegistry["components"][number];
      inner: SaltRegistry["components"][number];
    }
  >();
  const nestedInteractiveEvidenceByPairKey = new Map<
    string,
    ComponentNestedInteractiveEvidence
  >();
  const passThroughWrappersByComponentId = new Map<
    string,
    {
      component: SaltRegistry["components"][number];
      wrapperNames: Set<string>;
    }
  >();
  const deprecatedPropUsageCounts = new Map<string, number>();

  const getImportedComponent = (
    imported: ImportedSaltSymbol,
  ): SaltRegistry["components"][number] | null =>
    registry.components.find(
      (record) =>
        record.package.name === imported.packageName &&
        (record.name === imported.imported ||
          record.aliases.includes(imported.imported)),
    ) ?? null;

  const getAccessibleNameEvidence = (
    component: SaltRegistry["components"][number],
  ): ComponentAccessibilityRuleEvidence | null => {
    const cached = accessibleNameEvidenceByComponentId.get(component.id);
    if (cached) {
      return cached;
    }

    const evidence = findAccessibleNameRuleEvidence(registry, component);
    if (!evidence) {
      return null;
    }

    accessibleNameEvidenceByComponentId.set(component.id, evidence);
    return evidence;
  };

  const getActionNavigationEvidence = (
    component: SaltRegistry["components"][number],
  ): ComponentUsageContrastEvidence | null => {
    const cached = actionNavigationEvidenceByComponentId.get(component.id);
    if (cached) {
      return cached;
    }

    const evidence = findActionNavigationRuleEvidence(registry, component);
    if (!evidence) {
      return null;
    }

    actionNavigationEvidenceByComponentId.set(component.id, evidence);
    return evidence;
  };

  const getNavigationActionEvidence = (
    component: SaltRegistry["components"][number],
  ): ComponentUsageContrastEvidence | null => {
    const cached = navigationActionEvidenceByComponentId.get(component.id);
    if (cached) {
      return cached;
    }

    const evidence = findNavigationActionRuleEvidence(registry, component);
    if (!evidence) {
      return null;
    }

    navigationActionEvidenceByComponentId.set(component.id, evidence);
    return evidence;
  };

  const incrementPrimitiveRecreationMatches = (
    surface: PrimitiveRecreationSurface,
  ): void => {
    primitiveRecreationMatchesBySurface.set(
      surface,
      (primitiveRecreationMatchesBySurface.get(surface) ?? 0) + 1,
    );
  };

  const getPrimitiveRecreationEvidence = (
    surface: PrimitiveRecreationSurface,
  ): ComponentPrimitiveRecreationEvidence | null => {
    const cached = primitiveRecreationEvidenceBySurface.get(surface);
    if (cached) {
      return cached;
    }

    const evidence = findPrimitiveRecreationRuleEvidence(registry, surface);
    if (!evidence) {
      return null;
    }

    primitiveRecreationEvidenceBySurface.set(surface, evidence);
    return evidence;
  };

  const getTabularRecreationEvidence =
    (): ComponentTabularRecreationEvidence | null => {
      if (tabularRecreationEvidence) {
        return tabularRecreationEvidence;
      }

      const evidence = findTabularRecreationRuleEvidence(registry);
      if (!evidence) {
        return null;
      }

      tabularRecreationEvidence = evidence;
      return evidence;
    };

  const getNestedInteractivePairKey = (
    outer: SaltRegistry["components"][number],
    inner: SaltRegistry["components"][number],
  ): string => `${outer.id}::${inner.id}`;

  const incrementNestedInteractiveMatches = (
    outer: SaltRegistry["components"][number],
    inner: SaltRegistry["components"][number],
  ): void => {
    const pairKey = getNestedInteractivePairKey(outer, inner);
    nestedInteractiveMatchesByPairKey.set(
      pairKey,
      (nestedInteractiveMatchesByPairKey.get(pairKey) ?? 0) + 1,
    );
    nestedInteractivePairComponents.set(pairKey, { outer, inner });
  };

  const getNestedInteractiveEvidence = (
    outer: SaltRegistry["components"][number],
    inner: SaltRegistry["components"][number],
  ): ComponentNestedInteractiveEvidence | null => {
    const pairKey = getNestedInteractivePairKey(outer, inner);
    const cached = nestedInteractiveEvidenceByPairKey.get(pairKey);
    if (cached) {
      return cached;
    }

    const evidence = findNestedInteractiveRuleEvidence(registry, outer, inner);
    if (!evidence) {
      return null;
    }

    nestedInteractiveEvidenceByPairKey.set(pairKey, evidence);
    return evidence;
  };

  const getDecorativeIconEvidence = (
    component: SaltRegistry["components"][number],
  ): ComponentAccessibilityRuleEvidence | null => {
    const cached = decorativeIconEvidenceByComponentId.get(component.id);
    if (cached) {
      return cached;
    }

    const evidence = findDecorativeIconRuleEvidence(registry, component);
    if (!evidence) {
      return null;
    }

    decorativeIconEvidenceByComponentId.set(component.id, evidence);
    return evidence;
  };

  const recordPassThroughWrapper = (
    wrapperName: string,
    imported: ImportedSaltSymbol,
  ): void => {
    const component = getImportedComponent(imported);
    if (!component) {
      missingData.push(
        `Skipped pass-through wrapper validation for '${wrapperName}' because imported Salt symbol '${imported.imported}' was absent from the registry.`,
      );
      return;
    }

    const existing = passThroughWrappersByComponentId.get(component.id);
    if (existing) {
      existing.wrapperNames.add(wrapperName);
      return;
    }

    passThroughWrappersByComponentId.set(component.id, {
      component,
      wrapperNames: new Set([wrapperName]),
    });
  };

  traverseAst(ast, {
    JSXOpeningElement(path) {
      const tagName = getJsxTagName(path.node.name);
      const imported = collectResolvedUsage(path.node.name);
      const attributes = path.node.attributes.filter(
        (attribute): attribute is t.JSXAttribute => t.isJSXAttribute(attribute),
      );

      if (!imported && hasSaltImports && tagName) {
        const roleValue =
          getStaticStringAttributeValue(
            attributes.find(
              (attribute) => getJsxAttributeName(attribute) === "role",
            ),
          )?.toLowerCase() ?? null;
        const hasHandlers = hasInteractiveHandlerAttribute(attributes);

        if (tagName === "button") {
          incrementPrimitiveRecreationMatches("native-button");
        } else if (
          tagName === "a" &&
          hasNavigationTargetAttribute(attributes)
        ) {
          incrementPrimitiveRecreationMatches("native-link");
        } else if (tagName === "table") {
          nativeTableMatches += 1;
        } else if (/^[a-z]/.test(tagName)) {
          if (roleValue === "button" && hasHandlers) {
            incrementPrimitiveRecreationMatches("custom-button-role");
          }
          if (roleValue === "link" && hasHandlers) {
            incrementPrimitiveRecreationMatches("custom-link-role");
          }
        }
      }

      if (!imported) {
        return;
      }
      const component = getImportedComponent(imported);

      const styleAttribute = attributes.find(
        (attribute) => getJsxAttributeName(attribute) === "style",
      );
      if (styleAttribute) {
        mergeTokenPolicyCounts(
          tokenCounts,
          analyzeStyleAttribute(styleAttribute, tokenLookup, imported.imported),
        );
      }

      if (component && hasNavigationTargetAttribute(attributes)) {
        const navigationEvidence = getActionNavigationEvidence(component);
        if (navigationEvidence) {
          actionNavigationMatchesByComponentId.set(
            component.id,
            (actionNavigationMatchesByComponentId.get(component.id) ?? 0) + 1,
          );
        } else if (hasActionNavigationRuleCandidate(registry, component)) {
          unsupportedActionNavigationComponentIds.add(component.id);
        }
      }

      const onClickAttribute = attributes.find(
        (attribute) => getJsxAttributeName(attribute) === "onClick",
      );
      const onClickValue = onClickAttribute?.value;
      const onClickContainsNavigation =
        Boolean(onClickValue) &&
        t.isJSXExpressionContainer(onClickValue) &&
        expressionContainsNavigationCall(code, onClickValue.expression);

      if (component && onClickContainsNavigation) {
        const navigationEvidence = getActionNavigationEvidence(component);
        if (navigationEvidence) {
          actionNavigationHandlerMatchesByComponentId.set(
            component.id,
            (actionNavigationHandlerMatchesByComponentId.get(component.id) ??
              0) + 1,
          );
        } else if (hasActionNavigationRuleCandidate(registry, component)) {
          unsupportedActionNavigationHandlerComponentIds.add(component.id);
        }
      }

      if (
        component &&
        onClickAttribute?.value &&
        !hasNavigationTargetAttribute(attributes)
      ) {
        const navigationActionEvidence = getNavigationActionEvidence(component);
        if (navigationActionEvidence) {
          navigationActionMatchesByComponentId.set(
            component.id,
            (navigationActionMatchesByComponentId.get(component.id) ?? 0) + 1,
          );
        } else if (hasNavigationActionRuleCandidate(registry, component)) {
          unsupportedNavigationActionComponentIds.add(component.id);
        }
      }

      const packageDeprecations = propDeprecationIndex.get(
        imported.packageName,
      );
      if (!packageDeprecations) {
        return;
      }

      const componentKey = normalizeComponentKey(imported.imported);
      const componentSpecificDeprecations =
        packageDeprecations.get(componentKey);
      const depMaps = [componentSpecificDeprecations].filter(
        (entry): entry is Map<string, DeprecationRecord[]> => Boolean(entry),
      );

      for (const attribute of attributes) {
        const propName = getJsxAttributeName(attribute);
        if (!propName) {
          continue;
        }

        for (const depMap of depMaps) {
          const matches = depMap.get(propName) ?? [];
          for (const deprecation of matches) {
            if (versionContext.normalized && !deprecation.deprecated_in) {
              incompleteVersionMetadata = true;
            }
            const currentCount =
              deprecatedPropUsageCounts.get(deprecation.id) ?? 0;
            deprecatedPropUsageCounts.set(deprecation.id, currentCount + 1);
          }
        }
      }
    },
    JSXElement(path) {
      const opening = path.node.openingElement;
      const imported = collectResolvedUsage(opening.name);
      if (!imported) {
        return;
      }

      const attributes = opening.attributes.filter(
        (attribute): attribute is t.JSXAttribute => t.isJSXAttribute(attribute),
      );
      const component = getImportedComponent(imported);
      if (component) {
        const hasA11yLabel = hasAccessibleLabelAttribute(attributes);
        const textLength = getStaticTextLength(path.node.children);
        if (
          !hasA11yLabel &&
          textLength === 0 &&
          hasIconIndicator(path.node, attributes)
        ) {
          const accessibleNameEvidence = getAccessibleNameEvidence(component);
          if (accessibleNameEvidence) {
            iconOnlyAccessibleNameMatchesByComponentId.set(
              component.id,
              (iconOnlyAccessibleNameMatchesByComponentId.get(component.id) ??
                0) + 1,
            );
          } else {
            unsupportedIconOnlyAccessibleNameComponentIds.add(component.id);
          }
        }

        if (
          (hasA11yLabel || textLength > 0) &&
          hasDecorativeIconWithoutAriaHidden(
            path.node,
            directImportByLocal,
            namespaceImportByLocal,
          )
        ) {
          const decorativeIconEvidence = getDecorativeIconEvidence(component);
          if (decorativeIconEvidence) {
            decorativeIconMatchesByComponentId.set(
              component.id,
              (decorativeIconMatchesByComponentId.get(component.id) ?? 0) + 1,
            );
          } else {
            unsupportedDecorativeIconComponentIds.add(component.id);
          }
        }
      }

      if (component && hasInteractiveComponentCandidate(component)) {
        const nestedImported = findNestedSaltJsxElement(
          path.node.children,
          directImportByLocal,
          namespaceImportByLocal,
          (candidate) => {
            const nestedComponent = getImportedComponent(candidate);
            return Boolean(
              nestedComponent &&
                hasInteractiveComponentCandidate(nestedComponent),
            );
          },
        );
        if (nestedImported) {
          const nestedComponent = getImportedComponent(nestedImported);
          if (nestedComponent) {
            incrementNestedInteractiveMatches(component, nestedComponent);
          }
        }
      }
    },
    FunctionDeclaration(path) {
      if (!path.node.id?.name) {
        return;
      }

      const returnedElement = getReturnedJsxElement(path.node);
      if (!returnedElement) {
        return;
      }

      const imported = isPurePassThroughWrapper(
        path.node.id.name,
        path.node.params[0] ?? null,
        returnedElement,
        directImportByLocal,
        namespaceImportByLocal,
      );
      if (!imported) {
        return;
      }

      recordPassThroughWrapper(path.node.id.name, imported);
    },
    VariableDeclarator(path) {
      if (
        !t.isIdentifier(path.node.id) ||
        !isComponentLikeName(path.node.id.name) ||
        !path.node.init ||
        (!t.isArrowFunctionExpression(path.node.init) &&
          !t.isFunctionExpression(path.node.init))
      ) {
        return;
      }

      const returnedElement = getReturnedJsxElement(path.node.init);
      if (!returnedElement) {
        return;
      }

      const imported = isPurePassThroughWrapper(
        path.node.id.name,
        path.node.init.params[0] ?? null,
        returnedElement,
        directImportByLocal,
        namespaceImportByLocal,
      );
      if (!imported) {
        return;
      }

      recordPassThroughWrapper(path.node.id.name, imported);
    },
  });

  for (const [componentId, matches] of actionNavigationMatchesByComponentId) {
    const evidence = actionNavigationEvidenceByComponentId.get(componentId);
    if (!evidence) {
      missingData.push(
        `Skipped action-vs-navigation validation for registry component '${componentId}' because source-backed component usage evidence was missing.`,
      );
      continue;
    }

    addIssue(
      buildActionNavigationValidationIssue({
        evidence,
        matches,
      }),
    );
  }

  for (const componentId of unsupportedActionNavigationComponentIds) {
    missingData.push(
      `Skipped action-vs-navigation validation for registry component '${componentId}' because source-backed component usage evidence was missing.`,
    );
  }

  for (const [
    componentId,
    matches,
  ] of actionNavigationHandlerMatchesByComponentId) {
    const evidence = actionNavigationEvidenceByComponentId.get(componentId);
    if (!evidence) {
      missingData.push(
        `Skipped action-vs-navigation handler validation for registry component '${componentId}' because source-backed component usage evidence was missing.`,
      );
      continue;
    }

    addIssue(
      buildActionNavigationHandlerValidationIssue({
        evidence,
        matches,
      }),
    );
  }

  for (const componentId of unsupportedActionNavigationHandlerComponentIds) {
    missingData.push(
      `Skipped action-vs-navigation handler validation for registry component '${componentId}' because source-backed component usage evidence was missing.`,
    );
  }

  for (const [componentId, matches] of navigationActionMatchesByComponentId) {
    const evidence = navigationActionEvidenceByComponentId.get(componentId);
    if (!evidence) {
      missingData.push(
        `Skipped navigation-as-action validation for registry component '${componentId}' because source-backed component usage evidence was missing.`,
      );
      continue;
    }

    addIssue(
      buildNavigationActionValidationIssue({
        evidence,
        matches,
      }),
    );
  }

  for (const componentId of unsupportedNavigationActionComponentIds) {
    missingData.push(
      `Skipped navigation-as-action validation for registry component '${componentId}' because source-backed component usage evidence was missing.`,
    );
  }

  for (const [surface, matches] of primitiveRecreationMatchesBySurface) {
    const evidence = getPrimitiveRecreationEvidence(surface);
    if (!evidence) {
      const hasCandidate = hasPrimitiveRecreationRuleCandidate(
        registry,
        surface,
      );
      missingData.push(
        `Skipped ${surface} primitive recreation validation because ${
          hasCandidate
            ? "source-backed component or guide evidence was missing"
            : "registry component or guide evidence was missing"
        }.`,
      );
      continue;
    }

    addIssue(
      buildPrimitiveRecreationValidationIssue({
        surface,
        evidence,
        matches,
      }),
    );
  }

  if (nativeTableMatches > 0) {
    const evidence = getTabularRecreationEvidence();
    if (!evidence) {
      const hasCandidate = hasTabularRecreationRuleCandidate(registry);
      missingData.push(
        `Skipped native-table primitive recreation validation because ${
          hasCandidate
            ? "source-backed component or guide evidence was missing"
            : "registry component or guide evidence was missing"
        }.`,
      );
    } else {
      addIssue(
        buildTabularRecreationValidationIssue({
          evidence,
          matches: nativeTableMatches,
        }),
      );
    }
  }

  for (const [pairKey, matches] of nestedInteractiveMatchesByPairKey) {
    const pair = nestedInteractivePairComponents.get(pairKey);
    if (!pair) {
      continue;
    }

    const evidence = getNestedInteractiveEvidence(pair.outer, pair.inner);
    if (!evidence) {
      const hasCandidate = hasNestedInteractiveRuleCandidate(
        registry,
        pair.outer,
        pair.inner,
      );
      missingData.push(
        `Skipped nested-interactive validation for registry components '${pair.outer.id}' and '${pair.inner.id}' because ${
          hasCandidate
            ? "source-backed component or guide evidence was missing"
            : "registry component or guide evidence was missing"
        }.`,
      );
      continue;
    }

    addIssue(
      buildNestedInteractiveValidationIssue({
        evidence,
        matches,
      }),
    );
  }

  for (const [
    componentId,
    matches,
  ] of iconOnlyAccessibleNameMatchesByComponentId.entries()) {
    const evidence = accessibleNameEvidenceByComponentId.get(componentId);
    if (!evidence) {
      missingData.push(
        `Skipped icon-only accessible-name validation for registry component '${componentId}' because source-backed accessibility rule evidence was missing.`,
      );
      continue;
    }

    addIssue(
      buildAccessibleNameValidationIssue({
        evidence,
        matches,
      }),
    );
  }

  for (const componentId of unsupportedIconOnlyAccessibleNameComponentIds) {
    missingData.push(
      `Skipped icon-only accessible-name validation for registry component '${componentId}' because source-backed accessibility rule evidence was missing.`,
    );
  }

  for (const [componentId, matches] of decorativeIconMatchesByComponentId) {
    const evidence = decorativeIconEvidenceByComponentId.get(componentId);
    if (!evidence) {
      missingData.push(
        `Skipped decorative-icon accessibility validation for registry component '${componentId}' because source-backed accessibility rule evidence was missing.`,
      );
      continue;
    }

    addIssue(
      buildDecorativeIconValidationIssue({
        evidence,
        matches,
      }),
    );
  }

  for (const componentId of unsupportedDecorativeIconComponentIds) {
    missingData.push(
      `Skipped decorative-icon accessibility validation for registry component '${componentId}' because source-backed accessibility rule evidence was missing.`,
    );
  }

  const passThroughWrapperEntries: Array<{
    evidence: ComponentPassThroughWrapperEvidence;
    wrapper_names: string[];
  }> = [];
  for (const {
    component,
    wrapperNames,
  } of passThroughWrappersByComponentId.values()) {
    const evidence = findPassThroughWrapperRuleEvidence(registry, component);
    if (!evidence) {
      missingData.push(
        `Skipped pass-through wrapper validation for registry component '${component.id}' because source-backed component or custom-wrapper guide evidence was missing.`,
      );
      continue;
    }

    passThroughWrapperEntries.push({
      evidence,
      wrapper_names: [...wrapperNames].sort(),
    });
  }

  if (passThroughWrapperEntries.length > 0) {
    addIssue(
      buildPassThroughWrapperValidationIssue({
        entries: passThroughWrapperEntries,
        matches: passThroughWrapperEntries.reduce(
          (count, entry) => count + entry.wrapper_names.length,
          0,
        ),
      }),
    );
  }

  for (const [deprecationId, matches] of deprecatedPropUsageCounts.entries()) {
    if (matches <= 0) {
      continue;
    }

    const deprecation = registry.deprecations.find(
      (item) => item.id === deprecationId,
    );
    if (!deprecation) {
      continue;
    }

    addIssue({
      id: `deprecated.prop.${slugify(deprecation.package)}.${slugify(deprecation.name)}`,
      category: "deprecated",
      rule: "deprecated-prop-replacement",
      severity: deprecationSeverity(deprecation, versionContext),
      title: `Deprecated prop used: ${deprecation.name}`,
      message:
        deprecation.replacement.notes ??
        `${deprecation.name} is deprecated in ${deprecation.package}.`,
      evidence: buildEvidence(
        `Detected deprecated prop ${deprecation.name} in ${deprecation.package}`,
        matches,
      ),
      canonical_source: deprecation.source_urls[0] ?? null,
      suggested_fix: buildDeprecationFix(deprecation),
      confidence: 0.9,
      source_urls: deprecation.source_urls,
      evidence_refs: buildDeprecationEvidenceRefs({
        registry,
        deprecation,
        primary_claim_kind: "prop",
        id_suffix: "deprecated-prop",
      }),
      matches,
    });
  }

  addTokenPolicyIssues({
    registry,
    addIssue,
    counts: tokenCounts,
    missingData,
  });
  const { summary, issues } = finalizeValidationIssues(issueMap, maxIssues);

  if (versionContext.normalized && incompleteVersionMetadata) {
    missingData.push(
      "Some matched deprecations do not have explicit deprecated_in metadata; version filtering may be incomplete.",
    );
  }

  return buildValidateSaltUsageResult({
    registry,
    summary,
    issues,
    missing_data: missingData,
    generated_at: input.generated_at,
    generator: input.generator,
    registry_hash: input.registry_hash,
  });
}
