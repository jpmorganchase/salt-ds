import { createHash } from "node:crypto";
import type { Binding, NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import postcss, { type ChildNode } from "postcss";
import {
  analyzeParsedSaltCode,
  assertSaltCodeAnalysisIsReliable,
  type SaltCodeAnalysis,
  traverseAst,
} from "../tools/codeAnalysisCommon.js";

export type SubmittedArtifactLanguage =
  | "javascript"
  | "jsx"
  | "typescript"
  | "tsx"
  | "css";

export interface SubmittedArtifactLocation {
  start_offset: number;
  end_offset: number;
  start_line: number;
  start_column: number;
  end_line: number;
  end_column: number;
}

export type ParsedFactKind =
  | "import"
  | "jsx_element"
  | "jsx_prop"
  | "style_declaration"
  | "token_use";

export type ParsedFactValueKind =
  | "value_usage"
  | "type_usage"
  | "unused"
  | "boolean"
  | "static_string"
  | "static_number"
  | "dynamic"
  | "spread"
  | "token_reference";

export interface PublicParsedFact {
  kind: ParsedFactKind;
  subject: string;
  property: string | null;
  value_kind: ParsedFactValueKind;
  certainty: "known" | "unknown";
}

export interface ParsedSubmittedFact extends PublicParsedFact {
  fact_id: string;
  location: SubmittedArtifactLocation;
  package_name: string | null;
  export_name: string | null;
  local_name: string | null;
  static_value: string | number | boolean | null;
}

export interface ParsedArtifactFacts {
  parser: "babel" | "postcss" | "failed" | "limited";
  facts: ParsedSubmittedFact[];
  limitations: string[];
  unknown_fact_count: number;
  analysis: SaltCodeAnalysis | null;
}

export const MAX_SUBMITTED_AST_NODES = 50_000;
export const MAX_SUBMITTED_AST_DEPTH = 128;
export const MAX_SUBMITTED_FACTS = 10_000;
export const MAX_SUBMITTED_AGGREGATE_AST_NODES = 100_000;
export const MAX_SUBMITTED_AGGREGATE_FACTS = 20_000;
export const MAX_SUBMITTED_AST_NODES_ABSOLUTE = 1_000_000;
export const MAX_SUBMITTED_FACTS_ABSOLUTE = 100_000;

export interface SubmittedAnalysisBudget {
  remaining_nodes: number;
  remaining_facts: number;
  node_limit: number;
  fact_limit: number;
}

class SubmittedAnalysisBudgetError extends Error {}

function factId(
  kind: ParsedFactKind,
  location: SubmittedArtifactLocation,
  subject: string,
  property: string | null,
): string {
  const identity = `${kind}\0${location.start_offset}\0${location.end_offset}\0${subject}\0${property ?? ""}`;
  return `${kind}.${createHash("sha256").update(identity).digest("hex").slice(0, 16)}`;
}

interface SourcePositionMap {
  char_to_byte: Uint32Array;
  line_start_chars: number[];
}

function buildSourcePositionMap(text: string): SourcePositionMap {
  const charToByte = new Uint32Array(text.length + 1);
  const lineStartChars = [0];
  let byteOffset = 0;
  for (let index = 0; index < text.length; ) {
    charToByte[index] = byteOffset;
    const codePoint = text.codePointAt(index)!;
    const width = codePoint > 0xffff ? 2 : 1;
    byteOffset += Buffer.byteLength(text.slice(index, index + width), "utf8");
    if (width === 2) charToByte[index + 1] = byteOffset;
    if (text[index] === "\n") lineStartChars.push(index + 1);
    index += width;
    charToByte[index] = byteOffset;
  }
  return { char_to_byte: charToByte, line_start_chars: lineStartChars };
}

function locationFromCharRange(
  start: number,
  end: number,
  startLine: number,
  endLine: number,
  positions: SourcePositionMap,
): SubmittedArtifactLocation {
  const startLineChar = positions.line_start_chars[startLine - 1] ?? 0;
  const endLineChar = positions.line_start_chars[endLine - 1] ?? 0;
  return {
    start_offset: positions.char_to_byte[start]!,
    end_offset: positions.char_to_byte[end]!,
    start_line: startLine,
    start_column:
      positions.char_to_byte[start]! -
      positions.char_to_byte[startLineChar]! +
      1,
    end_line: endLine,
    end_column:
      positions.char_to_byte[end]! - positions.char_to_byte[endLineChar]! + 1,
  };
}

function locationFromExactCharRange(
  start: number,
  end: number,
  positions: SourcePositionMap,
): SubmittedArtifactLocation {
  return locationFromCharRange(
    start,
    end,
    lineForCharIndex(positions.line_start_chars, start),
    lineForCharIndex(positions.line_start_chars, end),
    positions,
  );
}

function nodeLocation(
  node: t.Node,
  positions: SourcePositionMap,
): SubmittedArtifactLocation | null {
  if (node.start == null || node.end == null || !node.loc) return null;
  return locationFromCharRange(
    node.start,
    node.end,
    node.loc.start.line,
    node.loc.end.line,
    positions,
  );
}

function lineOffsets(text: string): number[] {
  const offsets = [0];
  for (let index = 0; index < text.length; index += 1) {
    if (text[index] === "\n") offsets.push(index + 1);
  }
  return offsets;
}

function lineForCharIndex(lineStarts: number[], index: number): number {
  let low = 0;
  let high = lineStarts.length;
  while (low < high) {
    const middle = Math.floor((low + high) / 2);
    if ((lineStarts[middle] ?? 0) <= index) low = middle + 1;
    else high = middle;
  }
  return Math.max(1, low);
}

function cssLocation(
  text: string,
  offsets: number[],
  positions: SourcePositionMap,
  node: postcss.ChildNode,
): SubmittedArtifactLocation | null {
  const start = node.source?.start;
  const end = node.source?.end;
  if (!start || !end) return null;
  const startOffset =
    start.offset ?? (offsets[start.line - 1] ?? 0) + start.column - 1;
  const inclusiveEnd =
    end.offset ?? (offsets[end.line - 1] ?? 0) + end.column - 1;
  const exclusiveEnd = end.offset ?? Math.min(text.length, inclusiveEnd + 1);
  return locationFromCharRange(
    startOffset,
    exclusiveEnd,
    start.line,
    lineForCharIndex(offsets, Math.max(startOffset, exclusiveEnd - 1)),
    positions,
  );
}

function staticExpressionValue(value: t.Expression | t.JSXEmptyExpression): {
  kind: ParsedFactValueKind;
  value: string | number | boolean | null;
} {
  if (t.isStringLiteral(value)) {
    return { kind: "static_string", value: value.value };
  }
  if (t.isNumericLiteral(value)) {
    return { kind: "static_number", value: value.value };
  }
  if (t.isBooleanLiteral(value)) {
    return { kind: "boolean", value: value.value };
  }
  if (t.isTemplateLiteral(value) && value.expressions.length === 0) {
    return {
      kind: "static_string",
      value: value.quasis
        .map((quasi) => quasi.value.cooked ?? quasi.value.raw)
        .join(""),
    };
  }
  return { kind: "dynamic", value: null };
}

function jsxAttributeValue(attribute: t.JSXAttribute): {
  kind: ParsedFactValueKind;
  value: string | number | boolean | null;
} {
  if (attribute.value === null) return { kind: "boolean", value: true };
  if (t.isStringLiteral(attribute.value)) {
    return { kind: "static_string", value: attribute.value.value };
  }
  if (t.isJSXExpressionContainer(attribute.value)) {
    return staticExpressionValue(attribute.value.expression);
  }
  return { kind: "dynamic", value: null };
}

function jsxName(node: t.JSXOpeningElement["name"]): string | null {
  if (t.isJSXIdentifier(node)) return node.name;
  if (t.isJSXMemberExpression(node)) {
    const object = jsxName(node.object);
    return object ? `${object}.${node.property.name}` : null;
  }
  return null;
}

function rootJsxName(node: t.JSXOpeningElement["name"]): string | null {
  let current = node;
  while (t.isJSXMemberExpression(current)) current = current.object;
  return t.isJSXIdentifier(current) ? current.name : null;
}

function resolvedJsxExportName(
  node: t.JSXOpeningElement["name"],
  importedName: string,
): string | null {
  if (importedName !== "*") {
    return t.isJSXIdentifier(node) ? importedName : null;
  }
  return t.isJSXMemberExpression(node) && t.isJSXIdentifier(node.object)
    ? node.property.name
    : null;
}

function isExplicitTypeExportReference(path: NodePath): boolean {
  if (
    path.parentPath?.isExportSpecifier() &&
    (path.parentPath.node.exportKind === "type" ||
      (path.parentPath.parentPath?.isExportNamedDeclaration() &&
        path.parentPath.parentPath.node.exportKind === "type"))
  ) {
    return true;
  }
  return false;
}

function createsTypeReferenceContext(node: t.Node): boolean {
  const candidate = node as t.Node & {
    abstract?: boolean;
    declare?: boolean;
  };
  return (
    t.isTSType(candidate) ||
    t.isTSTypeElement(candidate) ||
    t.isTSDeclareMethod(candidate) ||
    candidate.declare === true ||
    (candidate.abstract === true &&
      !t.isClassDeclaration(candidate) &&
      !t.isClassExpression(candidate))
  );
}

interface TokenOccurrence {
  name: string;
  start: number;
  end: number;
}

interface TokenScan {
  occurrences: TokenOccurrence[];
  unsupported_escape: boolean;
}

function isCssIdentifierCodePoint(value: string | undefined): boolean {
  if (!value) return false;
  const codePoint = value.codePointAt(0)!;
  return /[a-z0-9_-]/iu.test(value) || codePoint >= 0x80 || value === "\\";
}

function skipCssComment(value: string, index: number): number | null {
  if (!value.startsWith("/*", index)) return index;
  const close = value.indexOf("*/", index + 2);
  return close < 0 ? null : close + 2;
}

function skipCssTrivia(value: string, start: number): number | null {
  let cursor = start;
  for (;;) {
    while (/\s/u.test(value[cursor] ?? "")) cursor += 1;
    if (!value.startsWith("/*", cursor)) return cursor;
    const afterComment = skipCssComment(value, cursor);
    if (afterComment === null) return null;
    cursor = afterComment;
  }
}

function cssParenthesisClosures(value: string): ReadonlyMap<number, number> {
  const openings: number[] = [];
  const closures = new Map<number, number>();
  for (let cursor = 0; cursor < value.length; cursor += 1) {
    if (value.startsWith("/*", cursor)) {
      const afterComment = skipCssComment(value, cursor);
      if (afterComment === null) break;
      cursor = afterComment - 1;
      continue;
    }
    const current = value[cursor]!;
    if (current === '"' || current === "'") {
      const quote = current;
      let closed = false;
      for (cursor += 1; cursor < value.length; cursor += 1) {
        if (value[cursor] === "\\") cursor += 1;
        else if (value[cursor] === quote) {
          closed = true;
          break;
        }
      }
      if (!closed) break;
      continue;
    }
    if (current === "\\") {
      cursor += 1;
      continue;
    }
    if (current === "(") {
      openings.push(cursor);
      if (openings.length > MAX_SUBMITTED_AST_DEPTH) {
        throw new SubmittedAnalysisBudgetError(
          `The submitted artifact exceeded the CSS function nesting depth ${MAX_SUBMITTED_AST_DEPTH}.`,
        );
      }
    }
    if (current === ")") {
      const opening = openings.pop();
      if (opening !== undefined) closures.set(opening, cursor);
    }
  }
  return closures;
}

function tokenOccurrences(value: string): TokenScan {
  const occurrences: TokenOccurrence[] = [];
  let unsupportedEscape = false;
  const parenthesisClosures = cssParenthesisClosures(value);
  for (let index = 0; index < value.length; index += 1) {
    const quote = value[index];
    if (quote === '"' || quote === "'") {
      for (index += 1; index < value.length; index += 1) {
        if (value[index] === "\\") index += 1;
        else if (value[index] === quote) break;
      }
      continue;
    }
    if (value.startsWith("/*", index)) {
      const close = value.indexOf("*/", index + 2);
      index = close < 0 ? value.length : close + 1;
      continue;
    }
    if (
      value.slice(index, index + 3).toLowerCase() !== "var" ||
      isCssIdentifierCodePoint(value[index - 1]) ||
      value[index + 3] !== "("
    ) {
      continue;
    }
    const openingParen = index + 3;
    let cursor = skipCssTrivia(value, openingParen + 1);
    if (cursor === null) continue;
    const nameStart = cursor;
    while (
      cursor < value.length &&
      !/[\s,)]/u.test(value[cursor]!) &&
      !value.startsWith("/*", cursor)
    ) {
      cursor += 1;
    }
    const name = value.slice(nameStart, cursor);
    if (name.includes("\\")) unsupportedEscape = true;
    if (!/^--salt-[a-z0-9-]+$/u.test(name)) continue;
    cursor = skipCssTrivia(value, cursor);
    if (cursor === null) continue;
    if (value[cursor] !== "," && value[cursor] !== ")") continue;
    const closingParen = parenthesisClosures.get(openingParen);
    if (closingParen === undefined || closingParen < cursor) continue;
    occurrences.push({
      name,
      start: nameStart,
      end: nameStart + name.length,
    });
  }
  if (value.includes("\\") && value.includes("--salt")) {
    unsupportedEscape = true;
  }
  return { occurrences, unsupported_escape: unsupportedEscape };
}

function rawStaticTextRange(
  value: t.Expression,
  text: string,
): { text: string; start: number } | null {
  if (value.start == null || value.end == null) return null;
  if (
    t.isStringLiteral(value) ||
    (t.isTemplateLiteral(value) && value.expressions.length === 0)
  ) {
    return {
      text: text.slice(value.start + 1, value.end - 1),
      start: value.start + 1,
    };
  }
  return null;
}

function addFact(
  facts: ParsedSubmittedFact[],
  fact: Omit<ParsedSubmittedFact, "fact_id" | "certainty">,
  aggregateBudget?: SubmittedAnalysisBudget,
): ParsedSubmittedFact {
  const factLimit = Math.min(
    MAX_SUBMITTED_FACTS_ABSOLUTE,
    aggregateBudget?.fact_limit ?? MAX_SUBMITTED_FACTS,
  );
  if (facts.length >= factLimit || aggregateBudget?.remaining_facts === 0) {
    throw new SubmittedAnalysisBudgetError(
      `The submitted artifact exceeded its allocated normalized-fact analysis budget (${aggregateBudget?.fact_limit ?? MAX_SUBMITTED_FACTS} facts).`,
    );
  }
  if (aggregateBudget) aggregateBudget.remaining_facts -= 1;
  const complete: ParsedSubmittedFact = {
    ...fact,
    fact_id: factId(fact.kind, fact.location, fact.subject, fact.property),
    certainty:
      fact.value_kind === "dynamic" || fact.value_kind === "spread"
        ? "unknown"
        : "known",
  };
  facts.push(complete);
  return complete;
}

function createFactAppender(
  facts: ParsedSubmittedFact[],
  aggregateBudget?: SubmittedAnalysisBudget,
) {
  return (fact: Omit<ParsedSubmittedFact, "fact_id" | "certainty">) =>
    addFact(facts, fact, aggregateBudget);
}

interface SaltImportBinding {
  packageName: string;
  imported: string;
  typeOnly: boolean;
  bindingStart: number | null;
}

function saltImportBinding(
  binding: Binding | undefined,
  cache: WeakMap<Binding, SaltImportBinding | null>,
): SaltImportBinding | null {
  if (!binding) return null;
  const cached = cache.get(binding);
  if (cached !== undefined || cache.has(binding)) return cached ?? null;
  const specifier = binding.path.node;
  const declaration = binding.path.parentPath?.node;
  if (
    !t.isImportDeclaration(declaration) ||
    !declaration.source.value.startsWith("@salt-ds/") ||
    !(
      t.isImportSpecifier(specifier) ||
      t.isImportDefaultSpecifier(specifier) ||
      t.isImportNamespaceSpecifier(specifier)
    )
  ) {
    cache.set(binding, null);
    return null;
  }
  const imported = t.isImportSpecifier(specifier)
    ? t.isIdentifier(specifier.imported)
      ? specifier.imported.name
      : specifier.imported.value
    : t.isImportDefaultSpecifier(specifier)
      ? "default"
      : "*";
  const typeOnly =
    declaration.importKind === "type" ||
    (t.isImportSpecifier(specifier) && specifier.importKind === "type");
  const result: SaltImportBinding = {
    packageName: declaration.source.value,
    imported,
    typeOnly,
    bindingStart: specifier.local.start ?? null,
  };
  cache.set(binding, result);
  return result;
}

function parseScriptFacts(
  text: string,
  language: Exclude<SubmittedArtifactLanguage, "css">,
  aggregateBudget?: SubmittedAnalysisBudget,
): ParsedArtifactFacts {
  const facts: ParsedSubmittedFact[] = [];
  const appendFact = createFactAppender(facts, aggregateBudget);
  const limitations: string[] = [];
  const positions = buildSourcePositionMap(text);
  let unknownFactCount = 0;
  let analysis: SaltCodeAnalysis;
  try {
    analysis = analyzeParsedSaltCode(text, language);
    assertSaltCodeAnalysisIsReliable(analysis);
  } catch {
    return {
      parser: "failed",
      facts: [],
      limitations: [
        "The submitted JavaScript or TypeScript artifact could not be parsed reliably; no fallback language scan was performed.",
      ],
      unknown_fact_count: 0,
      analysis: null,
    };
  }

  let typeOnlyJsxImportCount = 0;
  let visitedNodeCount = 0;
  let currentDepth = 0;
  let typeReferenceDepth = 0;
  const importBindingCache = new WeakMap<Binding, SaltImportBinding | null>();
  const typeReferenceByNode = new WeakMap<t.Node, boolean>();
  const importFacts: Array<{
    packageName: string;
    imported: string;
    localName: string;
    location: SubmittedArtifactLocation;
    binding: Binding | undefined;
    typeOnly: boolean;
  }> = [];

  try {
    traverseAst(analysis.ast, {
      enter(path) {
        visitedNodeCount += 1;
        currentDepth += 1;
        if (
          visitedNodeCount >
            Math.min(
              MAX_SUBMITTED_AST_NODES_ABSOLUTE,
              aggregateBudget?.node_limit ?? MAX_SUBMITTED_AST_NODES,
            ) ||
          aggregateBudget?.remaining_nodes === 0 ||
          currentDepth > MAX_SUBMITTED_AST_DEPTH
        ) {
          throw new SubmittedAnalysisBudgetError(
            `The submitted artifact exceeded its allocated AST analysis budget (${aggregateBudget?.node_limit ?? MAX_SUBMITTED_AST_NODES} nodes or depth ${MAX_SUBMITTED_AST_DEPTH}).`,
          );
        }
        if (aggregateBudget) aggregateBudget.remaining_nodes -= 1;
        if (createsTypeReferenceContext(path.node)) typeReferenceDepth += 1;
        typeReferenceByNode.set(
          path.node,
          typeReferenceDepth > 0 || isExplicitTypeExportReference(path),
        );
      },
      exit(path) {
        if (createsTypeReferenceContext(path.node)) typeReferenceDepth -= 1;
        currentDepth -= 1;
      },
      ImportDeclaration(path) {
        const packageName = path.node.source.value;
        if (!packageName.startsWith("@salt-ds/")) return;
        const declarationTypeOnly = path.node.importKind === "type";
        for (const specifierPath of path.get("specifiers")) {
          const specifier = specifierPath.node;
          const location = nodeLocation(specifier, positions);
          if (!location) continue;
          const localName = specifier.local.name;
          const imported = t.isImportSpecifier(specifier)
            ? t.isIdentifier(specifier.imported)
              ? specifier.imported.name
              : specifier.imported.value
            : t.isImportDefaultSpecifier(specifier)
              ? "default"
              : "*";
          const typeOnly =
            declarationTypeOnly ||
            (t.isImportSpecifier(specifier) && specifier.importKind === "type");
          const binding = path.scope.getBinding(localName);
          importFacts.push({
            packageName,
            imported,
            localName,
            location,
            binding,
            typeOnly,
          });
        }
      },
      JSXOpeningElement(path) {
        const location = nodeLocation(path.node, positions);
        const name = jsxName(path.node.name);
        if (!location || !name) return;
        const rootName = rootJsxName(path.node.name);
        const lexicalBinding = rootName
          ? path.scope.getBinding(rootName)
          : null;
        const candidateImport = saltImportBinding(
          lexicalBinding ?? undefined,
          importBindingCache,
        );
        const imported =
          rootName &&
          !/^[a-z]/u.test(rootName) &&
          candidateImport &&
          !candidateImport.typeOnly &&
          lexicalBinding?.identifier.start === candidateImport.bindingStart
            ? candidateImport
            : null;
        if (
          rootName &&
          candidateImport?.typeOnly &&
          lexicalBinding?.identifier.start === candidateImport.bindingStart
        ) {
          typeOnlyJsxImportCount += 1;
        }
        const exportName = imported
          ? resolvedJsxExportName(path.node.name, imported.imported)
          : null;
        const subject =
          imported && exportName
            ? `${imported.packageName}#${exportName}`
            : name;
        const groundedPackageName = exportName
          ? (imported?.packageName ?? null)
          : null;
        appendFact({
          kind: "jsx_element",
          subject,
          property: null,
          value_kind: "value_usage",
          location,
          package_name: groundedPackageName,
          export_name: exportName,
          local_name: rootName,
          static_value: null,
        });

        for (const attribute of path.node.attributes) {
          const attributeLocation = nodeLocation(attribute, positions);
          if (!attributeLocation) continue;
          if (t.isJSXSpreadAttribute(attribute)) {
            unknownFactCount += 1;
            appendFact({
              kind: "jsx_prop",
              subject,
              property: null,
              value_kind: "spread",
              location: attributeLocation,
              package_name: groundedPackageName,
              export_name: exportName,
              local_name: rootName,
              static_value: null,
            });
            continue;
          }
          const property = t.isJSXIdentifier(attribute.name)
            ? attribute.name.name
            : `${attribute.name.namespace.name}:${attribute.name.name.name}`;
          const parsedValue = jsxAttributeValue(attribute);
          if (parsedValue.kind === "dynamic") unknownFactCount += 1;
          appendFact({
            kind: "jsx_prop",
            subject,
            property,
            value_kind: parsedValue.kind,
            location: attributeLocation,
            package_name: groundedPackageName,
            export_name: exportName,
            local_name: rootName,
            static_value: parsedValue.value,
          });

          if (
            property === "style" &&
            t.isJSXExpressionContainer(attribute.value) &&
            t.isObjectExpression(attribute.value.expression)
          ) {
            for (const styleProperty of attribute.value.expression.properties) {
              const styleLocation = nodeLocation(styleProperty, positions);
              if (!styleLocation) continue;
              if (
                !t.isObjectProperty(styleProperty) ||
                styleProperty.computed
              ) {
                unknownFactCount += 1;
                continue;
              }
              const key = t.isIdentifier(styleProperty.key)
                ? styleProperty.key.name
                : t.isStringLiteral(styleProperty.key)
                  ? styleProperty.key.value
                  : null;
              if (!key || !t.isExpression(styleProperty.value)) {
                unknownFactCount += 1;
                continue;
              }
              const styleValue = staticExpressionValue(styleProperty.value);
              if (styleValue.kind === "dynamic") unknownFactCount += 1;
              const styleFact = appendFact({
                kind: "style_declaration",
                subject,
                property: key,
                value_kind: styleValue.kind,
                location: styleLocation,
                package_name: groundedPackageName,
                export_name: exportName,
                local_name: rootName,
                static_value: styleValue.value,
              });
              if (
                typeof styleValue.value === "string" &&
                styleProperty.value.start != null &&
                styleProperty.value.end != null &&
                styleProperty.value.loc
              ) {
                const rawValue = rawStaticTextRange(styleProperty.value, text);
                if (!rawValue) continue;
                const tokenScan = tokenOccurrences(rawValue.text);
                if (tokenScan.unsupported_escape) {
                  limitations.push(
                    "CSS escapes in token function names or custom-property identities were not evaluated.",
                  );
                }
                for (const token of tokenScan.occurrences) {
                  const start = rawValue.start + token.start;
                  const end = start + token.name.length;
                  const tokenLocation = locationFromExactCharRange(
                    start,
                    end,
                    positions,
                  );
                  appendFact({
                    kind: "token_use",
                    subject: token.name,
                    property: key,
                    value_kind: "token_reference",
                    location: tokenLocation,
                    package_name: null,
                    export_name: null,
                    local_name: null,
                    static_value: null,
                  });
                }
              }
            }
          }
        }
      },
    });
    for (const importFact of importFacts) {
      let hasValueReference = false;
      let hasTypeReference = false;
      for (const reference of importFact.binding?.referencePaths ?? []) {
        if (typeReferenceByNode.get(reference.node) === true) {
          hasTypeReference = true;
        } else {
          hasValueReference = true;
        }
      }
      const usageKind: ParsedFactValueKind = importFact.typeOnly
        ? "type_usage"
        : hasValueReference
          ? "value_usage"
          : hasTypeReference
            ? "type_usage"
            : "unused";
      appendFact({
        kind: "import",
        subject: `${importFact.packageName}#${importFact.imported}`,
        property: importFact.localName,
        value_kind: usageKind,
        location: importFact.location,
        package_name: importFact.packageName,
        export_name: importFact.imported,
        local_name: importFact.localName,
        static_value: null,
      });
    }
  } catch (error) {
    if (error instanceof SubmittedAnalysisBudgetError) {
      return {
        parser: "limited",
        facts: [],
        limitations: [`${error.message} No partial facts were evaluated.`],
        unknown_fact_count: 0,
        analysis: null,
      };
    }
    return {
      parser: "failed",
      facts: [],
      limitations: [
        "The submitted JavaScript or TypeScript artifact could not be analyzed reliably after parsing; no partial facts were evaluated.",
      ],
      unknown_fact_count: 0,
      analysis: null,
    };
  }

  if (unknownFactCount > 0) {
    limitations.push(
      `${unknownFactCount} dynamic or spread expression${unknownFactCount === 1 ? " was" : "s were"} recorded as unknown and did not ground findings.`,
    );
  }
  if (typeOnlyJsxImportCount > 0) {
    limitations.push(
      `${typeOnlyJsxImportCount} JSX element${typeOnlyJsxImportCount === 1 ? " used" : "s used"} a type-only Salt import and did not ground component findings.`,
    );
  }
  return {
    parser: "babel",
    facts,
    limitations,
    unknown_fact_count: unknownFactCount,
    analysis,
  };
}

function parseCssFacts(
  text: string,
  aggregateBudget?: SubmittedAnalysisBudget,
): ParsedArtifactFacts {
  const facts: ParsedSubmittedFact[] = [];
  const appendFact = createFactAppender(facts, aggregateBudget);
  const limitations: string[] = [];
  const offsets = lineOffsets(text);
  const positions = buildSourcePositionMap(text);
  try {
    const root = postcss.parse(text, { from: undefined, map: false });
    let visitedNodeCount = 0;
    const structuralStack: Array<{ node: ChildNode; depth: number }> =
      root.nodes.map((node) => ({ node, depth: 1 })).reverse();
    while (structuralStack.length > 0) {
      const current = structuralStack.pop();
      if (!current) break;
      visitedNodeCount += 1;
      if (
        visitedNodeCount >
          Math.min(
            MAX_SUBMITTED_AST_NODES_ABSOLUTE,
            aggregateBudget?.node_limit ?? MAX_SUBMITTED_AST_NODES,
          ) ||
        aggregateBudget?.remaining_nodes === 0 ||
        current.depth > MAX_SUBMITTED_AST_DEPTH
      ) {
        throw new SubmittedAnalysisBudgetError(
          `The submitted stylesheet exceeded its allocated structural analysis budget (${aggregateBudget?.node_limit ?? MAX_SUBMITTED_AST_NODES} nodes or depth ${MAX_SUBMITTED_AST_DEPTH}).`,
        );
      }
      if (aggregateBudget) aggregateBudget.remaining_nodes -= 1;
      if ("nodes" in current.node && Array.isArray(current.node.nodes)) {
        for (
          let index = current.node.nodes.length - 1;
          index >= 0;
          index -= 1
        ) {
          const child = current.node.nodes[index];
          if (child) {
            structuralStack.push({ node: child, depth: current.depth + 1 });
          }
        }
      }
    }
    root.walkDecls((declaration) => {
      const location = cssLocation(text, offsets, positions, declaration);
      if (!location) return;
      const styleFact = appendFact({
        kind: "style_declaration",
        subject: "stylesheet",
        property: declaration.prop,
        value_kind: "static_string",
        location,
        package_name: null,
        export_name: null,
        local_name: null,
        static_value: declaration.value,
      });
      const declarationStart = declaration.source?.start?.offset;
      const tokenScan = tokenOccurrences(declaration.toString());
      if (tokenScan.unsupported_escape) {
        limitations.push(
          "CSS escapes in token function names or custom-property identities were not evaluated.",
        );
      }
      for (const token of tokenScan.occurrences) {
        if (declarationStart == null) continue;
        const start = declarationStart + token.start;
        const end = declarationStart + token.end;
        const startLine = lineForCharIndex(offsets, start);
        const endLine = lineForCharIndex(offsets, end);
        appendFact({
          kind: "token_use",
          subject: token.name,
          property: declaration.prop,
          value_kind: "token_reference",
          location: locationFromCharRange(
            start,
            end,
            startLine,
            endLine,
            positions,
          ),
          package_name: null,
          export_name: null,
          local_name: null,
          static_value: null,
        });
      }
    });
    return {
      parser: "postcss",
      facts,
      limitations: [...new Set(limitations)],
      unknown_fact_count: 0,
      analysis: null,
    };
  } catch (error) {
    if (error instanceof SubmittedAnalysisBudgetError) {
      return {
        parser: "limited",
        facts: [],
        limitations: [`${error.message} No partial facts were evaluated.`],
        unknown_fact_count: 0,
        analysis: null,
      };
    }
    return {
      parser: "failed",
      facts: [],
      limitations: [
        "The submitted CSS artifact could not be parsed reliably; no regex fallback was performed.",
      ],
      unknown_fact_count: 0,
      analysis: null,
    };
  }
}

export function parseSubmittedArtifact(
  input: {
    language: SubmittedArtifactLanguage;
    text: string;
  },
  aggregateBudget?: SubmittedAnalysisBudget,
): ParsedArtifactFacts {
  return input.language === "css"
    ? parseCssFacts(input.text, aggregateBudget)
    : parseScriptFacts(input.text, input.language, aggregateBudget);
}

export function publicParsedFact(fact: ParsedSubmittedFact): PublicParsedFact {
  return {
    kind: fact.kind,
    subject: fact.subject,
    property: fact.property,
    value_kind: fact.value_kind,
    certainty: fact.certainty,
  };
}
