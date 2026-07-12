import { describe, expect, it } from "vitest";

import { findRestrictedSourceImports } from "./checkSourceImports.mjs";

describe("source import policy", () => {
  it("reports package-private source imports with their line", () => {
    expect(
      findRestrictedSourceImports(
        'import { Button } from "@salt-ds/core/src/button";\n',
      ),
    ).toEqual([
      {
        line: 1,
        importPath: "@salt-ds/core/src/button",
      },
    ]);
  });

  it("allows public package imports", () => {
    expect(
      findRestrictedSourceImports('import { Button } from "@salt-ds/core";\n'),
    ).toEqual([]);
  });
});
