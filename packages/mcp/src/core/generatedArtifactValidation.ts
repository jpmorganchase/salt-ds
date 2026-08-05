import {
  type SaltEvidenceRef,
  type SaltEvidenceValidationIssue,
  type SaltGeneratedArtifact,
  validateEvidenceRef,
  validateGeneratedArtifactEvidence,
} from "./evidence.js";
import { getSaltRegistryFingerprint } from "./registry/fingerprint.js";
import {
  findTokenStructuralRoleRuleEvidence,
  type SaltTokenPolicyStructuralRoleRulePack,
  validateTokenPolicyStructuralRoleRulePackEvidence,
} from "./tokenPolicyStructuralRoleRules.js";
import type {
  ApiSymbolIdentity,
  ComponentRecord,
  DeprecationRecord,
  ExampleRecord,
  GuideRecord,
  PackageRecord,
  PageRecord,
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
  | PageRecord
  | PatternRecord
  | TokenRecord;

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
  if (!/^(?:0|[1-9]\d*)$/.test(rawIndex)) {
    return null;
  }

  return Number.parseInt(rawIndex, 10);
}

interface RegistryRecordResolution {
  record: RegistryRecord | null;
  ambiguous: boolean;
}

function resolvedRegistryRecord(
  record: RegistryRecord | null,
): RegistryRecordResolution {
  return { record, ambiguous: false };
}

function findRegistryRecord(
  registry: SaltRegistry,
  ref: SaltEvidenceRef,
): RegistryRecordResolution {
  const registryRef = ref.registry;
  if (!registryRef) {
    return resolvedRegistryRecord(null);
  }

  switch (registryRef.entity_type) {
    case "component":
      return resolvedRegistryRecord(
        registry.components.find(
          (component) => component.id === registryRef.entity_id,
        ) ?? null,
      );
    case "deprecation":
      return resolvedRegistryRecord(
        registry.deprecations.find(
          (deprecation) => deprecation.id === registryRef.entity_id,
        ) ?? null,
      );
    case "example": {
      const matches = [
        ...registry.examples,
        ...registry.components.flatMap((component) => component.examples),
        ...registry.patterns.flatMap((pattern) => pattern.examples),
      ].filter((example) => example.id === registryRef.entity_id);
      const uniqueMatches = [
        ...new Map(
          matches.map((example) => [JSON.stringify(example), example] as const),
        ).values(),
      ];
      return uniqueMatches.length === 1
        ? resolvedRegistryRecord(uniqueMatches[0]!)
        : { record: null, ambiguous: uniqueMatches.length > 1 };
    }
    case "guide":
      return resolvedRegistryRecord(
        registry.guides.find((guide) => guide.id === registryRef.entity_id) ??
          null,
      );
    case "package":
      return resolvedRegistryRecord(
        registry.packages.find(
          (packageRecord) =>
            packageRecord.id === registryRef.entity_id ||
            packageRecord.name === registryRef.entity_id,
        ) ?? null,
      );
    case "page":
      return resolvedRegistryRecord(
        registry.pages.find((page) => page.id === registryRef.entity_id) ??
          null,
      );
    case "pattern":
      return resolvedRegistryRecord(
        registry.patterns.find(
          (pattern) => pattern.id === registryRef.entity_id,
        ) ?? null,
      );
    case "token":
      return resolvedRegistryRecord(
        registry.tokens.find((token) => token.name === registryRef.entity_id) ??
          null,
      );
    default:
      return resolvedRegistryRecord(null);
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
    case "composition":
      return Boolean(
        component.composition &&
          ((component.composition.required_children?.some(hasText) ?? false) ||
            (component.composition.optional_children?.some(hasText) ?? false) ||
            hasText(component.composition.typical_parent)),
      );
    case "related_docs.usage":
      return hasText(component.related_docs.usage);
    default:
      break;
  }

  if (/^props\.[^.]+$/u.test(fieldPath)) {
    const propName = fieldPath.slice("props.".length);
    return component.props.some((prop) => prop.name === propName);
  }

  const categoryIndex = parseArrayIndex(fieldPath, "category.");
  if (categoryIndex != null) return hasText(component.category[categoryIndex]);
  const tagIndex = parseArrayIndex(fieldPath, "tags.");
  if (tagIndex != null) return hasText(component.tags[tagIndex]);

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
    case "source_path":
      return hasText(example.source_path);
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
    case "id":
      return hasText(guide.id);
    case "name":
      return hasText(guide.name);
    case "kind":
      return hasText(guide.kind);
    case "summary":
      return hasText(guide.summary);
    case "related_docs.overview":
      return hasText(guide.related_docs.overview);
    default:
      break;
  }
  const packageIndex = parseArrayIndex(fieldPath, "packages.");
  if (packageIndex != null) return hasText(guide.packages[packageIndex]);
  const stepStatementMatch = fieldPath.match(
    /^steps\.(0|[1-9]\d*)\.statements\.(0|[1-9]\d*)$/u,
  );
  if (!stepStatementMatch) return false;
  return hasText(
    guide.steps[Number.parseInt(stepStatementMatch[1]!, 10)]?.statements[
      Number.parseInt(stepStatementMatch[2]!, 10)
    ],
  );
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

function pageFieldExists(page: PageRecord, fieldPath: string): boolean {
  switch (fieldPath) {
    case "id":
      return hasText(page.id);
    case "title":
      return hasText(page.title);
    case "route":
      return hasText(page.route);
    case "page_kind":
      return hasText(page.page_kind);
    case "summary":
      return hasText(page.summary);
    case "source_path":
      return hasText(page.source_path);
    default:
      break;
  }

  for (const [prefix, values] of [
    ["keywords.", page.keywords],
    ["content.", page.content],
    ["section_headings.", page.section_headings],
  ] as const) {
    const index = parseArrayIndex(fieldPath, prefix);
    if (index !== null) return hasText(values[index]);
  }
  return false;
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
    /^accessibility\.implementation_signals\.(0|[1-9]\d*)(?:\.(?:(kind|source_kind|source_url|source_path)|(values)(?:\.(0|[1-9]\d*))?))?$/u,
  );
  if (accessibilitySignalMatch) {
    const [, rawIndex, scalarKey, valuesKey, rawValueIndex] =
      accessibilitySignalMatch;
    const key = scalarKey ?? valuesKey;
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
        (hasText(signal.source_url) || hasText(signal.source_path))
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

    if (key === "source_path") {
      return hasText(signal.source_path);
    }

    if (key === "values") {
      if (rawValueIndex == null) {
        return signal.values.some(hasText);
      }

      return hasText(signal.values[Number.parseInt(rawValueIndex, 10)]);
    }
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
    case "subject":
      return true;
    case "subject.package":
      return hasText(deprecation.subject.package);
    case "subject.entrypoint":
      return hasText(deprecation.subject.entrypoint);
    case "subject.export_name":
      return hasText(deprecation.subject.export_name);
    case "subject.symbol_space":
      return hasText(deprecation.subject.symbol_space);
    case "subject.member_path":
      return true;
    case "deprecated_in":
      return hasText(deprecation.deprecated_in);
    case "removed_in":
      return hasText(deprecation.removed_in);
    case "replacement.type":
      return hasText(deprecation.replacement.type);
    case "replacement.mode":
      return hasText(deprecation.replacement.mode);
    case "replacement.target":
      return deprecation.replacement.target !== null;
    case "replacement.targets":
      return true;
    case "replacement.name":
      return hasText(deprecation.replacement.name);
    case "replacement.notes":
      return hasText(deprecation.replacement.notes);
    case "migration.strategy":
      return hasText(deprecation.migration.strategy);
    default:
      break;
  }

  const identityFieldExists = (
    identity: ApiSymbolIdentity,
    relativePath: string,
  ): boolean => {
    switch (relativePath) {
      case "package":
        return hasText(identity.package);
      case "entrypoint":
        return hasText(identity.entrypoint);
      case "export_name":
        return hasText(identity.export_name);
      case "symbol_space":
        return hasText(identity.symbol_space);
      case "member_path":
        return true;
      default:
        break;
    }
    const memberMatch = relativePath.match(
      /^member_path\.(0|[1-9]\d*)(?:\.(kind|name))?$/u,
    );
    if (!memberMatch) return false;
    const [, rawIndex, property] = memberMatch;
    const member = identity.member_path[Number.parseInt(rawIndex, 10)];
    if (!member) return false;
    if (property === undefined) return true;
    return property === "kind" ? hasText(member.kind) : hasText(member.name);
  };

  if (fieldPath.startsWith("subject.")) {
    return identityFieldExists(deprecation.subject, fieldPath.slice(8));
  }
  if (fieldPath.startsWith("replacement.target.")) {
    return deprecation.replacement.target
      ? identityFieldExists(
          deprecation.replacement.target,
          fieldPath.slice("replacement.target.".length),
        )
      : false;
  }
  const replacementTargetMatch = fieldPath.match(
    /^replacement\.targets\.(0|[1-9]\d*)(?:\.(.+))?$/u,
  );
  if (replacementTargetMatch) {
    const [, rawIndex, relativePath] = replacementTargetMatch;
    const target =
      deprecation.replacement.targets[Number.parseInt(rawIndex, 10)];
    return target
      ? relativePath === undefined || identityFieldExists(target, relativePath)
      : false;
  }

  const migrationDetailMatch = fieldPath.match(
    /^migration\.details\.(0|[1-9]\d*)\.(from|to)$/u,
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
  const sourcePathIndex = parseArrayIndex(fieldPath, "source_paths.");
  if (sourcePathIndex != null) {
    return hasText(deprecation.source_paths?.[sourcePathIndex]);
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
    case "page":
      return pageFieldExists(record as PageRecord, fieldPath);
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
  rulePack: SaltTokenPolicyStructuralRoleRulePack | null,
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
  activeRegistryHash: string,
  structuralRoleRulePack: SaltTokenPolicyStructuralRoleRulePack | null,
): SaltEvidenceValidationIssue[] {
  const issues: SaltEvidenceValidationIssue[] = [];

  if (!ref.registry) {
    return issues;
  }
  if (!hasText(ref.registry.registry_version)) {
    issues.push({
      code: "missing_registry_identity",
      message: `Registry evidence ref '${ref.id}' must declare registry.registry_version.`,
      path: `${path}.registry.registry_version`,
    });
  } else if (ref.registry.registry_version !== registry.version) {
    issues.push({
      code: "stale_registry",
      message: `Registry evidence ref '${ref.id}' targets version '${ref.registry.registry_version}', but the active registry is '${registry.version}'.`,
      path: `${path}.registry.registry_version`,
    });
  }
  if (!hasText(ref.registry.registry_hash)) {
    issues.push({
      code: "missing_registry_identity",
      message: `Registry evidence ref '${ref.id}' must declare registry.registry_hash.`,
      path: `${path}.registry.registry_hash`,
    });
  } else if (ref.registry.registry_hash !== activeRegistryHash) {
    issues.push({
      code: "stale_registry",
      message: `Registry evidence ref '${ref.id}' targets hash '${ref.registry.registry_hash}', but the active registry hash is '${activeRegistryHash}'.`,
      path: `${path}.registry.registry_hash`,
    });
  }

  const resolution = findRegistryRecord(registry, ref);
  if (resolution.ambiguous) {
    issues.push({
      code: "ambiguous_registry_entity",
      message: `Registry evidence ref '${ref.id}' points to non-unique ${ref.registry.entity_type} id '${ref.registry.entity_id}'; cite the owning component or pattern instead.`,
      path: `${path}.registry.entity_id`,
    });
    return issues;
  }
  const record = resolution.record;
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
    ...validateTokenStructuralRoleRuleEvidence(
      ref,
      path,
      record,
      structuralRoleRulePack,
    ),
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

function requiresStructuralRoleRulePack(ref: SaltEvidenceRef): boolean {
  return (
    ref.registry?.entity_type === "token" &&
    (ref.registry.field_path === "policy.pairing" ||
      ref.registry.field_path?.startsWith("policy.structural_roles.") === true)
  );
}

function validateActiveStructuralRoleRulePack(
  registry: SaltRegistry,
  required: boolean,
): {
  rulePack: SaltTokenPolicyStructuralRoleRulePack | null;
  issues: SaltEvidenceValidationIssue[];
} {
  if (!required) {
    return { rulePack: null, issues: [] };
  }
  const rulePack = registry.token_policy_structural_role_rule_pack ?? null;
  if (!rulePack) {
    return { rulePack: null, issues: [] };
  }
  const rulePackIssues = validateTokenPolicyStructuralRoleRulePackEvidence(
    rulePack,
    registry,
  );
  return {
    rulePack: rulePackIssues.length === 0 ? rulePack : null,
    issues: rulePackIssues.map(
      (issue): SaltEvidenceValidationIssue => ({
        code:
          issue.code === "missing_registry_identity" ||
          issue.code === "stale_registry"
            ? issue.code
            : "invalid_structural_role_rule_pack",
        message: issue.message,
        path: `token_policy_structural_role_rule_pack.${issue.path}`,
      }),
    ),
  };
}

export function validateSaltEvidenceRefAgainstRegistry(
  ref: SaltEvidenceRef,
  path: string,
  registry: SaltRegistry,
): SaltEvidenceValidationIssue[] {
  const activeRegistryHash = getSaltRegistryFingerprint(registry);
  const structuralRoleRulePack = validateActiveStructuralRoleRulePack(
    registry,
    requiresStructuralRoleRulePack(ref),
  );
  return [
    ...validateEvidenceRef(ref, path),
    ...structuralRoleRulePack.issues,
    ...validateRegistryRef(
      ref,
      path,
      registry,
      activeRegistryHash,
      structuralRoleRulePack.rulePack,
    ),
  ];
}

export function validateGeneratedArtifactRegistryEvidence(
  artifact: SaltGeneratedArtifact,
  registry: SaltRegistry,
): SaltEvidenceValidationIssue[] {
  const issues = validateGeneratedArtifactEvidence(artifact);
  const activeRegistryHash = getSaltRegistryFingerprint(registry);
  if (!hasText(artifact.registry.version)) {
    issues.push({
      code: "missing_registry_identity",
      message:
        "Generated artifacts validated against a registry must declare registry.version.",
      path: "registry.version",
    });
  } else if (artifact.registry.version !== registry.version) {
    issues.push({
      code: "stale_registry",
      message: `Generated artifact targets registry version '${artifact.registry.version}', but the active registry is '${registry.version}'.`,
      path: "registry.version",
    });
  }
  if (!hasText(artifact.registry.hash)) {
    issues.push({
      code: "missing_registry_identity",
      message:
        "Generated artifacts validated against a registry must declare registry.hash.",
      path: "registry.hash",
    });
  } else if (artifact.registry.hash !== activeRegistryHash) {
    issues.push({
      code: "stale_registry",
      message: `Generated artifact targets registry hash '${artifact.registry.hash}', but the active registry hash is '${activeRegistryHash}'.`,
      path: "registry.hash",
    });
  }
  const structuralRoleRulePack = validateActiveStructuralRoleRulePack(
    registry,
    artifact.evidence_refs.some(requiresStructuralRoleRulePack),
  );
  issues.push(...structuralRoleRulePack.issues);

  artifact.evidence_refs.forEach((ref, refIndex) => {
    issues.push(
      ...validateRegistryRef(
        ref,
        `evidence_refs[${refIndex}]`,
        registry,
        activeRegistryHash,
        structuralRoleRulePack.rulePack,
      ),
    );
  });

  return issues;
}
