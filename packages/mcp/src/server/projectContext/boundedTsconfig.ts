import path from "node:path";
import { type ParseError, parse } from "jsonc-parser";
import { readBoundedProjectFile } from "../../core/runtime.js";

export const MAX_TSCONFIG_UTF8_BYTES = 256 * 1024;
export const MAX_TSCONFIG_DEPTH = 8;
export const MAX_TSCONFIG_FILES = 16;
export const MAX_TSCONFIG_ATTEMPTS = 32;
export const MAX_TSCONFIG_EXTENDS_ENTRIES = 16;
const MAX_TSCONFIG_ALIAS_PATTERNS = 128;
const MAX_TSCONFIG_ALIAS_TARGETS = 16;
const MAX_TSCONFIG_MATCHED_CANDIDATES = 64;

interface AliasDefinition {
  pattern: string;
  targets: string[];
}

interface ResolvedTsconfig {
  baseUrl: string | null;
  definitions: Map<string, AliasDefinition> | null;
}

export interface BoundedTsconfigAliases {
  pathsMatcher: ((specifier: string) => string[]) | null;
  aliasPatterns: string[];
  filesRead: number;
  filesAttempted: number;
  limitations: Array<
    | "tsconfig_unavailable"
    | "tsconfig_invalid"
    | "tsconfig_extends_unsupported"
    | "tsconfig_depth_limit"
    | "tsconfig_file_limit"
    | "tsconfig_attempt_limit"
    | "tsconfig_alias_limit"
  >;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function resolveExtends(configPath: string, value: string): string | null {
  if (!value.startsWith(".")) return null;
  const resolved = path.resolve(path.dirname(configPath), value);
  return path.extname(resolved) ? resolved : `${resolved}.json`;
}

function matchAlias(pattern: string, specifier: string): string | null {
  const wildcard = pattern.indexOf("*");
  if (wildcard < 0) return pattern === specifier ? "" : null;
  if (pattern.indexOf("*", wildcard + 1) >= 0) return null;
  const prefix = pattern.slice(0, wildcard);
  const suffix = pattern.slice(wildcard + 1);
  return specifier.startsWith(prefix) && specifier.endsWith(suffix)
    ? specifier.slice(prefix.length, specifier.length - suffix.length)
    : null;
}

function selectAliasDefinition(
  aliases: readonly AliasDefinition[],
  specifier: string,
): { alias: AliasDefinition; wildcard: string } | null {
  const exact = aliases.find((alias) => alias.pattern === specifier);
  if (exact) return { alias: exact, wildcard: "" };

  let selected: {
    alias: AliasDefinition;
    wildcard: string;
    prefixLength: number;
  } | null = null;
  for (const alias of aliases) {
    const wildcardIndex = alias.pattern.indexOf("*");
    if (wildcardIndex < 0) continue;
    const wildcard = matchAlias(alias.pattern, specifier);
    if (wildcard === null) continue;
    if (!selected || wildcardIndex > selected.prefixLength) {
      selected = { alias, wildcard, prefixLength: wildcardIndex };
    }
  }
  return selected
    ? { alias: selected.alias, wildcard: selected.wildcard }
    : null;
}

export async function loadBoundedTsconfigAliases(
  rootDir: string,
  authorityRoot: string = rootDir,
): Promise<BoundedTsconfigAliases> {
  const attempted = new Set<string>();
  const canonicalByLexicalPath = new Map<string, string>();
  const resolvedByCanonicalPath = new Map<string, ResolvedTsconfig | null>();
  const limitations = new Set<BoundedTsconfigAliases["limitations"][number]>();
  let filesRead = 0;

  const resolveConfig = async (
    configPath: string,
    depth: number,
    ancestry: ReadonlySet<string> = new Set(),
    canonicalAncestry: ReadonlySet<string> = new Set(),
  ): Promise<ResolvedTsconfig | null> => {
    if (depth > MAX_TSCONFIG_DEPTH) {
      limitations.add("tsconfig_depth_limit");
      return null;
    }
    const lexicalPath = path.resolve(configPath);
    if (ancestry.has(lexicalPath)) {
      limitations.add("tsconfig_invalid");
      return null;
    }
    const knownCanonicalPath = canonicalByLexicalPath.get(lexicalPath);
    if (knownCanonicalPath) {
      if (canonicalAncestry.has(knownCanonicalPath)) {
        limitations.add("tsconfig_invalid");
        return null;
      }
      if (resolvedByCanonicalPath.has(knownCanonicalPath)) {
        return resolvedByCanonicalPath.get(knownCanonicalPath) ?? null;
      }
    }
    if (attempted.has(lexicalPath)) return null;
    if (filesRead >= MAX_TSCONFIG_FILES) {
      limitations.add("tsconfig_file_limit");
      return null;
    }
    if (attempted.size >= MAX_TSCONFIG_ATTEMPTS) {
      limitations.add("tsconfig_attempt_limit");
      return null;
    }
    attempted.add(lexicalPath);
    const file = await readBoundedProjectFile({
      authorityRoot,
      rootDir,
      filePath: configPath,
      maxUtf8Bytes: MAX_TSCONFIG_UTF8_BYTES,
    });
    if (file.status === "absent") {
      if (depth === 0) limitations.add("tsconfig_unavailable");
      else limitations.add("tsconfig_invalid");
      return null;
    }
    if (file.status === "invalid") {
      limitations.add("tsconfig_invalid");
      return null;
    }
    canonicalByLexicalPath.set(lexicalPath, file.path);
    if (canonicalAncestry.has(file.path)) {
      limitations.add("tsconfig_invalid");
      return null;
    }
    if (resolvedByCanonicalPath.has(file.path)) {
      return resolvedByCanonicalPath.get(file.path) ?? null;
    }
    filesRead += 1;

    const parseErrors: ParseError[] = [];
    const parsed = parse(file.text, parseErrors, {
      allowTrailingComma: true,
      disallowComments: false,
    }) as unknown;
    if (parseErrors.length > 0 || !isRecord(parsed)) {
      limitations.add("tsconfig_invalid");
      resolvedByCanonicalPath.set(file.path, null);
      return null;
    }

    const extended =
      typeof parsed.extends === "string"
        ? [parsed.extends]
        : Array.isArray(parsed.extends) &&
            parsed.extends.every((entry) => typeof entry === "string")
          ? parsed.extends
          : [];
    if (
      Object.hasOwn(parsed, "extends") &&
      typeof parsed.extends !== "string" &&
      (!Array.isArray(parsed.extends) ||
        parsed.extends.some((entry) => typeof entry !== "string"))
    ) {
      limitations.add("tsconfig_invalid");
    }
    if (extended.length > MAX_TSCONFIG_EXTENDS_ENTRIES) {
      limitations.add("tsconfig_attempt_limit");
    }
    let effectiveBaseUrl: string | null = null;
    let effectiveDefinitions: Map<string, AliasDefinition> | null = null;
    for (const entry of extended.slice(0, MAX_TSCONFIG_EXTENDS_ENTRIES)) {
      const extendedPath = resolveExtends(file.path, entry);
      if (!extendedPath) {
        limitations.add("tsconfig_extends_unsupported");
        continue;
      }
      const inherited = await resolveConfig(
        extendedPath,
        depth + 1,
        new Set(ancestry).add(lexicalPath),
        new Set(canonicalAncestry).add(file.path),
      );
      if (!inherited) continue;
      if (inherited.baseUrl !== null) {
        effectiveBaseUrl = inherited.baseUrl;
      }
      if (inherited.definitions !== null) {
        effectiveDefinitions = new Map(inherited.definitions);
      }
    }

    const compilerOptions = isRecord(parsed.compilerOptions)
      ? parsed.compilerOptions
      : null;
    if (Object.hasOwn(parsed, "compilerOptions") && !compilerOptions) {
      limitations.add("tsconfig_invalid");
      resolvedByCanonicalPath.set(file.path, null);
      return null;
    }
    if (compilerOptions && Object.hasOwn(compilerOptions, "baseUrl")) {
      if (
        typeof compilerOptions.baseUrl !== "string" ||
        compilerOptions.baseUrl.trim().length === 0
      ) {
        limitations.add("tsconfig_invalid");
      } else {
        effectiveBaseUrl = path.resolve(
          path.dirname(file.path),
          compilerOptions.baseUrl,
        );
      }
    }
    if (compilerOptions && Object.hasOwn(compilerOptions, "paths")) {
      if (!isRecord(compilerOptions.paths)) {
        limitations.add("tsconfig_invalid");
        effectiveDefinitions = null;
      } else {
        const paths = compilerOptions.paths;
        const baseUrl = effectiveBaseUrl ?? path.dirname(file.path);
        // TypeScript replaces compilerOptions.paths as a whole across extends.
        effectiveDefinitions = new Map<string, AliasDefinition>();
        for (const [pattern, rawTargets] of Object.entries(paths)) {
          if (
            effectiveDefinitions.size >= MAX_TSCONFIG_ALIAS_PATTERNS &&
            !effectiveDefinitions.has(pattern)
          ) {
            limitations.add("tsconfig_alias_limit");
            continue;
          }
          if (
            pattern.length === 0 ||
            pattern.split("*").length > 2 ||
            !Array.isArray(rawTargets) ||
            rawTargets.some((target) => typeof target !== "string")
          ) {
            limitations.add("tsconfig_invalid");
            continue;
          }
          const targets = rawTargets
            .slice(0, MAX_TSCONFIG_ALIAS_TARGETS)
            .map((target) => path.resolve(baseUrl, target));
          if (rawTargets.length > MAX_TSCONFIG_ALIAS_TARGETS) {
            limitations.add("tsconfig_alias_limit");
          }
          effectiveDefinitions.set(pattern, { pattern, targets });
        }
      }
    }
    const resolved = {
      baseUrl: effectiveBaseUrl,
      definitions: effectiveDefinitions,
    } satisfies ResolvedTsconfig;
    resolvedByCanonicalPath.set(file.path, resolved);
    return resolved;
  };

  const resolved = await resolveConfig(path.join(rootDir, "tsconfig.json"), 0);
  const aliases = [...(resolved?.definitions?.values() ?? [])];
  const trustworthy = limitations.size === 0;
  return {
    pathsMatcher:
      aliases.length === 0 || !trustworthy
        ? null
        : (specifier) => {
            const selected = selectAliasDefinition(aliases, specifier);
            return selected
              ? selected.alias.targets
                  .map((target) =>
                    target.includes("*")
                      ? target.replaceAll("*", selected.wildcard)
                      : target,
                  )
                  .slice(0, MAX_TSCONFIG_MATCHED_CANDIDATES)
              : [];
          },
    aliasPatterns: aliases.map((alias) => alias.pattern),
    filesRead,
    filesAttempted: attempted.size,
    limitations: [...limitations],
  };
}
