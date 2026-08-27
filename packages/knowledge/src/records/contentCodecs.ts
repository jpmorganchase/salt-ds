import * as z from "zod/v4";
import { isSafeAbsoluteHttpsUrl } from "../catalog/catalogHttpsUrl.js";
import { isPortableRepositoryPath } from "../catalog/catalogPortablePath.js";
import { PUBLIC_PACKAGE_ENTRYPOINT_PATTERN } from "../catalog/catalogPublicEntrypoint.js";
import { isCanonicalSiteRoute } from "../catalog/catalogSiteRoute.js";

const SHA256_CODEC = z
  .string()
  .regex(/^sha256:[0-9a-f]{64}$/u, "Expected a SHA-256 digest.");
export const MAX_CATALOG_ID_CHARS = 512;
export const MAX_CATALOG_CONTENT_BYTES = 64 * 1024;

const PORTABLE_ID_CODEC = z.string().min(1).max(MAX_CATALOG_ID_CHARS);
const STRING_ARRAY_CODEC = z.array(z.string());
const NON_EMPTY_STRING_CODEC = z.string().min(1);
const PORTABLE_REPOSITORY_PATH_CODEC = z
  .string()
  .min(1)
  .refine(
    (value) => isPortableRepositoryPath(value),
    "Expected a portable repository path.",
  );
const CANONICAL_SITE_ROUTE_CODEC = z
  .string()
  .min(1)
  .refine(
    (value) => isCanonicalSiteRoute(value),
    "Expected a canonical Salt documentation route.",
  );
const EXTERNAL_HTTPS_URL_CODEC = z
  .string()
  .refine(isSafeAbsoluteHttpsUrl, "Expected a safe absolute HTTPS URL.");
const DOCUMENTATION_LOCATOR_CODEC = z.union([
  CANONICAL_SITE_ROUTE_CODEC,
  EXTERNAL_HTTPS_URL_CODEC,
]);

function uniqueArray<Output>(
  codec: z.ZodType<Output>,
  identity: (value: Output) => string,
) {
  return z
    .array(codec)
    .min(1)
    .superRefine((values, context) => {
      const seen = new Set<string>();
      values.forEach((value, index) => {
        const key = identity(value);
        if (seen.has(key)) {
          context.addIssue({
            code: "custom",
            path: [index],
            message: "Duplicate array entry.",
          });
        }
        seen.add(key);
      });
    })
    .meta({ uniqueItems: true });
}

const NON_EMPTY_UNIQUE_STRING_ARRAY_CODEC = uniqueArray(
  NON_EMPTY_STRING_CODEC,
  (value) => value,
);

export const CATALOG_CONTENT_CODEC_NAMES = [
  "package_detail",
  "component_detail",
  "icon_detail",
  "country_symbol_detail",
  "pattern_detail",
  "guide_detail",
  "guide_snippet_code",
  "deprecation_detail",
  "page_detail",
  "page_body",
  "component_usage",
  "pattern_usage",
  "token_usage",
  "token_gap",
  "token_evidence",
  "structural_role_rules",
  "token_policy_assertion",
  "structural_relation_assertion",
  "token_replacement_assertion",
  "api_replacement_assertion",
  "accessibility_implementation_signal",
  "executable_example_code",
  "accessibility_statement",
] as const;

export type CatalogContentCodecName =
  (typeof CATALOG_CONTENT_CODEC_NAMES)[number];

export const catalogContentCodecNameCodec = z.enum(CATALOG_CONTENT_CODEC_NAMES);

export const CATALOG_CONTENT_MEDIA_TYPES = [
  "text/typescript",
  "text/plain",
  "text/vnd.salt.guide-snippet",
  "text/vnd.salt.accessibility-statement",
  "application/vnd.salt.entity-details+json",
  "application/vnd.salt.guide+json",
  "application/vnd.salt.policy+json",
] as const;

export type CatalogContentMediaType =
  (typeof CATALOG_CONTENT_MEDIA_TYPES)[number];

export const catalogContentMediaTypeCodec = z.enum(CATALOG_CONTENT_MEDIA_TYPES);

export interface CatalogPayloadReference {
  readonly family: string;
  readonly id: string;
}

export interface CatalogContentReference<
  Codec extends CatalogContentCodecName = CatalogContentCodecName,
> extends CatalogPayloadReference {
  readonly family: "content";
  readonly codec: Codec;
}

function referenceFor<const Families extends readonly [string, ...string[]]>(
  ...families: Families
) {
  return z
    .object({
      family: z.enum(families),
      id: PORTABLE_ID_CODEC,
    })
    .strict();
}

const sourceReferenceCodec = referenceFor("source");
const evidenceReferenceCodec = referenceFor("evidence");
const apiSymbolReferenceCodec = referenceFor("api_symbol");
const deprecationReferenceCodec = referenceFor("deprecation");

export function catalogContentReferenceCodecFor<
  const Codec extends CatalogContentCodecName,
>(codec: Codec) {
  return z
    .object({
      family: z.literal("content"),
      id: SHA256_CODEC,
      codec: z.literal(codec),
    })
    .strict();
}

export function catalogContentReference<
  const Codec extends CatalogContentCodecName,
>(codec: Codec, id: string): CatalogContentReference<Codec> {
  return {
    family: "content",
    id,
    codec,
  };
}

const saltStatusCodec = z.enum(["stable", "beta", "lab", "deprecated"]);

const PUBLIC_DOCGEN_AUTHORING_SYNTAX =
  /\{@[^}]*\}|@(saltValueMap|saltMigration|deprecated|since|param|returns?|see)\b/iu;
const publicDocTextCodec = z
  .string()
  .refine(
    (value) => !PUBLIC_DOCGEN_AUTHORING_SYNTAX.test(value),
    "Public component documentation must not contain JSDoc authoring syntax.",
  );

const componentPropCodec = z
  .object({
    name: z.string(),
    type: z.string(),
    required: z.boolean(),
    description: publicDocTextCodec,
    default: z.string().nullable().optional(),
    allowed_values: z
      .array(z.union([z.string(), z.number(), z.boolean()]))
      .optional(),
    deprecated: z.boolean(),
    deprecation_note: publicDocTextCodec.nullable().optional(),
  })
  .strict();

const componentPropSubjectCodec = z
  .object({
    package: NON_EMPTY_STRING_CODEC,
    entrypoint: z.string().regex(PUBLIC_PACKAGE_ENTRYPOINT_PATTERN),
    export_name: z.string().regex(/^[A-Za-z_$][A-Za-z0-9_$]*$/u),
    symbol_space: z.enum(["type", "type_and_value"]),
    member_path: z
      .tuple([
        z
          .object({
            kind: z.literal("prop"),
            name: NON_EMPTY_STRING_CODEC,
          })
          .strict(),
      ])
      .meta({ minItems: 1, maxItems: 1 }),
  })
  .strict();

const componentSubComponentCodec = z
  .object({
    name: z.string(),
    export_name: z.string(),
    props: z.array(componentPropCodec),
  })
  .strict();

const usageSemanticsCodec = z
  .object({
    category: STRING_ARRAY_CODEC,
    preferred_for: STRING_ARRAY_CODEC,
    not_for: STRING_ARRAY_CODEC,
    derived_from: z.array(
      z.enum([
        "component-category-map",
        "pattern-category-map",
        "usage-docs",
        "usage-callouts",
        "pattern-docs",
      ]),
    ),
  })
  .strict();

const retrievalSignalsCodec = z
  .object({
    contrast_targets: z.array(
      z
        .object({
          target: z.string(),
          relation: z.enum(["prefer-instead", "not-for", "complements"]),
          evidence: STRING_ARRAY_CODEC,
        })
        .strict(),
    ),
  })
  .strict();

const relatedDocsCodec = z
  .object({
    overview: DOCUMENTATION_LOCATOR_CODEC.nullable(),
    usage: DOCUMENTATION_LOCATOR_CODEC.nullable(),
    accessibility: DOCUMENTATION_LOCATOR_CODEC.nullable(),
    examples: DOCUMENTATION_LOCATOR_CODEC.nullable(),
  })
  .strict();

const packageDetailCodec = z
  .object({
    source_root: PORTABLE_REPOSITORY_PATH_CODEC,
    changelog_path: PORTABLE_REPOSITORY_PATH_CODEC.nullable(),
    docs_root: DOCUMENTATION_LOCATOR_CODEC.nullable(),
  })
  .strict();

const componentDetailCodec = z
  .object({
    package_since: z.string().nullable(),
    props: z.array(componentPropCodec),
    prop_subjects: z.array(componentPropSubjectCodec).optional(),
    sub_components: z.array(componentSubComponentCodec).optional(),
    composition: z
      .object({
        required_children: STRING_ARRAY_CODEC.optional(),
        optional_children: STRING_ARRAY_CODEC.optional(),
        typical_parent: z.string().optional(),
      })
      .strict()
      .optional(),
    implementation_requirements: z
      .object({
        required_imports: z.array(
          z
            .object({
              kind: z.literal("css"),
              specifier: z.string(),
              statement: z.string(),
              source_ref: sourceReferenceCodec,
            })
            .strict(),
        ),
      })
      .strict()
      .optional(),
    related_docs: relatedDocsCodec,
    inference: z
      .object({
        docgen: z
          .object({
            candidate_count: z.number().int().nonnegative(),
            candidate_display_names: STRING_ARRAY_CODEC,
            selected_display_name: z.string().nullable(),
            selected_score: z.number().nullable(),
          })
          .strict()
          .optional(),
        deprecations: z
          .object({
            matched_count: z.number().int().nonnegative(),
            inferred_component_count: z.number().int().nonnegative(),
            ambiguous_match_count: z.number().int().nonnegative(),
          })
          .strict()
          .optional(),
      })
      .strict()
      .optional(),
    deprecations: STRING_ARRAY_CODEC,
  })
  .strict();

const iconDetailCodec = z
  .object({
    package_since: z.string().nullable(),
    related_docs: z
      .object({
        overview: DOCUMENTATION_LOCATOR_CODEC.nullable(),
        examples: DOCUMENTATION_LOCATOR_CODEC.nullable(),
        foundation: DOCUMENTATION_LOCATOR_CODEC.nullable(),
      })
      .strict(),
    deprecations: STRING_ARRAY_CODEC,
  })
  .strict();

const countrySymbolDetailCodec = z
  .object({
    package_since: z.string().nullable(),
    related_docs: z
      .object({
        overview: DOCUMENTATION_LOCATOR_CODEC.nullable(),
        usage: DOCUMENTATION_LOCATOR_CODEC.nullable(),
        accessibility: DOCUMENTATION_LOCATOR_CODEC.nullable(),
        examples: DOCUMENTATION_LOCATOR_CODEC.nullable(),
        foundation: DOCUMENTATION_LOCATOR_CODEC.nullable(),
      })
      .strict(),
    deprecations: STRING_ARRAY_CODEC,
  })
  .strict();

const patternDetailCodec = z
  .object({
    how_to_build: STRING_ARRAY_CODEC,
    how_it_works: STRING_ARRAY_CODEC,
    related_docs: z
      .object({
        overview: DOCUMENTATION_LOCATOR_CODEC.nullable(),
      })
      .strict(),
    retrieval_signals: retrievalSignalsCodec.nullable(),
  })
  .strict();

const guideDetailCodec = z
  .object({
    steps: z.array(
      z
        .object({
          title: z.string(),
          statements: STRING_ARRAY_CODEC,
          snippets: z.array(
            z
              .object({
                title: z.string(),
                language: z.enum(["shell", "tsx", "css", "html"]),
                code_ref: catalogContentReferenceCodecFor("guide_snippet_code"),
              })
              .strict(),
          ),
        })
        .strict(),
    ),
    related_docs: z
      .object({
        overview: DOCUMENTATION_LOCATOR_CODEC.nullable(),
      })
      .strict(),
  })
  .strict();

const pageDetailCodec = z
  .object({
    source_path: PORTABLE_REPOSITORY_PATH_CODEC,
  })
  .strict();

const apiLiteralCodec = z.union([
  z.string(),
  z.number().finite(),
  z.boolean(),
  z.null(),
]);

const deprecationValueMapCaseCodec = z
  .object({
    from: apiLiteralCodec,
    set: z.array(
      z
        .object({
          target_ref: apiSymbolReferenceCodec,
          value: apiLiteralCodec,
        })
        .strict(),
    ),
  })
  .strict()
  .superRefine((value, context) => {
    const targetIds = new Set<string>();
    value.set.forEach((assignment, index) => {
      if (targetIds.has(assignment.target_ref.id)) {
        context.addIssue({
          code: "custom",
          path: ["set", index, "target_ref"],
          message: "A value-map case may assign each target only once.",
        });
      }
      targetIds.add(assignment.target_ref.id);
    });
  });

const deprecationValueMapCodec = z
  .object({
    cases: z.array(deprecationValueMapCaseCodec).min(1),
    fallback: z.literal("manual"),
  })
  .strict()
  .superRefine((value, context) => {
    const sourceValues = new Set<string>();
    value.cases.forEach((entry, index) => {
      const key = JSON.stringify(entry.from);
      if (sourceValues.has(key)) {
        context.addIssue({
          code: "custom",
          path: ["cases", index, "from"],
          message: "A value map may declare each source value only once.",
        });
      }
      sourceValues.add(key);
    });
  });

const deprecationDetailCodec = z
  .object({
    replacement: z
      .object({
        mode: z.enum(["none", "single", "composite"]),
        target_ref: apiSymbolReferenceCodec.nullable(),
        target_refs: z.array(apiSymbolReferenceCodec),
        notes: z.string().nullable(),
      })
      .strict()
      .superRefine((value, context) => {
        const targetIds = value.target_refs.map((target) => target.id);
        if (new Set(targetIds).size !== targetIds.length) {
          context.addIssue({
            code: "custom",
            path: ["target_refs"],
            message: "Replacement targets must be unique.",
          });
        }
        const valid =
          (value.mode === "none" &&
            value.target_ref === null &&
            value.target_refs.length === 0) ||
          (value.mode === "single" &&
            value.target_ref !== null &&
            value.target_refs.length === 1 &&
            value.target_ref.id === value.target_refs[0]?.id) ||
          (value.mode === "composite" &&
            value.target_ref === null &&
            value.target_refs.length >= 2);
        if (!valid) {
          context.addIssue({
            code: "custom",
            path: ["target_refs"],
            message:
              "Replacement mode, singular target, and target list disagree.",
          });
        }
      }),
    migration: z
      .object({
        strategy: z.enum([
          "replace",
          "remove",
          "transform",
          "manual",
          "unspecified",
        ]),
        value_map: deprecationValueMapCodec.nullable(),
      })
      .strict()
      .superRefine((value, context) => {
        const valid =
          (value.strategy === "replace" && value.value_map === null) ||
          (value.strategy === "transform" && value.value_map !== null) ||
          (["remove", "manual", "unspecified"].includes(value.strategy) &&
            value.value_map === null);
        if (!valid) {
          context.addIssue({
            code: "custom",
            path: ["strategy"],
            message: "Migration strategy and value map disagree.",
          });
        }
      }),
    inference: z
      .object({
        matched_component_names: STRING_ARRAY_CODEC,
        component_inferred: z.boolean(),
        ambiguous_component_match: z.boolean(),
      })
      .strict()
      .optional(),
  })
  .strict()
  .superRefine((value, context) => {
    const validPair =
      (value.replacement.mode === "none" &&
        ["remove", "manual", "unspecified"].includes(
          value.migration.strategy,
        )) ||
      (value.replacement.mode === "single" &&
        ["replace", "transform"].includes(value.migration.strategy)) ||
      (value.replacement.mode === "composite" &&
        value.migration.strategy === "transform");
    if (!validPair) {
      context.addIssue({
        code: "custom",
        path: ["migration", "strategy"],
        message: "Replacement mode and migration strategy disagree.",
      });
    }
    const targetIds = new Set(
      value.replacement.target_refs.map((target) => target.id),
    );
    value.migration.value_map?.cases.forEach((entry, caseIndex) => {
      entry.set.forEach((assignment, assignmentIndex) => {
        if (!targetIds.has(assignment.target_ref.id)) {
          context.addIssue({
            code: "custom",
            path: [
              "migration",
              "value_map",
              "cases",
              caseIndex,
              "set",
              assignmentIndex,
              "target_ref",
            ],
            message:
              "A value-map assignment must name a declared replacement target.",
          });
        }
      });
    });
  });

const apiReplacementAssertionCodec = z
  .object({
    deprecation_ref: deprecationReferenceCodec,
    source: apiSymbolReferenceCodec,
    target: apiSymbolReferenceCodec,
    source_occurrences: z
      .array(
        z
          .object({
            source_ref: sourceReferenceCodec,
            source_range: z
              .object({
                start_offset: z.number().int().nonnegative(),
                end_offset: z.number().int().nonnegative(),
                start_line: z.number().int().positive(),
                start_column: z.number().int().positive(),
                end_line: z.number().int().positive(),
                end_column: z.number().int().positive(),
              })
              .strict(),
          })
          .strict(),
      )
      .min(1),
  })
  .strict();

const componentUsageCodec = z
  .object({
    when_to_use: STRING_ARRAY_CODEC,
    when_not_to_use: STRING_ARRAY_CODEC,
    alternatives: z.array(
      z
        .object({
          use: z.string(),
          reason: z.string(),
        })
        .strict(),
    ),
    semantics: usageSemanticsCodec.nullable(),
    retrieval_signals: retrievalSignalsCodec.nullable(),
  })
  .strict();

const patternUsageCodec = z
  .object({
    when_to_use: STRING_ARRAY_CODEC,
    when_not_to_use: STRING_ARRAY_CODEC,
    semantics: usageSemanticsCodec.nullable(),
  })
  .strict();

const tokenPolicyCodec = z
  .object({
    usage_tier: z.enum(["characteristic", "palette", "foundation"]),
    direct_component_use: z.enum(["always", "conditional", "never"]),
    preferred_for: STRING_ARRAY_CODEC,
    avoid_for: STRING_ARRAY_CODEC,
    notes: STRING_ARRAY_CODEC,
    docs_refs: z.array(sourceReferenceCodec),
    structural_roles: STRING_ARRAY_CODEC.optional(),
    pairing: z
      .object({
        family: z.string(),
        role: z.string(),
        level: z.string().nullable().optional(),
      })
      .strict()
      .nullable()
      .optional(),
  })
  .strict();

const tokenUsageCodec = z
  .object({
    policy: tokenPolicyCodec.nullable(),
    guidance: STRING_ARRAY_CODEC,
  })
  .strict();

const tokenGapCodec = z
  .object({
    gap: z
      .object({
        reason: NON_EMPTY_STRING_CODEC,
        missing: NON_EMPTY_UNIQUE_STRING_ARRAY_CODEC,
      })
      .strict(),
    guidance: STRING_ARRAY_CODEC,
  })
  .strict();

const tokenEvidenceCodec = z
  .object({
    evidence_refs: uniqueArray(
      evidenceReferenceCodec,
      (reference) => `${reference.family}\0${reference.id}`,
    ),
  })
  .strict();

const saltEvidenceSourceMetadataCodec = z
  .object({
    section: z.string().nullable().optional(),
    line_range: z
      .tuple([z.number().int().positive(), z.number().int().positive()])
      .nullable()
      .optional(),
  })
  .strict();

const tokenPolicyAssertionCodec = z
  .object({
    contract: z.literal("salt_evidence_ref_v1"),
    source_kind: z.enum(["docs", "token"]),
    claim_kind: z.literal("token"),
    source_metadata: saltEvidenceSourceMetadataCodec,
    note: z.string().nullable().optional(),
  })
  .strict()
  .superRefine((value, context) => {
    const range = value.source_metadata.line_range;
    if (range && range[1] < range[0]) {
      context.addIssue({
        code: "custom",
        path: ["source_metadata", "line_range"],
        message: "A source line range cannot end before it starts.",
      });
    }
  });

const structuralRelationAssertionCodec = z
  .object({
    relation_kind: z.enum(["composes", "related_to", "documents"]),
    source: referenceFor("component", "pattern", "guide"),
    target: referenceFor("component", "pattern", "concept", "package"),
    provenance: z.enum(["declared", "derived"]),
    role: z.string().nullable(),
    source_ordinal: z.number().int().nonnegative(),
    source_field: z.string().min(1),
    role_source_field: z.string().min(1).nullable(),
  })
  .strict()
  .superRefine((value, context) => {
    const valid =
      (value.relation_kind === "composes" &&
        value.source.family === "pattern" &&
        ["component", "pattern", "concept"].includes(value.target.family) &&
        value.provenance === "declared") ||
      (value.relation_kind === "related_to" &&
        ["component", "pattern"].includes(value.source.family) &&
        value.target.family === "pattern" &&
        value.provenance === "declared") ||
      (value.relation_kind === "documents" &&
        value.source.family === "guide" &&
        ["component", "pattern", "package"].includes(value.target.family) &&
        value.provenance === "derived");
    if (!valid) {
      context.addIssue({
        code: "custom",
        path: ["target"],
        message:
          "Structural relation assertion endpoints do not match its relation kind.",
      });
    }
    if ((value.role === null) !== (value.role_source_field === null)) {
      context.addIssue({
        code: "custom",
        path: ["role_source_field"],
        message:
          "A structural relation role and its authored source field must either both be present or both be absent.",
      });
    }
    if (
      value.role_source_field !== null &&
      value.relation_kind !== "composes"
    ) {
      context.addIssue({
        code: "custom",
        path: ["role_source_field"],
        message:
          "Only an authored composition relation can declare a role source field.",
      });
    }
  });

const tokenReplacementAssertionCodec = z.union([
  z
    .object({
      source: referenceFor("token_declaration"),
      target: referenceFor("token"),
    })
    .strict(),
  z
    .object({
      source: referenceFor("token"),
      target: referenceFor("token"),
      source_kind: z.enum(["docs", "token"]),
      source_path: PORTABLE_REPOSITORY_PATH_CODEC,
      source_text: NON_EMPTY_STRING_CODEC,
      line_start: z.number().int().positive().nullable(),
      line_end: z.number().int().positive().nullable(),
    })
    .strict()
    .superRefine((value, context) => {
      if ((value.line_start === null) !== (value.line_end === null)) {
        context.addIssue({
          code: "custom",
          path: ["line_end"],
          message:
            "Replacement source line bounds must both be present or absent.",
        });
      }
      if (
        value.line_start !== null &&
        value.line_end !== null &&
        value.line_end < value.line_start
      ) {
        context.addIssue({
          code: "custom",
          path: ["line_end"],
          message: "Replacement source line_end must not precede line_start.",
        });
      }
    }),
]);

const accessibilityImplementationSignalCodec = z
  .object({
    kind: z.enum([
      "aria_attribute",
      "aria_role",
      "aria_announcement",
      "semantic_element",
    ]),
    values: NON_EMPTY_UNIQUE_STRING_ARRAY_CODEC,
    source_kind: z.enum(["example", "source"]),
  })
  .strict();

const structuralRoleRulesCodec = z
  .object({
    contract: z.literal("salt_token_policy_structural_role_rule_pack_v1"),
    id: z.string().min(1),
    generator: z
      .object({
        name: z.string().min(1),
        version: z.string().nullable().optional(),
      })
      .strict(),
    rules: z
      .array(
        z
          .object({
            id: z.string().min(1),
            category: z.string(),
            kind: z.enum([
              "container-pairing",
              "separable-token",
              "fixed-size",
              "border-style",
            ]),
            match: z
              .object({
                category: z.string(),
                token_family: z.string().nullable().optional(),
                token_property: z.string().nullable().optional(),
                token_modifier: z.string().nullable().optional(),
              })
              .strict(),
            emits: z
              .object({
                structural_role_templates: NON_EMPTY_UNIQUE_STRING_ARRAY_CODEC,
                pairing_template: z
                  .object({
                    family: z.string(),
                    role: z.string(),
                    level: z.string().nullable().optional(),
                  })
                  .strict()
                  .nullable()
                  .optional(),
                conditions: STRING_ARRAY_CODEC,
              })
              .strict(),
            evidence_text: NON_EMPTY_STRING_CODEC,
            evidence_terms: NON_EMPTY_UNIQUE_STRING_ARRAY_CODEC,
            evidence_refs: uniqueArray(
              evidenceReferenceCodec,
              (reference) => `${reference.family}\0${reference.id}`,
            ),
            source_refs: uniqueArray(
              sourceReferenceCodec,
              (reference) => `${reference.family}\0${reference.id}`,
            ),
          })
          .strict(),
      )
      .min(1),
  })
  .strict();

const payloadCodecs = {
  package_detail: {
    mediaType: "application/vnd.salt.entity-details+json",
    codec: packageDetailCodec,
  },
  component_detail: {
    mediaType: "application/vnd.salt.entity-details+json",
    codec: componentDetailCodec,
  },
  icon_detail: {
    mediaType: "application/vnd.salt.entity-details+json",
    codec: iconDetailCodec,
  },
  country_symbol_detail: {
    mediaType: "application/vnd.salt.entity-details+json",
    codec: countrySymbolDetailCodec,
  },
  pattern_detail: {
    mediaType: "application/vnd.salt.entity-details+json",
    codec: patternDetailCodec,
  },
  guide_detail: {
    mediaType: "application/vnd.salt.guide+json",
    codec: guideDetailCodec,
  },
  guide_snippet_code: {
    mediaType: "text/vnd.salt.guide-snippet",
    codec: z.string().min(1),
  },
  deprecation_detail: {
    mediaType: "application/vnd.salt.entity-details+json",
    codec: deprecationDetailCodec,
  },
  page_detail: {
    mediaType: "application/vnd.salt.entity-details+json",
    codec: pageDetailCodec,
  },
  page_body: {
    mediaType: "application/vnd.salt.entity-details+json",
    codec: STRING_ARRAY_CODEC,
  },
  component_usage: {
    mediaType: "application/vnd.salt.policy+json",
    codec: componentUsageCodec,
  },
  pattern_usage: {
    mediaType: "application/vnd.salt.policy+json",
    codec: patternUsageCodec,
  },
  token_usage: {
    mediaType: "application/vnd.salt.policy+json",
    codec: tokenUsageCodec,
  },
  token_gap: {
    mediaType: "application/vnd.salt.policy+json",
    codec: tokenGapCodec,
  },
  token_evidence: {
    mediaType: "application/vnd.salt.policy+json",
    codec: tokenEvidenceCodec,
  },
  structural_role_rules: {
    mediaType: "application/vnd.salt.policy+json",
    codec: structuralRoleRulesCodec,
  },
  token_policy_assertion: {
    mediaType: "application/vnd.salt.entity-details+json",
    codec: tokenPolicyAssertionCodec,
  },
  structural_relation_assertion: {
    mediaType: "application/vnd.salt.entity-details+json",
    codec: structuralRelationAssertionCodec,
  },
  token_replacement_assertion: {
    mediaType: "application/vnd.salt.entity-details+json",
    codec: tokenReplacementAssertionCodec,
  },
  api_replacement_assertion: {
    mediaType: "application/vnd.salt.entity-details+json",
    codec: apiReplacementAssertionCodec,
  },
  accessibility_implementation_signal: {
    mediaType: "application/vnd.salt.entity-details+json",
    codec: accessibilityImplementationSignalCodec,
  },
  executable_example_code: {
    mediaType: "text/typescript",
    codec: z.string().min(1),
  },
  accessibility_statement: {
    mediaType: "text/vnd.salt.accessibility-statement",
    codec: z.string().min(1),
  },
} as const satisfies Record<
  CatalogContentCodecName,
  {
    mediaType: CatalogContentMediaType;
    codec: z.ZodType;
  }
>;

export type CatalogPayloadForCodec<Codec extends CatalogContentCodecName> =
  z.infer<(typeof payloadCodecs)[Codec]["codec"]>;

export interface CatalogContentCodecDescriptor<
  Codec extends CatalogContentCodecName = CatalogContentCodecName,
> {
  readonly name: Codec;
  readonly mediaType: CatalogContentMediaType;
  readonly codec: z.ZodType;
  readonly resolveReferences: (
    value: unknown,
  ) => readonly CatalogPayloadReference[];
  readonly resolveContentReferences: (
    value: unknown,
  ) => readonly CatalogContentReference[];
}

function isReference(value: unknown): value is CatalogPayloadReference {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    typeof (value as { family?: unknown }).family === "string" &&
    typeof (value as { id?: unknown }).id === "string"
  );
}

function collectReferences(
  value: unknown,
  content: boolean,
): CatalogPayloadReference[] {
  const result: CatalogPayloadReference[] = [];
  const visit = (candidate: unknown): void => {
    if (isReference(candidate)) {
      if ((candidate.family === "content") === content) {
        result.push(candidate);
      }
      if (candidate.family === "content") return;
    }
    if (Array.isArray(candidate)) {
      for (const entry of candidate) visit(entry);
      return;
    }
    if (typeof candidate === "object" && candidate !== null) {
      for (const entry of Object.values(candidate)) visit(entry);
    }
  };
  visit(value);
  return result;
}

export const catalogContentCodecs = Object.fromEntries(
  CATALOG_CONTENT_CODEC_NAMES.map((name) => {
    const definition = payloadCodecs[name];
    return [
      name,
      {
        name,
        mediaType: definition.mediaType,
        codec: definition.codec,
        resolveReferences: (value: unknown) => collectReferences(value, false),
        resolveContentReferences: (value: unknown) =>
          collectReferences(value, true) as CatalogContentReference[],
      },
    ];
  }),
) as unknown as {
  [Codec in CatalogContentCodecName]: CatalogContentCodecDescriptor<Codec>;
};

export function parseCatalogContentPayload<
  Codec extends CatalogContentCodecName,
>(codec: Codec, value: unknown): CatalogPayloadForCodec<Codec> {
  return catalogContentCodecs[codec].codec.parse(
    value,
  ) as CatalogPayloadForCodec<Codec>;
}

export function assertNoLegacyContentIds(value: unknown): void {
  const visit = (candidate: unknown, path: string): void => {
    if (Array.isArray(candidate)) {
      candidate.forEach((entry, index) => {
        visit(entry, `${path}[${index}]`);
      });
      return;
    }
    if (typeof candidate !== "object" || candidate === null) return;
    for (const [key, entry] of Object.entries(candidate)) {
      const fieldPath = path ? `${path}.${key}` : key;
      if (key.endsWith("_content_id")) {
        throw new Error(
          `Legacy content id field '${fieldPath}' is not a declared typed content reference.`,
        );
      }
      visit(entry, fieldPath);
    }
  };
  visit(value, "");
}

export { SHA256_CODEC as CATALOG_PAYLOAD_SHA256_CODEC, saltStatusCodec };
