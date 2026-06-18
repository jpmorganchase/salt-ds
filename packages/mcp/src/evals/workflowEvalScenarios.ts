import path from "node:path";
import type { WorkflowEvalScenario } from "./workflowEvalHarness.js";

export interface WorkflowEvalFixtureRoots {
  fixture_base_dir: string;
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

// After Phase A (14-Jun) the CLI no longer runs salt-ds workflow commands;
// every scenario reaches the MCP via stdio only. We keep `stop_if_all_fail`
// so the harness fails cleanly when the (single) MCP transport is
// unavailable rather than silently skipping.
function stopIfTransportUnavailable() {
  return {
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
        max_workflow_result_bytes: 10000,
        max_payload_bytes: 10500,
        max_duration_ms: 120000,
      };
    case "migrate":
      return {
        max_transcript_bytes: 2000,
        max_workflow_result_bytes: 2600,
        max_payload_bytes: 3200,
        max_duration_ms: 120000,
      };
    case "review":
    default:
      return {
        max_transcript_bytes: 1800,
        max_workflow_result_bytes: 2200,
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
      },
      expected: withWorkflowMetricBudgets("review", {
        transport: stopIfTransportUnavailable(),
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
      id: "existing-salt-review-version-risks",
      audience: "existing-salt-team",
      tags: ["default", "review", "version-risk"],
      fixture: existingSalt,
      task: {
        workflow: "review",
        prompt:
          "Use salt-ds to review this feature for Salt 1.x to 2.x version risks. Separate required changes from optional cleanup and keep the scope to this feature.",
      },
      capabilities: {
        mcp: true,
      },
      args: {
        mcp: {
          code: [
            'import { Button } from "@salt-ds/core";',
            "",
            "export function LegacyAction() {",
            '  return <Button variant="cta">Submit</Button>;',
            "}",
          ].join("\n"),
          framework: "react",
          from_version: "1.1.0",
          package_version: "2.0.0",
        },
      },
      expected: withWorkflowMetricBudgets("review", {
        transport: stopIfTransportUnavailable(),
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
      },
      expected: withWorkflowMetricBudgets("migrate", {
        transport: stopIfTransportUnavailable(),
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
      },
      args: {
        mcp: {
          query:
            "create a finance metric dashboard with KPI cards, sparklines, and a data grid table",
          include_starter_code: true,
        },
      },
      expected: withWorkflowMetricBudgets("create", {
        transport: stopIfTransportUnavailable(),
        workflow: {
          id: "create_salt_ui",
        },
        public_contract: {
          workflow_status: "blocked",
          canonical_complete: false,
          safe_to_implement_exact_request: false,
          resolved_entity: "Analytical dashboard",
          match_status: "broadened",
          // The new-project fixture has no @salt-ds/* packages declared, so
          // the workflow correctly emits install_dependencies first (PR 12
          // hardened this — the previous expectation of jumping straight to
          // a retrieve_entity tool_call presumed Salt was already installed).
          // Hosts complete the install, then rerun, then receive the Data
          // grid retrieve_entity step through get_salt_reference.
          next_step: {
            kind: "install_dependencies",
          },
          summary_includes: ["broader Salt entity Analytical dashboard"],
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
        project_conventions: true,
      },
      args: {
        mcp: {
          query:
            "add an analytical dashboard shell for a market monitor screen with metrics, filters, and a results grid",
          include_starter_code: true,
        },
      },
      expected: withWorkflowMetricBudgets("create", {
        transport: stopIfTransportUnavailable(),
        workflow: {
          id: "create_salt_ui",
        },
        public_contract: {
          workflow_status: ["blocked", "partial"],
          canonical_complete: false,
          safe_to_implement_exact_request: false,
          resolved_entity: "Analytical dashboard",
          match_status: "broadened",
          // The retrieve_entity action kind replaced the old self-referential
          // "tool_call create_salt_ui exact_name" pattern when a create
          // workflow needs to ground a follow-through entity. Hosts call
          // get_salt_reference to fetch the canonical Metric details, then
          // rerun create with that grounding.
          next_step: {
            kind: "retrieve_entity",
            tool: "get_salt_reference",
            name: "Metric",
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
      },
      expected: withWorkflowMetricBudgets("migrate", {
        transport: stopIfTransportUnavailable(),
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
