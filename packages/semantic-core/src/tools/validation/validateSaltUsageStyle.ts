import * as t from "@babel/types";
import {
  SALT_EVIDENCE_REF_CONTRACT,
  type SaltEvidenceRef,
} from "../../evidence.js";
import { findTokenStructuralRoleRuleEvidence } from "../../tokenPolicyStructuralRoleRules.js";
import type { SaltRegistry, TokenRecord } from "../../types.js";
import { unique } from "../utils.js";
import type { ValidationIssue } from "./shared.js";
import {
  buildEvidence,
  buildWorkflowInputCodeEvidenceRef,
  slugify,
} from "./validateSaltUsageHelpers.js";

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
  directPaletteTokenNames: string[];
  deprecatedTokenCount: number;
  deprecatedTokenNames: string[];
  nonFixedBorderThicknessCount: number;
  nonFixedBorderThicknessTokenNames: string[];
  containerLevelMismatchCount: number;
  containerLevelMismatchTokenNames: string[];
  separatorColorMismatchCount: number;
  separatorColorMismatchTokenNames: string[];
}

export function createEmptyTokenPolicyCounts(): TokenPolicyCounts {
  return {
    hardcodedSizeCount: 0,
    hardcodedColorCount: 0,
    unknownSaltTokenCount: 0,
    unknownSaltTokenNames: [],
    directPaletteTokenCount: 0,
    directPaletteTokenNames: [],
    deprecatedTokenCount: 0,
    deprecatedTokenNames: [],
    nonFixedBorderThicknessCount: 0,
    nonFixedBorderThicknessTokenNames: [],
    containerLevelMismatchCount: 0,
    containerLevelMismatchTokenNames: [],
    separatorColorMismatchCount: 0,
    separatorColorMismatchTokenNames: [],
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
  target.directPaletteTokenNames = unique([
    ...target.directPaletteTokenNames,
    ...source.directPaletteTokenNames,
  ]);
  target.deprecatedTokenCount += source.deprecatedTokenCount;
  target.deprecatedTokenNames = unique([
    ...target.deprecatedTokenNames,
    ...source.deprecatedTokenNames,
  ]);
  target.nonFixedBorderThicknessCount += source.nonFixedBorderThicknessCount;
  target.nonFixedBorderThicknessTokenNames = unique([
    ...target.nonFixedBorderThicknessTokenNames,
    ...source.nonFixedBorderThicknessTokenNames,
  ]);
  target.containerLevelMismatchCount += source.containerLevelMismatchCount;
  target.containerLevelMismatchTokenNames = unique([
    ...target.containerLevelMismatchTokenNames,
    ...source.containerLevelMismatchTokenNames,
  ]);
  target.separatorColorMismatchCount += source.separatorColorMismatchCount;
  target.separatorColorMismatchTokenNames = unique([
    ...target.separatorColorMismatchTokenNames,
    ...source.separatorColorMismatchTokenNames,
  ]);
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

function extractCustomPropertyTokenNames(value: t.Expression): string[] {
  const raw = getStaticStyleValue(value);
  if (!raw) {
    return [];
  }

  return unique(raw.match(/--[A-Za-z0-9-]+/g) ?? []);
}

function extractCustomPropertyTokenNamesFromRaw(raw: string): string[] {
  return unique(raw.match(/--[A-Za-z0-9-]+/g) ?? []);
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
  return (
    getTokenByName(tokenLookup, tokenName)?.policy?.direct_component_use ===
    "never"
  );
}

function getTokenNamespacePrefix(tokenName: string): string | null {
  const match = tokenName.match(/^--[A-Za-z0-9]+-/);
  return match?.[0].toLowerCase() ?? null;
}

function getKnownTokenNamespacePrefixes(
  tokenLookup: Map<string, TokenRecord>,
): string[] {
  return unique(
    [...tokenLookup.keys()]
      .map(getTokenNamespacePrefix)
      .filter((value): value is string => Boolean(value)),
  );
}

function isUnknownRegistryToken(
  tokenLookup: Map<string, TokenRecord>,
  tokenName: string,
): boolean {
  const normalizedTokenName = tokenName.toLowerCase();
  return (
    getKnownTokenNamespacePrefixes(tokenLookup).some((prefix) =>
      normalizedTokenName.startsWith(prefix),
    ) && !tokenLookup.has(normalizedTokenName)
  );
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
  const backgroundContainerTokenNames = new Set<string>();
  const borderContainerTokenNames = new Set<string>();

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
    const tokenNames = extractCustomPropertyTokenNames(property.value);

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
      tokenNames.some((tokenName) =>
        isUnknownRegistryToken(tokenLookup, tokenName),
      )
    ) {
      const unknownTokenNames = tokenNames.filter((tokenName) =>
        isUnknownRegistryToken(tokenLookup, tokenName),
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
      const directUseTokenNames = tokenNames.filter((tokenName) =>
        isNeverDirectUseToken(tokenLookup, tokenName),
      );
      counts.directPaletteTokenCount += 1;
      counts.directPaletteTokenNames = unique([
        ...counts.directPaletteTokenNames,
        ...directUseTokenNames,
      ]);
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
      counts.nonFixedBorderThicknessTokenNames = unique([
        ...counts.nonFixedBorderThicknessTokenNames,
        ...tokenNames.filter((tokenName) => isSizeToken(tokenName)),
      ]);
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
      counts.separatorColorMismatchTokenNames = unique([
        ...counts.separatorColorMismatchTokenNames,
        ...tokenNames,
      ]);
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
          backgroundContainerTokenNames.add(tokenName);
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
          borderContainerTokenNames.add(tokenName);
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
  if (counts.containerLevelMismatchCount > 0) {
    counts.containerLevelMismatchTokenNames = unique([
      ...backgroundContainerTokenNames,
      ...borderContainerTokenNames,
    ]);
  }

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
    const backgroundContainerTokenNames = new Set<string>();
    const borderContainerTokenNames = new Set<string>();
    const declarationPattern = /([A-Za-z-]+)\s*:\s*([^;{}]+)\s*;?/g;
    let declarationMatch: RegExpExecArray | null =
      declarationPattern.exec(body);

    while (declarationMatch) {
      const normalizedKeyName = normalizeStyleKey(declarationMatch[1] ?? "");
      const rawValue = (declarationMatch[2] ?? "").trim();
      const tokenNames = extractCustomPropertyTokenNamesFromRaw(rawValue);

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
          isUnknownRegistryToken(tokenLookup, tokenName),
        )
      ) {
        const unknownTokenNames = tokenNames.filter((tokenName) =>
          isUnknownRegistryToken(tokenLookup, tokenName),
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
        const directUseTokenNames = tokenNames.filter((tokenName) =>
          isNeverDirectUseToken(tokenLookup, tokenName),
        );
        counts.directPaletteTokenCount += 1;
        counts.directPaletteTokenNames = unique([
          ...counts.directPaletteTokenNames,
          ...directUseTokenNames,
        ]);
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
        counts.nonFixedBorderThicknessTokenNames = unique([
          ...counts.nonFixedBorderThicknessTokenNames,
          ...tokenNames.filter((tokenName) => isSizeToken(tokenName)),
        ]);
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
        counts.separatorColorMismatchTokenNames = unique([
          ...counts.separatorColorMismatchTokenNames,
          ...tokenNames,
        ]);
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
            backgroundContainerTokenNames.add(tokenName);
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
            borderContainerTokenNames.add(tokenName);
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
      counts.containerLevelMismatchTokenNames = unique([
        ...counts.containerLevelMismatchTokenNames,
        ...backgroundContainerTokenNames,
        ...borderContainerTokenNames,
      ]);
    }

    blockMatch = blockPattern.exec(code);
  }

  return counts;
}

interface TokenEvidence {
  token: TokenRecord;
  text: string;
  field_path: string;
  evidence_ref: SaltEvidenceRef;
  supporting_evidence_refs: SaltEvidenceRef[];
}

function buildTokenRegistryEvidenceRef(input: {
  registry: Pick<SaltRegistry, "version">;
  token: TokenRecord;
  field_path: string;
  id_suffix: string;
}): SaltEvidenceRef {
  const sourceUrl = input.token.policy?.docs[0] ?? null;

  return {
    contract: SALT_EVIDENCE_REF_CONTRACT,
    id: `${slugify(input.token.name)}.${input.id_suffix}.validation-ref`,
    source_kind: "registry",
    claim_kind: "token",
    registry: {
      entity_type: "token",
      entity_id: input.token.name,
      entity_name: input.token.name,
      field_path: input.field_path,
      registry_version: input.registry.version,
    },
    source: sourceUrl ? { url: sourceUrl } : null,
    confidence: "high",
    verified_at: input.token.last_verified_at,
  };
}

function tokenStructuralRoleRuleEvidenceRefs(
  registry: Pick<
    SaltRegistry,
    "token_policy_structural_role_rule_pack" | "version"
  >,
  token: TokenRecord,
  structuralRole: string,
): SaltEvidenceRef[] {
  const rulePack = registry.token_policy_structural_role_rule_pack;
  if (!rulePack) {
    return [];
  }

  return findTokenStructuralRoleRuleEvidence({
    rule_pack: rulePack,
    token,
    structural_role: structuralRole,
  });
}

function hasSourceBackedStructuralRole(
  registry: Pick<
    SaltRegistry,
    "token_policy_structural_role_rule_pack" | "version"
  >,
  token: TokenRecord,
  structuralRole: string,
): boolean {
  return (
    (token.policy?.structural_roles ?? []).includes(structuralRole) &&
    tokenStructuralRoleRuleEvidenceRefs(registry, token, structuralRole)
      .length > 0
  );
}

function hasAnySourceBackedStructuralRole(
  registry: Pick<
    SaltRegistry,
    "token_policy_structural_role_rule_pack" | "version"
  >,
  token: TokenRecord,
  structuralRoles: string[],
): boolean {
  return structuralRoles.some((role) =>
    hasSourceBackedStructuralRole(registry, token, role),
  );
}

function tokenSourceUrls(token: TokenRecord): string[] {
  return unique(token.policy?.docs ?? []);
}

function tokenTextCandidates(
  token: TokenRecord,
): Array<{ text: string; field_path: string }> {
  return [
    ...(token.policy?.notes ?? []).map((text, index) => ({
      text,
      field_path: `policy.notes.${index}`,
    })),
    ...token.guidance.map((text, index) => ({
      text,
      field_path: `guidance.${index}`,
    })),
    ...(token.policy?.preferred_for ?? []).map((text, index) => ({
      text,
      field_path: `policy.preferred_for.${index}`,
    })),
    ...(token.policy?.avoid_for ?? []).map((text, index) => ({
      text,
      field_path: `policy.avoid_for.${index}`,
    })),
    ...(token.semantic_intent
      ? [{ text: token.semantic_intent, field_path: "semantic_intent" }]
      : []),
  ].filter((candidate) => candidate.text.trim().length > 0);
}

function buildTokenEvidence(input: {
  registry: Pick<SaltRegistry, "version">;
  token: TokenRecord;
  id_suffix: string;
  predicate?: (candidate: { text: string; field_path: string }) => boolean;
  fallback_field_path?: string;
  fallback_text?: string;
  supporting_evidence_refs?: SaltEvidenceRef[];
}): TokenEvidence | null {
  const candidate =
    tokenTextCandidates(input.token).find(input.predicate ?? (() => true)) ??
    (input.fallback_field_path && input.fallback_text
      ? {
          text: input.fallback_text,
          field_path: input.fallback_field_path,
        }
      : null);
  if (!candidate) {
    return null;
  }

  return {
    token: input.token,
    text: candidate.text,
    field_path: candidate.field_path,
    supporting_evidence_refs: input.supporting_evidence_refs ?? [],
    evidence_ref: buildTokenRegistryEvidenceRef({
      registry: input.registry,
      token: input.token,
      field_path: candidate.field_path,
      id_suffix: input.id_suffix,
    }),
  };
}

function findTokenEvidence(input: {
  registry: Pick<
    SaltRegistry,
    "tokens" | "version" | "token_policy_structural_role_rule_pack"
  >;
  id_suffix: string;
  predicate: (token: TokenRecord) => boolean;
  guidance_predicate?: (candidate: {
    text: string;
    field_path: string;
  }) => boolean;
  supporting_evidence_refs?: (token: TokenRecord) => SaltEvidenceRef[];
}): TokenEvidence | null {
  const token = input.registry.tokens
    .filter(input.predicate)
    .sort((left, right) => left.name.localeCompare(right.name))[0];
  if (!token) {
    return null;
  }

  return buildTokenEvidence({
    registry: input.registry,
    token,
    id_suffix: input.id_suffix,
    predicate: input.guidance_predicate,
    supporting_evidence_refs: input.supporting_evidence_refs?.(token) ?? [],
  });
}

function findTokenEvidenceByNames(input: {
  registry: Pick<
    SaltRegistry,
    "tokens" | "version" | "token_policy_structural_role_rule_pack"
  >;
  token_names: string[];
  id_suffix: string;
  guidance_predicate?: (candidate: {
    text: string;
    field_path: string;
  }) => boolean;
  fallback?: (token: TokenRecord) => {
    text: string;
    field_path: string;
    supporting_evidence_refs?: SaltEvidenceRef[];
  } | null;
  supporting_evidence_refs?: (token: TokenRecord) => SaltEvidenceRef[];
}): TokenEvidence[] {
  return unique(input.token_names)
    .map((tokenName) =>
      input.registry.tokens.find(
        (token) => token.name.toLowerCase() === tokenName.toLowerCase(),
      ),
    )
    .filter((token): token is TokenRecord => Boolean(token))
    .map((token) => {
      const fallback = input.fallback?.(token) ?? null;
      return buildTokenEvidence({
        registry: input.registry,
        token,
        id_suffix: input.id_suffix,
        predicate: input.guidance_predicate,
        fallback_field_path: fallback?.field_path,
        fallback_text: fallback?.text,
        supporting_evidence_refs:
          fallback?.supporting_evidence_refs ??
          input.supporting_evidence_refs?.(token) ??
          [],
      });
    })
    .filter((evidence): evidence is TokenEvidence => Boolean(evidence));
}

function uniqueEvidenceRefs(refs: SaltEvidenceRef[]): SaltEvidenceRef[] {
  return refs.filter(
    (ref, index) =>
      refs.findIndex((candidate) => candidate.id === ref.id) === index,
  );
}

function buildTokenRecommendationHint(
  tokenEvidence: TokenEvidence[],
): ValidationIssue["fix_hints"] {
  const firstToken = tokenEvidence[0]?.token;
  if (!firstToken) {
    return undefined;
  }

  return {
    token_recommendation: {
      query: unique(
        tokenEvidence.flatMap(({ token, text }) => [
          text,
          token.semantic_intent ?? "",
          ...(token.policy?.preferred_for ?? []),
          ...(token.policy?.structural_roles ?? []),
        ]),
      )
        .filter((value) => value.trim().length > 0)
        .join(" "),
      category:
        firstToken.policy?.direct_component_use === "never"
          ? undefined
          : firstToken.category,
      top_k: Math.min(Math.max(tokenEvidence.length, 3), 4),
    },
  };
}

function buildTokenPolicyIssue(input: {
  id: string;
  category: ValidationIssue["category"];
  rule: string;
  severity?: ValidationIssue["severity"];
  title: string;
  message: string;
  evidence_summary: string;
  suggested_fix: string | null;
  confidence: number;
  matches: number;
  token_evidence: TokenEvidence[];
  recommendation_token_evidence?: TokenEvidence[];
  include_token_recommendation?: boolean;
}): ValidationIssue {
  const sourceUrls = unique(
    input.token_evidence.flatMap(({ token }) => tokenSourceUrls(token)),
  );
  const evidenceRefs = uniqueEvidenceRefs([
    ...input.token_evidence.flatMap((evidence) => [
      evidence.evidence_ref,
      ...evidence.supporting_evidence_refs,
    ]),
    buildWorkflowInputCodeEvidenceRef({
      id: input.id,
      note: "Validator matched token-related styling in source code supplied to validateSaltUsage.",
    }),
  ]);

  return {
    id: input.id,
    category: input.category,
    rule: input.rule,
    severity: input.severity ?? "warning",
    title: input.title,
    message: input.message,
    evidence: buildEvidence(input.evidence_summary, input.matches),
    canonical_source: sourceUrls[0] ?? null,
    suggested_fix: input.suggested_fix,
    confidence: input.confidence,
    source_urls: sourceUrls,
    evidence_refs: evidenceRefs,
    matches: input.matches,
    fix_hints: input.include_token_recommendation
      ? buildTokenRecommendationHint(
          input.recommendation_token_evidence ?? input.token_evidence,
        )
      : undefined,
  };
}

function tokenGuidanceMessage(tokenEvidence: TokenEvidence[]): string {
  return tokenEvidence
    .map(({ token, text }) => `${token.name}: ${text}`)
    .join(" ");
}

function tokenGuidanceFix(tokenEvidence: TokenEvidence[]): string | null {
  const firstEvidence = tokenEvidence[0];
  return firstEvidence
    ? `Follow ${firstEvidence.token.name}: ${firstEvidence.text}`
    : null;
}

function addMissingTokenEvidence(
  missingData: string[],
  rule: string,
  reason: string,
): void {
  missingData.push(`Skipped ${rule} token validation because ${reason}.`);
}

export function addTokenPolicyIssues(input: {
  registry: SaltRegistry;
  addIssue: (issue: ValidationIssue) => void;
  counts: TokenPolicyCounts;
  missingData: string[];
}): void {
  const { registry, addIssue, counts, missingData } = input;
  if (counts.hardcodedSizeCount > 0) {
    const tokenEvidence = findTokenEvidence({
      registry,
      id_suffix: "hardcoded-size-guidance",
      predicate: (token) => token.type === "dimension" && !token.deprecated,
    });
    if (!tokenEvidence) {
      addMissingTokenEvidence(
        missingData,
        "hardcoded-size",
        "registry token guidance for dimension values was missing",
      );
    } else {
      addIssue(
        buildTokenPolicyIssue({
          id: "tokens.hardcoded-size",
          category: "tokens",
          rule: "no-hardcoded-size-values",
          title: "Hard-coded sizing value detected",
          message: `Hard-coded sizing values were detected. ${tokenGuidanceMessage([tokenEvidence])}`,
          evidence_summary:
            "Detected hard-coded size values in analyzed styling",
          suggested_fix: tokenGuidanceFix([tokenEvidence]),
          confidence: 0.82,
          token_evidence: [tokenEvidence],
          include_token_recommendation: true,
          matches: counts.hardcodedSizeCount,
        }),
      );
    }
  }

  if (counts.hardcodedColorCount > 0) {
    const tokenEvidence = findTokenEvidence({
      registry,
      id_suffix: "hardcoded-color-guidance",
      predicate: (token) =>
        token.type === "color" &&
        !token.deprecated &&
        token.policy?.direct_component_use !== "never",
    });
    if (!tokenEvidence) {
      addMissingTokenEvidence(
        missingData,
        "hardcoded-color",
        "registry token guidance for color values was missing",
      );
    } else {
      addIssue(
        buildTokenPolicyIssue({
          id: "tokens.hardcoded-color",
          category: "tokens",
          rule: "no-hardcoded-color-values",
          title: "Hard-coded color value detected",
          message: `Hard-coded color values were detected. ${tokenGuidanceMessage([tokenEvidence])}`,
          evidence_summary:
            "Detected hard-coded color values in analyzed styling",
          suggested_fix: tokenGuidanceFix([tokenEvidence]),
          confidence: 0.82,
          token_evidence: [tokenEvidence],
          include_token_recommendation: true,
          matches: counts.hardcodedColorCount,
        }),
      );
    }
  }

  if (counts.unknownSaltTokenCount > 0) {
    const listedTokenNames = counts.unknownSaltTokenNames
      .slice(0, 5)
      .join(", ");
    addIssue({
      id: "tokens.unknown-salt-token",
      category: "tokens",
      rule: "only-use-known-salt-token-names",
      severity: "warning",
      title: "Unrecognized registry token name detected",
      message: `Styling references registry-looking token names that were not found in the supplied registry${listedTokenNames ? `: ${listedTokenNames}` : ""}.`,
      evidence: buildEvidence(
        `Detected unrecognized registry token references in analyzed styling${listedTokenNames ? `: ${listedTokenNames}` : ""}`,
        counts.unknownSaltTokenCount,
      ),
      canonical_source: null,
      suggested_fix: null,
      confidence: 0.88,
      source_urls: [],
      evidence_refs: [
        buildWorkflowInputCodeEvidenceRef({
          id: "tokens.unknown-salt-token",
          note: "Validator matched registry-looking token references in source code supplied to validateSaltUsage.",
        }),
      ],
      matches: counts.unknownSaltTokenCount,
    });
  }

  if (counts.directPaletteTokenCount > 0) {
    const tokenEvidence = findTokenEvidenceByNames({
      registry,
      token_names: counts.directPaletteTokenNames,
      id_suffix: "direct-use-policy",
      guidance_predicate: ({ text }) => /\bdirect\b|\bcomponent\b/i.test(text),
      fallback: (token) =>
        token.policy?.direct_component_use === "never"
          ? {
              text: token.policy.direct_component_use,
              field_path: "policy.direct_component_use",
            }
          : null,
    });
    if (tokenEvidence.length === 0) {
      addMissingTokenEvidence(
        missingData,
        "palette-direct-use",
        "registry token policy evidence for direct-use restrictions was missing",
      );
    } else {
      addIssue(
        buildTokenPolicyIssue({
          id: "tokens.palette-direct-use",
          category: "tokens",
          rule: "no-direct-palette-token-use",
          title: "Token disallowed for direct component styling",
          message: tokenGuidanceMessage(tokenEvidence),
          evidence_summary:
            "Detected direct references to tokens whose registry policy disallows direct component use",
          suggested_fix: tokenGuidanceFix(tokenEvidence),
          confidence: 0.9,
          token_evidence: tokenEvidence,
          include_token_recommendation: true,
          matches: counts.directPaletteTokenCount,
        }),
      );
    }
  }

  if (counts.deprecatedTokenCount > 0) {
    const tokenEvidence = findTokenEvidenceByNames({
      registry,
      token_names: counts.deprecatedTokenNames,
      id_suffix: "deprecated-policy",
      fallback: (token) =>
        token.deprecated
          ? {
              text: "true",
              field_path: "deprecated",
            }
          : null,
    });
    if (tokenEvidence.length === 0) {
      addMissingTokenEvidence(
        missingData,
        "deprecated-use",
        "registry evidence for deprecated token fields was missing",
      );
    } else {
      addIssue(
        buildTokenPolicyIssue({
          id: "tokens.deprecated-use",
          category: "deprecated",
          rule: "no-deprecated-token-use",
          title: "Deprecated token used in styling",
          message: tokenGuidanceMessage(tokenEvidence),
          evidence_summary: `Detected deprecated token references in analyzed styling: ${counts.deprecatedTokenNames
            .slice(0, 5)
            .join(", ")}`,
          suggested_fix: tokenGuidanceFix(tokenEvidence),
          confidence: 0.9,
          token_evidence: tokenEvidence,
          matches: counts.deprecatedTokenCount,
        }),
      );
    }
  }

  if (counts.nonFixedBorderThicknessCount > 0) {
    const tokenEvidence = findTokenEvidence({
      registry,
      id_suffix: "fixed-border-thickness-guidance",
      predicate: (token) =>
        !token.deprecated &&
        hasAnySourceBackedStructuralRole(registry, token, [
          "border-thickness",
          "separator-thickness",
        ]),
      guidance_predicate: ({ text }) =>
        /\bborder\b|\bseparator\b|\bthickness\b|\bfixed\b/i.test(text),
      supporting_evidence_refs: (token) => [
        ...tokenStructuralRoleRuleEvidenceRefs(
          registry,
          token,
          "border-thickness",
        ),
        ...tokenStructuralRoleRuleEvidenceRefs(
          registry,
          token,
          "separator-thickness",
        ),
      ],
    });
    if (!tokenEvidence) {
      addMissingTokenEvidence(
        missingData,
        "border-thickness-not-fixed",
        "source-backed structural-role rule-pack evidence for fixed border or separator thickness was missing",
      );
    } else {
      const offendingEvidence = findTokenEvidenceByNames({
        registry,
        token_names: counts.nonFixedBorderThicknessTokenNames,
        id_suffix: "non-fixed-border-thickness-observed-token",
      });
      const tokenEvidenceSet = uniqueTokenEvidence([
        ...offendingEvidence,
        tokenEvidence,
      ]);
      addIssue(
        buildTokenPolicyIssue({
          id: "tokens.border-thickness-not-fixed",
          category: "tokens",
          rule: "border-thickness-uses-fixed-size-token",
          title: "Border thickness should use fixed token guidance",
          message: tokenGuidanceMessage(tokenEvidenceSet),
          evidence_summary:
            "Detected border or separator thickness values without fixed thickness token guidance",
          suggested_fix: tokenGuidanceFix([tokenEvidence]),
          confidence: 0.9,
          token_evidence: tokenEvidenceSet,
          recommendation_token_evidence: [tokenEvidence],
          include_token_recommendation: true,
          matches: counts.nonFixedBorderThicknessCount,
        }),
      );
    }
  }

  if (counts.containerLevelMismatchCount > 0) {
    const tokenEvidence = findTokenEvidenceByNames({
      registry,
      token_names: counts.containerLevelMismatchTokenNames,
      id_suffix: "container-pairing-policy",
      guidance_predicate: ({ text }) =>
        /\bpair\b|\bcontainer\b|\blevel\b|\bborder\b|\bbackground\b/i.test(
          text,
        ),
      fallback: (token) =>
        token.policy?.pairing &&
        tokenStructuralRoleRuleEvidenceRefs(
          registry,
          token,
          token.policy.pairing.role,
        ).length > 0
          ? {
              text: [
                token.policy.pairing.family,
                token.policy.pairing.role,
                token.policy.pairing.level,
              ]
                .filter(Boolean)
                .join(" "),
              field_path: "policy.pairing",
              supporting_evidence_refs: tokenStructuralRoleRuleEvidenceRefs(
                registry,
                token,
                token.policy.pairing.role,
              ),
            }
          : null,
    });
    if (tokenEvidence.length === 0) {
      addMissingTokenEvidence(
        missingData,
        "container-level-mismatch",
        "source-backed structural-role rule-pack evidence for token pairing was missing",
      );
    } else {
      addIssue(
        buildTokenPolicyIssue({
          id: "tokens.container-level-mismatch",
          category: "tokens",
          rule: "container-background-border-levels-match",
          title: "Container background and border levels should match",
          message: tokenGuidanceMessage(tokenEvidence),
          evidence_summary:
            "Detected container background and border tokens from different registry pairing levels",
          suggested_fix: tokenGuidanceFix(tokenEvidence),
          confidence: 0.9,
          token_evidence: tokenEvidence,
          include_token_recommendation: true,
          matches: counts.containerLevelMismatchCount,
        }),
      );
    }
  }

  if (counts.separatorColorMismatchCount > 0) {
    const tokenEvidence = findTokenEvidence({
      registry,
      id_suffix: "separator-color-guidance",
      predicate: (token) =>
        !token.deprecated &&
        hasSourceBackedStructuralRole(registry, token, "separator-color"),
      guidance_predicate: ({ text }) =>
        /\bseparable\b|\bdivider\b|\bseparator\b/i.test(text),
      supporting_evidence_refs: (token) =>
        tokenStructuralRoleRuleEvidenceRefs(registry, token, "separator-color"),
    });
    if (!tokenEvidence) {
      addMissingTokenEvidence(
        missingData,
        "separator-color-not-separable",
        "source-backed structural-role rule-pack evidence for separator color was missing",
      );
    } else {
      const offendingEvidence = findTokenEvidenceByNames({
        registry,
        token_names: counts.separatorColorMismatchTokenNames,
        id_suffix: "separator-mismatch-observed-token",
      });
      const tokenEvidenceSet = uniqueTokenEvidence([
        ...offendingEvidence,
        tokenEvidence,
      ]);
      addIssue(
        buildTokenPolicyIssue({
          id: "tokens.separator-color-not-separable",
          category: "tokens",
          rule: "separators-use-separable-tokens",
          title: "Separators should use separator token guidance",
          message: tokenGuidanceMessage(tokenEvidenceSet),
          evidence_summary:
            "Detected separator-like styling without separator token guidance",
          suggested_fix: tokenGuidanceFix([tokenEvidence]),
          confidence: 0.84,
          token_evidence: tokenEvidenceSet,
          recommendation_token_evidence: [tokenEvidence],
          include_token_recommendation: true,
          matches: counts.separatorColorMismatchCount,
        }),
      );
    }
  }
}

function uniqueTokenEvidence(tokenEvidence: TokenEvidence[]): TokenEvidence[] {
  return tokenEvidence.filter(
    (evidence, index) =>
      tokenEvidence.findIndex(
        (candidate) => candidate.token.name === evidence.token.name,
      ) === index,
  );
}
