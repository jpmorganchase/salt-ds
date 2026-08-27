import path from "node:path";
import postcss, {
  type AtRule,
  type ChildNode,
  type Declaration,
  type Node,
  type Root,
  type Rule,
} from "postcss";
import selectorParser from "postcss-selector-parser";
import {
  canonicalJson,
  compareOrdinalStrings,
  stableShaId,
} from "../catalog/catalogSerialization.js";
import { toPosixPath } from "../registry/paths.js";
import type {
  TokenDeclarationAtRule,
  TokenDeclarationDimension,
  TokenDeclarationProjection,
  TokenDeclarationSelectorConstraint,
  TokenDeclarationSelectorVariant,
  TokenDeclarationSourceContext,
  TokenDeclarationSourceRange,
} from "../types.js";
import { normalizeWhitespace, readFileOrNull } from "./buildRegistryShared.js";
import { globCatalogInputs } from "./catalogInputInventory.js";

interface ParsedCssSource {
  absolutePath: string;
  relativePath: string;
  content: string;
  root: Root;
}

interface CssImportEdge {
  targetPath: string;
  condition: string | null;
}

interface CssSectionReplacement {
  category: string;
  replacementCategory: string | null;
  start: number;
}

export interface TokenDeclarationExtraction {
  declarations: Map<string, TokenDeclarationProjection[]>;
  sourceContexts: Map<string, TokenDeclarationSourceContext[]>;
}

const TOKEN_ENTRYPOINTS = [
  {
    path: "packages/theme/css/theme.css",
    theme: "salt",
  },
  {
    path: "packages/theme/css/theme-next.css",
    theme: "next",
  },
] as const;

function cleanCssCommentText(value: string): string {
  return normalizeWhitespace(
    value
      .split(/\r?\n/u)
      .map((line) => line.replace(/^\s*\*\s?/u, "").trim())
      .join(" "),
  )
    .replace(/\*\*/gu, "")
    .trim();
}

function normalizeCategory(value: string): string {
  return value.trim().replace(/\s+/gu, "").toLowerCase();
}

function parseDeprecatedReplacementCategory(
  commentText: string,
): string | null {
  const match = /\bDeprecated:?\s*Use\s+([a-z][a-z0-9-]*)\s+instead\b/iu.exec(
    commentText,
  );
  return match?.[1] ? normalizeCategory(match[1]) : null;
}

function parseSectionCategory(commentText: string): string | null {
  if (
    /\bDeprecated\b/iu.test(commentText) ||
    /\bUse\s+--salt-[\w-]+/iu.test(commentText)
  ) {
    return null;
  }
  return /^[A-Za-z][A-Za-z0-9 ]*$/u.test(commentText)
    ? normalizeCategory(commentText)
    : null;
}

function extractCssSectionReplacements(
  content: string,
): CssSectionReplacement[] {
  const sections: CssSectionReplacement[] = [];
  const commentRegex = /\/\*([\s\S]*?)\*\//gu;
  let pendingReplacementCategory: string | null = null;
  let match = commentRegex.exec(content);

  while (match) {
    const commentText = cleanCssCommentText(match[1] ?? "");
    const replacementCategory = parseDeprecatedReplacementCategory(commentText);
    if (replacementCategory) {
      pendingReplacementCategory = replacementCategory;
      match = commentRegex.exec(content);
      continue;
    }
    const sectionCategory = parseSectionCategory(commentText);
    if (sectionCategory) {
      sections.push({
        category: sectionCategory,
        replacementCategory: pendingReplacementCategory,
        start: match.index,
      });
      pendingReplacementCategory = null;
    }
    match = commentRegex.exec(content);
  }

  return sections;
}

function findCssSectionAtOffset(
  sections: CssSectionReplacement[],
  offset: number,
): CssSectionReplacement | null {
  let current: CssSectionReplacement | null = null;
  for (const section of sections) {
    if (section.start > offset) break;
    current = section;
  }
  return current;
}

function buildCategoryReplacementTokenName(
  tokenName: string,
  category: string,
  replacementCategory: string | null,
): string | null {
  if (!replacementCategory) return null;
  const prefix = `--salt-${category}`;
  return tokenName.startsWith(prefix)
    ? `--salt-${replacementCategory}${tokenName.slice(prefix.length)}`
    : null;
}

function parseImportParams(
  params: string,
): { specifier: string; condition: string | null } | null {
  const urlMatch =
    /^\s*url\(\s*(?:(["'])([^"']+)\1|([^)\s]+))\s*\)\s*(.*)$/u.exec(params);
  const quotedMatch = /^\s*(["'])([^"']+)\1\s*(.*)$/u.exec(params);
  const specifier = urlMatch?.[2] ?? urlMatch?.[3] ?? quotedMatch?.[2] ?? null;
  const condition = urlMatch?.[4] ?? quotedMatch?.[3] ?? null;
  if (!specifier) return null;
  return {
    specifier,
    condition: condition?.trim() || null,
  };
}

function buildImportEdges(
  source: ParsedCssSource,
  sourcesByPath: ReadonlyMap<string, ParsedCssSource>,
): CssImportEdge[] {
  const edges: CssImportEdge[] = [];
  source.root.walkAtRules("import", (atRule) => {
    const parsed = parseImportParams(atRule.params);
    if (!parsed || /^(?:[a-z][a-z0-9+.-]*:|\/|#)/iu.test(parsed.specifier)) {
      return;
    }
    const resolvedPath = toPosixPath(
      path.normalize(
        path.join(path.posix.dirname(source.relativePath), parsed.specifier),
      ),
    );
    if (!sourcesByPath.has(resolvedPath)) {
      throw new Error(
        `Token CSS import is missing: ${source.relativePath} -> ${resolvedPath}`,
      );
    }
    edges.push({
      targetPath: resolvedPath,
      condition: parsed.condition,
    });
  });
  return edges.sort(
    (left, right) =>
      compareOrdinalStrings(left.targetPath, right.targetPath) ||
      compareOrdinalStrings(left.condition ?? "", right.condition ?? ""),
  );
}

function collectSourceContexts(
  sourcesByPath: ReadonlyMap<string, ParsedCssSource>,
): Map<string, TokenDeclarationSourceContext[]> {
  const edgesByPath = new Map(
    [...sourcesByPath.values()].map((source) => [
      source.relativePath,
      buildImportEdges(source, sourcesByPath),
    ]),
  );
  const contexts = new Map<string, TokenDeclarationSourceContext[]>();

  const addContext = (
    sourcePath: string,
    context: TokenDeclarationSourceContext,
  ) => {
    const existing = contexts.get(sourcePath) ?? [];
    const key = canonicalJson(context);
    if (!existing.some((entry) => canonicalJson(entry) === key)) {
      existing.push(context);
      contexts.set(sourcePath, existing);
    }
  };

  for (const entrypoint of TOKEN_ENTRYPOINTS) {
    if (!sourcesByPath.has(entrypoint.path)) {
      throw new Error(
        `Required token CSS entrypoint is missing: ${entrypoint.path}`,
      );
    }

    const visit = (
      sourcePath: string,
      chain: string[],
      conditions: string[],
    ): void => {
      if (chain.slice(0, -1).includes(sourcePath)) {
        throw new Error(
          `Token CSS import cycle: ${[...chain, sourcePath].join(" -> ")}`,
        );
      }
      addContext(sourcePath, {
        entrypoint: entrypoint.path,
        theme: entrypoint.theme,
        import_chain: chain,
        condition: conditions.length > 0 ? conditions.join(" && ") : null,
      });
      for (const edge of edgesByPath.get(sourcePath) ?? []) {
        visit(
          edge.targetPath,
          [...chain, edge.targetPath],
          edge.condition ? [...conditions, edge.condition] : conditions,
        );
      }
    };

    visit(entrypoint.path, [entrypoint.path], []);
  }

  for (const [sourcePath, values] of contexts) {
    contexts.set(
      sourcePath,
      values.sort(
        (left, right) =>
          compareOrdinalStrings(left.entrypoint, right.entrypoint) ||
          compareOrdinalStrings(
            canonicalJson(left.import_chain),
            canonicalJson(right.import_chain),
          ),
      ),
    );
  }
  return contexts;
}

function offsetFromLineColumn(
  content: string,
  line: number,
  column: number,
): number {
  let offset = 0;
  let currentLine = 1;
  while (currentLine < line) {
    const newline = content.indexOf("\n", offset);
    if (newline === -1) return content.length;
    offset = newline + 1;
    currentLine += 1;
  }
  return Math.min(content.length, offset + Math.max(0, column - 1));
}

function getLineAndColumn(
  content: string,
  offset: number,
): { line: number; column: number } {
  const prefix = content.slice(0, offset);
  const lines = prefix.split("\n");
  return {
    line: lines.length,
    column: (lines.at(-1)?.length ?? 0) + 1,
  };
}

function getNodeStartOffset(content: string, declaration: Declaration): number {
  const sourceStart = declaration.source?.start;
  if (!sourceStart) {
    throw new Error(
      `Token declaration ${declaration.prop} is missing a source start.`,
    );
  }
  const offset = (sourceStart as { offset?: number }).offset;
  return typeof offset === "number"
    ? offset
    : offsetFromLineColumn(content, sourceStart.line, sourceStart.column);
}

function getNodeEndOffset(
  content: string,
  declaration: Declaration,
  startOffset: number,
): number {
  const sourceEnd = declaration.source?.end;
  let candidate =
    sourceEnd && typeof (sourceEnd as { offset?: number }).offset === "number"
      ? (sourceEnd as { offset: number }).offset + 1
      : sourceEnd
        ? offsetFromLineColumn(content, sourceEnd.line, sourceEnd.column) + 1
        : startOffset + declaration.toString().length;
  while (candidate > startOffset && /\s/u.test(content[candidate - 1] ?? "")) {
    candidate -= 1;
  }
  if (content[candidate - 1] === ";") {
    return candidate;
  }
  const semicolon = content.indexOf(";", Math.max(startOffset, candidate - 1));
  if (semicolon !== -1) {
    const nextBrace = content.indexOf("}", candidate);
    if (nextBrace === -1 || semicolon < nextBrace) {
      candidate = semicolon + 1;
    }
  }
  return Math.min(content.length, candidate);
}

function createSourceRange(
  content: string,
  startOffset: number,
  endOffset: number,
): TokenDeclarationSourceRange {
  const start = getLineAndColumn(content, startOffset);
  const end = getLineAndColumn(content, endOffset);
  return {
    start_offset: Buffer.byteLength(content.slice(0, startOffset), "utf8"),
    end_offset: Buffer.byteLength(content.slice(0, endOffset), "utf8"),
    start_line: start.line,
    start_column: start.column,
    end_line: end.line,
    end_column: end.column,
  };
}

function findNearestRule(node: ChildNode): Rule | null {
  let parent: Node | undefined = node.parent;
  while (parent) {
    if (parent.type === "rule") return parent as Rule;
    parent = parent.parent;
  }
  return null;
}

function collectAtRules(node: ChildNode): TokenDeclarationAtRule[] {
  const rules: TokenDeclarationAtRule[] = [];
  let parent: Node | undefined = node.parent;
  while (parent) {
    if (parent.type === "atrule") {
      const atRule = parent as AtRule;
      rules.push({
        name: atRule.name,
        params: atRule.params,
      });
    }
    parent = parent.parent;
  }
  return rules.reverse();
}

function createSelectorVariants(
  rawSelector: string | null,
  sourceContexts: TokenDeclarationSourceContext[],
): TokenDeclarationSelectorVariant[] {
  if (!rawSelector) return [];
  const variants: TokenDeclarationSelectorVariant[] = [];

  try {
    selectorParser((selectors) => {
      selectors.each((selector) => {
        const selectorText = selector.toString();
        const dimensions: TokenDeclarationDimension[] = [];
        const constraints: TokenDeclarationSelectorConstraint[] = [];
        const addDimension = (
          name: string,
          value: string,
          establishedBy: TokenDeclarationDimension["established_by"],
        ) => {
          if (
            !dimensions.some(
              (entry) =>
                entry.name === name &&
                entry.value === value &&
                entry.established_by === establishedBy,
            )
          ) {
            dimensions.push({
              name,
              value,
              selector: selectorText,
              established_by: establishedBy,
            });
          }
        };

        let selectorTheme: "salt" | "next" | null = null;
        selector.walkClasses((classNode) => {
          if (classNode.value === "salt-theme-next") {
            selectorTheme = "next";
          } else if (
            classNode.value === "salt-theme" &&
            selectorTheme !== "next"
          ) {
            selectorTheme = "salt";
          }
          const densityMatch = /^salt-density-(.+)$/u.exec(classNode.value);
          if (densityMatch?.[1]) {
            addDimension("density", densityMatch[1], "selector");
          }
        });
        if (selectorTheme) {
          addDimension("theme", selectorTheme, "selector");
        } else {
          for (const theme of new Set(
            sourceContexts.map((context) => context.theme),
          )) {
            addDimension("theme", theme, "import_entrypoint");
          }
        }

        selector.walkAttributes((attribute) => {
          const attributeName = attribute.attribute;
          if (!attributeName.startsWith("data-")) return;
          const name = attributeName.slice("data-".length);
          const operator = attribute.operator ?? null;
          const value = attribute.value ?? null;
          const insensitive =
            (attribute as { insensitive?: boolean }).insensitive === true;
          constraints.push({
            name,
            operator,
            value,
            insensitive,
          });
          if (operator === "=" && value) {
            addDimension(name, value, "selector");
          }
        });

        variants.push({
          selector: selectorText,
          dimensions: dimensions.sort(
            (left, right) =>
              compareOrdinalStrings(left.name, right.name) ||
              compareOrdinalStrings(left.value, right.value) ||
              compareOrdinalStrings(left.established_by, right.established_by),
          ),
          constraints: constraints.sort(
            (left, right) =>
              compareOrdinalStrings(left.name, right.name) ||
              compareOrdinalStrings(
                left.operator ?? "",
                right.operator ?? "",
              ) ||
              compareOrdinalStrings(left.value ?? "", right.value ?? ""),
          ),
        });
      });
    }).processSync(rawSelector);
  } catch {
    variants.push({
      selector: rawSelector,
      dimensions: [
        ...new Set(sourceContexts.map((context) => context.theme)),
      ].map((theme) => ({
        name: "theme",
        value: theme,
        selector: rawSelector,
        established_by: "import_entrypoint" as const,
      })),
      constraints: [],
    });
  }

  return variants;
}

function declarationReplacement(
  declaration: Declaration,
  content: string,
  startOffset: number,
  sourcePath: string,
  sections: CssSectionReplacement[],
): string | null {
  if (!sourcePath.includes("/deprecated/")) return null;
  const lineStart = content.lastIndexOf("\n", startOffset) + 1;
  const lineEnd = content.indexOf("\n", startOffset);
  const declarationLine = content.slice(
    lineStart,
    lineEnd === -1 ? content.length : lineEnd,
  );
  const sameLine =
    /\/\*\s*Use\s+(--salt-[\w-]+)\s*\*\//iu.exec(declarationLine)?.[1] ?? null;
  if (sameLine) return sameLine;

  const category =
    declaration.prop.replace("--salt-", "").split("-")[0] ?? "misc";
  return buildCategoryReplacementTokenName(
    declaration.prop,
    normalizeCategory(category),
    findCssSectionAtOffset(sections, startOffset)?.replacementCategory ?? null,
  );
}

function createDeclaration(
  source: ParsedCssSource,
  declaration: Declaration,
  sourceContexts: TokenDeclarationSourceContext[],
  sections: CssSectionReplacement[],
): TokenDeclarationProjection {
  const startOffset = getNodeStartOffset(source.content, declaration);
  const endOffset = getNodeEndOffset(source.content, declaration, startOffset);
  const nearestRule = findNearestRule(declaration);
  const rawSelector = nearestRule
    ? ((nearestRule.raws as { selector?: { raw?: string } }).selector?.raw ??
      nearestRule.selector)
    : null;
  const atRules = collectAtRules(declaration);
  const selectorVariants = createSelectorVariants(rawSelector, sourceContexts);
  const dimensions = selectorVariants.flatMap((variant) => variant.dimensions);
  const rawValue =
    (declaration.raws.value as { raw?: string } | undefined)?.raw ?? null;
  const replacement = declarationReplacement(
    declaration,
    source.content,
    startOffset,
    source.relativePath,
    sections,
  );
  const sourceRange = createSourceRange(source.content, startOffset, endOffset);

  const identity = {
    token: declaration.prop,
    source_path: source.relativePath,
    source_range: sourceRange,
    value: declaration.value,
    raw_value: rawValue,
    important: declaration.important,
    raw_selector: rawSelector,
    at_rules: atRules,
    selector_variants: selectorVariants,
    deprecated: source.relativePath.includes("/deprecated/"),
    replacement,
  };
  return {
    id: stableShaId("token-declaration", identity),
    value: declaration.value,
    raw_value: rawValue,
    important: declaration.important,
    raw_selector: rawSelector,
    source_context: [
      ...atRules.map((atRule) => `@${atRule.name} ${atRule.params}`.trim()),
      ...(rawSelector ? [rawSelector] : []),
    ],
    at_rules: atRules,
    selector_variants: selectorVariants,
    source_contexts: sourceContexts,
    source_range: sourceRange,
    source_path: source.relativePath,
    dimensions,
    deprecated: source.relativePath.includes("/deprecated/"),
    replacement,
  };
}

export async function extractTokenDeclarations(
  repoRoot: string,
): Promise<TokenDeclarationExtraction> {
  const absolutePaths = (
    await globCatalogInputs("packages/theme/css/**/*.css", {
      cwd: repoRoot,
      absolute: true,
      onlyFiles: true,
    })
  ).sort(compareOrdinalStrings);
  const parsedSources = await Promise.all(
    absolutePaths.map(async (absolutePath): Promise<ParsedCssSource> => {
      const content = await readFileOrNull(absolutePath);
      if (content == null) {
        throw new Error(
          `Required token CSS source is missing: ${absolutePath}`,
        );
      }
      const relativePath = toPosixPath(path.relative(repoRoot, absolutePath));
      return {
        absolutePath,
        relativePath,
        content,
        root: postcss.parse(content, { from: relativePath, map: false }),
      };
    }),
  );
  const sourcesByPath = new Map(
    parsedSources.map((source) => [source.relativePath, source]),
  );
  const sourceContexts = collectSourceContexts(sourcesByPath);
  const declarations = new Map<string, TokenDeclarationProjection[]>();

  for (const source of parsedSources) {
    const sourceDeclarations: Declaration[] = [];
    source.root.walkDecls(/^--salt-/u, (declaration) => {
      sourceDeclarations.push(declaration);
    });
    const contexts = sourceContexts.get(source.relativePath) ?? [];
    if (sourceDeclarations.length > 0 && contexts.length === 0) {
      throw new Error(
        `Token declaration source is unreachable from a declared theme entrypoint: ${source.relativePath}`,
      );
    }
    const sections = extractCssSectionReplacements(source.content);
    for (const declaration of sourceDeclarations) {
      const records = declarations.get(declaration.prop) ?? [];
      records.push(createDeclaration(source, declaration, contexts, sections));
      declarations.set(declaration.prop, records);
    }
  }

  for (const [tokenName, records] of declarations) {
    declarations.set(
      tokenName,
      records.sort(
        (left, right) =>
          compareOrdinalStrings(left.source_path, right.source_path) ||
          left.source_range.start_offset - right.source_range.start_offset ||
          compareOrdinalStrings(left.id, right.id),
      ),
    );
  }

  return { declarations, sourceContexts };
}
