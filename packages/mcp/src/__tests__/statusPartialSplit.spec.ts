// `salt_workflow_v1` keeps two distinct incomplete states separate:
//   1. legitimate "user request is partly addressed; more follow-through is
//      needed" (kept as `partial`).
//   2. "the workflow itself could not validate part of its own output because
//      the registry has internal gaps" (now surfaced via a separate top-level
//      `internal_limitations` block, independent of `status`).
//
// This spec covers all four combinations of (status, internal_limitations)
// and asserts the field is always present so hosts can branch on the fields
// without runtime nullish checks.
import { describe, expect, it } from "vitest";
import {
  buildPublicContract,
  type PublicContract,
  type PublicContractInput,
  type PublicEvidenceSummary,
  type PublicInternalLimitations,
  type PublicNextStep,
} from "../core/tools/publicContract.js";

function evidence(
  overrides: Partial<PublicEvidenceSummary> = {},
): PublicEvidenceSummary {
  return {
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
    ...overrides,
  };
}

function implementStep(): PublicNextStep {
  return {
    kind: "implement",
    scope: "exact_request",
  };
}

function retrieveStep(): PublicNextStep {
  return {
    kind: "retrieve_reference",
    tool: "get_salt_reference",
    args: { names: ["Avatar"] },
  };
}

function buildSuccessInput(
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
    next_step: implementStep(),
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
    evidence: evidence(),
    ...overrides,
  };
}

function buildPartialInput(
  overrides: Partial<PublicContractInput> = {},
): PublicContractInput {
  return {
    workflow: "create",
    exact_request: {
      requested_entity: "profile page with tabs and avatar",
      resolved_entity: "Tabs",
      match_status: "broadened",
      exact_match_required: false,
    },
    state: {
      implementation_ready: false,
      required_follow_through: [{ region: "avatar", entity: "Avatar" }],
      blocking_questions: [],
      starter_blockers: [],
      project_policy_blockers: [],
      hard_blocked: false,
      context_ready: true,
      usable_guidance_present: true,
      transport_failed: false,
    },
    summary: "Salt grounded Tabs but Avatar still needs follow-through.",
    next_step: retrieveStep(),
    post_action: {
      kind: "rerun_workflow",
      tool: "create_salt_ui",
      args: {
        query: "profile page with tabs and avatar",
        resolved_entities: ["Tabs", "Avatar"],
      },
    },
    guidance: {
      kind: "create",
      decision: {
        name: "Tabs",
        why: "Use Tabs and retrieve Avatar before implementation.",
        solution_type: "component",
      },
      starter_guidance: {
        plan: ["Ground Avatar, then implement the composed page."],
        snippets: [],
      },
      review_targets: {
        components: ["Tabs", "Avatar"],
        patterns: [],
        composition_contract: null,
        source: "create_report",
      },
    },
    evidence: evidence({
      status: "partial",
      missing: ["follow-through evidence for Avatar"],
    }),
    ...overrides,
  };
}

function expectInternalLimitationsPresent(contract: PublicContract): void {
  // The whole point of task 2.9 is that hosts can branch on the field's
  // presence without runtime nullish checks. The field is mandatory in the
  // shape and the default is the empty object — never undefined.
  expect(Object.hasOwn(contract, "internal_limitations")).toBe(true);
  expect(contract.internal_limitations).toBeDefined();
  expect(typeof contract.internal_limitations.unsupported_claim_count).toBe(
    "number",
  );
  expect(
    Array.isArray(contract.internal_limitations.unsupported_rule_kinds),
  ).toBe(true);
}

describe("salt_workflow_v1 — status × internal_limitations split", () => {
  it("(success, no limitations) — clean run, no registry coverage gap", () => {
    const contract = buildPublicContract(buildSuccessInput());

    expect(contract.status).toBe("success");
    expectInternalLimitationsPresent(contract);
    expect(contract.internal_limitations).toEqual({
      unsupported_claim_count: 0,
      unsupported_rule_kinds: [],
    });
  });

  it("(success, with limitations) — clean run with registry coverage gaps stays success", () => {
    // This is the consumer trace turn 5 case from
    // session-findings-2026-06.md root cause #2: the user asked "does the UI
    // align with Salt standards", the review came back clean, but the
    // generated-artifact validator could not cover some claims because the
    // registry hadn't captured those component/pattern entities yet. Before
    // 2.9 this surfaced as `status: partial`; after 2.9 it is `status:
    // success` with a populated `internal_limitations` block.
    const limitations: PublicInternalLimitations = {
      unsupported_claim_count: 3,
      unsupported_rule_kinds: ["component-prop", "pattern-guidance"],
    };

    const contract = buildPublicContract(
      buildSuccessInput({ internal_limitations: limitations }),
    );

    expect(contract.status).toBe("success");
    expectInternalLimitationsPresent(contract);
    expect(contract.internal_limitations).toEqual({
      unsupported_claim_count: 3,
      // Always sorted/deduped — `normalizeInternalLimitations` invariant.
      unsupported_rule_kinds: ["component-prop", "pattern-guidance"],
    });
  });

  it("(partial, no limitations) — genuine user-facing remaining work, no registry gap", () => {
    const contract = buildPublicContract(buildPartialInput());

    expect(contract.status).toBe("partial");
    expectInternalLimitationsPresent(contract);
    // Hosts that ignore registry coverage gaps still see the field at the
    // empty default — they never have to runtime-check undefined.
    expect(contract.internal_limitations).toEqual({
      unsupported_claim_count: 0,
      unsupported_rule_kinds: [],
    });
  });

  it("(partial, with limitations) — both signals present at once and they don't overlap", () => {
    const limitations: PublicInternalLimitations = {
      unsupported_claim_count: 1,
      unsupported_rule_kinds: ["pattern-guidance"],
    };

    const contract = buildPublicContract(
      buildPartialInput({ internal_limitations: limitations }),
    );

    expect(contract.status).toBe("partial");
    expectInternalLimitationsPresent(contract);
    expect(contract.internal_limitations).toEqual({
      unsupported_claim_count: 1,
      unsupported_rule_kinds: ["pattern-guidance"],
    });
  });

  it("normalizes input — dedupes and sorts unsupported_rule_kinds, clamps negative counts", () => {
    const contract = buildPublicContract(
      buildSuccessInput({
        internal_limitations: {
          unsupported_claim_count: -2 as unknown as number,
          unsupported_rule_kinds: [
            "pattern-guidance",
            "component-prop",
            "pattern-guidance",
            "  ",
            "" as unknown as string,
          ],
        },
      }),
    );

    expect(contract.internal_limitations.unsupported_claim_count).toBe(0);
    expect(contract.internal_limitations.unsupported_rule_kinds).toEqual([
      "component-prop",
      "pattern-guidance",
    ]);
  });
});
