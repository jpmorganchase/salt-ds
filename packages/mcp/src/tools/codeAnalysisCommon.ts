import { parse } from "@babel/parser";
import traverse from "@babel/traverse";
import * as t from "@babel/types";
import semver from "semver";
import type { DeprecationRecord } from "../types.js";

export interface ImportedSaltSymbol {
  packageName: string;
  imported: string;
  local: string;
  typeOnly: boolean;
  namespace?: boolean;
}

export interface VersionContext {
  input: string | null;
  normalized: string | null;
}

export interface SaltImportAnalysis {
  saltImports: ImportedSaltSymbol[];
  directImportByLocal: Map<string, ImportedSaltSymbol>;
  namespaceImportByLocal: Map<string, ImportedSaltSymbol>;
}

export interface SaltCodeAnalysis extends SaltImportAnalysis {
  ast: t.File;
}

export type PropDeprecationIndex = Map<
  string,
  Map<string, Map<string, DeprecationRecord[]>>
>;

export const traverseAst: typeof traverse =
  typeof traverse === "function"
    ? traverse
    : (
        traverse as unknown as {
          default: typeof traverse;
        }
      ).default;

const SALT_CODE_PARSE_PLUGINS = [
  "jsx",
  "typescript",
  "classProperties",
  "classPrivateProperties",
  "classPrivateMethods",
  "decorators-legacy",
] as const;

export function parseSaltCode(code: string): t.File {
  return parse(code, {
    sourceType: "unambiguous",
    errorRecovery: true,
    plugins: [...SALT_CODE_PARSE_PLUGINS],
  }) as t.File;
}

export function normalizeVersion(
  version: string | null | undefined,
): string | null {
  if (!version) {
    return null;
  }

  const trimmed = version.trim();
  if (!trimmed) {
    return null;
  }

  const valid = semver.valid(trimmed);
  if (valid) {
    return valid;
  }

  const min = semver.minVersion(trimmed)?.version;
  if (min) {
    return min;
  }

  return semver.coerce(trimmed)?.version ?? null;
}

export function createVersionContext(
  rawVersion: string | undefined,
): VersionContext {
  const input = rawVersion?.trim() ?? null;
  return {
    input,
    normalized: normalizeVersion(input),
  };
}

export function isDeprecationRelevant(
  deprecation: DeprecationRecord,
  version: VersionContext,
): boolean {
  if (!version.normalized) {
    return true;
  }

  const deprecatedIn = normalizeVersion(deprecation.deprecated_in);
  if (!deprecatedIn) {
    return true;
  }

  return semver.lte(deprecatedIn, version.normalized);
}

export function normalizeComponentKey(value: string | null): string {
  if (!value) {
    return "*";
  }

  return value
    .toLowerCase()
    .replace(/props$/i, "")
    .replace(/[^a-z0-9]/g, "");
}

export function parseSaltImportsFromAst(ast: t.File): ImportedSaltSymbol[] {
  const imports: ImportedSaltSymbol[] = [];

  traverseAst(ast, {
    ImportDeclaration(path) {
      const source = path.node.source.value;
      if (typeof source !== "string" || !source.startsWith("@salt-ds/")) {
        return;
      }

      const declarationImportKind = path.node.importKind === "type";
      for (const specifier of path.node.specifiers) {
        if (t.isImportNamespaceSpecifier(specifier)) {
          imports.push({
            packageName: source,
            imported: "*",
            local: specifier.local.name,
            typeOnly: declarationImportKind,
            namespace: true,
          });
          continue;
        }

        if (t.isImportDefaultSpecifier(specifier)) {
          imports.push({
            packageName: source,
            imported: "default",
            local: specifier.local.name,
            typeOnly: declarationImportKind,
          });
          continue;
        }

        if (t.isImportSpecifier(specifier)) {
          const importedName = t.isIdentifier(specifier.imported)
            ? specifier.imported.name
            : specifier.imported.value;
          imports.push({
            packageName: source,
            imported: importedName,
            local: specifier.local.name,
            typeOnly: declarationImportKind || specifier.importKind === "type",
          });
        }
      }
    },
  });

  return imports;
}

function getSaltImportDedupKey(imported: ImportedSaltSymbol): string {
  return `${imported.packageName}:${imported.imported}:${imported.local}:${imported.typeOnly}`;
}

export function collectSaltImportsFromAst(ast: t.File): SaltImportAnalysis {
  const uniqueImports = new Map<string, ImportedSaltSymbol>();

  for (const imported of parseSaltImportsFromAst(ast)) {
    const key = getSaltImportDedupKey(imported);
    if (!uniqueImports.has(key)) {
      uniqueImports.set(key, imported);
    }
  }

  const saltImports = [...uniqueImports.values()];
  const concreteSaltImports = saltImports.filter(
    (item) => !item.typeOnly && item.imported !== "*",
  );

  return {
    saltImports,
    directImportByLocal: new Map(
      concreteSaltImports.map((item) => [item.local, item] as const),
    ),
    namespaceImportByLocal: new Map(
      saltImports
        .filter((item) => !item.typeOnly && item.namespace)
        .map((item) => [item.local, item] as const),
    ),
  };
}

export function analyzeSaltCode(code: string): SaltCodeAnalysis {
  const ast = parseSaltCode(code);

  return {
    ast,
    ...collectSaltImportsFromAst(ast),
  };
}

export function resolveImportedSaltSymbol(
  name: t.JSXIdentifier | t.JSXMemberExpression | t.JSXNamespacedName,
  directImportByLocal: Map<string, ImportedSaltSymbol>,
  namespaceImportByLocal: Map<string, ImportedSaltSymbol>,
): ImportedSaltSymbol | null {
  if (t.isJSXIdentifier(name)) {
    return directImportByLocal.get(name.name) ?? null;
  }

  if (
    t.isJSXMemberExpression(name) &&
    t.isJSXIdentifier(name.object) &&
    t.isJSXIdentifier(name.property)
  ) {
    const namespaceImport = namespaceImportByLocal.get(name.object.name);
    if (!namespaceImport) {
      return null;
    }

    return {
      packageName: namespaceImport.packageName,
      imported: name.property.name,
      local: `${name.object.name}.${name.property.name}`,
      typeOnly: false,
    };
  }

  return null;
}

export function resolveNamespaceMemberImportedSaltSymbol(
  node: t.MemberExpression,
  namespaceImportByLocal: Map<string, ImportedSaltSymbol>,
): ImportedSaltSymbol | null {
  if (
    node.computed ||
    !t.isIdentifier(node.object) ||
    !t.isIdentifier(node.property)
  ) {
    return null;
  }

  const namespaceImport = namespaceImportByLocal.get(node.object.name);
  if (!namespaceImport) {
    return null;
  }

  return {
    packageName: namespaceImport.packageName,
    imported: node.property.name,
    local: `${node.object.name}.${node.property.name}`,
    typeOnly: false,
  };
}

export function buildPropDeprecationIndex(
  deprecations: DeprecationRecord[],
  version: VersionContext,
  options: {
    excluded_names?: Iterable<string>;
  } = {},
): PropDeprecationIndex {
  const excludedNames = new Set(options.excluded_names ?? []);
  const byPackage = new Map<
    string,
    Map<string, Map<string, DeprecationRecord[]>>
  >();

  for (const deprecation of deprecations) {
    if (
      deprecation.kind !== "prop" ||
      excludedNames.has(deprecation.name) ||
      !isDeprecationRelevant(deprecation, version)
    ) {
      continue;
    }

    const packageMap = byPackage.get(deprecation.package) ?? new Map();
    const componentKey = normalizeComponentKey(deprecation.component);
    if (componentKey === "*") {
      continue;
    }

    const componentMap = packageMap.get(componentKey) ?? new Map();
    const current = componentMap.get(deprecation.name) ?? [];
    current.push(deprecation);
    componentMap.set(deprecation.name, current);
    packageMap.set(componentKey, componentMap);
    byPackage.set(deprecation.package, packageMap);
  }

  return byPackage;
}
