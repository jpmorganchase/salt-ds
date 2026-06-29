import { getSaltEntities } from "@salt-ds/semantic-core/tools/getSaltEntities";
import { getSaltExamples } from "@salt-ds/semantic-core/tools/getSaltExamples";
import {
  createSaltUi,
  migrateToSalt,
  reviewSaltUi,
} from "@salt-ds/semantic-core/tools/index";
import type { SaltRegistry } from "@salt-ds/semantic-core/types";
import * as z from "zod/v4";
import {
  buildSaltProjectContextId,
  collectSaltProjectContextData,
  isSaltProjectContextReadyForRepoAwareWork,
  type SaltProjectContextData,
  toSaltProjectContextResult,
} from "./projectContext.js";
import { loadWorkflowProjectPolicyArtifactForContext } from "./projectPolicy.js";
import {
  withAnalyzeWorkflowGuidance,
  withChooseWorkflowGuidance,
  withTranslateWorkflowGuidance,
} from "./workflowOutputs.js";

const STATUSES = ["stable", "beta", "lab", "deprecated"] as const;
const VIEWS = ["compact", "full"] as const;
const INCLUDE_SECTIONS = [
  "examples",
  "props",
  "tokens",
  "accessibility",
  "deprecations",
] as const;
const V1_REFERENCE_ENTITY_TYPES = [
  "component",
  "pattern",
  "foundation",
  "token",
  "guide",
  "page",
  "package",
] as const;
const PUBLIC_WORKFLOW_TOOL_IDS = [
  "get_salt_project_context",
  "review_salt_ui",
  "create_salt_ui",
  "migrate_to_salt",
] as const;
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

const WORKFLOW_COMPOSITION_CONTRACT_SCHEMA = z.object({
  primary_target: z.object({
    solution_type: z.enum(["component", "pattern", "foundation", "token"]),
    name: z.string().nullable(),
  }),
  expected_patterns: z.array(z.string()),
  expected_components: z.array(z.string()),
  slots: z.array(
    z.object({
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
    }),
  ),
  avoid: z.array(z.string()),
  source_urls: z.array(z.string()),
});

const REVIEW_EXPECTED_TARGETS_SCHEMA = z.object({
  components: z.array(z.string()).optional(),
  patterns: z.array(z.string()).optional(),
  composition_contract:
    WORKFLOW_COMPOSITION_CONTRACT_SCHEMA.nullable().optional(),
  source: z.enum(["create_report", "workflow_context"]).optional(),
});

const TOOL_SOURCE_SCHEMA = z.object({
  original: z.string(),
  resolved: z.string(),
  kind: z.enum(["site", "external", "repo"]),
});

const CONTEXT_SALT_INSTALLATION_SCHEMA = z.object({
  node_modules_roots: z.array(z.string()),
  resolved_packages: z.array(
    z.object({
      name: z.string(),
      declared_version: z.string(),
      resolved_version: z.string().nullable(),
      resolved_path: z.string().nullable(),
      satisfies_declared_version: z.boolean().nullable(),
    }),
  ),
  installed_packages: z.array(
    z.object({
      name: z.string(),
      version: z.string(),
      path: z.string(),
    }),
  ),
  version_health: z.object({
    declared_versions: z.array(z.string()),
    resolved_versions: z.array(z.string()),
    installed_versions: z.array(z.string()),
    multiple_declared_versions: z.boolean(),
    multiple_resolved_versions: z.boolean(),
    multiple_installed_versions: z.boolean(),
    mismatched_packages: z.array(
      z.object({
        name: z.string(),
        declared_version: z.string(),
        resolved_version: z.string().nullable(),
        resolved_path: z.string().nullable(),
      }),
    ),
    issues: z.array(z.string()),
  }),
  inspection: z.object({
    package_manager: z.string(),
    strategy: z.enum(["package-manager-command", "node-modules-scan"]),
    status: z.enum(["succeeded", "failed", "fallback"]),
    list_command: z.string().nullable(),
    discovered_versions: z.array(z.string()),
    error: z.string().nullable(),
    package_layout: z.enum(["node-modules", "pnp", "unknown"]),
    limitations: z.array(z.string()),
    manifest_override_fields: z.array(z.string()),
  }),
  remediation: z.object({
    explain_command: z.string().nullable(),
    dedupe_command: z.string().nullable(),
    reinstall_command: z.string().nullable(),
  }),
  workspace: z.object({
    kind: z.enum(["single-package", "workspace-root", "workspace-package"]),
    package_root: z.string(),
    workspace_root: z.string().nullable(),
    issue_source_hint: z.enum([
      "none",
      "package-local",
      "workspace-root",
      "mixed",
    ]),
    workspace_salt_packages: z.array(
      z.object({
        name: z.string(),
        version: z.string(),
      }),
    ),
    workspace_issues: z.array(z.string()),
  }),
  duplicate_packages: z.array(
    z.object({
      name: z.string(),
      versions: z.array(z.string()),
      paths: z.array(z.string()),
      package_count: z.number().int().positive(),
      version_count: z.number().int().positive(),
    }),
  ),
  health_summary: z.object({
    health: z.enum(["pass", "warn", "fail"]),
    recommended_action: z.enum([
      "none",
      "inspect-dependency-drift",
      "dedupe-salt-install",
      "reinstall-dependencies",
    ]),
    blocking_workflows: z.array(z.enum(["review", "migrate"])),
    reasons: z.array(z.string()),
  }),
});

const CONTEXT_POLICY_COMPATIBILITY_SCHEMA = z.object({
  status: z.enum([
    "compatible",
    "unsupported",
    "missing-range",
    "unknown-current-version",
    "invalid-range",
  ]),
  current_salt_version: z.string().nullable(),
  checked_version: z.string().nullable(),
  reason: z.string(),
});

const CONTEXT_RESULT_SCHEMA = z.object({
  context_id: z.string().nullable(),
  root_dir: z.string(),
  resolution: z.object({
    status: z.enum(["resolved", "fallback", "needs_explicit_root", "mismatch"]),
    root_source: z.enum(["explicit_input", "process_cwd"]),
    quality: z.enum(["ready", "needs_explicit_root"]),
    reason: z.string().nullable(),
  }),
  package_json_path: z.string().nullable(),
  environment: z.object({
    os: z.string(),
    node_version: z.string(),
    package_manager: z.string(),
  }),
  framework: z.object({
    name: z.enum(["next", "vite-react", "vite", "react", "unknown"]),
    evidence: z.array(z.string()),
  }),
  workspace: z.object({
    kind: z.enum([
      "single-package",
      "workspace-root",
      "workspace-package",
      "unknown",
    ]),
    workspace_root: z.string().nullable(),
  }),
  salt: z.object({
    packages: z.array(
      z.object({
        name: z.string(),
        version: z.string(),
      }),
    ),
    package_version: z.string().nullable(),
    installation: CONTEXT_SALT_INSTALLATION_SCHEMA,
  }),
  repo_signals: z.object({
    storybook_detected: z.boolean(),
    app_runtime_detected: z.boolean(),
    salt_team_config_found: z.boolean(),
    salt_stack_config_found: z.boolean(),
  }),
  repo_instructions: z.object({
    path: z.string().nullable(),
    filename: z.enum(["AGENTS.md", "CLAUDE.md"]).nullable(),
  }),
  policy: z.object({
    team_config_path: z.string().nullable(),
    stack_config_path: z.string().nullable(),
    mode: z.enum(["none", "team", "stack"]),
    approved_wrappers: z.array(z.string()),
    stack_layers: z.array(
      z.object({
        id: z.string(),
        scope: z.enum(["line_of_business", "team", "repo", "other"]),
        source_type: z.enum(["file", "package"]),
        source: z.string(),
        optional: z.boolean(),
        resolution: z.object({
          status: z.enum(["resolved", "missing", "unreadable", "invalid"]),
          resolved_path: z.string().nullable(),
          package_name: z.string().nullable(),
          export_name: z.string().nullable(),
          version: z.string().nullable(),
          package_version: z.string().nullable(),
          conventions_version: z.string().nullable(),
          contract: z.string().nullable(),
          project: z.string().nullable(),
          pack_id: z.string().nullable(),
          supported_salt_range: z.string().nullable(),
          compatibility: CONTEXT_POLICY_COMPATIBILITY_SCHEMA.nullable(),
          reason: z.string().nullable(),
        }),
      }),
    ),
    shared_conventions: z.object({
      enabled: z.boolean(),
      pack_count: z.number().int().nonnegative(),
      packs: z.array(z.string()),
      pack_details: z.array(
        z.object({
          id: z.string(),
          source: z.string(),
          package_name: z.string().nullable(),
          export_name: z.string().nullable(),
          version: z.string().nullable(),
          package_version: z.string().nullable(),
          conventions_version: z.string().nullable(),
          pack_id: z.string().nullable(),
          supported_salt_range: z.string().nullable(),
          status: z.enum(["resolved", "missing", "unreadable", "invalid"]),
          compatibility: CONTEXT_POLICY_COMPATIBILITY_SCHEMA.nullable(),
          resolved_path: z.string().nullable(),
          reason: z.string().nullable(),
        }),
      ),
    }),
  }),
  imports: z.object({
    tsconfig_path: z.string().nullable(),
    aliases: z.array(
      z.object({
        alias: z.string(),
        targets: z.array(z.string()),
      }),
    ),
  }),
  runtime: z.object({
    detected_targets: z.array(
      z.object({
        label: z.enum(["storybook", "app-runtime"]),
        url: z.string(),
        source: z.enum(["detected-default", "detected-script"]),
      }),
    ),
  }),
  transport: z.object({
    canonical_transport: z.literal("mcp"),
    registry_version: z.string(),
    registry_generated_at: z.string(),
  }),
  workflows: z.object({
    create: z.boolean(),
    review: z.boolean(),
    migrate: z.boolean(),
    runtime_evidence: z.boolean(),
  }),
});

const CONTEXT_WORKFLOW_ENVELOPE_SCHEMA = z.object({
  workflow: z.object({
    id: z.literal("get_salt_project_context"),
  }),
  result: CONTEXT_RESULT_SCHEMA,
  artifacts: z.object({
    summary: z.object({
      recommended_next_tool: z.enum(CONTEXT_NEXT_TOOL_IDS).nullable(),
      policy_note: z.object({
        status: z.enum(["declared", "not_declared", "not_applicable"]),
        reason: z.string().nullable(),
        next_tool_after_policy: z.enum(CONTEXT_NEXT_TOOL_IDS).nullable(),
      }),
      reasons: z.array(z.string()),
      context_health: z.object({
        resolution_status: z.enum([
          "resolved",
          "fallback",
          "needs_explicit_root",
          "mismatch",
        ]),
        trusted: z.boolean(),
        repo_specific_workflows_ready: z.boolean(),
        reason: z.string().nullable(),
      }),
      retry_with: z.object({
        root_dir: z.string().nullable(),
        context_id: z.string().nullable(),
      }),
    }),
    notes: z.array(z.string()),
  }),
  sources: z.array(TOOL_SOURCE_SCHEMA),
});

const REVIEW_RESUME_OUTPUT_SCHEMA = z
  .object({
    contract: z.literal("salt_review_resume_v1"),
    status: z.enum(["ready", "stale", "unsupported", "invalid"]),
    report_path: z.string().min(1),
    reusable_evidence_ref_ids: z.array(z.string().min(1)),
    unsupported_claim_ids: z.array(z.string().min(1)),
    next_command: z.string().min(1),
    missing: z.array(z.string().min(1)),
  })
  .strict();

const REVIEW_REPORT_VALIDATION_OUTPUT_SCHEMA = z
  .object({
    contract: z.literal("salt_review_report_validation_v1"),
    status: z.enum(["current", "stale", "unsupported", "invalid"]),
    current: z.boolean(),
    supported: z.boolean(),
    report_path: z.string().min(1),
    registry: z
      .object({
        version: z.string().nullable(),
        hash: z.string().nullable(),
        generated_at: z.string().nullable(),
        current_version: z.string().nullable(),
        current_hash: z.string().nullable(),
        current_generated_at: z.string().nullable(),
      })
      .strict(),
    validation_issues: z.array(
      z
        .object({
          code: z.string().min(1),
          message: z.string().min(1),
          path: z.string().min(1),
        })
        .strict(),
    ),
    unsupported_claim_count: z.number().int().nonnegative(),
    mismatches: z.array(z.string().min(1)),
    missing: z.array(z.string().min(1)),
    resume: REVIEW_RESUME_OUTPUT_SCHEMA,
  })
  .strict();

const CONTEXT_OUTPUT_SCHEMA = CONTEXT_WORKFLOW_ENVELOPE_SCHEMA;

const PUBLIC_ACTION_KINDS = [
  "tool_call",
  "retrieve_entity",
  "retrieve_examples",
  "ask_user",
  "install_dependencies",
  "implement",
  "complete",
  "review",
  "rerun_workflow",
  "fix_context",
] as const;
const PUBLIC_WORKFLOW_IDS = ["create", "review", "migrate"] as const;
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

const PUBLIC_ARGS_SCHEMA = z.record(z.string(), z.unknown());
const PUBLIC_MCP_HINT_SCHEMA = z.object({
  tool: z.string().min(1),
  args: PUBLIC_ARGS_SCHEMA,
});
const PUBLIC_ACTION_HINTS_SHAPE = {
  cli: z.string().min(1).optional(),
  mcp: PUBLIC_MCP_HINT_SCHEMA.optional(),
};
const PUBLIC_TOOL_CALL_STEP_SCHEMA = z
  .object({
    kind: z.literal("tool_call"),
    tool: z.enum([
      "get_salt_project_context",
      "get_salt_reference",
      "create_salt_ui",
      "review_salt_ui",
      "migrate_to_salt",
    ]),
    mode: z.enum([
      "exact_name",
      "compare_named",
      "broad_query",
      "stop_and_fix_context",
    ]),
    args: PUBLIC_ARGS_SCHEMA,
  })
  .extend(PUBLIC_ACTION_HINTS_SHAPE);
const PUBLIC_RETRIEVE_ENTITY_STEP_SCHEMA = z
  .object({
    kind: z.literal("retrieve_entity"),
    tool: z.enum(["get_salt_reference", "create_salt_ui"]),
    args: PUBLIC_ARGS_SCHEMA,
  })
  .extend(PUBLIC_ACTION_HINTS_SHAPE);
const PUBLIC_RETRIEVE_EXAMPLES_STEP_SCHEMA = z
  .object({
    kind: z.literal("retrieve_examples"),
    tool: z.enum(["get_salt_reference", "create_salt_ui"]),
    args: PUBLIC_ARGS_SCHEMA,
  })
  .extend(PUBLIC_ACTION_HINTS_SHAPE);
const PUBLIC_ASK_USER_STEP_SCHEMA = z
  .object({
    kind: z.literal("ask_user"),
    question: z.string().min(1),
  })
  .extend(PUBLIC_ACTION_HINTS_SHAPE);
const PUBLIC_INSTALL_DEPENDENCIES_STEP_SCHEMA = z
  .object({
    kind: z.literal("install_dependencies"),
    package_manager: z.string().min(1),
    packages: z.array(z.string().min(1)).min(1),
  })
  .extend(PUBLIC_ACTION_HINTS_SHAPE);
const PUBLIC_IMPLEMENT_STEP_SCHEMA = z
  .object({
    kind: z.literal("implement"),
    scope: z.literal("exact_request"),
  })
  .extend(PUBLIC_ACTION_HINTS_SHAPE);
const PUBLIC_COMPLETE_STEP_SCHEMA = z
  .object({
    kind: z.literal("complete"),
    outcome: z.literal("no_changes_required"),
  })
  .extend(PUBLIC_ACTION_HINTS_SHAPE);
const PUBLIC_REVIEW_STEP_SCHEMA = z
  .object({
    kind: z.literal("review"),
    tool: z.literal("review_salt_ui"),
    args: PUBLIC_ARGS_SCHEMA.optional(),
  })
  .extend(PUBLIC_ACTION_HINTS_SHAPE);
const PUBLIC_RERUN_WORKFLOW_STEP_SCHEMA = z
  .object({
    kind: z.literal("rerun_workflow"),
    tool: z.enum(["create_salt_ui", "review_salt_ui", "migrate_to_salt"]),
    args: PUBLIC_ARGS_SCHEMA,
  })
  .extend(PUBLIC_ACTION_HINTS_SHAPE);
const PUBLIC_FIX_CONTEXT_STEP_SCHEMA = z
  .object({
    kind: z.literal("fix_context"),
    tool: z.literal("get_salt_project_context"),
    mode: z.literal("stop_and_fix_context"),
    args: PUBLIC_ARGS_SCHEMA.optional(),
  })
  .extend(PUBLIC_ACTION_HINTS_SHAPE);
const PUBLIC_NEXT_STEP_SCHEMAS = [
  PUBLIC_TOOL_CALL_STEP_SCHEMA,
  PUBLIC_RETRIEVE_ENTITY_STEP_SCHEMA,
  PUBLIC_RETRIEVE_EXAMPLES_STEP_SCHEMA,
  PUBLIC_ASK_USER_STEP_SCHEMA,
  PUBLIC_INSTALL_DEPENDENCIES_STEP_SCHEMA,
  PUBLIC_IMPLEMENT_STEP_SCHEMA,
  PUBLIC_COMPLETE_STEP_SCHEMA,
  PUBLIC_REVIEW_STEP_SCHEMA,
  PUBLIC_RERUN_WORKFLOW_STEP_SCHEMA,
  PUBLIC_FIX_CONTEXT_STEP_SCHEMA,
] as const;
const PUBLIC_NEXT_STEP_SCHEMA = z.discriminatedUnion("kind", [
  ...PUBLIC_NEXT_STEP_SCHEMAS,
]);
const PUBLIC_POST_ACTION_SCHEMA = z
  .object({
    kind: z.literal("review"),
    tool: z.literal("review_salt_ui"),
    args: PUBLIC_ARGS_SCHEMA.optional(),
  })
  .extend(PUBLIC_ACTION_HINTS_SHAPE);
const PUBLIC_ACTION_METADATA_SHAPE = {
  rule_ids: z.array(z.string()),
  post_action: PUBLIC_POST_ACTION_SCHEMA.nullable(),
};
const PUBLIC_ACTION_SCHEMA = z.discriminatedUnion("kind", [
  PUBLIC_TOOL_CALL_STEP_SCHEMA.extend(PUBLIC_ACTION_METADATA_SHAPE),
  PUBLIC_RETRIEVE_ENTITY_STEP_SCHEMA.extend(PUBLIC_ACTION_METADATA_SHAPE),
  PUBLIC_RETRIEVE_EXAMPLES_STEP_SCHEMA.extend(PUBLIC_ACTION_METADATA_SHAPE),
  PUBLIC_ASK_USER_STEP_SCHEMA.extend(PUBLIC_ACTION_METADATA_SHAPE),
  PUBLIC_INSTALL_DEPENDENCIES_STEP_SCHEMA.extend(PUBLIC_ACTION_METADATA_SHAPE),
  PUBLIC_IMPLEMENT_STEP_SCHEMA.extend(PUBLIC_ACTION_METADATA_SHAPE),
  PUBLIC_COMPLETE_STEP_SCHEMA.extend(PUBLIC_ACTION_METADATA_SHAPE),
  PUBLIC_REVIEW_STEP_SCHEMA.extend(PUBLIC_ACTION_METADATA_SHAPE),
  PUBLIC_RERUN_WORKFLOW_STEP_SCHEMA.extend(PUBLIC_ACTION_METADATA_SHAPE),
  PUBLIC_FIX_CONTEXT_STEP_SCHEMA.extend(PUBLIC_ACTION_METADATA_SHAPE),
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
  .passthrough();
const PUBLIC_EVIDENCE_SCHEMA = z
  .object({
    status: z.enum(["complete", "partial", "missing"]),
    items: z.array(PUBLIC_EVIDENCE_ITEM_SCHEMA),
    source_urls: z.array(z.string()),
    missing: z.array(z.string()),
    heuristic_fallback: z.boolean(),
    input_context: z
      .object({
        source_outline_provided: z.boolean().optional(),
        source_outline_signal_counts: z
          .object({
            regions: z.number(),
            actions: z.number(),
            states: z.number(),
            notes: z.number(),
          })
          .optional(),
        derived_outline_available: z.boolean().optional(),
        derived_outline_signal_counts: z
          .object({
            regions: z.number(),
            actions: z.number(),
            states: z.number(),
            notes: z.number(),
          })
          .optional(),
        visual_input_count: z.number().optional(),
        visual_input_kinds: z.array(z.string()).optional(),
        source_outline_summary: z.string().optional(),
      })
      .passthrough()
      .optional(),
  })
  .passthrough();
const SUPPORT_SOURCES_SHAPE = {
  sources: z.array(TOOL_SOURCE_SCHEMA).optional(),
};
const GUIDANCE_BOUNDARY_SCHEMA = UNKNOWN_RECORD_SCHEMA.optional();
const SUPPORT_FOLLOW_UPS_SCHEMA = UNKNOWN_RECORD_ARRAY_SCHEMA.optional();
const SUPPORT_RAW_SCHEMA = UNKNOWN_RECORD_SCHEMA.optional();
const GET_SALT_ENTITY_OUTPUT_SCHEMA = z
  .object({
    guidance_boundary: GUIDANCE_BOUNDARY_SCHEMA,
    entity_type: z
      .enum([
        "component",
        "pattern",
        "foundation",
        "token",
        "guide",
        "page",
        "package",
      ])
      .nullable(),
    decision: z.object({
      status: z.enum(["found", "multiple_matches", "results", "not_found"]),
      why: z.string(),
    }),
    entity: UNKNOWN_RECORD_SCHEMA.nullable(),
    matches: UNKNOWN_RECORD_ARRAY_SCHEMA.optional(),
    related: UNKNOWN_RECORD_SCHEMA.optional(),
    starter_code: UNKNOWN_RECORD_ARRAY_SCHEMA.optional(),
    suggested_follow_ups: SUPPORT_FOLLOW_UPS_SCHEMA,
    next_step: z.string().optional(),
    did_you_mean: z.array(z.string()).optional(),
    ambiguity: UNKNOWN_RECORD_SCHEMA.optional(),
    raw: SUPPORT_RAW_SCHEMA,
    ...SUPPORT_SOURCES_SHAPE,
  })
  .passthrough();
const GET_SALT_ENTITIES_OUTPUT_SCHEMA = z
  .object({
    guidance_boundary: GUIDANCE_BOUNDARY_SCHEMA,
    decision: z.object({
      status: z.enum(["results", "partial", "not_found", "empty"]),
      why: z.string(),
    }),
    requested_count: z.number().int().min(0),
    found_count: z.number().int().min(0),
    not_found_count: z.number().int().min(0),
    ambiguous_count: z.number().int().min(0),
    results: z
      .array(
        z
          .object({
            name: z.string(),
            result: GET_SALT_ENTITY_OUTPUT_SCHEMA,
          })
          .passthrough(),
      )
      .min(0),
    unresolved_names: z.array(z.string()),
    next_step: z.string().optional(),
  })
  .passthrough();
const GET_SALT_EXAMPLES_OUTPUT_SCHEMA = z
  .object({
    guidance_boundary: UNKNOWN_RECORD_SCHEMA,
    decision: z.object({
      target_name: z.string().nullable(),
      target_type: z.enum(["component", "pattern"]).nullable(),
      why: z.string(),
    }),
    best_example: UNKNOWN_RECORD_SCHEMA.nullable(),
    alternatives: UNKNOWN_RECORD_ARRAY_SCHEMA.optional(),
    examples: UNKNOWN_RECORD_ARRAY_SCHEMA.optional(),
    starter_code: UNKNOWN_RECORD_ARRAY_SCHEMA.optional(),
    suggested_follow_ups: SUPPORT_FOLLOW_UPS_SCHEMA,
    next_step: z.string().optional(),
    resolved_target: UNKNOWN_RECORD_SCHEMA.optional(),
    did_you_mean: z.array(z.string()).optional(),
    ambiguity: UNKNOWN_RECORD_SCHEMA.optional(),
    raw: SUPPORT_RAW_SCHEMA,
    ...SUPPORT_SOURCES_SHAPE,
  })
  .passthrough();
const GET_SALT_REFERENCE_OUTPUT_SCHEMA = z
  .object({
    guidance_boundary: UNKNOWN_RECORD_SCHEMA.optional(),
    decision: UNKNOWN_RECORD_SCHEMA,
    suggested_follow_ups: SUPPORT_FOLLOW_UPS_SCHEMA.optional(),
    next_step: z.string().optional(),
  })
  .passthrough();
const PUBLIC_RECIPE_SCHEMA = z.object({
  steps: z
    .array(
      z.object({
        id: z.string().min(1),
        action: PUBLIC_NEXT_STEP_SCHEMA,
        status: z.enum(["required", "available", "complete"]),
        evidence_required: z.array(z.string()).optional(),
        reason: z.string().optional(),
      }),
    )
    .min(1),
});
const MCP_WORKFLOW_OUTPUT_SCHEMA = z
  .object({
    contract: z.literal("salt_workflow_v1"),
    workflow: z.enum(PUBLIC_WORKFLOW_IDS),
    transport: z.literal("mcp"),
    status: z.enum(PUBLIC_WORKFLOW_STATUSES),
    request: z.object({
      entity: z.string().optional(),
      resolved_entity: z.string().nullable().optional(),
      match_status: z.enum(PUBLIC_MATCH_STATUSES).optional(),
      exact_match_required: z.boolean().optional(),
      full_request_evidence_complete: z.boolean().optional(),
    }),
    safety: z.object({
      canonical_complete: z.boolean(),
      exact_request_safe: z.boolean(),
      blocking_reasons: z.array(z.string()),
    }),
    action: PUBLIC_ACTION_SCHEMA,
    next_required_action: PUBLIC_NEXT_STEP_SCHEMA,
    allowed_next_actions: z.array(z.enum(PUBLIC_ACTION_KINDS)).min(1),
    recipe: PUBLIC_RECIPE_SCHEMA,
    questions: z.array(z.string()),
    evidence: PUBLIC_EVIDENCE_SCHEMA,
    // Task 2.9 / root cause #2: every salt_workflow_v1 contract carries
    // the top-level `internal_limitations` block (semver 1.1.0).
    // Mandatory and always present so hosts can branch on the inner
    // fields without runtime nullish checks. Default =
    // { unsupported_claim_count: 0, unsupported_rule_kinds: [] }.
    internal_limitations: z.object({
      unsupported_claim_count: z.number().int().nonnegative(),
      unsupported_rule_kinds: z.array(z.string()),
    }),
    summary: z.string().min(1),
    truncated: z.boolean().optional(),
    available_expansions: z.array(z.string()).optional(),
    full_output_bytes: z.number().optional(),
    // Per-workflow free-form expansion payload. Shape varies by tool and view
    // (create / review / migrate); each tool's `view: "full"`
    // response defines its own concrete schema in semantic-core. Hosts
    // discriminate on `contract` + `available_expansions` before reading.
    details: z.unknown().optional(),
  })
  .strict();
const CHOOSE_OUTPUT_SCHEMA = MCP_WORKFLOW_OUTPUT_SCHEMA;
const ANALYZE_OUTPUT_SCHEMA = MCP_WORKFLOW_OUTPUT_SCHEMA;
const TRANSLATE_OUTPUT_SCHEMA = MCP_WORKFLOW_OUTPUT_SCHEMA;

function normalizeWorkflowView(
  view: (typeof VIEWS)[number] | undefined,
): "compact" | "full" {
  return view === "full" ? "full" : "compact";
}

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
  execute: (
    registry: SaltRegistry,
    args: object,
    runtime?: ToolExecutionRuntime,
  ) => Promise<unknown> | unknown;
}

export interface ToolExecutionRuntime {
  projectContexts: Map<string, SaltProjectContextData>;
  lastProjectContextId: string | null;
  /**
   * Context ids whose cached snapshot is known to be out of date relative to
   * the on-disk state — most often because a workflow turn just emitted
   * `install_dependencies` and the next host turn will mutate `package.json`
   * before re-entering the MCP. The next call that touches a stale id
   * transparently refetches via `collectSaltProjectContextData`, so hosts no
   * longer need to call `get_salt_project_context` between an install and
   * the rerun. See Phase 0 task 0.9 / PR 12.
   */
  staleProjectContextIds: Set<string>;
}

export function createToolExecutionRuntime(): ToolExecutionRuntime {
  return {
    projectContexts: new Map(),
    lastProjectContextId: null,
    staleProjectContextIds: new Set(),
  };
}

function cacheProjectContext(
  runtime: ToolExecutionRuntime | undefined,
  context: SaltProjectContextData,
): string | null {
  const contextId =
    context.resolution.status === "resolved"
      ? buildSaltProjectContextId(context.root_dir)
      : null;
  if (runtime) {
    if (context.resolution.status === "resolved" && contextId) {
      runtime.projectContexts.set(contextId, context);
      runtime.lastProjectContextId = contextId;
      // Successful caching clears the stale flag — the snapshot we just
      // stored *is* the fresh state.
      runtime.staleProjectContextIds.delete(contextId);
    } else {
      runtime.lastProjectContextId = null;
    }
  }

  return contextId;
}

/**
 * Returns whether the runtime has marked `contextId` as stale via
 * {@link markProjectContextStale}. The next call that touches a stale id
 * refetches before serving the cached value (see
 * {@link resolveOrCollectProjectContext}).
 */
function isProjectContextStale(
  runtime: ToolExecutionRuntime | undefined,
  contextId: string,
): boolean {
  return runtime?.staleProjectContextIds.has(contextId) ?? false;
}

/**
 * Marks the cached project context for `rootDir` stale so the next workflow
 * turn refetches package state from disk. Called automatically after any
 * workflow result that requests `install_dependencies`; consumers do not
 * normally need to call this directly.
 */
function markProjectContextStale(
  runtime: ToolExecutionRuntime | undefined,
  rootDir: string,
): void {
  if (!runtime) return;
  const contextId = buildSaltProjectContextId(rootDir);
  runtime.staleProjectContextIds.add(contextId);
}

function resultRequestsInstallDependencies(result: unknown): boolean {
  if (result === null || typeof result !== "object") return false;
  const envelope = result as {
    action?: { kind?: unknown } | null;
    next_required_action?: { kind?: unknown } | null;
  };
  return (
    envelope.action?.kind === "install_dependencies" ||
    envelope.next_required_action?.kind === "install_dependencies"
  );
}

/**
 * Runs a repo-aware workflow body and applies the install-dependencies →
 * stale-cache invariant once for every call. Eliminates the duplicated
 * `if (...) markProjectContextStale(...)` block from each per-workflow
 * `execute` definition. See {@link markProjectContextStale}.
 */
async function runRepoAwareWorkflow<T>(
  runtime: ToolExecutionRuntime | undefined,
  projectContext: SaltProjectContextData,
  body: () => Promise<T> | T,
): Promise<T> {
  const result = await body();
  if (
    isSaltProjectContextReadyForRepoAwareWork(projectContext) &&
    resultRequestsInstallDependencies(result)
  ) {
    markProjectContextStale(runtime, projectContext.root_dir);
  }
  return result;
}

function resolveProjectContext(
  runtime: ToolExecutionRuntime | undefined,
  contextId: string,
): SaltProjectContextData {
  const context = runtime?.projectContexts.get(contextId) ?? null;
  if (!context) {
    throw new Error(
      `Unknown context_id "${contextId}". Run get_salt_project_context for the target repo again before using repo-aware workflows.`,
    );
  }

  return context;
}

async function resolveOrCollectProjectContext(
  registry: SaltRegistry,
  runtime: ToolExecutionRuntime | undefined,
  options: { contextId?: string; rootDir?: string } = {},
): Promise<SaltProjectContextData> {
  if (options.contextId) {
    const cached = resolveProjectContext(runtime, options.contextId);
    if (isProjectContextStale(runtime, options.contextId)) {
      // The cached snapshot is known stale (most often because a prior
      // workflow turn requested install_dependencies). Refetch transparently
      // so the host does not need to call get_salt_project_context between
      // the install and the rerun.
      const refreshed = await collectSaltProjectContextData(registry, {
        root_dir: cached.root_dir,
      });
      cacheProjectContext(runtime, refreshed);
      return refreshed;
    }
    return cached;
  }

  if (options.rootDir) {
    const context = await collectSaltProjectContextData(registry, {
      root_dir: options.rootDir,
    });
    cacheProjectContext(runtime, context);
    return context;
  }

  const lastProjectContextId = runtime?.lastProjectContextId;
  if (
    lastProjectContextId &&
    runtime?.projectContexts.size === 1 &&
    !isProjectContextStale(runtime, lastProjectContextId)
  ) {
    const cachedContext = runtime?.projectContexts.get(lastProjectContextId);
    if (cachedContext && cachedContext.resolution.status === "resolved") {
      return cachedContext;
    }
  }

  const context = await collectSaltProjectContextData(registry, {});
  cacheProjectContext(runtime, context);
  return context;
}

function defineTool<Args extends object>(
  definition: Omit<ToolDefinition, "execute"> & {
    execute: (
      registry: SaltRegistry,
      args: Args,
      runtime?: ToolExecutionRuntime,
    ) => Promise<unknown> | unknown;
  },
): ToolDefinition {
  return definition as ToolDefinition;
}

const DEFERRED_PUBLIC_REFERENCE_IDS = {
  entities: ["get", "salt", "entities"].join("_"),
  examples: ["get", "salt", "examples"].join("_"),
  discover: ["discover", "salt"].join("_"),
} as const;

function toPublicReferenceSurface(value: unknown): unknown {
  if (typeof value === "string") {
    return value
      .replaceAll(DEFERRED_PUBLIC_REFERENCE_IDS.entities, "get_salt_reference")
      .replaceAll(DEFERRED_PUBLIC_REFERENCE_IDS.examples, "get_salt_reference")
      .replaceAll(DEFERRED_PUBLIC_REFERENCE_IDS.discover, "get_salt_reference");
  }

  if (Array.isArray(value)) {
    return value.map(toPublicReferenceSurface);
  }

  if (typeof value === "object" && value !== null) {
    return Object.fromEntries(
      Object.entries(value).map(([key, entryValue]) => [
        key,
        toPublicReferenceSurface(entryValue),
      ]),
    );
  }

  return value;
}

const SUPPORT_TOOL_ORDER = ["get_salt_reference"] as const;
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
      "Inspect and cache repo context for repo-aware Salt workflows or explicit context reuse. Detect the local framework, workspace shape, Salt package usage, repo instructions, declared project policy, and likely runtime targets.",
    inputSchema: {
      root_dir: z
        .string()
        .optional()
        .describe(
          "Optional repo root to inspect. Defaults to the current MCP working directory.",
        ),
      include_policy_diagnostics: z
        .boolean()
        .optional()
        .describe(
          "Include resolved stack-layer and shared-pack diagnostics in the public context payload. Defaults to false so repo context stays smaller and cheaper.",
        ),
    },
    outputSchema: CONTEXT_OUTPUT_SCHEMA,
    annotations: READ_ONLY_WORKFLOW_TOOL_ANNOTATIONS,
    execute: async (registry, args, runtime) => {
      const context = await collectSaltProjectContextData(registry, args);
      const contextId = cacheProjectContext(runtime, context);
      return toSaltProjectContextResult(context, contextId);
    },
  }),
  defineTool<{
    kind: "entity" | "examples";
    name?: string;
    names?: string[];
    entity_type?:
      | "auto"
      | "component"
      | "pattern"
      | "foundation"
      | "token"
      | "guide"
      | "page"
      | "package";
    target_type?: "component" | "pattern";
    target_name?: string;
    package?: string;
    status?: (typeof STATUSES)[number];
    include?: Array<(typeof INCLUDE_SECTIONS)[number]>;
    include_related?: boolean;
    include_starter_code?: boolean;
    include_code?: boolean;
    query?: string;
    complexity?: "basic" | "intermediate" | "advanced";
    max_results?: number;
    include_deprecated?: boolean;
  }>({
    name: "get_salt_reference",
    description:
      "Read-only Salt reference lookup. Use for look up, compare, side by side, fetch, or resolve exact Salt component details, props, tokens, packages, pages, guides, foundations, named entities, sample implementation code, and canonical example snippets to ground starter code before writing. Use kind=entity to resolve known Salt names, or kind=examples to fetch canonical component or pattern examples.",
    inputSchema: {
      kind: z
        .enum(["entity", "examples"])
        .describe(
          "Select entity for exact Salt name resolution, or examples for canonical implementation examples.",
        ),
      name: z
        .string()
        .optional()
        .describe(
          "Single Salt entity or example target name. Use names for entity batches.",
        ),
      names: z
        .array(z.string().min(1))
        .min(1)
        .max(25)
        .optional()
        .describe(
          "Entity mode only. Ordered Salt entity names to resolve in one read-only lookup.",
        ),
      entity_type: z
        .enum([
          "auto",
          "component",
          "pattern",
          "foundation",
          "token",
          "guide",
          "page",
          "package",
        ])
        .optional(),
      target_type: z.enum(["component", "pattern"]).optional(),
      target_name: z.string().optional(),
      package: z.string().optional(),
      status: z.enum(STATUSES).optional(),
      include: z.array(z.enum(INCLUDE_SECTIONS)).optional(),
      include_related: z.boolean().optional(),
      include_starter_code: z.boolean().optional(),
      include_code: z.boolean().optional(),
      query: z.string().optional(),
      complexity: z.enum(["basic", "intermediate", "advanced"]).optional(),
      max_results: z.number().int().min(1).max(50).optional(),
      include_deprecated: z.boolean().optional(),
    },
    outputSchema: GET_SALT_REFERENCE_OUTPUT_SCHEMA,
    annotations: READ_ONLY_WORKFLOW_TOOL_ANNOTATIONS,
    execute: (registry, args) => {
      if (args.kind === "examples") {
        return toPublicReferenceSurface(
          getSaltExamples(registry, {
            target_type: args.target_type,
            target_name: args.target_name ?? args.name,
            package: args.package,
            query: args.query,
            complexity: args.complexity,
            include_code: args.include_code,
            include_starter_code: args.include_starter_code,
            max_results: args.max_results,
          }),
        );
      }

      const names = args.names ?? (args.name ? [args.name] : []);
      if (names.length === 0) {
        throw new Error(
          "get_salt_reference: provide name or names when kind is entity",
        );
      }

      return toPublicReferenceSurface(
        getSaltEntities(registry, {
          names,
          entity_type: args.entity_type,
          allowed_entity_types: [...V1_REFERENCE_ENTITY_TYPES],
          allow_search_fallback: false,
          package: args.package,
          status: args.status,
          include: args.include,
          include_related: args.include_related,
          include_starter_code: args.include_starter_code,
          max_results: args.max_results,
          include_deprecated: args.include_deprecated,
        }),
      );
    },
  }),
  defineTool<
    Parameters<typeof migrateToSalt>[1] & {
      context_id?: string;
      root_dir?: string;
    }
  >({
    name: "migrate_to_salt",
    description:
      "Primary fit for the Salt migrate workflow. Use this to convert non-Salt UI code, external UI (Material UI, Chakra UI, Ant Design, in-house React), a mockup or screen outline, or a rough interface description that needs to be translated into Salt primitives, patterns, and migration steps. It returns canonical Salt migration guidance plus repo-policy artifacts from the resolved project context when declared policy exists. If context_id is omitted, the MCP collects repo context automatically before continuing.",
    inputSchema: {
      code: z
        .string()
        .optional()
        .describe(
          "Optional source UI code to inspect before translating it into Salt targets.",
        ),
      query: z
        .string()
        .optional()
        .describe(
          "Optional description of the source UI, mockup, or migration goal when code is partial or unavailable.",
        ),
      source_outline: z
        .object({
          regions: z.array(z.string()).optional(),
          actions: z.array(z.string()).optional(),
          states: z.array(z.string()).optional(),
          notes: z.array(z.string()).optional(),
        })
        .optional()
        .describe(
          "Optional structured mockup or design outline with regions, actions, and states when you want to translate a screen description into Salt more explicitly.",
        ),
      package: z
        .string()
        .optional()
        .describe(
          "Restrict package-backed Salt targets to a specific Salt package such as @salt-ds/core or @salt-ds/lab.",
        ),
      prefer_stable: z.boolean().optional(),
      a11y_required: z.boolean().optional(),
      include_starter_code: z
        .boolean()
        .optional()
        .describe(
          "Defaults to true. Set false only when you explicitly want planning guidance without starter code.",
        ),
      context_id: z
        .string()
        .optional()
        .describe(
          "Optional repo context id returned by get_salt_project_context. If omitted, the MCP collects repo context automatically for the current working directory.",
        ),
      root_dir: z
        .string()
        .optional()
        .describe(
          "Optional repo root to inspect when context_id is not available. Prefer context_id for repeated workflow calls in the same repo.",
        ),
    },
    outputSchema: TRANSLATE_OUTPUT_SCHEMA,
    annotations: READ_ONLY_WORKFLOW_TOOL_ANNOTATIONS,
    execute: async (registry, args, runtime) => {
      const { context_id, root_dir, ...workflowArgs } = args;
      const projectContext = await resolveOrCollectProjectContext(
        registry,
        runtime,
        { contextId: context_id, rootDir: root_dir },
      );
      return runRepoAwareWorkflow(runtime, projectContext, async () => {
        const semanticView = normalizeWorkflowView(workflowArgs.view);
        return withTranslateWorkflowGuidance(
          registry,
          migrateToSalt(registry, {
            ...workflowArgs,
            view: semanticView,
          }),
          {
            source_outline: workflowArgs.source_outline,
            context_checked:
              isSaltProjectContextReadyForRepoAwareWork(projectContext),
            context_resolution_status: projectContext.resolution.status,
            context_retry_with_root_dir:
              projectContext.summary.retry_with.root_dir,
            context_id: isSaltProjectContextReadyForRepoAwareWork(
              projectContext,
            )
              ? buildSaltProjectContextId(projectContext.root_dir)
              : null,
            project_policy:
              await loadWorkflowProjectPolicyArtifactForContext(projectContext),
            view: workflowArgs.view,
          },
        );
      });
    },
  }),
  defineTool<
    Parameters<typeof createSaltUi>[1] & {
      context_id?: string;
      root_dir?: string;
    }
  >({
    name: "create_salt_ui",
    description:
      "Primary Salt create workflow for new Salt UI. Use for create, build, generate, add, or scaffold requests that need a new Salt component, pattern, screen region, toolbar, form, dashboard, or workflow surface. Resolve the nearest canonical Salt component or pattern from a feature description and return evidence-backed implementation guidance. Use get_salt_reference for exact reference requests.",
    inputSchema: {
      query: z
        .string()
        .min(1)
        .describe(
          "Describe the user need, task, flow, or capability requirement when you want Salt to suggest the best fit.",
        ),
      solution_type: z
        .enum(["auto", "component", "pattern", "foundation", "token"])
        .optional()
        .describe(
          "Optional solution-family hint when the request already points clearly to a known component, pattern, foundation, or token family.",
        ),
      package: z
        .string()
        .optional()
        .describe(
          "Restrict package-backed candidates to a specific Salt package such as @salt-ds/core or @salt-ds/lab.",
        ),
      status: z
        .enum(STATUSES)
        .optional()
        .describe(
          "Restrict candidates by release status. Use stable when the request must avoid beta, lab, or deprecated options.",
        ),
      prefer_stable: z.boolean().optional(),
      a11y_required: z.boolean().optional(),
      include_starter_code: z
        .boolean()
        .optional()
        .describe(
          "Defaults to true. Set false only when you explicitly want planning guidance without starter code.",
        ),
      resolved_entities: z
        .array(z.string().min(1))
        .optional()
        .describe(
          "Names of follow-through entities already resolved through canonical support tools. Use when rerunning create after retrieve_entity or retrieve_examples.",
        ),
      context_id: z
        .string()
        .optional()
        .describe(
          "Optional repo context id returned by get_salt_project_context. If omitted, the MCP collects repo context automatically for the current working directory.",
        ),
      root_dir: z
        .string()
        .optional()
        .describe(
          "Optional repo root to inspect when context_id is not available. Prefer context_id for repeated workflow calls in the same repo.",
        ),
    },
    outputSchema: CHOOSE_OUTPUT_SCHEMA,
    annotations: READ_ONLY_WORKFLOW_TOOL_ANNOTATIONS,
    execute: async (registry, args, runtime) => {
      const { context_id, root_dir, ...workflowArgs } = args;
      const projectContext = await resolveOrCollectProjectContext(
        registry,
        runtime,
        { contextId: context_id, rootDir: root_dir },
      );
      return runRepoAwareWorkflow(runtime, projectContext, async () => {
        const semanticView = normalizeWorkflowView(workflowArgs.view);
        return withChooseWorkflowGuidance(
          registry,
          createSaltUi(registry, {
            ...workflowArgs,
            view: semanticView,
          }),
          {
            query: workflowArgs.query,
            package: workflowArgs.package,
            context_checked:
              isSaltProjectContextReadyForRepoAwareWork(projectContext),
            context_resolution_status: projectContext.resolution.status,
            context_retry_with_root_dir:
              projectContext.summary.retry_with.root_dir,
            context_id: isSaltProjectContextReadyForRepoAwareWork(
              projectContext,
            )
              ? buildSaltProjectContextId(projectContext.root_dir)
              : null,
            project_policy:
              await loadWorkflowProjectPolicyArtifactForContext(projectContext),
            view: workflowArgs.view,
            salt_packages: projectContext.salt.packages.map(
              (entry) => entry.name,
            ),
            package_manager: projectContext.environment.package_manager,
            resolved_entities: workflowArgs.resolved_entities,
          },
        );
      });
    },
  }),
  defineTool<
    Parameters<typeof reviewSaltUi>[1] & {
      context_id?: string;
      root_dir?: string;
    }
  >({
    name: "review_salt_ui",
    description:
      "Primary fit for the Salt review workflow. Analyze existing React and Salt code or a specific Salt feature, validate usage, detect deprecated APIs, version-risk, breaking changes, migration concerns, and patterns, then suggest fixes. If context_id is omitted, the MCP collects repo context automatically before continuing.",
    inputSchema: {
      code: z.string().describe("Source code to analyze."),
      framework: z.string().optional(),
      package_version: z
        .string()
        .optional()
        .describe("Version-aware context for validation and fix guidance."),
      from_version: z
        .string()
        .optional()
        .describe(
          "Optional source version boundary for migration suggestions.",
        ),
      to_version: z
        .string()
        .optional()
        .describe(
          "Optional target version boundary for migration suggestions.",
        ),
      max_issues: z.number().int().min(1).max(50).optional(),
      expected_targets: REVIEW_EXPECTED_TARGETS_SCHEMA.optional().describe(
        "Optional source-backed or workflow-input targets from a previous Salt workflow. Missing evidence is returned as unsupported review data.",
      ),
      context_id: z
        .string()
        .optional()
        .describe(
          "Optional repo context id returned by get_salt_project_context. If omitted, the MCP collects repo context automatically for the current working directory.",
        ),
      root_dir: z
        .string()
        .optional()
        .describe(
          "Optional repo root to inspect when context_id is not available. Prefer context_id for repeated workflow calls in the same repo.",
        ),
    },
    outputSchema: ANALYZE_OUTPUT_SCHEMA,
    annotations: READ_ONLY_WORKFLOW_TOOL_ANNOTATIONS,
    execute: async (registry, args, runtime) => {
      const { context_id, root_dir, ...workflowArgs } = args;
      const projectContext = await resolveOrCollectProjectContext(
        registry,
        runtime,
        { contextId: context_id, rootDir: root_dir },
      );
      return runRepoAwareWorkflow(runtime, projectContext, async () => {
        const semanticView = normalizeWorkflowView(workflowArgs.view);
        return withAnalyzeWorkflowGuidance(
          registry,
          reviewSaltUi(registry, {
            ...workflowArgs,
            view: semanticView,
          }),
          {
            code: workflowArgs.code,
            expected_targets: workflowArgs.expected_targets,
            project_policy:
              await loadWorkflowProjectPolicyArtifactForContext(projectContext),
            root_dir: projectContext.root_dir,
            view: workflowArgs.view,
          },
        );
      });
    },
  }),
];

const WORKFLOW_TOOL_DEFINITIONS: readonly ToolDefinition[] =
  ALL_TOOL_DEFINITIONS.filter((definition) =>
    PUBLIC_WORKFLOW_TOOL_IDS.includes(
      definition.name as (typeof PUBLIC_WORKFLOW_TOOL_IDS)[number],
    ),
  );

const INTERNAL_SUPPORT_TOOL_DEFINITIONS: readonly ToolDefinition[] =
  ALL_TOOL_DEFINITIONS.filter((definition) =>
    SUPPORT_TOOL_ORDER.includes(
      definition.name as (typeof SUPPORT_TOOL_ORDER)[number],
    ),
  );
const toolPriorityByName = new Map<string, number>([
  ...DEFAULT_TOOL_ORDER.map((name, index) => [name, index] as const),
]);

const ORDERED_TOOL_DEFINITIONS: readonly ToolDefinition[] = [
  ...WORKFLOW_TOOL_DEFINITIONS,
  ...INTERNAL_SUPPORT_TOOL_DEFINITIONS,
]
  .map((definition, index) => ({
    definition,
    index,
    priority: toolPriorityByName.get(definition.name) ?? index,
  }))
  .sort((left, right) => {
    if (left.priority !== right.priority) {
      return left.priority - right.priority;
    }

    return left.index - right.index;
  })
  .map(({ definition }) => definition);

export const TOOL_DEFINITIONS: readonly ToolDefinition[] =
  ORDERED_TOOL_DEFINITIONS.filter((definition) =>
    DEFAULT_TOOL_ORDER.includes(
      definition.name as (typeof DEFAULT_TOOL_ORDER)[number],
    ),
  );
