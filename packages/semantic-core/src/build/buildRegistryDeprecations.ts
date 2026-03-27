import path from "node:path";
import fg from "fast-glob";
import ts from "typescript";
import { toPosixPath } from "../registry/paths.js";
import type { DeprecationRecord, PackageRecord } from "../types.js";
import {
  loadPackageChangelogMetadata,
  type PackageChangelogMetadata,
} from "./buildRegistryChanges.js";
import {
  cleanMarkdownText,
  normalizeVersion,
  preferEarlierVersion,
  readFileOrNull,
  toKebabCase,
  toMatchKey,
  uniqueStrings,
} from "./buildRegistryShared.js";

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

function normalizeReplacementSymbol(symbol: string | null): string | null {
  if (!symbol) {
    return null;
  }

  return symbol.replace(/[.,;:]+$/g, "") || null;
}

function extractJsDocTagComment(comment: ts.JSDocTag["comment"]): string {
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
      if ("text" in part) {
        return String(part.text ?? "");
      }
      return "";
    })
    .join("");
}

function inferDeprecationKindFromNode(
  node: ts.Node,
): DeprecationRecord["kind"] {
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
    return "component";
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
    if (node.name && ts.isStringLiteral(node.name)) {
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

function buildDeprecationId(
  packageName: string,
  symbolName: string,
  kind: DeprecationRecord["kind"],
  normalizedPath: string,
  line: number,
): string {
  const relativeSourceId = normalizedPath
    .replace(/^packages\/[^/]+\/src\//, "")
    .replace(/\.[^.]+$/, "");

  return `dep.${toKebabCase(packageName)}.${toKebabCase(relativeSourceId)}.${toKebabCase(symbolName)}.${kind}.${line}`;
}

function deprecationKindRank(kind: DeprecationRecord["kind"]): number {
  switch (kind) {
    case "prop":
      return 0;
    case "component":
      return 1;
    case "import":
      return 2;
    case "type":
      return 3;
    case "token":
      return 4;
    default:
      return 5;
  }
}

function mergeDeprecationRecords(
  current: DeprecationRecord,
  candidate: DeprecationRecord,
): DeprecationRecord {
  const preferred =
    deprecationKindRank(candidate.kind) < deprecationKindRank(current.kind)
      ? candidate
      : current;
  const secondary = preferred === current ? candidate : current;

  return {
    ...preferred,
    deprecated_in: preferEarlierVersion(
      preferred.deprecated_in,
      secondary.deprecated_in,
    ),
    removed_in: preferred.removed_in ?? secondary.removed_in,
    replacement: {
      type: preferred.replacement.type ?? secondary.replacement.type,
      name: preferred.replacement.name ?? secondary.replacement.name,
      notes: preferred.replacement.notes ?? secondary.replacement.notes,
    },
    migration:
      preferred.migration.details.length > 0
        ? preferred.migration
        : secondary.migration,
    source_urls: uniqueStrings([
      ...preferred.source_urls,
      ...secondary.source_urls,
    ]).sort((left, right) => left.localeCompare(right)),
  };
}

function collectDeprecationsFromSourceFile(
  sourceFile: ts.SourceFile,
  packageName: string,
  normalizedPath: string,
  changelogMetadata?: PackageChangelogMetadata,
): DeprecationRecord[] {
  const deprecationsByIdentity = new Map<string, DeprecationRecord>();

  const visit = (node: ts.Node): void => {
    const tags = ts
      .getJSDocTags(node)
      .filter((tag) => tag.tagName.getText(sourceFile) === "deprecated");
    if (tags.length > 0) {
      const symbolName = inferSymbolNameFromNode(node);
      if (!symbolName) {
        ts.forEachChild(node, visit);
        return;
      }
      const componentName = inferComponentFromNode(node);
      const kind = inferDeprecationKindFromNode(node);
      const line =
        sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile))
          .line + 1;

      for (const tag of tags) {
        const rawNote = extractJsDocTagComment(tag.comment);
        const guidanceNote = extractDeprecationGuidance(rawNote);
        const note = summarizeDeprecationNote(rawNote);
        const replacementMatch = guidanceNote.match(
          /use\s+`?([A-Za-z0-9_.-]+)`?/i,
        );
        const replacementName = normalizeReplacementSymbol(
          replacementMatch ? replacementMatch[1] : null,
        );
        const deprecatedIn =
          inferDeprecatedVersionFromNote(rawNote) ??
          changelogMetadata?.deprecatedBySymbol.get(toMatchKey(symbolName)) ??
          null;
        const deprecation = {
          id: buildDeprecationId(
            packageName,
            symbolName,
            kind,
            normalizedPath,
            line,
          ),
          package: packageName,
          component:
            componentName ??
            (symbolName.endsWith("Props")
              ? symbolName.replace(/Props$/, "")
              : null),
          kind,
          name: symbolName,
          deprecated_in: deprecatedIn,
          removed_in: inferRemovedVersionFromNote(rawNote),
          replacement: {
            type: replacementName ? "symbol" : null,
            name: replacementName,
            notes: note || null,
          },
          migration: {
            strategy: replacementName ? "replace" : "manual",
            details: replacementName
              ? [
                  {
                    from: symbolName,
                    to: replacementName,
                  },
                ]
              : [],
          },
          source_urls: [normalizedPath],
        } satisfies DeprecationRecord;
        const identityKey = `${normalizedPath}:${symbolName}:${line}`;
        const current = deprecationsByIdentity.get(identityKey);
        deprecationsByIdentity.set(
          identityKey,
          current ? mergeDeprecationRecords(current, deprecation) : deprecation,
        );
      }
    }

    ts.forEachChild(node, visit);
  };

  visit(sourceFile);
  return [...deprecationsByIdentity.values()];
}

export async function extractDeprecations(
  repoRoot: string,
  packages: PackageRecord[],
  excludedPackageNames: ReadonlySet<string>,
): Promise<DeprecationRecord[]> {
  const changelogMetadataByPackage = await loadPackageChangelogMetadata(
    repoRoot,
    packages,
  );
  const sourcePaths = (
    await fg("packages/*/src/**/*.{ts,tsx}", {
      cwd: repoRoot,
      absolute: true,
      onlyFiles: true,
    })
  ).sort((left, right) => left.localeCompare(right));

  const deprecations: DeprecationRecord[] = [];
  for (const sourcePath of sourcePaths) {
    const source = await readFileOrNull(sourcePath);
    if (!source || !source.includes("@deprecated")) {
      continue;
    }

    const normalizedPath = toPosixPath(path.relative(repoRoot, sourcePath));
    const packageSlug = normalizedPath.split("/")[1];
    const packageName = `@salt-ds/${packageSlug}`;
    if (excludedPackageNames.has(packageName)) {
      continue;
    }

    const scriptKind = sourcePath.endsWith(".tsx")
      ? ts.ScriptKind.TSX
      : ts.ScriptKind.TS;
    const sourceFile = ts.createSourceFile(
      normalizedPath,
      source,
      ts.ScriptTarget.Latest,
      true,
      scriptKind,
    );

    deprecations.push(
      ...collectDeprecationsFromSourceFile(
        sourceFile,
        packageName,
        normalizedPath,
        changelogMetadataByPackage.get(packageName),
      ),
    );
  }

  return deprecations.sort((left, right) => left.id.localeCompare(right.id));
}
