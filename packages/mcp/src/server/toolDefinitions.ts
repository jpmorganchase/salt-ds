import * as z from "zod/v4";
import {
  createSaltUi,
  deriveComparableSaltVersion,
  getSaltEntities,
  migrateToSalt,
  PUBLIC_CREATE_REFERENCE_BATCH_MAX,
  PUBLIC_CREATE_RESOLVED_ENTITY_MAX,
  PUBLIC_REFERENCE_ENTITY_TYPES,
  reviewSaltUi,
  type PublicCreateRerunArgs,
  type SaltEvidenceValidationIssueCode,
  type SaltGeneratedArtifactKind,
  type SaltRegistry,
} from "../core/runtime.js";
import {
  collectSaltProjectContextData,
  collectSaltWorkflowContextBundle,
  toSaltProjectContextResult,
} from "./projectContext.js";
import {
  withAnalyzeWorkflowGuidance,
  withChooseWorkflowGuidance,
  withTranslateWorkflowGuidance,
} from "./workflowOutputs.js";

const STATUSES = ["stable", "beta", "lab", "deprecated"] as const;
const INCLUDE_SECTIONS = [
  "examples",
  "props",
  "accessibility",
  "deprecations",
] as const;
const MAX_SOURCE_CODE_CHARS = 512 * 1024;
const MAX_QUERY_CHARS = 10_000;
const MAX_OUTLINE_ENTRIES = 64;
const MAX_OUTLINE_ENTRY_CHARS = 2_000;
const MAX_PATH_CHARS = 4_096;
const MAX_PACKAGE_NAME_CHARS = 256;
const MAX_REFERENCE_NAME_CHARS = 256;
const CONTAINS_NON_WHITESPACE = /\S/u;
const REFERENCE_NAMES_SCHEMA = z
  .array(
    z
      .string()
      .min(1)
      .max(MAX_REFERENCE_NAME_CHARS)
      .regex(CONTAINS_NON_WHITESPACE),
  )
  .min(1)
  .max(PUBLIC_CREATE_REFERENCE_BATCH_MAX);
const OUTLINE_ENTRIES_SCHEMA = z
  .array(
    z
      .string()
      .min(1)
      .max(MAX_OUTLINE_ENTRY_CHARS)
      .regex(CONTAINS_NON_WHITESPACE),
  )
  .max(MAX_OUTLINE_ENTRIES);
const CONTEXT_NEXT_TOOL_IDS = [
  "create_salt_ui",
  "review_salt_ui",
  "migrate_to_salt",
] as const;
const UNKNOWN_RECORD_SCHEMA = z.record(z.string(), z.unknown());
const UNKNOWN_RECORD_ARRAY_SCHEMA = z.array(UNKNOWN_RECORD_SCHEMA);
const READ_ONLY_WORKFLOW_TOOL_ANNOTATIONS = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: false,
} as const;

const WORKFLOW_COMPOSITION_CONTRACT_SCHEMA = z
  .object({
    primary_target: z
      .object({
        solution_type: z.enum(["component", "pattern", "foundation", "token"]),
        name: z.string().nullable(),
      })
      .strict(),
    expected_patterns: z.array(z.string()),
    expected_components: z.array(z.string()),
    slots: z.array(
      z
        .object({
          id: z.string(),
          label: z.string(),
          certainty: z.enum([
            "explicitly_requested",
            "strongly_implied",
            "optional",
            "confirmation_needed",
          ]),
          preferred_patterns: z.array(z.string()),
          preferred_components: z.array(z.string()),
          reason: z.string(),
          source_urls: z.array(z.string()),
          notes: z.array(z.string()),
        })
        .strict(),
    ),
    avoid: z.array(z.string()),
    source_urls: z.array(z.string()),
  })
  .strict();

const REVIEW_EXPECTED_TARGETS_SCHEMA = z
  .object({
    components: z
      .array(z.string().min(1).max(MAX_REFERENCE_NAME_CHARS))
      .max(50)
      .optional(),
    patterns: z
      .array(z.string().min(1).max(MAX_REFERENCE_NAME_CHARS))
      .max(50)
      .optional(),
    composition_contract:
      WORKFLOW_COMPOSITION_CONTRACT_SCHEMA.nullable().optional(),
    source: z.enum(["create_report", "workflow_context"]).optional(),
  })
  .strict();
const GET_SALT_REFERENCE_INPUT_SCHEMA = z
  .object({
    names: REFERENCE_NAMES_SCHEMA.describe(
      "One to three exact Salt entity names to resolve or compare. Request examples through include: ['examples'].",
    ),
    entity_type: z
      .enum(PUBLIC_REFERENCE_ENTITY_TYPES)
      .optional()
      .describe(
        "Optional canonical entity family for names shared by multiple Salt record types; omission searches all families.",
      ),
    include_starter_code: z.boolean().optional(),
    include: z
      .array(z.enum(INCLUDE_SECTIONS))
      .max(INCLUDE_SECTIONS.length)
      .optional(),
  })
  .strict();
function publicReviewTargetsSchema<
  const Source extends "create_report" | "workflow_context",
>(source: Source) {
  return z
    .object({
      components: z.array(z.string()),
      patterns: z.array(z.string()),
      composition_contract: WORKFLOW_COMPOSITION_CONTRACT_SCHEMA.nullable(),
      source: z.literal(source),
    })
    .strict();
}
const PUBLIC_CREATE_REVIEW_TARGETS_SCHEMA =
  publicReviewTargetsSchema("create_report");
const PUBLIC_MIGRATE_REVIEW_TARGETS_SCHEMA =
  publicReviewTargetsSchema("workflow_context");

const TOOL_SOURCE_SCHEMA = z.object({
  original: z.string(),
  resolved: z.string(),
  kind: z.enum(["site", "external", "repo"]),
});

const PROJECT_POLICY_IMPORT_TARGETS_SCHEMA = z.object({
  status: z.enum(["not_declared", "ready", "blocked"]),
  declared_count: z.number().int().nonnegative(),
  resolved_count: z.number().int().nonnegative(),
  blocking_count: z.number().int().nonnegative(),
  targets: z.array(
    z.object({
      kind: z.enum(["approved_wrapper", "theme_provider", "theme_import"]),
      owner: z.string(),
      from: z.string(),
      name: z.string().nullable(),
      status: z.enum([
        "resolved",
        "missing_module",
        "missing_export",
        "unsupported",
      ]),
      resolved_path: z.string().nullable(),
      reason: z.string().nullable(),
    }),
  ),
  blocking_reasons: z.array(z.string()),
});

const CONTEXT_WORKFLOW_ENVELOPE_SCHEMA = z
  .object({
    workflow: z.object({
      id: z.literal("get_salt_project_context"),
    }),
    // Publish only the stable routing surface in tools/list. The tool still
    // returns richer diagnostics as passthrough fields when requested.
    result: z
      .object({
        root_dir: z.string(),
        resolution: z
          .object({
            status: z.enum([
              "resolved",
              "fallback",
              "needs_explicit_root",
              "mismatch",
            ]),
            quality: z.enum(["ready", "needs_explicit_root"]),
            reason: z.string().nullable(),
          })
          .passthrough(),
        environment: z
          .object({
            package_manager: z.string(),
          })
          .passthrough(),
        framework: z
          .object({
            name: z.enum(["next", "vite-react", "vite", "react", "unknown"]),
          })
          .passthrough(),
        salt: z
          .object({
            packages: z.array(
              z.object({
                name: z.string(),
                version: z.string(),
              }),
            ),
            package_version: z.string().nullable(),
          })
          .passthrough(),
        repo_signals: z
          .object({
            storybook_detected: z.boolean(),
            app_runtime_detected: z.boolean(),
            salt_team_config_found: z.boolean(),
            salt_stack_config_found: z.boolean(),
          })
          .passthrough(),
        policy: z
          .object({
            import_targets: PROJECT_POLICY_IMPORT_TARGETS_SCHEMA,
          })
          .passthrough(),
      })
      .passthrough(),
    artifacts: z
      .object({
        summary: z
          .object({
            recommended_next_tool: z.enum(CONTEXT_NEXT_TOOL_IDS).nullable(),
            context_health: z
              .object({
                trusted: z.boolean(),
                repo_specific_workflows_ready: z.boolean(),
              })
              .passthrough(),
            retry_with: z.object({
              root_dir: z.string().nullable(),
            }),
          })
          .passthrough(),
        notes: z.array(z.string()),
      })
      .passthrough(),
    sources: z.array(TOOL_SOURCE_SCHEMA),
  })
  .passthrough();

const CONTEXT_OUTPUT_SCHEMA = CONTEXT_WORKFLOW_ENVELOPE_SCHEMA;

const PUBLIC_WORKFLOW_STATUSES = [
  "success",
  "partial",
  "blocked",
  "failed",
] as const;
const PUBLIC_MATCH_STATUSES = [
  "exact",
  "alias",
  "broadened",
  "misrouted",
  "no_match",
] as const;
const PUBLIC_EVIDENCE_KINDS = [
  "docs",
  "examples",
  "registry",
  "project_policy",
  "heuristic_fallback",
] as const;
const PUBLIC_EVIDENCE_VALIDATION_ISSUE_CODES = [
  "invalid_evidence_contract",
  "missing_registry_locator",
  "missing_registry_entity",
  "missing_registry_field_path",
  "missing_registry_field",
  "missing_source_locator",
  "missing_project_policy_locator",
  "missing_workflow_input_locator",
  "missing_runtime_locator",
  "missing_package_locator",
  "stale_registry",
  "missing_claim_evidence",
  "unknown_claim_evidence_ref",
  "missing_matching_claim_evidence_ref",
  "invalid_claim_evidence_ref",
  "missing_structural_role_rule_evidence",
] as const satisfies readonly SaltEvidenceValidationIssueCode[];
const PUBLIC_GENERATED_ARTIFACT_KINDS = [
  "pattern-guidance",
  "review-report",
  "validation-report",
] as const satisfies readonly SaltGeneratedArtifactKind[];
type AssertExhaustive<T extends never> = T;
type _AllEvidenceValidationIssueCodesAreDeclared = AssertExhaustive<
  Exclude<
    SaltEvidenceValidationIssueCode,
    (typeof PUBLIC_EVIDENCE_VALIDATION_ISSUE_CODES)[number]
  >
>;
type _AllGeneratedArtifactKindsAreDeclared = AssertExhaustive<
  Exclude<
    SaltGeneratedArtifactKind,
    (typeof PUBLIC_GENERATED_ARTIFACT_KINDS)[number]
  >
>;

const PUBLIC_CREATE_INPUT_SCHEMA = z
  .object({
    query: z
      .string()
      .min(1)
      .max(MAX_QUERY_CHARS)
      .regex(CONTAINS_NON_WHITESPACE)
      .describe("User need, task, flow, or capability to build."),
    solution_type: z
      .enum(["auto", "component", "pattern", "foundation", "token"])
      .optional()
      .describe("Optional solution-family hint."),
    package: z
      .string()
      .max(MAX_PACKAGE_NAME_CHARS)
      .optional()
      .describe("Restrict candidates to a Salt package."),
    status: z
      .enum(STATUSES)
      .optional()
      .describe("Restrict candidates by release status."),
    prefer_stable: z.boolean().optional(),
    a11y_required: z.boolean().optional(),
    include_starter_code: z
      .boolean()
      .optional()
      .describe("Include starter code; defaults to true."),
    resolved_entities: z
      .array(z.string().min(1).max(MAX_REFERENCE_NAME_CHARS))
      .max(PUBLIC_CREATE_RESOLVED_ENTITY_MAX)
      .optional()
      .describe("Canonical entities already resolved for a create rerun."),
    root_dir: z
      .string()
      .max(MAX_PATH_CHARS)
      .optional()
      .describe(
        "Target project or workspace-package root; defaults to the MCP working directory.",
      ),
  })
  .strict()
  .meta({ id: "SaltPublicCreateInput" });
const PUBLIC_CREATE_RERUN_ARGS_SCHEMA = PUBLIC_CREATE_INPUT_SCHEMA;
const PUBLIC_REVIEW_POST_ACTION_SCHEMA = z
  .object({
    kind: z.literal("review"),
    tool: z.literal("review_salt_ui"),
    required_input: z.tuple([z.literal("complete_updated_file")]),
  })
  .strict()
  .meta({ id: "SaltPublicReviewPostAction" });
const PUBLIC_RERUN_POST_ACTION_SCHEMA = z
  .object({
    kind: z.literal("rerun_workflow"),
    tool: z.literal("create_salt_ui"),
    args: PUBLIC_CREATE_RERUN_ARGS_SCHEMA,
  })
  .strict()
  .meta({ id: "SaltPublicRerunPostAction" });
const PUBLIC_POST_ACTION_SCHEMA = z.discriminatedUnion("kind", [
  PUBLIC_REVIEW_POST_ACTION_SCHEMA,
  PUBLIC_RERUN_POST_ACTION_SCHEMA,
]);
const PUBLIC_REVIEW_POST_ACTION_ONLY_SCHEMA =
  PUBLIC_POST_ACTION_SCHEMA.options[0];
const PUBLIC_RERUN_POST_ACTION_ONLY_SCHEMA =
  PUBLIC_POST_ACTION_SCHEMA.options[1];
const PUBLIC_ACTION_COMMON_SHAPE = {
  rule_ids: z.array(z.string()),
};
const PUBLIC_CREATE_TOOL_CALL_ACTION_SCHEMA = z
  .object({
    kind: z.literal("tool_call"),
    tool: z.literal("create_salt_ui"),
    mode: z.literal("exact_name"),
    args: PUBLIC_CREATE_INPUT_SCHEMA,
    post_action: z.null(),
  })
  .extend(PUBLIC_ACTION_COMMON_SHAPE)
  .strict();
const PUBLIC_RETRIEVE_REFERENCE_ARGS_SCHEMA = z.union([
  z
    .object({
      names: REFERENCE_NAMES_SCHEMA,
      entity_type: z.enum(PUBLIC_REFERENCE_ENTITY_TYPES).optional(),
    })
    .strict(),
  z
    .object({
      names: REFERENCE_NAMES_SCHEMA,
      entity_type: z.enum(PUBLIC_REFERENCE_ENTITY_TYPES).optional(),
      include: z.tuple([z.literal("examples")]),
      include_starter_code: z.literal(true),
    })
    .strict(),
]);
const PUBLIC_RETRIEVE_REFERENCE_ACTION_SCHEMA = z
  .object({
    kind: z.literal("retrieve_reference"),
    tool: z.literal("get_salt_reference"),
    args: PUBLIC_RETRIEVE_REFERENCE_ARGS_SCHEMA,
    post_action: PUBLIC_RERUN_POST_ACTION_ONLY_SCHEMA,
  })
  .extend(PUBLIC_ACTION_COMMON_SHAPE)
  .strict();
const PUBLIC_ASK_USER_ACTION_SCHEMA = z
  .object({
    kind: z.literal("ask_user"),
    question: z.string().min(1),
    post_action: z.null(),
  })
  .extend(PUBLIC_ACTION_COMMON_SHAPE)
  .strict();
const PUBLIC_IMPLEMENT_ACTION_SCHEMA = z
  .object({
    kind: z.literal("implement"),
    scope: z.literal("exact_request"),
    post_action: PUBLIC_REVIEW_POST_ACTION_ONLY_SCHEMA,
  })
  .extend(PUBLIC_ACTION_COMMON_SHAPE)
  .strict();
const PUBLIC_COMPLETE_ACTION_SCHEMA = z
  .object({
    kind: z.literal("complete"),
    outcome: z.literal("no_changes_required"),
    post_action: z.null(),
  })
  .extend(PUBLIC_ACTION_COMMON_SHAPE)
  .strict();
const PUBLIC_APPLY_FIXES_ACTION_SCHEMA = z
  .object({
    kind: z.literal("apply_fixes"),
    scope: z.literal("grounded_findings"),
    authorization: z.literal("host_or_user_required"),
    post_action: PUBLIC_REVIEW_POST_ACTION_ONLY_SCHEMA,
  })
  .extend(PUBLIC_ACTION_COMMON_SHAPE)
  .strict();
const PUBLIC_FIX_CONTEXT_ACTION_SCHEMA = z
  .object({
    kind: z.literal("fix_context"),
    tool: z.literal("get_salt_project_context"),
    mode: z.literal("stop_and_fix_context"),
    args: z
      .object({ root_dir: z.string().min(1) })
      .strict()
      .optional(),
    post_action: z.null(),
  })
  .extend(PUBLIC_ACTION_COMMON_SHAPE)
  .strict();
const PUBLIC_CREATE_ACTION_SCHEMA = z.union([
  PUBLIC_CREATE_TOOL_CALL_ACTION_SCHEMA,
  PUBLIC_RETRIEVE_REFERENCE_ACTION_SCHEMA,
  PUBLIC_ASK_USER_ACTION_SCHEMA,
  PUBLIC_IMPLEMENT_ACTION_SCHEMA,
  PUBLIC_FIX_CONTEXT_ACTION_SCHEMA,
]);
const PUBLIC_REVIEW_WORKFLOW_ACTION_SCHEMA = z.discriminatedUnion("kind", [
  PUBLIC_ASK_USER_ACTION_SCHEMA,
  PUBLIC_COMPLETE_ACTION_SCHEMA,
  PUBLIC_APPLY_FIXES_ACTION_SCHEMA,
  PUBLIC_FIX_CONTEXT_ACTION_SCHEMA,
]);
const PUBLIC_MIGRATE_ACTION_SCHEMA = z.discriminatedUnion("kind", [
  PUBLIC_ASK_USER_ACTION_SCHEMA,
  PUBLIC_IMPLEMENT_ACTION_SCHEMA,
  PUBLIC_FIX_CONTEXT_ACTION_SCHEMA,
]);
const PUBLIC_EVIDENCE_ITEM_SCHEMA = z
  .object({
    kind: z.enum(PUBLIC_EVIDENCE_KINDS),
    source: z.enum(["canonical_salt", "project_policy", "heuristic_fallback"]),
    entity: z.string().optional(),
    field: z.string().optional(),
    source_urls: z.array(z.string()),
    summary: z.string().optional(),
  })
  .strict();
const PUBLIC_EVIDENCE_SIGNAL_COUNTS_SCHEMA = z
  .object({
    regions: z.number().int().nonnegative(),
    actions: z.number().int().nonnegative(),
    states: z.number().int().nonnegative(),
    notes: z.number().int().nonnegative(),
  })
  .strict();
const PUBLIC_EVIDENCE_INPUT_CONTEXT_SCHEMA = z
  .object({
    source_outline_provided: z.boolean().optional(),
    source_outline_signal_counts:
      PUBLIC_EVIDENCE_SIGNAL_COUNTS_SCHEMA.optional(),
    derived_outline_available: z.boolean().optional(),
    derived_outline_signal_counts:
      PUBLIC_EVIDENCE_SIGNAL_COUNTS_SCHEMA.optional(),
    visual_input_count: z.number().int().nonnegative().optional(),
    visual_input_kinds: z.array(z.string()).optional(),
    source_outline_summary: z.string().optional(),
  })
  .strict();
const PUBLIC_EVIDENCE_VALIDATION_ISSUE_SCHEMA = z
  .object({
    code: z.enum(PUBLIC_EVIDENCE_VALIDATION_ISSUE_CODES),
    message: z.string(),
    path: z.string(),
  })
  .strict();
const PUBLIC_EVIDENCE_SURFACE_GATE_SCHEMA = z
  .object({
    status: z.enum(["validated", "unsupported"]),
    validation_issues: z.array(PUBLIC_EVIDENCE_VALIDATION_ISSUE_SCHEMA),
    missing: z.array(z.string()),
    unsupported_claim_count: z.number().int().nonnegative(),
    artifact_id: z.string(),
    artifact_kind: z.enum(PUBLIC_GENERATED_ARTIFACT_KINDS),
  })
  .strict();
const PUBLIC_EVIDENCE_SCHEMA = z
  .object({
    status: z.enum(["complete", "partial", "missing"]),
    items: z.array(PUBLIC_EVIDENCE_ITEM_SCHEMA),
    source_urls: z.array(z.string()),
    missing: z.array(z.string()),
    heuristic_fallback: z.boolean(),
    input_context: PUBLIC_EVIDENCE_INPUT_CONTEXT_SCHEMA.optional(),
    surface_gate: PUBLIC_EVIDENCE_SURFACE_GATE_SCHEMA.optional(),
    unsupported_claim_count: z.number().int().nonnegative().optional(),
    validation_issue_count: z.number().int().nonnegative().optional(),
  })
  .strict();
const PUBLIC_STARTER_SNIPPET_SCHEMA = z
  .object({
    label: z.string().min(1),
    language: z.enum(["tsx", "css"]),
    code: z.string().min(1),
    notes: z.array(z.string()),
    source_urls: z.array(z.string()),
  })
  .strict();
const PUBLIC_REVIEW_FINDING_SCHEMA = z
  .object({
    title: z.string().min(1),
    message: z.string().min(1),
    severity: z.string().nullable(),
    rule: z.string().nullable(),
    source_urls: z.array(z.string()),
  })
  .strict();
const PUBLIC_REVIEW_FIX_SCHEMA = z
  .object({
    rule_id: z.string().min(1).nullable(),
    title: z.string().min(1),
    recommendation: z.string().min(1),
    safety: z.enum(["deterministic", "manual_review"]),
    source_urls: z.array(z.string()),
  })
  .strict();
const PUBLIC_MIGRATION_TRANSLATION_SCHEMA = z
  .object({
    source_model_ref: z.string().min(1),
    label: z.string().min(1),
    implementation: z
      .object({
        readiness: z.enum(["high", "medium", "review"]),
        next_action: z.string().min(1),
        validation_step: z.string().min(1),
      })
      .strict(),
    salt_target: z
      .object({
        name: z.string().min(1).nullable(),
        solution_type: z
          .enum(["component", "pattern", "foundation"])
          .nullable(),
        why: z.string().min(1),
        docs: z.array(z.string()),
      })
      .strict(),
  })
  .strict();
const PUBLIC_STARTER_GUIDANCE_SCHEMA = z
  .object({
    plan: z.array(z.string().min(1)).max(12),
    snippets: z.array(PUBLIC_STARTER_SNIPPET_SCHEMA).max(3),
  })
  .strict();
const PUBLIC_CREATE_GUIDANCE_SCHEMA = z
  .object({
    kind: z.literal("create"),
    decision: z
      .object({
        name: z.string().min(1).nullable(),
        why: z.string().min(1),
        solution_type: z.enum(["component", "pattern", "foundation", "token"]),
      })
      .strict(),
    starter_guidance: PUBLIC_STARTER_GUIDANCE_SCHEMA,
    review_targets: PUBLIC_CREATE_REVIEW_TARGETS_SCHEMA,
  })
  .strict();
const PUBLIC_REVIEW_GUIDANCE_SCHEMA = z
  .object({
    kind: z.literal("review"),
    findings: z.array(PUBLIC_REVIEW_FINDING_SCHEMA).max(12),
    fixes: z.array(PUBLIC_REVIEW_FIX_SCHEMA).max(12),
  })
  .strict();
const PUBLIC_MIGRATE_GUIDANCE_SCHEMA = z
  .object({
    kind: z.literal("migrate"),
    translations: z.array(PUBLIC_MIGRATION_TRANSLATION_SCHEMA).max(12),
    migration_plan: z.array(z.string().min(1)).max(12),
    starter_guidance: PUBLIC_STARTER_GUIDANCE_SCHEMA,
    post_migration_verification: z
      .object({
        source_checks: z.array(z.string().min(1)).max(8),
        runtime_checks: z.array(z.string().min(1)).max(8),
        preserve_checks: z.array(z.string().min(1)).max(8),
        confirmation_checks: z.array(z.string().min(1)).max(8),
        suggested_workflow: z.literal("review_salt_ui"),
        suggested_command: z.string().min(1),
      })
      .strict(),
    review_targets: PUBLIC_MIGRATE_REVIEW_TARGETS_SCHEMA,
  })
  .strict();
const SUPPORT_FOLLOW_UPS_SCHEMA = UNKNOWN_RECORD_ARRAY_SCHEMA.optional();
const GET_SALT_REFERENCE_OUTPUT_SCHEMA = z
  .object({
    guidance_boundary: UNKNOWN_RECORD_SCHEMA.optional(),
    decision: z
      .object({
        status: z.enum(["results", "partial", "not_found", "empty"]),
        why: z.string().min(1),
      })
      .strict(),
    requested_count: z.number().int().nonnegative(),
    found_count: z.number().int().nonnegative(),
    not_found_count: z.number().int().nonnegative(),
    ambiguous_count: z.number().int().nonnegative(),
    results: z.array(
      z
        .object({
          name: z.string(),
          result: UNKNOWN_RECORD_SCHEMA,
        })
        .strict(),
    ),
    unresolved_names: z.array(z.string()),
    suggested_follow_ups: SUPPORT_FOLLOW_UPS_SCHEMA.optional(),
    next_step: z.string().optional(),
  })
  .passthrough();
const MCP_WORKFLOW_OUTPUT_COMMON_SHAPE = {
  contract: z.literal("salt_workflow_v1"),
  status: z.enum(PUBLIC_WORKFLOW_STATUSES),
  request: z
    .object({
      entity: z.string().optional(),
      resolved_entity: z.string().nullable().optional(),
      match_status: z.enum(PUBLIC_MATCH_STATUSES).optional(),
      exact_match_required: z.boolean().optional(),
      full_request_evidence_complete: z.boolean().optional(),
    })
    .strict(),
  safety: z
    .object({
      canonical_complete: z.boolean(),
      exact_request_safe: z.boolean(),
      blocking_reasons: z.array(z.string()),
    })
    .strict(),
  questions: z.array(z.string()),
  evidence: PUBLIC_EVIDENCE_SCHEMA,
  internal_limitations: z
    .object({
      unsupported_claim_count: z.number().int().nonnegative(),
      unsupported_rule_kinds: z.array(z.string()),
    })
    .strict(),
  summary: z.string().min(1),
};
const CHOOSE_OUTPUT_SCHEMA = z
  .object({
    ...MCP_WORKFLOW_OUTPUT_COMMON_SHAPE,
    workflow: z.literal("create"),
    action: PUBLIC_CREATE_ACTION_SCHEMA,
    guidance: PUBLIC_CREATE_GUIDANCE_SCHEMA,
  })
  .strict();
const ANALYZE_OUTPUT_SCHEMA = z
  .object({
    ...MCP_WORKFLOW_OUTPUT_COMMON_SHAPE,
    workflow: z.literal("review"),
    action: PUBLIC_REVIEW_WORKFLOW_ACTION_SCHEMA,
    guidance: PUBLIC_REVIEW_GUIDANCE_SCHEMA,
  })
  .strict();
const TRANSLATE_OUTPUT_SCHEMA = z
  .object({
    ...MCP_WORKFLOW_OUTPUT_COMMON_SHAPE,
    workflow: z.literal("migrate"),
    action: PUBLIC_MIGRATE_ACTION_SCHEMA,
    guidance: PUBLIC_MIGRATE_GUIDANCE_SCHEMA,
  })
  .strict();

type ToolSchema = Record<string, z.ZodType> | z.ZodType;

interface ToolAnnotations {
  readOnlyHint?: boolean;
  destructiveHint?: boolean;
  idempotentHint?: boolean;
  openWorldHint?: boolean;
}

export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: ToolSchema;
  outputSchema?: ToolSchema;
  annotations?: ToolAnnotations;
  execute: (registry: SaltRegistry, args: object) => Promise<unknown> | unknown;
}

async function resolveOrCollectProjectContext(
  registry: SaltRegistry,
  options: { rootDir?: string } = {},
) {
  // Manifest-only workflow collection is deliberately fresh on every turn.
  // Repo policy and its import targets are editable workflow inputs; keeping
  // a cross-turn snapshot can make removed or newly added policy look ready.
  return collectSaltWorkflowContextBundle(
    registry,
    options.rootDir ? { root_dir: options.rootDir } : {},
  );
}

function defineTool<Args extends object>(
  definition: Omit<ToolDefinition, "execute"> & {
    execute: (registry: SaltRegistry, args: Args) => Promise<unknown> | unknown;
  },
): ToolDefinition {
  return definition as ToolDefinition;
}

function withBundledRegistryContext(
  registry: SaltRegistry,
  value: unknown,
): unknown {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return value;
  }

  return {
    ...value,
    registry_context: {
      source: "bundled_package",
      registry_version: registry.version,
      registry_generated_at: registry.generated_at,
      note: "Reference evidence comes from the registry bundled with this @salt-ds/mcp package, not directly from the consumer repo's installed Salt package files.",
    },
  };
}

const DEFAULT_TOOL_ORDER = [
  "get_salt_project_context",
  "get_salt_reference",
  "review_salt_ui",
  "create_salt_ui",
  "migrate_to_salt",
] as const;

const ALL_TOOL_DEFINITIONS: readonly ToolDefinition[] = [
  defineTool<{ root_dir?: string; include_policy_diagnostics?: boolean }>({
    name: "get_salt_project_context",
    description:
      "Diagnose framework, Salt packages, policy, install health, and repo-root resolution. Workflows resolve context themselves.",
    inputSchema: z
      .object({
        root_dir: z
          .string()
          .max(MAX_PATH_CHARS)
          .optional()
          .describe(
            "Target project or workspace-package root; defaults to the MCP working directory.",
          ),
        include_policy_diagnostics: z
          .boolean()
          .optional()
          .describe(
            "Include stack-layer and shared-pack diagnostics; defaults to false.",
          ),
      })
      .strict(),
    outputSchema: CONTEXT_OUTPUT_SCHEMA,
    annotations: READ_ONLY_WORKFLOW_TOOL_ANNOTATIONS,
    execute: async (registry, args) => {
      const context = await collectSaltProjectContextData(registry, args);
      return toSaltProjectContextResult(context);
    },
  }),
  defineTool<z.infer<typeof GET_SALT_REFERENCE_INPUT_SCHEMA>>({
    name: "get_salt_reference",
    description:
      "Resolve or compare up to three Salt entities by exact entity name (for example Button). Returns a canonical entity record with component or pattern details, props and prop schema, examples, and sample implementation code; optionally accessibility, deprecations, or starter code.",
    inputSchema: GET_SALT_REFERENCE_INPUT_SCHEMA,
    outputSchema: GET_SALT_REFERENCE_OUTPUT_SCHEMA,
    annotations: READ_ONLY_WORKFLOW_TOOL_ANNOTATIONS,
    execute: (registry, args) => {
      return withBundledRegistryContext(
        registry,
        getSaltEntities(registry, {
          names: args.names,
          entity_type: args.entity_type,
          allowed_entity_types: [...PUBLIC_REFERENCE_ENTITY_TYPES],
          include: args.include,
          include_starter_code: args.include_starter_code,
          max_results: 5,
        }),
      );
    },
  }),
  defineTool<Parameters<typeof migrateToSalt>[1] & { root_dir?: string }>({
    name: "migrate_to_salt",
    description:
      "Convert or migrate non-Salt, Material UI, Chakra UI, mockup, screen, code, or outline into source-backed Salt components and patterns. Returns migration, starter, and verification guidance.",
    inputSchema: z
      .object({
        code: z
          .string()
          .max(MAX_SOURCE_CODE_CHARS)
          .optional()
          .describe("Optional source UI code to translate."),
        query: z
          .string()
          .min(1)
          .max(MAX_QUERY_CHARS)
          .regex(CONTAINS_NON_WHITESPACE)
          .describe("Required migration goal or source UI description."),
        source_outline: z
          .object({
            regions: OUTLINE_ENTRIES_SCHEMA.optional(),
            actions: OUTLINE_ENTRIES_SCHEMA.optional(),
            states: OUTLINE_ENTRIES_SCHEMA.optional(),
            notes: OUTLINE_ENTRIES_SCHEMA.optional(),
          })
          .strict()
          .optional()
          .describe("Structured UI outline with regions, actions, and states."),
        package: z
          .string()
          .max(MAX_PACKAGE_NAME_CHARS)
          .optional()
          .describe("Restrict targets to a Salt package."),
        prefer_stable: z.boolean().optional(),
        a11y_required: z.boolean().optional(),
        include_starter_code: z
          .boolean()
          .optional()
          .describe("Include starter code; defaults to true."),
        root_dir: z
          .string()
          .max(MAX_PATH_CHARS)
          .optional()
          .describe(
            "Target project or workspace-package root; defaults to the MCP working directory.",
          ),
      })
      .strict(),
    outputSchema: TRANSLATE_OUTPUT_SCHEMA,
    annotations: READ_ONLY_WORKFLOW_TOOL_ANNOTATIONS,
    execute: async (registry, args) => {
      const { root_dir, ...workflowArgs } = args;
      const { context: projectContext, policyInspection } =
        await resolveOrCollectProjectContext(registry, {
          rootDir: root_dir,
        });
      const contextChecked =
        projectContext.summary.context_health.repo_specific_workflows_ready;
      return withTranslateWorkflowGuidance(
        registry,
        migrateToSalt(registry, {
          ...workflowArgs,
          view: "compact",
        }),
        {
          source_outline: workflowArgs.source_outline,
          context_checked: contextChecked,
          context_retry_with_root_dir:
            projectContext.summary.retry_with.root_dir,
          project_policy: contextChecked ? policyInspection.artifact : null,
        },
      );
    },
  }),
  defineTool<PublicCreateRerunArgs>({
    name: "create_salt_ui",
    description:
      "Generate or scaffold a new Salt UI such as a dashboard, form, toolbar, action menu, or layout. Chooses the best source-backed component or pattern from a broad request.",
    inputSchema: PUBLIC_CREATE_INPUT_SCHEMA,
    outputSchema: CHOOSE_OUTPUT_SCHEMA,
    annotations: READ_ONLY_WORKFLOW_TOOL_ANNOTATIONS,
    execute: async (registry, args) => {
      const { root_dir, ...workflowArgs } = args;
      const { context: projectContext, policyInspection } =
        await resolveOrCollectProjectContext(registry, {
          rootDir: root_dir,
        });
      const contextChecked =
        projectContext.summary.context_health.repo_specific_workflows_ready;
      const projectPolicy = contextChecked ? policyInspection.artifact : null;
      const createRerunArgs: PublicCreateRerunArgs = {
        ...workflowArgs,
        root_dir: projectContext.root_dir,
      };
      return withChooseWorkflowGuidance(
        registry,
        createSaltUi(registry, {
          ...workflowArgs,
          view: "compact",
          repo_has_theme_provider: contextChecked
            ? Boolean(projectPolicy?.themeDefaults?.provider)
            : undefined,
        }),
        {
          create_rerun_args: createRerunArgs,
          context_checked: contextChecked,
          context_retry_with_root_dir:
            projectContext.summary.retry_with.root_dir,
          project_policy: projectPolicy,
        },
      );
    },
  }),
  defineTool<Parameters<typeof reviewSaltUi>[1] & { root_dir?: string }>({
    name: "review_salt_ui",
    description:
      "Review React and Salt source for API misuse, accessibility, composition, deprecated props, migration risk, and source-backed fixes. Semantic only: run repo typecheck and runtime verification separately. Defaults to production fidelity.",
    inputSchema: z
      .object({
        code: z
          .string()
          .max(MAX_SOURCE_CODE_CHARS)
          .describe(
            "Complete current contents of one source file to analyze (maximum 524,288 characters). Review separate files independently; do not submit partial chunks.",
          ),
        framework: z.string().max(128).optional(),
        fidelity: z.enum(["production", "prototype"]).optional(),
        package_version: z
          .string()
          .max(128)
          .optional()
          .describe("Installed Salt version for validation."),
        from_version: z
          .string()
          .max(128)
          .optional()
          .describe("Source version for migration suggestions."),
        to_version: z
          .string()
          .max(128)
          .optional()
          .describe("Target version for migration suggestions."),
        max_issues: z.number().int().min(1).max(12).optional(),
        expected_targets: REVIEW_EXPECTED_TARGETS_SCHEMA.optional().describe(
          "Source-backed targets from create or migrate guidance.",
        ),
        root_dir: z
          .string()
          .max(MAX_PATH_CHARS)
          .optional()
          .describe(
            "Active project or package root; in a monorepo use the target workspace package. Defaults to the MCP working directory.",
          ),
      })
      .strict(),
    outputSchema: ANALYZE_OUTPUT_SCHEMA,
    annotations: READ_ONLY_WORKFLOW_TOOL_ANNOTATIONS,
    execute: async (registry, args) => {
      const { root_dir, ...workflowArgs } = args;
      const { context: projectContext, policyInspection } =
        await resolveOrCollectProjectContext(registry, {
          rootDir: root_dir,
        });
      const contextChecked =
        projectContext.summary.context_health.repo_specific_workflows_ready;
      const detectedPackageVersion = deriveComparableSaltVersion({
        declaredVersion: projectContext.salt.package_version,
        resolvedVersions:
          projectContext.salt.installation.version_health.resolved_versions,
      });
      return withAnalyzeWorkflowGuidance(
        registry,
        reviewSaltUi(
          registry,
          {
            ...workflowArgs,
            package_version:
              workflowArgs.package_version ??
              detectedPackageVersion ??
              undefined,
            view: "compact",
          },
          {
            approved_wrappers: contextChecked
              ? policyInspection.artifact?.approvedWrapperDetails
              : undefined,
          },
        ),
        {
          code: workflowArgs.code,
          expected_targets: workflowArgs.expected_targets,
          project_policy: contextChecked ? policyInspection.artifact : null,
          context_checked: contextChecked,
          root_dir: contextChecked
            ? projectContext.root_dir
            : projectContext.summary.retry_with.root_dir,
        },
      );
    },
  }),
];

export const TOOL_DEFINITIONS: readonly ToolDefinition[] =
  DEFAULT_TOOL_ORDER.map((name) => {
    const definition = ALL_TOOL_DEFINITIONS.find(
      (candidate) => candidate.name === name,
    );
    if (!definition) {
      throw new Error(`Missing Salt MCP tool definition: ${name}`);
    }
    return definition;
  });
