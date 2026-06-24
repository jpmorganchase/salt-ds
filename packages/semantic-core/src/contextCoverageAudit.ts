import { buildComponentContext } from "./contextArtifacts.js";
import { buildFoundationContext } from "./contextFoundations.js";
import {
  selectDefaultContextPackComponents,
  selectDefaultContextPackFoundationTokenGroups,
  selectDefaultContextPackPatterns,
} from "./contextPackSelection.js";
import { buildPatternContext } from "./contextPatterns.js";
import type {
  SaltGeneratedArtifactGenerator,
  SaltGeneratedArtifactRegistry,
  SaltUnsupportedClaim,
} from "./evidence.js";
import { toSaltGeneratedArtifactRegistry } from "./registry/fingerprint.js";
import type {
  ComponentRecord,
  PatternRecord,
  SaltRegistry,
  TokenRecord,
} from "./types.js";

export const SALT_CONTEXT_COVERAGE_AUDIT_CONTRACT =
  "salt_context_coverage_audit_v1" as const;

export type SaltContextCoverageAuditStatus = "validated" | "unsupported";
export type SaltContextCoverageGapKind = "component" | "pattern" | "foundation";
export type SaltContextCoverageGapRecordKind =
  | "component"
  | "pattern"
  | "token";
export type SaltContextCoverageGapReasonCode =
  | "missing_source_locator"
  | "missing_optional_evidence"
  | "evidence_surface_gate_failed"
  | "missing_token_policy"
  | "missing_token_policy_docs"
  | "missing_token_policy_source_evidence"
  | "missing_token_policy_docs_or_source_evidence"
  | "deprecated_token_raw_value_without_policy"
  | "deprecated_token_reference_without_policy";

export interface SaltContextCoverageUnsupportedRecord {
  id: string;
  name: string;
  status: "unsupported";
  missing: string[];
  unsupported_claim_count: number;
  validation_issue_count: number;
  evidence_ref_ids: string[];
}

export interface SaltContextCoverageGap {
  kind: SaltContextCoverageGapKind;
  id: string;
  name: string;
  status: "unsupported";
  reason: string;
  missing: string[];
  evidence_ref_ids: string[];
  records: SaltContextCoverageGapRecord[];
}

export interface SaltContextCoverageGapRecord {
  kind: SaltContextCoverageGapRecordKind;
  id: string;
  name: string;
  status: "unsupported";
  reason_code: SaltContextCoverageGapReasonCode;
  reason: string;
  missing: string[];
  evidence_ref_ids: string[];
}

export interface SaltContextCoverageSection {
  total_records: number;
  selected_records: number;
  validated_contexts: number;
  unsupported_contexts: number;
  source_gap_count: number;
  unsupported_records: SaltContextCoverageUnsupportedRecord[];
}

export interface SaltContextCoverageAudit {
  contract: typeof SALT_CONTEXT_COVERAGE_AUDIT_CONTRACT;
  generated_at: string;
  generator: SaltGeneratedArtifactGenerator;
  registry: SaltGeneratedArtifactRegistry;
  status: SaltContextCoverageAuditStatus;
  component_contexts: SaltContextCoverageSection;
  pattern_contexts: SaltContextCoverageSection;
  foundation_contexts: SaltContextCoverageSection;
  docs_registry_gaps: SaltContextCoverageGap[];
}

export interface BuildContextCoverageAuditInput {
  registry: SaltRegistry;
  generated_at: string;
  generator: SaltGeneratedArtifactGenerator;
}

function hasText(value: string | null | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function hasComponentContextSourceLocator(component: ComponentRecord): boolean {
  return Boolean(
    component.source.repo_path ||
      component.related_docs.overview ||
      component.related_docs.usage ||
      component.related_docs.accessibility ||
      component.related_docs.examples,
  );
}

function hasPatternContextSourceLocator(pattern: PatternRecord): boolean {
  return Boolean(
    pattern.related_docs.overview ||
      pattern.resources.some((resource) => hasText(resource.href)) ||
      pattern.examples.some((example) => hasText(example.source_url)),
  );
}

function hasTokenContextSourceLocator(token: TokenRecord): boolean {
  return Boolean(
    (token.policy?.docs.length ?? 0) > 0 ||
      token.policy?.evidence_refs?.some(
        (ref) => hasText(ref.source?.url) || hasText(ref.source?.repo_path),
      ),
  );
}

function hasTokenPolicyDocs(token: TokenRecord): boolean {
  return (token.policy?.docs.length ?? 0) > 0;
}

function hasTokenPolicySourceEvidence(token: TokenRecord): boolean {
  return Boolean(
    token.policy?.evidence_refs?.some(
      (ref) => hasText(ref.source?.url) || hasText(ref.source?.repo_path),
    ),
  );
}

function tokenPolicyEvidenceRefIds(token: TokenRecord): string[] {
  return uniqueStrings(
    [
      ...(token.policy?.evidence_refs ?? []),
      ...(token.policy_gap?.evidence_refs ?? []),
    ]
      .map((ref) => ref.id)
      .filter(hasText),
  );
}

function tokenReferencesAnotherToken(token: TokenRecord): boolean {
  return /var\(\s*--[^)]+\)/.test(token.value);
}

function buildTokenCoverageGapRecord(
  token: TokenRecord,
): SaltContextCoverageGapRecord {
  const evidenceRefIds = tokenPolicyEvidenceRefIds(token);

  if (!token.policy) {
    const referencesAnotherToken = tokenReferencesAnotherToken(token);
    const reasonCode: SaltContextCoverageGapReasonCode = token.deprecated
      ? referencesAnotherToken
        ? "deprecated_token_reference_without_policy"
        : "deprecated_token_raw_value_without_policy"
      : "missing_token_policy";
    const reason = token.deprecated
      ? referencesAnotherToken
        ? "Deprecated registry token references another token but has no source-backed policy record for generated context."
        : "Deprecated registry token has a raw value but no source-backed policy record for generated context."
      : "Registry token is missing a source-backed policy record for generated context.";
    const policyGap = token.policy_gap ?? null;

    return {
      kind: "token",
      id: token.name,
      name: token.name,
      status: "unsupported",
      reason_code: reasonCode,
      reason: policyGap?.reason ?? reason,
      missing: policyGap?.missing ?? ["token policy"],
      evidence_ref_ids: evidenceRefIds,
    };
  }

  const missing: string[] = [];
  const hasDocs = hasTokenPolicyDocs(token);
  const hasSourceEvidence = hasTokenPolicySourceEvidence(token);

  if (!hasDocs) {
    missing.push("policy docs");
  }
  if (!hasSourceEvidence) {
    missing.push("source-backed policy evidence");
  }

  const reasonCode: SaltContextCoverageGapReasonCode =
    !hasDocs && !hasSourceEvidence
      ? "missing_token_policy_docs_or_source_evidence"
      : !hasDocs
        ? "missing_token_policy_docs"
        : "missing_token_policy_source_evidence";

  return {
    kind: "token",
    id: token.name,
    name: token.name,
    status: "unsupported",
    reason_code: reasonCode,
    reason:
      "Registry token policy is missing docs or source-backed policy evidence for generated context.",
    missing,
    evidence_ref_ids: evidenceRefIds,
  };
}

function groupTokenGapRecordsByCategory(
  tokens: TokenRecord[],
): Map<string, SaltContextCoverageGapRecord[]> {
  const recordsByCategory = new Map<string, SaltContextCoverageGapRecord[]>();

  for (const token of tokens) {
    const records = recordsByCategory.get(token.category) ?? [];
    records.push(buildTokenCoverageGapRecord(token));
    recordsByCategory.set(token.category, records);
  }

  return recordsByCategory;
}

function missingComponentOptionalContextEvidence(
  component: ComponentRecord,
): string[] {
  if (
    component.accessibility.summary.some((summary) => summary.trim().length > 0)
  ) {
    return [];
  }

  return component.related_docs.accessibility
    ? ["non-keyboard accessibility guidance"]
    : ["accessibility docs or source-backed summary"];
}

function componentHasAccessibilityEvidence(
  component: ComponentRecord | undefined,
): boolean {
  return Boolean(
    component &&
      (component.accessibility.summary.some(hasText) ||
        component.accessibility.rules.some((rule) => hasText(rule.rule)) ||
        hasText(component.related_docs.accessibility)),
  );
}

function hasSourceBackedPatternExample(pattern: PatternRecord): boolean {
  return pattern.examples.some(
    (example) => hasText(example.source_url) && hasText(example.code),
  );
}

function hasPatternAccessibilityImplementationSignal(
  pattern: PatternRecord,
): boolean {
  return Boolean(
    pattern.accessibility.implementation_signals?.some(
      (signal) =>
        hasText(signal.source_url) &&
        signal.values.some(hasText) &&
        hasText(signal.kind),
    ),
  );
}

function hasComposedComponentAccessibilityEvidence(
  pattern: PatternRecord,
  componentByName: Map<string, ComponentRecord>,
): boolean {
  const componentNames = uniqueStrings(
    pattern.composed_of.map((composition) => composition.component),
  );
  if (componentNames.length === 0) {
    return false;
  }

  const resolvedComponents = componentNames.map((name) =>
    componentByName.get(name),
  );

  return resolvedComponents.every(componentHasAccessibilityEvidence);
}

function hasPatternAccessibilityCoverage(
  pattern: PatternRecord,
  componentByName: Map<string, ComponentRecord>,
): boolean {
  return (
    pattern.accessibility.summary.some(hasText) ||
    hasPatternAccessibilityImplementationSignal(pattern) ||
    hasSourceBackedPatternExample(pattern) ||
    hasComposedComponentAccessibilityEvidence(pattern, componentByName)
  );
}

function missingPatternOptionalContextEvidence(
  pattern: PatternRecord,
  componentByName: Map<string, ComponentRecord>,
): string[] {
  const missing: string[] = [];

  if (pattern.when_not_to_use.length === 0) {
    missing.push("when_not_to_use guidance");
  }
  if (pattern.how_to_build.length === 0) {
    missing.push("how_to_build guidance");
  }
  if (pattern.how_it_works.length === 0) {
    missing.push("how_it_works guidance");
  }
  if (!hasPatternAccessibilityCoverage(pattern, componentByName)) {
    missing.push("pattern accessibility coverage");
  }

  return missing;
}

function patternOptionalGapFieldPath(missing: string): string {
  switch (missing) {
    case "when_not_to_use guidance":
      return "when_not_to_use";
    case "how_to_build guidance":
      return "how_to_build";
    case "how_it_works guidance":
      return "how_it_works";
    case "pattern accessibility coverage":
      return "accessibility";
    default:
      return missing;
  }
}

function patternOptionalGapReason(missing: string, fieldPath: string): string {
  if (missing === "pattern accessibility coverage") {
    return "Registry pattern accessibility coverage is empty and no source-backed examples, implementation signals, or composed component accessibility evidence was found for generated context.";
  }

  return `Registry pattern ${fieldPath} is empty and no source-backed docs, examples, or source evidence was found for generated context.`;
}

function buildPatternOptionalEvidenceGapRecords(
  pattern: PatternRecord,
  missing: string[],
): SaltContextCoverageGapRecord[] {
  return missing.map((missingField): SaltContextCoverageGapRecord => {
    const fieldPath = patternOptionalGapFieldPath(missingField);

    return {
      kind: "pattern",
      id: `${pattern.id}.${fieldPath}.missing_optional_evidence`,
      name: `${pattern.name} ${fieldPath}`,
      status: "unsupported",
      reason_code: "missing_optional_evidence",
      reason: patternOptionalGapReason(missingField, fieldPath),
      missing: [missingField],
      evidence_ref_ids: [],
    };
  });
}

function unsupportedClaimMissingFields(claim: SaltUnsupportedClaim): string[] {
  const missing = [claim.field_path ?? claim.text].filter(hasText);

  return missing.length > 0 ? missing : ["source-backed evidence"];
}

function buildPatternUnsupportedClaimGapRecords(
  unsupportedClaims: SaltUnsupportedClaim[],
): SaltContextCoverageGapRecord[] {
  return unsupportedClaims.map(
    (claim): SaltContextCoverageGapRecord => ({
      kind: "pattern",
      id: claim.id,
      name: claim.text,
      status: "unsupported",
      reason_code: "evidence_surface_gate_failed",
      reason: claim.reason,
      missing: unsupportedClaimMissingFields(claim),
      evidence_ref_ids: [],
    }),
  );
}

function uniqueStrings(values: string[]): string[] {
  return [...new Set(values.map((value) => value.trim()))].filter(
    (value) => value.length > 0,
  );
}

function summarizeComponentCoverage(input: BuildContextCoverageAuditInput): {
  section: SaltContextCoverageSection;
  gaps: SaltContextCoverageGap[];
} {
  const selectedComponents = selectDefaultContextPackComponents(
    input.registry,
    {
      limit: input.registry.components.length,
      include_unsupported: true,
    },
  );
  const selectedIds = new Set(
    selectedComponents.map((component) => component.id),
  );
  const contexts = selectedComponents.map((component) =>
    buildComponentContext({
      registry: input.registry,
      component,
      generated_at: input.generated_at,
      generator: input.generator,
    }),
  );
  const unsupportedRecords = contexts
    .filter((context) => context.status === "unsupported")
    .map(
      (context): SaltContextCoverageUnsupportedRecord => ({
        id: context.component.id,
        name: context.component.name.value,
        status: "unsupported",
        missing: context.surface_gate.missing,
        unsupported_claim_count: context.unsupported_claims.length,
        validation_issue_count: context.surface_gate.validation_issues.length,
        evidence_ref_ids: context.component.name.evidence_ref_ids,
      }),
    );
  const sourceGaps = input.registry.components
    .filter((component) => component.status === "stable")
    .filter((component) => !selectedIds.has(component.id))
    .filter((component) => !hasComponentContextSourceLocator(component))
    .map(
      (component): SaltContextCoverageGap => ({
        kind: "component",
        id: component.id,
        name: component.name,
        status: "unsupported",
        reason:
          "Stable component registry record is missing a source, docs, or example locator for generated context.",
        missing: ["component source locator"],
        evidence_ref_ids: [],
        records: [],
      }),
    );
  const optionalEvidenceGaps = selectedComponents
    .map((component) => ({
      component,
      missing: missingComponentOptionalContextEvidence(component),
    }))
    .filter((entry) => entry.missing.length > 0)
    .map(
      ({ component, missing }): SaltContextCoverageGap => ({
        kind: "component",
        id: component.id,
        name: component.name,
        status: "unsupported",
        reason:
          "Component context omitted optional fields because registry or source-backed evidence is missing.",
        missing,
        evidence_ref_ids: [],
        records: [],
      }),
    );

  return {
    section: {
      total_records: input.registry.components.length,
      selected_records: selectedComponents.length,
      validated_contexts: contexts.filter(
        (context) => context.status === "validated",
      ).length,
      unsupported_contexts: unsupportedRecords.length,
      source_gap_count: sourceGaps.length + optionalEvidenceGaps.length,
      unsupported_records: unsupportedRecords,
    },
    gaps: [
      ...sourceGaps,
      ...optionalEvidenceGaps,
      ...unsupportedRecords.map(
        (record): SaltContextCoverageGap => ({
          kind: "component",
          id: record.id,
          name: record.name,
          status: "unsupported",
          reason:
            "Selected component context did not pass the evidence surface gate.",
          missing: record.missing,
          evidence_ref_ids: record.evidence_ref_ids,
          records: [],
        }),
      ),
    ],
  };
}

function summarizePatternCoverage(input: BuildContextCoverageAuditInput): {
  section: SaltContextCoverageSection;
  gaps: SaltContextCoverageGap[];
} {
  const selectedPatterns = selectDefaultContextPackPatterns(input.registry, {
    limit: input.registry.patterns.length,
    include_unsupported: true,
  });
  const componentByName = new Map(
    input.registry.components.map((component) => [component.name, component]),
  );
  const selectedIds = new Set(selectedPatterns.map((pattern) => pattern.id));
  const contexts = selectedPatterns.map((pattern) =>
    buildPatternContext({
      registry: input.registry,
      pattern,
      generated_at: input.generated_at,
      generator: input.generator,
    }),
  );
  const unsupportedRecords = contexts
    .filter((context) => context.status === "unsupported")
    .map(
      (context): SaltContextCoverageUnsupportedRecord => ({
        id: context.pattern.id,
        name: context.pattern.name.value,
        status: "unsupported",
        missing: context.surface_gate.missing,
        unsupported_claim_count: context.unsupported_claims.length,
        validation_issue_count: context.surface_gate.validation_issues.length,
        evidence_ref_ids: context.pattern.name.evidence_ref_ids,
      }),
    );
  const unsupportedContextsByPatternId = new Map(
    contexts
      .filter((context) => context.status === "unsupported")
      .map((context) => [context.pattern.id, context] as const),
  );
  const sourceGaps = input.registry.patterns
    .filter((pattern) => pattern.status === "stable")
    .filter((pattern) => !selectedIds.has(pattern.id))
    .filter((pattern) => !hasPatternContextSourceLocator(pattern))
    .map(
      (pattern): SaltContextCoverageGap => ({
        kind: "pattern",
        id: pattern.id,
        name: pattern.name,
        status: "unsupported",
        reason:
          "Stable pattern registry record is missing a docs, resource, or example source locator for generated context.",
        missing: ["pattern source locator"],
        evidence_ref_ids: [],
        records: [],
      }),
    );
  const optionalEvidenceGaps = selectedPatterns
    .map((pattern) => ({
      pattern,
      missing: missingPatternOptionalContextEvidence(pattern, componentByName),
    }))
    .filter((entry) => entry.missing.length > 0)
    .map(
      ({ pattern, missing }): SaltContextCoverageGap => ({
        kind: "pattern",
        id: pattern.id,
        name: pattern.name,
        status: "unsupported",
        reason:
          "Pattern context omitted optional fields because registry or source-backed evidence is missing.",
        missing,
        evidence_ref_ids: [],
        records: buildPatternOptionalEvidenceGapRecords(pattern, missing),
      }),
    );

  return {
    section: {
      total_records: input.registry.patterns.length,
      selected_records: selectedPatterns.length,
      validated_contexts: contexts.filter(
        (context) => context.status === "validated",
      ).length,
      unsupported_contexts: unsupportedRecords.length,
      source_gap_count: sourceGaps.length + optionalEvidenceGaps.length,
      unsupported_records: unsupportedRecords,
    },
    gaps: [
      ...sourceGaps,
      ...optionalEvidenceGaps,
      ...unsupportedRecords.map(
        (record): SaltContextCoverageGap => ({
          kind: "pattern",
          id: record.id,
          name: record.name,
          status: "unsupported",
          reason:
            "Selected pattern context did not pass the evidence surface gate.",
          missing: record.missing,
          evidence_ref_ids: record.evidence_ref_ids,
          records: buildPatternUnsupportedClaimGapRecords(
            unsupportedContextsByPatternId.get(record.id)?.unsupported_claims ??
              [],
          ),
        }),
      ),
    ],
  };
}

function summarizeFoundationCoverage(input: BuildContextCoverageAuditInput): {
  section: SaltContextCoverageSection;
  gaps: SaltContextCoverageGap[];
} {
  const categories = uniqueStrings(
    input.registry.tokens.map((token) => token.category),
  );
  const selectedGroups = selectDefaultContextPackFoundationTokenGroups(
    input.registry,
    {
      category_limit: categories.length,
      token_limit: input.registry.tokens.length,
    },
  );
  const contexts = selectedGroups.map((group) =>
    buildFoundationContext({
      registry: input.registry,
      category: group.category,
      tokens: group.tokens,
      generated_at: input.generated_at,
      generator: input.generator,
    }),
  );
  const unsupportedRecords = contexts
    .filter((context) => context.status === "unsupported")
    .map(
      (context): SaltContextCoverageUnsupportedRecord => ({
        id: context.foundation.id,
        name: context.foundation.category.value,
        status: "unsupported",
        missing: context.surface_gate.missing,
        unsupported_claim_count: context.unsupported_claims.length,
        validation_issue_count: context.surface_gate.validation_issues.length,
        evidence_ref_ids: context.foundation.category.evidence_ref_ids,
      }),
    );
  const sourceGapTokens = input.registry.tokens.filter(
    (token) => !hasTokenContextSourceLocator(token),
  );
  const sourceGapRecordsByCategory =
    groupTokenGapRecordsByCategory(sourceGapTokens);
  const sourceGaps = [...sourceGapRecordsByCategory.entries()].map(
    ([category, records]): SaltContextCoverageGap => ({
      kind: "foundation",
      id: `tokens.${category}`,
      name: category,
      status: "unsupported",
      reason:
        "Token category has registry tokens missing policy docs or source-backed token policy evidence for generated context.",
      missing: ["token policy docs or source-backed policy evidence"],
      evidence_ref_ids: uniqueStrings(
        records.flatMap((record) => record.evidence_ref_ids),
      ),
      records,
    }),
  );

  return {
    section: {
      total_records: categories.length,
      selected_records: selectedGroups.length,
      validated_contexts: contexts.filter(
        (context) => context.status === "validated",
      ).length,
      unsupported_contexts: unsupportedRecords.length,
      source_gap_count: sourceGaps.length,
      unsupported_records: unsupportedRecords,
    },
    gaps: [
      ...sourceGaps,
      ...unsupportedRecords.map(
        (record): SaltContextCoverageGap => ({
          kind: "foundation",
          id: record.id,
          name: record.name,
          status: "unsupported",
          reason:
            "Selected foundation context did not pass the evidence surface gate.",
          missing: record.missing,
          evidence_ref_ids: record.evidence_ref_ids,
          records: [],
        }),
      ),
    ],
  };
}

export function buildContextCoverageAudit(
  input: BuildContextCoverageAuditInput,
): SaltContextCoverageAudit {
  const componentCoverage = summarizeComponentCoverage(input);
  const patternCoverage = summarizePatternCoverage(input);
  const foundationCoverage = summarizeFoundationCoverage(input);
  const docsRegistryGaps = [
    ...componentCoverage.gaps,
    ...patternCoverage.gaps,
    ...foundationCoverage.gaps,
  ];

  return {
    contract: SALT_CONTEXT_COVERAGE_AUDIT_CONTRACT,
    generated_at: input.generated_at,
    generator: input.generator,
    registry: toSaltGeneratedArtifactRegistry(input.registry),
    status: docsRegistryGaps.length === 0 ? "validated" : "unsupported",
    component_contexts: componentCoverage.section,
    pattern_contexts: patternCoverage.section,
    foundation_contexts: foundationCoverage.section,
    docs_registry_gaps: docsRegistryGaps,
  };
}
