import * as t from "@babel/types";
import semver from "semver";
import type { DeprecationRecord, SaltRegistry } from "../types.js";
import {
  analyzeParsedSaltCode,
  buildPropDeprecationIndex,
  createVersionContext,
  isDeprecationRelevant,
  normalizeComponentKey,
  resolveImportedSaltSymbol,
  resolveNamespaceMemberImportedSaltSymbol,
  type SaltCodeAnalysis,
  traverseAst,
} from "./codeAnalysisCommon.js";
import { unique } from "./utils.js";

export interface SuggestMigrationInput {
  code: string;
  from_version?: string;
  to_version?: string;
  max_migrations?: number;
  analysis?: SaltCodeAnalysis;
}

export interface SuggestMigrationResult {
  migrations: Array<{
    kind: DeprecationRecord["kind"];
    component: string | null;
    from: string;
    to: string | null;
    reason: string;
    source_urls: string[];
  }>;
  notes: string[];
  source_urls: string[];
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(value, max));
}

function getJsxAttributeName(attribute: t.JSXAttribute): string | null {
  if (t.isJSXIdentifier(attribute.name)) {
    return attribute.name.name;
  }

  return null;
}

function getJsxAttributeLiteralValue(
  attribute: t.JSXAttribute,
): string | boolean | number | null {
  if (attribute.value == null) {
    return true;
  }

  if (t.isStringLiteral(attribute.value)) {
    return attribute.value.value;
  }

  if (
    t.isJSXExpressionContainer(attribute.value) &&
    (t.isStringLiteral(attribute.value.expression) ||
      t.isNumericLiteral(attribute.value.expression) ||
      t.isBooleanLiteral(attribute.value.expression))
  ) {
    return attribute.value.expression.value;
  }

  return null;
}

function sliceCode(
  code: string,
  start: number | null | undefined,
  end: number | null | undefined,
): string | null {
  if (start == null || end == null) {
    return null;
  }

  return code.slice(start, end).trim() || null;
}

function buildReason(
  deprecation: DeprecationRecord,
  to: string | null,
): string {
  if (deprecation.replacement.notes) {
    return deprecation.replacement.notes;
  }
  if (to) {
    return `${deprecation.name} is deprecated. Use ${to} instead.`;
  }

  return `${deprecation.name} is deprecated.`;
}

function normalizeLookupKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function findComponentPropDeprecationNote(
  registry: SaltRegistry,
  packageName: string,
  componentName: string,
  propName: string,
): string | null {
  const component =
    registry.components.find(
      (candidate) =>
        candidate.package.name === packageName &&
        normalizeLookupKey(candidate.name) ===
          normalizeLookupKey(componentName),
    ) ?? null;
  if (!component) {
    return null;
  }

  return (
    component.props.find((prop) => prop.name === propName)?.deprecation_note ??
    null
  );
}

function inferReplacementFromDeprecationNote(
  note: string | null,
  deprecatedPropName: string,
  propValue: string | boolean | number | null,
): string | null {
  if (!note || propValue == null) {
    return null;
  }

  const rows = [
    ...note.matchAll(/\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|/g),
  ]
    .map((match) => [match[1].trim(), match[2].trim(), match[3].trim()])
    .filter((row) => row.every((cell) => cell.length > 0));
  if (rows.length < 3) {
    return null;
  }

  const [header, , ...dataRows] = rows;
  if (
    normalizeLookupKey(header[0]) !== normalizeLookupKey(deprecatedPropName)
  ) {
    return null;
  }

  const matchedRow =
    dataRows.find(
      (row) =>
        normalizeLookupKey(row[0]) === normalizeLookupKey(String(propValue)),
    ) ?? null;
  if (!matchedRow) {
    return null;
  }

  const replacements = header
    .slice(1)
    .map((columnName, index) => {
      const mappedValue = matchedRow[index + 1];
      if (!mappedValue) {
        return null;
      }

      return `${columnName}="${mappedValue}"`;
    })
    .filter((value): value is string => value !== null);

  return replacements.length > 0 ? replacements.join(" ") : null;
}

export function suggestMigration(
  registry: SaltRegistry,
  input: SuggestMigrationInput,
): SuggestMigrationResult {
  const notes: string[] = [];
  const code = input.code ?? "";
  const maxMigrations = clamp(input.max_migrations ?? 20, 1, 50);
  const fromVersion = createVersionContext(input.from_version);
  const toVersion = createVersionContext(input.to_version);

  if (code.trim().length === 0) {
    return {
      migrations: [],
      notes: ["No code was provided."],
      source_urls: [],
    };
  }

  if (fromVersion.input && !fromVersion.normalized) {
    notes.push(
      `from_version '${fromVersion.input}' is not a valid semver value; source-version filtering was skipped.`,
    );
  }
  if (toVersion.input && !toVersion.normalized) {
    notes.push(
      `to_version '${toVersion.input}' is not a valid semver value; target-version filtering was skipped.`,
    );
  }
  if (
    fromVersion.normalized &&
    toVersion.normalized &&
    semver.gt(fromVersion.normalized, toVersion.normalized)
  ) {
    notes.push("from_version is greater than to_version.");
  }

  let analysis: SaltCodeAnalysis;
  try {
    analysis = input.analysis ?? analyzeParsedSaltCode(code);
  } catch (error) {
    return {
      migrations: [],
      notes: [
        "Unable to parse code for migration analysis.",
        error instanceof Error ? error.message : String(error),
      ],
      source_urls: [],
    };
  }

  const { ast, directImportByLocal, namespaceImportByLocal } = analysis;

  const relevantNonPropDeprecations = registry.deprecations.filter(
    (deprecation) =>
      deprecation.kind !== "prop" &&
      isDeprecationRelevant(deprecation, toVersion),
  );
  const propDeprecationIndex = buildPropDeprecationIndex(
    registry.deprecations,
    toVersion,
  );

  let incompleteVersionMetadata = false;
  const migrationMap = new Map<
    string,
    {
      kind: DeprecationRecord["kind"];
      component: string | null;
      from: string;
      to: string | null;
      reason: string;
      source_urls: string[];
    }
  >();

  const addMigration = (
    deprecation: DeprecationRecord,
    fromSnippet: string | null,
    componentName: string | null,
    toOverride?: string | null,
  ): void => {
    if (toVersion.normalized && !deprecation.deprecated_in) {
      incompleteVersionMetadata = true;
    }

    const [firstMigration] = deprecation.migration.details;
    const to =
      toOverride ?? firstMigration?.to ?? deprecation.replacement.name ?? null;
    const from = fromSnippet ?? firstMigration?.from ?? deprecation.name;
    const key = `${deprecation.id}:${from}:${to ?? ""}`;

    const existing = migrationMap.get(key);
    if (existing) {
      existing.source_urls = unique([
        ...existing.source_urls,
        ...deprecation.source_urls,
      ]);
      return;
    }

    migrationMap.set(key, {
      kind: deprecation.kind,
      component: deprecation.component ?? componentName,
      from,
      to,
      reason: buildReason(deprecation, to),
      source_urls: unique(deprecation.source_urls),
    });
  };

  traverseAst(ast, {
    ImportDeclaration(path) {
      const source = path.node.source.value;
      if (typeof source !== "string" || !source.startsWith("@salt-ds/")) {
        return;
      }

      for (const specifier of path.node.specifiers) {
        if (!t.isImportSpecifier(specifier)) {
          continue;
        }

        const importedName = t.isIdentifier(specifier.imported)
          ? specifier.imported.name
          : specifier.imported.value;
        const deprecations = relevantNonPropDeprecations.filter(
          (deprecation) =>
            deprecation.package === source && deprecation.name === importedName,
        );

        for (const deprecation of deprecations) {
          addMigration(
            deprecation,
            sliceCode(code, specifier.start, specifier.end),
            importedName,
          );
        }
      }
    },
    JSXOpeningElement(path) {
      const imported = resolveImportedSaltSymbol(
        path.node.name,
        directImportByLocal,
        namespaceImportByLocal,
      );
      if (!imported) {
        return;
      }

      const componentDeprecations = relevantNonPropDeprecations.filter(
        (deprecation) =>
          deprecation.package === imported.packageName &&
          deprecation.name === imported.imported,
      );
      for (const deprecation of componentDeprecations) {
        addMigration(
          deprecation,
          sliceCode(code, path.node.name.start, path.node.name.end),
          imported.imported,
        );
      }

      const packageDeprecations = propDeprecationIndex.get(
        imported.packageName,
      );
      if (!packageDeprecations) {
        return;
      }

      const componentKey = normalizeComponentKey(imported.imported);
      const componentSpecificDeprecations =
        packageDeprecations.get(componentKey);
      if (!componentSpecificDeprecations) {
        return;
      }

      const attributes = path.node.attributes.filter(
        (attribute): attribute is t.JSXAttribute => t.isJSXAttribute(attribute),
      );
      for (const attribute of attributes) {
        const propName = getJsxAttributeName(attribute);
        if (!propName) {
          continue;
        }

        const deprecations = componentSpecificDeprecations.get(propName) ?? [];
        for (const deprecation of deprecations) {
          const propValue = getJsxAttributeLiteralValue(attribute);
          const deprecationNote = findComponentPropDeprecationNote(
            registry,
            imported.packageName,
            imported.imported,
            propName,
          );
          const richerReplacement = inferReplacementFromDeprecationNote(
            deprecationNote,
            propName,
            propValue,
          );
          addMigration(
            deprecation,
            sliceCode(code, attribute.start, attribute.end),
            imported.imported,
            richerReplacement,
          );
        }
      }
    },
    MemberExpression(path) {
      const imported = resolveNamespaceMemberImportedSaltSymbol(
        path.node,
        namespaceImportByLocal,
      );
      if (!imported) {
        return;
      }

      const componentDeprecations = relevantNonPropDeprecations.filter(
        (deprecation) =>
          deprecation.package === imported.packageName &&
          deprecation.name === imported.imported,
      );

      for (const deprecation of componentDeprecations) {
        addMigration(
          deprecation,
          sliceCode(code, path.node.start, path.node.end),
          imported.imported,
        );
      }
    },
  });

  if (toVersion.normalized && incompleteVersionMetadata) {
    notes.push(
      "Some matched deprecations do not have explicit deprecated_in metadata; version filtering may be incomplete.",
    );
  }

  const migrations = [...migrationMap.values()]
    .sort((left, right) => left.from.localeCompare(right.from))
    .slice(0, maxMigrations);

  return {
    migrations,
    notes: unique(notes),
    source_urls: unique(
      migrations.flatMap((migration) => migration.source_urls),
    ),
  };
}
