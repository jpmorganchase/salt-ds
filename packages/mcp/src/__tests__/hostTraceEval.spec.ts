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
        cli: "salt-ds review <changed-path> --json",
        mcp: {
          tool: "review_salt_ui",
          args: {},
        },
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

  it("does not treat package installation as implementation, but flags later edits without rerun success", () => {
    const report = evaluateHostTrace([
      toolCall(
        "create_salt_ui",
        createContract({
          status: "blocked",
          safety: {
            canonical_complete: false,
            exact_request_safe: false,
            blocking_reasons: ["Salt packages are not installed"],
          },
          action: {
            kind: "install_dependencies",
            package_manager: "npm",
            packages: ["@salt-ds/core", "@salt-ds/theme"],
            rule_ids: [],
            post_action: null,
          },
          next_required_action: {
            kind: "install_dependencies",
            package_manager: "npm",
            packages: ["@salt-ds/core", "@salt-ds/theme"],
          },
          allowed_next_actions: ["install_dependencies"],
          evidence: {
            status: "missing",
            items: [],
            source_urls: [],
            missing: ["Salt dependencies must be installed first"],
            heuristic_fallback: false,
          },
        }),
      ),
      toolCall(
        "run_in_terminal",
        {},
        "npm install @salt-ds/core @salt-ds/theme",
      ),
      toolCall("copilot_createFile", {}, "create src/ProfilePage.tsx"),
    ]);
    const failureCodes = report.critical_failures.map(
      (failure) => failure.code,
    );

    expect(failureCodes).toContain("missing_success_contract_before_edit");
    expect(failureCodes).toContain(
      "edit_after_install_dependencies_without_rerun",
    );
    expect(failureCodes).toContain(
      "implementation_after_non_implement_contract",
    );
    expect(failureCodes).not.toContain("missing_dependency_action");
  });

  it("passes dependency install, rerun success, edit, and review in order", () => {
    const report = evaluateHostTrace([
      toolCall(
        "create_salt_ui",
        createContract({
          status: "blocked",
          safety: {
            canonical_complete: false,
            exact_request_safe: false,
            blocking_reasons: ["Salt packages are not installed"],
          },
          action: {
            kind: "install_dependencies",
            package_manager: "npm",
            packages: ["@salt-ds/core", "@salt-ds/theme"],
            rule_ids: [],
            post_action: null,
          },
          next_required_action: {
            kind: "install_dependencies",
            package_manager: "npm",
            packages: ["@salt-ds/core", "@salt-ds/theme"],
          },
          allowed_next_actions: ["install_dependencies", "rerun_workflow"],
          evidence: {
            status: "missing",
            items: [],
            source_urls: [],
            missing: ["Salt dependencies must be installed first"],
            heuristic_fallback: false,
          },
        }),
      ),
      toolCall(
        "run_in_terminal",
        {},
        "npm install @salt-ds/core @salt-ds/theme",
      ),
      toolCall("create_salt_ui", createContract()),
      toolCall("copilot_createFile", {}, "create src/ProfilePage.tsx"),
      toolCall("review_salt_ui", { contract: "salt_workflow_v1" }),
    ]);

    expect(report).toEqual(
      expect.objectContaining({
        passed: true,
        critical_failures: [],
      }),
    );
  });

  it("flags edits after retrieval when the originating workflow was not rerun", () => {
    const report = evaluateHostTrace([
      toolCall(
        "create_salt_ui",
        createContract({
          status: "partial",
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
            ],
            source_urls: ["/salt/components/tabs"],
            missing: ["follow-through evidence for Avatar"],
            heuristic_fallback: false,
          },
        }),
      ),
      toolCall("get_salt_entity", {
        workflow: "get_salt_entity",
        entity: { name: "Avatar" },
      }),
      toolCall("copilot_replaceString", {}, "write profile avatar and tabs"),
    ]);
    const failureCodes = report.critical_failures.map(
      (failure) => failure.code,
    );

    expect(failureCodes).toContain("missing_success_contract_before_edit");
    expect(failureCodes).toContain(
      "implementation_after_non_implement_contract",
    );
  });

  it("flags patch and file mutation tool calls after retrieval when the originating workflow was not rerun", () => {
    for (const toolId of [
      "functions.apply_patch",
      "applypatch",
      "patch_file",
      "fs.writeFile",
    ]) {
      const report = evaluateHostTrace([
        toolCall(
          "create_salt_ui",
          createContract({
            status: "partial",
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
              ],
              source_urls: ["/salt/components/tabs"],
              missing: ["follow-through evidence for Avatar"],
              heuristic_fallback: false,
            },
          }),
        ),
        toolCall(
          toolId,
          {},
          "*** Begin Patch\n*** Update File: src/Profile.tsx\n+write profile avatar and tabs\n*** End Patch",
        ),
      ]);
      const failureCodes = report.critical_failures.map(
        (failure) => failure.code,
      );

      expect(failureCodes).toContain("missing_success_contract_before_edit");
      expect(failureCodes).toContain(
        "implementation_after_non_implement_contract",
      );
    }
  });

  it("flags workspace package-manager Salt installs without an install_dependencies action", () => {
    for (const command of [
      "npm --workspace app install @salt-ds/core @salt-ds/theme",
      "npm --workspace=app install @salt-ds/core @salt-ds/theme",
      "yarn add @salt-ds/core @salt-ds/theme",
      "yarn workspace app add @salt-ds/core @salt-ds/theme",
      "yarn --cwd app add @salt-ds/core @salt-ds/theme",
      "yarn --cwd=app add @salt-ds/core @salt-ds/theme",
      "pnpm add @salt-ds/core @salt-ds/theme",
      "pnpm --filter app add @salt-ds/core @salt-ds/theme",
      "pnpm --filter=app add @salt-ds/core @salt-ds/theme",
      "pnpm -w add @salt-ds/core @salt-ds/theme",
      "bun add @salt-ds/core @salt-ds/theme",
    ]) {
      const report = evaluateHostTrace([
        toolCall("run_in_terminal", {}, command),
      ]);

      expect(report.critical_failures.map((failure) => failure.code)).toContain(
        "missing_dependency_action",
      );
    }
  });

  it("passes retrieval, rerun success, edit, and review in order", () => {
    const report = evaluateHostTrace([
      toolCall(
        "create_salt_ui",
        createContract({
          status: "partial",
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
            ],
            source_urls: ["/salt/components/tabs"],
            missing: ["follow-through evidence for Avatar"],
            heuristic_fallback: false,
          },
        }),
      ),
      toolCall("get_salt_entity", {
        workflow: "get_salt_entity",
        entity: { name: "Avatar" },
      }),
      toolCall(
        "create_salt_ui",
        createContract({
          request: {
            entity: "profile page with tabs and avatar",
            resolved_entity: "Tabs",
            match_status: "broadened",
            exact_match_required: false,
            full_request_evidence_complete: true,
          },
          recipe: {
            steps: [
              {
                id: "resolved-avatar",
                action: {
                  kind: "retrieve_entity",
                  tool: "get_salt_entity",
                  args: { name: "Avatar" },
                },
                status: "complete",
                reason:
                  "Canonical Avatar evidence was supplied through resolved_entities.",
              },
              {
                id: "implement-tabs-region",
                action: {
                  kind: "implement",
                  scope: "exact_request",
                },
                status: "required",
                reason: "Implement Tabs in the profile page.",
              },
              {
                id: "implement-avatar-region",
                action: {
                  kind: "implement",
                  scope: "exact_request",
                },
                status: "required",
                reason: "Implement Avatar in the profile page.",
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
          evidence: {
            status: "complete",
            items: [
              {
                kind: "docs",
                source: "canonical_salt",
                entity: "Tabs",
                field: "source_urls",
                source_urls: ["/salt/components/tabs"],
              },
              {
                kind: "docs",
                source: "canonical_salt",
                entity: "Avatar",
                field: "source_urls",
                source_urls: ["/salt/components/avatar"],
              },
            ],
            source_urls: ["/salt/components/tabs", "/salt/components/avatar"],
            missing: [],
            heuristic_fallback: false,
          },
        }),
      ),
      toolCall("copilot_replaceString", {}, "write profile avatar and tabs"),
      toolCall("review_salt_ui", { contract: "salt_workflow_v1" }),
    ]);

    expect(report).toEqual(
      expect.objectContaining({
        passed: true,
        critical_failures: [],
      }),
    );
  });
});
