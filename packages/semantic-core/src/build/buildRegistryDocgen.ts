import fs from "node:fs";
import path from "node:path";
import type {
  ComponentDocgenInference,
  ComponentProp,
  ComponentSubComponent,
} from "../types.js";
import {
  asString,
  cleanMarkdownText,
  readFileOrNull,
  toMatchKey,
  toPascalCase,
  uniqueStrings,
} from "./buildRegistryShared.js";

const DOCGEN_PACKAGE_FILE_MAP: Record<string, string> = {
  "ag-grid-theme-props.json": "@salt-ds/ag-grid-theme",
  "core-props.json": "@salt-ds/core",
  "countries-props.json": "@salt-ds/countries",
  "data-grid-props.json": "@salt-ds/data-grid",
  "embla-carousel-props.json": "@salt-ds/embla-carousel",
  "icons-props.json": "@salt-ds/icons",
  "lab-props.json": "@salt-ds/lab",
  "react-resizable-panel-theme-props.json":
    "@salt-ds/react-resizable-panels-theme",
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
  defaultValue?: unknown;
  description?: unknown;
  required?: unknown;
  type?: DocgenTypeShape;
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
    .sort((left, right) => left.name.localeCompare(right.name));
}

export async function loadPropMetadata(
  repoRoot: string,
): Promise<PropMetadata> {
  const byPackage = new Map<string, Map<string, DocgenComponentShape[]>>();
  const propsDir = path.join(repoRoot, "site/src/props");

  for (const [fileName, packageName] of Object.entries(
    DOCGEN_PACKAGE_FILE_MAP,
  )) {
    const filePath = path.join(propsDir, fileName);
    const raw = await readFileOrNull(filePath);
    if (!raw) {
      continue;
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      continue;
    }

    if (!Array.isArray(parsed)) {
      continue;
    }

    const packageEntries = byPackage.get(packageName) ?? new Map();
    for (const entry of parsed) {
      if (!entry || typeof entry !== "object") {
        continue;
      }
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
  sourceRepoPath?: string | null,
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

  const candidates = [...candidateSet];
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
      const propCount =
        candidate.props && typeof candidate.props === "object"
          ? Object.keys(candidate.props as Record<string, unknown>).length
          : 0;

      return {
        candidate,
        score: sourcePathBonus + exactMatch + Math.min(propCount, 30) / 100,
      };
    })
    .sort((left, right) => right.score - left.score);

  const selected = scored[0];

  return {
    candidate: selected?.candidate ?? null,
    inference: {
      candidate_count: candidates.length,
      candidate_display_names: uniqueStrings(
        candidates
          .map((candidate) => asString(candidate.displayName))
          .filter((value): value is string => Boolean(value)),
      ).sort((left, right) => left.localeCompare(right)),
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
): ComponentSubComponent[] {
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

  const subComponents: ComponentSubComponent[] = [];

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
    left.export_name.localeCompare(right.export_name),
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
): ComponentSubComponent[] {
  if (!sourceRepoPath || !repoRoot) {
    return [];
  }

  const sourceDir = path.resolve(repoRoot, sourceRepoPath);
  const indexPath = path.join(sourceDir, "index.ts");
  let indexContent: string;
  try {
    indexContent = fs.readFileSync(indexPath, "utf-8");
  } catch {
    // Try index.tsx as fallback
    try {
      indexContent = fs.readFileSync(
        path.join(sourceDir, "index.tsx"),
        "utf-8",
      );
    } catch {
      return [];
    }
  }

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

  const subComponents: ComponentSubComponent[] = [];
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
    left.export_name.localeCompare(right.export_name),
  );
}
