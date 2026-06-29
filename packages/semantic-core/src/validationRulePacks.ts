import {
  type SaltEvidenceRef,
  type SaltEvidenceValidationIssue,
  validateEvidenceRef,
} from "./evidence.js";
import type {
  ValidationCategory,
  ValidationIssue,
  ValidationSeverity,
} from "./tools/validation/shared.js";
import type { SaltRegistry } from "./types.js";

export const SALT_VALIDATION_RULE_PACK_CONTRACT =
  "salt_validation_rule_pack_v1" as const;

interface SaltValidationRuleComponentJsxAttributeMatch {
  kind: "component_jsx_attribute";
  component_id: string;
  attribute_names: string[];
}

type SaltValidationRuleMatch = SaltValidationRuleComponentJsxAttributeMatch;

export interface SaltValidationRuleRecord {
  id: string;
  category: ValidationCategory;
  rule: string;
  severity: ValidationSeverity;
  title: string;
  message: string;
  suggested_fix: string | null;
  confidence: number;
  match: SaltValidationRuleMatch;
  evidence_refs: SaltEvidenceRef[];
  canonical_source?: string | null;
  source_urls?: string[];
}

export interface SaltValidationRulePackGenerator {
  name: string;
  version?: string | null;
}

export interface SaltValidationRulePackRegistry {
  version?: string | null;
  hash?: string | null;
  generated_at?: string | null;
}

export interface SaltValidationRulePack {
  contract: typeof SALT_VALIDATION_RULE_PACK_CONTRACT;
  id: string;
  generated_at: string;
  generator: SaltValidationRulePackGenerator;
  registry: SaltValidationRulePackRegistry;
  rules: SaltValidationRuleRecord[];
}

type SaltValidationRulePackIssueCode =
  | "invalid_rule_pack_contract"
  | "missing_rule_evidence"
  | "invalid_rule_evidence_ref"
  | "missing_component_match_target"
  | "missing_component_match_attribute"
  | "unknown_component_match_attribute"
  | "unknown_component_match_target";

interface SaltValidationRulePackIssue {
  code: SaltValidationRulePackIssueCode;
  message: string;
  path: string;
}

interface BuildValidationIssueFromRuleInput {
  rule: SaltValidationRuleRecord;
  matches: number;
  evidence: string[];
  evidence_refs?: SaltEvidenceRef[];
  canonical_source?: string | null;
  source_urls?: string[];
}

function hasText(value: string | null | undefined): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

function unique<T>(values: T[]): T[] {
  return [...new Set(values)];
}

function uniqueEvidenceRefs(refs: SaltEvidenceRef[]): SaltEvidenceRef[] {
  return refs.filter(
    (ref, index) =>
      refs.findIndex((candidate) => candidate.id === ref.id) === index,
  );
}

function toRulePackIssue(
  issue: SaltEvidenceValidationIssue,
): SaltValidationRulePackIssue {
  return {
    code: "invalid_rule_evidence_ref",
    message: issue.message,
    path: issue.path,
  };
}

function getEvidenceSourceUrls(refs: SaltEvidenceRef[]): string[] {
  return unique(
    refs
      .map((ref) => ref.source?.url)
      .filter((url): url is string => hasText(url)),
  );
}

function getFirstEvidenceSourceUrl(refs: SaltEvidenceRef[]): string | null {
  return getEvidenceSourceUrls(refs)[0] ?? null;
}

function hasSourceBackedRuleEvidence(refs: SaltEvidenceRef[]): boolean {
  return refs.some(
    (ref) =>
      (ref.source_kind === "docs" ||
        ref.source_kind === "source" ||
        ref.source_kind === "example") &&
      (hasText(ref.source?.url) || hasText(ref.source?.repo_path)),
  );
}

function validateRuleMatch(
  rule: SaltValidationRuleRecord,
  rulePath: string,
  registry?: Pick<SaltRegistry, "components">,
): SaltValidationRulePackIssue[] {
  const issues: SaltValidationRulePackIssue[] = [];
  const component =
    registry?.components.find((item) => item.id === rule.match.component_id) ??
    null;

  if (!hasText(rule.match.component_id)) {
    issues.push({
      code: "missing_component_match_target",
      message: `Validation rule '${rule.id}' must include match.component_id.`,
      path: `${rulePath}.match.component_id`,
    });
  } else if (registry && !component) {
    issues.push({
      code: "unknown_component_match_target",
      message: `Validation rule '${rule.id}' references missing registry component '${rule.match.component_id}'.`,
      path: `${rulePath}.match.component_id`,
    });
  }

  if (rule.match.attribute_names.length === 0) {
    issues.push({
      code: "missing_component_match_attribute",
      message: `Validation rule '${rule.id}' must include at least one match.attribute_names entry.`,
      path: `${rulePath}.match.attribute_names`,
    });
  }

  if (component && !hasSourceBackedRuleEvidence(rule.evidence_refs)) {
    for (const attributeName of rule.match.attribute_names) {
      if (component.props.some((prop) => prop.name === attributeName)) {
        continue;
      }

      issues.push({
        code: "unknown_component_match_attribute",
        message: `Validation rule '${rule.id}' matches undocumented attribute '${attributeName}' on registry component '${component.id}'.`,
        path: `${rulePath}.match.attribute_names`,
      });
    }
  }

  return issues;
}

export function validateValidationRulePackEvidence(
  pack: SaltValidationRulePack,
  registry?: Pick<SaltRegistry, "components">,
): SaltValidationRulePackIssue[] {
  const issues: SaltValidationRulePackIssue[] = [];

  if (pack.contract !== SALT_VALIDATION_RULE_PACK_CONTRACT) {
    issues.push({
      code: "invalid_rule_pack_contract",
      message: `Validation rule pack '${pack.id}' must use ${SALT_VALIDATION_RULE_PACK_CONTRACT}.`,
      path: "contract",
    });
  }

  pack.rules.forEach((rule, ruleIndex) => {
    const rulePath = `rules[${ruleIndex}]`;

    if (rule.evidence_refs.length === 0) {
      issues.push({
        code: "missing_rule_evidence",
        message: `Validation rule '${rule.id}' must include at least one evidence ref.`,
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

    issues.push(...validateRuleMatch(rule, rulePath, registry));
  });

  return issues;
}

export function buildValidationIssueFromValidationRule(
  input: BuildValidationIssueFromRuleInput,
): ValidationIssue {
  const evidenceRefs = uniqueEvidenceRefs([
    ...input.rule.evidence_refs,
    ...(input.evidence_refs ?? []),
  ]);
  const sourceUrls = unique([
    ...(input.rule.source_urls ?? []),
    ...(input.source_urls ?? []),
    ...getEvidenceSourceUrls(evidenceRefs),
  ]);

  return {
    id: input.rule.id,
    category: input.rule.category,
    rule: input.rule.rule,
    severity: input.rule.severity,
    title: input.rule.title,
    message: input.rule.message,
    evidence: input.evidence,
    canonical_source:
      input.canonical_source ??
      input.rule.canonical_source ??
      getFirstEvidenceSourceUrl(evidenceRefs),
    suggested_fix: input.rule.suggested_fix,
    confidence: input.rule.confidence,
    source_urls: sourceUrls,
    evidence_refs: evidenceRefs,
    matches: input.matches,
  };
}
