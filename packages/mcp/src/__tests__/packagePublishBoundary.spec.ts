import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

type PackageManifest = {
  name?: string;
  files?: string[];
  dependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  peerDependenciesMeta?: Record<string, { optional?: boolean }>;
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

const REPO_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  "..",
  "..",
);

function readWorkspacePackageManifest(packageName: string): PackageManifest {
  // Workspace packages live under packages/<unscoped-name>/package.json.
  const unscopedName = packageName.startsWith("@salt-ds/")
    ? packageName.slice("@salt-ds/".length)
    : packageName;
  const manifestPath = path.join(
    REPO_ROOT,
    "packages",
    unscopedName,
    "package.json",
  );
  return JSON.parse(readFileSync(manifestPath, "utf8")) as PackageManifest;
}

/**
 * Mirrors `scripts/build.mjs::collectBundledWorkspaceDependencies` (including
 * the "skip optional peerDependencies" rule introduced by Phase 0 task 0.1)
 * so that this spec asserts the exact transitive dep set that will land in
 * the published `dependencies` of a workspace package.
 */
function collectPublishedTransitiveDependencies(
  rootPackageName: string,
  bundledWorkspaceDeps: string[],
  visited: Set<string> = new Set(),
): Record<string, string> {
  const collected: Record<string, string> = {};

  for (const dependencyName of bundledWorkspaceDeps) {
    if (visited.has(dependencyName)) {
      continue;
    }
    visited.add(dependencyName);

    const manifest = readWorkspacePackageManifest(dependencyName);
    const optionalPeerNames = new Set(
      Object.entries(manifest.peerDependenciesMeta ?? {})
        .filter(([, meta]) => meta && meta.optional === true)
        .map(([name]) => name),
    );
    const requiredPeerDependencies = Object.fromEntries(
      Object.entries(manifest.peerDependencies ?? {}).filter(
        ([name]) => !optionalPeerNames.has(name),
      ),
    );
    const bundledPackageDependencies = {
      ...requiredPeerDependencies,
      ...(manifest.dependencies ?? {}),
    };
    const nestedWorkspaceDeps: string[] = [];

    for (const [depName, version] of Object.entries(
      bundledPackageDependencies,
    )) {
      if (typeof version !== "string") {
        continue;
      }
      if (version.startsWith("workspace:")) {
        nestedWorkspaceDeps.push(depName);
        continue;
      }
      collected[depName] ??= version;
    }

    if (nestedWorkspaceDeps.length > 0) {
      const nested = collectPublishedTransitiveDependencies(
        rootPackageName,
        nestedWorkspaceDeps,
        visited,
      );
      for (const [name, version] of Object.entries(nested)) {
        collected[name] ??= version;
      }
    }
  }

  return collected;
}

const PLAYWRIGHT_PACKAGE_NAMES = [
  "playwright",
  "playwright-core",
  "@playwright/test",
];

function assertNoPlaywrightInTransitiveDeps(
  packageName: string,
  bundledWorkspaceDeps: string[],
) {
  const transitive = collectPublishedTransitiveDependencies(
    packageName,
    bundledWorkspaceDeps,
  );
  const transitiveNames = Object.keys(transitive);
  for (const playwrightName of PLAYWRIGHT_PACKAGE_NAMES) {
    expect(
      transitiveNames,
      `${packageName} should not bundle ${playwrightName} (got: ${transitiveNames.join(", ")})`,
    ).not.toContain(playwrightName);
  }
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
    expect(manifest.files).toEqual(["bin"]);
    expectEntriesToExclude(manifest.files, FORBIDDEN_RUNTIME_FILE_ENTRIES);
    expect(manifest.publishBundledWorkspaceDependencies).toEqual(
      SHARED_WORKFLOW_DEPENDENCIES,
    );
    expect(Object.keys(manifest.publishExports ?? {})).toEqual([
      ".",
      "./package.json",
    ]);
    expect(manifest.publishExtraCopyPaths).toEqual([
      {
        from: "../semantic-core/generated",
        to: "generated",
      },
      {
        from: "../semantic-core/schemas",
        to: "schemas",
      },
    ]);
  });

  it("keeps CLI published file roots limited to fallback runtime payload", () => {
    const manifest = readJson<PackageManifest>("../../../cli/package.json");

    expect(manifest.publishConfig?.directory).toBe("../../dist/salt-ds-cli");
    expect(manifest.files).toEqual(["bin"]);
    expectEntriesToExclude(manifest.files, FORBIDDEN_RUNTIME_FILE_ENTRIES);
    expect(manifest.publishBundledWorkspaceDependencies).toEqual(
      SHARED_WORKFLOW_DEPENDENCIES,
    );
    expect(manifest.publishExtraCopyPaths).toEqual([
      {
        from: "../semantic-core/generated",
        to: "generated",
      },
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

  it("does not bundle playwright into the published @salt-ds/cli transitive dependency tree (Phase 0 task 0.1)", () => {
    assertNoPlaywrightInTransitiveDeps(
      "@salt-ds/cli",
      SHARED_WORKFLOW_DEPENDENCIES,
    );
  });

  it("does not bundle playwright into the published @salt-ds/mcp transitive dependency tree (Phase 0 task 0.1)", () => {
    assertNoPlaywrightInTransitiveDeps(
      "@salt-ds/mcp",
      SHARED_WORKFLOW_DEPENDENCIES,
    );
  });

  it("declares playwright as an optional peer of @salt-ds/runtime-inspector-core so the build script keeps it unbundled", () => {
    const manifest = readWorkspacePackageManifest(
      "@salt-ds/runtime-inspector-core",
    );
    expect(manifest.peerDependencies?.playwright).toBeDefined();
    expect(manifest.peerDependenciesMeta?.playwright?.optional).toBe(true);
    expect(manifest.dependencies?.playwright).toBeUndefined();
  });
});
