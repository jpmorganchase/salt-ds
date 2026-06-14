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
  buildUpgradePublicContract,
  getPublicContractValidationErrors,
  PUBLIC_WORKFLOW_CONTRACT_VERSION,
  type PublicContract,
  type PublicContractInput,
  type PublicNextStep,
} from "../publicContract.js";
import type { ReviewSaltUiResult } from "../reviewSaltUi.js";
import type { MigrateToSaltResult } from "../translation/sourceUiTypes.js";
import type { UpgradeSaltUiResult } from "../upgradeSaltUi.js";
import type {
  CreateSaltUiWorkflowContract,
  MigrateToSaltWorkflowContract,
  ReviewSaltUiWorkflowContract,
  UpgradeSaltUiWorkflowContract,
  WorkflowCreateIdeSummary,
  WorkflowCreateImplementationGate,
  WorkflowMigrateIdeSummary,
  WorkflowReviewIdeSummary,
  WorkflowUpgradeIdeSummary,
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
    status: "clear",
    reason: "No follow-through remains.",
    required_follow_through: [],
    blocking_questions: [],
    next_step: null,
    next_call: null,
    rule_ids: [],
    ...overrides,
  };
}

function buildCreateIdeSummary(
  overrides: Partial<WorkflowCreateIdeSummary> = {},
): WorkflowCreateIdeSummary {
  return {
    recommended_direction: "Use the canonical Salt direction.",
    bounded_scope: [],
    open_question: null,
    starter_plan: [],
    verify: [],
    top_source_urls: [],
    ...overrides,
  };
}

function buildReviewIdeSummary(
  overrides: Partial<WorkflowReviewIdeSummary> = {},
): WorkflowReviewIdeSummary {
  return {
    verdict: {
      level: "clean",
      summary: "No blocking issues remain.",
    },
    top_findings: [],
    safest_next_fix: null,
    verify: [],
    top_source_urls: [],
    ...overrides,
  };
}

function buildMigrateIdeSummary(
  overrides: Partial<WorkflowMigrateIdeSummary> = {},
): WorkflowMigrateIdeSummary {
  return {
    screen_map: [],
    preserve: [],
    needs_confirmation: [],
    recommended_direction: [],
    first_scaffold: [],
    verify: [],
    top_source_urls: [],
    ...overrides,
  };
}

function buildUpgradeIdeSummary(
  overrides: Partial<WorkflowUpgradeIdeSummary> = {},
): WorkflowUpgradeIdeSummary {
  return {
    target: null,
    from_version: null,
    to_version: null,
    required_changes: [],
    optional_cleanup: [],
    suggested_order: [],
    verify: [],
    top_source_urls: [],
    ...overrides,
  };
}

function toComparablePublicContract(contract: PublicContract) {
  const nextStep = { ...contract.action } as Record<string, unknown>;
  delete nextStep.rule_ids;
  delete nextStep.post_action;
  delete nextStep.cli;
  delete nextStep.mcp;
  const postAction = contract.action.post_action
    ? {
        kind: contract.action.post_action.kind,
        tool: contract.action.post_action.tool,
      }
    : undefined;

  return {
    contract: contract.contract,
    workflow: contract.workflow,
    transport: contract.transport,
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
    changes: [],
    search_index: [],
  };
}

function buildCreateWorkflowContract(
  overrides: Partial<CreateSaltUiWorkflowContract> = {},
): CreateSaltUiWorkflowContract {
  return {
    confidence: {
      level: "high",
      reasons: [
        "Fixture confidence is sufficient for contract derivation tests.",
      ],
      ask_before_proceeding: false,
      raise_confidence: [],
    },
    readiness: {
      status: "starter_validated",
      implementation_ready: true,
      reason: "Starter code validated.",
    },
    implementation_gate: buildCreateImplementationGate(),
    context_requirement: {
      status: "context_checked",
      repo_specific_edits_ready: true,
      reason: "Context is ready.",
      satisfied_by: "salt-ds info",
      resolution_status: "resolved",
      retry_with: {
        root_dir: "/repo",
        context_id: "repo-context",
      },
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
    ide_summary: buildCreateIdeSummary(),
    intent: {
      user_task: "Create the requested Salt UI.",
      key_interaction: "Present the requested Salt surface.",
      composition_direction: "Use the canonical Salt composition.",
      canonical_choice: "Metric",
      rule_ids: [],
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
      suggested_follow_up_cli: "salt-ds info --json",
      next_step: "Continue with canonical Salt guidance.",
    },
    provenance: {
      canonical_source_urls: [],
      related_guide_urls: [],
      starter_source_urls: [],
      source_urls: [],
      guidance_signals: [],
      project_conventions_contract: "project_conventions_v1",
    },
    ...overrides,
  };
}

function buildReviewWorkflowContract(
  overrides: Partial<ReviewSaltUiWorkflowContract> = {},
): ReviewSaltUiWorkflowContract {
  return {
    confidence: {
      level: "high",
      reasons: ["Fixture confidence is sufficient for review contract tests."],
      ask_before_proceeding: false,
      raise_confidence: [],
    },
    ide_summary: buildReviewIdeSummary(),
    decision: {
      status: "clean",
      why: "No blocking review issues remain.",
    },
    fix_candidates: {
      total_count: 0,
      deterministic_count: 0,
      manual_review_count: 0,
      candidates: [],
      notes: [],
    },
    issue_classes: [],
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
      suggested_follow_up_cli: "salt-ds info --json",
      next_step: "Continue with canonical Salt guidance.",
    },
    rule_ids: [],
    provenance: {
      canonical_source_urls: [],
      related_guide_urls: [],
      starter_source_urls: [],
      source_urls: [],
      guidance_signals: [],
      project_conventions_contract: "project_conventions_v1",
    },
    ...overrides,
  };
}

function buildMigrateWorkflowContract(
  overrides: Partial<MigrateToSaltWorkflowContract> = {},
): MigrateToSaltWorkflowContract {
  return {
    confidence: {
      level: "high",
      reasons: ["Fixture confidence is sufficient for migrate contract tests."],
      ask_before_proceeding: false,
      raise_confidence: [],
    },
    ide_summary: buildMigrateIdeSummary(),
    readiness: {
      status: "starter_validated",
      implementation_ready: true,
      reason: "Starter code validated.",
    },
    context_requirement: {
      status: "context_checked",
      repo_specific_edits_ready: true,
      reason: "Context is ready.",
      satisfied_by: "salt-ds info",
      resolution_status: "resolved",
      retry_with: {
        root_dir: "/repo",
        context_id: "repo-context",
      },
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
      suggested_follow_up_cli: "salt-ds info --json",
      next_step: "Continue with canonical Salt guidance.",
    },
    rule_ids: [],
    post_migration_verification: {
      source_checks: [],
      runtime_checks: [],
      preserve_checks: [],
      confirmation_checks: [],
      suggested_workflow: "review_salt_ui",
      suggested_command: "salt-ds review <changed-path>",
    },
    visual_evidence_contract: {
      role: "supporting-evidence",
      not_canonical_source_of_truth: true,
      supported_inputs: [],
      interpretation_owner: "agent-or-adapter",
      normalization_required: true,
      normalization_contract: "migrate_visual_evidence_v1",
      structured_outputs: [],
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
      visual_input_sources: [],
      runtime_capture: {
        supported_via_cli: true,
        command: "salt-ds migrate --url <url>",
        purpose: "Capture supporting runtime evidence when needed.",
      },
      confidence_impact: {
        level: "none",
        reasons: [],
      },
    },
    provenance: {
      canonical_source_urls: [],
      related_guide_urls: [],
      starter_source_urls: [],
      source_urls: [],
      guidance_signals: [],
      project_conventions_contract: "project_conventions_v1",
    },
    ...overrides,
  };
}

function buildUpgradeWorkflowContract(
  overrides: Partial<UpgradeSaltUiWorkflowContract> = {},
): UpgradeSaltUiWorkflowContract {
  return {
    confidence: {
      level: "high",
      reasons: ["Fixture confidence is sufficient for upgrade contract tests."],
      ask_before_proceeding: false,
      raise_confidence: [],
    },
    ide_summary: buildUpgradeIdeSummary(),
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
      suggested_follow_up_cli: "salt-ds info --json",
      next_step: "Continue with canonical Salt guidance.",
    },
    rule_ids: [],
    provenance: {
      canonical_source_urls: [],
      related_guide_urls: [],
      starter_source_urls: [],
      source_urls: [],
      guidance_signals: [],
      project_conventions_contract: "project_conventions_v1",
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
        transport: "mcp",
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
    expect(contract.next_required_action).toEqual(
      expect.objectContaining({
        mcp: {
          tool: "create_salt_ui",
          args: {
            query: "Metric",
          },
        },
      }),
    );
    expect(contract.next_required_action).not.toHaveProperty("cli");
    expect(contract.recipe.steps[0]?.action).toEqual(
      expect.objectContaining({
        mcp: {
          tool: "create_salt_ui",
          args: {
            query: "Metric",
          },
        },
      }),
    );
    expect(contract.recipe.steps[0]?.action).not.toHaveProperty("cli");
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
          },
        },
        summary: "This contract is invalid.",
      }),
    ).toThrow(/Invalid PublicContract/);
  });

  it("sets required_post_step to the shared review workflow regardless of transport", () => {
    const contract = buildPublicContract(
      buildInput({
        transport_used: "cli",
      }),
    );

    expect(contract.action.post_action).toEqual({
      kind: "review",
      tool: "review_salt_ui",
      mcp: {
        tool: "review_salt_ui",
        args: {},
      },
    });
    expect(contract.action.post_action).not.toHaveProperty("cli");
  });

  it("does not set required_post_step when workflow is review", () => {
    const contract = buildPublicContract(
      buildInput({
        workflow: "review",
        next_step: {
          kind: "implement",
          scope: "exact_request",
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
        },
      },
    });

    expect(errors).toContain(
      "action.post_action must only appear when action.kind=implement",
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
      transport_used: "mcp",
      registry,
      query: "Metric",
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
        },
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
      transport_used: "mcp",
      registry,
      query: "dashboard summary area",
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
          kind: "retrieve_entity",
          tool: "get_salt_entity",
          args: {
            name: "Analytical dashboard",
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
      ide_summary: buildCreateIdeSummary({
        recommended_direction: "Use App header.",
      }),
    });

    const compact = buildCreatePublicContract(result, contract, {
      transport_used: "mcp",
      registry,
      query: "Header block",
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
      transport_used: "mcp",
      registry,
      query: "Header block",
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
      transport_used: "mcp",
      registry,
      query:
        "chart of data visualization component for dashboard analytical body",
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
          kind: "retrieve_entity",
          tool: "get_salt_entity",
          args: {
            name: "Chart",
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
      transport_used: "mcp",
      registry,
      query: "Hotkeys",
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
      transport_used: "mcp",
      registry,
      query: "Metric",
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

  it("derives create contract output from the shared create workflow contract", () => {
    const result = {
      decision: {
        name: "Analytical dashboard",
        why: "The request describes a dashboard workflow with summary metrics.",
      },
      next_step: "Follow up on App header.",
    } as unknown as CreateSaltUiResult;
    const contract = buildCreateWorkflowContract({
      readiness: {
        status: "starter_needs_attention",
        implementation_ready: false,
        reason: "Starter code still needs attention.",
      },
      implementation_gate: buildCreateImplementationGate({
        status: "follow_through_required",
        reason: "More grounding is required.",
        required_follow_through: [
          { region: "header", entity: "App header" },
          { region: "key-metrics", entity: "Metric" },
        ],
        next_step: "Run targeted Salt create follow-up.",
      }),
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
      ide_summary: buildCreateIdeSummary({
        recommended_direction: "Use Analytical dashboard.",
      }),
    });

    const compact = buildCreatePublicContract(result, contract, {
      transport_used: "mcp",
    });

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
          kind: "retrieve_entity",
          tool: "get_salt_entity",
          args: {
            name: "App header",
          },
        },
      }),
    );
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
      source_urls: [],
    } as unknown as ReviewSaltUiResult;
    const contract = buildReviewWorkflowContract({
      decision: result.decision,
      ide_summary: buildReviewIdeSummary({
        verdict: {
          level: "medium_risk",
          summary: "Issues remain.",
        },
        safest_next_fix: "Replace the incorrect component usage.",
      }),
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
    });

    const compact = buildReviewPublicContract(result, contract, {
      transport_used: "mcp",
    });

    expect(toComparablePublicContract(compact)).toEqual(
      expect.objectContaining({
        workflow: "review",
        workflow_status: "blocked",
        safe_to_implement_exact_request: false,
        blocking_reasons: expect.arrayContaining([
          "Replace the current element with the canonical Salt primitive.",
        ]),
      }),
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
        guidance_signals: [],
        project_conventions_contract: "project_conventions_v1",
      },
    });

    const compact = buildReviewPublicContract(result, contract, {
      transport_used: "cli",
    });

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
        guidance_signals: [],
        project_conventions_contract: "project_conventions_v1",
      },
    });

    const compact = buildReviewPublicContract(result, contract, {
      transport_used: "cli",
      registry,
    });
    const mcpCompact = buildReviewPublicContract(result, contract, {
      transport_used: "mcp",
      registry,
    });

    expect(toComparablePublicContract(compact)).toEqual(
      expect.objectContaining({
        workflow: "review",
        workflow_status: "partial",
        canonical_complete: false,
        safe_to_implement_exact_request: false,
        next_step: expect.objectContaining({
          kind: "review",
          tool: "review_salt_ui",
        }),
      }),
    );
    expect(compact.evidence).toEqual(
      expect.objectContaining({
        status: "partial",
        missing: expect.arrayContaining([
          expect.stringContaining("missing_structural_role_rule_evidence"),
        ]),
      }),
    );
    expect(mcpCompact.evidence).toEqual(compact.evidence);
    expect(mcpCompact.safety).toEqual(compact.safety);
    expect({
      ...toComparablePublicContract(mcpCompact),
      transport: "cli",
    }).toEqual(toComparablePublicContract(compact));
  });

  it("treats create ask_user as a stop for updated workflow input, not an evidence bridge", () => {
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
        status: "follow_through_required",
        reason: "Clarification is required.",
        blocking_questions: [
          "Should tabs switch in-page content or navigate between pages?",
        ],
      }),
    });

    const compact = buildCreatePublicContract(result, contract, {
      transport_used: "mcp",
      registry,
      query: "profile page with tabs",
    });
    const askStep = compact.recipe.steps.find(
      (step) => step.id === "ask-user-1",
    );

    expect(compact.next_required_action).toEqual(
      expect.objectContaining({
        kind: "ask_user",
      }),
    );
    expect(compact.allowed_next_actions).not.toContain("rerun_workflow");
    expect(askStep?.reason).toContain(
      "Treat the user's answer as new or updated workflow input",
    );
    expect(askStep?.reason).toContain(
      "do not rerun the original workflow unchanged",
    );
    expect(askStep?.reason).not.toContain(
      "rerun the original create workflow with the user's answer",
    );
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
        status: "follow_through_required",
        reason: "More grounding is required.",
        required_follow_through: [
          { region: "breadcrumbs", entity: "Breadcrumbs" },
        ],
        next_step: "Run targeted Salt create follow-up.",
      }),
      ide_summary: buildCreateIdeSummary({
        recommended_direction: "Use Table.",
      }),
    });

    const compact = buildCreatePublicContract(result, contract, {
      transport_used: "mcp",
      registry,
      query: "file manager with breadcrumbs and table",
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
          kind: "retrieve_entity",
          tool: "get_salt_entity",
          args: {
            name: "Breadcrumbs",
          },
        },
      }),
    );
    expect(compact.next_required_action).toEqual(
      expect.objectContaining({
        mcp: {
          tool: "get_salt_entity",
          args: {
            name: "Breadcrumbs",
          },
        },
      }),
    );
    expect(compact.next_required_action).not.toHaveProperty("cli");
    expect(compact.allowed_next_actions).toEqual(
      expect.arrayContaining(["retrieve_entity", "rerun_workflow"]),
    );
    expect(compact.recipe.steps).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "rerun-originating-create-workflow",
          action: expect.objectContaining({
            kind: "rerun_workflow",
            mcp: {
              tool: "create_salt_ui",
              args: {
                query: "file manager with breadcrumbs and table",
                resolved_entities: ["Breadcrumbs"],
              },
            },
          }),
          status: "required",
        }),
      ]),
    );
  });

  it("derives migrate contract output from the shared migrate workflow contract", () => {
    const result = {
      translations: [{}],
      migration_plan: ["Start with the main shell."],
      clarifying_questions: ["Should the table use Data grid or Table?"],
    } as unknown as MigrateToSaltResult;
    const contract = buildMigrateWorkflowContract({
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
        resolution_status: "needs_explicit_root",
        retry_with: {
          root_dir: "/repo",
          context_id: null,
        },
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
    });

    const compact = buildMigratePublicContract(
      result as unknown as never,
      contract,
      {
        transport_used: "mcp",
      },
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
      {
        transport_used: "cli",
      },
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
      {
        transport_used: "mcp",
      },
    );

    expect(compact.questions).toEqual([]);
    expect(compact.safety.blocking_reasons).not.toContain(
      "Which approved repo wrapper or shell should this use?",
    );
    expect(compact.next_required_action.kind).not.toBe("ask_user");
  });

  it("derives upgrade contract output from the shared upgrade workflow contract", () => {
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
    } as unknown as UpgradeSaltUiResult;
    const contract = buildUpgradeWorkflowContract({
      ide_summary: buildUpgradeIdeSummary({
        target: "@salt-ds/core",
        from_version: "1.0.0",
        to_version: "2.0.0",
      }),
    });

    const compact = buildUpgradePublicContract(
      result as unknown as never,
      contract,
      {
        transport_used: "mcp",
      },
    );

    expect(toComparablePublicContract(compact)).toEqual(
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

  it("keeps upgrade contracts blocked with a reason when non-breaking upgrade guidance remains", () => {
    const result = {
      decision: {
        target: "@salt-ds/core",
        from_version: "1.0.0",
        to_version: "2.0.0",
        why: "Fixture upgrade guidance is available.",
      },
      important: ["Review fixture upgrade guidance before editing."],
    } as unknown as UpgradeSaltUiResult;
    const contract = buildUpgradeWorkflowContract({
      ide_summary: buildUpgradeIdeSummary({
        target: "@salt-ds/core",
        from_version: "1.0.0",
        to_version: "2.0.0",
      }),
    });

    const compact = buildUpgradePublicContract(
      result as unknown as never,
      contract,
      {
        transport_used: "mcp",
      },
    );

    expect(toComparablePublicContract(compact)).toEqual(
      expect.objectContaining({
        workflow: "upgrade",
        workflow_status: "blocked",
        safe_to_implement_exact_request: false,
        blocking_reasons: expect.arrayContaining([
          "Review fixture upgrade guidance before editing.",
        ]),
      }),
    );
  });
});
