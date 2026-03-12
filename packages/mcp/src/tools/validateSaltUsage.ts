import * as t from "@babel/types";
import semver from "semver";
import type { DeprecationRecord, SaltRegistry } from "../types.js";
import {
  analyzeSaltCode,
  buildPropDeprecationIndex,
  createVersionContext,
  type ImportedSaltSymbol,
  isDeprecationRelevant,
  normalizeComponentKey,
  normalizeVersion,
  resolveImportedSaltSymbol,
  resolveNamespaceMemberImportedSaltSymbol,
  type SaltCodeAnalysis,
  traverseAst,
  type VersionContext,
} from "./codeAnalysisCommon.js";
import { unique } from "./utils.js";

type ValidationSeverity = "info" | "warning" | "error";

export interface ValidateSaltUsageInput {
  code: string;
  framework?: string;
  package_version?: string;
  max_issues?: number;
  analysis?: SaltCodeAnalysis;
}

export interface ValidationIssue {
  id: string;
  severity: ValidationSeverity;
  title: string;
  message: string;
  suggested_fix: string | null;
  confidence: number;
  source_urls: string[];
  matches: number;
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
const SIZE_STYLE_KEYS = new Set([
  "height",
  "minHeight",
  "maxHeight",
  "width",
  "minWidth",
  "maxWidth",
  "margin",
  "marginTop",
  "marginRight",
  "marginBottom",
  "marginLeft",
  "padding",
  "paddingTop",
  "paddingRight",
  "paddingBottom",
  "paddingLeft",
  "gap",
  "fontSize",
  "lineHeight",
]);
const COLOR_STYLE_KEYS = new Set([
  "color",
  "background",
  "backgroundColor",
  "borderColor",
]);
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(value, max));
}

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function deprecationSeverity(
  deprecation: DeprecationRecord,
  version: VersionContext,
): ValidationSeverity {
  if (!version.normalized) {
    return deprecation.removed_in ? "warning" : "warning";
  }

  const removedIn = normalizeVersion(deprecation.removed_in);
  if (removedIn && semver.gte(version.normalized, removedIn)) {
    return "error";
  }

  return "warning";
}

function componentDocUrls(
  registry: SaltRegistry,
  name: string,
  preferred: Array<"overview" | "usage" | "accessibility" | "examples">,
): string[] {
  const component = registry.components.find((item) => item.name === name);
  if (!component) {
    return [];
  }

  const urls = preferred
    .map((key) => component.related_docs[key])
    .filter((url): url is string => Boolean(url));

  return unique(urls);
}

function buildDeprecationFix(deprecation: DeprecationRecord): string | null {
  const [firstMigration] = deprecation.migration.details;
  if (firstMigration) {
    return `Replace ${firstMigration.from} with ${firstMigration.to}.`;
  }

  if (deprecation.replacement.name) {
    const replacementType = deprecation.replacement.type
      ? `${deprecation.replacement.type} `
      : "";
    return `Use ${replacementType}${deprecation.replacement.name}.`;
  }

  if (deprecation.replacement.notes) {
    return deprecation.replacement.notes;
  }

  return null;
}

function severityRank(severity: ValidationSeverity): number {
  if (severity === "error") {
    return 0;
  }
  if (severity === "warning") {
    return 1;
  }
  return 2;
}

function toToolIssueMap() {
  return new Map<string, ValidationIssue>();
}

function getJsxTagName(
  name: t.JSXIdentifier | t.JSXMemberExpression | t.JSXNamespacedName,
): string | null {
  if (t.isJSXIdentifier(name)) {
    return name.name;
  }
  if (t.isJSXMemberExpression(name)) {
    if (t.isJSXIdentifier(name.property)) {
      return name.property.name;
    }
  }
  return null;
}

function getJsxAttributeName(attribute: t.JSXAttribute): string | null {
  if (t.isJSXIdentifier(attribute.name)) {
    return attribute.name.name;
  }
  return null;
}

function hasAccessibleLabelAttribute(attributes: t.JSXAttribute[]): boolean {
  return attributes.some((attribute) => {
    const name = getJsxAttributeName(attribute);
    return (
      name === "aria-label" || name === "aria-labelledby" || name === "title"
    );
  });
}

function getStaticBooleanAttributeValue(
  attribute: t.JSXAttribute | undefined,
): boolean | null {
  if (!attribute) {
    return null;
  }

  if (!attribute.value) {
    return true;
  }

  if (t.isStringLiteral(attribute.value)) {
    const value = attribute.value.value.trim().toLowerCase();
    if (value === "true") {
      return true;
    }
    if (value === "false") {
      return false;
    }
    return null;
  }

  if (!t.isJSXExpressionContainer(attribute.value)) {
    return null;
  }

  const expression = attribute.value.expression;
  if (t.isJSXEmptyExpression(expression)) {
    return null;
  }
  if (t.isBooleanLiteral(expression)) {
    return expression.value;
  }
  if (t.isStringLiteral(expression)) {
    const value = expression.value.trim().toLowerCase();
    if (value === "true") {
      return true;
    }
    if (value === "false") {
      return false;
    }
  }

  return null;
}

function getStaticTextLength(children: t.JSXElement["children"]): number {
  let length = 0;
  for (const child of children) {
    if (t.isJSXText(child)) {
      const text = child.value.replace(/\s+/g, " ").trim();
      length += text.length;
      continue;
    }
    if (!t.isJSXExpressionContainer(child)) {
      continue;
    }

    const expression = child.expression;
    if (t.isStringLiteral(expression)) {
      length += expression.value.trim().length;
      continue;
    }
    if (t.isNumericLiteral(expression)) {
      length += String(expression.value).length;
      continue;
    }
    if (
      t.isTemplateLiteral(expression) &&
      expression.expressions.length === 0 &&
      expression.quasis.length > 0
    ) {
      const raw = expression.quasis.map((quasi) => quasi.value.raw).join("");
      length += raw.replace(/\s+/g, " ").trim().length;
    }
  }

  return length;
}

function hasIconIndicator(
  element: t.JSXElement,
  attributes: t.JSXAttribute[],
): boolean {
  for (const attribute of attributes) {
    const name = getJsxAttributeName(attribute);
    if (!name) {
      continue;
    }
    if (
      name === "icon" ||
      name === "startAdornment" ||
      name === "endAdornment"
    ) {
      return true;
    }
  }

  for (const child of element.children) {
    if (!t.isJSXElement(child)) {
      continue;
    }
    const childName = getJsxTagName(child.openingElement.name);
    if (childName?.includes("Icon")) {
      return true;
    }
  }

  return false;
}

function isIconLikeElement(
  element: t.JSXElement,
  directImportByLocal: Map<string, ImportedSaltSymbol>,
  namespaceImportByLocal: Map<string, ImportedSaltSymbol>,
): boolean {
  const imported = resolveImportedSaltSymbol(
    element.openingElement.name,
    directImportByLocal,
    namespaceImportByLocal,
  );
  if (imported?.packageName === "@salt-ds/icons") {
    return true;
  }

  const tagName = getJsxTagName(element.openingElement.name);
  return Boolean(tagName?.endsWith("Icon"));
}

function hasDecorativeIconWithoutAriaHiddenInExpression(
  expression: t.Expression | t.JSXEmptyExpression,
  directImportByLocal: Map<string, ImportedSaltSymbol>,
  namespaceImportByLocal: Map<string, ImportedSaltSymbol>,
  inheritedAriaHidden = false,
): boolean {
  if (t.isJSXEmptyExpression(expression)) {
    return false;
  }
  if (t.isJSXElement(expression)) {
    return hasDecorativeIconWithoutAriaHidden(
      expression,
      directImportByLocal,
      namespaceImportByLocal,
      inheritedAriaHidden,
    );
  }
  if (t.isJSXFragment(expression)) {
    return hasDecorativeIconWithoutAriaHiddenInChildren(
      expression.children,
      directImportByLocal,
      namespaceImportByLocal,
      inheritedAriaHidden,
    );
  }
  if (t.isConditionalExpression(expression)) {
    return (
      hasDecorativeIconWithoutAriaHiddenInExpression(
        expression.consequent,
        directImportByLocal,
        namespaceImportByLocal,
        inheritedAriaHidden,
      ) ||
      hasDecorativeIconWithoutAriaHiddenInExpression(
        expression.alternate,
        directImportByLocal,
        namespaceImportByLocal,
        inheritedAriaHidden,
      )
    );
  }
  if (t.isLogicalExpression(expression)) {
    return (
      hasDecorativeIconWithoutAriaHiddenInExpression(
        expression.left,
        directImportByLocal,
        namespaceImportByLocal,
        inheritedAriaHidden,
      ) ||
      hasDecorativeIconWithoutAriaHiddenInExpression(
        expression.right,
        directImportByLocal,
        namespaceImportByLocal,
        inheritedAriaHidden,
      )
    );
  }
  if (t.isSequenceExpression(expression)) {
    return expression.expressions.some((part) =>
      hasDecorativeIconWithoutAriaHiddenInExpression(
        part,
        directImportByLocal,
        namespaceImportByLocal,
        inheritedAriaHidden,
      ),
    );
  }
  if (t.isParenthesizedExpression(expression)) {
    return hasDecorativeIconWithoutAriaHiddenInExpression(
      expression.expression,
      directImportByLocal,
      namespaceImportByLocal,
      inheritedAriaHidden,
    );
  }
  if (t.isTSAsExpression(expression) || t.isTSSatisfiesExpression(expression)) {
    return hasDecorativeIconWithoutAriaHiddenInExpression(
      expression.expression,
      directImportByLocal,
      namespaceImportByLocal,
      inheritedAriaHidden,
    );
  }
  if (t.isTSNonNullExpression(expression)) {
    return hasDecorativeIconWithoutAriaHiddenInExpression(
      expression.expression,
      directImportByLocal,
      namespaceImportByLocal,
      inheritedAriaHidden,
    );
  }

  return false;
}

function hasDecorativeIconWithoutAriaHiddenInChildren(
  children: Array<
    | t.JSXText
    | t.JSXExpressionContainer
    | t.JSXSpreadChild
    | t.JSXElement
    | t.JSXFragment
  >,
  directImportByLocal: Map<string, ImportedSaltSymbol>,
  namespaceImportByLocal: Map<string, ImportedSaltSymbol>,
  inheritedAriaHidden = false,
): boolean {
  for (const child of children) {
    if (t.isJSXElement(child)) {
      if (
        hasDecorativeIconWithoutAriaHidden(
          child,
          directImportByLocal,
          namespaceImportByLocal,
          inheritedAriaHidden,
        )
      ) {
        return true;
      }
      continue;
    }

    if (t.isJSXFragment(child)) {
      if (
        hasDecorativeIconWithoutAriaHiddenInChildren(
          child.children,
          directImportByLocal,
          namespaceImportByLocal,
          inheritedAriaHidden,
        )
      ) {
        return true;
      }
      continue;
    }

    if (
      t.isJSXExpressionContainer(child) &&
      hasDecorativeIconWithoutAriaHiddenInExpression(
        child.expression,
        directImportByLocal,
        namespaceImportByLocal,
        inheritedAriaHidden,
      )
    ) {
      return true;
    }
  }

  return false;
}

function hasDecorativeIconWithoutAriaHidden(
  element: t.JSXElement,
  directImportByLocal: Map<string, ImportedSaltSymbol>,
  namespaceImportByLocal: Map<string, ImportedSaltSymbol>,
  inheritedAriaHidden = false,
): boolean {
  const attributes = element.openingElement.attributes.filter(
    (attribute): attribute is t.JSXAttribute => t.isJSXAttribute(attribute),
  );
  const ariaHiddenAttribute = attributes.find(
    (attribute) => getJsxAttributeName(attribute) === "aria-hidden",
  );
  const ariaHiddenValue = getStaticBooleanAttributeValue(ariaHiddenAttribute);
  const currentAriaHidden = inheritedAriaHidden || ariaHiddenValue === true;

  if (
    isIconLikeElement(element, directImportByLocal, namespaceImportByLocal) &&
    !currentAriaHidden
  ) {
    return true;
  }

  return hasDecorativeIconWithoutAriaHiddenInChildren(
    element.children,
    directImportByLocal,
    namespaceImportByLocal,
    currentAriaHidden,
  );
}

function expressionContainsNavigationCall(
  code: string,
  expression: t.Expression | t.JSXEmptyExpression,
): boolean {
  if (t.isJSXEmptyExpression(expression)) {
    return false;
  }

  if (expression.start == null || expression.end == null) {
    return false;
  }

  const source = code.slice(expression.start, expression.end);
  return /(navigate\s*\(|router\s*\.\s*push\s*\(|history\s*\.\s*push\s*\()/i.test(
    source,
  );
}

function isHardcodedSizeLiteral(value: t.Expression): boolean {
  if (t.isNumericLiteral(value)) {
    return true;
  }
  if (t.isStringLiteral(value)) {
    return /^-?\d+(\.\d+)?(px|rem|em|vh|vw)$/i.test(value.value.trim());
  }
  if (
    t.isTemplateLiteral(value) &&
    value.expressions.length === 0 &&
    value.quasis.length > 0
  ) {
    const raw = value.quasis
      .map((quasi) => quasi.value.raw)
      .join("")
      .trim();
    return /^-?\d+(\.\d+)?(px|rem|em|vh|vw)$/i.test(raw);
  }
  return false;
}

function isHardcodedColorLiteral(value: t.Expression): boolean {
  const isColorString = (raw: string): boolean =>
    /^(#[0-9a-fA-F]{3,8}|rgb[a]?\([^)]*\)|hsl[a]?\([^)]*\))$/.test(raw.trim());

  if (t.isStringLiteral(value)) {
    return isColorString(value.value);
  }
  if (
    t.isTemplateLiteral(value) &&
    value.expressions.length === 0 &&
    value.quasis.length > 0
  ) {
    return isColorString(value.quasis.map((quasi) => quasi.value.raw).join(""));
  }
  return false;
}

function analyzeStyleAttribute(attribute: t.JSXAttribute): {
  hardcodedSizeCount: number;
  hardcodedColorCount: number;
} {
  if (!attribute.value || !t.isJSXExpressionContainer(attribute.value)) {
    return { hardcodedSizeCount: 0, hardcodedColorCount: 0 };
  }

  const expression = attribute.value.expression;
  if (!t.isObjectExpression(expression)) {
    return { hardcodedSizeCount: 0, hardcodedColorCount: 0 };
  }

  let hardcodedSizeCount = 0;
  let hardcodedColorCount = 0;

  for (const property of expression.properties) {
    if (!t.isObjectProperty(property) || property.computed) {
      continue;
    }

    const keyName = t.isIdentifier(property.key)
      ? property.key.name
      : t.isStringLiteral(property.key)
        ? property.key.value
        : null;
    if (!keyName || !t.isExpression(property.value)) {
      continue;
    }

    if (
      SIZE_STYLE_KEYS.has(keyName) &&
      isHardcodedSizeLiteral(property.value)
    ) {
      hardcodedSizeCount += 1;
    }
    if (
      COLOR_STYLE_KEYS.has(keyName) &&
      isHardcodedColorLiteral(property.value)
    ) {
      hardcodedColorCount += 1;
    }
  }

  return { hardcodedSizeCount, hardcodedColorCount };
}

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

  let analysis: SaltCodeAnalysis;
  try {
    analysis = input.analysis ?? analyzeSaltCode(code);
  } catch (error) {
    return {
      summary: { errors: 0, warnings: 0, infos: 0 },
      issues: [],
      missing_data: [
        "Unable to parse code for validation.",
        error instanceof Error ? error.message : String(error),
      ],
    };
  }

  const { ast, saltImports, directImportByLocal, namespaceImportByLocal } =
    analysis;

  if (saltImports.length === 0) {
    missingData.push(
      "No @salt-ds imports were detected; component-choice and deprecation checks are limited.",
    );
  }

  const issueMap = toToolIssueMap();
  const addIssue = (issue: ValidationIssue): void => {
    const existing = issueMap.get(issue.id);
    if (existing) {
      existing.matches += issue.matches;
      existing.confidence = Math.max(existing.confidence, issue.confidence);
      existing.source_urls = unique([
        ...existing.source_urls,
        ...issue.source_urls,
      ]);
      if (!existing.suggested_fix && issue.suggested_fix) {
        existing.suggested_fix = issue.suggested_fix;
      }
      return;
    }
    issueMap.set(issue.id, issue);
  };
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
      severity: component.status === "deprecated" ? "error" : "warning",
      title: `${component.name} is ${component.status}`,
      message: `Imported component ${component.name} has status '${component.status}'. Prefer stable components for production usage.`,
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
        severity: deprecationSeverity(deprecation, versionContext),
        title: `Deprecated API imported: ${deprecation.name}`,
        message:
          deprecation.replacement.notes ??
          `${deprecation.name} is deprecated in ${deprecation.package}.`,
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
  let navigationMatches = 0;
  let imperativeNavigationMatches = 0;
  let iconOnlyMatches = 0;
  let decorativeIconMatches = 0;
  let hardcodedSizeMatches = 0;
  let hardcodedColorMatches = 0;
  const deprecatedPropUsageCounts = new Map<string, number>();

  traverseAst(ast, {
    JSXOpeningElement(path) {
      const imported = collectResolvedUsage(path.node.name);
      if (!imported) {
        return;
      }

      const attributes = path.node.attributes.filter(
        (attribute): attribute is t.JSXAttribute => t.isJSXAttribute(attribute),
      );
      const styleAttribute = attributes.find(
        (attribute) => getJsxAttributeName(attribute) === "style",
      );
      if (styleAttribute) {
        const analysis = analyzeStyleAttribute(styleAttribute);
        hardcodedSizeMatches += analysis.hardcodedSizeCount;
        hardcodedColorMatches += analysis.hardcodedColorCount;
      }

      if (imported.imported === "Button") {
        const hasNavigationProp = attributes.some((attribute) => {
          const name = getJsxAttributeName(attribute);
          return name === "href" || name === "to";
        });
        if (hasNavigationProp) {
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
      if (!imported || imported.imported !== "Button") {
        return;
      }

      const attributes = opening.attributes.filter(
        (attribute): attribute is t.JSXAttribute => t.isJSXAttribute(attribute),
      );
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
    },
  });

  if (navigationMatches > 0) {
    addIssue({
      id: "component-choice.navigation",
      severity: "error",
      title: "Button used for navigation",
      message: "Use Link for navigation rather than Button.",
      suggested_fix:
        "Replace Button with Link and keep an accessible link label.",
      confidence: 0.98,
      source_urls: unique([
        ...componentDocUrls(registry, "Button", ["usage"]),
        ...componentDocUrls(registry, "Link", ["usage"]),
      ]),
      matches: navigationMatches,
    });
  }

  if (imperativeNavigationMatches > 0) {
    addIssue({
      id: "component-choice.navigation-handler",
      severity: "warning",
      title: "Button click handler appears to navigate",
      message:
        "Button onClick appears to trigger route navigation. Prefer Link when the primary intent is navigation.",
      suggested_fix:
        "Use Link for direct navigation; keep Button for non-navigation actions.",
      confidence: 0.78,
      source_urls: unique([
        ...componentDocUrls(registry, "Button", ["usage"]),
        ...componentDocUrls(registry, "Link", ["usage"]),
      ]),
      matches: imperativeNavigationMatches,
    });
  }

  if (iconOnlyMatches > 0) {
    addIssue({
      id: "a11y.button-accessible-name",
      severity: "error",
      title: "Icon-only Button missing accessible name",
      message:
        "Button appears icon-only without aria-label, aria-labelledby, or title.",
      suggested_fix:
        "Add aria-label/aria-labelledby, or provide visible text for the Button.",
      confidence: 0.88,
      source_urls: componentDocUrls(registry, "Button", [
        "accessibility",
        "usage",
      ]),
      matches: iconOnlyMatches,
    });
  }

  if (decorativeIconMatches > 0) {
    addIssue({
      id: "a11y.button-decorative-icon-hidden",
      severity: "warning",
      title: "Decorative Button icon should be hidden from assistive tech",
      message:
        "Decorative icons inside Button should use aria-hidden to avoid duplicate announcements.",
      suggested_fix:
        "Add aria-hidden to decorative Button icons when the Button already has visible text or another accessible name.",
      confidence: 0.9,
      source_urls: unique([
        ...componentDocUrls(registry, "Button", ["accessibility", "usage"]),
        ...componentDocUrls(registry, "Icon", ["accessibility"]),
      ]),
      matches: decorativeIconMatches,
    });
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
      severity: deprecationSeverity(deprecation, versionContext),
      title: `Deprecated prop used: ${deprecation.name}`,
      message:
        deprecation.replacement.notes ??
        `${deprecation.name} is deprecated in ${deprecation.package}.`,
      suggested_fix: buildDeprecationFix(deprecation),
      confidence: 0.9,
      source_urls: deprecation.source_urls,
      matches,
    });
  }

  if (hardcodedSizeMatches > 0) {
    addIssue({
      id: "tokens.hardcoded-size",
      severity: "warning",
      title: "Hard-coded sizing value detected",
      message:
        "Hard-coded sizing values were detected. Prefer semantic Salt tokens for control size and spacing.",
      suggested_fix:
        "Replace hard-coded CSS values with semantic Salt tokens (for example --salt-size-base).",
      confidence: 0.82,
      source_urls: [],
      matches: hardcodedSizeMatches,
    });
  }

  if (hardcodedColorMatches > 0) {
    addIssue({
      id: "tokens.hardcoded-color",
      severity: "warning",
      title: "Hard-coded color value detected",
      message:
        "Hard-coded color values were detected. Prefer Salt semantic color tokens.",
      suggested_fix:
        "Replace hard-coded color literals with semantic Salt color tokens.",
      confidence: 0.82,
      source_urls: [],
      matches: hardcodedColorMatches,
    });
  }

  const sortedIssues = [...issueMap.values()].sort((left, right) => {
    const severityDelta =
      severityRank(left.severity) - severityRank(right.severity);
    if (severityDelta !== 0) {
      return severityDelta;
    }
    if (left.matches !== right.matches) {
      return right.matches - left.matches;
    }
    return right.confidence - left.confidence;
  });

  const summary = sortedIssues.reduce(
    (accumulator, issue) => {
      if (issue.severity === "error") {
        accumulator.errors += 1;
      } else if (issue.severity === "warning") {
        accumulator.warnings += 1;
      } else {
        accumulator.infos += 1;
      }
      return accumulator;
    },
    { errors: 0, warnings: 0, infos: 0 },
  );
  const issues = sortedIssues.slice(0, maxIssues);

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
