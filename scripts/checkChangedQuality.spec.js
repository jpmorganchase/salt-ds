import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { describe, expect, it } from "vitest";

// The repository Vitest include discovers .spec.js files.

import {
  assertCrlfNonRegression,
  checkChangedQuality,
  chunkPaths,
  collectChangedFiles,
  collectChangedPaths,
  crlfAffectsGitObject,
  resolveGitHubEventBase,
  runQualityTools,
  validateExactBase,
  validateRepositoryPath,
} from "./checkChangedQuality.mjs";

function createEventGit({
  mergeBase = "b".repeat(40),
  remoteTip = "c".repeat(40),
} = {}) {
  const calls = [];
  const runGit = (arguments_) => {
    calls.push(arguments_);
    if (arguments_[0] === "check-ref-format") return "";
    if (
      arguments_[0] === "rev-parse" &&
      arguments_[2]?.startsWith("refs/remotes/")
    )
      return `${remoteTip}\n`;
    if (arguments_[0] === "merge-base" && arguments_[1] === "HEAD")
      return `${mergeBase}\n`;
    if (arguments_[0] === "rev-parse") {
      const exact = arguments_[2]?.match(/^([0-9a-f]{40})\^\{commit\}$/u);
      if (exact) return `${exact[1]}\n`;
    }
    if (arguments_[0] === "merge-base" && arguments_[1] === "--is-ancestor")
      return "";
    throw new Error(`Unexpected Git call: ${arguments_.join(" ")}`);
  };
  return { calls, runGit };
}

describe("checkChangedQuality", () => {
  it("requires an exact available ancestor commit", () => {
    const base = "a".repeat(40);
    const calls = [];
    expect(
      validateExactBase(base, (arguments_) => {
        calls.push(arguments_);
        return arguments_[0] === "rev-parse" ? `${base}\n` : "";
      }),
    ).toBe(base);
    expect(calls).toEqual([
      ["rev-parse", "--verify", `${base}^{commit}`],
      ["merge-base", "--is-ancestor", base, "HEAD"],
    ]);
    expect(() => validateExactBase("HEAD", () => "")).toThrow(
      /full lowercase/u,
    );
    expect(() => validateExactBase(base, () => `${"b".repeat(40)}\n`)).toThrow(
      /exact requested/u,
    );
    expect(() =>
      validateExactBase(base, () => {
        throw new Error("commit is unavailable in a shallow checkout");
      }),
    ).toThrow(/shallow checkout/u);
  });

  it("derives pull-request bases from the fetched target branch", () => {
    const mergeBase = "b".repeat(40);
    const remoteTip = "c".repeat(40);
    const { calls, runGit } = createEventGit({ mergeBase, remoteTip });
    expect(
      resolveGitHubEventBase(
        "pull_request",
        { pull_request: { base: { ref: "main" } } },
        runGit,
      ),
    ).toBe(mergeBase);
    expect(calls.slice(0, 3)).toEqual([
      ["check-ref-format", "refs/heads/main"],
      ["rev-parse", "--verify", "refs/remotes/origin/main^{commit}"],
      ["merge-base", "HEAD", remoteTip],
    ]);
  });

  it("uses an ordinary push before SHA only when it is an ancestor", () => {
    const before = "d".repeat(40);
    const { calls, runGit } = createEventGit();
    expect(
      resolveGitHubEventBase(
        "push",
        { before, created: false, forced: false },
        runGit,
      ),
    ).toBe(before);
    expect(calls).toEqual([
      ["rev-parse", "--verify", `${before}^{commit}`],
      ["merge-base", "--is-ancestor", before, "HEAD"],
    ]);

    expect(() =>
      resolveGitHubEventBase(
        "push",
        { before, created: false, forced: true },
        runGit,
      ),
    ).toThrow(/Force-push/u);
    expect(() =>
      resolveGitHubEventBase(
        "push",
        { before, created: false, forced: false },
        (arguments_) => {
          if (arguments_[0] === "rev-parse") return `${before}\n`;
          throw new Error("not an ancestor");
        },
      ),
    ).toThrow(/not an ancestor/u);
  });

  it("derives new-branch push bases from the fetched default branch", () => {
    const mergeBase = "e".repeat(40);
    const { calls, runGit } = createEventGit({ mergeBase });
    expect(
      resolveGitHubEventBase(
        "push",
        {
          before: "0".repeat(40),
          created: true,
          forced: false,
          repository: { default_branch: "main" },
        },
        runGit,
      ),
    ).toBe(mergeBase);
    expect(calls[0]).toEqual(["check-ref-format", "refs/heads/main"]);
    expect(() =>
      resolveGitHubEventBase(
        "push",
        {
          before: "0".repeat(40),
          created: false,
          forced: false,
          repository: { default_branch: "main" },
        },
        runGit,
      ),
    ).toThrow(/inconsistent/u);
  });

  it("requires an exact reviewed workflow-dispatch base", () => {
    const base = "f".repeat(40);
    const { runGit } = createEventGit();
    expect(
      resolveGitHubEventBase(
        "workflow_dispatch",
        { inputs: { changed_quality_base: base } },
        runGit,
      ),
    ).toBe(base);
    expect(() =>
      resolveGitHubEventBase(
        "workflow_dispatch",
        { inputs: { changed_quality_base: "HEAD^" } },
        runGit,
      ),
    ).toThrow(/full lowercase/u);
    expect(() =>
      resolveGitHubEventBase(
        "pull_request",
        { pull_request: { base: { ref: "../main" } } },
        () => {
          throw new Error("invalid ref");
        },
      ),
    ).toThrow(/invalid ref/u);
  });

  it("sorts and deduplicates every Git change source", () => {
    const base = "a".repeat(40);
    const outputs = [
      "D\0deleted.ts\0M\0z.ts\0M\0space name.md\0",
      "A\0a.json\0",
      "M\0z.ts\0",
      "new.ts\0",
    ];
    let index = 0;
    expect(collectChangedPaths(base, () => outputs[index++])).toEqual([
      "a.json",
      "deleted.ts",
      "new.ts",
      "space name.md",
      "z.ts",
    ]);
  });

  it("preserves rename provenance when selecting the base blob", () => {
    const outputs = [
      "R100\0old.ts\0mid.ts\0",
      "R100\0mid.ts\0new.ts\0",
      "",
      "",
    ];
    let index = 0;
    expect(collectChangedFiles("a".repeat(40), () => outputs[index++])).toEqual(
      [
        { path: "mid.ts", basePath: "mid.ts" },
        { path: "new.ts", basePath: "old.ts" },
      ],
    );
  });

  it("handles rename reversals and reused pathnames in snapshot order", () => {
    let outputs = ["R100\0a.ts\0b.ts\0", "R100\0b.ts\0a.ts\0", "", ""];
    let index = 0;
    expect(collectChangedFiles("a".repeat(40), () => outputs[index++])).toEqual(
      [
        { path: "a.ts", basePath: "a.ts" },
        { path: "b.ts", basePath: "b.ts" },
      ],
    );

    outputs = ["R100\0a.ts\0b.ts\0", "A\0a.ts\0", "", ""];
    index = 0;
    expect(collectChangedFiles("a".repeat(40), () => outputs[index++])).toEqual(
      [
        { path: "a.ts", basePath: null },
        { path: "b.ts", basePath: "a.ts" },
      ],
    );
  });

  it("fails closed when Git returns a path that is not valid UTF-8", () => {
    const invalidPath = Buffer.from([
      0x4d, 0, 0x62, 0x61, 0x64, 0xff, 0x2e, 0x74, 0x73, 0,
    ]);
    expect(() =>
      collectChangedPaths("a".repeat(40), () => invalidPath),
    ).toThrow(/not valid UTF-8/u);
  });

  it("rejects unsafe or option-like paths", () => {
    for (const file of [
      "../escape.ts",
      "/absolute.ts",
      "bad\\path.ts",
      "a//b.ts",
      "-x.ts",
      "a:\\b.ts",
      "line\nbreak.ts",
    ]) {
      expect(() => validateRepositoryPath(file)).toThrow();
    }
  });

  it("contains CRLF debt without requiring unrelated normalization", () => {
    expect(() =>
      assertCrlfNonRegression(
        "same.ts",
        Buffer.from("a\r\nb\n"),
        Buffer.from("a\r\nb\n"),
      ),
    ).not.toThrow();
    expect(() =>
      assertCrlfNonRegression(
        "better.ts",
        Buffer.from("a\nb\n"),
        Buffer.from("a\r\nb\n"),
      ),
    ).not.toThrow();
    expect(() =>
      assertCrlfNonRegression("new.ts", Buffer.from("a\r\n"), null),
    ).toThrow(/increases CRLF/u);
  });

  it("uses Git clean filters before treating checkout CRLF as debt", () => {
    const calls = [];
    expect(
      crlfAffectsGitObject(
        "windows.ts",
        Buffer.from("a\r\nb\r\n"),
        (arguments_, options) => {
          calls.push([arguments_, options]);
          return "same-object\n";
        },
      ),
    ).toBe(false);
    expect(calls).toHaveLength(2);
    expect(calls[0][0]).toEqual([
      "hash-object",
      "--path=windows.ts",
      "--stdin",
    ]);
    expect(calls[0][1].input).toEqual(Buffer.from("a\r\nb\r\n"));
    expect(calls[1][1].input).toEqual(Buffer.from("a\nb\n"));

    let invocation = 0;
    expect(
      crlfAffectsGitObject(
        "preserved.ts",
        Buffer.from("a\r\n"),
        () => `${invocation++}\n`,
      ),
    ).toBe(true);
  });

  it("rejects raw CRLF in a new file even when Git filters would normalize it", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "salt-changed-quality-"));
    const base = "a".repeat(40);
    try {
      await writeFile(path.join(root, "new.ts"), "const value = 1;\r\n");
      const runGit = (arguments_) => {
        if (arguments_[0] === "rev-parse") return `${base}\n`;
        if (arguments_[0] === "merge-base" && arguments_[1] === "--is-ancestor")
          return "";
        if (arguments_[0] === "diff" && arguments_.includes(`${base}..HEAD`))
          return "";
        if (arguments_[0] === "diff" && arguments_.includes("--cached"))
          return "A\0new.ts\0";
        if (arguments_[0] === "diff") return "";
        if (arguments_[0] === "ls-files") return "";
        throw new Error(`Unexpected Git call: ${arguments_.join(" ")}`);
      };
      await expect(
        checkChangedQuality({
          base,
          root,
          runGit,
          runTool: () => {
            throw new Error("Quality tools should not run");
          },
        }),
      ).rejects.toThrow(/increases CRLF count from 0 to 1/u);
    } finally {
      await rm(root, { force: true, recursive: true });
    }
  });

  it("chunks commands and keeps Biome formatting disabled", () => {
    expect(chunkPaths(["a.ts", "long-name.ts", "b.md"], 12)).toEqual([
      ["a.ts"],
      ["long-name.ts"],
      ["b.md"],
    ]);
    const calls = [];
    runQualityTools(["a.ts", "b.md"], (tool, arguments_) =>
      calls.push([tool, arguments_]),
    );
    expect(calls[0]).toEqual([
      "prettier",
      [
        "--check",
        "--end-of-line",
        "auto",
        "--ignore-path",
        "scripts/fixtures/changed-quality/prettierignore",
        "--",
        "a.ts",
        "b.md",
      ],
    ]);
    expect(calls[1]).toEqual([
      "biome",
      [
        "check",
        "--formatter-enabled=false",
        "--diagnostic-level=error",
        "a.ts",
      ],
    ]);
  });

  it("propagates formatter and linter failures", () => {
    expect(() =>
      runQualityTools(["a.ts"], (tool) => {
        throw new Error(`${tool} failed`);
      }),
    ).toThrow(/prettier failed/u);
    expect(() =>
      runQualityTools(["a.ts"], (tool) => {
        if (tool === "biome") throw new Error("biome failed");
      }),
    ).toThrow(/biome failed/u);
  });

  it("does not invoke quality tools when no supported files changed", () => {
    const calls = [];
    runQualityTools([], (...arguments_) => calls.push(arguments_));
    expect(calls).toEqual([]);
  });

  it("keeps changed-file quality blocking and full-tree formatting diagnostic in CI", async () => {
    const workflow = await readFile(
      new URL("../.github/workflows/test.yml", import.meta.url),
      "utf8",
    );
    expect(workflow).toMatch(
      /workflow_dispatch:\s+inputs:\s+changed_quality_base:[\s\S]+required: true/u,
    );
    expect(workflow).toMatch(/push:\s+branches:\s+- "\*\*"/u);
    expect(workflow).toContain("fetch-depth: 0");
    expect(workflow).toContain(
      "Changed-file quality (blocking; Prettier is authoritative)",
    );
    expect(workflow).toContain('--event-name "$GITHUB_EVENT_NAME"');
    expect(workflow).toContain('--event-path "$GITHUB_EVENT_PATH"');
    expect(workflow).not.toContain("HEAD^");

    for (const command of [
      "yarn lint:check:error",
      "yarn biome ci --reporter=github",
      "yarn prettier:ci",
    ]) {
      const commandIndex = workflow.indexOf(command);
      expect(commandIndex).toBeGreaterThan(0);
      expect(
        workflow.slice(Math.max(0, commandIndex - 180), commandIndex),
      ).toContain("continue-on-error: true");
    }

    for (const preserved of [
      "yarn run lint:style",
      "Check no import from src",
      "yarn workspace @salt-ds/site spellcheck",
      "yarn check:ai-tooling:pack",
      "yarn run typecheck",
      "yarn run test",
    ])
      expect(workflow).toContain(preserved);
  });
});
