import path from "node:path";
import { compareOrdinalStrings } from "../catalog/catalogSerialization.js";
import { toPosixPath } from "../registry/paths.js";
import type {
  ComponentRecord,
  TokenDeclarationProjection,
  TokenRecord,
} from "../types.js";
import { cleanMarkdownText, readFileOrNull } from "./buildRegistryShared.js";
import {
  buildTokenPolicySourceRegistry,
  getTokenPolicy,
  getTokenPolicyGap,
  type TokenPolicySourceRegistry,
} from "./buildRegistryTokenPolicy.js";
import { globCatalogInputs } from "./catalogInputInventory.js";
import { extractTokenDeclarations } from "./extractTokenDeclarations.js";

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
  tokenPolicySources?: TokenPolicySourceRegistry,
): Promise<TokenRecord[]> {
  const tokenDescriptions = await extractTokenDescriptions(repoRoot);
  const resolvedTokenPolicySources =
    tokenPolicySources ?? (await buildTokenPolicySourceRegistry(repoRoot));
  const { declarations: declarationsByName } =
    await extractTokenDeclarations(repoRoot);

  const tokenMap = new Map<
    string,
    {
      name: string;
      category: string;
      typeSet: Set<string>;
      semanticIntent: string | null;
      guidanceSet: Set<string>;
      sourcePathSet: Set<string>;
      deprecatedReplacementSet: Set<string>;
      declarations: TokenDeclarationProjection[];
    }
  >();

  for (const [tokenName, declarations] of declarationsByName) {
    const tokenCategory =
      tokenName.replace("--salt-", "").split("-")[0] ?? "misc";
    const semanticIntent = tokenDescriptions.get(tokenCategory) ?? null;
    tokenMap.set(tokenName, {
      name: tokenName,
      category: tokenCategory,
      typeSet: new Set(
        declarations.map((declaration) =>
          inferTokenType(declaration.value.trim()),
        ),
      ),
      semanticIntent,
      guidanceSet: semanticIntent
        ? new Set([semanticIntent])
        : new Set<string>(),
      sourcePathSet: new Set(
        declarations.map((declaration) => declaration.source_path),
      ),
      deprecatedReplacementSet: new Set(
        declarations.flatMap((declaration) =>
          declaration.replacement ? [declaration.replacement] : [],
        ),
      ),
      declarations,
    });
  }

  const tokenNameSet = new Set(tokenMap.keys());
  const tokens = [...tokenMap.values()].map((token) => {
    const declarations = token.declarations
      .map((declaration) => ({
        ...declaration,
        replacement:
          declaration.replacement && tokenNameSet.has(declaration.replacement)
            ? declaration.replacement
            : null,
      }))
      .sort(
        (left, right) =>
          compareOrdinalStrings(left.source_path, right.source_path) ||
          left.source_range.start_offset - right.source_range.start_offset ||
          compareOrdinalStrings(left.id, right.id),
      );
    const themes = [
      ...new Set(
        declarations.flatMap((declaration) =>
          declaration.dimensions
            .filter((dimension) => dimension.name === "theme")
            .map((dimension) => dimension.value),
        ),
      ),
    ].sort();
    const densities = [
      ...new Set(
        declarations.flatMap((declaration) =>
          declaration.dimensions
            .filter((dimension) => dimension.name === "density")
            .map((dimension) => dimension.value),
        ),
      ),
    ].sort();
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
      type:
        token.typeSet.size === 1
          ? ([...token.typeSet][0] ?? "string")
          : "mixed",
      // No parsed source currently declares an authoritative default.
      value: null,
      default_declaration_id: null,
      declarations,
      semantic_intent: token.semanticIntent,
      themes,
      densities,
      applies_to: [],
      guidance: [...token.guidanceSet],
      aliases: [],
      policy,
      policy_gap: policy
        ? null
        : getTokenPolicyGap(policyInput, resolvedTokenPolicySources),
      deprecated: declarations.every((declaration) => declaration.deprecated),
      last_verified_at: null,
    };
  });

  return tokens.sort((left, right) =>
    compareOrdinalStrings(left.name, right.name),
  );
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
  const directSource = await readFileOrNull(absolutePath);
  const relativePath = toPosixPath(path.relative(repoRoot, absolutePath));
  const sourceFiles =
    directSource !== null
      ? [{ filePath: absolutePath, content: directSource }]
      : await Promise.all(
          (
            await globCatalogInputs(`${relativePath}/**/*.{ts,tsx,css,scss}`, {
              cwd: repoRoot,
              absolute: true,
              onlyFiles: true,
            })
          )
            .sort(compareOrdinalStrings)
            .map(async (filePath) => ({
              filePath,
              content: await readFileOrNull(filePath),
            })),
        );
  const tokenCounts = new Map<string, number>();

  for (const { content } of sourceFiles) {
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
    ].sort(compareOrdinalStrings),
  }));

  return { components, tokens: updatedTokens };
}
