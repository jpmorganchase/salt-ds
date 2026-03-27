import * as t from "@babel/types";
import type { SaltRegistry, TokenRecord } from "../../types.js";
import { unique } from "../utils.js";
import { buildCatalogValidationIssue } from "./issueCatalog.js";
import type { ValidationIssue } from "./shared.js";
import { buildEvidence } from "./validateSaltUsageHelpers.js";

const SIZE_STYLE_KEYS = new Set([
  "height",
  "minHeight",
  "maxHeight",
  "width",
  "minWidth",
  "maxWidth",
  "margin",
  "marginTop",
  "marginRight",
  "marginBottom",
  "marginLeft",
  "padding",
  "paddingTop",
  "paddingRight",
  "paddingBottom",
  "paddingLeft",
  "gap",
  "fontSize",
  "lineHeight",
]);
const COLOR_STYLE_KEYS = new Set([
  "color",
  "background",
  "backgroundColor",
  "borderColor",
]);
const BORDER_LINE_STYLE_KEYS = new Set([
  "border",
  "borderTop",
  "borderRight",
  "borderBottom",
  "borderLeft",
  "outline",
]);
const BORDER_WIDTH_STYLE_KEYS = new Set([
  "borderWidth",
  "borderTopWidth",
  "borderRightWidth",
  "borderBottomWidth",
  "borderLeftWidth",
  "outlineWidth",
]);
const BACKGROUND_STYLE_KEYS = new Set(["background", "backgroundColor"]);
const BORDER_COLOR_STYLE_KEYS = new Set([
  "border",
  "borderTop",
  "borderRight",
  "borderBottom",
  "borderLeft",
  "borderColor",
  "borderTopColor",
  "borderRightColor",
  "borderBottomColor",
  "borderLeftColor",
  "outline",
  "outlineColor",
]);

export interface TokenPolicyCounts {
  hardcodedSizeCount: number;
  hardcodedColorCount: number;
  unknownSaltTokenCount: number;
  unknownSaltTokenNames: string[];
  directPaletteTokenCount: number;
  deprecatedTokenCount: number;
  deprecatedTokenNames: string[];
  nonFixedBorderThicknessCount: number;
  containerLevelMismatchCount: number;
  separatorColorMismatchCount: number;
}

export function createEmptyTokenPolicyCounts(): TokenPolicyCounts {
  return {
    hardcodedSizeCount: 0,
    hardcodedColorCount: 0,
    unknownSaltTokenCount: 0,
    unknownSaltTokenNames: [],
    directPaletteTokenCount: 0,
    deprecatedTokenCount: 0,
    deprecatedTokenNames: [],
    nonFixedBorderThicknessCount: 0,
    containerLevelMismatchCount: 0,
    separatorColorMismatchCount: 0,
  };
}

export function mergeTokenPolicyCounts(
  target: TokenPolicyCounts,
  source: TokenPolicyCounts,
): void {
  target.hardcodedSizeCount += source.hardcodedSizeCount;
  target.hardcodedColorCount += source.hardcodedColorCount;
  target.unknownSaltTokenCount += source.unknownSaltTokenCount;
  target.unknownSaltTokenNames = unique([
    ...target.unknownSaltTokenNames,
    ...source.unknownSaltTokenNames,
  ]);
  target.directPaletteTokenCount += source.directPaletteTokenCount;
  target.deprecatedTokenCount += source.deprecatedTokenCount;
  target.deprecatedTokenNames = unique([
    ...target.deprecatedTokenNames,
    ...source.deprecatedTokenNames,
  ]);
  target.nonFixedBorderThicknessCount += source.nonFixedBorderThicknessCount;
  target.containerLevelMismatchCount += source.containerLevelMismatchCount;
  target.separatorColorMismatchCount += source.separatorColorMismatchCount;
}

export function buildTokenLookup(
  registry: SaltRegistry,
): Map<string, TokenRecord> {
  return new Map(
    registry.tokens.map((token) => [token.name.toLowerCase(), token] as const),
  );
}

function isHardcodedSizeLiteral(value: t.Expression): boolean {
  if (t.isNumericLiteral(value)) {
    return true;
  }
  if (t.isStringLiteral(value)) {
    return /^-?\d+(\.\d+)?(px|rem|em|vh|vw)$/i.test(value.value.trim());
  }
  if (
    t.isTemplateLiteral(value) &&
    value.expressions.length === 0 &&
    value.quasis.length > 0
  ) {
    const raw = value.quasis
      .map((quasi) => quasi.value.raw)
      .join("")
      .trim();
    return /^-?\d+(\.\d+)?(px|rem|em|vh|vw)$/i.test(raw);
  }
  return false;
}

function isHardcodedColorLiteral(value: t.Expression): boolean {
  const isColorString = (raw: string): boolean =>
    /^(#[0-9a-fA-F]{3,8}|rgb[a]?\([^)]*\)|hsl[a]?\([^)]*\))$/.test(raw.trim());

  if (t.isStringLiteral(value)) {
    return isColorString(value.value);
  }
  if (
    t.isTemplateLiteral(value) &&
    value.expressions.length === 0 &&
    value.quasis.length > 0
  ) {
    return isColorString(value.quasis.map((quasi) => quasi.value.raw).join(""));
  }
  return false;
}

function isHardcodedSizeString(raw: string): boolean {
  return /^-?\d+(\.\d+)?(px|rem|em|vh|vw)?$/i.test(raw.trim());
}

function isHardcodedColorString(raw: string): boolean {
  return /^(#[0-9a-fA-F]{3,8}|rgb[a]?\([^)]*\)|hsl[a]?\([^)]*\))$/.test(
    raw.trim(),
  );
}

function normalizeStyleKey(keyName: string): string {
  return keyName
    .trim()
    .replace(/-([a-z])/g, (_match, letter: string) => letter.toUpperCase());
}

function getStaticStyleValue(value: t.Expression): string | null {
  if (t.isNumericLiteral(value)) {
    return String(value.value);
  }

  if (t.isStringLiteral(value)) {
    return value.value.trim();
  }

  if (
    t.isTemplateLiteral(value) &&
    value.expressions.length === 0 &&
    value.quasis.length > 0
  ) {
    return value.quasis
      .map((quasi) => quasi.value.raw)
      .join("")
      .trim();
  }

  return null;
}

function extractSaltTokenNames(value: t.Expression): string[] {
  const raw = getStaticStyleValue(value);
  if (!raw) {
    return [];
  }

  return unique(raw.match(/--salt-[A-Za-z0-9-]+/g) ?? []);
}

function extractSaltTokenNamesFromRaw(raw: string): string[] {
  return unique(raw.match(/--salt-[A-Za-z0-9-]+/g) ?? []);
}

function getTokenByName(
  tokenLookup: Map<string, TokenRecord>,
  tokenName: string,
): TokenRecord | undefined {
  return tokenLookup.get(tokenName.toLowerCase());
}

function isNeverDirectUseToken(
  tokenLookup: Map<string, TokenRecord>,
  tokenName: string,
): boolean {
  if (tokenName.toLowerCase().startsWith("--salt-palette-")) {
    return true;
  }

  return (
    getTokenByName(tokenLookup, tokenName)?.policy?.direct_component_use ===
    "never"
  );
}

function isUnknownSaltToken(
  tokenLookup: Map<string, TokenRecord>,
  tokenName: string,
): boolean {
  return !tokenLookup.has(tokenName.toLowerCase());
}

function isDeprecatedToken(
  tokenLookup: Map<string, TokenRecord>,
  tokenName: string,
): boolean {
  return getTokenByName(tokenLookup, tokenName)?.deprecated === true;
}

function isSizeToken(tokenName: string): boolean {
  return tokenName.toLowerCase().startsWith("--salt-size-");
}

function hasStructuralRole(
  tokenLookup: Map<string, TokenRecord>,
  tokenName: string,
  role: string,
): boolean {
  return (
    getTokenByName(tokenLookup, tokenName)?.policy?.structural_roles?.includes(
      role,
    ) ?? false
  );
}

function hasAnyStructuralRole(
  tokenLookup: Map<string, TokenRecord>,
  tokenNames: string[],
  roles: string[],
): boolean {
  return tokenNames.some((tokenName) =>
    roles.some((role) => hasStructuralRole(tokenLookup, tokenName, role)),
  );
}

function containsLengthLiteral(raw: string): boolean {
  const value = raw.trim();
  return (
    /^-?\d+(\.\d+)?$/.test(value) ||
    /\b-?\d+(\.\d+)?(px|rem|em|vh|vw)\b/i.test(value)
  );
}

function usesNonFixedBorderThickness(
  tokenLookup: Map<string, TokenRecord>,
  keyName: string,
  value: t.Expression,
  tokenNames: string[],
): boolean {
  if (BORDER_WIDTH_STYLE_KEYS.has(keyName)) {
    if (isHardcodedSizeLiteral(value)) {
      return true;
    }

    return (
      tokenNames.some((tokenName) => isSizeToken(tokenName)) &&
      !hasAnyStructuralRole(tokenLookup, tokenNames, [
        "border-thickness",
        "separator-thickness",
      ])
    );
  }

  if (!BORDER_LINE_STYLE_KEYS.has(keyName)) {
    return false;
  }

  const raw = getStaticStyleValue(value);
  if (!raw) {
    return false;
  }

  if (
    hasAnyStructuralRole(tokenLookup, tokenNames, [
      "border-thickness",
      "separator-thickness",
    ])
  ) {
    return false;
  }

  if (tokenNames.some((tokenName) => isSizeToken(tokenName))) {
    return true;
  }

  return containsLengthLiteral(raw);
}

function getContainerPairingLevel(
  tokenLookup: Map<string, TokenRecord>,
  tokenName: string,
  role: "background" | "borderColor",
): string | null {
  const pairing = getTokenByName(tokenLookup, tokenName)?.policy?.pairing;
  if (!pairing || pairing.family !== "container") {
    return null;
  }

  const expectedRole =
    role === "background" ? "container-background" : "container-border-color";

  return pairing.role === expectedRole ? (pairing.level ?? null) : null;
}

function isSeparatorLikeContext(
  contextHint: string | null | undefined,
): boolean {
  return /(separator|divider|splitter)/i.test(contextHint ?? "");
}

function hasSeparableColorMismatch(
  tokenLookup: Map<string, TokenRecord>,
  contextHint: string | null | undefined,
  keyName: string,
  tokenNames: string[],
): boolean {
  if (!isSeparatorLikeContext(contextHint)) {
    return false;
  }

  if (
    !BORDER_COLOR_STYLE_KEYS.has(keyName) &&
    !BACKGROUND_STYLE_KEYS.has(keyName)
  ) {
    return false;
  }

  if (tokenNames.length === 0) {
    return false;
  }

  if (
    hasAnyStructuralRole(tokenLookup, tokenNames, [
      "separator-color",
      "separator-feedback-background",
      "separator-feedback-foreground",
    ])
  ) {
    return false;
  }

  const normalizedTokenNames = tokenNames.map((tokenName) =>
    tokenName.toLowerCase(),
  );

  return normalizedTokenNames.some(
    (tokenName) =>
      tokenName.includes("background") ||
      tokenName.includes("foreground") ||
      tokenName.includes("bordercolor") ||
      tokenName.includes("-border"),
  );
}

export function analyzeStyleAttribute(
  attribute: t.JSXAttribute,
  tokenLookup: Map<string, TokenRecord>,
  contextHint?: string | null,
): TokenPolicyCounts {
  if (!attribute.value || !t.isJSXExpressionContainer(attribute.value)) {
    return createEmptyTokenPolicyCounts();
  }

  const expression = attribute.value.expression;
  if (!t.isObjectExpression(expression)) {
    return createEmptyTokenPolicyCounts();
  }

  const counts = createEmptyTokenPolicyCounts();
  const backgroundContainerLevels = new Set<string>();
  const borderContainerLevels = new Set<string>();

  for (const property of expression.properties) {
    if (!t.isObjectProperty(property) || property.computed) {
      continue;
    }

    const keyName = t.isIdentifier(property.key)
      ? property.key.name
      : t.isStringLiteral(property.key)
        ? property.key.value
        : null;
    if (!keyName || !t.isExpression(property.value)) {
      continue;
    }

    const normalizedKeyName = normalizeStyleKey(keyName);
    const tokenNames = extractSaltTokenNames(property.value);

    if (
      SIZE_STYLE_KEYS.has(normalizedKeyName) &&
      isHardcodedSizeLiteral(property.value)
    ) {
      counts.hardcodedSizeCount += 1;
    }
    if (
      COLOR_STYLE_KEYS.has(normalizedKeyName) &&
      isHardcodedColorLiteral(property.value)
    ) {
      counts.hardcodedColorCount += 1;
    }

    if (
      tokenNames.some((tokenName) => isUnknownSaltToken(tokenLookup, tokenName))
    ) {
      const unknownTokenNames = tokenNames.filter((tokenName) =>
        isUnknownSaltToken(tokenLookup, tokenName),
      );
      counts.unknownSaltTokenCount += unknownTokenNames.length;
      counts.unknownSaltTokenNames = unique([
        ...counts.unknownSaltTokenNames,
        ...unknownTokenNames,
      ]);
    }

    if (
      tokenNames.some((tokenName) =>
        isNeverDirectUseToken(tokenLookup, tokenName),
      )
    ) {
      counts.directPaletteTokenCount += 1;
    }

    const deprecatedTokenNames = tokenNames.filter((tokenName) =>
      isDeprecatedToken(tokenLookup, tokenName),
    );
    if (deprecatedTokenNames.length > 0) {
      counts.deprecatedTokenCount += deprecatedTokenNames.length;
      counts.deprecatedTokenNames = unique([
        ...counts.deprecatedTokenNames,
        ...deprecatedTokenNames,
      ]);
    }

    if (
      usesNonFixedBorderThickness(
        tokenLookup,
        normalizedKeyName,
        property.value,
        tokenNames,
      )
    ) {
      counts.nonFixedBorderThicknessCount += 1;
    }

    if (
      hasSeparableColorMismatch(
        tokenLookup,
        contextHint,
        normalizedKeyName,
        tokenNames,
      )
    ) {
      counts.separatorColorMismatchCount += 1;
    }

    if (BACKGROUND_STYLE_KEYS.has(normalizedKeyName)) {
      for (const tokenName of tokenNames) {
        const level = getContainerPairingLevel(
          tokenLookup,
          tokenName,
          "background",
        );
        if (level) {
          backgroundContainerLevels.add(level);
        }
      }
    }

    if (BORDER_COLOR_STYLE_KEYS.has(normalizedKeyName)) {
      for (const tokenName of tokenNames) {
        const level = getContainerPairingLevel(
          tokenLookup,
          tokenName,
          "borderColor",
        );
        if (level) {
          borderContainerLevels.add(level);
        }
      }
    }
  }

  counts.containerLevelMismatchCount =
    backgroundContainerLevels.size === 1 &&
    borderContainerLevels.size === 1 &&
    [...backgroundContainerLevels][0] !== [...borderContainerLevels][0]
      ? 1
      : 0;

  return counts;
}

export function analyzeCssLikeSource(
  code: string,
  tokenLookup: Map<string, TokenRecord>,
): TokenPolicyCounts {
  const counts = createEmptyTokenPolicyCounts();
  const blockPattern = /([^{}]+)\{([^{}]*)\}/gms;
  let blockMatch: RegExpExecArray | null = blockPattern.exec(code);

  while (blockMatch) {
    const selector = blockMatch[1]?.trim() ?? "";
    const body = blockMatch[2] ?? "";
    const backgroundContainerLevels = new Set<string>();
    const borderContainerLevels = new Set<string>();
    const declarationPattern = /([A-Za-z-]+)\s*:\s*([^;{}]+)\s*;?/g;
    let declarationMatch: RegExpExecArray | null =
      declarationPattern.exec(body);

    while (declarationMatch) {
      const normalizedKeyName = normalizeStyleKey(declarationMatch[1] ?? "");
      const rawValue = (declarationMatch[2] ?? "").trim();
      const tokenNames = extractSaltTokenNamesFromRaw(rawValue);

      if (
        SIZE_STYLE_KEYS.has(normalizedKeyName) &&
        isHardcodedSizeString(rawValue)
      ) {
        counts.hardcodedSizeCount += 1;
      }

      if (
        COLOR_STYLE_KEYS.has(normalizedKeyName) &&
        isHardcodedColorString(rawValue)
      ) {
        counts.hardcodedColorCount += 1;
      }

      if (
        tokenNames.some((tokenName) =>
          isUnknownSaltToken(tokenLookup, tokenName),
        )
      ) {
        const unknownTokenNames = tokenNames.filter((tokenName) =>
          isUnknownSaltToken(tokenLookup, tokenName),
        );
        counts.unknownSaltTokenCount += unknownTokenNames.length;
        counts.unknownSaltTokenNames = unique([
          ...counts.unknownSaltTokenNames,
          ...unknownTokenNames,
        ]);
      }

      if (
        tokenNames.some((tokenName) =>
          isNeverDirectUseToken(tokenLookup, tokenName),
        )
      ) {
        counts.directPaletteTokenCount += 1;
      }

      const deprecatedTokenNames = tokenNames.filter((tokenName) =>
        isDeprecatedToken(tokenLookup, tokenName),
      );
      if (deprecatedTokenNames.length > 0) {
        counts.deprecatedTokenCount += deprecatedTokenNames.length;
        counts.deprecatedTokenNames = unique([
          ...counts.deprecatedTokenNames,
          ...deprecatedTokenNames,
        ]);
      }

      if (
        usesNonFixedBorderThickness(
          tokenLookup,
          normalizedKeyName,
          t.stringLiteral(rawValue),
          tokenNames,
        )
      ) {
        counts.nonFixedBorderThicknessCount += 1;
      }

      if (
        hasSeparableColorMismatch(
          tokenLookup,
          selector,
          normalizedKeyName,
          tokenNames,
        )
      ) {
        counts.separatorColorMismatchCount += 1;
      }

      if (BACKGROUND_STYLE_KEYS.has(normalizedKeyName)) {
        for (const tokenName of tokenNames) {
          const level = getContainerPairingLevel(
            tokenLookup,
            tokenName,
            "background",
          );
          if (level) {
            backgroundContainerLevels.add(level);
          }
        }
      }

      if (BORDER_COLOR_STYLE_KEYS.has(normalizedKeyName)) {
        for (const tokenName of tokenNames) {
          const level = getContainerPairingLevel(
            tokenLookup,
            tokenName,
            "borderColor",
          );
          if (level) {
            borderContainerLevels.add(level);
          }
        }
      }

      declarationMatch = declarationPattern.exec(body);
    }

    if (
      backgroundContainerLevels.size === 1 &&
      borderContainerLevels.size === 1 &&
      [...backgroundContainerLevels][0] !== [...borderContainerLevels][0]
    ) {
      counts.containerLevelMismatchCount += 1;
    }

    blockMatch = blockPattern.exec(code);
  }

  return counts;
}

export function addTokenPolicyIssues(
  addIssue: (issue: ValidationIssue) => void,
  counts: TokenPolicyCounts,
): void {
  if (counts.hardcodedSizeCount > 0) {
    addIssue(
      buildCatalogValidationIssue("tokens.hardcoded-size", {
        evidence: buildEvidence(
          "Detected hard-coded size values in analyzed styling",
          counts.hardcodedSizeCount,
        ),
        matches: counts.hardcodedSizeCount,
      }),
    );
  }

  if (counts.hardcodedColorCount > 0) {
    addIssue(
      buildCatalogValidationIssue("tokens.hardcoded-color", {
        evidence: buildEvidence(
          "Detected hard-coded color values in analyzed styling",
          counts.hardcodedColorCount,
        ),
        matches: counts.hardcodedColorCount,
      }),
    );
  }

  if (counts.unknownSaltTokenCount > 0) {
    const listedTokenNames = counts.unknownSaltTokenNames
      .slice(0, 5)
      .join(", ");
    addIssue(
      buildCatalogValidationIssue("tokens.unknown-salt-token", {
        evidence: buildEvidence(
          `Detected unrecognized Salt token references in analyzed styling${listedTokenNames ? `: ${listedTokenNames}` : ""}`,
          counts.unknownSaltTokenCount,
        ),
        matches: counts.unknownSaltTokenCount,
      }),
    );
  }

  if (counts.directPaletteTokenCount > 0) {
    addIssue(
      buildCatalogValidationIssue("tokens.palette-direct-use", {
        evidence: buildEvidence(
          "Detected direct palette-token references in analyzed styling",
          counts.directPaletteTokenCount,
        ),
        matches: counts.directPaletteTokenCount,
      }),
    );
  }

  if (counts.deprecatedTokenCount > 0) {
    const listedTokenNames = counts.deprecatedTokenNames.slice(0, 5).join(", ");
    addIssue(
      buildCatalogValidationIssue("tokens.deprecated-use", {
        evidence: buildEvidence(
          `Detected deprecated token references in analyzed styling${listedTokenNames ? `: ${listedTokenNames}` : ""}`,
          counts.deprecatedTokenCount,
        ),
        matches: counts.deprecatedTokenCount,
      }),
    );
  }

  if (counts.nonFixedBorderThicknessCount > 0) {
    addIssue(
      buildCatalogValidationIssue("tokens.border-thickness-not-fixed", {
        evidence: buildEvidence(
          "Detected border or separator thickness values that are not fixed-size tokens",
          counts.nonFixedBorderThicknessCount,
        ),
        matches: counts.nonFixedBorderThicknessCount,
      }),
    );
  }

  if (counts.containerLevelMismatchCount > 0) {
    addIssue(
      buildCatalogValidationIssue("tokens.container-level-mismatch", {
        evidence: buildEvidence(
          "Detected container background and border tokens from different levels",
          counts.containerLevelMismatchCount,
        ),
        matches: counts.containerLevelMismatchCount,
      }),
    );
  }

  if (counts.separatorColorMismatchCount > 0) {
    addIssue(
      buildCatalogValidationIssue("tokens.separator-color-not-separable", {
        evidence: buildEvidence(
          "Detected separator-like styling without separable token usage",
          counts.separatorColorMismatchCount,
        ),
        matches: counts.separatorColorMismatchCount,
      }),
    );
  }
}
