import fs from "node:fs/promises";
import path from "node:path";
import fg from "fast-glob";
import { toPosixPath } from "../registry/paths.js";
import type {
  ComponentRecord,
  ComponentTokenInference,
  TokenRecord,
} from "../types.js";
import { getTokenPolicy } from "./buildRegistryTokenPolicy.js";
import {
  cleanMarkdownText,
  normalizeWhitespace,
  readFileOrNull,
} from "./buildRegistryShared.js";

const MAX_COMPONENT_TOKENS = 40;

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
): Promise<TokenRecord[]> {
  const tokenDescriptions = await extractTokenDescriptions(repoRoot);
  const cssPaths = (
    await fg("packages/theme/css/**/*.css", {
      cwd: repoRoot,
      absolute: true,
      onlyFiles: true,
    })
  ).sort((left, right) => left.localeCompare(right));

  const tokenMap = new Map<
    string,
    TokenRecord & { themeSet: Set<string>; guidanceSet: Set<string> }
  >();

  for (const cssPath of cssPaths) {
    const content = await readFileOrNull(cssPath);
    if (!content) {
      continue;
    }

    const declarationRegex = /(--salt-[\w-]+)\s*:\s*([^;]+);/g;
    let declarationMatch = declarationRegex.exec(content);
    while (declarationMatch) {
      const tokenName = declarationMatch[1];
      const tokenValue = normalizeWhitespace(declarationMatch[2]);
      const tokenCategory =
        tokenName.replace("--salt-", "").split("-")[0] ?? "misc";
      const semanticIntent = tokenDescriptions.get(tokenCategory) ?? null;
      const tokenThemes = inferThemeFromTokenPath(cssPath);
      const isDeprecated = toPosixPath(cssPath).includes("/deprecated/");

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
          aliases: [],
          deprecated: isDeprecated,
          last_verified_at: verifiedAt,
        });
      } else {
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

  const tokens = [...tokenMap.values()].map((token) => ({
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
    policy: getTokenPolicy(token),
    deprecated: token.deprecated,
    last_verified_at: token.last_verified_at,
  }));

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
  const tokenByName = new Map(tokens.map((token) => [token.name, token]));
  const tokenNameSet = new Set(tokens.map((token) => token.name));
  const componentNamesByToken = new Map<string, Set<string>>();
  const tokenScanCache = new Map<string, Map<string, number>>();

  const updatedComponents: ComponentRecord[] = [];
  for (const component of components) {
    if (!component.source.repo_path) {
      const tokenInference: ComponentTokenInference = {
        source: "none",
        discovered_count: 0,
        returned_count: 0,
        max_returned: MAX_COMPONENT_TOKENS,
        truncated: false,
      };
      updatedComponents.push({
        ...component,
        tokens: [],
        inference: {
          ...component.inference,
          tokens: tokenInference,
        },
      });
      continue;
    }

    const tokenCounts = await extractTokenCountsForSource(
      repoRoot,
      component.source.repo_path,
      tokenNameSet,
      tokenScanCache,
    );
    const tokenNames = [...tokenCounts.entries()]
      .sort((left, right) => {
        if (left[1] !== right[1]) {
          return right[1] - left[1];
        }
        return left[0].localeCompare(right[0]);
      })
      .slice(0, MAX_COMPONENT_TOKENS)
      .map(([tokenName]) => tokenName);

    const componentTokens = tokenNames
      .map((tokenName) => tokenByName.get(tokenName))
      .filter((token): token is TokenRecord => token != null)
      .map((token) => ({
        name: token.name,
        category: token.category,
        semantic_intent: token.semantic_intent,
      }));

    const tokenInference: ComponentTokenInference = {
      source: "repo_scan",
      discovered_count: tokenCounts.size,
      returned_count: componentTokens.length,
      max_returned: MAX_COMPONENT_TOKENS,
      truncated: tokenCounts.size > MAX_COMPONENT_TOKENS,
    };

    for (const tokenName of tokenNames) {
      const names = componentNamesByToken.get(tokenName) ?? new Set<string>();
      names.add(component.name);
      componentNamesByToken.set(tokenName, names);
    }

    updatedComponents.push({
      ...component,
      tokens: componentTokens,
      inference: {
        ...component.inference,
        tokens: tokenInference,
      },
    });
  }

  const updatedTokens = tokens.map((token) => ({
    ...token,
    applies_to: [
      ...(componentNamesByToken.get(token.name) ?? new Set<string>()),
    ].sort((left, right) => left.localeCompare(right)),
  }));

  return { components: updatedComponents, tokens: updatedTokens };
}
