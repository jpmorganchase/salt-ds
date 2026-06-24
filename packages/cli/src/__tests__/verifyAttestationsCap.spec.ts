import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { Readable } from "node:stream";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { runVerifyAttestationsCommand } from "../commands/workflow/review/verify/index.js";
import type { RequiredCliIo } from "../types.js";

let workspace = "";

function createIo(overrides: {
  cwd: string;
  stdin?: NodeJS.ReadableStream;
}): {
  io: RequiredCliIo;
  stdout: string[];
  stderr: string[];
} {
  const stdout: string[] = [];
  const stderr: string[] = [];
  return {
    io: {
      cwd: overrides.cwd,
      writeStdout: (message) => stdout.push(message),
      writeStderr: (message) => stderr.push(message),
      stdin: overrides.stdin,
    },
    stdout,
    stderr,
  };
}

beforeEach(async () => {
  workspace = await fs.mkdtemp(path.join(os.tmpdir(), "salt-verify-cap-"));
});

afterEach(async () => {
  if (workspace) {
    await fs.rm(workspace, { recursive: true, force: true });
    workspace = "";
  }
});

describe("runVerifyAttestationsCommand NDJSON size cap", () => {
  it("rejects an oversized attestation file (> 1 MiB) before parsing", async () => {
    const oversizedPath = path.join(workspace, "huge.ndjson");
    // 1 MiB + a few bytes — must exceed MAX_VERIFY_ATTESTATION_BYTES
    // without taking ages to allocate.
    await fs.writeFile(oversizedPath, Buffer.alloc(1024 * 1024 + 16, 0x20));

    const { io, stderr } = createIo({ cwd: workspace });
    const exitCode = await runVerifyAttestationsCommand(
      { "verify-attestations": oversizedPath },
      { io },
    );

    expect(exitCode).toBe(1);
    expect(stderr.join("")).toMatch(/exceeds limit of 1048576/);
  });

  it("rejects oversized stdin payload before parsing", async () => {
    const oversized = Readable.from([Buffer.alloc(1024 * 1024 + 16, 0x20)]);
    const { io, stderr } = createIo({ cwd: workspace, stdin: oversized });

    const exitCode = await runVerifyAttestationsCommand({}, { io });

    expect(exitCode).toBe(1);
    expect(stderr.join("")).toMatch(/exceeds limit of 1048576/);
  });

  it("accepts a small valid payload (under the cap)", async () => {
    // Empty payload short-circuits to exit 1 with a distinct error message,
    // which is also under the cap. We assert the cap did NOT fire (no
    // "exceeds limit" stderr) — i.e. the small input was admitted to the
    // parser layer.
    const smallPath = path.join(workspace, "tiny.ndjson");
    await fs.writeFile(smallPath, "  \n  \n", "utf8");

    const { io, stderr } = createIo({ cwd: workspace });
    const exitCode = await runVerifyAttestationsCommand(
      { "verify-attestations": smallPath },
      { io },
    );

    expect(exitCode).toBe(1);
    const stderrText = stderr.join("");
    expect(stderrText).not.toMatch(/exceeds limit/);
    expect(stderrText).toMatch(/no attestation payloads/);
  });
});
