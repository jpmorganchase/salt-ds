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
  isSaltProjectContextReadyForRepoAwareWork,
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
}

export function createToolExecutionRuntime(): ToolExecutionRuntime {
  return {
    projectContexts: new Map(),
    lastProjectContextId: null,
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
    } else {
      runtime.lastProjectContextId = null;
    }
  }

  return contextId;
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
    return resolveProjectContext(runtime, options.contextId);
  }

  if (options.rootDir) {
    const context = await collectSaltProjectContextData(registry, {
      root_dir: options.rootDir,
    });
    cacheProjectContext(runtime, context);
    return context;
  }

  const lastProjectContextId = runtime?.lastProjectContextId;
  if (lastProjectContextId && runtime?.projectContexts.size === 1) {
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
const MCP_WORKFLOW_OUTPUT_SCHEMA = z.object({}).passthrough();
const CHOOSE_OUTPUT_SCHEMA = MCP_WORKFLOW_OUTPUT_SCHEMA;
const ANALYZE_OUTPUT_SCHEMA = MCP_WORKFLOW_OUTPUT_SCHEMA;
const TRANSLATE_OUTPUT_SCHEMA = MCP_WORKFLOW_OUTPUT_SCHEMA;
const COMPARE_OUTPUT_SCHEMA = MCP_WORKFLOW_OUTPUT_SCHEMA;

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
  defineTool<
    Parameters<typeof migrateToSalt>[1] & {
      context_id?: string;
      root_dir?: string;
    }
  >({
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
          context_id: isSaltProjectContextReadyForRepoAwareWork(projectContext)
            ? buildSaltProjectContextId(projectContext.root_dir)
            : null,
          project_policy:
            await loadWorkflowProjectPolicyArtifactForContext(projectContext),
          view: workflowArgs.view,
        },
      );
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
      "Primary Salt create workflow. Resolve the nearest canonical Salt owner and current workflow state from query, or compare exact names side by side with names. Use retrieval catalog resources for richer candidate inspection instead of forcing full-mode create to act like broad search.",
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
          "Use full only after compact output has grounded the owner or when you explicitly need additive details such as starter code, composition artifacts, or richer provenance.",
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
          context_id: isSaltProjectContextReadyForRepoAwareWork(projectContext)
            ? buildSaltProjectContextId(projectContext.root_dir)
            : null,
          project_policy:
            await loadWorkflowProjectPolicyArtifactForContext(projectContext),
          view: workflowArgs.view,
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
  defineTool<
    Parameters<typeof reviewSaltUi>[1] & {
      context_id?: string;
      root_dir?: string;
    }
  >({
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
      const semanticView = normalizeWorkflowView(workflowArgs.view);

      return withAnalyzeWorkflowGuidance(
        reviewSaltUi(registry, {
          ...workflowArgs,
          view: semanticView,
        }),
        {
          code: workflowArgs.code,
          project_policy:
            await loadWorkflowProjectPolicyArtifactForContext(projectContext),
          view: workflowArgs.view,
        },
      );
    },
  }),
  defineTool<
    Parameters<typeof upgradeSaltUi>[1] & {
      context_id?: string;
      root_dir?: string;
    }
  >({
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
      context_id: z
        .string()
        .optional()
        .describe(
          "Optional repo context id returned by get_salt_project_context. If omitted, the MCP can collect repo context automatically for the current working directory.",
        ),
      root_dir: z
        .string()
        .optional()
        .describe(
          "Optional repo root to inspect when context_id is not available. Prefer context_id for repeated workflow calls in the same repo.",
        ),
    },
    outputSchema: COMPARE_OUTPUT_SCHEMA,
    annotations: READ_ONLY_WORKFLOW_TOOL_ANNOTATIONS,
    execute: async (registry, args, runtime) => {
      const { context_id, root_dir, ...workflowArgs } = args;
      const projectContext = await resolveOrCollectProjectContext(
        registry,
        runtime,
        { contextId: context_id, rootDir: root_dir },
      );
      const semanticView = normalizeWorkflowView(workflowArgs.view);

      return withCompareWorkflowGuidance(
        upgradeSaltUi(registry, {
          ...workflowArgs,
          view: semanticView,
        }),
        {
          project_policy:
            await loadWorkflowProjectPolicyArtifactForContext(projectContext),
          view: workflowArgs.view,
        },
      );
    },
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
