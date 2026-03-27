import {
  createSaltUi,
  discoverSalt,
  getSaltEntity,
  getSaltExamples,
  migrateToSalt,
  reviewSaltUi,
  upgradeSaltUi,
} from "@salt-ds/semantic-core/tools/index";
import type { SaltRegistry } from "@salt-ds/semantic-core/types";
import * as z from "zod/v4";
import { bootstrapSaltRepo } from "./bootstrapRepo.js";
import {
  buildSaltProjectContextId,
  collectSaltProjectContextData,
  type SaltProjectContextData,
  toSaltProjectContextResult,
} from "./projectContext.js";
import { loadWorkflowProjectPolicyArtifactForContext } from "./projectPolicy.js";
import {
  withAnalyzeWorkflowGuidance,
  withChooseWorkflowGuidance,
  withCompareWorkflowGuidance,
  withTranslateWorkflowGuidance,
} from "./workflowOutputs.js";

const SEARCH_AREAS = [
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
const STATUSES = ["stable", "beta", "lab", "deprecated"] as const;
const VIEWS = ["compact", "full"] as const;
const CHANGE_KINDS = [
  "added",
  "changed",
  "fixed",
  "deprecated",
  "removed",
] as const;
const INCLUDE_SECTIONS = [
  "examples",
  "props",
  "tokens",
  "accessibility",
  "deprecations",
  "changes",
] as const;
const PUBLIC_WORKFLOW_TOOL_IDS = [
  "get_salt_project_context",
  "bootstrap_salt_repo",
  "create_salt_ui",
  "review_salt_ui",
  "migrate_to_salt",
  "upgrade_salt_ui",
] as const;
const CONTEXT_NEXT_TOOL_IDS = [
  "create_salt_ui",
  "review_salt_ui",
  "migrate_to_salt",
  "upgrade_salt_ui",
] as const;

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
}

export function createToolExecutionRuntime(): ToolExecutionRuntime {
  return {
    projectContexts: new Map(),
  };
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
  contextId?: string,
): Promise<SaltProjectContextData> {
  if (contextId) {
    return resolveProjectContext(runtime, contextId);
  }

  const context = await collectSaltProjectContextData(registry, {});
  const generatedContextId = buildSaltProjectContextId(context.root_dir);
  if (runtime) {
    runtime.projectContexts.set(generatedContextId, context);
  }

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

const READ_ONLY_WORKFLOW_TOOL_ANNOTATIONS = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: false,
} as const;

const TOOL_SOURCE_SCHEMA = z.object({
  original: z.string(),
  resolved: z.string(),
  kind: z.enum(["site", "external", "repo"]),
});

const WORKFLOW_CONFIDENCE_SCHEMA = z.object({
  level: z.enum(["high", "medium", "low"]),
  reasons: z.array(z.string()),
  ask_before_proceeding: z.boolean(),
  raise_confidence: z.array(z.string()),
});

const TOOL_GUIDANCE_BOUNDARY_SCHEMA = z.object({
  guidance_source: z.literal("canonical_salt"),
  scope: z.literal("official_salt_only"),
  project_conventions: z.object({
    supported: z.literal(true),
    contract: z.literal("project_conventions_v1"),
    check_recommended: z.boolean(),
    topics: z.array(z.string()),
    reason: z.string(),
  }),
});

const TOOL_SUGGESTED_FOLLOW_UP_SCHEMA = z.object({
  workflow: z.enum(PUBLIC_WORKFLOW_TOOL_IDS),
  reason: z.string(),
  args: z.record(z.string(), z.unknown()),
});

const TOOL_GUIDE_REFERENCE_SCHEMA = z.object({
  name: z.string(),
  kind: z.string(),
  summary: z.string(),
  overview: z.string().nullable(),
});

const TOOL_STARTER_CODE_SNIPPET_SCHEMA = z.object({
  label: z.string(),
  language: z.enum(["tsx", "css"]),
  code: z.string(),
  notes: z.array(z.string()).optional(),
  source_urls: z.array(z.string()).optional(),
});

const TOOL_COMPOSITION_SLOT_SCHEMA = z.object({
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
});

const TOOL_OPEN_QUESTION_SCHEMA = z.object({
  kind: z.enum([
    "component-choice",
    "pattern-scope",
    "layout-choice",
    "evidence-gap",
  ]),
  topic: z.string(),
  prompt: z.string(),
  choices: z.array(z.string()),
  reason: z.string(),
  ask_before_proceeding: z.literal(true),
  source_urls: z.array(z.string()),
});

const TOOL_COMPOSITION_CONTRACT_SCHEMA = z.object({
  primary_target: z.object({
    solution_type: z.enum(["component", "pattern", "foundation", "token"]),
    name: z.string().nullable(),
  }),
  expected_patterns: z.array(z.string()),
  expected_components: z.array(z.string()),
  slots: z.array(TOOL_COMPOSITION_SLOT_SCHEMA),
  avoid: z.array(z.string()),
  source_urls: z.array(z.string()),
});

const TOOL_WORKFLOW_INTENT_SCHEMA = z.object({
  user_task: z.string(),
  key_interaction: z.string(),
  composition_direction: z.string(),
  canonical_choice: z.string().nullable(),
  rule_ids: z.array(z.string()),
});

const TOOL_STARTER_VALIDATION_SCHEMA = z.object({
  status: z.enum(["clean", "needs_attention"]),
  snippets_checked: z.number().int(),
  errors: z.number().int(),
  warnings: z.number().int(),
  infos: z.number().int(),
  fix_count: z.number().int(),
  migration_count: z.number().int(),
  top_issue: z.string().nullable(),
  next_step: z.string().nullable(),
  source_urls: z.array(z.string()),
});

const TOOL_WORKFLOW_READINESS_SCHEMA = z.object({
  status: z.enum([
    "guidance_only",
    "starter_validated",
    "starter_needs_attention",
  ]),
  implementation_ready: z.boolean(),
  reason: z.string(),
});

const TOOL_WORKFLOW_CONTEXT_REQUIREMENT_SCHEMA = z.union([
  z.object({
    status: z.literal("context_required"),
    repo_specific_edits_ready: z.literal(false),
    reason: z.string(),
    suggested_follow_up_tool: z.literal("get_salt_project_context"),
    suggested_follow_up_cli: z.literal("salt-ds info --json"),
  }),
  z.object({
    status: z.literal("context_checked"),
    repo_specific_edits_ready: z.literal(true),
    reason: z.string(),
    satisfied_by: z.literal("salt-ds info"),
  }),
]);

const TOOL_FIX_CANDIDATE_SCHEMA = z.object({
  candidate_type: z.enum(["migration", "guided_fix"]),
  safety: z.enum(["deterministic", "manual_review"]),
  kind: z.string().nullable(),
  title: z.string(),
  recommendation: z.string().nullable(),
  from: z.string().nullable(),
  to: z.string().nullable(),
  reason: z.string().nullable(),
  category: z.string().nullable(),
  rule: z.string().nullable(),
  rule_id: z.string().nullable(),
  source_urls: z.array(z.string()),
});

const TOOL_FIX_CANDIDATES_SCHEMA = z.object({
  total_count: z.number().int(),
  deterministic_count: z.number().int(),
  manual_review_count: z.number().int(),
  candidates: z.array(TOOL_FIX_CANDIDATE_SCHEMA),
  notes: z.array(z.string()),
});

const TOOL_ISSUE_CLASS_SCHEMA = z.object({
  rule_id: z.string(),
  label: z.string(),
  description: z.string(),
  count: z.number().int(),
  semantic_categories: z.array(z.string()),
  semantic_rules: z.array(z.string()),
});

const TOOL_PROJECT_CONVENTIONS_CHECK_SCHEMA = z.object({
  supported: z.boolean(),
  contract: z.literal("project_conventions_v1"),
  check_recommended: z.boolean(),
  topics: z.array(z.string()),
  reason: z.string(),
  canonical_only: z.literal(true),
  declared_policy_status: z.enum([
    "unknown-until-project-context",
    "none-declared",
    "team-declared",
    "stack-declared",
  ]),
  policy_paths: z.tuple([
    z.literal(".salt/team.json"),
    z.literal(".salt/stack.json"),
  ]),
  suggested_follow_up_tool: z.literal("get_salt_project_context"),
  suggested_follow_up_cli: z.literal("salt-ds info --json"),
  next_step: z.string(),
});

const TOOL_WORKFLOW_PROVENANCE_SCHEMA = z.object({
  canonical_source_urls: z.array(z.string()),
  related_guide_urls: z.array(z.string()),
  starter_source_urls: z.array(z.string()),
  source_urls: z.array(z.string()),
  guidance_signals: z.array(z.string()),
  project_conventions_contract: z.literal("project_conventions_v1"),
});

const TOOL_REVIEW_IDE_SUMMARY_SCHEMA = z.object({
  verdict: z.object({
    level: z.enum(["clean", "medium_risk", "high_risk"]),
    summary: z.string(),
  }),
  top_findings: z.array(z.string()),
  safest_next_fix: z.string().nullable(),
  verify: z.array(z.string()),
});

const TOOL_UPGRADE_IDE_SUMMARY_SCHEMA = z.object({
  target: z.string().nullable(),
  from_version: z.string().nullable(),
  to_version: z.string().nullable(),
  required_changes: z.array(z.string()),
  optional_cleanup: z.array(z.string()),
  suggested_order: z.array(z.string()),
  verify: z.array(z.string()),
});

const TOOL_CREATE_IDE_SUMMARY_SCHEMA = z.object({
  recommended_direction: z.string(),
  bounded_scope: z.array(z.string()),
  open_question: z.string().nullable(),
  starter_plan: z.array(z.string()),
  verify: z.array(z.string()),
});

const TOOL_CREATE_IMPLEMENTATION_GATE_SCHEMA = z.object({
  status: z.enum(["clear", "follow_through_required"]),
  reason: z.string(),
  required_follow_through: z.array(z.string()),
  blocking_questions: z.array(z.string()),
  next_step: z.string().nullable(),
});

const TOOL_MIGRATE_IDE_SUMMARY_SCHEMA = z.object({
  screen_map: z.array(z.string()),
  preserve: z.array(z.string()),
  needs_confirmation: z.array(z.string()),
  recommended_direction: z.array(z.string()),
  first_scaffold: z.array(z.string()),
  verify: z.array(z.string()),
});

const TOOL_PROJECT_POLICY_WRAPPER_SCHEMA = z.object({
  name: z.string(),
  wraps: z.string(),
  reason: z.string(),
  import: z
    .object({
      from: z.string(),
      name: z.string(),
    })
    .nullable(),
  useWhen: z.array(z.string()),
  avoidWhen: z.array(z.string()),
  migrationShim: z.boolean(),
  sourceUrls: z.array(z.string()),
});

const TOOL_PROJECT_POLICY_SCHEMA = z.object({
  policyMode: z.enum(["none", "team", "stack"]),
  declared: z.boolean(),
  layersConsulted: z.array(
    z.object({
      id: z.string(),
      scope: z.string(),
      source: z.string().nullable(),
    }),
  ),
  sharedPacks: z.array(z.string()),
  approvedWrappers: z.array(z.string()),
  approvedWrapperDetails: z.array(TOOL_PROJECT_POLICY_WRAPPER_SCHEMA),
  themeDefaults: z
    .object({
      provider: z.string(),
      providerImport: z
        .object({
          from: z.string(),
          name: z.string(),
        })
        .nullable(),
      imports: z.array(z.string()),
      props: z.array(
        z.object({
          name: z.string(),
          value: z.string(),
        }),
      ),
      reason: z.string().nullable(),
      sourceUrls: z.array(z.string()),
    })
    .nullable(),
  tokenAliases: z.array(
    z.object({
      saltName: z.string(),
      prefer: z.string(),
      reason: z.string(),
      sourceUrls: z.array(z.string()),
    }),
  ),
  tokenFamilyPolicies: z.array(
    z.object({
      family: z.string(),
      mode: z.string(),
      reason: z.string(),
      sourceUrls: z.array(z.string()),
    }),
  ),
  warnings: z.array(z.string()),
  sourceUrls: z.array(z.string()),
});

const TOOL_REPO_REFINEMENT_SCHEMA = z.object({
  status: z.enum(["canonical_only", "refined_by_project_policy"]),
  canonical_name: z.string().nullable(),
  final_name: z.string().nullable(),
  source: z.enum(["canonical_salt", "project_policy"]),
  reason: z.string(),
  wrapper: TOOL_PROJECT_POLICY_WRAPPER_SCHEMA.nullable(),
  source_urls: z.array(z.string()),
});

const TOOL_CREATE_RESULT_SCHEMA = z.object({
  mode: z.enum(["recommend", "compare"]),
  solution_type: z.enum(["component", "pattern", "foundation", "token"]),
  guidance_boundary: TOOL_GUIDANCE_BOUNDARY_SCHEMA,
  ide_summary: TOOL_CREATE_IDE_SUMMARY_SCHEMA,
  guidance_sources: z.array(z.string()).optional(),
  decision: z.object({
    name: z.string().nullable(),
    why: z.string(),
  }),
  recommended: z.record(z.string(), z.unknown()).nullable().optional(),
  alternatives: z.array(z.record(z.string(), z.unknown())).optional(),
  compared: z.array(z.record(z.string(), z.unknown())).optional(),
  differences: z
    .array(
      z.object({
        criterion: z.string(),
        values: z.array(
          z.object({
            name: z.string(),
            value: z.union([z.string(), z.boolean(), z.number(), z.null()]),
          }),
        ),
      }),
    )
    .optional(),
  next_step: z.string().optional(),
  did_you_mean: z.array(z.string()).optional(),
  ambiguity: z.record(z.string(), z.unknown()).optional(),
  composition_contract: TOOL_COMPOSITION_CONTRACT_SCHEMA.nullable().optional(),
  open_questions: z.array(TOOL_OPEN_QUESTION_SCHEMA).optional(),
  final_decision: z.object({
    name: z.string().nullable(),
    source: z.enum(["canonical_salt", "project_policy"]),
  }),
});

const CREATE_WORKFLOW_ENVELOPE_SCHEMA = z.object({
  workflow: z.object({
    id: z.literal("create_salt_ui"),
    transport_used: z.literal("mcp"),
    implementation_gate: TOOL_CREATE_IMPLEMENTATION_GATE_SCHEMA,
    confidence: WORKFLOW_CONFIDENCE_SCHEMA,
    intent: TOOL_WORKFLOW_INTENT_SCHEMA,
    readiness: TOOL_WORKFLOW_READINESS_SCHEMA,
    context_requirement: TOOL_WORKFLOW_CONTEXT_REQUIREMENT_SCHEMA,
    project_conventions_check: TOOL_PROJECT_CONVENTIONS_CHECK_SCHEMA,
    provenance: TOOL_WORKFLOW_PROVENANCE_SCHEMA,
  }),
  result: TOOL_CREATE_RESULT_SCHEMA,
  artifacts: z.object({
    starter_code: z.array(TOOL_STARTER_CODE_SNIPPET_SCHEMA).optional(),
    starter_validation: TOOL_STARTER_VALIDATION_SCHEMA.nullable(),
    project_policy: TOOL_PROJECT_POLICY_SCHEMA.nullable(),
    repo_refinement: TOOL_REPO_REFINEMENT_SCHEMA.nullable(),
    suggested_follow_ups: z.array(TOOL_SUGGESTED_FOLLOW_UP_SCHEMA).optional(),
    related_guides: z.array(TOOL_GUIDE_REFERENCE_SCHEMA).optional(),
    raw: z.record(z.string(), z.unknown()).optional(),
  }),
  sources: z.array(TOOL_SOURCE_SCHEMA),
});

const REVIEW_WORKFLOW_ENVELOPE_SCHEMA = z.object({
  workflow: z.object({
    id: z.literal("review_salt_ui"),
    transport_used: z.literal("mcp"),
    confidence: WORKFLOW_CONFIDENCE_SCHEMA,
    project_conventions_check: TOOL_PROJECT_CONVENTIONS_CHECK_SCHEMA,
    provenance: TOOL_WORKFLOW_PROVENANCE_SCHEMA,
  }),
  result: z.object({
    guidance_boundary: TOOL_GUIDANCE_BOUNDARY_SCHEMA,
    ide_summary: TOOL_REVIEW_IDE_SUMMARY_SCHEMA,
    decision: z.object({
      status: z.enum(["clean", "needs_attention"]),
      why: z.string(),
    }),
    summary: z.object({
      errors: z.number().int(),
      warnings: z.number().int(),
      infos: z.number().int(),
      fix_count: z.number().int(),
      migration_count: z.number().int(),
    }),
    fixes: z.array(z.record(z.string(), z.unknown())).optional(),
    issues: z.array(z.record(z.string(), z.unknown())).optional(),
    migrations: z.array(z.record(z.string(), z.unknown())).optional(),
    missing_data: z.array(z.string()),
    next_step: z.string().optional(),
    source_urls: z.array(z.string()),
  }),
  artifacts: z.object({
    project_policy: TOOL_PROJECT_POLICY_SCHEMA.nullable(),
    fix_candidates: TOOL_FIX_CANDIDATES_SCHEMA,
    issue_classes: z.array(TOOL_ISSUE_CLASS_SCHEMA),
    rule_ids: z.array(z.string()),
    raw: z.record(z.string(), z.unknown()).optional(),
  }),
  sources: z.array(TOOL_SOURCE_SCHEMA),
});

const MIGRATE_WORKFLOW_ENVELOPE_SCHEMA = z.object({
  workflow: z.object({
    id: z.literal("migrate_to_salt"),
    transport_used: z.literal("mcp"),
    confidence: WORKFLOW_CONFIDENCE_SCHEMA,
    readiness: TOOL_WORKFLOW_READINESS_SCHEMA,
    context_requirement: TOOL_WORKFLOW_CONTEXT_REQUIREMENT_SCHEMA,
    project_conventions_check: TOOL_PROJECT_CONVENTIONS_CHECK_SCHEMA,
    provenance: TOOL_WORKFLOW_PROVENANCE_SCHEMA,
  }),
  result: z
    .object({
      guidance_boundary: TOOL_GUIDANCE_BOUNDARY_SCHEMA,
      ide_summary: TOOL_MIGRATE_IDE_SUMMARY_SCHEMA,
      source_profile: z.object({
        code_provided: z.boolean(),
        query_provided: z.boolean(),
        detected_libraries: z.array(z.string()),
        contains_salt: z.boolean(),
        ui_flavor: z.enum([
          "description",
          "salt",
          "mixed",
          "external-ui",
          "generic-react",
        ]),
      }),
      summary: z.object({
        detections: z.number().int(),
        direct_replacements: z.number().int(),
        pattern_rewrites: z.number().int(),
        foundation_mappings: z.number().int(),
        manual_reviews: z.number().int(),
        confirmation_required: z.number().int(),
      }),
      translations: z.array(z.record(z.string(), z.unknown())),
      migration_plan: z.array(z.string()),
      migration_checkpoints: z.array(z.record(z.string(), z.unknown())),
      next_step: z.string().optional(),
      source_urls: z.array(z.string()),
    })
    .passthrough(),
  artifacts: z.object({
    starter_code: z.array(TOOL_STARTER_CODE_SNIPPET_SCHEMA).optional(),
    combined_scaffold: z.array(TOOL_STARTER_CODE_SNIPPET_SCHEMA).optional(),
    starter_validation: TOOL_STARTER_VALIDATION_SCHEMA.nullable(),
    project_policy: TOOL_PROJECT_POLICY_SCHEMA.nullable(),
    rule_ids: z.array(z.string()),
    post_migration_verification: z.lazy(
      () => TOOL_POST_MIGRATION_VERIFICATION_SCHEMA,
    ),
    visual_evidence_contract: z.lazy(
      () => TOOL_VISUAL_EVIDENCE_CONTRACT_SCHEMA,
    ),
    suggested_follow_ups: z.array(TOOL_SUGGESTED_FOLLOW_UP_SCHEMA).optional(),
    related_guides: z.array(TOOL_GUIDE_REFERENCE_SCHEMA).optional(),
    raw: z.record(z.string(), z.unknown()).optional(),
  }),
  sources: z.array(TOOL_SOURCE_SCHEMA),
});

const UPGRADE_WORKFLOW_ENVELOPE_SCHEMA = z.object({
  workflow: z.object({
    id: z.literal("upgrade_salt_ui"),
    transport_used: z.literal("mcp"),
    confidence: WORKFLOW_CONFIDENCE_SCHEMA,
    project_conventions_check: TOOL_PROJECT_CONVENTIONS_CHECK_SCHEMA,
    provenance: TOOL_WORKFLOW_PROVENANCE_SCHEMA,
  }),
  result: z.object({
    mode: z.enum(["compare", "history"]),
    guidance_boundary: TOOL_GUIDANCE_BOUNDARY_SCHEMA,
    decision: z.object({
      target: z.string().nullable(),
      from_version: z.string().nullable(),
      to_version: z.string().nullable(),
      why: z.string(),
    }),
    ide_summary: TOOL_UPGRADE_IDE_SUMMARY_SCHEMA,
    breaking: z.array(z.string()).optional(),
    important: z.array(z.string()).optional(),
    nice_to_know: z.array(z.string()).optional(),
    changes: z.array(z.record(z.string(), z.unknown())).optional(),
    deprecations: z.array(z.record(z.string(), z.unknown())).optional(),
    next_steps: z.array(z.string()).optional(),
    next_step: z.string().optional(),
    docs: z.array(z.string()).optional(),
    notes: z.array(z.string()).optional(),
    did_you_mean: z.array(z.string()).optional(),
    resolved_target: z
      .object({
        package: z.string().nullable(),
        component: z.string().nullable(),
        matched_by: z.array(z.enum(["name", "alias"])).optional(),
      })
      .optional(),
    ambiguity: z.record(z.string(), z.unknown()).optional(),
  }),
  artifacts: z.object({
    rule_ids: z.array(z.string()),
    raw: z.record(z.string(), z.unknown()).optional(),
  }),
  sources: z.array(TOOL_SOURCE_SCHEMA),
});

const TOOL_POST_MIGRATION_VERIFICATION_SCHEMA = z.object({
  source_checks: z.array(z.string()),
  runtime_checks: z.array(z.string()),
  preserve_checks: z.array(z.string()),
  confirmation_checks: z.array(z.string()),
  suggested_workflow: z.literal("review_salt_ui"),
  suggested_command: z.string(),
});

const TOOL_VISUAL_EVIDENCE_CONTRACT_SCHEMA = z.object({
  role: z.literal("supporting-evidence"),
  not_canonical_source_of_truth: z.literal(true),
  supported_inputs: z.array(
    z.enum([
      "structured-outline",
      "current-ui-capture",
      "mockup-image",
      "screenshot-file",
      "image-url",
    ]),
  ),
  interpretation_owner: z.literal("agent-or-adapter"),
  normalization_required: z.literal(true),
  normalization_contract: z.literal("migrate_visual_evidence_v1"),
  structured_outputs: z.array(
    z.enum([
      "landmarks",
      "action-hierarchy",
      "layout-signals",
      "familiarity-anchors",
      "confidence-impact",
    ]),
  ),
  source_outline_provided: z.boolean(),
  source_outline_signal_counts: z.object({
    regions: z.number().int(),
    actions: z.number().int(),
    states: z.number().int(),
    notes: z.number().int(),
  }),
  derived_outline_available: z.boolean(),
  derived_outline_signal_counts: z.object({
    regions: z.number().int(),
    actions: z.number().int(),
    states: z.number().int(),
    notes: z.number().int(),
  }),
  visual_input_count: z.number().int(),
  visual_input_kinds: z.array(z.enum(["mockup", "screenshot"])),
  visual_input_sources: z.array(z.enum(["file", "url"])),
  runtime_capture: z.object({
    supported_via_cli: z.literal(true),
    command: z.literal("salt-ds migrate --url <url>"),
    purpose: z.string(),
  }),
  confidence_impact: z.object({
    level: z.enum(["none", "supporting"]),
    reasons: z.array(z.string()),
  }),
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
    blocking_workflows: z.array(z.enum(["review", "migrate", "upgrade"])),
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
  context_id: z.string(),
  root_dir: z.string(),
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

const CONTEXT_WORKFLOW_ENVELOPE_SCHEMA = z.object({
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
    }),
    notes: z.array(z.string()),
  }),
  sources: z.array(TOOL_SOURCE_SCHEMA),
});

const BOOTSTRAP_WORKFLOW_ENVELOPE_SCHEMA = z.object({
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

const CONTEXT_OUTPUT_SCHEMA = CONTEXT_WORKFLOW_ENVELOPE_SCHEMA;
const BOOTSTRAP_OUTPUT_SCHEMA = BOOTSTRAP_WORKFLOW_ENVELOPE_SCHEMA;
const CHOOSE_OUTPUT_SCHEMA = CREATE_WORKFLOW_ENVELOPE_SCHEMA;

const ANALYZE_OUTPUT_SCHEMA = REVIEW_WORKFLOW_ENVELOPE_SCHEMA;

const TRANSLATE_OUTPUT_SCHEMA = MIGRATE_WORKFLOW_ENVELOPE_SCHEMA;

const COMPARE_OUTPUT_SCHEMA = UPGRADE_WORKFLOW_ENVELOPE_SCHEMA;

const DEFAULT_TOOL_ORDER = PUBLIC_WORKFLOW_TOOL_IDS;

const SUPPORT_TOOL_ORDER = [
  "get_salt_entity",
  "get_salt_examples",
  "discover_salt",
] as const;

const ALL_TOOL_DEFINITIONS: readonly ToolDefinition[] = [
  defineTool<{ root_dir?: string; include_policy_diagnostics?: boolean }>({
    name: "get_salt_project_context",
    description:
      "Inspect repo context for advanced Salt workflow debugging or explicit context reuse. Detect the local framework, workspace shape, Salt package usage, repo instructions, declared project policy, and likely runtime targets. The main create, review, and migrate workflows can auto-collect this context when context_id is omitted.",
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
      const contextId = buildSaltProjectContextId(context.root_dir);
      if (runtime) {
        runtime.projectContexts.set(contextId, context);
      }
      return toSaltProjectContextResult(context, contextId);
    },
  }),
  defineTool<{
    root_dir?: string;
    project_name?: string;
    create_stack?: boolean;
    conventions_pack_source?: string;
    host_adapters?: Array<"vscode">;
    add_ui_verify?: boolean;
  }>({
    name: "bootstrap_salt_repo",
    description:
      "Bootstrap durable Salt repo state for this repo. Creates or updates .salt policy files and the managed root repo instruction block so future workflow runs can apply repo-specific overlays safely. This is optional for first-run canonical Salt value.",
    inputSchema: {
      root_dir: z
        .string()
        .optional()
        .describe(
          "Optional repo root to bootstrap. Defaults to the current MCP working directory.",
        ),
      project_name: z
        .string()
        .optional()
        .describe(
          "Optional explicit project name to write into the generated project-conventions files.",
        ),
      create_stack: z
        .boolean()
        .optional()
        .describe(
          "Create a layered .salt/stack.json in addition to .salt/team.json. Use this when shared upstream conventions are real.",
        ),
      conventions_pack_source: z
        .string()
        .optional()
        .describe(
          "Optional shared conventions pack source in package[#export] form. Implies create_stack = true.",
        ),
      host_adapters: z
        .array(z.enum(["vscode"]))
        .optional()
        .describe(
          "Optional host adapter files to scaffold. Omit to keep bootstrap host-neutral by default.",
        ),
      add_ui_verify: z
        .boolean()
        .optional()
        .describe(
          "Add a repo-local ui:verify script wrapper around salt-ds review. Omit to leave package.json unchanged by default.",
        ),
    },
    outputSchema: BOOTSTRAP_OUTPUT_SCHEMA,
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
    execute: async (registry, args, runtime) => {
      const bootstrapped = await bootstrapSaltRepo(registry, args);
      if (runtime) {
        runtime.projectContexts.set(
          bootstrapped.context_id,
          bootstrapped.context_data,
        );
      }
      return bootstrapped.result;
    },
  }),
  defineTool<Parameters<typeof discoverSalt>[1]>({
    name: "discover_salt",
    description:
      "Use this for broad, ambiguous, or exploratory Salt requests when the caller is not yet sure which Salt entity or workflow they need. It searches, clarifies intent, and routes to the best next Salt workflow. Treat this as support routing, not the default front door for repo-aware workflows.",
    inputSchema: {
      query: z
        .string()
        .optional()
        .describe(
          "Broad Salt question or exploratory UI request. Use this when the user is still figuring out the right Salt entity or workflow.",
        ),
      area: z
        .enum(SEARCH_AREAS)
        .optional()
        .describe(
          "Optional high-level Salt area to browse or search within, such as components, foundations, patterns, or tokens.",
        ),
      package: z
        .string()
        .optional()
        .describe(
          "Optional package filter when discovery should stay within one Salt package, such as @salt-ds/core or @salt-ds/lab.",
        ),
      status: z
        .enum(STATUSES)
        .optional()
        .describe(
          "Optional release-status filter. Use stable when discovery should avoid beta, lab, or deprecated results.",
        ),
      related_to: z
        .object({
          entity_type: z.enum([
            "component",
            "pattern",
            "token",
            "guide",
            "page",
          ]),
          name: z.string(),
          package: z.string().optional(),
        })
        .optional()
        .describe(
          "Start from a known Salt entity and explore nearby related entities instead of resolving one exact item.",
        ),
      view: z
        .enum(VIEWS)
        .optional()
        .describe(
          "Use full to include routing evidence and raw search payloads.",
        ),
    },
    execute: discoverSalt,
  }),
  defineTool<Parameters<typeof migrateToSalt>[1] & { context_id?: string }>({
    name: "migrate_to_salt",
    description:
      "Primary fit for the salt-ds migrate workflow. Use this when the input is non-Salt UI code, external UI, native/custom React UI, or a rough interface description that needs to be translated into Salt primitives, patterns, and migration steps. It returns canonical Salt migration guidance plus repo-policy artifacts from the resolved project context when declared policy exists. If context_id is omitted, the MCP collects repo context automatically before continuing.",
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
      form_field_support: z.boolean().optional(),
      include_starter_code: z
        .boolean()
        .optional()
        .describe(
          "Defaults to true. Set false only when you explicitly want planning guidance without starter code.",
        ),
      view: z
        .enum(VIEWS)
        .optional()
        .describe(
          "Use full to include the raw detection signals and recommendation payloads.",
        ),
      context_id: z
        .string()
        .optional()
        .describe(
          "Optional repo context id returned by get_salt_project_context. If omitted, the MCP collects repo context automatically for the current working directory.",
        ),
    },
    outputSchema: TRANSLATE_OUTPUT_SCHEMA,
    annotations: READ_ONLY_WORKFLOW_TOOL_ANNOTATIONS,
    execute: async (registry, args, runtime) => {
      const { context_id, ...workflowArgs } = args;
      const projectContext = await resolveOrCollectProjectContext(
        registry,
        runtime,
        context_id,
      );

      return withTranslateWorkflowGuidance(
        registry,
        migrateToSalt(registry, workflowArgs),
        {
          source_outline: workflowArgs.source_outline,
          context_checked: true,
          project_policy:
            await loadWorkflowProjectPolicyArtifactForContext(projectContext),
        },
      );
    },
  }),
  defineTool<Parameters<typeof createSaltUi>[1] & { context_id?: string }>({
    name: "create_salt_ui",
    description:
      "Primary fit for the salt-ds create workflow. Use this for Salt recommendation or side-by-side comparison. If names is present, comparison mode wins; otherwise query drives recommendation mode. It returns canonical Salt guidance plus repo-policy artifacts from the resolved project context when declared policy exists. If context_id is omitted, the MCP collects repo context automatically before continuing.",
    inputSchema: {
      query: z
        .string()
        .optional()
        .describe(
          "Recommendation mode only. Describe the user need, task, flow, styling need, or capability requirement when you want Salt to suggest the best fit.",
        ),
      names: z
        .array(z.string())
        .optional()
        .describe(
          "Comparison mode. Provide 2 or more exact Salt names to compare side by side. If present, this tool compares those names instead of recommending from query.",
        ),
      solution_type: z
        .enum(["auto", "component", "pattern", "foundation", "token"])
        .optional()
        .describe(
          "Optional solution-family hint when the request already points to components, patterns, foundations, or tokens.",
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
      top_k: z.number().int().min(1).max(25).optional(),
      production_ready: z.boolean().optional(),
      prefer_stable: z.boolean().optional(),
      a11y_required: z.boolean().optional(),
      form_field_support: z.boolean().optional(),
      include_starter_code: z
        .boolean()
        .optional()
        .describe(
          "Defaults to true. Set false only when you explicitly want planning guidance without starter code.",
        ),
      view: z
        .enum(VIEWS)
        .optional()
        .describe(
          "Use full to include raw comparison or recommendation evidence.",
        ),
      context_id: z
        .string()
        .optional()
        .describe(
          "Optional repo context id returned by get_salt_project_context. If omitted, the MCP collects repo context automatically for the current working directory.",
        ),
    },
    outputSchema: CHOOSE_OUTPUT_SCHEMA,
    annotations: READ_ONLY_WORKFLOW_TOOL_ANNOTATIONS,
    execute: async (registry, args, runtime) => {
      const { context_id, ...workflowArgs } = args;
      const projectContext = await resolveOrCollectProjectContext(
        registry,
        runtime,
        context_id,
      );

      return withChooseWorkflowGuidance(
        registry,
        createSaltUi(registry, workflowArgs),
        {
          query: workflowArgs.query,
          context_checked: true,
          project_policy:
            await loadWorkflowProjectPolicyArtifactForContext(projectContext),
        },
      );
    },
  }),
  defineTool<Parameters<typeof getSaltEntity>[1]>({
    name: "get_salt_entity",
    description:
      "Use this as a support lookup when a create, migrate, or review workflow already knows the Salt entity it needs to ground. Resolve a specific or almost-specific component, pattern, foundation, token, guide, page, package, icon, or country symbol. Do not use this for broad discovery or recommendation/comparison.",
    inputSchema: {
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
          "icon",
          "country_symbol",
        ])
        .optional()
        .describe(
          "Set this when you already know the Salt entity family. Leave it as auto when the name or query could match different entity types.",
        ),
      name: z
        .string()
        .optional()
        .describe(
          "Known or near-known Salt entity name. Prefer this when the caller already has a specific component, token, guide, icon, or other entity in mind.",
        ),
      query: z
        .string()
        .optional()
        .describe(
          "Near-known backup query when the caller roughly knows the entity but not the exact Salt name.",
        ),
      package: z
        .string()
        .optional()
        .describe(
          "Optional package filter when the entity should resolve within a specific Salt package, such as @salt-ds/core or @salt-ds/lab.",
        ),
      status: z
        .enum(STATUSES)
        .optional()
        .describe(
          "Optional release-status filter. Use stable when the lookup should avoid beta, lab, or deprecated matches.",
        ),
      include: z
        .array(z.enum(INCLUDE_SECTIONS))
        .optional()
        .describe(
          "Optional extra sections to include on the resolved entity, such as examples, props, tokens, accessibility, deprecations, or changes.",
        ),
      include_related: z
        .boolean()
        .optional()
        .describe(
          "Include nearby related Salt entities after resolving the main match.",
        ),
      include_starter_code: z
        .boolean()
        .optional()
        .describe(
          "Include a lightweight starter snippet when the resolved entity already has one.",
        ),
      max_results: z
        .number()
        .int()
        .min(1)
        .max(50)
        .optional()
        .describe(
          "Maximum nearby matches to return when the lookup is not exact.",
        ),
      include_deprecated: z
        .boolean()
        .optional()
        .describe("Include deprecated token matches when looking up tokens."),
      view: z
        .enum(VIEWS)
        .optional()
        .describe(
          "Use full to include raw lookup and fallback search payloads.",
        ),
    },
    execute: getSaltEntity,
  }),
  defineTool<Parameters<typeof getSaltExamples>[1]>({
    name: "get_salt_examples",
    description:
      "Use this as a grounding step after create or migrate when the agent already has a likely Salt target and needs stronger implementation evidence before writing code.",
    inputSchema: {
      target_type: z.enum(["component", "pattern"]).optional(),
      target_name: z.string().optional(),
      package: z.string().optional(),
      query: z
        .string()
        .optional()
        .describe("Scenario or intent query used to rank examples."),
      complexity: z.enum(["basic", "intermediate", "advanced"]).optional(),
      include_code: z.boolean().optional(),
      include_starter_code: z.boolean().optional(),
      max_results: z.number().int().min(1).max(50).optional(),
      view: z
        .enum(VIEWS)
        .optional()
        .describe("Use full to include the ranked example list."),
    },
    execute: getSaltExamples,
  }),
  defineTool<Parameters<typeof reviewSaltUi>[1] & { context_id?: string }>({
    name: "review_salt_ui",
    description:
      "Primary fit for the salt-ds review workflow, and also used inside upgrade flows. Analyze existing React and Salt code. Validate usage, detect deprecated APIs and patterns, suggest fixes, and surface migration guidance. If context_id is omitted, the MCP collects repo context automatically before continuing.",
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
      view: z
        .enum(VIEWS)
        .optional()
        .describe(
          "Use full to include raw validation, fix, and migration payloads.",
        ),
      context_id: z
        .string()
        .optional()
        .describe(
          "Optional repo context id returned by get_salt_project_context. If omitted, the MCP collects repo context automatically for the current working directory.",
        ),
    },
    outputSchema: ANALYZE_OUTPUT_SCHEMA,
    annotations: READ_ONLY_WORKFLOW_TOOL_ANNOTATIONS,
    execute: async (registry, args, runtime) => {
      const { context_id, ...workflowArgs } = args;
      const projectContext = await resolveOrCollectProjectContext(
        registry,
        runtime,
        context_id,
      );

      return withAnalyzeWorkflowGuidance(reviewSaltUi(registry, workflowArgs), {
        code: workflowArgs.code,
        project_policy:
          await loadWorkflowProjectPolicyArtifactForContext(projectContext),
      });
    },
  }),
  defineTool<Parameters<typeof upgradeSaltUi>[1]>({
    name: "upgrade_salt_ui",
    description:
      "Primary fit for the salt-ds upgrade workflow after project context is known. Explain Salt upgrade impact between versions, highlight breaking changes, and suggest the next migration actions.",
    inputSchema: {
      package: z.string().optional(),
      component_name: z.string().optional(),
      from_version: z.string().describe("Lower version boundary."),
      to_version: z
        .string()
        .optional()
        .describe(
          "Upper version boundary. Defaults to the latest known boundary.",
        ),
      include_deprecations: z.boolean().optional(),
      kinds: z.array(z.enum(CHANGE_KINDS)).optional(),
      max_results: z.number().int().min(1).max(100).optional(),
      view: z
        .enum(VIEWS)
        .optional()
        .describe(
          "Use full to include the filtered change and deprecation records.",
        ),
    },
    outputSchema: COMPARE_OUTPUT_SCHEMA,
    annotations: READ_ONLY_WORKFLOW_TOOL_ANNOTATIONS,
    execute: (registry, args) =>
      withCompareWorkflowGuidance(upgradeSaltUi(registry, args)),
  }),
];

const WORKFLOW_TOOL_DEFINITIONS: readonly ToolDefinition[] =
  ALL_TOOL_DEFINITIONS.filter((definition) =>
    DEFAULT_TOOL_ORDER.includes(
      definition.name as (typeof DEFAULT_TOOL_ORDER)[number],
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
  ...SUPPORT_TOOL_ORDER.map(
    (name, index) => [name, DEFAULT_TOOL_ORDER.length + index] as const,
  ),
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
