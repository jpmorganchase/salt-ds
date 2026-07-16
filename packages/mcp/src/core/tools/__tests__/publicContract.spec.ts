import { describe, expect, it } from "vitest";
import {
  SALT_EVIDENCE_REF_CONTRACT,
  type SaltEvidenceRef,
} from "../../evidence.js";
import type { SaltRegistry } from "../../types.js";
import type { CreateSaltUiResult } from "../createSaltUi.js";
import {
  assertValidPublicContract,
  buildCreatePublicContract,
  buildMigratePublicContract,
  buildPublicContract,
  buildReviewPublicContract,
  getPublicContractValidationErrors,
  PUBLIC_WORKFLOW_CONTRACT_VERSION,
  type PublicContract,
  type PublicContractInput,
  type PublicNextStep,
} from "../publicContract.js";
import type { ReviewSaltUiResult } from "../reviewSaltUi.js";
import type { MigrateToSaltResult } from "../translation/sourceUiTypes.js";
import type {
  CreateSaltUiWorkflowContract,
  MigrateToSaltWorkflowContract,
  ReviewSaltUiWorkflowContract,
  WorkflowCreateIdeSummary,
  WorkflowCreateImplementationGate,
  WorkflowMigrateIdeSummary,
  WorkflowFixCandidate,
  WorkflowReviewIdeSummary,
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
  overrides: Partial<PublicContractInput> = {},
): PublicContractInput {
  return {
    workflow: "create",
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
    guidance: {
      kind: "create",
      decision: {
        name: "Metric",
        why: "Use the canonical Salt Metric.",
        solution_type: "component",
      },
      starter_guidance: {
        plan: ["Implement Metric from the grounded Salt guidance."],
        snippets: [],
      },
      review_targets: {
        components: ["Metric"],
        patterns: [],
        composition_contract: null,
        source: "create_report",
      },
    },
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

function buildFixtureStructuralRoleToken(): SaltRegistry["tokens"][number] {
  // Fixture-only token record for evidence-gate contract tests.
  return {
    name: "--fixture-review-token",
    category: "fixture",
    type: "color",
    value: "#000000",
    semantic_intent: "Fixture token for review public-contract tests.",
    themes: [],
    densities: [],
    applies_to: [],
    guidance: [],
    aliases: [],
    policy: {
      usage_tier: "foundation",
      direct_component_use: "conditional",
      preferred_for: [],
      avoid_for: [],
      notes: [],
      docs: ["/fixture/docs/token-policy"],
      structural_roles: ["fixture-review-role"],
      pairing: null,
    },
    deprecated: false,
    last_verified_at: "2026-04-10T00:00:00Z",
  };
}

function buildCreateImplementationGate(
  overrides: Partial<WorkflowCreateImplementationGate> = {},
): WorkflowCreateImplementationGate {
  return {
    required_follow_through: [],
    blocking_questions: [],
    rule_ids: [],
    ...overrides,
  };
}

function buildCreateIdeSummary(
  overrides: Partial<WorkflowCreateIdeSummary> = {},
): WorkflowCreateIdeSummary {
  return {
    recommended_direction: "Use the canonical Salt direction.",
    starter_plan: ["Implement the grounded Salt direction."],
    ...overrides,
  };
}

function buildReviewIdeSummary(
  overrides: Partial<WorkflowReviewIdeSummary> = {},
): WorkflowReviewIdeSummary {
  return {
    safest_next_fix: null,
    ...overrides,
  };
}

function buildReviewFixCandidate(
  overrides: Partial<WorkflowFixCandidate> = {},
): WorkflowFixCandidate {
  return {
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
    source_urls: ["/salt/components/button"],
    ...overrides,
  };
}

function buildNeedsAttentionReviewResult(): ReviewSaltUiResult {
  return {
    guidance_boundary: {
      workflow: "review_salt_ui",
    },
    decision: {
      status: "needs_attention",
      why: "Canonical Salt validation found issues.",
    },
    summary: {
      errors: 1,
      warnings: 0,
      infos: 0,
      fix_count: 1,
      migration_count: 0,
    },
    fixes: [],
    issues: [],
    migrations: [],
    next_step: "Fix the remaining review issues and rerun review.",
    missing_data: [],
    source_urls: ["/salt/components/button"],
  } as unknown as ReviewSaltUiResult;
}

function buildMigrateIdeSummary(
  overrides: Partial<WorkflowMigrateIdeSummary> = {},
): WorkflowMigrateIdeSummary {
  return {
    first_scaffold: [],
    ...overrides,
  };
}

function toComparablePublicContract(contract: PublicContract) {
  const nextStep = { ...contract.action } as Record<string, unknown>;
  delete nextStep.rule_ids;
  delete nextStep.post_action;
  delete nextStep.mcp;
  const postAction = contract.action.post_action
    ? {
        kind: contract.action.post_action.kind,
        tool: contract.action.post_action.tool,
        ...(contract.action.post_action.kind === "review"
          ? { required_input: contract.action.post_action.required_input }
          : {}),
      }
    : undefined;

  return {
    contract: contract.contract,
    workflow: contract.workflow,
    workflow_status: contract.status,
    canonical_complete: contract.safety.canonical_complete,
    safe_to_implement_exact_request: contract.safety.exact_request_safe,
    requested_entity:
      typeof contract.request.entity === "string"
        ? contract.request.entity
        : undefined,
    resolved_entity: Object.hasOwn(contract.request, "resolved_entity")
      ? contract.request.resolved_entity
      : undefined,
    match_status:
      typeof contract.request.match_status === "string"
        ? contract.request.match_status
        : undefined,
    blocking_reasons: contract.safety.blocking_reasons,
    next_step: nextStep,
    required_post_step: postAction,
    summary: contract.summary,
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
  };
}

function buildCreateWorkflowContract(
  overrides: Partial<CreateSaltUiWorkflowContract> = {},
): CreateSaltUiWorkflowContract {
  return {
    readiness: {
      implementation_ready: true,
      reason: "Starter code validated.",
    },
    implementation_gate: buildCreateImplementationGate(),
    context_requirement: {
      repo_specific_edits_ready: true,
      reason: "Context is ready.",
      retry_with: {
        root_dir: "/repo",
      },
    },
    starter_validation: {
      status: "clean",
      top_issue: null,
      next_step: null,
      source_urls: [],
    },
    ide_summary: buildCreateIdeSummary(),
    intent: {
      user_task: "Create the requested Salt UI.",
      canonical_choice: "Metric",
    },
    repo_refinement: null,
    project_conventions_check: {
      supported: true,
      contract: "project_conventions_v1",
      check_recommended: false,
      topics: [],
      reason: "Project conventions are not required for this fixture.",
      canonical_only: true,
      declared_policy_status: "none-declared",
      policy_paths: [".salt/team.json", ".salt/stack.json"],
      suggested_follow_up_tool: "get_salt_project_context",
      next_step: "Continue with canonical Salt guidance.",
    },
    provenance: {
      canonical_source_urls: ["/salt/guides/migration"],
      related_guide_urls: [],
      starter_source_urls: [],
      source_urls: ["/salt/guides/migration"],
    },
    ...overrides,
  };
}

function buildReviewWorkflowContract(
  overrides: Partial<ReviewSaltUiWorkflowContract> = {},
): ReviewSaltUiWorkflowContract {
  return {
    ide_summary: buildReviewIdeSummary(),
    decision: {
      status: "clean",
      why: "No blocking review issues remain.",
    },
    fix_candidates: {
      candidates: [],
    },
    project_conventions_check: {
      supported: true,
      contract: "project_conventions_v1",
      check_recommended: false,
      topics: [],
      reason: "Project conventions are not required for this fixture.",
      canonical_only: true,
      declared_policy_status: "none-declared",
      policy_paths: [".salt/team.json", ".salt/stack.json"],
      suggested_follow_up_tool: "get_salt_project_context",
      next_step: "Continue with canonical Salt guidance.",
    },
    rule_ids: [],
    provenance: {
      canonical_source_urls: [],
      related_guide_urls: [],
      starter_source_urls: [],
      source_urls: [],
    },
    ...overrides,
  };
}

function buildMigrateWorkflowContract(
  overrides: Partial<MigrateToSaltWorkflowContract> = {},
): MigrateToSaltWorkflowContract {
  return {
    ide_summary: buildMigrateIdeSummary(),
    readiness: {
      implementation_ready: true,
      reason: "Starter code validated.",
    },
    context_requirement: {
      repo_specific_edits_ready: true,
      reason: "Context is ready.",
      retry_with: {
        root_dir: "/repo",
      },
    },
    starter_validation: {
      status: "clean",
      top_issue: null,
      next_step: null,
      source_urls: [],
    },
    project_conventions_check: {
      supported: true,
      contract: "project_conventions_v1",
      check_recommended: false,
      topics: [],
      reason: "Project conventions are not required for this fixture.",
      canonical_only: true,
      declared_policy_status: "none-declared",
      policy_paths: [".salt/team.json", ".salt/stack.json"],
      suggested_follow_up_tool: "get_salt_project_context",
      next_step: "Continue with canonical Salt guidance.",
    },
    rule_ids: [],
    post_migration_verification: {
      source_checks: [],
      runtime_checks: [],
      preserve_checks: [],
      confirmation_checks: [],
      suggested_workflow: "review_salt_ui",
      suggested_command:
        'review_salt_ui via the @salt-ds/mcp server (args: { code: "<file contents>" })',
    },
    visual_evidence_contract: {
      source_outline_provided: false,
      source_outline_signal_counts: {
        regions: 0,
        actions: 0,
        states: 0,
        notes: 0,
      },
      derived_outline_available: false,
      derived_outline_signal_counts: {
        regions: 0,
        actions: 0,
        states: 0,
        notes: 0,
      },
      visual_input_count: 0,
      visual_input_kinds: [],
    },
    provenance: {
      canonical_source_urls: [],
      related_guide_urls: [],
      starter_source_urls: [],
      source_urls: [],
    },
    ...overrides,
  };
}

describe("publicContract", () => {
  it("builds a success contract for an exact safe request", () => {
    const contract = buildPublicContract(buildInput());

    expect(toComparablePublicContract(contract)).toEqual(
      expect.objectContaining({
        contract: PUBLIC_WORKFLOW_CONTRACT_VERSION,
        workflow: "create",
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
        required_post_step: {
          kind: "review",
          tool: "review_salt_ui",
          required_input: ["complete_updated_file"],
        },
      }),
    );
  });

  it("builds a partial contract when follow-through still remains", () => {
    const contract = buildPublicContract(
      buildInput({
        exact_request: {
          requested_entity: "dashboard summary area",
          resolved_entity: "Analytical dashboard",
          match_status: "broadened",
          exact_match_required: false,
        },
        state: {
          implementation_ready: false,
          required_follow_through: [
            { region: "header", entity: "App header" },
            { region: "key-metrics", entity: "Metric" },
          ],
          blocking_questions: [],
          starter_blockers: [],
          project_policy_blockers: [],
          hard_blocked: false,
          context_ready: true,
          usable_guidance_present: true,
          transport_failed: false,
        },
        summary:
          "Salt grounded the page-level direction but more follow-through is required.",
        next_step: exactNameStep,
      }),
    );

    expect(toComparablePublicContract(contract)).toEqual(
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
    expect(contract.action).toEqual(
      expect.objectContaining({
        tool: "create_salt_ui",
        args: {
          query: "Metric",
        },
      }),
    );
    expect(contract.guidance).toEqual(
      expect.objectContaining({
        kind: "create",
        decision: expect.objectContaining({ name: "Metric" }),
        starter_guidance: expect.objectContaining({
          plan: expect.arrayContaining([expect.any(String)]),
        }),
        review_targets: {
          components: ["Metric"],
          patterns: [],
          composition_contract: null,
          source: "create_report",
        },
      }),
    );
    expect(contract).not.toHaveProperty("next_required_action");
    expect(contract).not.toHaveProperty("allowed_next_actions");
    expect(contract).not.toHaveProperty("recipe");
  });

  it("blocks an exact request when the resolver is misrouted", () => {
    const contract = buildPublicContract(
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
          hard_blocked: false,
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

    expect(toComparablePublicContract(contract)).toEqual(
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
    const contract = buildPublicContract(
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
          hard_blocked: false,
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

    expect(toComparablePublicContract(contract)).toEqual(
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
    const contract = buildPublicContract(
      buildInput({
        state: {
          implementation_ready: false,
          required_follow_through: [],
          blocking_questions: [],
          starter_blockers: [],
          project_policy_blockers: [],
          hard_blocked: false,
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
            root_dir: "/repo",
          },
        },
      }),
    );

    expect(toComparablePublicContract(contract)).toEqual(
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
    const contract = buildPublicContract(
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
          hard_blocked: false,
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

    expect(toComparablePublicContract(contract)).toEqual(
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
    const validContract = buildPublicContract(buildInput());
    const errors = getPublicContractValidationErrors({
      ...validContract,
      request: {
        entity: "Header block",
        resolved_entity: "List filtering",
        match_status: "misrouted",
      },
      safety: {
        ...validContract.safety,
        exact_request_safe: false,
      },
      action: {
        ...exactNameStep,
        rule_ids: [],
        post_action: null,
      },
      summary: "This contract is intentionally contradictory.",
    });

    expect(errors).toEqual(
      expect.arrayContaining([
        "status=success requires safety.exact_request_safe=true",
      ]),
    );
  });

  it("rejects impossible or state-free immediate tool actions", () => {
    const validContract = buildPublicContract(buildInput());
    const invalidToolCallErrors = getPublicContractValidationErrors({
      ...validContract,
      action: {
        kind: "tool_call",
        tool: "review_salt_ui",
        mode: "broad_query",
        args: {},
        rule_ids: [],
        post_action: null,
      },
    } as unknown as PublicContract);
    expect(invalidToolCallErrors).toEqual(
      expect.arrayContaining([
        "action.kind=tool_call only supports create_salt_ui exact-name retries",
        "action.kind=tool_call requires args.query",
      ]),
    );
  });

  it("rejects non-public retrieve-reference entity families", () => {
    const validContract = buildPublicContract(buildInput());
    const errors = getPublicContractValidationErrors({
      ...validContract,
      action: {
        kind: "retrieve_reference",
        tool: "get_salt_reference",
        args: {
          names: ["Split button"],
          entity_type: "auto",
        },
        rule_ids: [],
        post_action: null,
      },
    } as unknown as PublicContract);

    expect(errors).toContain(
      "action.kind=retrieve_reference requires a public args.entity_type",
    );
  });

  it("rejects success without source-backed evidence", () => {
    const validContract = buildPublicContract(buildInput());
    const errors = getPublicContractValidationErrors({
      ...validContract,
      evidence: {
        status: "complete",
        items: [
          {
            kind: "registry",
            source: "canonical_salt",
            source_urls: [],
            summary: "Unsourced registry fallback.",
          },
        ],
        source_urls: [],
        missing: [],
        heuristic_fallback: false,
      },
    });

    expect(errors).toEqual(
      expect.arrayContaining([
        "status=success requires source-backed evidence",
        "safety.exact_request_safe=true requires source-backed evidence",
      ]),
    );
  });

  it("throws when a contract violates core contradiction rules", () => {
    const validContract = buildPublicContract(buildInput());

    expect(() =>
      assertValidPublicContract({
        ...validContract,
        status: "blocked",
        request: {
          entity: "Unknown Thing",
          resolved_entity: null,
          match_status: "no_match",
        },
        safety: {
          ...validContract.safety,
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
            required_input: ["complete_updated_file"],
          },
        },
        summary: "This contract is invalid.",
      }),
    ).toThrow(/Invalid PublicContract/);
  });

  it("sets required_post_step to the shared review workflow", () => {
    const contract = buildPublicContract(buildInput());

    expect(contract.action.post_action).toEqual({
      kind: "review",
      tool: "review_salt_ui",
      required_input: ["complete_updated_file"],
    });
  });

  it("does not set required_post_step when workflow is review", () => {
    const contract = buildPublicContract(
      buildInput({
        workflow: "review",
        next_step: {
          kind: "implement",
          scope: "exact_request",
        },
        guidance: {
          kind: "review",
          findings: [],
          fixes: [],
        },
      }),
    );

    expect(contract.action.post_action).toBeNull();
  });

  it("does not set required_post_step when next_step is not implement", () => {
    const contract = buildPublicContract(
      buildInput({
        state: {
          implementation_ready: false,
          required_follow_through: [{ region: "header", entity: "App header" }],
          blocking_questions: [],
          starter_blockers: [],
          project_policy_blockers: [],
          hard_blocked: false,
          context_ready: true,
          usable_guidance_present: true,
          transport_failed: false,
        },
        next_step: exactNameStep,
      }),
    );

    expect(contract.action.post_action).toBeNull();
  });

  it("flags missing required_post_step when next_step is implement on a non-review workflow", () => {
    const validContract = buildPublicContract(buildInput());
    const errors = getPublicContractValidationErrors({
      ...validContract,
      action: {
        ...validContract.action,
        kind: "implement",
        scope: "exact_request",
        post_action: null,
      },
    });

    expect(errors).toContain(
      "action.kind=implement requires action.post_action.kind=review when workflow is not review",
    );
  });

  it("flags required_post_step present when next_step is not implement", () => {
    const partialContract = buildPublicContract(
      buildInput({
        state: {
          implementation_ready: false,
          required_follow_through: [{ region: "header", entity: "App header" }],
          blocking_questions: [],
          starter_blockers: [],
          project_policy_blockers: [],
          hard_blocked: false,
          context_ready: true,
          usable_guidance_present: true,
          transport_failed: false,
        },
        next_step: exactNameStep,
      }),
    );
    const errors = getPublicContractValidationErrors({
      ...partialContract,
      action: {
        ...partialContract.action,
        post_action: {
          kind: "review",
          tool: "review_salt_ui",
          required_input: ["complete_updated_file"],
        },
      },
    });

    expect(errors).toContain(
      "action.post_action.kind=review must only appear when action.kind=implement or apply_fixes",
    );
  });

  it("rejects post-action kind/tool mismatches", () => {
    const validContract = buildPublicContract(buildInput());
    const errors = getPublicContractValidationErrors({
      ...validContract,
      action: {
        ...validContract.action,
        post_action: {
          kind: "review",
          tool: "create_salt_ui",
          args: { code: "<Button />" },
          required_input: ["complete_updated_file"],
        },
      },
    } as unknown as PublicContract);

    expect(errors).toEqual(
      expect.arrayContaining([
        "action.post_action.kind=review requires tool=review_salt_ui",
      ]),
    );
  });

  it("rejects review post-actions without complete updated source", () => {
    const validContract = buildPublicContract(buildInput());
    const errors = getPublicContractValidationErrors({
      ...validContract,
      action: {
        ...validContract.action,
        post_action: {
          kind: "review",
          tool: "review_salt_ui",
        },
      },
    } as unknown as PublicContract);

    expect(errors).toContain(
      "action.post_action.kind=review requires complete updated file input",
    );
  });

  it("rejects rerun post actions outside deterministic create continuations", () => {
    const validContract = buildPublicContract(buildInput());
    const errors = getPublicContractValidationErrors({
      ...validContract,
      action: {
        kind: "ask_user",
        question: "Which provider should this repo use?",
        rule_ids: [],
        post_action: {
          kind: "rerun_workflow",
          tool: "review_salt_ui",
          args: { query: "Metric" },
        },
      },
    } as unknown as PublicContract);

    expect(errors).toEqual(
      expect.arrayContaining([
        "action.post_action.kind=rerun_workflow requires tool=create_salt_ui",
        "action.post_action.kind=rerun_workflow is only valid for create follow-up actions",
        "action.kind=ask_user requires action.post_action=null",
      ]),
    );
  });

  it("does not let an empty starter snippet authorize create implementation", () => {
    const validContract = buildPublicContract(buildInput());
    const errors = getPublicContractValidationErrors({
      ...validContract,
      guidance: {
        ...validContract.guidance,
        starter_guidance: {
          plan: [],
          snippets: [{}],
        },
      },
    } as unknown as PublicContract);

    expect(errors).toContain(
      "create implement action requires actionable starter guidance",
    );
  });
});

describe("publicContract workflow adapters", () => {
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
    const contract = buildCreateWorkflowContract({
      ide_summary: buildCreateIdeSummary({
        recommended_direction: "Use Metric.",
      }),
    });

    const compact = buildCreatePublicContract(result, contract, {
      registry,
      create_rerun_args: { query: "Metric" },
    });

    expect(toComparablePublicContract(compact)).toEqual(
      expect.objectContaining({
        contract: PUBLIC_WORKFLOW_CONTRACT_VERSION,
        workflow: "create",
        workflow_status: "success",
        safe_to_implement_exact_request: true,
        requested_entity: "Metric",
        resolved_entity: "Metric",
        match_status: "exact",
        summary: "Salt grounded the exact requested entity Metric.",
        required_post_step: {
          kind: "review",
          tool: "review_salt_ui",
          required_input: ["complete_updated_file"],
        },
      }),
    );
    expect(compact.guidance).toEqual(
      expect.objectContaining({
        kind: "create",
        decision: {
          name: "Metric",
          why: "Metric is the canonical match.",
          solution_type: "pattern",
        },
        starter_guidance: expect.objectContaining({
          plan: expect.arrayContaining([expect.any(String)]),
        }),
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
      ide_summary: buildCreateIdeSummary({
        recommended_direction: "Use Analytical dashboard.",
      }),
    });

    const compact = buildCreatePublicContract(result, contract, {
      registry,
      create_rerun_args: { query: "dashboard summary area" },
    });

    expect(toComparablePublicContract(compact)).toEqual(
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
          kind: "retrieve_reference",
          tool: "get_salt_reference",
          args: {
            names: ["Analytical dashboard"],
            entity_type: "pattern",
          },
        },
      }),
    );
  });

  it("preserves a grounded family for a cross-family reference action", () => {
    const result = {
      mode: "recommend",
      solution_type: "pattern",
      decision: {
        name: "Split button",
        why: "Use the canonical Split button pattern.",
      },
    } as unknown as CreateSaltUiResult;
    const contract = buildCreateWorkflowContract({
      readiness: {
        implementation_ready: false,
        reason: "Pattern evidence still needs retrieval.",
      },
      implementation_gate: buildCreateImplementationGate({
        required_follow_through: [
          { region: "split-action", entity: "Split button" },
        ],
      }),
      intent: {
        user_task: "Create a split action control.",
        canonical_choice: "Split button",
      },
    });

    const compact = buildCreatePublicContract(result, contract, {
      create_rerun_args: { query: "Create a split action control." },
    });

    expect(compact.action).toEqual(
      expect.objectContaining({
        kind: "retrieve_reference",
        tool: "get_salt_reference",
        args: {
          names: ["Split button"],
          entity_type: "pattern",
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
      ide_summary: buildCreateIdeSummary({
        recommended_direction: "Use App header.",
      }),
    });

    const compact = buildCreatePublicContract(result, contract, {
      registry,
      create_rerun_args: { query: "Header block" },
    });

    expect(toComparablePublicContract(compact)).toEqual(
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
    const contract = buildCreateWorkflowContract({
      ide_summary: buildCreateIdeSummary({
        recommended_direction: "Use List filtering.",
      }),
    });

    const compact = buildCreatePublicContract(result, contract, {
      registry,
      create_rerun_args: { query: "Header block" },
    });

    expect(toComparablePublicContract(compact)).toEqual(
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

  it("treats a descriptive create query as broadened instead of a hidden exact misroute", () => {
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
      ide_summary: buildCreateIdeSummary({
        recommended_direction: "Use Stack layout.",
      }),
    });

    const compact = buildCreatePublicContract(result, contract, {
      registry,
      create_rerun_args: {
        query:
          "chart of data visualization component for dashboard analytical body",
      },
    });

    expect(toComparablePublicContract(compact)).toEqual(
      expect.objectContaining({
        workflow: "create",
        workflow_status: "partial",
        safe_to_implement_exact_request: false,
        requested_entity:
          "chart of data visualization component for dashboard analytical body",
        resolved_entity: "Stack layout",
        match_status: "broadened",
        summary:
          "Salt interpreted chart of data visualization component for dashboard analytical body as the broader Salt entity Stack layout.",
        blocking_reasons: [],
        next_step: {
          kind: "retrieve_reference",
          tool: "get_salt_reference",
          args: {
            names: ["Chart"],
            entity_type: "component",
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
    const contract = buildCreateWorkflowContract({
      ide_summary: buildCreateIdeSummary({
        recommended_direction: "Use Keyboard shortcuts.",
      }),
    });

    const compact = buildCreatePublicContract(result, contract, {
      registry,
      create_rerun_args: { query: "Hotkeys" },
    });

    expect(toComparablePublicContract(compact)).toEqual(
      expect.objectContaining({
        workflow: "create",
        workflow_status: "success",
        safe_to_implement_exact_request: true,
        requested_entity: "Hotkeys",
        resolved_entity: "Keyboard shortcuts",
        match_status: "alias",
        summary:
          "Salt grounded Hotkeys to the canonical entity Keyboard shortcuts.",
        required_post_step: {
          kind: "review",
          tool: "review_salt_ui",
          required_input: ["complete_updated_file"],
        },
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
    const contract = buildCreateWorkflowContract({
      ide_summary: buildCreateIdeSummary({
        recommended_direction: "Clarify the canonical Salt direction.",
      }),
    });

    const compact = buildCreatePublicContract(result, contract, {
      registry,
      create_rerun_args: { query: "Metric" },
    });

    expect(toComparablePublicContract(compact)).toEqual(
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

  it.each(["misrouted", "no_match", "broadened"] as const)(
    "preserves the full create request for an exact-name %s retry",
    (matchStatus) => {
      const registry = buildRegistryFixture();
      const result = {
        mode: "recommend",
        solution_type: "component",
        decision: {
          name: matchStatus === "no_match" ? null : "Chart",
          why: "The first create pass did not preserve the exact Table request.",
        },
      } as unknown as CreateSaltUiResult;
      const createRerunArgs = {
        query: "  Table  ",
        solution_type: "component" as const,
        package: "@salt-ds/core",
        status: "stable" as const,
        prefer_stable: false,
        a11y_required: false,
        include_starter_code: false,
        resolved_entities: ["Table"],
        root_dir: "/canonical/repo",
      };
      const compact = buildCreatePublicContract(
        result,
        buildCreateWorkflowContract(),
        {
          registry,
          exact_request: {
            requested_entity: "Table",
            resolved_entity: matchStatus === "no_match" ? null : "Chart",
            match_status: matchStatus,
            exact_match_required: true,
          },
          create_rerun_args: createRerunArgs,
        },
      );

      expect(compact.action).toEqual({
        kind: "tool_call",
        tool: "create_salt_ui",
        mode: "exact_name",
        args: {
          ...createRerunArgs,
          query: "Table",
        },
        rule_ids: [],
        post_action: null,
      });
    },
  );

  it.each([
    { field: "package", value: "@salt-ds/lab" },
    { field: "status", value: "beta" },
    { field: "solution_type", value: "pattern" },
  ] as const)(
    "blocks an exact retry that conflicts with the explicit $field filter",
    ({ field, value }) => {
      const registry = buildRegistryFixture();
      const compact = buildCreatePublicContract(
        {
          mode: "recommend",
          solution_type: "component",
          decision: {
            name: "Chart",
            why: "The first pass did not preserve the exact Table request.",
          },
        } as unknown as CreateSaltUiResult,
        buildCreateWorkflowContract(),
        {
          registry,
          exact_request: {
            requested_entity: "Table",
            resolved_entity: "Chart",
            match_status: "misrouted",
            exact_match_required: true,
          },
          create_rerun_args: {
            query: "Table",
            [field]: value,
            root_dir: "/canonical/repo",
          },
        },
      );

      expect(compact.action).toMatchObject({
        kind: "ask_user",
        question: expect.stringContaining(field),
        post_action: null,
      });
      expect(compact.action.kind).not.toBe("tool_call");
    },
  );

  it("blocks an exact pattern retry when a package filter is present", () => {
    const registry = buildRegistryFixture();
    const compact = buildCreatePublicContract(
      {
        mode: "recommend",
        solution_type: "pattern",
        decision: {
          name: null,
          why: "The first pass did not preserve the exact Header block request.",
        },
      } as unknown as CreateSaltUiResult,
      buildCreateWorkflowContract(),
      {
        registry,
        exact_request: {
          requested_entity: "Header block",
          resolved_entity: null,
          match_status: "no_match",
          exact_match_required: true,
        },
        create_rerun_args: {
          query: "Header block",
          solution_type: "pattern",
          package: "@salt-ds/core",
          root_dir: "/canonical/repo",
        },
      },
    );

    expect(compact.action).toMatchObject({
      kind: "ask_user",
      question: expect.stringContaining("package filter"),
      post_action: null,
    });
    expect(compact.action.kind).not.toBe("tool_call");
  });

  it("blocks an exact retry when its alias maps to multiple records", () => {
    const registry = buildRegistryFixture();
    registry.components.find(
      (component) => component.name === "Chart",
    )?.aliases.push("SharedAlias");
    registry.components.find(
      (component) => component.name === "Table",
    )?.aliases.push("SharedAlias");
    const compact = buildCreatePublicContract(
      {
        mode: "recommend",
        solution_type: "component",
        decision: {
          name: null,
          why: "The alias is ambiguous.",
        },
      } as unknown as CreateSaltUiResult,
      buildCreateWorkflowContract(),
      {
        registry,
        exact_request: {
          requested_entity: "SharedAlias",
          resolved_entity: null,
          match_status: "no_match",
          exact_match_required: true,
        },
        create_rerun_args: {
          query: "SharedAlias",
          root_dir: "/canonical/repo",
        },
      },
    );

    expect(compact.action).toMatchObject({
      kind: "ask_user",
      question: expect.stringMatching(/SharedAlias.*ambiguous/i),
      post_action: null,
    });
    expect(compact.action.kind).not.toBe("tool_call");
  });

  it("asks for a canonical example target instead of retrieving targetless examples", () => {
    const result = {
      mode: "recommend",
      solution_type: "component",
      decision: {
        name: null,
        why: "No canonical Salt target is grounded yet.",
      },
    } as unknown as CreateSaltUiResult;
    const contract = buildCreateWorkflowContract({
      intent: {
        user_task: "Create an unfamiliar interface region.",
        canonical_choice: null,
      },
      provenance: {
        canonical_source_urls: [],
        related_guide_urls: [],
        starter_source_urls: [],
        source_urls: [],
      },
    });

    const compact = buildCreatePublicContract(result, contract, {
      create_rerun_args: { query: "Create an unfamiliar interface region." },
    });

    expect(compact.action).toEqual({
      kind: "ask_user",
      question:
        "Which canonical Salt component or pattern should the example lookup target?",
      rule_ids: [],
      post_action: null,
    });
    expect(compact.action.kind).not.toBe("retrieve_reference");
    expect(compact.questions).toEqual([
      "Which canonical Salt component or pattern should the example lookup target?",
    ]);
    expect(compact.safety.blocking_reasons).toContain(
      "Which canonical Salt component or pattern should the example lookup target?",
    );
  });

  it("asks about the concrete create blocker instead of emitting a code-less review call", () => {
    const result = {
      mode: "recommend",
      solution_type: "component",
      decision: {
        name: "Metric",
        why: "Metric is the canonical Salt direction.",
      },
      next_step: "Confirm the approved implementation boundary.",
    } as unknown as CreateSaltUiResult;
    const contract = buildCreateWorkflowContract({
      readiness: {
        implementation_ready: false,
        reason: "The approved implementation boundary is unresolved.",
      },
    });

    const compact = buildCreatePublicContract(result, contract, {});

    expect(compact.status).toBe("blocked");
    expect(compact.action).toEqual({
      kind: "ask_user",
      question: "The approved implementation boundary is unresolved.",
      rule_ids: [],
      post_action: null,
    });
    expect(compact.safety.blocking_reasons).toContain(
      "The approved implementation boundary is unresolved.",
    );
    expect(compact.action.kind).not.toBe("tool_call");
  });

  it("derives create contract output from the shared create workflow contract", () => {
    const registry = buildRegistryFixture();
    const result = {
      mode: "recommend",
      solution_type: "pattern",
      decision: {
        name: "Analytical dashboard",
        why: "The request describes a dashboard workflow with summary metrics.",
      },
      next_step: "Follow up on App header.",
    } as unknown as CreateSaltUiResult;
    const contract = buildCreateWorkflowContract({
      readiness: {
        implementation_ready: false,
        reason: "Starter code still needs attention.",
      },
      implementation_gate: buildCreateImplementationGate({
        required_follow_through: [
          { region: "header", entity: "App header" },
          { region: "key-metrics", entity: "Metric" },
        ],
      }),
      starter_validation: {
        status: "needs_attention",
        top_issue: "Missing import.",
        next_step: "Fix the starter import.",
        source_urls: [],
      },
      ide_summary: buildCreateIdeSummary({
        recommended_direction: "Use Analytical dashboard.",
      }),
    });

    const createRerunArgs = {
      query: "  dashboard with header and metrics  ",
      solution_type: "pattern" as const,
      package: "@salt-ds/core",
      status: "beta" as const,
      prefer_stable: false,
      a11y_required: false,
      include_starter_code: false,
      resolved_entities: [],
      root_dir: "/repo",
    };
    const compact = buildCreatePublicContract(result, contract, {
      registry,
      create_rerun_args: createRerunArgs,
    } as unknown as Parameters<typeof buildCreatePublicContract>[2]);

    expect(toComparablePublicContract(compact)).toEqual(
      expect.objectContaining({
        workflow: "create",
        workflow_status: "blocked",
        safe_to_implement_exact_request: false,
        blocking_reasons: expect.arrayContaining([
          "required follow-through remains: App header, Metric",
          "Missing import.",
        ]),
        next_step: {
          kind: "retrieve_reference",
          tool: "get_salt_reference",
          args: {
            names: ["App header", "Metric"],
          },
        },
      }),
    );
    expect(compact.action.post_action).toEqual({
      kind: "rerun_workflow",
      tool: "create_salt_ui",
      args: {
        ...createRerunArgs,
        resolved_entities: ["App header", "Metric"],
      },
    });
  });

  it("batches at most three stable unique create follow-through names", () => {
    const result = {
      mode: "recommend",
      solution_type: "pattern",
      decision: {
        name: "Analytical dashboard",
        why: "Use the dashboard composition.",
      },
    } as unknown as CreateSaltUiResult;
    const contract = buildCreateWorkflowContract({
      readiness: {
        implementation_ready: false,
        reason: "Reference evidence remains.",
      },
      implementation_gate: buildCreateImplementationGate({
        required_follow_through: [
          { region: "one", entity: " App header " },
          { region: "duplicate", entity: "App header" },
          { region: "blank", entity: "   " },
          { region: "two", entity: "Metric" },
          { region: "three", entity: "Table" },
          { region: "four", entity: "Grid layout" },
        ],
      }),
    });

    const compact = buildCreatePublicContract(result, contract, {
      create_rerun_args: { query: "dashboard" },
    } as unknown as Parameters<typeof buildCreatePublicContract>[2]);

    expect(compact.action).toMatchObject({
      kind: "retrieve_reference",
      args: {
        names: ["App header", "Metric", "Table"],
      },
    });
    expect(
      compact.action.kind === "retrieve_reference"
        ? compact.action.args
        : undefined,
    ).not.toHaveProperty("entity_type");
    expect(compact.action.post_action).toMatchObject({
      args: {
        resolved_entities: ["App header", "Metric", "Table"],
      },
    });
  });

  it("keeps create continuation unions within the resolved-entity cap", () => {
    const supplied = Array.from({ length: 25 }, (_, index) => `Entity ${index}`);
    const result = {
      mode: "recommend",
      solution_type: "pattern",
      decision: {
        name: "Analytical dashboard",
        why: "Use the dashboard composition.",
      },
    } as unknown as CreateSaltUiResult;
    const contract = buildCreateWorkflowContract({
      readiness: {
        implementation_ready: false,
        reason: "Reference evidence remains.",
      },
      implementation_gate: buildCreateImplementationGate({
        required_follow_through: [
          { region: "new", entity: "Entity 26" },
          { region: "existing", entity: "Entity 24" },
        ],
      }),
    });

    const compact = buildCreatePublicContract(result, contract, {
      create_rerun_args: {
        query: "dashboard",
        resolved_entities: supplied,
      },
    } as unknown as Parameters<typeof buildCreatePublicContract>[2]);

    expect(compact.action).toMatchObject({
      kind: "retrieve_reference",
      args: { names: expect.arrayContaining(["Entity 24"]) },
    });
    const rerunEntities =
      compact.action.post_action?.kind === "rerun_workflow"
        ? compact.action.post_action.args.resolved_entities
        : undefined;
    expect(new Set(rerunEntities).size).toBeLessThanOrEqual(25);
    expect(rerunEntities).not.toContain("Entity 26");
  });

  it("asks for a narrower create request when no reference candidate fits", () => {
    const supplied = Array.from({ length: 25 }, (_, index) => `Entity ${index}`);
    const registry = buildRegistryFixture();
    registry.components.push(
      ...supplied.map((name) => buildComponent(name)),
    );
    const result = {
      mode: "recommend",
      solution_type: "pattern",
      decision: {
        name: "Analytical dashboard",
        why: "Use the dashboard composition.",
      },
    } as unknown as CreateSaltUiResult;
    const contract = buildCreateWorkflowContract({
      readiness: {
        implementation_ready: false,
        reason: "Reference evidence remains.",
      },
      implementation_gate: buildCreateImplementationGate({
        required_follow_through: [{ region: "new", entity: "Entity 26" }],
      }),
    });

    const compact = buildCreatePublicContract(result, contract, {
      registry,
      create_rerun_args: {
        query: "dashboard",
        resolved_entities: supplied,
      },
    } as unknown as Parameters<typeof buildCreatePublicContract>[2]);

    expect(compact.action).toEqual({
      kind: "ask_user",
      question: expect.stringMatching(/narrow|remove unrelated/i),
      rule_ids: [],
      post_action: null,
    });
  });

  it("derives review contract output from the shared review workflow contract", () => {
    const result = {
      guidance_boundary: {
        workflow: "review_salt_ui",
      },
      decision: {
        status: "needs_attention",
        why: "Canonical Salt validation found issues.",
      },
      summary: {
        errors: 1,
        warnings: 0,
        infos: 0,
        fix_count: 1,
        migration_count: 0,
      },
      fixes: [],
      issues: [],
      migrations: [],
      next_step: "Fix the remaining review issues and rerun review.",
      missing_data: [],
      source_urls: ["/salt/components/button"],
    } as unknown as ReviewSaltUiResult;
    const contract = buildReviewWorkflowContract({
      decision: result.decision,
      ide_summary: buildReviewIdeSummary({
        safest_next_fix: "Replace the incorrect component usage.",
      }),
      fix_candidates: {
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
            source_urls: ["/salt/components/button"],
          },
        ],
      },
      provenance: {
        canonical_source_urls: ["/salt/components/button"],
        related_guide_urls: [],
        starter_source_urls: [],
        source_urls: ["/salt/components/button"],
      },
    });

    const compact = buildReviewPublicContract(result, contract, {});

    expect(toComparablePublicContract(compact)).toEqual(
      expect.objectContaining({
        workflow: "review",
        workflow_status: "partial",
        safe_to_implement_exact_request: false,
        blocking_reasons: expect.arrayContaining([
          "Replace the current element with the canonical Salt primitive.",
        ]),
      }),
    );
    expect(compact.action).toEqual({
      kind: "apply_fixes",
      scope: "grounded_findings",
      authorization: "host_or_user_required",
      rule_ids: ["review-canonical-mismatch"],
      post_action: {
        kind: "review",
        tool: "review_salt_ui",
        required_input: ["complete_updated_file"],
      },
    });
    expect(compact.guidance).toEqual(
      expect.objectContaining({
        kind: "review",
        fixes: [
          expect.objectContaining({
            title: "Replace incorrect component usage.",
            recommendation:
              "Replace the current element with the canonical Salt primitive.",
          }),
        ],
      }),
    );
    if (compact.guidance.kind !== "review") {
      throw new Error("Expected review guidance for grounded fixes");
    }
    expect(compact.guidance.fixes[0]?.safety).toBe("manual_review");
  });

  it.each([
    {
      label: "ungrounded before grounded",
      candidates: [
        buildReviewFixCandidate({
          title: "Ungrounded observation",
          rule_id: "review-ungrounded",
          source_urls: [],
        }),
        buildReviewFixCandidate(),
      ],
    },
    {
      label: "grounded before ungrounded",
      candidates: [
        buildReviewFixCandidate(),
        buildReviewFixCandidate({
          title: "Ungrounded observation",
          rule_id: "review-ungrounded",
          source_urls: [],
        }),
      ],
    },
  ])(
    "publishes only grounded review fixes with stable rule IDs ($label)",
    ({ candidates }) => {
      const compact = buildReviewPublicContract(
        buildNeedsAttentionReviewResult(),
        buildReviewWorkflowContract({
          decision: buildNeedsAttentionReviewResult().decision,
          fix_candidates: { candidates },
          rule_ids: ["review-ungrounded", "review-canonical-mismatch"],
          provenance: {
            canonical_source_urls: ["/salt/components/button"],
            related_guide_urls: [],
            starter_source_urls: [],
            source_urls: ["/salt/components/button"],
          },
        }),
        {},
      );

      expect(compact.action).toMatchObject({
        kind: "apply_fixes",
        rule_ids: ["review-canonical-mismatch"],
      });
      expect(compact.guidance).toEqual(
        expect.objectContaining({
          kind: "review",
          fixes: [
            expect.objectContaining({
              rule_id: "review-canonical-mismatch",
              source_urls: ["/salt/components/button"],
            }),
          ],
        }),
      );
    },
  );

  it("filters review fixes for grounding before applying the public limit", () => {
    const ungrounded = Array.from({ length: 12 }, (_, index) =>
      buildReviewFixCandidate({
        title: `Ungrounded observation ${index + 1}`,
        rule_id: `review-ungrounded-${index + 1}`,
        source_urls: [],
      }),
    );
    const compact = buildReviewPublicContract(
      buildNeedsAttentionReviewResult(),
      buildReviewWorkflowContract({
        decision: buildNeedsAttentionReviewResult().decision,
        fix_candidates: {
          candidates: [...ungrounded, buildReviewFixCandidate()],
        },
        rule_ids: [
          ...ungrounded.map((candidate) => candidate.rule_id ?? ""),
          "review-canonical-mismatch",
        ],
        provenance: {
          canonical_source_urls: ["/salt/components/button"],
          related_guide_urls: [],
          starter_source_urls: [],
          source_urls: ["/salt/components/button"],
        },
      }),
      {},
    );

    expect(compact.action).toMatchObject({
      kind: "apply_fixes",
      rule_ids: ["review-canonical-mismatch"],
    });
    expect(compact.guidance.kind).toBe("review");
    if (compact.guidance.kind !== "review") return;
    expect(compact.guidance.fixes).toEqual([
      expect.objectContaining({
        rule_id: "review-canonical-mismatch",
        source_urls: ["/salt/components/button"],
      }),
    ]);
  });

  it("keeps an ungrounded-only review result non-mutating", () => {
    const compact = buildReviewPublicContract(
      buildNeedsAttentionReviewResult(),
      buildReviewWorkflowContract({
        decision: buildNeedsAttentionReviewResult().decision,
        fix_candidates: {
          candidates: [
            buildReviewFixCandidate({
              rule_id: "review-ungrounded",
              source_urls: [],
            }),
          ],
        },
        rule_ids: ["review-ungrounded"],
      }),
      {},
    );

    expect(compact.action).toMatchObject({
      kind: "ask_user",
      rule_ids: ["review-ungrounded"],
      post_action: null,
    });
    expect(compact.guidance.kind).toBe("review");
    if (compact.guidance.kind !== "review") return;
    expect(compact.guidance.fixes).toEqual([]);
  });

  it("rejects apply_fixes when fix provenance or rule IDs diverge", () => {
    const valid = buildPublicContract(
      buildInput({
        workflow: "review",
        state: {
          implementation_ready: false,
          required_follow_through: [],
          blocking_questions: [],
          starter_blockers: [],
          project_policy_blockers: [],
          hard_blocked: false,
          context_ready: true,
          usable_guidance_present: true,
          transport_failed: false,
        },
        next_step: {
          kind: "apply_fixes",
          scope: "grounded_findings",
          authorization: "host_or_user_required",
        },
        guidance: {
          kind: "review",
          findings: [],
          fixes: [
            {
              rule_id: "review-canonical-mismatch",
              title: "Replace incorrect component usage.",
              recommendation:
                "Replace the current element with the canonical Salt primitive.",
              safety: "manual_review",
              source_urls: ["/salt/components/button"],
            },
          ],
        },
        rule_ids: ["review-canonical-mismatch"],
      }),
    );
    const errors = getPublicContractValidationErrors({
      ...valid,
      action: {
        ...valid.action,
        rule_ids: ["review-unrelated"],
      },
      guidance: {
        kind: "review",
        findings: [],
        fixes: [
          ...(valid.guidance.kind === "review" ? valid.guidance.fixes : []),
          {
            rule_id: "review-ungrounded",
            title: "Ungrounded fix",
            recommendation: "Apply an unsupported replacement.",
            safety: "manual_review",
            source_urls: [],
          },
        ],
      },
    });

    expect(errors).toEqual(
      expect.arrayContaining([
        "action.kind=apply_fixes requires source provenance for every review fix",
        "action.kind=apply_fixes requires action.rule_ids to match public review fix rule_ids",
      ]),
    );
  });

  it("asks about the concrete review blocker instead of immediately reviewing without code", () => {
    const result = {
      guidance_boundary: {
        workflow: "review_salt_ui",
      },
      decision: {
        status: "needs_attention",
        why: "The reviewed scope still has an unresolved canonical mismatch.",
      },
      summary: {
        errors: 1,
        warnings: 0,
        infos: 0,
        fix_count: 0,
        migration_count: 0,
      },
      fixes: [],
      issues: [],
      migrations: [],
      next_step: "Choose the intended canonical Salt component before editing.",
      missing_data: [],
      source_urls: [],
    } as unknown as ReviewSaltUiResult;
    const contract = buildReviewWorkflowContract({
      decision: result.decision,
    });

    const compact = buildReviewPublicContract(result, contract, {});

    expect(compact.status).toBe("blocked");
    expect(compact.action).toEqual({
      kind: "ask_user",
      question: "Choose the intended canonical Salt component before editing.",
      rule_ids: [],
      post_action: null,
    });
    expect(compact.safety.blocking_reasons).toContain(
      "Choose the intended canonical Salt component before editing.",
    );
    expect(compact.action.kind).not.toBe("review");
  });

  it("blocks review on unchecked project context before trusting repo-specific guidance", () => {
    const result = {
      guidance_boundary: {
        workflow: "review_salt_ui",
      },
      decision: {
        status: "clean",
        why: "No significant Salt usage issues were detected.",
      },
      summary: {
        errors: 0,
        warnings: 0,
        infos: 0,
        fix_count: 0,
        migration_count: 0,
      },
      fixes: [],
      issues: [],
      migrations: [],
      missing_data: [],
      source_urls: ["/salt/components/button"],
    } as unknown as ReviewSaltUiResult;
    const contract = buildReviewWorkflowContract({
      provenance: {
        canonical_source_urls: ["/salt/components/button"],
        related_guide_urls: [],
        starter_source_urls: [],
        source_urls: ["/salt/components/button"],
      },
    });

    const compact = buildReviewPublicContract(result, contract, {
      context_checked: false,
      root_dir: "/repo",
    });

    expect(compact.status).toBe("blocked");
    expect(compact.action).toEqual({
      kind: "fix_context",
      tool: "get_salt_project_context",
      mode: "stop_and_fix_context",
      args: {
        root_dir: "/repo",
      },
      rule_ids: [],
      post_action: null,
    });
    expect(compact.safety.blocking_reasons).toContain(
      "required project context is missing",
    );
  });

  it("treats clean review output with canonical source evidence as complete", () => {
    const result = {
      guidance_boundary: {
        workflow: "review_salt_ui",
      },
      decision: {
        status: "clean",
        why: "No significant Salt usage issues were detected.",
      },
      summary: {
        errors: 0,
        warnings: 0,
        infos: 0,
        fix_count: 0,
        migration_count: 0,
      },
      fixes: [],
      issues: [],
      migrations: [],
      artifact_verification: {
        status: "complete",
        component_imports: [
          {
            package: "@salt-ds/core",
            imported: "Button",
            resolved_entity: "Button",
            resolution: "component_registry",
            status: "verified",
            source_urls: ["/salt/components/button"],
            evidence_refs: [],
          },
        ],
      },
      missing_data: [
        "package_version 'latest' is not a valid semver value; version-aware deprecation filtering was skipped.",
      ],
      source_urls: ["/salt/components/button"],
    } as unknown as ReviewSaltUiResult;
    const contract = buildReviewWorkflowContract({
      provenance: {
        canonical_source_urls: ["/salt/components/button"],
        related_guide_urls: [],
        starter_source_urls: [],
        source_urls: ["/salt/components/button"],
      },
    });

    const compact = buildReviewPublicContract(result, contract, {});

    expect(toComparablePublicContract(compact)).toEqual(
      expect.objectContaining({
        workflow: "review",
        workflow_status: "success",
        canonical_complete: true,
        safe_to_implement_exact_request: true,
        blocking_reasons: [],
        next_step: {
          kind: "complete",
          outcome: "no_changes_required",
        },
      }),
    );
    expect(compact.action.post_action).toBeNull();
    expect(compact.evidence).toEqual(
      expect.objectContaining({
        status: "complete",
        source_urls: ["/salt/components/button"],
        items: expect.arrayContaining([
          expect.objectContaining({
            kind: "registry",
            entity: "Button",
            field: "reviewed_artifact.imports.@salt-ds/core.Button",
            source_urls: ["/salt/components/button"],
          }),
        ]),
      }),
    );
  });

  it("degrades review compact output when report evidence does not resolve", () => {
    const registry = {
      ...buildRegistryFixture(),
      tokens: [buildFixtureStructuralRoleToken()],
    };
    const evidenceRef: SaltEvidenceRef = {
      contract: SALT_EVIDENCE_REF_CONTRACT,
      id: "fixture-review-token-structural-role",
      source_kind: "registry",
      claim_kind: "token",
      registry: {
        entity_type: "token",
        entity_id: "--fixture-review-token",
        entity_name: "--fixture-review-token",
        field_path: "policy.structural_roles.0",
        registry_version: registry.version,
      },
      confidence: "high",
    };
    const result = {
      guidance_boundary: {
        workflow: "review_salt_ui",
      },
      decision: {
        status: "clean",
        why: "No significant Salt usage issues were detected.",
      },
      summary: {
        errors: 0,
        warnings: 0,
        infos: 0,
        fix_count: 0,
        migration_count: 0,
      },
      fixes: [],
      issues: [
        {
          id: "fixture.review-token-claim",
          category: "tokens",
          rule: "fixture-review-token-rule",
          severity: "warning",
          title: "Fixture review token claim",
          message: "Fixture review token claim needs source-backed evidence.",
          evidence: ["Fixture issue emitted from a test fixture."],
          canonical_source: "/fixture/docs/token-policy",
          suggested_fix: null,
          confidence: 1,
          matches: 1,
          source_urls: ["/fixture/docs/token-policy"],
          evidence_refs: [evidenceRef],
        },
      ],
      migrations: [],
      missing_data: [],
      source_urls: ["/fixture/docs/token-policy"],
    } as unknown as ReviewSaltUiResult;
    const contract = buildReviewWorkflowContract({
      provenance: {
        canonical_source_urls: ["/fixture/docs/token-policy"],
        related_guide_urls: [],
        starter_source_urls: [],
        source_urls: ["/fixture/docs/token-policy"],
      },
    });

    const compact = buildReviewPublicContract(result, contract, {
      registry,
    });

    expect(toComparablePublicContract(compact)).toEqual(
      expect.objectContaining({
        workflow: "review",
        workflow_status: "blocked",
        canonical_complete: false,
        safe_to_implement_exact_request: false,
        next_step: {
          kind: "ask_user",
          question: expect.stringContaining(
            "missing_structural_role_rule_evidence",
          ),
        },
      }),
    );
    expect(compact.action.post_action).toBeNull();
    expect(compact.evidence).toEqual(
      expect.objectContaining({
        status: "partial",
        missing: expect.arrayContaining([
          expect.stringContaining("missing_structural_role_rule_evidence"),
        ]),
      }),
    );
  });

  it("stops with no post action for a theme-provider ask_user choice", () => {
    const registry = buildRegistryFixture();
    const result = {
      mode: "recommend",
      solution_type: "component",
      decision: {
        name: "Tabs",
        why: "Best Salt component match for the requested need.",
      },
    } as unknown as CreateSaltUiResult;
    const contract = buildCreateWorkflowContract({
      implementation_gate: buildCreateImplementationGate({
        blocking_questions: [
          "Should this repo use SaltProvider or SaltProviderNext?",
        ],
      }),
    });

    const compact = buildCreatePublicContract(result, contract, {
      registry,
      create_rerun_args: { query: "profile page with tabs" },
    });
    expect(compact.action).toEqual(
      expect.objectContaining({
        kind: "ask_user",
        question: "Should this repo use SaltProvider or SaltProviderNext?",
      }),
    );
    expect(compact.questions).toEqual([
      "Should this repo use SaltProvider or SaltProviderNext?",
    ]);
    expect(compact.action.post_action).toBeNull();
    expect(compact.action).not.toHaveProperty("answer_binding");
    expect(compact).not.toHaveProperty("next_required_action");
    expect(compact).not.toHaveProperty("allowed_next_actions");
    expect(compact).not.toHaveProperty("recipe");
  });

  it("prefers required follow-through over re-running the broadened owner for descriptive create queries", () => {
    const registry = buildRegistryFixture();
    const result = {
      mode: "recommend",
      solution_type: "component",
      decision: {
        name: "Table",
        why: "Best Salt component match for the requested need.",
      },
    } as unknown as CreateSaltUiResult;
    const contract = buildCreateWorkflowContract({
      implementation_gate: buildCreateImplementationGate({
        required_follow_through: [
          { region: "breadcrumbs", entity: "Breadcrumbs" },
        ],
      }),
      ide_summary: buildCreateIdeSummary({
        recommended_direction: "Use Table.",
      }),
    });

    const compact = buildCreatePublicContract(result, contract, {
      registry,
      create_rerun_args: {
        query: "file manager with breadcrumbs and table",
        package: "@salt-ds/core",
        root_dir: "/repo",
        resolved_entities: ["Table"],
      },
    });

    expect(toComparablePublicContract(compact)).toEqual(
      expect.objectContaining({
        workflow: "create",
        workflow_status: "partial",
        requested_entity: "file manager with breadcrumbs and table",
        resolved_entity: "Table",
        match_status: "broadened",
        blocking_reasons: expect.arrayContaining([
          "required follow-through remains: Breadcrumbs",
        ]),
        next_step: {
          kind: "retrieve_reference",
          tool: "get_salt_reference",
          args: {
            names: ["Breadcrumbs"],
          },
        },
      }),
    );
    expect(compact.action).toEqual(
      expect.objectContaining({
        tool: "get_salt_reference",
        args: {
          names: ["Breadcrumbs"],
        },
      }),
    );
    expect(compact.action.post_action).toEqual({
      kind: "rerun_workflow",
      tool: "create_salt_ui",
      args: {
        query: "file manager with breadcrumbs and table",
        package: "@salt-ds/core",
        root_dir: "/repo",
        resolved_entities: ["Table", "Breadcrumbs"],
      },
    });
    expect(compact.evidence.missing).toEqual(
      expect.arrayContaining([expect.stringContaining("Breadcrumbs")]),
    );
    expect(compact).not.toHaveProperty("next_required_action");
    expect(compact).not.toHaveProperty("allowed_next_actions");
    expect(compact).not.toHaveProperty("recipe");
  });

  it("never prescribes retrieving an already resolved broadened owner", () => {
    const registry = buildRegistryFixture();
    const result = {
      mode: "recommend",
      solution_type: "component",
      decision: {
        name: "Table",
        why: "Best Salt component match for the requested need.",
      },
    } as unknown as CreateSaltUiResult;
    const contract = buildCreateWorkflowContract({
      ide_summary: buildCreateIdeSummary({
        recommended_direction: "Use Table as the grounded owner.",
      }),
    });

    const compact = buildCreatePublicContract(result, contract, {
      registry,
      create_rerun_args: {
        query: "dashboard with a transaction table and filter actions",
        resolved_entities: ["Table"],
      },
    });

    expect(compact.action).toEqual(
      expect.objectContaining({
        kind: "retrieve_reference",
        args: {
          names: ["Analytical dashboard"],
          entity_type: "pattern",
        },
      }),
    );
    expect(compact.action).not.toEqual(
      expect.objectContaining({
        kind: "retrieve_reference",
        args: expect.objectContaining({ names: ["Table"] }),
      }),
    );
  });

  it("turns verified resolved entities and composition requirements into binding checklist steps", () => {
    const registry = buildRegistryFixture();
    const result = {
      mode: "recommend",
      solution_type: "pattern",
      decision: {
        name: "Analytical dashboard",
        why: "Use the canonical Salt dashboard composition.",
      },
      composition_contract: {
        primary_target: {
          solution_type: "pattern",
          name: "Analytical dashboard",
        },
        expected_patterns: ["Analytical dashboard"],
        expected_components: ["Table", "Grid layout"],
        slots: [
          {
            id: "main-content",
            label: "main content",
            certainty: "strongly_implied",
            preferred_patterns: [],
            preferred_components: ["Table", "Grid layout"],
            reason: "Use the canonical data and layout components.",
            source_urls: ["/salt/patterns/analytical-dashboard"],
            notes: [],
          },
        ],
        avoid: [],
        source_urls: ["/salt/patterns/analytical-dashboard"],
      },
    } as unknown as CreateSaltUiResult;
    const contract = buildCreateWorkflowContract({
      implementation_gate: buildCreateImplementationGate({
        required_follow_through: [
          { region: "main-content", entity: "Table" },
          { region: "main-content", entity: "Grid layout" },
        ],
      }),
    });

    const compact = buildCreatePublicContract(result, contract, {
      registry,
      create_rerun_args: {
        query: "analytical dashboard with a table and grid layout",
        resolved_entities: ["Table", "Grid layout"],
      },
    });

    expect(compact.guidance).toMatchObject({
      kind: "create",
      starter_guidance: {
        plan: expect.arrayContaining([
          "Binding check (resolved entity): the final reviewed artifact imports and uses Table.",
          "Binding check (resolved entity): the final reviewed artifact imports and uses Grid layout.",
          "Binding check (primary target): the final reviewed artifact implements Analytical dashboard.",
          "Binding check (composition main content): the final reviewed artifact includes Table or Grid layout.",
        ]),
      },
      review_targets: {
        components: ["Table", "Grid layout"],
        patterns: ["Analytical dashboard"],
        composition_contract: result.composition_contract,
        source: "create_report",
      },
    });
  });

  it("accepts the exact create owner without adding a duplicate binding check", () => {
    const registry = buildRegistryFixture();
    const result = {
      mode: "recommend",
      solution_type: "component",
      decision: {
        name: "Table",
        why: "Use the canonical Salt Table.",
      },
    } as unknown as CreateSaltUiResult;
    const compact = buildCreatePublicContract(
      result,
      buildCreateWorkflowContract({
        intent: {
          user_task: "Create a Table.",
          canonical_choice: "Table",
        },
      }),
      {
        registry,
        create_rerun_args: {
          query: "Table",
          resolved_entities: ["Table"],
        },
      },
    );

    expect(compact.action.kind).toBe("implement");
    expect(compact.evidence.items).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: "resolved_entities" }),
      ]),
    );
    expect(compact.guidance.kind).toBe("create");
    if (compact.guidance.kind !== "create") return;
    expect(compact.guidance.starter_guidance.plan).not.toEqual(
      expect.arrayContaining([
        expect.stringMatching(/Binding check \(resolved entity\).*Table/),
      ]),
    );
  });

  it("accepts a canonical alias only for required follow-through evidence", () => {
    const registry = buildRegistryFixture();
    const table = registry.components.find(
      (component) => component.name === "Table",
    );
    table?.aliases.push("DataTable");
    const result = {
      mode: "recommend",
      solution_type: "pattern",
      decision: {
        name: "Analytical dashboard",
        why: "Use the canonical Salt dashboard composition.",
      },
    } as unknown as CreateSaltUiResult;
    const compact = buildCreatePublicContract(
      result,
      buildCreateWorkflowContract({
        implementation_gate: buildCreateImplementationGate({
          required_follow_through: [
            { region: "data-table", entity: "Table" },
          ],
        }),
      }),
      {
        registry,
        create_rerun_args: {
          query: "analytical dashboard with a table",
          resolved_entities: ["DataTable"],
        },
      },
    );

    expect(compact.action.kind).toBe("implement");
    expect(compact.evidence.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          entity: "Table",
          field: "resolved_follow_through",
        }),
      ]),
    );
    expect(compact.evidence.items).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ entity: "DataTable" })]),
    );
  });

  it.each([
    { label: "unrelated", supplied: ["Chart"] },
    { label: "mixed allowed and unrelated", supplied: ["Table", "Chart"] },
    { label: "unknown", supplied: ["DefinitelyMissingSaltEntity"] },
  ])("rejects $label resolved create evidence", ({ supplied }) => {
    const registry = buildRegistryFixture();
    const result = {
      mode: "recommend",
      solution_type: "component",
      decision: {
        name: "Table",
        why: "Use the canonical Salt Table.",
      },
    } as unknown as CreateSaltUiResult;
    const compact = buildCreatePublicContract(
      result,
      buildCreateWorkflowContract({
        intent: {
          user_task: "Create a Table.",
          canonical_choice: "Table",
        },
      }),
      {
        registry,
        create_rerun_args: {
          query: "Table",
          resolved_entities: supplied,
        },
      },
    );

    expect(compact.action).toMatchObject({
      kind: "ask_user",
      question: expect.stringMatching(/remove|rerun/i),
      post_action: null,
    });
    expect(compact.action.kind).not.toBe("implement");
    expect(compact.evidence.items).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          entity: expect.stringMatching(/Chart|DefinitelyMissingSaltEntity/),
        }),
      ]),
    );
  });

  it("rejects a supplied alias that resolves to multiple canonical records", () => {
    const registry = buildRegistryFixture();
    registry.components.find(
      (component) => component.name === "Chart",
    )?.aliases.push("SharedAlias");
    registry.components.find(
      (component) => component.name === "Table",
    )?.aliases.push("SharedAlias");
    const result = {
      mode: "recommend",
      solution_type: "component",
      decision: {
        name: "Table",
        why: "Use the canonical Salt Table.",
      },
    } as unknown as CreateSaltUiResult;
    const compact = buildCreatePublicContract(
      result,
      buildCreateWorkflowContract(),
      {
        registry,
        create_rerun_args: {
          query: "Table",
          resolved_entities: ["SharedAlias"],
        },
      },
    );

    expect(compact.action).toMatchObject({
      kind: "ask_user",
      question: expect.stringContaining("SharedAlias"),
      post_action: null,
    });
    expect(compact.action.kind).not.toBe("implement");
  });

  it("derives migrate contract output from the shared migrate workflow contract", () => {
    const result = {
      translations: [{}],
      migration_plan: ["Start with the main shell."],
      clarifying_questions: ["Should the table use Data grid or Table?"],
    } as unknown as MigrateToSaltResult;
    const contract = buildMigrateWorkflowContract({
      readiness: {
        implementation_ready: true,
        reason: "Starter code validated.",
      },
      context_requirement: {
        repo_specific_edits_ready: false,
        reason: "Repo context still needs to be loaded.",
        retry_with: {
          root_dir: "/repo",
        },
      },
      starter_validation: {
        status: "clean",
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
        suggested_command:
          'review_salt_ui via the @salt-ds/mcp server (args: { code: "<file contents>" })',
      },
    });

    const compact = buildMigratePublicContract(
      result as unknown as never,
      contract,
      {},
    );

    expect(toComparablePublicContract(compact)).toEqual(
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
            root_dir: "/repo",
          },
        },
      }),
    );
    expect(compact.action.kind).not.toBe("implement");
    expect(compact.action.post_action).toBeNull();
  });

  it("asks for missing migration state instead of rerunning migrate with empty args", () => {
    const result = {
      translations: [],
      migration_plan: [],
      clarifying_questions: [],
      next_step:
        "Provide source UI code or describe the interface you want to translate into Salt.",
    } as unknown as MigrateToSaltResult;

    const compact = buildMigratePublicContract(
      result,
      buildMigrateWorkflowContract(),
      {},
    );

    expect(compact.status).toBe("blocked");
    expect(compact.action).toEqual({
      kind: "ask_user",
      question:
        "Provide source UI code or describe the interface you want to translate into Salt.",
      rule_ids: [],
      post_action: null,
    });
    expect(compact.safety.blocking_reasons).toContain(
      "Provide source UI code or describe the interface you want to translate into Salt.",
    );
    expect(compact.action.kind).not.toBe("tool_call");
  });

  it("keeps implement-ready migrate guidance actionable and host-owned", () => {
    const result = {
      translations: [
        {
          source_model_ref: "region:main",
          label: "Main shell",
          implementation: {
            readiness: "high",
            next_action: "Implement the main shell with Border layout.",
            validation_step: "Review the migrated shell.",
          },
          salt_target: {
            name: "Border layout",
            solution_type: "pattern",
            why: "It provides the canonical Salt page shell.",
            docs: ["/salt/patterns/border-layout"],
          },
        },
      ],
      migration_plan: ["Implement the main shell first."],
      clarifying_questions: [],
    } as unknown as MigrateToSaltResult;
    const contract = buildMigrateWorkflowContract({
      ide_summary: buildMigrateIdeSummary({
        first_scaffold: ["Start with the Border layout shell."],
      }),
      provenance: {
        canonical_source_urls: ["/salt/patterns/border-layout"],
        related_guide_urls: [],
        starter_source_urls: ["/salt/patterns/border-layout"],
        source_urls: ["/salt/patterns/border-layout"],
      },
    });

    const compact = buildMigratePublicContract(result, contract, {
      starter_code: [
        {
          label: "Border layout starter",
          language: "tsx",
          code: "export function Page() { return <main />; }",
          source_urls: ["/salt/patterns/border-layout"],
        },
      ],
    });

    expect(compact.status).toBe("success");
    expect(compact.action.kind).toBe("implement");
    expect(compact.guidance).toEqual(
      expect.objectContaining({
        kind: "migrate",
        translations: [
          expect.objectContaining({
            source_model_ref: "region:main",
            salt_target: expect.objectContaining({ name: "Border layout" }),
          }),
        ],
        migration_plan: ["Implement the main shell first."],
        starter_guidance: expect.objectContaining({
          plan: ["Start with the Border layout shell."],
          snippets: [
            expect.objectContaining({ label: "Border layout starter" }),
          ],
        }),
        review_targets: {
          components: [],
          patterns: ["Border layout"],
          composition_contract: null,
          source: "workflow_context",
        },
      }),
    );
    const verification =
      compact.guidance.kind === "migrate"
        ? compact.guidance.post_migration_verification
        : null;
    expect(JSON.stringify(verification)).not.toMatch(
      /\burl\b|private (tool|surface)/i,
    );

    const errors = getPublicContractValidationErrors({
      ...compact,
      guidance: {
        ...compact.guidance,
        translations: [{}],
      },
    } as unknown as PublicContract);
    expect(errors).toContain("migrate implement action requires translations");
  });

  it("surfaces migrate source outline evidence context in the public contract", () => {
    const result = {
      translations: [{}],
      migration_plan: ["Start with the main shell."],
      clarifying_questions: [],
    } as unknown as MigrateToSaltResult;
    const contract = buildMigrateWorkflowContract({
      visual_evidence_contract: {
        ...buildMigrateWorkflowContract().visual_evidence_contract,
        source_outline_provided: true,
        source_outline_signal_counts: {
          regions: 2,
          actions: 1,
          states: 1,
          notes: 1,
        },
      },
    });

    const compact = buildMigratePublicContract(
      result as unknown as never,
      contract,
      {},
    );

    expect(compact.evidence.input_context).toEqual(
      expect.objectContaining({
        source_outline_provided: true,
        source_outline_signal_counts: {
          regions: 2,
          actions: 1,
          states: 1,
          notes: 1,
        },
        source_outline_summary:
          "Structured source outline contributed 2 regions, 1 action, 1 state, 1 note.",
      }),
    );
    expect(compact.status).not.toBe("success");
    expect(compact.safety.exact_request_safe).toBe(false);
    expect(compact.action.kind).not.toBe("implement");
  });

  it("filters generic migration convention questions when no project policy exists", () => {
    const result = {
      translations: [{}],
      migration_plan: ["Start with the main shell."],
      clarifying_questions: [
        "Which approved repo wrapper or shell should this use?",
      ],
    } as unknown as MigrateToSaltResult;
    const contract = buildMigrateWorkflowContract({
      project_conventions_check: {
        ...buildMigrateWorkflowContract().project_conventions_check,
        check_recommended: true,
        declared_policy_status: "none-declared",
      },
    });

    const compact = buildMigratePublicContract(
      result as unknown as never,
      contract,
      {},
    );

    expect(compact.questions).toEqual([
      "canonical Salt source evidence is missing",
    ]);
    expect(compact.safety.blocking_reasons).not.toContain(
      "Which approved repo wrapper or shell should this use?",
    );
    expect(compact.action).toEqual({
      kind: "ask_user",
      question: "canonical Salt source evidence is missing",
      rule_ids: [],
      post_action: null,
    });
  });

  it("keeps dense-data clarification blocking when context is ready", () => {
    const question =
      "Which Salt pattern should replace this dense data surface before implementation?";
    const result = {
      translations: [{}],
      migration_plan: ["Map the dense data workflow before implementation."],
      clarifying_questions: [question],
    } as unknown as MigrateToSaltResult;
    const contract = buildMigrateWorkflowContract({
      provenance: {
        canonical_source_urls: ["/salt/patterns/data-display"],
        related_guide_urls: [],
        starter_source_urls: ["/salt/patterns/data-display"],
        source_urls: ["/salt/patterns/data-display"],
      },
    });

    const compact = buildMigratePublicContract(result, contract, {});

    expect(compact.status).toBe("blocked");
    expect(compact.questions).toContain(question);
    expect(compact.action).toEqual({
      kind: "ask_user",
      question,
      rule_ids: [],
      post_action: null,
    });
    expect(compact.safety.exact_request_safe).toBe(false);
  });
});
