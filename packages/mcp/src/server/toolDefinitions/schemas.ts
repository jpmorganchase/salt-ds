import * as z from "zod/v4";

// Constants and Zod schemas for tool inputs and outputs extracted from
// toolDefinitions.ts so the registration file stays under the §1.1 600-line
// cap. Every export is re-exported through toolDefinitions.ts so existing
// imports keep working.

export const SEARCH_AREAS = [
  "all",
  "packages",
  "components",
  "icons",
  "country_symbols",
  "pages",
  "foundations",
  "patterns",
  "guides",
  "tokens",
  "examples",
  "changes",
] as const;
export const STATUSES = ["stable", "beta", "lab", "deprecated"] as const;
export const VIEWS = ["compact", "full"] as const;
export const CHANGE_KINDS = [
  "added",
  "changed",
  "fixed",
  "deprecated",
  "removed",
] as const;
export const INCLUDE_SECTIONS = [
  "examples",
  "props",
  "tokens",
  "accessibility",
  "deprecations",
  "changes",
] as const;
export const PUBLIC_WORKFLOW_TOOL_IDS = [
  "get_salt_project_context",
  "bootstrap_salt_repo",
  "create_salt_ui",
  "review_salt_ui",
  "migrate_to_salt",
  "upgrade_salt_ui",
] as const;
export const CONTEXT_NEXT_TOOL_IDS = [
  "create_salt_ui",
  "review_salt_ui",
  "migrate_to_salt",
  "upgrade_salt_ui",
] as const;
export const UNKNOWN_RECORD_SCHEMA = z.record(z.string(), z.unknown());
export const UNKNOWN_RECORD_ARRAY_SCHEMA = z.array(UNKNOWN_RECORD_SCHEMA);
export const READ_ONLY_WORKFLOW_TOOL_ANNOTATIONS = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: false,
} as const;

export const WORKFLOW_COMPOSITION_CONTRACT_SCHEMA = z.object({
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

export const REVIEW_EXPECTED_TARGETS_SCHEMA = z.object({
  components: z.array(z.string()).optional(),
  patterns: z.array(z.string()).optional(),
  composition_contract:
    WORKFLOW_COMPOSITION_CONTRACT_SCHEMA.nullable().optional(),
  source: z.enum(["create_report", "workflow_context"]).optional(),
});

export const TOOL_SOURCE_SCHEMA = z.object({
  original: z.string(),
  resolved: z.string(),
  kind: z.enum(["site", "external", "repo"]),
});

export const CONTEXT_SALT_INSTALLATION_SCHEMA = z.object({
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
    blocking_workflows: z.array(z.enum(["review", "migrate", "upgrade"])),
    reasons: z.array(z.string()),
  }),
});

export const CONTEXT_POLICY_COMPATIBILITY_SCHEMA = z.object({
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

export const CONTEXT_RESULT_SCHEMA = z.object({
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
    upgrade: z.boolean(),
    runtime_evidence: z.boolean(),
  }),
});

export const CONTEXT_WORKFLOW_ENVELOPE_SCHEMA = z.object({
  workflow: z.object({
    id: z.literal("get_salt_project_context"),
  }),
  result: CONTEXT_RESULT_SCHEMA,
  artifacts: z.object({
    summary: z.object({
      recommended_next_tool: z.enum(CONTEXT_NEXT_TOOL_IDS).nullable(),
      bootstrap_requirement: z.object({
        status: z.enum(["recommended", "not_required"]),
        tool: z.literal("bootstrap_salt_repo"),
        cli_command: z.literal("salt-ds init"),
        reason: z.string().nullable(),
        next_tool_after_bootstrap: z
          .enum([
            "create_salt_ui",
            "review_salt_ui",
            "migrate_to_salt",
            "upgrade_salt_ui",
          ])
          .nullable(),
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

export const BOOTSTRAP_WORKFLOW_ENVELOPE_SCHEMA = z.object({
  workflow: z.object({
    id: z.literal("bootstrap_salt_repo"),
  }),
  result: z.object({
    context_id: z.string(),
    root_dir: z.string(),
    project_name: z.string(),
    policy: z.object({
      path: z.string().nullable(),
      action: z.enum(["created", "unchanged", "skipped-layered"]),
      mode: z.enum(["none", "team", "stack"]),
    }),
    stack: z.object({
      path: z.string().nullable(),
      action: z.enum(["created", "unchanged", "not_requested"]),
      conventions_pack_source: z.string().nullable(),
    }),
    repo_instructions: z.object({
      path: z.string(),
      filename: z.enum(["AGENTS.md", "CLAUDE.md"]).nullable(),
      action: z.enum(["created", "updated", "unchanged"]),
    }),
    summary: z.object({
      ready_for_repo_aware_workflows: z.boolean(),
      recommended_next_tool: z
        .enum([
          "create_salt_ui",
          "review_salt_ui",
          "migrate_to_salt",
          "upgrade_salt_ui",
        ])
        .nullable(),
      next_step: z.string(),
    }),
  }),
  artifacts: z.object({
    project_context: CONTEXT_WORKFLOW_ENVELOPE_SCHEMA,
    notes: z.array(z.string()),
  }),
  sources: z.array(TOOL_SOURCE_SCHEMA),
});

export const REVIEW_RESUME_OUTPUT_SCHEMA = z
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

export const REVIEW_REPORT_VALIDATION_OUTPUT_SCHEMA = z
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

export const CONTEXT_OUTPUT_SCHEMA = CONTEXT_WORKFLOW_ENVELOPE_SCHEMA;
export const BOOTSTRAP_OUTPUT_SCHEMA = BOOTSTRAP_WORKFLOW_ENVELOPE_SCHEMA;

export const PUBLIC_ACTION_KINDS = [
  "tool_call",
  "retrieve_entity",
  "retrieve_examples",
  "ask_user",
  "install_dependencies",
  "bootstrap_repo",
  "implement",
  "complete",
  "review",
  "rerun_workflow",
  "fix_context",
] as const;
export const PUBLIC_WORKFLOW_IDS = [
  "init",
  "create",
  "review",
  "migrate",
  "upgrade",
] as const;
export const PUBLIC_WORKFLOW_STATUSES = [
  "success",
  "partial",
  "blocked",
  "failed",
] as const;
export const PUBLIC_MATCH_STATUSES = [
  "exact",
  "alias",
  "broadened",
  "misrouted",
  "no_match",
] as const;
export const PUBLIC_EVIDENCE_KINDS = [
  "docs",
  "examples",
  "registry",
  "project_policy",
  "heuristic_fallback",
] as const;

export const PUBLIC_ARGS_SCHEMA = z.record(z.string(), z.unknown());
export const PUBLIC_MCP_HINT_SCHEMA = z.object({
  tool: z.string().min(1),
  args: PUBLIC_ARGS_SCHEMA,
});
export const PUBLIC_ACTION_HINTS_SHAPE = {
  cli: z.string().min(1).optional(),
  mcp: PUBLIC_MCP_HINT_SCHEMA.optional(),
};
export const PUBLIC_TOOL_CALL_STEP_SCHEMA = z
  .object({
    kind: z.literal("tool_call"),
    tool: z.enum([
      "get_salt_project_context",
      "create_salt_ui",
      "review_salt_ui",
      "migrate_to_salt",
      "upgrade_salt_ui",
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
export const PUBLIC_RETRIEVE_ENTITY_STEP_SCHEMA = z
  .object({
    kind: z.literal("retrieve_entity"),
    tool: z.enum(["get_salt_entity", "create_salt_ui"]),
    args: PUBLIC_ARGS_SCHEMA,
  })
  .extend(PUBLIC_ACTION_HINTS_SHAPE);
export const PUBLIC_RETRIEVE_EXAMPLES_STEP_SCHEMA = z
  .object({
    kind: z.literal("retrieve_examples"),
    tool: z.enum(["get_salt_examples", "create_salt_ui"]),
    args: PUBLIC_ARGS_SCHEMA,
  })
  .extend(PUBLIC_ACTION_HINTS_SHAPE);
export const PUBLIC_ASK_USER_STEP_SCHEMA = z
  .object({
    kind: z.literal("ask_user"),
    question: z.string().min(1),
  })
  .extend(PUBLIC_ACTION_HINTS_SHAPE);
export const PUBLIC_INSTALL_DEPENDENCIES_STEP_SCHEMA = z
  .object({
    kind: z.literal("install_dependencies"),
    package_manager: z.string().min(1),
    packages: z.array(z.string().min(1)).min(1),
  })
  .extend(PUBLIC_ACTION_HINTS_SHAPE);
export const PUBLIC_BOOTSTRAP_REPO_STEP_SCHEMA = z
  .object({
    kind: z.literal("bootstrap_repo"),
    tool: z.enum(["bootstrap_salt_repo", "salt-ds init"]),
    args: PUBLIC_ARGS_SCHEMA.optional(),
  })
  .extend(PUBLIC_ACTION_HINTS_SHAPE);
export const PUBLIC_IMPLEMENT_STEP_SCHEMA = z
  .object({
    kind: z.literal("implement"),
    scope: z.literal("exact_request"),
  })
  .extend(PUBLIC_ACTION_HINTS_SHAPE);
export const PUBLIC_COMPLETE_STEP_SCHEMA = z
  .object({
    kind: z.literal("complete"),
    outcome: z.literal("no_changes_required"),
  })
  .extend(PUBLIC_ACTION_HINTS_SHAPE);
export const PUBLIC_REVIEW_STEP_SCHEMA = z
  .object({
    kind: z.literal("review"),
    tool: z.literal("review_salt_ui"),
    args: PUBLIC_ARGS_SCHEMA.optional(),
  })
  .extend(PUBLIC_ACTION_HINTS_SHAPE);
export const PUBLIC_RERUN_WORKFLOW_STEP_SCHEMA = z
  .object({
    kind: z.literal("rerun_workflow"),
    tool: z.enum([
      "create_salt_ui",
      "review_salt_ui",
      "migrate_to_salt",
      "upgrade_salt_ui",
    ]),
    args: PUBLIC_ARGS_SCHEMA,
  })
  .extend(PUBLIC_ACTION_HINTS_SHAPE);
export const PUBLIC_FIX_CONTEXT_STEP_SCHEMA = z
  .object({
    kind: z.literal("fix_context"),
    tool: z.enum(["get_salt_project_context", "salt-ds info"]),
    mode: z.literal("stop_and_fix_context"),
    args: PUBLIC_ARGS_SCHEMA.optional(),
  })
  .extend(PUBLIC_ACTION_HINTS_SHAPE);
export const PUBLIC_NEXT_STEP_SCHEMAS = [
  PUBLIC_TOOL_CALL_STEP_SCHEMA,
  PUBLIC_RETRIEVE_ENTITY_STEP_SCHEMA,
  PUBLIC_RETRIEVE_EXAMPLES_STEP_SCHEMA,
  PUBLIC_ASK_USER_STEP_SCHEMA,
  PUBLIC_INSTALL_DEPENDENCIES_STEP_SCHEMA,
  PUBLIC_BOOTSTRAP_REPO_STEP_SCHEMA,
  PUBLIC_IMPLEMENT_STEP_SCHEMA,
  PUBLIC_COMPLETE_STEP_SCHEMA,
  PUBLIC_REVIEW_STEP_SCHEMA,
  PUBLIC_RERUN_WORKFLOW_STEP_SCHEMA,
  PUBLIC_FIX_CONTEXT_STEP_SCHEMA,
] as const;
export const PUBLIC_NEXT_STEP_SCHEMA = z.discriminatedUnion("kind", [
  ...PUBLIC_NEXT_STEP_SCHEMAS,
]);
export const PUBLIC_POST_ACTION_SCHEMA = z
  .object({
    kind: z.literal("review"),
    tool: z.literal("review_salt_ui"),
    args: PUBLIC_ARGS_SCHEMA.optional(),
  })
  .extend(PUBLIC_ACTION_HINTS_SHAPE);
export const PUBLIC_ACTION_METADATA_SHAPE = {
  rule_ids: z.array(z.string()),
  post_action: PUBLIC_POST_ACTION_SCHEMA.nullable(),
};
export const PUBLIC_ACTION_SCHEMA = z.discriminatedUnion("kind", [
  PUBLIC_TOOL_CALL_STEP_SCHEMA.extend(PUBLIC_ACTION_METADATA_SHAPE),
  PUBLIC_RETRIEVE_ENTITY_STEP_SCHEMA.extend(PUBLIC_ACTION_METADATA_SHAPE),
  PUBLIC_RETRIEVE_EXAMPLES_STEP_SCHEMA.extend(PUBLIC_ACTION_METADATA_SHAPE),
  PUBLIC_ASK_USER_STEP_SCHEMA.extend(PUBLIC_ACTION_METADATA_SHAPE),
  PUBLIC_INSTALL_DEPENDENCIES_STEP_SCHEMA.extend(PUBLIC_ACTION_METADATA_SHAPE),
  PUBLIC_BOOTSTRAP_REPO_STEP_SCHEMA.extend(PUBLIC_ACTION_METADATA_SHAPE),
  PUBLIC_IMPLEMENT_STEP_SCHEMA.extend(PUBLIC_ACTION_METADATA_SHAPE),
  PUBLIC_COMPLETE_STEP_SCHEMA.extend(PUBLIC_ACTION_METADATA_SHAPE),
  PUBLIC_REVIEW_STEP_SCHEMA.extend(PUBLIC_ACTION_METADATA_SHAPE),
  PUBLIC_RERUN_WORKFLOW_STEP_SCHEMA.extend(PUBLIC_ACTION_METADATA_SHAPE),
  PUBLIC_FIX_CONTEXT_STEP_SCHEMA.extend(PUBLIC_ACTION_METADATA_SHAPE),
]);
export const PUBLIC_EVIDENCE_ITEM_SCHEMA = z.object({
  kind: z.enum(PUBLIC_EVIDENCE_KINDS),
  source: z.enum(["canonical_salt", "project_policy", "heuristic_fallback"]),
  entity: z.string().optional(),
  field: z.string().optional(),
  source_urls: z.array(z.string()),
  summary: z.string().optional(),
});
export const PUBLIC_EVIDENCE_SCHEMA = z.object({
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
    .optional(),
});
export const SUPPORT_SOURCES_SHAPE = {
  sources: z.array(TOOL_SOURCE_SCHEMA).optional(),
};
export const GUIDANCE_BOUNDARY_SCHEMA = UNKNOWN_RECORD_SCHEMA.optional();
export const SUPPORT_FOLLOW_UPS_SCHEMA = UNKNOWN_RECORD_ARRAY_SCHEMA.optional();
export const SUPPORT_RAW_SCHEMA = UNKNOWN_RECORD_SCHEMA.optional();
export const DISCOVER_SALT_OUTPUT_SCHEMA = z
  .object({
    mode: z.enum(["route", "browse", "related"]),
    guidance_boundary: GUIDANCE_BOUNDARY_SCHEMA,
    guidance_sources: z.array(z.string()).optional(),
    query: z.string().optional(),
    decision: UNKNOWN_RECORD_SCHEMA.nullable(),
    best_start: UNKNOWN_RECORD_SCHEMA.nullable().optional(),
    options: UNKNOWN_RECORD_SCHEMA.optional(),
    catalog: UNKNOWN_RECORD_SCHEMA.optional(),
    related: UNKNOWN_RECORD_SCHEMA.optional(),
    clarifying_questions: UNKNOWN_RECORD_ARRAY_SCHEMA.optional(),
    starter_code: UNKNOWN_RECORD_ARRAY_SCHEMA.optional(),
    related_guides: UNKNOWN_RECORD_ARRAY_SCHEMA.optional(),
    suggested_follow_ups: SUPPORT_FOLLOW_UPS_SCHEMA,
    next_step: z.string().optional(),
    signals: UNKNOWN_RECORD_SCHEMA.optional(),
    raw: SUPPORT_RAW_SCHEMA,
    did_you_mean: z.array(z.string()).optional(),
    ambiguity: UNKNOWN_RECORD_SCHEMA.optional(),
    ...SUPPORT_SOURCES_SHAPE,
  })
  .passthrough();
export const GET_SALT_ENTITY_OUTPUT_SCHEMA = z
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
        "icon",
        "country_symbol",
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
export const GET_SALT_ENTITIES_OUTPUT_SCHEMA = z
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
export const GET_SALT_EXAMPLES_OUTPUT_SCHEMA = z
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
export const PUBLIC_RECIPE_SCHEMA = z.object({
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
export const MCP_WORKFLOW_OUTPUT_SCHEMA = z
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
    details: z.unknown().optional(),
  })
  .strict();
export const CHOOSE_OUTPUT_SCHEMA = MCP_WORKFLOW_OUTPUT_SCHEMA;
export const ANALYZE_OUTPUT_SCHEMA = MCP_WORKFLOW_OUTPUT_SCHEMA;
export const TRANSLATE_OUTPUT_SCHEMA = MCP_WORKFLOW_OUTPUT_SCHEMA;
export const COMPARE_OUTPUT_SCHEMA = MCP_WORKFLOW_OUTPUT_SCHEMA;
export const CONTEXT_PACK_PERSISTENCE_OUTPUT_SCHEMA = z
  .object({
    contract: z.literal("salt_context_pack_persistence_write_v1"),
    status: z.enum([
      "written",
      "passed",
      "blocked",
      "invalid",
      "missing",
      "stale",
    ]),
    written: z.boolean(),
    root_dir: z.string(),
    output_dir: z.string(),
    manifest_path: z.string(),
    release_gate: z.unknown(),
    persistence_check: z.unknown(),
  })
  .strict();
export const GENERATED_ARTIFACT_PERSISTENCE_OUTPUT_SCHEMA = z
  .object({
    contract: z.literal("salt_generated_artifact_persistence_v1"),
    status: z.enum(["written", "blocked", "invalid"]),
    written: z.boolean(),
    artifact_path: z.string(),
    release_gate: z.unknown(),
    missing: z.array(z.string()),
  })
  .strict();

