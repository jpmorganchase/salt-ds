import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { assertBoundedMcpToolPayload } from "../../../../scripts/consumer-smoke/checks.mjs";
import { verifyPackedReadmeLocalLinks } from "../../../../scripts/consumer-smoke/fixture.mjs";
import {
  createWindowsCmdInvocation,
  parseArgs,
  runCommand,
} from "../../../../scripts/consumer-smoke/shared.mjs";
import {
  canonicalizeSkillRecords,
  hashCanonicalSkillTree,
  normalizeRelativeSkillPath,
} from "../../../../scripts/consumer-smoke/skillTreeHash.mjs";

const tempRoots: string[] = [];
const commit = "a".repeat(40);
const treeHash = "b".repeat(64);

afterEach(async () => {
  await Promise.all(
    tempRoots
      .splice(0)
      .map((root) => fs.rm(root, { recursive: true, force: true })),
  );
});

async function createTree(files: Record<string, string | Buffer>) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "salt-skill-hash-"));
  tempRoots.push(root);
  for (const [relativePath, contents] of Object.entries(files)) {
    const destination = path.join(root, relativePath);
    await fs.mkdir(path.dirname(destination), { recursive: true });
    await fs.writeFile(destination, contents);
  }
  return root;
}

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

  it("accepts the skill only as a paired immutable identity", () => {
    const base = [
      "--published",
      "--mcp-spec",
      "@salt-ds/mcp@0.1.0",
      "--expected-version",
      "0.1.0",
      "--expected-git-head",
      commit,
    ];

    expect(parseArgs(base)).toMatchObject({
      published: true,
      skillsSource: undefined,
    });
    expect(() =>
      parseArgs([...base, "--skills-source", "https://example.com/main"]),
    ).toThrow(/together/iu);
    expect(() =>
      parseArgs([
        ...base,
        "--skills-source",
        "https://github.com/jpmorganchase/salt-ds/tree/main/packages/skills",
        "--expected-skill-tree-hash",
        treeHash,
      ]),
    ).toThrow(/immutable/iu);
    expect(
      parseArgs([
        ...base,
        "--skills-source",
        `https://github.com/jpmorganchase/salt-ds/tree/${commit}/packages/skills`,
        "--expected-skill-tree-hash",
        treeHash,
      ]),
    ).toMatchObject({ expectedSkillTreeHash: treeHash });
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
  it("verifies package-local README targets without claiming to fetch external URLs", async () => {
    const root = await createTree({
      "README.md": [
        "[architecture](./CORE_ARCHITECTURE.md#local-filesystem-trust-model)",
        "[website](https://www.saltdesignsystem.com/)",
      ].join("\n"),
      "CORE_ARCHITECTURE.md": "## Local filesystem trust model\n",
    });

    await expect(verifyPackedReadmeLocalLinks(root)).resolves.toEqual({
      local_targets_verified: 1,
      external_urls_not_fetched: 1,
    });
  });

  it("rejects missing, escaping, and unsupported packed README targets", async () => {
    const missing = await createTree({
      "README.md": "[architecture](./CORE_ARCHITECTURE.md)",
    });
    await expect(verifyPackedReadmeLocalLinks(missing)).rejects.toThrow(
      /does not exist in the installed package/iu,
    );

    const escaping = await createTree({
      "README.md": "[outside](../outside.md)",
    });
    await expect(verifyPackedReadmeLocalLinks(escaping)).rejects.toThrow(
      /escapes the installed package/iu,
    );

    const unsupported = await createTree({
      "README.md": "[custom](custom:target)",
    });
    await expect(verifyPackedReadmeLocalLinks(unsupported)).rejects.toThrow(
      /unsupported URI scheme/iu,
    );
  });

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

describe("canonical skill-tree hash", () => {
  it("normalizes text newlines and Windows separators", () => {
    const lf = canonicalizeSkillRecords([
      { path: "references/core.md", bytes: Buffer.from("a\nb\n") },
    ]);
    const crlf = canonicalizeSkillRecords([
      { path: "references\\core.md", bytes: Buffer.from("a\r\nb\r\n") },
    ]);
    expect(crlf).toEqual(lf);
  });

  it("hashes binary bytes exactly and sorts in code-point order", () => {
    const first = canonicalizeSkillRecords([
      { path: "z.bin", bytes: Buffer.from([0, 13, 10, 255]) },
      { path: "A.md", bytes: Buffer.from("a") },
    ]);
    const reordered = canonicalizeSkillRecords([
      { path: "A.md", bytes: Buffer.from("a") },
      { path: "z.bin", bytes: Buffer.from([0, 13, 10, 255]) },
    ]);
    const changed = canonicalizeSkillRecords([
      { path: "A.md", bytes: Buffer.from("a") },
      { path: "z.bin", bytes: Buffer.from([0, 10, 255]) },
    ]);

    expect(first).toEqual(reordered);
    expect(
      first.records.map((record: { path: string }) => record.path),
    ).toEqual(["A.md", "z.bin"]);
    expect(first.sha256).not.toBe(changed.sha256);
  });

  it("changes for additions and rejects unsafe, duplicate, or invalid text records", () => {
    const one = canonicalizeSkillRecords([
      { path: "SKILL.md", bytes: Buffer.from("one") },
    ]);
    const two = canonicalizeSkillRecords([
      { path: "SKILL.md", bytes: Buffer.from("one") },
      { path: "references/core.md", bytes: Buffer.from("two") },
    ]);
    expect(one.sha256).not.toBe(two.sha256);
    expect(() => normalizeRelativeSkillPath("../SKILL.md")).toThrow(/unsafe/iu);
    expect(() => normalizeRelativeSkillPath("C:\\SKILL.md")).toThrow(
      /relative/iu,
    );
    expect(() =>
      canonicalizeSkillRecords([
        { path: "SKILL.md", bytes: Buffer.from("one") },
        { path: "SKILL.md", bytes: Buffer.from("two") },
      ]),
    ).toThrow(/duplicate/iu);
    expect(() =>
      canonicalizeSkillRecords([
        { path: "SKILL.md", bytes: Buffer.from([0xc3, 0x28]) },
      ]),
    ).toThrow(/invalid UTF-8/iu);
  });

  it("walks every regular file and rejects links", async () => {
    const root = await createTree({
      "SKILL.md": "router\n",
      "references/core.md": "core\n",
    });
    const result = await hashCanonicalSkillTree(root);
    expect(
      result.records.map((record: { path: string }) => record.path),
    ).toEqual(["SKILL.md", "references/core.md"]);

    try {
      await fs.symlink(
        path.join(root, "SKILL.md"),
        path.join(root, "escape.md"),
        "file",
      );
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "EPERM") return;
      throw error;
    }
    await expect(hashCanonicalSkillTree(root)).rejects.toThrow(
      /symlink|junction/iu,
    );
  });
});
