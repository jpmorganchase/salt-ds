import {
  SALT_EVIDENCE_REF_CONTRACT,
  SALT_GENERATED_ARTIFACT_CONTRACT,
  type SaltEvidenceClaimKind,
  type SaltEvidenceRef,
  type SaltEvidenceValidationIssue,
  type SaltGeneratedArtifact,
} from "./evidence.js";
import { validateGeneratedArtifactRegistryEvidence } from "./generatedArtifactValidation.js";
import type { PatternRecord, SaltRegistry } from "./types.js";

export const SALT_PATTERN_VALIDATION_RULE_PACK_CONTRACT =
  "salt_pattern_validation_rule_pack_v1" as const;

export type SaltPatternValidationRuleKind =
  | "starter-template-import"
  | "starter-region"
  | "starter-region-order"
  | "starter-build-around"
  | "starter-preserve-constraint"
  | "pattern-accessibility-summary";

export type SaltPatternValidationRuleStatus = "supported" | "unsupported";

export type SaltPatternValidationRuleMatch =
  | {
      kind: "salt_import";
      name: string;
      package: string;
    }
  | {
      kind: "text_presence";
      text: string;
    };

export interface SaltPatternValidationRuleRecord {
  id: string;
  pattern_id: string;
  pattern_name: string;
  kind: SaltPatternValidationRuleKind;
  status: SaltPatternValidationRuleStatus;
  field_path: string;
  value: string;
  match: SaltPatternValidationRuleMatch | null;
  message: string;
  unsupported_reason: string | null;
  evidence_refs: SaltEvidenceRef[];
  canonical_source?: string | null;
  source_urls?: string[];
}

export interface SaltPatternValidationRulePackGenerator {
  name: string;
  version?: string | null;
}

export interface SaltPatternValidationRulePackRegistry {
  version?: string | null;
  hash?: string | null;
  generated_at?: string | null;
}

export interface SaltPatternValidationRulePack {
  contract: typeof SALT_PATTERN_VALIDATION_RULE_PACK_CONTRACT;
  id: string;
  generated_at: string;
  generator: SaltPatternValidationRulePackGenerator;
  registry: SaltPatternValidationRulePackRegistry;
  rules: SaltPatternValidationRuleRecord[];
}

export type SaltPatternValidationRulePackIssueCode =
  | "invalid_rule_pack_contract"
  | "missing_rule_evidence"
  | "missing_source_backed_rule_evidence"
  | "invalid_rule_evidence_ref";

export interface SaltPatternValidationRulePackIssue {
  code: SaltPatternValidationRulePackIssueCode;
  message: string;
  path: string;
}

function hasText(value: string | null | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function slugify(value: string): string {
  return (
    value
      .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .toLowerCase() || "rule"
  );
}

function unique<T>(values: T[]): T[] {
  return [...new Set(values)];
}

function patternSourceUrls(
  pattern: PatternRecord,
  fieldPath?: string,
): string[] {
  const fieldSourceUrls = fieldPath
    ? (pattern.accessibility.summary_sources ?? [])
        .filter((source) => source.field_path === fieldPath)
        .map((source) => source.source_url)
    : [];

  return unique(
    [
      ...fieldSourceUrls,
      ...(pattern.starter_scaffold?.source_urls ?? []),
      ...(pattern.starter_scaffold?.example_source_urls ?? []),
      pattern.related_docs.overview,
      ...pattern.resources
        .filter((resource) => resource.internal)
        .map((resource) => resource.href),
    ].filter((value): value is string => hasText(value)),
  );
}

function patternRuleSource(
  pattern: PatternRecord,
  fieldPath?: string,
): { url: string } | null {
  const [url] = patternSourceUrls(pattern, fieldPath);
  return url ? { url } : null;
}

function buildPatternRuleEvidenceRef(input: {
  registry: Pick<SaltRegistry, "version">;
  pattern: PatternRecord;
  field_path: string;
  claim_kind: SaltEvidenceClaimKind;
  id_suffix: string;
}): SaltEvidenceRef {
  return {
    contract: SALT_EVIDENCE_REF_CONTRACT,
    id: `${input.pattern.id}.${input.id_suffix}.pattern-rule-ref`,
    source_kind: "registry",
    claim_kind: input.claim_kind,
    registry: {
      entity_type: "pattern",
      entity_id: input.pattern.id,
      entity_name: input.pattern.name,
      field_path: input.field_path,
      registry_version: input.registry.version,
    },
    source: patternRuleSource(input.pattern, input.field_path),
    confidence: "high",
    verified_at: input.pattern.last_verified_at,
  };
}

function buildRule(input: {
  registry: Pick<SaltRegistry, "version">;
  pattern: PatternRecord;
  kind: SaltPatternValidationRuleKind;
  status: SaltPatternValidationRuleStatus;
  field_path: string;
  value: string;
  index: number;
  claim_kind: SaltEvidenceClaimKind;
  match?: SaltPatternValidationRuleMatch | null;
  unsupported_reason?: string | null;
}): SaltPatternValidationRuleRecord {
  const id = `${input.pattern.id}.${input.kind}.${input.index}`;
  const evidenceRef = buildPatternRuleEvidenceRef({
    registry: input.registry,
    pattern: input.pattern,
    field_path: input.field_path,
    claim_kind: input.claim_kind,
    id_suffix: `${input.kind}.${input.index}`,
  });

  return {
    id,
    pattern_id: input.pattern.id,
    pattern_name: input.pattern.name,
    kind: input.kind,
    status: input.status,
    field_path: input.field_path,
    value: input.value,
    match: input.match ?? null,
    message:
      input.status === "supported"
        ? `${input.pattern.name} ${input.kind} rule is source-backed.`
        : `${input.pattern.name} ${input.kind} rule is recorded but not yet validated.`,
    unsupported_reason: input.unsupported_reason ?? null,
    evidence_refs: [evidenceRef],
    canonical_source: evidenceRef.source?.url ?? null,
    source_urls: evidenceRef.source?.url ? [evidenceRef.source.url] : [],
  };
}

function buildPatternRules(
  registry: Pick<SaltRegistry, "version">,
  pattern: PatternRecord,
): SaltPatternValidationRuleRecord[] {
  const rules: SaltPatternValidationRuleRecord[] = [];

  pattern.starter_scaffold?.template?.imports.forEach((importRecord, index) => {
    if (!hasText(importRecord.name) || !hasText(importRecord.package)) {
      return;
    }

    rules.push(
      buildRule({
        registry,
        pattern,
        kind: "starter-template-import",
        status: "supported",
        field_path: `starter_scaffold.template.imports.${index}.name`,
        value: importRecord.name,
        index,
        claim_kind: "import",
        match: {
          kind: "salt_import",
          name: importRecord.name,
          package: importRecord.package,
        },
      }),
    );
  });

  pattern.starter_scaffold?.semantics.regions.forEach((region, index) => {
    if (!hasText(region)) {
      return;
    }
    rules.push(
      buildRule({
        registry,
        pattern,
        kind: "starter-region",
        status: "supported",
        field_path: `starter_scaffold.semantics.regions.${index}`,
        value: region,
        index,
        claim_kind: "pattern",
        match: {
          kind: "text_presence",
          text: region,
        },
      }),
    );
  });

  const orderedRegions =
    (pattern.starter_scaffold?.semantics.required_regions?.length ?? 0) > 1
      ? {
          fieldPath: "starter_scaffold.semantics.required_regions",
          values: pattern.starter_scaffold?.semantics.required_regions ?? [],
        }
      : pattern.starter_scaffold?.semantics.regions.length &&
          pattern.starter_scaffold.semantics.regions.length > 1
        ? {
            fieldPath: "starter_scaffold.semantics.regions",
            values: pattern.starter_scaffold.semantics.regions,
          }
        : null;

  orderedRegions?.values.forEach((value, index) => {
    if (!hasText(value)) {
      return;
    }
    rules.push(
      buildRule({
        registry,
        pattern,
        kind: "starter-region-order",
        status: "unsupported",
        field_path: `${orderedRegions.fieldPath}.${index}`,
        value,
        index,
        claim_kind: "pattern",
        unsupported_reason:
          "Semantic-core records source-backed starter regions but does not yet validate rendered region order or layout behavior.",
      }),
    );
  });

  pattern.starter_scaffold?.semantics.build_around.forEach((value, index) => {
    if (!hasText(value)) {
      return;
    }
    rules.push(
      buildRule({
        registry,
        pattern,
        kind: "starter-build-around",
        status: "supported",
        field_path: `starter_scaffold.semantics.build_around.${index}`,
        value,
        index,
        claim_kind: "pattern",
        match: {
          kind: "text_presence",
          text: value,
        },
      }),
    );
  });

  pattern.starter_scaffold?.semantics.preserve_constraints.forEach(
    (value, index) => {
      if (!hasText(value)) {
        return;
      }
      rules.push(
        buildRule({
          registry,
          pattern,
          kind: "starter-preserve-constraint",
          status: "unsupported",
          field_path: `starter_scaffold.semantics.preserve_constraints.${index}`,
          value,
          index,
          claim_kind: "pattern",
          unsupported_reason:
            "Semantic-core records source-backed preserve constraints but does not yet validate layout or interaction behavior.",
        }),
      );
    },
  );

  pattern.accessibility.summary.forEach((value, index) => {
    if (!hasText(value)) {
      return;
    }
    rules.push(
      buildRule({
        registry,
        pattern,
        kind: "pattern-accessibility-summary",
        status: "unsupported",
        field_path: `accessibility.summary.${index}`,
        value,
        index,
        claim_kind: "accessibility",
        unsupported_reason:
          "Semantic-core records source-backed pattern accessibility guidance but does not yet validate pattern-level accessibility behavior.",
      }),
    );
  });

  return rules;
}

export function buildPatternValidationRulePack(input: {
  registry: Pick<SaltRegistry, "patterns" | "version" | "generated_at">;
  generated_at: string;
  generator: SaltPatternValidationRulePackGenerator;
  registry_hash?: string | null;
  patterns?: PatternRecord[];
  id?: string;
}): SaltPatternValidationRulePack {
  const patterns = input.patterns ?? input.registry.patterns;

  return {
    contract: SALT_PATTERN_VALIDATION_RULE_PACK_CONTRACT,
    id: input.id ?? "pattern-validation-rules",
    generated_at: input.generated_at,
    generator: input.generator,
    registry: {
      version: input.registry.version,
      hash: input.registry_hash ?? null,
      generated_at: input.registry.generated_at,
    },
    rules: patterns.flatMap((pattern) =>
      buildPatternRules(input.registry, pattern),
    ),
  };
}

function hasSourceLocator(ref: SaltEvidenceRef): boolean {
  return hasText(ref.source?.url) || hasText(ref.source?.repo_path);
}

function toRulePackIssue(
  issue: SaltEvidenceValidationIssue,
): SaltPatternValidationRulePackIssue {
  return {
    code: "invalid_rule_evidence_ref",
    message: issue.message,
    path: issue.path,
  };
}

function buildRulePackArtifact(
  pack: SaltPatternValidationRulePack,
): SaltGeneratedArtifact {
  return {
    contract: SALT_GENERATED_ARTIFACT_CONTRACT,
    artifact_kind: "pattern-guidance",
    id: `pattern-validation-rule-pack.${pack.id}`,
    generated_at: pack.generated_at,
    generator: pack.generator,
    registry: pack.registry,
    claims: pack.rules.map((rule) => ({
      id: rule.id,
      kind: rule.evidence_refs[0]?.claim_kind ?? "pattern",
      text: rule.message,
      field_path: `rules.${rule.id}`,
      evidence_ref_ids: rule.evidence_refs.map((ref) => ref.id),
    })),
    evidence_refs: pack.rules.flatMap((rule) => rule.evidence_refs),
    unsupported_claims: pack.rules
      .filter((rule) => rule.status === "unsupported")
      .map((rule) => ({
        id: `${rule.id}.unsupported`,
        kind: rule.evidence_refs[0]?.claim_kind ?? "pattern",
        text: rule.message,
        field_path: rule.field_path,
        reason: rule.unsupported_reason ?? "Pattern rule is unsupported.",
      })),
  };
}

export function validatePatternValidationRulePackEvidence(
  pack: SaltPatternValidationRulePack,
  registry?: SaltRegistry,
): SaltPatternValidationRulePackIssue[] {
  const issues: SaltPatternValidationRulePackIssue[] = [];

  if (pack.contract !== SALT_PATTERN_VALIDATION_RULE_PACK_CONTRACT) {
    issues.push({
      code: "invalid_rule_pack_contract",
      message: `Pattern validation rule pack '${pack.id}' must use ${SALT_PATTERN_VALIDATION_RULE_PACK_CONTRACT}.`,
      path: "contract",
    });
  }

  pack.rules.forEach((rule, ruleIndex) => {
    const rulePath = `rules[${ruleIndex}]`;
    if (rule.evidence_refs.length === 0) {
      issues.push({
        code: "missing_rule_evidence",
        message: `Pattern validation rule '${rule.id}' must include at least one evidence ref.`,
        path: `${rulePath}.evidence_refs`,
      });
    }
    if (!rule.evidence_refs.some(hasSourceLocator)) {
      issues.push({
        code: "missing_source_backed_rule_evidence",
        message: `Pattern validation rule '${rule.id}' must include source-backed evidence.`,
        path: `${rulePath}.evidence_refs`,
      });
    }
  });

  if (registry) {
    issues.push(
      ...validateGeneratedArtifactRegistryEvidence(
        buildRulePackArtifact(pack),
        registry,
      ).map(toRulePackIssue),
    );
  }

  return issues;
}

export function getPatternValidationRules(input: {
  rule_pack: SaltPatternValidationRulePack;
  pattern: PatternRecord;
  kind?: SaltPatternValidationRuleKind;
  status?: SaltPatternValidationRuleStatus;
}): SaltPatternValidationRuleRecord[] {
  return input.rule_pack.rules.filter(
    (rule) =>
      rule.pattern_id === input.pattern.id &&
      (!input.kind || rule.kind === input.kind) &&
      (!input.status || rule.status === input.status),
  );
}
