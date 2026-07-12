import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

type PackageManifest = {
  name?: string;
  engines?: Record<string, string>;
  files?: string[];
  dependencies?: Record<string, string>;
  publishEntryPath?: string;
  publishAdditionalEntryPaths?: string[];
  publishBundledWorkspaceDependencies?: string[];
  publishBinEntrypoints?: Record<
    string,
    { requirePath?: string; errorPrefix?: string }
  >;
  publishConfig?: {
    directory?: string;
  };
  publishExports?: Record<string, unknown>;
  publishExtraCopyPaths?: Array<
    string | { from: string; to: string; files?: string[] }
  >;
  publishPreserveModules?: boolean;
  publishScriptExcludes?: string[];
  publishTypingEntryPath?: string;
  publishTypingEntryOnly?: boolean;
  typescriptInclude?: string[];
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
  it("keeps clean-build prop prerequisites aligned with site generation", () => {
    const registryBuilder = readFileSync(
      new URL("../../scripts/buildRegistry.mjs", import.meta.url),
      "utf8",
    );
    const sitePropsGenerator = readFileSync(
      new URL("../../../../site/propsGen.js", import.meta.url),
      "utf8",
    );
    const requiredPropFiles = Array.from(
      registryBuilder.matchAll(/^\s+"([^"]+-props\.json)",$/gmu),
      (match) => match[1],
    );
    const generatedPropFiles = Array.from(
      sitePropsGenerator.matchAll(/^\s+"([^"]+)",$/gmu),
      (match) => `${match[1]}-props.json`,
    );

    expect(requiredPropFiles).not.toHaveLength(0);
    expect(generatedPropFiles).toEqual(
      expect.arrayContaining(requiredPropFiles),
    );
    expect(registryBuilder).toContain('path.join(repoRoot, ".yarnrc.yml")');
    expect(registryBuilder).toContain("yarnPath:");
    expect(registryBuilder).toContain("process.execPath");
    expect(registryBuilder).toContain("result.error");
    expect(registryBuilder).not.toContain('spawnSync("yarn.cmd"');
  });

  it("keeps MCP published file roots limited to runtime payload", () => {
    const manifest = readJson<PackageManifest>("../../package.json");

    expect(manifest.publishConfig?.directory).toBe("../../dist/salt-ds-mcp");
    expect(manifest.engines?.node).toBe(">=22");
    expect(manifest.files).toEqual(["bin"]);
    expect(manifest.typescriptInclude).toEqual(["src/index.ts"]);
    expect(manifest.publishEntryPath).toBeUndefined();
    expect(manifest.publishTypingEntryPath).toBeUndefined();
    expect(manifest.publishTypingEntryOnly).toBe(true);
    expect(manifest.publishPreserveModules).toBe(false);
    expectEntriesToExclude(manifest.files, FORBIDDEN_RUNTIME_FILE_ENTRIES);
    expect(manifest.publishBundledWorkspaceDependencies).toBeUndefined();
    expect(manifest.dependencies).not.toHaveProperty("@salt-ds/semantic-core");
    expect(manifest.publishBinEntrypoints).toEqual({
      "bin/salt-mcp.js": {
        requirePath: "../dist-cjs/index.js",
        errorPrefix: "salt-mcp error:",
      },
    });
    expect(manifest.publishScriptExcludes).toEqual([
      "build",
      "build:package",
      "build:registry",
      "prepack",
    ]);
    expect(manifest.publishExports).toEqual({
      ".": {
        types: "./dist-types/index.d.ts",
        import: "./dist-es/index.js",
        require: "./dist-cjs/index.js",
      },
      "./package.json": "./package.json",
    });
    expect(manifest.publishExtraCopyPaths).toEqual([
      {
        from: "generated",
        to: "generated",
        files: [
          "metadata.json",
          "packages.json",
          "components.json",
          "patterns.json",
          "pages.json",
          "guides.json",
          "icons.json",
          "country-symbols.json",
          "tokens.json",
          "deprecations.json",
          "token-policy-structural-role-rules.json",
        ],
      },
    ]);
  });

  it("does not publish MCP eval runner entrypoints or fixture payloads", () => {
    const manifest = readJson<PackageManifest>("../../package.json");

    expect(manifest.publishAdditionalEntryPaths).toBeUndefined();
  });

  it("keeps the workspace CLI on the same single bundled entrypoint", () => {
    const workspaceBin = readFileSync(
      new URL("../../bin/salt-mcp.js", import.meta.url),
      "utf8",
    );

    expect(workspaceBin).toContain(
      "../../../dist/salt-ds-mcp/dist-cjs/index.js",
    );
    expect(workspaceBin).not.toContain("dist-cjs/mcp/src/index.js");
  });

  it("does not declare private workspace or browser-test dependencies", () => {
    const manifest = readJson<PackageManifest>("../../package.json");
    const dependencyNames = Object.keys(manifest.dependencies ?? {});

    expect(dependencyNames).not.toContain("@salt-ds/semantic-core");
    expect(dependencyNames).not.toContain("playwright");
    expect(dependencyNames).not.toContain("playwright-core");
    expect(dependencyNames).not.toContain("@playwright/test");
  });
});
