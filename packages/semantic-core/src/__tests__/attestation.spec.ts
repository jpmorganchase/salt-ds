import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  parseSaltAttestationNdjson,
  parseSaltAttestationV1,
  SALT_ATTESTATION_V1_SCHEMA_URL,
  type SaltAttestationV1,
  SaltAttestationV1Schema,
} from "../tools/attestation.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const VALID_SAMPLE: SaltAttestationV1 = {
  $schema: SALT_ATTESTATION_V1_SCHEMA_URL,
  contract: "salt_attestation_v1",
  attested_at: "2026-06-11T10:00:00.000Z",
  trace_id: "trace_abc123",
  registry: {
    hash: "sha256-deadbeef",
    hash_alg: "sha256",
  },
  evidence_refs: ["review.canonical-mismatch.SrcA.tsx"],
  post_action: {
    kind: "PostToolUse",
    ran: true,
    review_status: "ready",
  },
  files_touched: [
    {
      path: "src/App.tsx",
      hash: "sha256-cafef00d",
      hash_alg: "sha256",
    },
  ],
};

describe("SaltAttestationV1 — Zod source-of-truth", () => {
  it("accepts a canonical valid payload", () => {
    const result = SaltAttestationV1Schema.safeParse(VALID_SAMPLE);
    expect(result.success).toBe(true);
  });

  it("parseSaltAttestationV1 returns ok=true on a valid payload", () => {
    const result = parseSaltAttestationV1(VALID_SAMPLE);
    expect(result.ok).toBe(true);
  });

  it("rejects unknown top-level fields (strict)", () => {
    const result = parseSaltAttestationV1({
      ...VALID_SAMPLE,
      extra_field: "nope",
    });
    expect(result.ok).toBe(false);
  });

  it("rejects review_status outside the enum", () => {
    const bad = {
      ...VALID_SAMPLE,
      post_action: { ...VALID_SAMPLE.post_action, review_status: "passed" },
    };
    const result = parseSaltAttestationV1(bad);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.join("\n")).toMatch(/post_action.review_status/);
    }
  });

  it("rejects an empty trace_id", () => {
    const result = parseSaltAttestationV1({ ...VALID_SAMPLE, trace_id: "" });
    expect(result.ok).toBe(false);
  });

  it("rejects $schema other than salt-ds.dev/schemas/attestation/v1", () => {
    const result = parseSaltAttestationV1({
      ...VALID_SAMPLE,
      $schema: "https://example.com/some-other-schema",
    });
    expect(result.ok).toBe(false);
  });
});

describe("parseSaltAttestationNdjson", () => {
  it("parses multiple payloads", () => {
    const text = `${JSON.stringify(VALID_SAMPLE)}\n${JSON.stringify({
      ...VALID_SAMPLE,
      trace_id: "trace_xyz789",
    })}\n`;
    const result = parseSaltAttestationNdjson(text);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.attestations).toHaveLength(2);
      expect(result.attestations[1].trace_id).toBe("trace_xyz789");
    }
  });

  it("skips blank/whitespace lines", () => {
    const text = `\n\n${JSON.stringify(VALID_SAMPLE)}\n   \n`;
    const result = parseSaltAttestationNdjson(text);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.attestations).toHaveLength(1);
    }
  });

  it("reports the first malformed JSON line with 1-based line number", () => {
    const text = `${JSON.stringify(VALID_SAMPLE)}\nnot json\n`;
    const result = parseSaltAttestationNdjson(text);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.lineNumber).toBe(2);
    }
  });

  it("reports the first schema-invalid line with 1-based line number", () => {
    const bad = { ...VALID_SAMPLE, trace_id: "" };
    const text = `${JSON.stringify(VALID_SAMPLE)}\n${JSON.stringify(bad)}\n`;
    const result = parseSaltAttestationNdjson(text);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.lineNumber).toBe(2);
    }
  });
});

describe("salt-attestation.schema.json — JSON Schema mirror", () => {
  it("$id matches saltdesignsystem.com and references the v1 contract", () => {
    const filePath = path.resolve(
      __dirname,
      "../../schemas/salt-attestation.schema.json",
    );
    const raw = readFileSync(filePath, "utf8");
    const parsed = JSON.parse(raw);
    expect(parsed.$id).toBe(
      "https://github.com/jpmorganchase/salt-ds/blob/main/packages/semantic-core/schemas/salt-attestation.schema.json",
    );
    expect(parsed.properties.$schema.const).toBe(
      SALT_ATTESTATION_V1_SCHEMA_URL,
    );
    expect(parsed.properties.contract.const).toBe("salt_attestation_v1");
  });
});
