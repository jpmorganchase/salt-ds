import { normalizeCatalogPublicCitation } from "../catalog/catalogPublicCitation.js";
import type { CatalogRuntimeFamilyName } from "../catalog/catalogSchemaV2.js";
import type { CatalogStoreV2 } from "../catalog/catalogStoreV2.js";
import {
  evaluateProjectPolicyConditionV2,
  type SaltProjectPolicyIrV2,
} from "../policy/projectPolicyIr.js";
import {
  apiSymbolModuleSpecifier,
  createVersionContext,
  deprecationSeverity,
  isDeprecationRelevant,
  normalizeVersion,
} from "../tools/codeAnalysisCommon.js";
import type {
  ComponentRecord,
  DeprecationRecord,
  SaltRegistry,
  TokenRecord,
} from "../types.js";
import {
  type ParsedSubmittedFact,
  type PublicParsedFact,
  publicParsedFact,
  type SubmittedArtifactLocation,
} from "./submittedArtifactFacts.js";

export interface ReviewEvidenceReference {
  locator: string;
  field_path: string;
}

export interface EvaluatedReviewFinding {
  id: string;
  rule_id: string;
  rule_description: string;
  severity: "info" | "warning" | "error";
  parsed_fact: PublicParsedFact;
  location: SubmittedArtifactLocation;
  remediation: string | null;
  policy_evaluation: {
    digest: string;
    applicability: "applicable";
    salt_version: string | null;
  } | null;
  evidence: {
    references: ReviewEvidenceReference[];
    validation: "source_bound";
  };
}

interface ReviewRuleDefinition {
  rule_id: string;
  description: string;
  evaluate: (input: {
    registry: SaltRegistry;
    store: CatalogStoreV2;
    facts: readonly ParsedSubmittedFact[];
    packageVersions: ReadonlyMap<string, string>;
    indexes: ReviewIndexes;
    budget: ReviewRuleBudget;
  }) => RuleMatchEvaluation;
}

export const MAX_REVIEW_RULE_COMPARISONS = 250_000;

export class ReviewRuleBudgetError extends Error {}

export interface ReviewRuleBudget {
  remaining: number;
  limit: number;
}

function consumeReviewBudget(budget: ReviewRuleBudget, count = 1): void {
  if (count < 0 || budget.remaining < count) {
    throw new ReviewRuleBudgetError(
      `The submitted artifact exceeded its allocated ${budget.limit}-comparison rule-evaluation budget.`,
    );
  }
  budget.remaining -= count;
}

type ComponentResolution =
  | { status: "none"; component: null }
  | { status: "resolved"; component: ComponentRecord }
  | { status: "ambiguous"; component: null };

type ComponentExportIdentityResolution =
  | { status: "resolved"; package_name: string; export_name: string }
  | { status: "ambiguous" };

interface ReviewIndexes {
  componentsByExport: ReadonlyMap<string, ComponentResolution>;
  componentIdentityByExport: ReadonlyMap<
    string,
    ComponentExportIdentityResolution
  >;
  rootDeprecationsByExport: ReadonlyMap<string, readonly DeprecationRecord[]>;
  propDeprecationsByPackageAndName: ReadonlyMap<
    string,
    readonly DeprecationRecord[]
  >;
  tokensByName: ReadonlyMap<string, TokenRecord>;
  jsxFactsByIdentity: ReadonlyMap<string, readonly ParsedSubmittedFact[]>;
  importFactsByIdentity: ReadonlyMap<string, readonly ParsedSubmittedFact[]>;
  tokenFactsByName: ReadonlyMap<string, readonly ParsedSubmittedFact[]>;
  usedNamespaceBindings: ReadonlySet<string>;
}

function identityKey(packageName: string, name: string): string {
  return `${packageName}\0${name}`;
}

function appendIndexValue<Value>(
  index: Map<string, Value[]>,
  key: string,
  value: Value,
): void {
  const values = index.get(key);
  if (values) values.push(value);
  else index.set(key, [value]);
}

function componentExportNames(component: ComponentRecord): string[] {
  return [
    component.source.export_name,
    ...(component.sub_components?.map((entry) => entry.export_name) ?? []),
    ...(component.canonical_example_exports?.map(
      (entry) => entry.export_name,
    ) ?? []),
  ].filter((value): value is string => Boolean(value));
}

function createReviewIndexes(
  registry: SaltRegistry,
  facts: readonly ParsedSubmittedFact[],
): ReviewIndexes {
  const componentsByExport = new Map<string, ComponentResolution>();
  const componentPackagesByExport = new Map<string, Set<string>>();
  for (const component of registry.components) {
    for (const exportName of new Set(componentExportNames(component))) {
      const key = identityKey(component.package.name, exportName);
      const packages = componentPackagesByExport.get(exportName) ?? new Set();
      packages.add(component.package.name);
      componentPackagesByExport.set(exportName, packages);
      const current = componentsByExport.get(key);
      componentsByExport.set(
        key,
        !current
          ? { status: "resolved", component }
          : current.status === "resolved" &&
              current.component.id === component.id
            ? current
            : { status: "ambiguous", component: null },
      );
    }
  }
  const componentIdentityByExport = new Map<
    string,
    ComponentExportIdentityResolution
  >();
  for (const [exportName, packages] of componentPackagesByExport) {
    const [packageName] = packages;
    const resolution = packageName
      ? componentsByExport.get(identityKey(packageName, exportName))
      : null;
    componentIdentityByExport.set(
      exportName,
      packages.size === 1 && resolution?.status === "resolved"
        ? {
            status: "resolved",
            package_name: packageName!,
            export_name: exportName,
          }
        : { status: "ambiguous" },
    );
  }
  const rootDeprecationsByExport = new Map<string, DeprecationRecord[]>();
  const propDeprecationsByPackageAndName = new Map<
    string,
    DeprecationRecord[]
  >();
  for (const deprecation of registry.deprecations) {
    const member = deprecation.subject.member_path.at(-1);
    if (deprecation.subject.member_path.length === 0) {
      appendIndexValue(
        rootDeprecationsByExport,
        identityKey(
          apiSymbolModuleSpecifier(deprecation.subject),
          deprecation.subject.export_name,
        ),
        deprecation,
      );
    } else if (member?.kind === "prop") {
      appendIndexValue(
        propDeprecationsByPackageAndName,
        identityKey(deprecation.package, member.name),
        deprecation,
      );
    }
  }
  const jsxFactsByIdentity = new Map<string, ParsedSubmittedFact[]>();
  const importFactsByIdentity = new Map<string, ParsedSubmittedFact[]>();
  const tokenFactsByName = new Map<string, ParsedSubmittedFact[]>();
  const usedNamespaceBindings = new Set<string>();
  for (const fact of facts) {
    if (
      fact.kind === "jsx_element" &&
      fact.package_name &&
      fact.export_name
    ) {
      appendIndexValue(
        jsxFactsByIdentity,
        identityKey(fact.package_name, fact.export_name),
        fact,
      );
    } else if (
      fact.kind === "import" &&
      fact.value_kind === "value_usage" &&
      fact.package_name &&
      fact.export_name
    ) {
      appendIndexValue(
        importFactsByIdentity,
        identityKey(fact.package_name, fact.export_name),
        fact,
      );
    } else if (fact.kind === "token_use") {
      appendIndexValue(tokenFactsByName, fact.subject, fact);
    }
    if (
      fact.kind === "import" &&
      fact.value_kind === "value_usage" &&
      fact.export_name === "*" &&
      fact.package_name &&
      fact.local_name
    ) {
      usedNamespaceBindings.add(
        identityKey(fact.package_name, fact.local_name),
      );
    }
  }
  return {
    componentsByExport,
    componentIdentityByExport,
    rootDeprecationsByExport,
    propDeprecationsByPackageAndName,
    tokensByName: new Map(
      registry.tokens.map((token) => [token.name, token] as const),
    ),
    jsxFactsByIdentity,
    importFactsByIdentity,
    tokenFactsByName,
    usedNamespaceBindings,
  };
}

interface RuleMatchEvaluation {
  findings: EvaluatedReviewFinding[];
  skipped_match_count: number;
  limitation: string | null;
}

export interface ReviewRuleEvaluation {
  findings: EvaluatedReviewFinding[];
  evaluated_rule_ids: string[];
  skipped_match_count: number;
  limitations: string[];
  policy: {
    status: "not_supplied" | "evaluated" | "limited";
    digest: string | null;
    unresolved_required_layers: number;
    evaluated_occurrences: number;
    applicable_occurrences: number;
    contradicted_occurrences: number;
    unknown_occurrences: number;
  };
}

export interface ReviewProjectPolicyContext {
  ir: SaltProjectPolicyIrV2;
  root_dir: string;
  digest: string;
  salt_version: string | null;
}

const ACTION_NAVIGATION_BINDINGS = new Map<
  string,
  { properties: ReadonlySet<string>; evidence_statement: string }
>([
  [
    "Button",
    {
      properties: new Set(["href", "to"]),
      evidence_statement:
        "When the primary action is to take the user to another page or window rather than to trigger a function. Instead, use Link.",
    },
  ],
]);

function valueAtFieldPath(value: unknown, fieldPath: string): unknown {
  return fieldPath.split(".").reduce<unknown>((current, segment) => {
    if (Array.isArray(current) && /^(0|[1-9][0-9]*)$/u.test(segment)) {
      return current[Number(segment)];
    }
    return current && typeof current === "object"
      ? (current as Record<string, unknown>)[segment]
      : undefined;
  }, value);
}

function catalogRecordReference(
  store: CatalogStoreV2,
  family: CatalogRuntimeFamilyName,
  id: string,
  fieldPath: string,
): ReviewEvidenceReference[] {
  const record = store.getRecord(family, id);
  if (!record) return [];
  const value =
    family === "content" && record.family === "content"
      ? store.getContentJson({
          family: "content",
          codec: record.codec,
          id: record.id,
        })
      : record;
  if (valueAtFieldPath(value, fieldPath) === undefined) return [];
  return [
    {
      locator: normalizeCatalogPublicCitation({
        kind: "catalog_record",
        manifest: store.manifest,
        family,
        id,
      }),
      field_path: fieldPath,
    },
  ];
}

function deprecationReferences(
  store: CatalogStoreV2,
  deprecation: DeprecationRecord,
  replacement: string | null,
): ReviewEvidenceReference[] {
  const record = store.getRecord("deprecation", deprecation.id);
  return [
    ...catalogRecordReference(
      store,
      "deprecation",
      deprecation.id,
      "subject_ref",
    ),
    ...(deprecation.deprecated_in
      ? catalogRecordReference(
          store,
          "deprecation",
          deprecation.id,
          "deprecated_in",
        )
      : []),
    ...(deprecation.removed_in
      ? catalogRecordReference(
          store,
          "deprecation",
          deprecation.id,
          "removed_in",
        )
      : []),
    ...(replacement
      ? record
        ? catalogRecordReference(
            store,
            "content",
            record.detail_content_ref.id,
            "replacement.target_ref",
          )
        : []
      : []),
  ];
}

function collectRuleMatches(
  rule: ReviewRuleDefinition,
  matches: Array<EvaluatedReviewFinding | null>,
): RuleMatchEvaluation {
  const findings = matches.filter(
    (match): match is EvaluatedReviewFinding => match !== null,
  );
  const skipped = matches.length - findings.length;
  return {
    findings,
    skipped_match_count: skipped,
    limitation:
      skipped === 0
        ? null
        : `${rule.rule_id} matched ${skipped} parsed fact${skipped === 1 ? "" : "s"}, but no finding was emitted because exact source-bound catalog evidence was unavailable.`,
  };
}

function makeFinding(input: {
  rule: Pick<ReviewRuleDefinition, "rule_id" | "description">;
  severity: EvaluatedReviewFinding["severity"];
  fact: ParsedSubmittedFact;
  remediation: string | null;
  references: ReviewEvidenceReference[];
}): EvaluatedReviewFinding | null {
  if (input.references.length === 0) return null;
  return {
    id: `${input.rule.rule_id}.${input.fact.fact_id}`,
    rule_id: input.rule.rule_id,
    rule_description: input.rule.description,
    severity: input.severity,
    parsed_fact: publicParsedFact(input.fact),
    location: input.fact.location,
    remediation: input.remediation,
    policy_evaluation: null,
    evidence: {
      references: input.references,
      validation: "source_bound",
    },
  };
}

function directReplacementName(deprecation: DeprecationRecord): string | null {
  if (
    deprecation.migration.strategy !== "replace" ||
    deprecation.replacement.mode !== "single" ||
    !deprecation.replacement.target
  ) {
    return null;
  }
  return (
    deprecation.replacement.target.member_path.at(-1)?.name ??
    deprecation.replacement.target.export_name
  );
}

const ACTION_NAVIGATION_RULE: ReviewRuleDefinition = {
  rule_id: "salt.component.action_navigation_target",
  description:
    "Salt action components must not be used as navigation links with a statically known destination.",
  evaluate: ({ store, facts, indexes, budget }) => {
    const matches = facts.flatMap((fact) => {
      consumeReviewBudget(budget);
      if (
        fact.kind !== "jsx_prop" ||
        fact.package_name !== "@salt-ds/core" ||
        !fact.export_name ||
        !fact.property ||
        fact.value_kind !== "static_string" ||
        typeof fact.static_value !== "string" ||
        fact.static_value.trim().length === 0
      ) {
        return [];
      }
      const binding = ACTION_NAVIGATION_BINDINGS.get(fact.export_name);
      if (!binding?.properties.has(fact.property)) return [];
      const resolution = indexes.componentsByExport.get(
        identityKey(fact.package_name, fact.export_name),
      );
      const component =
        resolution?.status === "resolved" ? resolution.component : null;
      const supportingIndex =
        component?.when_not_to_use.indexOf(binding.evidence_statement) ?? -1;
      const finding = makeFinding({
        rule: ACTION_NAVIGATION_RULE,
        severity: "warning",
        fact,
        remediation:
          "Use a Salt navigation component for a known destination, or remove the navigation target from the action component.",
        references:
          component?.usage_content_ref && supportingIndex >= 0
            ? catalogRecordReference(
                store,
                "content",
                component.usage_content_ref,
                `when_not_to_use.${supportingIndex}`,
              )
            : [],
      });
      return [finding];
    });
    return collectRuleMatches(ACTION_NAVIGATION_RULE, matches);
  },
};

function isUsedValueIdentityFact(
  fact: ParsedSubmittedFact,
  indexes: ReviewIndexes,
): boolean {
  if (fact.kind === "import") {
    return fact.value_kind === "value_usage" && fact.export_name !== "*";
  }
  if (
    fact.kind !== "jsx_element" ||
    !fact.local_name ||
    !fact.package_name ||
    !fact.export_name
  ) {
    return false;
  }
  return indexes.usedNamespaceBindings.has(
    identityKey(fact.package_name, fact.local_name),
  );
}

const CATALOG_STATUS_RULE: ReviewRuleDefinition = {
  rule_id: "salt.catalog.non_stable_import",
  description:
    "A used Salt value import is checked against its canonical catalog status.",
  evaluate: ({ store, facts, indexes, budget }) => {
    const matches = facts.flatMap((fact) => {
      consumeReviewBudget(budget);
      if (
        !isUsedValueIdentityFact(fact, indexes) ||
        !fact.package_name ||
        !fact.export_name
      ) {
        return [];
      }
      const resolution = indexes.componentsByExport.get(
        identityKey(fact.package_name, fact.export_name),
      );
      const component =
        resolution?.status === "resolved" ? resolution.component : null;
      if (!component || component.status === "stable") return [];
      const finding = makeFinding({
        rule: CATALOG_STATUS_RULE,
        severity: component.status === "deprecated" ? "error" : "warning",
        fact,
        remediation:
          component.status === "deprecated"
            ? "Use a current catalog alternative when one is available."
            : "Confirm that the non-stable component is appropriate for this use.",
        references: catalogRecordReference(
          store,
          "component",
          component.id,
          "status",
        ),
      });
      return [finding];
    });
    return collectRuleMatches(CATALOG_STATUS_RULE, matches);
  },
};

const DEPRECATED_IMPORT_RULE: ReviewRuleDefinition = {
  rule_id: "salt.deprecation.used_import",
  description:
    "A used Salt value import is checked against source-bound deprecation records.",
  evaluate: ({ store, facts, packageVersions, indexes, budget }) => {
    let incompleteMetadataCount = 0;
    let invalidRemovalMetadataCount = 0;
    let invalidVersionMatchCount = 0;
    const invalidVersionPackages = new Set<string>();
    const matches = facts.flatMap((fact) => {
      consumeReviewBudget(budget);
      if (
        !isUsedValueIdentityFact(fact, indexes) ||
        !fact.package_name ||
        !fact.export_name
      ) {
        return [];
      }
      const candidates =
        indexes.rootDeprecationsByExport.get(
          identityKey(fact.package_name, fact.export_name),
        ) ?? [];
      return candidates.flatMap((deprecation) => {
        consumeReviewBudget(budget);
        const version = createVersionContext(
          packageVersions.get(deprecation.package),
        );
        if (version.input !== null && version.normalized === null) {
          invalidVersionPackages.add(deprecation.package);
          invalidVersionMatchCount += 1;
          return [];
        }
        if (
          version.normalized &&
          !normalizeVersion(deprecation.deprecated_in)
        ) {
          incompleteMetadataCount += 1;
          return [];
        }
        if (
          version.normalized &&
          deprecation.removed_in !== null &&
          !normalizeVersion(deprecation.removed_in)
        ) {
          invalidRemovalMetadataCount += 1;
          return [];
        }
        if (!isDeprecationRelevant(deprecation, version)) return [];
        const replacement = directReplacementName(deprecation);
        const finding = makeFinding({
          rule: DEPRECATED_IMPORT_RULE,
          severity: deprecationSeverity(deprecation, version),
          fact,
          remediation: replacement
            ? `Review replacing ${deprecation.name} with ${replacement}.`
            : null,
          references: deprecationReferences(store, deprecation, replacement),
        });
        return [finding];
      });
    });
    const result = collectRuleMatches(DEPRECATED_IMPORT_RULE, matches);
    return {
      ...result,
      skipped_match_count:
        result.skipped_match_count +
        invalidVersionMatchCount +
        incompleteMetadataCount +
        invalidRemovalMetadataCount,
      limitation:
        [
          result.limitation,
          invalidVersionMatchCount > 0
            ? `${DEPRECATED_IMPORT_RULE.rule_id} skipped ${invalidVersionMatchCount} matching deprecation record${invalidVersionMatchCount === 1 ? "" : "s"} for ${[...invalidVersionPackages].sort().join(", ")} because the supplied version entries were not valid exact semantic versions.`
            : null,
          incompleteMetadataCount > 0
            ? `${DEPRECATED_IMPORT_RULE.rule_id} skipped ${incompleteMetadataCount} matching deprecation record${incompleteMetadataCount === 1 ? "" : "s"} because deprecated_in was missing or invalid for the applicable supplied package version.`
            : null,
          invalidRemovalMetadataCount > 0
            ? `${DEPRECATED_IMPORT_RULE.rule_id} skipped ${invalidRemovalMetadataCount} matching deprecation record${invalidRemovalMetadataCount === 1 ? "" : "s"} because removed_in was invalid for the applicable supplied package version.`
            : null,
        ]
          .filter(Boolean)
          .join(" ") || null,
    };
  },
};

const DEPRECATED_PROP_RULE: ReviewRuleDefinition = {
  rule_id: "salt.deprecation.static_prop",
  description:
    "A statically named prop on a used Salt component is checked against source-bound deprecation records.",
  evaluate: ({ store, facts, packageVersions, indexes, budget }) => {
    let incompleteMetadataCount = 0;
    let invalidRemovalMetadataCount = 0;
    let invalidVersionMatchCount = 0;
    const invalidVersionPackages = new Set<string>();
    const matches = facts.flatMap((fact) => {
      consumeReviewBudget(budget);
      if (
        fact.kind !== "jsx_prop" ||
        !fact.property ||
        fact.value_kind === "spread" ||
        !fact.package_name ||
        !fact.export_name
      ) {
        return [];
      }
      const componentResolution =
        indexes.componentsByExport.get(
          identityKey(fact.package_name, fact.export_name),
        ) ?? ({ status: "none", component: null } as const);
      if (componentResolution.status !== "resolved") {
        return [];
      }
      const candidates =
        indexes.propDeprecationsByPackageAndName.get(
          identityKey(
            componentResolution.component.package.name,
            fact.property,
          ),
        ) ?? [];
      return candidates.flatMap((deprecation) => {
        consumeReviewBudget(budget);
        const member = deprecation.subject.member_path.at(-1);
        const hasExactPropSubject =
          componentResolution.component.prop_subjects?.some(
            (subject) =>
              subject.package === deprecation.subject.package &&
              subject.entrypoint === deprecation.subject.entrypoint &&
              subject.export_name === deprecation.subject.export_name &&
              subject.symbol_space === deprecation.subject.symbol_space &&
              subject.member_path.length === 1 &&
              subject.member_path[0]?.kind === "prop" &&
              subject.member_path[0].name === member?.name,
          ) === true;
        if (
          member?.kind !== "prop" ||
          member.name !== fact.property ||
          deprecation.package !== componentResolution.component.package.name ||
          !hasExactPropSubject ||
          !componentResolution.component.props.some(
            (prop) => prop.name === member.name,
          )
        ) {
          return [];
        }
        const version = createVersionContext(
          packageVersions.get(deprecation.package),
        );
        if (version.input !== null && version.normalized === null) {
          invalidVersionPackages.add(deprecation.package);
          invalidVersionMatchCount += 1;
          return [];
        }
        if (
          version.normalized &&
          !normalizeVersion(deprecation.deprecated_in)
        ) {
          incompleteMetadataCount += 1;
          return [];
        }
        if (
          version.normalized &&
          deprecation.removed_in !== null &&
          !normalizeVersion(deprecation.removed_in)
        ) {
          invalidRemovalMetadataCount += 1;
          return [];
        }
        if (!isDeprecationRelevant(deprecation, version)) return [];
        const replacement = directReplacementName(deprecation);
        const finding = makeFinding({
          rule: DEPRECATED_PROP_RULE,
          severity: deprecationSeverity(deprecation, version),
          fact,
          remediation: replacement
            ? `Review replacing prop ${deprecation.name} with ${replacement}.`
            : null,
          references: deprecationReferences(store, deprecation, replacement),
        });
        return [finding];
      });
    });
    const result = collectRuleMatches(DEPRECATED_PROP_RULE, matches);
    return {
      ...result,
      skipped_match_count:
        result.skipped_match_count +
        invalidVersionMatchCount +
        incompleteMetadataCount +
        invalidRemovalMetadataCount,
      limitation:
        [
          result.limitation,
          invalidVersionMatchCount > 0
            ? `${DEPRECATED_PROP_RULE.rule_id} skipped ${invalidVersionMatchCount} matching deprecation record${invalidVersionMatchCount === 1 ? "" : "s"} for ${[...invalidVersionPackages].sort().join(", ")} because the supplied version entries were not valid exact semantic versions.`
            : null,
          incompleteMetadataCount > 0
            ? `${DEPRECATED_PROP_RULE.rule_id} skipped ${incompleteMetadataCount} matching deprecation record${incompleteMetadataCount === 1 ? "" : "s"} because deprecated_in was missing or invalid for the applicable supplied package version.`
            : null,
          invalidRemovalMetadataCount > 0
            ? `${DEPRECATED_PROP_RULE.rule_id} skipped ${invalidRemovalMetadataCount} matching deprecation record${invalidRemovalMetadataCount === 1 ? "" : "s"} because removed_in was invalid for the applicable supplied package version.`
            : null,
        ]
          .filter(Boolean)
          .join(" ") || null,
    };
  },
};

const DEPRECATED_TOKEN_RULE: ReviewRuleDefinition = {
  rule_id: "salt.token.deprecated_identity",
  description:
    "A parsed Salt custom-property reference is checked against canonical token deprecation state.",
  evaluate: ({ store, facts, indexes, budget }) => {
    const matches = facts.flatMap((fact) => {
      consumeReviewBudget(budget);
      if (fact.kind !== "token_use") return [];
      const token = indexes.tokensByName.get(fact.subject);
      if (!token?.deprecated) return [];
      const deprecatedDeclarations = (token.declarations ?? []).filter(
        (declaration) => declaration.deprecated,
      );
      const finding = makeFinding({
        rule: DEPRECATED_TOKEN_RULE,
        severity: "warning",
        fact,
        remediation:
          "Review the deprecated token declarations and their canonical replacement links when available.",
        references: deprecatedDeclarations.flatMap((declaration) =>
          catalogRecordReference(
            store,
            "token_declaration",
            declaration.id,
            "deprecated",
          ),
        ),
      });
      return [finding];
    });
    return collectRuleMatches(DEPRECATED_TOKEN_RULE, matches);
  },
};

export const REVIEW_RULES: readonly ReviewRuleDefinition[] = [
  ACTION_NAVIGATION_RULE,
  CATALOG_STATUS_RULE,
  DEPRECATED_IMPORT_RULE,
  DEPRECATED_PROP_RULE,
  DEPRECATED_TOKEN_RULE,
];

export const REVIEW_RULE_IDS = REVIEW_RULES.map((rule) => rule.rule_id);

function uniqueValues(values: Array<string | null | undefined>): string[] {
  return [
    ...new Set(values.filter((value): value is string => Boolean(value))),
  ];
}

function policyCanonicalName(
  occurrence: SaltProjectPolicyIrV2["occurrences"][number],
): string | null {
  return occurrence.category === "approved_wrapper"
    ? occurrence.declaration.wraps
    : occurrence.category === "preferred_component"
      ? occurrence.declaration.salt_name
      : occurrence.category === "banned_choice"
        ? occurrence.declaration.name
        : occurrence.category === "pattern_preference"
          ? (occurrence.declaration.canonical_salt_start ?? null)
          : null;
}

function catalogGroundedCanonicalName(
  fact: ParsedSubmittedFact,
  indexes: ReviewIndexes,
): string | null {
  if (
    (fact.kind !== "import" && fact.kind !== "jsx_element") ||
    !fact.package_name ||
    !fact.export_name
  ) {
    return null;
  }
  const resolution = indexes.componentIdentityByExport.get(fact.export_name);
  return resolution?.status === "resolved" &&
    resolution.package_name === fact.package_name
    ? fact.export_name
    : null;
}

function policyCandidateFacts(
  occurrence: SaltProjectPolicyIrV2["occurrences"][number],
  indexes: ReviewIndexes,
): ParsedSubmittedFact[] {
  if (occurrence.category === "token_alias") {
    return [
      ...(indexes.tokenFactsByName.get(occurrence.declaration.salt_name) ?? []),
    ];
  }
  if (occurrence.category === "token_family_policy") {
    return [];
  }
  const canonicalName = policyCanonicalName(occurrence);
  if (!canonicalName) return [];
  const resolution = indexes.componentIdentityByExport.get(canonicalName);
  if (resolution?.status !== "resolved") return [];
  const key = identityKey(resolution.package_name, resolution.export_name);
  const jsxFacts = [...(indexes.jsxFactsByIdentity.get(key) ?? [])];
  if (jsxFacts.length > 0) return jsxFacts;
  return [...(indexes.importFactsByIdentity.get(key) ?? [])];
}

function policyFinding(
  policy: ReviewProjectPolicyContext,
  occurrence: SaltProjectPolicyIrV2["occurrences"][number],
  fact: ParsedSubmittedFact,
  effectiveSaltVersion: string | null,
): EvaluatedReviewFinding | null {
  let severity: EvaluatedReviewFinding["severity"] = "info";
  let remediation: string | null = null;
  let fieldPath = "declaration";
  switch (occurrence.category) {
    case "approved_wrapper":
      if (!approvedWrapperImportVerified(occurrence)) {
        return null;
      }
      severity = "warning";
      remediation =
        "Review the cited project-policy claim and use its applicable approved wrapper.";
      fieldPath = "claim.declaration.name";
      break;
    case "preferred_component":
      severity = "warning";
      remediation =
        "Review the cited project-policy claim and use its applicable component preference.";
      fieldPath = "claim.declaration.prefer";
      break;
    case "token_alias":
      severity = "info";
      remediation =
        "Review the cited project-policy claim and use its applicable explicit token alias.";
      fieldPath = "claim.declaration.prefer";
      break;
    case "banned_choice":
      severity = "error";
      remediation = occurrence.declaration.replacement
        ? "Review the cited project-policy claim and use its declared replacement for this banned choice."
        : null;
      fieldPath = occurrence.declaration.replacement
        ? "claim.declaration.replacement"
        : "claim.declaration.name";
      break;
    case "pattern_preference":
      severity = "info";
      remediation =
        "Review the cited project-policy claim and use its applicable pattern preference.";
      fieldPath = "claim.declaration.prefer";
      break;
    case "token_family_policy":
    case "theme_defaults":
      return null;
  }
  const claimLocator = normalizeCatalogPublicCitation({
    kind: "project_policy_resource",
    rootDir: policy.root_dir,
    digest: policy.digest,
    resourceKind: "claim",
    id: occurrence.occurrence_id,
  });
  const referencePaths = [
    fieldPath,
    "claim.selector",
    "claim.applicability",
    "claim.source",
    ...(occurrence.category === "approved_wrapper" &&
    occurrence.declaration.import
      ? ["claim.applicability.import_validation"]
      : []),
  ];
  return {
    id: `${occurrence.policy_type_id}.${occurrence.occurrence_id}.${fact.fact_id}`,
    rule_id: occurrence.policy_type_id,
    rule_description:
      "An explicitly declared project-policy occurrence applies to a parsed submitted fact.",
    severity,
    parsed_fact: publicParsedFact(fact),
    location: fact.location,
    remediation,
    policy_evaluation: {
      digest: policy.digest,
      applicability: "applicable",
      salt_version: effectiveSaltVersion,
    },
    evidence: {
      references: referencePaths.map((field_path) => ({
        locator: claimLocator,
        field_path,
      })),
      validation: "source_bound",
    },
  };
}

function approvedWrapperImportVerified(
  occurrence: Extract<
    SaltProjectPolicyIrV2["occurrences"][number],
    { category: "approved_wrapper" }
  >,
): boolean {
  const declaredImport = occurrence.declaration.import;
  if (!declaredImport) return occurrence.import_checks.length === 0;
  return occurrence.import_checks.some(
    (check) =>
      check.status === "resolved" &&
      check.slot === "wrapper_import" &&
      check.from === declaredImport.from &&
      check.name === declaredImport.name,
  );
}

function evaluateProjectPolicyRules(input: {
  registry: SaltRegistry;
  facts: readonly ParsedSubmittedFact[];
  packageVersions: ReadonlyMap<string, string>;
  policy: ReviewProjectPolicyContext | null;
  indexes: ReviewIndexes;
  budget: ReviewRuleBudget;
}): {
  findings: EvaluatedReviewFinding[];
  evaluated_rule_ids: string[];
  skipped_match_count: number;
  limitations: string[];
  policy: ReviewRuleEvaluation["policy"];
} {
  if (!input.policy) {
    return {
      findings: [],
      evaluated_rule_ids: [],
      skipped_match_count: 0,
      limitations: [],
      policy: {
        status: "not_supplied",
        digest: null,
        unresolved_required_layers: 0,
        evaluated_occurrences: 0,
        applicable_occurrences: 0,
        contradicted_occurrences: 0,
        unknown_occurrences: 0,
      },
    };
  }
  const policy = input.policy;
  const canonicalNames = uniqueValues(
    input.facts.map((fact) => catalogGroundedCanonicalName(fact, input.indexes)),
  );
  const sourceTokens = uniqueValues(
    input.facts.flatMap((fact) =>
      fact.kind === "token_use" ? [fact.subject] : [],
    ),
  );
  const tokenByName = new Map(
    input.registry.tokens.map((token) => [token.name, token] as const),
  );
  const tokenFamilies = uniqueValues(
    sourceTokens.map((token) => tokenByName.get(token)?.category),
  );
  const effectiveByOverride = new Map<
    string,
    SaltProjectPolicyIrV2["occurrences"][number]
  >();
  for (const occurrence of policy.ir.occurrences) {
    effectiveByOverride.set(
      `${occurrence.category}\0${occurrence.override_key}`,
      occurrence,
    );
  }
  const effectiveOccurrences = [...effectiveByOverride.values()].sort(
    (left, right) => {
      for (let index = 0; index < 3; index += 1) {
        const difference =
          left.provenance.source_order[index]! -
          right.provenance.source_order[index]!;
        if (difference !== 0) return difference;
      }
      return left.occurrence_id.localeCompare(right.occurrence_id);
    },
  );
  const shadowedOccurrenceCount =
    policy.ir.occurrences.length - effectiveOccurrences.length;
  const unresolvedRequiredLayerIndexes = policy.ir.layers
    .filter(
      (layer) => !layer.optional && layer.resolution_status !== "resolved",
    )
    .map((layer) => layer.layer_index);
  const unresolvedRequiredLayerCount = unresolvedRequiredLayerIndexes.length;
  const effectiveSaltVersion = createVersionContext(
    policy.salt_version ?? input.packageVersions.get("@salt-ds/core"),
  ).normalized;
  const applicability = effectiveOccurrences.map((occurrence) => {
    consumeReviewBudget(input.budget);
    const blockedByUnresolvedLayer = unresolvedRequiredLayerIndexes.some(
      (layerIndex) => layerIndex > occurrence.provenance.layer_index,
    );
    const canonicalName = policyCanonicalName(occurrence);
    const blockedByUnresolvedSelector =
      canonicalName !== null &&
      input.indexes.componentIdentityByExport.get(canonicalName)?.status !==
        "resolved";
    return {
      occurrence,
      blockedByUnresolvedLayer,
      blockedByUnresolvedSelector,
      status: blockedByUnresolvedLayer || blockedByUnresolvedSelector
        ? ("unknown" as const)
        : evaluateProjectPolicyConditionV2(occurrence.condition, {
            workflow: "review",
            salt_version: effectiveSaltVersion,
            facts: {
              canonical_name: new Set(canonicalNames),
              source_token: new Set(sourceTokens),
              token_family: new Set(tokenFamilies),
            },
            normalized_facts: {},
          }),
    };
  });
  const applicable = applicability.filter(
    (entry) => entry.status === "applicable",
  );
  const unknown = applicability.filter((entry) => entry.status === "unknown");
  const unresolvedPrecedenceCount = unknown.filter(
    (entry) => entry.blockedByUnresolvedLayer,
  ).length;
  const unverifiedWrapperCount = applicable.filter(
    ({ occurrence }) =>
      occurrence.category === "approved_wrapper" &&
      !approvedWrapperImportVerified(occurrence),
  ).length;
  const unresolvedSelectorCount = unknown.filter(
    (entry) => entry.blockedByUnresolvedSelector,
  ).length;
  const findingCandidates = applicable.flatMap(({ occurrence }) =>
    (occurrence.category === "approved_wrapper" &&
    !approvedWrapperImportVerified(occurrence)
      ? []
      : policyCandidateFacts(occurrence, input.indexes)
    ).map((fact) => {
      consumeReviewBudget(input.budget);
      return { occurrence, fact };
    }),
  );
  const winningPrecedenceByFact = new Map<string, number>();
  for (const candidate of findingCandidates) {
    const precedence = candidate.occurrence.rule_precedence ?? 99;
    winningPrecedenceByFact.set(
      candidate.fact.fact_id,
      Math.min(
        winningPrecedenceByFact.get(candidate.fact.fact_id) ?? 99,
        precedence,
      ),
    );
  }
  const findings = findingCandidates.flatMap(({ occurrence, fact }) => {
    if (
      (occurrence.rule_precedence ?? 99) !==
      winningPrecedenceByFact.get(fact.fact_id)
    ) {
      return [];
    }
    consumeReviewBudget(input.budget);
    const finding = policyFinding(
      policy,
      occurrence,
      fact,
      effectiveSaltVersion,
    );
    return finding ? [finding] : [];
  });
  return {
    findings,
    evaluated_rule_ids: uniqueValues(
      applicability.map(({ occurrence }) => occurrence.policy_type_id),
    ),
    skipped_match_count: unknown.length + unverifiedWrapperCount,
    limitations: [
      ...(unknown.length > 0
        ? [
            `${unknown.length} project-policy occurrence${unknown.length === 1 ? " was" : "s were"} unknown from submitted facts, unresolved catalog ownership, or unresolved higher-precedence required layers and did not ground findings.`,
          ]
        : []),
      ...(unresolvedPrecedenceCount > 0
        ? [
            `${unresolvedPrecedenceCount} otherwise-effective project-policy occurrence${unresolvedPrecedenceCount === 1 ? " was" : "s were"} withheld because a required higher-precedence policy layer was unresolved.`,
          ]
        : []),
      ...(unresolvedRequiredLayerCount > 0
        ? [
            `${unresolvedRequiredLayerCount} required project-policy layer${unresolvedRequiredLayerCount === 1 ? " was" : "s were"} unresolved, so project-policy coverage is limited.`,
          ]
        : []),
      ...(unverifiedWrapperCount > 0
        ? [
            `${unverifiedWrapperCount} applicable approved-wrapper occurrence${unverifiedWrapperCount === 1 ? " was" : "s were"} not emitted as a finding because a declared import target was not verified.`,
          ]
        : []),
      ...(unresolvedSelectorCount > 0
        ? [
            `${unresolvedSelectorCount} project-policy component selector${unresolvedSelectorCount === 1 ? " remained" : "s remained"} unknown because its export did not resolve to one unique canonical catalog package identity.`,
          ]
        : []),
      ...(shadowedOccurrenceCount > 0
        ? [
            `${shadowedOccurrenceCount} project-policy occurrence${shadowedOccurrenceCount === 1 ? " was" : "s were"} superseded by a later declaration with the same category and override key.`,
          ]
        : []),
    ],
    policy: {
      status:
        unresolvedRequiredLayerCount > 0 || unresolvedSelectorCount > 0
          ? "limited"
          : "evaluated",
      digest: policy.digest,
      unresolved_required_layers: unresolvedRequiredLayerCount,
      evaluated_occurrences: applicability.length,
      applicable_occurrences: applicable.length,
      contradicted_occurrences: applicability.filter(
        (entry) => entry.status === "contradicted",
      ).length,
      unknown_occurrences: unknown.length,
    },
  };
}

export function evaluateReviewRules(input: {
  registry: SaltRegistry;
  store: CatalogStoreV2;
  facts: readonly ParsedSubmittedFact[];
  packageVersions: ReadonlyMap<string, string>;
  policy?: ReviewProjectPolicyContext | null;
  budget?: ReviewRuleBudget;
}): ReviewRuleEvaluation {
  const indexes = createReviewIndexes(input.registry, input.facts);
  const budget: ReviewRuleBudget = input.budget ?? {
    remaining: MAX_REVIEW_RULE_COMPARISONS,
    limit: MAX_REVIEW_RULE_COMPARISONS,
  };
  const evaluations = REVIEW_RULES.map((rule) => ({
    rule,
    result: rule.evaluate({
      registry: input.registry,
      store: input.store,
      facts: input.facts,
      packageVersions: input.packageVersions,
      indexes,
      budget,
    }),
  }));
  const policyEvaluation = evaluateProjectPolicyRules({
    registry: input.registry,
    facts: input.facts,
    packageVersions: input.packageVersions,
    policy: input.policy ?? null,
    indexes,
    budget,
  });
  const allFindings: EvaluatedReviewFinding[] = [
    ...evaluations.flatMap(({ result }) => result.findings),
    ...policyEvaluation.findings,
  ];
  const findings = [
    ...new Map(allFindings.map((finding) => [finding.id, finding])).values(),
  ].sort((left, right) => {
    const severity = { error: 0, warning: 1, info: 2 } as const;
    return (
      severity[left.severity] - severity[right.severity] ||
      left.location.start_offset - right.location.start_offset ||
      left.rule_id.localeCompare(right.rule_id)
    );
  });
  return {
    findings,
    evaluated_rule_ids: [
      ...evaluations
        .filter(
          ({ result }) =>
            !result.limitation?.includes("was not evaluated because"),
        )
        .map(({ rule }) => rule.rule_id),
      ...policyEvaluation.evaluated_rule_ids,
    ],
    skipped_match_count:
      evaluations.reduce(
        (total, { result }) => total + result.skipped_match_count,
        0,
      ) + policyEvaluation.skipped_match_count,
    limitations: [
      ...evaluations.flatMap(({ result }) =>
        result.limitation ? [result.limitation] : [],
      ),
      ...policyEvaluation.limitations,
    ],
    policy: policyEvaluation.policy,
  };
}
