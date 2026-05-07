import fs from "node:fs/promises";
import path from "node:path";
import fg from "fast-glob";
import { toPosixPath } from "../registry/paths.js";
import type { ComponentRecord, TokenRecord } from "../types.js";
import {
  cleanMarkdownText,
  normalizeWhitespace,
  readFileOrNull,
} from "./buildRegistryShared.js";
import {
  buildTokenPolicySourceRegistry,
  getTokenPolicyGap,
  getTokenPolicy,
  type TokenPolicySourceRegistry,
} from "./buildRegistryTokenPolicy.js";

function inferTokenType(tokenValue: string): string {
  if (/^#[a-f0-9]{3,8}$/i.test(tokenValue) || /^rgb/i.test(tokenValue)) {
    return "color";
  }
  if (/^-?\d+(\.\d+)?(px|rem|em|%)$/i.test(tokenValue)) {
    return "dimension";
  }
  if (/^(true|false)$/i.test(tokenValue)) {
    return "boolean";
  }
  if (/^-?\d+(\.\d+)?$/.test(tokenValue)) {
    return "number";
  }
  return "string";
}

function inferThemeFromTokenPath(cssPath: string): string[] {
  const normalized = toPosixPath(cssPath);
  const isNext = normalized.includes("/next/");
  const isLegacy = normalized.includes("/legacy/");

  if (isNext) {
    return ["next"];
  }
  if (isLegacy) {
    return ["salt"];
  }
  return ["salt", "next"];
}

function normalizeCategory(value: string): string {
  return value.trim().replace(/\s+/g, "").toLowerCase();
}

interface CssSectionReplacement {
  category: string;
  replacementCategory: string | null;
  start: number;
}

function cleanCssCommentText(value: string): string {
  return normalizeWhitespace(
    value
      .split(/\r?\n/u)
      .map((line) => line.replace(/^\s*\*\s?/u, "").trim())
      .join(" "),
  )
    .replace(/\*\*/g, "")
    .trim();
}

function parseDeprecatedReplacementCategory(
  commentText: string,
): string | null {
  const match = /\bDeprecated:?\s*Use\s+([a-z][a-z0-9-]*)\s+instead\b/i.exec(
    commentText,
  );

  return match?.[1] ? normalizeCategory(match[1]) : null;
}

function parseSectionCategory(commentText: string): string | null {
  if (
    /\bDeprecated\b/i.test(commentText) ||
    /\bUse\s+--salt-[\w-]+/i.test(commentText)
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
  const commentRegex = /\/\*([\s\S]*?)\*\//g;
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
    if (section.start > offset) {
      break;
    }
    current = section;
  }

  return current;
}

function buildCategoryReplacementTokenName(
  tokenName: string,
  category: string,
  replacementCategory: string | null,
): string | null {
  if (!replacementCategory) {
    return null;
  }

  const prefix = `--salt-${category}`;
  return tokenName.startsWith(prefix)
    ? `--salt-${replacementCategory}${tokenName.slice(prefix.length)}`
    : null;
}

async function extractTokenDescriptions(
  repoRoot: string,
): Promise<Map<string, string>> {
  const descriptionsPath = path.join(
    repoRoot,
    "site/src/components/css-display/descriptions.ts",
  );
  const source = await readFileOrNull(descriptionsPath);
  if (!source) {
    return new Map<string, string>();
  }

  const descriptionMap = new Map<string, string>();
  const pairRegex = /^\s*(\w+):\s*"([^"]+)"[, ]*$/gm;
  let match = pairRegex.exec(source);
  while (match) {
    descriptionMap.set(match[1], cleanMarkdownText(match[2]));
    match = pairRegex.exec(source);
  }

  return descriptionMap;
}

export async function extractTokens(
  repoRoot: string,
  verifiedAt: string,
  tokenPolicySources?: TokenPolicySourceRegistry,
): Promise<TokenRecord[]> {
  const tokenDescriptions = await extractTokenDescriptions(repoRoot);
  const resolvedTokenPolicySources =
    tokenPolicySources ?? (await buildTokenPolicySourceRegistry(repoRoot));
  const cssPaths = (
    await fg("packages/theme/css/**/*.css", {
      cwd: repoRoot,
      absolute: true,
      onlyFiles: true,
    })
  ).sort((left, right) => left.localeCompare(right));

  const tokenMap = new Map<
    string,
    TokenRecord & {
      themeSet: Set<string>;
      guidanceSet: Set<string>;
      sourcePathSet: Set<string>;
      deprecatedReplacementSet: Set<string>;
    }
  >();

  for (const cssPath of cssPaths) {
    const content = await readFileOrNull(cssPath);
    if (!content) {
      continue;
    }

    const cssSectionReplacements = extractCssSectionReplacements(content);
    const declarationRegex = /(--salt-[\w-]+)\s*:\s*([^;]+);/g;
    let declarationMatch = declarationRegex.exec(content);
    while (declarationMatch) {
      const tokenName = declarationMatch[1];
      const tokenValue = normalizeWhitespace(declarationMatch[2]);
      const tokenCategory =
        tokenName.replace("--salt-", "").split("-")[0] ?? "misc";
      const normalizedTokenCategory = normalizeCategory(tokenCategory);
      const semanticIntent = tokenDescriptions.get(tokenCategory) ?? null;
      const tokenThemes = inferThemeFromTokenPath(cssPath);
      const isDeprecated = toPosixPath(cssPath).includes("/deprecated/");
      const sourcePath = toPosixPath(path.relative(repoRoot, cssPath));
      const lineStart = content.lastIndexOf("\n", declarationMatch.index) + 1;
      const lineEnd = content.indexOf("\n", declarationMatch.index);
      const declarationLine = content.slice(
        lineStart,
        lineEnd === -1 ? content.length : lineEnd,
      );
      const deprecatedReplacement =
        /\/\*\s*Use\s+(--salt-[\w-]+)\s*\*\//i.exec(declarationLine)?.[1] ??
        buildCategoryReplacementTokenName(
          tokenName,
          normalizedTokenCategory,
          findCssSectionAtOffset(cssSectionReplacements, declarationMatch.index)
            ?.replacementCategory ?? null,
        ) ??
        null;

      const existing = tokenMap.get(tokenName);
      if (!existing) {
        tokenMap.set(tokenName, {
          name: tokenName,
          category: tokenCategory,
          type: inferTokenType(tokenValue),
          value: tokenValue,
          semantic_intent: semanticIntent,
          themes: [],
          themeSet: new Set(tokenThemes),
          densities: [],
          applies_to: [],
          guidance: semanticIntent ? [semanticIntent] : [],
          guidanceSet: semanticIntent
            ? new Set([semanticIntent])
            : new Set<string>(),
          sourcePathSet: new Set([sourcePath]),
          deprecatedReplacementSet: new Set(
            deprecatedReplacement ? [deprecatedReplacement] : [],
          ),
          aliases: [],
          deprecated: isDeprecated,
          last_verified_at: verifiedAt,
        });
      } else {
        existing.sourcePathSet.add(sourcePath);
        if (deprecatedReplacement) {
          existing.deprecatedReplacementSet.add(deprecatedReplacement);
        }
        for (const themeName of tokenThemes) {
          existing.themeSet.add(themeName);
        }
        if (semanticIntent) {
          existing.guidanceSet.add(semanticIntent);
        }
        existing.deprecated = existing.deprecated || isDeprecated;
      }

      declarationMatch = declarationRegex.exec(content);
    }
  }

  const tokenNameSet = new Set(tokenMap.keys());
  const tokens = [...tokenMap.values()].map((token) => {
    const policyInput = {
      name: token.name,
      category: token.category,
      source_paths: [...token.sourcePathSet].sort(),
      deprecated_replacements: [...token.deprecatedReplacementSet]
        .filter((replacement) => tokenNameSet.has(replacement))
        .sort(),
    };
    const policy = getTokenPolicy(policyInput, resolvedTokenPolicySources);

    return {
      name: token.name,
      category: token.category,
      type: token.type,
      value: token.value,
      semantic_intent: token.semantic_intent,
      themes: [...token.themeSet].sort(),
      densities: token.densities,
      applies_to: token.applies_to,
      guidance: [...token.guidanceSet],
      aliases: token.aliases,
      policy,
      policy_gap: policy
        ? null
        : getTokenPolicyGap(policyInput, resolvedTokenPolicySources),
      deprecated: token.deprecated,
      last_verified_at: token.last_verified_at,
    };
  });

  return tokens.sort((left, right) => left.name.localeCompare(right.name));
}

async function pathExists(targetPath: string): Promise<boolean> {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function extractTokenCountsForSource(
  repoRoot: string,
  sourcePath: string,
  tokenNameSet: Set<string>,
  cache: Map<string, Map<string, number>>,
): Promise<Map<string, number>> {
  const cacheKey = toPosixPath(sourcePath);
  const cached = cache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const absolutePath = path.resolve(repoRoot, sourcePath);
  if (!(await pathExists(absolutePath))) {
    const empty = new Map<string, number>();
    cache.set(cacheKey, empty);
    return empty;
  }

  const stats = await fs.stat(absolutePath);
  const globPattern = stats.isDirectory()
    ? `${toPosixPath(path.relative(repoRoot, absolutePath))}/**/*.{ts,tsx,css,scss}`
    : toPosixPath(path.relative(repoRoot, absolutePath));

  const filePaths = (
    await fg(globPattern, {
      cwd: repoRoot,
      absolute: true,
      onlyFiles: true,
    })
  ).sort((left, right) => left.localeCompare(right));
  const tokenCounts = new Map<string, number>();

  for (const filePath of filePaths) {
    const content = await readFileOrNull(filePath);
    if (!content) {
      continue;
    }

    const matches = content.match(/--salt-[\w-]+/g) ?? [];
    for (const tokenName of matches) {
      if (tokenNameSet.has(tokenName)) {
        tokenCounts.set(tokenName, (tokenCounts.get(tokenName) ?? 0) + 1);
      }
    }
  }

  cache.set(cacheKey, tokenCounts);
  return tokenCounts;
}

export async function linkTokensToComponents(
  repoRoot: string,
  components: ComponentRecord[],
  tokens: TokenRecord[],
): Promise<{
  components: ComponentRecord[];
  tokens: TokenRecord[];
}> {
  const tokenNameSet = new Set(tokens.map((token) => token.name));
  const componentNamesByToken = new Map<string, Set<string>>();
  const tokenScanCache = new Map<string, Map<string, number>>();

  for (const component of components) {
    if (!component.source.repo_path) {
      continue;
    }

    const tokenCounts = await extractTokenCountsForSource(
      repoRoot,
      component.source.repo_path,
      tokenNameSet,
      tokenScanCache,
    );

    for (const tokenName of tokenCounts.keys()) {
      const names = componentNamesByToken.get(tokenName) ?? new Set<string>();
      names.add(component.name);
      componentNamesByToken.set(tokenName, names);
    }
  }

  const updatedTokens = tokens.map((token) => ({
    ...token,
    applies_to: [
      ...(componentNamesByToken.get(token.name) ?? new Set<string>()),
    ].sort((left, right) => left.localeCompare(right)),
  }));

  return { components, tokens: updatedTokens };
}
