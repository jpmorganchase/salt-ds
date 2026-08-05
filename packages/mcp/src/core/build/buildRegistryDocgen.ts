import path from "node:path";
import * as docgen from "react-docgen-typescript";
import * as ts from "typescript";
import { isPortableRepositoryPath } from "../catalog/catalogPortablePath.js";
import { compareOrdinalStrings } from "../catalog/catalogSerialization.js";
import { toPosixPath } from "../registry/paths.js";
import type {
  ComponentDocgenInference,
  ComponentProp,
  ComponentPropSubject,
  ComponentSubComponent,
} from "../types.js";
import {
  asString,
  cleanMarkdownText,
  toMatchKey,
  toPascalCase,
  uniqueStrings,
} from "./buildRegistryShared.js";
import type { PackageValueExportGraph } from "./catalogExportGraph.js";
import { readCatalogInputFileSyncOrNull } from "./catalogInputInventory.js";
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

export const DOCGEN_PACKAGES = [
  { directory: "lab", packageName: "@salt-ds/lab" },
  { directory: "core", packageName: "@salt-ds/core" },
  {
    directory: "date-components",
    packageName: "@salt-ds/date-components",
  },
  { directory: "icons", packageName: "@salt-ds/icons" },
  { directory: "countries", packageName: "@salt-ds/countries" },
  {
    directory: "embla-carousel",
    packageName: "@salt-ds/embla-carousel",
  },
] as const;

const DOCGEN_COMPILER_OPTIONS: ts.CompilerOptions = {
  jsx: ts.JsxEmit.React,
  module: ts.ModuleKind.CommonJS,
  target: ts.ScriptTarget.Latest,
  esModuleInterop: true,
  types: [],
};

const DOCGEN_PARSER_OPTIONS: docgen.ParserOptions = {
  propFilter: (prop) =>
    !/@types[\\/]react[\\/]/u.test(prop.parent?.fileName ?? ""),
  shouldExtractLiteralValuesFromEnum: true,
  shouldRemoveUndefinedFromOptional: true,
};

type DocgenTypeValue =
  | string
  | number
  | boolean
  | null
  | {
      value?: unknown;
      computed?: boolean;
    };

interface DocgenTypeShape {
  name?: unknown;
  value?: unknown;
}

interface DocgenPropShape {
  declarations?: unknown;
  defaultValue?: unknown;
  description?: unknown;
  parent?: unknown;
  required?: unknown;
  type?: DocgenTypeShape;
}

interface DocgenPropDeclarationShape {
  fileName: string;
  name: string;
}

interface DocgenComponentShape {
  displayName?: unknown;
  props?: unknown;
}

export interface PropMetadata {
  byPackage: Map<string, Map<string, DocgenComponentShape[]>>;
}

export interface DocgenSelection {
  candidate: DocgenComponentShape | null;
  inference: ComponentDocgenInference;
}

export type UnresolvedComponentSubComponent = Omit<
  ComponentSubComponent,
  "repo_path"
>;

function isFirstPartyRepoPath(repoRoot: string, targetPath: string): boolean {
  const relativePath = path.relative(repoRoot, targetPath);
  return (
    relativePath.length > 0 &&
    !relativePath.startsWith("..") &&
    !path.isAbsolute(relativePath) &&
    !relativePath.split(path.sep).includes("node_modules")
  );
}

export function createTrackedDocgenCompilerHost(
  repoRoot: string,
): ts.CompilerHost {
  const compilerHost = ts.createCompilerHost(DOCGEN_COMPILER_OPTIONS);
  const originalReadFile = compilerHost.readFile.bind(compilerHost);
  const originalFileExists = compilerHost.fileExists.bind(compilerHost);
  const originalDirectoryExists =
    compilerHost.directoryExists?.bind(compilerHost);
  const originalRealpath = compilerHost.realpath?.bind(compilerHost);

  const firstPartyPath = (targetPath: string): string | null => {
    const resolvedPath = path.resolve(targetPath);
    if (isGeneratorDependencyInventoryActive()) {
      const workspacePath = generatorDependencyWorkspacePath(resolvedPath);
      if (workspacePath) return workspacePath;
      if (isGeneratorDependencyPath(resolvedPath)) return null;
    }
    return isFirstPartyRepoPath(repoRoot, resolvedPath) ? resolvedPath : null;
  };

  compilerHost.readFile = (fileName) => {
    const trackedPath = firstPartyPath(fileName);
    if (!trackedPath) {
      return isGeneratorDependencyInventoryActive()
        ? (readGeneratorDependencyFileSyncOrNull(fileName) ?? undefined)
        : originalReadFile(fileName);
    }
    return readCatalogInputFileSyncOrNull(trackedPath, "utf8") ?? undefined;
  };
  compilerHost.fileExists = (fileName) => {
    const trackedPath = firstPartyPath(fileName);
    if (!trackedPath) {
      return isGeneratorDependencyInventoryActive()
        ? generatorDependencyFileExists(fileName)
        : originalFileExists(fileName);
    }
    return readCatalogInputFileSyncOrNull(trackedPath, "utf8") !== null;
  };
  compilerHost.directoryExists = (directoryName) => {
    const trackedPath = firstPartyPath(directoryName);
    if (trackedPath) {
      // Directory existence does not affect resolution independently of the
      // tracked candidate files. Returning true forces resolution through
      // fileExists/readFile, where declared inputs are verified fail-closed.
      return true;
    }
    return isGeneratorDependencyInventoryActive()
      ? generatorDependencyDirectoryExists(directoryName)
      : (originalDirectoryExists?.(directoryName) ?? false);
  };
  compilerHost.realpath = (targetPath) => {
    const trackedPath = firstPartyPath(targetPath);
    if (trackedPath) return trackedPath;
    if (isGeneratorDependencyInventoryActive()) {
      const dependencyRealpath = generatorDependencyRealpath(targetPath);
      if (!dependencyRealpath) {
        throw new Error(
          `TypeScript attempted to resolve an un-inventoried dependency path: ${targetPath}.`,
        );
      }
      return dependencyRealpath;
    }
    return originalRealpath?.(targetPath) ?? targetPath;
  };
  compilerHost.getDirectories = (directoryName) => {
    if (isGeneratorDependencyInventoryActive()) {
      void directoryName;
      return [];
    }
    return ts.sys.getDirectories(directoryName);
  };
  compilerHost.readDirectory = (
    rootDir,
    extensions,
    excludes,
    includes,
    depth,
  ) => {
    if (isGeneratorDependencyInventoryActive()) {
      void rootDir;
      void extensions;
      void excludes;
      void includes;
      void depth;
      return [];
    }
    return ts.sys.readDirectory(rootDir, extensions, excludes, includes, depth);
  };
  compilerHost.getSourceFile = (
    fileName,
    languageVersionOrOptions,
    onError,
  ) => {
    try {
      const source = compilerHost.readFile(fileName);
      return source === undefined
        ? undefined
        : ts.createSourceFile(
            fileName,
            source,
            languageVersionOrOptions,
            true,
            typescriptScriptKindForFileName(fileName),
          );
    } catch (error) {
      onError?.(error instanceof Error ? error.message : String(error));
      throw error;
    }
  };

  return compilerHost;
}

function createTrackedDocgenProgram(
  repoRoot: string,
  entryPath: string,
): ts.Program {
  return ts.createProgram(
    [entryPath],
    DOCGEN_COMPILER_OPTIONS,
    createTrackedDocgenCompilerHost(repoRoot),
  );
}

function publicValueExportNames(
  program: ts.Program,
  entryPath: string,
): ReadonlySet<string> {
  const sourceFile = program.getSourceFile(entryPath);
  if (!sourceFile) {
    throw new Error(`Docgen entrypoint was not loaded: ${entryPath}.`);
  }
  const checker = program.getTypeChecker();
  const moduleSymbol = checker.getSymbolAtLocation(sourceFile);
  if (!moduleSymbol) {
    throw new Error(`Docgen entrypoint has no module symbol: ${entryPath}.`);
  }

  const names = new Set<string>();
  for (const exportedSymbol of checker.getExportsOfModule(moduleSymbol)) {
    let targetSymbol = exportedSymbol;
    if ((exportedSymbol.flags & ts.SymbolFlags.Alias) !== 0) {
      targetSymbol = checker.getAliasedSymbol(exportedSymbol);
    }
    if (
      ((exportedSymbol.flags | targetSymbol.flags) & ts.SymbolFlags.Value) ===
      0
    ) {
      continue;
    }
    names.add(exportedSymbol.getName());
    names.add(targetSymbol.getName());
  }
  return names;
}

function parseDocgenDefaultValue(value: unknown): string | null {
  if (value == null) {
    return null;
  }
  if (typeof value === "string") {
    return value.trim();
  }
  if (
    typeof value === "object" &&
    "value" in (value as Record<string, unknown>)
  ) {
    const inner = (value as Record<string, unknown>).value;
    return typeof inner === "string" ? inner.trim() : null;
  }
  return null;
}

function parsePrimitiveValue(raw: string): string | number | boolean | null {
  const value = raw.trim();
  if (value === "null" || value === "undefined") {
    return null;
  }
  if (value === "true") {
    return true;
  }
  if (value === "false") {
    return false;
  }
  if (/^-?\d+(\.\d+)?$/.test(value)) {
    return Number(value);
  }
  return value;
}

function parseAllowedValuesFromType(
  typeShape: DocgenTypeShape | undefined,
): Array<string | number | boolean> {
  if (!typeShape) {
    return [];
  }

  const typeName = asString(typeShape.name);
  const typeValue = typeShape.value as DocgenTypeValue[] | string | undefined;
  const allowedValues: Array<string | number | boolean> = [];

  if (Array.isArray(typeValue)) {
    for (const candidate of typeValue) {
      if (typeof candidate === "string") {
        const cleaned = candidate.trim().replace(/^['"`]|['"`]$/g, "");
        if (cleaned.length > 0) {
          allowedValues.push(
            parsePrimitiveValue(cleaned) as string | number | boolean,
          );
        }
        continue;
      }

      if (
        typeof candidate === "object" &&
        candidate !== null &&
        "value" in candidate
      ) {
        const raw = (candidate as { value?: unknown }).value;
        if (typeof raw === "string") {
          const cleaned = raw.trim().replace(/^['"`]|['"`]$/g, "");
          if (cleaned.length > 0) {
            const parsed = parsePrimitiveValue(cleaned);
            if (parsed !== null) {
              allowedValues.push(parsed as string | number | boolean);
            }
          }
        }
      }
    }
  }

  if (allowedValues.length > 0) {
    return uniqueStrings(allowedValues.map((value) => String(value))).map(
      (value) => parsePrimitiveValue(value) as string | number | boolean,
    );
  }

  if (!typeName || !typeName.includes("|")) {
    return [];
  }

  const unionParts = typeName.split("|").map((part) => part.trim());
  for (const part of unionParts) {
    const quoteMatch = part.match(/^['"`](.*)['"`]$/);
    if (quoteMatch) {
      allowedValues.push(quoteMatch[1]);
      continue;
    }
    if (part === "true" || part === "false") {
      allowedValues.push(part === "true");
      continue;
    }
    if (/^-?\d+(\.\d+)?$/.test(part)) {
      allowedValues.push(Number(part));
    }
  }

  return allowedValues;
}

function parseDocgenType(typeShape: DocgenTypeShape | undefined): string {
  const typeName = asString(typeShape?.name);
  if (!typeName) {
    return "unknown";
  }

  // When shouldExtractLiteralValuesFromEnum is enabled, react-docgen-typescript
  // sets type.name to "enum" and puts individual values in type.value[].
  // Reconstruct a readable union string from those values.
  if (typeName === "enum" && Array.isArray(typeShape?.value)) {
    const values = (typeShape.value as DocgenTypeValue[])
      .map((v) => {
        if (typeof v === "string") return v;
        if (typeof v === "object" && v !== null && "value" in v) {
          return String((v as { value?: unknown }).value ?? "");
        }
        return "";
      })
      .filter((v) => v.length > 0 && v !== "undefined");
    if (values.length > 0) {
      return values.join(" | ");
    }
  }

  return typeName.replace(/\s+/g, " ").trim();
}

function parseDeprecationNote(description: string): string | null {
  const markerIndex = description.toLowerCase().indexOf("@deprecated");
  if (markerIndex === -1) {
    return null;
  }

  const trailing = description.slice(markerIndex + "@deprecated".length).trim();
  if (!trailing) {
    return "Deprecated.";
  }

  return cleanMarkdownText(trailing.split(/\r?\n/)[0] ?? trailing);
}

export function toComponentProps(docgenProps: unknown): ComponentProp[] {
  if (!docgenProps || typeof docgenProps !== "object") {
    return [];
  }

  const entries = Object.entries(
    docgenProps as Record<string, DocgenPropShape>,
  );
  return entries
    .map(([propName, propValue]) => {
      const description = cleanMarkdownText(
        asString(propValue.description) ?? "",
      );
      const deprecationNote = parseDeprecationNote(description);
      const sanitizedDescription =
        deprecationNote == null
          ? description
          : cleanMarkdownText(
              description.replace(/@deprecated[\s\S]*$/i, "").trim(),
            ) || "Deprecated.";
      const allowedValues = parseAllowedValuesFromType(propValue.type);

      const parsedProp: ComponentProp = {
        name: propName,
        type: parseDocgenType(propValue.type),
        required: Boolean(propValue.required),
        description: sanitizedDescription || "No description provided.",
        deprecated: deprecationNote != null,
      };

      const defaultValue = parseDocgenDefaultValue(propValue.defaultValue);
      if (defaultValue !== null) {
        parsedProp.default = defaultValue;
      }
      if (allowedValues.length > 0) {
        parsedProp.allowed_values = allowedValues;
      }
      if (deprecationNote) {
        parsedProp.deprecation_note = deprecationNote;
      }

      return parsedProp;
    })
    .filter((prop) => prop.name.trim().length > 0)
    .sort((left, right) => compareOrdinalStrings(left.name, right.name));
}

function docgenPropDeclaration(
  value: unknown,
): DocgenPropDeclarationShape | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const record = value as Record<string, unknown>;
  const fileName = asString(record.fileName);
  const name = asString(record.name);
  return fileName && name ? { fileName, name } : null;
}

function docgenDeclarationRepoPath(
  repoRoot: string,
  fileName: string,
): string | null {
  const absoluteRepoRoot = path.resolve(repoRoot);
  const normalizedFileName = toPosixPath(fileName);
  const repoDirectoryPrefix = `${path.basename(absoluteRepoRoot)}/`;
  const absoluteFileName = path.isAbsolute(fileName)
    ? path.resolve(fileName)
    : normalizedFileName.startsWith(repoDirectoryPrefix)
      ? path.resolve(path.dirname(absoluteRepoRoot), fileName)
      : path.resolve(absoluteRepoRoot, fileName);
  const repoPath = toPosixPath(
    path.relative(absoluteRepoRoot, absoluteFileName),
  );
  return isPortableRepositoryPath(repoPath) ? repoPath : null;
}

function staticTypePropertyName(node: ts.PropertyName): string | null {
  if (ts.isIdentifier(node) || ts.isStringLiteral(node)) return node.text;
  if (ts.isNumericLiteral(node)) return node.text;
  return null;
}

const typeLiteralOwnerDeclarationCache = new Map<
  string,
  ReadonlyMap<string, readonly DocgenPropDeclarationShape[]>
>();

function typeLiteralPublicOwnerDeclarations(
  repoRoot: string,
  repoPath: string,
  propName: string,
): DocgenPropDeclarationShape[] {
  const absolutePath = path.join(repoRoot, ...repoPath.split("/"));
  const cached = typeLiteralOwnerDeclarationCache.get(absolutePath);
  if (cached) return [...(cached.get(propName) ?? [])];
  const sourceText = readCatalogInputFileSyncOrNull(absolutePath, "utf8");
  if (sourceText === null) {
    typeLiteralOwnerDeclarationCache.set(absolutePath, new Map());
    return [];
  }
  const sourceFile = ts.createSourceFile(
    absolutePath,
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    typescriptScriptKindForFileName(absolutePath),
  );
  const ownerNamesByProperty = new Map<string, Set<string>>();
  const visit = (node: ts.Node): void => {
    const propertyName = ts.isPropertySignature(node)
      ? staticTypePropertyName(node.name)
      : null;
    if (
      ts.isPropertySignature(node) &&
      ts.isTypeLiteralNode(node.parent) &&
      propertyName !== null
    ) {
      for (
        let owner: ts.Node | undefined = node.parent.parent;
        owner;
        owner = owner.parent
      ) {
        if (
          (ts.isTypeAliasDeclaration(owner) ||
            ts.isInterfaceDeclaration(owner) ||
            ts.isClassDeclaration(owner)) &&
          owner.name
        ) {
          const owners = ownerNamesByProperty.get(propertyName) ?? new Set();
          owners.add(owner.name.text);
          ownerNamesByProperty.set(propertyName, owners);
          break;
        }
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  const index = new Map(
    [...ownerNamesByProperty].map(([property, ownerNames]) => [
      property,
      [...ownerNames]
        .sort(compareOrdinalStrings)
        .map((name) => ({ fileName: absolutePath, name })),
    ]),
  );
  typeLiteralOwnerDeclarationCache.set(absolutePath, index);
  return [...(index.get(propName) ?? [])];
}

function sameExportOrigin(
  origin: { repoPath: string; declarationName: string | null },
  repoPath: string,
  declarationName: string,
): boolean {
  return (
    origin.repoPath === repoPath && origin.declarationName === declarationName
  );
}

function compareApiSymbolIdentities(
  left: ComponentPropSubject,
  right: ComponentPropSubject,
): number {
  return (
    compareOrdinalStrings(left.package, right.package) ||
    compareOrdinalStrings(left.entrypoint, right.entrypoint) ||
    compareOrdinalStrings(left.export_name, right.export_name) ||
    compareOrdinalStrings(left.symbol_space, right.symbol_space) ||
    compareOrdinalStrings(
      left.member_path[0]?.name ?? "",
      right.member_path[0]?.name ?? "",
    )
  );
}

export function toComponentPropSubjects(
  docgenProps: unknown,
  repoRoot: string,
  graph: PackageValueExportGraph,
  publicEntrypoint: string,
): ComponentPropSubject[] {
  if (!docgenProps || typeof docgenProps !== "object") return [];
  const subjects = new Map<string, ComponentPropSubject>();
  const publicTypeOriginRepoPaths = new Set(
    [...graph.typeExportOrigins.values()].flatMap((origins) =>
      origins.map((origin) => origin.repoPath),
    ),
  );

  for (const [propName, rawProp] of Object.entries(
    docgenProps as Record<string, unknown>,
  )) {
    if (!rawProp || typeof rawProp !== "object" || Array.isArray(rawProp)) {
      continue;
    }
    const prop = rawProp as DocgenPropShape;
    const rawDeclarations = [
      ...(Array.isArray(prop.declarations) ? prop.declarations : []),
      prop.parent,
    ]
      .map(docgenPropDeclaration)
      .filter(
        (declaration): declaration is DocgenPropDeclarationShape =>
          declaration !== null,
      );
    const declarations = rawDeclarations.flatMap((declaration) => {
      if (declaration.name !== "TypeLiteral") return [declaration];
      const repoPath = docgenDeclarationRepoPath(
        repoRoot,
        declaration.fileName,
      );
      return repoPath && publicTypeOriginRepoPaths.has(repoPath)
        ? typeLiteralPublicOwnerDeclarations(repoRoot, repoPath, propName)
        : [];
    });
    const publicOriginKeys = new Set<string>();
    for (const declaration of declarations) {
      const repoPath = docgenDeclarationRepoPath(
        repoRoot,
        declaration.fileName,
      );
      if (!repoPath) continue;
      for (const typeOrigins of graph.typeExportOrigins.values()) {
        if (
          typeOrigins.some((origin) =>
            sameExportOrigin(origin, repoPath, declaration.name),
          )
        ) {
          publicOriginKeys.add(`${repoPath}\0${declaration.name}`);
        }
      }
    }
    if (
      rawDeclarations.some(
        (declaration) => declaration.name === "TypeLiteral",
      ) &&
      publicOriginKeys.size !== 1
    ) {
      continue;
    }

    for (const declaration of declarations) {
      const repoPath = docgenDeclarationRepoPath(
        repoRoot,
        declaration.fileName,
      );
      if (!repoPath) continue;
      for (const [exportName, typeOrigins] of graph.typeExportOrigins) {
        if (
          !typeOrigins.some((origin) =>
            sameExportOrigin(origin, repoPath, declaration.name),
          )
        ) {
          continue;
        }
        const hasMatchingValueOrigin = (
          graph.valueExportOrigins.get(exportName) ?? []
        ).some((origin) =>
          sameExportOrigin(origin, repoPath, declaration.name),
        );
        const subject: ComponentPropSubject = {
          package: graph.packageName,
          entrypoint: publicEntrypoint,
          export_name: exportName,
          symbol_space: hasMatchingValueOrigin ? "type_and_value" : "type",
          member_path: [{ kind: "prop", name: propName }],
        };
        subjects.set(JSON.stringify(subject), subject);
      }
    }
  }

  return [...subjects.values()].sort(compareApiSymbolIdentities);
}

export async function loadPropMetadata(
  repoRoot: string,
): Promise<PropMetadata> {
  const byPackage = new Map<string, Map<string, DocgenComponentShape[]>>();
  const parser = docgen.withCompilerOptions(
    DOCGEN_COMPILER_OPTIONS,
    DOCGEN_PARSER_OPTIONS,
  );

  for (const { directory, packageName } of DOCGEN_PACKAGES) {
    const entryPath = path.join(
      repoRoot,
      "packages",
      directory,
      "src",
      "index.ts",
    );
    const program = createTrackedDocgenProgram(repoRoot, entryPath);
    const valueExportNames = publicValueExportNames(program, entryPath);
    const parsed = parser
      .parseWithProgramProvider(entryPath, () => program)
      .filter((entry) => valueExportNames.has(entry.displayName));
    if (parsed.length === 0) {
      throw new Error(
        `Docgen produced no component metadata for ${packageName} (${entryPath}).`,
      );
    }
    const packageEntries = byPackage.get(packageName) ?? new Map();
    for (const entry of parsed) {
      const docgen = entry as DocgenComponentShape;
      const displayName = asString(docgen.displayName);
      if (!displayName || displayName.startsWith("use")) {
        continue;
      }

      const key = toMatchKey(displayName);
      const current = packageEntries.get(key) ?? [];
      current.push(docgen);
      packageEntries.set(key, current);
    }

    byPackage.set(packageName, packageEntries);
  }

  return { byPackage };
}

export function selectDocgenComponent(
  propMetadata: PropMetadata,
  packageName: string,
  componentName: string,
  aliases: string[],
  routeSuffix: string,
  sourceRepoPath: string | null,
  declaredPrimaryExport: string | null,
): DocgenSelection {
  const packageEntries = propMetadata.byPackage.get(packageName);
  if (!packageEntries) {
    return {
      candidate: null,
      inference: {
        candidate_count: 0,
        candidate_display_names: [],
        selected_display_name: null,
        selected_score: null,
      },
    };
  }

  const routeLeaf = routeSuffix.split("/").at(-1) ?? routeSuffix;

  // Derive additional candidate names from the source repo path.
  // For example, if sourceRepoPath is "packages/lab/src/tabs-next",
  // the leaf "tabs-next" produces PascalCase "TabsNext" as a candidate.
  const sourcePathNames: string[] = [];
  if (sourceRepoPath) {
    const sourceLeaf = sourceRepoPath.replace(/\\/g, "/").split("/").at(-1);
    if (sourceLeaf) {
      sourcePathNames.push(toPascalCase(sourceLeaf));
    }
  }

  const candidateNames = uniqueStrings([
    ...(typeof declaredPrimaryExport === "string"
      ? [declaredPrimaryExport]
      : []),
    componentName,
    ...aliases,
    toPascalCase(componentName),
    toPascalCase(routeLeaf),
    componentName.replace(/\s+/g, ""),
    ...sourcePathNames,
  ]).map((name) => toMatchKey(name));

  const candidateSet = new Set<DocgenComponentShape>();
  for (const key of candidateNames) {
    const matches = packageEntries.get(key);
    if (matches) {
      for (const match of matches) {
        candidateSet.add(match);
      }
    }
  }

  const candidates =
    typeof declaredPrimaryExport === "string"
      ? [...(packageEntries.get(toMatchKey(declaredPrimaryExport)) ?? [])]
      : [...candidateSet];
  if (candidates.length === 0) {
    return {
      candidate: null,
      inference: {
        candidate_count: 0,
        candidate_display_names: [],
        selected_display_name: null,
        selected_score: null,
      },
    };
  }

  if (declaredPrimaryExport === null) {
    return {
      candidate: null,
      inference: {
        candidate_count: candidates.length,
        candidate_display_names: uniqueStrings(
          candidates
            .map((candidate) => asString(candidate.displayName))
            .filter((value): value is string => Boolean(value)),
        ).sort(compareOrdinalStrings),
        selected_display_name: null,
        selected_score: null,
      },
    };
  }

  // Build match keys from source-path-derived names for a stronger signal.
  const sourcePathMatchKeys = new Set(
    sourcePathNames.map((name) => toMatchKey(name)),
  );

  const scored = candidates
    .map((candidate) => {
      const displayName = asString(candidate.displayName) ?? "";
      const normalizedDisplayName = toMatchKey(displayName);
      const exactMatch = candidateNames.includes(normalizedDisplayName) ? 2 : 0;
      // Give a strong bonus when the candidate display name matches a name
      // derived from the authoritative source repo path. This ensures that
      // when the site points at e.g. "packages/lab/src/tabs-next", we
      // prefer "TabsNext" over legacy "Tabstrip" even if "Tabstrip" is
      // listed as an alias with more props.
      const sourcePathBonus = sourcePathMatchKeys.has(normalizedDisplayName)
        ? 4
        : 0;
      // Deprecation aliases (the `UNSTABLE_*` exports) carry the same
      // props as their primary export and otherwise tie on every
      // signal. They should never be the preferred docgen pick when a
      // non-deprecated equivalent is also a candidate. A small penalty
      // is enough to break the tie without disrupting any case where
      // an UNSTABLE_ entry is the only candidate available.
      const unstablePenalty = displayName.startsWith("UNSTABLE_") ? -1 : 0;
      const propCount =
        candidate.props && typeof candidate.props === "object"
          ? Object.keys(candidate.props as Record<string, unknown>).length
          : 0;

      return {
        candidate,
        score:
          sourcePathBonus +
          exactMatch +
          unstablePenalty +
          Math.min(propCount, 30) / 100,
      };
    })
    .sort((left, right) => right.score - left.score);

  const selected = scored[0];
  const strongestCandidates = selected
    ? scored.filter((candidate) => candidate.score === selected.score)
    : [];
  if (strongestCandidates.length > 1) {
    throw new Error(
      `Declared primary export '${declaredPrimaryExport}' resolves to ${strongestCandidates.length} equally ranked docgen candidates in '${packageName}'.`,
    );
  }

  return {
    candidate: selected?.candidate ?? null,
    inference: {
      candidate_count: candidates.length,
      candidate_display_names: uniqueStrings(
        candidates
          .map((candidate) => asString(candidate.displayName))
          .filter((value): value is string => Boolean(value)),
      ).sort(compareOrdinalStrings),
      selected_display_name: asString(selected?.candidate.displayName) ?? null,
      selected_score: selected?.score ?? null,
    },
  };
}

/**
 * Find sub-components for a compound component by scanning docgen entries
 * in the same package that share the root component's PascalCase name prefix.
 * For example, if the root is "Dialog", this finds "DialogActions",
 * "DialogContent", "DialogHeader", etc.
 */
export function selectSubComponents(
  propMetadata: PropMetadata,
  packageName: string,
  rootDisplayName: string,
): UnresolvedComponentSubComponent[] {
  const packageEntries = propMetadata.byPackage.get(packageName);
  if (!packageEntries) {
    return [];
  }

  // Derive the PascalCase prefix from the selected root display name.
  const rootPrefix = rootDisplayName;
  if (!rootPrefix || rootPrefix.length < 2) {
    return [];
  }

  // Exclude display names that are coincidental prefix matches rather than
  // real sub-components. For example, "LinkCard" is not a sub-component of
  // "Link" — it's documented as a standalone component.
  const EXCLUDED_SUB_COMPONENT_NAMES = new Set([
    // Standalone documented components that happen to share a prefix.
    "LinkCard",
    "SaltProviderNext",
    "UNSTABLE_SaltProviderNext",
    "TextAction",
    "TextNotation",
    "IconFigmaIcon",
  ]);

  // Suffixes that indicate a value constant or internal helper, not a
  // renderable sub-component.
  const NON_COMPONENT_SUFFIX_PATTERN = /^(?:SizeValues|Values|Constants)$/;

  const subComponents: UnresolvedComponentSubComponent[] = [];

  for (const candidates of packageEntries.values()) {
    for (const candidate of candidates) {
      const displayName = asString(candidate.displayName);
      if (!displayName) {
        continue;
      }

      // Must start with root prefix, must be longer than root, and
      // the character after the prefix must be uppercase (PascalCase boundary).
      if (
        displayName.length <= rootPrefix.length ||
        !displayName.startsWith(rootPrefix) ||
        !/^[A-Z]/.test(displayName.slice(rootPrefix.length))
      ) {
        continue;
      }

      if (EXCLUDED_SUB_COMPONENT_NAMES.has(displayName)) {
        continue;
      }

      const suffix = displayName.slice(rootPrefix.length);
      if (NON_COMPONENT_SUFFIX_PATTERN.test(suffix)) {
        continue;
      }

      const props = toComponentProps(candidate.props);
      subComponents.push({
        name: suffix,
        export_name: displayName,
        props,
      });
    }
  }

  return subComponents.sort((left, right) =>
    compareOrdinalStrings(left.export_name, right.export_name),
  );
}

/**
 * Fallback sub-component discovery that scans the source directory's index.ts
 * for exported component names and matches them against docgen entries.
 * Used when prefix-based matching finds nothing (e.g., Tabs → TabBar, TabNext, etc.
 * don't share a "TabsNext" prefix).
 */
export function selectSubComponentsBySourceExports(
  propMetadata: PropMetadata,
  packageName: string,
  rootDisplayName: string,
  sourceRepoPath: string | null,
  repoRoot: string,
): UnresolvedComponentSubComponent[] {
  if (!sourceRepoPath || !repoRoot) {
    return [];
  }

  const sourceDir = path.resolve(repoRoot, sourceRepoPath);
  const indexContent =
    readCatalogInputFileSyncOrNull(path.join(sourceDir, "index.ts"), "utf-8") ??
    readCatalogInputFileSyncOrNull(path.join(sourceDir, "index.tsx"), "utf-8");
  if (indexContent === null) return [];

  // Extract exported component names from the index file.
  // Matches: export { Foo } from, export { Foo, Bar } from, export type { ... } from
  // We want value exports that look like PascalCase component names.
  const exportedNames = new Set<string>();
  const exportPattern = /export\s+\{([^}]+)}/g;
  let match = exportPattern.exec(indexContent);
  while (match !== null) {
    // Skip type-only exports
    const preceding = indexContent.slice(
      Math.max(0, match.index - 10),
      match.index,
    );
    if (/export\s+type\s*$/.test(preceding)) {
      continue;
    }
    const names = match[1].split(",").map(
      (n) =>
        n
          .trim()
          .split(/\s+as\s+/)
          .pop()
          ?.trim() ?? "",
    );
    for (const name of names) {
      // Only PascalCase names (components), skip lowercase/UPPER_CASE/type keywords
      if (/^[A-Z][a-zA-Z0-9]+$/.test(name) && name !== rootDisplayName) {
        exportedNames.add(name);
      }
    }
    match = exportPattern.exec(indexContent);
  }

  if (exportedNames.size === 0) {
    return [];
  }

  const packageEntries = propMetadata.byPackage.get(packageName);
  if (!packageEntries) {
    return [];
  }

  const subComponents: UnresolvedComponentSubComponent[] = [];
  for (const candidates of packageEntries.values()) {
    for (const candidate of candidates) {
      const displayName = asString(candidate.displayName);
      if (!displayName || !exportedNames.has(displayName)) {
        continue;
      }

      const props = toComponentProps(candidate.props);
      subComponents.push({
        name: displayName,
        export_name: displayName,
        props,
      });
    }
  }

  return subComponents.sort((left, right) =>
    compareOrdinalStrings(left.export_name, right.export_name),
  );
}
