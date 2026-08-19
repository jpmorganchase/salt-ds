import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { assertBoundedMcpToolPayload } from "../../../../scripts/consumer-smoke/checks.mjs";
import {
  createWindowsCmdInvocation,
  parseArgs,
  runCommand,
} from "../../../../scripts/consumer-smoke/shared.mjs";

const tempRoots: string[] = [];
const commit = "a".repeat(40);

afterEach(async () => {
  await Promise.all(
    tempRoots
      .splice(0)
      .map((root) => fs.rm(root, { recursive: true, force: true })),
  );
});

describe("consumer smoke arguments", () => {
  it("keeps local packed smoke as the default", () => {
    expect(parseArgs(["--skip-build"])).toMatchObject({
      published: false,
      skipBuild: true,
      mcpSpec: undefined,
    });
  });

  it("requires a complete exact published package identity", () => {
    expect(() => parseArgs(["--published"])).toThrow(/mcp-spec/iu);
    expect(() =>
      parseArgs([
        "--published",
        "--mcp-spec",
        "@salt-ds/mcp@latest",
        "--expected-version",
        "0.1.0",
        "--expected-git-head",
        commit,
      ]),
    ).toThrow(/exact non-snapshot/iu);
    expect(() =>
      parseArgs([
        "--published",
        "--mcp-spec",
        "@salt-ds/mcp@0.1.0-snapshot-test",
        "--expected-version",
        "0.1.0-snapshot-test",
        "--expected-git-head",
        commit,
      ]),
    ).toThrow(/exact non-snapshot/iu);
    expect(() =>
      parseArgs([
        "--published",
        "--mcp-spec",
        "@salt-ds/mcp@0.1.0",
        "--expected-version",
        "0.1.1",
        "--expected-git-head",
        commit,
      ]),
    ).toThrow(/same version/iu);
  });

  it("rejects unknown options instead of silently skipping retired checks", () => {
    expect(() => parseArgs(["--retired-option"])).toThrow(
      /unknown consumer smoke option/iu,
    );
  });
});

describe("consumer smoke Windows command invocation", () => {
  it("escapes cmd metacharacters before invoking package-manager shims", () => {
    const invocation = createWindowsCmdInvocation("yarn.cmd", [
      "C:\\consumer & proof\\100%\\(fixture)^.tgz",
    ]);
    expect(invocation.windowsVerbatimArguments).toBe(true);
    expect(invocation.args).toHaveLength(4);
    expect(invocation.args[3]).toContain("^^^&");
    expect(invocation.args[3]).toContain("^^^%");
    expect(invocation.args[3]).toContain("^^^(");
    expect(invocation.args[3]).toContain("^^^)");
    expect(invocation.args[3]).toContain("^^^");
  });

  it.skipIf(process.platform !== "win32")(
    "round-trips a metacharacter path through a real cmd shim",
    async () => {
      const root = await fs.mkdtemp(
        path.join(os.tmpdir(), "salt & 100% (cmd-proof)-"),
      );
      tempRoots.push(root);
      const shim = path.join(root, "echo-arg.cmd");
      await fs.writeFile(
        shim,
        '@echo off\r\nnode -e "process.stdout.write(process.argv[1])" %*\r\n',
        "utf8",
      );
      const value = path.join(root, "artifact & 100% (proof)^.tgz");
      const result = await runCommand(shim, [value], {
        cwd: root,
        label: "Windows cmd metacharacter proof",
      });
      expect(result.stdout).toBe(value);
    },
  );
});

describe("consumer smoke process bounds", () => {
  it("terminates a child process that exceeds its declared timeout", async () => {
    await expect(
      runCommand(process.execPath, ["-e", "setInterval(() => {}, 1000)"], {
        label: "timeout fixture",
        timeoutMs: 25,
      }),
    ).rejects.toThrow(/exceeded its 25ms timeout/iu);
  });
});

describe("consumer smoke bounded outcomes", () => {
  const validPayload = {
    data: { results: [] },
    scope: { kind: "submitted_text_only" },
    coverage: { submitted_artifacts: 0, evaluated_artifacts: 0 },
    limitations: ["Only submitted text was evaluated."],
  };

  it("requires data, explicit scope, limitations, and no completion claims", () => {
    expect(() =>
      assertBoundedMcpToolPayload(
        { ...validPayload, scope: { kind: "catalog_search" } },
        "submitted_text_only",
        "Expected a bounded review payload.",
      ),
    ).toThrow(/bounded review/iu);
    expect(() =>
      assertBoundedMcpToolPayload(
        validPayload,
        "submitted_text_only",
        "Expected a bounded review payload.",
      ),
    ).not.toThrow();
  });
});

describe("consumer smoke packed-install coverage", () => {
  it("keeps local-only scripts out of the package and verifies the configured standalone binary", async () => {
    const [manifestText, fixtureSource, runnerSource] = await Promise.all([
      fs.readFile(
        path.resolve(import.meta.dirname, "../../package.json"),
        "utf8",
      ),
      fs.readFile(
        path.resolve(
          import.meta.dirname,
          "../../../../scripts/consumer-smoke/fixture.mjs",
        ),
        "utf8",
      ),
      fs.readFile(
        path.resolve(
          import.meta.dirname,
          "../../../../scripts/consumerRepoSmoke.mjs",
        ),
        "utf8",
      ),
    ]);
    const manifest = JSON.parse(manifestText) as {
      publishScriptExcludes?: string[];
    };

    expect(manifest.publishScriptExcludes).toContain("measure:runtime-loc");
    expect(fixtureSource).not.toContain("siteBaseUrl");
    expect(fixtureSource).toContain(
      "export async function verifyStandaloneConsumerExample(",
    );
    expect(fixtureSource).toContain(
      "installSpec = `@salt-ds/mcp@file:./$" + "{localTarballName}`",
    );
    expect(fixtureSource).toContain(
      "Standalone Yarn lock is not bound to the exact local tarball and checksum.",
    );
    expect(fixtureSource).toContain("verifyIsolatedConsumerBrowserArtifact(");
    expect(fixtureSource).toContain(
      "npm ci replay of packed Salt MCP dependency tree",
    );
    expect(fixtureSource).toContain(
      "Standalone example MCP configuration did not resolve to the installed binary.",
    );
    expect(runnerSource).toContain("standaloneMcpSpec");
    expect(runnerSource).toContain(
      "expectedVersion: standaloneExpectedVersion",
    );
  });
});
