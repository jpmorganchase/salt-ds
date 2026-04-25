import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { buildRegistry } from "@salt-ds/semantic-core/build/buildRegistry";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { runCli } from "../../../cli/src/cli.js";
import { loadRegistry } from "../registry/loadRegistry.js";
import {
  createToolExecutionRuntime,
  TOOL_DEFINITIONS,
} from "../server/toolDefinitions.js";
import { REPO_ROOT } from "./registryTestUtils.js";

const tempRoots: string[] = [];
const FIXTURE_DIR = path.join(
  REPO_ROOT,
  "packages",
  "mcp",
  "src",
  "__tests__",
  "fixtures",
  "public-contract",
);
const UPDATE_FIXTURES = process.env.UPDATE_PUBLIC_CONTRACT_FIXTURES === "true";
let registryDir = "";

const COMPACT_BYTE_BUDGETS = {
  create: 9_000,
  review: 1_800,
  migrate: 2_600,
  upgrade: 2_500,
} as const;

const FULL_BYTE_BUDGETS = {
  create: 120_000,
  review: 25_000,
  migrate: 400_000,
  upgrade: 60_000,
} as const;

async function createTempDir(prefix: string) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), prefix));
  tempRoots.push(root);
  return root;
}

async function createRepo(
  prefix: string,
  packageJson: Record<string, unknown>,
): Promise<string> {
  const rootDir = await createTempDir(prefix);
  await fs.mkdir(path.join(rootDir, ".salt"), { recursive: true });
  await fs.writeFile(
    path.join(rootDir, "package.json"),
    `${JSON.stringify(packageJson, null, 2)}\n`,
    "utf8",
  );
  return rootDir;
}

function withRegistry(args: string[]): string[] {
  return [...args, "--registry-dir", registryDir];
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function readPath(value: unknown, pathSegments: string[]): unknown {
  let current: unknown = value;

  for (const segment of pathSegments) {
    const record = asRecord(current);
    if (!record) {
      return undefined;
    }

    current = record[segment];
  }

  return current;
}

function readFirst(
  value: unknown,
  pathCandidates: string[][],
): unknown | undefined {
  for (const pathSegments of pathCandidates) {
    const candidate = readPath(value, pathSegments);
    if (candidate !== undefined) {
      return candidate;
    }
  }

  return undefined;
}

function readString(value: unknown, pathCandidates: string[][]): string | null {
  const candidate = readFirst(value, pathCandidates);
  const normalized =
    typeof candidate === "string" && candidate.trim().length > 0
      ? candidate.trim()
      : null;

  return normalized === "not_run" ? null : normalized;
}

function readBoolean(
  value: unknown,
  pathCandidates: string[][],
): boolean | null {
  const candidate = readFirst(value, pathCandidates);
  return typeof candidate === "boolean" ? candidate : null;
}

function readNumber(value: unknown, pathCandidates: string[][]): number | null {
  const candidate = readFirst(value, pathCandidates);
  return typeof candidate === "number" && Number.isFinite(candidate)
    ? candidate
    : null;
}

function readArray(
  value: unknown,
  pathCandidates: string[][],
): unknown[] | null {
  const candidate = readFirst(value, pathCandidates);
  return Array.isArray(candidate) ? candidate : null;
}

function uniqueSortedStrings(values: Array<string | null>): string[] {
  return [...new Set(values.filter((value): value is string => Boolean(value)))]
    .map((value) => value.trim())
    .filter((value) => value.length > 0)
    .sort((left, right) => left.localeCompare(right));
}

function normalizeWorkflowId(value: string | null): string | null {
  switch (value) {
    case "create_salt_ui":
      return "create";
    case "review_salt_ui":
      return "review";
    case "migrate_to_salt":
      return "migrate";
    case "upgrade_salt_ui":
      return "upgrade";
    default:
      return value;
  }
}

function jsonByteLength(value: unknown): number {
  return Buffer.byteLength(JSON.stringify(value), "utf8");
}

function expectUniqueStringArrayAtPath(
  value: unknown,
  pathCandidates: string[][],
): void {
  const entries = readArray(value, pathCandidates);
  if (!entries) {
    return;
  }

  const strings = entries.filter(
    (entry): entry is string => typeof entry === "string",
  );
  expect(new Set(strings).size).toBe(strings.length);
}

function readFollowUpWorkflows(value: unknown): string[] {
  const followUps = readArray(value, [
    ["details", "artifacts", "suggested_follow_ups"],
    ["details", "result", "recommendation", "suggested_follow_ups"],
    ["details", "result", "translation", "suggested_follow_ups"],
    ["artifacts", "suggested_follow_ups"],
    ["result", "recommendation", "suggested_follow_ups"],
    ["result", "translation", "suggested_follow_ups"],
  ]);

  return uniqueSortedStrings(
    (followUps ?? []).map((followUp) =>
      normalizeWorkflowId(readString(followUp, [["workflow"]])),
    ),
  );
}

function readRuleIds(value: unknown): string[] {
  const ruleIds = readArray(value, [
    ["details", "artifacts", "rule_ids"],
    ["details", "artifacts", "ruleIds"],
    ["artifacts", "rule_ids"],
    ["artifacts", "ruleIds"],
  ]);

  return uniqueSortedStrings(
    (ruleIds ?? []).map((entry) => (typeof entry === "string" ? entry : null)),
  );
}

function readIssueClassIds(value: unknown): string[] {
  const issueClasses = readArray(value, [
    ["details", "artifacts", "issue_classes"],
    ["details", "artifacts", "issueClasses"],
    ["artifacts", "issue_classes"],
    ["artifacts", "issueClasses"],
  ]);

  return uniqueSortedStrings(
    (issueClasses ?? []).map((entry) => {
      if (typeof entry === "string") {
        return entry;
      }

      return readString(entry, [["id"], ["class"], ["label"]]);
    }),
  );
}

function toComparableCompactContract(value: Record<string, unknown>) {
  const action = asRecord(value.action);
  const actionWithoutHints = action
    ? ({ ...action } as Record<string, unknown>)
    : null;
  if (actionWithoutHints) {
    delete actionWithoutHints.cli;
    delete actionWithoutHints.mcp;
  }
  const request = asRecord(value.request);
  const safety = asRecord(value.safety);
  const postAction = asRecord(action?.post_action ?? null);

  return {
    contract: value.contract,
    workflow: value.workflow,
    status: value.status,
    request: {
      entity: typeof request?.entity === "string" ? request.entity : null,
      resolved_entity:
        typeof request?.resolved_entity === "string" ||
        request?.resolved_entity === null
          ? request.resolved_entity
          : null,
      match_status:
        typeof request?.match_status === "string" ? request.match_status : null,
      exact_match_required:
        typeof request?.exact_match_required === "boolean"
          ? request.exact_match_required
          : null,
    },
    safety: {
      canonical_complete:
        typeof safety?.canonical_complete === "boolean"
          ? safety.canonical_complete
          : null,
      exact_request_safe:
        typeof safety?.exact_request_safe === "boolean"
          ? safety.exact_request_safe
          : null,
      blocking_reasons: Array.isArray(safety?.blocking_reasons)
        ? safety.blocking_reasons
        : [],
    },
    action: actionWithoutHints
      ? {
          ...actionWithoutHints,
          rule_ids: Array.isArray(actionWithoutHints.rule_ids)
            ? actionWithoutHints.rule_ids
            : [],
          post_action: postAction
            ? {
                kind: postAction.kind,
                tool: postAction.tool,
              }
            : null,
        }
      : null,
    summary: value.summary,
  };
}

function readRecipeActionHints(value: Record<string, unknown>) {
  const recipeSteps = readArray(value, [["recipe", "steps"]]) ?? [];
  return recipeSteps.map((step) => ({
    id: readString(step, [["id"]]),
    status: readString(step, [["status"]]),
    action_kind: readString(step, [["action", "kind"]]),
    cli: readString(step, [["action", "cli"]]),
    mcp_tool: readString(step, [["action", "mcp", "tool"]]),
    mcp_args: readPath(step, ["action", "mcp", "args"]) ?? null,
  }));
}

function expectPublicActionHintParity(
  cliResult: Record<string, unknown>,
  mcpResult: Record<string, unknown>,
): void {
  expect(readPath(cliResult, ["next_required_action"])).toEqual(
    readPath(mcpResult, ["next_required_action"]),
  );
  expect(readPath(cliResult, ["action", "cli"])).toEqual(
    readPath(mcpResult, ["action", "cli"]),
  );
  expect(readPath(cliResult, ["action", "mcp"])).toEqual(
    readPath(mcpResult, ["action", "mcp"]),
  );
  expect(readRecipeActionHints(cliResult)).toEqual(
    readRecipeActionHints(mcpResult),
  );
}

function expectEvidenceInputContextParity(
  cliResult: Record<string, unknown>,
  mcpResult: Record<string, unknown>,
): void {
  expect(readPath(cliResult, ["evidence", "input_context"])).toEqual(
    readPath(mcpResult, ["evidence", "input_context"]),
  );
}

function toComparableCreateFull(value: Record<string, unknown>) {
  return {
    workflow_id: normalizeWorkflowId(
      readString(value, [
        ["details", "workflow", "id"],
        ["workflow", "id"],
      ]),
    ),
    confidence_level: readString(value, [
      ["details", "workflow", "confidence", "level"],
      ["workflow", "confidence", "level"],
    ]),
    readiness_status: readString(value, [
      ["details", "workflow", "readiness", "status"],
      ["workflow", "readiness", "status"],
    ]),
    context_requirement_status: readString(value, [
      ["details", "workflow", "context_requirement", "status"],
      ["details", "workflow", "contextRequirement", "status"],
      ["workflow", "context_requirement", "status"],
      ["workflow", "contextRequirement", "status"],
    ]),
    final_decision_name: readString(value, [
      ["details", "result", "final_decision", "name"],
      ["details", "result", "summary", "finalDecisionName"],
      ["result", "final_decision", "name"],
      ["result", "summary", "finalDecisionName"],
    ]),
    final_decision_source: readString(value, [
      ["details", "result", "final_decision", "source"],
      ["details", "result", "summary", "finalDecisionSource"],
      ["result", "final_decision", "source"],
      ["result", "summary", "finalDecisionSource"],
    ]),
    starter_validation_status: readString(value, [
      ["details", "artifacts", "starter_validation", "status"],
      ["details", "artifacts", "starterValidation", "status"],
      ["details", "result", "summary", "starterValidationStatus"],
      ["artifacts", "starter_validation", "status"],
      ["artifacts", "starterValidation", "status"],
      ["result", "summary", "starterValidationStatus"],
    ]),
    repo_refinement_status: readString(value, [
      ["details", "artifacts", "repo_refinement", "status"],
      ["details", "artifacts", "repoRefinement", "status"],
      ["artifacts", "repo_refinement", "status"],
      ["artifacts", "repoRefinement", "status"],
    ]),
    suggested_follow_up_workflows: readFollowUpWorkflows(value),
  };
}

function toComparableReviewFull(value: Record<string, unknown>) {
  return {
    workflow_id: normalizeWorkflowId(
      readString(value, [
        ["details", "workflow", "id"],
        ["workflow", "id"],
      ]),
    ),
    confidence_level: readString(value, [
      ["details", "workflow", "confidence", "level"],
      ["workflow", "confidence", "level"],
    ]),
    decision_status: readString(value, [
      ["details", "result", "decision", "status"],
      ["details", "result", "summary", "status"],
      ["result", "decision", "status"],
      ["result", "summary", "status"],
    ]),
    rule_ids: readRuleIds(value),
    issue_class_ids: readIssueClassIds(value),
    project_policy_present:
      readFirst(value, [
        ["details", "artifacts", "project_policy"],
        ["details", "artifacts", "projectPolicy"],
        ["artifacts", "project_policy"],
        ["artifacts", "projectPolicy"],
      ]) != null,
    runtime_evidence_requested:
      readBoolean(value, [
        ["details", "artifacts", "runtimeEvidence", "requested"],
        ["artifacts", "runtimeEvidence", "requested"],
      ]) ?? false,
  };
}

function toComparableMigrateFull(value: Record<string, unknown>) {
  return {
    workflow_id: normalizeWorkflowId(
      readString(value, [
        ["details", "workflow", "id"],
        ["workflow", "id"],
      ]),
    ),
    confidence_level: readString(value, [
      ["details", "workflow", "confidence", "level"],
      ["workflow", "confidence", "level"],
    ]),
    readiness_status: readString(value, [
      ["details", "workflow", "readiness", "status"],
      ["workflow", "readiness", "status"],
    ]),
    context_requirement_status: readString(value, [
      ["details", "workflow", "context_requirement", "status"],
      ["details", "workflow", "contextRequirement", "status"],
      ["workflow", "context_requirement", "status"],
      ["workflow", "contextRequirement", "status"],
    ]),
    starter_validation_status: readString(value, [
      ["details", "artifacts", "starter_validation", "status"],
      ["details", "artifacts", "starterValidation", "status"],
      ["details", "result", "summary", "starterValidationStatus"],
      ["artifacts", "starter_validation", "status"],
      ["artifacts", "starterValidation", "status"],
      ["result", "summary", "starterValidationStatus"],
    ]),
    post_migration_suggested_workflow: normalizeWorkflowId(
      readString(value, [
        [
          "details",
          "artifacts",
          "post_migration_verification",
          "suggested_workflow",
        ],
        [
          "details",
          "artifacts",
          "postMigrationVerification",
          "suggestedWorkflow",
        ],
        ["artifacts", "post_migration_verification", "suggested_workflow"],
        ["artifacts", "postMigrationVerification", "suggestedWorkflow"],
      ]),
    ),
    visual_input_adapter_contract: readString(value, [
      [
        "details",
        "artifacts",
        "visualEvidence",
        "contract",
        "normalizationContract",
      ],
      [
        "details",
        "artifacts",
        "visual_evidence_contract",
        "normalization_contract",
      ],
      ["artifacts", "visualEvidence", "contract", "normalizationContract"],
      ["artifacts", "visual_evidence_contract", "normalization_contract"],
    ]),
    suggested_follow_up_workflows: readFollowUpWorkflows(value),
  };
}

function toComparableUpgradeFull(value: Record<string, unknown>) {
  return {
    workflow_id: normalizeWorkflowId(
      readString(value, [
        ["details", "workflow", "id"],
        ["workflow", "id"],
      ]),
    ),
    confidence_level: readString(value, [
      ["details", "workflow", "confidence", "level"],
      ["workflow", "confidence", "level"],
    ]),
    target: readString(value, [
      ["details", "result", "summary", "target"],
      ["details", "result", "ide_summary", "target"],
      ["result", "summary", "target"],
      ["result", "ide_summary", "target"],
    ]),
    from_version: readString(value, [
      ["details", "result", "summary", "fromVersion"],
      ["details", "result", "summary", "from_version"],
      ["details", "result", "ide_summary", "from_version"],
      ["result", "summary", "fromVersion"],
      ["result", "summary", "from_version"],
      ["result", "ide_summary", "from_version"],
    ]),
    to_version: readString(value, [
      ["details", "result", "summary", "toVersion"],
      ["details", "result", "summary", "to_version"],
      ["details", "result", "ide_summary", "to_version"],
      ["result", "summary", "toVersion"],
      ["result", "summary", "to_version"],
      ["result", "ide_summary", "to_version"],
    ]),
    rule_ids: readRuleIds(value),
  };
}

async function assertFixture(
  fixtureName: string,
  actual: Record<string, unknown>,
): Promise<void> {
  const fixturePath = path.join(FIXTURE_DIR, fixtureName);

  if (UPDATE_FIXTURES) {
    await fs.mkdir(FIXTURE_DIR, { recursive: true });
    await fs.writeFile(
      fixturePath,
      `${JSON.stringify(actual, null, 2)}\n`,
      "utf8",
    );
  }

  const expected = JSON.parse(await fs.readFile(fixturePath, "utf8")) as Record<
    string,
    unknown
  >;
  expect(actual).toEqual(expected);
}

async function runCliWorkflow(
  rootDir: string,
  argv: string[],
): Promise<Record<string, unknown>> {
  let stdout = "";
  let stderr = "";
  const exitCode = await runCli(withRegistry(argv), {
    cwd: rootDir,
    writeStdout: (message) => {
      stdout += message;
    },
    writeStderr: (message) => {
      stderr += message;
    },
  });

  expect(stderr).toBe("");
  expect(exitCode).toBeLessThanOrEqual(20);
  return JSON.parse(stdout) as Record<string, unknown>;
}

async function runCliCreateCompact(
  rootDir: string,
  query: string,
): Promise<Record<string, unknown>> {
  return runCliWorkflow(rootDir, ["create", query, "--json"]);
}

async function runCliCreateFull(
  rootDir: string,
  query: string,
): Promise<Record<string, unknown>> {
  return runCliWorkflow(rootDir, ["create", query, "--json", "--full"]);
}

async function runCliWorkflowCompact(
  rootDir: string,
  argv: string[],
): Promise<Record<string, unknown>> {
  return runCliWorkflow(rootDir, [...argv, "--json"]);
}

async function runCliWorkflowFull(
  rootDir: string,
  argv: string[],
): Promise<Record<string, unknown>> {
  return runCliWorkflow(rootDir, [...argv, "--json", "--full"]);
}

async function runMcpCreate(
  rootDir: string,
  query: string,
  view: "compact" | "full",
): Promise<Record<string, unknown>> {
  const registry = await loadRegistry({ registryDir });
  const chooseTool = TOOL_DEFINITIONS.find(
    (definition) => definition.name === "create_salt_ui",
  );
  const runtime = createToolExecutionRuntime();

  return (await chooseTool?.execute(
    registry,
    {
      query,
      root_dir: rootDir,
      view,
    },
    runtime,
  )) as Record<string, unknown>;
}

async function runMcpWorkflow(
  toolName: "review_salt_ui" | "migrate_to_salt" | "upgrade_salt_ui",
  args: Record<string, unknown>,
  view: "compact" | "full",
): Promise<Record<string, unknown>> {
  const registry = await loadRegistry({ registryDir });
  const tool = TOOL_DEFINITIONS.find(
    (definition) => definition.name === toolName,
  );
  const runtime = createToolExecutionRuntime();

  return (await tool?.execute(
    registry,
    {
      ...args,
      view,
    },
    runtime,
  )) as Record<string, unknown>;
}

beforeAll(async () => {
  registryDir = await fs.mkdtemp(
    path.join(os.tmpdir(), "salt-public-contract-parity-"),
  );
  await buildRegistry({
    sourceRoot: REPO_ROOT,
    outputDir: registryDir,
    timestamp: "2026-04-20T00:00:00Z",
  });
}, 40000);

afterEach(async () => {
  await Promise.all(
    tempRoots
      .splice(0)
      .map((root) => fs.rm(root, { recursive: true, force: true })),
  );
});

afterAll(async () => {
  if (registryDir) {
    await fs.rm(registryDir, { recursive: true, force: true });
  }
});

describe("public contract parity", () => {
  it("keeps exact-name create compact semantics aligned across CLI and MCP", async () => {
    const rootDir = await createRepo("salt-parity-exact-", {
      name: "parity-exact",
      private: true,
      dependencies: {
        "@salt-ds/core": "^2.0.0",
      },
    });

    const cliResult = await runCliCreateCompact(rootDir, "Metric");
    const mcpResult = await runMcpCreate(rootDir, "Metric", "compact");
    const cliComparable = toComparableCompactContract(cliResult);
    const mcpComparable = toComparableCompactContract(mcpResult);

    expect(cliComparable).toEqual(mcpComparable);
    expectPublicActionHintParity(cliResult, mcpResult);
    expect(jsonByteLength(cliResult)).toBeLessThanOrEqual(
      COMPACT_BYTE_BUDGETS.create,
    );
    expect(jsonByteLength(mcpResult)).toBeLessThanOrEqual(
      COMPACT_BYTE_BUDGETS.create,
    );
    expectUniqueStringArrayAtPath(cliResult, [
      ["safety", "blocking_reasons"],
      ["blocking_reasons"],
    ]);
    expectUniqueStringArrayAtPath(mcpResult, [
      ["safety", "blocking_reasons"],
      ["blocking_reasons"],
    ]);
    await assertFixture("create-exact.compact.json", cliComparable);
  });

  it("keeps broadened create compact semantics aligned across CLI and MCP", async () => {
    const rootDir = await createRepo("salt-parity-broadened-", {
      name: "parity-broadened",
      private: true,
      packageManager: "pnpm@9.1.0",
      dependencies: {
        react: "^18.3.1",
        vite: "^7.1.0",
      },
    });

    const cliResult = await runCliCreateCompact(
      rootDir,
      "analytical dashboard body",
    );
    const mcpResult = await runMcpCreate(
      rootDir,
      "analytical dashboard body",
      "compact",
    );
    const cliComparable = toComparableCompactContract(cliResult);
    const mcpComparable = toComparableCompactContract(mcpResult);

    expect(cliComparable).toEqual(mcpComparable);
    expectPublicActionHintParity(cliResult, mcpResult);
    expect(readString(cliResult, [["next_required_action", "cli"]])).toBe(
      "pnpm add @salt-ds/core @salt-ds/theme",
    );
    expect(jsonByteLength(cliResult)).toBeLessThanOrEqual(
      COMPACT_BYTE_BUDGETS.create,
    );
    expect(jsonByteLength(mcpResult)).toBeLessThanOrEqual(
      COMPACT_BYTE_BUDGETS.create,
    );
    expectUniqueStringArrayAtPath(cliResult, [
      ["safety", "blocking_reasons"],
      ["blocking_reasons"],
    ]);
    expectUniqueStringArrayAtPath(mcpResult, [
      ["safety", "blocking_reasons"],
      ["blocking_reasons"],
    ]);
    await assertFixture("create-broadened.compact.json", cliComparable);
  });

  it("keeps ask-user create compact semantics aligned without fake tool hints", async () => {
    const rootDir = await createRepo("salt-parity-ask-user-", {
      name: "parity-ask-user",
      private: true,
      dependencies: {
        "@salt-ds/core": "^2.0.0",
      },
    });

    const query = "Add navigation tabs to this page.";
    const cliResult = await runCliCreateCompact(rootDir, query);
    const mcpResult = await runMcpCreate(rootDir, query, "compact");

    expect(toComparableCompactContract(cliResult)).toEqual(
      toComparableCompactContract(mcpResult),
    );
    expectPublicActionHintParity(cliResult, mcpResult);
    expect(readString(cliResult, [["next_required_action", "kind"]])).toBe(
      "ask_user",
    );
    expect(readString(cliResult, [["next_required_action", "cli"]])).toBeNull();
    expect(asRecord(readPath(cliResult, ["next_required_action", "mcp"]))).toBe(
      null,
    );
  });

  it("keeps review compact semantics aligned across CLI and MCP", async () => {
    const rootDir = await createRepo("salt-parity-review-", {
      name: "parity-review",
      private: true,
      dependencies: {
        "@salt-ds/core": "^2.0.0",
      },
    });
    await fs.mkdir(path.join(rootDir, "src"), { recursive: true });
    const code = [
      'import { Button } from "@salt-ds/core";',
      "",
      "export function Demo() {",
      '  return <Button href="/next">Go</Button>;',
      "}",
      "",
    ].join("\n");
    const filePath = path.join(rootDir, "src", "Demo.tsx");
    await fs.writeFile(filePath, code, "utf8");

    const cliResult = await runCliWorkflowCompact(rootDir, [
      "review",
      filePath,
    ]);
    const mcpResult = await runMcpWorkflow(
      "review_salt_ui",
      {
        code,
        root_dir: rootDir,
      },
      "compact",
    );
    const cliComparable = toComparableCompactContract(cliResult);
    const mcpComparable = toComparableCompactContract(mcpResult);

    expect(cliComparable).toEqual(mcpComparable);
    expect(jsonByteLength(cliResult)).toBeLessThanOrEqual(
      COMPACT_BYTE_BUDGETS.review,
    );
    expect(jsonByteLength(mcpResult)).toBeLessThanOrEqual(
      COMPACT_BYTE_BUDGETS.review,
    );
    expectUniqueStringArrayAtPath(cliResult, [
      ["safety", "blocking_reasons"],
      ["blocking_reasons"],
    ]);
    expectUniqueStringArrayAtPath(mcpResult, [
      ["safety", "blocking_reasons"],
      ["blocking_reasons"],
    ]);
    await assertFixture("review.compact.json", cliComparable);
  });

  it("keeps clean review compact completion aligned across CLI and MCP", async () => {
    const rootDir = await createRepo("salt-parity-review-clean-", {
      name: "parity-review-clean",
      private: true,
      dependencies: {
        "@salt-ds/core": "^2.0.0",
      },
    });
    await fs.mkdir(path.join(rootDir, "src"), { recursive: true });
    const code = [
      'import { Button } from "@salt-ds/core";',
      "",
      "export function Demo() {",
      "  return <Button>Save</Button>;",
      "}",
      "",
    ].join("\n");
    const filePath = path.join(rootDir, "src", "Demo.tsx");
    await fs.writeFile(filePath, code, "utf8");

    const cliResult = await runCliWorkflowCompact(rootDir, [
      "review",
      filePath,
    ]);
    const mcpResult = await runMcpWorkflow(
      "review_salt_ui",
      {
        code,
        root_dir: rootDir,
      },
      "compact",
    );

    expect(toComparableCompactContract(cliResult)).toEqual(
      toComparableCompactContract(mcpResult),
    );
    expectPublicActionHintParity(cliResult, mcpResult);
    expect(readString(cliResult, [["action", "kind"]])).toBe("complete");
    expect(readString(cliResult, [["next_required_action", "kind"]])).toBe(
      "complete",
    );
    expect(asRecord(readPath(cliResult, ["action", "post_action"]))).toBeNull();
  });

  it("keeps migrate compact semantics aligned across CLI and MCP", async () => {
    const rootDir = await createRepo("salt-parity-migrate-", {
      name: "parity-migrate",
      private: true,
      packageManager: "pnpm@9.1.0",
      dependencies: {
        react: "^18.3.1",
        vite: "^7.1.0",
      },
    });

    const query =
      "Build a sidebar with vertical navigation and a main content area.";
    const cliResult = await runCliWorkflowCompact(rootDir, ["migrate", query]);
    const mcpResult = await runMcpWorkflow(
      "migrate_to_salt",
      {
        query,
        root_dir: rootDir,
      },
      "compact",
    );
    const cliComparable = toComparableCompactContract(cliResult);
    const mcpComparable = toComparableCompactContract(mcpResult);

    expect(cliComparable).toEqual(mcpComparable);
    expect(jsonByteLength(cliResult)).toBeLessThanOrEqual(
      COMPACT_BYTE_BUDGETS.migrate,
    );
    expect(jsonByteLength(mcpResult)).toBeLessThanOrEqual(
      COMPACT_BYTE_BUDGETS.migrate,
    );
    expectUniqueStringArrayAtPath(cliResult, [
      ["safety", "blocking_reasons"],
      ["blocking_reasons"],
    ]);
    expectUniqueStringArrayAtPath(mcpResult, [
      ["safety", "blocking_reasons"],
      ["blocking_reasons"],
    ]);
    await assertFixture("migrate.compact.json", cliComparable);
  });

  it("keeps migrate source outline evidence context aligned across CLI and MCP", async () => {
    const rootDir = await createRepo("salt-parity-migrate-outline-", {
      name: "parity-migrate-outline",
      private: true,
      dependencies: {
        "@salt-ds/core": "^2.0.0",
      },
    });
    const sourceOutline = {
      regions: ["header", "main content"],
      actions: ["Save"],
      states: ["loading"],
      notes: ["Preserve the existing save flow."],
    };
    const outlinePath = path.join(rootDir, "source-outline.json");
    await fs.writeFile(
      outlinePath,
      `${JSON.stringify(sourceOutline, null, 2)}\n`,
      "utf8",
    );

    const query = "Migrate the existing save form.";
    const cliResult = await runCliWorkflowCompact(rootDir, [
      "migrate",
      query,
      "--source-outline",
      outlinePath,
    ]);
    const mcpResult = await runMcpWorkflow(
      "migrate_to_salt",
      {
        query,
        root_dir: rootDir,
        source_outline: sourceOutline,
      },
      "compact",
    );

    expect(toComparableCompactContract(cliResult)).toEqual(
      toComparableCompactContract(mcpResult),
    );
    expectPublicActionHintParity(cliResult, mcpResult);
    expectEvidenceInputContextParity(cliResult, mcpResult);
    expect(
      readBoolean(cliResult, [
        ["evidence", "input_context", "source_outline_provided"],
      ]),
    ).toBe(true);
    expect(
      readNumber(cliResult, [
        [
          "evidence",
          "input_context",
          "source_outline_signal_counts",
          "regions",
        ],
      ]),
    ).toBe(2);
  });

  it("keeps upgrade compact semantics aligned across CLI and MCP", async () => {
    const rootDir = await createRepo("salt-parity-upgrade-", {
      name: "parity-upgrade",
      private: true,
      dependencies: {
        "@salt-ds/core": "^1.1.0",
      },
    });

    const cliResult = await runCliWorkflowCompact(rootDir, [
      "upgrade",
      "--package",
      "@salt-ds/core",
      "--from-version",
      "1.1.0",
    ]);
    const mcpResult = await runMcpWorkflow(
      "upgrade_salt_ui",
      {
        package: "@salt-ds/core",
        from_version: "1.1.0",
        root_dir: rootDir,
      },
      "compact",
    );
    const cliComparable = toComparableCompactContract(cliResult);
    const mcpComparable = toComparableCompactContract(mcpResult);

    expect(cliComparable).toEqual(mcpComparable);
    expect(jsonByteLength(cliResult)).toBeLessThanOrEqual(
      COMPACT_BYTE_BUDGETS.upgrade,
    );
    expect(jsonByteLength(mcpResult)).toBeLessThanOrEqual(
      COMPACT_BYTE_BUDGETS.upgrade,
    );
    expectUniqueStringArrayAtPath(cliResult, [
      ["safety", "blocking_reasons"],
      ["blocking_reasons"],
    ]);
    expectUniqueStringArrayAtPath(mcpResult, [
      ["safety", "blocking_reasons"],
      ["blocking_reasons"],
    ]);
    await assertFixture("upgrade.compact.json", cliComparable);
  });

  it("keeps create full semantics aligned where CLI and MCP overlap", async () => {
    const rootDir = await createRepo("salt-parity-create-full-", {
      name: "parity-create-full",
      private: true,
      dependencies: {
        "@salt-ds/core": "^2.0.0",
      },
    });

    const cliResult = await runCliCreateFull(rootDir, "Metric");
    const mcpResult = await runMcpCreate(rootDir, "Metric", "full");
    const cliComparable = toComparableCreateFull(cliResult);
    const mcpComparable = toComparableCreateFull(mcpResult);

    expect(cliComparable).toEqual(mcpComparable);
    expect(jsonByteLength(cliResult)).toBeLessThanOrEqual(
      FULL_BYTE_BUDGETS.create,
    );
    expect(jsonByteLength(mcpResult)).toBeLessThanOrEqual(
      FULL_BYTE_BUDGETS.create,
    );
    expectUniqueStringArrayAtPath(cliResult, [["artifacts", "notes"]]);
    expectUniqueStringArrayAtPath(cliResult, [
      ["workflow", "provenance", "source_urls"],
    ]);
    await assertFixture("create-exact.full.json", cliComparable);
  });

  it("keeps create full top-level facts aligned with compact for mixed-surface prompts", async () => {
    const rootDir = await createRepo("salt-parity-create-tabs-full-", {
      name: "parity-create-tabs-full",
      private: true,
      dependencies: {
        "@salt-ds/core": "^2.0.0",
      },
    });
    const query =
      "User profile page with tabs for different sections (e.g. profile details, settings, activity) and an avatar displaying user initials or image.";

    const cliCompact = await runCliCreateCompact(rootDir, query);
    const cliFull = await runCliCreateFull(rootDir, query);
    const mcpCompact = await runMcpCreate(rootDir, query, "compact");
    const mcpFull = await runMcpCreate(rootDir, query, "full");

    expect(toComparableCompactContract(cliFull)).toEqual(
      toComparableCompactContract(cliCompact),
    );
    expect(toComparableCompactContract(mcpFull)).toEqual(
      toComparableCompactContract(mcpCompact),
    );
    expect(readString(cliFull, [["request", "resolved_entity"]])).toBe("Tabs");
    expect(readString(mcpFull, [["request", "resolved_entity"]])).toBe("Tabs");
    expect(readString(cliFull, [["action", "kind"]])).toBe("retrieve_entity");
    expect(readString(mcpFull, [["action", "kind"]])).toBe("retrieve_entity");
    expect(readString(cliFull, [["action", "args", "name"]])).toBe("Avatar");
    expect(readString(mcpFull, [["action", "args", "name"]])).toBe("Avatar");
    expect(readString(cliFull, [["next_required_action", "kind"]])).toBe(
      "retrieve_entity",
    );
    expect(readString(mcpFull, [["next_required_action", "kind"]])).toBe(
      "retrieve_entity",
    );
  });

  it("keeps create full request metadata populated for control prompts", async () => {
    const rootDir = await createRepo("salt-parity-create-switch-full-", {
      name: "parity-create-switch-full",
      private: true,
      dependencies: {
        "@salt-ds/core": "^2.0.0",
      },
    });
    const query =
      "Create a compact control to turn email alerts on and off inside a settings form.";

    const cliCompact = await runCliCreateCompact(rootDir, query);
    const cliFull = await runCliCreateFull(rootDir, query);
    const mcpCompact = await runMcpCreate(rootDir, query, "compact");
    const mcpFull = await runMcpCreate(rootDir, query, "full");

    expect(toComparableCompactContract(cliFull)).toEqual(
      toComparableCompactContract(cliCompact),
    );
    expect(toComparableCompactContract(mcpFull)).toEqual(
      toComparableCompactContract(mcpCompact),
    );
    expect(asRecord(readPath(cliFull, ["request"]))).not.toBeNull();
    expect(asRecord(readPath(mcpFull, ["request"]))).not.toBeNull();
    expect(readString(cliFull, [["request", "entity"]])).not.toBeNull();
    expect(readString(mcpFull, [["request", "entity"]])).not.toBeNull();
    expect(
      readString(cliFull, [["request", "resolved_entity"]]),
    ).not.toBeNull();
    expect(
      readString(mcpFull, [["request", "resolved_entity"]]),
    ).not.toBeNull();
  });

  it("keeps review full semantics aligned where CLI and MCP overlap", async () => {
    const rootDir = await createRepo("salt-parity-review-full-", {
      name: "parity-review-full",
      private: true,
      dependencies: {
        "@salt-ds/core": "^2.0.0",
      },
    });
    await fs.mkdir(path.join(rootDir, "src"), { recursive: true });
    const code = [
      'import { Button } from "@salt-ds/core";',
      "",
      "export function Demo() {",
      '  return <Button href="/next">Go</Button>;',
      "}",
      "",
    ].join("\n");
    const filePath = path.join(rootDir, "src", "Demo.tsx");
    await fs.writeFile(filePath, code, "utf8");

    const cliResult = await runCliWorkflowFull(rootDir, ["review", filePath]);
    const mcpResult = await runMcpWorkflow(
      "review_salt_ui",
      {
        code,
        root_dir: rootDir,
      },
      "full",
    );
    const cliComparable = toComparableReviewFull(cliResult);
    const mcpComparable = toComparableReviewFull(mcpResult);

    expect(cliComparable).toEqual(mcpComparable);
    expect(jsonByteLength(cliResult)).toBeLessThanOrEqual(
      FULL_BYTE_BUDGETS.review,
    );
    expect(jsonByteLength(mcpResult)).toBeLessThanOrEqual(
      FULL_BYTE_BUDGETS.review,
    );
    expectUniqueStringArrayAtPath(cliResult, [["artifacts", "notes"]]);
    await assertFixture("review.full.json", cliComparable);
  });

  it("keeps migrate full semantics aligned where CLI and MCP overlap", async () => {
    const rootDir = await createRepo("salt-parity-migrate-full-", {
      name: "parity-migrate-full",
      private: true,
      packageManager: "pnpm@9.1.0",
      dependencies: {
        react: "^18.3.1",
        vite: "^7.1.0",
      },
    });

    const query =
      "Build a sidebar with vertical navigation and a main content area.";
    const cliResult = await runCliWorkflowFull(rootDir, ["migrate", query]);
    const mcpResult = await runMcpWorkflow(
      "migrate_to_salt",
      {
        query,
        root_dir: rootDir,
      },
      "full",
    );
    const cliComparable = toComparableMigrateFull(cliResult);
    const mcpComparable = toComparableMigrateFull(mcpResult);

    expect(cliComparable).toEqual(mcpComparable);
    expect(jsonByteLength(cliResult)).toBeLessThanOrEqual(
      FULL_BYTE_BUDGETS.migrate,
    );
    expect(jsonByteLength(mcpResult)).toBeLessThanOrEqual(
      FULL_BYTE_BUDGETS.migrate,
    );
    expectUniqueStringArrayAtPath(cliResult, [["artifacts", "notes"]]);
    await assertFixture("migrate.full.json", cliComparable);
  });

  it("keeps upgrade full semantics aligned where CLI and MCP overlap", async () => {
    const rootDir = await createRepo("salt-parity-upgrade-full-", {
      name: "parity-upgrade-full",
      private: true,
      dependencies: {
        "@salt-ds/core": "^1.1.0",
      },
    });

    const cliResult = await runCliWorkflowFull(rootDir, [
      "upgrade",
      "--package",
      "@salt-ds/core",
      "--from-version",
      "1.1.0",
    ]);
    const mcpResult = await runMcpWorkflow(
      "upgrade_salt_ui",
      {
        package: "@salt-ds/core",
        from_version: "1.1.0",
        root_dir: rootDir,
      },
      "full",
    );
    const cliComparable = toComparableUpgradeFull(cliResult);
    const mcpComparable = toComparableUpgradeFull(mcpResult);

    expect(cliComparable).toEqual(mcpComparable);
    expect(jsonByteLength(cliResult)).toBeLessThanOrEqual(
      FULL_BYTE_BUDGETS.upgrade,
    );
    expect(jsonByteLength(mcpResult)).toBeLessThanOrEqual(
      FULL_BYTE_BUDGETS.upgrade,
    );
    expectUniqueStringArrayAtPath(cliResult, [["artifacts", "notes"]]);
    await assertFixture("upgrade.full.json", cliComparable);
  });
});
