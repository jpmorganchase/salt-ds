import path from "node:path";
import fg from "fast-glob";
import {
  SALT_EVIDENCE_REF_CONTRACT,
  type SaltEvidenceRef,
} from "../evidence.js";
import { toPosixPath } from "../registry/paths.js";
import type { TokenRecord } from "../types.js";
import {
  cleanMarkdownText,
  normalizeWhitespace,
  readFileOrNull,
  uniqueStrings,
} from "./buildRegistryShared.js";

export interface TokenPolicyDocSource {
  route: string;
  repo_path: string;
  content: string;
}

type TokenPolicy = NonNullable<TokenRecord["policy"]>;
type TokenPolicyUsageTier = TokenPolicy["usage_tier"];
type TokenPolicyDirectUse = TokenPolicy["direct_component_use"];

interface TokenTierPolicyEvidence {
  usage_tier: TokenPolicyUsageTier;
  direct_component_use: TokenPolicyDirectUse;
  text: string;
  source: TokenPolicyDocSource;
}

interface TokenNameParts {
  family: string;
  modifiers: string[];
  property: string | null;
}

interface TokenPolicyInput {
  name: string;
  category: string;
  source_paths?: string[];
  deprecated_replacements?: string[];
}

export interface DeprecatedTokenReplacementSource {
  replacement: string;
  source_kind: "docs" | "token";
  source_path: string;
  source_text: string;
  line_start?: number | null;
  line_end?: number | null;
}

interface DeprecatedTokenReplacementMetadataEntry {
  deprecated?: unknown;
  replacements?: unknown;
  replacement_kind?: unknown;
  note?: unknown;
  unsupported_reason?: unknown;
  basis?: unknown;
}

interface DeprecatedTokenReplacementMetadataBasis {
  source_path?: unknown;
  line_start?: unknown;
  line_end?: unknown;
}

export interface TokenStructuralRoleRule {
  id: string;
  category: string;
  kind: "container-pairing" | "separable-token" | "fixed-size" | "border-style";
  source: TokenPolicyDocSource;
  evidence_text: string;
  evidence_terms: string[];
  token_family?: string;
  token_property?: string;
  token_modifier?: string;
}

export interface TokenPolicySourceRegistry {
  design_tokens_overview: TokenPolicyDocSource | null;
  foundations_index: TokenPolicyDocSource | null;
  characteristic_docs_by_category: ReadonlyMap<string, TokenPolicyDocSource>;
  foundation_docs_by_category: ReadonlyMap<string, TokenPolicyDocSource>;
  foundation_categories: ReadonlySet<string>;
  deprecated_replacements_by_token: ReadonlyMap<
    string,
    readonly DeprecatedTokenReplacementSource[]
  >;
  structural_role_rules: readonly TokenStructuralRoleRule[];
}

function normalizeCategory(category: string): string {
  return category.trim().toLowerCase();
}

function routeCategorySegment(route: string): string | null {
  const segments = route.split("/").filter(Boolean);
  const last = segments.at(-1);
  if (!last) {
    return null;
  }

  return last === "index" ? (segments.at(-2) ?? null) : last;
}

function normalizeRouteCategory(route: string): string | null {
  const segment = routeCategorySegment(route);
  return segment ? normalizeCategory(segment.replace(/-/g, "")) : null;
}

function toSiteDocsRoute(repoRoot: string, filePath: string): string | null {
  const docsRoot = path.join(repoRoot, "site", "docs");
  const relativePath = toPosixPath(path.relative(docsRoot, filePath));
  if (relativePath.startsWith("..")) {
    return null;
  }

  return `/salt/${relativePath.replace(/\.mdx$/i, "")}`;
}

async function createDocSource(
  repoRoot: string,
  filePath: string,
): Promise<TokenPolicyDocSource | null> {
  const route = toSiteDocsRoute(repoRoot, filePath);
  const content = await readFileOrNull(filePath);
  if (!route || !content) {
    return null;
  }

  return {
    route,
    repo_path: toPosixPath(path.relative(repoRoot, filePath)),
    content,
  };
}

function stripFrontmatter(source: string): string {
  return source.replace(/^---[\s\S]*?---\s*/u, "");
}

function extractMarkdownTextBlocks(source: string): string[] {
  const blocks: string[] = [];
  const current: string[] = [];
  let insideMdxElement = false;

  const flush = () => {
    const text = cleanMarkdownText(current.join(" "));
    current.length = 0;
    if (text) {
      blocks.push(text);
    }
  };

  for (const line of stripFrontmatter(source).split(/\r?\n/u)) {
    const trimmed = line.trim();
    if (insideMdxElement) {
      if (trimmed.endsWith(">") || trimmed.endsWith("/>")) {
        insideMdxElement = false;
      }
      continue;
    }

    if (!trimmed) {
      flush();
      continue;
    }

    if (/^#{1,6}\s+/u.test(trimmed)) {
      flush();
      continue;
    }

    if (
      /^<[A-Z][A-Za-z0-9]*(?:\s|>|\/>)/u.test(trimmed) ||
      /^<\/[A-Z][A-Za-z0-9]*>/u.test(trimmed)
    ) {
      flush();
      if (!trimmed.endsWith(">") && !trimmed.endsWith("/>")) {
        insideMdxElement = true;
      }
      continue;
    }

    if (
      /^:fragment/u.test(trimmed) ||
      /^\|/u.test(trimmed) ||
      /^\{\/\*/u.test(trimmed)
    ) {
      flush();
      continue;
    }

    current.push(trimmed);
  }
  flush();

  return uniqueStrings(blocks);
}

function textMatchesAll(
  text: string,
  patterns: ReadonlyArray<string | RegExp>,
): boolean {
  const lowerText = text.toLowerCase();
  return patterns.every((pattern) =>
    typeof pattern === "string"
      ? lowerText.includes(pattern.toLowerCase())
      : pattern.test(text),
  );
}

function findTextBlock(
  source: string,
  patterns: ReadonlyArray<string | RegExp>,
): string | null {
  return (
    extractMarkdownTextBlocks(source).find((block) =>
      textMatchesAll(block, patterns),
    ) ?? null
  );
}

function findFirstTextBlock(source: string): string | null {
  return extractMarkdownTextBlocks(source)[0] ?? null;
}

function extractSectionTextBlocks(
  source: string,
  headingPattern: RegExp,
): string[] {
  const sectionLines: string[] = [];
  let isInSection = false;
  let sectionDepth = 0;

  for (const line of stripFrontmatter(source).split(/\r?\n/u)) {
    const heading = /^(#{1,6})\s+(.+)$/u.exec(line.trim());
    if (heading) {
      const depth = heading[1].length;
      const headingText = cleanMarkdownText(heading[2] ?? "");
      if (isInSection && depth <= sectionDepth) {
        break;
      }
      if (headingPattern.test(headingText)) {
        isInSection = true;
        sectionDepth = depth;
        continue;
      }
    }

    if (isInSection) {
      sectionLines.push(line);
    }
  }

  return extractMarkdownTextBlocks(sectionLines.join("\n"));
}

function extractMarkdownHeadings(source: string): string[] {
  return stripFrontmatter(source)
    .split(/\r?\n/u)
    .map((line) => /^(#{1,6})\s+(.+)$/u.exec(line.trim())?.[2] ?? null)
    .filter((heading): heading is string => Boolean(heading))
    .map(cleanMarkdownText)
    .filter(Boolean);
}

function extractTokenCategoriesFromSource(source: string): string[] {
  const categories: string[] = [];
  const tokenRegex = /--salt-([a-z][a-z0-9]*)(?:-[\w-]+)?/giu;
  let match = tokenRegex.exec(source);

  while (match) {
    const category = match[1];
    if (category) {
      categories.push(normalizeCategory(category));
    }
    match = tokenRegex.exec(source);
  }

  return uniqueStrings(categories);
}

function splitSentences(text: string): string[] {
  return uniqueStrings(
    text
      .split(/(?<=[.!?])\s+/u)
      .map((sentence) => normalizeWhitespace(sentence))
      .filter(Boolean),
  );
}

function matchingSentences(text: string, pattern: RegExp): string[] {
  return splitSentences(text).filter((sentence) => pattern.test(sentence));
}

function tokenSegment(tokenName: string, prefix: string): string | null {
  const match = new RegExp(`^--salt-${prefix}-([a-z0-9]+)`, "i").exec(
    tokenName,
  );
  return match?.[1]?.toLowerCase() ?? null;
}

function parseTokenName(tokenName: string): TokenNameParts | null {
  if (!tokenName.startsWith("--salt-")) {
    return null;
  }

  const [family, ...rest] = tokenName.slice("--salt-".length).split("-");
  if (!family) {
    return null;
  }

  const property = rest.at(-1) ?? null;
  return {
    family: normalizeCategory(family),
    modifiers: rest.slice(0, -1).map(normalizeCategory),
    property,
  };
}

function toRoleSegment(value: string): string {
  return normalizeWhitespace(value)
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

function singularizeRoleTerm(value: string): string {
  const normalized = toRoleSegment(value);
  return normalized.endsWith("s") ? normalized.slice(0, -1) : normalized;
}

function extractSourceTerms(
  text: string,
  patterns: ReadonlyArray<RegExp>,
): string[] {
  const terms: string[] = [];
  for (const pattern of patterns) {
    const match = pattern.exec(text);
    if (match?.[1]) {
      terms.push(match[1]);
    }
  }
  return uniqueStrings(terms.map(singularizeRoleTerm).filter(Boolean));
}

function extractCharacteristicGroups(source: string): string[] {
  const groups = new Set<string>();
  const groupRegex =
    /<CharacteristicsTokenTable\b[^>]*\bgroup=["']([^"']+)["'][^>]*>/g;
  let match = groupRegex.exec(source);
  while (match) {
    const group = match[1];
    if (group) {
      groups.add(normalizeCategory(group));
    }
    match = groupRegex.exec(source);
  }
  return [...groups];
}

function preferSpecificCharacteristicDoc(
  current: TokenPolicyDocSource | undefined,
  candidate: TokenPolicyDocSource,
  category: string,
): boolean {
  if (!current) {
    return true;
  }

  return candidate.route.endsWith(`/${category}-characteristic`);
}

async function collectCharacteristicDocSources(
  repoRoot: string,
): Promise<Map<string, TokenPolicyDocSource>> {
  const docs = new Map<string, TokenPolicyDocSource>();
  const docPaths = (
    await fg("site/docs/themes/design-tokens/*.mdx", {
      cwd: repoRoot,
      absolute: true,
      onlyFiles: true,
    })
  ).sort((left, right) => left.localeCompare(right));

  for (const docPath of docPaths) {
    const docSource = await createDocSource(repoRoot, docPath);
    if (!docSource) {
      continue;
    }

    const routeCategory = docSource.route.match(
      /\/salt\/themes\/design-tokens\/([a-z0-9-]+)-characteristic$/i,
    )?.[1];
    if (routeCategory) {
      docs.set(normalizeCategory(routeCategory), docSource);
    }

    for (const group of extractCharacteristicGroups(docSource.content)) {
      if (preferSpecificCharacteristicDoc(docs.get(group), docSource, group)) {
        docs.set(group, docSource);
      }
    }
  }

  return docs;
}

async function collectFoundationDocSources(
  repoRoot: string,
): Promise<Map<string, TokenPolicyDocSource>> {
  const docs = new Map<string, TokenPolicyDocSource>();
  const docPaths = (
    await fg("site/docs/foundations/**/*.mdx", {
      cwd: repoRoot,
      absolute: true,
      onlyFiles: true,
    })
  ).sort((left, right) => left.localeCompare(right));

  for (const docPath of docPaths) {
    const docSource = await createDocSource(repoRoot, docPath);
    const category = docSource ? normalizeRouteCategory(docSource.route) : null;
    if (!docSource || !category || category === "foundations") {
      continue;
    }

    docs.set(category, docSource);
    for (const tokenCategory of extractTokenCategoriesFromSource(
      docSource.content,
    )) {
      if (!docs.has(tokenCategory)) {
        docs.set(tokenCategory, docSource);
      }
    }
  }

  return docs;
}

async function collectFoundationCategories(
  repoRoot: string,
): Promise<Set<string>> {
  const cssPaths = await fg("packages/theme/css/**/foundations/*.css", {
    cwd: repoRoot,
    onlyFiles: true,
  });

  return new Set(
    cssPaths.map((cssPath) =>
      normalizeCategory(path.basename(cssPath, ".css")),
    ),
  );
}

function extractSaltTokensFromText(value: string): string[] {
  return uniqueStrings(
    [...value.matchAll(/--salt-[\w-]+/g)].map((match) => match[0]),
  );
}

function lineNumberAtOffset(content: string, offset: number): number {
  return content.slice(0, Math.max(0, offset)).split(/\r?\n/u).length;
}

function addDeprecatedReplacementSource(
  replacementsByToken: Map<string, DeprecatedTokenReplacementSource[]>,
  tokenName: string,
  source: DeprecatedTokenReplacementSource,
): void {
  if (!tokenName || !source.replacement || tokenName === source.replacement) {
    return;
  }

  const existing = replacementsByToken.get(tokenName) ?? [];
  const key = [
    source.replacement,
    source.source_kind,
    source.source_path,
    source.line_start ?? "",
    source.line_end ?? "",
  ].join("|");
  const hasSource = existing.some(
    (candidate) =>
      [
        candidate.replacement,
        candidate.source_kind,
        candidate.source_path,
        candidate.line_start ?? "",
        candidate.line_end ?? "",
      ].join("|") === key,
  );
  if (hasSource) {
    return;
  }

  replacementsByToken.set(tokenName, [...existing, source]);
}

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function asNullableLineNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isInteger(value) && value > 0
    ? value
    : null;
}

function metadataEntrySourceText(input: {
  deprecated: string;
  replacements: string[];
  replacementKind: string | null;
  note: string | null;
  basis: DeprecatedTokenReplacementMetadataBasis | null;
}): string {
  const basisLineStart = asNullableLineNumber(input.basis?.line_start);

  return normalizeWhitespace(
    [
      `${input.deprecated} -> ${input.replacements.join(", ")}`,
      input.replacementKind ? `kind: ${input.replacementKind}` : null,
      input.note,
      typeof input.basis?.source_path === "string"
        ? `basis: ${input.basis.source_path}`
        : null,
      basisLineStart ? `line ${basisLineStart}` : null,
    ]
      .filter((text): text is string => Boolean(text))
      .join("; "),
  );
}

const METADATA_POLICY_REPLACEMENT_KINDS = new Set([
  "direct",
  "alternative",
  "scale",
]);

function collectMetadataDeprecatedReplacements(
  replacementsByToken: Map<string, DeprecatedTokenReplacementSource[]>,
  input: {
    sourcePath: string;
    content: string;
  },
): void {
  const metadata = JSON.parse(input.content) as unknown;
  if (
    !isObject(metadata) ||
    metadata.schema !== "salt_theme_deprecated_token_replacements_v1"
  ) {
    return;
  }

  const entries = Array.isArray(metadata.entries) ? metadata.entries : [];
  for (const entry of entries) {
    if (!isObject(entry)) {
      continue;
    }

    const metadataEntry = entry as DeprecatedTokenReplacementMetadataEntry;
    const deprecated =
      typeof metadataEntry.deprecated === "string"
        ? metadataEntry.deprecated
        : null;
    const replacementKind =
      typeof metadataEntry.replacement_kind === "string"
        ? metadataEntry.replacement_kind
        : null;
    if (
      !deprecated?.startsWith("--salt-") ||
      !replacementKind ||
      !METADATA_POLICY_REPLACEMENT_KINDS.has(replacementKind)
    ) {
      continue;
    }

    const replacements = Array.isArray(metadataEntry.replacements)
      ? metadataEntry.replacements.filter(
          (replacement): replacement is string =>
            typeof replacement === "string" &&
            replacement.startsWith("--salt-"),
        )
      : [];
    if (replacements.length === 0) {
      continue;
    }

    const basis = isObject(metadataEntry.basis)
      ? (metadataEntry.basis as DeprecatedTokenReplacementMetadataBasis)
      : null;
    const lineStart = asNullableLineNumber(basis?.line_start);
    const sourceText = metadataEntrySourceText({
      deprecated,
      replacements,
      replacementKind,
      note: typeof metadataEntry.note === "string" ? metadataEntry.note : null,
      basis,
    });

    for (const replacement of replacements) {
      addDeprecatedReplacementSource(replacementsByToken, deprecated, {
        replacement,
        source_kind: "token",
        source_path: input.sourcePath,
        source_text: sourceText,
        line_start: lineStart,
        line_end: asNullableLineNumber(basis?.line_end) ?? lineStart,
      });
    }
  }
}

function splitMarkdownTableCells(line: string): string[] | null {
  const trimmed = line.trim();
  if (!trimmed.startsWith("|") || !trimmed.endsWith("|")) {
    return null;
  }

  return trimmed
    .slice(1, -1)
    .split("|")
    .map((cell) => cell.trim());
}

function isMarkdownTableSeparator(cells: string[]): boolean {
  return cells.every((cell) => /^:?-{3,}:?$/u.test(cell.trim()));
}

function normalizeMarkdownHeader(cell: string): string {
  return cleanMarkdownText(cell)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function findDeprecatedTokenColumn(headers: string[]): number {
  return headers.findIndex(
    (header) =>
      header === "name" ||
      header === "token" ||
      header === "deprecatedtoken" ||
      header.endsWith("tokendeprecated"),
  );
}

function findReplacementTokenColumn(headers: string[]): number {
  return headers.findIndex(
    (header) =>
      header === "replacement" ||
      header === "replacementtoken" ||
      header === "replacementtokens" ||
      header === "useinstead",
  );
}

function collectMarkdownTableDeprecatedReplacements(
  replacementsByToken: Map<string, DeprecatedTokenReplacementSource[]>,
  input: {
    sourcePath: string;
    content: string;
  },
): void {
  const lines = input.content.split(/\r?\n/u);

  for (let index = 0; index < lines.length; index += 1) {
    const headerCells = splitMarkdownTableCells(lines[index] ?? "");
    const separatorCells = splitMarkdownTableCells(lines[index + 1] ?? "");
    if (
      !headerCells ||
      !separatorCells ||
      !isMarkdownTableSeparator(separatorCells)
    ) {
      continue;
    }

    const headers = headerCells.map(normalizeMarkdownHeader);
    const tokenColumn = findDeprecatedTokenColumn(headers);
    const replacementColumn = findReplacementTokenColumn(headers);
    if (tokenColumn === -1 || replacementColumn === -1) {
      continue;
    }

    let rowIndex = index + 2;
    while (rowIndex < lines.length) {
      const rowLine = lines[rowIndex] ?? "";
      const rowCells = splitMarkdownTableCells(rowLine);
      if (!rowCells) {
        break;
      }

      const deprecatedTokens = extractSaltTokensFromText(
        rowCells[tokenColumn] ?? "",
      );
      const replacementTokens = extractSaltTokensFromText(
        rowCells[replacementColumn] ?? "",
      );
      for (const tokenName of deprecatedTokens) {
        for (const replacement of replacementTokens) {
          addDeprecatedReplacementSource(replacementsByToken, tokenName, {
            replacement,
            source_kind: "docs",
            source_path: input.sourcePath,
            source_text: cleanMarkdownText(rowLine),
            line_start: rowIndex + 1,
            line_end: rowIndex + 1,
          });
        }
      }

      rowIndex += 1;
    }

    index = rowIndex;
  }
}

function tokenFamilySuffix(tokenName: string): string | null {
  const parts = tokenName.replace("--salt-", "").split("-");
  return parts.length > 1 ? parts.slice(1).join("-") : null;
}

function directReplacementContext(lines: string[], startIndex: number): string {
  const contextLines: string[] = [];
  let foundContext = false;

  for (
    let index = startIndex - 1;
    index >= 0 && contextLines.length < 8;
    index -= 1
  ) {
    const line = lines[index]?.trim() ?? "";
    if (line.startsWith("```")) {
      break;
    }
    if (!line) {
      if (foundContext) {
        break;
      }
      continue;
    }

    if (line) {
      contextLines.unshift(line);
      foundContext = true;
    }
  }

  return cleanMarkdownText(contextLines.join(" "));
}

function collectDiffBlockDeprecatedReplacements(
  replacementsByToken: Map<string, DeprecatedTokenReplacementSource[]>,
  input: {
    sourcePath: string;
    content: string;
  },
): void {
  const lines = input.content.split(/\r?\n/u);

  for (let index = 0; index < lines.length; index += 1) {
    if (!/^```diff\s*$/u.test(lines[index]?.trim() ?? "")) {
      continue;
    }

    const context = directReplacementContext(lines, index);
    if (
      !/\b(direct replacement mapping|replaced tokens with below|replaced with below)\b/i.test(
        context,
      )
    ) {
      continue;
    }

    const removed: Array<{ token: string; line: number; text: string }> = [];
    const added: Array<{ token: string; line: number; text: string }> = [];
    let blockEnd = index + 1;
    while (
      blockEnd < lines.length &&
      !/^```\s*$/u.test(lines[blockEnd] ?? "")
    ) {
      const line = lines[blockEnd] ?? "";
      const match = /^\s*([+-])\s*(--salt-[\w-]+)/u.exec(line);
      if (match?.[1] === "-") {
        removed.push({
          token: match[2] ?? "",
          line: blockEnd + 1,
          text: line,
        });
      } else if (match?.[1] === "+") {
        added.push({
          token: match[2] ?? "",
          line: blockEnd + 1,
          text: line,
        });
      }
      blockEnd += 1;
    }

    const usedAddedTokens = new Set<string>();
    for (const removedToken of removed) {
      const removedSuffix = tokenFamilySuffix(removedToken.token);
      const addedToken =
        added.find((candidate) => {
          const candidateKey = `${candidate.token}:${candidate.line}`;
          return (
            !usedAddedTokens.has(candidateKey) &&
            removedSuffix &&
            tokenFamilySuffix(candidate.token) === removedSuffix
          );
        }) ??
        (removed.length === added.length
          ? added[removed.indexOf(removedToken)]
          : null);
      if (!addedToken) {
        continue;
      }

      usedAddedTokens.add(`${addedToken.token}:${addedToken.line}`);
      addDeprecatedReplacementSource(replacementsByToken, removedToken.token, {
        replacement: addedToken.token,
        source_kind: "docs",
        source_path: input.sourcePath,
        source_text: cleanMarkdownText(
          `${context} ${removedToken.text} ${addedToken.text}`,
        ),
        line_start: removedToken.line,
        line_end: addedToken.line,
      });
    }

    index = blockEnd;
  }
}

function collectInlineDeprecatedReplacements(
  replacementsByToken: Map<string, DeprecatedTokenReplacementSource[]>,
  input: {
    sourcePath: string;
    content: string;
  },
): void {
  const declarationRegex = /(--salt-[\w-]+)\s*:\s*([^;]+);/g;
  let declarationMatch = declarationRegex.exec(input.content);

  while (declarationMatch) {
    const tokenName = declarationMatch[1] ?? "";
    const lineStartOffset =
      input.content.lastIndexOf("\n", declarationMatch.index) + 1;
    const lineEndOffset = input.content.indexOf("\n", declarationMatch.index);
    const declarationLine = input.content.slice(
      lineStartOffset,
      lineEndOffset === -1 ? input.content.length : lineEndOffset,
    );
    const replacement =
      /\/\*\s*Use\s+(--salt-[\w-]+)\s*\*\//i.exec(declarationLine)?.[1] ?? null;

    if (replacement) {
      const lineNumber = lineNumberAtOffset(
        input.content,
        declarationMatch.index,
      );
      addDeprecatedReplacementSource(replacementsByToken, tokenName, {
        replacement,
        source_kind: "token",
        source_path: input.sourcePath,
        source_text: normalizeWhitespace(declarationLine),
        line_start: lineNumber,
        line_end: lineNumber,
      });
    }

    declarationMatch = declarationRegex.exec(input.content);
  }
}

async function collectDeprecatedTokenReplacements(
  repoRoot: string,
): Promise<Map<string, DeprecatedTokenReplacementSource[]>> {
  const replacementsByToken = new Map<
    string,
    DeprecatedTokenReplacementSource[]
  >();
  const metadataPath = "packages/theme/css/deprecated/token-replacements.json";
  const metadata = await readFileOrNull(path.join(repoRoot, metadataPath));
  if (metadata) {
    collectMetadataDeprecatedReplacements(replacementsByToken, {
      sourcePath: metadataPath,
      content: metadata,
    });
  }

  const changelogPath = "packages/theme/CHANGELOG.md";
  const changelog = await readFileOrNull(path.join(repoRoot, changelogPath));
  if (changelog) {
    collectMarkdownTableDeprecatedReplacements(replacementsByToken, {
      sourcePath: changelogPath,
      content: changelog,
    });
    collectDiffBlockDeprecatedReplacements(replacementsByToken, {
      sourcePath: changelogPath,
      content: changelog,
    });
  }

  const cssPaths = (
    await fg("packages/theme/css/**/*.css", {
      cwd: repoRoot,
      absolute: true,
      onlyFiles: true,
    })
  ).sort((left, right) => left.localeCompare(right));

  for (const cssPath of cssPaths) {
    const sourcePath = toPosixPath(path.relative(repoRoot, cssPath));
    if (!sourcePath.includes("/deprecated/")) {
      continue;
    }

    const content = await readFileOrNull(cssPath);
    if (!content) {
      continue;
    }

    collectInlineDeprecatedReplacements(replacementsByToken, {
      sourcePath,
      content,
    });
  }

  return replacementsByToken;
}

function buildContainerStructuralRoleRules(
  source: TokenPolicyDocSource | null,
): TokenStructuralRoleRule[] {
  if (!source) {
    return [];
  }

  const evidenceText = findTextBlock(source.content, [
    /\bcontainer background\b/i,
    /\bcorresponding border color\b/i,
    /\bused together\b/i,
  ]);
  if (!evidenceText) {
    return [];
  }

  const terms = extractSourceTerms(evidenceText, [
    /\b(container)\s+background\b/i,
    /\bborder\s+(color)\b/i,
  ]);

  return [
    {
      id: `${source.route}#container-pairing`,
      category: "container",
      kind: "container-pairing",
      source,
      evidence_text: evidenceText,
      evidence_terms: terms,
      token_family: "container",
    },
  ];
}

function buildSeparableStructuralRoleRules(
  source: TokenPolicyDocSource | null,
): TokenStructuralRoleRule[] {
  if (!source) {
    return [];
  }

  return findTokenMentionedSections(source, "--salt-separable-")
    .filter((evidenceText) => /\bseparator/i.test(evidenceText))
    .map((evidenceText, index) => ({
      id: `${source.route}#separable-token${index === 0 ? "" : `-${index + 1}`}`,
      category: "separable",
      kind: "separable-token" as const,
      source,
      evidence_text: evidenceText,
      evidence_terms: extractSourceTerms(evidenceText, [/\b(separator)s?\b/i]),
      token_family: "separable",
    }))
    .filter((rule) => rule.evidence_terms.length > 0);
}

function buildSizeStructuralRoleRules(
  source: TokenPolicyDocSource | null,
): TokenStructuralRoleRule[] {
  if (!source) {
    return [];
  }

  const evidenceText =
    extractSectionTextBlocks(source.content, /^Borders$/iu).find((block) =>
      /--salt-size-fixed-100|--salt-size-fixed-200/u.test(block),
    ) ?? null;
  if (!evidenceText) {
    return [];
  }

  return [
    {
      id: `${source.route}#fixed-size-border-separator`,
      category: "size",
      kind: "fixed-size",
      source,
      evidence_text: evidenceText,
      evidence_terms: extractSourceTerms(evidenceText, [
        /\b(border)s?\b/i,
        /\b(separator)s?\b/i,
      ]),
      token_family: "size",
      token_modifier: "fixed",
    },
  ];
}

function buildBorderStyleStructuralRoleRules(
  source: TokenPolicyDocSource | null,
): TokenStructuralRoleRule[] {
  if (!source) {
    return [];
  }

  const rules: TokenStructuralRoleRule[] = [];
  const variants = extractMarkdownHeadings(source.content)
    .map((heading) => toRoleSegment(heading))
    .filter(Boolean);
  for (const variant of variants) {
    const evidenceText =
      extractSectionTextBlocks(
        source.content,
        new RegExp(`^${variant}$`, "i"),
      )[0] ?? null;
    if (!evidenceText) {
      continue;
    }

    const terms = extractSourceTerms(evidenceText, [
      /\b(border)\s+style\b/i,
      /\b(divider)s?\b/i,
      /\b(drag\/drop target)s?\b/i,
      /\b(temporary)\b/i,
    ]);
    if (terms.length === 0) {
      continue;
    }

    rules.push({
      id: `${source.route}#${variant}`,
      category: "borderstyle",
      kind: "border-style",
      source,
      evidence_text: evidenceText,
      evidence_terms: terms,
      token_family: "borderstyle",
      token_modifier: variant,
    });
  }

  return rules;
}

function buildStructuralRoleRules(input: {
  characteristicDocs: ReadonlyMap<string, TokenPolicyDocSource>;
  foundationDocs: ReadonlyMap<string, TokenPolicyDocSource>;
}): TokenStructuralRoleRule[] {
  return [
    ...buildContainerStructuralRoleRules(
      input.characteristicDocs.get("container") ?? null,
    ),
    ...buildSeparableStructuralRoleRules(
      input.characteristicDocs.get("separable") ?? null,
    ),
    ...buildSizeStructuralRoleRules(input.foundationDocs.get("size") ?? null),
    ...buildBorderStyleStructuralRoleRules(
      input.foundationDocs.get("borderstyle") ?? null,
    ),
  ];
}

export async function buildTokenPolicySourceRegistry(
  repoRoot: string,
): Promise<TokenPolicySourceRegistry> {
  const [
    characteristicDocs,
    foundationDocs,
    foundationCategories,
    deprecatedReplacementSources,
    designTokensOverview,
    foundationsIndex,
  ] = await Promise.all([
    collectCharacteristicDocSources(repoRoot),
    collectFoundationDocSources(repoRoot),
    collectFoundationCategories(repoRoot),
    collectDeprecatedTokenReplacements(repoRoot),
    createDocSource(
      repoRoot,
      path.join(
        repoRoot,
        "site",
        "docs",
        "themes",
        "design-tokens",
        "index.mdx",
      ),
    ),
    createDocSource(
      repoRoot,
      path.join(repoRoot, "site", "docs", "foundations", "index.mdx"),
    ),
  ]);

  return {
    design_tokens_overview: designTokensOverview,
    foundations_index: foundationsIndex,
    characteristic_docs_by_category: characteristicDocs,
    foundation_docs_by_category: foundationDocs,
    foundation_categories: foundationCategories,
    deprecated_replacements_by_token: deprecatedReplacementSources,
    structural_role_rules: buildStructuralRoleRules({
      characteristicDocs,
      foundationDocs,
    }),
  };
}

function withSources(
  ...sources: Array<TokenPolicyDocSource | null | undefined>
): TokenPolicyDocSource[] {
  const byRoute = new Map<string, TokenPolicyDocSource>();
  for (const source of sources) {
    if (source && !byRoute.has(source.route)) {
      byRoute.set(source.route, source);
    }
  }
  return [...byRoute.values()];
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function buildPolicyEvidenceRefs(
  tokenName: string,
  docs: TokenPolicyDocSource[],
): SaltEvidenceRef[] {
  return docs.map((doc, index) => ({
    contract: SALT_EVIDENCE_REF_CONTRACT,
    id: `${slugify(tokenName)}.policy.docs.${index}.source-ref`,
    source_kind: "docs",
    claim_kind: "token",
    source: {
      url: doc.route,
      repo_path: doc.repo_path,
    },
    confidence: "high",
    note: "Source-backed docs evidence for generated token policy metadata.",
  }));
}

function buildTokenSourceEvidenceRefs(
  tokenName: string,
  sourcePaths: string[],
): SaltEvidenceRef[] {
  return uniqueStrings(sourcePaths).map((sourcePath, index) => ({
    contract: SALT_EVIDENCE_REF_CONTRACT,
    id: `${slugify(tokenName)}.policy.token-source.${index}.source-ref`,
    source_kind: "token",
    claim_kind: "token",
    source: {
      repo_path: sourcePath,
    },
    confidence: "high",
    note: "Source-backed token evidence for generated token policy metadata.",
  }));
}

function withPolicyEvidence(
  tokenName: string,
  policy: Omit<NonNullable<TokenRecord["policy"]>, "docs" | "evidence_refs">,
  docs: TokenPolicyDocSource[],
  extraEvidenceRefs: SaltEvidenceRef[] = [],
): NonNullable<TokenRecord["policy"]> | null {
  if (docs.length === 0 && extraEvidenceRefs.length === 0) {
    return null;
  }

  return {
    ...policy,
    docs: uniqueStrings(docs.map((doc) => doc.route)),
    evidence_refs: [
      ...buildPolicyEvidenceRefs(tokenName, docs),
      ...extraEvidenceRefs,
    ],
  };
}

function getTierPolicyEvidence(
  sources: TokenPolicySourceRegistry,
  usageTier: TokenPolicyUsageTier,
): TokenTierPolicyEvidence | null {
  const overview = sources.design_tokens_overview;
  if (!overview) {
    return null;
  }

  if (usageTier === "palette") {
    const text = findTextBlock(overview.content, [
      /\bPalette tokens\b/u,
      /\bnever referenced directly\b/u,
      /\bcomponents or patterns\b/u,
    ]);
    return text
      ? {
          usage_tier: usageTier,
          direct_component_use: "never",
          text,
          source: overview,
        }
      : null;
  }

  if (usageTier === "characteristic") {
    const text = findTextBlock(overview.content, [
      /\bCharacteristics\b/u,
      /\balways referenced\b/u,
      /\bcomponents and patterns\b/u,
    ]);
    return text
      ? {
          usage_tier: usageTier,
          direct_component_use: "always",
          text,
          source: overview,
        }
      : null;
  }

  const text = findTextBlock(overview.content, [
    /\bFoundation tokens\b/u,
    /\bsometimes be referenced directly\b/u,
  ]);
  return text
    ? {
        usage_tier: usageTier,
        direct_component_use: "conditional",
        text,
        source: overview,
      }
    : null;
}

function sourceBackedPolicyDocs(
  tierEvidence: TokenTierPolicyEvidence,
  ...sources: Array<TokenPolicyDocSource | null | undefined>
): TokenPolicyDocSource[] {
  return withSources(...sources, tierEvidence.source);
}

function findTokenMentionedBlock(
  source: TokenPolicyDocSource | null,
  tokenName: string,
): string | null {
  return source ? findTextBlock(source.content, [tokenName]) : null;
}

function findTokenMentionedSourceText(
  source: TokenPolicyDocSource | null,
  tokenName: string,
): string | null {
  const block = findTokenMentionedBlock(source, tokenName);
  if (block) {
    return block;
  }

  const line = source?.content
    .split(/\r?\n/u)
    .find((candidate) => candidate.includes(tokenName));

  return line ? cleanMarkdownText(line) : null;
}

function findTokenMentionedSection(
  source: TokenPolicyDocSource | null,
  tokenName: string,
): string | null {
  return findTokenMentionedSections(source, tokenName)[0] ?? null;
}

function findTokenMentionedSections(
  source: TokenPolicyDocSource | null,
  tokenName: string,
): string[] {
  if (!source) {
    return [];
  }

  const sections: string[] = [];
  let currentHeading = "";
  let currentLines: string[] = [];

  const flush = () => {
    if (currentLines.join("\n").includes(tokenName)) {
      sections.push(
        uniquePolicyText([
          currentHeading,
          ...extractMarkdownTextBlocks(currentLines.join("\n")),
        ]).join(" "),
      );
    }
    currentLines = [];
  };

  for (const line of stripFrontmatter(source.content).split(/\r?\n/u)) {
    const heading = /^(#{1,6})\s+(.+)$/u.exec(line.trim());
    if (heading) {
      flush();
      currentHeading = heading[2] ?? "";
      continue;
    }

    currentLines.push(line);
  }
  flush();

  return sections.filter((section) => section.length > 0);
}

function categoryDescription(
  source: TokenPolicyDocSource | null,
  category: string,
): string | null {
  if (!source) {
    return null;
  }

  return (
    extractSectionTextBlocks(
      source.content,
      new RegExp(`^${category}$`, "i"),
    )[0] ??
    findTextBlock(source.content, [
      new RegExp(`\\b${category}\\b`, "i"),
      /\btokens?\b/i,
    ]) ??
    findFirstTextBlock(source.content)
  );
}

function uniquePolicyText(values: Array<string | null | undefined>): string[] {
  return uniqueStrings(
    values
      .map((value) => (value ? normalizeWhitespace(value) : ""))
      .filter(Boolean),
  );
}

function structuralRoleRulesForCategory(
  sources: TokenPolicySourceRegistry,
  category: string,
): TokenStructuralRoleRule[] {
  return sources.structural_role_rules.filter(
    (rule) => normalizeCategory(rule.category) === category,
  );
}

function tokenPropertyRoleSegment(
  property: string | null,
  options: { collapseBorderColor?: boolean } = {},
): string | null {
  if (!property) {
    return null;
  }

  const segment = toRoleSegment(property);
  return options.collapseBorderColor && segment === "border-color"
    ? "color"
    : segment;
}

function buildContainerPolicyStructure(
  tokenName: string,
  sources: TokenPolicySourceRegistry,
): Pick<TokenPolicy, "structural_roles" | "pairing"> {
  const tokenParts = parseTokenName(tokenName);
  const rule = structuralRoleRulesForCategory(sources, "container").find(
    (candidate) =>
      candidate.kind === "container-pairing" &&
      candidate.token_family === tokenParts?.family,
  );
  const property = tokenPropertyRoleSegment(tokenParts?.property ?? null);

  if (!rule || !tokenParts || !property || tokenParts.modifiers.length === 0) {
    return { structural_roles: [], pairing: null };
  }

  const role = `${tokenParts.family}-${property}`;
  return {
    structural_roles: [role],
    pairing: {
      family: tokenParts.family,
      role,
      level: tokenParts.modifiers[0] ?? null,
    },
  };
}

function buildSeparableStructuralRoles(
  tokenName: string,
  sources: TokenPolicySourceRegistry,
): string[] {
  const tokenParts = parseTokenName(tokenName);
  const rule = structuralRoleRulesForCategory(sources, "separable").find(
    (candidate) =>
      candidate.kind === "separable-token" &&
      candidate.token_family === tokenParts?.family,
  );
  const source = rule?.source ?? null;
  const mentionedSection = findTokenMentionedSection(source, tokenName);
  const roleTerm = rule?.evidence_terms[0] ?? null;
  const property = tokenPropertyRoleSegment(tokenParts?.property ?? null, {
    collapseBorderColor: true,
  });

  if (!rule || !mentionedSection || !roleTerm || !property) {
    return [];
  }

  return mentionedSection.includes("feedback") &&
    ["background", "foreground"].includes(property)
    ? [`${roleTerm}-feedback-${property}`]
    : [`${roleTerm}-${property}`];
}

function buildFixedSizeStructuralRoles(
  tokenName: string,
  sources: TokenPolicySourceRegistry,
): string[] {
  const tokenParts = parseTokenName(tokenName);
  const rule = structuralRoleRulesForCategory(sources, "size").find(
    (candidate) =>
      candidate.kind === "fixed-size" &&
      candidate.token_family === tokenParts?.family &&
      candidate.token_modifier &&
      tokenParts?.modifiers.includes(candidate.token_modifier),
  );
  if (!rule || !rule.evidence_text.includes(tokenName)) {
    return [];
  }

  return rule.evidence_terms.map((term) => `${term}-thickness`);
}

function buildBorderStyleStructuralRoles(
  tokenName: string,
  sources: TokenPolicySourceRegistry,
): string[] {
  const tokenParts = parseTokenName(tokenName);
  const rule = structuralRoleRulesForCategory(sources, "borderstyle").find(
    (candidate) =>
      candidate.kind === "border-style" &&
      candidate.token_family === tokenParts?.family &&
      candidate.token_modifier ===
        normalizeCategory(tokenParts?.property ?? ""),
  );
  if (!rule) {
    return [];
  }

  const roles: string[] = [];
  const styleSegment = toRoleSegment(
    rule.category.replace(/style$/i, " style"),
  );
  for (const term of rule.evidence_terms) {
    if (term === "border") {
      if (/\bdefault value\b/i.test(rule.evidence_text)) {
        roles.push(`${styleSegment}-default`);
      }
      continue;
    }
    if (term === "divider" && /\bdefault value\b/i.test(rule.evidence_text)) {
      roles.push(`${term}-style-default`);
      continue;
    }
    roles.push(`${term}-${styleSegment}`);
  }

  return roles;
}

function buildPalettePolicy(
  tokenName: string,
  sources: TokenPolicySourceRegistry,
): NonNullable<TokenRecord["policy"]> | null {
  const tierEvidence = getTierPolicyEvidence(sources, "palette");
  if (!tierEvidence) {
    return null;
  }

  const docs = sourceBackedPolicyDocs(tierEvidence);
  const avoidFor = matchingSentences(
    tierEvidence.text,
    /\bnever referenced directly\b/i,
  );

  return withPolicyEvidence(
    tokenName,
    {
      usage_tier: tierEvidence.usage_tier,
      direct_component_use: tierEvidence.direct_component_use,
      preferred_for: [tierEvidence.text],
      avoid_for: avoidFor,
      notes: [tierEvidence.text],
      structural_roles: [],
      pairing: null,
    },
    docs,
  );
}

function buildCharacteristicPolicy(
  tokenName: string,
  category: string,
  sources: TokenPolicySourceRegistry,
): NonNullable<TokenRecord["policy"]> | null {
  const tierEvidence = getTierPolicyEvidence(sources, "characteristic");
  if (!tierEvidence) {
    return null;
  }

  const characteristicDoc =
    sources.characteristic_docs_by_category.get(category) ?? null;
  const docs = sourceBackedPolicyDocs(tierEvidence, characteristicDoc);
  const description = categoryDescription(characteristicDoc, category);
  const tokenBlock = findTokenMentionedBlock(characteristicDoc, tokenName);
  const containerBorderGuidance =
    category === "container" && characteristicDoc
      ? findTextBlock(characteristicDoc.content, [
          /\bcontainer background\b/i,
          /\bcorresponding border color\b/i,
        ])
      : null;
  const preferredFor = uniquePolicyText([description, tokenBlock]);
  const avoidFor = containerBorderGuidance
    ? matchingSentences(containerBorderGuidance, /\bAvoid\b/i)
    : [];
  const notes = uniquePolicyText([
    tierEvidence.text,
    description,
    tokenBlock,
    containerBorderGuidance,
  ]);

  const { structural_roles: containerRoles, pairing } =
    category === "container"
      ? buildContainerPolicyStructure(tokenName, sources)
      : { structural_roles: [], pairing: null };
  const structuralRoles =
    category === "separable"
      ? buildSeparableStructuralRoles(tokenName, sources)
      : containerRoles;

  return withPolicyEvidence(
    tokenName,
    {
      usage_tier: tierEvidence.usage_tier,
      direct_component_use: tierEvidence.direct_component_use,
      preferred_for: preferredFor,
      avoid_for: avoidFor,
      notes,
      structural_roles: structuralRoles,
      pairing,
    },
    docs,
  );
}

function buildFoundationPolicy(
  tokenName: string,
  category: string,
  sources: TokenPolicySourceRegistry,
): NonNullable<TokenRecord["policy"]> | null {
  const tierEvidence = getTierPolicyEvidence(sources, "foundation");
  if (!tierEvidence) {
    return null;
  }

  const foundationDoc =
    sources.foundation_docs_by_category.get(category) ??
    sources.foundations_index;
  const docs = sourceBackedPolicyDocs(tierEvidence, foundationDoc);
  const description = categoryDescription(foundationDoc, category);
  const tokenBlock = findTokenMentionedBlock(foundationDoc, tokenName);
  const sizeBordersBlock =
    category === "size" && foundationDoc
      ? (extractSectionTextBlocks(foundationDoc.content, /^Borders$/iu).find(
          (block) => /--salt-size-fixed-100|--salt-size-fixed-200/u.test(block),
        ) ?? null)
      : null;
  const borderStyleVariant =
    category === "borderstyle" && foundationDoc
      ? (extractSectionTextBlocks(
          foundationDoc.content,
          new RegExp(`^${tokenSegment(tokenName, "borderStyle") ?? ""}$`, "i"),
        )[0] ?? null)
      : null;
  const preferredFor = uniquePolicyText([
    description,
    tokenBlock,
    sizeBordersBlock,
    borderStyleVariant,
  ]);
  const notes = uniquePolicyText([
    tierEvidence.text,
    description,
    tokenBlock,
    sizeBordersBlock,
    borderStyleVariant,
  ]);
  const structuralRoles = uniqueStrings([
    ...buildFixedSizeStructuralRoles(tokenName, sources),
    ...buildBorderStyleStructuralRoles(tokenName, sources),
  ]);

  return withPolicyEvidence(
    tokenName,
    {
      usage_tier: tierEvidence.usage_tier,
      direct_component_use: tierEvidence.direct_component_use,
      preferred_for: preferredFor,
      avoid_for: [],
      notes,
      structural_roles: structuralRoles,
      pairing: null,
    },
    docs,
  );
}

function findPolicyDocForTokenName(
  tokenName: string,
  sources: TokenPolicySourceRegistry,
): TokenPolicyDocSource | null {
  const category = normalizeCategory(
    tokenName.replace("--salt-", "").split("-")[0] ?? "",
  );

  const candidates = [
    sources.characteristic_docs_by_category.get(category) ?? null,
    sources.foundation_docs_by_category.get(category) ?? null,
  ].filter((source): source is TokenPolicyDocSource => Boolean(source));

  return (
    candidates.find((source) =>
      Boolean(findTokenMentionedSourceText(source, tokenName)),
    ) ?? null
  );
}

function replacementTokenTier(
  tokenName: string,
  sources: TokenPolicySourceRegistry,
): TokenPolicyUsageTier | null {
  const category = normalizeCategory(
    tokenName.replace("--salt-", "").split("-")[0] ?? "",
  );

  if (tokenName.startsWith("--salt-palette-") || category === "palette") {
    return "palette";
  }
  if (sources.characteristic_docs_by_category.has(category)) {
    return "characteristic";
  }
  if (
    sources.foundation_categories.has(category) ||
    sources.foundation_docs_by_category.has(category)
  ) {
    return "foundation";
  }

  return null;
}

function buildDeprecatedReplacementSourceEvidenceRefs(
  tokenName: string,
  replacementSources: readonly DeprecatedTokenReplacementSource[],
): SaltEvidenceRef[] {
  const uniqueSources = new Map<string, DeprecatedTokenReplacementSource>();
  for (const source of replacementSources) {
    uniqueSources.set(
      [
        source.replacement,
        source.source_kind,
        source.source_path,
        source.line_start ?? "",
        source.line_end ?? "",
      ].join("|"),
      source,
    );
  }

  return [...uniqueSources.values()].map((source, index) => ({
    contract: SALT_EVIDENCE_REF_CONTRACT,
    id: `${slugify(tokenName)}.policy.deprecated-replacement.${index}.source-ref`,
    source_kind: source.source_kind,
    claim_kind: "token",
    source: {
      repo_path: source.source_path,
      section: source.source_text,
      line_start: source.line_start ?? null,
      line_end: source.line_end ?? null,
    },
    confidence: "high",
    note: "Source-backed deprecated token replacement evidence for generated token policy metadata.",
  }));
}

interface ResolvedDeprecatedReplacement {
  replacement: string;
  evidenceSources: DeprecatedTokenReplacementSource[];
}

function hasPolicyBackedReplacement(
  replacement: string,
  sources: TokenPolicySourceRegistry,
): boolean {
  return (
    replacementTokenTier(replacement, sources) !== null &&
    findPolicyDocForTokenName(replacement, sources) !== null
  );
}

function resolveDeprecatedReplacement(
  candidate: ResolvedDeprecatedReplacement,
  sources: TokenPolicySourceRegistry,
  visited: ReadonlySet<string>,
  depth: number,
): ResolvedDeprecatedReplacement[] {
  if (hasPolicyBackedReplacement(candidate.replacement, sources)) {
    return [candidate];
  }

  if (depth >= 4 || visited.has(candidate.replacement)) {
    return [];
  }

  const nextSources =
    sources.deprecated_replacements_by_token.get(candidate.replacement) ?? [];
  if (nextSources.length === 0) {
    return [];
  }

  const nextVisited = new Set([...visited, candidate.replacement]);
  return nextSources.flatMap((nextSource) =>
    resolveDeprecatedReplacement(
      {
        replacement: nextSource.replacement,
        evidenceSources: [...candidate.evidenceSources, nextSource],
      },
      sources,
      nextVisited,
      depth + 1,
    ),
  );
}

function resolveDeprecatedReplacements(
  token: TokenPolicyInput,
  sources: TokenPolicySourceRegistry,
): ResolvedDeprecatedReplacement[] {
  const candidates: ResolvedDeprecatedReplacement[] = [
    ...uniqueStrings(token.deprecated_replacements ?? []).map(
      (replacement) => ({
        replacement,
        evidenceSources: [],
      }),
    ),
    ...(sources.deprecated_replacements_by_token.get(token.name) ?? []).map(
      (source) => ({
        replacement: source.replacement,
        evidenceSources: [source],
      }),
    ),
  ];
  const byReplacement = new Map<string, DeprecatedTokenReplacementSource[]>();

  for (const candidate of candidates) {
    for (const resolved of resolveDeprecatedReplacement(
      candidate,
      sources,
      new Set([token.name]),
      0,
    )) {
      byReplacement.set(resolved.replacement, [
        ...(byReplacement.get(resolved.replacement) ?? []),
        ...resolved.evidenceSources,
      ]);
    }
  }

  return [...byReplacement.entries()].map(([replacement, evidenceSources]) => ({
    replacement,
    evidenceSources,
  }));
}

function buildDeprecatedReplacementPolicy(
  token: TokenPolicyInput,
  sources: TokenPolicySourceRegistry,
): NonNullable<TokenRecord["policy"]> | null {
  const resolvedReplacements = resolveDeprecatedReplacements(token, sources);
  const replacements = uniqueStrings(
    resolvedReplacements.map((replacement) => replacement.replacement),
  );
  if (replacements.length === 0) {
    return null;
  }

  const replacementDocs = replacements.map((replacement) =>
    findPolicyDocForTokenName(replacement, sources),
  );
  if (replacementDocs.some((doc) => doc == null)) {
    return null;
  }

  const replacementTiers = uniqueStrings(
    replacements
      .map((replacement) => replacementTokenTier(replacement, sources))
      .filter((tier): tier is TokenPolicyUsageTier => Boolean(tier)),
  );
  if (replacementTiers.length !== 1) {
    return null;
  }

  const tierEvidence = getTierPolicyEvidence(sources, replacementTiers[0]);
  if (!tierEvidence) {
    return null;
  }

  const docs = sourceBackedPolicyDocs(
    tierEvidence,
    ...(replacementDocs as TokenPolicyDocSource[]),
  );
  const replacementBlocks = uniquePolicyText(
    replacements.map((replacement, index) =>
      findTokenMentionedSourceText(replacementDocs[index] ?? null, replacement),
    ),
  );

  return withPolicyEvidence(
    token.name,
    {
      usage_tier: tierEvidence.usage_tier,
      direct_component_use: tierEvidence.direct_component_use,
      preferred_for: [],
      avoid_for:
        tierEvidence.usage_tier === "palette"
          ? matchingSentences(
              tierEvidence.text,
              /\bnever referenced directly\b/i,
            )
          : [],
      notes: uniquePolicyText([tierEvidence.text, ...replacementBlocks]),
      structural_roles: [],
      pairing: null,
    },
    docs,
    [
      ...buildTokenSourceEvidenceRefs(token.name, token.source_paths ?? []),
      ...buildDeprecatedReplacementSourceEvidenceRefs(
        token.name,
        resolvedReplacements.flatMap(
          (replacement) => replacement.evidenceSources,
        ),
      ),
    ],
  );
}

export function getTokenPolicy(
  token: TokenPolicyInput,
  sources: TokenPolicySourceRegistry,
): NonNullable<TokenRecord["policy"]> | null {
  const category = normalizeCategory(token.category);

  if (token.name.startsWith("--salt-palette-") || category === "palette") {
    return buildPalettePolicy(token.name, sources);
  }

  if (sources.characteristic_docs_by_category.has(category)) {
    return buildCharacteristicPolicy(token.name, category, sources);
  }

  if (
    sources.foundation_categories.has(category) ||
    sources.foundation_docs_by_category.has(category)
  ) {
    return buildFoundationPolicy(token.name, category, sources);
  }

  return buildDeprecatedReplacementPolicy(token, sources);
}
