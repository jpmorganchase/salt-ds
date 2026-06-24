/**
 * End-to-end measurement of Phase 0 task 0.2: confirm that running
 * `salt-ds info` on a clean (fully populated) registry only reads
 * metadata.json + a small handful of registry artifacts (not the full
 * 24 MB the eager loader used to pull in).
 *
 * This spec is a one-shot reality check, not a regression guard for
 * specific artifacts. The byte-budget assertion uses a generous ceiling
 * (`<= 2 MB`) so future code that legitimately touches one more medium
 * artifact for `info` does not flap the test, but a regression to
 * eager-load-everything would blow past 20 MB and fail loudly.
 */

import { statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { runCli } from "../cli.js";
import {
  __getFileReadCountForTests,
  __resetFileReadCountsForTests,
} from "../../../semantic-core/src/registry/lazyRegistry.js";
import { clearArtifactCache } from "../../../semantic-core/src/registry/loadRegistry.js";

const REPO_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  "..",
  "..",
);
// Generated bundle lives in semantic-core after the Phase 2 dedup
// (`refactor(semantic-core,mcp,cli): collapse 28MB+24MB duplicate
// generated bundles to one source`). The CLI and MCP copy this same
// directory into their dist tarballs at pack time; the source of truth
// is semantic-core.
const GENERATED_DIR = path.join(
  REPO_ROOT,
  "packages",
  "semantic-core",
  "generated",
);

const ARTIFACT_FILES = [
  "metadata.json",
  "packages.json",
  "components.json",
  "icons.json",
  "country-symbols.json",
  "pages.json",
  "patterns.json",
  "guides.json",
  "tokens.json",
  "deprecations.json",
  "examples.json",
  "changes.json",
  "search-index.jsonl",
  "create-retrieval-index.jsonl",
  "page-search-index.json",
  "pattern-validation-rules.json",
  "token-policy-structural-role-rules.json",
];

function snapshotRegistryReadBytes(): {
  totalBytes: number;
  perArtifact: Array<{ file: string; bytes: number; reads: number }>;
} {
  let totalBytes = 0;
  const perArtifact: Array<{ file: string; bytes: number; reads: number }> = [];
  for (const file of ARTIFACT_FILES) {
    const absolute = path.join(GENERATED_DIR, file);
    let size = 0;
    try {
      size = statSync(absolute).size;
    } catch {
      continue;
    }
    const reads = __getFileReadCountForTests(absolute);
    if (reads > 0) {
      const bytes = size * reads;
      totalBytes += bytes;
      perArtifact.push({ file, bytes, reads });
    }
  }
  return { totalBytes, perArtifact };
}

describe("salt-ds info bytes-read budget (Phase 0 task 0.2)", () => {
  beforeAll(() => {
    clearArtifactCache();
    __resetFileReadCountsForTests();
  });

  afterAll(() => {
    clearArtifactCache();
    __resetFileReadCountsForTests();
  });

  it("reads less than 2 MB of registry artifacts (down from ~24 MB pre-PR)", async () => {
    const exitCode = await runCli(["info", REPO_ROOT, "--json"], {
      cwd: REPO_ROOT,
      writeStdout: () => {},
      writeStderr: () => {},
    });
    expect(exitCode).toBe(0);

    const { totalBytes, perArtifact } = snapshotRegistryReadBytes();

    // Pretty-print the per-artifact breakdown into the assertion message
    // so a future regression makes the offending artifact obvious.
    const summary = perArtifact
      .map(
        (entry) =>
          `${entry.file}: ${(entry.bytes / 1024).toFixed(1)} KB ` +
          `(${entry.reads} read${entry.reads === 1 ? "" : "s"})`,
      )
      .join("\n  ");

    expect(
      totalBytes,
      `salt-ds info read ${(totalBytes / 1024).toFixed(1)} KB from the registry:\n  ${summary}`,
    ).toBeLessThan(2 * 1024 * 1024);

    // Sanity floor: at least metadata.json was touched.
    expect(perArtifact.length).toBeGreaterThan(0);
    expect(
      perArtifact.some((entry) => entry.file === "metadata.json"),
    ).toBe(true);

    // Surface the breakdown in the test name so a healthy run shows the
    // actual byte count we achieved, not just "passed".
    // eslint-disable-next-line no-console
    console.log(
      `[task 0.2] salt-ds info registry bytes read: ${(totalBytes / 1024).toFixed(1)} KB across ${perArtifact.length} artifact(s): ${perArtifact
        .map((entry) => entry.file)
        .join(", ")}`,
    );
  }, 30_000);
});


