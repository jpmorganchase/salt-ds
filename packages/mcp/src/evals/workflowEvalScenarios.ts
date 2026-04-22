import path from "node:path";
import type {
  EvalTransport,
  WorkflowEvalCliArgs,
  WorkflowEvalScenario,
} from "./workflowEvalHarness.js";

export interface WorkflowEvalFixtureRoots {
  fixture_base_dir: string;
}

function buildCliArgs(argv: string[]): WorkflowEvalCliArgs {
  return { argv };
}

function repoFixture(
  fixtureBaseDir: string,
  name: string,
  description: string,
) {
  return {
    kind: "repo" as const,
    root_dir: path.join(fixtureBaseDir, name),
    description,
  };
}

function preferMcpWithCliFallback() {
  return {
    preferred: "mcp" as EvalTransport,
    fallback: "cli" as EvalTransport,
    stop_if_all_fail: true as const,
  };
}

type WorkflowEvalExpected = WorkflowEvalScenario["expected"];
type WorkflowEvalMetricBudgets = NonNullable<WorkflowEvalExpected["metrics"]>;

function buildWorkflowMetricBudgets(
  workflow: WorkflowEvalScenario["task"]["workflow"],
): WorkflowEvalMetricBudgets {
  switch (workflow) {
    case "create":
      return {
        max_transcript_bytes: 1600,
        max_workflow_result_bytes: 1400,
        max_payload_bytes: 2800,
        max_duration_ms: 120000,
      };
    case "migrate":
      return {
        max_transcript_bytes: 2000,
        max_workflow_result_bytes: 1800,
        max_payload_bytes: 3200,
        max_duration_ms: 120000,
      };
    case "upgrade":
      return {
        max_transcript_bytes: 1400,
        max_workflow_result_bytes: 900,
        max_payload_bytes: 2200,
        max_duration_ms: 120000,
      };
    case "review":
    default:
      return {
        max_transcript_bytes: 1800,
        max_workflow_result_bytes: 1000,
        max_payload_bytes: 2600,
        max_duration_ms: 120000,
      };
  }
}

function withWorkflowMetricBudgets(
  workflow: WorkflowEvalScenario["task"]["workflow"],
  expected: WorkflowEvalExpected,
  overrides: Partial<WorkflowEvalMetricBudgets> = {},
): WorkflowEvalExpected {
  return {
    ...expected,
    metrics: {
      ...buildWorkflowMetricBudgets(workflow),
      ...(expected.metrics ?? {}),
      ...overrides,
    },
  };
}

export function buildDefaultWorkflowEvalScenarios(
  roots: WorkflowEvalFixtureRoots,
): WorkflowEvalScenario[] {
  const existingSalt = repoFixture(
    roots.fixture_base_dir,
    "existing-salt",
    "Existing Salt repo reviewing and upgrading scoped feature work in the IDE.",
  );
  const existingSaltPolicy = repoFixture(
    roots.fixture_base_dir,
    "existing-salt-policy",
    "Existing Salt repo with declared project policy to test canonical-vs-local guidance boundaries.",
  );
  const nonSalt = repoFixture(
    roots.fixture_base_dir,
    "non-salt",
    "Existing non-Salt repo migrating a described or screenshot-derived screen into Salt.",
  );
  const newProject = repoFixture(
    roots.fixture_base_dir,
    "new-project",
    "New project repo using bounded create prompts in the IDE.",
  );
  const orderOutlinePath = path.join(
    nonSalt.root_dir,
    ".salt",
    "orders.source-outline.json",
  );
  const screenshotOutlinePath = path.join(
    nonSalt.root_dir,
    ".salt",
    "screenshot-derived.source-outline.json",
  );
  const toolbarPath = path.join(
    existingSalt.root_dir,
    "src",
    "ToolbarAction.tsx",
  );

  return [
    {
      id: "existing-salt-review-toolbar",
      audience: "existing-salt-team",
      tags: ["default", "review"],
      fixture: existingSalt,
      task: {
        workflow: "review",
        prompt:
          "Use salt-ds to review this toolbar file. Focus on primitive choice, layout ownership, deprecated Salt usage, and the safest next fix.",
      },
      capabilities: {
        mcp: true,
        cli: true,
      },
      args: {
        mcp: {
          code: [
            'import { Button, FlexLayout } from "@salt-ds/core";',
            "",
            "export function ToolbarAction() {",
            "  return (",
            '    <FlexLayout align="center" gap={1}>',
            '      <Button href="/orders">Orders</Button>',
            '      <Button appearance="secondary">Refresh</Button>',
            "    </FlexLayout>",
            "  );",
            "}",
          ].join("\n"),
          framework: "react",
          package_version: "2.0.0",
        },
        cli: buildCliArgs(["review", toolbarPath]),
      },
      expected: withWorkflowMetricBudgets("review", {
        transport: preferMcpWithCliFallback(),
        workflow: {
          id: "review_salt_ui",
        },
        public_contract: {
          workflow_status: "blocked",
          canonical_complete: true,
          safe_to_implement_exact_request: false,
          next_step: {
            kind: "ask_user",
          },
          summary_includes: ["still need attention"],
        },
      }),
    },
    {
      id: "existing-salt-upgrade-core",
      audience: "existing-salt-team",
      tags: ["default", "upgrade"],
      fixture: existingSalt,
      task: {
        workflow: "upgrade",
        prompt:
          "Use salt-ds to upgrade this feature from Salt 1.x to 2.x. Separate required changes from optional cleanup and keep the scope to this feature.",
      },
      capabilities: {
        mcp: true,
        cli: true,
      },
      args: {
        mcp: {
          package: "@salt-ds/core",
          from_version: "1.1.0",
          include_deprecations: true,
        },
        cli: buildCliArgs([
          "upgrade",
          "--package",
          "@salt-ds/core",
          "--from-version",
          "1.1.0",
          "--include-deprecations",
        ]),
      },
      expected: withWorkflowMetricBudgets("upgrade", {
        transport: preferMcpWithCliFallback(),
        workflow: {
          id: "upgrade_salt_ui",
        },
        public_contract: {
          workflow_status: "blocked",
          canonical_complete: true,
          safe_to_implement_exact_request: false,
          next_step: {
            kind: "review",
            tool: "review_salt_ui",
          },
          summary_includes: ["upgrade guidance"],
        },
      }),
    },
    {
      id: "non-salt-migrate-screen",
      audience: "non-salt-team",
      tags: ["default", "migrate"],
      fixture: nonSalt,
      task: {
        workflow: "migrate",
        prompt:
          "Use salt-ds to migrate this screen into Salt. Preserve action order, empty-state behavior, and keyboard flow.",
      },
      capabilities: {
        mcp: true,
        cli: true,
        screenshot_input: true,
      },
      args: {
        mcp: {
          query:
            "Build an orders screen with a header, filters, summary strip, results table, and empty state.",
          include_starter_code: true,
          source_outline: {
            regions: [
              "header",
              "filters",
              "summary",
              "results-table",
              "empty-state",
            ],
            actions: ["Create order", "Refresh"],
            states: ["loading", "empty"],
            notes: [
              "Keep the primary action in the top-right header area.",
              "Preserve keyboard flow between filters and the results table.",
            ],
          },
        },
        cli: buildCliArgs([
          "migrate",
          "Build an orders screen with a header, filters, summary strip, results table, and empty state.",
          "--source-outline",
          orderOutlinePath,
          "--include-starter-code",
        ]),
      },
      expected: withWorkflowMetricBudgets("migrate", {
        transport: preferMcpWithCliFallback(),
        workflow: {
          id: "migrate_to_salt",
        },
        public_contract: {
          workflow_status: "blocked",
          canonical_complete: false,
          safe_to_implement_exact_request: false,
          next_step: {
            kind: "ask_user",
          },
          summary_includes: ["migration direction"],
        },
      }),
    },
    {
      id: "new-project-create-dashboard",
      audience: "new-project-team",
      tags: ["default", "create"],
      fixture: newProject,
      task: {
        workflow: "create",
        prompt:
          "Use salt-ds to add a finance metric dashboard with KPI cards, sparklines, and a data grid table. Keep the answer bounded and ask one blocking question only if needed.",
      },
      capabilities: {
        mcp: true,
        cli: true,
      },
      args: {
        mcp: {
          query:
            "create a finance metric dashboard with KPI cards, sparklines, and a data grid table",
          include_starter_code: true,
        },
        cli: buildCliArgs([
          "create",
          "create a finance metric dashboard with KPI cards, sparklines, and a data grid table",
          "--include-starter-code",
        ]),
      },
      expected: withWorkflowMetricBudgets("create", {
        transport: preferMcpWithCliFallback(),
        workflow: {
          id: "create_salt_ui",
        },
        public_contract: {
          workflow_status: "blocked",
          canonical_complete: false,
          safe_to_implement_exact_request: false,
          resolved_entity: "Analytical dashboard",
          match_status: "broadened",
          next_step: {
            kind: "tool_call",
            tool: "create_salt_ui",
            mode: "exact_name",
            query: "Data grid",
          },
          summary_includes: [
            "broader Salt entity Analytical dashboard",
          ],
        },
        canonical_choice: "Analytical dashboard",
        final_choice: "Analytical dashboard",
      }),
    },
    {
      id: "existing-salt-create-policy-aware-dashboard",
      audience: "existing-salt-team",
      tags: ["default", "create", "policy"],
      fixture: existingSaltPolicy,
      task: {
        workflow: "create",
        prompt:
          "Use salt-ds to add an analytical dashboard shell for a market monitor screen. Keep canonical Salt guidance primary and apply repo-local wrappers only after the core direction is clear.",
      },
      capabilities: {
        mcp: true,
        cli: true,
        project_conventions: true,
      },
      args: {
        mcp: {
          query:
            "add an analytical dashboard shell for a market monitor screen with metrics, filters, and a results grid",
          include_starter_code: true,
        },
        cli: buildCliArgs([
          "create",
          "add an analytical dashboard shell for a market monitor screen with metrics, filters, and a results grid",
          "--include-starter-code",
        ]),
      },
      expected: withWorkflowMetricBudgets("create", {
        transport: preferMcpWithCliFallback(),
        workflow: {
          id: "create_salt_ui",
        },
        public_contract: {
          workflow_status: ["blocked", "partial"],
          canonical_complete: false,
          safe_to_implement_exact_request: false,
          resolved_entity: "Analytical dashboard",
          match_status: "broadened",
          next_step: {
            kind: "tool_call",
            tool: "create_salt_ui",
            mode: "exact_name",
            query: "Metric",
          },
          summary_includes: ["broader Salt entity Analytical dashboard"],
        },
        canonical_choice: "Analytical dashboard",
        final_choice: "Analytical dashboard",
      }),
    },
    {
      id: "non-salt-migrate-screenshot-derived-outline",
      audience: "non-salt-team",
      tags: ["default", "migrate", "screenshot"],
      fixture: nonSalt,
      task: {
        workflow: "migrate",
        prompt:
          "Use salt-ds to migrate this screenshot-derived screen outline into Salt. Treat the screenshot evidence as supporting, keep the navigation grouping familiar, and preserve the empty state hierarchy.",
      },
      capabilities: {
        mcp: true,
        cli: true,
        screenshot_input: true,
      },
      args: {
        mcp: {
          query:
            "Build a shell with sidebar navigation, a header toolbar, content, and an empty state. The source outline was derived from a screenshot adapter and is supporting evidence only.",
          include_starter_code: true,
          source_outline: {
            regions: ["header", "sidebar", "toolbar", "content", "empty-state"],
            actions: ["Save", "Refresh"],
            states: ["loading", "empty"],
            notes: [
              "This outline was derived from a screenshot adapter and should be treated as supporting evidence only.",
              "Keep the navigation grouping and empty-state hierarchy familiar.",
            ],
          },
        },
        cli: buildCliArgs([
          "migrate",
          "Build a shell with sidebar navigation, a header toolbar, content, and an empty state. The source outline was derived from a screenshot adapter and is supporting evidence only.",
          "--source-outline",
          screenshotOutlinePath,
          "--include-starter-code",
        ]),
      },
      expected: withWorkflowMetricBudgets("migrate", {
        transport: preferMcpWithCliFallback(),
        workflow: {
          id: "migrate_to_salt",
        },
        public_contract: {
          workflow_status: "blocked",
          canonical_complete: false,
          safe_to_implement_exact_request: false,
          next_step: {
            kind: "ask_user",
          },
          summary_includes: ["migration direction"],
        },
      }),
    },
    {
      id: "existing-salt-review-mcp-blocked-cli-fallback",
      audience: "existing-salt-team",
      tags: ["transport", "review"],
      fixture: existingSalt,
      task: {
        workflow: "review",
        prompt:
          "Use salt-ds to review this toolbar file. If MCP is unavailable in the host, fall back to the CLI path and keep the same summary-first answer.",
      },
      capabilities: {
        mcp: true,
        cli: true,
      },
      args: {
        mcp: {
          code: [
            'import { Button, FlexLayout } from "@salt-ds/core";',
            "",
            "export function ToolbarAction() {",
            "  return (",
            '    <FlexLayout align="center" gap={1}>',
            '      <Button href="/orders">Orders</Button>',
            '      <Button appearance="secondary">Refresh</Button>',
            "    </FlexLayout>",
            "  );",
            "}",
          ].join("\n"),
          framework: "react",
          package_version: "2.0.0",
        },
        cli: buildCliArgs(["review", toolbarPath]),
      },
      expected: withWorkflowMetricBudgets(
        "review",
        {
          transport: preferMcpWithCliFallback(),
          workflow: {
            id: "review_salt_ui",
          },
          public_contract: {
            workflow_status: "blocked",
            canonical_complete: true,
            safe_to_implement_exact_request: false,
            next_step: {
              kind: "ask_user",
            },
            summary_includes: ["still need attention"],
          },
        },
        {
          max_transcript_bytes: 2200,
          max_payload_bytes: 3000,
        },
      ),
    },
    {
      id: "existing-salt-review-all-transports-blocked",
      audience: "existing-salt-team",
      tags: ["transport", "review", "blocked"],
      fixture: existingSalt,
      task: {
        workflow: "review",
        prompt:
          "Use salt-ds to review this toolbar file. Stop cleanly if neither MCP nor CLI transport is available.",
      },
      capabilities: {
        mcp: true,
        cli: true,
      },
      args: {
        mcp: {
          code: [
            'import { Button, FlexLayout } from "@salt-ds/core";',
            "",
            "export function ToolbarAction() {",
            "  return (",
            '    <FlexLayout align="center" gap={1}>',
            '      <Button href="/orders">Orders</Button>',
            '      <Button appearance="secondary">Refresh</Button>',
            "    </FlexLayout>",
            "  );",
            "}",
          ].join("\n"),
          framework: "react",
          package_version: "2.0.0",
        },
        cli: buildCliArgs(["review", toolbarPath]),
      },
      expected: {
        transport: preferMcpWithCliFallback(),
        summary_first: true,
        require_verify: true,
      },
    },
    {
      id: "existing-salt-review-runtime-evidence-escalation",
      audience: "existing-salt-team",
      tags: ["planned", "review", "runtime"],
      fixture: existingSalt,
      task: {
        workflow: "review",
        prompt:
          "Use salt-ds to review this toolbar file and include runtime evidence from the active URL before finalizing the fix order.",
      },
      capabilities: {
        mcp: true,
        cli: true,
        runtime_url: true,
      },
      args: {
        mcp: {
          code: [
            'import { Button, FlexLayout } from "@salt-ds/core";',
            "",
            "export function ToolbarAction() {",
            "  return (",
            '    <FlexLayout align="center" gap={1}>',
            '      <Button href="/orders">Orders</Button>',
            '      <Button appearance="secondary">Refresh</Button>',
            "    </FlexLayout>",
            "  );",
            "}",
          ].join("\n"),
          framework: "react",
          package_version: "2.0.0",
          url: "http://localhost:6006/iframe.html?id=patterns-app-header--app-header",
        },
        cli: buildCliArgs([
          "review",
          toolbarPath,
          "--url",
          "http://localhost:6006/iframe.html?id=patterns-app-header--app-header",
        ]),
      },
      expected: {
        transport: preferMcpWithCliFallback(),
        workflow: {
          id: "review_salt_ui",
        },
        summary_first: true,
        require_verify: true,
        max_blocking_questions: 0,
      },
    },
  ];
}

export function filterWorkflowEvalScenarios(
  scenarios: WorkflowEvalScenario[],
  options: {
    scenario_ids?: string[];
    include_tags?: string[];
    exclude_tags?: string[];
  } = {},
): WorkflowEvalScenario[] {
  const includeIds = new Set(options.scenario_ids ?? []);
  const includeTags = new Set(options.include_tags ?? []);
  const excludeTags = new Set(options.exclude_tags ?? []);

  return scenarios.filter((scenario) => {
    if (includeIds.size > 0 && !includeIds.has(scenario.id)) {
      return false;
    }

    if (
      includeTags.size > 0 &&
      !scenario.tags.some((tag) => includeTags.has(tag))
    ) {
      return false;
    }

    if (scenario.tags.some((tag) => excludeTags.has(tag))) {
      return false;
    }

    return true;
  });
}
