import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";
import { describe, expect, it } from "vitest";
import {
  SALT_EVIDENCE_REF_CONTRACT,
  SALT_GENERATED_ARTIFACT_CONTRACT,
  type SaltEvidenceRef,
  type SaltGeneratedArtifact,
  validateEvidenceRef,
  validateGeneratedArtifactEvidence,
} from "../evidence.js";

const evidenceSchema = JSON.parse(
  readFileSync(
    path.resolve(
      path.dirname(fileURLToPath(import.meta.url)),
      "../../../schemas/salt-evidence-ref.schema.json",
    ),
    "utf8",
  ),
) as Record<string, unknown>;
const validatePublishedEvidenceRef = new Ajv2020({
  allErrors: true,
  strict: false,
}).compile(evidenceSchema);

// @ts-expect-error Registry evidence requires its complete locator at compile time.
const registryEvidenceWithoutLocator: SaltEvidenceRef = {
  contract: SALT_EVIDENCE_REF_CONTRACT,
  id: "fixture.invalid-registry-ref",
  source_kind: "registry",
  claim_kind: "component",
};
void registryEvidenceWithoutLocator;

const registryEvidenceWithoutIdentity: SaltEvidenceRef = {
  contract: SALT_EVIDENCE_REF_CONTRACT,
  id: "fixture.invalid-registry-identity",
  source_kind: "registry",
  claim_kind: "component",
  // @ts-expect-error Registry evidence identity and field_path are required.
  registry: { entity_type: "component", entity_id: "fixture-action" },
};
void registryEvidenceWithoutIdentity;

const sourceEvidenceWithPartialRegistry: SaltEvidenceRef = {
  contract: SALT_EVIDENCE_REF_CONTRACT,
  id: "fixture.invalid-source-registry-supplement",
  source_kind: "source",
  claim_kind: "component",
  source: { repo_path: "packages/core/src/button/Button.tsx" },
  // @ts-expect-error Optional registry corroboration is complete when present.
  registry: { entity_type: "component", entity_id: "fixture-action" },
};
void sourceEvidenceWithPartialRegistry;

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
      },
    ],
    ...overrides,
  };
}

function buildSourceEvidenceRef(
  source: SaltEvidenceRef["source"],
): SaltEvidenceRef {
  return {
    contract: SALT_EVIDENCE_REF_CONTRACT,
    id: "fixture.source-ref",
    source_kind: "source",
    claim_kind: "component",
    source,
  };
}

describe("evidence source locator validation", () => {
  it("rejects the removed legacy verified_at field in the published contract", () => {
    expect(
      validatePublishedEvidenceRef({
        ...buildSourceEvidenceRef({
          repo_path: "packages/core/Button.tsx",
        }),
        verified_at: "2026-04-30T00:00:00.000Z",
      }),
    ).toBe(false);
  });

  it.each([
    "//example.test/salt/button",
    "/salt//components/button",
    "/salt/components/button/index",
    "/salt/../components/button",
    "/salt/%2e%2e/components/button",
    "http://example.test/salt/button",
    "HTTPS://example.test/salt/button",
    " https://example.test/salt/button",
    "https://example.test/salt button",
    "https://user:secret@example.test/salt/button",
    "https://a:bad",
    "https://[::1",
  ])("rejects a non-canonical source URL: %s", (url) => {
    const ref = buildSourceEvidenceRef({ url });
    expect(validateEvidenceRef(ref, "ref")).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "invalid_source_locator",
          path: "ref.source.url",
        }),
      ]),
    );
    expect(validatePublishedEvidenceRef(ref)).toBe(false);
  });

  it.each([
    "/packages/core/Button.tsx",
    "C:/packages/core/Button.tsx",
    "packages\\core\\Button.tsx",
    "../packages/core/Button.tsx",
    " packages/core/Button.tsx",
    "packages/core/Button.tsx ",
    "packages/core/",
    "packages/COM¹/readme.md",
  ])("rejects a non-portable repository path: %s", (repoPath) => {
    const ref = buildSourceEvidenceRef({ repo_path: repoPath });
    expect(validateEvidenceRef(ref, "ref")).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "invalid_source_locator",
          path: "ref.source.repo_path",
        }),
      ]),
    );
    expect(validatePublishedEvidenceRef(ref)).toBe(false);
  });

  it.each([
    { line_start: 0, line_end: 1 },
    { line_start: -1, line_end: 1 },
    { line_start: 1.5, line_end: 2 },
    { line_start: 2, line_end: 1 },
    { line_start: 1 },
    { line_end: 1 },
  ])("rejects an invalid source line range: %j", (lineRange) => {
    const ref = buildSourceEvidenceRef({
      repo_path: "packages/core/Button.tsx",
      ...lineRange,
    });
    expect(validateEvidenceRef(ref, "ref")).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "invalid_source_locator",
          path: "ref.source",
        }),
      ]),
    );
    if (!(lineRange.line_start === 2 && lineRange.line_end === 1)) {
      expect(validatePublishedEvidenceRef(ref)).toBe(false);
    }
  });

  it("accepts canonical Salt routes and HTTPS URLs with query or fragment data", () => {
    expect(
      validateEvidenceRef(
        buildSourceEvidenceRef({ url: "/salt/components/button" }),
        "ref",
      ),
    ).toEqual([]);
    expect(
      validatePublishedEvidenceRef(
        buildSourceEvidenceRef({ url: "/salt/components/button" }),
      ),
    ).toBe(true);
    expect(
      validateEvidenceRef(
        buildSourceEvidenceRef({
          url: "https://example.test/story?id=button#states",
        }),
        "ref",
      ),
    ).toEqual([]);
    expect(
      validatePublishedEvidenceRef(
        buildSourceEvidenceRef({
          url: "https://example.test/story?id=button#states",
        }),
      ),
    ).toBe(true);
  });

  it.each([
    "packages/CON/readme.md",
    "packages/theme./readme.md",
    "packages/core//Button.tsx",
    "packages/core/",
    "packages/COM¹/readme.md",
  ])("aligns published path rejection with runtime for %s", (repoPath) => {
    const ref = buildSourceEvidenceRef({ repo_path: repoPath });
    expect(validateEvidenceRef(ref, "ref")).not.toEqual([]);
    expect(validatePublishedEvidenceRef(ref)).toBe(false);
  });

  it.each([
    {
      contract: SALT_EVIDENCE_REF_CONTRACT,
      id: "fixture.docs-without-source",
      source_kind: "docs",
      claim_kind: "component",
    },
    {
      contract: SALT_EVIDENCE_REF_CONTRACT,
      id: "fixture.package-without-package",
      source_kind: "package",
      claim_kind: "package",
    },
    {
      contract: SALT_EVIDENCE_REF_CONTRACT,
      id: "fixture.runtime-without-source",
      source_kind: "runtime",
      claim_kind: "status",
    },
    {
      contract: SALT_EVIDENCE_REF_CONTRACT,
      id: "fixture.registry-without-identity",
      source_kind: "registry",
      claim_kind: "component",
      registry: {
        entity_type: "component",
        entity_id: "fixture-action",
      },
    },
  ])("requires the locator and identity implied by $source_kind", (ref) => {
    expect(
      validateEvidenceRef(ref as unknown as SaltEvidenceRef, "ref"),
    ).not.toEqual([]);
    expect(validatePublishedEvidenceRef(ref)).toBe(false);
  });

  it.each([
    "https://:",
    "https://a:bad",
    "https://[::1",
  ])("rejects malformed HTTPS authority in the published schema: %s", (url) => {
    expect(validatePublishedEvidenceRef(buildSourceEvidenceRef({ url }))).toBe(
      false,
    );
  });

  it.each([
    {
      ...buildSourceEvidenceRef({ repo_path: "packages/core/Button.tsx" }),
      id: "",
    },
    {
      ...buildSourceEvidenceRef({ repo_path: "packages/core/Button.tsx" }),
      source_kind: "unknown",
    },
    {
      ...buildSourceEvidenceRef({ repo_path: "packages/core/Button.tsx" }),
      claim_kind: "unknown",
    },
    {
      ...buildSourceEvidenceRef({ repo_path: "packages/core/Button.tsx" }),
      registry: [],
    },
    {
      ...buildSourceEvidenceRef({ repo_path: "packages/core/Button.tsx" }),
      source: {
        repo_path: "packages/core/Button.tsx",
        unexpected: true,
      },
    },
  ])("keeps runtime structural validation at least as strict as the published schema: %j", (candidate) => {
    expect(validatePublishedEvidenceRef(candidate)).toBe(false);
    expect(
      validateEvidenceRef(candidate as unknown as SaltEvidenceRef, "ref"),
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "invalid_evidence_contract" }),
      ]),
    );
  });

  it.each([
    undefined,
    null,
    "",
    " ",
  ])("requires a nonempty registry field path at runtime and in the published schema: %j", (fieldPath) => {
    const [ref] = buildGeneratedArtifact().evidence_refs;
    if (!ref) throw new Error("Expected generated artifact evidence");
    if (fieldPath === undefined) {
      if (ref.registry) {
        delete (ref.registry as Partial<typeof ref.registry>).field_path;
      }
    } else if (ref.registry) {
      (ref.registry as { field_path: string | null }).field_path = fieldPath;
    }

    expect(validatePublishedEvidenceRef(ref)).toBe(false);
    expect(validateEvidenceRef(ref, "ref")).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "missing_registry_field_path",
          path: "ref.registry.field_path",
        }),
      ]),
    );
  });

  it.each([
    { source: { url: "", repo_path: "packages/core/Button.tsx" } },
    { source: { url: "/salt/components/button", repo_path: "" } },
  ])("rejects an empty present source locator even when its peer is valid: %j", (overrides) => {
    const ref = buildSourceEvidenceRef(overrides.source);
    expect(validatePublishedEvidenceRef(ref)).toBe(false);
    expect(validateEvidenceRef(ref, "ref")).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "invalid_evidence_contract" }),
      ]),
    );
  });

  it.each([
    {
      source_kind: "package",
      package: { name: " " },
      claim_kind: "package",
    },
    {
      source_kind: "project_policy",
      project_policy: { path: " " },
      claim_kind: "project_policy",
    },
    {
      source_kind: "submitted_text",
      submitted_text: { field_path: " " },
      claim_kind: "component",
    },
    {
      source_kind: "runtime",
      source: { section: " " },
      claim_kind: "status",
    },
  ])("rejects whitespace-only locator values at runtime and in schema: %j", (partial) => {
    const ref = {
      contract: SALT_EVIDENCE_REF_CONTRACT,
      id: "fixture.whitespace-locator",
      ...partial,
    } as SaltEvidenceRef;
    expect(validatePublishedEvidenceRef(ref)).toBe(false);
    expect(validateEvidenceRef(ref, "ref")).not.toEqual([]);
  });
});

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
            claim_kind: "status",
          },
        ],
        claims: [
          {
            id: "fixture.runtime-claim",
            kind: "status",
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
