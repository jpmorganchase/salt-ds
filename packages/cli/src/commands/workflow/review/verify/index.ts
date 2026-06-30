import { promises as fs } from "node:fs";
import { parseSaltAttestationNdjson } from "@salt-ds/semantic-core";
import {
  type VerifyAttestationDrift,
  verifyAttestation,
} from "../../../../lib/attestation.js";
import type { RequiredCliIo } from "../../../../types.js";

/**
 * Hard ceiling on attestation NDJSON payloads (file or stdin). Mirrors the
 * 1 MiB stdin cap in `hookIO.ts`. Attestation lines are small (a few KB each
 * for typical reviews) so a 1 MiB envelope already accommodates ~hundreds of
 * touched files across many trace ids; anything larger is almost certainly
 * a hostile or runaway payload trying to OOM the verifier.
 */
const MAX_VERIFY_ATTESTATION_BYTES = 1024 * 1024;

interface VerifyOptions {
  io: RequiredCliIo;
}

/**
 * Read NDJSON attestations from stdin (or from a `--verify-attestations <path>`
 * value if non-empty), validate each via the published Zod schema, and re-hash
 * every `files_touched` entry against the current on-disk state. Exits non-zero
 * on drift, parse failure, or schema mismatch.
 *
 * The CLI does NOT pick an audit store: consumers pipe whatever they store
 * (git notes content, audit log lines, single-file NDJSON) into stdin. The
 * `--verify-attestations <path>` overload is a convenience for the
 * `workflow-examples/` demo and is equivalent to `< <path>`.
 */
export async function runVerifyAttestationsCommand(
  flags: Record<string, string>,
  options: VerifyOptions,
): Promise<number> {
  const { io } = options;
  const verifyFlag = flags["verify-attestations"];

  let raw: string;
  if (verifyFlag && verifyFlag !== "true") {
    try {
      const stats = await fs.stat(verifyFlag);
      if (stats.size > MAX_VERIFY_ATTESTATION_BYTES) {
        io.writeStderr(
          `salt-ds verify: ${verifyFlag} is ${stats.size} bytes; exceeds limit of ${MAX_VERIFY_ATTESTATION_BYTES}.\n`,
        );
        return 1;
      }
      raw = await fs.readFile(verifyFlag, "utf8");
    } catch (error) {
      io.writeStderr(
        `salt-ds verify: failed to read ${verifyFlag}: ${
          error instanceof Error ? error.message : String(error)
        }\n`,
      );
      return 1;
    }
  } else {
    try {
      raw = await readAllStdin(io, MAX_VERIFY_ATTESTATION_BYTES);
    } catch (error) {
      io.writeStderr(
        `salt-ds verify: ${
          error instanceof Error ? error.message : String(error)
        }\n`,
      );
      return 1;
    }
  }

  if (raw.trim().length === 0) {
    io.writeStderr(
      "salt-ds verify: no attestation payloads on stdin (or empty file).\n",
    );
    return 1;
  }

  const parsed = parseSaltAttestationNdjson(raw);
  if (!parsed.ok) {
    io.writeStderr(
      `salt-ds verify: invalid attestation on line ${parsed.lineNumber}:\n${parsed.errors
        .map((message) => `  - ${message}`)
        .join("\n")}\n`,
    );
    return 1;
  }

  const allDrift: Array<VerifyAttestationDrift & { traceId: string }> = [];
  for (const attestation of parsed.attestations) {
    const result = await verifyAttestation({
      cwd: io.cwd,
      attestation,
    });
    if (!result.ok) {
      for (const entry of result.drift) {
        allDrift.push({ ...entry, traceId: attestation.trace_id });
      }
    }
  }

  if (allDrift.length === 0) {
    if (flags.json === "true") {
      io.writeStdout(
        `${JSON.stringify(
          {
            ok: true,
            verified: parsed.attestations.length,
            drift: [],
          },
          null,
          2,
        )}\n`,
      );
    } else {
      io.writeStdout(
        `Verified ${parsed.attestations.length} attestation${
          parsed.attestations.length === 1 ? "" : "s"
        }. All file hashes match.\n`,
      );
    }
    return 0;
  }

  if (flags.json === "true") {
    io.writeStdout(
      `${JSON.stringify(
        {
          ok: false,
          verified: parsed.attestations.length,
          drift: allDrift,
        },
        null,
        2,
      )}\n`,
    );
  } else {
    io.writeStderr(
      `salt-ds verify: ${allDrift.length} drift finding${
        allDrift.length === 1 ? "" : "s"
      }:\n${allDrift
        .map(
          (entry) =>
            `  - [${entry.traceId}] ${entry.path}: ${describeDrift(entry)}`,
        )
        .join("\n")}\n`,
    );
  }
  return 2;
}

function describeDrift(drift: VerifyAttestationDrift): string {
  switch (drift.reason) {
    case "modified":
      return `expected ${drift.expectedHash}, got ${drift.actualHash ?? "(none)"}`;
    case "missing":
      return `file no longer exists on disk (expected ${drift.expectedHash})`;
    case "unsupported-alg":
      return `attestation used an unsupported hash algorithm (expected ${drift.expectedHash})`;
    case "path-escape":
      return `attestation path resolves outside the verifier's cwd and was refused (expected ${drift.expectedHash})`;
    default:
      return `unknown drift reason: ${(drift as { reason: string }).reason}`;
  }
}

async function readAllStdin(
  io: RequiredCliIo,
  maxBytes: number,
): Promise<string> {
  const stream = io.stdin;
  if (!stream) {
    return "";
  }
  const chunks: Buffer[] = [];
  let total = 0;
  for await (const chunk of stream) {
    const buf = typeof chunk === "string" ? Buffer.from(chunk) : chunk;
    total += buf.length;
    if (total > maxBytes) {
      throw new Error(
        `attestation payload on stdin exceeds limit of ${maxBytes} bytes`,
      );
    }
    chunks.push(buf);
  }
  return Buffer.concat(chunks).toString("utf8");
}
