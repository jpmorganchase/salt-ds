import { describe, expect, it } from "vitest";
import {
  judgeWorkflowEvalScenario,
  type WorkflowEvalScenario,
  type WorkflowEvalTrace,
} from "../evals/workflowEvalHarness.js";

function buildScenario(): WorkflowEvalScenario {
  return {
    id: "intent-composite-create",
    audience: "existing-salt-team",
    tags: ["intent-fixture", "create", "composite"],
    fixture: {
      kind: "repo",
      root_dir: "fixtures/profile",
      description: "Semantic fixture for composite profile create behavior.",
    },
    task: {
      workflow: "create",
      prompt: "Create a profile page with tabs and avatar.",
    },
    capabilities: {
      mcp: true,
    },
    args: {
      mcp: {
        query: "profile page with tabs and avatar",
      },
    },
    expected: {
      public_contract: {
        workflow_status: ["partial", "blocked"],
        canonical_complete: false,
        safe_to_implement_exact_request: false,
        resolved_entity: "Tabs",
        match_status: "broadened",
        next_step: {
          kind: "retrieve_entity",
          tool: "get_salt_reference",
          name: "Avatar",
        },
        allowed_next_actions: ["retrieve_entity", "rerun_workflow"],
        evidence: {
          status: "partial",
          required_kinds: ["docs", "registry"],
          min_source_urls: 1,
        },
        recipe: {
          required_action_kinds: ["retrieve_entity", "rerun_workflow"],
          required_entities: ["Avatar"],
        },
      },
    },
  };
}

function buildTrace(workflowResult: unknown): WorkflowEvalTrace {
  return {
    scenario_id: "intent-composite-create",
    runner_id: "fixture",
    status: "passed",
    transport_trace: [
      {
        transport: "mcp",
        status: "succeeded",
        detail: "Fixture runner returned a compact public contract.",
      },
    ],
    workflow_result: workflowResult,
    transcript: ["Create a profile page with tabs and avatar."],
    metrics: {
      transcript_line_count: 1,
      transcript_bytes: 45,
      workflow_result_bytes: 1,
      logs_bytes: 0,
      payload_bytes: 46,
      approx_prompt_tokens: 12,
      duration_ms: 1,
    },
    artifacts: {},
  };
}

function buildCompositeContract() {
  return {
    contract: "salt_workflow_v1",
    workflow: "create",
    transport: "mcp",
    status: "partial",
    request: {
      entity: "profile page with tabs and avatar",
      resolved_entity: "Tabs",
      match_status: "broadened",
      exact_match_required: false,
    },
    safety: {
      canonical_complete: false,
      exact_request_safe: false,
      blocking_reasons: ["required follow-through remains: Avatar"],
    },
    action: {
      kind: "retrieve_entity",
      tool: "get_salt_reference",
      args: { kind: "entity", names: ["Avatar"] },
      rule_ids: ["create-follow-through-required"],
      post_action: null,
    },
    next_required_action: {
      kind: "retrieve_entity",
      tool: "get_salt_reference",
      args: { kind: "entity", names: ["Avatar"] },
    },
    allowed_next_actions: ["retrieve_entity", "rerun_workflow"],
    recipe: {
      steps: [
        {
          id: "retrieve-avatar",
          action: {
            kind: "retrieve_entity",
            tool: "get_salt_reference",
            args: { kind: "entity", names: ["Avatar"] },
          },
          status: "required",
        },
        {
          id: "rerun-originating-create-workflow",
          action: {
            kind: "rerun_workflow",
            tool: "create_salt_ui",
            args: {
              query: "profile page with tabs and avatar",
              resolved_entities: ["Avatar"],
            },
          },
          status: "required",
        },
      ],
    },
    questions: [],
    evidence: {
      status: "partial",
      items: [
        {
          kind: "registry",
          source: "canonical_salt",
          entity: "Tabs",
          field: "when_to_use",
          source_urls: ["/salt/components/tabs"],
        },
        {
          kind: "docs",
          source: "canonical_salt",
          entity: "Tabs",
          field: "source_urls",
          source_urls: ["/salt/components/tabs"],
        },
      ],
      source_urls: ["/salt/components/tabs"],
      missing: ["follow-through evidence for Avatar"],
      heuristic_fallback: false,
    },
    summary: "Salt resolved Tabs as the current create direction.",
  };
}

describe("workflow intent fixtures", () => {
  it("passes semantic composite create expectations without depending on JSON shape", () => {
    const judgment = judgeWorkflowEvalScenario(
      buildScenario(),
      buildTrace({
        extra_field: "harmless",
        ...buildCompositeContract(),
      }),
    );

    expect(judgment.status).toBe("passed");
  });

  it("fails when required source-backed evidence disappears", () => {
    const contract = buildCompositeContract();
    contract.evidence = {
      status: "missing",
      items: [],
      source_urls: [],
      missing: ["canonical Salt source evidence is missing"],
      heuristic_fallback: false,
    };

    const judgment = judgeWorkflowEvalScenario(
      buildScenario(),
      buildTrace(contract),
    );

    expect(judgment).toEqual(
      expect.objectContaining({
        status: "failed",
        reasons: expect.arrayContaining([
          expect.stringContaining("evidence.status"),
          expect.stringContaining("required kind"),
          expect.stringContaining("source URL count"),
        ]),
      }),
    );
  });
});
