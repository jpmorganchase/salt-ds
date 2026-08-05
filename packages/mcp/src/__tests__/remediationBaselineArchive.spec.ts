import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { REPO_ROOT } from "./registryTestUtils.js";

const FIXTURE_ROOT = path.join(
  REPO_ROOT,
  "packages/mcp/eval-fixtures/remediation-baseline",
);

const ARCHIVED_ARTIFACTS = [
  {
    file: "offline-network-guard.mjs",
    bytes: 1_011,
    sha256: "28530608d329f09ee1709401a6f355f04f226804aeb69222eea7a892b4c259b0",
  },
  {
    file: "replay-package-lock.json",
    bytes: 50_825,
    sha256: "b926b4d1bc359b0bd3f439e2187555f76ecd9ef5246b80df60c593775209db77",
  },
  {
    file: "replay-package.json",
    bytes: 172,
    sha256: "75b551e3a18b3c843676ac6bff4cc926de616d024257a67ccc3913a98b262646",
  },
  {
    file: "salt-ds-mcp-f0f6d86.tgz",
    bytes: 1_163_834,
    sha256: "dd3b3bd1af3ccc55a21afbcd1e844cc1d4ee31b80bce5b2caa900329ddbb8f59",
  },
] as const;

const ARCHIVE_MANIFEST = {
  bytes: 8_046,
  sha256: "7d3ff37ff36c586823db981f5e8654014ebf06130216114f8bbc52ff4531e652",
} as const;

const ARCHIVE_CONTROL_FILES = [
  {
    file: ".gitattributes",
    bytes: 152,
    sha256: "694043cb2d8fb7db6b986737325bf45e4971862aca93427885290df4c7d4eeda",
  },
  {
    file: "README.md",
    bytes: 2_336,
    sha256: "e124ec175b740aed02fdf0e3fd9dcaf5f662ccd367ecbb5856159cda50979f5c",
  },
] as const;

const ARCHIVE_PATHS = [
  ".gitattributes",
  "README.md",
  "artifacts/offline-network-guard.mjs",
  "artifacts/replay-package-lock.json",
  "artifacts/replay-package.json",
  "artifacts/salt-ds-mcp-f0f6d86.tgz",
  "captured/create_toolbar_link.json",
  "captured/manifest.json",
  "captured/migrate_primary_action.json",
  "captured/offline_esm_guard_bypass.json",
  "captured/policy_prose_trust_boundary.json",
  "captured/project_inspection.json",
  "captured/r1_border_button_non_convergence.json",
  "captured/reference_matrix.json",
  "captured/review_false_completion.json",
  "captured/review_generic_react_false_block.json",
  "captured/review_grounded_findings.json",
  "captured/surface_discovery.json",
  "captured/token_query_border.json",
  "captured/token_query_disabled_text.json",
  "captured/token_query_padding.json",
  "captured/token_query_text_color.json",
  "scenarios.json",
] as const;

function read(relativePath: string): Buffer {
  return fs.readFileSync(path.join(FIXTURE_ROOT, relativePath));
}

function sha256(bytes: Buffer): string {
  return createHash("sha256").update(bytes).digest("hex");
}

describe("retired Phase 0 baseline archive", () => {
  it("is closed over an exact recursive file inventory", () => {
    const pending = [FIXTURE_ROOT];
    const files: string[] = [];
    while (pending.length > 0) {
      const directory = pending.pop()!;
      for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
        const absolute = path.join(directory, entry.name);
        if (entry.isDirectory()) pending.push(absolute);
        else if (entry.isFile()) {
          files.push(
            path.relative(FIXTURE_ROOT, absolute).replaceAll("\\", "/"),
          );
        } else {
          throw new Error(`Archive contains non-file entry '${absolute}'.`);
        }
      }
    }
    expect(files.toSorted()).toEqual([...ARCHIVE_PATHS].toSorted());
    for (const control of ARCHIVE_CONTROL_FILES) {
      const bytes = read(control.file);
      expect(bytes.byteLength, control.file).toBe(control.bytes);
      expect(sha256(bytes), control.file).toBe(control.sha256);
    }
  });

  it("keeps every frozen artifact byte-identical without executable v1 replay", () => {
    for (const artifact of ARCHIVED_ARTIFACTS) {
      const bytes = read(path.join("artifacts", artifact.file));
      expect(bytes.byteLength, artifact.file).toBe(artifact.bytes);
      expect(sha256(bytes), artifact.file).toBe(artifact.sha256);
    }
  });

  it("binds the scenario matrix to all 15 immutable captures", () => {
    const manifestBytes = read("captured/manifest.json");
    expect(manifestBytes.byteLength).toBe(ARCHIVE_MANIFEST.bytes);
    expect(sha256(manifestBytes)).toBe(ARCHIVE_MANIFEST.sha256);
    const manifest = JSON.parse(manifestBytes.toString("utf8")) as {
      baseline_commit: string;
      package: { tarball_bytes: number; tarball_sha256: string };
      scenario_fixture: { bytes: number; sha256: string };
      captures: Array<{
        id: string;
        file: string;
        bytes: number;
        sha256: string;
      }>;
    };
    const scenarioBytes = read("scenarios.json");
    const scenarios = JSON.parse(scenarioBytes.toString("utf8")) as {
      baseline_commit: string;
      scenarios: Array<{ id: string }>;
    };

    expect(manifest.baseline_commit).toBe(
      "f0f6d86db9a5f7b6db434e2b0be4e6d3f57f4f4b",
    );
    expect(scenarios.baseline_commit).toBe(manifest.baseline_commit);
    expect(scenarioBytes.byteLength).toBe(manifest.scenario_fixture.bytes);
    expect(sha256(scenarioBytes)).toBe(manifest.scenario_fixture.sha256);
    expect(manifest.package).toMatchObject({
      tarball_bytes: ARCHIVED_ARTIFACTS[3].bytes,
      tarball_sha256: ARCHIVED_ARTIFACTS[3].sha256,
    });
    const captureIds = manifest.captures.map(({ id }) => id);
    const scenarioIds = scenarios.scenarios.map(({ id }) => id);
    expect(manifest.captures).toHaveLength(15);
    expect(new Set(captureIds).size).toBe(captureIds.length);
    expect(new Set(scenarioIds).size).toBe(scenarioIds.length);
    expect(captureIds.toSorted()).toEqual(scenarioIds.toSorted());

    for (const capture of manifest.captures) {
      const bytes = read(path.join("captured", capture.file));
      expect(bytes.byteLength, capture.file).toBe(capture.bytes);
      expect(sha256(bytes), capture.file).toBe(capture.sha256);
    }
  });
});
