import { describe, expect, it } from "vitest";
import type { SaltRegistry } from "../../types.js";
import type { CreateSaltUiResult } from "../createSaltUi.js";
import {
  assertValidPublicContractV2,
  buildCreatePublicContractV2,
  buildMigratePublicContractV2,
  buildPublicContractV2,
  buildReviewPublicContractV2,
  buildUpgradePublicContractV2,
  getPublicContractV2ValidationErrors,
  type PublicContractV2Input,
  type PublicNextStep,
} from "../publicContractV2.js";
import type {
  CreateSaltUiWorkflowContract,
  MigrateToSaltWorkflowContract,
  ReviewSaltUiWorkflowContract,
  UpgradeSaltUiWorkflowContract,
} from "../workflowContracts.js";

const exactNameStep: PublicNextStep = {
  kind: "tool_call",
  tool: "create_salt_ui",
  mode: "exact_name",
  args: {
    query: "Metric",
  },
};

function buildInput(
  overrides: Partial<PublicContractV2Input> = {},
): PublicContractV2Input {
  return {
    workflow: "create",
    transport_used: "mcp",
    exact_request: {
      requested_entity: "Metric",
      resolved_entity: "Metric",
      match_status: "exact",
      exact_match_required: true,
    },
    state: {
      implementation_ready: true,
      required_follow_through: [],
      blocking_questions: [],
      starter_blockers: [],
      project_policy_blockers: [],
      hard_blocked: false,
      context_ready: true,
      usable_guidance_present: true,
      transport_failed: false,
    },
    summary: "Salt grounded the exact requested region.",
    next_step: {
      kind: "implement",
      scope: "exact_request",
    },
    ...overrides,
  };
}

function buildPattern(
  name: string,
  aliases: string[] = [],
  options: {
    category?: string[];
    related_patterns?: string[];
  } = {},
): SaltRegistry["patterns"][number] {
  return {
    id: name.toLowerCase().replace(/\s+/g, "-"),
    name,
    aliases,
    summary: `${name} summary`,
    status: "stable",
    category: options.category ?? [],
    when_to_use: [],
    when_not_to_use: [],
    composed_of: [],
    related_patterns: options.related_patterns ?? [],
    how_to_build: [],
    how_it_works: [],
    accessibility: {
      summary: [],
    },
    resources: [],
    examples: [],
    related_docs: {
      overview: `/salt/patterns/${name.toLowerCase().replace(/\s+/g, "-")}`,
    },
    last_verified_at: "2026-04-10T00:00:00Z",
  };
}

function buildComponent(
  name: string,
  aliases: string[] = [],
  options: {
    category?: string[];
    patterns?: string[];
  } = {},
): SaltRegistry["components"][number] {
  return {
    id: name.toLowerCase().replace(/\s+/g, "-"),
    name,
    aliases,
    package: {
      name: "@salt-ds/core",
      status: "stable",
      since: null,
    },
    summary: `${name} summary`,
    status: "stable",
    category: options.category ?? [],
    tags: [],
    when_to_use: [],
    when_not_to_use: [],
    alternatives: [],
    props: [],
    accessibility: {
      summary: [],
      rules: [],
    },
    tokens: [],
    patterns: options.patterns ?? [],
    examples: [],
    related_docs: {
      overview: `/salt/components/${name.toLowerCase().replace(/\s+/g, "-")}`,
      usage: `/salt/components/${name.toLowerCase().replace(/\s+/g, "-")}/usage`,
      accessibility: null,
      examples: null,
    },
    source: {
      repo_path: null,
      export_name: name.replace(/\s+/g, ""),
    },
    deprecations: [],
    last_verified_at: "2026-04-10T00:00:00Z",
  };
}

function buildRegistryFixture(): SaltRegistry {
  return {
    generated_at: "2026-04-10T00:00:00Z",
    version: "test",
    build_info: null,
    packages: [],
    components: [
      buildComponent("Chart", [], {
        category: ["data-display-and-analysis"],
      }),
      buildComponent("Table", [], {
        category: ["data-display-and-analysis"],
      }),
      buildComponent("Grid layout", [], {
        category: ["layout-and-shells"],
      }),
      buildComponent("Stack layout", [], {
        category: ["layout-and-shells"],
      }),
    ],
    icons: [],
    country_symbols: [],
    pages: [],
    patterns: [
      buildPattern("Metric", [], {
        category: ["data-display-and-analysis"],
      }),
      buildPattern("Analytical dashboard", [], {
        category: ["data-display-and-analysis", "layout-and-shells"],
      }),
      buildPattern("Header block", [], {
        category: ["layout-and-shells"],
      }),
      buildPattern("App header", [], {
        category: ["layout-and-shells", "navigation-and-wayfinding"],
        related_patterns: ["Navigation", "Vertical navigation"],
      }),
      buildPattern("Breadcrumbs", [], {
        category: ["navigation-and-wayfinding"],
      }),
      buildPattern("List filtering", [], {
        category: ["selection-and-filtering"],
      }),
      buildPattern("Keyboard shortcuts", ["Hotkeys"], {
        category: ["actions-and-commands"],
      }),
    ],
    guides: [],
    tokens: [],
    deprecations: [],
    examples: [],
    changes: [],
    search_index: [],
  };
}

function buildCreateWorkflowContract(
  overrides: Partial<CreateSaltUiWorkflowContract> = {},
): CreateSaltUiWorkflowContract {
  return {
    readiness: {
      status: "starter_validated",
      implementation_ready: true,
      reason: "Starter code validated.",
    },
    implementation_gate: {
      status: "clear",
      reason: "No follow-through remains.",
      required_follow_through: [],
      blocking_questions: [],
      next_step: null,
    },
    context_requirement: {
      status: "context_checked",
      repo_specific_edits_ready: true,
      reason: "Context is ready.",
      satisfied_by: "salt-ds info",
    },
    starter_validation: {
      status: "clean",
      snippets_checked: 1,
      errors: 0,
      warnings: 0,
      infos: 0,
      fix_count: 0,
      migration_count: 0,
      top_issue: null,
      next_step: null,
      source_urls: [],
    },
    ide_summary: {
      recommended_direction: null,
      bounded_scope: [],
      open_question: null,
      starter_plan: [],
      verify: [],
    },
    ...overrides,
  } as CreateSaltUiWorkflowContract;
}

describe("publicContractV2", () => {
  it("builds a success contract for an exact safe request", () => {
    const contract = buildPublicContractV2(buildInput());

    expect(contract).toEqual(
      expect.objectContaining({
        workflow: "create",
        transport_used: "mcp",
        workflow_status: "success",
        canonical_complete: true,
        safe_to_implement_exact_request: true,
        requested_entity: "Metric",
        resolved_entity: "Metric",
        match_status: "exact",
        blocking_reasons: [],
        next_step: {
          kind: "implement",
          scope: "exact_request",
        },
      }),
    );
  });

  it("builds a partial contract when follow-through still remains", () => {
    const contract = buildPublicContractV2(
      buildInput({
        exact_request: {
          requested_entity: "dashboard summary area",
          resolved_entity: "Analytical dashboard",
          match_status: "broadened",
          exact_match_required: false,
        },
        state: {
          implementation_ready: false,
          required_follow_through: ["App header", "Metric"],
          blocking_questions: [],
          starter_blockers: [],
          project_policy_blockers: [],
          context_ready: true,
          usable_guidance_present: true,
          transport_failed: false,
        },
        summary:
          "Salt grounded the page-level direction but more follow-through is required.",
        next_step: exactNameStep,
      }),
    );

    expect(contract).toEqual(
      expect.objectContaining({
        workflow_status: "partial",
        canonical_complete: false,
        safe_to_implement_exact_request: false,
        match_status: "broadened",
        blocking_reasons: expect.arrayContaining([
          "required follow-through remains: App header, Metric",
        ]),
      }),
    );
  });

  it("blocks an exact request when the resolver is misrouted", () => {
    const contract = buildPublicContractV2(
      buildInput({
        exact_request: {
          requested_entity: "Header block",
          resolved_entity: "List filtering",
          match_status: "misrouted",
          exact_match_required: true,
        },
        state: {
          implementation_ready: false,
          required_follow_through: [],
          blocking_questions: [],
          starter_blockers: [],
          project_policy_blockers: [],
          context_ready: true,
          usable_guidance_present: true,
          transport_failed: false,
        },
        summary:
          "Salt returned a semantically different result, so exact implementation is blocked.",
        next_step: {
          kind: "tool_call",
          tool: "create_salt_ui",
          mode: "exact_name",
          args: {
            query: "Header block",
          },
        },
      }),
    );

    expect(contract).toEqual(
      expect.objectContaining({
        workflow_status: "blocked",
        canonical_complete: false,
        safe_to_implement_exact_request: false,
        match_status: "misrouted",
        blocking_reasons: expect.arrayContaining([
          "requested entity resolved to a different Salt entity",
        ]),
      }),
    );
  });

  it("blocks an exact request when no match is found", () => {
    const contract = buildPublicContractV2(
      buildInput({
        exact_request: {
          requested_entity: "Unknown Thing",
          resolved_entity: null,
          match_status: "no_match",
          exact_match_required: true,
        },
        state: {
          implementation_ready: false,
          required_follow_through: [],
          blocking_questions: [],
          starter_blockers: [],
          project_policy_blockers: [],
          context_ready: true,
          usable_guidance_present: true,
          transport_failed: false,
        },
        summary: "Salt could not resolve the requested entity.",
        next_step: {
          kind: "ask_user",
          question: "Should the query be broadened or clarified?",
        },
      }),
    );

    expect(contract).toEqual(
      expect.objectContaining({
        workflow_status: "blocked",
        canonical_complete: false,
        safe_to_implement_exact_request: false,
        resolved_entity: null,
        match_status: "no_match",
        blocking_reasons: expect.arrayContaining([
          "Salt could not resolve the requested entity",
        ]),
      }),
    );
  });

  it("blocks when repo-specific context is still missing", () => {
    const contract = buildPublicContractV2(
      buildInput({
        state: {
          implementation_ready: false,
          required_follow_through: [],
          blocking_questions: [],
          starter_blockers: [],
          project_policy_blockers: [],
          context_ready: false,
          usable_guidance_present: true,
          transport_failed: false,
        },
        summary:
          "Canonical guidance exists, but repo context is still missing.",
        next_step: {
          kind: "fix_context",
          tool: "get_salt_project_context",
          mode: "stop_and_fix_context",
          args: {
            root_dir: ".",
          },
        },
      }),
    );

    expect(contract).toEqual(
      expect.objectContaining({
        workflow_status: "blocked",
        canonical_complete: false,
        safe_to_implement_exact_request: false,
        blocking_reasons: expect.arrayContaining([
          "required project context is missing",
        ]),
      }),
    );
  });

  it("treats strict broadened exact-follow-through as blocked", () => {
    const contract = buildPublicContractV2(
      buildInput({
        exact_request: {
          requested_entity: "Header block",
          resolved_entity: "App header",
          match_status: "broadened",
          exact_match_required: true,
        },
        state: {
          implementation_ready: false,
          required_follow_through: [],
          blocking_questions: [],
          starter_blockers: [],
          project_policy_blockers: [],
          context_ready: true,
          usable_guidance_present: true,
          transport_failed: false,
        },
        summary:
          "Salt stayed nearby but broadened beyond the exact requested entity.",
        next_step: {
          kind: "tool_call",
          tool: "create_salt_ui",
          mode: "exact_name",
          args: {
            query: "Header block",
          },
        },
      }),
    );

    expect(contract).toEqual(
      expect.objectContaining({
        workflow_status: "blocked",
        match_status: "broadened",
        blocking_reasons: expect.arrayContaining([
          "requested entity broadened beyond the exact requested scope",
        ]),
      }),
    );
  });

  it("flags contradiction states through validation helpers", () => {
    const errors = getPublicContractV2ValidationErrors({
      workflow: "create",
      transport_used: "mcp",
      workflow_status: "success",
      canonical_complete: true,
      safe_to_implement_exact_request: false,
      requested_entity: "Header block",
      resolved_entity: "List filtering",
      match_status: "misrouted",
      blocking_reasons: [],
      next_step: exactNameStep,
      summary: "This contract is intentionally contradictory.",
    });

    expect(errors).toEqual(
      expect.arrayContaining([
        "workflow_status=success requires safe_to_implement_exact_request=true",
      ]),
    );
  });

  it("throws when a contract violates core contradiction rules", () => {
    expect(() =>
      assertValidPublicContractV2({
        workflow: "create",
        transport_used: "mcp",
        workflow_status: "blocked",
        canonical_complete: true,
        safe_to_implement_exact_request: true,
        requested_entity: "Unknown Thing",
        resolved_entity: null,
        match_status: "no_match",
        blocking_reasons: [],
        next_step: {
          kind: "implement",
          scope: "exact_request",
        },
        summary: "This contract is invalid.",
      }),
    ).toThrow(/Invalid PublicContractV2/);
  });
});

describe("publicContractV2 workflow adapters", () => {
  it("derives exact semantic-match metadata for an exact named create query", () => {
    const registry = buildRegistryFixture();
    const result = {
      mode: "recommend",
      solution_type: "pattern",
      decision: {
        name: "Metric",
        why: "Metric is the canonical match.",
      },
      next_step: "Implement Metric.",
    } as unknown as CreateSaltUiResult;
    const contract = {
      readiness: {
        status: "starter_validated",
        implementation_ready: true,
        reason: "Starter code validated.",
      },
      implementation_gate: {
        status: "clear",
        reason: "No follow-through remains.",
        required_follow_through: [],
        blocking_questions: [],
        next_step: null,
      },
      context_requirement: {
        status: "context_checked",
        repo_specific_edits_ready: true,
        reason: "Context is ready.",
        satisfied_by: "salt-ds info",
      },
      starter_validation: {
        status: "clean",
        snippets_checked: 1,
        errors: 0,
        warnings: 0,
        infos: 0,
        fix_count: 0,
        migration_count: 0,
        top_issue: null,
        next_step: null,
        source_urls: [],
      },
      ide_summary: {
        recommended_direction: "Use Metric.",
        bounded_scope: [],
        open_question: null,
        starter_plan: [],
        verify: [],
      },
    } as CreateSaltUiWorkflowContract;

    const compact = buildCreatePublicContractV2(result, contract, {
      transport_used: "mcp",
      registry,
      query: "Metric",
    });

    expect(compact).toEqual(
      expect.objectContaining({
        workflow: "create",
        workflow_status: "success",
        safe_to_implement_exact_request: true,
        requested_entity: "Metric",
        resolved_entity: "Metric",
        match_status: "exact",
        summary: "Salt grounded the exact requested entity Metric.",
      }),
    );
  });

  it("derives a broadened semantic match for a descriptive create query", () => {
    const registry = buildRegistryFixture();
    const result = {
      mode: "recommend",
      solution_type: "pattern",
      decision: {
        name: "Analytical dashboard",
        why: "Analytical dashboard is the nearest Salt direction.",
      },
    } as unknown as CreateSaltUiResult;
    const contract = buildCreateWorkflowContract({
      ide_summary: {
        recommended_direction: "Use Analytical dashboard.",
        bounded_scope: [],
        open_question: null,
        starter_plan: [],
        verify: [],
      },
    });

    const compact = buildCreatePublicContractV2(result, contract, {
      transport_used: "mcp",
      registry,
      query: "dashboard summary area",
    });

    expect(compact).toEqual(
      expect.objectContaining({
        workflow: "create",
        workflow_status: "partial",
        canonical_complete: false,
        safe_to_implement_exact_request: false,
        requested_entity: "dashboard summary area",
        resolved_entity: "Analytical dashboard",
        match_status: "broadened",
        summary:
          "Salt interpreted dashboard summary area as the broader Salt entity Analytical dashboard.",
        next_step: {
          kind: "tool_call",
          tool: "create_salt_ui",
          mode: "exact_name",
          args: {
            query: "Analytical dashboard",
          },
        },
      }),
    );
  });

  it("derives a broadened semantic match for a nearby exact named create query", () => {
    const registry = buildRegistryFixture();
    const result = {
      mode: "recommend",
      solution_type: "pattern",
      decision: {
        name: "App header",
        why: "App header is the broader shell pattern.",
      },
    } as unknown as CreateSaltUiResult;
    const contract = buildCreateWorkflowContract({
      ide_summary: {
        recommended_direction: "Use App header.",
        bounded_scope: [],
        open_question: null,
        starter_plan: [],
        verify: [],
      },
    });

    const compact = buildCreatePublicContractV2(result, contract, {
      transport_used: "mcp",
      registry,
      query: "Header block",
    });

    expect(compact).toEqual(
      expect.objectContaining({
        workflow: "create",
        workflow_status: "blocked",
        safe_to_implement_exact_request: false,
        requested_entity: "Header block",
        resolved_entity: "App header",
        match_status: "broadened",
        summary:
          "Salt broadened Header block to the nearby Salt entity App header.",
        blocking_reasons: expect.arrayContaining([
          "requested entity broadened beyond the exact requested scope",
        ]),
        next_step: {
          kind: "tool_call",
          tool: "create_salt_ui",
          mode: "exact_name",
          args: {
            query: "Header block",
          },
        },
      }),
    );
  });

  it("derives a misrouted semantic match for an exact named create query", () => {
    const registry = buildRegistryFixture();
    const result = {
      mode: "recommend",
      solution_type: "pattern",
      decision: {
        name: "List filtering",
        why: "List filtering scored highest.",
      },
    } as unknown as CreateSaltUiResult;
    const contract = {
      readiness: {
        status: "starter_validated",
        implementation_ready: true,
        reason: "Starter code validated.",
      },
      implementation_gate: {
        status: "clear",
        reason: "No follow-through remains.",
        required_follow_through: [],
        blocking_questions: [],
        next_step: null,
      },
      context_requirement: {
        status: "context_checked",
        repo_specific_edits_ready: true,
        reason: "Context is ready.",
        satisfied_by: "salt-ds info",
      },
      starter_validation: {
        status: "clean",
        snippets_checked: 1,
        errors: 0,
        warnings: 0,
        infos: 0,
        fix_count: 0,
        migration_count: 0,
        top_issue: null,
        next_step: null,
        source_urls: [],
      },
      ide_summary: {
        recommended_direction: "Use List filtering.",
        bounded_scope: [],
        open_question: null,
        starter_plan: [],
        verify: [],
      },
    } as CreateSaltUiWorkflowContract;

    const compact = buildCreatePublicContractV2(result, contract, {
      transport_used: "mcp",
      registry,
      query: "Header block",
    });

    expect(compact).toEqual(
      expect.objectContaining({
        workflow: "create",
        workflow_status: "blocked",
        safe_to_implement_exact_request: false,
        requested_entity: "Header block",
        resolved_entity: "List filtering",
        match_status: "misrouted",
        summary:
          "Salt resolved List filtering instead of the exact requested Header block.",
        blocking_reasons: expect.arrayContaining([
          "requested entity resolved to a different Salt entity",
        ]),
        next_step: {
          kind: "tool_call",
          tool: "create_salt_ui",
          mode: "exact_name",
          args: {
            query: "Header block",
          },
        },
      }),
    );
  });

  it("derives a cross-family misroute for a descriptive create query", () => {
    const registry = buildRegistryFixture();
    const result = {
      mode: "recommend",
      solution_type: "component",
      decision: {
        name: "Stack layout",
        why: "Stack layout scored highest for the broad layout read.",
      },
    } as unknown as CreateSaltUiResult;
    const contract = buildCreateWorkflowContract({
      ide_summary: {
        recommended_direction: "Use Stack layout.",
        bounded_scope: [],
        open_question: null,
        starter_plan: [],
        verify: [],
      },
    });

    const compact = buildCreatePublicContractV2(result, contract, {
      transport_used: "mcp",
      registry,
      query:
        "chart of data visualization component for dashboard analytical body",
    });

    expect(compact).toEqual(
      expect.objectContaining({
        workflow: "create",
        workflow_status: "blocked",
        safe_to_implement_exact_request: false,
        requested_entity:
          "chart of data visualization component for dashboard analytical body",
        resolved_entity: "Stack layout",
        match_status: "misrouted",
        summary:
          "Salt resolved Stack layout instead of the requested chart of data visualization component for dashboard analytical body.",
        blocking_reasons: expect.arrayContaining([
          "requested entity resolved to a different Salt entity",
        ]),
        next_step: {
          kind: "tool_call",
          tool: "create_salt_ui",
          mode: "exact_name",
          args: {
            query: "Chart",
          },
        },
      }),
    );
  });

  it("derives alias semantic-match metadata for an exact named create query", () => {
    const registry = buildRegistryFixture();
    const result = {
      mode: "recommend",
      solution_type: "pattern",
      decision: {
        name: "Keyboard shortcuts",
        why: "Keyboard shortcuts is the canonical pattern.",
      },
    } as unknown as CreateSaltUiResult;
    const contract = {
      readiness: {
        status: "starter_validated",
        implementation_ready: true,
        reason: "Starter code validated.",
      },
      implementation_gate: {
        status: "clear",
        reason: "No follow-through remains.",
        required_follow_through: [],
        blocking_questions: [],
        next_step: null,
      },
      context_requirement: {
        status: "context_checked",
        repo_specific_edits_ready: true,
        reason: "Context is ready.",
        satisfied_by: "salt-ds info",
      },
      starter_validation: {
        status: "clean",
        snippets_checked: 1,
        errors: 0,
        warnings: 0,
        infos: 0,
        fix_count: 0,
        migration_count: 0,
        top_issue: null,
        next_step: null,
        source_urls: [],
      },
      ide_summary: {
        recommended_direction: "Use Keyboard shortcuts.",
        bounded_scope: [],
        open_question: null,
        starter_plan: [],
        verify: [],
      },
    } as CreateSaltUiWorkflowContract;

    const compact = buildCreatePublicContractV2(result, contract, {
      transport_used: "mcp",
      registry,
      query: "Hotkeys",
    });

    expect(compact).toEqual(
      expect.objectContaining({
        workflow: "create",
        workflow_status: "success",
        safe_to_implement_exact_request: true,
        requested_entity: "Hotkeys",
        resolved_entity: "Keyboard shortcuts",
        match_status: "alias",
        summary:
          "Salt grounded Hotkeys to the canonical entity Keyboard shortcuts.",
      }),
    );
  });

  it("derives no_match for an exact named create query when no canonical decision is returned", () => {
    const registry = buildRegistryFixture();
    const result = {
      mode: "recommend",
      solution_type: "pattern",
      decision: {
        name: null,
        why: "No close pattern match was found.",
      },
    } as unknown as CreateSaltUiResult;
    const contract = {
      readiness: {
        status: "starter_validated",
        implementation_ready: true,
        reason: "Starter code validated.",
      },
      implementation_gate: {
        status: "clear",
        reason: "No follow-through remains.",
        required_follow_through: [],
        blocking_questions: [],
        next_step: null,
      },
      context_requirement: {
        status: "context_checked",
        repo_specific_edits_ready: true,
        reason: "Context is ready.",
        satisfied_by: "salt-ds info",
      },
      starter_validation: {
        status: "clean",
        snippets_checked: 1,
        errors: 0,
        warnings: 0,
        infos: 0,
        fix_count: 0,
        migration_count: 0,
        top_issue: null,
        next_step: null,
        source_urls: [],
      },
      ide_summary: {
        recommended_direction: null,
        bounded_scope: [],
        open_question: null,
        starter_plan: [],
        verify: [],
      },
    } as CreateSaltUiWorkflowContract;

    const compact = buildCreatePublicContractV2(result, contract, {
      transport_used: "mcp",
      registry,
      query: "Metric",
    });

    expect(compact).toEqual(
      expect.objectContaining({
        workflow: "create",
        workflow_status: "blocked",
        safe_to_implement_exact_request: false,
        requested_entity: "Metric",
        resolved_entity: null,
        match_status: "no_match",
        summary: "Salt could not resolve the exact requested entity Metric.",
        blocking_reasons: expect.arrayContaining([
          "Salt could not resolve the requested entity",
        ]),
        next_step: {
          kind: "tool_call",
          tool: "create_salt_ui",
          mode: "exact_name",
          args: {
            query: "Metric",
          },
        },
      }),
    );
  });

  it("derives create v2 output from the shared create workflow contract", () => {
    const result = {
      decision: {
        name: "Analytical dashboard",
        why: "The request describes a dashboard workflow with summary metrics.",
      },
      next_step: "Follow up on App header.",
    } as const;
    const contract = {
      readiness: {
        status: "starter_needs_attention",
        implementation_ready: false,
        reason: "Starter code still needs attention.",
      },
      implementation_gate: {
        status: "follow_through_required",
        reason: "More grounding is required.",
        required_follow_through: ["App header", "Metric"],
        blocking_questions: [],
        next_step: "Run targeted Salt create follow-up.",
      },
      context_requirement: {
        status: "context_checked",
        repo_specific_edits_ready: true,
        reason: "Context is ready.",
        satisfied_by: "salt-ds info",
      },
      starter_validation: {
        status: "needs_attention",
        snippets_checked: 1,
        errors: 1,
        warnings: 0,
        infos: 0,
        fix_count: 0,
        migration_count: 0,
        top_issue: "Missing import.",
        next_step: "Fix the starter import.",
        source_urls: [],
      },
      ide_summary: {
        recommended_direction: "Use Analytical dashboard.",
        bounded_scope: [],
        open_question: null,
        starter_plan: [],
        verify: [],
      },
    } as CreateSaltUiWorkflowContract;

    const compact = buildCreatePublicContractV2(result, contract, {
      transport_used: "mcp",
    });

    expect(compact).toEqual(
      expect.objectContaining({
        workflow: "create",
        workflow_status: "blocked",
        safe_to_implement_exact_request: false,
        blocking_reasons: expect.arrayContaining([
          "required follow-through remains: App header, Metric",
          "Missing import.",
        ]),
        next_step: {
          kind: "tool_call",
          tool: "create_salt_ui",
          mode: "exact_name",
          args: {
            query: "App header",
          },
        },
      }),
    );
  });

  it("derives review v2 output from the shared review workflow contract", () => {
    const result = {
      decision: {
        status: "needs_attention",
        why: "Canonical Salt validation found issues.",
      },
      next_step: "Fix the remaining review issues and rerun review.",
      missing_data: [],
    } as const;
    const contract = {
      decision: result.decision,
      ide_summary: {
        verdict: {
          level: "medium_risk",
          summary: "Issues remain.",
        },
        top_findings: [],
        safest_next_fix: "Replace the incorrect component usage.",
        verify: [],
      },
      fix_candidates: {
        total_count: 1,
        deterministic_count: 0,
        manual_review_count: 1,
        candidates: [
          {
            candidate_type: "guided_fix",
            safety: "manual_review",
            kind: null,
            title: "Replace incorrect component usage.",
            recommendation:
              "Replace the current element with the canonical Salt primitive.",
            from: null,
            to: null,
            reason: "Canonical Salt validation found issues.",
            category: "canonical",
            rule: "canonical",
            rule_id: "review-canonical-mismatch",
            source_urls: [],
          },
        ],
        notes: [],
      },
    } as ReviewSaltUiWorkflowContract;

    const compact = buildReviewPublicContractV2(result, contract, {
      transport_used: "mcp",
    });

    expect(compact).toEqual(
      expect.objectContaining({
        workflow: "review",
        workflow_status: "blocked",
        safe_to_implement_exact_request: false,
        blocking_reasons: expect.arrayContaining([
          "Canonical Salt validation found issues.",
        ]),
      }),
    );
  });

  it("derives migrate v2 output from the shared migrate workflow contract", () => {
    const result = {
      translations: [{}],
      migration_plan: ["Start with the main shell."],
      clarifying_questions: ["Should the table use Data grid or Table?"],
    } as unknown as {
      translations: unknown[];
      migration_plan: string[];
      clarifying_questions: string[];
    };
    const contract = {
      readiness: {
        status: "starter_validated",
        implementation_ready: true,
        reason: "Starter code validated.",
      },
      context_requirement: {
        status: "context_required",
        repo_specific_edits_ready: false,
        reason: "Repo context still needs to be loaded.",
        suggested_follow_up_tool: "get_salt_project_context",
        suggested_follow_up_cli: "salt-ds info --json",
      },
      starter_validation: {
        status: "clean",
        snippets_checked: 1,
        errors: 0,
        warnings: 0,
        infos: 0,
        fix_count: 0,
        migration_count: 0,
        top_issue: null,
        next_step: null,
        source_urls: [],
      },
      post_migration_verification: {
        source_checks: [],
        runtime_checks: [],
        preserve_checks: [],
        confirmation_checks: [],
        suggested_workflow: "review_salt_ui",
        suggested_command: "salt-ds review <changed-path>",
      },
    } as MigrateToSaltWorkflowContract;

    const compact = buildMigratePublicContractV2(
      result as unknown as never,
      contract,
      {
        transport_used: "mcp",
      },
    );

    expect(compact).toEqual(
      expect.objectContaining({
        workflow: "migrate",
        workflow_status: "blocked",
        safe_to_implement_exact_request: false,
        blocking_reasons: expect.arrayContaining([
          "Should the table use Data grid or Table?",
          "Repo context still needs to be loaded.",
        ]),
        next_step: {
          kind: "fix_context",
          tool: "get_salt_project_context",
          mode: "stop_and_fix_context",
          args: {
            root_dir: ".",
          },
        },
      }),
    );
  });

  it("derives upgrade v2 output from the shared upgrade workflow contract", () => {
    const result = {
      decision: {
        target: "@salt-ds/core",
        from_version: "1.0.0",
        to_version: "2.0.0",
        why: "The upgrade target is still ambiguous.",
      },
      ambiguity: {
        target: "core",
      },
      did_you_mean: ["@salt-ds/core", "@salt-ds/lab"],
      breaking: ["Replace deprecated API usage."],
    } as unknown as {
      decision: {
        target: string;
        from_version: string;
        to_version: string;
        why: string;
      };
      ambiguity: Record<string, unknown>;
      did_you_mean: string[];
      breaking: string[];
    };
    const contract = {
      ide_summary: {
        target: "@salt-ds/core",
        from_version: "1.0.0",
        to_version: "2.0.0",
        required_changes: [],
        optional_cleanup: [],
        suggested_order: [],
        verify: [],
      },
    } as UpgradeSaltUiWorkflowContract;

    const compact = buildUpgradePublicContractV2(
      result as unknown as never,
      contract,
      {
        transport_used: "mcp",
      },
    );

    expect(compact).toEqual(
      expect.objectContaining({
        workflow: "upgrade",
        workflow_status: "blocked",
        safe_to_implement_exact_request: false,
        blocking_reasons: expect.arrayContaining([
          "The upgrade target is still ambiguous.",
        ]),
      }),
    );
  });
});
