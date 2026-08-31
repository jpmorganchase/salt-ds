import { describe, expect, it } from "vitest";

// The repository Vitest include discovers .spec.js files.

import {
  assertCrlfNonRegression,
  chunkPaths,
  collectChangedFiles,
  collectChangedPaths,
  crlfAffectsGitObject,
  runQualityTools,
  validateExactBase,
  validateRepositoryPath,
} from "./checkChangedQuality.mjs";

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
  });

  it("sorts and deduplicates every Git change source", () => {
    const base = "a".repeat(40);
    const outputs = [
      "M\0z.ts\0M\0space name.md\0",
      "A\0a.json\0",
      "M\0z.ts\0",
      "new.ts\0",
    ];
    let index = 0;
    expect(collectChangedPaths(base, () => outputs[index++])).toEqual([
      "a.json",
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
  });
});
