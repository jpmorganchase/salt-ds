import {
  SALT_EVIDENCE_REF_CONTRACT,
  type SaltEvidenceRef,
  type SaltEvidenceValidationIssue,
  validateEvidenceRef,
} from "./evidence.js";
import type { TokenRecord } from "./types.js";

export const SALT_TOKEN_POLICY_STRUCTURAL_ROLE_RULE_PACK_CONTRACT =
  "salt_token_policy_structural_role_rule_pack_v1" as const;

export type SaltTokenPolicyStructuralRoleRuleKind =
  | "container-pairing"
  | "separable-token"
  | "fixed-size"
  | "border-style";

export interface TokenPolicyStructuralRoleRuleSource {
  route: string;
  repo_path: string;
}

export interface TokenPolicyStructuralRoleRuleInput {
  id: string;
  category: string;
  kind: SaltTokenPolicyStructuralRoleRuleKind;
  source: TokenPolicyStructuralRoleRuleSource;
  evidence_text: string;
  evidence_terms: string[];
  token_family?: string;
  token_property?: string;
  token_modifier?: string;
}

export interface SaltTokenPolicyStructuralRoleRuleMatch {
  category: string;
  token_family?: string | null;
  token_property?: string | null;
  token_modifier?: string | null;
}

export interface SaltTokenPolicyStructuralRolePairingTemplate {
  family: string;
  role: string;
  level?: string | null;
}

export interface SaltTokenPolicyStructuralRoleRuleEmits {
  structural_role_templates: string[];
  pairing_template?: SaltTokenPolicyStructuralRolePairingTemplate | null;
  conditions: string[];
}

export interface SaltTokenPolicyStructuralRoleRuleRecord {
  id: string;
  category: string;
  kind: SaltTokenPolicyStructuralRoleRuleKind;
  match: SaltTokenPolicyStructuralRoleRuleMatch;
  emits: SaltTokenPolicyStructuralRoleRuleEmits;
  evidence_text: string;
  evidence_terms: string[];
  evidence_refs: SaltEvidenceRef[];
  canonical_source?: string | null;
  source_urls?: string[];
}

export interface SaltTokenPolicyStructuralRoleRulePackGenerator {
  name: string;
  version?: string | null;
}

export interface SaltTokenPolicyStructuralRoleRulePackRegistry {
  version?: string | null;
  hash?: string | null;
  generated_at?: string | null;
}

export interface SaltTokenPolicyStructuralRoleRulePack {
  contract: typeof SALT_TOKEN_POLICY_STRUCTURAL_ROLE_RULE_PACK_CONTRACT;
  id: string;
  generated_at: string;
  generator: SaltTokenPolicyStructuralRoleRulePackGenerator;
  registry: SaltTokenPolicyStructuralRoleRulePackRegistry;
  rules: SaltTokenPolicyStructuralRoleRuleRecord[];
}

export type SaltTokenPolicyStructuralRoleRulePackIssueCode =
  | "invalid_rule_pack_contract"
  | "missing_rule_evidence"
  | "invalid_rule_evidence_ref"
  | "missing_source_backed_rule_evidence"
  | "missing_emitted_structural_role";

export interface SaltTokenPolicyStructuralRoleRulePackIssue {
  code: SaltTokenPolicyStructuralRoleRulePackIssueCode;
  message: string;
  path: string;
}

interface TokenNameParts {
  family: string;
  modifiers: string[];
  property: string | null;
}

function hasText(value: string | null | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function normalizeCategory(value: string): string {
  return value.trim().toLowerCase();
}

function toRoleSegment(value: string): string {
  return normalizeWhitespace(value)
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

function slugify(value: string): string {
  return toRoleSegment(value) || "rule";
}

function unique<T>(values: T[]): T[] {
  return [...new Set(values)];
}

function parseTokenName(tokenName: string): TokenNameParts | null {
  if (!tokenName.startsWith("--salt-")) {
    return null;
  }

  const [family, ...rest] = tokenName.slice("--salt-".length).split("-");
  if (!family) {
    return null;
  }

  return {
    family: normalizeCategory(family),
    modifiers: rest.slice(0, -1).map(normalizeCategory),
    property: rest.at(-1) ?? null,
  };
}

function tokenPropertyRoleSegment(
  property: string | null,
  options: { collapseBorderColor?: boolean } = {},
): string | null {
  if (!property) {
    return null;
  }

  const segment = toRoleSegment(property);
  return options.collapseBorderColor && segment === "border-color"
    ? "color"
    : segment;
}

function hasSourceLocator(ref: SaltEvidenceRef): boolean {
  return hasText(ref.source?.url) || hasText(ref.source?.repo_path);
}

function toRuleEvidenceRef(
  rule: TokenPolicyStructuralRoleRuleInput,
  index: number,
): SaltEvidenceRef {
  return {
    contract: SALT_EVIDENCE_REF_CONTRACT,
    id: `${slugify(rule.id)}.structural-role-rule.${index}.source-ref`,
    source_kind: "docs",
    claim_kind: "token",
    source: {
      url: rule.source.route,
      repo_path: rule.source.repo_path,
    },
    confidence: "high",
    note: "Source-backed docs evidence for generated token structural-role rules.",
  };
}

function sourceContainsTerm(rule: TokenPolicyStructuralRoleRuleInput): boolean {
  return /\bfeedback\b/i.test(rule.evidence_text);
}

function borderStyleRoleTemplates(
  rule: TokenPolicyStructuralRoleRuleInput,
): string[] {
  const styleSegment = toRoleSegment(
    rule.category.replace(/style$/i, " style"),
  );
  const templates: string[] = [];

  for (const term of rule.evidence_terms) {
    if (term === "border") {
      if (/\bdefault value\b/i.test(rule.evidence_text)) {
        templates.push(`${styleSegment}-default`);
      }
      continue;
    }
    if (term === "divider" && /\bdefault value\b/i.test(rule.evidence_text)) {
      templates.push(`${term}-style-default`);
      continue;
    }
    templates.push(`${term}-${styleSegment}`);
  }

  return templates;
}

function structuralRoleTemplatesForRule(
  rule: TokenPolicyStructuralRoleRuleInput,
): string[] {
  switch (rule.kind) {
    case "container-pairing":
      return ["{token_family}-{token_property}"];
    case "separable-token": {
      const templates = rule.evidence_terms.map(
        (term) => `${term}-{token_property_role}`,
      );
      return sourceContainsTerm(rule)
        ? [
            ...templates,
            ...rule.evidence_terms.map(
              (term) => `${term}-feedback-{token_property_role}`,
            ),
          ]
        : templates;
    }
    case "fixed-size":
      return rule.evidence_terms.map((term) => `${term}-thickness`);
    case "border-style":
      return borderStyleRoleTemplates(rule);
    default:
      return [];
  }
}

function conditionsForRule(rule: TokenPolicyStructuralRoleRuleInput): string[] {
  switch (rule.kind) {
    case "container-pairing":
      return [
        "Token family, first modifier, and token property are required.",
        "The first token modifier resolves the pairing level.",
      ];
    case "separable-token":
      return sourceContainsTerm(rule)
        ? [
            "Token family and token property are required.",
            "Feedback role templates require a token source section that includes feedback.",
          ]
        : ["Token family and token property are required."];
    case "fixed-size":
      return [
        "Token family and configured token modifier are required.",
        "The rule source excerpt must mention the token name.",
      ];
    case "border-style":
      return [
        "Token family and token property must match the documented style.",
      ];
    default:
      return [];
  }
}

function pairingTemplateForRule(
  rule: TokenPolicyStructuralRoleRuleInput,
): SaltTokenPolicyStructuralRolePairingTemplate | null {
  return rule.kind === "container-pairing"
    ? {
        family: "{token_family}",
        role: "{token_family}-{token_property}",
        level: "{first_modifier}",
      }
    : null;
}

function toRuleRecord(
  rule: TokenPolicyStructuralRoleRuleInput,
  index: number,
): SaltTokenPolicyStructuralRoleRuleRecord {
  const evidenceRef = toRuleEvidenceRef(rule, index);

  return {
    id: rule.id,
    category: rule.category,
    kind: rule.kind,
    match: {
      category: rule.category,
      token_family: rule.token_family ?? null,
      token_property: rule.token_property ?? null,
      token_modifier: rule.token_modifier ?? null,
    },
    emits: {
      structural_role_templates: structuralRoleTemplatesForRule(rule),
      pairing_template: pairingTemplateForRule(rule),
      conditions: conditionsForRule(rule),
    },
    evidence_text: rule.evidence_text,
    evidence_terms: rule.evidence_terms,
    evidence_refs: [evidenceRef],
    canonical_source: evidenceRef.source?.url ?? null,
    source_urls: evidenceRef.source?.url ? [evidenceRef.source.url] : [],
  };
}

export function buildTokenPolicyStructuralRoleRulePack(input: {
  structural_role_rules: readonly TokenPolicyStructuralRoleRuleInput[];
  generated_at: string;
  generator: SaltTokenPolicyStructuralRoleRulePackGenerator;
  registry: SaltTokenPolicyStructuralRoleRulePackRegistry;
  id?: string;
}): SaltTokenPolicyStructuralRoleRulePack {
  return {
    contract: SALT_TOKEN_POLICY_STRUCTURAL_ROLE_RULE_PACK_CONTRACT,
    id: input.id ?? "token-policy-structural-role-rules",
    generated_at: input.generated_at,
    generator: input.generator,
    registry: input.registry,
    rules: input.structural_role_rules.map(toRuleRecord),
  };
}

function toRulePackIssue(
  issue: SaltEvidenceValidationIssue,
): SaltTokenPolicyStructuralRoleRulePackIssue {
  return {
    code: "invalid_rule_evidence_ref",
    message: issue.message,
    path: issue.path,
  };
}

export function validateTokenPolicyStructuralRoleRulePackEvidence(
  pack: SaltTokenPolicyStructuralRoleRulePack,
): SaltTokenPolicyStructuralRoleRulePackIssue[] {
  const issues: SaltTokenPolicyStructuralRoleRulePackIssue[] = [];

  if (pack.contract !== SALT_TOKEN_POLICY_STRUCTURAL_ROLE_RULE_PACK_CONTRACT) {
    issues.push({
      code: "invalid_rule_pack_contract",
      message: `Token policy structural-role rule pack '${pack.id}' must use ${SALT_TOKEN_POLICY_STRUCTURAL_ROLE_RULE_PACK_CONTRACT}.`,
      path: "contract",
    });
  }

  pack.rules.forEach((rule, ruleIndex) => {
    const rulePath = `rules[${ruleIndex}]`;

    if (rule.evidence_refs.length === 0) {
      issues.push({
        code: "missing_rule_evidence",
        message: `Token policy structural-role rule '${rule.id}' must include at least one evidence ref.`,
        path: `${rulePath}.evidence_refs`,
      });
    }

    if (
      !rule.evidence_refs.some(
        (ref) =>
          (ref.source_kind === "docs" ||
            ref.source_kind === "source" ||
            ref.source_kind === "token") &&
          hasSourceLocator(ref),
      )
    ) {
      issues.push({
        code: "missing_source_backed_rule_evidence",
        message: `Token policy structural-role rule '${rule.id}' must include source-backed evidence.`,
        path: `${rulePath}.evidence_refs`,
      });
    }

    rule.evidence_refs.forEach((ref, refIndex) => {
      issues.push(
        ...validateEvidenceRef(
          ref,
          `${rulePath}.evidence_refs[${refIndex}]`,
        ).map(toRulePackIssue),
      );
    });

    if (rule.emits.structural_role_templates.length === 0) {
      issues.push({
        code: "missing_emitted_structural_role",
        message: `Token policy structural-role rule '${rule.id}' must declare at least one structural role template.`,
        path: `${rulePath}.emits.structural_role_templates`,
      });
    }
  });

  return issues;
}

function roleTemplatesForToken(
  rule: SaltTokenPolicyStructuralRoleRuleRecord,
  token: Pick<TokenRecord, "name" | "category">,
): string[] {
  const tokenParts = parseTokenName(token.name);
  const property = tokenPropertyRoleSegment(tokenParts?.property ?? null);
  const propertyRole = tokenPropertyRoleSegment(tokenParts?.property ?? null, {
    collapseBorderColor: true,
  });
  if (!tokenParts || !property || !propertyRole) {
    return [];
  }

  if (
    normalizeCategory(rule.match.category) !== normalizeCategory(token.category)
  ) {
    return [];
  }
  if (
    hasText(rule.match.token_family) &&
    normalizeCategory(rule.match.token_family) !== tokenParts.family
  ) {
    return [];
  }
  if (
    hasText(rule.match.token_modifier) &&
    !tokenParts.modifiers.includes(
      normalizeCategory(rule.match.token_modifier),
    ) &&
    normalizeCategory(tokenParts.property ?? "") !==
      normalizeCategory(rule.match.token_modifier)
  ) {
    return [];
  }
  if (
    hasText(rule.match.token_property) &&
    normalizeCategory(rule.match.token_property) !==
      normalizeCategory(tokenParts.property ?? "")
  ) {
    return [];
  }

  return rule.emits.structural_role_templates.map((template) =>
    template
      .replace(/\{token_family\}/gu, tokenParts.family)
      .replace(/\{token_property\}/gu, property)
      .replace(/\{token_property_role\}/gu, propertyRole)
      .replace(/\{first_modifier\}/gu, tokenParts.modifiers[0] ?? ""),
  );
}

export function findTokenStructuralRoleRuleEvidence(input: {
  rule_pack: SaltTokenPolicyStructuralRoleRulePack;
  token: Pick<TokenRecord, "name" | "category">;
  structural_role: string;
}): SaltEvidenceRef[] {
  return unique(
    input.rule_pack.rules
      .filter((rule) =>
        roleTemplatesForToken(rule, input.token).includes(
          input.structural_role,
        ),
      )
      .flatMap((rule) => rule.evidence_refs),
  );
}
