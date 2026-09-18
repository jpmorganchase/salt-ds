import { satisfies, valid, validRange } from "semver";
import * as z from "zod/v4";
import { canonicalJson } from "../catalog/catalogSerialization.js";
import type {
  ApprovedWrapperConvention,
  BannedChoiceConvention,
  PatternPreferenceConvention,
  PreferredComponentConvention,
  ProjectConventions,
  ProjectConventionsLayerScope,
  TokenAliasConvention,
  TokenFamilyPolicyConvention,
} from "./index.js";

export const SALT_PROJECT_POLICY_IR_V2_CONTRACT =
  "salt_project_policy_ir_v2" as const;

export const PROJECT_POLICY_SOURCE_CATEGORIES = [
  "preferred_components",
  "approved_wrappers",
  "token_aliases",
  "theme_defaults",
  "token_family_policies",
  "pattern_preferences",
  "banned_choices",
] as const;

export type ProjectPolicySourceCategory =
  (typeof PROJECT_POLICY_SOURCE_CATEGORIES)[number];

export type ProjectPolicyCategory =
  | "preferred_component"
  | "approved_wrapper"
  | "token_alias"
  | "theme_defaults"
  | "token_family_policy"
  | "pattern_preference"
  | "banned_choice";

export type ProjectPolicyCategoryPresence =
  | "absent"
  | "present_empty"
  | "present_nonempty"
  | "unknown";

export type ProjectPolicyConditionV2 =
  | { type: "always" }
  | { type: "all"; conditions: ProjectPolicyConditionV2[] }
  | { type: "any"; conditions: ProjectPolicyConditionV2[] }
  | { type: "not"; condition: ProjectPolicyConditionV2 }
  | {
      type: "workflow_is";
      value: "create" | "review" | "migrate";
      origin: "migration_shim";
    }
  | {
      type: "fact_equals";
      fact:
        | "canonical_name"
        | "intent"
        | "context_tag"
        | "source_identifier"
        | "source_token"
        | "token_family";
      value: string;
      comparison: "exact" | "normalized_text";
      origin: "selector" | "use_when" | "avoid_when";
    }
  | {
      type: "salt_version_satisfies";
      range: string;
      origin: "supported_salt_range";
    }
  | {
      type: "opaque";
      text: string;
      origin: "use_when" | "avoid_when" | "future_condition";
    };

export type ProjectPolicyApplicabilityV2 =
  | "applicable"
  | "contradicted"
  | "unknown";

export interface ProjectPolicyEvaluationContextV2 {
  workflow: "create" | "review" | "migrate";
  salt_version: string | null;
  facts: Partial<
    Record<
      Extract<ProjectPolicyConditionV2, { type: "fact_equals" }>["fact"],
      readonly string[] | ReadonlySet<string>
    >
  >;
  normalized_facts?: Partial<
    Record<
      Extract<ProjectPolicyConditionV2, { type: "fact_equals" }>["fact"],
      ReadonlySet<string>
    >
  >;
}

export const MAX_PROJECT_POLICY_CONDITION_NODES = 128;
export const MAX_PROJECT_POLICY_CONDITION_DEPTH = 16;

function normalizedPolicyText(value: string): string {
  return value.normalize("NFC").trim().replace(/\s+/gu, " ").toLowerCase();
}

function isStringSet(
  values: readonly string[] | ReadonlySet<string>,
): values is ReadonlySet<string> {
  return !Array.isArray(values);
}

function invertApplicability(
  value: ProjectPolicyApplicabilityV2,
): ProjectPolicyApplicabilityV2 {
  return value === "applicable"
    ? "contradicted"
    : value === "contradicted"
      ? "applicable"
      : "unknown";
}

/**
 * Resolve an authored policy condition only from explicit, caller-bound facts.
 * Opaque prose is deliberately unknown and can never authorize a finding.
 */
export function evaluateProjectPolicyConditionV2(
  condition: ProjectPolicyConditionV2,
  context: ProjectPolicyEvaluationContextV2,
): ProjectPolicyApplicabilityV2 {
  const budget = { remaining: MAX_PROJECT_POLICY_CONDITION_NODES };
  const evaluate = (
    candidate: ProjectPolicyConditionV2,
    depth: number,
  ): ProjectPolicyApplicabilityV2 => {
    if (depth > MAX_PROJECT_POLICY_CONDITION_DEPTH || budget.remaining <= 0) {
      return "unknown";
    }
    budget.remaining -= 1;
    switch (candidate.type) {
      case "always":
        return "applicable";
      case "all": {
        let sawUnknown = false;
        for (const child of candidate.conditions) {
          const result = evaluate(child, depth + 1);
          if (result === "contradicted") return "contradicted";
          if (result === "unknown") sawUnknown = true;
        }
        return sawUnknown ? "unknown" : "applicable";
      }
      case "any": {
        let sawUnknown = false;
        for (const child of candidate.conditions) {
          const result = evaluate(child, depth + 1);
          if (result === "applicable") return "applicable";
          if (result === "unknown") sawUnknown = true;
        }
        return sawUnknown ? "unknown" : "contradicted";
      }
      case "not":
        return invertApplicability(evaluate(candidate.condition, depth + 1));
      case "workflow_is":
        return context.workflow === candidate.value
          ? "applicable"
          : "contradicted";
      case "fact_equals": {
        const values = context.facts[candidate.fact] ?? [];
        if ((isStringSet(values) ? values.size : values.length) === 0) {
          return "unknown";
        }
        const expected =
          candidate.comparison === "normalized_text"
            ? normalizedPolicyText(candidate.value)
            : candidate.value;
        const matches =
          candidate.comparison === "normalized_text"
            ? (context.normalized_facts?.[candidate.fact]?.has(expected) ??
              [...values].some(
                (value) => normalizedPolicyText(value) === expected,
              ))
            : isStringSet(values)
              ? values.has(expected)
              : values.includes(expected);
        return matches ? "applicable" : "contradicted";
      }
      case "salt_version_satisfies": {
        const version = context.salt_version
          ? valid(context.salt_version.trim())
          : null;
        const range = validRange(candidate.range);
        if (!version || !range) return "unknown";
        return satisfies(version, range) ? "applicable" : "contradicted";
      }
      case "opaque":
        return "unknown";
    }
  };
  return evaluate(condition, 1);
}

export type ProjectPolicyImportCheckV2 = {
  slot: "wrapper_import" | "theme_provider_import" | "theme_side_effect_import";
  slot_index: number | null;
  from: string;
  name: string | null;
  status:
    | "resolved"
    | "missing_module"
    | "missing_export"
    | "unsupported"
    | "not_inspected_limit";
  resolved_path: string | null;
  reason: string | null;
};

export interface ProjectPolicyOccurrenceProvenanceV2 {
  layer_id: string;
  layer_index: number;
  scope: ProjectConventionsLayerScope;
  declared_source: string;
  resolved_path: string | null;
  json_pointer: string;
  entry_index: number;
  source_order: [
    layerIndex: number,
    categoryOrdinal: number,
    entryIndex: number,
  ];
}

interface ProjectPolicyOccurrenceBaseV2<
  Category extends ProjectPolicyCategory,
  Declaration,
  OptionalField extends string,
> {
  occurrence_id: string;
  policy_type_id: string;
  category: Category;
  override_key: string;
  declaration: Declaration;
  optional_fields_present: OptionalField[];
  provenance: ProjectPolicyOccurrenceProvenanceV2;
  rule_precedence: 1 | 2 | 3 | 4 | null;
  condition: ProjectPolicyConditionV2;
  import_checks: ProjectPolicyImportCheckV2[];
}

export type PreferredComponentPolicyOccurrenceV2 =
  ProjectPolicyOccurrenceBaseV2<
    "preferred_component",
    PreferredComponentConvention,
    "docs"
  >;

export type ApprovedWrapperPolicyOccurrenceV2 = ProjectPolicyOccurrenceBaseV2<
  "approved_wrapper",
  ApprovedWrapperConvention,
  "import" | "use_when" | "avoid_when" | "migration_shim" | "docs"
>;

export type TokenAliasPolicyOccurrenceV2 = ProjectPolicyOccurrenceBaseV2<
  "token_alias",
  TokenAliasConvention,
  "docs"
>;

export type ProjectPolicyThemeDefaultsDeclarationV2 = {
  provider?: string;
  provider_import?: {
    from: string;
    name: string;
  };
  imports?: string[];
  props?: Array<{
    name: string;
    value: string;
  }>;
  reason: string;
  docs?: string[];
};

export type ThemeDefaultsPolicyOccurrenceV2 = ProjectPolicyOccurrenceBaseV2<
  "theme_defaults",
  ProjectPolicyThemeDefaultsDeclarationV2,
  "provider" | "provider_import" | "imports" | "props" | "docs"
>;

export type TokenFamilyPolicyOccurrenceV2 = ProjectPolicyOccurrenceBaseV2<
  "token_family_policy",
  TokenFamilyPolicyConvention,
  "docs"
>;

export type PatternPreferencePolicyOccurrenceV2 = ProjectPolicyOccurrenceBaseV2<
  "pattern_preference",
  PatternPreferenceConvention,
  "canonical_salt_start" | "docs"
>;

export type BannedChoicePolicyOccurrenceV2 = ProjectPolicyOccurrenceBaseV2<
  "banned_choice",
  BannedChoiceConvention,
  "replacement" | "docs"
>;

export type ProjectPolicyOccurrenceV2 =
  | PreferredComponentPolicyOccurrenceV2
  | ApprovedWrapperPolicyOccurrenceV2
  | TokenAliasPolicyOccurrenceV2
  | ThemeDefaultsPolicyOccurrenceV2
  | TokenFamilyPolicyOccurrenceV2
  | PatternPreferencePolicyOccurrenceV2
  | BannedChoicePolicyOccurrenceV2;

export type ProjectPolicyLayerSourceV2 =
  | {
      type: "file";
      declared_path: string;
      resolved_path: string | null;
    }
  | {
      type: "package";
      specifier: string;
      export_name: string | null;
      resolved_path: null;
    };

export interface ProjectPolicyLayerV2 {
  layer_id: string;
  layer_index: number;
  scope: ProjectConventionsLayerScope;
  optional: boolean;
  source: ProjectPolicyLayerSourceV2;
  resolution_status: "resolved" | "missing" | "unreadable" | "invalid";
  metadata: {
    schema_uri: string | null;
    contract: string | null;
    id: string | null;
    version: string | null;
    project: string | null;
    supported_salt_range: string | null;
    notes: string[] | null;
  };
  metadata_fields_present: string[];
  category_presence: Record<
    ProjectPolicySourceCategory,
    ProjectPolicyCategoryPresence
  >;
  occurrence_ids: string[];
}

export interface ProjectPolicyDiagnosticV2 {
  code: string;
  severity: "warning" | "error";
  message: string;
  layer_id: string | null;
  occurrence_id: string | null;
  json_pointer: string | null;
}

export interface SaltProjectPolicyIrV2 {
  contract: typeof SALT_PROJECT_POLICY_IR_V2_CONTRACT;
  policy_mode: "none" | "team" | "stack";
  declared: boolean;
  layers: ProjectPolicyLayerV2[];
  occurrences: ProjectPolicyOccurrenceV2[];
  diagnostics: ProjectPolicyDiagnosticV2[];
}

const projectPolicyConditionCodec: z.ZodType<ProjectPolicyConditionV2> = z.lazy(
  () =>
    z.discriminatedUnion("type", [
      z.object({ type: z.literal("always") }).strict(),
      z
        .object({
          type: z.literal("all"),
          conditions: z.array(projectPolicyConditionCodec),
        })
        .strict(),
      z
        .object({
          type: z.literal("any"),
          conditions: z.array(projectPolicyConditionCodec),
        })
        .strict(),
      z
        .object({
          type: z.literal("not"),
          condition: projectPolicyConditionCodec,
        })
        .strict(),
      z
        .object({
          type: z.literal("workflow_is"),
          value: z.enum(["create", "review", "migrate"]),
          origin: z.literal("migration_shim"),
        })
        .strict(),
      z
        .object({
          type: z.literal("fact_equals"),
          fact: z.enum([
            "canonical_name",
            "intent",
            "context_tag",
            "source_identifier",
            "source_token",
            "token_family",
          ]),
          value: z.string(),
          comparison: z.enum(["exact", "normalized_text"]),
          origin: z.enum(["selector", "use_when", "avoid_when"]),
        })
        .strict(),
      z
        .object({
          type: z.literal("salt_version_satisfies"),
          range: z.string(),
          origin: z.literal("supported_salt_range"),
        })
        .strict(),
      z
        .object({
          type: z.literal("opaque"),
          text: z.string(),
          origin: z.enum(["use_when", "avoid_when", "future_condition"]),
        })
        .strict(),
    ]),
);

const importReferenceCodec = z
  .object({
    from: z.string(),
    name: z.string(),
  })
  .strict();
const docsCodec = z.array(z.string()).optional();
const preferredComponentCodec = z
  .object({
    salt_name: z.string(),
    prefer: z.string(),
    reason: z.string(),
    docs: docsCodec,
  })
  .strict();
const approvedWrapperCodec = z
  .object({
    name: z.string(),
    wraps: z.string(),
    reason: z.string(),
    import: importReferenceCodec.optional(),
    use_when: z.array(z.string()).optional(),
    avoid_when: z.array(z.string()).optional(),
    migration_shim: z.boolean().optional(),
    docs: docsCodec,
  })
  .strict();
const tokenAliasCodec = z
  .object({
    salt_name: z.string(),
    prefer: z.string(),
    reason: z.string(),
    docs: docsCodec,
  })
  .strict();
const themeDefaultsCodec = z
  .object({
    provider: z.string().optional(),
    provider_import: importReferenceCodec.optional(),
    imports: z.array(z.string()).optional(),
    props: z
      .array(
        z
          .object({
            name: z.string(),
            value: z.string(),
          })
          .strict(),
      )
      .optional(),
    reason: z.string(),
    docs: docsCodec,
  })
  .strict();
const tokenFamilyPolicyCodec = z
  .object({
    family: z.string(),
    mode: z.enum([
      "prefer-local-aliases",
      "allow-local-aliases",
      "canonical-only",
    ]),
    reason: z.string(),
    docs: docsCodec,
  })
  .strict();
const patternPreferenceCodec = z
  .object({
    intent: z.string(),
    prefer: z.string(),
    canonical_salt_start: z.string().optional(),
    reason: z.string(),
    docs: docsCodec,
  })
  .strict();
const bannedChoiceCodec = z
  .object({
    name: z.string(),
    reason: z.string(),
    replacement: z.string().optional(),
    docs: docsCodec,
  })
  .strict();

const projectPolicyImportCheckCodec = z
  .object({
    slot: z.enum([
      "wrapper_import",
      "theme_provider_import",
      "theme_side_effect_import",
    ]),
    slot_index: z.number().int().nonnegative().nullable(),
    from: z.string(),
    name: z.string().nullable(),
    status: z.enum([
      "resolved",
      "missing_module",
      "missing_export",
      "unsupported",
      "not_inspected_limit",
    ]),
    resolved_path: z.string().nullable(),
    reason: z.string().nullable(),
  })
  .strict();

const occurrenceProvenanceCodec = z
  .object({
    layer_id: z.string(),
    layer_index: z.number().int().nonnegative(),
    scope: z.enum(["line_of_business", "team", "repo", "other"]),
    declared_source: z.string(),
    resolved_path: z.string().nullable(),
    json_pointer: z.string(),
    entry_index: z.number().int().nonnegative(),
    source_order: z.tuple([
      z.number().int().nonnegative(),
      z.number().int().nonnegative(),
      z.number().int().nonnegative(),
    ]),
  })
  .strict();

const occurrenceBaseShape = {
  occurrence_id: z.string(),
  policy_type_id: z.string(),
  override_key: z.string(),
  provenance: occurrenceProvenanceCodec,
  rule_precedence: z.union([
    z.literal(1),
    z.literal(2),
    z.literal(3),
    z.literal(4),
    z.null(),
  ]),
  condition: projectPolicyConditionCodec,
  import_checks: z.array(projectPolicyImportCheckCodec),
} as const;

const projectPolicyOccurrenceCodec = z.discriminatedUnion("category", [
  z
    .object({
      ...occurrenceBaseShape,
      category: z.literal("preferred_component"),
      declaration: preferredComponentCodec,
      optional_fields_present: z.array(z.literal("docs")),
    })
    .strict(),
  z
    .object({
      ...occurrenceBaseShape,
      category: z.literal("approved_wrapper"),
      declaration: approvedWrapperCodec,
      optional_fields_present: z.array(
        z.enum(["import", "use_when", "avoid_when", "migration_shim", "docs"]),
      ),
    })
    .strict(),
  z
    .object({
      ...occurrenceBaseShape,
      category: z.literal("token_alias"),
      declaration: tokenAliasCodec,
      optional_fields_present: z.array(z.literal("docs")),
    })
    .strict(),
  z
    .object({
      ...occurrenceBaseShape,
      category: z.literal("theme_defaults"),
      declaration: themeDefaultsCodec,
      optional_fields_present: z.array(
        z.enum(["provider", "provider_import", "imports", "props", "docs"]),
      ),
    })
    .strict(),
  z
    .object({
      ...occurrenceBaseShape,
      category: z.literal("token_family_policy"),
      declaration: tokenFamilyPolicyCodec,
      optional_fields_present: z.array(z.literal("docs")),
    })
    .strict(),
  z
    .object({
      ...occurrenceBaseShape,
      category: z.literal("pattern_preference"),
      declaration: patternPreferenceCodec,
      optional_fields_present: z.array(
        z.enum(["canonical_salt_start", "docs"]),
      ),
    })
    .strict(),
  z
    .object({
      ...occurrenceBaseShape,
      category: z.literal("banned_choice"),
      declaration: bannedChoiceCodec,
      optional_fields_present: z.array(z.enum(["replacement", "docs"])),
    })
    .strict(),
]);

const categoryPresenceCodec = z.enum([
  "absent",
  "present_empty",
  "present_nonempty",
  "unknown",
]);

export const saltProjectPolicyIrV2Codec: z.ZodType<SaltProjectPolicyIrV2> = z
  .object({
    contract: z.literal(SALT_PROJECT_POLICY_IR_V2_CONTRACT),
    policy_mode: z.enum(["none", "team", "stack"]),
    declared: z.boolean(),
    layers: z.array(
      z
        .object({
          layer_id: z.string(),
          layer_index: z.number().int().nonnegative(),
          scope: z.enum(["line_of_business", "team", "repo", "other"]),
          optional: z.boolean(),
          source: z.discriminatedUnion("type", [
            z
              .object({
                type: z.literal("file"),
                declared_path: z.string(),
                resolved_path: z.string().nullable(),
              })
              .strict(),
            z
              .object({
                type: z.literal("package"),
                specifier: z.string(),
                export_name: z.string().nullable(),
                resolved_path: z.null(),
              })
              .strict(),
          ]),
          resolution_status: z.enum([
            "resolved",
            "missing",
            "unreadable",
            "invalid",
          ]),
          metadata: z
            .object({
              schema_uri: z.string().nullable(),
              contract: z.string().nullable(),
              id: z.string().nullable(),
              version: z.string().nullable(),
              project: z.string().nullable(),
              supported_salt_range: z.string().nullable(),
              notes: z.array(z.string()).nullable(),
            })
            .strict(),
          metadata_fields_present: z.array(z.string()),
          category_presence: z
            .object({
              preferred_components: categoryPresenceCodec,
              approved_wrappers: categoryPresenceCodec,
              token_aliases: categoryPresenceCodec,
              theme_defaults: categoryPresenceCodec,
              token_family_policies: categoryPresenceCodec,
              pattern_preferences: categoryPresenceCodec,
              banned_choices: categoryPresenceCodec,
            })
            .strict(),
          occurrence_ids: z.array(z.string()),
        })
        .strict(),
    ),
    occurrences: z.array(projectPolicyOccurrenceCodec),
    diagnostics: z.array(
      z
        .object({
          code: z.string(),
          severity: z.enum(["warning", "error"]),
          message: z.string(),
          layer_id: z.string().nullable(),
          occurrence_id: z.string().nullable(),
          json_pointer: z.string().nullable(),
        })
        .strict(),
    ),
  })
  .strict();

export interface ProjectPolicyIrLayerInputV2 {
  id: string;
  scope: ProjectConventionsLayerScope;
  optional?: boolean;
  source:
    | {
        type: "file";
        declared_path: string;
        resolved_path?: string | null;
      }
    | {
        type: "package";
        specifier: string;
        export_name?: string | null;
      };
  resolution_status?: "resolved" | "missing" | "unreadable" | "invalid";
  conventions: ProjectConventions | null | undefined;
  resolution_reason?: string | null;
  compatibility?: {
    status:
      | "compatible"
      | "unsupported"
      | "missing-range"
      | "unknown-current-version"
      | "invalid-range";
    reason: string;
  } | null;
}

function hasOwn(value: object, key: PropertyKey): boolean {
  return Object.hasOwn(value, key);
}

function presentOptionalFields(
  value: object,
  fields: readonly string[],
): string[] {
  return fields.filter((field) => hasOwn(value, field));
}

function conditionAll(
  conditions: ProjectPolicyConditionV2[],
): ProjectPolicyConditionV2 {
  if (conditions.length === 0) return { type: "always" };
  if (conditions.length === 1) {
    return conditions[0] as ProjectPolicyConditionV2;
  }
  return { type: "all", conditions };
}

function layerVersionCondition(
  conventions: ProjectConventions,
): ProjectPolicyConditionV2[] {
  return conventions.supported_salt_range
    ? [
        {
          type: "salt_version_satisfies",
          range: conventions.supported_salt_range,
          origin: "supported_salt_range",
        },
      ]
    : [];
}

function selectorCondition(
  fact: Extract<ProjectPolicyConditionV2, { type: "fact_equals" }>["fact"],
  value: string,
  comparison: "exact" | "normalized_text" = "exact",
): ProjectPolicyConditionV2 {
  return {
    type: "fact_equals",
    fact,
    value,
    comparison,
    origin: "selector",
  };
}

function wrapperCondition(
  declaration: ApprovedWrapperConvention,
  base: ProjectPolicyConditionV2[],
): ProjectPolicyConditionV2 {
  const conditions = [
    ...base,
    selectorCondition("canonical_name", declaration.wraps),
  ];
  if ((declaration.use_when?.length ?? 0) > 0) {
    conditions.push({
      type: "any",
      conditions: (declaration.use_when ?? []).map((text) => ({
        type: "opaque",
        text,
        origin: "use_when",
      })),
    });
  }
  if ((declaration.avoid_when?.length ?? 0) > 0) {
    conditions.push({
      type: "not",
      condition: {
        type: "any",
        conditions: (declaration.avoid_when ?? []).map((text) => ({
          type: "opaque",
          text,
          origin: "avoid_when",
        })),
      },
    });
  }
  if (declaration.migration_shim === true) {
    conditions.push({
      type: "workflow_is",
      value: "migrate",
      origin: "migration_shim",
    });
  }
  return conditionAll(conditions);
}

function sourceCategoryPresence(
  conventions: ProjectConventions | null | undefined,
  resolutionStatus: ProjectPolicyLayerV2["resolution_status"],
  category: ProjectPolicySourceCategory,
): ProjectPolicyCategoryPresence {
  if (!conventions) {
    return resolutionStatus === "resolved" ? "absent" : "unknown";
  }
  if (!hasOwn(conventions, category)) return "absent";
  const value = conventions[category];
  if (Array.isArray(value)) {
    return value.length === 0 ? "present_empty" : "present_nonempty";
  }
  return value == null ? "present_empty" : "present_nonempty";
}

function toLayerMetadata(
  conventions: ProjectConventions | null | undefined,
): ProjectPolicyLayerV2["metadata"] {
  return {
    schema_uri: conventions?.$schema ?? null,
    contract: conventions?.contract ?? null,
    id: conventions?.id ?? null,
    version: conventions?.version ?? null,
    project: conventions?.project ?? null,
    supported_salt_range: conventions?.supported_salt_range ?? null,
    notes: conventions?.notes ?? null,
  };
}

const CATEGORY_ORDINAL = new Map(
  PROJECT_POLICY_SOURCE_CATEGORIES.map((category, index) => [category, index]),
);

function occurrenceIdentity(
  layerId: string,
  category: ProjectPolicySourceCategory,
  overrideKey: string,
  declaration: unknown,
): string {
  const digest = createHash("sha256")
    .update(canonicalJson({ layerId, category, overrideKey, declaration }))
    .digest("hex")
    .slice(0, 20);
  return `policy-occurrence.${category}.${digest}`;
}

export function compileSaltProjectPolicyIrV2(input: {
  policyMode: "none" | "team" | "stack";
  declared: boolean;
  layers: ProjectPolicyIrLayerInputV2[];
}): SaltProjectPolicyIrV2 {
  const layers: ProjectPolicyLayerV2[] = [];
  const occurrences: ProjectPolicyOccurrenceV2[] = [];
  const diagnostics: ProjectPolicyDiagnosticV2[] = [];
  const occurrenceIdentityCounts = new Map<string, number>();

  input.layers.forEach((layerInput, layerIndex) => {
    const resolutionStatus =
      layerInput.resolution_status ??
      (layerInput.conventions ? "resolved" : "missing");
    const conventions = layerInput.conventions;
    const declaredSource =
      layerInput.source.type === "file"
        ? layerInput.source.declared_path
        : layerInput.source.export_name
          ? `${layerInput.source.specifier}#${layerInput.source.export_name}`
          : layerInput.source.specifier;
    const resolvedPath =
      layerInput.source.type === "file"
        ? (layerInput.source.resolved_path ?? null)
        : null;
    const occurrenceIds: string[] = [];

    const addOccurrence = <
      Category extends ProjectPolicyCategory,
      Declaration extends ProjectPolicyOccurrenceV2["declaration"],
    >(options: {
      sourceCategory: ProjectPolicySourceCategory;
      category: Category;
      entryIndex: number;
      overrideKey: string;
      declaration: Declaration;
      optionalFields: readonly string[];
      condition: ProjectPolicyConditionV2;
    }): void => {
      const occurrenceBaseId = occurrenceIdentity(
        layerInput.id,
        options.sourceCategory,
        options.overrideKey,
        options.declaration,
      );
      const duplicateIndex =
        occurrenceIdentityCounts.get(occurrenceBaseId) ?? 0;
      occurrenceIdentityCounts.set(occurrenceBaseId, duplicateIndex + 1);
      const occurrenceId =
        duplicateIndex === 0
          ? occurrenceBaseId
          : `${occurrenceBaseId}.${duplicateIndex}`;
      const occurrence = {
        occurrence_id: occurrenceId,
        policy_type_id: `salt.project_policy.${options.category}`,
        category: options.category,
        override_key: options.overrideKey,
        declaration: options.declaration,
        optional_fields_present: presentOptionalFields(
          options.declaration,
          options.optionalFields,
        ),
        provenance: {
          layer_id: layerInput.id,
          layer_index: layerIndex,
          scope: layerInput.scope,
          declared_source: declaredSource,
          resolved_path: resolvedPath,
          json_pointer:
            options.sourceCategory === "theme_defaults"
              ? "/theme_defaults"
              : `/${options.sourceCategory}/${options.entryIndex}`,
          entry_index: options.entryIndex,
          source_order: [
            layerIndex,
            CATEGORY_ORDINAL.get(options.sourceCategory) ?? 0,
            options.entryIndex,
          ],
        },
        rule_precedence: null,
        condition: options.condition,
        import_checks: [],
      } as ProjectPolicyOccurrenceV2;
      occurrences.push(occurrence);
      occurrenceIds.push(occurrenceId);
    };

    if (conventions) {
      const versionConditions = layerVersionCondition(conventions);
      (conventions.preferred_components ?? []).forEach(
        (declaration, entryIndex) => {
          addOccurrence({
            sourceCategory: "preferred_components",
            category: "preferred_component",
            entryIndex,
            overrideKey: declaration.salt_name,
            declaration,
            optionalFields: ["docs"],
            condition: conditionAll([
              ...versionConditions,
              selectorCondition("canonical_name", declaration.salt_name),
            ]),
          });
        },
      );
      (conventions.approved_wrappers ?? []).forEach(
        (declaration, entryIndex) => {
          addOccurrence({
            sourceCategory: "approved_wrappers",
            category: "approved_wrapper",
            entryIndex,
            overrideKey: declaration.wraps,
            declaration,
            optionalFields: [
              "import",
              "use_when",
              "avoid_when",
              "migration_shim",
              "docs",
            ],
            condition: wrapperCondition(declaration, versionConditions),
          });
        },
      );
      (conventions.token_aliases ?? []).forEach((declaration, entryIndex) => {
        addOccurrence({
          sourceCategory: "token_aliases",
          category: "token_alias",
          entryIndex,
          overrideKey: declaration.salt_name,
          declaration,
          optionalFields: ["docs"],
          condition: conditionAll([
            ...versionConditions,
            selectorCondition("source_token", declaration.salt_name),
          ]),
        });
      });
      if (conventions.theme_defaults) {
        addOccurrence({
          sourceCategory: "theme_defaults",
          category: "theme_defaults",
          entryIndex: 0,
          overrideKey: "theme_defaults",
          declaration: conventions.theme_defaults,
          optionalFields: [
            "provider",
            "provider_import",
            "imports",
            "props",
            "docs",
          ],
          condition: conditionAll(versionConditions),
        });
      }
      (conventions.token_family_policies ?? []).forEach(
        (declaration, entryIndex) => {
          addOccurrence({
            sourceCategory: "token_family_policies",
            category: "token_family_policy",
            entryIndex,
            overrideKey: declaration.family,
            declaration,
            optionalFields: ["docs"],
            condition: conditionAll([
              ...versionConditions,
              selectorCondition("token_family", declaration.family),
            ]),
          });
        },
      );
      (conventions.pattern_preferences ?? []).forEach(
        (declaration, entryIndex) => {
          addOccurrence({
            sourceCategory: "pattern_preferences",
            category: "pattern_preference",
            entryIndex,
            overrideKey: declaration.canonical_salt_start ?? declaration.intent,
            declaration,
            optionalFields: ["canonical_salt_start", "docs"],
            condition: conditionAll([
              ...versionConditions,
              declaration.canonical_salt_start
                ? selectorCondition(
                    "canonical_name",
                    declaration.canonical_salt_start,
                  )
                : selectorCondition(
                    "intent",
                    declaration.intent,
                    "normalized_text",
                  ),
            ]),
          });
        },
      );
      (conventions.banned_choices ?? []).forEach((declaration, entryIndex) => {
        addOccurrence({
          sourceCategory: "banned_choices",
          category: "banned_choice",
          entryIndex,
          overrideKey: declaration.name,
          declaration,
          optionalFields: ["replacement", "docs"],
          condition: conditionAll([
            ...versionConditions,
            selectorCondition("canonical_name", declaration.name),
          ]),
        });
      });
    }

    const metadataFields = conventions
      ? [
          ["$schema", "schema_uri"],
          ["contract", "contract"],
          ["id", "id"],
          ["version", "version"],
          ["project", "project"],
          ["supported_salt_range", "supported_salt_range"],
          ["notes", "notes"],
        ].flatMap(([sourceField, irField]) =>
          hasOwn(conventions, sourceField) ? [irField] : [],
        )
      : [];
    layers.push({
      layer_id: layerInput.id,
      layer_index: layerIndex,
      scope: layerInput.scope,
      optional: layerInput.optional === true,
      source:
        layerInput.source.type === "file"
          ? {
              type: "file",
              declared_path: layerInput.source.declared_path,
              resolved_path: resolvedPath,
            }
          : {
              type: "package",
              specifier: layerInput.source.specifier,
              export_name: layerInput.source.export_name ?? null,
              resolved_path: null,
            },
      resolution_status: resolutionStatus,
      metadata: toLayerMetadata(conventions),
      metadata_fields_present: metadataFields,
      category_presence: Object.fromEntries(
        PROJECT_POLICY_SOURCE_CATEGORIES.map((category) => [
          category,
          sourceCategoryPresence(conventions, resolutionStatus, category),
        ]),
      ) as ProjectPolicyLayerV2["category_presence"],
      occurrence_ids: occurrenceIds,
    });

    if (resolutionStatus !== "resolved") {
      diagnostics.push({
        code: `policy_layer_${resolutionStatus}`,
        severity: layerInput.optional ? "warning" : "error",
        message:
          layerInput.resolution_reason ??
          `Policy layer '${layerInput.id}' is ${resolutionStatus}.`,
        layer_id: layerInput.id,
        occurrence_id: null,
        json_pointer: null,
      });
    }
    if (
      layerInput.compatibility &&
      layerInput.compatibility.status !== "compatible"
    ) {
      diagnostics.push({
        code: `policy_compatibility_${layerInput.compatibility.status}`,
        severity:
          layerInput.compatibility.status === "unsupported"
            ? "error"
            : "warning",
        message: layerInput.compatibility.reason,
        layer_id: layerInput.id,
        occurrence_id: null,
        json_pointer: "/supported_salt_range",
      });
    }
  });

  return saltProjectPolicyIrV2Codec.parse({
    contract: SALT_PROJECT_POLICY_IR_V2_CONTRACT,
    policy_mode: input.policyMode,
    declared: input.declared,
    layers,
    occurrences,
    diagnostics,
  });
}

export function attachProjectPolicyImportChecks(
  ir: SaltProjectPolicyIrV2,
  checksByOccurrenceId: ReadonlyMap<
    string,
    readonly ProjectPolicyImportCheckV2[]
  >,
): SaltProjectPolicyIrV2 {
  const occurrences = ir.occurrences.map((occurrence) => {
    const checks = [
      ...(checksByOccurrenceId.get(occurrence.occurrence_id) ?? []),
    ];
    return {
      ...occurrence,
      import_checks: checks,
    } as ProjectPolicyOccurrenceV2;
  });
  return saltProjectPolicyIrV2Codec.parse({
    ...ir,
    occurrences,
    diagnostics: [
      ...ir.diagnostics,
      ...occurrences.flatMap((occurrence) =>
        occurrence.import_checks.flatMap((check) =>
          check.status === "resolved"
            ? []
            : [
                {
                  code: `policy_import_${check.status}`,
                  severity: "error" as const,
                  message:
                    check.reason ??
                    `Policy import '${check.from}' is ${check.status}.`,
                  layer_id: occurrence.provenance.layer_id,
                  occurrence_id: occurrence.occurrence_id,
                  json_pointer: occurrence.provenance.json_pointer,
                },
              ],
        ),
      ),
    ],
  });
}

import { createHash } from "node:crypto";
