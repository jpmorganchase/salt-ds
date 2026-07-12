import { describe, expect, it } from "vitest";

import { createBatches, normalizeLineEndings } from "./checkBiome.mjs";

describe("cross-platform Biome check", () => {
  it("normalizes LF, CRLF, and mixed content for comparison", () => {
    expect(normalizeLineEndings("one\r\ntwo\nthree\rfour")).toBe(
      "one\ntwo\nthree\nfour",
    );
  });

  it("batches paths below the command-line character limit", () => {
    expect(createBatches(["one.ts", "two.ts", "three.ts"], 15)).toEqual([
      ["one.ts", "two.ts"],
      ["three.ts"],
    ]);
  });
});
