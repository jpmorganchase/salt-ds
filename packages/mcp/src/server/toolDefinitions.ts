import type {
  StandardSchemaWithJSON,
  ToolAnnotations,
} from "@modelcontextprotocol/server";
import * as z from "zod/v4";
import {
  CATALOG_SEARCH_TARGET_FAMILY_NAMES,
  MAX_REVIEW_ARTIFACT_UTF8_BYTES,
  MAX_REVIEW_ARTIFACT_ID_CHARS,
  MAX_REVIEW_ARTIFACT_ID_JSON_UTF8_BYTES,
  MAX_REVIEW_ARTIFACTS,
  MAX_REVIEW_PACKAGE_VERSIONS,
  MAX_REVIEW_SUBMITTED_UTF8_BYTES,
  MAX_SEARCH_RESULTS,
  reviewSaltCode,
  type SaltCatalogRuntimeContext,
  searchSalt,
} from "../core/runtime.js";
import { compactStandardOutputSchema } from "./compactStandardSchema.js";
import { inspectSaltProject } from "./inspectSaltProject.js";
import type { ProjectAccessPolicy } from "./projectAccess.js";
import {
  isAuthorizedProjectPolicySnapshot,
  loadAuthorizedProjectPolicySnapshot,
} from "./projectPolicySnapshot.js";
import type { ProjectPolicySnapshotCache } from "./projectPolicySnapshot.js";

const MAX_QUERY_CHARS = 2_000;
const MAX_PATH_CHARS = 4_096;
const MAX_ARTIFACT_CHARS = 256 * 1024;
const NON_WHITESPACE = /\S/u;
const READ_ONLY_ANNOTATIONS: ToolAnnotations = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: false,
};

const SHA256_SCHEMA = z.string().regex(/^sha256:[0-9a-f]{64}$/u);
const NULLABLE_PATH_SCHEMA = z.string().max(MAX_PATH_CHARS).nullable();
const RESULT_BUDGET_SCHEMA = z
  .object({
    max_utf8_bytes: z.number().int().positive(),
    truncated: z.boolean(),
    omissions: z.array(
      z
        .object({
          section: z.string(),
          available: z.number().int().nonnegative(),
          returned: z.number().int().nonnegative(),
        })
        .strict(),
    ),
  })
  .strict();

const CATALOG_RESOURCE_URI_SCHEMA = z
  .string()
  .regex(/^salt:\/\/catalog\/v2\/sha256-[0-9a-f]{64}\//u);
const PROJECT_POLICY_RESOURCE_URI_SCHEMA = z
  .string()
  .regex(
    /^salt:\/\/project-policy\/v2\/[A-Za-z0-9_-]+\/sha256-[0-9a-f]{64}\//u,
  );
const SEARCH_RESULT_SCHEMA = z
  .object({
    data: z
      .object({
        query: z.string(),
        matches: z.array(
          z
            .object({
              family: z.enum(CATALOG_SEARCH_TARGET_FAMILY_NAMES),
              id: z.string().min(1),
              title: z.string(),
              summary: z.string().max(240),
              uri: CATALOG_RESOURCE_URI_SCHEMA,
              evidence: z
                .object({
                  matched_fields: z.array(
                    z.enum(["title", "summary", "terms"]),
                  ),
                  matched_terms: z.array(z.string()).max(8),
                  score: z.number().int().nonnegative(),
                })
                .strict(),
              provenance: z
                .object({ resource_uri: CATALOG_RESOURCE_URI_SCHEMA })
                .strict(),
            })
            .strict(),
        ),
        ambiguity: z
          .object({
            is_ambiguous: z.boolean(),
            candidate_count: z.number().int().nonnegative(),
            top_score_tie_count: z.number().int().nonnegative(),
          })
          .strict(),
      })
      .strict(),
    scope: z
      .object({
        kind: z.literal("catalog_search"),
        searched_families: z.array(z.enum(CATALOG_SEARCH_TARGET_FAMILY_NAMES)),
        searched_statuses: z
          .array(z.enum(["stable", "beta", "lab", "deprecated"]))
          .nullable(),
        total_documents: z.number().int().nonnegative(),
        returned: z.number().int().nonnegative(),
        truncated: z.boolean(),
      })
      .strict(),
    coverage: z
      .object({
        indexed_documents: z.number().int().nonnegative(),
        evaluated_documents: z.number().int().nonnegative(),
        matched_documents: z.number().int().nonnegative(),
        ranking: z.literal("deterministic_catalog_index"),
      })
      .strict(),
    limitations: z.array(z.string()),
    provenance: z
      .object({
        catalog_version: z.string().min(1),
        semantic_digest: z.string().regex(/^sha256:[0-9a-f]{64}$/u),
      })
      .strict(),
  })
  .strict();

const PUBLIC_POLICY_IR_SCHEMA = z
  .object({
    contract: z.literal("salt_project_policy_ir_v2"),
    policy_mode: z.enum(["none", "team", "stack"]),
    declared: z.boolean(),
    digest: SHA256_SCHEMA,
    manifest_uri: PROJECT_POLICY_RESOURCE_URI_SCHEMA,
    counts: z
      .object({
        layers: z.number().int().nonnegative(),
        occurrences: z.number().int().nonnegative(),
        diagnostics: z.number().int().nonnegative(),
      })
      .strict(),
    untrusted_ir: z
      .object({ encoding: z.literal("json"), text: z.string() })
      .strict()
      .nullable(),
  })
  .strict();

const INSPECT_RESULT_SCHEMA = z
  .object({
    data: z
      .object({
        root_dir: NULLABLE_PATH_SCHEMA,
        package_manifest: z
          .object({
            path: z.string().max(MAX_PATH_CHARS),
            name: z.string().nullable(),
            package_manager: z.string(),
          })
          .strict()
          .nullable(),
        workspace: z
          .object({
            kind: z.enum([
              "single-package",
              "workspace-root",
              "workspace-package",
            ]),
            workspace_root: NULLABLE_PATH_SCHEMA,
          })
          .strict()
          .nullable(),
        installation: z
          .object({
            assessment: z
              .object({
                status: z.enum([
                  "not_observed",
                  "verified_healthy",
                  "advisory_issues",
                  "unverifiable",
                  "limited",
                ]),
                blocking: z.literal(false),
                advisory_issue_count: z.number().int().nonnegative(),
                unverifiable_package_count: z.number().int().nonnegative(),
              })
              .strict(),
            resolved_packages: z.array(
              z
                .object({
                  name: z.string(),
                  declared_version: z.string(),
                  effective_declared_version: z.string().nullable(),
                  declaration_resolution: z.enum(["verified", "unverifiable"]),
                  resolved_version: z.string().nullable(),
                  resolved_path: NULLABLE_PATH_SCHEMA,
                  satisfies_declared_version: z.boolean().nullable(),
                })
                .strict(),
            ),
          })
          .strict()
          .nullable(),
        policy: z
          .object({
            mode: z.enum(["none", "team", "stack"]),
            team_config_path: NULLABLE_PATH_SCHEMA,
            stack_config_path: NULLABLE_PATH_SCHEMA,
            ir: PUBLIC_POLICY_IR_SCHEMA.nullable(),
            import_targets: z
              .object({
                status: z.enum(["not_declared", "verified", "issues"]),
                declared_count: z.number().int().nonnegative(),
                resolved_count: z.number().int().nonnegative(),
                issue_count: z.number().int().nonnegative(),
                untrusted_diagnostics: z
                  .object({ encoding: z.literal("json"), text: z.string() })
                  .strict()
                  .nullable(),
              })
              .strict()
              .nullable(),
          })
          .strict()
          .nullable(),
      })
      .strict(),
    scope: z
      .object({
        kind: z.literal("configured_project_inspection"),
        filesystem_access: z.literal("read_only"),
        inspected_root: NULLABLE_PATH_SCHEMA,
        authorization: z.enum(["restricted", "unrestricted_local_stdio"]),
      })
      .strict(),
    coverage: z
      .object({
        requested_root: z.enum(["evaluated", "denied"]),
        package_manifest: z.enum([
          "valid",
          "invalid",
          "absent",
          "not_evaluated",
        ]),
        installation: z.enum(["evaluated", "not_evaluated"]),
        workspace: z.enum(["evaluated", "not_evaluated"]),
        policy: z.enum([
          "detection_only",
          "policy_ir_evaluated",
          "not_evaluated",
        ]),
        result_budget: RESULT_BUDGET_SCHEMA,
      })
      .strict(),
    limitations: z.array(z.string()),
    provenance: z
      .object({ project_policy_digest: SHA256_SCHEMA.nullable() })
      .strict(),
  })
  .strict();

const REVIEW_EVIDENCE_REFERENCE_SCHEMA = z
  .object({
    locator: z.union([
      CATALOG_RESOURCE_URI_SCHEMA,
      PROJECT_POLICY_RESOURCE_URI_SCHEMA,
    ]),
    field_path: z.string(),
  })
  .strict();

const REVIEW_LOCATION_SCHEMA = z
  .object({
    start_offset: z.number().int().nonnegative(),
    end_offset: z.number().int().nonnegative(),
    start_line: z.number().int().positive(),
    start_column: z.number().int().positive(),
    end_line: z.number().int().positive(),
    end_column: z.number().int().positive(),
  })
  .strict();

const REVIEW_PARSED_FACT_SCHEMA = z
  .object({
    kind: z.enum([
      "import",
      "jsx_element",
      "jsx_prop",
      "style_declaration",
      "token_use",
    ]),
    subject: z.string(),
    property: z.string().nullable(),
    value_kind: z.enum([
      "value_usage",
      "type_usage",
      "unused",
      "boolean",
      "static_string",
      "static_number",
      "dynamic",
      "spread",
      "token_reference",
    ]),
    certainty: z.enum(["known", "unknown"]),
  })
  .strict();

const REVIEW_FINDING_SCHEMA = z
  .object({
    id: z.string(),
    rule_id: z.string(),
    rule_description: z.string(),
    severity: z.enum(["info", "warning", "error"]),
    parsed_fact: REVIEW_PARSED_FACT_SCHEMA,
    location: REVIEW_LOCATION_SCHEMA,
    remediation: z.string().nullable(),
    policy_evaluation: z
      .object({
        digest: SHA256_SCHEMA,
        applicability: z.literal("applicable"),
        salt_version: z.string().nullable(),
      })
      .strict()
      .nullable(),
    evidence: z
      .object({
        submitted_artifact_id: z.string(),
        references: z.array(REVIEW_EVIDENCE_REFERENCE_SCHEMA),
        validation: z.literal("source_bound"),
      })
      .strict(),
  })
  .strict();

const REVIEW_ARTIFACT_POLICY_COVERAGE_SCHEMA = z
  .object({
    status: z.enum(["not_supplied", "evaluated", "limited"]),
    digest: SHA256_SCHEMA.nullable(),
    unresolved_required_layers: z.number().int().nonnegative(),
    evaluated_occurrences: z.number().int().nonnegative(),
    applicable_occurrences: z.number().int().nonnegative(),
    contradicted_occurrences: z.number().int().nonnegative(),
    unknown_occurrences: z.number().int().nonnegative(),
  })
  .strict();

const REVIEW_PROJECT_POLICY_COVERAGE_SCHEMA = z
  .object({
    status: z.enum(["not_supplied", "evaluated", "limited"]),
    digest: SHA256_SCHEMA.nullable(),
    unresolved_required_layers: z.number().int().nonnegative(),
    evaluated_occurrence_artifact_pairs: z.number().int().nonnegative(),
    applicable_occurrence_artifact_pairs: z.number().int().nonnegative(),
    contradicted_occurrence_artifact_pairs: z.number().int().nonnegative(),
    unknown_occurrence_artifact_pairs: z.number().int().nonnegative(),
  })
  .strict();

const REVIEW_RESULT_SCHEMA = z
  .object({
    data: z
      .object({
        results: z.array(
          z
            .object({
              artifact: z
                .object({
                  id: z.string(),
                  language: z.enum([
                    "javascript",
                    "jsx",
                    "typescript",
                    "tsx",
                    "css",
                  ]),
                  utf8_bytes: z.number().int().nonnegative(),
                  content_digest: SHA256_SCHEMA,
                })
                .strict(),
              outcome: z.enum([
                "findings",
                "no_findings_in_evaluated_scope",
                "not_evaluated",
              ]),
              summary: z
                .object({
                  errors: z.number().int().nonnegative(),
                  warnings: z.number().int().nonnegative(),
                  infos: z.number().int().nonnegative(),
                })
                .strict(),
              findings: z.array(REVIEW_FINDING_SCHEMA),
              coverage: z
                .object({
                  parser: z.enum([
                    "babel",
                    "postcss",
                    "failed",
                    "limited",
                    "not_run",
                  ]),
                  fact_counts: z.array(
                    z
                      .object({
                        kind: z.enum([
                          "import",
                          "jsx_element",
                          "jsx_prop",
                          "style_declaration",
                          "token_use",
                        ]),
                        count: z.number().int().nonnegative(),
                      })
                      .strict(),
                  ),
                  unknown_fact_count: z.number().int().nonnegative(),
                  evaluated_rule_ids: z.array(z.string()),
                  skipped_rule_matches: z.number().int().nonnegative(),
                  detected_findings: z.number().int().nonnegative(),
                  returned_findings: z.number().int().nonnegative(),
                  truncated: z.boolean(),
                  policy: REVIEW_ARTIFACT_POLICY_COVERAGE_SCHEMA,
                })
                .strict(),
              limitations: z.array(z.string()),
            })
            .strict(),
        ),
      })
      .strict(),
    scope: z
      .object({
        kind: z.literal("submitted_text_only"),
        artifact_count: z.number().int().nonnegative(),
        submitted_utf8_bytes: z.number().int().nonnegative(),
      })
      .strict(),
    coverage: z
      .object({
        submitted_artifacts: z.number().int().nonnegative(),
        evaluated_artifacts: z.number().int().nonnegative(),
        analyzer: z.literal("salt_submitted_fact_rules_v1"),
        semantic_validation: z.literal("source_bound_allowlist"),
        location_encoding: z.literal("utf8_bytes_end_exclusive"),
        project_policy: REVIEW_PROJECT_POLICY_COVERAGE_SCHEMA,
        detected_findings: z.number().int().nonnegative(),
        returned_findings: z.number().int().nonnegative(),
        truncated: z.boolean(),
        result_budget: RESULT_BUDGET_SCHEMA,
      })
      .strict(),
    limitations: z.array(z.string()),
    provenance: z
      .object({
        catalog_version: z.string(),
        semantic_digest: SHA256_SCHEMA.nullable(),
        project_policy_digest: SHA256_SCHEMA.nullable(),
      })
      .strict(),
  })
  .strict();

const SEARCH_INPUT_SCHEMA = z
  .object({
    query: z.string().min(1).max(MAX_QUERY_CHARS).regex(NON_WHITESPACE),
    families: z
      .array(z.enum(CATALOG_SEARCH_TARGET_FAMILY_NAMES))
      .min(1)
      .max(CATALOG_SEARCH_TARGET_FAMILY_NAMES.length)
      .optional(),
    statuses: z
      .array(z.enum(["stable", "beta", "lab", "deprecated"]))
      .min(1)
      .max(4)
      .optional(),
    limit: z.number().int().min(1).max(MAX_SEARCH_RESULTS).optional(),
  })
  .strict();

const INSPECT_INPUT_SCHEMA = z
  .object({
    root_dir: z.string().min(1).max(MAX_PATH_CHARS).optional(),
    include_policy_ir: z.boolean().optional(),
  })
  .strict();

const REVIEW_ARTIFACT_SCHEMA = z
  .object({
    id: z
      .string()
      .min(1)
      .max(MAX_REVIEW_ARTIFACT_ID_CHARS)
      .regex(NON_WHITESPACE),
    language: z.enum(["javascript", "jsx", "typescript", "tsx", "css"]),
    text: z.string().min(1).max(MAX_ARTIFACT_CHARS).regex(NON_WHITESPACE),
  })
  .strict();

const REVIEW_PACKAGE_VERSIONS_SCHEMA = z
  .record(
    z
      .string()
      .min(1)
      .max(214)
      .regex(/^@salt-ds\/[a-z0-9][a-z0-9._-]*$/u),
    z.string().min(1).max(128),
  )
  .meta({ maxProperties: MAX_REVIEW_PACKAGE_VERSIONS });

const REVIEW_INPUT_SCHEMA = z
  .object({
    artifacts: z.array(REVIEW_ARTIFACT_SCHEMA).min(1).max(MAX_REVIEW_ARTIFACTS),
    root_dir: z.string().min(1).max(MAX_PATH_CHARS).optional(),
    package_versions: REVIEW_PACKAGE_VERSIONS_SCHEMA.optional(),
    max_findings: z.number().int().min(1).max(50).optional(),
  })
  .strict()
  .superRefine((value, context) => {
    const seenIds = new Set<string>();
    value.artifacts.forEach((artifact, index) => {
      if (
        Buffer.byteLength(JSON.stringify(artifact.id), "utf8") >
        MAX_REVIEW_ARTIFACT_ID_JSON_UTF8_BYTES
      ) {
        context.addIssue({
          code: "custom",
          message: `Artifact ids cannot exceed ${MAX_REVIEW_ARTIFACT_ID_JSON_UTF8_BYTES} JSON-encoded UTF-8 bytes.`,
          path: ["artifacts", index, "id"],
        });
      }
      if (seenIds.has(artifact.id)) {
        context.addIssue({
          code: "custom",
          message: "Artifact ids must be unique within one review request.",
          path: ["artifacts", index, "id"],
        });
      }
      seenIds.add(artifact.id);
      if (
        Buffer.byteLength(artifact.text, "utf8") >
        MAX_REVIEW_ARTIFACT_UTF8_BYTES
      ) {
        context.addIssue({
          code: "custom",
          message: `Artifact text exceeds ${MAX_REVIEW_ARTIFACT_UTF8_BYTES} UTF-8 bytes.`,
          path: ["artifacts", index, "text"],
        });
      }
    });
    if (
      Object.keys(value.package_versions ?? {}).length >
      MAX_REVIEW_PACKAGE_VERSIONS
    ) {
      context.addIssue({
        code: "custom",
        message: `package_versions accepts at most ${MAX_REVIEW_PACKAGE_VERSIONS} Salt packages.`,
        path: ["package_versions"],
      });
    }
    const submittedBytes = value.artifacts.reduce(
      (total, artifact) => total + Buffer.byteLength(artifact.text, "utf8"),
      0,
    );
    if (submittedBytes > MAX_REVIEW_SUBMITTED_UTF8_BYTES) {
      context.addIssue({
        code: "custom",
        message: `Aggregate submitted text exceeds ${MAX_REVIEW_SUBMITTED_UTF8_BYTES} UTF-8 bytes.`,
        path: ["artifacts"],
      });
    }
  });

type ToolInputSchema =
  | typeof SEARCH_INPUT_SCHEMA
  | typeof INSPECT_INPUT_SCHEMA
  | typeof REVIEW_INPUT_SCHEMA;

export interface ToolDefinition {
  name: (typeof REGISTERED_SALT_TOOL_NAMES)[number];
  description: string;
  inputSchema: ToolInputSchema;
  outputSchema: StandardSchemaWithJSON;
  outputValidationSchema: z.ZodType;
  annotations: ToolAnnotations;
  execute: (
    context: SaltCatalogRuntimeContext & {
      projectAccess: ProjectAccessPolicy;
      projectPolicySnapshots: ProjectPolicySnapshotCache;
    },
    args: never,
  ) => Promise<unknown> | unknown;
}

function defineTool<Schema extends ToolInputSchema>(definition: {
  name: ToolDefinition["name"];
  description: string;
  inputSchema: Schema;
  outputSchema: z.ZodType;
  annotations: ToolAnnotations;
  execute: (
    context: SaltCatalogRuntimeContext & {
      projectAccess: ProjectAccessPolicy;
      projectPolicySnapshots: ProjectPolicySnapshotCache;
    },
    args: z.infer<Schema>,
  ) => Promise<unknown> | unknown;
}): ToolDefinition {
  return {
    ...definition,
    outputSchema: compactStandardOutputSchema(definition.outputSchema),
    outputValidationSchema: definition.outputSchema,
  } as ToolDefinition;
}

export const REGISTERED_SALT_TOOL_NAMES = [
  "search_salt",
  "inspect_salt_project",
  "review_salt_code",
] as const;

export const TOOL_DEFINITIONS: readonly ToolDefinition[] = [
  defineTool({
    name: "search_salt",
    description: "Search Salt catalog records.",
    inputSchema: SEARCH_INPUT_SCHEMA,
    outputSchema: SEARCH_RESULT_SCHEMA,
    annotations: READ_ONLY_ANNOTATIONS,
    execute: (context, args) => searchSalt(context.store, args),
  }),
  defineTool({
    name: "inspect_salt_project",
    description: "Inspect an authorized local Salt project.",
    inputSchema: INSPECT_INPUT_SCHEMA,
    outputSchema: INSPECT_RESULT_SCHEMA,
    annotations: READ_ONLY_ANNOTATIONS,
    execute: (context, args) =>
      inspectSaltProject(
        args,
        context.projectAccess,
        context.projectPolicySnapshots,
      ),
  }),
  defineTool({
    name: "review_salt_code",
    description: "Review submitted source against Salt rules.",
    inputSchema: REVIEW_INPUT_SCHEMA,
    outputSchema: REVIEW_RESULT_SCHEMA,
    annotations: READ_ONLY_ANNOTATIONS,
    execute: async (context, args) => {
      const loadedPolicy = args.root_dir
        ? await loadAuthorizedProjectPolicySnapshot(
            context.projectAccess,
            args.root_dir,
            context.projectPolicySnapshots,
          )
        : null;
      if (loadedPolicy?.authorization.status === "denied") {
        throw new Error(
          `review_salt_code project policy root was denied (${loadedPolicy.authorization.reason}).`,
        );
      }
      const policyContext =
        loadedPolicy &&
        isAuthorizedProjectPolicySnapshot(loadedPolicy) &&
        loadedPolicy.ir &&
        loadedPolicy.digest
          ? {
              ir: loadedPolicy.ir,
              root_dir: loadedPolicy.authorization.rootDir,
              digest: loadedPolicy.digest,
              salt_version: loadedPolicy.salt_version,
            }
          : null;
      return reviewSaltCode(
        { registry: context.registry, store: context.store },
        args,
        policyContext,
      );
    },
  }),
];
