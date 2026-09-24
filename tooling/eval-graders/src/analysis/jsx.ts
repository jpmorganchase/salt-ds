/**
 * Syntactic analysis of one TS/TSX module: import bindings and every JSX element with
 * its resolved origin, literal attribute values and parent chain. No type information;
 * the checks built on this decide composition rules from the tree alone.
 */
import ts from "typescript";
import type { Evidence } from "../protocol";

export type AttributeValue =
  | { kind: "literal"; value: boolean | string | number | null; text: string }
  | { kind: "expression"; text: string };

export interface ImportBinding {
  /** Local identifier in this module. */
  local: string;
  /** Exported name in the source module, "default" for default imports, "*" for namespaces. */
  imported: string;
  from: string;
  line: number;
  column: number;
  /** The import statement, for evidence. */
  text: string;
}

export interface JsxElementInfo {
  file: string;
  /** Tag as written, e.g. `FormField` or `Salt.FormField`. */
  tagName: string;
  /** Exported name of the component: the imported name when the tag comes from an import, else the written name. */
  name: string;
  /** Module specifier the component was imported from, or null when defined locally or intrinsic. */
  from: string | null;
  attributes: Map<string, AttributeValue>;
  spread: boolean;
  parent: JsxElementInfo | null;
  line: number;
  column: number;
  text: string;
}

export interface FileAnalysis {
  file: string;
  source: ts.SourceFile;
  imports: ImportBinding[];
  elements: JsxElementInfo[];
}

export interface ElementSelector {
  element: string;
  from?: string;
}

const EVIDENCE_TEXT_LIMIT = 200;

export function scriptKind(path: string): ts.ScriptKind {
  if (path.endsWith(".tsx")) return ts.ScriptKind.TSX;
  if (path.endsWith(".jsx")) return ts.ScriptKind.JSX;
  if (/\.[cm]?js$/.test(path)) return ts.ScriptKind.JS;
  return ts.ScriptKind.TS;
}

export function isCodeFile(path: string): boolean {
  return /\.[cm]?[jt]sx?$/.test(path);
}

export function parseSource(path: string, content: string): ts.SourceFile {
  return ts.createSourceFile(
    path,
    content,
    ts.ScriptTarget.Latest,
    true,
    scriptKind(path),
  );
}

function collectImports(source: ts.SourceFile): ImportBinding[] {
  const bindings: ImportBinding[] = [];
  for (const statement of source.statements) {
    if (
      !ts.isImportDeclaration(statement) ||
      !ts.isStringLiteral(statement.moduleSpecifier)
    ) {
      continue;
    }
    const from = statement.moduleSpecifier.text;
    const clause = statement.importClause;
    if (!clause) continue;
    const { line, character } = source.getLineAndCharacterOfPosition(
      statement.getStart(source),
    );
    const location = {
      from,
      line: line + 1,
      column: character + 1,
      text: statement.getText(source).slice(0, EVIDENCE_TEXT_LIMIT),
    };
    if (clause.name) {
      bindings.push({
        local: clause.name.text,
        imported: "default",
        ...location,
      });
    }
    const named = clause.namedBindings;
    if (named && ts.isNamespaceImport(named)) {
      bindings.push({ local: named.name.text, imported: "*", ...location });
    } else if (named && ts.isNamedImports(named)) {
      for (const element of named.elements) {
        const imported = element.propertyName ?? element.name;
        bindings.push({
          local: element.name.text,
          imported: ts.isIdentifier(imported)
            ? imported.text
            : imported.getText(source),
          ...location,
        });
      }
    }
  }
  return bindings;
}

function literalFromExpression(
  expression: ts.Expression,
  source: ts.SourceFile,
): AttributeValue | null {
  const text = expression.getText(source);
  if (expression.kind === ts.SyntaxKind.TrueKeyword) {
    return { kind: "literal", value: true, text };
  }
  if (expression.kind === ts.SyntaxKind.FalseKeyword) {
    return { kind: "literal", value: false, text };
  }
  if (expression.kind === ts.SyntaxKind.NullKeyword) {
    return { kind: "literal", value: null, text };
  }
  if (ts.isNumericLiteral(expression)) {
    return { kind: "literal", value: Number(expression.text), text };
  }
  if (
    ts.isStringLiteral(expression) ||
    ts.isNoSubstitutionTemplateLiteral(expression)
  ) {
    return { kind: "literal", value: expression.text, text };
  }
  if (
    ts.isPrefixUnaryExpression(expression) &&
    expression.operator === ts.SyntaxKind.MinusToken &&
    ts.isNumericLiteral(expression.operand)
  ) {
    return { kind: "literal", value: -Number(expression.operand.text), text };
  }
  if (ts.isParenthesizedExpression(expression)) {
    return literalFromExpression(expression.expression, source);
  }
  return null;
}

function attributeValue(
  attribute: ts.JsxAttribute,
  source: ts.SourceFile,
): AttributeValue {
  const initializer = attribute.initializer;
  if (!initializer) {
    return { kind: "literal", value: true, text: attribute.getText(source) };
  }
  if (ts.isStringLiteral(initializer)) {
    return {
      kind: "literal",
      value: initializer.text,
      text: initializer.getText(source),
    };
  }
  if (ts.isJsxExpression(initializer) && initializer.expression) {
    return (
      literalFromExpression(initializer.expression, source) ?? {
        kind: "expression",
        text: initializer.expression.getText(source),
      }
    );
  }
  return { kind: "expression", text: initializer.getText(source) };
}

function resolveTag(
  tag: ts.JsxTagNameExpression,
  imports: ImportBinding[],
  source: ts.SourceFile,
): { name: string; from: string | null } {
  if (ts.isIdentifier(tag)) {
    const binding = imports.find((b) => b.local === tag.text);
    if (binding && binding.imported !== "*") {
      return { name: binding.imported, from: binding.from };
    }
    return { name: tag.text, from: null };
  }
  if (ts.isPropertyAccessExpression(tag)) {
    let root: ts.Expression = tag;
    while (ts.isPropertyAccessExpression(root)) root = root.expression;
    const member = tag.name.text;
    if (ts.isIdentifier(root)) {
      const binding = imports.find((b) => b.local === root.text);
      if (binding?.imported === "*") {
        return { name: member, from: binding.from };
      }
    }
    return { name: member, from: null };
  }
  return { name: tag.getText(source), from: null };
}

export function analyzeSource(
  file: string,
  source: ts.SourceFile,
): FileAnalysis {
  const imports = collectImports(source);
  const elements: JsxElementInfo[] = [];

  function describe(
    opening: ts.JsxOpeningElement | ts.JsxSelfClosingElement,
    parent: JsxElementInfo | null,
  ): JsxElementInfo {
    const { line, character } = source.getLineAndCharacterOfPosition(
      opening.getStart(source),
    );
    const attributes = new Map<string, AttributeValue>();
    let spread = false;
    for (const property of opening.attributes.properties) {
      if (ts.isJsxAttribute(property)) {
        attributes.set(
          property.name.getText(source),
          attributeValue(property, source),
        );
      } else {
        spread = true;
      }
    }
    const resolved = resolveTag(opening.tagName, imports, source);
    const info: JsxElementInfo = {
      file,
      tagName: opening.tagName.getText(source),
      name: resolved.name,
      from: resolved.from,
      attributes,
      spread,
      parent,
      line: line + 1,
      column: character + 1,
      text: opening.getText(source).slice(0, EVIDENCE_TEXT_LIMIT),
    };
    elements.push(info);
    return info;
  }

  function visit(node: ts.Node, parent: JsxElementInfo | null): void {
    if (ts.isJsxElement(node)) {
      const info = describe(node.openingElement, parent);
      for (const child of node.children) visit(child, info);
      return;
    }
    if (ts.isJsxSelfClosingElement(node)) {
      describe(node, parent);
      return;
    }
    ts.forEachChild(node, (child) => visit(child, parent));
  }

  visit(source, null);
  return { file, source, imports, elements };
}

export function analyzeFiles(
  files: Record<string, string>,
): Map<string, FileAnalysis> {
  const result = new Map<string, FileAnalysis>();
  for (const [path, content] of Object.entries(files)) {
    if (isCodeFile(path)) {
      result.set(path, analyzeSource(path, parseSource(path, content)));
    }
  }
  return result;
}

export function matchesSelector(
  info: JsxElementInfo,
  selector: ElementSelector,
): boolean {
  if (info.name !== selector.element) return false;
  return selector.from === undefined || info.from === selector.from;
}

export function selectElements(
  analyses: Iterable<FileAnalysis>,
  selector: ElementSelector,
): JsxElementInfo[] {
  const found: JsxElementInfo[] = [];
  for (const analysis of analyses) {
    for (const element of analysis.elements) {
      if (matchesSelector(element, selector)) found.push(element);
    }
  }
  return found;
}

export function ancestors(info: JsxElementInfo): JsxElementInfo[] {
  const chain: JsxElementInfo[] = [];
  for (let current = info.parent; current; current = current.parent) {
    chain.push(current);
  }
  return chain;
}

export function evidenceFor(info: JsxElementInfo): Evidence {
  return {
    file: info.file,
    line: info.line,
    column: info.column,
    text: info.text,
  };
}
