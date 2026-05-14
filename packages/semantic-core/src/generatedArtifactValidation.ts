import {
  type SaltEvidenceRef,
  type SaltEvidenceValidationIssue,
  type SaltGeneratedArtifact,
  validateGeneratedArtifactEvidence,
} from "./evidence.js";
import {
  findTokenStructuralRoleRuleEvidence,
  type SaltTokenPolicyStructuralRoleRulePack,
} from "./tokenPolicyStructuralRoleRules.js";
import type {
  ComponentRecord,
  DeprecationRecord,
  ExampleRecord,
  GuideRecord,
  PackageRecord,
  PatternRecord,
  SaltRegistry,
  TokenRecord,
} from "./types.js";

type RegistryRecord =
  | ComponentRecord
  | DeprecationRecord
  | ExampleRecord
  | GuideRecord
  | PackageRecord
  | PatternRecord
  | TokenRecord;

export interface GeneratedArtifactRegistryEvidenceOptions {
  tokenPolicyStructuralRoleRulePack?: SaltTokenPolicyStructuralRoleRulePack | null;
}

function hasText(value: string | null | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function hasSourceLocator(ref: SaltEvidenceRef): boolean {
  return hasText(ref.source?.url) || hasText(ref.source?.repo_path);
}

function parseArrayIndex(fieldPath: string, prefix: string): number | null {
  if (!fieldPath.startsWith(prefix)) {
    return null;
  }

  const rawIndex = fieldPath.slice(prefix.length);
  if (!/^\d+$/.test(rawIndex)) {
    return null;
  }

  return Number.parseInt(rawIndex, 10);
}

function findRegistryRecord(
  registry: SaltRegistry,
  ref: SaltEvidenceRef,
): RegistryRecord | null {
  const registryRef = ref.registry;
  if (!registryRef) {
    return null;
  }

  switch (registryRef.entity_type) {
    case "component":
      return (
        registry.components.find(
          (component) => component.id === registryRef.entity_id,
        ) ?? null
      );
    case "deprecation":
      return (
        registry.deprecations.find(
          (deprecation) => deprecation.id === registryRef.entity_id,
        ) ?? null
      );
    case "example":
      return (
        registry.examples.find(
          (example) => example.id === registryRef.entity_id,
        ) ??
        registry.components
          .flatMap((component) => component.examples)
          .find((example) => example.id === registryRef.entity_id) ??
        registry.patterns
          .flatMap((pattern) => pattern.examples)
          .find((example) => example.id === registryRef.entity_id) ??
        null
      );
    case "guide":
      return (
        registry.guides.find((guide) => guide.id === registryRef.entity_id) ??
        null
      );
    case "package":
      return (
        registry.packages.find(
          (packageRecord) =>
            packageRecord.id === registryRef.entity_id ||
            packageRecord.name === registryRef.entity_id,
        ) ?? null
      );
    case "pattern":
      return (
        registry.patterns.find(
          (pattern) => pattern.id === registryRef.entity_id,
        ) ?? null
      );
    case "token":
      return (
        registry.tokens.find((token) => token.name === registryRef.entity_id) ??
        null
      );
    default:
      return null;
  }
}

function componentFieldExists(
  component: ComponentRecord,
  fieldPath: string,
): boolean {
  switch (fieldPath) {
    case "id":
      return hasText(component.id);
    case "name":
      return hasText(component.name);
    case "package.name":
      return hasText(component.package.name);
    case "package.status":
      return hasText(component.package.status);
    case "status":
      return hasText(component.status);
    case "summary":
      return hasText(component.summary);
    case "source.export_name":
      return hasText(component.source.export_name);
    case "source.repo_path":
      return hasText(component.source.repo_path);
    case "accessibility.summary":
      return component.accessibility.summary.length > 0;
    case "implementation_requirements.required_imports":
      return (
        (component.implementation_requirements?.required_imports.length ?? 0) >
        0
      );
    default:
      break;
  }

  if (fieldPath.startsWith("props.")) {
    const propName = fieldPath.slice("props.".length).split(".")[0];
    return component.props.some((prop) => prop.name === propName);
  }

  const whenToUseIndex = parseArrayIndex(fieldPath, "when_to_use.");
  if (whenToUseIndex != null) {
    return hasText(component.when_to_use[whenToUseIndex]);
  }

  const whenNotToUseIndex = parseArrayIndex(fieldPath, "when_not_to_use.");
  if (whenNotToUseIndex != null) {
    return hasText(component.when_not_to_use[whenNotToUseIndex]);
  }

  const semanticsPreferredForIndex = parseArrayIndex(
    fieldPath,
    "semantics.preferred_for.",
  );
  if (semanticsPreferredForIndex != null) {
    return hasText(
      component.semantics?.preferred_for[semanticsPreferredForIndex],
    );
  }

  const semanticsNotForIndex = parseArrayIndex(fieldPath, "semantics.not_for.");
  if (semanticsNotForIndex != null) {
    return hasText(component.semantics?.not_for[semanticsNotForIndex]);
  }

  const accessibilitySummaryIndex = parseArrayIndex(
    fieldPath,
    "accessibility.summary.",
  );
  if (accessibilitySummaryIndex != null) {
    return hasText(component.accessibility.summary[accessibilitySummaryIndex]);
  }

  if (fieldPath.startsWith("accessibility.rules.")) {
    const ruleId = fieldPath.slice("accessibility.rules.".length);
    return component.accessibility.rules.some((rule) => rule.id === ruleId);
  }

  if (fieldPath.startsWith("examples.")) {
    const examplePath = fieldPath.slice("examples.".length);
    return component.examples.some((example) => {
      if (examplePath === example.id) {
        return true;
      }

      if (!examplePath.startsWith(`${example.id}.`)) {
        return false;
      }

      return exampleFieldExists(
        example,
        examplePath.slice(example.id.length + 1),
      );
    });
  }

  if (fieldPath.startsWith("implementation_requirements.required_imports.")) {
    const specifier = fieldPath.slice(
      "implementation_requirements.required_imports.".length,
    );
    return (
      component.implementation_requirements?.required_imports.some(
        (item) => item.specifier === specifier,
      ) ?? false
    );
  }

  return false;
}

function exampleFieldExists(
  example: ExampleRecord,
  fieldPath: string,
): boolean {
  switch (fieldPath) {
    case "id":
      return hasText(example.id);
    case "title":
      return hasText(example.title);
    case "description":
      return hasText(example.description);
    case "code":
      return hasText(example.code);
    case "source_url":
      return hasText(example.source_url);
    case "package":
      return hasText(example.package);
    case "target_name":
      return hasText(example.target_name);
    default:
      return false;
  }
}

function guideFieldExists(guide: GuideRecord, fieldPath: string): boolean {
  switch (fieldPath) {
    case "name":
      return hasText(guide.name);
    case "summary":
      return hasText(guide.summary);
    case "related_docs.overview":
      return hasText(guide.related_docs.overview);
    default:
      return false;
  }
}

function packageFieldExists(
  packageRecord: PackageRecord,
  fieldPath: string,
): boolean {
  switch (fieldPath) {
    case "name":
      return hasText(packageRecord.name);
    case "status":
      return hasText(packageRecord.status);
    case "version":
      return hasText(packageRecord.version);
    case "summary":
      return hasText(packageRecord.summary);
    default:
      return false;
  }
}

function patternFieldExists(
  pattern: PatternRecord,
  fieldPath: string,
): boolean {
  switch (fieldPath) {
    case "name":
      return hasText(pattern.name);
    case "status":
      return hasText(pattern.status);
    case "summary":
      return hasText(pattern.summary);
    case "accessibility.summary":
      return pattern.accessibility.summary.length > 0;
    case "accessibility.implementation_signals":
      return (pattern.accessibility.implementation_signals?.length ?? 0) > 0;
    case "composed_of":
      return pattern.composed_of.length > 0;
    case "examples":
      return pattern.examples.length > 0;
    default:
      break;
  }

  const whenToUseIndex = parseArrayIndex(fieldPath, "when_to_use.");
  if (whenToUseIndex != null) {
    return hasText(pattern.when_to_use[whenToUseIndex]);
  }

  const whenNotToUseIndex = parseArrayIndex(fieldPath, "when_not_to_use.");
  if (whenNotToUseIndex != null) {
    return hasText(pattern.when_not_to_use[whenNotToUseIndex]);
  }

  const composedOfIndex = parseArrayIndex(fieldPath, "composed_of.");
  if (composedOfIndex != null) {
    return hasText(pattern.composed_of[composedOfIndex]?.component);
  }

  const howToBuildIndex = parseArrayIndex(fieldPath, "how_to_build.");
  if (howToBuildIndex != null) {
    return hasText(pattern.how_to_build[howToBuildIndex]);
  }

  const howItWorksIndex = parseArrayIndex(fieldPath, "how_it_works.");
  if (howItWorksIndex != null) {
    return hasText(pattern.how_it_works[howItWorksIndex]);
  }

  const resourceIndex = parseArrayIndex(fieldPath, "resources.");
  if (resourceIndex != null) {
    const resource = pattern.resources[resourceIndex];
    return hasText(resource?.label) && hasText(resource?.href);
  }

  const accessibilitySummaryIndex = parseArrayIndex(
    fieldPath,
    "accessibility.summary.",
  );
  if (accessibilitySummaryIndex != null) {
    return hasText(pattern.accessibility.summary[accessibilitySummaryIndex]);
  }

  const accessibilitySignalMatch = fieldPath.match(
    /^accessibility\.implementation_signals\.(\d+)(?:\.(kind|source_kind|source_url|values)(?:\.(\d+))?)?$/,
  );
  if (accessibilitySignalMatch) {
    const [, rawIndex, key, rawValueIndex] = accessibilitySignalMatch;
    const signal =
      pattern.accessibility.implementation_signals?.[
        Number.parseInt(rawIndex, 10)
      ];

    if (!signal) {
      return false;
    }

    if (!key) {
      return (
        hasText(signal.kind) &&
        signal.values.some(hasText) &&
        hasText(signal.source_kind) &&
        hasText(signal.source_url)
      );
    }

    if (key === "kind") {
      return hasText(signal.kind);
    }

    if (key === "source_kind") {
      return hasText(signal.source_kind);
    }

    if (key === "source_url") {
      return hasText(signal.source_url);
    }

    if (key === "values") {
      if (rawValueIndex == null) {
        return signal.values.some(hasText);
      }

      return hasText(signal.values[Number.parseInt(rawValueIndex, 10)]);
    }
  }

  const starterSourceUrlIndex = parseArrayIndex(
    fieldPath,
    "starter_scaffold.source_urls.",
  );
  if (starterSourceUrlIndex != null) {
    return hasText(pattern.starter_scaffold?.source_urls?.[starterSourceUrlIndex]);
  }

  const starterExampleSourceUrlIndex = parseArrayIndex(
    fieldPath,
    "starter_scaffold.example_source_urls.",
  );
  if (starterExampleSourceUrlIndex != null) {
    return hasText(
      pattern.starter_scaffold?.example_source_urls?.[
        starterExampleSourceUrlIndex
      ],
    );
  }

  const starterRegionsIndex = parseArrayIndex(
    fieldPath,
    "starter_scaffold.semantics.regions.",
  );
  if (starterRegionsIndex != null) {
    return hasText(
      pattern.starter_scaffold?.semantics.regions[starterRegionsIndex],
    );
  }

  const starterRequiredRegionsIndex = parseArrayIndex(
    fieldPath,
    "starter_scaffold.semantics.required_regions.",
  );
  if (starterRequiredRegionsIndex != null) {
    return hasText(
      pattern.starter_scaffold?.semantics.required_regions?.[
        starterRequiredRegionsIndex
      ],
    );
  }

  const starterOptionalRegionsIndex = parseArrayIndex(
    fieldPath,
    "starter_scaffold.semantics.optional_regions.",
  );
  if (starterOptionalRegionsIndex != null) {
    return hasText(
      pattern.starter_scaffold?.semantics.optional_regions?.[
        starterOptionalRegionsIndex
      ],
    );
  }

  const starterBuildAroundIndex = parseArrayIndex(
    fieldPath,
    "starter_scaffold.semantics.build_around.",
  );
  if (starterBuildAroundIndex != null) {
    return hasText(
      pattern.starter_scaffold?.semantics.build_around[
        starterBuildAroundIndex
      ],
    );
  }

  const starterPreserveConstraintsIndex = parseArrayIndex(
    fieldPath,
    "starter_scaffold.semantics.preserve_constraints.",
  );
  if (starterPreserveConstraintsIndex != null) {
    return hasText(
      pattern.starter_scaffold?.semantics.preserve_constraints[
        starterPreserveConstraintsIndex
      ],
    );
  }

  const starterTemplateImportMatch = fieldPath.match(
    /^starter_scaffold\.template\.imports\.(\d+)\.(name|package)$/,
  );
  if (starterTemplateImportMatch) {
    const [, rawIndex, key] = starterTemplateImportMatch;
    const index = Number.parseInt(rawIndex, 10);
    const importRecord = pattern.starter_scaffold?.template?.imports[index];
    return key === "name"
      ? hasText(importRecord?.name)
      : hasText(importRecord?.package);
  }

  const starterTemplateJsxLineIndex = parseArrayIndex(
    fieldPath,
    "starter_scaffold.template.jsx_lines.",
  );
  if (starterTemplateJsxLineIndex != null) {
    return hasText(
      pattern.starter_scaffold?.template?.jsx_lines[starterTemplateJsxLineIndex],
    );
  }

  const starterTemplateNoteIndex = parseArrayIndex(
    fieldPath,
    "starter_scaffold.template.notes.",
  );
  if (starterTemplateNoteIndex != null) {
    return hasText(
      pattern.starter_scaffold?.template?.notes?.[starterTemplateNoteIndex],
    );
  }

  if (fieldPath.startsWith("examples.")) {
    const examplePath = fieldPath.slice("examples.".length);
    return pattern.examples.some((example) => {
      if (examplePath === example.id) {
        return true;
      }

      if (!examplePath.startsWith(`${example.id}.`)) {
        return false;
      }

      return exampleFieldExists(
        example,
        examplePath.slice(example.id.length + 1),
      );
    });
  }

  return false;
}

function tokenFieldExists(token: TokenRecord, fieldPath: string): boolean {
  switch (fieldPath) {
    case "name":
      return hasText(token.name);
    case "category":
      return hasText(token.category);
    case "type":
      return hasText(token.type);
    case "value":
      return hasText(token.value);
    case "semantic_intent":
      return hasText(token.semantic_intent);
    case "deprecated":
      return true;
    case "policy.usage_tier":
      return hasText(token.policy?.usage_tier);
    case "policy.direct_component_use":
      return hasText(token.policy?.direct_component_use);
    case "policy.pairing":
      return !!token.policy?.pairing;
    default:
      break;
  }

  const guidanceIndex = parseArrayIndex(fieldPath, "guidance.");
  if (guidanceIndex != null) {
    return hasText(token.guidance[guidanceIndex]);
  }

  const docsIndex = parseArrayIndex(fieldPath, "policy.docs.");
  if (docsIndex != null) {
    return hasText(token.policy?.docs[docsIndex]);
  }

  const policyNotesIndex = parseArrayIndex(fieldPath, "policy.notes.");
  if (policyNotesIndex != null) {
    return hasText(token.policy?.notes[policyNotesIndex]);
  }

  const preferredForIndex = parseArrayIndex(fieldPath, "policy.preferred_for.");
  if (preferredForIndex != null) {
    return hasText(token.policy?.preferred_for[preferredForIndex]);
  }

  const avoidForIndex = parseArrayIndex(fieldPath, "policy.avoid_for.");
  if (avoidForIndex != null) {
    return hasText(token.policy?.avoid_for[avoidForIndex]);
  }

  const structuralRoleIndex = parseArrayIndex(
    fieldPath,
    "policy.structural_roles.",
  );
  if (structuralRoleIndex != null) {
    return hasText(token.policy?.structural_roles?.[structuralRoleIndex]);
  }

  return false;
}

function deprecationFieldExists(
  deprecation: DeprecationRecord,
  fieldPath: string,
): boolean {
  switch (fieldPath) {
    case "id":
      return hasText(deprecation.id);
    case "package":
      return hasText(deprecation.package);
    case "component":
      return hasText(deprecation.component);
    case "kind":
      return hasText(deprecation.kind);
    case "name":
      return hasText(deprecation.name);
    case "deprecated_in":
      return hasText(deprecation.deprecated_in);
    case "removed_in":
      return hasText(deprecation.removed_in);
    case "replacement.type":
      return hasText(deprecation.replacement.type);
    case "replacement.name":
      return hasText(deprecation.replacement.name);
    case "replacement.notes":
      return hasText(deprecation.replacement.notes);
    case "migration.strategy":
      return hasText(deprecation.migration.strategy);
    default:
      break;
  }

  const migrationDetailMatch = fieldPath.match(
    /^migration\.details\.(\d+)\.(from|to)$/,
  );
  if (migrationDetailMatch) {
    const [, rawIndex, key] = migrationDetailMatch;
    const index = Number.parseInt(rawIndex, 10);
    const detail = deprecation.migration.details[index];
    return key === "from" ? hasText(detail?.from) : hasText(detail?.to);
  }

  const sourceUrlIndex = parseArrayIndex(fieldPath, "source_urls.");
  if (sourceUrlIndex != null) {
    return hasText(deprecation.source_urls[sourceUrlIndex]);
  }

  return false;
}

function registryFieldExists(
  record: RegistryRecord,
  ref: SaltEvidenceRef,
  fieldPath: string,
): boolean {
  switch (ref.registry?.entity_type) {
    case "component":
      return componentFieldExists(record as ComponentRecord, fieldPath);
    case "deprecation":
      return deprecationFieldExists(record as DeprecationRecord, fieldPath);
    case "example":
      return exampleFieldExists(record as ExampleRecord, fieldPath);
    case "guide":
      return guideFieldExists(record as GuideRecord, fieldPath);
    case "package":
      return packageFieldExists(record as PackageRecord, fieldPath);
    case "pattern":
      return patternFieldExists(record as PatternRecord, fieldPath);
    case "token":
      return tokenFieldExists(record as TokenRecord, fieldPath);
    default:
      return false;
  }
}

function tokenStructuralRoleValue(
  token: TokenRecord,
  fieldPath: string,
): string | null {
  const structuralRoleIndex = parseArrayIndex(
    fieldPath,
    "policy.structural_roles.",
  );
  if (structuralRoleIndex != null) {
    return token.policy?.structural_roles?.[structuralRoleIndex] ?? null;
  }

  if (fieldPath === "policy.pairing") {
    return token.policy?.pairing?.role ?? null;
  }

  return null;
}

function validateTokenStructuralRoleRuleEvidence(
  ref: SaltEvidenceRef,
  path: string,
  record: RegistryRecord,
  options: GeneratedArtifactRegistryEvidenceOptions,
): SaltEvidenceValidationIssue[] {
  if (ref.registry?.entity_type !== "token" || !ref.registry.field_path) {
    return [];
  }

  const token = record as TokenRecord;
  const structuralRole = tokenStructuralRoleValue(
    token,
    ref.registry.field_path,
  );
  if (!structuralRole) {
    return [];
  }

  const rulePack = options.tokenPolicyStructuralRoleRulePack;
  const evidenceRefs = rulePack
    ? findTokenStructuralRoleRuleEvidence({
        rule_pack: rulePack,
        token,
        structural_role: structuralRole,
      })
    : [];

  if (evidenceRefs.length > 0) {
    return [];
  }

  return [
    {
      code: "missing_structural_role_rule_evidence",
      message: `Registry token structural-role claim '${ref.id}' must resolve to a source-backed token policy structural-role rule.`,
      path: `${path}.registry.field_path`,
    },
  ];
}

function validateRegistryRef(
  ref: SaltEvidenceRef,
  path: string,
  registry: SaltRegistry,
  options: GeneratedArtifactRegistryEvidenceOptions,
): SaltEvidenceValidationIssue[] {
  const issues: SaltEvidenceValidationIssue[] = [];

  if (ref.source_kind !== "registry" || !ref.registry) {
    return issues;
  }

  const record = findRegistryRecord(registry, ref);
  if (!record) {
    issues.push({
      code: "missing_registry_entity",
      message: `Registry evidence ref '${ref.id}' points to missing ${ref.registry.entity_type} '${ref.registry.entity_id}'.`,
      path: `${path}.registry.entity_id`,
    });
    return issues;
  }

  if (!hasText(ref.registry.field_path)) {
    issues.push({
      code: "missing_registry_field_path",
      message: `Registry evidence ref '${ref.id}' must include registry.field_path when validating generated Salt claims against a registry.`,
      path: `${path}.registry.field_path`,
    });
    return issues;
  }

  if (!registryFieldExists(record, ref, ref.registry.field_path)) {
    issues.push({
      code: "missing_registry_field",
      message: `Registry evidence ref '${ref.id}' points to missing field '${ref.registry.field_path}' on ${ref.registry.entity_type} '${ref.registry.entity_id}'.`,
      path: `${path}.registry.field_path`,
    });
  }

  issues.push(
    ...validateTokenStructuralRoleRuleEvidence(ref, path, record, options),
  );

  if (
    (ref.claim_kind === "accessibility" ||
      ref.claim_kind === "composition" ||
      ref.claim_kind === "example" ||
      ref.claim_kind === "import" ||
      ref.registry.entity_type === "deprecation") &&
    !hasSourceLocator(ref)
  ) {
    issues.push({
      code: "missing_source_locator",
      message: `Source-backed ${ref.claim_kind} evidence ref '${ref.id}' must include source.url or source.repo_path.`,
      path: `${path}.source`,
    });
  }

  return issues;
}

export function validateGeneratedArtifactRegistryEvidence(
  artifact: SaltGeneratedArtifact,
  registry: SaltRegistry,
  options: GeneratedArtifactRegistryEvidenceOptions = {},
): SaltEvidenceValidationIssue[] {
  const issues = validateGeneratedArtifactEvidence(artifact);
  const resolvedOptions: GeneratedArtifactRegistryEvidenceOptions = {
    ...options,
    tokenPolicyStructuralRoleRulePack:
      options.tokenPolicyStructuralRoleRulePack ??
      registry.token_policy_structural_role_rule_pack ??
      null,
  };

  artifact.evidence_refs.forEach((ref, refIndex) => {
    issues.push(
      ...validateRegistryRef(
        ref,
        `evidence_refs[${refIndex}]`,
        registry,
        resolvedOptions,
      ),
    );
  });

  return issues;
}
