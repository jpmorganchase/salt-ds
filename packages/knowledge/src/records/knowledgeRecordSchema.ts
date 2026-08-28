import * as z from "zod/v4";
import {
  isSafeAbsoluteHttpsUrl,
  SAFE_ABSOLUTE_HTTPS_URL_PATTERN,
} from "../catalog/catalogHttpsUrl.js";
import {
  CATALOG_CONTENT_CODEC_NAMES,
  type CatalogContentReference,
  catalogContentCodecNameCodec,
  catalogContentCodecs,
  catalogContentMediaTypeCodec,
  catalogContentReferenceCodecFor,
  MAX_CATALOG_CONTENT_BYTES,
  MAX_CATALOG_ID_CHARS,
} from "./contentCodecs.js";
import {
  isPortableRepositoryPath,
  PORTABLE_REPOSITORY_PATH_PATTERN,
} from "../catalog/catalogPortablePath.js";
import { PUBLIC_PACKAGE_ENTRYPOINT_PATTERN } from "../catalog/catalogPublicEntrypoint.js";
import {
  compareOrdinalStrings,
  stableShaId,
} from "../catalog/catalogSerialization.js";
import {
  CANONICAL_SITE_ROUTE_PATTERN,
  isCanonicalSiteRoute,
} from "../catalog/catalogSiteRoute.js";

export const KNOWLEDGE_RECORD_SCHEMA_VERSION = "1.0.0" as const;

const SHA256_CODEC = z
  .string()
  .regex(/^sha256:[0-9a-f]{64}$/u, "Expected a SHA-256 digest.");
const CONTENT_ID_CODEC = SHA256_CODEC;
const PORTABLE_ID_CODEC = z.string().min(1).max(MAX_CATALOG_ID_CHARS);

export const portableRepositoryPathCodec = z
  .string()
  .min(1)
  .regex(PORTABLE_REPOSITORY_PATH_PATTERN, {
    message:
      "Expected a repository-relative portable path without dot segments.",
  })
  .refine(isPortableRepositoryPath, {
    message:
      "Expected a repository-relative portable path without dot segments.",
  });

export const canonicalSiteRouteCodec = z
  .string()
  .regex(CANONICAL_SITE_ROUTE_PATTERN)
  .refine(isCanonicalSiteRoute, {
    message: "Expected a canonical origin-relative Salt documentation route.",
  });

let catalogFamilyNameCodec: z.ZodType<string>;

export const catalogReferenceCodec = z
  .object({
    family: z.lazy(() => catalogFamilyNameCodec),
    id: PORTABLE_ID_CODEC,
  })
  .strict();

export type CatalogReference = z.infer<typeof catalogReferenceCodec>;

export function catalogReferenceFor<
  const Families extends readonly [string, ...string[]],
>(...families: Families) {
  return z
    .object({
      family: z.enum(families),
      id: PORTABLE_ID_CODEC,
    })
    .strict();
}

export type CatalogReferenceFor<Family extends string> = Readonly<{
  family: Family;
  id: string;
}>;

const packageReferenceCodec = catalogReferenceFor("package");
const componentReferenceCodec = catalogReferenceFor("component");
const patternReferenceCodec = catalogReferenceFor("pattern");
const guideReferenceCodec = catalogReferenceFor("guide");
const pageReferenceCodec = catalogReferenceFor("page");
const tokenReferenceCodec = catalogReferenceFor("token");
const apiSymbolReferenceCodec = catalogReferenceFor("api_symbol");
const deprecationReferenceCodec = catalogReferenceFor("deprecation");
const tokenDeclarationReferenceCodec = catalogReferenceFor("token_declaration");
const declarationContextReferenceCodec = catalogReferenceFor(
  "declaration_context",
);
const policyProfileReferenceCodec = catalogReferenceFor("policy_profile");
const evidenceReferenceCodec = catalogReferenceFor("evidence");
const sourceReferenceCodec = catalogReferenceFor("source");

export const catalogValidationMetadataCodec = z.discriminatedUnion("state", [
  z
    .object({
      state: z.literal("validated"),
      method: z.enum([
        "digest_bound",
        "route_resolved",
        "export_graph",
        "schema",
      ]),
      basis_digest: SHA256_CODEC,
      validated_at: z.null(),
    })
    .strict(),
  z
    .object({
      state: z.literal("unvalidated"),
      reason: z.string().min(1),
      validated_at: z.null(),
    })
    .strict(),
]);

export type CatalogValidationMetadata = z.infer<
  typeof catalogValidationMetadataCodec
>;

const saltStatusCodec = z.enum(["stable", "beta", "lab", "deprecated"]);
const pageKindCodec = z.enum([
  "landing",
  "about",
  "guide",
  "component-doc",
  "pattern-doc",
  "foundation",
  "theme-doc",
  "release-note",
  "support",
  "other",
]);

const namedFactBaseShape = {
  id: PORTABLE_ID_CODEC,
  name: z.string().min(1),
  aliases: z.array(z.string()),
  summary: z.string(),
} as const;

export const packageFactCodec = z
  .object({
    family: z.literal("package"),
    ...namedFactBaseShape,
    status: saltStatusCodec,
    version: z.string(),
    source_root_ref: sourceReferenceCodec,
    changelog_source_ref: sourceReferenceCodec.nullable(),
    docs_source_ref: sourceReferenceCodec.nullable(),
    detail_content_ref: catalogContentReferenceCodecFor("package_detail"),
  })
  .strict();

export const componentFactCodec = z
  .object({
    family: z.literal("component"),
    ...namedFactBaseShape,
    status: saltStatusCodec,
    package_ref: packageReferenceCodec,
    categories: z.array(z.string()),
    tags: z.array(z.string()),
    source_ref: sourceReferenceCodec.nullable(),
    export_name: z.string().min(1).nullable(),
    policy_profile_ref: policyProfileReferenceCodec.nullable(),
    detail_content_ref: catalogContentReferenceCodecFor("component_detail"),
  })
  .strict()
  .superRefine((record, context) => {
    if (record.export_name !== null && record.source_ref === null) {
      context.addIssue({
        code: "custom",
        path: ["source_ref"],
        message: "A component export name requires a source reference.",
      });
    }
  });

export const iconFactCodec = z
  .object({
    family: z.literal("icon"),
    ...namedFactBaseShape,
    status: saltStatusCodec,
    package_ref: packageReferenceCodec,
    base_name: z.string(),
    figma_name: z.string(),
    category: z.string(),
    synonyms: z.array(z.string()),
    variant: z.enum(["outline", "solid"]),
    source_ref: sourceReferenceCodec,
    export_name: z.string().min(1),
    detail_content_ref: catalogContentReferenceCodecFor("icon_detail"),
  })
  .strict();

const countryVariantCodec = z
  .object({
    export_name: z.string().min(1),
    source_ref: sourceReferenceCodec,
  })
  .strict();

export const countrySymbolFactCodec = z
  .object({
    family: z.literal("country_symbol"),
    ...namedFactBaseShape,
    status: saltStatusCodec,
    package_ref: packageReferenceCodec,
    code: z.string().min(1),
    variants: z
      .object({
        circle: countryVariantCodec,
        sharp: countryVariantCodec,
      })
      .strict(),
    detail_content_ref: catalogContentReferenceCodecFor(
      "country_symbol_detail",
    ),
  })
  .strict();

export const patternFactCodec = z
  .object({
    family: z.literal("pattern"),
    ...namedFactBaseShape,
    status: saltStatusCodec,
    categories: z.array(z.string()),
    policy_profile_ref: policyProfileReferenceCodec,
    detail_content_ref: catalogContentReferenceCodecFor("pattern_detail"),
  })
  .strict();

export const guideFactCodec = z
  .object({
    family: z.literal("guide"),
    ...namedFactBaseShape,
    kind: z.enum(["getting-started", "theming"]),
    documented_entity_refs: z.array(
      z.union([componentReferenceCodec, patternReferenceCodec]),
    ),
    package_refs: z.array(packageReferenceCodec),
    detail_content_ref: catalogContentReferenceCodecFor("guide_detail"),
  })
  .strict();

export const pageFactCodec = z
  .object({
    family: z.literal("page"),
    id: PORTABLE_ID_CODEC,
    title: z.string().min(1),
    route: canonicalSiteRouteCodec,
    page_kind: pageKindCodec,
    summary: z.string(),
    keywords: z.array(z.string()),
    section_headings: z.array(z.string()),
    body_content_ref: catalogContentReferenceCodecFor("page_body"),
    detail_content_ref: catalogContentReferenceCodecFor("page_detail"),
    source_ref: sourceReferenceCodec,
  })
  .strict();

export const tokenFactCodec = z
  .object({
    family: z.literal("token"),
    id: PORTABLE_ID_CODEC,
    name: z.string().startsWith("--salt-"),
    category: z.string().min(1),
    type: z.string().min(1),
    semantic_intent: z.string().nullable(),
    aliases: z.array(z.string()),
    status: z.enum(["stable", "deprecated"]),
    replacement_token_refs: z.array(tokenReferenceCodec),
    policy_profile_ref: policyProfileReferenceCodec.nullable(),
    evidence_profile_ref: policyProfileReferenceCodec.nullable(),
    applies_to: z.array(componentReferenceCodec),
  })
  .strict()
  .refine((record) => record.id === record.name, {
    message: "Token name must exactly match its canonical id.",
    path: ["name"],
  });

const sourceRangeCodec = z
  .object({
    start_offset: z.number().int().nonnegative(),
    end_offset: z.number().int().nonnegative(),
    start_line: z.number().int().positive(),
    start_column: z.number().int().positive(),
    end_line: z.number().int().positive(),
    end_column: z.number().int().positive(),
  })
  .strict();

const apiSymbolMemberCodec = z
  .object({
    kind: z.enum(["prop", "method", "static_method"]),
    name: z.string().min(1),
  })
  .strict();

export const apiSymbolFactCodec = z
  .object({
    family: z.literal("api_symbol"),
    id: PORTABLE_ID_CODEC,
    package_ref: packageReferenceCodec,
    entrypoint: z.string().regex(PUBLIC_PACKAGE_ENTRYPOINT_PATTERN),
    export_name: z.string().regex(/^[A-Za-z_$][A-Za-z0-9_$]*$/u),
    symbol_space: z.enum(["value", "type", "type_and_value"]),
    member_path: z.array(apiSymbolMemberCodec).max(1),
  })
  .strict()
  .superRefine((value, context) => {
    const member = value.member_path[0];
    if (!member) return;
    if (value.symbol_space === "value") {
      context.addIssue({
        code: "custom",
        path: ["symbol_space"],
        message:
          "Public member identities require a type-bearing owner symbol space.",
      });
    }
    if (
      member.kind === "static_method" &&
      value.symbol_space !== "type_and_value"
    ) {
      context.addIssue({
        code: "custom",
        path: ["member_path", 0, "kind"],
        message:
          "Static method identities require a type-and-value owner symbol space.",
      });
    }
  });

const deprecationSourceOccurrenceCodec = z
  .object({
    source_ref: sourceReferenceCodec,
    source_range: sourceRangeCodec,
  })
  .strict();

export const deprecationFactCodec = z
  .object({
    family: z.literal("deprecation"),
    id: PORTABLE_ID_CODEC,
    subject_ref: apiSymbolReferenceCodec,
    package_ref: packageReferenceCodec,
    component_ref: componentReferenceCodec.nullable(),
    kind: z.enum([
      "import",
      "component",
      "prop",
      "method",
      "token",
      "type",
      "other",
    ]),
    name: z.string().min(1),
    deprecated_in: z.string().nullable(),
    removed_in: z.string().nullable(),
    source_refs: z.array(sourceReferenceCodec).min(1),
    source_occurrences: z.array(deprecationSourceOccurrenceCodec).min(1),
    detail_content_ref: catalogContentReferenceCodecFor("deprecation_detail"),
  })
  .strict()
  .superRefine((record, context) => {
    const sourceIds = new Set(record.source_refs.map((source) => source.id));
    record.source_occurrences.forEach((occurrence, index) => {
      if (!sourceIds.has(occurrence.source_ref.id)) {
        context.addIssue({
          code: "custom",
          path: ["source_occurrences", index, "source_ref"],
          message: "A source occurrence must be included in source_refs.",
        });
      }
    });
  });

export const conceptFactCodec = z
  .object({
    family: z.literal("concept"),
    id: PORTABLE_ID_CODEC,
    name: z.string().min(1),
    concept_kind: z.enum(["composition", "region", "other"]),
    summary: z.string(),
  })
  .strict();

const sourceDimensionCodec = z
  .object({
    name: z.string().min(1),
    value: z.string().min(1),
    established_by: z.enum(["selector", "source_path", "import_entrypoint"]),
  })
  .strict();

const selectorConstraintCodec = z
  .object({
    name: z.string().min(1),
    operator: z.string().nullable(),
    value: z.string().nullable(),
    insensitive: z.boolean(),
  })
  .strict();

const selectorVariantCodec = z
  .object({
    selector: z.string().min(1),
    dimensions: z.array(sourceDimensionCodec),
    constraints: z.array(selectorConstraintCodec),
  })
  .strict();

const atRuleContextCodec = z
  .object({
    name: z.string().min(1),
    params: z.string(),
  })
  .strict();

export const declarationContextCodec = z
  .object({
    family: z.literal("declaration_context"),
    id: PORTABLE_ID_CODEC,
    raw_selector: z.string().nullable(),
    at_rules: z.array(atRuleContextCodec),
    selector_variants: z.array(selectorVariantCodec),
  })
  .strict();

const tokenDeclarationSourceRangeCodec = z.tuple([
  z.number().int().nonnegative(),
  z.number().int().nonnegative(),
  z.number().int().positive(),
  z.number().int().positive(),
  z.number().int().positive(),
  z.number().int().positive(),
]);

export const tokenDeclarationCodec = z
  .object({
    family: z.literal("token_declaration"),
    id: PORTABLE_ID_CODEC,
    token_ref: tokenReferenceCodec,
    value: z.string().min(1),
    raw_value: z.string().optional(),
    important: z.literal(true).optional(),
    context_ref: declarationContextReferenceCodec,
    source_range: tokenDeclarationSourceRangeCodec,
    source_ref: sourceReferenceCodec,
    deprecated: z.boolean(),
    replacement_token_ref: tokenReferenceCodec.optional(),
  })
  .strict();

const relationBaseShape = {
  family: z.literal("relation"),
  id: PORTABLE_ID_CODEC,
} as const;

const composesRelationCodec = z
  .object({
    ...relationBaseShape,
    relation_kind: z.literal("composes"),
    source: patternReferenceCodec,
    target: catalogReferenceFor("component", "pattern", "concept"),
    provenance: z.literal("declared"),
    role: z.string().nullable(),
    source_ordinal: z.number().int().nonnegative(),
    normative: z.literal(false),
    source_evidence_refs: z.tuple([evidenceReferenceCodec]),
  })
  .strict();

const relatedToRelationCodec = z
  .object({
    ...relationBaseShape,
    relation_kind: z.literal("related_to"),
    source: catalogReferenceFor("component", "pattern"),
    target: patternReferenceCodec,
    provenance: z.literal("declared"),
    role: z.null(),
    source_ordinal: z.number().int().nonnegative(),
    normative: z.literal(false),
    source_evidence_refs: z.tuple([evidenceReferenceCodec]),
  })
  .strict();

const documentsRelationCodec = z
  .object({
    ...relationBaseShape,
    relation_kind: z.literal("documents"),
    source: guideReferenceCodec,
    target: catalogReferenceFor("component", "pattern", "package"),
    provenance: z.literal("derived"),
    role: z.null(),
    source_ordinal: z.number().int().nonnegative(),
    normative: z.literal(false),
    source_evidence_refs: z.tuple([evidenceReferenceCodec]),
  })
  .strict();

const observedInExampleRelationCodec = z
  .object({
    ...relationBaseShape,
    relation_kind: z.literal("observed_in_example"),
    source: catalogReferenceFor("component", "pattern", "page"),
    target: evidenceReferenceCodec,
    provenance: z.literal("observation"),
    role: z.null(),
    normative: z.literal(false),
    source_evidence_refs: z.tuple([evidenceReferenceCodec]),
  })
  .strict();

const exportObservedInExampleRelationCodec = z
  .object({
    ...relationBaseShape,
    relation_kind: z.literal("export_observed_in_example"),
    source: componentReferenceCodec,
    target: sourceReferenceCodec,
    provenance: z.literal("observation"),
    role: z.string().regex(/^export:.+/u),
    normative: z.literal(false),
    source_evidence_refs: z.tuple([evidenceReferenceCodec]),
  })
  .strict();

const exportedFromRelationCodec = z
  .object({
    ...relationBaseShape,
    relation_kind: z.literal("exported_from"),
    source: catalogReferenceFor("component", "icon", "country_symbol"),
    target: sourceReferenceCodec,
    provenance: z.literal("derived"),
    role: z.string().regex(/^export:.+/u),
    normative: z.literal(false),
    source_evidence_refs: z.array(evidenceReferenceCodec),
  })
  .strict();

const replacedByRelationCodec = z
  .object({
    ...relationBaseShape,
    relation_kind: z.literal("replaced_by"),
    source: z.union([
      tokenDeclarationReferenceCodec,
      tokenReferenceCodec,
      apiSymbolReferenceCodec,
    ]),
    target: z.union([tokenReferenceCodec, apiSymbolReferenceCodec]),
    provenance: z.enum(["declared", "curated"]),
    role: z.null(),
    normative: z.literal(true),
    source_evidence_refs: z.array(evidenceReferenceCodec).min(1),
  })
  .strict()
  .superRefine((record, context) => {
    const valid =
      (record.source.family === "token_declaration" &&
        record.target.family === "token" &&
        record.provenance === "declared" &&
        record.source_evidence_refs.length === 1) ||
      (record.source.family === "token" &&
        record.target.family === "token" &&
        record.provenance === "curated") ||
      (record.source.family === "api_symbol" &&
        record.target.family === "api_symbol" &&
        record.provenance === "declared" &&
        record.source_evidence_refs.length === 1);
    if (!valid) {
      context.addIssue({
        code: "custom",
        path: ["target"],
        message:
          "A replacement relation must stay within the token or public-API domain.",
      });
    }
  });

export const relationCodec = z
  .discriminatedUnion("relation_kind", [
    composesRelationCodec,
    relatedToRelationCodec,
    documentsRelationCodec,
    observedInExampleRelationCodec,
    exportObservedInExampleRelationCodec,
    exportedFromRelationCodec,
    replacedByRelationCodec,
  ])
  .superRefine((record, context) => {
    if (
      record.relation_kind === "observed_in_example" &&
      record.source_evidence_refs[0].id !== record.target.id
    ) {
      context.addIssue({
        code: "custom",
        path: ["source_evidence_refs"],
        message:
          "An example observation must cite the executable evidence target.",
      });
    }
  });

const policyProfileBaseShape = {
  family: z.literal("policy_profile"),
  id: PORTABLE_ID_CODEC,
  summary: z.string(),
} as const;

export const policyProfileCodec = z.discriminatedUnion("policy_kind", [
  z
    .object({
      ...policyProfileBaseShape,
      policy_kind: z.literal("token_usage"),
      body_content_ref: catalogContentReferenceCodecFor("token_usage"),
    })
    .strict(),
  z
    .object({
      ...policyProfileBaseShape,
      policy_kind: z.literal("token_gap"),
      body_content_ref: catalogContentReferenceCodecFor("token_gap"),
    })
    .strict(),
  z
    .object({
      ...policyProfileBaseShape,
      policy_kind: z.literal("token_evidence"),
      body_content_ref: catalogContentReferenceCodecFor("token_evidence"),
    })
    .strict(),
  z
    .object({
      ...policyProfileBaseShape,
      policy_kind: z.literal("component_usage"),
      body_content_ref: catalogContentReferenceCodecFor("component_usage"),
    })
    .strict(),
  z
    .object({
      ...policyProfileBaseShape,
      policy_kind: z.literal("pattern_usage"),
      body_content_ref: catalogContentReferenceCodecFor("pattern_usage"),
    })
    .strict(),
  z
    .object({
      ...policyProfileBaseShape,
      policy_kind: z.literal("structural_role_rules"),
      body_content_ref: catalogContentReferenceCodecFor(
        "structural_role_rules",
      ),
    })
    .strict(),
]);

export const contentCodec = z
  .object({
    family: z.literal("content"),
    id: CONTENT_ID_CODEC,
    codec: catalogContentCodecNameCodec,
    media_type: catalogContentMediaTypeCodec,
    bytes: z.number().int().nonnegative().max(MAX_CATALOG_CONTENT_BYTES),
    offset: z.number().int().nonnegative(),
    length: z.number().int().nonnegative().max(MAX_CATALOG_CONTENT_BYTES),
    encoding: z.enum(["identity", "br"]),
    extraction_method: z.enum([
      "registry_projection",
      "source_extraction",
      "generated_policy",
      "compiler_analysis",
    ]),
    validation: catalogValidationMetadataCodec,
  })
  .strict()
  .superRefine((record, context) => {
    const expectedMediaType = catalogContentCodecs[record.codec].mediaType;
    if (record.media_type !== expectedMediaType) {
      context.addIssue({
        code: "custom",
        path: ["media_type"],
        message: `Content codec '${record.codec}' requires '${expectedMediaType}'.`,
      });
    }
    if (
      record.validation.state === "validated" &&
      record.validation.basis_digest !== record.id
    ) {
      context.addIssue({
        code: "custom",
        path: ["validation", "basis_digest"],
        message: "Content validation must bind the content identity.",
      });
    }
  });

const evidenceOwnerCodec = catalogReferenceFor(
  "package",
  "component",
  "icon",
  "country_symbol",
  "pattern",
  "guide",
  "page",
  "token",
  "api_symbol",
  "deprecation",
);
const catalogProvenanceTargetCodec = catalogReferenceFor(
  "package",
  "component",
  "icon",
  "country_symbol",
  "pattern",
  "guide",
  "page",
  "token",
  "api_symbol",
  "deprecation",
  "evidence",
);

const executableExampleCodec = z
  .object({
    family: z.literal("evidence"),
    id: PORTABLE_ID_CODEC,
    evidence_kind: z.literal("executable_example"),
    local_id: z.string().min(1),
    owner: catalogReferenceFor("component", "pattern", "page"),
    owner_ordinal: z.number().int().nonnegative(),
    registry_ordinal: z.number().int().nonnegative(),
    title: z.string().min(1),
    description: z.string(),
    intent: z.array(z.string()),
    complexity: z.enum(["basic", "intermediate", "advanced"]),
    code_content_ref: catalogContentReferenceCodecFor(
      "executable_example_code",
    ),
    source_ref: sourceReferenceCodec,
    package_ref: packageReferenceCodec.nullable(),
    extraction_method: z.literal("source_extraction"),
    validation: catalogValidationMetadataCodec,
  })
  .strict();

const linkRoleCodec = z.enum([
  "example",
  "resource",
  "related_doc",
  "deprecation_source",
  "catalog_provenance",
]);

const safeAbsoluteHttpsUrlCodec = z
  .string()
  .regex(SAFE_ABSOLUTE_HTTPS_URL_PATTERN, {
    message: "Expected a safe absolute HTTPS URL.",
  })
  .refine(isSafeAbsoluteHttpsUrl, {
    message: "Expected a safe absolute HTTPS URL.",
  });

const externalDemoCodec = z
  .object({
    family: z.literal("evidence"),
    id: PORTABLE_ID_CODEC,
    evidence_kind: z.literal("external_demo"),
    owner: evidenceOwnerCodec,
    owner_ordinal: z.number().int().nonnegative().nullable(),
    label: z.string().min(1),
    href: safeAbsoluteHttpsUrlCodec,
    internal: z.boolean(),
    link_role: linkRoleCodec,
    extraction_method: z.literal("link_extraction"),
    validation: catalogValidationMetadataCodec,
  })
  .strict();

const designReferenceCodec = z
  .object({
    family: z.literal("evidence"),
    id: PORTABLE_ID_CODEC,
    evidence_kind: z.literal("design_reference"),
    owner: evidenceOwnerCodec,
    owner_ordinal: z.number().int().nonnegative().nullable(),
    label: z.string().min(1),
    href: safeAbsoluteHttpsUrlCodec,
    internal: z.boolean(),
    link_role: linkRoleCodec,
    extraction_method: z.literal("link_extraction"),
    validation: catalogValidationMetadataCodec,
  })
  .strict();

const documentationLinkCodec = z
  .object({
    family: z.literal("evidence"),
    id: PORTABLE_ID_CODEC,
    evidence_kind: z.literal("documentation_link"),
    owner: evidenceOwnerCodec.nullable(),
    owner_ordinal: z.number().int().nonnegative().nullable(),
    label: z.string().min(1),
    href: z.union([canonicalSiteRouteCodec, safeAbsoluteHttpsUrlCodec]),
    page_ref: pageReferenceCodec.nullable(),
    internal: z.boolean(),
    link_role: linkRoleCodec,
    extraction_method: z.literal("link_extraction"),
    validation: catalogValidationMetadataCodec,
  })
  .strict()
  .superRefine((record, context) => {
    if (record.href.startsWith("/") && !record.page_ref) {
      context.addIssue({
        code: "custom",
        path: ["page_ref"],
        message: "Catalog-owned documentation routes require a page reference.",
      });
    }
    if (!record.href.startsWith("/") && record.page_ref) {
      context.addIssue({
        code: "custom",
        path: ["page_ref"],
        message: "External documentation URLs cannot claim a page reference.",
      });
    }
  });

const sourceAssertionBaseShape = {
  family: z.literal("evidence"),
  id: PORTABLE_ID_CODEC,
  evidence_kind: z.literal("source_assertion"),
  source_refs: z.array(sourceReferenceCodec).min(1),
  extraction_method: z.literal("source_extraction"),
  validation: z
    .object({
      state: z.literal("unvalidated"),
      reason: z.string().min(1),
      validated_at: z.null(),
    })
    .strict(),
} as const;

export const UNVALIDATED_SOURCE_ASSERTION_REASON =
  "Source identity is bound, but the assertion semantics were not independently validated.";

const tokenPolicySourceAssertionCodec = z
  .object({
    ...sourceAssertionBaseShape,
    assertion_kind: z.literal("token_policy"),
    owner: tokenReferenceCodec.nullable(),
    claim_kind: z.literal("token"),
    detail_content_ref: catalogContentReferenceCodecFor(
      "token_policy_assertion",
    ),
  })
  .strict();

const accessibilitySourceAssertionCodec = z
  .object({
    ...sourceAssertionBaseShape,
    source_refs: z.tuple([sourceReferenceCodec]),
    assertion_kind: z.literal("accessibility_implementation_signal"),
    owner: catalogReferenceFor("component", "pattern"),
    claim_kind: z.literal("accessibility"),
    detail_content_ref: catalogContentReferenceCodecFor(
      "accessibility_implementation_signal",
    ),
  })
  .strict();

const structuralRelationSourceAssertionCodec = z
  .object({
    ...sourceAssertionBaseShape,
    source_refs: z.tuple([sourceReferenceCodec]),
    assertion_kind: z.literal("structural_relation"),
    owner: catalogReferenceFor("component", "pattern", "guide"),
    claim_kind: z.literal("structural_relation"),
    detail_content_ref: catalogContentReferenceCodecFor(
      "structural_relation_assertion",
    ),
  })
  .strict();

const tokenReplacementSourceAssertionCodec = z
  .object({
    ...sourceAssertionBaseShape,
    source_refs: z.tuple([sourceReferenceCodec]),
    assertion_kind: z.literal("token_replacement"),
    owner: z.union([tokenDeclarationReferenceCodec, tokenReferenceCodec]),
    claim_kind: z.literal("token"),
    detail_content_ref: catalogContentReferenceCodecFor(
      "token_replacement_assertion",
    ),
  })
  .strict();

const apiReplacementSourceAssertionCodec = z
  .object({
    ...sourceAssertionBaseShape,
    assertion_kind: z.literal("api_replacement"),
    owner: deprecationReferenceCodec,
    claim_kind: z.literal("deprecation"),
    detail_content_ref: catalogContentReferenceCodecFor(
      "api_replacement_assertion",
    ),
  })
  .strict();

const sourceAssertionCodec = z.discriminatedUnion("assertion_kind", [
  tokenPolicySourceAssertionCodec,
  accessibilitySourceAssertionCodec,
  structuralRelationSourceAssertionCodec,
  tokenReplacementSourceAssertionCodec,
  apiReplacementSourceAssertionCodec,
]);

export const evidenceCodec = z.union([
  executableExampleCodec,
  externalDemoCodec,
  designReferenceCodec,
  documentationLinkCodec,
  sourceAssertionCodec,
]);

const sourceBaseShape = {
  family: z.literal("source"),
  id: PORTABLE_ID_CODEC,
  status: z.enum(["current", "deprecated", "neutral"]),
} as const;

const entrypointContextCodec = z
  .object({
    entrypoint: portableRepositoryPathCodec,
    theme: z.enum(["salt", "next"]),
    import_chain: z.array(portableRepositoryPathCodec),
    condition: z.string().nullable(),
  })
  .strict();

const repositorySourceShape = {
  ...sourceBaseShape,
  locator: portableRepositoryPathCodec,
  sha256: SHA256_CODEC,
  bytes: z.number().int().nonnegative(),
  entrypoint_contexts: z.array(entrypointContextCodec),
  extraction_method: z.literal("input_inventory"),
  validation: z
    .object({
      state: z.literal("validated"),
      method: z.literal("digest_bound"),
      basis_digest: SHA256_CODEC,
      validated_at: z.null(),
    })
    .strict(),
} as const;

const repositoryFileSourceCodec = z
  .object({
    ...repositorySourceShape,
    source_kind: z.literal("repository_file"),
  })
  .strict()
  .superRefine((record, context) => {
    if (record.validation.basis_digest !== record.sha256) {
      context.addIssue({
        code: "custom",
        path: ["validation", "basis_digest"],
        message: "Repository source validation must bind the source digest.",
      });
    }
  });

const repositoryDirectorySourceCodec = z
  .object({
    ...repositorySourceShape,
    source_kind: z.literal("repository_directory"),
  })
  .strict()
  .superRefine((record, context) => {
    if (record.validation.basis_digest !== record.sha256) {
      context.addIssue({
        code: "custom",
        path: ["validation", "basis_digest"],
        message: "Repository source validation must bind the source digest.",
      });
    }
  });

const siteRouteSourceCodec = z
  .object({
    ...sourceBaseShape,
    source_kind: z.literal("site_route"),
    locator: canonicalSiteRouteCodec,
    page_ref: pageReferenceCodec,
    extraction_method: z.literal("route_resolution"),
    validation: z
      .object({
        state: z.literal("validated"),
        method: z.literal("route_resolved"),
        basis_digest: SHA256_CODEC,
        validated_at: z.null(),
      })
      .strict(),
  })
  .strict();

const externalHttpsSourceCodec = z
  .object({
    ...sourceBaseShape,
    source_kind: z.literal("external_https"),
    locator: safeAbsoluteHttpsUrlCodec,
    extraction_method: z.literal("external_reference"),
    validation: z
      .object({
        state: z.literal("unvalidated"),
        reason: z.string().min(1),
        validated_at: z.null(),
      })
      .strict(),
  })
  .strict();

const packageSourceCodec = z
  .object({
    ...sourceBaseShape,
    source_kind: z.literal("package_source"),
    package_ref: packageReferenceCodec,
    version: z.string().min(1).nullable(),
    extraction_method: z.literal("package_metadata"),
    validation: z
      .object({
        state: z.literal("validated"),
        method: z.literal("schema"),
        basis_digest: SHA256_CODEC,
        validated_at: z.null(),
      })
      .strict(),
  })
  .strict();

const catalogRecordProvenanceCodec = z
  .object({
    ...sourceBaseShape,
    source_kind: z.literal("catalog_record_provenance"),
    record_ref: catalogProvenanceTargetCodec,
    field_path: z.string().min(1).nullable(),
    basis_digest: SHA256_CODEC,
    extraction_method: z.literal("catalog_reference"),
    validation: z
      .object({
        state: z.literal("validated"),
        method: z.literal("schema"),
        basis_digest: SHA256_CODEC,
        validated_at: z.null(),
      })
      .strict(),
  })
  .strict()
  .superRefine((record, context) => {
    if (record.validation.basis_digest !== record.basis_digest) {
      context.addIssue({
        code: "custom",
        path: ["validation", "basis_digest"],
        message: "Catalog provenance validation must bind its basis digest.",
      });
    }
  });

export const sourceCodec = z.discriminatedUnion("source_kind", [
  repositoryFileSourceCodec,
  repositoryDirectorySourceCodec,
  siteRouteSourceCodec,
  externalHttpsSourceCodec,
  packageSourceCodec,
  catalogRecordProvenanceCodec,
]);

const accessibilityOwnerCodec = z
  .object({
    family: z.enum(["component", "pattern", "guide", "page"]),
    id: PORTABLE_ID_CODEC,
  })
  .strict();

const accessibilityProvenanceCodec = z
  .object({
    reference: z
      .object({
        family: z.enum(["source", "evidence"]),
        id: PORTABLE_ID_CODEC,
      })
      .strict(),
    supports: z
      .array(z.enum(["statement", "classification", "severity"]))
      .min(1),
    source_range: sourceRangeCodec.nullable(),
    content_digest: SHA256_CODEC.nullable(),
  })
  .strict();

const accessibilityClaimBaseShape = {
  family: z.literal("accessibility_claim"),
  id: PORTABLE_ID_CODEC,
  owner: accessibilityOwnerCodec,
  source_field: z.string().min(1),
  ordinal: z.number().int().nonnegative(),
  statement_content_ref: catalogContentReferenceCodecFor(
    "accessibility_statement",
  ),
  provenance: z.array(accessibilityProvenanceCodec).min(1),
} as const;

const accessibilityFactCodec = z
  .object({
    ...accessibilityClaimBaseShape,
    classification: z.literal("fact"),
    normativity: z.literal("descriptive"),
    severity: z.null(),
    rule_kind: z.null(),
  })
  .strict();

const accessibilityGuidanceCodec = z
  .object({
    ...accessibilityClaimBaseShape,
    classification: z.literal("guidance"),
    normativity: z.literal("descriptive"),
    severity: z.null(),
    rule_kind: z.null(),
  })
  .strict();

const accessibilityRuleCodec = z
  .object({
    ...accessibilityClaimBaseShape,
    classification: z.literal("rule"),
    normativity: z.literal("normative"),
    authority: z.literal("curated"),
    severity: z.enum(["info", "warning", "error"]),
    rule_kind: z.string().min(1),
  })
  .strict()
  .superRefine((record, context) => {
    if (
      !record.provenance.some((entry) => entry.supports.includes("severity"))
    ) {
      context.addIssue({
        code: "custom",
        path: ["provenance"],
        message:
          "An enforceable accessibility rule requires provenance that explicitly supports severity.",
      });
    }
  });

export const accessibilityClaimCodec = z
  .discriminatedUnion("classification", [
    accessibilityFactCodec,
    accessibilityGuidanceCodec,
    accessibilityRuleCodec,
  ])
  .superRefine((record, context) => {
    if (
      !record.provenance.some((entry) => entry.supports.includes("statement"))
    ) {
      context.addIssue({
        code: "custom",
        path: ["provenance"],
        message:
          "Every accessibility claim requires provenance that supports its statement.",
      });
    }
    if (
      !record.provenance.some((entry) =>
        entry.supports.includes("classification"),
      )
    ) {
      context.addIssue({
        code: "custom",
        path: ["provenance"],
        message:
          "Every accessibility claim requires provenance that supports its classification.",
      });
    }
  });

export const buildAuditCodec = z
  .object({
    family: z.literal("build_audit"),
    id: PORTABLE_ID_CODEC,
    audit_kind: z.enum([
      "coverage",
      "observation",
      "compatibility",
      "measurement",
    ]),
    summary: z.string(),
    gating: z.boolean(),
  })
  .strict();

interface CatalogTupleStorage {
  kind: "tuple";
  fields: readonly string[];
  optionalFields?: readonly string[];
  derivedFields?: Readonly<Record<string, string>>;
  computedFields?: Readonly<
    Record<
      string,
      | "content_media_type"
      | "content_validation"
      | "policy_summary"
      | "token_declaration_id"
    >
  >;
  referenceFields?: Readonly<
    Record<
      string,
      {
        family: string;
        cardinality: "one" | "many";
        codecField?: string;
      }
    >
  >;
}

interface CatalogDerivedTargetGroupStorage {
  kind: "derived_target_groups";
  targetField: "target";
}

interface CatalogTaggedSourceAssertionStorage {
  kind: "tagged_source_assertion";
}

type CatalogFamilyStorage =
  | CatalogTupleStorage
  | CatalogDerivedTargetGroupStorage
  | CatalogTaggedSourceAssertionStorage;

export interface CatalogFamilyDescriptor<Codec extends z.ZodType = z.ZodType> {
  familyKind:
    | "identity"
    | "declaration"
    | "relation"
    | "policy"
    | "content"
    | "evidence"
    | "source"
    | "claim"
    | "derived"
    | "audit";
  primaryKey: "id";
  codecName: string;
  codec: Codec;
  artifact: `${string}.json`;
  loader: "by-primary-key" | "scan";
  indexRecord: (record: z.infer<Codec>) => CatalogSearchIndexInput | null;
  searchable: boolean;
  resolveReferences: (record: z.infer<Codec>) => readonly CatalogReference[];
  resolveContentReferences: (
    record: z.infer<Codec>,
  ) => readonly CatalogContentReference[];
  resolveProvenance: (record: z.infer<Codec>) => readonly CatalogReference[];
  publicationState: "internal" | "resource-ready" | "derived" | "build-only";
  canonical: boolean;
  storage?: CatalogFamilyStorage;
}

export interface CatalogSearchIndexInput {
  readonly title: string;
  readonly summary: string;
  readonly terms: readonly string[];
  readonly facets: Readonly<Record<string, readonly string[]>>;
}

function defineCatalogFamily<
  Codec extends z.ZodType,
  const Searchable extends boolean,
  const PublicationState extends CatalogFamilyDescriptor["publicationState"],
  const Canonical extends boolean,
>(
  descriptor: CatalogFamilyDescriptor<Codec> & {
    searchable: Searchable;
    publicationState: PublicationState;
    canonical: Canonical;
  },
): CatalogFamilyDescriptor<Codec> & {
  searchable: Searchable;
  publicationState: PublicationState;
  canonical: Canonical;
} {
  return descriptor;
}

function noSearch(): null {
  return null;
}

function noReferences(): readonly CatalogReference[] {
  return [];
}

function noContentReferences(): readonly CatalogContentReference[] {
  return [];
}

function namedSearch(
  record: {
    family: string;
    name: string;
    aliases: string[];
    summary: string;
    status?: string;
  },
  extra: {
    terms?: readonly string[];
    facets?: Readonly<Record<string, readonly string[]>>;
  } = {},
): CatalogSearchIndexInput {
  return {
    title: record.name,
    summary: record.summary,
    terms: [record.name, ...record.aliases, ...(extra.terms ?? [])],
    facets: {
      family: [record.family],
      ...(record.status ? { status: [record.status] } : {}),
      ...(extra.facets ?? {}),
    },
  };
}

/**
 * Canonical family descriptors. Searchability is declared here so the
 * search-target family union and codec can be derived below.
 */
const canonicalCatalogFamilies = {
  package: defineCatalogFamily({
    familyKind: "identity",
    primaryKey: "id",
    codecName: "salt.catalog.v2.package",
    codec: packageFactCodec,
    artifact: "packages.json",
    loader: "by-primary-key",
    searchable: true,
    indexRecord: (record) => namedSearch(record),
    resolveReferences: (record) => [
      record.source_root_ref,
      ...(record.changelog_source_ref ? [record.changelog_source_ref] : []),
      ...(record.docs_source_ref ? [record.docs_source_ref] : []),
    ],
    resolveContentReferences: (record) => [record.detail_content_ref],
    resolveProvenance: (record) => [
      record.source_root_ref,
      ...(record.changelog_source_ref ? [record.changelog_source_ref] : []),
      ...(record.docs_source_ref ? [record.docs_source_ref] : []),
    ],
    publicationState: "resource-ready",
    canonical: true,
  }),
  component: defineCatalogFamily({
    familyKind: "identity",
    primaryKey: "id",
    codecName: "salt.catalog.v2.component",
    codec: componentFactCodec,
    artifact: "components.json",
    loader: "by-primary-key",
    searchable: true,
    indexRecord: (record) =>
      namedSearch(record, {
        terms: [...record.categories, ...record.tags],
        facets: { category: record.categories },
      }),
    resolveReferences: (record) => [
      record.package_ref,
      ...(record.source_ref ? [record.source_ref] : []),
      ...(record.policy_profile_ref ? [record.policy_profile_ref] : []),
    ],
    resolveContentReferences: (record) => [record.detail_content_ref],
    resolveProvenance: (record) =>
      record.source_ref ? [record.source_ref] : [],
    publicationState: "resource-ready",
    canonical: true,
  }),
  icon: defineCatalogFamily({
    familyKind: "identity",
    primaryKey: "id",
    codecName: "salt.catalog.v2.icon",
    codec: iconFactCodec,
    artifact: "icons.json",
    loader: "by-primary-key",
    searchable: true,
    indexRecord: (record) =>
      namedSearch(record, {
        terms: [record.base_name, record.figma_name, ...record.synonyms],
        facets: {
          category: [record.category],
          variant: [record.variant],
        },
      }),
    resolveReferences: (record) => [record.package_ref, record.source_ref],
    resolveContentReferences: (record) => [record.detail_content_ref],
    resolveProvenance: (record) => [record.source_ref],
    publicationState: "resource-ready",
    canonical: true,
  }),
  country_symbol: defineCatalogFamily({
    familyKind: "identity",
    primaryKey: "id",
    codecName: "salt.catalog.v2.country-symbol",
    codec: countrySymbolFactCodec,
    artifact: "country-symbols.json",
    loader: "by-primary-key",
    searchable: true,
    indexRecord: (record) =>
      namedSearch(record, {
        terms: [record.code],
        facets: { code: [record.code] },
      }),
    resolveReferences: (record) => [
      record.package_ref,
      record.variants.circle.source_ref,
      record.variants.sharp.source_ref,
    ],
    resolveContentReferences: (record) => [record.detail_content_ref],
    resolveProvenance: (record) => [
      record.variants.circle.source_ref,
      record.variants.sharp.source_ref,
    ],
    publicationState: "resource-ready",
    canonical: true,
  }),
  pattern: defineCatalogFamily({
    familyKind: "identity",
    primaryKey: "id",
    codecName: "salt.catalog.v2.pattern",
    codec: patternFactCodec,
    artifact: "patterns.json",
    loader: "by-primary-key",
    searchable: true,
    indexRecord: (record) =>
      namedSearch(record, {
        terms: record.categories,
        facets: { category: record.categories },
      }),
    resolveReferences: (record) => [record.policy_profile_ref],
    resolveContentReferences: (record) => [record.detail_content_ref],
    resolveProvenance: noReferences,
    publicationState: "resource-ready",
    canonical: true,
  }),
  guide: defineCatalogFamily({
    familyKind: "identity",
    primaryKey: "id",
    codecName: "salt.catalog.v2.guide",
    codec: guideFactCodec,
    artifact: "guides.json",
    loader: "by-primary-key",
    searchable: true,
    indexRecord: (record) =>
      namedSearch(record, {
        terms: [record.kind],
        facets: { kind: [record.kind] },
      }),
    resolveReferences: (record) => [
      ...record.documented_entity_refs,
      ...record.package_refs,
    ],
    resolveContentReferences: (record) => [record.detail_content_ref],
    resolveProvenance: noReferences,
    publicationState: "resource-ready",
    canonical: true,
  }),
  page: defineCatalogFamily({
    familyKind: "identity",
    primaryKey: "id",
    codecName: "salt.catalog.v2.page",
    codec: pageFactCodec,
    artifact: "pages.json",
    loader: "by-primary-key",
    searchable: true,
    indexRecord: (record) => ({
      title: record.title,
      summary: record.summary,
      terms: [
        record.title,
        record.route,
        ...record.keywords,
        ...record.section_headings,
      ],
      facets: {
        family: [record.family],
        page_kind: [record.page_kind],
      },
    }),
    resolveReferences: (record) => [record.source_ref],
    resolveContentReferences: (record) => [
      record.body_content_ref,
      record.detail_content_ref,
    ],
    resolveProvenance: (record) => [record.source_ref],
    publicationState: "resource-ready",
    canonical: true,
  }),
  token: defineCatalogFamily({
    familyKind: "identity",
    primaryKey: "id",
    codecName: "salt.catalog.v2.token",
    codec: tokenFactCodec,
    artifact: "tokens.json",
    loader: "by-primary-key",
    searchable: true,
    indexRecord: (record) => ({
      title: record.name,
      summary: record.semantic_intent ?? "",
      terms: [record.name, record.category, record.type, ...record.aliases],
      facets: {
        family: [record.family],
        category: [record.category],
        type: [record.type],
        status: [record.status],
      },
    }),
    resolveReferences: (record) => [
      ...(record.policy_profile_ref ? [record.policy_profile_ref] : []),
      ...(record.evidence_profile_ref ? [record.evidence_profile_ref] : []),
      ...record.replacement_token_refs,
      ...record.applies_to,
    ],
    resolveContentReferences: noContentReferences,
    resolveProvenance: noReferences,
    publicationState: "resource-ready",
    canonical: true,
    storage: {
      kind: "tuple",
      fields: [
        "id",
        "category",
        "type",
        "semantic_intent",
        "aliases",
        "policy_profile_ref",
        "evidence_profile_ref",
        "applies_to",
        "status",
        "replacement_token_refs",
      ],
      derivedFields: {
        name: "id",
      },
      referenceFields: {
        policy_profile_ref: {
          family: "policy_profile",
          cardinality: "one",
        },
        evidence_profile_ref: {
          family: "policy_profile",
          cardinality: "one",
        },
        applies_to: { family: "component", cardinality: "many" },
        replacement_token_refs: { family: "token", cardinality: "many" },
      },
    },
  }),
  api_symbol: defineCatalogFamily({
    familyKind: "identity",
    primaryKey: "id",
    codecName: "salt.catalog.v2.api-symbol",
    codec: apiSymbolFactCodec,
    artifact: "api-symbols.json",
    loader: "by-primary-key",
    searchable: true,
    indexRecord: (record) => ({
      title: [record.export_name, ...record.member_path.map((member) => member.name)].join(
        ".",
      ),
      summary: `${record.symbol_space} export from ${record.entrypoint}`,
      terms: [
        record.export_name,
        record.entrypoint,
        record.symbol_space,
        ...record.member_path.map((member) => member.name),
      ],
      facets: {
        family: [record.family],
        symbol_space: [record.symbol_space],
      },
    }),
    resolveReferences: (record) => [record.package_ref],
    resolveContentReferences: noContentReferences,
    resolveProvenance: noReferences,
    publicationState: "resource-ready",
    canonical: true,
    storage: {
      kind: "tuple",
      fields: [
        "id",
        "package_ref",
        "entrypoint",
        "export_name",
        "symbol_space",
        "member_path",
      ],
      referenceFields: {
        package_ref: { family: "package", cardinality: "one" },
      },
    },
  }),
  deprecation: defineCatalogFamily({
    familyKind: "identity",
    primaryKey: "id",
    codecName: "salt.catalog.v2.deprecation",
    codec: deprecationFactCodec,
    artifact: "deprecations.json",
    loader: "by-primary-key",
    searchable: true,
    indexRecord: (record) => ({
      title: record.name,
      summary: `${record.kind} deprecation`,
      terms: [record.name, record.kind],
      facets: {
        family: [record.family],
        kind: [record.kind],
      },
    }),
    resolveReferences: (record) => [
      record.subject_ref,
      record.package_ref,
      ...(record.component_ref ? [record.component_ref] : []),
      ...record.source_refs,
      ...record.source_occurrences.map((occurrence) => occurrence.source_ref),
    ],
    resolveContentReferences: (record) => [record.detail_content_ref],
    resolveProvenance: (record) => record.source_refs,
    publicationState: "resource-ready",
    canonical: true,
    storage: {
      kind: "tuple",
      fields: [
        "id",
        "subject_ref",
        "package_ref",
        "component_ref",
        "kind",
        "name",
        "deprecated_in",
        "removed_in",
        "source_refs",
        "source_occurrences",
        "detail_content_ref",
      ],
      referenceFields: {
        subject_ref: { family: "api_symbol", cardinality: "one" },
        package_ref: { family: "package", cardinality: "one" },
        component_ref: { family: "component", cardinality: "one" },
        source_refs: { family: "source", cardinality: "many" },
      },
    },
  }),
  concept: defineCatalogFamily({
    familyKind: "identity",
    primaryKey: "id",
    codecName: "salt.catalog.v2.concept",
    codec: conceptFactCodec,
    artifact: "concepts.json",
    loader: "by-primary-key",
    searchable: true,
    indexRecord: (record) => ({
      title: record.name,
      summary: record.summary,
      terms: [record.name, record.concept_kind],
      facets: {
        family: [record.family],
        concept_kind: [record.concept_kind],
      },
    }),
    resolveReferences: noReferences,
    resolveContentReferences: noContentReferences,
    resolveProvenance: noReferences,
    publicationState: "resource-ready",
    canonical: true,
  }),
  declaration_context: defineCatalogFamily({
    familyKind: "declaration",
    primaryKey: "id",
    codecName: "salt.catalog.v2.declaration-context",
    codec: declarationContextCodec,
    artifact: "declaration-contexts.json",
    loader: "by-primary-key",
    searchable: false,
    indexRecord: noSearch,
    resolveReferences: noReferences,
    resolveContentReferences: noContentReferences,
    resolveProvenance: noReferences,
    publicationState: "resource-ready",
    canonical: true,
  }),
  token_declaration: defineCatalogFamily({
    familyKind: "declaration",
    primaryKey: "id",
    codecName: "salt.catalog.v2.token-declaration",
    codec: tokenDeclarationCodec,
    artifact: "token-declarations.json",
    loader: "by-primary-key",
    searchable: false,
    indexRecord: noSearch,
    resolveReferences: (record) => [
      record.token_ref,
      record.context_ref,
      record.source_ref,
      ...(record.replacement_token_ref ? [record.replacement_token_ref] : []),
    ],
    resolveContentReferences: noContentReferences,
    resolveProvenance: (record) => [record.source_ref],
    publicationState: "resource-ready",
    canonical: true,
    storage: {
      kind: "tuple",
      fields: [
        "token_ref",
        "value",
        "raw_value",
        "important",
        "context_ref",
        "source_range",
        "source_ref",
        "deprecated",
        "replacement_token_ref",
      ],
      optionalFields: ["raw_value", "important", "replacement_token_ref"],
      computedFields: {
        id: "token_declaration_id",
      },
      referenceFields: {
        token_ref: { family: "token", cardinality: "one" },
        context_ref: {
          family: "declaration_context",
          cardinality: "one",
        },
        source_ref: { family: "source", cardinality: "one" },
        replacement_token_ref: {
          family: "token",
          cardinality: "one",
        },
      },
    },
  }),
  relation: defineCatalogFamily({
    familyKind: "relation",
    primaryKey: "id",
    codecName: "salt.catalog.v2.relation",
    codec: relationCodec,
    artifact: "relations.json",
    loader: "by-primary-key",
    searchable: false,
    indexRecord: noSearch,
    resolveReferences: (record) => [
      record.source,
      record.target,
      ...record.source_evidence_refs,
    ],
    resolveContentReferences: noContentReferences,
    resolveProvenance: (record) =>
      record.relation_kind === "exported_from"
        ? [record.target, ...record.source_evidence_refs]
        : record.source_evidence_refs,
    publicationState: "resource-ready",
    canonical: true,
    storage: {
      kind: "tuple",
      fields: [
        "id",
        "relation_kind",
        "source",
        "target",
        "provenance",
        "role",
        "source_ordinal",
        "normative",
        "source_evidence_refs",
      ],
      optionalFields: ["source_ordinal"],
      referenceFields: {
        source_evidence_refs: {
          family: "evidence",
          cardinality: "many",
        },
      },
    },
  }),
  policy_profile: defineCatalogFamily({
    familyKind: "policy",
    primaryKey: "id",
    codecName: "salt.catalog.v2.policy-profile",
    codec: policyProfileCodec,
    artifact: "policy-profiles.json",
    loader: "by-primary-key",
    searchable: false,
    indexRecord: noSearch,
    resolveReferences: noReferences,
    resolveContentReferences: (record) => [record.body_content_ref],
    resolveProvenance: noReferences,
    publicationState: "resource-ready",
    canonical: true,
    storage: {
      kind: "tuple",
      fields: ["id", "policy_kind", "body_content_ref"],
      computedFields: {
        summary: "policy_summary",
      },
      referenceFields: {
        body_content_ref: {
          family: "content",
          cardinality: "one",
          codecField: "policy_kind",
        },
      },
    },
  }),
  content: defineCatalogFamily({
    familyKind: "content",
    primaryKey: "id",
    codecName: "salt.catalog.v2.content",
    codec: contentCodec,
    artifact: "content-index.json",
    loader: "by-primary-key",
    searchable: false,
    indexRecord: noSearch,
    resolveReferences: noReferences,
    resolveContentReferences: noContentReferences,
    resolveProvenance: noReferences,
    publicationState: "resource-ready",
    canonical: true,
    storage: {
      kind: "tuple",
      fields: [
        "id",
        "codec",
        "bytes",
        "offset",
        "length",
        "encoding",
        "extraction_method",
      ],
      computedFields: {
        media_type: "content_media_type",
        validation: "content_validation",
      },
    },
  }),
  evidence: defineCatalogFamily({
    familyKind: "evidence",
    primaryKey: "id",
    codecName: "salt.catalog.v2.evidence",
    codec: evidenceCodec,
    artifact: "evidence.json",
    loader: "by-primary-key",
    searchable: false,
    indexRecord: noSearch,
    resolveReferences: (record) => {
      switch (record.evidence_kind) {
        case "executable_example":
          return [
            record.owner,
            record.source_ref,
            ...(record.package_ref ? [record.package_ref] : []),
          ];
        case "external_demo":
        case "design_reference":
          return [record.owner];
        case "documentation_link":
          return [
            ...(record.owner ? [record.owner] : []),
            ...(record.page_ref ? [record.page_ref] : []),
          ];
        case "source_assertion":
          return [
            ...(record.owner ? [record.owner] : []),
            ...record.source_refs,
          ];
      }
    },
    resolveContentReferences: (record) => {
      switch (record.evidence_kind) {
        case "executable_example":
          return [record.code_content_ref];
        case "source_assertion":
          return [record.detail_content_ref];
        case "external_demo":
        case "design_reference":
        case "documentation_link":
          return [];
      }
    },
    resolveProvenance: (record) => {
      switch (record.evidence_kind) {
        case "executable_example":
          return [record.source_ref];
        case "documentation_link":
          return record.page_ref ? [record.page_ref] : [];
        case "source_assertion":
          return record.source_refs;
        case "external_demo":
        case "design_reference":
          return [];
      }
    },
    publicationState: "resource-ready",
    canonical: true,
    storage: {
      kind: "tagged_source_assertion",
    },
  }),
  source: defineCatalogFamily({
    familyKind: "source",
    primaryKey: "id",
    codecName: "salt.catalog.v2.source",
    codec: sourceCodec,
    artifact: "sources.json",
    loader: "by-primary-key",
    searchable: false,
    indexRecord: noSearch,
    resolveReferences: (record) => {
      switch (record.source_kind) {
        case "site_route":
          return [record.page_ref];
        case "package_source":
          return [record.package_ref];
        case "catalog_record_provenance":
          return [record.record_ref];
        case "repository_file":
        case "repository_directory":
        case "external_https":
          return [];
      }
    },
    resolveContentReferences: noContentReferences,
    resolveProvenance: noReferences,
    publicationState: "resource-ready",
    canonical: true,
  }),
  accessibility_claim: defineCatalogFamily({
    familyKind: "claim",
    primaryKey: "id",
    codecName: "salt.catalog.v2.accessibility-claim",
    codec: accessibilityClaimCodec,
    artifact: "accessibility-claims.json",
    loader: "by-primary-key",
    searchable: false,
    indexRecord: noSearch,
    resolveReferences: (record) => [
      record.owner,
      ...record.provenance.map((entry) => entry.reference),
    ],
    resolveContentReferences: (record) => [record.statement_content_ref],
    resolveProvenance: (record) =>
      record.provenance.map((entry) => entry.reference),
    publicationState: "resource-ready",
    canonical: true,
    storage: {
      kind: "tuple",
      fields: [
        "id",
        "owner",
        "source_field",
        "ordinal",
        "statement_content_ref",
        "provenance",
        "classification",
        "normativity",
        "authority",
        "severity",
        "rule_kind",
      ],
      optionalFields: ["authority"],
    },
  }),
} as const satisfies Record<string, CatalogFamilyDescriptor>;

type CatalogCanonicalFamilyName = keyof typeof canonicalCatalogFamilies;

export type CatalogSearchTargetFamilyName = {
  [Family in CatalogCanonicalFamilyName]: (typeof canonicalCatalogFamilies)[Family]["searchable"] extends true
    ? Family
    : never;
}[CatalogCanonicalFamilyName];

const canonicalCatalogFamilyNames = Object.keys(
  canonicalCatalogFamilies,
) as CatalogCanonicalFamilyName[];
const searchTargetFamilyNames = canonicalCatalogFamilyNames.filter(
  (family): family is CatalogSearchTargetFamilyName =>
    canonicalCatalogFamilies[family].searchable,
);
if (searchTargetFamilyNames.length === 0) {
  throw new Error("The catalog requires at least one searchable family.");
}

export const CATALOG_SEARCH_TARGET_FAMILY_NAMES = Object.freeze(
  searchTargetFamilyNames as [
    CatalogSearchTargetFamilyName,
    ...CatalogSearchTargetFamilyName[],
  ],
);

const searchTargetFamilyCodec = z.enum(CATALOG_SEARCH_TARGET_FAMILY_NAMES);
const searchTargetReferenceCodec = z
  .object({
    family: searchTargetFamilyCodec,
    id: PORTABLE_ID_CODEC,
  })
  .strict();

export const searchDocumentCodec = z
  .object({
    family: z.literal("search_document"),
    id: PORTABLE_ID_CODEC,
    target: searchTargetReferenceCodec,
    title: z.string().min(1),
    summary: z.string(),
    terms: z.array(z.string()),
    facets: z.record(z.string(), z.array(z.string())),
  })
  .strict();

/**
 * The sole catalog-family authority consumed by artifact discovery, package
 * copying, runtime validation, lazy loading, evidence dispatch, resource
 * templates, family unions, and generated JSON Schema.
 */
export const catalogFamilies = {
  ...canonicalCatalogFamilies,
  search_document: defineCatalogFamily({
    familyKind: "derived",
    primaryKey: "id",
    codecName: "salt.catalog.v2.search-document",
    codec: searchDocumentCodec,
    artifact: "search-index.json",
    loader: "by-primary-key",
    searchable: false,
    indexRecord: noSearch,
    resolveReferences: (record) => [record.target],
    resolveContentReferences: noContentReferences,
    resolveProvenance: noReferences,
    publicationState: "derived",
    canonical: false,
    storage: {
      kind: "derived_target_groups",
      targetField: "target",
    },
  }),
  build_audit: defineCatalogFamily({
    familyKind: "audit",
    primaryKey: "id",
    codecName: "salt.catalog.v2.build-audit",
    codec: buildAuditCodec,
    artifact: "build-audit.json",
    loader: "by-primary-key",
    searchable: false,
    indexRecord: noSearch,
    resolveReferences: noReferences,
    resolveContentReferences: noContentReferences,
    resolveProvenance: noReferences,
    publicationState: "build-only",
    canonical: false,
  }),
} as const satisfies Record<string, CatalogFamilyDescriptor>;

export type CatalogFamilyName = keyof typeof catalogFamilies;

catalogFamilyNameCodec = z.enum(
  Object.keys(catalogFamilies) as [CatalogFamilyName, ...CatalogFamilyName[]],
);

export const CATALOG_FAMILY_NAMES = Object.freeze(
  Object.keys(catalogFamilies) as CatalogFamilyName[],
);

export type CatalogBuildOnlyFamilyName = {
  [Family in CatalogFamilyName]: (typeof catalogFamilies)[Family]["publicationState"] extends "build-only"
    ? Family
    : never;
}[CatalogFamilyName];

export type CatalogRuntimeFamilyName = Exclude<
  CatalogFamilyName,
  CatalogBuildOnlyFamilyName
>;

export const CATALOG_BUILD_ONLY_FAMILY_NAMES = Object.freeze(
  CATALOG_FAMILY_NAMES.filter(
    (family): family is CatalogBuildOnlyFamilyName =>
      catalogFamilies[family].publicationState === "build-only",
  ),
);

export const CATALOG_RUNTIME_FAMILY_NAMES = Object.freeze(
  CATALOG_FAMILY_NAMES.filter(
    (family): family is CatalogRuntimeFamilyName =>
      catalogFamilies[family].publicationState !== "build-only",
  ),
);

export type CatalogRecordForFamily<Family extends CatalogFamilyName> = z.infer<
  (typeof catalogFamilies)[Family]["codec"]
>;

export type CatalogRecord = {
  [Family in CatalogFamilyName]: CatalogRecordForFamily<Family>;
}[CatalogFamilyName];

export interface CatalogArtifactEnvelope<
  Family extends CatalogFamilyName = CatalogFamilyName,
> {
  schema_version: typeof KNOWLEDGE_RECORD_SCHEMA_VERSION;
  family: Family;
  records: CatalogRecordForFamily<Family>[];
}

export function getCatalogRuntimeFamilyNames(): CatalogRuntimeFamilyName[] {
  return [...CATALOG_RUNTIME_FAMILY_NAMES];
}

export function isCatalogRuntimeFamilyName(
  family: CatalogFamilyName,
): family is CatalogRuntimeFamilyName {
  return catalogFamilies[family].publicationState !== "build-only";
}

export function parseCatalogRecord<Family extends CatalogFamilyName>(
  family: Family,
  value: unknown,
): CatalogRecordForFamily<Family> {
  return catalogFamilies[family].codec.parse(
    value,
  ) as CatalogRecordForFamily<Family>;
}

function getCatalogFamilyStorage(
  family: CatalogFamilyName,
): CatalogFamilyStorage | undefined {
  return (catalogFamilies[family] as CatalogFamilyDescriptor).storage;
}

function encodeCatalogTupleField(
  storage: CatalogTupleStorage,
  field: string,
  value: unknown,
  logical: Readonly<Record<string, unknown>>,
): unknown {
  const reference = storage.referenceFields?.[field];
  if (!reference || value === null || value === undefined) return value;

  const encodeReference = (candidate: unknown): string => {
    if (
      typeof candidate !== "object" ||
      candidate === null ||
      Array.isArray(candidate) ||
      (candidate as { family?: unknown }).family !== reference.family ||
      typeof (candidate as { id?: unknown }).id !== "string"
    ) {
      throw new Error(
        `Catalog tuple field '${field}' requires a ${reference.family} reference.`,
      );
    }
    if (
      reference.codecField &&
      (candidate as { codec?: unknown }).codec !== logical[reference.codecField]
    ) {
      throw new Error(
        `Catalog tuple field '${field}' requires a content codec matching '${reference.codecField}'.`,
      );
    }
    return (candidate as { id: string }).id;
  };

  if (reference.cardinality === "many") {
    if (!Array.isArray(value)) {
      throw new Error(
        `Catalog tuple field '${field}' requires an array of ${reference.family} references.`,
      );
    }
    return value.map(encodeReference);
  }
  return encodeReference(value);
}

function decodeCatalogTupleField(
  storage: CatalogTupleStorage,
  field: string,
  value: unknown,
  logical: Readonly<Record<string, unknown>>,
): unknown {
  const reference = storage.referenceFields?.[field];
  if (!reference || value === null) return value;

  const decodeReference = (candidate: unknown): CatalogReference => {
    if (typeof candidate !== "string") {
      throw new Error(
        `Catalog tuple field '${field}' requires a stored ${reference.family} reference id.`,
      );
    }
    return {
      family: reference.family,
      id: candidate,
      ...(reference.codecField
        ? { codec: z.string().parse(logical[reference.codecField]) }
        : {}),
    };
  };

  if (reference.cardinality === "many") {
    if (!Array.isArray(value)) {
      throw new Error(
        `Catalog tuple field '${field}' requires an array of stored ${reference.family} reference ids.`,
      );
    }
    return value.map(decodeReference);
  }
  return decodeReference(value);
}

export type CatalogStorageRecordResolver = (
  reference: CatalogReference,
) => CatalogRecord | null;

function decodeDerivedSearchTarget(
  stored: unknown,
  resolveRecord: CatalogStorageRecordResolver | undefined,
): CatalogRecordForFamily<"search_document"> {
  if (
    !Array.isArray(stored) ||
    stored.length !== 2 ||
    typeof stored[0] !== "string" ||
    typeof stored[1] !== "string"
  ) {
    throw new Error(
      `${catalogFamilies.search_document.artifact} contains an invalid search_document storage tuple.`,
    );
  }
  if (!resolveRecord) {
    throw new Error(
      "Decoding a derived search target requires a catalog record resolver.",
    );
  }
  const reference = {
    family: searchTargetFamilyCodec.parse(stored[0]),
    id: stored[1],
  };
  const target = resolveRecord(reference);
  if (
    !target ||
    target.family !== reference.family ||
    target.id !== reference.id
  ) {
    throw new Error(
      `Search target '${reference.family}:${reference.id}' does not resolve exactly.`,
    );
  }
  const searchDocument = createCatalogSearchDocument(target);
  if (!searchDocument) {
    throw new Error(
      `Catalog target '${reference.family}:${reference.id}' is not searchable.`,
    );
  }
  return searchDocument;
}

const sourceAssertionStorageMetadata = {
  token_policy: {
    claimKind: "token",
    detailCodec: "token_policy_assertion",
  },
  accessibility_implementation_signal: {
    claimKind: "accessibility",
    detailCodec: "accessibility_implementation_signal",
  },
  structural_relation: {
    claimKind: "structural_relation",
    detailCodec: "structural_relation_assertion",
  },
  token_replacement: {
    claimKind: "token",
    detailCodec: "token_replacement_assertion",
  },
  api_replacement: {
    claimKind: "deprecation",
    detailCodec: "api_replacement_assertion",
  },
} as const;

function encodeTaggedSourceAssertion(record: Record<string, unknown>): unknown {
  if (record.evidence_kind !== "source_assertion") return record;
  const owner = record.owner as CatalogReference | null;
  const sourceRefs = record.source_refs as CatalogReferenceFor<"source">[];
  const detailRef = record.detail_content_ref as CatalogContentReference;
  return [
    record.id,
    record.assertion_kind,
    owner ? [owner.family, owner.id] : null,
    sourceRefs.map((reference) => reference.id),
    detailRef.id,
  ];
}

function decodeTaggedSourceAssertion(stored: unknown): Record<string, unknown> {
  if (!Array.isArray(stored)) {
    if (typeof stored !== "object" || stored === null) {
      throw new Error(
        `${catalogFamilies.evidence.artifact} contains an invalid evidence storage record.`,
      );
    }
    return stored as Record<string, unknown>;
  }
  if (
    stored.length !== 5 ||
    typeof stored[0] !== "string" ||
    typeof stored[1] !== "string" ||
    !Array.isArray(stored[3]) ||
    stored[3].length === 0 ||
    stored[3].some((id) => typeof id !== "string") ||
    typeof stored[4] !== "string"
  ) {
    throw new Error(
      `${catalogFamilies.evidence.artifact} contains an invalid source assertion storage tuple.`,
    );
  }
  const metadata =
    sourceAssertionStorageMetadata[
      stored[1] as keyof typeof sourceAssertionStorageMetadata
    ];
  if (!metadata) {
    throw new Error(
      `${catalogFamilies.evidence.artifact} contains an unknown source assertion kind.`,
    );
  }
  const owner = stored[2];
  if (
    owner !== null &&
    (!Array.isArray(owner) ||
      owner.length !== 2 ||
      typeof owner[0] !== "string" ||
      typeof owner[1] !== "string")
  ) {
    throw new Error(
      `${catalogFamilies.evidence.artifact} contains an invalid source assertion owner.`,
    );
  }
  return {
    family: "evidence",
    id: stored[0],
    evidence_kind: "source_assertion",
    assertion_kind: stored[1],
    owner: owner ? { family: owner[0], id: owner[1] } : null,
    claim_kind: metadata.claimKind,
    source_refs: stored[3].map((id) => ({ family: "source", id })),
    detail_content_ref: {
      family: "content",
      codec: metadata.detailCodec,
      id: stored[4],
    },
    extraction_method: "source_extraction",
    validation: {
      state: "unvalidated",
      reason: UNVALIDATED_SOURCE_ASSERTION_REASON,
      validated_at: null,
    },
  };
}

export function encodeCatalogRecordForStorage<Family extends CatalogFamilyName>(
  family: Family,
  record: CatalogRecordForFamily<Family>,
): unknown {
  const parsed = parseCatalogRecord(family, record) as Record<string, unknown>;
  const storage = getCatalogFamilyStorage(family);
  if (!storage) return parsed;
  if (storage.kind === "tagged_source_assertion") {
    return encodeTaggedSourceAssertion(parsed);
  }
  if (storage.kind === "derived_target_groups") {
    const target = parsed[storage.targetField];
    if (
      typeof target !== "object" ||
      target === null ||
      Array.isArray(target) ||
      typeof (target as { family?: unknown }).family !== "string" ||
      typeof (target as { id?: unknown }).id !== "string"
    ) {
      throw new Error(
        `${catalogFamilies[family].artifact} has an invalid derived search target.`,
      );
    }
    return [
      (target as { family: string }).family,
      (target as { id: string }).id,
    ];
  }
  return storage.fields.map((field) =>
    encodeCatalogTupleField(storage, field, parsed[field] ?? null, parsed),
  );
}

export function decodeCatalogRecordFromStorage<
  Family extends CatalogFamilyName,
>(
  family: Family,
  stored: unknown,
  resolveRecord?: CatalogStorageRecordResolver,
): CatalogRecordForFamily<Family> {
  const storage = getCatalogFamilyStorage(family);
  if (!storage) {
    return parseCatalogRecord(family, stored);
  }
  if (storage.kind === "tagged_source_assertion") {
    return parseCatalogRecord(family, decodeTaggedSourceAssertion(stored));
  }
  if (storage.kind === "derived_target_groups") {
    return decodeDerivedSearchTarget(
      stored,
      resolveRecord,
    ) as CatalogRecordForFamily<Family>;
  }
  if (!Array.isArray(stored) || stored.length !== storage.fields.length) {
    throw new Error(
      `${catalogFamilies[family].artifact} contains an invalid ${family} storage tuple.`,
    );
  }
  const optionalFields = new Set(storage.optionalFields ?? []);
  const logical: Record<string, unknown> = { family };
  storage.fields.forEach((field, index) => {
    const value = stored[index];
    if (value === null && optionalFields.has(field)) return;
    logical[field] = decodeCatalogTupleField(storage, field, value, logical);
  });
  for (const [field, sourceField] of Object.entries(
    storage.derivedFields ?? {},
  )) {
    if (
      storage.fields.includes(field) ||
      !storage.fields.includes(sourceField) ||
      !(sourceField in logical)
    ) {
      throw new Error(
        `${catalogFamilies[family].artifact} declares an invalid derived storage field '${field}'.`,
      );
    }
    logical[field] = logical[sourceField];
  }
  for (const [field, computation] of Object.entries(
    storage.computedFields ?? {},
  )) {
    if (field in logical) {
      throw new Error(
        `${catalogFamilies[family].artifact} declares an invalid computed storage field '${field}'.`,
      );
    }
    if (computation === "content_media_type") {
      const codec = catalogContentCodecNameCodec.parse(logical.codec);
      logical[field] = catalogContentCodecs[codec].mediaType;
    } else if (computation === "content_validation") {
      const id = CONTENT_ID_CODEC.parse(logical.id);
      logical[field] = {
        state: "validated",
        method: "schema",
        basis_digest: id,
        validated_at: null,
      };
    } else if (computation === "policy_summary") {
      const policyKind = catalogContentCodecNameCodec.parse(
        logical.policy_kind,
      );
      logical[field] = `${policyKind.replace(/_/gu, " ")} policy`;
    } else {
      if (!resolveRecord) {
        throw new Error(
          "Decoding a token declaration identity requires a catalog record resolver.",
        );
      }
      const tokenRef = tokenReferenceCodec.parse(logical.token_ref);
      const contextRef = declarationContextReferenceCodec.parse(
        logical.context_ref,
      );
      const sourceRef = sourceReferenceCodec.parse(logical.source_ref);
      const token = resolveRecord(tokenRef);
      const context = resolveRecord(contextRef);
      const source = resolveRecord(sourceRef);
      if (!token || token.family !== "token") {
        throw new Error(
          `Token declaration identity has unresolved token:${tokenRef.id}.`,
        );
      }
      if (!context || context.family !== "declaration_context") {
        throw new Error(
          `Token declaration identity has unresolved declaration_context:${contextRef.id}.`,
        );
      }
      if (
        !source ||
        source.family !== "source" ||
        source.source_kind !== "repository_file"
      ) {
        throw new Error(
          `Token declaration identity has unresolved repository source:${sourceRef.id}.`,
        );
      }
      const range = tokenDeclarationSourceRangeCodec.parse(
        logical.source_range,
      );
      const replacementRef = logical.replacement_token_ref
        ? tokenReferenceCodec.parse(logical.replacement_token_ref)
        : null;
      logical[field] = stableShaId("token-declaration", {
        token: tokenRef.id,
        source_path: source.locator,
        source_range: {
          start_offset: range[0],
          end_offset: range[1],
          start_line: range[2],
          start_column: range[3],
          end_line: range[4],
          end_column: range[5],
        },
        value: z.string().parse(logical.value),
        raw_value: logical.raw_value ?? null,
        important: logical.important === true ? true : undefined,
        raw_selector: context.raw_selector,
        at_rules: context.at_rules,
        selector_variants: context.selector_variants.map((variant) => ({
          ...variant,
          dimensions: variant.dimensions.map((dimension) => ({
            ...dimension,
            selector: variant.selector,
          })),
        })),
        deprecated: z.boolean().parse(logical.deprecated),
        replacement: replacementRef?.id ?? null,
      });
    }
  }
  return parseCatalogRecord(family, logical);
}

export function encodeCatalogArtifactRecordsForStorage<
  Family extends CatalogFamilyName,
>(
  family: Family,
  records: readonly CatalogRecordForFamily<Family>[],
): unknown[] {
  const storage = getCatalogFamilyStorage(family);
  if (storage?.kind !== "derived_target_groups") {
    return records.map((record) =>
      encodeCatalogRecordForStorage(family, record),
    );
  }

  const idsByFamily = new Map<string, string[]>();
  for (const record of records) {
    const [targetFamily, targetId] = encodeCatalogRecordForStorage(
      family,
      record,
    ) as [string, string];
    const ids = idsByFamily.get(targetFamily) ?? [];
    ids.push(targetId);
    idsByFamily.set(targetFamily, ids);
  }
  return [...idsByFamily.entries()]
    .sort(([left], [right]) => compareOrdinalStrings(left, right))
    .map(([targetFamily, ids]) => [
      targetFamily,
      [...ids].sort(compareOrdinalStrings),
    ]);
}

function decodeCatalogArtifactRecordsFromStorage<
  Family extends CatalogFamilyName,
>(
  family: Family,
  storedRecords: readonly unknown[],
  resolveRecord?: CatalogStorageRecordResolver,
): CatalogRecordForFamily<Family>[] {
  const storage = getCatalogFamilyStorage(family);
  if (storage?.kind !== "derived_target_groups") {
    return storedRecords.map((record) =>
      decodeCatalogRecordFromStorage(family, record, resolveRecord),
    );
  }

  const flattenedTargets: Array<[string, string]> = [];
  let previousFamily: string | null = null;
  for (const group of storedRecords) {
    if (
      !Array.isArray(group) ||
      group.length !== 2 ||
      typeof group[0] !== "string" ||
      !Array.isArray(group[1]) ||
      group[1].length === 0
    ) {
      throw new Error(
        `${catalogFamilies[family].artifact} contains an invalid derived target group.`,
      );
    }
    const targetFamily = group[0];
    searchTargetFamilyCodec.parse(targetFamily);
    if (
      previousFamily !== null &&
      compareOrdinalStrings(previousFamily, targetFamily) >= 0
    ) {
      throw new Error(
        `${catalogFamilies[family].artifact} target groups must be unique and sorted.`,
      );
    }
    previousFamily = targetFamily;
    let previousId: string | null = null;
    for (const targetId of group[1]) {
      if (
        typeof targetId !== "string" ||
        (previousId !== null &&
          compareOrdinalStrings(previousId, targetId) >= 0)
      ) {
        throw new Error(
          `${catalogFamilies[family].artifact} target ids must be unique strings sorted within each family.`,
        );
      }
      previousId = targetId;
      flattenedTargets.push([targetFamily, targetId]);
    }
  }
  return flattenedTargets.map(
    (target) =>
      decodeDerivedSearchTarget(
        target,
        resolveRecord,
      ) as CatalogRecordForFamily<Family>,
  );
}

export function parseCatalogArtifactEnvelope<Family extends CatalogFamilyName>(
  family: Family,
  value: unknown,
  resolveRecord?: CatalogStorageRecordResolver,
): CatalogArtifactEnvelope<Family> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error(
      `${catalogFamilies[family].artifact} must contain a catalog artifact object.`,
    );
  }
  const candidate = value as Record<string, unknown>;
  if (candidate.schema_version !== KNOWLEDGE_RECORD_SCHEMA_VERSION) {
    throw new Error(
      `${catalogFamilies[family].artifact} has an unsupported schema_version.`,
    );
  }
  if (candidate.family !== family) {
    throw new Error(
      `${catalogFamilies[family].artifact} declares family '${String(
        candidate.family,
      )}', expected '${family}'.`,
    );
  }
  if (!Array.isArray(candidate.records)) {
    throw new Error(
      `${catalogFamilies[family].artifact} field 'records' must be an array.`,
    );
  }

  const records = decodeCatalogArtifactRecordsFromStorage(
    family,
    candidate.records,
    resolveRecord,
  );
  const seen = new Set<string>();
  for (const record of records) {
    if (seen.has(record.id)) {
      throw new Error(
        `${catalogFamilies[family].artifact} contains duplicate id '${record.id}'.`,
      );
    }
    seen.add(record.id);
  }
  return {
    schema_version: KNOWLEDGE_RECORD_SCHEMA_VERSION,
    family,
    records,
  };
}

export function createCatalogJsonSchema(): Record<string, unknown> {
  const closeTupleSchemas = (value: unknown): unknown => {
    if (Array.isArray(value)) return value.map(closeTupleSchemas);
    if (!value || typeof value !== "object") return value;
    const result: Record<string, unknown> = Object.fromEntries(
      Object.entries(value).map(([key, nested]) => [
        key,
        closeTupleSchemas(nested),
      ]),
    );
    if (Array.isArray(result.prefixItems)) {
      result.minItems = result.prefixItems.length;
      result.maxItems = result.prefixItems.length;
      result.items = false;
    }
    return result;
  };
  const definitions = Object.fromEntries(
    CATALOG_FAMILY_NAMES.map((family) => [
      family,
      closeTupleSchemas(
        z.toJSONSchema(catalogFamilies[family].codec, {
          target: "draft-2020-12",
          unrepresentable: "any",
        }),
      ),
    ]),
  );
  const contentDefinitions = Object.fromEntries(
    CATALOG_CONTENT_CODEC_NAMES.map((codec) => [
      codec,
      closeTupleSchemas(
        z.toJSONSchema(catalogContentCodecs[codec].codec, {
          target: "draft-2020-12",
          unrepresentable: "any",
        }),
      ),
    ]),
  );
  const contentMediaTypes = Object.fromEntries(
    CATALOG_CONTENT_CODEC_NAMES.map((codec) => [
      codec,
      catalogContentCodecs[codec].mediaType,
    ]),
  );

  return {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    $id: "https://www.saltdesignsystem.com/schemas/catalog/v2/catalog.json",
    title: "Salt catalog schema v2",
    schema_version: KNOWLEDGE_RECORD_SCHEMA_VERSION,
    family_names: CATALOG_FAMILY_NAMES,
    artifacts: Object.fromEntries(
      CATALOG_FAMILY_NAMES.map((family) => [
        family,
        catalogFamilies[family].artifact,
      ]),
    ),
    codecs: Object.fromEntries(
      CATALOG_FAMILY_NAMES.map((family) => [
        family,
        catalogFamilies[family].codecName,
      ]),
    ),
    canonical: Object.fromEntries(
      CATALOG_FAMILY_NAMES.map((family) => [
        family,
        catalogFamilies[family].canonical,
      ]),
    ),
    publication_states: Object.fromEntries(
      CATALOG_FAMILY_NAMES.map((family) => [
        family,
        catalogFamilies[family].publicationState,
      ]),
    ),
    storage: Object.fromEntries(
      CATALOG_FAMILY_NAMES.map((family) => [
        family,
        getCatalogFamilyStorage(family) ?? { kind: "object" },
      ]),
    ),
    definitions,
    content_definitions: contentDefinitions,
    content_media_types: contentMediaTypes,
  };
}

export function resolveCatalogRecordEvidence(
  record: CatalogRecord,
): CatalogReference[] {
  return resolveCatalogRecordProvenance(record);
}

function descriptorForRecord(record: CatalogRecord): CatalogFamilyDescriptor {
  return catalogFamilies[
    record.family as CatalogFamilyName
  ] as CatalogFamilyDescriptor;
}

export function resolveCatalogRecordReferences(
  record: CatalogRecord,
): CatalogReference[] {
  return [...descriptorForRecord(record).resolveReferences(record)];
}

export function resolveCatalogRecordContentReferences(
  record: CatalogRecord,
): CatalogContentReference[] {
  return [...descriptorForRecord(record).resolveContentReferences(record)];
}

export function resolveCatalogRecordProvenance(
  record: CatalogRecord,
): CatalogReference[] {
  return [...descriptorForRecord(record).resolveProvenance(record)];
}

export function indexCatalogRecord(
  record: CatalogRecord,
): CatalogSearchIndexInput | null {
  const descriptor = descriptorForRecord(record);
  const indexed = descriptor.indexRecord(record);
  if (descriptor.searchable !== (indexed !== null)) {
    throw new Error(
      `Catalog family '${record.family}' has inconsistent searchable metadata and indexer output.`,
    );
  }
  return indexed;
}

export function createCatalogSearchDocument(
  record: CatalogRecord,
): CatalogRecordForFamily<"search_document"> | null {
  const indexed = indexCatalogRecord(record);
  if (!indexed) return null;
  const uniqueNonEmptyStrings = (values: readonly string[]): string[] => [
    ...new Set(values.filter((value) => value.trim().length > 0)),
  ];
  return searchDocumentCodec.parse({
    family: "search_document",
    id: `search:${record.family}:${record.id}`,
    target: { family: record.family, id: record.id },
    title: indexed.title,
    summary: indexed.summary,
    terms: uniqueNonEmptyStrings(indexed.terms),
    facets: Object.fromEntries(
      Object.entries(indexed.facets).map(([name, values]) => [
        name,
        uniqueNonEmptyStrings(values),
      ]),
    ),
  });
}

export function isCanonicalCatalogFamily(family: CatalogFamilyName): boolean {
  return catalogFamilies[family].canonical;
}

export { CONTENT_ID_CODEC, SHA256_CODEC, catalogFamilyNameCodec };
