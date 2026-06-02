import { describe, expect, it } from "vitest";
import {
  buildSaltAiEvidenceClosureReport,
  SALT_AI_EVIDENCE_CLOSURE_REPORT_CONTRACT,
} from "../aiEvidenceClosureReport.js";
import type { SaltRegistry } from "../types.js";
import { validateSaltAiEvidenceClosureReportSchema } from "./aiEvidenceClosureReportSchemaTestUtils.js";

const GENERATED_AT = "2026-04-30T00:00:00.000Z";

function buildFixtureRegistry(): SaltRegistry {
  return {
    generated_at: GENERATED_AT,
    version: "fixture-registry",
    build_info: null,
    packages: [],
    components: [],
    icons: [],
    country_symbols: [],
    pages: [],
    patterns: [],
    guides: [],
    tokens: [],
    deprecations: [],
    examples: [],
    changes: [],
    search_index: [],
    token_policy_structural_role_rule_pack: null,
    pattern_validation_rule_pack: null,
  };
}

describe("AI evidence closure report", () => {
  it("serializes final-pass closure slices without generated Salt claims", () => {
    const report = buildSaltAiEvidenceClosureReport({
      registry: buildFixtureRegistry(),
      generated_at: GENERATED_AT,
      generator: {
        name: "semantic-core closure fixture",
      },
    });

    expect(validateSaltAiEvidenceClosureReportSchema(report)).toEqual([]);
    expect(report).toEqual(
      expect.objectContaining({
        contract: SALT_AI_EVIDENCE_CLOSURE_REPORT_CONTRACT,
        status: "degraded",
        evidence_refs: [],
        release_gate: expect.objectContaining({
          status: "blocked",
          releasable: false,
        }),
        generated_artifact: expect.objectContaining({
          artifact_kind: "validation-report",
          claims: [],
          evidence_refs: [],
        }),
      }),
    );
    expect(report.slices).toHaveLength(10);
    expect(report.slices.map((slice) => slice.id)).toEqual([
      "unsupported-surface-inventory",
      "schema-contract-lock",
      "migration-upgrade-followup",
      "prompt-host-instruction-closure",
      "context-coverage-closure",
      "release-gate-everywhere",
      "cli-mcp-skill-parity",
      "hardcoded-fact-sweep",
      "doctor-info-setup-state",
      "final-verification",
    ]);
    expect(
      report.slices.find(
        (slice) => slice.id === "prompt-host-instruction-closure",
      ),
    ).toEqual(
      expect.objectContaining({
        status: "ready",
        missing: [],
        docs_registry_gaps: [],
        evidence_sources: expect.arrayContaining(["test_guardrail"]),
      }),
    );
    expect(
      report.slices.find((slice) => slice.id === "migration-upgrade-followup"),
    ).toEqual(
      expect.objectContaining({
        status: "degraded",
        evidence_sources: expect.arrayContaining(["workflow_report"]),
      }),
    );
  });

  it("fails when the closure shell smuggles a fixture Salt claim", () => {
    const report = buildSaltAiEvidenceClosureReport({
      registry: buildFixtureRegistry(),
      generated_at: GENERATED_AT,
      generator: {
        name: "semantic-core closure fixture",
      },
    });

    expect(
      validateSaltAiEvidenceClosureReportSchema({
        ...report,
        generated_artifact: {
          ...report.generated_artifact,
          claims: [
            {
              id: "fixture-component-status",
              kind: "status",
              text: "Fixture component status without evidence.",
              field_path: "fixture.status",
              evidence_ref_ids: [],
            },
          ],
        },
      }),
    ).toEqual(
      expect.arrayContaining([
        expect.stringContaining("must NOT have fewer than 1 items"),
      ]),
    );
  });
});
