import * as t from "@babel/types";
import semver from "semver";
import type { DeprecationRecord, SaltRegistry, TokenRecord } from "../types.js";
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
import {
  buildCatalogValidationIssue,
  getValidationIssueCanonicalSource,
  getValidationIssueSourceUrls,
} from "./validation/issueCatalog.js";
import type {
  ValidationIssue,
  ValidationSeverity,
} from "./validation/shared.js";

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
const BORDER_LINE_STYLE_KEYS = new Set([
  "border",
  "borderTop",
  "borderRight",
  "borderBottom",
  "borderLeft",
  "outline",
]);
const BORDER_WIDTH_STYLE_KEYS = new Set([
  "borderWidth",
  "borderTopWidth",
  "borderRightWidth",
  "borderBottomWidth",
  "borderLeftWidth",
  "outlineWidth",
]);
const BACKGROUND_STYLE_KEYS = new Set(["background", "backgroundColor"]);
const BORDER_COLOR_STYLE_KEYS = new Set([
  "border",
  "borderTop",
  "borderRight",
  "borderBottom",
  "borderLeft",
  "borderColor",
  "borderTopColor",
  "borderRightColor",
  "borderBottomColor",
  "borderLeftColor",
  "outline",
  "outlineColor",
]);

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(value, max));
}

function buildEvidence(summary: string, matches: number): string[] {
  return [
    `${summary} (${matches} match${matches === 1 ? "" : "es"}).`,
  ];
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

function prependCanonicalSource(
  canonicalSource: string | null,
  sources: string[],
): string[] {
  return canonicalSource
    ? unique([canonicalSource, ...sources])
    : unique(sources);
}

function buildValidationIssueSources(
  registry: SaltRegistry,
  issueId: string,
  additionalSources: string[] = [],
): {
  canonical_source: string | null;
  source_urls: string[];
} {
  const canonicalSource = getValidationIssueCanonicalSource(registry, issueId);
  const sourceUrls = getValidationIssueSourceUrls(registry, issueId);

  return {
    canonical_source: canonicalSource,
    source_urls: prependCanonicalSource(canonicalSource, [
      ...sourceUrls,
      ...additionalSources,
    ]),
  };
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

function hasNavigationTargetAttribute(attributes: t.JSXAttribute[]): boolean {
  return attributes.some((attribute) => {
    const name = getJsxAttributeName(attribute);
    return name === "href" || name === "to";
  });
}

function hasInteractiveHandlerAttribute(attributes: t.JSXAttribute[]): boolean {
  return attributes.some((attribute) => {
    const name = getJsxAttributeName(attribute);
    return (
      name === "onClick" ||
      name === "onKeyDown" ||
      name === "onKeyUp" ||
      name === "onKeyPress"
    );
  });
}

function hasNestedInteractiveSaltPrimitive(
  children: Array<
    | t.JSXText
    | t.JSXExpressionContainer
    | t.JSXSpreadChild
    | t.JSXElement
    | t.JSXFragment
  >,
  directImportByLocal: Map<string, ImportedSaltSymbol>,
  namespaceImportByLocal: Map<string, ImportedSaltSymbol>,
): boolean {
  for (const child of children) {
    if (t.isJSXElement(child)) {
      const imported = resolveImportedSaltSymbol(
        child.openingElement.name,
        directImportByLocal,
        namespaceImportByLocal,
      );
      if (
        imported &&
        (imported.imported === "Button" || imported.imported === "Link")
      ) {
        return true;
      }

      if (
        hasNestedInteractiveSaltPrimitive(
          child.children,
          directImportByLocal,
          namespaceImportByLocal,
        )
      ) {
        return true;
      }
      continue;
    }

    if (
      t.isJSXFragment(child) &&
      hasNestedInteractiveSaltPrimitive(
        child.children,
        directImportByLocal,
        namespaceImportByLocal,
      )
    ) {
      return true;
    }
  }

  return false;
}

function isComponentLikeName(name: string): boolean {
  return /^[A-Z]/.test(name);
}

function getReturnedJsxElement(
  node: t.FunctionDeclaration | t.FunctionExpression | t.ArrowFunctionExpression,
): t.JSXElement | null {
  if (t.isArrowFunctionExpression(node) && t.isJSXElement(node.body)) {
    return node.body;
  }

  if (!t.isBlockStatement(node.body)) {
    return null;
  }

  const statements = node.body.body.filter((statement) => !t.isEmptyStatement(statement));
  if (statements.length !== 1 || !t.isReturnStatement(statements[0])) {
    return null;
  }

  const returned = statements[0].argument;
  return returned && t.isJSXElement(returned) ? returned : null;
}

function isPropsChildrenExpression(
  expression: t.Expression | t.JSXEmptyExpression,
  propsName: string,
): boolean {
  return (
    !t.isJSXEmptyExpression(expression) &&
    t.isMemberExpression(expression) &&
    !expression.computed &&
    t.isIdentifier(expression.object, { name: propsName }) &&
    t.isIdentifier(expression.property, { name: "children" })
  );
}

function isPurePassThroughWrapper(
  functionName: string,
  parameter: t.Identifier | t.PatternLike | null | undefined,
  returnedElement: t.JSXElement,
  directImportByLocal: Map<string, ImportedSaltSymbol>,
  namespaceImportByLocal: Map<string, ImportedSaltSymbol>,
): ImportedSaltSymbol | null {
  if (!isComponentLikeName(functionName) || !parameter || !t.isIdentifier(parameter)) {
    return null;
  }

  const imported = resolveImportedSaltSymbol(
    returnedElement.openingElement.name,
    directImportByLocal,
    namespaceImportByLocal,
  );
  if (!imported) {
    return null;
  }

  const attributes = returnedElement.openingElement.attributes;
  if (
    attributes.length !== 1 ||
    !t.isJSXSpreadAttribute(attributes[0]) ||
    !t.isIdentifier(attributes[0].argument, { name: parameter.name })
  ) {
    return null;
  }

  const meaningfulChildren = returnedElement.children.filter((child) => {
    if (!t.isJSXText(child)) {
      return true;
    }
    return child.value.trim().length > 0;
  });

  if (meaningfulChildren.length === 0) {
    return imported;
  }

  if (
    meaningfulChildren.length === 1 &&
    t.isJSXExpressionContainer(meaningfulChildren[0]) &&
    isPropsChildrenExpression(meaningfulChildren[0].expression, parameter.name)
  ) {
    return imported;
  }

  return null;
}

function getStaticStringAttributeValue(
  attribute: t.JSXAttribute | undefined,
): string | null {
  if (!attribute?.value) {
    return null;
  }

  if (t.isStringLiteral(attribute.value)) {
    return attribute.value.value.trim();
  }

  if (!t.isJSXExpressionContainer(attribute.value)) {
    return null;
  }

  const expression = attribute.value.expression;
  if (t.isJSXEmptyExpression(expression)) {
    return null;
  }
  if (t.isStringLiteral(expression)) {
    return expression.value.trim();
  }
  if (
    t.isTemplateLiteral(expression) &&
    expression.expressions.length === 0 &&
    expression.quasis.length > 0
  ) {
    return expression.quasis.map((quasi) => quasi.value.raw).join("").trim();
  }

  return null;
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

function isHardcodedSizeString(raw: string): boolean {
  return /^-?\d+(\.\d+)?(px|rem|em|vh|vw)?$/i.test(raw.trim());
}

function isHardcodedColorString(raw: string): boolean {
  return /^(#[0-9a-fA-F]{3,8}|rgb[a]?\([^)]*\)|hsl[a]?\([^)]*\))$/.test(
    raw.trim(),
  );
}

function normalizeStyleKey(keyName: string): string {
  return keyName.trim().replace(/-([a-z])/g, (_match, letter: string) =>
    letter.toUpperCase(),
  );
}

function getStaticStyleValue(value: t.Expression): string | null {
  if (t.isNumericLiteral(value)) {
    return String(value.value);
  }

  if (t.isStringLiteral(value)) {
    return value.value.trim();
  }

  if (
    t.isTemplateLiteral(value) &&
    value.expressions.length === 0 &&
    value.quasis.length > 0
  ) {
    return value.quasis.map((quasi) => quasi.value.raw).join("").trim();
  }

  return null;
}

function extractSaltTokenNames(value: t.Expression): string[] {
  const raw = getStaticStyleValue(value);
  if (!raw) {
    return [];
  }

  return unique(raw.match(/--salt-[A-Za-z0-9-]+/g) ?? []);
}

function extractSaltTokenNamesFromRaw(raw: string): string[] {
  return unique(raw.match(/--salt-[A-Za-z0-9-]+/g) ?? []);
}

function getTokenByName(
  tokenLookup: Map<string, TokenRecord>,
  tokenName: string,
): TokenRecord | undefined {
  return tokenLookup.get(tokenName.toLowerCase());
}

function isNeverDirectUseToken(
  tokenLookup: Map<string, TokenRecord>,
  tokenName: string,
): boolean {
  if (tokenName.toLowerCase().startsWith("--salt-palette-")) {
    return true;
  }

  return (
    getTokenByName(tokenLookup, tokenName)?.policy?.direct_component_use ===
    "never"
  );
}

function isSizeToken(tokenName: string): boolean {
  return tokenName.toLowerCase().startsWith("--salt-size-");
}

function isFixedSizeToken(tokenName: string): boolean {
  return tokenName.toLowerCase().startsWith("--salt-size-fixed-");
}

function containsLengthLiteral(raw: string): boolean {
  const value = raw.trim();
  return (
    /^-?\d+(\.\d+)?$/.test(value) ||
    /\b-?\d+(\.\d+)?(px|rem|em|vh|vw)\b/i.test(value)
  );
}

function usesNonFixedBorderThickness(
  keyName: string,
  value: t.Expression,
  tokenNames: string[],
): boolean {
  if (BORDER_WIDTH_STYLE_KEYS.has(keyName)) {
    if (isHardcodedSizeLiteral(value)) {
      return true;
    }

    return (
      tokenNames.some((tokenName) => isSizeToken(tokenName)) &&
      !tokenNames.some((tokenName) => isFixedSizeToken(tokenName))
    );
  }

  if (!BORDER_LINE_STYLE_KEYS.has(keyName)) {
    return false;
  }

  const raw = getStaticStyleValue(value);
  if (!raw) {
    return false;
  }

  if (tokenNames.some((tokenName) => isFixedSizeToken(tokenName))) {
    return false;
  }

  if (tokenNames.some((tokenName) => isSizeToken(tokenName))) {
    return true;
  }

  return containsLengthLiteral(raw);
}

function getContainerTokenLevel(
  tokenName: string,
  role: "background" | "borderColor",
): string | null {
  const match = tokenName.match(
    /^--salt-container-([a-z0-9]+)-(background|borderColor)(?:-|$)/i,
  );
  if (!match) {
    return null;
  }

  return match[2].toLowerCase() === role.toLowerCase() ? match[1] : null;
}

function isSeparatorLikeContext(contextHint: string | null | undefined): boolean {
  return /(separator|divider|splitter)/i.test(contextHint ?? "");
}

function hasSeparableColorMismatch(
  contextHint: string | null | undefined,
  keyName: string,
  tokenNames: string[],
): boolean {
  if (!isSeparatorLikeContext(contextHint)) {
    return false;
  }

  if (
    !BORDER_COLOR_STYLE_KEYS.has(keyName) &&
    !BACKGROUND_STYLE_KEYS.has(keyName)
  ) {
    return false;
  }

  if (tokenNames.length === 0) {
    return false;
  }

  const normalizedTokenNames = tokenNames.map((tokenName) =>
    tokenName.toLowerCase(),
  );

  if (
    normalizedTokenNames.some((tokenName) =>
      tokenName.startsWith("--salt-separable-"),
    )
  ) {
    return false;
  }

  return normalizedTokenNames.some(
    (tokenName) =>
      tokenName.includes("background") ||
      tokenName.includes("foreground") ||
      tokenName.includes("bordercolor") ||
      tokenName.includes("-border"),
  );
}

function analyzeStyleAttribute(
  attribute: t.JSXAttribute,
  tokenLookup: Map<string, TokenRecord>,
  contextHint?: string | null,
): {
  hardcodedSizeCount: number;
  hardcodedColorCount: number;
  directPaletteTokenCount: number;
  nonFixedBorderThicknessCount: number;
  containerLevelMismatchCount: number;
  separatorColorMismatchCount: number;
} {
  if (!attribute.value || !t.isJSXExpressionContainer(attribute.value)) {
    return {
      hardcodedSizeCount: 0,
      hardcodedColorCount: 0,
      directPaletteTokenCount: 0,
      nonFixedBorderThicknessCount: 0,
      containerLevelMismatchCount: 0,
      separatorColorMismatchCount: 0,
    };
  }

  const expression = attribute.value.expression;
  if (!t.isObjectExpression(expression)) {
    return {
      hardcodedSizeCount: 0,
      hardcodedColorCount: 0,
      directPaletteTokenCount: 0,
      nonFixedBorderThicknessCount: 0,
      containerLevelMismatchCount: 0,
      separatorColorMismatchCount: 0,
    };
  }

  let hardcodedSizeCount = 0;
  let hardcodedColorCount = 0;
  let directPaletteTokenCount = 0;
  let nonFixedBorderThicknessCount = 0;
  let separatorColorMismatchCount = 0;
  const backgroundContainerLevels = new Set<string>();
  const borderContainerLevels = new Set<string>();

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

    const normalizedKeyName = normalizeStyleKey(keyName);
    const tokenNames = extractSaltTokenNames(property.value);

    if (
      SIZE_STYLE_KEYS.has(normalizedKeyName) &&
      isHardcodedSizeLiteral(property.value)
    ) {
      hardcodedSizeCount += 1;
    }
    if (
      COLOR_STYLE_KEYS.has(normalizedKeyName) &&
      isHardcodedColorLiteral(property.value)
    ) {
      hardcodedColorCount += 1;
    }

    if (
      tokenNames.some((tokenName) => isNeverDirectUseToken(tokenLookup, tokenName))
    ) {
      directPaletteTokenCount += 1;
    }

    if (
      usesNonFixedBorderThickness(
        normalizedKeyName,
        property.value,
        tokenNames,
      )
    ) {
      nonFixedBorderThicknessCount += 1;
    }

    if (
      hasSeparableColorMismatch(contextHint, normalizedKeyName, tokenNames)
    ) {
      separatorColorMismatchCount += 1;
    }

    if (BACKGROUND_STYLE_KEYS.has(normalizedKeyName)) {
      for (const tokenName of tokenNames) {
        const level = getContainerTokenLevel(tokenName, "background");
        if (level) {
          backgroundContainerLevels.add(level);
        }
      }
    }

    if (BORDER_COLOR_STYLE_KEYS.has(normalizedKeyName)) {
      for (const tokenName of tokenNames) {
        const level = getContainerTokenLevel(tokenName, "borderColor");
        if (level) {
          borderContainerLevels.add(level);
        }
      }
    }
  }

  const containerLevelMismatchCount =
    backgroundContainerLevels.size === 1 &&
    borderContainerLevels.size === 1 &&
    [...backgroundContainerLevels][0] !== [...borderContainerLevels][0]
      ? 1
      : 0;

  return {
    hardcodedSizeCount,
    hardcodedColorCount,
    directPaletteTokenCount,
    nonFixedBorderThicknessCount,
    containerLevelMismatchCount,
    separatorColorMismatchCount,
  };
}

function analyzeCssLikeSource(
  code: string,
  tokenLookup: Map<string, TokenRecord>,
): {
  hardcodedSizeCount: number;
  hardcodedColorCount: number;
  directPaletteTokenCount: number;
  nonFixedBorderThicknessCount: number;
  containerLevelMismatchCount: number;
  separatorColorMismatchCount: number;
} {
  const counts = {
    hardcodedSizeCount: 0,
    hardcodedColorCount: 0,
    directPaletteTokenCount: 0,
    nonFixedBorderThicknessCount: 0,
    containerLevelMismatchCount: 0,
    separatorColorMismatchCount: 0,
  };

  const blockPattern = /([^{}]+)\{([^{}]*)\}/gms;
  let blockMatch: RegExpExecArray | null = blockPattern.exec(code);

  while (blockMatch) {
    const selector = blockMatch[1]?.trim() ?? "";
    const body = blockMatch[2] ?? "";
    const backgroundContainerLevels = new Set<string>();
    const borderContainerLevels = new Set<string>();
    const declarationPattern = /([A-Za-z-]+)\s*:\s*([^;{}]+)\s*;?/g;
    let declarationMatch: RegExpExecArray | null =
      declarationPattern.exec(body);

    while (declarationMatch) {
      const normalizedKeyName = normalizeStyleKey(declarationMatch[1] ?? "");
      const rawValue = (declarationMatch[2] ?? "").trim();
      const tokenNames = extractSaltTokenNamesFromRaw(rawValue);

      if (
        SIZE_STYLE_KEYS.has(normalizedKeyName) &&
        isHardcodedSizeString(rawValue)
      ) {
        counts.hardcodedSizeCount += 1;
      }

      if (
        COLOR_STYLE_KEYS.has(normalizedKeyName) &&
        isHardcodedColorString(rawValue)
      ) {
        counts.hardcodedColorCount += 1;
      }

      if (
        tokenNames.some((tokenName) => isNeverDirectUseToken(tokenLookup, tokenName))
      ) {
        counts.directPaletteTokenCount += 1;
      }

      if (
        usesNonFixedBorderThickness(
          normalizedKeyName,
          t.stringLiteral(rawValue),
          tokenNames,
        )
      ) {
        counts.nonFixedBorderThicknessCount += 1;
      }

      if (
        hasSeparableColorMismatch(selector, normalizedKeyName, tokenNames)
      ) {
        counts.separatorColorMismatchCount += 1;
      }

      if (BACKGROUND_STYLE_KEYS.has(normalizedKeyName)) {
        for (const tokenName of tokenNames) {
          const level = getContainerTokenLevel(tokenName, "background");
          if (level) {
            backgroundContainerLevels.add(level);
          }
        }
      }

      if (BORDER_COLOR_STYLE_KEYS.has(normalizedKeyName)) {
        for (const tokenName of tokenNames) {
          const level = getContainerTokenLevel(tokenName, "borderColor");
          if (level) {
            borderContainerLevels.add(level);
          }
        }
      }

      declarationMatch = declarationPattern.exec(body);
    }

    if (
      backgroundContainerLevels.size === 1 &&
      borderContainerLevels.size === 1 &&
      [...backgroundContainerLevels][0] !== [...borderContainerLevels][0]
    ) {
      counts.containerLevelMismatchCount += 1;
    }

    blockMatch = blockPattern.exec(code);
  }

  return counts;
}

function addTokenPolicyIssues(
  addIssue: (issue: ValidationIssue) => void,
  counts: {
    hardcodedSizeMatches: number;
    hardcodedColorMatches: number;
    directPaletteTokenMatches: number;
    nonFixedBorderThicknessMatches: number;
    containerLevelMismatchMatches: number;
    separatorColorMismatchMatches: number;
  },
): void {
  if (counts.hardcodedSizeMatches > 0) {
    addIssue(
      buildCatalogValidationIssue("tokens.hardcoded-size", {
        evidence: buildEvidence(
          "Detected hard-coded size values in analyzed styling",
          counts.hardcodedSizeMatches,
        ),
        matches: counts.hardcodedSizeMatches,
      }),
    );
  }

  if (counts.hardcodedColorMatches > 0) {
    addIssue(
      buildCatalogValidationIssue("tokens.hardcoded-color", {
        evidence: buildEvidence(
          "Detected hard-coded color values in analyzed styling",
          counts.hardcodedColorMatches,
        ),
        matches: counts.hardcodedColorMatches,
      }),
    );
  }

  if (counts.directPaletteTokenMatches > 0) {
    addIssue(
      buildCatalogValidationIssue("tokens.palette-direct-use", {
        evidence: buildEvidence(
          "Detected direct palette-token references in analyzed styling",
          counts.directPaletteTokenMatches,
        ),
        matches: counts.directPaletteTokenMatches,
      }),
    );
  }

  if (counts.nonFixedBorderThicknessMatches > 0) {
    addIssue(
      buildCatalogValidationIssue("tokens.border-thickness-not-fixed", {
        evidence: buildEvidence(
          "Detected border or separator thickness values that are not fixed-size tokens",
          counts.nonFixedBorderThicknessMatches,
        ),
        matches: counts.nonFixedBorderThicknessMatches,
      }),
    );
  }

  if (counts.containerLevelMismatchMatches > 0) {
    addIssue(
      buildCatalogValidationIssue("tokens.container-level-mismatch", {
        evidence: buildEvidence(
          "Detected container background and border tokens from different levels",
          counts.containerLevelMismatchMatches,
        ),
        matches: counts.containerLevelMismatchMatches,
      }),
    );
  }

  if (counts.separatorColorMismatchMatches > 0) {
    addIssue(
      buildCatalogValidationIssue("tokens.separator-color-not-separable", {
        evidence: buildEvidence(
          "Detected separator-like styling without separable token usage",
          counts.separatorColorMismatchMatches,
        ),
        matches: counts.separatorColorMismatchMatches,
      }),
    );
  }
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

  let hardcodedSizeMatches = 0;
  let hardcodedColorMatches = 0;
  let directPaletteTokenMatches = 0;
  let nonFixedBorderThicknessMatches = 0;
  let containerLevelMismatchMatches = 0;
  let separatorColorMismatchMatches = 0;
  const tokenLookup = new Map<string, TokenRecord>(
    registry.tokens.map((token) => [token.name.toLowerCase(), token] as const),
  );
  const issueMap = toToolIssueMap();
  const addIssue = (issue: ValidationIssue): void => {
    const existing = issueMap.get(issue.id);
    if (existing) {
      existing.matches += issue.matches;
      existing.confidence = Math.max(existing.confidence, issue.confidence);
      existing.evidence = unique([...existing.evidence, ...issue.evidence]);
      existing.source_urls = unique([
        ...existing.source_urls,
        ...issue.source_urls,
      ]);
      if (!existing.canonical_source && issue.canonical_source) {
        existing.canonical_source = issue.canonical_source;
      }
      if (!existing.suggested_fix && issue.suggested_fix) {
        existing.suggested_fix = issue.suggested_fix;
      }
      return;
    }
    issueMap.set(issue.id, issue);
  };

  let analysis: SaltCodeAnalysis;
  try {
    analysis = input.analysis ?? analyzeSaltCode(code);
  } catch (error) {
    const cssLikeAnalysis = analyzeCssLikeSource(code, tokenLookup);
    hardcodedSizeMatches += cssLikeAnalysis.hardcodedSizeCount;
    hardcodedColorMatches += cssLikeAnalysis.hardcodedColorCount;
    directPaletteTokenMatches += cssLikeAnalysis.directPaletteTokenCount;
    nonFixedBorderThicknessMatches +=
      cssLikeAnalysis.nonFixedBorderThicknessCount;
    containerLevelMismatchMatches +=
      cssLikeAnalysis.containerLevelMismatchCount;
    separatorColorMismatchMatches +=
      cssLikeAnalysis.separatorColorMismatchCount;

    missingData.push(
      "Code could not be parsed as JSX/TSX; validation fell back to a conservative stylesheet scan.",
      error instanceof Error ? error.message : String(error),
    );

    addTokenPolicyIssues(addIssue, {
      hardcodedSizeMatches,
      hardcodedColorMatches,
      directPaletteTokenMatches,
      nonFixedBorderThicknessMatches,
      containerLevelMismatchMatches,
      separatorColorMismatchMatches,
    });

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

    return {
      summary,
      issues: sortedIssues.slice(0, maxIssues),
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
        const roleValue = getStaticStringAttributeValue(
          attributes.find((attribute) => getJsxAttributeName(attribute) === "role"),
        )?.toLowerCase();
        const hasHandlers = hasInteractiveHandlerAttribute(attributes);

        if (tagName === "button") {
          nativeButtonMatches += 1;
        } else if (tagName === "a" && hasNavigationTargetAttribute(attributes)) {
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
        const analysis = analyzeStyleAttribute(
          styleAttribute,
          tokenLookup,
          imported.imported,
        );
        hardcodedSizeMatches += analysis.hardcodedSizeCount;
        hardcodedColorMatches += analysis.hardcodedColorCount;
        directPaletteTokenMatches += analysis.directPaletteTokenCount;
        nonFixedBorderThicknessMatches += analysis.nonFixedBorderThicknessCount;
        containerLevelMismatchMatches += analysis.containerLevelMismatchCount;
        separatorColorMismatchMatches += analysis.separatorColorMismatchCount;
      }

      if (imported.imported === "Button") {
        const hasNavigationProp = hasNavigationTargetAttribute(attributes);
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
        ...buildValidationIssueSources(registry, "component-choice.navigation", [
          ...componentDocUrls(registry, "Button", ["usage"]),
          ...componentDocUrls(registry, "Link", ["usage"]),
        ]),
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
        ...buildValidationIssueSources(registry, "primitive-choice.link-action", [
          ...componentDocUrls(registry, "Link", ["usage"]),
          ...componentDocUrls(registry, "Button", ["usage"]),
        ]),
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

  addTokenPolicyIssues(addIssue, {
    hardcodedSizeMatches,
    hardcodedColorMatches,
    directPaletteTokenMatches,
    nonFixedBorderThicknessMatches,
    containerLevelMismatchMatches,
    separatorColorMismatchMatches,
  });

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
