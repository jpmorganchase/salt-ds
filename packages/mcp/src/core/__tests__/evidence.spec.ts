import { describe, expect, it } from "vitest";
import {
  SALT_EVIDENCE_REF_CONTRACT,
  SALT_GENERATED_ARTIFACT_CONTRACT,
  type SaltGeneratedArtifact,
  validateGeneratedArtifactEvidence,
} from "../evidence.js";

function buildGeneratedArtifact(
  overrides: Partial<SaltGeneratedArtifact> = {},
): SaltGeneratedArtifact {
  return {
    contract: SALT_GENERATED_ARTIFACT_CONTRACT,
    artifact_kind: "validation-report",
    id: "fixture.validation-report",
    generated_at: "2026-04-30T00:00:00.000Z",
    generator: {
      name: "mcp-core evidence fixture",
      version: "0.0.0",
    },
    registry: {
      version: "fixture-registry",
      hash: "fixture-hash",
      generated_at: "2026-04-30T00:00:00.000Z",
    },
    claims: [
      {
        id: "fixture.claim",
        kind: "component",
        text: "Fixture generated claim.",
        field_path: "body.claims[0]",
        evidence_ref_ids: ["fixture.registry-ref"],
      },
    ],
    evidence_refs: [
      {
        contract: SALT_EVIDENCE_REF_CONTRACT,
        id: "fixture.registry-ref",
        source_kind: "registry",
        claim_kind: "component",
        registry: {
          entity_type: "component",
          entity_id: "fixture-component",
          field_path: "summary",
          registry_version: "fixture-registry",
          registry_hash: "fixture-hash",
        },
        confidence: "high",
        verified_at: "2026-04-30T00:00:00.000Z",
      },
    ],
    ...overrides,
  };
}

describe("generated artifact evidence validation", () => {
  it("accepts generated Salt claims that resolve to concrete evidence refs", () => {
    expect(validateGeneratedArtifactEvidence(buildGeneratedArtifact())).toEqual(
      [],
    );
  });

  it("rejects generated Salt claims without evidence refs", () => {
    const issues = validateGeneratedArtifactEvidence(
      buildGeneratedArtifact({
        claims: [
          {
            id: "fixture.claim-without-evidence",
            kind: "prop",
            text: "Fixture generated prop claim.",
            evidence_ref_ids: [],
          },
        ],
      }),
    );

    expect(issues).toEqual([
      expect.objectContaining({
        code: "missing_claim_evidence",
        path: "claims[0].evidence_ref_ids",
      }),
    ]);
  });

  it("rejects generated Salt claims that reference missing evidence refs", () => {
    const issues = validateGeneratedArtifactEvidence(
      buildGeneratedArtifact({
        claims: [
          {
            id: "fixture.claim-with-unknown-ref",
            kind: "token",
            text: "Fixture generated token claim.",
            evidence_ref_ids: ["missing-ref"],
          },
        ],
      }),
    );

    expect(issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "unknown_claim_evidence_ref",
          path: "claims[0].evidence_ref_ids[0]",
        }),
      ]),
    );
  });

  it("rejects generated Salt claims without a matching evidence claim kind", () => {
    const issues = validateGeneratedArtifactEvidence(
      buildGeneratedArtifact({
        claims: [
          {
            id: "fixture.prop-claim",
            kind: "prop",
            text: "Fixture generated prop claim.",
            evidence_ref_ids: ["fixture.registry-ref"],
          },
        ],
      }),
    );

    expect(issues).toEqual([
      expect.objectContaining({
        code: "missing_matching_claim_evidence_ref",
        path: "claims[0].evidence_ref_ids",
      }),
    ]);
  });

  it("rejects docs evidence refs without a source URL or repo path", () => {
    const issues = validateGeneratedArtifactEvidence(
      buildGeneratedArtifact({
        evidence_refs: [
          {
            contract: SALT_EVIDENCE_REF_CONTRACT,
            id: "fixture.docs-ref",
            source_kind: "docs",
            claim_kind: "accessibility",
            confidence: "high",
          },
        ],
        claims: [
          {
            id: "fixture.claim-with-invalid-doc-ref",
            kind: "accessibility",
            text: "Fixture generated accessibility claim.",
            evidence_ref_ids: ["fixture.docs-ref"],
          },
        ],
      }),
    );

    expect(issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "missing_source_locator",
          path: "evidence_refs[0].source",
        }),
        expect.objectContaining({
          code: "invalid_claim_evidence_ref",
          path: "claims[0].evidence_ref_ids[0]",
        }),
      ]),
    );
  });

  it("rejects runtime evidence refs without a runtime locator", () => {
    const issues = validateGeneratedArtifactEvidence(
      buildGeneratedArtifact({
        evidence_refs: [
          {
            contract: SALT_EVIDENCE_REF_CONTRACT,
            id: "fixture.runtime-ref",
            source_kind: "runtime",
            claim_kind: "workflow",
            confidence: "medium",
          },
        ],
        claims: [
          {
            id: "fixture.runtime-claim",
            kind: "workflow",
            text: "Fixture runtime observation.",
            evidence_ref_ids: ["fixture.runtime-ref"],
          },
        ],
      }),
    );

    expect(issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "missing_runtime_locator",
          path: "evidence_refs[0].source",
        }),
        expect.objectContaining({
          code: "invalid_claim_evidence_ref",
          path: "claims[0].evidence_ref_ids[0]",
        }),
      ]),
    );
  });

  it("accepts explicit unsupported claims without evidence refs", () => {
    const issues = validateGeneratedArtifactEvidence(
      buildGeneratedArtifact({
        claims: [],
        evidence_refs: [],
        unsupported_claims: [
          {
            id: "fixture.unsupported-claim",
            kind: "composition",
            text: "Fixture unsupported composition claim.",
            reason: "Fixture lacks source-backed composition evidence.",
          },
        ],
      }),
    );

    expect(issues).toEqual([]);
  });
});
