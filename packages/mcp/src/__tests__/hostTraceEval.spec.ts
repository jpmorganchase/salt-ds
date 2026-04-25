import { describe, expect, it } from "vitest";
import { evaluateHostTrace } from "../evals/hostTraceEval.js";

function toolCall(toolId: string, output: unknown, input = "") {
  return {
    toolId,
    resultDetails: {
      input,
      output: [{ value: JSON.stringify(output) }],
    },
  };
}

function createContract(
  overrides: Partial<Record<string, unknown>> = {},
): Record<string, unknown> {
  return {
    contract: "salt_workflow_v1",
    workflow: "create",
    transport: "mcp",
    status: "success",
    request: {
      entity: "Metric",
      resolved_entity: "Metric",
      match_status: "exact",
      exact_match_required: true,
    },
    safety: {
      canonical_complete: true,
      exact_request_safe: true,
      blocking_reasons: [],
    },
    action: {
      kind: "implement",
      scope: "exact_request",
      rule_ids: [],
      post_action: {
        kind: "review",
        tool: "review_salt_ui",
      },
    },
    next_required_action: {
      kind: "implement",
      scope: "exact_request",
    },
    allowed_next_actions: ["implement", "review"],
    recipe: {
      steps: [
        {
          id: "next-required-action",
          action: {
            kind: "implement",
            scope: "exact_request",
          },
          status: "required",
        },
        {
          id: "review-after-implementation",
          action: {
            kind: "review",
            tool: "review_salt_ui",
          },
          status: "available",
        },
      ],
    },
    questions: [],
    evidence: {
      status: "complete",
      items: [
        {
          kind: "docs",
          source: "canonical_salt",
          entity: "Metric",
          field: "source_urls",
          source_urls: ["/salt/components/metric"],
        },
      ],
      source_urls: ["/salt/components/metric"],
      missing: [],
      heuristic_fallback: false,
    },
    summary: "Salt grounded the exact requested entity Metric.",
    ...overrides,
  };
}

describe("host trace eval", () => {
  it("flags unsafe composite Salt create work without relying on a saved host transcript", () => {
    const report = evaluateHostTrace([
      toolCall("get_salt_project_context", {
        result: {
          salt: {
            packages: [],
          },
        },
      }),
      toolCall(
        "create_salt_ui",
        createContract({
          status: "success",
          request: {
            entity: "profile page with tabs and avatar",
            resolved_entity: "Tabs",
            match_status: "broadened",
            exact_match_required: false,
          },
          safety: {
            canonical_complete: false,
            exact_request_safe: false,
            blocking_reasons: [],
          },
          evidence: {
            status: "missing",
            items: [],
            source_urls: [],
            missing: ["source-backed Salt evidence"],
            heuristic_fallback: true,
          },
          summary:
            "Unsafe historical behavior: broadened profile tabs/avatar work was treated as directly implementable.",
        }),
        '{"query":"profile page with tabs and avatar"}',
      ),
    ]);
    const failureCodes = report.critical_failures.map(
      (failure) => failure.code,
    );

    expect(report.passed).toBe(false);
    expect(report.workflow_contracts.length).toBeGreaterThan(0);
    expect(failureCodes).toContain(
      "broadened_success_without_composite_recipe",
    );
    expect(failureCodes).toContain("implement_without_source_backed_evidence");
    expect(failureCodes).toContain("missing_dependency_action");
  });

  it("passes an ideal composite trace that follows retrieval instead of editing", () => {
    const report = evaluateHostTrace([
      toolCall("get_salt_project_context", {
        result: {
          salt: {
            packages: [{ name: "@salt-ds/core" }],
          },
        },
      }),
      toolCall(
        "create_salt_ui",
        createContract({
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
            tool: "get_salt_entity",
            args: { name: "Avatar" },
            rule_ids: ["create-follow-through-required"],
            post_action: null,
          },
          next_required_action: {
            kind: "retrieve_entity",
            tool: "get_salt_entity",
            args: { name: "Avatar" },
          },
          allowed_next_actions: ["retrieve_entity"],
          recipe: {
            steps: [
              {
                id: "retrieve-avatar",
                action: {
                  kind: "retrieve_entity",
                  tool: "get_salt_entity",
                  args: { name: "Avatar" },
                },
                status: "required",
              },
            ],
          },
          evidence: {
            status: "partial",
            items: [
              {
                kind: "docs",
                source: "canonical_salt",
                entity: "Tabs",
                field: "source_urls",
                source_urls: ["/salt/components/tabs"],
              },
              {
                kind: "registry",
                source: "canonical_salt",
                entity: "Tabs",
                field: "when_to_use",
                source_urls: ["/salt/components/tabs"],
              },
            ],
            source_urls: ["/salt/components/tabs"],
            missing: ["follow-through evidence for Avatar"],
            heuristic_fallback: false,
          },
          summary:
            "Salt interpreted profile page with tabs and avatar as the broader Salt entity Tabs.",
        }),
        '{"query":"profile page with tabs and avatar"}',
      ),
      toolCall("get_salt_entity", {
        workflow: "get_salt_entity",
        entity: { name: "Avatar" },
      }),
    ]);

    expect(report).toEqual(
      expect.objectContaining({
        passed: true,
        critical_failures: [],
      }),
    );
  });

  it("flags implementation work after ask_user without a user answer", () => {
    const report = evaluateHostTrace([
      toolCall(
        "create_salt_ui",
        createContract({
          status: "blocked",
          safety: {
            canonical_complete: false,
            exact_request_safe: false,
            blocking_reasons: ["answered clarification"],
          },
          action: {
            kind: "ask_user",
            question:
              "Should these tabs switch in-page content or navigate between pages?",
            rule_ids: [],
            post_action: null,
          },
          next_required_action: {
            kind: "ask_user",
            question:
              "Should these tabs switch in-page content or navigate between pages?",
          },
          allowed_next_actions: ["ask_user"],
          questions: [
            "Should these tabs switch in-page content or navigate between pages?",
          ],
          evidence: {
            status: "partial",
            items: [
              {
                kind: "docs",
                source: "canonical_salt",
                entity: "Tabs",
                field: "when_not_to_use",
                source_urls: ["/salt/components/tabs"],
              },
            ],
            source_urls: ["/salt/components/tabs"],
            missing: ["answered clarification"],
            heuristic_fallback: false,
          },
        }),
      ),
      toolCall("copilot_editFile", {}, "write profile tabs implementation"),
    ]);

    expect(report.critical_failures.map((failure) => failure.code)).toContain(
      "ask_user_ignored",
    );
  });

  it("flags generic examples used as canonical Salt evidence", () => {
    const report = evaluateHostTrace([
      toolCall(
        "create_salt_ui",
        createContract({
          evidence: {
            status: "complete",
            items: [
              {
                kind: "examples",
                source: "canonical_salt",
                entity: "Tabs",
                field: "examples",
                source_urls: ["https://react.dev/learn"],
              },
            ],
            source_urls: ["https://react.dev/learn"],
            missing: [],
            heuristic_fallback: false,
          },
        }),
      ),
      toolCall("copilot_editFile", {}, "write tabs implementation"),
      toolCall("review_salt_ui", { contract: "salt_workflow_v1" }),
    ]);

    expect(report.critical_failures.map((failure) => failure.code)).toContain(
      "generic_example_used_as_canonical_evidence",
    );
  });

  it("flags skipped review after an implementation post-action", () => {
    const report = evaluateHostTrace([
      toolCall("create_salt_ui", createContract()),
      toolCall("copilot_editFile", {}, "write metric implementation"),
    ]);

    expect(report.critical_failures.map((failure) => failure.code)).toContain(
      "review_post_action_skipped",
    );
  });
});
