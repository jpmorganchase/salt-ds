import { describe, expect, it } from "vitest";
import {
  buildSaltCapabilityManifest,
  SALT_NON_IMPLEMENTABLE_WORKFLOW_STATUSES,
  SALT_PUBLIC_ACTION_KINDS,
} from "../capabilityManifest.js";

function buildTestManifest() {
  return buildSaltCapabilityManifest({
    transport: "cli",
    runtime: {
      package_name: "@salt-ds/cli",
      package_version: "0.0.0",
      server_name: null,
      command_name: "salt-ds",
    },
    registry: {
      available: true,
      version: "0.1.0",
      generated_at: "2026-04-20T00:00:00Z",
    },
    contracts: {
      setup_contract_ids: ["info", "init"],
    },
    public_surface: {
      default_surface_ids: ["info", "init", "create", "review"],
      advanced_output_ids: ["full"],
    },
    support_surface: {
      retrieval_catalog: {
        available: true,
        access: ["info"],
      },
    },
    capabilities: {
      repo_context: true,
      repo_bootstrap: true,
      starter_code: true,
      exact_request_safety: true,
      deterministic_next_step: true,
      review_runtime_url: true,
      starter_only_create_artifact: true,
      visual_input: {
        source_outline: true,
        runtime_capture: true,
        image_or_mockup_inputs: true,
        normalized_adapter_contract: "migrate_visual_evidence_v1",
      },
      handoff: {
        portable_bundle: false,
      },
    },
  });
}

describe("Salt capability manifest", () => {
  it("publishes host-obeyable v1 workflow action semantics", () => {
    const manifest = buildTestManifest();
    const actionContract = manifest.contracts.workflow_action_contract;

    expect(manifest.offline_catalog).toEqual({
      available: true,
      version: "0.1.0",
      generated_at: "2026-04-20T00:00:00Z",
    });
    expect(actionContract.authoritative_fields).toEqual(
      expect.arrayContaining([
        "status",
        "safety.exact_request_safe",
        "action.kind",
        "next_required_action",
        "next_required_action.mcp",
        "allowed_next_actions",
        "recipe.steps",
        "recipe.steps.action.mcp",
        "questions",
        "evidence.status",
        "evidence.source_urls",
        "evidence.input_context",
      ]),
    );
    expect(actionContract.implementation_gate.required).toEqual({
      status: "success",
      "safety.exact_request_safe": true,
      "action.kind": "implement",
      "evidence.status": "complete",
      "action.post_action.kind": "review",
    });
    expect(
      actionContract.implementation_gate.non_implementable_statuses,
    ).toEqual([...SALT_NON_IMPLEMENTABLE_WORKFLOW_STATUSES]);

    const semanticsByKind = new Map(
      actionContract.action_semantics.map((entry) => [entry.kind, entry]),
    );
    expect([...semanticsByKind.keys()].sort()).toEqual(
      [...SALT_PUBLIC_ACTION_KINDS].sort(),
    );
    expect(semanticsByKind.get("implement")).toEqual(
      expect.objectContaining({
        host_obligation: "implement_exact_request",
        implementation_allowed: true,
        blocks_implementation_until_complete: false,
        follow_up_required: "review",
      }),
    );
    expect(semanticsByKind.get("ask_user")).toEqual(
      expect.objectContaining({
        host_obligation: "ask_user_and_stop",
        implementation_allowed: false,
        blocks_implementation_until_complete: true,
        follow_up_required: "updated_user_input",
      }),
    );
    expect(semanticsByKind.get("retrieve_entity")).toEqual(
      expect.objectContaining({
        host_obligation: "retrieve_entity_evidence",
        implementation_allowed: false,
        blocks_implementation_until_complete: true,
        follow_up_required: "rerun_originating_workflow",
      }),
    );
    expect(semanticsByKind.get("install_dependencies")).toEqual(
      expect.objectContaining({
        host_obligation: "install_packages_then_rerun",
        implementation_allowed: false,
        blocks_implementation_until_complete: true,
        follow_up_required: "rerun_originating_workflow",
      }),
    );
    expect(semanticsByKind.get("rerun_workflow")).toEqual(
      expect.objectContaining({
        host_obligation: "rerun_originating_workflow",
        implementation_allowed: false,
        blocks_implementation_until_complete: true,
      }),
    );
  });

  it("documents evidence and composite recipe requirements as data", () => {
    const manifest = buildTestManifest();
    const actionContract = manifest.contracts.workflow_action_contract;

    expect(actionContract.evidence_contract).toEqual({
      source_backed_kinds: ["docs", "examples", "registry", "project_policy"],
      fallback_kind: "heuristic_fallback",
      source_url_required_for_source_backed_evidence: true,
      success_requires_complete_evidence: true,
      success_requires_source_backed_evidence: true,
    });
    expect(actionContract.recipe_contract).toEqual({
      composite_requests_use_recipe: true,
      recipe_steps_are_authoritative: true,
      unresolved_regions_surface_as_required_actions: true,
      questions_block_implementation: true,
    });
    expect(manifest.resources).toEqual(
      expect.objectContaining({
        context_component_markdown_template_uri: null,
        context_gap_catalog_uri: null,
        context_release_gate_uri: null,
        ai_setup_uri: null,
      }),
    );
  });
});
