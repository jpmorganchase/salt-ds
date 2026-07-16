import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { parseArgs } from "../../../../scripts/consumer-smoke/shared.mjs";
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
