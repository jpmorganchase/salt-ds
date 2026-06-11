import { createHash, randomBytes } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import {
  SALT_ATTESTATION_V1_SCHEMA_URL,
  type SaltAttestationV1,
  type SaltAttestationV1FileTouched,
  type SaltAttestationV1PostAction,
} from "@salt-ds/semantic-core";

const FILE_HASH_ALG = "sha256";
const REGISTRY_HASH_ALG = "sha256-of-version-and-generated-at";

/**
 * Compute a stable SHA-256 hash of a file's contents. Returned as the lowercase
 * hex digest. Caller passes an absolute path.
 */
export async function hashFileContents(absolutePath: string): Promise<string> {
  const buffer = await fs.readFile(absolutePath);
  return createHash("sha256").update(buffer).digest("hex");
}

/**
 * Compute a stable registry identifier from the registry's `version` +
 * `generated_at`. Salt does not commit to a content-hash of the entire
 * registry artifact (too expensive on every attestation); the per-payload
 * `hash_alg` field tells the verifier what algorithm was used so consumers
 * can upgrade independently.
 */
export function hashRegistryIdentity(input: {
  version: string;
  generatedAt: string;
}): string {
  return createHash("sha256")
    .update(`${input.version}|${input.generatedAt}`)
    .digest("hex");
}

/**
 * Generate an opaque trace id. Placeholder for Phase 4.1 replay correlation;
 * consumers that already have a trace id (e.g. from their host editor) can
 * pass it through their own pipeline.
 */
export function generateTraceId(): string {
  return `trace_${randomBytes(8).toString("hex")}`;
}

export interface BuildAttestationInput {
  /** Repository root used to compute file paths relative to. */
  cwd: string;
  /** Registry version (`SaltRegistry.version`). */
  registryVersion: string;
  /** Registry generated_at (`SaltRegistry.generated_at`). */
  registryGeneratedAt: string;
  /** Absolute file paths that were reviewed. */
  reviewedAbsolutePaths: string[];
  /** Stable evidence_ref_ids cited by the review. Empty on clean. */
  evidenceRefs: string[];
  /** Whether the PostToolUse review actually executed (vs short-circuited). */
  postActionRan: boolean;
  /** The review's outcome status. */
  reviewStatus: SaltAttestationV1PostAction["review_status"];
  /** Optional clock injection for tests. */
  now?: () => Date;
  /** Optional trace-id injection for tests. */
  traceId?: string;
}

export async function buildAttestation(
  input: BuildAttestationInput,
): Promise<SaltAttestationV1> {
  const now = input.now ?? (() => new Date());
  const filesTouched: SaltAttestationV1FileTouched[] = [];
  for (const absolutePath of input.reviewedAbsolutePaths) {
    const relativePath = path.relative(input.cwd, absolutePath) || absolutePath;
    const hash = await hashFileContents(absolutePath);
    filesTouched.push({
      path: relativePath,
      hash,
      hash_alg: FILE_HASH_ALG,
    });
  }

  return {
    $schema: SALT_ATTESTATION_V1_SCHEMA_URL,
    contract: "salt_attestation_v1",
    attested_at: now().toISOString(),
    trace_id: input.traceId ?? generateTraceId(),
    registry: {
      hash: hashRegistryIdentity({
        version: input.registryVersion,
        generatedAt: input.registryGeneratedAt,
      }),
      hash_alg: REGISTRY_HASH_ALG,
    },
    evidence_refs: input.evidenceRefs,
    post_action: {
      kind: "PostToolUse",
      ran: input.postActionRan,
      review_status: input.reviewStatus,
    },
    files_touched: filesTouched,
  };
}

export interface VerifyAttestationInput {
  cwd: string;
  attestation: SaltAttestationV1;
}

export interface VerifyAttestationDrift {
  path: string;
  expectedHash: string;
  actualHash: string | null;
  reason: "modified" | "missing" | "unsupported-alg";
}

export interface VerifyAttestationResult {
  ok: boolean;
  drift: VerifyAttestationDrift[];
}

/**
 * Verify a single attestation against the current on-disk state. Each
 * `files_touched` entry is re-hashed with its own `hash_alg` and compared
 * against the recorded hash. Unsupported hash algorithms are surfaced as
 * drift (with reason "unsupported-alg") so the verifier never silently
 * accepts an unknown algorithm.
 */
export async function verifyAttestation(
  input: VerifyAttestationInput,
): Promise<VerifyAttestationResult> {
  const drift: VerifyAttestationDrift[] = [];
  for (const entry of input.attestation.files_touched) {
    if (entry.hash_alg !== FILE_HASH_ALG) {
      drift.push({
        path: entry.path,
        expectedHash: entry.hash,
        actualHash: null,
        reason: "unsupported-alg",
      });
      continue;
    }
    const absolutePath = path.resolve(input.cwd, entry.path);
    let actualHash: string;
    try {
      actualHash = await hashFileContents(absolutePath);
    } catch {
      drift.push({
        path: entry.path,
        expectedHash: entry.hash,
        actualHash: null,
        reason: "missing",
      });
      continue;
    }
    if (actualHash !== entry.hash) {
      drift.push({
        path: entry.path,
        expectedHash: entry.hash,
        actualHash,
        reason: "modified",
      });
    }
  }
  return { ok: drift.length === 0, drift };
}
