import path from "node:path";
import fg from "fast-glob";
import { toPosixPath } from "../registry/paths.js";
import type {
  CountrySymbolRecord,
  DeprecationRecord,
  IconRecord,
  PackageRecord,
  SaltStatus,
} from "../types.js";
import {
  asStringArray,
  cleanMarkdownText,
  normalizeWhitespace,
  pascalToKebabCase,
  pascalToLabel,
  readFileOrNull,
  toKebabCase,
  toMatchKey,
  uniqueStrings,
} from "./buildRegistryShared.js";

interface IconSynonymMetadata {
  iconName: string;
  synonym: string[];
  category: string;
}

interface CountrySymbolMetadata {
  countryCode: string;
  countryName: string;
}

function isIconBaseNameMatch(baseName: string, figmaIconName: string): boolean {
  const normalizedFigmaName = figmaIconName.replace(/-/g, "");
  const matcher = new RegExp(`^${normalizedFigmaName}(Solid)?$`, "i");
  return matcher.test(baseName);
}

async function loadIconSynonymMetadata(
  repoRoot: string,
): Promise<IconSynonymMetadata[]> {
  const synonymPath = path.join(
    repoRoot,
    "site/src/components/icon-preview/salt-icon-synonym.json",
  );
  const raw = await readFileOrNull(synonymPath);
  if (!raw) {
    return [];
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }

  if (!Array.isArray(parsed)) {
    return [];
  }

  return parsed
    .filter((entry): entry is IconSynonymMetadata => {
      if (!entry || typeof entry !== "object") {
        return false;
      }

      const candidate = entry as Record<string, unknown>;
      return (
        typeof candidate.iconName === "string" &&
        Array.isArray(candidate.synonym) &&
        typeof candidate.category === "string"
      );
    })
    .map((entry) => ({
      iconName: entry.iconName,
      synonym: asStringArray(entry.synonym).map(cleanMarkdownText),
      category: cleanMarkdownText(entry.category),
    }));
}

function buildIconAliases(
  exportName: string,
  baseName: string,
  figmaName: string,
  label: string,
  synonyms: string[],
  variant: IconRecord["variant"],
): string[] {
  const sharedAliases = [exportName, baseName, figmaName, label, ...synonyms];
  const variantAliases =
    variant === "solid"
      ? [
          `${figmaName} solid`,
          `${figmaName}-solid`,
          `${label} solid`,
          `${label} solid icon`,
          ...synonyms.flatMap((synonym) => [`solid ${synonym}`]),
        ]
      : [`${figmaName} icon`, `${label} icon`];

  return uniqueStrings(
    [...sharedAliases, ...variantAliases]
      .map((value) => normalizeWhitespace(value))
      .filter((value) => value.length > 0),
  );
}

function buildIconSummary(
  label: string,
  variant: IconRecord["variant"],
  category: string,
  synonyms: string[],
  status: SaltStatus,
): string {
  const variantText = variant === "solid" ? "solid " : "";
  const synonymPreview = synonyms.slice(0, 3).join(", ");
  const deprecatedText =
    status === "deprecated"
      ? " Deprecated; use the linked replacement guidance."
      : "";

  if (synonymPreview.length > 0) {
    return `${label} ${variantText}icon for ${category} concepts such as ${synonymPreview}.${deprecatedText}`.trim();
  }

  return `${label} ${variantText}icon in Salt Design System.${deprecatedText}`.trim();
}

async function loadCountrySymbolMetadata(
  repoRoot: string,
): Promise<CountrySymbolMetadata[]> {
  const metadataPath = path.join(
    repoRoot,
    "packages/countries/src/countryMetaMap.ts",
  );
  const raw = await readFileOrNull(metadataPath);
  if (!raw) {
    return [];
  }

  const entries = [
    ...raw.matchAll(
      /(?:"([^"]+)"|([A-Z]{2}(?:-[A-Z]{3})?))\s*:\s*\{\s*countryCode:\s*"([^"]+)"\s*,\s*countryName:\s*"([^"]+)"\s*,?\s*\}/gms,
    ),
  ].map((match) => ({
    countryCode: match[3] ?? match[1] ?? match[2] ?? "",
    countryName: match[4] ?? "",
  }));

  return entries
    .filter(
      (entry) =>
        entry.countryCode.trim().length > 0 &&
        entry.countryName.trim().length > 0,
    )
    .sort((left, right) => left.countryCode.localeCompare(right.countryCode));
}

function countryCodeToExportBase(countryCode: string): string {
  return countryCode.replace(/-/g, "_");
}

function buildCountrySymbolNameAliases(countryName: string): string[] {
  const aliases = [normalizeWhitespace(countryName)];
  const withoutBrackets = normalizeWhitespace(
    countryName.replace(/\s*\[[^\]]+\]/g, " "),
  );

  if (withoutBrackets) {
    aliases.push(withoutBrackets);
  }

  const parentheticalMatch = withoutBrackets.match(/^(.*?)\s+\(([^)]+)\)$/);
  if (parentheticalMatch) {
    const baseName = normalizeWhitespace(parentheticalMatch[1] ?? "");
    const qualifier = normalizeWhitespace(parentheticalMatch[2] ?? "");

    if (baseName) {
      aliases.push(baseName);
    }

    if (baseName && qualifier.toLowerCase() === "the") {
      aliases.push(`The ${baseName}`);
    } else if (baseName && qualifier) {
      aliases.push(`${qualifier.replace(/^the\s+/i, "")} ${baseName}`);
    }
  }

  const plainName = normalizeWhitespace(
    withoutBrackets.replace(/\s*\([^)]*\)/g, " "),
  );
  if (plainName) {
    aliases.push(plainName);
  }

  const prefixMatch = plainName.match(/^(.+?) of .+$/i);
  if (prefixMatch) {
    const prefix = normalizeWhitespace(prefixMatch[1] ?? "");
    if (prefix.split(/\s+/).length >= 2) {
      aliases.push(prefix);
    }
  }

  return uniqueStrings(
    aliases
      .map((value) => normalizeWhitespace(value))
      .filter((value) => value.length > 0),
  );
}

function buildCountrySymbolAliases(
  countryCode: string,
  countryName: string,
): string[] {
  const exportBase = countryCodeToExportBase(countryCode);
  return uniqueStrings(
    [
      countryCode,
      countryCode.replace(/-/g, "_"),
      countryCode.replace(/-/g, " "),
      exportBase,
      `${exportBase}_Sharp`,
      ...buildCountrySymbolNameAliases(countryName),
    ]
      .map((value) => normalizeWhitespace(value))
      .filter((value) => value.length > 0),
  );
}

function buildCountrySymbolSummary(
  countryName: string,
  status: SaltStatus,
): string {
  const deprecatedText =
    status === "deprecated"
      ? " Deprecated; use the linked replacement guidance."
      : "";

  return `Asset for ${countryName}; available in circle and sharp variants.${deprecatedText}`.trim();
}

function countrySymbolDeprecationMatches(
  countryCode: string,
  countryName: string,
  deprecation: DeprecationRecord,
): boolean {
  if (deprecation.package !== "@salt-ds/countries") {
    return false;
  }

  const exportBase = countryCodeToExportBase(countryCode);
  const countryKeys = new Set(
    buildCountrySymbolAliases(countryCode, countryName).map((value) =>
      toMatchKey(value),
    ),
  );
  countryKeys.add(toMatchKey(countryCode));
  countryKeys.add(toMatchKey(exportBase));
  countryKeys.add(toMatchKey(`${exportBase}_Sharp`));

  const deprecationKeys = [deprecation.name, deprecation.component]
    .filter((value): value is string => Boolean(value))
    .map((value) => toMatchKey(value));

  return deprecationKeys.some((key) => countryKeys.has(key));
}

function iconDeprecationMatches(
  exportName: string,
  baseName: string,
  figmaName: string,
  deprecation: DeprecationRecord,
): boolean {
  if (deprecation.package !== "@salt-ds/icons") {
    return false;
  }

  const iconKeys = new Set([
    toMatchKey(exportName),
    toMatchKey(baseName),
    toMatchKey(figmaName),
  ]);

  const deprecationKeys = [deprecation.name, deprecation.component]
    .filter((value): value is string => Boolean(value))
    .map((value) => toMatchKey(value));

  return deprecationKeys.some((key) => iconKeys.has(key));
}

export async function extractIcons(
  repoRoot: string,
  packageByName: Map<string, PackageRecord>,
  deprecations: DeprecationRecord[],
  generatedAt: string,
): Promise<IconRecord[]> {
  const iconsPackage = packageByName.get("@salt-ds/icons");
  if (!iconsPackage) {
    return [];
  }

  const synonymMetadata = await loadIconSynonymMetadata(repoRoot);
  const iconPaths = (
    await fg("packages/icons/src/components/*.tsx", {
      cwd: repoRoot,
      absolute: true,
      onlyFiles: true,
    })
  )
    .filter((filePath) => path.parse(filePath).name !== "index")
    .sort((left, right) => left.localeCompare(right));

  return iconPaths.map((iconPath) => {
    const sourcePath = toPosixPath(path.relative(repoRoot, iconPath));
    const baseName = path.parse(iconPath).name;
    const variant = baseName.endsWith("Solid") ? "solid" : "outline";
    const unqualifiedBaseName =
      variant === "solid" ? baseName.replace(/Solid$/, "") : baseName;
    const exportName = `${baseName}Icon`;
    const figmaName =
      synonymMetadata.find((entry) =>
        isIconBaseNameMatch(baseName, entry.iconName),
      )?.iconName ?? pascalToKebabCase(unqualifiedBaseName);
    const matchedMetadata =
      synonymMetadata.find((entry) => entry.iconName === figmaName) ?? null;
    const synonyms = uniqueStrings(
      (matchedMetadata?.synonym ?? []).map((synonym) =>
        cleanMarkdownText(synonym),
      ),
    );
    const matchedDeprecations = deprecations
      .filter((deprecation) =>
        iconDeprecationMatches(exportName, baseName, figmaName, deprecation),
      )
      .map((deprecation) => deprecation.id)
      .sort((left, right) => left.localeCompare(right));
    const status: SaltStatus =
      matchedDeprecations.length > 0 ? "deprecated" : iconsPackage.status;

    return {
      id: `icon.${pascalToKebabCase(exportName)}`,
      name: exportName,
      base_name: baseName,
      figma_name: figmaName,
      package: {
        name: iconsPackage.name,
        status: iconsPackage.status,
        since: null,
      },
      summary: buildIconSummary(
        pascalToLabel(unqualifiedBaseName),
        variant,
        matchedMetadata?.category ?? "uncategorized",
        synonyms,
        status,
      ),
      status,
      category: matchedMetadata?.category ?? "uncategorized",
      synonyms,
      aliases: buildIconAliases(
        exportName,
        baseName,
        figmaName,
        pascalToLabel(unqualifiedBaseName),
        synonyms,
        variant,
      ),
      variant,
      related_docs: {
        overview: "/salt/components/icon",
        examples: "/salt/components/icon/examples",
        foundation: "/salt/foundations/assets/index",
      },
      source: {
        repo_path: sourcePath,
        export_name: exportName,
      },
      deprecations: matchedDeprecations,
      last_verified_at: generatedAt,
    } satisfies IconRecord;
  });
}

export async function extractCountrySymbols(
  repoRoot: string,
  packageByName: Map<string, PackageRecord>,
  deprecations: DeprecationRecord[],
  generatedAt: string,
): Promise<CountrySymbolRecord[]> {
  const countriesPackage = packageByName.get("@salt-ds/countries");
  if (!countriesPackage) {
    return [];
  }

  const countryMetadata = await loadCountrySymbolMetadata(repoRoot);

  return countryMetadata.map(({ countryCode, countryName }) => {
    const exportBase = countryCodeToExportBase(countryCode);
    const circleRepoPath = `packages/countries/src/components/${exportBase}.tsx`;
    const sharpRepoPath = `packages/countries/src/components/${exportBase}_Sharp.tsx`;
    const matchedDeprecations = deprecations
      .filter((deprecation) =>
        countrySymbolDeprecationMatches(countryCode, countryName, deprecation),
      )
      .map((deprecation) => deprecation.id)
      .sort((left, right) => left.localeCompare(right));
    const status: SaltStatus =
      matchedDeprecations.length > 0 ? "deprecated" : countriesPackage.status;

    return {
      id: `country_symbol.${toKebabCase(countryCode)}`,
      code: countryCode,
      name: countryName,
      package: {
        name: countriesPackage.name,
        status: countriesPackage.status,
        since: null,
      },
      summary: buildCountrySymbolSummary(countryName, status),
      status,
      aliases: buildCountrySymbolAliases(countryCode, countryName),
      variants: {
        circle: {
          export_name: exportBase,
          repo_path: circleRepoPath,
        },
        sharp: {
          export_name: `${exportBase}_Sharp`,
          repo_path: sharpRepoPath,
        },
      },
      related_docs: {
        overview: "/salt/components/country-symbol",
        usage: "/salt/components/country-symbol/usage",
        accessibility: "/salt/components/country-symbol/accessibility",
        examples: "/salt/components/country-symbol/examples",
        foundation: "/salt/foundations/assets/country-symbols",
      },
      deprecations: matchedDeprecations,
      last_verified_at: generatedAt,
    } satisfies CountrySymbolRecord;
  });
}
