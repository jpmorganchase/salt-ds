import { promises as fs } from "node:fs";
import { parseSaltAttestationNdjson } from "@salt-ds/semantic-core";
import {
  verifyAttestation,
  type VerifyAttestationDrift,
} from "../../../../lib/attestation.js";
import type { RequiredCliIo } from "../../../../types.js";

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
    raw = await readAllStdin(io);
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
    default:
      return `unknown drift reason: ${(drift as { reason: string }).reason}`;
  }
}

async function readAllStdin(io: RequiredCliIo): Promise<string> {
  const stream = io.stdin;
  if (!stream) {
    return "";
  }
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks).toString("utf8");
}
