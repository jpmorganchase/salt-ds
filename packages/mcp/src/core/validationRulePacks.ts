import {
  deduplicateSaltEvidenceRefs,
  type SaltEvidenceRef,
  type SaltEvidenceValidationIssue,
  type SaltEvidenceValidationIssueCode,
  saltEvidenceRefsEqual,
} from "./evidence.js";
import { validateSaltEvidenceRefAgainstRegistry } from "./generatedArtifactValidation.js";
import { getSaltRegistryFingerprint } from "./registry/fingerprint.js";
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

export interface SaltValidationRuleConfidence {
  basis: "deterministic_match";
  score: 1;
}

export interface SaltValidationRuleRecord {
  id: string;
  category: ValidationCategory;
  rule: string;
  severity: ValidationSeverity;
  title: string;
  message: string;
  suggested_fix: string | null;
  confidence: SaltValidationRuleConfidence;
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
  version: string;
  hash: string;
  generated_at: string | null;
}

export interface SaltValidationRulePack {
  contract: typeof SALT_VALIDATION_RULE_PACK_CONTRACT;
  id: string;
  generated_at: string | null;
  generator: SaltValidationRulePackGenerator;
  registry: SaltValidationRulePackRegistry;
  rules: SaltValidationRuleRecord[];
}

type SaltValidationRulePackIssueCode =
  | SaltEvidenceValidationIssueCode
  | "invalid_rule_pack_contract"
  | "missing_rule_evidence"
  | "missing_component_match_target"
  | "missing_component_match_attribute"
  | "unknown_component_match_attribute"
  | "unknown_component_match_target"
  | "invalid_rule_confidence";

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

function toRulePackIssue(
  issue: SaltEvidenceValidationIssue,
): SaltValidationRulePackIssue {
  return {
    code: issue.code,
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

function validateRuleMatch(
  rule: SaltValidationRuleRecord,
  rulePath: string,
  registry: SaltRegistry,
): SaltValidationRulePackIssue[] {
  const issues: SaltValidationRulePackIssue[] = [];
  const component =
    registry.components.find((item) => item.id === rule.match.component_id) ??
    null;

  if (!hasText(rule.match.component_id)) {
    issues.push({
      code: "missing_component_match_target",
      message: `Validation rule '${rule.id}' must include match.component_id.`,
      path: `${rulePath}.match.component_id`,
    });
  } else if (!component) {
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

  if (component) {
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
  registry: SaltRegistry,
): SaltValidationRulePackIssue[] {
  const issues: SaltValidationRulePackIssue[] = [];
  const activeRegistryHash = getSaltRegistryFingerprint(registry);

  if (pack.contract !== SALT_VALIDATION_RULE_PACK_CONTRACT) {
    issues.push({
      code: "invalid_rule_pack_contract",
      message: `Validation rule pack '${pack.id}' must use ${SALT_VALIDATION_RULE_PACK_CONTRACT}.`,
      path: "contract",
    });
  }

  if (!hasText(pack.registry?.version) || !hasText(pack.registry?.hash)) {
    issues.push({
      code: "missing_registry_identity",
      message: `Validation rule pack '${pack.id}' must declare the active registry version and hash.`,
      path: "registry",
    });
  } else if (
    pack.registry.version !== registry.version ||
    pack.registry.hash !== activeRegistryHash
  ) {
    issues.push({
      code: "stale_registry",
      message: `Validation rule pack '${pack.id}' does not match the active registry identity.`,
      path: "registry",
    });
  }

  const evidenceRefById = new Map<string, SaltEvidenceRef>();
  pack.rules.forEach((rule, ruleIndex) => {
    const rulePath = `rules[${ruleIndex}]`;
    const confidence = rule.confidence as unknown;

    if (
      typeof confidence !== "object" ||
      confidence === null ||
      Array.isArray(confidence) ||
      (confidence as { basis?: unknown }).basis !== "deterministic_match" ||
      (confidence as { score?: unknown }).score !== 1 ||
      Object.keys(confidence).some((key) => key !== "basis" && key !== "score")
    ) {
      issues.push({
        code: "invalid_rule_confidence",
        message: `Validation rule '${rule.id}' may only claim confidence derived from an exact deterministic match.`,
        path: `${rulePath}.confidence`,
      });
    }

    if (rule.evidence_refs.length === 0) {
      issues.push({
        code: "missing_rule_evidence",
        message: `Validation rule '${rule.id}' must include at least one evidence ref.`,
        path: `${rulePath}.evidence_refs`,
      });
    }

    rule.evidence_refs.forEach((ref, refIndex) => {
      const refPath = `${rulePath}.evidence_refs[${refIndex}]`;
      const existing = evidenceRefById.get(ref.id);
      if (existing && !saltEvidenceRefsEqual(existing, ref)) {
        issues.push({
          code: "conflicting_evidence_ref",
          message: `Evidence ref id '${ref.id}' is reused for conflicting provenance across validation rules.`,
          path: `${refPath}.id`,
        });
      } else if (!existing) {
        evidenceRefById.set(ref.id, ref);
      }
      issues.push(
        ...validateSaltEvidenceRefAgainstRegistry(ref, refPath, registry).map(
          toRulePackIssue,
        ),
      );
    });

    issues.push(...validateRuleMatch(rule, rulePath, registry));
  });

  return issues;
}

export function buildValidationIssueFromValidationRule(
  input: BuildValidationIssueFromRuleInput,
): ValidationIssue {
  const evidenceRefs = deduplicateSaltEvidenceRefs([
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
    confidence: input.rule.confidence.score,
    source_urls: sourceUrls,
    evidence_refs: evidenceRefs,
    matches: input.matches,
  };
}
