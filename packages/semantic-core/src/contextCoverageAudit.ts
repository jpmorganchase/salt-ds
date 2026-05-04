import { buildComponentContext } from "./contextArtifacts.js";
import { buildFoundationContext } from "./contextFoundations.js";
import { buildPatternContext } from "./contextPatterns.js";
import {
  selectDefaultContextPackComponents,
  selectDefaultContextPackFoundationTokenGroups,
  selectDefaultContextPackPatterns,
} from "./contextPackSelection.js";
import type {
  SaltGeneratedArtifactGenerator,
  SaltGeneratedArtifactRegistry,
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
export type SaltContextCoverageGapKind =
  | "component"
  | "pattern"
  | "foundation";

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

function missingPatternOptionalContextEvidence(pattern: PatternRecord): string[] {
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
  if (pattern.accessibility.summary.length === 0) {
    missing.push("accessibility summary");
  }

  return missing;
}

function uniqueStrings(values: string[]): string[] {
  return [...new Set(values.map((value) => value.trim()))].filter(
    (value) => value.length > 0,
  );
}

function summarizeComponentCoverage(
  input: BuildContextCoverageAuditInput,
): {
  section: SaltContextCoverageSection;
  gaps: SaltContextCoverageGap[];
} {
  const selectedComponents = selectDefaultContextPackComponents(input.registry, {
    limit: input.registry.components.length,
    include_unsupported: true,
  });
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
    .map((context): SaltContextCoverageUnsupportedRecord => ({
      id: context.component.id,
      name: context.component.name.value,
      status: "unsupported",
      missing: context.surface_gate.missing,
      unsupported_claim_count: context.unsupported_claims.length,
      validation_issue_count: context.surface_gate.validation_issues.length,
      evidence_ref_ids: context.component.name.evidence_ref_ids,
    }));
  const sourceGaps = input.registry.components
    .filter((component) => component.status === "stable")
    .filter((component) => !selectedIds.has(component.id))
    .filter((component) => !hasComponentContextSourceLocator(component))
    .map((component): SaltContextCoverageGap => ({
      kind: "component",
      id: component.id,
      name: component.name,
      status: "unsupported",
      reason:
        "Stable component registry record is missing a source, docs, or example locator for generated context.",
      missing: ["component source locator"],
      evidence_ref_ids: [],
    }));
  const optionalEvidenceGaps = selectedComponents
    .map((component) => ({
      component,
      missing: missingComponentOptionalContextEvidence(component),
    }))
    .filter((entry) => entry.missing.length > 0)
    .map(({ component, missing }): SaltContextCoverageGap => ({
      kind: "component",
      id: component.id,
      name: component.name,
      status: "unsupported",
      reason:
        "Component context omitted optional fields because registry or source-backed evidence is missing.",
      missing,
      evidence_ref_ids: [],
    }));

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
      ...unsupportedRecords.map((record): SaltContextCoverageGap => ({
        kind: "component",
        id: record.id,
        name: record.name,
        status: "unsupported",
        reason:
          "Selected component context did not pass the evidence surface gate.",
        missing: record.missing,
        evidence_ref_ids: record.evidence_ref_ids,
      })),
    ],
  };
}

function summarizePatternCoverage(
  input: BuildContextCoverageAuditInput,
): {
  section: SaltContextCoverageSection;
  gaps: SaltContextCoverageGap[];
} {
  const selectedPatterns = selectDefaultContextPackPatterns(input.registry, {
    limit: input.registry.patterns.length,
    include_unsupported: true,
  });
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
    .map((context): SaltContextCoverageUnsupportedRecord => ({
      id: context.pattern.id,
      name: context.pattern.name.value,
      status: "unsupported",
      missing: context.surface_gate.missing,
      unsupported_claim_count: context.unsupported_claims.length,
      validation_issue_count: context.surface_gate.validation_issues.length,
      evidence_ref_ids: context.pattern.name.evidence_ref_ids,
    }));
  const sourceGaps = input.registry.patterns
    .filter((pattern) => pattern.status === "stable")
    .filter((pattern) => !selectedIds.has(pattern.id))
    .filter((pattern) => !hasPatternContextSourceLocator(pattern))
    .map((pattern): SaltContextCoverageGap => ({
      kind: "pattern",
      id: pattern.id,
      name: pattern.name,
      status: "unsupported",
      reason:
        "Stable pattern registry record is missing a docs, resource, or example source locator for generated context.",
      missing: ["pattern source locator"],
      evidence_ref_ids: [],
    }));
  const optionalEvidenceGaps = selectedPatterns
    .map((pattern) => ({
      pattern,
      missing: missingPatternOptionalContextEvidence(pattern),
    }))
    .filter((entry) => entry.missing.length > 0)
    .map(({ pattern, missing }): SaltContextCoverageGap => ({
      kind: "pattern",
      id: pattern.id,
      name: pattern.name,
      status: "unsupported",
      reason:
        "Pattern context omitted optional fields because registry or source-backed evidence is missing.",
      missing,
      evidence_ref_ids: [],
    }));

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
      ...unsupportedRecords.map((record): SaltContextCoverageGap => ({
        kind: "pattern",
        id: record.id,
        name: record.name,
        status: "unsupported",
        reason: "Selected pattern context did not pass the evidence surface gate.",
        missing: record.missing,
        evidence_ref_ids: record.evidence_ref_ids,
      })),
    ],
  };
}

function summarizeFoundationCoverage(
  input: BuildContextCoverageAuditInput,
): {
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
    .map((context): SaltContextCoverageUnsupportedRecord => ({
      id: context.foundation.id,
      name: context.foundation.category.value,
      status: "unsupported",
      missing: context.surface_gate.missing,
      unsupported_claim_count: context.unsupported_claims.length,
      validation_issue_count: context.surface_gate.validation_issues.length,
      evidence_ref_ids: context.foundation.category.evidence_ref_ids,
    }));
  const sourceGapTokens = input.registry.tokens.filter(
    (token) => !hasTokenContextSourceLocator(token),
  );
  const sourceGaps = uniqueStrings(sourceGapTokens.map((token) => token.category))
    .map((category): SaltContextCoverageGap => ({
      kind: "foundation",
      id: `tokens.${category}`,
      name: category,
      status: "unsupported",
      reason:
        "Token category has registry tokens missing policy docs or source-backed token policy evidence for generated context.",
      missing: ["token policy docs or source-backed policy evidence"],
      evidence_ref_ids: [],
    }));

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
      ...unsupportedRecords.map((record): SaltContextCoverageGap => ({
        kind: "foundation",
        id: record.id,
        name: record.name,
        status: "unsupported",
        reason:
          "Selected foundation context did not pass the evidence surface gate.",
        missing: record.missing,
        evidence_ref_ids: record.evidence_ref_ids,
      })),
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
