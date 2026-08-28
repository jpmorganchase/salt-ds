import type { ToolAnnotations } from "@modelcontextprotocol/server";
import {
  KNOWLEDGE_SEARCH_TARGET_FAMILY_NAMES,
  MAX_REVIEW_ARTIFACT_ID_CHARS,
  MAX_REVIEW_ARTIFACTS,
  MAX_REVIEW_PACKAGE_VERSIONS,
} from "@salt-ds/knowledge";
import * as z from "zod/v4";

export const MAX_SEARCH_RESULTS = 8;
export const MAX_TOOL_TEXT_UTF8_BYTES = 16 * 1024;
export const MAX_TOOL_STRUCTURED_UTF8_BYTES = 28 * 1024;
export const MAX_TOOL_RESULT_UTF8_BYTES = 64 * 1024;

const SHA256_SCHEMA = z.string().regex(/^sha256:[0-9a-f]{64}$/u);
const RESOURCE_URI_SCHEMA = z
  .string()
  .regex(/^salt-knowledge:\/\/v1\/sha256-[0-9a-f]{64}\//u);
const EXACT_SEMVER_SCHEMA = z
  .string()
  .regex(
    /^(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)(?:-(?:0|[1-9]\d*|\d*[A-Za-z-][0-9A-Za-z-]*)(?:\.(?:0|[1-9]\d*|\d*[A-Za-z-][0-9A-Za-z-]*))*)?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/u,
  );

export const READ_ONLY_TOOL_ANNOTATIONS: ToolAnnotations = Object.freeze({
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: false,
});

export const searchSaltInputSchema = z
  .object({
    query: z.string().min(1).max(2_000),
    families: z
      .array(z.enum(KNOWLEDGE_SEARCH_TARGET_FAMILY_NAMES))
      .max(KNOWLEDGE_SEARCH_TARGET_FAMILY_NAMES.length)
      .optional(),
    statuses: z
      .array(z.enum(["stable", "beta", "lab", "deprecated"]))
      .max(4)
      .optional(),
    limit: z.number().int().min(1).max(MAX_SEARCH_RESULTS).optional(),
  })
  .strict();

export const searchSaltOutputSchema = z
  .object({
    contract: z.literal("salt-mcp-search-result/1"),
    bundle_digest: SHA256_SCHEMA,
    query: z.string(),
    matches: z
      .array(
        z
          .object({
            family: z.enum(KNOWLEDGE_SEARCH_TARGET_FAMILY_NAMES),
            id: z.string().min(1),
            title: z.string(),
            summary: z.string(),
            resource_uri: RESOURCE_URI_SCHEMA,
            score: z.number().int().nonnegative(),
            source_records: z.array(z.string()),
          })
          .strict(),
      )
      .max(MAX_SEARCH_RESULTS),
    coverage: z
      .object({
        indexed_documents: z.number().int().nonnegative(),
        evaluated_documents: z.number().int().nonnegative(),
        matched_documents: z.number().int().nonnegative(),
        returned_matches: z.number().int().nonnegative(),
        truncated: z.boolean(),
      })
      .strict(),
    limitations: z.array(z.string()),
  })
  .strict();

export const inspectSaltProjectInputSchema = z
  .object({
    project_root_index: z.number().int().min(0).max(15).optional(),
  })
  .strict();

const PACKAGE_DESCRIPTOR_SCHEMA = z
  .object({ name: z.string(), version: z.string() })
  .strict();

export const inspectSaltProjectOutputSchema = z
  .object({
    contract: z.literal("salt-mcp-project-inspection/1"),
    bundle_digest: SHA256_SCHEMA,
    project_root_index: z.number().int().min(0).max(15),
    project: z
      .object({
        package_manifest: z
          .object({
            status: z.enum(["valid", "invalid", "absent"]),
            name: z.string().nullable(),
            package_manager: z.string().nullable(),
          })
          .strict(),
        declared_salt_packages: z.array(PACKAGE_DESCRIPTOR_SCHEMA),
        installation: z
          .object({
            status: z.enum(["succeeded", "limited"]),
            package_layout: z.enum(["node-modules", "pnp", "unknown"]),
            resolved_packages: z.array(
              z
                .object({
                  name: z.string(),
                  declared_version: z.string(),
                  resolved_version: z.string().nullable(),
                  satisfies_declared_version: z.boolean().nullable(),
                })
                .strict(),
            ),
          })
          .strict(),
        workspace: z
          .object({
            kind: z.enum(["single-package", "workspace-root", "workspace-package"]),
          })
          .strict(),
        policy: z
          .object({ mode: z.enum(["none", "team", "stack"]) })
          .strict(),
      })
      .strict(),
    limitations: z.array(z.string()),
  })
  .strict();

const REVIEW_ARTIFACT_SCHEMA = z
  .object({
    id: z.string().min(1).max(MAX_REVIEW_ARTIFACT_ID_CHARS),
    language: z.enum(["javascript", "jsx", "typescript", "tsx", "css"]),
    text: z.string().max(256 * 1024),
  })
  .strict();

export const reviewSaltCodeInputSchema = z
  .object({
    artifacts: z.array(REVIEW_ARTIFACT_SCHEMA).min(1).max(MAX_REVIEW_ARTIFACTS),
    package_versions: z
      .array(
        z
          .object({ name: z.string().min(1).max(214), version: EXACT_SEMVER_SCHEMA })
          .strict(),
      )
      .max(MAX_REVIEW_PACKAGE_VERSIONS)
      .optional(),
    max_findings: z.number().int().min(1).max(20).optional(),
    project_root_index: z.number().int().min(0).max(15).optional(),
  })
  .strict();

const REVIEW_LOCATION_SCHEMA = z
  .object({
    start_offset: z.number().int().nonnegative(),
    end_offset: z.number().int().nonnegative(),
    start_line: z.number().int().positive(),
    start_column: z.number().int().nonnegative(),
    end_line: z.number().int().positive(),
    end_column: z.number().int().nonnegative(),
  })
  .strict();

export const reviewSaltCodeOutputSchema = z
  .object({
    contract: z.literal("salt-mcp-code-review/1"),
    bundle_digest: SHA256_SCHEMA,
    results: z.array(
      z
        .object({
          artifact: z
            .object({
              id: z.string(),
              language: z.enum(["javascript", "jsx", "typescript", "tsx", "css"]),
              utf8_bytes: z.number().int().nonnegative(),
              content_digest: SHA256_SCHEMA,
            })
            .strict(),
          outcome: z.enum([
            "not_evaluated",
            "findings",
            "no_findings_in_evaluated_scope",
          ]),
          summary: z
            .object({
              errors: z.number().int().nonnegative(),
              warnings: z.number().int().nonnegative(),
              infos: z.number().int().nonnegative(),
            })
            .strict(),
          findings: z.array(
            z
              .object({
                id: z.string(),
                rule_id: z.string(),
                rule_description: z.string(),
                severity: z.enum(["info", "warning", "error"]),
                location: REVIEW_LOCATION_SCHEMA,
                remediation: z.string().nullable(),
                evidence_resource_uris: z.array(RESOURCE_URI_SCHEMA),
              })
              .strict(),
          ),
          coverage: z
            .object({
              parser: z.enum(["limited", "babel", "postcss", "failed", "not_run"]),
              detected_findings: z.number().int().nonnegative(),
              returned_findings: z.number().int().nonnegative(),
              truncated: z.boolean(),
            })
            .strict(),
          limitations: z.array(z.string()),
        })
        .strict(),
    ),
    coverage: z
      .object({
        submitted_artifacts: z.number().int().positive(),
        evaluated_artifacts: z.number().int().nonnegative(),
        detected_findings: z.number().int().nonnegative(),
        returned_findings: z.number().int().nonnegative(),
        truncated: z.boolean(),
      })
      .strict(),
    limitations: z.array(z.string()),
  })
  .strict();

export type SearchSaltInput = z.infer<typeof searchSaltInputSchema>;
export type SearchSaltOutput = z.infer<typeof searchSaltOutputSchema>;
export type InspectSaltProjectInput = z.infer<typeof inspectSaltProjectInputSchema>;
export type InspectSaltProjectOutput = z.infer<typeof inspectSaltProjectOutputSchema>;
export type ReviewSaltCodeInput = z.infer<typeof reviewSaltCodeInputSchema>;
export type ReviewSaltCodeOutput = z.infer<typeof reviewSaltCodeOutputSchema>;
