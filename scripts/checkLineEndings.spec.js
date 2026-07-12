import { describe, expect, it } from "vitest";

import { findInvalidIndexLineEndings } from "./checkLineEndings.mjs";

describe("line-ending policy", () => {
  it("reports CRLF and mixed line endings in the index", () => {
    const output = [
      "i/lf    w/crlf attr/text=auto eol=lf\tgood.ts",
      "i/crlf w/crlf attr/text=auto eol=lf\tbad.ts",
      "i/mixed w/mixed attr/text=auto eol=lf\tmixed.ts",
      "i/none  w/none  attr/-text\tlogo.png",
      "",
    ].join("\0");

    expect(findInvalidIndexLineEndings(output)).toEqual([
      { lineEnding: "i/crlf", path: "bad.ts" },
      { lineEnding: "i/mixed", path: "mixed.ts" },
    ]);
  });
});
