import { describe, expect, it } from "vitest";
import {
  SALT_CONTEXT_COVERAGE_AUDIT_CONTRACT,
  type SaltContextCoverageAudit,
} from "../contextCoverageAudit.js";
import {
  buildContextCoverageGapCatalog,
  formatContextCoverageGapCatalogMarkdown,
  SALT_CONTEXT_COVERAGE_GAP_CATALOG_CONTRACT,
} from "../contextCoverageGapCatalog.js";
import { validateSaltContextCoverageGapCatalogSchema } from "./contextCoverageGapCatalogSchemaTestUtils.js";

// All Salt-looking strings in this file are intentionally tiny fixture facts.
const GENERATED_AT = "2026-05-05T00:00:00.000Z";

function buildFixtureAudit(): SaltContextCoverageAudit {
  return {
    contract: SALT_CONTEXT_COVERAGE_AUDIT_CONTRACT,
    generated_at: GENERATED_AT,
    generator: {
      name: "fixture context coverage audit",
      version: "0.0.0",
    },
    registry: {
      version: "fixture-registry",
      hash: "fixture-hash",
      generated_at: GENERATED_AT,
    },
    status: "unsupported",
    component_contexts: {
      total_records: 1,
      selected_records: 1,
      validated_contexts: 1,
      unsupported_contexts: 0,
      source_gap_count: 1,
      unsupported_records: [],
    },
    pattern_contexts: {
      total_records: 1,
      selected_records: 1,
      validated_contexts: 0,
      unsupported_contexts: 1,
      source_gap_count: 0,
      unsupported_records: [
        {
          id: "pattern.fixture-flow",
          name: "Fixture flow",
          status: "unsupported",
          missing: ["fixture field"],
          unsupported_claim_count: 1,
          validation_issue_count: 0,
          evidence_ref_ids: [],
        },
      ],
    },
    foundation_contexts: {
      total_records: 1,
      selected_records: 1,
      validated_contexts: 1,
      unsupported_contexts: 0,
      source_gap_count: 1,
      unsupported_records: [],
    },
    docs_registry_gaps: [
      {
        kind: "component",
        id: "component.fixture-action",
        name: "Fixture action",
        status: "unsupported",
        reason:
          "Component context omitted optional fields because registry or source-backed evidence is missing.",
        missing: ["fixture accessibility guidance"],
        evidence_ref_ids: ["fixture-component-gap.ref"],
        records: [],
      },
      {
        kind: "pattern",
        id: "pattern.fixture-flow",
        name: "Fixture flow",
        status: "unsupported",
        reason: "Selected pattern context did not pass the evidence surface gate.",
        missing: ["pattern context has 1 unsupported claim(s)"],
        evidence_ref_ids: ["fixture-pattern-gap.ref"],
        records: [
          {
            kind: "pattern",
            id: "pattern.fixture-flow.when_to_use.unsupported",
            name: "Fixture flow when_to_use",
            status: "unsupported",
            reason_code: "evidence_surface_gate_failed",
            reason: "Registry pattern when_to_use guidance is empty.",
            missing: ["when_to_use"],
            evidence_ref_ids: ["fixture-pattern-gap-record.ref"],
          },
        ],
      },
      {
        kind: "foundation",
        id: "tokens.fixture",
        name: "fixture",
        status: "unsupported",
        reason:
          "Token category has registry tokens missing policy docs or source-backed token policy evidence for generated context.",
        missing: ["token policy docs or source-backed policy evidence"],
        evidence_ref_ids: [],
        records: [
          {
            kind: "token",
            id: "--fixture-token",
            name: "--fixture-token",
            status: "unsupported",
            reason_code: "missing_token_policy",
            reason:
              "Registry token is missing a source-backed policy record for generated context.",
            missing: ["token policy"],
            evidence_ref_ids: [],
          },
        ],
      },
    ],
  };
}

describe("context coverage gap catalog", () => {
  it("normalizes audit gaps into cause-coded catalog entries", () => {
    const catalog = buildContextCoverageGapCatalog({
      audit: buildFixtureAudit(),
      generated_at: GENERATED_AT,
    });

    expect(validateSaltContextCoverageGapCatalogSchema(catalog)).toEqual([]);
    expect(catalog).toEqual(
      expect.objectContaining({
        contract: SALT_CONTEXT_COVERAGE_GAP_CATALOG_CONTRACT,
        generated_at: GENERATED_AT,
        counts: {
          total: 3,
          component: 1,
          pattern: 1,
          foundation: 1,
        },
      }),
    );
    expect(catalog.gaps).toEqual([
      expect.objectContaining({
        kind: "component",
        cause_codes: ["missing_optional_evidence"],
        evidence_ref_ids: ["fixture-component-gap.ref"],
        resolution: "add_source_backed_docs_or_registry_evidence",
      }),
      expect.objectContaining({
        kind: "pattern",
        cause_codes: ["evidence_surface_gate_failed"],
        evidence_ref_ids: ["fixture-pattern-gap.ref"],
        resolution: "keep_unsupported_until_source_evidence_exists",
        records: [
          expect.objectContaining({
            cause_code: "evidence_surface_gate_failed",
            evidence_ref_ids: ["fixture-pattern-gap-record.ref"],
            missing: ["when_to_use"],
          }),
        ],
      }),
      expect.objectContaining({
        kind: "foundation",
        cause_codes: ["missing_token_policy"],
        records: [
          expect.objectContaining({
            id: "--fixture-token",
            cause_code: "missing_token_policy",
          }),
        ],
      }),
    ]);
  });

  it("schema rejects gaps without an explicit cause trail", () => {
    const catalog = buildContextCoverageGapCatalog({
      audit: buildFixtureAudit(),
      generated_at: GENERATED_AT,
    });
    const [firstGap] = catalog.gaps;

    expect(
      validateSaltContextCoverageGapCatalogSchema({
        ...catalog,
        gaps: [
          {
            ...firstGap,
            cause: "",
            cause_codes: [],
          },
        ],
      }),
    ).toEqual(
      expect.arrayContaining([
        expect.stringContaining("/gaps/0/cause"),
        expect.stringContaining("/gaps/0/cause_codes"),
      ]),
    );
  });

  it("schema rejects gaps and records without explicit EvidenceRef fields", () => {
    const catalog = buildContextCoverageGapCatalog({
      audit: buildFixtureAudit(),
      generated_at: GENERATED_AT,
    });
    const gapWithoutEvidenceRefs = { ...catalog.gaps[0] } as Record<
      string,
      unknown
    >;
    delete gapWithoutEvidenceRefs.evidence_ref_ids;
    const recordWithoutEvidenceRefs = {
      ...(catalog.gaps[1]?.records[0] ?? {}),
    } as Record<string, unknown>;
    delete recordWithoutEvidenceRefs.evidence_ref_ids;

    expect(
      validateSaltContextCoverageGapCatalogSchema({
        ...catalog,
        gaps: [
          gapWithoutEvidenceRefs,
          {
            ...catalog.gaps[1],
            records: [recordWithoutEvidenceRefs],
          },
        ],
      }),
    ).toEqual(
      expect.arrayContaining([
        expect.stringContaining("evidence_ref_ids"),
      ]),
    );
  });

  it("renders markdown without inventing replacements for missing evidence", () => {
    const catalog = buildContextCoverageGapCatalog({
      audit: buildFixtureAudit(),
      generated_at: GENERATED_AT,
    });
    const markdown = formatContextCoverageGapCatalogMarkdown(catalog);

    expect(markdown).toContain(
      "Status: generated from semantic-core context coverage audit",
    );
    expect(markdown).toContain(
      "not a source of Salt product guidance",
    );
    expect(markdown).toContain("| component | component.fixture-action |");
    expect(markdown).toContain("missing_optional_evidence");
    expect(markdown).toContain("evidence_surface_gate_failed");
    expect(markdown).toContain("missing_token_policy");
    expect(markdown).toContain("fixture-pattern-gap.ref");
    expect(markdown).toContain("fixture-pattern-gap-record.ref");
    expect(markdown).not.toMatch(/recommended replacement|use .+ instead/i);
  });
});
