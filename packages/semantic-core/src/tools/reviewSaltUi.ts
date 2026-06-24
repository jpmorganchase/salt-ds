import {
  SALT_EVIDENCE_REF_CONTRACT,
  type SaltEvidenceRef,
} from "../evidence.js";
import {
  buildPatternValidationRulePack,
  getPatternValidationRules,
  type SaltPatternValidationRulePack,
  validatePatternValidationRulePackEvidence,
} from "../patternValidationRulePacks.js";
import type { SaltRegistry } from "../types.js";
import {
  analyzeParsedSaltCode,
  resolveImportedSaltSymbol,
  type SaltCodeAnalysis,
  traverseAst,
} from "./codeAnalysisCommon.js";
import type { WorkflowCompositionContract } from "./compositionContract.js";
import {
  appendProjectConventionsNextStep,
  buildGuidanceBoundary,
  type GuidanceBoundary,
  type ProjectConventionsTopic,
} from "./guidanceBoundary.js";
import { recommendFixRecipes } from "./recommendFixRecipes.js";
import { suggestMigration } from "./suggestMigration.js";
import {
  buildValidateSaltUsageResult,
  validateSaltUsage,
} from "./validateSaltUsage.js";
import type { ValidationIssue } from "./validation/shared.js";
import {
  buildComponentRegistryEvidenceRef,
  buildEvidence,
  componentDocUrls,
  createIssueCollector,
  finalizeValidationIssues,
} from "./validation/validateSaltUsageHelpers.js";

export interface ReviewSaltUiInput {
  code: string;
  framework?: string;
  package_version?: string;
  from_version?: string;
  to_version?: string;
  max_issues?: number;
  view?: "compact" | "full";
  expected_targets?: ReviewExpectedTargets;
}

export interface ReviewExpectedTargets {
  components?: string[];
  patterns?: string[];
  composition_contract?: WorkflowCompositionContract | null;
  source?: "create_report" | "workflow_context";
}

export interface ReviewSaltUiResult {
  guidance_boundary: GuidanceBoundary;
  decision: {
    status: "clean" | "needs_attention";
    why: string;
  };
  summary: {
    errors: number;
    warnings: number;
    infos: number;
    fix_count: number;
    migration_count: number;
  };
  fixes?: Array<Record<string, unknown>>;
  issues?: Array<Record<string, unknown>>;
  migrations?: Array<Record<string, unknown>>;
  missing_data: string[];
  next_step?: string;
  source_urls: string[];
  raw?: Record<string, unknown>;
}

function unique(values: string[]): string[] {
  return [...new Set(values)];
}

function normalizeSaltEntityName(value: string): string {
  return value.replace(/[\s_-]+/g, "").toLowerCase();
}

function componentDocUrlsForImport(
  registry: SaltRegistry,
  importedName: string,
): string[] {
  const normalizedImportedName = normalizeSaltEntityName(importedName);
  const component = registry.components.find(
    (item) =>
      normalizeSaltEntityName(item.name) === normalizedImportedName ||
      normalizeSaltEntityName(item.source.export_name ?? "") ===
        normalizedImportedName ||
      item.aliases.some(
        (alias) => normalizeSaltEntityName(alias) === normalizedImportedName,
      ),
  );

  return component
    ? componentDocUrls(registry, component.name, [
        "overview",
        "usage",
        "examples",
      ])
    : [];
}

function collectReviewedSaltSourceUrls(
  registry: SaltRegistry,
  analysis: SaltCodeAnalysis | null,
): string[] {
  if (!analysis) {
    return [];
  }

  const importedNames = new Set<string>();

  for (const symbol of analysis.directImportByLocal.values()) {
    importedNames.add(symbol.imported);
  }

  traverseAst(analysis.ast, {
    JSXOpeningElement(path) {
      const imported = resolveImportedSaltSymbol(
        path.node.name,
        analysis.directImportByLocal,
        analysis.namespaceImportByLocal,
      );

      if (imported) {
        importedNames.add(imported.imported);
      }
    },
  });

  return unique(
    [...importedNames].flatMap((name) =>
      componentDocUrlsForImport(registry, name),
    ),
  );
}

function toRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : null;
}

function normalizeExpectedTargetNames(values: string[] | undefined): string[] {
  return unique(
    (values ?? [])
      .map((value) => value.trim())
      .filter((value) => value.length > 0),
  );
}

function normalizeTargetName(value: string): string {
  return value.replace(/[\s-]+/g, "").toLowerCase();
}

interface ExpectedPatternTarget {
  name: string;
  field_path: string;
}

interface ExpectedComponentTarget {
  names: string[];
  field_path: string;
  slot_id?: string | null;
  slot_label?: string | null;
}

function collectExpectedPatternTargets(
  expectedTargets: ReviewExpectedTargets | undefined,
): ExpectedPatternTarget[] {
  const targets: ExpectedPatternTarget[] = [];
  for (const name of normalizeExpectedTargetNames(expectedTargets?.patterns)) {
    targets.push({ name, field_path: "expected_targets.patterns" });
  }

  for (const name of normalizeExpectedTargetNames(
    expectedTargets?.composition_contract?.expected_patterns,
  )) {
    targets.push({
      name,
      field_path: "expected_targets.composition_contract.expected_patterns",
    });
  }

  for (const slot of expectedTargets?.composition_contract?.slots ?? []) {
    if (slot.certainty === "optional") {
      continue;
    }
    for (const name of normalizeExpectedTargetNames(slot.preferred_patterns)) {
      targets.push({
        name,
        field_path: "expected_targets.composition_contract.slots",
      });
    }
  }

  return targets.filter(
    (target, index) =>
      targets.findIndex(
        (candidate) =>
          normalizeTargetName(candidate.name) ===
            normalizeTargetName(target.name) &&
          candidate.field_path === target.field_path,
      ) === index,
  );
}

function buildWorkflowInputExpectedTargetEvidenceRef(input: {
  id: string;
  field_path: string;
  note: string;
}): SaltEvidenceRef {
  return {
    contract: SALT_EVIDENCE_REF_CONTRACT,
    id: `${input.id}.workflow-input.expected-target.validation-ref`,
    source_kind: "workflow_input",
    claim_kind: "workflow",
    workflow_input: {
      field_path: input.field_path,
    },
    confidence: "high",
    verified_at: null,
    note: input.note,
  };
}

function findExpectedPatternRecord(
  registry: SaltRegistry,
  name: string,
): SaltRegistry["patterns"][number] | null {
  const normalized = normalizeTargetName(name);
  return (
    registry.patterns.find(
      (pattern) =>
        normalizeTargetName(pattern.name) === normalized ||
        pattern.aliases.some(
          (alias) => normalizeTargetName(alias) === normalized,
        ),
    ) ?? null
  );
}

function patternSourceUrls(
  pattern: SaltRegistry["patterns"][number],
): string[] {
  return unique(
    [
      pattern.related_docs.overview,
      ...(pattern.starter_scaffold?.source_urls ?? []),
      ...pattern.resources
        .filter((resource) => resource.internal)
        .map((resource) => resource.href),
    ].filter((value): value is string => Boolean(value)),
  );
}

function buildPatternRegistryEvidenceRef(input: {
  registry: Pick<SaltRegistry, "version" | "generated_at">;
  pattern: SaltRegistry["patterns"][number];
  claim_kind?: SaltEvidenceRef["claim_kind"];
  field_path?: string;
  id_suffix: string;
}): SaltEvidenceRef {
  const sourceUrl = input.pattern.related_docs.overview;
  return {
    contract: SALT_EVIDENCE_REF_CONTRACT,
    id: `${input.pattern.id}.${input.id_suffix}.validation-ref`,
    source_kind: "registry",
    claim_kind: input.claim_kind ?? "pattern",
    registry: {
      entity_type: "pattern",
      entity_id: input.pattern.id,
      entity_name: input.pattern.name,
      field_path: input.field_path ?? "name",
      registry_version: input.registry.version,
    },
    source: sourceUrl ? { url: sourceUrl } : null,
    confidence: "high",
    verified_at: input.pattern.last_verified_at,
  };
}

function buildExpectedPatternUnsupportedIssue(
  registry: SaltRegistry,
  target: ExpectedPatternTarget,
  reason: "missing_pattern_record" | "missing_rule_pack_evidence",
): ValidationIssue {
  const pattern = findExpectedPatternRecord(registry, target.name);
  const sourceUrls = pattern ? patternSourceUrls(pattern) : [];
  const id = `workflow-expected.unsupported-pattern.${normalizeTargetName(
    target.name,
  )}`;
  const reasonMessage =
    reason === "missing_pattern_record"
      ? "No matching semantic-core registry pattern record was found."
      : "The matching semantic-core registry pattern record has no supported source-backed pattern validation rules.";

  return {
    id,
    category: "composition",
    rule: "workflow-expected-pattern-validation-unsupported",
    severity: "warning",
    title: `Expected workflow pattern ${target.name} was not validated`,
    message: `The workflow expected ${target.name}, but semantic-core cannot validate that pattern implementation from registry evidence. ${reasonMessage}`,
    evidence: buildEvidence(
      `Workflow input expected pattern ${target.name}`,
      1,
    ),
    canonical_source: sourceUrls[0] ?? null,
    suggested_fix:
      "Add source-backed registry pattern validation rule evidence before treating the pattern implementation check as complete.",
    confidence: 0.8,
    source_urls: sourceUrls,
    evidence_refs: [
      buildWorkflowInputExpectedTargetEvidenceRef({
        id,
        field_path: target.field_path,
        note: "Review expected the pattern from explicit workflow input.",
      }),
      ...(pattern
        ? [
            buildPatternRegistryEvidenceRef({
              registry,
              pattern,
              id_suffix: "workflow-expected-pattern",
            }),
          ]
        : []),
    ],
    matches: 1,
    fix_hints: {
      guide_lookups: [],
      related_components: [],
      extra_steps: [],
    },
  };
}

function findExpectedComponentRecord(
  registry: SaltRegistry,
  name: string,
): SaltRegistry["components"][number] | null {
  const normalized = normalizeTargetName(name);
  return (
    registry.components.find(
      (component) =>
        normalizeTargetName(component.name) === normalized ||
        normalizeTargetName(component.source.export_name ?? "") ===
          normalized ||
        component.aliases.some(
          (alias) => normalizeTargetName(alias) === normalized,
        ),
    ) ?? null
  );
}

function componentImportKeys(
  registry: SaltRegistry,
  name: string,
): { component: SaltRegistry["components"][number] | null; keys: string[] } {
  const component = findExpectedComponentRecord(registry, name);
  return {
    component,
    keys: unique(
      [
        name,
        component?.name,
        component?.source.export_name,
        ...(component?.aliases ?? []),
      ]
        .filter((value): value is string => Boolean(value))
        .map(normalizeTargetName),
    ),
  };
}

function buildImportRuleKey(packageName: string, importName: string): string {
  return `${packageName}:${normalizeTargetName(importName)}`;
}

function normalizeTextPresence(value: string): string {
  return value.replace(/[^a-z0-9]+/gi, "").toLowerCase();
}

function hasTextPresenceMarker(code: string, marker: string): boolean {
  const normalizedMarker = normalizeTextPresence(marker);
  if (!normalizedMarker) {
    return false;
  }

  return normalizeTextPresence(code).includes(normalizedMarker);
}

function buildExpectedPatternImportIssue(input: {
  registry: SaltRegistry;
  target: ExpectedPatternTarget;
  pattern: SaltRegistry["patterns"][number];
  rule: ReturnType<typeof getPatternValidationRules>[number];
}): ValidationIssue {
  const id = `workflow-expected.pattern-missing-import.${normalizeTargetName(
    input.target.name,
  )}.${normalizeTargetName(input.rule.value)}`;
  const importMatch =
    input.rule.match?.kind === "salt_import" ? input.rule.match : null;
  const component = importMatch
    ? findExpectedComponentRecord(input.registry, importMatch.name)
    : null;
  const componentSourceUrls = component
    ? componentDocUrls(input.registry, component.name, ["overview", "usage"])
    : [];
  const sourceUrls = unique([
    ...(input.rule.source_urls ?? []),
    ...componentSourceUrls,
  ]);
  const expectedImport = importMatch
    ? `${importMatch.name} from ${importMatch.package}`
    : input.rule.value;

  return {
    id,
    category: "composition",
    rule: "workflow-expected-pattern-import-not-found",
    severity: "warning",
    title: "Expected workflow pattern import not found",
    message: `The workflow expected the ${input.pattern.name} pattern, and source-backed pattern rule evidence lists ${expectedImport}, but no matching @salt-ds import was found.`,
    evidence: [
      ...buildEvidence(
        `Workflow input expected pattern ${input.target.name}`,
        1,
      ),
      `Registry pattern rule '${input.rule.id}' lists ${expectedImport}.`,
      `No matching @salt-ds import was detected for ${expectedImport}.`,
    ],
    canonical_source: sourceUrls[0] ?? null,
    suggested_fix:
      "Resolve the expected pattern through source-backed workflow output and include the registry-backed starter import before treating the pattern as complete.",
    confidence: 0.82,
    source_urls: sourceUrls,
    evidence_refs: [
      buildWorkflowInputExpectedTargetEvidenceRef({
        id,
        field_path: input.target.field_path,
        note: "Review expected the pattern from explicit workflow input.",
      }),
      ...input.rule.evidence_refs,
      ...(component
        ? [
            buildComponentRegistryEvidenceRef({
              registry: input.registry,
              component,
              claim_kind: "component",
              field_path: "name",
              id_suffix: "workflow-expected-pattern-import",
            }),
          ]
        : []),
    ],
    matches: 1,
    fix_hints: {
      guide_lookups: [],
      related_components: component ? [component.name] : [],
      extra_steps: [],
    },
  };
}

function buildExpectedPatternRegionIssue(input: {
  target: ExpectedPatternTarget;
  pattern: SaltRegistry["patterns"][number];
  rule: ReturnType<typeof getPatternValidationRules>[number];
}): ValidationIssue {
  const id = `workflow-expected.pattern-missing-region.${normalizeTargetName(
    input.target.name,
  )}.${normalizeTargetName(input.rule.value)}`;
  const sourceUrls = unique(input.rule.source_urls ?? []);

  return {
    id,
    category: "composition",
    rule: "workflow-expected-pattern-region-not-found",
    severity: "warning",
    title: "Expected workflow pattern region not found",
    message: `The workflow expected the ${input.pattern.name} pattern, and source-backed pattern rule evidence lists the ${input.rule.value} starter region, but no matching region marker was found in the reviewed code.`,
    evidence: [
      ...buildEvidence(
        `Workflow input expected pattern ${input.target.name}`,
        1,
      ),
      `Registry pattern rule '${input.rule.id}' lists starter region ${input.rule.value}.`,
      `No matching region marker was detected for ${input.rule.value}.`,
    ],
    canonical_source: sourceUrls[0] ?? null,
    suggested_fix:
      "Resolve the expected pattern through source-backed workflow output and include a code marker or scaffold region that preserves the registry-backed starter region.",
    confidence: 0.74,
    source_urls: sourceUrls,
    evidence_refs: [
      buildWorkflowInputExpectedTargetEvidenceRef({
        id,
        field_path: input.target.field_path,
        note: "Review expected the pattern from explicit workflow input.",
      }),
      ...input.rule.evidence_refs,
    ],
    matches: 1,
    fix_hints: {
      guide_lookups: [],
      related_components: [],
      extra_steps: [],
    },
  };
}

function buildExpectedPatternBuildAroundIssue(input: {
  target: ExpectedPatternTarget;
  pattern: SaltRegistry["patterns"][number];
  rule: ReturnType<typeof getPatternValidationRules>[number];
}): ValidationIssue {
  const id = `workflow-expected.pattern-missing-build-around.${normalizeTargetName(
    input.target.name,
  )}.${normalizeTargetName(input.rule.value)}`;
  const sourceUrls = unique(input.rule.source_urls ?? []);

  return {
    id,
    category: "composition",
    rule: "workflow-expected-pattern-build-around-not-found",
    severity: "warning",
    title: "Expected workflow pattern build-around marker not found",
    message: `The workflow expected the ${input.pattern.name} pattern, and source-backed pattern rule evidence lists ${input.rule.value} as build-around guidance, but no matching marker was found in the reviewed code.`,
    evidence: [
      ...buildEvidence(
        `Workflow input expected pattern ${input.target.name}`,
        1,
      ),
      `Registry pattern rule '${input.rule.id}' lists build-around guidance ${input.rule.value}.`,
      `No matching build-around marker was detected for ${input.rule.value}.`,
    ],
    canonical_source: sourceUrls[0] ?? null,
    suggested_fix:
      "Resolve the expected pattern through source-backed workflow output and include a code marker or scaffold element that preserves the registry-backed build-around guidance.",
    confidence: 0.72,
    source_urls: sourceUrls,
    evidence_refs: [
      buildWorkflowInputExpectedTargetEvidenceRef({
        id,
        field_path: input.target.field_path,
        note: "Review expected the pattern from explicit workflow input.",
      }),
      ...input.rule.evidence_refs,
    ],
    matches: 1,
    fix_hints: {
      guide_lookups: [],
      related_components: [],
      extra_steps: [],
    },
  };
}

function buildExpectedPatternIssues(input: {
  registry: SaltRegistry;
  target: ExpectedPatternTarget;
  importedSaltImportKeys: Set<string>;
  rulePack: SaltPatternValidationRulePack;
  code: string;
}): { issues: ValidationIssue[]; missing_data: string[] } {
  const pattern = findExpectedPatternRecord(input.registry, input.target.name);
  if (!pattern) {
    return {
      issues: [
        buildExpectedPatternUnsupportedIssue(
          input.registry,
          input.target,
          "missing_pattern_record",
        ),
      ],
      missing_data: [
        `Expected pattern target '${input.target.name}' was not structurally validated because no matching semantic-core registry pattern record was found.`,
      ],
    };
  }

  const supportedImportRules = getPatternValidationRules({
    rule_pack: input.rulePack,
    pattern,
    kind: "starter-template-import",
    status: "supported",
  });
  const supportedRegionRules = getPatternValidationRules({
    rule_pack: input.rulePack,
    pattern,
    kind: "starter-region",
    status: "supported",
  });
  const supportedBuildAroundRules = getPatternValidationRules({
    rule_pack: input.rulePack,
    pattern,
    kind: "starter-build-around",
    status: "supported",
  });
  const unsupportedRules = getPatternValidationRules({
    rule_pack: input.rulePack,
    pattern,
    status: "unsupported",
  });
  const unsupportedRuleKinds = unique(
    unsupportedRules.map((rule) => rule.kind),
  );

  if (
    supportedImportRules.length === 0 &&
    supportedRegionRules.length === 0 &&
    supportedBuildAroundRules.length === 0
  ) {
    return {
      issues: [
        buildExpectedPatternUnsupportedIssue(
          input.registry,
          input.target,
          "missing_rule_pack_evidence",
        ),
      ],
      missing_data: [
        `Expected pattern target '${input.target.name}' was not structurally validated because the matching registry pattern has no supported starter-template import, starter-region, or starter-build-around rule evidence.`,
        ...(unsupportedRuleKinds.length > 0
          ? [
              `Expected pattern target '${input.target.name}' has source-backed rule kinds that semantic-core records as unsupported: ${unsupportedRuleKinds.join(", ")}.`,
            ]
          : []),
      ],
    };
  }

  const issues: ValidationIssue[] = [];
  const missingData =
    unsupportedRuleKinds.length > 0
      ? [
          `Expected pattern target '${input.target.name}' has source-backed rule kinds that semantic-core records as unsupported: ${unsupportedRuleKinds.join(", ")}.`,
        ]
      : [];

  for (const rule of supportedImportRules) {
    const importMatch = rule.match?.kind === "salt_import" ? rule.match : null;
    if (
      importMatch &&
      input.importedSaltImportKeys.has(
        buildImportRuleKey(importMatch.package, importMatch.name),
      )
    ) {
      continue;
    }

    issues.push(
      buildExpectedPatternImportIssue({
        registry: input.registry,
        target: input.target,
        pattern,
        rule,
      }),
    );
  }

  for (const rule of supportedRegionRules) {
    if (
      rule.match?.kind === "text_presence" &&
      hasTextPresenceMarker(input.code, rule.match.text)
    ) {
      continue;
    }

    issues.push(
      buildExpectedPatternRegionIssue({
        target: input.target,
        pattern,
        rule,
      }),
    );
  }

  for (const rule of supportedBuildAroundRules) {
    if (
      rule.match?.kind === "text_presence" &&
      hasTextPresenceMarker(input.code, rule.match.text)
    ) {
      continue;
    }

    issues.push(
      buildExpectedPatternBuildAroundIssue({
        target: input.target,
        pattern,
        rule,
      }),
    );
  }

  return { issues, missing_data: missingData };
}

function collectExpectedComponentTargets(
  expectedTargets: ReviewExpectedTargets | undefined,
): ExpectedComponentTarget[] {
  const slotComponentNames = new Set(
    (expectedTargets?.composition_contract?.slots ?? [])
      .filter((slot) => slot.certainty !== "optional")
      .flatMap((slot) => slot.preferred_components)
      .map(normalizeTargetName),
  );
  const targets: ExpectedComponentTarget[] = [];

  for (const name of normalizeExpectedTargetNames(
    expectedTargets?.components,
  )) {
    if (!slotComponentNames.has(normalizeTargetName(name))) {
      targets.push({
        names: [name],
        field_path: "expected_targets.components",
      });
    }
  }

  for (const name of normalizeExpectedTargetNames(
    expectedTargets?.composition_contract?.expected_components,
  )) {
    if (!slotComponentNames.has(normalizeTargetName(name))) {
      targets.push({
        names: [name],
        field_path: "expected_targets.composition_contract.expected_components",
      });
    }
  }

  for (const slot of expectedTargets?.composition_contract?.slots ?? []) {
    if (slot.certainty === "optional") {
      continue;
    }
    const names = normalizeExpectedTargetNames(slot.preferred_components);
    if (names.length > 0) {
      targets.push({
        names,
        field_path: "expected_targets.composition_contract.slots",
        slot_id: slot.id,
        slot_label: slot.label,
      });
    }
  }

  return targets.filter(
    (target, index) =>
      targets.findIndex(
        (candidate) =>
          candidate.field_path === target.field_path &&
          candidate.slot_id === target.slot_id &&
          candidate.names.map(normalizeTargetName).join("|") ===
            target.names.map(normalizeTargetName).join("|"),
      ) === index,
  );
}

function collectImportedSaltNames(analysis: SaltCodeAnalysis): Set<string> {
  const importedNames = new Set(
    [...analysis.directImportByLocal.values()].map((symbol) =>
      normalizeTargetName(symbol.imported),
    ),
  );

  traverseAst(analysis.ast, {
    JSXOpeningElement(path) {
      const imported = resolveImportedSaltSymbol(
        path.node.name,
        analysis.directImportByLocal,
        analysis.namespaceImportByLocal,
      );

      if (imported) {
        importedNames.add(normalizeTargetName(imported.imported));
      }
    },
  });

  return importedNames;
}

function collectImportedSaltImportKeys(
  analysis: SaltCodeAnalysis,
): Set<string> {
  const importedKeys = new Set(
    [...analysis.directImportByLocal.values()].map((symbol) =>
      buildImportRuleKey(symbol.packageName, symbol.imported),
    ),
  );

  traverseAst(analysis.ast, {
    JSXOpeningElement(path) {
      const imported = resolveImportedSaltSymbol(
        path.node.name,
        analysis.directImportByLocal,
        analysis.namespaceImportByLocal,
      );

      if (imported) {
        importedKeys.add(
          buildImportRuleKey(imported.packageName, imported.imported),
        );
      }
    },
  });

  return importedKeys;
}

function buildExpectedComponentIssue(
  registry: SaltRegistry,
  target: ExpectedComponentTarget,
): { issue: ValidationIssue; unresolved_components: string[] } {
  const componentMatches = target.names.map((name) => ({
    name,
    ...componentImportKeys(registry, name),
  }));
  const components: Array<SaltRegistry["components"][number]> = [];
  for (const match of componentMatches) {
    if (
      match.component &&
      !components.some((component) => component.id === match.component?.id)
    ) {
      components.push(match.component);
    }
  }
  const unresolvedComponents = componentMatches.flatMap((match) =>
    match.component ? [] : [match.name],
  );
  const displayName = target.names.join(", ");
  const regionName = target.slot_label ?? target.slot_id ?? null;
  const id = target.slot_id
    ? `workflow-expected.missing-component.${normalizeTargetName(
        target.slot_id,
      )}`
    : `workflow-expected.missing-component.${normalizeTargetName(
        target.names[0],
      )}`;
  const sourceUrls = unique(
    components.flatMap((component) =>
      componentDocUrls(registry, component.name, ["overview", "usage"]),
    ),
  );
  const regionMessage = regionName ? ` for the "${regionName}" region` : "";
  const expectationText =
    target.names.length === 1
      ? target.names[0]
      : `one of ${target.names.join(", ")}`;

  return {
    unresolved_components: unresolvedComponents,
    issue: {
      id,
      category: "composition",
      rule: "workflow-expected-component-not-imported",
      severity: "warning",
      title: "Expected workflow component target not found",
      message: `The workflow expected ${expectationText}${regionMessage}, but no corresponding @salt-ds import was found.`,
      evidence: [
        ...buildEvidence(
          `Workflow input expected component target ${displayName}`,
          1,
        ),
        `No matching @salt-ds import was detected for ${displayName}.`,
      ],
      canonical_source: sourceUrls[0] ?? null,
      suggested_fix:
        "Resolve the expected target from the source-backed workflow output and replace custom markup with the matching Salt component.",
      confidence: 0.82,
      source_urls: sourceUrls,
      evidence_refs: [
        buildWorkflowInputExpectedTargetEvidenceRef({
          id,
          field_path: target.field_path,
          note: `Review expected ${displayName} from explicit workflow input.`,
        }),
        ...components.map((component) =>
          buildComponentRegistryEvidenceRef({
            registry,
            component,
            claim_kind: "component",
            field_path: "name",
            id_suffix: "workflow-expected-component",
          }),
        ),
      ],
      matches: 1,
      fix_hints: {
        guide_lookups: [],
        related_components: components.map((component) => component.name),
        extra_steps: [],
      },
    },
  };
}

function buildExpectedTargetValidation(
  registry: SaltRegistry,
  input: {
    expectedTargets: ReviewExpectedTargets | undefined;
    analysis: SaltCodeAnalysis | null;
    code: string;
  },
): { issues: ValidationIssue[]; missing_data: string[] } {
  const expectedTargets = input.expectedTargets;
  if (!expectedTargets || !input.analysis) {
    return { issues: [], missing_data: [] };
  }

  const issues: ValidationIssue[] = [];
  const missingData: string[] = [];

  const importedSaltNames = collectImportedSaltNames(input.analysis);
  const importedSaltImportKeys = collectImportedSaltImportKeys(input.analysis);
  const expectedPatternTargets = collectExpectedPatternTargets(expectedTargets);
  let patternRulePack: SaltPatternValidationRulePack | null = null;
  let patternRulePackEvidenceValid = true;

  if (expectedPatternTargets.length > 0) {
    patternRulePack =
      registry.pattern_validation_rule_pack ??
      buildPatternValidationRulePack({
        registry,
        generated_at: registry.generated_at,
        generator: {
          name: "semantic-core.review-salt-ui.expected-patterns",
        },
      });
    const rulePackEvidenceIssues = validatePatternValidationRulePackEvidence(
      patternRulePack,
      registry,
    );
    if (rulePackEvidenceIssues.length > 0) {
      patternRulePackEvidenceValid = false;
      missingData.push(
        ...rulePackEvidenceIssues.map(
          (issue) =>
            `Expected pattern validation rule pack evidence gap at ${issue.path}: ${issue.message}`,
        ),
      );
    }
  }

  for (const target of expectedPatternTargets) {
    if (!patternRulePack || !patternRulePackEvidenceValid) {
      issues.push(
        buildExpectedPatternUnsupportedIssue(
          registry,
          target,
          "missing_rule_pack_evidence",
        ),
      );
      continue;
    }

    const patternValidation = buildExpectedPatternIssues({
      registry,
      target,
      importedSaltImportKeys,
      rulePack: patternRulePack,
      code: input.code,
    });
    issues.push(...patternValidation.issues);
    missingData.push(...patternValidation.missing_data);
  }

  for (const target of collectExpectedComponentTargets(expectedTargets)) {
    const targetKeys = target.names.flatMap(
      (name) => componentImportKeys(registry, name).keys,
    );
    if (targetKeys.some((key) => importedSaltNames.has(key))) {
      continue;
    }

    const { issue, unresolved_components: unresolvedComponents } =
      buildExpectedComponentIssue(registry, target);
    issues.push(issue);
    for (const unresolvedComponent of unresolvedComponents) {
      missingData.push(
        `Expected component target '${unresolvedComponent}' could not be resolved to a semantic-core registry component record.`,
      );
    }
  }

  return { issues, missing_data: unique(missingData) };
}

function expectedTargetProjectConventionsTopics(
  expectedTargets: ReviewExpectedTargets | undefined,
): ProjectConventionsTopic[] {
  return collectExpectedPatternTargets(expectedTargets).length > 0
    ? ["wrappers", "page-patterns"]
    : [];
}

export function isWorkflowExpectedReviewIssueId(issueId: string): boolean {
  return issueId.startsWith("workflow-expected.");
}

export function reviewSaltUi(
  registry: SaltRegistry,
  input: ReviewSaltUiInput,
): ReviewSaltUiResult {
  const view = input.view ?? "compact";
  const maxIssues = Math.max(1, Math.min(input.max_issues ?? 10, 50));
  const targetVersion = input.to_version ?? input.package_version;
  let analysis: SaltCodeAnalysis | null = null;

  try {
    analysis = analyzeParsedSaltCode(input.code);
  } catch {
    analysis = null;
  }

  const rawValidation = validateSaltUsage(registry, {
    code: input.code,
    framework: input.framework,
    package_version: targetVersion,
    max_issues: maxIssues,
    analysis: analysis ?? undefined,
  });
  const contextualValidation = buildExpectedTargetValidation(registry, {
    expectedTargets: input.expected_targets,
    analysis,
    code: input.code,
  });
  const validation =
    contextualValidation.issues.length === 0 &&
    contextualValidation.missing_data.length === 0
      ? rawValidation
      : (() => {
          const { issueMap, addIssue } = createIssueCollector();
          for (const issue of rawValidation.issues) {
            addIssue(issue);
          }
          for (const issue of contextualValidation.issues) {
            addIssue(issue);
          }
          const finalized = finalizeValidationIssues(issueMap, maxIssues);

          return buildValidateSaltUsageResult({
            registry,
            ...finalized,
            missing_data: unique([
              ...rawValidation.missing_data,
              ...contextualValidation.missing_data,
            ]),
            generated_at: rawValidation.generated_artifact.generated_at,
            generator: rawValidation.generated_artifact.generator,
            registry_hash: rawValidation.generated_artifact.registry.hash,
          });
        })();
  const migrations = suggestMigration(registry, {
    code: input.code,
    from_version: input.from_version,
    to_version: targetVersion,
    max_migrations: maxIssues,
  });
  const fixes = recommendFixRecipes(registry, {
    code: input.code,
    framework: input.framework,
    package_version: targetVersion,
    max_recipes: maxIssues,
    view,
  });

  const missingData = unique([
    ...validation.missing_data,
    ...fixes.missing_data,
    ...migrations.notes,
  ]);
  const sourceUrls = unique([
    ...collectReviewedSaltSourceUrls(registry, analysis),
    ...validation.issues.flatMap((issue) => issue.source_urls),
    ...migrations.source_urls,
    ...fixes.source_urls,
  ]);
  const fixCount =
    view === "full"
      ? Array.isArray(fixes.recipes)
        ? fixes.recipes.length
        : 0
      : Array.isArray(fixes.fixes)
        ? fixes.fixes.length
        : 0;
  const firstRecipe = toRecord(fixes.recipes?.[0]);
  const firstFix = toRecord(fixes.fixes?.[0]);
  const topFix =
    view === "full"
      ? typeof (Array.isArray(firstRecipe?.steps)
          ? firstRecipe.steps[0]
          : null) === "string"
        ? (firstRecipe?.steps as string[])[0]
        : undefined
      : typeof firstFix?.recommended_fix === "string"
        ? firstFix.recommended_fix
        : undefined;
  const topIssue = validation.issues[0]?.message ?? validation.issues[0]?.title;
  const needsAttention =
    validation.summary.errors > 0 ||
    validation.summary.warnings > 0 ||
    fixCount > 0 ||
    migrations.migrations.length > 0;
  const issueCategories = unique(
    validation.issues.map((issue) => issue.category).filter(Boolean),
  );
  const guidanceBoundary = buildGuidanceBoundary({
    workflow: "review_salt_ui",
    issue_categories: issueCategories,
    has_deprecations:
      validation.issues.some((issue) => issue.category === "deprecated") ||
      migrations.migrations.length > 0,
    project_conventions_topics: expectedTargetProjectConventionsTopics(
      input.expected_targets,
    ),
  });

  return {
    guidance_boundary: guidanceBoundary,
    decision: {
      status: needsAttention ? "needs_attention" : "clean",
      why:
        topFix ??
        topIssue ??
        (needsAttention
          ? "Salt usage issues were detected."
          : "No significant Salt usage issues were detected."),
    },
    summary: {
      ...validation.summary,
      fix_count: fixCount,
      migration_count: migrations.migrations.length,
    },
    fixes: view === "full" ? fixes.recipes : fixes.fixes,
    issues: validation.issues.map((issue) => ({
      id: issue.id,
      category: issue.category,
      rule: issue.rule,
      severity: issue.severity,
      title: issue.title,
      message: issue.message,
      evidence: issue.evidence,
      canonical_source: issue.canonical_source,
      suggested_fix: issue.suggested_fix,
      confidence: issue.confidence,
      matches: issue.matches,
      source_urls: issue.source_urls,
      evidence_refs: issue.evidence_refs ?? [],
      fix_hints: issue.fix_hints,
    })),
    migrations: migrations.migrations.map((migration) => ({
      kind: migration.kind,
      component: migration.component,
      from: migration.from,
      to: migration.to,
      reason: migration.reason,
      source_urls: migration.source_urls,
    })),
    missing_data: missingData,
    next_step: appendProjectConventionsNextStep(
      fixes.next_step ?? topFix ?? topIssue,
      guidanceBoundary,
    ),
    source_urls: sourceUrls,
    raw:
      view === "full"
        ? {
            validation,
            fixes,
            migrations,
          }
        : undefined,
  };
}
