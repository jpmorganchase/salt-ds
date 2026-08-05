import fs from "node:fs";
import path from "node:path";
import ts from "typescript";
import { isPortableRepositoryPath } from "../catalog/catalogPortablePath.js";
import { compareOrdinalStrings } from "../catalog/catalogSerialization.js";
import { toPosixPath } from "../registry/paths.js";
import { readFileOrNull } from "./buildRegistryShared.js";

interface NamedReexport {
  exportedName: string;
  importedName: string;
  targetPath: string;
}

interface ImportedBinding {
  importedName: string;
  moduleSpecifier: string;
}

interface DirectBindingOrigin {
  declarationName: string | null;
  declarationKey: string | null;
}

interface ParsedModule {
  repoPath: string;
  directValueExports: Set<string>;
  directTypeExports: Set<string>;
  directValueBindings: Map<string, DirectBindingOrigin>;
  directTypeBindings: Map<string, DirectBindingOrigin>;
  namedReexports: NamedReexport[];
  namedTypeReexports: NamedReexport[];
  starReexports: string[];
  starTypeReexports: string[];
  explicitValueExportNames: Set<string>;
  explicitTypeExportNames: Set<string>;
}

const SUPPORTED_PACKAGE_MODULE_PATH =
  /(?:\.d\.(?:ts|mts|cts)|\.(?:ts|tsx|mts|cts|js|jsx|mjs|cjs))$/u;

export interface PackageExportOrigin {
  repoPath: string;
  declarationName: string | null;
  declarationKey: string | null;
}

export interface PackageExportSite {
  repoPath: string;
  exportName: string;
}

export interface PackageValueExportGraph {
  packageName: string;
  entrypoint: string;
  modulePaths: readonly string[];
  valueExports: ReadonlyMap<string, readonly string[]>;
  typeExports: ReadonlyMap<string, readonly string[]>;
  valueExportOrigins: ReadonlyMap<string, readonly PackageExportOrigin[]>;
  typeExportOrigins: ReadonlyMap<string, readonly PackageExportOrigin[]>;
  valueExportSites: ReadonlyMap<string, readonly PackageExportSite[]>;
  typeExportSites: ReadonlyMap<string, readonly PackageExportSite[]>;
}

function hasModifier(node: ts.Node, modifierKind: ts.SyntaxKind): boolean {
  return Boolean(
    ts.canHaveModifiers(node) &&
      ts.getModifiers(node)?.some((modifier) => modifier.kind === modifierKind),
  );
}

function bindingNames(name: ts.BindingName): string[] {
  if (ts.isIdentifier(name)) return [name.text];
  return name.elements.flatMap((element) =>
    ts.isOmittedExpression(element) ? [] : bindingNames(element.name),
  );
}

function declarationNames(statement: ts.Statement): string[] {
  if (
    ts.isFunctionDeclaration(statement) ||
    ts.isClassDeclaration(statement) ||
    ts.isInterfaceDeclaration(statement) ||
    ts.isTypeAliasDeclaration(statement) ||
    ts.isEnumDeclaration(statement) ||
    ts.isModuleDeclaration(statement)
  ) {
    return statement.name && ts.isIdentifier(statement.name)
      ? [statement.name.text]
      : [];
  }
  if (ts.isVariableStatement(statement)) {
    return statement.declarationList.declarations.flatMap((declaration) =>
      bindingNames(declaration.name),
    );
  }
  return [];
}

function isTypeOnlyDeclaration(statement: ts.Statement): boolean {
  return (
    ts.isInterfaceDeclaration(statement) ||
    ts.isTypeAliasDeclaration(statement) ||
    (ts.isEnumDeclaration(statement) &&
      hasModifier(statement, ts.SyntaxKind.ConstKeyword))
  );
}

function moduleDeclarationHasValue(declaration: ts.ModuleDeclaration): boolean {
  const body = declaration.body;
  if (!body) return true;
  if (ts.isModuleDeclaration(body)) {
    return moduleDeclarationHasValue(body);
  }
  if (!ts.isModuleBlock(body)) return true;
  return body.statements.some((statement) => {
    if (
      ts.isInterfaceDeclaration(statement) ||
      ts.isTypeAliasDeclaration(statement) ||
      (ts.isEnumDeclaration(statement) &&
        hasModifier(statement, ts.SyntaxKind.ConstKeyword)) ||
      ts.isImportDeclaration(statement)
    ) {
      return false;
    }
    if (ts.isImportEqualsDeclaration(statement)) {
      return hasModifier(statement, ts.SyntaxKind.ExportKeyword);
    }
    if (ts.isModuleDeclaration(statement)) {
      return moduleDeclarationHasValue(statement);
    }
    if (ts.isExportDeclaration(statement)) {
      return !statement.isTypeOnly;
    }
    return true;
  });
}

export function declarationSymbolSpaces(statement: ts.Statement): {
  value: boolean;
  type: boolean;
} {
  if (isTypeOnlyDeclaration(statement)) {
    return { value: false, type: true };
  }
  if (ts.isModuleDeclaration(statement)) {
    return {
      value: moduleDeclarationHasValue(statement),
      type: true,
    };
  }
  if (ts.isClassDeclaration(statement) || ts.isEnumDeclaration(statement)) {
    return { value: true, type: true };
  }
  return { value: true, type: false };
}

export function packageExportDeclarationKey(
  sourceFile: ts.SourceFile,
  declarationName: string,
  space: "value" | "type",
): string {
  const dualBinding = sourceFile.statements.some(
    (statement) =>
      declarationSymbolSpaces(statement).value &&
      declarationSymbolSpaces(statement).type &&
      declarationNames(statement).includes(declarationName),
  );
  return `${dualBinding ? "dual" : space}:${declarationName}`;
}

function addOrigin(
  exports: Map<string, Set<string>>,
  exportName: string,
  origin: string,
): boolean {
  const origins = exports.get(exportName);
  if (origins) {
    const previousSize = origins.size;
    origins.add(origin);
    return origins.size !== previousSize;
  }
  exports.set(exportName, new Set([origin]));
  return true;
}

function encodeExportOrigin(
  repoPath: string,
  declarationName: string | null,
  declarationKey: string | null,
): string {
  return JSON.stringify([repoPath, declarationName, declarationKey]);
}

function decodeExportOrigin(origin: string): PackageExportOrigin {
  const [repoPath, declarationName, declarationKey] = JSON.parse(origin) as [
    string,
    string | null,
    string | null,
  ];
  return { repoPath, declarationName, declarationKey };
}

function compareExportOrigins(
  left: PackageExportOrigin,
  right: PackageExportOrigin,
): number {
  return (
    compareOrdinalStrings(left.repoPath, right.repoPath) ||
    compareOrdinalStrings(
      left.declarationName ?? "",
      right.declarationName ?? "",
    ) ||
    compareOrdinalStrings(left.declarationKey ?? "", right.declarationKey ?? "")
  );
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

function assertRealRepositoryPath(
  repoRoot: string,
  candidatePath: string,
  context: string,
): void {
  const lexicalRepoRoot = path.resolve(repoRoot);
  const lexicalCandidate = path.resolve(candidatePath);
  const realRepoRoot = fs.realpathSync.native(lexicalRepoRoot);
  const realCandidate = fs.realpathSync.native(lexicalCandidate);
  const lexicalRelativePath = toPosixPath(
    path.relative(lexicalRepoRoot, lexicalCandidate),
  );
  const realRelativePath = toPosixPath(
    path.relative(realRepoRoot, realCandidate),
  );
  const expectedRealCandidate = path.resolve(
    realRepoRoot,
    path.relative(lexicalRepoRoot, lexicalCandidate),
  );
  if (
    !isPortableRepositoryPath(lexicalRelativePath) ||
    !pathIsWithin(realRepoRoot, realCandidate) ||
    path.relative(expectedRealCandidate, realCandidate) !== "" ||
    lexicalRelativePath !== realRelativePath
  ) {
    throw new Error(
      `Catalog export graph path escapes the repository or resolves through a nested link: ${context}.`,
    );
  }
}

function isRelativeModuleSpecifier(specifier: string): boolean {
  return /^(?:\.{1,2})(?:$|[\\/])/u.test(specifier);
}

function assertPortableRelativeModuleSpecifier(
  specifier: string,
  importerPath: string,
): void {
  if (!isRelativeModuleSpecifier(specifier)) {
    throw new Error(
      `Catalog export graph cannot follow non-relative re-export '${specifier}' from '${importerPath}'.`,
    );
  }
  const normalized = path.posix.normalize(specifier);
  const canonical =
    normalized === "." || normalized === ".." || normalized.startsWith("../")
      ? normalized
      : `./${normalized}`;
  if (specifier.includes("\\") || canonical !== specifier) {
    throw new Error(
      `Catalog export graph requires a canonical portable relative module specifier, received '${specifier}' from '${importerPath}'.`,
    );
  }
}

async function resolveModulePath(
  repoRoot: string,
  packageSourceRoot: string,
  importerPath: string,
  specifier: string,
): Promise<string> {
  assertPortableRelativeModuleSpecifier(specifier, importerPath);
  const importerDirectory = path.dirname(path.join(repoRoot, importerPath));
  const unresolved = path.resolve(importerDirectory, specifier);
  const extension = path.extname(unresolved);
  const candidates =
    extension === ".js"
      ? [
          `${unresolved.slice(0, -extension.length)}.ts`,
          `${unresolved.slice(0, -extension.length)}.tsx`,
          `${unresolved.slice(0, -extension.length)}.d.ts`,
          unresolved,
        ]
      : extension === ".mjs"
        ? [
            `${unresolved.slice(0, -extension.length)}.mts`,
            `${unresolved.slice(0, -extension.length)}.d.mts`,
            unresolved,
          ]
        : extension === ".cjs"
          ? [
              `${unresolved.slice(0, -extension.length)}.cts`,
              `${unresolved.slice(0, -extension.length)}.d.cts`,
              unresolved,
            ]
          : extension === ".jsx"
            ? [
                `${unresolved.slice(0, -extension.length)}.tsx`,
                `${unresolved.slice(0, -extension.length)}.d.ts`,
                unresolved,
              ]
            : extension
              ? [unresolved]
              : [
                  `${unresolved}.ts`,
                  `${unresolved}.tsx`,
                  `${unresolved}.d.ts`,
                  `${unresolved}.mts`,
                  `${unresolved}.d.mts`,
                  `${unresolved}.cts`,
                  `${unresolved}.d.cts`,
                  `${unresolved}.js`,
                  `${unresolved}.jsx`,
                  path.join(unresolved, "index.ts"),
                  path.join(unresolved, "index.tsx"),
                  path.join(unresolved, "index.d.ts"),
                  path.join(unresolved, "index.mts"),
                  path.join(unresolved, "index.d.mts"),
                  path.join(unresolved, "index.cts"),
                  path.join(unresolved, "index.d.cts"),
                  path.join(unresolved, "index.js"),
                  path.join(unresolved, "index.jsx"),
                ];
  for (const candidate of candidates) {
    if (!SUPPORTED_PACKAGE_MODULE_PATH.test(toPosixPath(candidate))) {
      continue;
    }
    const relative = path.relative(repoRoot, candidate);
    if (relative.startsWith("..") || path.isAbsolute(relative)) {
      throw new Error(
        `Catalog export graph path escapes the repository: ${specifier} from ${importerPath}.`,
      );
    }
    const repoPath = toPosixPath(relative);
    if (!repoPath.startsWith(`${packageSourceRoot}/`)) {
      throw new Error(
        `Catalog export graph path escapes package source root '${packageSourceRoot}': ${specifier} from ${importerPath}.`,
      );
    }
    try {
      assertRealRepositoryPath(
        repoRoot,
        candidate,
        `${specifier} from ${importerPath}`,
      );
    } catch (error) {
      const code =
        typeof error === "object" && error !== null
          ? (error as NodeJS.ErrnoException).code
          : undefined;
      if (code === "ENOENT" || code === "ENOTDIR") continue;
      throw error;
    }
    if ((await readFileOrNull(candidate)) !== null) {
      assertRealRepositoryPath(
        repoRoot,
        candidate,
        `${specifier} from ${importerPath}`,
      );
      return repoPath;
    }
  }
  throw new Error(
    `Catalog export graph cannot resolve '${specifier}' from '${importerPath}'.`,
  );
}

async function parseModule(
  repoRoot: string,
  packageSourceRoot: string,
  repoPath: string,
): Promise<ParsedModule> {
  if (!repoPath.startsWith(`${packageSourceRoot}/`)) {
    throw new Error(
      `Catalog export graph module escapes package source root '${packageSourceRoot}': ${repoPath}.`,
    );
  }
  if (!SUPPORTED_PACKAGE_MODULE_PATH.test(repoPath)) {
    throw new Error(
      `Catalog export graph module has an unsupported source extension: ${repoPath}.`,
    );
  }
  const absolutePath = path.join(repoRoot, repoPath);
  try {
    assertRealRepositoryPath(repoRoot, absolutePath, repoPath);
  } catch (error) {
    const code =
      typeof error === "object" && error !== null
        ? (error as NodeJS.ErrnoException).code
        : undefined;
    if (code !== "ENOENT" && code !== "ENOTDIR") throw error;
  }
  const content = await readFileOrNull(absolutePath);
  if (content === null) {
    throw new Error(`Catalog export graph source is missing: ${repoPath}.`);
  }
  assertRealRepositoryPath(repoRoot, absolutePath, repoPath);
  const sourceFile = ts.createSourceFile(
    repoPath,
    content,
    ts.ScriptTarget.Latest,
    true,
    repoPath.endsWith(".tsx")
      ? ts.ScriptKind.TSX
      : repoPath.endsWith(".jsx")
        ? ts.ScriptKind.JSX
        : repoPath.endsWith(".js")
          ? ts.ScriptKind.JS
          : ts.ScriptKind.TS,
  );
  const parseDiagnostics =
    (
      sourceFile as ts.SourceFile & {
        parseDiagnostics?: readonly ts.Diagnostic[];
      }
    ).parseDiagnostics ?? [];
  if (parseDiagnostics.length > 0) {
    const diagnostics = [...parseDiagnostics].sort(
      (left, right) =>
        (left.start ?? -1) - (right.start ?? -1) ||
        left.code - right.code ||
        compareOrdinalStrings(
          ts.flattenDiagnosticMessageText(left.messageText, "\n"),
          ts.flattenDiagnosticMessageText(right.messageText, "\n"),
        ),
    );
    throw new Error(
      `Catalog export graph cannot parse '${repoPath}': ${diagnostics
        .map((diagnostic) => {
          const location = sourceFile.getLineAndCharacterOfPosition(
            diagnostic.start ?? 0,
          );
          return `${location.line + 1}:${location.character + 1} TS${
            diagnostic.code
          } ${ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n")}`;
        })
        .join("; ")}.`,
    );
  }
  const directValueExports = new Set<string>();
  const directTypeExports = new Set<string>();
  const directValueBindings = new Map<string, DirectBindingOrigin>();
  const directTypeBindings = new Map<string, DirectBindingOrigin>();
  const namedReexports: NamedReexport[] = [];
  const namedTypeReexports: NamedReexport[] = [];
  const starReexports: string[] = [];
  const starTypeReexports: string[] = [];
  const importedBindings = new Map<string, ImportedBinding>();
  const importedTypeBindings = new Map<string, ImportedBinding>();
  const unsupportedImportEqualsBindings = new Set<string>();
  const localValueBindings = new Set<string>();
  const localTypeOnlyBindings = new Set<string>();
  const localValueBindingOrigins = new Map<string, DirectBindingOrigin>();
  const localTypeBindingOrigins = new Map<string, DirectBindingOrigin>();
  const registerDirectBinding = (
    space: "value" | "type",
    exportName: string,
    origin: DirectBindingOrigin,
  ): void => {
    const bindings =
      space === "value" ? directValueBindings : directTypeBindings;
    if (
      bindings.has(exportName) &&
      JSON.stringify(bindings.get(exportName)) !== JSON.stringify(origin)
    ) {
      throw new Error(
        `Catalog export graph found conflicting direct ${space} export '${exportName}' in '${repoPath}'.`,
      );
    }
    bindings.set(exportName, origin);
    (space === "value" ? directValueExports : directTypeExports).add(
      exportName,
    );
  };

  for (const statement of sourceFile.statements) {
    if (ts.isImportEqualsDeclaration(statement)) {
      unsupportedImportEqualsBindings.add(statement.name.text);
    }
    const spaces = declarationSymbolSpaces(statement);
    for (const name of declarationNames(statement)) {
      if (spaces.type) {
        localTypeOnlyBindings.add(name);
        localTypeBindingOrigins.set(name, {
          declarationName: name,
          declarationKey: packageExportDeclarationKey(sourceFile, name, "type"),
        });
      }
      if (spaces.value) {
        localValueBindings.add(name);
        localValueBindingOrigins.set(name, {
          declarationName: name,
          declarationKey: packageExportDeclarationKey(
            sourceFile,
            name,
            "value",
          ),
        });
      }
    }
  }

  for (const statement of sourceFile.statements) {
    if (
      !ts.isImportDeclaration(statement) ||
      !statement.importClause ||
      !ts.isStringLiteral(statement.moduleSpecifier)
    ) {
      continue;
    }
    const moduleSpecifier = statement.moduleSpecifier.text;
    const registerBinding = (
      localName: string,
      importedName: string,
      typeOnly: boolean,
    ): void => {
      const binding = {
        importedName,
        moduleSpecifier,
      };
      importedTypeBindings.set(localName, binding);
      if (!typeOnly) {
        importedBindings.set(localName, binding);
      }
    };
    const clauseTypeOnly = statement.importClause.isTypeOnly;
    if (statement.importClause.name) {
      registerBinding(
        statement.importClause.name.text,
        "default",
        clauseTypeOnly,
      );
    }
    const bindings = statement.importClause.namedBindings;
    if (bindings && ts.isNamespaceImport(bindings)) {
      registerBinding(bindings.name.text, "*", clauseTypeOnly);
    } else if (bindings) {
      for (const element of bindings.elements) {
        registerBinding(
          element.name.text,
          element.propertyName?.text ?? element.name.text,
          clauseTypeOnly || element.isTypeOnly,
        );
      }
    }
  }

  const resolveImportedBindingTarget = async (
    binding: ImportedBinding,
    exportedName: string,
  ): Promise<string> => {
    if (!isRelativeModuleSpecifier(binding.moduleSpecifier)) {
      throw new Error(
        `Catalog export graph cannot follow non-relative re-export '${binding.moduleSpecifier}' for '${exportedName}' from '${repoPath}'.`,
      );
    }
    return resolveModulePath(
      repoRoot,
      packageSourceRoot,
      repoPath,
      binding.moduleSpecifier,
    );
  };

  for (const statement of sourceFile.statements) {
    if (ts.isImportDeclaration(statement)) continue;
    if (
      ts.isImportEqualsDeclaration(statement) &&
      hasModifier(statement, ts.SyntaxKind.ExportKeyword)
    ) {
      throw new Error(
        `Catalog export graph cannot represent exported import-equals binding '${statement.name.text}' in '${repoPath}'.`,
      );
    }
    if (ts.isExportAssignment(statement)) {
      if (statement.isExportEquals) {
        throw new Error(
          `Catalog export graph cannot represent export-equals assignments in '${repoPath}'.`,
        );
      }
      if (!statement.isExportEquals) {
        if (ts.isIdentifier(statement.expression)) {
          const localName = statement.expression.text;
          if (unsupportedImportEqualsBindings.has(localName)) {
            throw new Error(
              `Catalog export graph cannot represent re-exported import-equals binding '${localName}' in '${repoPath}'.`,
            );
          }
          const importedValue = importedBindings.get(localName);
          if (importedValue) {
            namedReexports.push({
              exportedName: "default",
              importedName: importedValue.importedName,
              targetPath: await resolveImportedBindingTarget(
                importedValue,
                "default",
              ),
            });
          } else if (localValueBindings.has(localName)) {
            registerDirectBinding(
              "value",
              "default",
              localValueBindingOrigins.get(localName) as DirectBindingOrigin,
            );
          } else {
            registerDirectBinding("value", "default", {
              declarationName: null,
              declarationKey: `value:default@${statement.pos}`,
            });
          }

          const importedType = importedTypeBindings.get(localName);
          if (importedType) {
            namedTypeReexports.push({
              exportedName: "default",
              importedName: importedType.importedName,
              targetPath: await resolveImportedBindingTarget(
                importedType,
                "default",
              ),
            });
          } else if (localTypeOnlyBindings.has(localName)) {
            registerDirectBinding(
              "type",
              "default",
              localTypeBindingOrigins.get(localName) as DirectBindingOrigin,
            );
          }
        } else {
          registerDirectBinding("value", "default", {
            declarationName: null,
            declarationKey: `value:default@${statement.pos}`,
          });
        }
      }
      continue;
    }
    if (ts.isExportDeclaration(statement)) {
      const moduleSpecifier =
        statement.moduleSpecifier &&
        ts.isStringLiteral(statement.moduleSpecifier)
          ? statement.moduleSpecifier.text
          : null;
      if (!statement.exportClause) {
        if (moduleSpecifier) {
          const targetPath = await resolveModulePath(
            repoRoot,
            packageSourceRoot,
            repoPath,
            moduleSpecifier,
          );
          starTypeReexports.push(targetPath);
          if (!statement.isTypeOnly) {
            starReexports.push(targetPath);
          }
        }
        continue;
      }
      if (ts.isNamespaceExport(statement.exportClause)) {
        if (!moduleSpecifier) {
          throw new Error(
            `Catalog export graph found a namespace export without a module in '${repoPath}'.`,
          );
        }
        const reexport = {
          exportedName: statement.exportClause.name.text,
          importedName: "*",
          targetPath: await resolveModulePath(
            repoRoot,
            packageSourceRoot,
            repoPath,
            moduleSpecifier,
          ),
        };
        namedTypeReexports.push(reexport);
        if (!statement.isTypeOnly) {
          namedReexports.push(reexport);
        }
        continue;
      }
      for (const element of statement.exportClause.elements) {
        const exportedName = element.name.text;
        const importedName = element.propertyName?.text ?? exportedName;
        const typeOnly = statement.isTypeOnly || element.isTypeOnly;
        if (moduleSpecifier) {
          const reexport = {
            exportedName,
            importedName,
            targetPath: await resolveModulePath(
              repoRoot,
              packageSourceRoot,
              repoPath,
              moduleSpecifier,
            ),
          };
          namedTypeReexports.push(reexport);
          if (!typeOnly) {
            namedReexports.push(reexport);
          }
        } else {
          if (unsupportedImportEqualsBindings.has(importedName)) {
            throw new Error(
              `Catalog export graph cannot represent re-exported import-equals binding '${importedName}' in '${repoPath}'.`,
            );
          }
          const importedBinding = importedBindings.get(importedName);
          if (!typeOnly && importedBinding) {
            namedReexports.push({
              exportedName,
              importedName: importedBinding.importedName,
              targetPath: await resolveImportedBindingTarget(
                importedBinding,
                exportedName,
              ),
            });
          } else if (!typeOnly && localValueBindings.has(importedName)) {
            registerDirectBinding(
              "value",
              exportedName,
              localValueBindingOrigins.get(importedName) as DirectBindingOrigin,
            );
          }
          const importedTypeBinding = importedTypeBindings.get(importedName);
          if (importedTypeBinding) {
            namedTypeReexports.push({
              exportedName,
              importedName: importedTypeBinding.importedName,
              targetPath: await resolveImportedBindingTarget(
                importedTypeBinding,
                exportedName,
              ),
            });
          } else if (localTypeOnlyBindings.has(importedName)) {
            registerDirectBinding(
              "type",
              exportedName,
              localTypeBindingOrigins.get(importedName) as DirectBindingOrigin,
            );
          }
        }
      }
      continue;
    }
    if (hasModifier(statement, ts.SyntaxKind.ExportKeyword)) {
      const names = declarationNames(statement);
      const spaces = declarationSymbolSpaces(statement);
      if (hasModifier(statement, ts.SyntaxKind.DefaultKeyword)) {
        const declarationName = names[0] ?? null;
        const anonymousKey = `${
          spaces.value && spaces.type ? "dual" : spaces.type ? "type" : "value"
        }:default@${statement.pos}`;
        if (spaces.value) {
          registerDirectBinding(
            "value",
            "default",
            declarationName
              ? (localValueBindingOrigins.get(
                  declarationName,
                ) as DirectBindingOrigin)
              : {
                  declarationName: null,
                  declarationKey: anonymousKey,
                },
          );
        }
        if (spaces.type) {
          registerDirectBinding(
            "type",
            "default",
            declarationName
              ? (localTypeBindingOrigins.get(
                  declarationName,
                ) as DirectBindingOrigin)
              : {
                  declarationName: null,
                  declarationKey: anonymousKey,
                },
          );
        }
      } else {
        for (const name of names) {
          if (spaces.value) {
            registerDirectBinding(
              "value",
              name,
              localValueBindingOrigins.get(name) as DirectBindingOrigin,
            );
          }
          if (spaces.type) {
            registerDirectBinding(
              "type",
              name,
              localTypeBindingOrigins.get(name) as DirectBindingOrigin,
            );
          }
        }
      }
    }
  }

  return {
    repoPath,
    directValueExports,
    directTypeExports,
    directValueBindings,
    directTypeBindings,
    namedReexports,
    namedTypeReexports,
    starReexports,
    starTypeReexports,
    explicitValueExportNames: new Set([
      ...directValueExports,
      ...namedReexports.map((reexport) => reexport.exportedName),
    ]),
    explicitTypeExportNames: new Set([
      ...directTypeExports,
      ...namedTypeReexports.map((reexport) => reexport.exportedName),
    ]),
  };
}

function packageDirectoryName(packageName: string): string {
  const match = packageName.match(/^@salt-ds\/([^/]+)$/u);
  if (!match) {
    throw new Error(
      `Catalog export graph only supports @salt-ds packages: ${packageName}.`,
    );
  }
  return match[1];
}

function resolveExportSpace(
  modules: ReadonlyMap<string, ParsedModule>,
  packageName: string,
  space: "value" | "type",
): Map<string, Map<string, Set<string>>> {
  const exportsByModule = new Map<string, Map<string, Set<string>>>();
  for (const module of modules.values()) {
    const exports = new Map<string, Set<string>>();
    const directExports =
      space === "value" ? module.directValueExports : module.directTypeExports;
    const directBindings =
      space === "value"
        ? module.directValueBindings
        : module.directTypeBindings;
    for (const exportName of directExports) {
      addOrigin(
        exports,
        exportName,
        encodeExportOrigin(
          module.repoPath,
          directBindings.get(exportName)?.declarationName ??
            (exportName === "default" ? null : exportName),
          directBindings.get(exportName)?.declarationKey ?? null,
        ),
      );
    }
    exportsByModule.set(module.repoPath, exports);
  }

  let changed = true;
  let pass = 0;
  const maximumPasses = Math.max(1, modules.size * 2);
  while (changed && pass < maximumPasses) {
    changed = false;
    pass += 1;
    for (const module of modules.values()) {
      const current = exportsByModule.get(module.repoPath) as Map<
        string,
        Set<string>
      >;
      const starReexports =
        space === "value" ? module.starReexports : module.starTypeReexports;
      const namedReexports =
        space === "value" ? module.namedReexports : module.namedTypeReexports;
      const explicitExportNames =
        space === "value"
          ? module.explicitValueExportNames
          : module.explicitTypeExportNames;
      for (const targetPath of starReexports) {
        for (const [name, origins] of exportsByModule.get(targetPath) ?? []) {
          if (name === "default" || explicitExportNames.has(name)) {
            continue;
          }
          for (const origin of origins) {
            changed = addOrigin(current, name, origin) || changed;
          }
        }
      }
      for (const reexport of namedReexports) {
        const origins =
          reexport.importedName === "*"
            ? new Set([
                encodeExportOrigin(
                  reexport.targetPath,
                  null,
                  `namespace:${reexport.targetPath}`,
                ),
              ])
            : exportsByModule
                .get(reexport.targetPath)
                ?.get(reexport.importedName);
        for (const origin of origins ?? []) {
          changed =
            addOrigin(current, reexport.exportedName, origin) || changed;
        }
      }
    }
  }
  if (changed) {
    throw new Error(
      `Catalog ${space} export graph for '${packageName}' did not converge.`,
    );
  }
  return exportsByModule;
}

function collectPublicExportSites(
  modules: ReadonlyMap<string, ParsedModule>,
  exportsByModule: ReadonlyMap<string, Map<string, Set<string>>>,
  entrypoint: string,
  space: "value" | "type",
): ReadonlyMap<string, readonly PackageExportSite[]> {
  const entryExports = exportsByModule.get(entrypoint);
  if (!entryExports) return new Map();
  const sitesByPublicName = new Map<string, readonly PackageExportSite[]>();

  for (const [publicName, publicOrigins] of entryExports) {
    const sites = new Map<string, PackageExportSite>();
    const visited = new Set<string>();
    const visit = (
      modulePath: string,
      exportName: string,
      requiredOrigins: ReadonlySet<string>,
    ): void => {
      const visitKey = `${modulePath}\0${exportName}\0${[...requiredOrigins]
        .sort(compareOrdinalStrings)
        .join("\0")}`;
      if (visited.has(visitKey)) return;
      visited.add(visitKey);
      const module = modules.get(modulePath);
      if (!module) return;
      const directExports =
        space === "value"
          ? module.directValueExports
          : module.directTypeExports;
      const directBindings =
        space === "value"
          ? module.directValueBindings
          : module.directTypeBindings;
      if (directExports.has(exportName)) {
        const directOrigin = encodeExportOrigin(
          modulePath,
          directBindings.get(exportName)?.declarationName ??
            (exportName === "default" ? null : exportName),
          directBindings.get(exportName)?.declarationKey ?? null,
        );
        if (requiredOrigins.has(directOrigin)) {
          sites.set(`${modulePath}\0${exportName}`, {
            repoPath: modulePath,
            exportName,
          });
        }
      }

      const namedReexports =
        space === "value" ? module.namedReexports : module.namedTypeReexports;
      for (const reexport of namedReexports) {
        if (reexport.exportedName !== exportName) continue;
        const targetOrigins =
          reexport.importedName === "*"
            ? new Set([
                encodeExportOrigin(
                  reexport.targetPath,
                  null,
                  `namespace:${reexport.targetPath}`,
                ),
              ])
            : exportsByModule
                .get(reexport.targetPath)
                ?.get(reexport.importedName);
        const contributingOrigins = new Set(
          [...(targetOrigins ?? [])].filter((origin) =>
            requiredOrigins.has(origin),
          ),
        );
        if (contributingOrigins.size === 0) continue;
        sites.set(`${modulePath}\0${exportName}`, {
          repoPath: modulePath,
          exportName,
        });
        if (reexport.importedName !== "*") {
          visit(
            reexport.targetPath,
            reexport.importedName,
            contributingOrigins,
          );
        }
      }

      const explicitExportNames =
        space === "value"
          ? module.explicitValueExportNames
          : module.explicitTypeExportNames;
      if (exportName === "default" || explicitExportNames.has(exportName)) {
        return;
      }
      const starReexports =
        space === "value" ? module.starReexports : module.starTypeReexports;
      for (const targetPath of starReexports) {
        const targetOrigins = exportsByModule.get(targetPath)?.get(exportName);
        const contributingOrigins = new Set(
          [...(targetOrigins ?? [])].filter((origin) =>
            requiredOrigins.has(origin),
          ),
        );
        if (contributingOrigins.size === 0) continue;
        sites.set(`${modulePath}\0${exportName}`, {
          repoPath: modulePath,
          exportName,
        });
        visit(targetPath, exportName, contributingOrigins);
      }
    };

    visit(entrypoint, publicName, publicOrigins);
    sitesByPublicName.set(
      publicName,
      [...sites.values()].sort(
        (left, right) =>
          compareOrdinalStrings(left.repoPath, right.repoPath) ||
          compareOrdinalStrings(left.exportName, right.exportName),
      ),
    );
  }

  return new Map(
    [...sitesByPublicName.entries()].sort(([left], [right]) =>
      compareOrdinalStrings(left, right),
    ),
  );
}

export interface PackageExportGraphOptions {
  entrypoint?: string;
}

function packageEntrypoint(packageName: string, entrypoint: string): string {
  const packageSourceRoot = `packages/${packageDirectoryName(packageName)}/src`;
  if (
    !isPortableRepositoryPath(entrypoint) ||
    !entrypoint.startsWith(`${packageSourceRoot}/`) ||
    !SUPPORTED_PACKAGE_MODULE_PATH.test(entrypoint)
  ) {
    throw new Error(
      `Catalog export graph entrypoint must be a canonical portable path beneath '${packageSourceRoot}': ${entrypoint}.`,
    );
  }
  return entrypoint;
}

export async function buildPackageValueExportGraph(
  repoRoot: string,
  packageName: string,
  options: PackageExportGraphOptions = {},
): Promise<PackageValueExportGraph> {
  const packageSourceRoot = `packages/${packageDirectoryName(packageName)}/src`;
  const entrypoint = packageEntrypoint(
    packageName,
    options.entrypoint ??
      `packages/${packageDirectoryName(packageName)}/src/index.ts`,
  );
  const modules = new Map<string, ParsedModule>();
  const queue = [entrypoint];
  while (queue.length > 0) {
    const repoPath = queue.shift() as string;
    if (modules.has(repoPath)) continue;
    const parsed = await parseModule(repoRoot, packageSourceRoot, repoPath);
    modules.set(repoPath, parsed);
    for (const dependency of [
      ...parsed.starReexports,
      ...parsed.starTypeReexports,
      ...parsed.namedReexports.map((reexport) => reexport.targetPath),
      ...parsed.namedTypeReexports.map((reexport) => reexport.targetPath),
    ]) {
      if (!modules.has(dependency)) queue.push(dependency);
    }
  }

  const valueExportsByModule = resolveExportSpace(
    modules,
    packageName,
    "value",
  );
  const typeExportsByModule = resolveExportSpace(modules, packageName, "type");

  const entryValueExports = valueExportsByModule.get(entrypoint);
  const entryTypeExports = typeExportsByModule.get(entrypoint);
  if (!entryValueExports || !entryTypeExports) {
    throw new Error(`Catalog export graph has no entrypoint '${entrypoint}'.`);
  }
  return {
    packageName,
    entrypoint,
    modulePaths: [...modules.keys()].sort(compareOrdinalStrings),
    valueExportOrigins: new Map(
      [...entryValueExports.entries()]
        .map(
          ([name, origins]) =>
            [
              name,
              [...origins].map(decodeExportOrigin).sort(compareExportOrigins),
            ] as const,
        )
        .sort(([left], [right]) => compareOrdinalStrings(left, right)),
    ),
    typeExportOrigins: new Map(
      [...entryTypeExports.entries()]
        .map(
          ([name, origins]) =>
            [
              name,
              [...origins].map(decodeExportOrigin).sort(compareExportOrigins),
            ] as const,
        )
        .sort(([left], [right]) => compareOrdinalStrings(left, right)),
    ),
    valueExportSites: collectPublicExportSites(
      modules,
      valueExportsByModule,
      entrypoint,
      "value",
    ),
    typeExportSites: collectPublicExportSites(
      modules,
      typeExportsByModule,
      entrypoint,
      "type",
    ),
    valueExports: new Map(
      [...entryValueExports.entries()]
        .map(
          ([name, origins]) =>
            [
              name,
              [
                ...new Set(
                  [...origins].map(
                    (origin) => decodeExportOrigin(origin).repoPath,
                  ),
                ),
              ].sort(compareOrdinalStrings),
            ] as const,
        )
        .sort(([left], [right]) => compareOrdinalStrings(left, right)),
    ),
    typeExports: new Map(
      [...entryTypeExports.entries()]
        .map(
          ([name, origins]) =>
            [
              name,
              [
                ...new Set(
                  [...origins].map(
                    (origin) => decodeExportOrigin(origin).repoPath,
                  ),
                ),
              ].sort(compareOrdinalStrings),
            ] as const,
        )
        .sort(([left], [right]) => compareOrdinalStrings(left, right)),
    ),
  };
}

export function resolveUniquePackageValueExport(
  graph: PackageValueExportGraph,
  exportName: string,
): string {
  const origins = graph.valueExportOrigins.get(exportName) ?? [];
  if (origins.length === 0) {
    throw new Error(
      `Public value export '${exportName}' is missing from ${graph.packageName} (${graph.entrypoint}).`,
    );
  }
  if (origins.length > 1) {
    throw new Error(
      `Public value export '${exportName}' is ambiguous in ${graph.packageName}: ${origins
        .map(
          (origin) =>
            `${origin.repoPath}#${origin.declarationName ?? "(anonymous)"}`,
        )
        .join(", ")}.`,
    );
  }
  return origins[0].repoPath;
}

export function resolveUniquePackageTypeExport(
  graph: PackageValueExportGraph,
  exportName: string,
): string {
  const origins = graph.typeExportOrigins.get(exportName) ?? [];
  if (origins.length === 0) {
    throw new Error(
      `Public type export '${exportName}' is missing from ${graph.packageName} (${graph.entrypoint}).`,
    );
  }
  if (origins.length > 1) {
    throw new Error(
      `Public type export '${exportName}' is ambiguous in ${graph.packageName}: ${origins
        .map(
          (origin) =>
            `${origin.repoPath}#${origin.declarationName ?? "(anonymous)"}`,
        )
        .join(", ")}.`,
    );
  }
  return origins[0].repoPath;
}

export function assertUniquePackageValueExportOrigin(
  graph: PackageValueExportGraph,
  exportName: string,
  expectedRepoPath: string,
): string {
  const actualRepoPath = resolveUniquePackageValueExport(graph, exportName);
  if (actualRepoPath !== expectedRepoPath) {
    throw new Error(
      `Public value export '${exportName}' in ${graph.packageName} has origin '${actualRepoPath}', expected '${expectedRepoPath}'.`,
    );
  }
  return actualRepoPath;
}
