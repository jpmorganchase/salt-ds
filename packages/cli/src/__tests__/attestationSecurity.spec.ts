import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  buildAttestation,
  verifyAttestation,
} from "../lib/attestation.js";

let workspace = "";

beforeEach(async () => {
  workspace = await fs.mkdtemp(path.join(os.tmpdir(), "salt-attest-sec-"));
});

afterEach(async () => {
  if (workspace) {
    await fs.rm(workspace, { recursive: true, force: true });
    workspace = "";
  }
});

describe("verifyAttestation security guards", () => {
  it("flags an attestation entry whose relative path escapes cwd via '..'", async () => {
    const file = path.join(workspace, "real.tsx");
    await fs.writeFile(file, "export const ok = 1;\n", "utf8");

    const baseline = await buildAttestation({
      cwd: workspace,
      registryVersion: "0.0.0",
      registryGeneratedAt: "2026-06-14T00:00:00Z",
      reviewedAbsolutePaths: [file],
      evidenceRefs: [],
      postActionRan: true,
      reviewStatus: "ready",
      now: () => new Date("2026-06-14T00:00:00Z"),
      traceId: "trace_test",
    });

    // Inject a hostile path entry that resolves outside the workspace.
    baseline.files_touched.push({
      path: "../../../../etc/passwd",
      hash: "deadbeef",
      hash_alg: "sha256",
    });

    const result = await verifyAttestation({
      cwd: workspace,
      attestation: baseline,
    });

    expect(result.ok).toBe(false);
    const escape = result.drift.find(
      (entry) => entry.reason === "path-escape",
    );
    expect(escape).toBeDefined();
    expect(escape?.path).toBe("../../../../etc/passwd");
    expect(escape?.actualHash).toBeNull();
  });

  it("flags an attestation entry whose path is absolute and outside cwd", async () => {
    const file = path.join(workspace, "real.tsx");
    await fs.writeFile(file, "export const ok = 2;\n", "utf8");

    const baseline = await buildAttestation({
      cwd: workspace,
      registryVersion: "0.0.0",
      registryGeneratedAt: "2026-06-14T00:00:00Z",
      reviewedAbsolutePaths: [file],
      evidenceRefs: [],
      postActionRan: true,
      reviewStatus: "ready",
      now: () => new Date("2026-06-14T00:00:00Z"),
      traceId: "trace_test_abs",
    });

    baseline.files_touched.push({
      path: "/etc/shadow",
      hash: "deadbeef",
      hash_alg: "sha256",
    });

    const result = await verifyAttestation({
      cwd: workspace,
      attestation: baseline,
    });

    expect(result.ok).toBe(false);
    expect(
      result.drift.some(
        (entry) =>
          entry.reason === "path-escape" && entry.path === "/etc/shadow",
      ),
    ).toBe(true);
  });

  it("still accepts legitimate sibling paths under cwd", async () => {
    const subDir = path.join(workspace, "src", "components");
    await fs.mkdir(subDir, { recursive: true });
    const file = path.join(subDir, "Button.tsx");
    await fs.writeFile(file, "export const Button = null;\n", "utf8");

    const attestation = await buildAttestation({
      cwd: workspace,
      registryVersion: "0.0.0",
      registryGeneratedAt: "2026-06-14T00:00:00Z",
      reviewedAbsolutePaths: [file],
      evidenceRefs: [],
      postActionRan: true,
      reviewStatus: "ready",
      now: () => new Date("2026-06-14T00:00:00Z"),
      traceId: "trace_test_ok",
    });

    const result = await verifyAttestation({
      cwd: workspace,
      attestation,
    });

    expect(result.ok).toBe(true);
    expect(result.drift).toEqual([]);
  });
});
