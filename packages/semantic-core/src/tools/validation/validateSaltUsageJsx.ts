import * as t from "@babel/types";
import {
  type ImportedSaltSymbol,
  resolveImportedSaltSymbol,
} from "../codeAnalysisCommon.js";

export function getJsxTagName(
  name: t.JSXIdentifier | t.JSXMemberExpression | t.JSXNamespacedName,
): string | null {
  if (t.isJSXIdentifier(name)) {
    return name.name;
  }
  if (t.isJSXMemberExpression(name) && t.isJSXIdentifier(name.property)) {
    return name.property.name;
  }
  return null;
}

export function getJsxAttributeName(attribute: t.JSXAttribute): string | null {
  if (t.isJSXIdentifier(attribute.name)) {
    return attribute.name.name;
  }
  return null;
}

export function hasAccessibleLabelAttribute(
  attributes: t.JSXAttribute[],
): boolean {
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

export function getStaticTextLength(
  children: t.JSXElement["children"],
): number {
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

export function hasIconIndicator(
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

export function hasDecorativeIconWithoutAriaHidden(
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

export function hasNavigationTargetAttribute(
  attributes: t.JSXAttribute[],
): boolean {
  return attributes.some((attribute) => {
    const name = getJsxAttributeName(attribute);
    return name === "href" || name === "to";
  });
}

export function hasInteractiveHandlerAttribute(
  attributes: t.JSXAttribute[],
): boolean {
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

export function hasNestedInteractiveSaltPrimitive(
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

export function isComponentLikeName(name: string): boolean {
  return /^[A-Z]/.test(name);
}

export function getReturnedJsxElement(
  node:
    | t.FunctionDeclaration
    | t.FunctionExpression
    | t.ArrowFunctionExpression,
): t.JSXElement | null {
  if (t.isArrowFunctionExpression(node) && t.isJSXElement(node.body)) {
    return node.body;
  }

  if (!t.isBlockStatement(node.body)) {
    return null;
  }

  const statements = node.body.body.filter(
    (statement) => !t.isEmptyStatement(statement),
  );
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

export function isPurePassThroughWrapper(
  functionName: string,
  parameter: t.Identifier | t.PatternLike | null | undefined,
  returnedElement: t.JSXElement,
  directImportByLocal: Map<string, ImportedSaltSymbol>,
  namespaceImportByLocal: Map<string, ImportedSaltSymbol>,
): ImportedSaltSymbol | null {
  if (
    !isComponentLikeName(functionName) ||
    !parameter ||
    !t.isIdentifier(parameter)
  ) {
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

export function getStaticStringAttributeValue(
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
    return expression.quasis
      .map((quasi) => quasi.value.raw)
      .join("")
      .trim();
  }

  return null;
}

export function expressionContainsNavigationCall(
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
