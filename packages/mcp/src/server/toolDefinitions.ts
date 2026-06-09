import fs from "node:fs/promises";
import path from "node:path";
import {
  buildContextPackBundleReleaseGate,
  buildGeneratedArtifactPersistenceResult,
  checkContextPackBundlePersistence,
  DEFAULT_CONTEXT_PACK_MANIFEST_PATH,
  DEFAULT_CONTEXT_PACK_OUTPUT_DIR,
  toContextPackOutputPathForManifest,
  validateGeneratedArtifactReleaseGate,
  validateSaltReviewReport,
} from "@salt-ds/semantic-core";
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
import { buildMcpFileContextPack } from "./contextPack.js";
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
const UNKNOWN_RECORD_SCHEMA = z.record(z.string(), z.unknown());
const UNKNOWN_RECORD_ARRAY_SCHEMA = z.array(UNKNOWN_RECORD_SCHEMA);

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

async function validateReviewReportFromPath(input: {
  registry: SaltRegistry;
  root_dir?: string;
  report_path: string;
}) {
  const rootDir = path.resolve(process.cwd(), input.root_dir ?? ".");
  const reportPath = path.resolve(rootDir, input.report_path);
  const report = JSON.parse(await fs.readFile(reportPath, "utf8")) as unknown;

  return validateSaltReviewReport({
    report,
    registry: input.registry,
    report_path: reportPath,
  });
}

function isInsideDirectory(parentDir: string, targetPath: string): boolean {
  const relativePath = path.relative(parentDir, targetPath);
  return (
    relativePath.length === 0 ||
    (!relativePath.startsWith("..") && !path.isAbsolute(relativePath))
  );
}

function resolveWritablePathInsideRoot(input: {
  rootDir: string;
  targetPath: string;
  label: string;
}): string {
  const resolvedPath = path.resolve(input.rootDir, input.targetPath);
  if (!isInsideDirectory(input.rootDir, resolvedPath)) {
    throw new Error(
      `${input.label} must resolve inside root_dir for MCP artifact persistence.`,
    );
  }

  return resolvedPath;
}

async function writeExactText(filePath: string, text: string): Promise<void> {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, text, "utf8");
}

async function readTextIfPresent(filePath: string): Promise<string | null> {
  try {
    return await fs.readFile(filePath, "utf8");
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "ENOENT"
    ) {
      return null;
    }
    throw error;
  }
}

async function persistContextPack(input: {
  registry: SaltRegistry;
  rootDir: string;
  outputDir: string;
  manifestPath: string;
}) {
  const outputDirForManifest = toContextPackOutputPathForManifest(
    input.rootDir,
    input.outputDir,
  );
  const manifestPathForCheck = toContextPackOutputPathForManifest(
    input.rootDir,
    input.manifestPath,
  );
  const { bundle } = buildMcpFileContextPack({
    registry: input.registry,
    rootDir: input.rootDir,
    outputDir: input.outputDir,
    outputDirForManifest,
  });
  const releaseGate = buildContextPackBundleReleaseGate({
    bundle,
    registry: input.registry,
    artifact_path: manifestPathForCheck,
  });

  if (!releaseGate.releasable) {
    return {
      contract: "salt_context_pack_persistence_write_v1" as const,
      status: releaseGate.status,
      written: false,
      root_dir: input.rootDir,
      output_dir: outputDirForManifest,
      manifest_path: manifestPathForCheck,
      release_gate: releaseGate,
      persistence_check: checkContextPackBundlePersistence({
        bundle,
        manifest_path: manifestPathForCheck,
        persisted_text_by_path: {},
        output_dir: outputDirForManifest,
      }),
    };
  }

  for (const file of bundle.files) {
    const filePath = resolveWritablePathInsideRoot({
      rootDir: input.rootDir,
      targetPath: file.output_path,
      label: `context pack output ${file.output_path}`,
    });
    await writeExactText(filePath, file.text);
  }
  await writeExactText(
    input.manifestPath,
    JSON.stringify(bundle.manifest, null, 2),
  );

  const persistedTextByPath: Record<string, string | null> = {
    [manifestPathForCheck]: await readTextIfPresent(input.manifestPath),
  };
  for (const file of bundle.files) {
    const filePath = resolveWritablePathInsideRoot({
      rootDir: input.rootDir,
      targetPath: file.output_path,
      label: `context pack output ${file.output_path}`,
    });
    persistedTextByPath[file.output_path] = await readTextIfPresent(filePath);
  }

  const persistenceCheck = checkContextPackBundlePersistence({
    bundle,
    manifest_path: manifestPathForCheck,
    persisted_text_by_path: persistedTextByPath,
    output_dir: outputDirForManifest,
  });

  return {
    contract: "salt_context_pack_persistence_write_v1" as const,
    status:
      persistenceCheck.status === "current"
        ? "written"
        : persistenceCheck.status,
    written: persistenceCheck.current,
    root_dir: input.rootDir,
    output_dir: outputDirForManifest,
    manifest_path: manifestPathForCheck,
    release_gate: releaseGate,
    persistence_check: persistenceCheck,
  };
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
const BOOTSTRAP_OUTPUT_SCHEMA = BOOTSTRAP_WORKFLOW_ENVELOPE_SCHEMA;

const PUBLIC_ACTION_KINDS = [
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
const PUBLIC_WORKFLOW_IDS = [
  "init",
  "create",
  "review",
  "migrate",
  "upgrade",
] as const;
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
const PUBLIC_RETRIEVE_ENTITY_STEP_SCHEMA = z
  .object({
    kind: z.literal("retrieve_entity"),
    tool: z.enum(["get_salt_entity", "create_salt_ui"]),
    args: PUBLIC_ARGS_SCHEMA,
  })
  .extend(PUBLIC_ACTION_HINTS_SHAPE);
const PUBLIC_RETRIEVE_EXAMPLES_STEP_SCHEMA = z
  .object({
    kind: z.literal("retrieve_examples"),
    tool: z.enum(["get_salt_examples", "create_salt_ui"]),
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
const PUBLIC_BOOTSTRAP_REPO_STEP_SCHEMA = z
  .object({
    kind: z.literal("bootstrap_repo"),
    tool: z.enum(["bootstrap_salt_repo", "salt-ds init"]),
    args: PUBLIC_ARGS_SCHEMA.optional(),
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
    tool: z.enum([
      "create_salt_ui",
      "review_salt_ui",
      "migrate_to_salt",
      "upgrade_salt_ui",
    ]),
    args: PUBLIC_ARGS_SCHEMA,
  })
  .extend(PUBLIC_ACTION_HINTS_SHAPE);
const PUBLIC_FIX_CONTEXT_STEP_SCHEMA = z
  .object({
    kind: z.literal("fix_context"),
    tool: z.enum(["get_salt_project_context", "salt-ds info"]),
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
  PUBLIC_BOOTSTRAP_REPO_STEP_SCHEMA,
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
  PUBLIC_BOOTSTRAP_REPO_STEP_SCHEMA.extend(PUBLIC_ACTION_METADATA_SHAPE),
  PUBLIC_IMPLEMENT_STEP_SCHEMA.extend(PUBLIC_ACTION_METADATA_SHAPE),
  PUBLIC_COMPLETE_STEP_SCHEMA.extend(PUBLIC_ACTION_METADATA_SHAPE),
  PUBLIC_REVIEW_STEP_SCHEMA.extend(PUBLIC_ACTION_METADATA_SHAPE),
  PUBLIC_RERUN_WORKFLOW_STEP_SCHEMA.extend(PUBLIC_ACTION_METADATA_SHAPE),
  PUBLIC_FIX_CONTEXT_STEP_SCHEMA.extend(PUBLIC_ACTION_METADATA_SHAPE),
]);
const PUBLIC_EVIDENCE_ITEM_SCHEMA = z.object({
  kind: z.enum(PUBLIC_EVIDENCE_KINDS),
  source: z.enum(["canonical_salt", "project_policy", "heuristic_fallback"]),
  entity: z.string().optional(),
  field: z.string().optional(),
  source_urls: z.array(z.string()),
  summary: z.string().optional(),
});
const PUBLIC_EVIDENCE_SCHEMA = z.object({
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
const SUPPORT_SOURCES_SHAPE = {
  sources: z.array(TOOL_SOURCE_SCHEMA).optional(),
};
const GUIDANCE_BOUNDARY_SCHEMA = UNKNOWN_RECORD_SCHEMA.optional();
const SUPPORT_FOLLOW_UPS_SCHEMA = UNKNOWN_RECORD_ARRAY_SCHEMA.optional();
const SUPPORT_RAW_SCHEMA = UNKNOWN_RECORD_SCHEMA.optional();
const DISCOVER_SALT_OUTPUT_SCHEMA = z
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
    summary: z.string().min(1),
    truncated: z.boolean().optional(),
    available_expansions: z.array(z.string()).optional(),
    full_output_bytes: z.number().optional(),
    details: z.unknown().optional(),
  })
  .strict();
const CHOOSE_OUTPUT_SCHEMA = MCP_WORKFLOW_OUTPUT_SCHEMA;
const ANALYZE_OUTPUT_SCHEMA = MCP_WORKFLOW_OUTPUT_SCHEMA;
const TRANSLATE_OUTPUT_SCHEMA = MCP_WORKFLOW_OUTPUT_SCHEMA;
const COMPARE_OUTPUT_SCHEMA = MCP_WORKFLOW_OUTPUT_SCHEMA;
const CONTEXT_PACK_PERSISTENCE_OUTPUT_SCHEMA = z
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
const GENERATED_ARTIFACT_PERSISTENCE_OUTPUT_SCHEMA = z
  .object({
    contract: z.literal("salt_generated_artifact_persistence_v1"),
    status: z.enum(["written", "blocked", "invalid"]),
    written: z.boolean(),
    artifact_path: z.string(),
    release_gate: z.unknown(),
    missing: z.array(z.string()),
  })
  .strict();

const SUPPORT_TOOL_ORDER = [
  "get_salt_entity",
  "get_salt_examples",
  "discover_salt",
  "validate_salt_review_report",
  "resume_salt_review",
] as const;
const PERSISTENCE_TOOL_ORDER = [
  "persist_salt_context_pack",
  "persist_salt_generated_artifact",
] as const;
const DEFAULT_TOOL_ORDER = [
  ...PUBLIC_WORKFLOW_TOOL_IDS,
  ...SUPPORT_TOOL_ORDER,
  ...PERSISTENCE_TOOL_ORDER,
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
  defineTool<{ report_path: string; root_dir?: string }>({
    name: "validate_salt_review_report",
    description:
      "Validate a durable salt_review_report_v1 JSON file against the current semantic-core registry. Recomputes evidence, mirror, and release-gate state before reporting current, stale, unsupported, or invalid.",
    inputSchema: {
      report_path: z
        .string()
        .min(1)
        .describe(
          "Path to a salt_review_report_v1 JSON file. Relative paths resolve from root_dir or the MCP current working directory.",
        ),
      root_dir: z
        .string()
        .optional()
        .describe(
          "Optional repo root for resolving report_path. Defaults to the MCP current working directory.",
        ),
    },
    outputSchema: REVIEW_REPORT_VALIDATION_OUTPUT_SCHEMA,
    annotations: READ_ONLY_WORKFLOW_TOOL_ANNOTATIONS,
    execute: async (registry, args) =>
      validateReviewReportFromPath({
        registry,
        report_path: args.report_path,
        root_dir: args.root_dir,
      }),
  }),
  defineTool<{ report_path: string; root_dir?: string }>({
    name: "resume_salt_review",
    description:
      "Return the conservative resume state for a durable Salt review report. Only current source-backed reports expose reusable EvidenceRef ids; stale, unsupported, and invalid reports return missing data instead.",
    inputSchema: {
      report_path: z
        .string()
        .min(1)
        .describe(
          "Path to a salt_review_report_v1 JSON file. Relative paths resolve from root_dir or the MCP current working directory.",
        ),
      root_dir: z
        .string()
        .optional()
        .describe(
          "Optional repo root for resolving report_path. Defaults to the MCP current working directory.",
        ),
    },
    outputSchema: REVIEW_RESUME_OUTPUT_SCHEMA,
    annotations: READ_ONLY_WORKFLOW_TOOL_ANNOTATIONS,
    execute: async (registry, args) =>
      (
        await validateReviewReportFromPath({
          registry,
          report_path: args.report_path,
          root_dir: args.root_dir,
        })
      ).resume,
  }),
  defineTool<{
    root_dir?: string;
    output_dir?: string;
    manifest_path?: string;
  }>({
    name: "persist_salt_context_pack",
    description:
      "Write the default release-gated Salt generated context pack to durable project files inside root_dir. Overwrites any existing manifest and per-component pack files at the configured output paths. Returns the shared semantic-core persistence check.",
    inputSchema: {
      root_dir: z
        .string()
        .optional()
        .describe(
          "Project root to write within. Defaults to the MCP current working directory.",
        ),
      output_dir: z
        .string()
        .optional()
        .describe(
          "Directory inside root_dir for generated context files. Defaults to .salt/context/components. Any existing files at the resolved paths are overwritten.",
        ),
      manifest_path: z
        .string()
        .optional()
        .describe(
          "Manifest path inside root_dir. Defaults to .salt/context/manifest.json. Any existing file at the resolved path is overwritten.",
        ),
    },
    outputSchema: CONTEXT_PACK_PERSISTENCE_OUTPUT_SCHEMA,
    annotations: {
      readOnlyHint: false,
      // destructiveHint reflects that caller-supplied output_dir / manifest_path
      // overrides may point at any path inside root_dir, and the tool will
      // overwrite whatever exists there. See packages/mcp/docs/public-api-matrix.md
      // §Annotation Audit (Task 0.8) for the rationale.
      destructiveHint: true,
      idempotentHint: true,
      openWorldHint: false,
    },
    execute: async (registry, args) => {
      const rootDir = path.resolve(process.cwd(), args.root_dir ?? ".");
      const outputDir = resolveWritablePathInsideRoot({
        rootDir,
        targetPath: args.output_dir ?? DEFAULT_CONTEXT_PACK_OUTPUT_DIR,
        label: "output_dir",
      });
      const manifestPath = resolveWritablePathInsideRoot({
        rootDir,
        targetPath: args.manifest_path ?? DEFAULT_CONTEXT_PACK_MANIFEST_PATH,
        label: "manifest_path",
      });

      return persistContextPack({
        registry,
        rootDir,
        outputDir,
        manifestPath,
      });
    },
  }),
  defineTool<{
    root_dir?: string;
    artifact_path: string;
    artifact: Record<string, unknown>;
  }>({
    name: "persist_salt_generated_artifact",
    description:
      "Write one generated Salt report or artifact JSON payload to a caller-supplied artifact_path inside root_dir, overwriting any file at that path, but only after the shared semantic-core release gate validates its EvidenceRefs.",
    inputSchema: {
      root_dir: z
        .string()
        .optional()
        .describe(
          "Project root to write within. Defaults to the MCP current working directory.",
        ),
      artifact_path: z
        .string()
        .min(1)
        .describe(
          "Output JSON path inside root_dir for the generated artifact. Any existing file at this path is overwritten when the release gate passes.",
        ),
      artifact: UNKNOWN_RECORD_SCHEMA.describe(
        "Generated Salt artifact payload to persist. It must be a salt_generated_artifact_v1 object or contain generated_artifact.",
      ),
    },
    outputSchema: GENERATED_ARTIFACT_PERSISTENCE_OUTPUT_SCHEMA,
    annotations: {
      readOnlyHint: false,
      // destructiveHint reflects that artifact_path is always caller-supplied
      // and may point at any path inside root_dir; the tool will overwrite
      // whatever exists there when the release gate passes. See
      // packages/mcp/docs/public-api-matrix.md §Annotation Audit (Task 0.8).
      destructiveHint: true,
      idempotentHint: true,
      openWorldHint: false,
    },
    execute: async (registry, args) => {
      const rootDir = path.resolve(process.cwd(), args.root_dir ?? ".");
      const artifactPath = resolveWritablePathInsideRoot({
        rootDir,
        targetPath: args.artifact_path,
        label: "artifact_path",
      });
      const artifactPathForResult = toContextPackOutputPathForManifest(
        rootDir,
        artifactPath,
      );
      const releaseGate = validateGeneratedArtifactReleaseGate({
        artifact: args.artifact,
        registry,
        artifact_path: artifactPathForResult,
      });

      if (releaseGate.releasable) {
        await writeExactText(
          artifactPath,
          JSON.stringify(args.artifact, null, 2),
        );
      }

      return buildGeneratedArtifactPersistenceResult({
        artifact_path: artifactPathForResult,
        release_gate: releaseGate,
        written: releaseGate.releasable,
      });
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
    outputSchema: DISCOVER_SALT_OUTPUT_SCHEMA,
    annotations: READ_ONLY_WORKFLOW_TOOL_ANNOTATIONS,
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
      resolved_entities: z
        .array(z.string().min(1))
        .optional()
        .describe(
          "Names of follow-through entities already resolved through canonical support tools. Use when rerunning create after retrieve_entity or retrieve_examples.",
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
          salt_packages: projectContext.salt.packages.map(
            (entry) => entry.name,
          ),
          package_manager: projectContext.environment.package_manager,
          resolved_entities: workflowArgs.resolved_entities,
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
    outputSchema: GET_SALT_ENTITY_OUTPUT_SCHEMA,
    annotations: READ_ONLY_WORKFLOW_TOOL_ANNOTATIONS,
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
    outputSchema: GET_SALT_EXAMPLES_OUTPUT_SCHEMA,
    annotations: READ_ONLY_WORKFLOW_TOOL_ANNOTATIONS,
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
const INTERNAL_PERSISTENCE_TOOL_DEFINITIONS: readonly ToolDefinition[] =
  ALL_TOOL_DEFINITIONS.filter((definition) =>
    PERSISTENCE_TOOL_ORDER.includes(
      definition.name as (typeof PERSISTENCE_TOOL_ORDER)[number],
    ),
  );

const toolPriorityByName = new Map<string, number>([
  ...PUBLIC_WORKFLOW_TOOL_IDS.map((name, index) => [name, index] as const),
  ...SUPPORT_TOOL_ORDER.map(
    (name, index) => [name, PUBLIC_WORKFLOW_TOOL_IDS.length + index] as const,
  ),
  ...PERSISTENCE_TOOL_ORDER.map(
    (name, index) =>
      [
        name,
        PUBLIC_WORKFLOW_TOOL_IDS.length + SUPPORT_TOOL_ORDER.length + index,
      ] as const,
  ),
]);

const ORDERED_TOOL_DEFINITIONS: readonly ToolDefinition[] = [
  ...WORKFLOW_TOOL_DEFINITIONS,
  ...INTERNAL_SUPPORT_TOOL_DEFINITIONS,
  ...INTERNAL_PERSISTENCE_TOOL_DEFINITIONS,
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
