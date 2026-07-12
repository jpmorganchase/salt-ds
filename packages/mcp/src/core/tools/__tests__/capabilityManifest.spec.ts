import { describe, expect, it } from "vitest";
import {
  buildSaltCapabilityManifest,
  SALT_NON_IMPLEMENTABLE_WORKFLOW_STATUSES,
  SALT_PUBLIC_ACTION_KINDS,
} from "../capabilityManifest.js";

function buildTestManifest(
  resources?: Parameters<typeof buildSaltCapabilityManifest>[0]["resources"],
) {
  return buildSaltCapabilityManifest({
    transport: "mcp",
    runtime: {
      package_name: "@salt-ds/mcp",
      package_version: "0.0.0",
      server_name: "salt-mcp",
      command_name: "salt-mcp",
    },
    registry: {
      available: true,
      version: "0.1.0",
      generated_at: "2026-04-20T00:00:00Z",
    },
    contracts: {
      setup_contract_ids: ["get_salt_project_context"],
    },
    public_surface: {
      default_surface_ids: [
        "get_salt_project_context",
        "get_salt_reference",
        "migrate_to_salt",
        "create_salt_ui",
        "review_salt_ui",
      ],
      advanced_output_ids: [],
    },
    support_surface: {
      retrieval_catalog: {
        available: true,
        access: ["resource"],
      },
    },
    capabilities: {
      repo_context: true,
      repo_bootstrap: false,
      starter_code: true,
      exact_request_safety: true,
      deterministic_next_step: true,
      review_runtime_url: false,
      starter_only_create_artifact: false,
      visual_input: {
        source_outline: true,
        runtime_capture: false,
        image_or_mockup_inputs: false,
        normalized_adapter_contract: null,
      },
      handoff: {
        portable_bundle: false,
      },
    },
    resources,
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
    expect(manifest.contracts.contract_lifecycle).toEqual({
      contract: "salt_workflow_v1",
      semver: "1.0.0",
      changelog: [
        {
          semver: "1.0.0",
          summary: "Initial public salt_workflow_v1 contract.",
        },
      ],
    });
    expect(actionContract.authoritative_fields).toEqual(
      expect.arrayContaining([
        "status",
        "safety.exact_request_safe",
        "action.kind",
        "action.tool",
        "action.args",
        "action.post_action",
        "action.post_action.kind",
        "action.post_action.tool",
        "action.post_action.args",
        "action.post_action.required_input",
        "guidance",
        "guidance.kind",
        "guidance.decision",
        "guidance.starter_guidance",
        "guidance.findings",
        "guidance.fixes",
        "guidance.translations",
        "guidance.migration_plan",
        "guidance.post_migration_verification",
        "questions",
        "evidence.status",
        "evidence.source_urls",
        "evidence.input_context",
      ]),
    );
    expect(actionContract.authoritative_fields).not.toEqual(
      expect.arrayContaining(["action.mcp", "action.post_action.mcp"]),
    );
    expect(actionContract.authoritative_fields).not.toContain(
      "action.post_action.answer_binding",
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
    expect(actionContract.implementation_gate.review_fix_exception).toEqual({
      status: "partial",
      "action.kind": "apply_fixes",
      "evidence.status": "complete",
      mutation_authorization: "host_or_user_required",
      "action.post_action.kind": "review",
    });
    expect(actionContract.continuation_contract).toEqual({
      field: "action.post_action",
      max_depth: 1,
      create_rerun_kind: "rerun_workflow",
      create_rerun_action_kinds: ["retrieve_reference"],
      review_required_input: "complete_updated_file",
      ask_user_post_action: null,
    });

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
    expect(semanticsByKind.get("apply_fixes")).toEqual(
      expect.objectContaining({
        host_obligation: "apply_grounded_fixes",
        implementation_allowed: true,
        blocks_implementation_until_complete: false,
        mutation_authorization: "host_or_user_required",
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
    expect(semanticsByKind.get("retrieve_reference")).toEqual(
      expect.objectContaining({
        host_obligation: "retrieve_reference_evidence",
        implementation_allowed: false,
        blocks_implementation_until_complete: true,
        follow_up_required: "rerun_originating_workflow",
      }),
    );
  });

  it("documents evidence requirements without a duplicate recipe contract", () => {
    const manifest = buildTestManifest();
    const actionContract = manifest.contracts.workflow_action_contract;

    expect(actionContract.evidence_contract).toEqual({
      source_backed_kinds: ["docs", "examples", "registry", "project_policy"],
      fallback_kind: "heuristic_fallback",
      source_url_required_for_source_backed_evidence: true,
      success_requires_complete_evidence: true,
      success_requires_source_backed_evidence: true,
    });
    expect(actionContract).not.toHaveProperty("recipe_contract");
    expect(manifest.resources).toEqual({});
  });

  it("emits only resources that are actually available", () => {
    const manifest = buildTestManifest({
      capability_manifest_uri: "salt://capabilities/manifest",
      catalog_manifest_uri: "salt://catalog/manifest",
      catalog_entity_template_uri: "",
    });

    expect(manifest.resources).toEqual({
      capability_manifest_uri: "salt://capabilities/manifest",
      catalog_manifest_uri: "salt://catalog/manifest",
    });
  });
});
