import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

export type EvalAudience =
  | "existing-salt-team"
  | "non-salt-team"
  | "new-project-team";

export type EvalWorkflow = "create" | "review" | "migrate" | "upgrade";
export type EvalTransport = "mcp" | "cli";

export interface WorkflowEvalCliArgs {
  argv: string[];
}

export interface WorkflowEvalScenario {
  id: string;
  audience: EvalAudience;
  tags: string[];
  fixture: {
    kind: "repo";
    root_dir: string;
    description: string;
  };
  task: {
    workflow: EvalWorkflow;
    prompt: string;
  };
  capabilities: {
    mcp?: boolean;
    cli?: boolean;
    project_conventions?: boolean;
    runtime_url?: boolean;
    screenshot_input?: boolean;
  };
  args: {
    mcp?: Record<string, unknown>;
    cli?: WorkflowEvalCliArgs;
  };
  expected: {
    transport?: {
      preferred?: EvalTransport;
      fallback?: EvalTransport;
      stop_if_all_fail?: true;
    };
    workflow?: {
      id?: string;
      readiness?: string;
      implementation_ready?: boolean;
    };
    summary_first?: true;
    require_verify?: true;
    max_blocking_questions?: number;
    canonical_choice?: string | null;
    final_choice?: string | null;
    required_fragments?: string[];
    banned_fragments?: string[];
  };
}

export interface WorkflowEvalTrace {
  scenario_id: string;
  runner_id: string;
  status: "passed" | "failed" | "skipped";
  transport_trace: Array<{
    transport: EvalTransport;
    status: "succeeded" | "failed" | "fallback" | "unavailable";
    detail: string;
  }>;
  workflow_result: unknown | null;
  transcript: string[];
  artifacts: {
    files?: string[];
    logs?: string[];
    report_path?: string | null;
  };
}

export interface WorkflowEvalJudgment {
  status: "passed" | "failed" | "skipped";
  reasons: string[];
}

export interface WorkflowEvalRunnerContext {
  registry_dir: string;
  repo_root: string;
  timeout_ms?: number;
}

export interface WorkflowEvalRunner {
  id: string;
  transport: EvalTransport;
  supports: (scenario: WorkflowEvalScenario) => boolean;
  run: (
    scenario: WorkflowEvalScenario,
    context: WorkflowEvalRunnerContext,
  ) => Promise<WorkflowEvalTrace>;
}

export interface WorkflowEvalReportEntry {
  scenario_id: string;
  tags: string[];
  runner_id: string;
  judgment: WorkflowEvalJudgment;
  trace: WorkflowEvalTrace;
}

export interface WorkflowEvalReport {
  generated_at: string;
  repo_root: string;
  registry_dir: string;
  requested_runner_ids: string[];
  requested_scenario_ids: string[];
  passed: boolean;
  entries: WorkflowEvalReportEntry[];
}

const CLI_BIN_PATH = path.join("packages", "cli", "bin", "salt-ds.js");
const CLI_DIST_ENTRY = path.join(
  "dist",
  "salt-ds-cli",
  "dist-cjs",
  "cli",
  "src",
  "index.js",
);
const MCP_BIN_PATH = path.join("packages", "mcp", "bin", "salt-mcp.js");
const MCP_DIST_ENTRY = path.join(
  "dist",
  "salt-ds-mcp",
  "dist-cjs",
  "mcp",
  "src",
  "index.js",
);
const ENSURED_BUILD_PROMISES = new Map<string, Promise<void>>();
const BUNDLED_ENTRYPOINTS = new Map<string, Promise<string>>();

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function readString(
  record: Record<string, unknown>,
  key: string,
): string | null {
  const value = record[key];
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

function readStringArray(
  record: Record<string, unknown>,
  key: string,
): string[] {
  const value = record[key];
  return Array.isArray(value)
    ? value.filter(
        (entry): entry is string =>
          typeof entry === "string" && entry.trim().length > 0,
      )
    : [];
}

function uniqueStrings(values: Array<string | null | undefined>): string[] {
  return [
    ...new Set(values.filter((value): value is string => Boolean(value))),
  ];
}

function compactStrings(values: Array<string | null | undefined>): string[] {
  return values.filter(
    (value): value is string => typeof value === "string" && value.length > 0,
  );
}

function toWorkflowToolId(workflow: EvalWorkflow): string {
  switch (workflow) {
    case "create":
      return "create_salt_ui";
    case "review":
      return "review_salt_ui";
    case "migrate":
      return "migrate_to_salt";
    case "upgrade":
      return "upgrade_salt_ui";
  }
}

function toPublicWorkflowId(rawId: string | null): string | null {
  switch (rawId) {
    case "create":
      return "create_salt_ui";
    case "review":
      return "review_salt_ui";
    case "migrate":
      return "migrate_to_salt";
    case "upgrade":
      return "upgrade_salt_ui";
    default:
      return rawId;
  }
}

function extractWorkflowObject(value: unknown): Record<string, unknown> | null {
  return isRecord(value) && isRecord(value.workflow) ? value.workflow : null;
}

function extractResultObject(value: unknown): Record<string, unknown> | null {
  return isRecord(value) && isRecord(value.result) ? value.result : null;
}

function countBlockingQuestions(
  result: Record<string, unknown> | null,
): number {
  if (!result) {
    return 0;
  }

  const openQuestions = Array.isArray(result.open_questions)
    ? result.open_questions.length
    : 0;
  const clarifyingQuestions = Array.isArray(result.clarifying_questions)
    ? result.clarifying_questions.length
    : 0;

  return openQuestions + clarifyingQuestions;
}

function extractVerifyEntries(
  result: Record<string, unknown> | null,
): string[] {
  if (!result || !isRecord(result.ide_summary)) {
    return [];
  }

  return Array.isArray(result.ide_summary.verify)
    ? result.ide_summary.verify.filter(
        (entry): entry is string => typeof entry === "string",
      )
    : [];
}

function extractCanonicalChoice(
  result: Record<string, unknown> | null,
): string | null {
  if (!result) {
    return null;
  }

  if (isRecord(result.decision) && typeof result.decision.name === "string") {
    return result.decision.name;
  }

  if (isRecord(result.decision) && typeof result.decision.target === "string") {
    return result.decision.target;
  }

  return null;
}

function extractFinalChoice(
  result: Record<string, unknown> | null,
): string | null {
  if (!result) {
    return null;
  }

  if (
    isRecord(result.final_decision) &&
    typeof result.final_decision.name === "string"
  ) {
    return result.final_decision.name;
  }

  return extractCanonicalChoice(result);
}

function serializeTraceResult(value: unknown): string {
  try {
    return JSON.stringify(value);
  } catch {
    return "";
  }
}

async function ensureBuiltEntrypoint(
  repoRoot: string,
  entryPath: string,
  buildArgs: string[],
): Promise<void> {
  const cacheKey = `${repoRoot}:${entryPath}`;
  const existing = ENSURED_BUILD_PROMISES.get(cacheKey);
  if (existing) {
    await existing;
    return;
  }

  const buildPromise = (async () => {
    const result =
      process.platform === "win32"
        ? await runProcess(
            process.env.ComSpec ?? "cmd.exe",
            ["/d", "/s", "/c", "yarn", ...buildArgs],
            {
              cwd: repoRoot,
              timeout_ms: 240_000,
            },
          )
        : await runProcess("yarn", buildArgs, {
            cwd: repoRoot,
            timeout_ms: 240_000,
          });

    if (result.exit_code !== 0) {
      throw new Error(
        `Failed to build ${entryPath} for the eval harness.\n${result.stderr.trim()}`,
      );
    }

    await fs.access(path.join(repoRoot, entryPath));
  })();
  ENSURED_BUILD_PROMISES.set(cacheKey, buildPromise);

  try {
    await buildPromise;
  } catch (error) {
    ENSURED_BUILD_PROMISES.delete(cacheKey);
    throw error;
  }
}

async function bundleEvalEntrypoint(
  repoRoot: string,
  options: {
    id: "cli" | "mcp";
    source_entry: string;
  },
): Promise<string> {
  const cacheKey = `${repoRoot}:${options.id}:bundle`;
  const existing = BUNDLED_ENTRYPOINTS.get(cacheKey);
  if (existing) {
    return existing;
  }

  const bundlePromise = (async () => {
    const { build } = await import("esbuild");
    const cacheDir = path.join(repoRoot, ".salt-eval-cache");
    const wrapperPath = path.join(cacheDir, `${options.id}-eval-entry.ts`);
    const outputPath = path.join(cacheDir, `${options.id}-eval-entry.mjs`);
    await fs.mkdir(cacheDir, { recursive: true });
    await fs.writeFile(
      wrapperPath,
      [
        `import { runCli } from ${JSON.stringify(options.source_entry.replaceAll("\\", "/"))};`,
        "",
        "runCli(process.argv.slice(2))",
        "  .then((exitCode) => {",
        "    process.exit(typeof exitCode === 'number' ? exitCode : 0);",
        "  })",
        "  .catch((error) => {",
        `    console.error("${options.id} eval entry error:", error);`,
        "    process.exit(1);",
        "  });",
        "",
      ].join("\n"),
      "utf8",
    );

    await build({
      entryPoints: [wrapperPath],
      outfile: outputPath,
      bundle: true,
      platform: "node",
      format: "esm",
      sourcemap: false,
      absWorkingDir: repoRoot,
      external: ["chromium-bidi/*"],
      logLevel: "silent",
    });

    return outputPath;
  })();
  BUNDLED_ENTRYPOINTS.set(cacheKey, bundlePromise);

  try {
    return await bundlePromise;
  } catch (error) {
    BUNDLED_ENTRYPOINTS.delete(cacheKey);
    throw error;
  }
}

async function resolveExecutableScript(
  kind: "cli" | "mcp",
  repoRoot: string,
): Promise<{
  script_path: string;
  source: "dist" | "bundle";
  build_error?: string;
}> {
  try {
    if (kind === "cli") {
      await ensureBuiltEntrypoint(repoRoot, CLI_DIST_ENTRY, [
        "workspace",
        "@salt-ds/cli",
        "build",
      ]);
      return {
        script_path: path.join(repoRoot, CLI_BIN_PATH),
        source: "dist",
      };
    }

    await ensureBuiltEntrypoint(repoRoot, MCP_DIST_ENTRY, [
      "workspace",
      "@salt-ds/mcp",
      "build",
    ]);
    return {
      script_path: path.join(repoRoot, MCP_BIN_PATH),
      source: "dist",
    };
  } catch (error) {
    const scriptPath = await bundleEvalEntrypoint(repoRoot, {
      id: kind,
      source_entry: path.join(
        repoRoot,
        "packages",
        kind === "cli" ? "cli" : "mcp",
        "src",
        "index.ts",
      ),
    });
    return {
      script_path: scriptPath,
      source: "bundle",
      build_error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function runProcess(
  command: string,
  args: string[],
  options: {
    cwd: string;
    timeout_ms?: number;
    env?: Record<string, string>;
  },
): Promise<{
  exit_code: number | null;
  stdout: string;
  stderr: string;
}> {
  const env = Object.fromEntries(
    Object.entries({
      ...process.env,
      ...options.env,
    }).filter(
      (entry): entry is [string, string] => typeof entry[1] === "string",
    ),
  );

  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: options.cwd,
      env,
      stdio: ["ignore", "pipe", "pipe"],
      windowsHide: true,
    });

    const stdoutChunks: Buffer[] = [];
    const stderrChunks: Buffer[] = [];
    let timedOut = false;
    const timeout =
      options.timeout_ms && options.timeout_ms > 0
        ? setTimeout(() => {
            timedOut = true;
            child.kill();
          }, options.timeout_ms)
        : null;

    child.stdout.on("data", (chunk: Buffer) => {
      stdoutChunks.push(chunk);
    });
    child.stderr.on("data", (chunk: Buffer) => {
      stderrChunks.push(chunk);
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (timeout) {
        clearTimeout(timeout);
      }

      const stdout = Buffer.concat(stdoutChunks).toString("utf8");
      const stderr = Buffer.concat(stderrChunks).toString("utf8");

      if (timedOut) {
        resolve({
          exit_code: code,
          stdout,
          stderr: `${stderr}\nProcess timed out after ${options.timeout_ms}ms.`,
        });
        return;
      }

      resolve({
        exit_code: code,
        stdout,
        stderr,
      });
    });
  });
}

function safeJsonParse(value: string): unknown | null {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

async function loadSourceOutlineFromScenario(
  scenario: WorkflowEvalScenario,
): Promise<Record<string, unknown> | null> {
  if (isRecord(scenario.args.mcp?.source_outline)) {
    return scenario.args.mcp?.source_outline as Record<string, unknown>;
  }

  const cliArgs = scenario.args.cli?.argv ?? [];
  const outlineFlagIndex = cliArgs.findIndex(
    (token) => token === "--source-outline",
  );
  if (outlineFlagIndex === -1) {
    return null;
  }

  const outlinePath = cliArgs[outlineFlagIndex + 1];
  if (!outlinePath) {
    return null;
  }

  const parsed = safeJsonParse(await fs.readFile(outlinePath, "utf8"));
  return isRecord(parsed) ? parsed : null;
}

function normalizeReadiness(
  rawWorkflow: Record<string, unknown>,
): Record<string, unknown> | null {
  if (!isRecord(rawWorkflow.readiness)) {
    return null;
  }

  return {
    status: rawWorkflow.readiness.status,
    implementation_ready: rawWorkflow.readiness.implementationReady,
    reason: rawWorkflow.readiness.reason,
  };
}

function normalizeWorkflowMetadata(
  raw: Record<string, unknown>,
  workflowId: string,
): Record<string, unknown> {
  const rawWorkflow = isRecord(raw.workflow) ? raw.workflow : {};

  return {
    id: workflowId,
    transport_used: "cli",
    confidence: isRecord(rawWorkflow.confidence)
      ? rawWorkflow.confidence
      : null,
    readiness: normalizeReadiness(rawWorkflow),
    context_requirement: isRecord(rawWorkflow.contextRequirement)
      ? {
          status: rawWorkflow.contextRequirement.status,
          repo_specific_edits_ready:
            rawWorkflow.contextRequirement.repoSpecificEditsReady,
          reason: rawWorkflow.contextRequirement.reason,
          satisfied_by: rawWorkflow.contextRequirement.satisfiedBy ?? null,
        }
      : null,
    project_conventions_check: isRecord(rawWorkflow.projectConventionsCheck)
      ? {
          supported: rawWorkflow.projectConventionsCheck.supported,
          contract: rawWorkflow.projectConventionsCheck.contract,
          check_recommended:
            rawWorkflow.projectConventionsCheck.check_recommended,
          topics: rawWorkflow.projectConventionsCheck.topics,
          reason: rawWorkflow.projectConventionsCheck.reason,
          canonical_only: rawWorkflow.projectConventionsCheck.canonical_only,
          declared_policy_status:
            rawWorkflow.projectConventionsCheck.declared_policy_status,
          next_step: rawWorkflow.projectConventionsCheck.next_step,
        }
      : null,
    provenance: rawWorkflow.provenance ?? null,
  };
}

function pickIssueSummary(record: Record<string, unknown>): string | null {
  return (
    readString(record, "summary") ??
    readString(record, "message") ??
    readString(record, "title") ??
    readString(record, "id")
  );
}

function readNestedStringArray(
  parent: Record<string, unknown>,
  key: string,
): string[] {
  if (!Array.isArray(parent[key])) {
    return [];
  }

  return parent[key]
    .flatMap((entry) => (isRecord(entry) ? [pickIssueSummary(entry)] : []))
    .filter((entry): entry is string => Boolean(entry));
}

function buildReviewCliIdeSummary(
  raw: Record<string, unknown>,
): Record<string, unknown> {
  const result = isRecord(raw.result) ? raw.result : {};
  const summary = isRecord(result.summary) ? result.summary : {};
  const artifacts = isRecord(raw.artifacts) ? raw.artifacts : {};
  const sourceValidation = isRecord(result.sourceValidation)
    ? result.sourceValidation
    : {};
  const topFindings = uniqueStrings([
    ...readNestedStringArray(artifacts, "issueClasses"),
    ...(Array.isArray(sourceValidation.files) ? sourceValidation.files : [])
      .flatMap((file) =>
        isRecord(file) ? readNestedStringArray(file, "issues") : [],
      )
      .slice(0, 3),
  ]).slice(0, 3);
  const status = readString(summary, "status");

  return {
    verdict: {
      level:
        status === "clean"
          ? "clean"
          : Number(summary.filesNeedingAttention ?? 0) > 1 ||
              Number(summary.runtimeIssues ?? 0) > 0
            ? "high_risk"
            : "medium_risk",
      summary:
        readString(summary, "nextStep") ??
        (status === "clean"
          ? "The current file is close to Salt expectations."
          : "The current file needs attention before the next edit."),
    },
    top_findings:
      topFindings.length > 0
        ? topFindings
        : [
            "Review the scoped file for primitive, layout, and deprecation drift.",
          ],
    safest_next_fix:
      readString(summary, "nextStep") ??
      "Apply the smallest deterministic fix first, then rerun review.",
    verify: [
      "Rerun salt-ds review on the touched file or feature scope.",
      "Check keyboard order and toolbar wrap behavior after the fix.",
    ],
  };
}

function buildUpgradeCliIdeSummary(
  raw: Record<string, unknown>,
): Record<string, unknown> {
  const result = isRecord(raw.result) ? raw.result : {};
  const summary = isRecord(result.summary) ? result.summary : {};
  const comparison = isRecord(result.comparison) ? result.comparison : {};
  const requiredChanges = uniqueStrings([
    ...readNestedStringArray(comparison, "breaking"),
    ...readNestedStringArray(comparison, "important"),
  ]).slice(0, 5);
  const optionalCleanup = uniqueStrings(
    readNestedStringArray(comparison, "nice_to_know"),
  ).slice(0, 3);

  return {
    target: readString(summary, "target"),
    from_version: readString(summary, "fromVersion"),
    to_version: readString(summary, "toVersion"),
    required_changes:
      requiredChanges.length > 0
        ? requiredChanges
        : ["Apply the required upgrade changes before optional cleanup."],
    optional_cleanup:
      optionalCleanup.length > 0
        ? optionalCleanup
        : [
            "Collapse compatibility shims only after the required changes land.",
          ],
    suggested_order: [
      "Apply required compile or runtime-sensitive changes first.",
      "Rerun salt-ds review on the touched scope.",
      "Apply optional cleanup once the upgrade is stable.",
    ],
    verify: [
      "Check keyboard flow and responsive layout after the upgrade.",
      "Confirm empty states and primary actions still render correctly.",
    ],
  };
}

function buildCreateCliIdeSummary(
  raw: Record<string, unknown>,
): Record<string, unknown> {
  const result = isRecord(raw.result) ? raw.result : {};
  const summary = isRecord(result.summary) ? result.summary : {};
  const intent = isRecord(result.intent) ? result.intent : {};
  const recommendation = isRecord(result.recommendation)
    ? result.recommendation
    : {};
  const openQuestion =
    Array.isArray(recommendation.open_questions) &&
    recommendation.open_questions.length > 0 &&
    isRecord(recommendation.open_questions[0])
      ? readString(recommendation.open_questions[0], "prompt")
      : null;

  return {
    recommended_direction:
      readString(intent, "compositionDirection") ??
      readString(summary, "nextStep") ??
      "Start from the canonical Salt pattern or composition direction first.",
    bounded_scope: uniqueStrings([
      readString(summary, "decisionName"),
      readString(summary, "solutionType"),
      readString(intent, "userTask"),
    ]).slice(0, 4),
    open_question: openQuestion,
    starter_plan: [
      "Choose the canonical Salt pattern or composition first.",
      "Generate the first scaffold before applying repo-local wrappers.",
      "Rerun review on the generated area after the scaffold lands.",
    ],
    verify: [
      "Check spacing ownership and composition boundaries after scaffolding.",
      "Rerun salt-ds review on the generated files.",
    ],
  };
}

async function buildMigrateCliIdeSummary(
  raw: Record<string, unknown>,
  scenario: WorkflowEvalScenario,
): Promise<Record<string, unknown>> {
  const outline = await loadSourceOutlineFromScenario(scenario);
  const result = isRecord(raw.result) ? raw.result : {};
  const translation = isRecord(result.translation) ? result.translation : {};
  const scope = isRecord(result.migrationScope) ? result.migrationScope : {};
  const screenMap = uniqueStrings([
    ...readStringArray(outline ?? {}, "regions"),
    ...readNestedStringArray(translation, "translations"),
  ]).slice(0, 6);
  const preserve = uniqueStrings([
    ...readStringArray(outline ?? {}, "notes"),
    ...readStringArray(scope, "preserveFocus"),
  ]).slice(0, 4);

  return {
    screen_map:
      screenMap.length > 0
        ? screenMap
        : ["header", "toolbar", "content", "empty-state"],
    preserve:
      preserve.length > 0
        ? preserve
        : ["Preserve action order and familiar empty-state behavior."],
    needs_confirmation: readStringArray(scope, "questions").slice(0, 3),
    recommended_direction: [
      "Map the current regions to canonical Salt layout ownership.",
      "Keep screenshot or source-outline evidence as supporting input only.",
      "Generate the first scaffold before repo-local refinement.",
    ],
    first_scaffold: [
      "Create the primary shell and landmarks first.",
      "Add the toolbar, filters, or navigation group next.",
      "Keep state handling explicit before visual polish.",
    ],
    verify: [
      "Check landmarks, action hierarchy, and empty-state behavior after the first scaffold.",
      "Run salt-ds review on the migrated files once the scaffold is in place.",
    ],
  };
}

async function normalizeCliWorkflowResult(
  scenario: WorkflowEvalScenario,
  raw: unknown,
): Promise<Record<string, unknown>> {
  if (!isRecord(raw)) {
    throw new Error("CLI did not return a JSON object.");
  }

  const workflowId = toPublicWorkflowId(
    isRecord(raw.workflow) ? readString(raw.workflow, "id") : null,
  );
  if (!workflowId) {
    throw new Error("CLI output did not include a workflow id.");
  }

  const result = isRecord(raw.result) ? raw.result : {};
  const artifacts = isRecord(raw.artifacts) ? raw.artifacts : {};
  let ideSummary: Record<string, unknown>;

  switch (scenario.task.workflow) {
    case "review":
      ideSummary = buildReviewCliIdeSummary(raw);
      break;
    case "upgrade":
      ideSummary = buildUpgradeCliIdeSummary(raw);
      break;
    case "create":
      ideSummary = buildCreateCliIdeSummary(raw);
      break;
    case "migrate":
      ideSummary = await buildMigrateCliIdeSummary(raw, scenario);
      break;
  }

  const canonicalChoice =
    isRecord(result.recommendation) && isRecord(result.recommendation.decision)
      ? {
          name: readString(result.recommendation.decision, "name"),
        }
      : isRecord(result.comparison) && isRecord(result.comparison.decision)
        ? {
            target: readString(result.comparison.decision, "target"),
          }
        : null;
  const finalChoice =
    isRecord(artifacts.projectConventions) &&
    isRecord(artifacts.projectConventions.finalChoice)
      ? {
          name: readString(artifacts.projectConventions.finalChoice, "name"),
          source: readString(
            artifacts.projectConventions.finalChoice,
            "source",
          ),
        }
      : canonicalChoice;

  return {
    workflow: normalizeWorkflowMetadata(raw, workflowId),
    result: {
      ...result,
      ide_summary: ideSummary,
      ...(canonicalChoice ? { decision: canonicalChoice } : {}),
      ...(finalChoice ? { final_decision: finalChoice } : {}),
    },
    artifacts: {
      raw_cli_result: raw,
      cli_notes: readStringArray(artifacts, "notes"),
    },
  };
}

function extractStructuredToolContent(value: unknown): Record<string, unknown> {
  if (!isRecord(value) || !isRecord(value.structuredContent)) {
    throw new Error("MCP tool call did not return structured content.");
  }

  return value.structuredContent;
}

export function judgeWorkflowEvalScenario(
  scenario: WorkflowEvalScenario,
  trace: WorkflowEvalTrace,
): WorkflowEvalJudgment {
  if (trace.status === "skipped") {
    return {
      status: "skipped",
      reasons: [`Runner ${trace.runner_id} skipped ${scenario.id}.`],
    };
  }

  const failures: string[] = [];
  const workflow = extractWorkflowObject(trace.workflow_result);
  const result = extractResultObject(trace.workflow_result);
  const serialized = serializeTraceResult(trace.workflow_result);
  const successfulTransport =
    trace.transport_trace.find((entry) => entry.status === "succeeded")
      ?.transport ?? null;

  if (trace.scenario_id !== scenario.id) {
    failures.push(
      `Trace scenario_id ${trace.scenario_id} did not match scenario ${scenario.id}.`,
    );
  }

  const allTransportsUnavailable =
    successfulTransport === null &&
    scenario.expected.transport?.stop_if_all_fail === true &&
    trace.transport_trace.length > 0 &&
    trace.transport_trace.every((entry) => entry.status === "unavailable");
  if (!allTransportsUnavailable && (!workflow || !result)) {
    failures.push(
      `Runner ${trace.runner_id} did not return a workflow envelope for ${scenario.id}.`,
    );
  }

  if (allTransportsUnavailable) {
    if (trace.status !== "failed") {
      failures.push(
        `Runner ${trace.runner_id} should have failed cleanly when no transport was available for ${scenario.id}.`,
      );
    }

    return {
      status: failures.length > 0 ? "failed" : "passed",
      reasons:
        failures.length > 0
          ? failures
          : [
              `Runner ${trace.runner_id} stopped cleanly when all transports were unavailable for ${scenario.id}.`,
            ],
    };
  }

  if (
    scenario.expected.transport?.preferred &&
    successfulTransport !== scenario.expected.transport.preferred &&
    successfulTransport !== scenario.expected.transport.fallback
  ) {
    failures.push(
      `Runner ${trace.runner_id} used ${successfulTransport ?? "no transport"} instead of ${scenario.expected.transport.preferred}.`,
    );
  }

  if (
    scenario.expected.workflow?.id &&
    workflow?.id !== scenario.expected.workflow.id
  ) {
    failures.push(
      `Workflow id ${String(workflow?.id)} did not match expected id ${scenario.expected.workflow.id}.`,
    );
  }

  if (
    scenario.expected.workflow?.readiness &&
    isRecord(workflow?.readiness) &&
    workflow.readiness.status !== scenario.expected.workflow.readiness
  ) {
    failures.push(
      `Workflow readiness ${String(workflow.readiness.status)} did not match ${scenario.expected.workflow.readiness}.`,
    );
  }

  if (
    typeof scenario.expected.workflow?.implementation_ready === "boolean" &&
    isRecord(workflow?.readiness) &&
    workflow.readiness.implementation_ready !==
      scenario.expected.workflow.implementation_ready
  ) {
    failures.push(
      `Workflow implementation_ready ${String(workflow.readiness.implementation_ready)} did not match ${String(scenario.expected.workflow.implementation_ready)}.`,
    );
  }

  if (scenario.expected.summary_first && !isRecord(result?.ide_summary)) {
    failures.push(
      `Workflow result for ${scenario.id} did not expose result.ide_summary.`,
    );
  }

  if (
    scenario.expected.require_verify &&
    extractVerifyEntries(result).length === 0
  ) {
    failures.push(
      `Workflow result for ${scenario.id} did not include a non-empty verify list in result.ide_summary.`,
    );
  }

  if (
    typeof scenario.expected.max_blocking_questions === "number" &&
    countBlockingQuestions(result) > scenario.expected.max_blocking_questions
  ) {
    failures.push(
      `Workflow result for ${scenario.id} exceeded the blocking-question limit ${scenario.expected.max_blocking_questions}.`,
    );
  }

  if (
    Object.hasOwn(scenario.expected, "canonical_choice") &&
    extractCanonicalChoice(result) !== scenario.expected.canonical_choice
  ) {
    failures.push(
      `Canonical choice ${extractCanonicalChoice(result)} did not match expected ${scenario.expected.canonical_choice}.`,
    );
  }

  if (
    Object.hasOwn(scenario.expected, "final_choice") &&
    extractFinalChoice(result) !== scenario.expected.final_choice
  ) {
    failures.push(
      `Final choice ${extractFinalChoice(result)} did not match expected ${scenario.expected.final_choice}.`,
    );
  }

  for (const fragment of scenario.expected.required_fragments ?? []) {
    if (!serialized.includes(fragment)) {
      failures.push(
        `Workflow result for ${scenario.id} did not include required fragment ${fragment}.`,
      );
    }
  }

  for (const fragment of scenario.expected.banned_fragments ?? []) {
    if (serialized.includes(fragment)) {
      failures.push(
        `Workflow result for ${scenario.id} included banned fragment ${fragment}.`,
      );
    }
  }

  return {
    status: failures.length > 0 ? "failed" : "passed",
    reasons:
      failures.length > 0
        ? failures
        : [
            `Runner ${trace.runner_id} satisfied the deterministic workflow rubric for ${scenario.id}.`,
          ],
  };
}

export const CLI_LOCAL_EVAL_RUNNER: WorkflowEvalRunner = {
  id: "cli-local",
  transport: "cli",
  supports: (scenario) => scenario.capabilities.cli === true,
  run: async (scenario, context) => {
    try {
      const executable = await resolveExecutableScript(
        "cli",
        context.repo_root,
      );

      const cliArgs = [...(scenario.args.cli?.argv ?? [])];
      if (!cliArgs.includes("--json")) {
        cliArgs.push("--json");
      }
      if (!cliArgs.includes("--registry-dir")) {
        cliArgs.push("--registry-dir", context.registry_dir);
      }

      const result = await runProcess(
        process.execPath,
        [executable.script_path, ...cliArgs],
        {
          cwd: scenario.fixture.root_dir,
          timeout_ms: context.timeout_ms ?? 120_000,
        },
      );

      if (result.exit_code !== 0 && result.exit_code !== 2) {
        return {
          scenario_id: scenario.id,
          runner_id: "cli-local",
          status: "failed",
          transport_trace: [
            {
              transport: "cli",
              status: "failed",
              detail: `CLI exited with code ${String(result.exit_code)}.`,
            },
          ],
          workflow_result: null,
          transcript: [scenario.task.prompt, "CLI process failed."],
          artifacts: {
            files: [scenario.fixture.root_dir],
            logs: [result.stderr.trim(), result.stdout.trim()].filter(Boolean),
          },
        };
      }

      const raw = safeJsonParse(result.stdout);
      const workflowResult = await normalizeCliWorkflowResult(scenario, raw);
      return {
        scenario_id: scenario.id,
        runner_id: "cli-local",
        status: "passed",
        transport_trace: [
          {
            transport: "cli",
            status: "succeeded",
            detail: `Executed ${scenario.task.workflow} through the real salt-ds CLI process (${executable.source}).`,
          },
        ],
        workflow_result: workflowResult,
        transcript: [
          scenario.task.prompt,
          `Used the real CLI runner for ${scenario.task.workflow}.`,
        ],
        artifacts: {
          files: [scenario.fixture.root_dir],
          logs: compactStrings([
            executable.build_error?.trim(),
            result.stderr.trim(),
          ]),
        },
      };
    } catch (error) {
      return {
        scenario_id: scenario.id,
        runner_id: "cli-local",
        status: "failed",
        transport_trace: [
          {
            transport: "cli",
            status: "failed",
            detail:
              error instanceof Error
                ? error.message
                : "CLI runner failed unexpectedly.",
          },
        ],
        workflow_result: null,
        transcript: [scenario.task.prompt, "CLI runner failed."],
        artifacts: {
          files: [scenario.fixture.root_dir],
          logs: [
            error instanceof Error
              ? (error.stack ?? error.message)
              : String(error),
          ],
        },
      };
    }
  },
};

export const MCP_LOCAL_EVAL_RUNNER: WorkflowEvalRunner = {
  id: "mcp-local",
  transport: "mcp",
  supports: (scenario) => scenario.capabilities.mcp === true,
  run: async (scenario, context) => {
    const attemptLogs: string[] = [];
    const transportTrace: WorkflowEvalTrace["transport_trace"] = [];
    const maxAttempts = 2;

    const runAttempt = async (): Promise<WorkflowEvalTrace> => {
      const stderrLogs: string[] = [];
      let client: Client | null = null;
      let transport: StdioClientTransport | null = null;

      try {
        const executable = await resolveExecutableScript(
          "mcp",
          context.repo_root,
        );

        transport = new StdioClientTransport({
          command: process.execPath,
          args: [
            executable.script_path,
            "serve",
            "--registry-dir",
            context.registry_dir,
          ],
          cwd: context.repo_root,
          stderr: "pipe",
        });

        const stderrStream = transport.stderr;
        if (stderrStream) {
          stderrStream.on("data", (chunk: Buffer | string) => {
            stderrLogs.push(chunk.toString());
          });
        }

        client = new Client(
          {
            name: "salt-workflow-eval",
            version: "0.0.0",
          },
          {
            capabilities: {},
          },
        );

        await client.connect(transport, {
          timeout: context.timeout_ms ?? 120_000,
        });

        const attemptTrace: WorkflowEvalTrace["transport_trace"] = [];
        const toolArgs = {
          ...(scenario.args.mcp ?? {}),
        };

        if (scenario.task.workflow !== "upgrade") {
          const contextCall = await client.callTool(
            {
              name: "get_salt_project_context",
              arguments: {
                root_dir: scenario.fixture.root_dir,
              },
            },
            undefined,
            {
              timeout: context.timeout_ms ?? 120_000,
            },
          );
          const contextPayload = extractStructuredToolContent(contextCall);
          const contextResult = isRecord(contextPayload.result)
            ? contextPayload.result
            : {};
          const contextId = readString(contextResult, "context_id");

          if (contextId) {
            Object.assign(toolArgs, {
              context_id: contextId,
            });
          }

          attemptTrace.push({
            transport: "mcp",
            status: "succeeded",
            detail:
              contextId !== null
                ? `Collected project context ${contextId} before ${scenario.task.workflow}.`
                : `Collected project context before ${scenario.task.workflow}.`,
          });
        }

        const workflowCall = await client.callTool(
          {
            name: toWorkflowToolId(scenario.task.workflow),
            arguments: toolArgs,
          },
          undefined,
          {
            timeout: context.timeout_ms ?? 120_000,
          },
        );
        const workflowResult = extractStructuredToolContent(workflowCall);
        attemptTrace.push({
          transport: "mcp",
          status: "succeeded",
          detail: `Executed ${toWorkflowToolId(scenario.task.workflow)} through the MCP stdio protocol.`,
        });

        return {
          scenario_id: scenario.id,
          runner_id: "mcp-local",
          status: "passed",
          transport_trace: attemptTrace,
          workflow_result: workflowResult,
          transcript: [
            scenario.task.prompt,
            `Used ${toWorkflowToolId(scenario.task.workflow)} through the real MCP stdio runner.`,
          ],
          artifacts: {
            files: [scenario.fixture.root_dir],
            logs: compactStrings([
              executable.build_error?.trim(),
              ...stderrLogs.filter((entry) => entry.trim().length > 0),
            ]),
          },
        };
      } finally {
        if (client) {
          await client.close().catch(() => undefined);
        }
        if (transport) {
          await transport.close().catch(() => undefined);
        }
      }
    };

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      try {
        const trace = await runAttempt();
        const retryDetail =
          attempt > 1
            ? `Recovered after MCP startup retry ${attempt - 1} for ${scenario.id}.`
            : null;

        return {
          ...trace,
          transport_trace: retryDetail
            ? [
                ...transportTrace,
                {
                  transport: "mcp",
                  status: "succeeded",
                  detail: retryDetail,
                },
                ...trace.transport_trace,
              ]
            : [...transportTrace, ...trace.transport_trace],
          artifacts: {
            ...trace.artifacts,
            logs: compactStrings([
              ...(trace.artifacts.logs ?? []),
              ...attemptLogs,
            ]),
          },
        };
      } catch (error) {
        const detail =
          error instanceof Error
            ? error.message
            : "MCP runner failed unexpectedly.";
        transportTrace.push({
          transport: "mcp",
          status: "failed",
          detail:
            attempt < maxAttempts
              ? `${detail} Retrying MCP stdio startup once.`
              : detail,
        });
        attemptLogs.push(
          error instanceof Error
            ? (error.stack ?? error.message)
            : String(error),
        );
      }
    }

    return {
      scenario_id: scenario.id,
      runner_id: "mcp-local",
      status: "failed",
      transport_trace: transportTrace,
      workflow_result: null,
      transcript: [scenario.task.prompt, "MCP runner failed."],
      artifacts: {
        files: [scenario.fixture.root_dir],
        logs: attemptLogs,
      },
    };
  },
};

export const WORKFLOW_LOCAL_EVAL_RUNNERS: WorkflowEvalRunner[] = [
  MCP_LOCAL_EVAL_RUNNER,
  CLI_LOCAL_EVAL_RUNNER,
];

function orderScenarioTransports(
  scenario: WorkflowEvalScenario,
): EvalTransport[] {
  return [
    ...new Set(
      [
        scenario.expected.transport?.preferred,
        scenario.expected.transport?.fallback,
        "mcp",
        "cli",
      ].filter((entry): entry is EvalTransport => Boolean(entry)),
    ),
  ];
}

function findRunnerByTransport(
  runners: WorkflowEvalRunner[],
  transport: EvalTransport,
): WorkflowEvalRunner | null {
  return runners.find((runner) => runner.transport === transport) ?? null;
}

export async function runWorkflowEvalScenario(
  scenario: WorkflowEvalScenario,
  options: {
    runners?: WorkflowEvalRunner[];
    enabled_transports?: EvalTransport[];
    context: WorkflowEvalRunnerContext;
  },
): Promise<WorkflowEvalTrace> {
  const runners = options.runners ?? WORKFLOW_LOCAL_EVAL_RUNNERS;
  const enabledTransports = new Set(
    options.enabled_transports ?? ["mcp", "cli"],
  );
  const orderedTransports = orderScenarioTransports(scenario);
  const combinedTrace: WorkflowEvalTrace = {
    scenario_id: scenario.id,
    runner_id: "eval-harness",
    status: "failed",
    transport_trace: [],
    workflow_result: null,
    transcript: [scenario.task.prompt],
    artifacts: {
      files: [scenario.fixture.root_dir],
      logs: [],
      report_path: null,
    },
  };

  for (const transport of orderedTransports) {
    if (!enabledTransports.has(transport)) {
      combinedTrace.transport_trace.push({
        transport,
        status: "unavailable",
        detail: `${transport} transport was not enabled for this eval run.`,
      });
      continue;
    }

    const runner = findRunnerByTransport(runners, transport);
    if (!runner || !runner.supports(scenario)) {
      combinedTrace.transport_trace.push({
        transport,
        status: "unavailable",
        detail: `${transport} transport was not available for ${scenario.id}.`,
      });
      continue;
    }

    const trace = await runner.run(scenario, options.context);
    combinedTrace.runner_id = trace.runner_id;
    combinedTrace.transport_trace.push(...trace.transport_trace);
    combinedTrace.transcript.push(
      ...trace.transcript.filter((entry) => entry !== scenario.task.prompt),
    );
    combinedTrace.artifacts.logs?.push(...(trace.artifacts.logs ?? []));
    combinedTrace.workflow_result = trace.workflow_result;

    if (trace.status === "passed") {
      return {
        ...combinedTrace,
        status: "passed",
      };
    }
  }

  if (scenario.expected.transport?.stop_if_all_fail) {
    combinedTrace.transcript.push(
      "Stopped cleanly after every allowed transport was unavailable or failed.",
    );
  }

  return combinedTrace;
}

export async function runWorkflowEvalScenarios(
  scenarios: WorkflowEvalScenario[],
  options: {
    runners?: WorkflowEvalRunner[];
    enabled_transports?: EvalTransport[];
    context: WorkflowEvalRunnerContext;
  },
): Promise<WorkflowEvalReport> {
  const entries: WorkflowEvalReportEntry[] = [];

  for (const scenario of scenarios) {
    const trace = await runWorkflowEvalScenario(scenario, options);
    entries.push({
      scenario_id: scenario.id,
      tags: scenario.tags,
      runner_id: trace.runner_id,
      judgment: judgeWorkflowEvalScenario(scenario, trace),
      trace,
    });
  }

  return {
    generated_at: new Date().toISOString(),
    repo_root: options.context.repo_root,
    registry_dir: options.context.registry_dir,
    requested_runner_ids: (options.runners ?? WORKFLOW_LOCAL_EVAL_RUNNERS).map(
      (runner) => runner.id,
    ),
    requested_scenario_ids: scenarios.map((scenario) => scenario.id),
    passed: entries.every((entry) => entry.judgment.status === "passed"),
    entries,
  };
}

export function buildWorkflowEvalJsonReport(
  report: WorkflowEvalReport,
): string {
  return JSON.stringify(report, null, 2);
}
