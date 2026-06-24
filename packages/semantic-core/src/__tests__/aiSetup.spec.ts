import { describe, expect, it } from "vitest";
import { buildSaltAiSetupSummary } from "../aiSetup.js";
import type { SaltGeneratedContextHealth } from "../contextChecks.js";
import { validateSaltAiSetupSchema } from "./aiSetupSchemaTestUtils.js";

// AI setup tests use fixture-only setup state, not production Salt component,
// prop, token, import, example, status, or accessibility facts.
function buildFixtureGeneratedContext(
  overrides: Partial<SaltGeneratedContextHealth> = {},
): SaltGeneratedContextHealth {
  return {
    contract: "salt_generated_context_health_v1",
    present: true,
    status: "current",
    manifestPath: ".salt/context/manifest.json",
    registry: {
      version: "fixture-registry",
      hash: "fixture-hash",
      generated_at: "2026-04-30T00:00:00.000Z",
      current_version: "fixture-registry",
      current_hash: "fixture-hash",
      current_generated_at: "2026-04-30T00:00:00.000Z",
    },
    entryCount: 1,
    unsupportedEntries: 0,
    unsupportedCoverageGaps: 0,
    staleEntries: 0,
    missingOutputs: [],
    coverageGaps: [],
    recommendedAction: "none",
    entries: [],
    ...overrides,
  };
}

describe("Salt AI setup summary", () => {
  it("serializes ready fixture setup without Salt facts", () => {
    const summary = buildSaltAiSetupSummary({
      root_dir: "/fixture/repo",
      policy_mode: "team",
      repo_instructions_path: "AGENTS.md",
      host_adapters: ["vscode"],
      ui_verify_command: "npm run ui:verify",
      generated_context: buildFixtureGeneratedContext(),
      include_release_gate: true,
    });

    expect(validateSaltAiSetupSchema(summary)).toEqual([]);
    expect(summary).toEqual(
      expect.objectContaining({
        contract: "salt_ai_setup_v1",
        status: "ready",
        next_command:
          'create_salt_ui via the @salt-ds/mcp server (args: { query: "describe the Salt UI task" })',
        compatibility: expect.objectContaining({
          status: "compatible",
          checks: expect.arrayContaining([
            expect.objectContaining({
              id: "generated-context",
              status: "compatible",
              evidence_source: "generated_context",
            }),
            expect.objectContaining({
              id: "release-gate",
              status: "compatible",
              evidence_source: "generated_context",
            }),
          ]),
        }),
        steps: expect.arrayContaining([
          expect.objectContaining({
            id: "generated-context",
            status: "current",
            evidence_source: "generated_context",
          }),
          expect.objectContaining({
            id: "release-gate",
            status: "current",
          }),
        ]),
      }),
    );
  });

  it("degrades fixture setup when generated context has explicit gaps", () => {
    const summary = buildSaltAiSetupSummary({
      root_dir: "/fixture/repo",
      policy_mode: "team",
      repo_instructions_path: "AGENTS.md",
      host_adapters: ["vscode"],
      ui_verify_command: "npm run ui:verify",
      generated_context: buildFixtureGeneratedContext({
        status: "unsupported",
        coverageGaps: [
          {
            kind: "prompt",
            id: "fixture-prompt-gap",
            status: "unsupported",
            reason: "Fixture prompt serializer evidence is missing.",
            missing: ["fixture prompt serializer evidence"],
            evidence_ref_ids: [],
          },
        ],
        unsupportedCoverageGaps: 1,
        recommendedAction: "export-context-check",
      }),
      include_release_gate: true,
    });

    expect(validateSaltAiSetupSchema(summary)).toEqual([]);
    expect(summary).toEqual(
      expect.objectContaining({
        status: "degraded",
        next_command: "salt-ds export-context . --manifest --check --json",
        compatibility: expect.objectContaining({
          status: "degraded",
          checks: expect.arrayContaining([
            expect.objectContaining({
              id: "generated-context",
              status: "unsupported",
              evidence_source: "generated_context",
              missing: [
                "fixture prompt serializer evidence",
                "export-context-check",
              ],
            }),
            expect.objectContaining({
              id: "release-gate",
              status: "degraded",
              evidence_source: "generated_context",
              missing: ["current generated context manifest"],
            }),
          ]),
        }),
        steps: expect.arrayContaining([
          expect.objectContaining({
            id: "generated-context",
            status: "unsupported",
            missing: [
              "fixture prompt serializer evidence",
              "export-context-check",
            ],
          }),
        ]),
      }),
    );
  });
});
