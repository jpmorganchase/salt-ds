import path from "node:path";
import type { ComponentDocgenInference, ComponentProp } from "../types.js";
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
  "react-resziable-panel-theme-props.json":
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
    value !== null &&
    "value" in (value as Record<string, unknown>)
  ) {
    const inner = (value as Record<string, unknown>).value;
    return typeof inner === "string" ? inner.trim() : null;
  }
  return null;
}

function parsePrimitiveValue(raw: string): string | number | boolean | null {
  const value = raw.trim();
  if (value === "null") {
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
  const props = entries
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

  return props;
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
  const candidateNames = uniqueStrings([
    componentName,
    ...aliases,
    toPascalCase(componentName),
    toPascalCase(routeLeaf),
    componentName.replace(/\s+/g, ""),
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

  const scored = candidates
    .map((candidate) => {
      const displayName = asString(candidate.displayName) ?? "";
      const normalizedDisplayName = toMatchKey(displayName);
      const exactMatch = candidateNames.includes(normalizedDisplayName) ? 2 : 0;
      const propCount =
        candidate.props && typeof candidate.props === "object"
          ? Object.keys(candidate.props as Record<string, unknown>).length
          : 0;

      return {
        candidate,
        score: exactMatch + Math.min(propCount, 30) / 100,
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
