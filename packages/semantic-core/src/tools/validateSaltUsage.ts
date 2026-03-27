import * as t from "@babel/types";
import type { DeprecationRecord, SaltRegistry } from "../types.js";
import {
  analyzeSaltCode,
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
import { unique } from "./utils.js";
import { buildCatalogValidationIssue } from "./validation/issueCatalog.js";
import type { ValidationIssue } from "./validation/shared.js";
import {
  buildDeprecationFix,
  buildEvidence,
  buildValidationIssueSources,
  clamp,
  componentDocUrls,
  createIssueCollector,
  deprecationSeverity,
  finalizeValidationIssues,
  slugify,
} from "./validation/validateSaltUsageHelpers.js";
import {
  expressionContainsNavigationCall,
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
  hasNestedInteractiveSaltPrimitive,
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

export type { ValidationIssue } from "./validation/shared.js";

export interface ValidateSaltUsageInput {
  code: string;
  framework?: string;
  package_version?: string;
  max_issues?: number;
  analysis?: SaltCodeAnalysis;
}

export interface ValidateSaltUsageResult {
  summary: {
    errors: number;
    warnings: number;
    infos: number;
  };
  issues: ValidationIssue[];
  missing_data: string[];
}

const PROP_DEPRECATION_EXCLUDES = new Set(["error", "unknown"]);

function getImportedSaltSymbolKey(symbol: ImportedSaltSymbol): string {
  return `${symbol.packageName}:${symbol.imported}`;
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
    return {
      summary: { errors: 0, warnings: 0, infos: 0 },
      issues: [],
      missing_data: ["No code was provided."],
    };
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
    analysis = input.analysis ?? analyzeSaltCode(code);
  } catch (error) {
    mergeTokenPolicyCounts(
      tokenCounts,
      analyzeCssLikeSource(code, tokenLookup),
    );

    missingData.push(
      "Code could not be parsed as JSX/TSX; validation fell back to a conservative stylesheet scan.",
      error instanceof Error ? error.message : String(error),
    );

    addTokenPolicyIssues(addIssue, tokenCounts);
    const { summary, issues } = finalizeValidationIssues(issueMap, maxIssues);

    return {
      summary,
      issues,
      missing_data: missingData,
    };
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
      matches: 1,
    });
  }

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
  let navigationMatches = 0;
  let imperativeNavigationMatches = 0;
  let linkActionMatches = 0;
  let nativeButtonMatches = 0;
  let nativeLinkMatches = 0;
  let customButtonRoleMatches = 0;
  let customLinkRoleMatches = 0;
  let iconOnlyMatches = 0;
  let decorativeIconMatches = 0;
  let nestedInteractiveMatches = 0;
  const passThroughWrapperNames = new Set<string>();
  const passThroughWrapperTargets = new Set<string>();
  const deprecatedPropUsageCounts = new Map<string, number>();

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
          nativeButtonMatches += 1;
        } else if (
          tagName === "a" &&
          hasNavigationTargetAttribute(attributes)
        ) {
          nativeLinkMatches += 1;
        } else if (/^[a-z]/.test(tagName)) {
          if (roleValue === "button" && hasHandlers) {
            customButtonRoleMatches += 1;
          }
          if (roleValue === "link" && hasHandlers) {
            customLinkRoleMatches += 1;
          }
        }
      }

      if (!imported) {
        return;
      }

      const styleAttribute = attributes.find(
        (attribute) => getJsxAttributeName(attribute) === "style",
      );
      if (styleAttribute) {
        mergeTokenPolicyCounts(
          tokenCounts,
          analyzeStyleAttribute(styleAttribute, tokenLookup, imported.imported),
        );
      }

      if (imported.imported === "Button") {
        if (hasNavigationTargetAttribute(attributes)) {
          navigationMatches += 1;
        }

        const onClickAttribute = attributes.find(
          (attribute) => getJsxAttributeName(attribute) === "onClick",
        );
        if (
          onClickAttribute?.value &&
          t.isJSXExpressionContainer(onClickAttribute.value) &&
          expressionContainsNavigationCall(
            code,
            onClickAttribute.value.expression,
          )
        ) {
          imperativeNavigationMatches += 1;
        }
      } else if (imported.imported === "Link") {
        const hasNavigationProp = hasNavigationTargetAttribute(attributes);
        const onClickAttribute = attributes.find(
          (attribute) => getJsxAttributeName(attribute) === "onClick",
        );
        if (onClickAttribute?.value && !hasNavigationProp) {
          linkActionMatches += 1;
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
      if (imported.imported === "Button") {
        const hasA11yLabel = hasAccessibleLabelAttribute(attributes);
        const textLength = getStaticTextLength(path.node.children);
        if (
          (hasA11yLabel || textLength > 0) &&
          hasDecorativeIconWithoutAriaHidden(
            path.node,
            directImportByLocal,
            namespaceImportByLocal,
          )
        ) {
          decorativeIconMatches += 1;
        }

        if (
          !hasA11yLabel &&
          textLength === 0 &&
          hasIconIndicator(path.node, attributes)
        ) {
          iconOnlyMatches += 1;
        }
      }

      if (
        (imported.imported === "Button" || imported.imported === "Link") &&
        hasNestedInteractiveSaltPrimitive(
          path.node.children,
          directImportByLocal,
          namespaceImportByLocal,
        )
      ) {
        nestedInteractiveMatches += 1;
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

      passThroughWrapperNames.add(path.node.id.name);
      passThroughWrapperTargets.add(imported.imported);
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

      passThroughWrapperNames.add(path.node.id.name);
      passThroughWrapperTargets.add(imported.imported);
    },
  });

  if (navigationMatches > 0) {
    addIssue(
      buildCatalogValidationIssue("component-choice.navigation", {
        evidence: buildEvidence(
          "Detected Button usage with href or to props",
          navigationMatches,
        ),
        ...buildValidationIssueSources(
          registry,
          "component-choice.navigation",
          [
            ...componentDocUrls(registry, "Button", ["usage"]),
            ...componentDocUrls(registry, "Link", ["usage"]),
          ],
        ),
        matches: navigationMatches,
      }),
    );
  }

  if (imperativeNavigationMatches > 0) {
    addIssue(
      buildCatalogValidationIssue("component-choice.navigation-handler", {
        evidence: buildEvidence(
          "Detected Button click handlers that appear to trigger navigation",
          imperativeNavigationMatches,
        ),
        ...buildValidationIssueSources(
          registry,
          "component-choice.navigation-handler",
          [
            ...componentDocUrls(registry, "Button", ["usage"]),
            ...componentDocUrls(registry, "Link", ["usage"]),
          ],
        ),
        matches: imperativeNavigationMatches,
      }),
    );
  }

  if (linkActionMatches > 0) {
    addIssue(
      buildCatalogValidationIssue("primitive-choice.link-action", {
        evidence: buildEvidence(
          "Detected Link usage with onClick but without a navigation target",
          linkActionMatches,
        ),
        ...buildValidationIssueSources(
          registry,
          "primitive-choice.link-action",
          [
            ...componentDocUrls(registry, "Link", ["usage"]),
            ...componentDocUrls(registry, "Button", ["usage"]),
          ],
        ),
        matches: linkActionMatches,
      }),
    );
  }

  if (nativeButtonMatches > 0) {
    addIssue(
      buildCatalogValidationIssue("primitive-choice.native-button", {
        evidence: buildEvidence(
          "Detected native button elements in code that already uses Salt",
          nativeButtonMatches,
        ),
        ...buildValidationIssueSources(
          registry,
          "primitive-choice.native-button",
          componentDocUrls(registry, "Button", ["usage", "overview"]),
        ),
        matches: nativeButtonMatches,
      }),
    );
  }

  if (nativeLinkMatches > 0) {
    addIssue(
      buildCatalogValidationIssue("primitive-choice.native-link", {
        evidence: buildEvidence(
          "Detected native anchor elements with navigation targets in code that already uses Salt",
          nativeLinkMatches,
        ),
        ...buildValidationIssueSources(
          registry,
          "primitive-choice.native-link",
          componentDocUrls(registry, "Link", ["usage", "overview"]),
        ),
        matches: nativeLinkMatches,
      }),
    );
  }

  if (customButtonRoleMatches > 0) {
    addIssue(
      buildCatalogValidationIssue("primitive-choice.custom-button-role", {
        evidence: buildEvidence(
          'Detected non-native elements with role="button" and interactive handlers',
          customButtonRoleMatches,
        ),
        ...buildValidationIssueSources(
          registry,
          "primitive-choice.custom-button-role",
          componentDocUrls(registry, "Button", ["usage", "accessibility"]),
        ),
        matches: customButtonRoleMatches,
      }),
    );
  }

  if (customLinkRoleMatches > 0) {
    addIssue(
      buildCatalogValidationIssue("primitive-choice.custom-link-role", {
        evidence: buildEvidence(
          'Detected non-native elements with role="link" and interactive handlers',
          customLinkRoleMatches,
        ),
        ...buildValidationIssueSources(
          registry,
          "primitive-choice.custom-link-role",
          componentDocUrls(registry, "Link", ["usage", "accessibility"]),
        ),
        matches: customLinkRoleMatches,
      }),
    );
  }

  if (nestedInteractiveMatches > 0) {
    addIssue(
      buildCatalogValidationIssue("composition.nested-interactive-primitives", {
        evidence: buildEvidence(
          "Detected Button or Link elements containing another interactive Salt primitive",
          nestedInteractiveMatches,
        ),
        ...buildValidationIssueSources(
          registry,
          "composition.nested-interactive-primitives",
          [
            ...componentDocUrls(registry, "Button", ["usage", "accessibility"]),
            ...componentDocUrls(registry, "Link", ["usage", "accessibility"]),
          ],
        ),
        matches: nestedInteractiveMatches,
      }),
    );
  }

  if (iconOnlyMatches > 0) {
    addIssue(
      buildCatalogValidationIssue("a11y.button-accessible-name", {
        evidence: buildEvidence(
          "Detected icon-only Button content without an accessible label",
          iconOnlyMatches,
        ),
        canonical_source:
          componentDocUrls(registry, "Button", ["accessibility", "usage"])[0] ??
          null,
        source_urls: componentDocUrls(registry, "Button", [
          "accessibility",
          "usage",
        ]),
        matches: iconOnlyMatches,
      }),
    );
  }

  if (decorativeIconMatches > 0) {
    addIssue(
      buildCatalogValidationIssue("a11y.button-decorative-icon-hidden", {
        evidence: buildEvidence(
          "Detected decorative Button icons without aria-hidden",
          decorativeIconMatches,
        ),
        canonical_source:
          componentDocUrls(registry, "Button", ["accessibility", "usage"])[0] ??
          null,
        source_urls: unique([
          ...componentDocUrls(registry, "Button", ["accessibility", "usage"]),
          ...componentDocUrls(registry, "Icon", ["accessibility"]),
        ]),
        matches: decorativeIconMatches,
      }),
    );
  }

  if (passThroughWrapperNames.size > 0) {
    const wrapperNames = [...passThroughWrapperNames].sort();
    const wrapperTargets = [...passThroughWrapperTargets].sort();
    const targetDocs = unique(
      wrapperTargets.flatMap((componentName) =>
        componentDocUrls(registry, componentName, ["overview", "usage"]),
      ),
    );

    addIssue(
      buildCatalogValidationIssue("composition.pass-through-wrapper", {
        message: `Wrapper component${wrapperNames.length === 1 ? "" : "s"} ${wrapperNames.join(
          ", ",
        )} only forward${wrapperNames.length === 1 ? "s" : ""} props to Salt primitive${wrapperTargets.length === 1 ? "" : "s"} ${wrapperTargets.join(
          ", ",
        )} without adding structure or behavior.`,
        evidence: [
          `Detected pass-through wrapper component${wrapperNames.length === 1 ? "" : "s"}: ${wrapperNames.join(
            ", ",
          )}.`,
        ],
        ...buildValidationIssueSources(
          registry,
          "composition.pass-through-wrapper",
          targetDocs,
        ),
        fix_hints: {
          related_components: wrapperTargets,
        },
        matches: wrapperNames.length,
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
      matches,
    });
  }

  addTokenPolicyIssues(addIssue, tokenCounts);
  const { summary, issues } = finalizeValidationIssues(issueMap, maxIssues);

  if (versionContext.normalized && incompleteVersionMetadata) {
    missingData.push(
      "Some matched deprecations do not have explicit deprecated_in metadata; version filtering may be incomplete.",
    );
  }

  return {
    summary,
    issues,
    missing_data: missingData,
  };
}
