import fs from "node:fs";
import path from "node:path";
import ts from "typescript";
import { createDeprecationId } from "../records/apiSymbolIdentity.js";
import { isPortableRepositoryPath } from "../catalog/catalogPortablePath.js";
import {
  canonicalJson,
  compareOrdinalStrings,
} from "../catalog/catalogSerialization.js";
import { toPosixPath } from "../registry/paths.js";
import type {
  ApiLiteral,
  ApiSymbolIdentity,
  DeprecationRecord,
  DeprecationSourceOccurrence,
  DeprecationValueMap,
  PackageRecord,
} from "../types.js";
import {
  cleanMarkdownText,
  normalizeVersion,
  preferEarlierVersion,
  readFileOrNull,
  toMatchKey,
  uniqueStrings,
} from "./buildRegistryShared.js";
import {
  buildPackageValueExportGraph,
  declarationSymbolSpaces,
  type PackageExportOrigin,
  type PackageValueExportGraph,
  packageExportDeclarationKey,
} from "./catalogExportGraph.js";
import {
  globCatalogInputs,
  readCatalogInputFileSyncOrNull,
} from "./catalogInputInventory.js";
import { NON_PRODUCTION_IMPLEMENTATION_GLOB_IGNORES } from "./catalogProductionSource.js";
import {
  deprecationMigrationStrategyOverride,
  type NoTargetMigrationStrategy,
} from "./deprecationMigrationOverrides.js";
import {
  type DeprecationValueMapOverrideCase,
  deprecationValueMapOverride,
} from "./deprecationValueMapOverrides.js";
import {
  generatorDependencyDirectoryExists,
  generatorDependencyFileExists,
  generatorDependencyRealpath,
  generatorDependencyWorkspacePath,
  isGeneratorDependencyInventoryActive,
  isGeneratorDependencyPath,
  readGeneratorDependencyFileSyncOrNull,
} from "./generatorDependencyInventory.js";
import { typescriptScriptKindForFileName } from "./typescriptScriptKind.js";

interface PackageChangelogDeprecations {
  deprecatedBySymbol: Map<string, string>;
}

interface PublicApiEntrypoint {
  name: string;
  graph: PackageValueExportGraph;
}

function packageSlug(packageName: string): string {
  const match = packageName.match(/^@salt-ds\/([^/]+)$/u);
  if (!match) {
    throw new Error(
      `Deprecation extraction only supports @salt-ds packages: ${packageName}.`,
    );
  }
  return match[1] as string;
}

async function publicEntrypointSources(
  repoRoot: string,
  packageName: string,
): Promise<
  Array<{
    name: string;
    sourcePath: string;
  }>
> {
  const slug = packageSlug(packageName);
  const packageDirectory = `packages/${slug}`;
  const packageJsonSource = await readFileOrNull(
    path.join(repoRoot, packageDirectory, "package.json"),
  );
  if (packageJsonSource) {
    const packageJson = JSON.parse(packageJsonSource) as {
      saltSourceEntrypoints?: unknown;
    };
    if (packageJson.saltSourceEntrypoints !== undefined) {
      if (
        typeof packageJson.saltSourceEntrypoints !== "object" ||
        packageJson.saltSourceEntrypoints === null ||
        Array.isArray(packageJson.saltSourceEntrypoints)
      ) {
        throw new Error(
          `${packageName} package.json saltSourceEntrypoints must be an object.`,
        );
      }
      const entries = Object.entries(packageJson.saltSourceEntrypoints);
      if (entries.length === 0) {
        throw new Error(
          `${packageName} package.json saltSourceEntrypoints cannot be empty.`,
        );
      }
      return entries
        .map(([name, sourcePath]) => {
          const validEntrypointName =
            name === "." ||
            (name.startsWith("./") && isPortableRepositoryPath(name.slice(2)));
          if (
            !validEntrypointName ||
            typeof sourcePath !== "string" ||
            !isPortableRepositoryPath(sourcePath)
          ) {
            throw new Error(
              `${packageName} package.json has an invalid source entrypoint '${name}'.`,
            );
          }
          const normalizedSourcePath = `${packageDirectory}/${sourcePath}`;
          if (
            sourcePath.startsWith("/") ||
            normalizedSourcePath === packageDirectory ||
            !normalizedSourcePath.startsWith(`${packageDirectory}/src/`) ||
            !/\.(?:ts|tsx|mts|cts|js|jsx|mjs|cjs)$/u.test(normalizedSourcePath)
          ) {
            throw new Error(
              `${packageName} source entrypoint '${name}' must be a supported source file under its inventoried src directory.`,
            );
          }
          return { name, sourcePath: normalizedSourcePath };
        })
        .sort((left, right) => compareOrdinalStrings(left.name, right.name));
    }
  }
  return [
    {
      name: ".",
      sourcePath: `packages/${slug}/src/index.ts`,
    },
  ];
}

async function buildPublicApiEntrypoints(
  repoRoot: string,
  packageName: string,
): Promise<PublicApiEntrypoint[]> {
  const sourceEntrypoints = await publicEntrypointSources(
    repoRoot,
    packageName,
  );
  return Promise.all(
    sourceEntrypoints.map(async (entrypoint) => ({
      name: entrypoint.name,
      graph: await buildPackageValueExportGraph(repoRoot, packageName, {
        entrypoint: entrypoint.sourcePath,
      }),
    })),
  );
}

function extractDeprecatedSymbolsFromLine(line: string): string[] {
  const symbols = new Set<string>();
  const normalizedLine = line.trim();

  for (const match of normalizedLine.matchAll(
    /`([^`]+)`(?:\s+[A-Za-z]+){0,4}\s+(?:has been|is now|being)?\s*deprecated\b/gi,
  )) {
    const symbol = match[1]?.trim();
    if (symbol) {
      symbols.add(symbol);
    }
  }

  const deprecatedClauseMatch = normalizedLine.match(/\bDeprecated\b\s+(.+)/i);
  const clause = deprecatedClauseMatch?.[1]
    ?.split(/(?<=\.)\s|:\s|;\s|\s+should\b/i)[0]
    ?.trim();
  if (!clause) {
    return [...symbols];
  }

  const codeSymbols = [...clause.matchAll(/`([^`]+)`/g)]
    .map((match) => match[1]?.trim())
    .filter((value): value is string => Boolean(value));
  if (codeSymbols.length > 0) {
    for (const symbol of codeSymbols) {
      symbols.add(symbol);
    }
    return [...symbols];
  }

  for (const match of clause.matchAll(/\b[A-Z][A-Za-z0-9_]+\b/g)) {
    const symbol = match[0]?.trim();
    if (symbol) {
      symbols.add(symbol);
    }
  }
  return [...symbols];
}

async function loadPackageChangelogDeprecations(
  repoRoot: string,
  packages: PackageRecord[],
): Promise<Map<string, PackageChangelogDeprecations>> {
  const metadataByPackage = new Map<string, PackageChangelogDeprecations>();

  for (const pkg of packages) {
    if (!pkg.changelog_path) {
      continue;
    }
    const changelog = await readFileOrNull(
      path.join(repoRoot, pkg.changelog_path),
    );
    if (!changelog) {
      continue;
    }

    const deprecatedBySymbol = new Map<string, string>();
    let currentVersion: string | null = null;
    for (const rawLine of changelog.split(/\r?\n/)) {
      const line = rawLine.trim();
      const versionMatch = line.match(/^##\s+([0-9][^\s]*)\s*$/);
      if (versionMatch) {
        currentVersion = normalizeVersion(versionMatch[1]);
        continue;
      }
      if (!currentVersion || !/deprecated/i.test(line)) {
        continue;
      }

      for (const symbol of extractDeprecatedSymbolsFromLine(line)) {
        const key = toMatchKey(symbol);
        if (key) {
          deprecatedBySymbol.set(
            key,
            preferEarlierVersion(deprecatedBySymbol.get(key), currentVersion) ??
              currentVersion,
          );
        }
      }
    }
    metadataByPackage.set(pkg.name, { deprecatedBySymbol });
  }

  return metadataByPackage;
}

function inferDeprecatedVersionFromNote(note: string): string | null {
  const match =
    note.match(
      /\bdeprecated(?:\s+(?:in|since))?\s+v?(\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?)\b/i,
    ) ?? note.match(/\bsince\s+v?(\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?)\b/i);

  return normalizeVersion(match?.[1] ?? null);
}

function inferRemovedVersionFromNote(note: string): string | null {
  const match = note.match(
    /\bremoved(?:\s+in)?\s+v?(\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?)\b/i,
  );

  return normalizeVersion(match?.[1] ?? null);
}

function extractDeprecationGuidance(note: string): string {
  const normalized = cleanMarkdownText(note);
  if (!normalized) {
    return "";
  }

  const withoutLeadingSince = normalized.replace(
    /^(?:deprecated\s+)?since\s+v?\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:[.?!:;]\s*|\s+)/i,
    "",
  );

  return withoutLeadingSince.trim() || normalized;
}

function summarizeDeprecationNote(note: string): string {
  const guidance = extractDeprecationGuidance(note);
  if (!guidance) {
    return "";
  }

  const firstSentence = guidance.match(/^.*?[.!?](?:\s|$)/)?.[0]?.trim();
  if (firstSentence) {
    return firstSentence;
  }

  return guidance.split(/\s+\|\s+/)[0]?.trim() ?? guidance;
}

function extractJsDocTagComment(
  comment: ts.JSDocTag["comment"],
  sourceFile: ts.SourceFile,
): string {
  if (!comment) {
    return "";
  }
  if (typeof comment === "string") {
    return comment;
  }

  return comment
    .map((part) => {
      if (typeof part === "string") {
        return part;
      }
      if (ts.isJSDocLinkLike(part)) {
        const target = part.name?.getText(sourceFile) ?? "";
        const label = part.text.trim();
        return label || target;
      }
      if ("text" in part) {
        return String(part.text ?? "");
      }
      return "";
    })
    .join("");
}

function hasModifier(node: ts.Node, modifierKind: ts.SyntaxKind): boolean {
  return Boolean(
    ts.canHaveModifiers(node) &&
      ts.getModifiers(node)?.some((modifier) => modifier.kind === modifierKind),
  );
}

function isPublicApiMember(node: ts.Node): boolean {
  const named = node as ts.NamedDeclaration;
  return (
    !(named.name && ts.isPrivateIdentifier(named.name)) &&
    !hasModifier(node, ts.SyntaxKind.PrivateKeyword) &&
    !hasModifier(node, ts.SyntaxKind.ProtectedKeyword)
  );
}

function isAnonymousDefaultDeclaration(node: ts.Node): boolean {
  return (
    (ts.isClassDeclaration(node) ||
      ts.isFunctionDeclaration(node) ||
      ts.isInterfaceDeclaration(node)) &&
    !node.name &&
    hasModifier(node, ts.SyntaxKind.ExportKeyword) &&
    hasModifier(node, ts.SyntaxKind.DefaultKeyword)
  );
}

function isStaticPropertyDeclaration(
  node: ts.Node,
): node is ts.PropertyDeclaration {
  return (
    ts.isPropertyDeclaration(node) &&
    hasModifier(node, ts.SyntaxKind.StaticKeyword)
  );
}

function apiMemberKind(
  node: ts.Node,
): ApiSymbolIdentity["member_path"][number]["kind"] | null {
  if (
    ts.isPropertySignature(node) ||
    (ts.isPropertyDeclaration(node) && !isStaticPropertyDeclaration(node)) ||
    ts.isParameter(node)
  ) {
    return "prop";
  }
  if (ts.isMethodSignature(node)) return "method";
  if (ts.isMethodDeclaration(node)) {
    return hasModifier(node, ts.SyntaxKind.StaticKeyword)
      ? "static_method"
      : "method";
  }
  return null;
}

function inferDeprecationKindFromNode(
  node: ts.Node,
): DeprecationRecord["kind"] {
  if (ts.isMethodDeclaration(node) || ts.isMethodSignature(node)) {
    return "method";
  }
  if (
    ts.isPropertySignature(node) ||
    ts.isPropertyDeclaration(node) ||
    ts.isParameter(node)
  ) {
    return "prop";
  }

  if (
    ts.isImportClause(node) ||
    ts.isImportSpecifier(node) ||
    ts.isImportDeclaration(node)
  ) {
    return "import";
  }

  if (
    ts.isTypeAliasDeclaration(node) ||
    ts.isInterfaceDeclaration(node) ||
    ts.isTypeParameterDeclaration(node)
  ) {
    return "type";
  }

  if (
    ts.isFunctionDeclaration(node) ||
    ts.isClassDeclaration(node) ||
    ts.isVariableDeclaration(node) ||
    ts.isEnumDeclaration(node)
  ) {
    return "other";
  }

  return "other";
}

function inferSymbolNameFromNode(node: ts.Node): string | null {
  if (ts.isVariableStatement(node)) {
    const declaration = node.declarationList.declarations[0];
    if (declaration && ts.isIdentifier(declaration.name)) {
      return declaration.name.text;
    }
  }

  if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name)) {
    return node.name.text;
  }

  if (ts.isImportSpecifier(node)) {
    return node.name.text;
  }

  if (isAnonymousDefaultDeclaration(node)) {
    return "default";
  }

  if (ts.isExportAssignment(node) && !node.isExportEquals) {
    return "default";
  }

  if (
    ts.isPropertySignature(node) ||
    ts.isPropertyDeclaration(node) ||
    ts.isMethodDeclaration(node) ||
    ts.isMethodSignature(node) ||
    ts.isParameter(node)
  ) {
    if (node.name && ts.isIdentifier(node.name)) {
      return node.name.text;
    }
    if (
      node.name &&
      (ts.isStringLiteral(node.name) || ts.isNumericLiteral(node.name))
    ) {
      return node.name.text;
    }
  }

  if ("name" in node) {
    const named = node as ts.NamedDeclaration;
    if (named.name && ts.isIdentifier(named.name)) {
      return named.name.text;
    }
  }

  return null;
}

function bindingNames(name: ts.BindingName): string[] {
  if (ts.isIdentifier(name)) return [name.text];
  return name.elements.flatMap((element) =>
    ts.isOmittedExpression(element) ? [] : bindingNames(element.name),
  );
}

function inferComponentFromNode(node: ts.Node): string | null {
  let current: ts.Node | undefined = node;
  while (current) {
    if (
      ts.isInterfaceDeclaration(current) ||
      ts.isTypeAliasDeclaration(current) ||
      ts.isClassDeclaration(current) ||
      ts.isFunctionDeclaration(current)
    ) {
      const name = current.name?.text ?? null;
      if (!name) {
        current = current.parent;
        continue;
      }
      if (name.endsWith("Props")) {
        return name.replace(/Props$/, "");
      }
      if (/^[A-Z]/.test(name)) {
        return name;
      }
    }

    current = current.parent;
  }

  return null;
}

function enclosingApiOwner(node: ts.Node): ts.NamedDeclaration | null {
  let current = node.parent;
  while (current) {
    if (
      ts.isInterfaceDeclaration(current) ||
      ts.isTypeAliasDeclaration(current) ||
      ts.isClassDeclaration(current) ||
      ts.isEnumDeclaration(current)
    ) {
      return current;
    }
    current = current.parent;
  }
  return null;
}

function typeSurfaceMembers(node: ts.TypeNode): readonly ts.TypeElement[] {
  if (ts.isTypeLiteralNode(node)) return node.members;
  if (ts.isParenthesizedTypeNode(node)) {
    return typeSurfaceMembers(node.type);
  }
  if (ts.isIntersectionTypeNode(node) || ts.isUnionTypeNode(node)) {
    return node.types.flatMap(typeSurfaceMembers);
  }
  return [];
}

function apiOwnerMembers(owner: ts.NamedDeclaration): readonly ts.Node[] {
  if (ts.isInterfaceDeclaration(owner)) return owner.members;
  if (ts.isTypeAliasDeclaration(owner)) {
    return typeSurfaceMembers(owner.type);
  }
  if (ts.isClassDeclaration(owner)) {
    const members: ts.Node[] = [];
    for (const member of owner.members) {
      if (!ts.isConstructorDeclaration(member)) {
        members.push(member);
        continue;
      }
      members.push(
        ...member.parameters.filter((parameter) =>
          ts.isParameterPropertyDeclaration(parameter, member),
        ),
      );
    }
    return members;
  }
  if (ts.isEnumDeclaration(owner)) return owner.members;
  return [];
}

function isNodeWithin(node: ts.Node, ancestor: ts.Node): boolean {
  let current: ts.Node | undefined = node;
  while (current) {
    if (current === ancestor) return true;
    current = current.parent;
  }
  return false;
}

function effectiveTypeAliasMemberDeclarations(
  owner: ts.NamedDeclaration,
  memberName: string,
  checker: ts.TypeChecker,
): readonly ts.Declaration[] {
  if (!ts.isTypeAliasDeclaration(owner)) return [];
  const property = checker.getPropertyOfType(
    checker.getTypeAtLocation(owner),
    memberName,
  );
  return (property?.declarations ?? []).filter((declaration) =>
    isNodeWithin(declaration, owner),
  );
}

function isDirectApiOwnerMember(
  owner: ts.NamedDeclaration,
  node: ts.Node,
  checker: ts.TypeChecker,
): boolean {
  if (
    apiOwnerMembers(owner).includes(node) ||
    (ts.isClassDeclaration(owner) &&
      ts.isConstructorDeclaration(node) &&
      owner.members.includes(node))
  ) {
    return true;
  }
  const memberName = apiMemberName(node);
  return (
    memberName !== null &&
    effectiveTypeAliasMemberDeclarations(owner, memberName, checker).includes(
      node as ts.Declaration,
    )
  );
}

function namedDeclarationName(node: ts.NamedDeclaration): string | null {
  if (node.name && ts.isIdentifier(node.name)) return node.name.text;
  if (node.name && ts.isStringLiteral(node.name)) return node.name.text;
  return null;
}

function isTopLevelApiDeclaration(node: ts.Node): boolean {
  if (ts.isSourceFile(node.parent)) return true;
  if (
    ts.isVariableDeclaration(node) &&
    ts.isVariableDeclarationList(node.parent) &&
    ts.isVariableStatement(node.parent.parent) &&
    ts.isSourceFile(node.parent.parent.parent)
  ) {
    return true;
  }
  return false;
}

function symbolOrigins(
  entrypoint: PublicApiEntrypoint,
  symbolSpace: ApiSymbolIdentity["symbol_space"],
  exportName: string,
): readonly PackageExportOrigin[] {
  if (symbolSpace === "value") {
    return entrypoint.graph.valueExportOrigins.get(exportName) ?? [];
  }
  if (symbolSpace === "type") {
    return entrypoint.graph.typeExportOrigins.get(exportName) ?? [];
  }
  const valueOrigins =
    entrypoint.graph.valueExportOrigins.get(exportName) ?? [];
  const typeOrigins = entrypoint.graph.typeExportOrigins.get(exportName) ?? [];
  if (valueOrigins.length === 0 || typeOrigins.length === 0) {
    return [];
  }
  const originsByIdentity = new Map(
    [...valueOrigins, ...typeOrigins].map((origin) => [
      canonicalJson(origin),
      origin,
    ]),
  );
  return [...originsByIdentity.values()].sort(
    (left, right) =>
      compareOrdinalStrings(left.repoPath, right.repoPath) ||
      compareOrdinalStrings(
        left.declarationName ?? "",
        right.declarationName ?? "",
      ),
  );
}

function publicExportNamesForDeclaration(
  entrypoint: PublicApiEntrypoint,
  symbolSpace: ApiSymbolIdentity["symbol_space"],
  normalizedPath: string,
  declarationName: string | null,
): string[] {
  const exportNames =
    symbolSpace === "value"
      ? [...entrypoint.graph.valueExportOrigins.keys()]
      : symbolSpace === "type"
        ? [...entrypoint.graph.typeExportOrigins.keys()]
        : uniqueStrings([
            ...entrypoint.graph.valueExportOrigins.keys(),
            ...entrypoint.graph.typeExportOrigins.keys(),
          ]);
  const matches: string[] = [];
  for (const exportName of exportNames.sort(compareOrdinalStrings)) {
    const origins = symbolOrigins(entrypoint, symbolSpace, exportName);
    const matchingOrigins = origins.filter(
      (origin) =>
        origin.repoPath === normalizedPath &&
        origin.declarationName === declarationName,
    );
    if (matchingOrigins.length === 0) continue;
    if (origins.length !== 1 || matchingOrigins.length !== 1) {
      throw new Error(
        `Public ${symbolSpace} export '${exportName}' is ambiguous in ${entrypoint.graph.packageName} ${entrypoint.name}: ${origins
          .map(
            (origin) =>
              `${origin.repoPath}#${origin.declarationName ?? "(anonymous)"}`,
          )
          .join(", ")}.`,
      );
    }
    matches.push(exportName);
  }
  return matches;
}

function inherentDeclarationSymbolSpace(
  declaration: ts.Node,
  checker?: ts.TypeChecker,
): ApiSymbolIdentity["symbol_space"] {
  if (
    checker &&
    ts.isExportAssignment(declaration) &&
    ts.isIdentifier(declaration.expression)
  ) {
    let symbol = checker.getSymbolAtLocation(declaration.expression);
    if (symbol && (symbol.flags & ts.SymbolFlags.Alias) !== 0) {
      symbol = checker.getAliasedSymbol(symbol);
    }
    if (symbol) {
      const hasValue = (symbol.flags & ts.SymbolFlags.Value) !== 0;
      const hasType = (symbol.flags & ts.SymbolFlags.Type) !== 0;
      if (hasValue && hasType) return "type_and_value";
      if (hasType) return "type";
    }
  }
  if (
    ts.isTypeAliasDeclaration(declaration) ||
    ts.isInterfaceDeclaration(declaration) ||
    ts.isTypeParameterDeclaration(declaration)
  ) {
    return "type";
  }
  if (ts.isClassDeclaration(declaration) || ts.isEnumDeclaration(declaration)) {
    return "type_and_value";
  }
  if (ts.isModuleDeclaration(declaration)) {
    const spaces = declarationSymbolSpaces(declaration);
    return spaces.value ? "type_and_value" : "type";
  }
  return "value";
}

function publicExportsForDeclaration(
  entrypoint: PublicApiEntrypoint,
  inherentSymbolSpace: ApiSymbolIdentity["symbol_space"],
  normalizedPath: string,
  declarationName: string | null,
): Array<{
  exportName: string;
  symbolSpace: ApiSymbolIdentity["symbol_space"];
}> {
  const valueNames =
    inherentSymbolSpace === "type"
      ? new Set<string>()
      : new Set(
          publicExportNamesForDeclaration(
            entrypoint,
            "value",
            normalizedPath,
            declarationName,
          ),
        );
  const typeNames =
    inherentSymbolSpace === "value"
      ? new Set<string>()
      : new Set(
          publicExportNamesForDeclaration(
            entrypoint,
            "type",
            normalizedPath,
            declarationName,
          ),
        );
  return uniqueStrings([...valueNames, ...typeNames])
    .sort(compareOrdinalStrings)
    .map((exportName) => ({
      exportName,
      symbolSpace:
        valueNames.has(exportName) && typeNames.has(exportName)
          ? "type_and_value"
          : valueNames.has(exportName)
            ? "value"
            : "type",
    }));
}

function publicExportsForSite(
  entrypoint: PublicApiEntrypoint,
  inherentSymbolSpace: ApiSymbolIdentity["symbol_space"],
  normalizedPath: string,
  siteExportName: string,
): Array<{
  exportName: string;
  symbolSpace: ApiSymbolIdentity["symbol_space"];
}> {
  const valueNames =
    inherentSymbolSpace === "type"
      ? new Set<string>()
      : new Set(
          [...entrypoint.graph.valueExportSites.entries()]
            .filter(([, sites]) =>
              sites.some(
                (site) =>
                  site.repoPath === normalizedPath &&
                  site.exportName === siteExportName,
              ),
            )
            .map(([exportName]) => exportName),
        );
  const typeNames =
    inherentSymbolSpace === "value"
      ? new Set<string>()
      : new Set(
          [...entrypoint.graph.typeExportSites.entries()]
            .filter(([, sites]) =>
              sites.some(
                (site) =>
                  site.repoPath === normalizedPath &&
                  site.exportName === siteExportName,
              ),
            )
            .map(([exportName]) => exportName),
        );
  return uniqueStrings([...valueNames, ...typeNames])
    .sort(compareOrdinalStrings)
    .map((exportName) => ({
      exportName,
      symbolSpace:
        valueNames.has(exportName) && typeNames.has(exportName)
          ? "type_and_value"
          : valueNames.has(exportName)
            ? "value"
            : "type",
    }));
}

function isPublicApiOwnerDeclaration(
  owner: ts.NamedDeclaration,
  normalizedPath: string,
  entrypoints: readonly PublicApiEntrypoint[],
  options: { requireValue?: boolean } = {},
): boolean {
  if (!isTopLevelApiDeclaration(owner)) return false;
  const declarationName = namedDeclarationName(owner);
  if (!declarationName && !isAnonymousDefaultDeclaration(owner)) {
    return false;
  }
  return entrypoints.some((entrypoint) =>
    publicExportsForDeclaration(
      entrypoint,
      inherentDeclarationSymbolSpace(owner),
      normalizedPath,
      declarationName,
    ).some(
      (candidate) => !options.requireValue || candidate.symbolSpace !== "type",
    ),
  );
}

function buildApiSymbolIdentities(
  node: ts.Node,
  symbolName: string,
  checker: ts.TypeChecker,
  packageName: string,
  normalizedPath: string,
  entrypoints: readonly PublicApiEntrypoint[],
): ApiSymbolIdentity[] {
  const memberKind = apiMemberKind(node);
  const memberOwner = memberKind ? enclosingApiOwner(node) : null;
  if (!isTopLevelApiDeclaration(memberOwner ?? node)) {
    return [];
  }
  const ownerName = memberOwner ? namedDeclarationName(memberOwner) : null;
  if (
    memberOwner &&
    !ownerName &&
    !isAnonymousDefaultDeclaration(memberOwner)
  ) {
    throw new Error(
      `Deprecated member '${symbolName}' in '${normalizedPath}' has no stable API owner.`,
    );
  }
  if (
    memberKind &&
    (!memberOwner ||
      !isPublicApiMember(node) ||
      !isDirectApiOwnerMember(memberOwner, node, checker))
  ) {
    throw new Error(
      `Deprecated member '${symbolName}' in '${normalizedPath}' is not a public member of a stable API owner.`,
    );
  }
  const declarationName = memberOwner
    ? ownerName
    : ts.isExportAssignment(node)
      ? ts.isIdentifier(node.expression)
        ? node.expression.text
        : null
      : isAnonymousDefaultDeclaration(node)
        ? null
        : symbolName;
  const inherentSymbolSpace = inherentDeclarationSymbolSpace(
    memberOwner ?? node,
    checker,
  );
  const publicExports = entrypoints.flatMap((entrypoint) =>
    (ts.isExportAssignment(node) && !node.isExportEquals
      ? publicExportsForSite(
          entrypoint,
          inherentSymbolSpace,
          normalizedPath,
          "default",
        )
      : publicExportsForDeclaration(
          entrypoint,
          inherentSymbolSpace,
          normalizedPath,
          declarationName,
        )
    )
      .filter(
        (candidate) =>
          memberKind !== "static_method" || candidate.symbolSpace !== "type",
      )
      .map((candidate) => ({ entrypoint, ...candidate })),
  );
  if (publicExports.length === 0) {
    return [];
  }
  return publicExports
    .sort(
      (left, right) =>
        compareOrdinalStrings(left.entrypoint.name, right.entrypoint.name) ||
        compareOrdinalStrings(left.exportName, right.exportName),
    )
    .map(({ entrypoint, exportName, symbolSpace }) => ({
      package: packageName,
      entrypoint: entrypoint.name,
      export_name: exportName,
      symbol_space: symbolSpace,
      member_path:
        memberOwner && memberKind
          ? [
              {
                kind: memberKind,
                name: symbolName,
              },
            ]
          : [],
    }));
}

function buildDeprecationId(subject: ApiSymbolIdentity): string {
  return createDeprecationId(subject);
}

function sourceOccurrence(
  sourceFile: ts.SourceFile,
  tag: ts.JSDocTag,
  normalizedPath: string,
): DeprecationSourceOccurrence {
  const evidenceNode =
    tag.parent.kind === ts.SyntaxKind.JSDoc ? tag.parent : tag;
  const startCharacterOffset = evidenceNode.getStart(sourceFile);
  const endCharacterOffset = evidenceNode.getEnd();
  const start = sourceFile.getLineAndCharacterOfPosition(startCharacterOffset);
  const end = sourceFile.getLineAndCharacterOfPosition(endCharacterOffset);
  return {
    source_path: normalizedPath,
    source_range: {
      start_offset: Buffer.byteLength(
        sourceFile.text.slice(0, startCharacterOffset),
        "utf8",
      ),
      end_offset: Buffer.byteLength(
        sourceFile.text.slice(0, endCharacterOffset),
        "utf8",
      ),
      start_line: start.line + 1,
      start_column: start.character + 1,
      end_line: end.line + 1,
      end_column: end.character + 1,
    },
  };
}

interface JsDocLinkTarget {
  text: string;
  node: ts.Node;
}

function jsDocLinkTargets(
  tag: ts.JSDocTag,
  sourceFile: ts.SourceFile,
): JsDocLinkTarget[] {
  if (!tag.comment || typeof tag.comment === "string") {
    return [];
  }
  const targets = new Map<string, JsDocLinkTarget>();
  for (const part of tag.comment) {
    if (!ts.isJSDocLinkLike(part) || !part.name) continue;
    const text = part.name.getText(sourceFile).trim();
    if (text && !targets.has(text)) {
      targets.set(text, { text, node: part.name });
    }
  }
  return [...targets.values()];
}

function tagsNamed(
  tags: readonly ts.JSDocTag[],
  name: string,
  sourceFile: ts.SourceFile,
): ts.JSDocTag[] {
  return tags.filter((tag) => tag.tagName.getText(sourceFile) === name);
}

function deprecatedPublicExportSelectors(
  tags: readonly ts.JSDocTag[],
  sourceFile: ts.SourceFile,
): string[] {
  const selectors = tagsNamed(tags, "saltDeprecatedExport", sourceFile).map(
    (tag) => extractJsDocTagComment(tag.comment, sourceFile).trim(),
  );
  for (const selector of selectors) {
    if (
      selector !== "default" &&
      !/^[A-Za-z_$][A-Za-z0-9_$]*$/u.test(selector)
    ) {
      throw new Error(
        `Invalid @saltDeprecatedExport selector '${selector || "(empty)"}'.`,
      );
    }
  }
  if (new Set(selectors).size !== selectors.length) {
    throw new Error(
      "A deprecation may select each @saltDeprecatedExport only once.",
    );
  }
  return selectors.sort(compareOrdinalStrings);
}

function finiteApiLiteralsFromType(
  type: ts.Type,
  checker: ts.TypeChecker,
  resolving = new Set<ts.Type>(),
): ApiLiteral[] | null {
  if (resolving.has(type)) return null;
  const nextResolving = new Set(resolving);
  nextResolving.add(type);

  if (type.isUnion()) {
    const values: ApiLiteral[] = [];
    for (const member of type.types) {
      const memberValues = finiteApiLiteralsFromType(
        member,
        checker,
        nextResolving,
      );
      if (!memberValues) return null;
      values.push(...memberValues);
    }
    return values;
  }
  if (type.flags & ts.TypeFlags.StringLiteral) {
    return [(type as ts.StringLiteralType).value];
  }
  if (type.flags & ts.TypeFlags.NumberLiteral) {
    return [(type as ts.NumberLiteralType).value];
  }
  if (type.flags & ts.TypeFlags.BooleanLiteral) {
    return [
      (type as ts.Type & { intrinsicName?: string }).intrinsicName === "true",
    ];
  }
  if (type.flags & ts.TypeFlags.Boolean) return [false, true];
  if (type.flags & ts.TypeFlags.Null) return [null];
  if (
    type.flags &
    (ts.TypeFlags.Undefined | ts.TypeFlags.Void | ts.TypeFlags.Never)
  ) {
    return [];
  }
  if (type.flags & ts.TypeFlags.TypeParameter) {
    const constraint = checker.getBaseConstraintOfType(type);
    return constraint
      ? finiteApiLiteralsFromType(constraint, checker, nextResolving)
      : null;
  }
  return null;
}

function finiteDeprecatedValues(
  node: ts.Node,
  checker: ts.TypeChecker,
): ApiLiteral[] | null {
  const typeNode = (node as ts.Node & { type?: ts.TypeNode }).type;
  if (!typeNode) return null;
  const values = finiteApiLiteralsFromType(
    checker.getTypeFromTypeNode(typeNode),
    checker,
  );
  if (!values) return null;
  const byIdentity = new Map(
    values.map((value) => [canonicalJson(value), value] as const),
  );
  return [...byIdentity.values()];
}

function apiLiteralType(value: ApiLiteral, checker: ts.TypeChecker): ts.Type {
  if (value === null) return checker.getNullType();
  if (typeof value === "string") return checker.getStringLiteralType(value);
  if (typeof value === "number") return checker.getNumberLiteralType(value);
  return value ? checker.getTrueType() : checker.getFalseType();
}

function declarationValueType(
  declaration: ts.Node,
  checker: ts.TypeChecker,
): ts.Type | null {
  const typeNode = (declaration as ts.Node & { type?: ts.TypeNode }).type;
  if (typeNode) return checker.getTypeFromTypeNode(typeNode);
  const name = (declaration as ts.NamedDeclaration).name;
  if (!name) return null;
  const symbol = checker.getSymbolAtLocation(name);
  return symbol ? checker.getTypeOfSymbolAtLocation(symbol, declaration) : null;
}

function apiMemberName(node: ts.Node): string | null {
  const named = node as ts.NamedDeclaration;
  if (
    !named.name ||
    (!ts.isIdentifier(named.name) &&
      !ts.isStringLiteral(named.name) &&
      !ts.isNumericLiteral(named.name))
  ) {
    return null;
  }
  return named.name.getText(node.getSourceFile()).replace(/^['"]|['"]$/gu, "");
}

function mergedApiOwnerDeclarations(
  owner: ts.NamedDeclaration,
  checker: ts.TypeChecker,
): ts.NamedDeclaration[] {
  if (!owner.name) return [owner];
  const symbol = checker.getSymbolAtLocation(owner.name);
  const declarations = symbol?.declarations ?? [owner];
  const owners = declarations.filter(
    (declaration): declaration is ts.NamedDeclaration =>
      ts.isInterfaceDeclaration(declaration) ||
      ts.isTypeAliasDeclaration(declaration) ||
      ts.isClassDeclaration(declaration),
  );
  return [
    ...new Map(
      [owner, ...owners].map((declaration) => [
        `${declaration.getSourceFile().fileName}:${declaration.pos}:${declaration.end}`,
        declaration,
      ]),
    ).values(),
  ];
}

function functionOverloadDeclarations(
  node: ts.FunctionDeclaration,
  checker: ts.TypeChecker,
): ts.FunctionDeclaration[] {
  if (!node.name) return [node];
  const symbol = checker.getSymbolAtLocation(node.name);
  return [
    ...new Map(
      (symbol?.declarations ?? [node])
        .filter(ts.isFunctionDeclaration)
        .map((declaration) => [
          `${declaration.getSourceFile().fileName}:${declaration.pos}:${declaration.end}`,
          declaration,
        ]),
    ).values(),
  ];
}

function effectiveCallSignatureCount(
  node: ts.NamedDeclaration,
  checker: ts.TypeChecker,
): number {
  if (!node.name) return 0;
  let symbol = checker.getSymbolAtLocation(node.name);
  if (symbol && (symbol.flags & ts.SymbolFlags.Alias) !== 0) {
    symbol = checker.getAliasedSymbol(symbol);
  }
  if (!symbol) return 0;
  const type = checker.getTypeOfSymbolAtLocation(symbol, node);
  return checker.getSignaturesOfType(type, ts.SignatureKind.Call).length;
}

function assertRepresentableTopLevelReplacement(
  linkTarget: JsDocLinkTarget,
  sourceFile: ts.SourceFile,
  checker: ts.TypeChecker,
): void {
  let symbol = checker.getSymbolAtLocation(linkTarget.node);
  if (symbol && (symbol.flags & ts.SymbolFlags.Alias) !== 0) {
    symbol = checker.getAliasedSymbol(symbol);
  }
  const functionDeclarations = [
    ...new Map(
      (
        symbol?.declarations ??
        sourceFile.statements.filter(
          (statement): statement is ts.FunctionDeclaration =>
            ts.isFunctionDeclaration(statement) &&
            statement.name?.text === linkTarget.text,
        )
      )
        .filter(ts.isFunctionDeclaration)
        .map((declaration) => [
          `${declaration.getSourceFile().fileName}:${declaration.pos}:${declaration.end}`,
          declaration,
        ]),
    ).values(),
  ];
  if (
    functionDeclarations.length > 1 ||
    functionDeclarations.some(
      (declaration) => effectiveCallSignatureCount(declaration, checker) > 1,
    )
  ) {
    throw new Error(
      `Overloaded replacement function '${linkTarget.text}' cannot be represented by the single-hop public identity.`,
    );
  }
}

function assertRepresentablePublicTopLevelIdentity(
  subject: ApiSymbolIdentity,
  entrypoints: readonly PublicApiEntrypoint[],
  program: ts.Program,
  repoRoot: string,
  context: "Deprecated" | "Overloaded replacement",
  displayName: string,
): void {
  if (subject.member_path.length > 0) return;
  const entrypoint = entrypoints.find(
    (candidate) => candidate.name === subject.entrypoint,
  );
  if (!entrypoint) {
    throw new Error(
      `Missing public entrypoint '${subject.entrypoint}' for '${displayName}'.`,
    );
  }
  const origins = symbolOrigins(
    entrypoint,
    subject.symbol_space,
    subject.export_name,
  );
  if (origins.length !== 1) {
    throw new Error(
      `${context} symbol '${displayName}' does not have one representable public origin.`,
    );
  }
  const origin = origins[0] as PackageExportOrigin;
  if (!origin.declarationName) return;
  const originSourceFile = programSourceFile(
    program,
    path.resolve(repoRoot, origin.repoPath),
  );
  if (!originSourceFile) {
    throw new Error(
      `${context} symbol '${displayName}' origin '${origin.repoPath}' is missing from the deprecation TypeScript program.`,
    );
  }
  const functionDeclarations = originSourceFile.statements.filter(
    (statement): statement is ts.FunctionDeclaration =>
      ts.isFunctionDeclaration(statement) &&
      statement.name?.text === origin.declarationName,
  );
  const checker = program.getTypeChecker();
  if (
    functionDeclarations.length > 1 ||
    functionDeclarations.some(
      (declaration) => effectiveCallSignatureCount(declaration, checker) > 1,
    )
  ) {
    throw new Error(
      `${context} function '${displayName}' cannot be represented by the single-hop public identity because its public origin is overloaded.`,
    );
  }
}

function ownerMemberDeclarations(
  node: ts.Node,
  memberName: string,
  checker: ts.TypeChecker,
): readonly ts.Node[] {
  const owner = enclosingApiOwner(node);
  if (!owner) return [];
  const namedPublicMembers = [
    ...new Map(
      mergedApiOwnerDeclarations(owner, checker)
        .flatMap((declaration) => [
          ...apiOwnerMembers(declaration),
          ...effectiveTypeAliasMemberDeclarations(
            declaration,
            memberName,
            checker,
          ),
        ])
        .map((declaration) => [
          `${declaration.getSourceFile().fileName}:${declaration.pos}:${declaration.end}`,
          declaration,
        ]),
    ).values(),
  ].filter(
    (candidate) =>
      isPublicApiMember(candidate) && apiMemberName(candidate) === memberName,
  );
  if (namedPublicMembers.some(isStaticPropertyDeclaration)) {
    throw new Error(
      `Static replacement property '${memberName}' cannot be represented by the single-hop public-member identity.`,
    );
  }
  return namedPublicMembers.filter(
    (candidate) => apiMemberKind(candidate) !== null,
  );
}

function ownerMemberDeclaration(
  node: ts.Node,
  memberName: string,
  checker: ts.TypeChecker,
): ts.Node | null {
  const matches = ownerMemberDeclarations(node, memberName, checker).filter(
    (candidate) => apiMemberKind(candidate) === "prop",
  );
  if (matches.length > 1) {
    throw new Error(
      `Public owner declares replacement property '${memberName}' more than once.`,
    );
  }
  return matches[0] ?? null;
}

function ownerMemberIdentityKind(
  node: ts.Node,
  memberName: string,
  checker: ts.TypeChecker,
): ApiSymbolIdentity["member_path"][number]["kind"] | null {
  const matches = ownerMemberDeclarations(node, memberName, checker);
  const kinds = uniqueStrings(
    matches
      .map(apiMemberKind)
      .filter(
        (kind): kind is ApiSymbolIdentity["member_path"][number]["kind"] =>
          kind !== null,
      ),
  );
  if (kinds.length > 1) {
    throw new Error(
      `Public owner declares replacement member '${memberName}' with ambiguous static or instance kinds.`,
    );
  }
  if (
    (matches.length > 1 ||
      matches.some(
        (candidate) =>
          effectiveCallSignatureCount(
            candidate as ts.NamedDeclaration,
            checker,
          ) > 1,
      )) &&
    (kinds[0] === "method" || kinds[0] === "static_method")
  ) {
    throw new Error(
      `Overloaded replacement method '${memberName}' cannot be represented by the single-hop public-member identity.`,
    );
  }
  return kinds[0] ?? null;
}

function lexicalDeclarationOrigins(
  linkTarget: JsDocLinkTarget,
  sourceFile: ts.SourceFile,
  checker: ts.TypeChecker,
  repoRoot: string,
  symbolSpace: ApiSymbolIdentity["symbol_space"],
): PackageExportOrigin[] {
  let symbol = checker.getSymbolAtLocation(linkTarget.node);
  if (symbol && (symbol.flags & ts.SymbolFlags.Alias) !== 0) {
    symbol = checker.getAliasedSymbol(symbol);
  }
  const declarations = symbol?.declarations ?? [];
  const matchingDeclarations =
    declarations.length > 0
      ? declarations
      : sourceFile.statements.filter(
          (statement) => inferSymbolNameFromNode(statement) === linkTarget.text,
        );
  const origins = new Map<string, PackageExportOrigin>();
  for (const declaration of matchingDeclarations) {
    const declarationName =
      namedDeclarationName(declaration as ts.NamedDeclaration) ??
      inferSymbolNameFromNode(declaration);
    if (!declarationName) continue;
    const declarationSource = declaration.getSourceFile();
    const repoPath = toPosixPath(
      path.relative(repoRoot, declarationSource.fileName),
    );
    if (
      repoPath.startsWith("../") ||
      path.isAbsolute(repoPath) ||
      !repoPath.startsWith("packages/")
    ) {
      continue;
    }
    const origin = {
      repoPath,
      declarationName,
      declarationKey: packageExportDeclarationKey(
        declarationSource,
        declarationName,
        symbolSpace === "type" ? "type" : "value",
      ),
    };
    origins.set(canonicalJson(origin), origin);
  }
  return [...origins.values()].sort(
    (left, right) =>
      compareOrdinalStrings(left.repoPath, right.repoPath) ||
      compareOrdinalStrings(
        left.declarationName ?? "",
        right.declarationName ?? "",
      ) ||
      compareOrdinalStrings(
        left.declarationKey ?? "",
        right.declarationKey ?? "",
      ),
  );
}

function sameExportOrigin(
  left: PackageExportOrigin,
  right: PackageExportOrigin,
): boolean {
  return (
    left.repoPath === right.repoPath &&
    left.declarationName === right.declarationName &&
    left.declarationKey === right.declarationKey
  );
}

function resolveLinkedPublicExportName(
  entrypoint: PublicApiEntrypoint,
  symbolSpace: ApiSymbolIdentity["symbol_space"],
  linkTarget: JsDocLinkTarget,
  sourceFile: ts.SourceFile,
  checker: ts.TypeChecker,
  repoRoot: string,
): string {
  const exportNames =
    symbolSpace === "value"
      ? [...entrypoint.graph.valueExportOrigins.keys()]
      : symbolSpace === "type"
        ? [...entrypoint.graph.typeExportOrigins.keys()]
        : uniqueStrings([
            ...entrypoint.graph.valueExportOrigins.keys(),
            ...entrypoint.graph.typeExportOrigins.keys(),
          ]);
  const lexicalOrigins = lexicalDeclarationOrigins(
    linkTarget,
    sourceFile,
    checker,
    repoRoot,
    symbolSpace,
  );
  if (lexicalOrigins.length > 0) {
    const lexicalMatches: string[] = [];
    for (const exportName of exportNames.sort(compareOrdinalStrings)) {
      const origins = symbolOrigins(entrypoint, symbolSpace, exportName);
      if (
        origins.length === 1 &&
        lexicalOrigins.some((origin) =>
          sameExportOrigin(origins[0] as PackageExportOrigin, origin),
        )
      ) {
        lexicalMatches.push(exportName);
      }
    }
    if (lexicalMatches.length === 1) return lexicalMatches[0] as string;
    throw new Error(
      `Replacement ${symbolSpace} declaration '${linkTarget.text}' is not uniquely public from ${entrypoint.graph.packageName}${entrypoint.name === "." ? "" : entrypoint.name.slice(1)}.`,
    );
  }

  const exactOrigins = symbolOrigins(entrypoint, symbolSpace, linkTarget.text);
  if (exactOrigins.length !== 1) {
    throw new Error(
      `Replacement ${symbolSpace} export '${linkTarget.text}' is not uniquely public from ${entrypoint.graph.packageName}${entrypoint.name === "." ? "" : entrypoint.name.slice(1)}.`,
    );
  }
  return linkTarget.text;
}

function resolveReplacementTarget(
  subject: ApiSymbolIdentity,
  linkTarget: JsDocLinkTarget,
  node: ts.Node,
  sourceFile: ts.SourceFile,
  checker: ts.TypeChecker,
  program: ts.Program,
  repoRoot: string,
  entrypoints: readonly PublicApiEntrypoint[],
): ApiSymbolIdentity {
  const linkedTarget = linkTarget.text;
  if (subject.member_path.length > 0) {
    const separatorIndex = Math.max(
      linkedTarget.lastIndexOf("."),
      linkedTarget.lastIndexOf("#"),
    );
    const ownerName =
      separatorIndex === -1 ? "" : linkedTarget.slice(0, separatorIndex);
    const targetName =
      separatorIndex === -1
        ? linkedTarget
        : linkedTarget.slice(separatorIndex + 1);
    const sourceOwnerName = enclosingApiOwner(node);
    const sourceOwnerDeclarationName = sourceOwnerName
      ? namedDeclarationName(sourceOwnerName)
      : null;
    if (
      ownerName !== subject.export_name &&
      ownerName !== sourceOwnerDeclarationName
    ) {
      throw new Error(
        `Replacement member link '${linkedTarget}' must name public owner '${subject.export_name}' or its source declaration '${sourceOwnerDeclarationName ?? "(unknown)"}'.`,
      );
    }
    const targetKind = ownerMemberIdentityKind(node, targetName, checker);
    if (!targetKind) {
      throw new Error(
        `Replacement member '${targetName}' does not exist on public owner '${subject.export_name}'.`,
      );
    }
    if (
      targetKind === "static_method" &&
      subject.symbol_space !== "type_and_value"
    ) {
      throw new Error(
        `Static replacement method '${targetName}' is unavailable through type-only public owner '${subject.export_name}'.`,
      );
    }
    return {
      ...subject,
      member_path: [{ kind: targetKind, name: targetName }],
    };
  }
  if (!/^[A-Za-z_$][A-Za-z0-9_$]*$/u.test(linkedTarget)) {
    throw new Error(
      `Top-level replacement link '${linkedTarget}' must be an exported symbol name.`,
    );
  }
  assertRepresentableTopLevelReplacement(linkTarget, sourceFile, checker);
  const entrypoint = entrypoints.find(
    (candidate) => candidate.name === subject.entrypoint,
  );
  if (!entrypoint) {
    throw new Error(
      `Missing public entrypoint '${subject.entrypoint}' for replacement '${linkedTarget}'.`,
    );
  }
  const publicExportName = resolveLinkedPublicExportName(
    entrypoint,
    subject.symbol_space,
    linkTarget,
    sourceFile,
    checker,
    repoRoot,
  );
  const target = {
    ...subject,
    export_name: publicExportName,
    member_path: [],
  };
  assertRepresentablePublicTopLevelIdentity(
    target,
    entrypoints,
    program,
    repoRoot,
    "Overloaded replacement",
    linkedTarget,
  );
  return target;
}

function apiSymbolDisplayName(subject: ApiSymbolIdentity): string {
  return subject.member_path.at(-1)?.name ?? subject.export_name;
}

export function buildDeprecationValueMap(
  node: ts.Node,
  checker: ts.TypeChecker,
  valueMapCases: readonly DeprecationValueMapOverrideCase[],
  targets: readonly ApiSymbolIdentity[],
): DeprecationValueMap | null {
  if (valueMapCases.length === 0) return null;
  if (apiMemberKind(node) !== "prop") {
    throw new Error(
      "A deprecation value-map override is only valid for deprecated public properties.",
    );
  }
  if (targets.length === 0) {
    throw new Error(
      "A deprecation value-map override requires at least one linked target.",
    );
  }
  if (targets.some((target) => target.member_path.at(-1)?.kind !== "prop")) {
    throw new Error(
      "Deprecation value-map replacement targets must be public properties.",
    );
  }
  const targetByName = new Map<string, ApiSymbolIdentity>();
  for (const target of targets) {
    const name = apiSymbolDisplayName(target);
    if (targetByName.has(name)) {
      throw new Error(
        `Replacement target name '${name}' is ambiguous in the deprecation value-map override.`,
      );
    }
    targetByName.set(name, target);
  }
  const targetTypes = new Map<string, ts.Type>();
  for (const targetName of targetByName.keys()) {
    const declaration = ownerMemberDeclaration(node, targetName, checker);
    const targetType = declaration
      ? declarationValueType(declaration, checker)
      : null;
    if (!targetType) {
      throw new Error(
        `The deprecation value-map override cannot resolve the declared type of replacement property '${targetName}'.`,
      );
    }
    if (targetType.flags & (ts.TypeFlags.Any | ts.TypeFlags.Unknown)) {
      throw new Error(
        `Deprecation value-map replacement property '${targetName}' must have a statically checkable type.`,
      );
    }
    targetTypes.set(targetName, targetType);
  }
  const seenFrom = new Set<string>();
  const cases = valueMapCases.map((valueMapCase) => {
    const fromKey = canonicalJson(valueMapCase.from);
    if (seenFrom.has(fromKey)) {
      throw new Error(
        `Deprecation value-map override repeats source value ${String(valueMapCase.from)}.`,
      );
    }
    seenFrom.add(fromKey);
    return {
      from: valueMapCase.from,
      set: valueMapCase.set.map(([targetName, value]) => {
        const target = targetByName.get(targetName);
        if (!target) {
          throw new Error(
            `The deprecation value-map override assigns '${targetName}', which is not a linked replacement target.`,
          );
        }
        const targetType = targetTypes.get(targetName);
        if (
          !targetType ||
          !checker.isTypeAssignableTo(
            apiLiteralType(value, checker),
            targetType,
          )
        ) {
          throw new Error(
            `The deprecation value-map override assigns ${JSON.stringify(value)} outside the declared type of replacement target '${targetName}'.`,
          );
        }
        return { target, value };
      }),
    };
  });
  const finiteValues = finiteDeprecatedValues(node, checker);
  if (!finiteValues) {
    throw new Error(
      "A deprecation value-map override requires a deprecated property with a finite literal or boolean type.",
    );
  }
  const expectedValues = new Set(
    finiteValues.map((value) => canonicalJson(value)),
  );
  if (
    seenFrom.size !== expectedValues.size ||
    [...seenFrom].some((value) => !expectedValues.has(value))
  ) {
    throw new Error(
      "Deprecation value-map cases must cover every finite value of the deprecated property exactly once.",
    );
  }
  return { cases, fallback: "manual" };
}

function deprecationKindRank(kind: DeprecationRecord["kind"]): number {
  switch (kind) {
    case "prop":
      return 0;
    case "method":
      return 1;
    case "component":
      return 2;
    case "import":
      return 3;
    case "type":
      return 4;
    case "token":
      return 5;
    default:
      return 6;
  }
}

function mergeDeprecationRecords(
  current: DeprecationRecord,
  candidate: DeprecationRecord,
): DeprecationRecord {
  if (canonicalJson(current.subject) !== canonicalJson(candidate.subject)) {
    throw new Error(
      `Deprecation identity collision for '${current.id}' has different API subjects.`,
    );
  }
  const preferred =
    deprecationKindRank(candidate.kind) < deprecationKindRank(current.kind)
      ? candidate
      : current;
  const secondary = preferred === current ? candidate : current;
  const { notes: currentNotes, ...currentReplacementIdentity } =
    current.replacement;
  const { notes: candidateNotes, ...candidateReplacementIdentity } =
    candidate.replacement;
  if (
    canonicalJson(currentReplacementIdentity) !==
      canonicalJson(candidateReplacementIdentity) ||
    canonicalJson(current.migration) !== canonicalJson(candidate.migration)
  ) {
    throw new Error(
      `Deprecation '${current.id}' has conflicting typed replacements.`,
    );
  }
  const mergedNotes = uniqueStrings(
    [currentNotes, candidateNotes].filter((note): note is string =>
      Boolean(note),
    ),
  ).sort(compareOrdinalStrings);
  const replacement = {
    ...preferred.replacement,
    notes: mergedNotes.length > 0 ? mergedNotes.join(" ") : null,
  };
  const migration = preferred.migration;
  const sourceOccurrences = [
    ...current.source_occurrences,
    ...candidate.source_occurrences,
  ]
    .filter(
      (occurrence, index, values) =>
        values.findIndex(
          (candidateOccurrence) =>
            canonicalJson(candidateOccurrence) === canonicalJson(occurrence),
        ) === index,
    )
    .sort(
      (left, right) =>
        compareOrdinalStrings(left.source_path, right.source_path) ||
        left.source_range.start_offset - right.source_range.start_offset,
    );

  return {
    ...preferred,
    deprecated_in: preferEarlierVersion(
      preferred.deprecated_in,
      secondary.deprecated_in,
    ),
    removed_in: preferred.removed_in ?? secondary.removed_in,
    replacement,
    migration,
    source_occurrences: sourceOccurrences,
    source_paths: uniqueStrings([
      ...sourceOccurrences.map((occurrence) => occurrence.source_path),
    ]).sort(compareOrdinalStrings),
    source_urls: uniqueStrings([
      ...preferred.source_urls,
      ...secondary.source_urls,
    ]).sort(compareOrdinalStrings),
  };
}

function collectDeprecationsFromSourceFile(
  sourceFile: ts.SourceFile,
  checker: ts.TypeChecker,
  program: ts.Program,
  repoRoot: string,
  packageName: string,
  normalizedPath: string,
  entrypoints: readonly PublicApiEntrypoint[],
  changelogMetadata?: PackageChangelogDeprecations,
): DeprecationRecord[] {
  const deprecationsByIdentity = new Map<string, DeprecationRecord>();

  const visit = (node: ts.Node): void => {
    const allTags = ts.getJSDocTags(node);
    const tags = allTags.filter(
      (tag) => tag.tagName.getText(sourceFile) === "deprecated",
    );
    if (tags.length > 0) {
      const memberKind = apiMemberKind(node);
      const owner = enclosingApiOwner(node);
      const directOwnerMember =
        owner !== null && isDirectApiOwnerMember(owner, node, checker);
      if (directOwnerMember && !isPublicApiMember(node)) {
        ts.forEachChild(node, visit);
        return;
      }
      if (directOwnerMember && !memberKind) {
        if (
          owner &&
          isPublicApiOwnerDeclaration(owner, normalizedPath, entrypoints, {
            requireValue:
              isStaticPropertyDeclaration(node) ||
              ts.isConstructorDeclaration(node),
          })
        ) {
          const memberName =
            inferSymbolNameFromNode(node) ??
            ts.SyntaxKind[node.kind] ??
            "unknown member";
          const reason = isStaticPropertyDeclaration(node)
            ? "static properties"
            : "this public member shape";
          throw new Error(
            `Deprecated public member '${memberName}' uses ${reason}, which cannot be represented by the single-hop public-member identity.`,
          );
        }
        ts.forEachChild(node, visit);
        return;
      }
      if (memberKind && (!owner || !directOwnerMember)) {
        ts.forEachChild(node, visit);
        return;
      }
      if (memberKind && owner) {
        if (
          !isPublicApiOwnerDeclaration(owner, normalizedPath, entrypoints, {
            requireValue: memberKind === "static_method",
          })
        ) {
          ts.forEachChild(node, visit);
          return;
        }
      }
      const statementPublicBindingNames = ts.isVariableStatement(node)
        ? uniqueStrings(
            node.declarationList.declarations
              .flatMap((declaration) => bindingNames(declaration.name))
              .filter(
                (bindingName) =>
                  buildApiSymbolIdentities(
                    node,
                    bindingName,
                    checker,
                    packageName,
                    normalizedPath,
                    entrypoints,
                  ).length > 0,
              ),
          ).sort(compareOrdinalStrings)
        : [];
      if (statementPublicBindingNames.length > 1) {
        throw new Error(
          `Deprecated variable statement declares multiple public bindings (${statementPublicBindingNames.join(", ")}), which cannot share one single-declaration deprecation contract.`,
        );
      }
      const symbolName =
        statementPublicBindingNames[0] ?? inferSymbolNameFromNode(node);
      if (!symbolName) {
        ts.forEachChild(node, visit);
        return;
      }
      const componentName = inferComponentFromNode(node);
      const kind = inferDeprecationKindFromNode(node);
      const publicSubjects = buildApiSymbolIdentities(
        node,
        symbolName,
        checker,
        packageName,
        normalizedPath,
        entrypoints,
      );
      if (
        publicSubjects.length > 0 &&
        ts.isFunctionDeclaration(node) &&
        (functionOverloadDeclarations(node, checker).length > 1 ||
          effectiveCallSignatureCount(node, checker) > 1)
      ) {
        throw new Error(
          `Deprecated overloaded function '${symbolName}' cannot be represented by the single-hop public identity.`,
        );
      }
      if (
        publicSubjects.length > 0 &&
        (memberKind === "method" || memberKind === "static_method")
      ) {
        const overloads = ownerMemberDeclarations(
          node,
          symbolName,
          checker,
        ).filter((candidate) => apiMemberKind(candidate) === memberKind);
        if (
          overloads.length > 1 ||
          overloads.some(
            (candidate) =>
              effectiveCallSignatureCount(
                candidate as ts.NamedDeclaration,
                checker,
              ) > 1,
          )
        ) {
          throw new Error(
            `Deprecated overloaded method '${symbolName}' cannot be represented by the single-hop public-member identity.`,
          );
        }
      }
      const publicExportSelectors = deprecatedPublicExportSelectors(
        allTags,
        sourceFile,
      );
      const subjects =
        publicExportSelectors.length === 0
          ? publicSubjects
          : publicSubjects.filter((subject) =>
              publicExportSelectors.includes(subject.export_name),
            );
      for (const subject of subjects) {
        assertRepresentablePublicTopLevelIdentity(
          subject,
          entrypoints,
          program,
          repoRoot,
          "Deprecated",
          subject.export_name,
        );
      }
      for (const selector of publicExportSelectors) {
        if (
          !publicSubjects.some((subject) => subject.export_name === selector)
        ) {
          throw new Error(
            `@saltDeprecatedExport '${selector}' does not identify a public export of '${symbolName}'.`,
          );
        }
      }
      const legacyValueMapTags = tagsNamed(allTags, "saltValueMap", sourceFile);
      const legacyMigrationTags = tagsNamed(
        allTags,
        "saltMigration",
        sourceFile,
      );
      if (subjects.length > 0 && legacyMigrationTags.length > 0) {
        throw new Error(
          `Deprecated public API '${symbolName}' must not declare @saltMigration; configure no-target behavior in the MCP-owned deprecation override map.`,
        );
      }
      if (subjects.length > 0 && legacyValueMapTags.length > 0) {
        throw new Error(
          `Deprecated public API '${symbolName}' must not declare @saltValueMap; configure transformations in the MCP-owned deprecation value-map override map.`,
        );
      }

      for (const tag of tags) {
        const rawNote = extractJsDocTagComment(tag.comment, sourceFile);
        const note = summarizeDeprecationNote(rawNote);
        for (const subject of subjects) {
          const authoredMigration =
            deprecationMigrationStrategyOverride(subject);
          const valueMapCases = deprecationValueMapOverride(subject);
          const subjectKind =
            subject.symbol_space === "type" &&
            (kind === "component" || kind === "other")
              ? "type"
              : kind;
          const typeOnlyRuntimeDeclaration =
            subject.symbol_space === "type" &&
            (ts.isClassDeclaration(node) ||
              ts.isEnumDeclaration(node) ||
              Boolean(owner && ts.isClassDeclaration(owner)));
          const publicSubjectName = apiSymbolDisplayName(subject);
          const replacementTargets = jsDocLinkTargets(tag, sourceFile).map(
            (linkTarget) =>
              resolveReplacementTarget(
                subject,
                linkTarget,
                node,
                sourceFile,
                checker,
                program,
                repoRoot,
                entrypoints,
              ),
          );
          for (const replacementTarget of replacementTargets) {
            if (canonicalJson(replacementTarget) === canonicalJson(subject)) {
              throw new Error(
                `Deprecation subject '${apiSymbolDisplayName(subject)}' cannot replace itself.`,
              );
            }
          }
          if (replacementTargets.length === 0 && !authoredMigration) {
            throw new Error(
              `Deprecation '${apiSymbolDisplayName(subject)}' must declare typed replacement links or an MCP-owned no-target migration override.`,
            );
          }
          if (replacementTargets.length > 0 && authoredMigration) {
            throw new Error(
              `Deprecation '${apiSymbolDisplayName(subject)}' cannot combine replacement links with a no-target migration override.`,
            );
          }
          if (replacementTargets.length === 0 && valueMapCases.length > 0) {
            throw new Error(
              `Deprecation '${apiSymbolDisplayName(subject)}' cannot use a value-map override without replacement links.`,
            );
          }
          const valueMap = buildDeprecationValueMap(
            node,
            checker,
            valueMapCases,
            replacementTargets,
          );
          if (replacementTargets.length > 1 && !valueMap) {
            throw new Error(
              `Composite deprecation '${apiSymbolDisplayName(subject)}' requires a complete MCP-owned value-map override.`,
            );
          }
          const replacementMode =
            replacementTargets.length === 0
              ? "none"
              : replacementTargets.length === 1
                ? "single"
                : "composite";
          const singleTarget = replacementTargets[0] ?? null;
          const directReplacement = replacementMode === "single" && !valueMap;
          const compatibilityReplacementName =
            directReplacement && singleTarget
              ? apiSymbolDisplayName(singleTarget)
              : null;
          const deprecatedIn =
            inferDeprecatedVersionFromNote(rawNote) ??
            changelogMetadata?.deprecatedBySymbol.get(
              toMatchKey(publicSubjectName),
            ) ??
            changelogMetadata?.deprecatedBySymbol.get(toMatchKey(symbolName)) ??
            null;
          const deprecation = {
            id: buildDeprecationId(subject),
            subject,
            package: packageName,
            component: typeOnlyRuntimeDeclaration
              ? null
              : subject.member_path.length > 0
                ? componentName
                : subject.export_name !== "default" &&
                    subjectKind === "component"
                  ? subject.export_name.replace(/Props$/, "")
                  : (componentName ??
                    (symbolName.endsWith("Props")
                      ? symbolName.replace(/Props$/, "")
                      : null)),
            kind: subjectKind,
            name: publicSubjectName,
            deprecated_in: deprecatedIn,
            removed_in: inferRemovedVersionFromNote(rawNote),
            replacement: {
              mode: replacementMode,
              target: replacementMode === "single" ? singleTarget : null,
              targets: replacementTargets,
              type: compatibilityReplacementName ? "symbol" : null,
              name: compatibilityReplacementName,
              notes: note || null,
            },
            migration: {
              strategy:
                replacementTargets.length === 0
                  ? (authoredMigration as NoTargetMigrationStrategy)
                  : valueMap
                    ? "transform"
                    : "replace",
              value_map: valueMap,
              details: compatibilityReplacementName
                ? [
                    {
                      from: publicSubjectName,
                      to: compatibilityReplacementName,
                    },
                  ]
                : [],
            },
            source_paths: [normalizedPath],
            source_occurrences: [
              sourceOccurrence(sourceFile, tag, normalizedPath),
            ],
            source_urls: [],
          } satisfies DeprecationRecord;
          const identityKey = deprecation.id;
          const current = deprecationsByIdentity.get(identityKey);
          deprecationsByIdentity.set(
            identityKey,
            current
              ? mergeDeprecationRecords(current, deprecation)
              : deprecation,
          );
        }
      }
    }

    ts.forEachChild(node, visit);
  };

  visit(sourceFile);
  return [...deprecationsByIdentity.values()];
}

function resolvePotentialRealPath(targetPath: string): string {
  let existingAncestor = path.resolve(targetPath);
  const missingSegments: string[] = [];
  while (true) {
    try {
      return path.join(
        fs.realpathSync.native(existingAncestor),
        ...missingSegments,
      );
    } catch (error) {
      const code =
        typeof error === "object" && error !== null
          ? (error as NodeJS.ErrnoException).code
          : undefined;
      if (code !== "ENOENT" && code !== "ENOTDIR") throw error;
      const parent = path.dirname(existingAncestor);
      if (parent === existingAncestor) return path.resolve(targetPath);
      missingSegments.unshift(path.basename(existingAncestor));
      existingAncestor = parent;
    }
  }
}

function pathIsWithin(rootPath: string, targetPath: string): boolean {
  const relativePath = path.relative(
    path.resolve(rootPath),
    path.resolve(targetPath),
  );
  return (
    relativePath === "" ||
    (relativePath !== ".." &&
      !relativePath.startsWith(`..${path.sep}`) &&
      !path.isAbsolute(relativePath))
  );
}

function pathsResolveToSameLocation(
  leftPath: string,
  rightPath: string,
): boolean {
  return path.relative(path.resolve(leftPath), path.resolve(rightPath)) === "";
}

type DeprecationCompilerPath =
  | { kind: "first_party"; trackedPath: string }
  | { kind: "external"; canonicalPath: string | null; realPath: string }
  | { kind: "blocked" };

export interface TrackedDeprecationCompilerHost {
  host: ts.CompilerHost;
  assertNoFatalRead(): void;
}

export function createTrackedDeprecationCompilerHost(
  repoRoot: string,
  compilerOptions: ts.CompilerOptions,
  virtualSources: ReadonlyMap<string, string> = new Map(),
): TrackedDeprecationCompilerHost {
  const lexicalRepoRoot = path.resolve(repoRoot);
  const virtualSourceKey = (fileName: string): string => {
    const resolvedPath = path.resolve(fileName);
    return process.platform === "win32"
      ? resolvedPath.toLowerCase()
      : resolvedPath;
  };
  const normalizedVirtualSources = new Map(
    [...virtualSources].map(([fileName, source]) => [
      virtualSourceKey(fileName),
      source,
    ]),
  );
  const virtualSource = (fileName: string): string | undefined =>
    normalizedVirtualSources.get(virtualSourceKey(fileName));
  const sealedDependencyInventory = isGeneratorDependencyInventoryActive();
  const realRepoRoot = sealedDependencyInventory
    ? lexicalRepoRoot
    : fs.realpathSync.native(lexicalRepoRoot);
  const lexicalNodeModulesRoot = path.join(lexicalRepoRoot, "node_modules");
  const realNodeModulesRoot = sealedDependencyInventory
    ? lexicalNodeModulesRoot
    : resolvePotentialRealPath(lexicalNodeModulesRoot);
  const compilerLibraryRoot = path.dirname(
    ts.getDefaultLibFilePath(compilerOptions),
  );
  const compilerHost = ts.createCompilerHost(compilerOptions, true);
  const originalReadFile = compilerHost.readFile.bind(compilerHost);
  const originalFileExists = compilerHost.fileExists.bind(compilerHost);
  const originalDirectoryExists =
    compilerHost.directoryExists?.bind(compilerHost);
  const originalRealpath = compilerHost.realpath?.bind(compilerHost);
  let fatalReadError: unknown = null;
  const latchFatalRead = (error: unknown): void => {
    fatalReadError ??= error;
  };
  const assertNoFatalRead = (): void => {
    if (!fatalReadError) return;
    const detail =
      fatalReadError instanceof Error
        ? fatalReadError.message
        : String(fatalReadError);
    throw new Error(`Tracked deprecation TypeScript read failed: ${detail}`, {
      cause: fatalReadError,
    });
  };
  const classifyPath = (targetPath: string): DeprecationCompilerPath => {
    const lexicalPath = path.resolve(targetPath);
    if (sealedDependencyInventory) {
      const workspacePath = generatorDependencyWorkspacePath(lexicalPath);
      if (workspacePath) {
        return {
          kind: "first_party",
          trackedPath: workspacePath,
        };
      }
      if (isGeneratorDependencyPath(lexicalPath)) {
        return {
          kind: "external",
          canonicalPath: lexicalPath,
          realPath: lexicalPath,
        };
      }
      const lexicalIsDependency = pathIsWithin(
        lexicalNodeModulesRoot,
        lexicalPath,
      );
      if (pathIsWithin(lexicalRepoRoot, lexicalPath) && !lexicalIsDependency) {
        return {
          kind: "first_party",
          trackedPath: lexicalPath,
        };
      }
      return lexicalIsDependency
        ? {
            kind: "external",
            canonicalPath: lexicalPath,
            realPath: lexicalPath,
          }
        : { kind: "blocked" };
    }
    const realPath = resolvePotentialRealPath(lexicalPath);
    const lexicalIsDependency = pathIsWithin(
      lexicalNodeModulesRoot,
      lexicalPath,
    );
    const realIsDependency = pathIsWithin(realNodeModulesRoot, realPath);
    const lexicalIsFirstParty =
      pathIsWithin(lexicalRepoRoot, lexicalPath) && !lexicalIsDependency;
    const realIsFirstParty =
      pathIsWithin(realRepoRoot, realPath) && !realIsDependency;

    if (lexicalIsFirstParty) {
      const lexicalRelativePath = path.relative(lexicalRepoRoot, lexicalPath);
      const expectedRealPath = path.resolve(realRepoRoot, lexicalRelativePath);
      if (
        !realIsFirstParty ||
        !pathsResolveToSameLocation(expectedRealPath, realPath)
      ) {
        throw new Error(
          `First-party TypeScript path resolves through a nested link or outside the repository: ${toPosixPath(
            lexicalRelativePath,
          )}.`,
        );
      }
      return {
        kind: "first_party",
        trackedPath: lexicalPath,
      };
    }
    if (realIsFirstParty) {
      if (!lexicalIsDependency && !pathIsWithin(realRepoRoot, lexicalPath)) {
        throw new Error(
          `TypeScript path reaches the repository through an unauthorized external link: ${lexicalPath}.`,
        );
      }
      return {
        kind: "first_party",
        trackedPath: path.resolve(
          lexicalRepoRoot,
          path.relative(realRepoRoot, realPath),
        ),
      };
    }
    const isCompilerLibrary =
      pathIsWithin(compilerLibraryRoot, lexicalPath) ||
      pathIsWithin(compilerLibraryRoot, realPath);
    if (isCompilerLibrary) {
      return {
        kind: "external",
        canonicalPath:
          lexicalIsDependency && realIsDependency ? lexicalPath : null,
        realPath,
      };
    }
    if (lexicalIsDependency) {
      if (!realIsDependency) {
        throw new Error(
          `TypeScript dependency path escapes the repository node_modules root through a link: ${toPosixPath(
            path.relative(lexicalNodeModulesRoot, lexicalPath),
          )}.`,
        );
      }
      return { kind: "external", canonicalPath: lexicalPath, realPath };
    }
    if (realIsDependency) {
      throw new Error(
        `TypeScript path reaches the dependency root without passing through the repository node_modules boundary: ${lexicalPath}.`,
      );
    }
    return { kind: "blocked" };
  };
  const guarded = <Value>(action: () => Value): Value => {
    try {
      return action();
    } catch (error) {
      latchFatalRead(error);
      throw error;
    }
  };
  const compilerPathIdentity = (
    classification: DeprecationCompilerPath,
  ): string => {
    if (classification.kind === "first_party") {
      return `first_party:${path.resolve(classification.trackedPath)}`;
    }
    if (classification.kind === "external") {
      return `external:${path.resolve(
        classification.canonicalPath ?? classification.realPath,
      )}:${path.resolve(classification.realPath)}`;
    }
    return "blocked";
  };
  const assertCompilerPathStable = (
    targetPath: string,
    initial: DeprecationCompilerPath,
  ): void => {
    const final = classifyPath(targetPath);
    if (compilerPathIdentity(initial) !== compilerPathIdentity(final)) {
      throw new Error(
        `TypeScript path topology changed during compiler access: ${targetPath}.`,
      );
    }
  };
  compilerHost.readFile = (fileName) => {
    const source = virtualSource(fileName);
    if (source !== undefined) return source;
    return guarded(() => {
      const classification = classifyPath(fileName);
      if (classification.kind === "first_party") {
        return (
          readCatalogInputFileSyncOrNull(classification.trackedPath, "utf8") ??
          undefined
        );
      }
      if (classification.kind === "external") {
        const result = isGeneratorDependencyInventoryActive()
          ? (readGeneratorDependencyFileSyncOrNull(
              classification.canonicalPath ?? classification.realPath,
            ) ?? undefined)
          : originalReadFile(fileName);
        assertCompilerPathStable(fileName, classification);
        return result;
      }
      throw new Error(
        `TypeScript attempted to read outside the tracked repository and dependency roots: ${fileName}.`,
      );
    });
  };
  compilerHost.fileExists = (fileName) => {
    if (virtualSource(fileName) !== undefined) return true;
    return guarded(() => {
      const classification = classifyPath(fileName);
      if (classification.kind === "first_party") {
        return (
          readCatalogInputFileSyncOrNull(classification.trackedPath, "utf8") !==
          null
        );
      }
      if (classification.kind === "external") {
        const result = isGeneratorDependencyInventoryActive()
          ? generatorDependencyFileExists(
              classification.canonicalPath ?? classification.realPath,
            )
          : originalFileExists(fileName);
        assertCompilerPathStable(fileName, classification);
        return result;
      }
      return false;
    });
  };
  compilerHost.directoryExists = (directoryName) => {
    return guarded(() => {
      const classification = classifyPath(directoryName);
      if (classification.kind === "first_party") return true;
      if (classification.kind === "external") {
        const result = isGeneratorDependencyInventoryActive()
          ? generatorDependencyDirectoryExists(
              classification.canonicalPath ?? classification.realPath,
            )
          : (originalDirectoryExists?.(directoryName) ?? false);
        assertCompilerPathStable(directoryName, classification);
        return result;
      }
      return false;
    });
  };
  compilerHost.getDirectories = (directoryName) => {
    return guarded(() => {
      classifyPath(directoryName);
      return [];
    });
  };
  compilerHost.readDirectory = (
    rootDir,
    extensions,
    excludes,
    includes,
    depth,
  ) => {
    return guarded(() => {
      void extensions;
      void excludes;
      void includes;
      void depth;
      classifyPath(rootDir);
      return [];
    });
  };
  compilerHost.getSourceFile = (
    fileName,
    languageVersionOrOptions,
    onError,
  ) => {
    const source = virtualSource(fileName);
    if (source !== undefined) {
      return ts.createSourceFile(
        fileName,
        source,
        languageVersionOrOptions,
        true,
        ts.ScriptKind.TS,
      );
    }
    try {
      const fileSource = compilerHost.readFile(fileName);
      const sourceFile =
        fileSource === undefined
          ? undefined
          : ts.createSourceFile(
              fileName,
              fileSource,
              languageVersionOrOptions,
              true,
              typescriptScriptKindForFileName(fileName),
            );
      assertNoFatalRead();
      return sourceFile;
    } catch (error) {
      onError?.(error instanceof Error ? error.message : String(error));
      assertNoFatalRead();
      throw error;
    }
  };
  compilerHost.getCurrentDirectory = () => lexicalRepoRoot;
  compilerHost.realpath = (targetPath) => {
    if (virtualSource(targetPath) !== undefined) {
      return path.resolve(targetPath);
    }
    const classification = guarded(() => classifyPath(targetPath));
    if (classification.kind === "first_party") {
      return classification.trackedPath;
    }
    if (classification.kind === "external") {
      const result = sealedDependencyInventory
        ? generatorDependencyRealpath(
            classification.canonicalPath ?? classification.realPath,
          )
        : (classification.canonicalPath ??
          originalRealpath?.(targetPath) ??
          classification.realPath);
      if (!result) {
        throw new Error(
          `TypeScript attempted to resolve an un-inventoried dependency path: ${targetPath}.`,
        );
      }
      assertCompilerPathStable(targetPath, classification);
      return result;
    }
    return path.resolve(targetPath);
  };
  return { host: compilerHost, assertNoFatalRead };
}

function formatTypeScriptDiagnostic(diagnostic: ts.Diagnostic): string {
  return ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n");
}

async function deprecationCompilerOptions(
  repoRoot: string,
  packages: readonly PackageRecord[],
): Promise<ts.CompilerOptions> {
  const configPath = path.join(repoRoot, "tsconfig.json");
  const configSource = await readFileOrNull(configPath);
  let configuredOptions: ts.CompilerOptions = {};
  if (configSource !== null) {
    const parsedConfig = ts.parseConfigFileTextToJson(configPath, configSource);
    if (parsedConfig.error) {
      throw new Error(
        `Cannot parse deprecation TypeScript config: ${formatTypeScriptDiagnostic(parsedConfig.error)}.`,
      );
    }
    const config = parsedConfig.config as {
      compilerOptions?: unknown;
      extends?: unknown;
    };
    if (config.extends !== undefined) {
      throw new Error(
        "Deprecation TypeScript config inheritance is not supported until every inherited config is included in the tracked catalog inventory.",
      );
    }
    const converted = ts.convertCompilerOptionsFromJson(
      config.compilerOptions ?? {},
      repoRoot,
      configPath,
    );
    if (converted.errors.length > 0) {
      throw new Error(
        `Cannot load deprecation TypeScript options: ${converted.errors
          .map(formatTypeScriptDiagnostic)
          .join("; ")}.`,
      );
    }
    configuredOptions = converted.options;
  }

  const workspacePaths: Record<string, string[]> = {};
  for (const pkg of [...packages].sort((left, right) =>
    compareOrdinalStrings(left.name, right.name),
  )) {
    for (const entrypoint of await publicEntrypointSources(
      repoRoot,
      pkg.name,
    )) {
      if (
        (await readFileOrNull(
          path.resolve(repoRoot, entrypoint.sourcePath),
        )) === null
      ) {
        continue;
      }
      const moduleSpecifier =
        entrypoint.name === "."
          ? pkg.name
          : `${pkg.name}${entrypoint.name.slice(1)}`;
      workspacePaths[moduleSpecifier] = [
        path.resolve(repoRoot, entrypoint.sourcePath),
      ];
    }
  }

  return {
    target: ts.ScriptTarget.Latest,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    jsx: ts.JsxEmit.ReactJSX,
    strict: true,
    skipLibCheck: true,
    ...configuredOptions,
    allowJs: configuredOptions.allowJs ?? true,
    paths: {
      ...configuredOptions.paths,
      ...workspacePaths,
    },
    types: [],
    noEmit: true,
    incremental: false,
    composite: false,
  };
}

async function createDeprecationTypeProgram(
  repoRoot: string,
  packages: readonly PackageRecord[],
  sourcePaths: readonly string[],
): Promise<ts.Program> {
  const compilerOptions = await deprecationCompilerOptions(repoRoot, packages);
  const declarationRoot = path.join(repoRoot, "declarations.d.ts");
  const rootNames = [...sourcePaths];
  if ((await readFileOrNull(declarationRoot)) !== null) {
    rootNames.push(declarationRoot);
  }
  const virtualGlobalsPath = path.join(
    repoRoot,
    "__salt_catalog_virtual__",
    "deprecation-globals.d.ts",
  );
  const virtualSources = new Map([
    [
      virtualGlobalsPath,
      [
        "declare const process: {",
        "  readonly env: { readonly NODE_ENV?: string };",
        "};",
        "declare const global: unknown;",
        "",
      ].join("\n"),
    ],
  ]);
  rootNames.push(virtualGlobalsPath);
  const trackedHost = createTrackedDeprecationCompilerHost(
    repoRoot,
    compilerOptions,
    virtualSources,
  );
  const program = ts.createProgram({
    rootNames: uniqueStrings(rootNames).sort(compareOrdinalStrings),
    options: compilerOptions,
    host: trackedHost.host,
  });
  trackedHost.assertNoFatalRead();
  const diagnostics = ts
    .getPreEmitDiagnostics(program)
    .filter((diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error)
    .sort((left, right) => {
      const leftFile = left.file?.fileName ?? "";
      const rightFile = right.file?.fileName ?? "";
      return (
        compareOrdinalStrings(leftFile, rightFile) ||
        (left.start ?? -1) - (right.start ?? -1) ||
        left.code - right.code ||
        compareOrdinalStrings(
          formatTypeScriptDiagnostic(left),
          formatTypeScriptDiagnostic(right),
        )
      );
    });
  trackedHost.assertNoFatalRead();
  if (diagnostics.length > 0) {
    throw new Error(
      `Deprecation TypeScript program has errors:\n${diagnostics
        .map((diagnostic) => {
          const location = diagnostic.file
            ? `${toPosixPath(
                path.relative(repoRoot, diagnostic.file.fileName),
              )}:${
                diagnostic.file.getLineAndCharacterOfPosition(
                  diagnostic.start ?? 0,
                ).line + 1
              }`
            : "compiler";
          return `${location} TS${diagnostic.code}: ${formatTypeScriptDiagnostic(
            diagnostic,
          )}`;
        })
        .join("\n")}`,
    );
  }
  return program;
}

function programSourceFile(
  program: ts.Program,
  sourcePath: string,
): ts.SourceFile | null {
  const direct = program.getSourceFile(path.resolve(sourcePath));
  if (direct) return direct;
  const expected = path.resolve(sourcePath).toLowerCase();
  return (
    program
      .getSourceFiles()
      .find(
        (sourceFile) =>
          path.resolve(sourceFile.fileName).toLowerCase() === expected,
      ) ?? null
  );
}

function sourceScriptKind(sourcePath: string): ts.ScriptKind {
  if (sourcePath.endsWith(".tsx")) return ts.ScriptKind.TSX;
  if (sourcePath.endsWith(".jsx")) return ts.ScriptKind.JSX;
  if (
    sourcePath.endsWith(".js") ||
    sourcePath.endsWith(".mjs") ||
    sourcePath.endsWith(".cjs")
  ) {
    return ts.ScriptKind.JS;
  }
  return ts.ScriptKind.TS;
}

function sourceHasDeprecatedJsDoc(sourcePath: string, source: string): boolean {
  const sourceFile = ts.createSourceFile(
    sourcePath,
    source,
    ts.ScriptTarget.Latest,
    true,
    sourceScriptKind(sourcePath),
  );
  let found = false;
  const visit = (node: ts.Node): void => {
    if (found) return;
    if (
      ts
        .getJSDocTags(node)
        .some((tag) => tag.tagName.getText(sourceFile) === "deprecated")
    ) {
      found = true;
      return;
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return found;
}

function publicDeclarationPaths(
  entrypoints: readonly PublicApiEntrypoint[],
): ReadonlySet<string> {
  const paths = new Set<string>();
  for (const entrypoint of entrypoints) {
    for (const modulePath of entrypoint.graph.modulePaths) {
      paths.add(modulePath);
    }
    for (const origins of [
      ...entrypoint.graph.valueExportOrigins.values(),
      ...entrypoint.graph.typeExportOrigins.values(),
    ]) {
      for (const origin of origins) paths.add(origin.repoPath);
    }
  }
  return paths;
}

export async function extractDeprecations(
  repoRoot: string,
  packages: PackageRecord[],
  excludedPackageNames: ReadonlySet<string>,
): Promise<DeprecationRecord[]> {
  const changelogMetadataByPackage = await loadPackageChangelogDeprecations(
    repoRoot,
    packages,
  );
  for (const pkg of [...packages]
    .filter((candidate) => !excludedPackageNames.has(candidate.name))
    .sort((left, right) => compareOrdinalStrings(left.name, right.name))) {
    await publicEntrypointSources(repoRoot, pkg.name);
  }
  const sourcePaths = (
    await globCatalogInputs(
      "packages/{ag-grid-theme,core,countries,date-adapters,date-components,embla-carousel,highcharts-theme,icons,lab,react-resizable-panels-theme,styles,theme,window}/src/**/*.{ts,tsx,mts,cts,js,jsx,mjs,cjs}",
      {
        cwd: repoRoot,
        absolute: true,
        followSymbolicLinks: false,
        onlyFiles: true,
        ignore: [...NON_PRODUCTION_IMPLEMENTATION_GLOB_IGNORES],
      },
    )
  ).sort(compareOrdinalStrings);

  const includedPackageNames = new Set(
    packages
      .map((pkg) => pkg.name)
      .filter((name) => !excludedPackageNames.has(name)),
  );
  const authoredCandidates: Array<{
    sourcePath: string;
    normalizedPath: string;
    packageName: string;
  }> = [];
  for (const sourcePath of sourcePaths) {
    const source = await readFileOrNull(sourcePath);
    if (!source || !source.includes("@deprecated")) continue;
    const normalizedPath = toPosixPath(path.relative(repoRoot, sourcePath));
    const packageSlug = normalizedPath.split("/")[1];
    const packageName = `@salt-ds/${packageSlug}`;
    if (
      includedPackageNames.has(packageName) &&
      sourceHasDeprecatedJsDoc(sourcePath, source)
    ) {
      authoredCandidates.push({ sourcePath, normalizedPath, packageName });
    }
  }
  if (authoredCandidates.length === 0) return [];

  const entrypointsByPackage = new Map<
    string,
    Promise<PublicApiEntrypoint[]>
  >();
  const publicPathsByPackage = new Map<string, ReadonlySet<string>>();
  for (const packageName of uniqueStrings(
    authoredCandidates.map((candidate) => candidate.packageName),
  ).sort(compareOrdinalStrings)) {
    const entrypointsPromise = buildPublicApiEntrypoints(repoRoot, packageName);
    entrypointsByPackage.set(packageName, entrypointsPromise);
    publicPathsByPackage.set(
      packageName,
      publicDeclarationPaths(await entrypointsPromise),
    );
  }
  const candidates = authoredCandidates.filter((candidate) =>
    publicPathsByPackage
      .get(candidate.packageName)
      ?.has(candidate.normalizedPath),
  );

  const publicEntrypointSourcePaths = (
    await Promise.all(entrypointsByPackage.values())
  )
    .flatMap((entrypoints) =>
      entrypoints.map((entrypoint) =>
        path.resolve(repoRoot, entrypoint.graph.entrypoint),
      ),
    )
    .sort(compareOrdinalStrings);
  const program = await createDeprecationTypeProgram(
    repoRoot,
    packages.filter((pkg) => !excludedPackageNames.has(pkg.name)),
    [
      ...candidates.map((candidate) => candidate.sourcePath),
      ...publicEntrypointSourcePaths,
    ],
  );
  if (candidates.length === 0) return [];

  const checker = program.getTypeChecker();
  const deprecationsById = new Map<string, DeprecationRecord>();
  for (const { sourcePath, normalizedPath, packageName } of candidates) {
    let entrypointsPromise = entrypointsByPackage.get(packageName);
    if (!entrypointsPromise) {
      entrypointsPromise = buildPublicApiEntrypoints(repoRoot, packageName);
      entrypointsByPackage.set(packageName, entrypointsPromise);
    }
    const entrypoints = await entrypointsPromise;
    const sourceFile = programSourceFile(program, sourcePath);
    if (!sourceFile) {
      throw new Error(
        `Deprecation TypeScript program did not load '${normalizedPath}'.`,
      );
    }

    for (const deprecation of collectDeprecationsFromSourceFile(
      sourceFile,
      checker,
      program,
      repoRoot,
      packageName,
      normalizedPath,
      entrypoints,
      changelogMetadataByPackage.get(packageName),
    )) {
      const previous = deprecationsById.get(deprecation.id);
      deprecationsById.set(
        deprecation.id,
        previous ? mergeDeprecationRecords(previous, deprecation) : deprecation,
      );
    }
  }

  return [...deprecationsById.values()].sort((left, right) =>
    compareOrdinalStrings(left.id, right.id),
  );
}
