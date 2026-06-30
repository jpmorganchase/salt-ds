import { z } from "zod";

/**
 * Salt agent provenance attestation payload (v1).
 *
 * Emitted by `salt-ds hook --emit-attestation` after a clean PostToolUse
 * review and consumed by `salt-ds verify` (file path or stdin). The payload
 * is the Salt-owned data contract; Salt does NOT pick the disk layout, the
 * hashing algorithm, the retention policy, or the GC story for the
 * consumer's audit store. Per-payload `hash_alg` lets consumers upgrade
 * hashing independently. Consumers pipe stdout to whatever audit store they
 * already operate (git notes, signed commits, GitHub check API, SIEM,
 * internal audit log, plain file).
 *
 * Will be published at salt-ds.dev/schemas/attestation/v1 by Phase 5; the
 * runtime source-of-truth is this Zod schema. The hand-rolled JSON Schema
 * mirror lives at packages/semantic-core/schemas/salt-attestation.schema.json.
 */
export const SALT_ATTESTATION_V1_SCHEMA_URL =
  "salt-ds.dev/schemas/attestation/v1";

export const SaltAttestationV1FileTouchedSchema = z
  .object({
    path: z.string().min(1).describe("Path relative to repo root"),
    hash: z.string().min(1),
    hash_alg: z
      .string()
      .min(1)
      .describe(
        'Hash algorithm identifier (e.g. "sha256"). Per-payload so consumers can upgrade independently.',
      ),
  })
  .strict();

export const SaltAttestationV1RegistrySchema = z
  .object({
    hash: z.string().min(1),
    hash_alg: z.string().min(1),
  })
  .strict();

export const SaltAttestationV1PostActionSchema = z
  .object({
    kind: z.literal("PostToolUse"),
    ran: z.boolean(),
    review_status: z.enum(["ready", "needs_attention", "blocked"]),
  })
  .strict();

export const SaltAttestationV1Schema = z
  .object({
    $schema: z.literal(SALT_ATTESTATION_V1_SCHEMA_URL),
    contract: z.literal("salt_attestation_v1"),
    attested_at: z
      .string()
      .describe("ISO 8601 UTC timestamp of attestation emit."),
    trace_id: z
      .string()
      .min(1)
      .describe(
        "Opaque trace id; placeholder for Phase 4.1 replay correlation.",
      ),
    registry: SaltAttestationV1RegistrySchema,
    evidence_refs: z
      .array(z.string().min(1))
      .describe(
        "Stable evidence_ref_ids copied from the source review report.",
      ),
    post_action: SaltAttestationV1PostActionSchema,
    files_touched: z.array(SaltAttestationV1FileTouchedSchema),
  })
  .strict();

export type SaltAttestationV1 = z.infer<typeof SaltAttestationV1Schema>;
export type SaltAttestationV1FileTouched = z.infer<
  typeof SaltAttestationV1FileTouchedSchema
>;
export type SaltAttestationV1Registry = z.infer<
  typeof SaltAttestationV1RegistrySchema
>;
export type SaltAttestationV1PostAction = z.infer<
  typeof SaltAttestationV1PostActionSchema
>;

export interface SaltAttestationParseSuccess {
  ok: true;
  attestation: SaltAttestationV1;
}

export interface SaltAttestationParseFailure {
  ok: false;
  errors: string[];
}

export type SaltAttestationParseResult =
  | SaltAttestationParseSuccess
  | SaltAttestationParseFailure;

/**
 * Parse and validate a single attestation payload. Returns `{ok: true, attestation}`
 * on success or `{ok: false, errors}` with human-readable diagnostics on failure.
 */
export function parseSaltAttestationV1(
  input: unknown,
): SaltAttestationParseResult {
  const result = SaltAttestationV1Schema.safeParse(input);
  if (result.success) {
    return { ok: true, attestation: result.data };
  }
  const errors = result.error.issues.map((issue) => {
    const pathLabel = issue.path.length > 0 ? issue.path.join(".") : "(root)";
    return `${pathLabel}: ${issue.message}`;
  });
  return { ok: false, errors };
}

/**
 * Parse one attestation per line (NDJSON). Empty lines and whitespace-only
 * lines are skipped. The first malformed line aborts parsing.
 */
export function parseSaltAttestationNdjson(text: string):
  | {
      ok: true;
      attestations: SaltAttestationV1[];
    }
  | {
      ok: false;
      lineNumber: number;
      errors: string[];
    } {
  const attestations: SaltAttestationV1[] = [];
  const lines = text.split(/\r?\n/);
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index].trim();
    if (line.length === 0) {
      continue;
    }
    let parsed: unknown;
    try {
      parsed = JSON.parse(line);
    } catch (error) {
      return {
        ok: false,
        lineNumber: index + 1,
        errors: [
          `Failed to parse JSON: ${
            error instanceof Error ? error.message : String(error)
          }`,
        ],
      };
    }
    const result = parseSaltAttestationV1(parsed);
    if (!result.ok) {
      return { ok: false, lineNumber: index + 1, errors: result.errors };
    }
    attestations.push(result.attestation);
  }
  return { ok: true, attestations };
}
