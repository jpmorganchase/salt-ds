import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

type PackageManifest = {
  files?: string[];
  publishAdditionalEntryPaths?: string[];
  publishBundledWorkspaceDependencies?: string[];
  publishConfig?: {
    directory?: string;
  };
  publishExports?: Record<string, unknown>;
  publishExtraCopyPaths?: Array<string | { from: string; to: string }>;
};

function readJson<T>(relativePath: string): T {
  return JSON.parse(
    readFileSync(new URL(relativePath, import.meta.url), "utf8"),
  ) as T;
}

const FORBIDDEN_RUNTIME_FILE_ENTRIES = [
  "docs",
  "src",
  "__tests__",
  "eval-fixtures",
  "fixtures",
  "host-results",
  "workflow-examples",
  "baselines",
  "archive",
];

const FORBIDDEN_EVAL_PAYLOAD_REFERENCES = [
  "docs",
  "__tests__",
  "eval-fixtures",
  "fixtures",
  "host-results",
  "workflow-examples",
  "baselines",
  "archive",
  "replay-traces",
];

const SHARED_WORKFLOW_DEPENDENCIES = [
  "@salt-ds/runtime-inspector-core",
  "@salt-ds/semantic-core",
];

function expectEntriesToExclude(
  entries: string[] | undefined,
  forbidden: string[],
) {
  expect(entries).toBeDefined();
  for (const entry of entries ?? []) {
    const normalized = entry.replace(/\\/g, "/");
    expect(normalized).not.toEqual(
      expect.stringMatching(new RegExp(`(^|/)(${forbidden.join("|")})(/|$)`)),
    );
  }
}

describe("package publish boundaries", () => {
  it("keeps MCP published file roots limited to runtime payload", () => {
    const manifest = readJson<PackageManifest>("../../package.json");

    expect(manifest.publishConfig?.directory).toBe("../../dist/salt-ds-mcp");
    expect(manifest.files).toEqual(["bin", "generated", "schemas"]);
    expectEntriesToExclude(manifest.files, FORBIDDEN_RUNTIME_FILE_ENTRIES);
    expect(manifest.publishBundledWorkspaceDependencies).toEqual(
      SHARED_WORKFLOW_DEPENDENCIES,
    );
    expect(Object.keys(manifest.publishExports ?? {})).toEqual([
      ".",
      "./package.json",
    ]);
  });

  it("keeps CLI published file roots limited to fallback runtime payload", () => {
    const manifest = readJson<PackageManifest>("../../../cli/package.json");

    expect(manifest.publishConfig?.directory).toBe("../../dist/salt-ds-cli");
    expect(manifest.files).toEqual(["bin", "generated"]);
    expectEntriesToExclude(manifest.files, FORBIDDEN_RUNTIME_FILE_ENTRIES);
    expect(manifest.publishBundledWorkspaceDependencies).toEqual(
      SHARED_WORKFLOW_DEPENDENCIES,
    );
    expect(manifest.publishExtraCopyPaths).toEqual([
      {
        from: "../semantic-core/schemas",
        to: "schemas",
      },
    ]);
  });

  it("allows only explicit MCP eval runner entrypoints, not fixture payloads", () => {
    const manifest = readJson<PackageManifest>("../../package.json");

    expect(manifest.publishAdditionalEntryPaths).toEqual([
      "src/evals/runWorkflowEval.ts",
      "src/evals/runWorkflowEvalReplay.ts",
      "src/evals/runHostTraceEval.ts",
    ]);
    for (const entryPath of manifest.publishAdditionalEntryPaths ?? []) {
      expect(entryPath).toMatch(/^src\/evals\/run[A-Z].+\.ts$/);
      expect(entryPath).not.toMatch(/fixture|replay-trace|host-results/i);
    }
    expectEntriesToExclude(
      manifest.publishAdditionalEntryPaths,
      FORBIDDEN_EVAL_PAYLOAD_REFERENCES,
    );
  });
});
